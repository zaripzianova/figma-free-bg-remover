# Как опубликовать плагин в Figma Community

## 1. Проверь локально
1. Открой **Figma Desktop** (в браузере локальные плагины не запускаются).
2. Меню → **Plugins → Development → Import plugin from manifest…** → выбери `manifest.json` из этой папки.
3. Брось на холст любую картинку, выдели её → **Plugins → Development → Free Background Remover** → «Удалить фон».
   Первый запуск скачивает модель (~88 МБ), дальше всё работает за несколько секунд.

## 2. Получи ID плагина
В `manifest.json` стоит заглушка `REPLACE_WITH_ID_FROM_FIGMA`. Настоящий ID выдаёт Figma:
1. **Plugins → Development → New plugin…** → Figma design → любой шаблон («Empty») → сохрани куда угодно.
2. Открой созданный там `manifest.json`, скопируй значение `"id"` и вставь в наш `manifest.json`. Созданную заготовку можно удалить.
3. Переимпортируй наш плагин (Plugins → Development → Manage plugins in development → удалить старый → Import plugin from manifest).

## 3. Выложи исходники (обязательно из-за лицензии)
Библиотека удаления фона распространяется под **AGPL-3.0**, поэтому плагин тоже открытый:
1. Создай публичный репозиторий на GitHub и загрузи туда содержимое папки (вместе с `LICENSE`).
2. Ссылку на репозиторий добавь в описание плагина.
Продавать или закрывать код такого плагина нельзя, а бесплатно и с открытым кодом можно.

## 4. Опубликуй
1. **Plugins → Development → Manage plugins in development** → у плагина «…» → **Publish**.
2. Заполни карточку:
   - **Icon:** `assets/icon-128.png`
   - **Cover/thumbnail:** `assets/cover-1920x960.png`
   - **Name:** Free Background Remover (проверь, что имя не занято, при желании поменяй и в `manifest.json`)
   - **Tagline:** Remove image backgrounds for free. Runs locally, no sign-up.
   - **Description:** текст ниже
   - **Category:** Image & video
   - **Support contact:** твоя почта или ссылка на GitHub Issues
   - **Pricing:** Free
3. Отправь на ревью. Figma обычно проверяет плагин от нескольких дней до пары недель, ответ придёт на почту.

### Описание для карточки (на английском)

> Remove backgrounds from images in one click — completely free, with no account, no API key and no limits.
>
> 🔒 Private: the AI model runs right inside Figma. Your images are never uploaded anywhere.
>
> How to use:
> 1. Select one or more images (or any layers).
> 2. Run the plugin and click "Remove background".
>
> • Image fills are replaced in place, crop and size are kept
> • Frames, groups and vectors are flattened and cut out next to the original
> • "Keep original" option creates a copy
> • Batch processing
>
> The first run downloads the AI model once (~88 MB). After that, each image takes a few seconds.
>
> Open source (AGPL-3.0): https://github.com/zaripzianova/figma-free-bg-remover
> Powered by @imgly/background-removal.

## Если что-то пошло не так
- **«Не удалось загрузить библиотеку»:** нет интернета или домены заблокированы корпоративной сетью/VPN.
- **Ошибки в консоли:** Plugins → Development → Show/Hide console (⌥⌘I).
