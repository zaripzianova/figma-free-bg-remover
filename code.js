// Free Background Remover — main plugin code (runs in Figma's sandbox).
// The heavy work (AI model) runs in ui.html; this file reads images from
// the document and writes the results back.

var MAX_IMAGE_SIDE = 4096; // Figma's limit for figma.createImage
var GAP = 20;

figma.showUI(__html__, { width: 300, height: 340, themeColors: true });

// ---------- messaging with the UI ----------

var pending = {};
var nextId = 1;

function processInUI(bytes) {
  var id = nextId++;
  return new Promise(function (resolve, reject) {
    pending[id] = { resolve: resolve, reject: reject };
    figma.ui.postMessage({ type: 'process', id: id, bytes: bytes });
  });
}

// ---------- selection helpers ----------

function topImageFillIndex(node) {
  if (!('fills' in node) || !Array.isArray(node.fills)) return -1;
  for (var i = node.fills.length - 1; i >= 0; i--) {
    var f = node.fills[i];
    if (f.type === 'IMAGE' && f.imageHash && f.visible !== false) return i;
  }
  return -1;
}

function describeSelection() {
  var sel = figma.currentPage.selection;
  var images = 0;
  var other = 0;
  for (var i = 0; i < sel.length; i++) {
    if (topImageFillIndex(sel[i]) >= 0) images++;
    else if ('exportAsync' in sel[i]) other++;
  }
  return { total: images + other, images: images, other: other };
}

function sendSelection() {
  figma.ui.postMessage({ type: 'selection', info: describeSelection() });
}

figma.on('selectionchange', sendSelection);

// ---------- placement helpers ----------

function insertAfter(original, newNode) {
  var parent = original.parent;
  var index = parent.children.indexOf(original);
  parent.insertChild(index + 1, newNode);
  var inAutoLayout = 'layoutMode' in parent && parent.layoutMode !== 'NONE';
  if (!inAutoLayout) {
    newNode.x = original.x + original.width + GAP;
    newNode.y = original.y;
  }
}

function clonePaints(paints) {
  return JSON.parse(JSON.stringify(paints));
}

// ---------- processing ----------

async function processNode(node, keepOriginal) {
  var fillIndex = topImageFillIndex(node);

  if (fillIndex >= 0) {
    // Node has an image fill: remove background from the image itself.
    var image = figma.getImageByHash(node.fills[fillIndex].imageHash);
    if (!image) throw new Error('Image not found');
    var bytes = await image.getBytesAsync();
    var result = await processInUI(bytes);
    var newImage = figma.createImage(result);

    var target = node;
    if (keepOriginal) {
      target = node.clone();
      target.name = node.name + ' (no bg)';
      insertAfter(node, target);
    }
    var fills = clonePaints(target.fills);
    fills[fillIndex].imageHash = newImage.hash;
    target.fills = fills;
    return target;
  }

  // Anything else (frame, group, vector…): flatten to PNG and cut it out.
  var maxSide = Math.max(node.width, node.height) || 1;
  var scale = Math.min(2, MAX_IMAGE_SIDE / maxSide);
  var png = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: scale } });
  var cut = await processInUI(png);
  var img = figma.createImage(cut);

  var rect = figma.createRectangle();
  rect.name = node.name + ' (no bg)';
  rect.resize(Math.max(1, node.width), Math.max(1, node.height));
  rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }];
  insertAfter(node, rect);
  return rect;
}

async function run(keepOriginal) {
  var nodes = figma.currentPage.selection.filter(function (n) {
    return topImageFillIndex(n) >= 0 || 'exportAsync' in n;
  });
  if (nodes.length === 0) {
    figma.notify('Select an image or layer first');
    figma.ui.postMessage({ type: 'done', ok: 0, failed: 0 });
    return;
  }

  var results = [];
  var failed = 0;
  for (var i = 0; i < nodes.length; i++) {
    figma.ui.postMessage({ type: 'step', current: i + 1, total: nodes.length });
    try {
      results.push(await processNode(nodes[i], keepOriginal));
    } catch (e) {
      failed++;
      console.error(e);
      figma.ui.postMessage({ type: 'log', message: String((e && e.message) || e) });
    }
  }

  if (results.length > 0) figma.currentPage.selection = results;
  figma.ui.postMessage({ type: 'done', ok: results.length, failed: failed });
}

figma.ui.onmessage = async function (msg) {
  if (msg.type === 'ready') {
    var settings = (await figma.clientStorage.getAsync('settings')) || {};
    figma.ui.postMessage({ type: 'settings', settings: settings });
    sendSelection();
  } else if (msg.type === 'save-settings') {
    await figma.clientStorage.setAsync('settings', msg.settings);
  } else if (msg.type === 'run') {
    await run(!!msg.keepOriginal);
  } else if (msg.type === 'result' && pending[msg.id]) {
    pending[msg.id].resolve(msg.bytes);
    delete pending[msg.id];
  } else if (msg.type === 'error' && pending[msg.id]) {
    pending[msg.id].reject(new Error(msg.message));
    delete pending[msg.id];
  } else if (msg.type === 'notify') {
    figma.notify(msg.message, msg.error ? { error: true } : undefined);
  }
};
