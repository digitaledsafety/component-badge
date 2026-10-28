import { generateQRSVG } from './qr-code.js';

const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    --badge-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --badge-bg: #ffffff;
    --badge-color: #0f172a;
    --badge-border: #e2e8f0;
    --badge-hover-bg: #f8fafc;
    --badge-accent: #2563eb;
    --badge-radius: 9999px;
    --badge-font-size: 0.9375rem;
    --badge-padding: 0.625rem 1.25rem;
    --badge-gap: 0.75rem;
    --badge-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04);
    --badge-qr-size: 42px;
    --badge-qr-bg: #ffffff;

    display: inline-block;
    position: relative;
    font-family: var(--badge-font-family);
    font-size: var(--badge-font-size);
    box-sizing: border-box;
    line-height: 1;
    max-width: 100%;
  }

  :host([theme="dark"]) {
    --badge-bg: #0f172a;
    --badge-color: #f8fafc;
    --badge-border: #1e293b;
    --badge-hover-bg: #1e293b;
    --badge-accent: #38bdf8;
    --badge-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.4);
    --badge-qr-bg: #ffffff;
  }

  :host([theme="brand"]) {
    --badge-bg: #4f46e5;
    --badge-color: #ffffff;
    --badge-border: #4338ca;
    --badge-hover-bg: #4338ca;
    --badge-accent: #818cf8;
    --badge-shadow: 0 4px 14px -3px rgba(79, 70, 229, 0.35);
    --badge-qr-bg: #ffffff;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .badge-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--badge-gap);
    background-color: var(--badge-bg);
    color: var(--badge-color);
    border: 1px solid var(--badge-border);
    border-radius: var(--badge-radius);
    padding: var(--badge-padding);
    box-shadow: var(--badge-shadow);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    text-decoration: none;
    line-height: 1;
    user-select: none;
    position: relative;
    max-width: 100%;
    min-height: 52px;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  a.badge-container {
    cursor: pointer;
  }

  a.badge-container:hover {
    background-color: var(--badge-hover-bg);
    border-color: var(--badge-accent);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.12);
  }

  a.badge-container:active {
    transform: translateY(0);
    box-shadow: var(--badge-shadow);
  }

  a.badge-container:focus-visible {
    outline: 2px solid var(--badge-accent);
    outline-offset: 3px;
  }

  .badge-logo-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
  }

  .badge-logo-wrapper.hidden {
    display: none;
  }

  .badge-logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
    display: block;
  }

  ::slotted([slot="logo"]) {
    width: 1.5rem;
    height: 1.5rem;
    object-fit: contain;
    display: block;
  }

  .badge-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    white-space: nowrap;
    line-height: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    text-align: center;
  }

  .badge-prefix {
    opacity: 0.75;
    font-weight: 400;
    line-height: 1;
    display: inline-block;
    flex-shrink: 0;
    letter-spacing: -0.01em;
  }

  .badge-label {
    font-weight: 600;
    line-height: 1;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: -0.01em;
  }

  /* Inline Scannable QR Code Frame */
  .badge-qr-inline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--badge-qr-bg);
    padding: 3px;
    border-radius: 8px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
    width: var(--badge-qr-size);
    height: var(--badge-qr-size);
    transition: transform 0.2s ease;
  }

  .badge-qr-inline svg {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }

  a.badge-container:hover .badge-qr-inline {
    transform: scale(1.05);
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    :host {
      --badge-padding: 0.5rem 1rem;
      --badge-font-size: 0.875rem;
      --badge-gap: 0.5rem;
      --badge-qr-size: 38px;
    }
    .badge-container {
      min-height: 46px;
    }
  }
