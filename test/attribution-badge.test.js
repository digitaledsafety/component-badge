import { describe, it, expect, beforeEach } from 'vitest';
import '../src/define.js';
import { AttributionBadge } from '../src/attribution-badge.js';

describe('AttributionBadge Web Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should be defined in customElements registry', () => {
    expect(customElements.get('attribution-badge')).toBe(AttributionBadge);
  });

  it('renders default prefix "Powered by" when label is set', () => {
    const badge = document.createElement('attribution-badge');
    badge.setAttribute('label', 'Acme Corp');
    document.body.appendChild(badge);

    const shadowRoot = badge.shadowRoot;
    expect(shadowRoot).not.toBeNull();

    const prefix = shadowRoot.querySelector('.badge-prefix');
    const label = shadowRoot.querySelector('.badge-label');

    expect(prefix.textContent).toBe('Powered by');
    expect(label.textContent).toBe('Acme Corp');
  });

  it('renders custom prefix and label', () => {
    const badge = document.createElement('attribution-badge');
    badge.setAttribute('prefix', 'Created by');
    badge.setAttribute('label', 'John Doe');
    document.body.appendChild(badge);

    const prefix = badge.shadowRoot.querySelector('.badge-prefix');
    const label = badge.shadowRoot.querySelector('.badge-label');

    expect(prefix.textContent).toBe('Created by');
    expect(label.textContent).toBe('John Doe');
  });

  it('overrides prefix and label when text attribute is provided', () => {
    const badge = document.createElement('attribution-badge');
    badge.setAttribute('prefix', 'Created by');
    badge.setAttribute('label', 'John Doe');
    badge.setAttribute('text', 'Sponsored by Acme');
    document.body.appendChild(badge);

    const prefix = badge.shadowRoot.querySelector('.badge-prefix');
    const label = badge.shadowRoot.querySelector('.badge-label');

    expect(prefix).toBeNull();
    expect(label.textContent).toBe('Sponsored by Acme');
  });

  it('renders clickable link with href and default target _blank', () => {
    const badge = document.createElement('attribution-badge');
    badge.setAttribute('label', 'OpenAI');
    badge.setAttribute('href', 'https://openai.com');
    document.body.appendChild(badge);

    const container = badge.shadowRoot.querySelector('a.badge-container');
    expect(container).not.toBeNull();
    expect(container.getAttribute('href')).toBe('https://openai.com');
    expect(container.getAttribute('target')).toBe('_blank');
    expect(container.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders image logo when logo attribute is set', () => {
    const badge = document.createElement('attribution-badge');
    badge.setAttribute('logo', 'https://example.com/logo.png');
    document.body.appendChild(badge);

    const logoImg = badge.shadowRoot.querySelector('.badge-logo-img');
    expect(logoImg).not.toBeNull();
    expect(logoImg.getAttribute('src')).toBe('https://example.com/logo.png');
  });

  it('supports custom slot for logo', () => {
    const badge = document.createElement('attribution-badge');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('slot', 'logo');
    badge.appendChild(svg);
    document.body.appendChild(badge);

    const slot = badge.shadowRoot.querySelector('slot[name="logo"]');
    expect(slot).not.toBeNull();
    expect(slot.assignedElements()[0]).toBe(svg);
  });

  it('handles theme attribute', () => {
    const badge = document.createElement('attribution-badge');
    badge.setAttribute('theme', 'dark');
    document.body.appendChild(badge);

    expect(badge.getAttribute('theme')).toBe('dark');
    expect(badge.theme).toBe('dark');
  });

  it('applies custom color and bg-color attributes as CSS properties', () => {
    const badge = document.createElement('attribution-badge');
    badge.setAttribute('color', '#ff0000');
    badge.setAttribute('bg-color', '#ffff00');
    document.body.appendChild(badge);

    expect(badge.style.getPropertyValue('--badge-color')).toBe('#ff0000');
    expect(badge.style.getPropertyValue('--badge-bg')).toBe('#ffff00');
  });

  it('renders QR code toggle button and generates QR SVG when href is present', () => {
    const badge = document.createElement('attribution-badge');
    badge.setAttribute('href', 'https://example.com');
    badge.setAttribute('label', 'Example');
    document.body.appendChild(badge);

    const qrBtn = badge.shadowRoot.querySelector('.qr-toggle-btn');
    expect(qrBtn).not.toBeNull();

    const popover = badge.shadowRoot.querySelector('.qr-popover');
    expect(popover).not.toBeNull();
    expect(popover.classList.contains('open')).toBe(false);

    const qrSvg = popover.querySelector('svg');
    expect(qrSvg).not.toBeNull();
  });

  it('toggles QR code popover when QR button is clicked', () => {
    const badge = document.createElement('attribution-badge');
    badge.setAttribute('href', 'https://example.com');
    document.body.appendChild(badge);

    const qrBtn = badge.shadowRoot.querySelector('.qr-toggle-btn');
    const popover = badge.shadowRoot.querySelector('.qr-popover');

    expect(popover.classList.contains('open')).toBe(false);

    qrBtn.click();
    expect(popover.classList.contains('open')).toBe(true);

    qrBtn.click();
    expect(popover.classList.contains('open')).toBe(false);
  });
});
