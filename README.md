# Attribution Badge Web Component

A lightweight, customizable pill-based Web Component for attribution (e.g. "Powered by Acme", "Created by John Doe"). Features built-in support for company/user logos, inline QR code generation popovers, link targets, and multiple color themes.

## Features

- **Pill Badge Design:** Sleek, modern pill-shaped badge component.
- **Flexible Attribution Text:** Supports separate `prefix` and `label` (e.g. `prefix="Powered by" label="Acme"`) or full custom `text`.
- **Logos & Custom Icons:** Supports image URLs via `logo` attribute or custom HTML/SVGs via the `logo` slot.
- **Inline QR Code Generator:** Automatically generates a QR code popover from `href` with zero external dependencies.
- **Themes & Customization:** Built-in `light`, `dark`, and `brand` themes plus support for custom text and background colors (`color`, `bg-color`).
- **Standard Standards:** Built with Shadow DOM, `adoptedStyleSheets`, and responsive styling.

---

## Installation & Usage

### 1. Auto-Registering Import

```javascript
import '@your-scope/attribution-badge/define';

// <attribution-badge> is registered and ready to use in HTML
```

### 2. Manual Class Import

```javascript
import { AttributionBadge } from '@your-scope/attribution-badge';

customElements.define('custom-attribution', AttributionBadge);
```

### 3. Direct Script Tag (IIFE)

```html
<script src="path/to/dist/attribution-badge.iife.js"></script>
<attribution-badge prefix="Created by" label="Jane Doe" href="https://example.com"></attribution-badge>
```

---

## Component API

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `prefix` | `string` | `"Powered by"` | The prefix text before label (e.g., "Powered by", "Created by"). |
| `label` | `string` | `""` | Primary target name (e.g., "Acme Corp"). |
| `text` | `string` | `undefined` | Overrides both `prefix` and `label` with a single custom text string. |
| `href` | `string` | `""` | Target URL. Makes the pill clickable and enables QR code generation. |
| `target` | `string` | `"_blank"` | Link target attribute (e.g. `_blank`, `_self`). |
| `logo` | `string` | `""` | Image URL for the logo icon on the left. |
| `theme` | `string` | `"light"` | Preset color theme: `"light"`, `"dark"`, or `"brand"`. |
| `color` | `string` | `undefined` | Custom CSS color for text/accents (e.g., `#e11d48`). |
| `bg-color` | `string` | `undefined` | Custom CSS background color for the badge (e.g., `#ffe4e6`). |
| `show-qr` | `boolean` | `"true"` | Set to `"false"` to hide the QR code button even when `href` is present. |

### Slots

| Name | Description |
| :--- | :--- |
| `logo` | Slot for custom logo HTML (SVG element, `<img>`, icon font, etc.). |

---

## Examples

### Basic Usage

```html
<attribution-badge prefix="Powered by" label="Vite" href="https://vitejs.dev"></attribution-badge>
```

### Dark & Brand Themes

```html
<attribution-badge theme="dark" prefix="Created by" label="Dev Team" href="https://example.com"></attribution-badge>

<attribution-badge theme="brand" prefix="Powered by" label="Company" href="https://example.com"></attribution-badge>
```

### Custom Colors & Slotted SVG Logo

```html
<attribution-badge href="https://github.com" color="#0969da" bg-color="#f6f8fa" label="GitHub">
  <svg slot="logo" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385..."/>
  </svg>
</attribution-badge>
```

---

## Available Scripts

- `npm run dev`: Start local dev server.
- `npm run build`: Compile distribution bundles in `dist/`.
- `npm run test`: Run unit tests with Vitest.
- `npm run lint`: Run ESLint check.
- `npm run format`: Format code with Prettier.

---

## License

MIT