`);

export class AttributionBadge extends HTMLElement {
  static get observedAttributes() {
    return ['prefix', 'label', 'text', 'href', 'target', 'logo', 'theme', 'color', 'bg-color', 'show-qr'];
  }

  constructor() {
    super();
    this._hasSlottedLogo = false;
    const shadow = this.attachShadow({ mode: 'open' });

    if (shadow.adoptedStyleSheets) {
      shadow.adoptedStyleSheets = [styles];
    } else {
      const styleTag = document.createElement('style');
      styleTag.textContent = styles.cssRules ? Array.from(styles.cssRules).map(r => r.cssText).join('\n') : '';
      shadow.appendChild(styleTag);
    }

    this._wrapper = document.createElement('div');
    shadow.appendChild(this._wrapper);

    this._onSlotChange = this._onSlotChange.bind(this);
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
    }
  }

  // Getters & Setters
  get prefix() {
    return this.getAttribute('prefix') ?? 'Powered by';
  }

  set prefix(val) {
    if (val === null) this.removeAttribute('prefix');
    else this.setAttribute('prefix', val);
  }

  get label() {
    return this.getAttribute('label') ?? '';
  }

  set label(val) {
    if (val === null) this.removeAttribute('label');
    else this.setAttribute('label', val);
  }

  get text() {
    return this.getAttribute('text');
  }

  set text(val) {
    if (val === null) this.removeAttribute('text');
    else this.setAttribute('text', val);
  }

  get href() {
    return this.getAttribute('href') || '';
  }

  set href(val) {
    if (val === null) this.removeAttribute('href');
    else this.setAttribute('href', val);
  }

  get target() {
    return this.getAttribute('target') || '_blank';
  }

  set target(val) {
    if (val === null) this.removeAttribute('target');
    else this.setAttribute('target', val);
  }

  get logo() {
    return this.getAttribute('logo') || '';
  }

  set logo(val) {
    if (val === null) this.removeAttribute('logo');
    else this.setAttribute('logo', val);
  }

  get theme() {
    return this.getAttribute('theme') || 'light';
  }

  set theme(val) {
    if (val === null) this.removeAttribute('theme');
    else this.setAttribute('theme', val);
  }

  _onSlotChange(e) {
    const slot = e.target;
    this._hasSlottedLogo = slot.assignedElements().length > 0;
    this._updateLogoVisibility();
  }

  _updateLogoVisibility() {
    const wrapper = this.shadowRoot.querySelector('.badge-logo-wrapper');
    if (wrapper) {
      const show = Boolean(this.logo) || this._hasSlottedLogo;
      if (show) {
        wrapper.classList.remove('hidden');
      } else {
        wrapper.classList.add('hidden');
      }
    }
  }

  _applyInlineStyles() {
    const customColor = this.getAttribute('color');
    const customBg = this.getAttribute('bg-color');

    if (customColor) {
      this.style.setProperty('--badge-color', customColor);
      this.style.setProperty('--badge-accent', customColor);
    } else {
      this.style.removeProperty('--badge-color');
      this.style.removeProperty('--badge-accent');
    }

    if (customBg) {
      this.style.setProperty('--badge-bg', customBg);
    } else {
      this.style.removeProperty('--badge-bg');
    }
  }

  _render() {
    this._applyInlineStyles();

    const href = this.href;
    const isLink = Boolean(href);
    const tag = isLink ? 'a' : 'div';

    const fullText = this.text;
    const prefixText = fullText ? '' : this.prefix;
    const labelText = fullText ? fullText : this.label;

    const logoSrc = this.logo;
    const hasQr = isLink && this.getAttribute('show-qr') !== 'false';
    const showLogo = Boolean(logoSrc) || this._hasSlottedLogo;

    let html = `
      <${tag} class="badge-container" ${isLink ? `href="${href}" target="${this.target}" rel="noopener noreferrer"` : ''}>
        <div class="badge-logo-wrapper ${showLogo ? '' : 'hidden'}">
          <slot name="logo">
            ${logoSrc ? `<img class="badge-logo-img" src="${logoSrc}" alt="" />` : ''}
          </slot>
        </div>
        <div class="badge-content">
          ${prefixText ? `<span class="badge-prefix">${prefixText}</span>` : ''}
          ${labelText ? `<span class="badge-label">${labelText}</span>` : ''}
        </div>
        ${hasQr ? `
          <div class="badge-qr-inline" title="Scan QR Code to visit ${href}">
            ${generateQRSVG(href, { size: 100, quietZone: 1 })}
          </div>
        ` : ''}
      </${tag}>
    `;

    this._wrapper.innerHTML = html;

    const logoSlot = this._wrapper.querySelector('slot[name="logo"]');
    if (logoSlot) {
      logoSlot.addEventListener('slotchange', this._onSlotChange);
    }
  }
}
