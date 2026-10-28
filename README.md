# Modern Web Component Template

A production-ready template and starter kit for bootstrapping high-performance Web Components with modern 2026 best practices out-of-the-box.

## Features

- **Modern Standards:** Built with Shadow DOM, Constructable Stylesheets (`adoptedStyleSheets`), and observed attribute reactivity.
- **Dual Export Patterns:** Supports both class-only modular imports and auto-registering side-effect imports (`import 'hello-world/define'`).
- **Multiple Distribution Formats:** ESM (`dist/hello-world.js`) and standalone IIFE browser bundle (`dist/hello-world.iife.js`).
- **Lightning-Fast Tooling:** Powered by [Vite](https://vitejs.dev/) for instant dev server reloads and production bundling.
- **Automated Testing:** Unit testing with [Vitest](https://vitest.dev/) and DOM emulation via `happy-dom`.
- **Code Quality:** Configured with ESLint and Prettier.
- **CI/CD Ready:** Includes GitHub Actions workflow for automated testing and continuous deployment to GitHub Pages.

---

## Getting Started

### Installation

Clone the template and install dependencies:

```bash
npm install
```

### Development Server

Start the local Vite dev server with live updates:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the interactive demo page (`index.html`).

---

## Component Usage

### 1. Auto-Registering Import (Recommended for standard usage)

```javascript
import '@your-scope/hello-world/define';

// Now <hello-world></hello-world> is registered and ready to use in your HTML
```

### 2. Manual Class Import (Scoped registration)

```javascript
import { HelloWorld } from '@your-scope/hello-world';

// Custom tag name definition to prevent naming conflicts
customElements.define('my-custom-hello', HelloWorld);
```

### 3. Direct Browser Script Tag (CDN / Standalone IIFE)

```html
<script src="path/to/dist/hello-world.iife.js"></script>
<hello-world name="Browser"></hello-world>
```

---

## Component API

### Attributes & Properties

| Name   | Type     | Default   | Description                                |
| :----- | :------- | :-------- | :----------------------------------------- |
| `name` | `string` | `"World"` | The name rendered in the greeting message. |

### Example

```html
<hello-world name="Developer"></hello-world>

<script type="module">
  const element = document.querySelector('hello-world');
  element.name = 'Interactive User'; // Triggers reactive update
</script>
```

---

## Available Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Compiles production ESM and IIFE distribution builds in `dist/`.
- `npm run preview`: Previews the production build locally.
- `npm run test`: Runs unit tests with Vitest.
- `npm run test:watch`: Runs tests in watch mode during development.
- `npm run lint`: Runs ESLint across `src/` and `test/`.
- `npm run format`: Formats source files with Prettier.

---

## Project Structure

```text
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD workflow
├── dist/                      # Compiled production distribution files
├── src/
│   ├── define.js              # Auto-registering side-effect entry point
│   ├── hello-world.js         # Core Web Component class definition
│   └── index.js               # Primary export entry point
├── test/
│   └── hello-world.test.js    # Unit tests
├── index.html                 # Interactive demo / preview page
├── package.json               # Package config, exports, and scripts
├── vite.config.js             # Vite build & test configuration
└── eslint.config.js           # ESLint configuration
```

---

## Customization Guide

1. **Rename Component:** Replace `hello-world` and `HelloWorld` in `src/` and `package.json` with your custom element tag name and class name.
2. **Publishing:** Update `name`, `author`, `repository`, and `description` in `package.json` before publishing to NPM (`npm publish`).

---

## License

MIT
