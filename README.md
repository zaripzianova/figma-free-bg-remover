# Free Background Remover — Figma plugin

Remove image backgrounds in Figma for free, in one click.

- **Free, no account, no API key, no limits.**
- **Private:** the AI model runs locally inside the plugin. Images are never uploaded anywhere.
- Works on image fills (the fill is replaced, crop and transforms are kept) and on any other layer (frames, groups, vectors are flattened to PNG and cut out next to the original).
- Batch: select several layers at once.
- "Keep original" option creates a copy instead of changing the layer.

The first run downloads the model once (~88 MB, or ~44 MB for the light model); after that it is cached.
Processing takes a few seconds per image.

## How it works

`code.js` reads the image bytes from the selected layer and sends them to `ui.html`.
The UI runs [@imgly/background-removal](https://github.com/imgly/background-removal-js) (ISNet model, ONNX Runtime Web / WebAssembly) and returns a transparent PNG, which `code.js` puts back into the document.

Network access is limited to:
- `cdn.jsdelivr.net` — the library code
- `staticimgly.com` — the model and WebAssembly files

## Development

1. Figma Desktop → Plugins → Development → Import plugin from manifest… → choose `manifest.json`.
2. Select an image → run the plugin.

No build step: plain JavaScript.

## License

AGPL-3.0 (required by @imgly/background-removal). See `LICENSE`.
