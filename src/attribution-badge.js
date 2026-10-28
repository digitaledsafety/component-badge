import { generateQRSVG } from './qr-code.js';

const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    --badge-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --badge-bg: #f8fafc;
    --badge-color: #0f172a;
    --badge-border: #e2e8f0;
    --badge-hover-bg: #f1f5f9;
    --badge-accent: #2563eb;
    --badge-radius: 9999px;
    --badge-font-size: 0.875rem;
    --badge-padding: 0.375rem 0.75rem;
    --badge-gap: 0.5rem;
    --badge-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    display: inline-block;
    position: relative;
    font-family: var(--badge-font-family);
    font-size: var(--badge-font-size);
    box-sizing: border-box;
    line-height: 1;
  }

  :host([theme="dark"]) {
    --badge-bg: #0f172a;
    --badge-color: #f8fafc;
    --badge-border: #334155;
    --badge-hover-bg: #1e293b;
    --badge-accent: #38bdf8;
    --badge-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  }

  :host([theme="brand"]) {
    --badge-bg: #4f46e5;
    --badge-color: #ffffff;
    --badge-border: #4338ca;
    --badge-hover-bg: #4338ca;
    --badge-accent: #a5b4fc;
    --badge-shadow: 0 2px 4px 0 rgba(79, 70, 229, 0.25);
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
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    line-height: 1;
    user-select: none;
    position: relative;
  }

  a.badge-container {
    cursor: pointer;
  }

  a.badge-container:hover {
    background-color: var(--badge-hover-bg);
    border-color: var(--badge-accent);
  }

  a.badge-container:focus-visible {
    outline: 2px solid var(--badge-accent);
    outline-offset: 2px;
  }

  .badge-logo-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .badge-logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
    display: block;
  }

  ::slotted([slot="logo"]) {
    width: 1.25rem;
    height: 1.25rem;
    object-fit: contain;
    display: block;
  }

  .badge-content {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
    line-height: 1;
  }

  .badge-prefix {
    opacity: 0.8;
    font-weight: 400;
    line-height: 1;
    display: inline-block;
  }

  .badge-label {
    font-weight: 600;
    line-height: 1;
    display: inline-block;
  }

  .qr-toggle-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: currentColor;
    opacity: 0.7;
    padding: 0;
    margin-left: 0.125rem;
    border-radius: 50%;
    cursor: pointer;
    transition: opacity 0.2s ease, transform 0.2s ease;
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    line-height: 1;
  }

  .qr-toggle-btn:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  .qr-toggle-btn:focus-visible {
    outline: 2px solid var(--badge-accent);
  }

  .qr-icon {
    width: 1rem;
    height: 1rem;
    fill: currentColor;
    display: block;
  }

  /* QR Popover Modal / Tooltip */
  .qr-popover {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) scale(0.95);
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0.875rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    z-index: 100;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
  }

  .qr-popover.open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateX(-50%) scale(1);
  }

  .qr-popover-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: #334155;
    text-align: center;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.25;
  }

  .qr-popover-arrow {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #ffffff;
  }
`);

export class AttributionBadge extends HTMLElement {
  static get observedAttributes() {
    return ['prefix', 'label', 'text', 'href', 'target', 'logo', 'theme', 'color', 'bg-color', 'show-qr'];
  }

  constructor() {
    super();
    this._qrOpen = false;
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

    this._onDocumentClick = this._onDocumentClick.bind(this);
  }

  connectedCallback() {
    this._render();
    document.addEventListener('click', this._onDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocumentClick);
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

  _onDocumentClick(e) {
    if (this._qrOpen && !this.contains(e.target) && !e.composedPath().includes(this.shadowRoot)) {
      this._qrOpen = false;
      this._updateQRPopover();
    }
  }

  _toggleQR(e) {
    e.preventDefault();
    e.stopPropagation();
    this._qrOpen = !this._qrOpen;
    this._updateQRPopover();
  }

  _updateQRPopover() {
    const popover = this.shadowRoot.querySelector('.qr-popover');
    if (popover) {
      if (this._qrOpen) {
        popover.classList.add('open');
      } else {
        popover.classList.remove('open');
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

    let html = `
      <${tag} class="badge-container" ${isLink ? `href="${href}" target="${this.target}" rel="noopener noreferrer"` : ''}>
        <div class="badge-logo-wrapper">
          <slot name="logo">
            ${logoSrc ? `<img class="badge-logo-img" src="${logoSrc}" alt="" />` : ''}
          </slot>
        </div>
        <div class="badge-content">
          ${prefixText ? `<span class="badge-prefix">${prefixText}</span>` : ''}
          ${labelText ? `<span class="badge-label">${labelText}</span>` : ''}
        </div>
        ${hasQr ? `
          <button type="button" class="qr-toggle-btn" aria-label="Show QR Code" title="Scan QR Code">
            <svg class="qr-icon" viewBox="0 0 24 24">
              <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v3h-2v-3zm3 3h3v5h-2v-3h-1v-2zm-3 2h2v3h-2v-3zm-2-2h2v2h-2v-2zm0 3h2v2h-2v-2z"/>
            </svg>
          </button>
        ` : ''}
      </${tag}>
    `;

    if (hasQr) {
      const qrSvg = generateQRSVG(href, { size: 140 });
      html += `
        <div class="qr-popover ${this._qrOpen ? 'open' : ''}">
          <div class="qr-popover-title">${labelText || href}</div>
          ${qrSvg}
          <div class="qr-popover-arrow"></div>
        </div>
      `;
    }

    this._wrapper.innerHTML = html;

    if (hasQr) {
      const qrBtn = this._wrapper.querySelector('.qr-toggle-btn');
      if (qrBtn) {
        qrBtn.addEventListener('click', (e) => this._toggleQR(e));
      }
    }
  }
}
