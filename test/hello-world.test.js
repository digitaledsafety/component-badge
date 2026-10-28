import { describe, it, expect, beforeEach } from 'vitest';
import '../src/define.js';
import { HelloWorld } from '../src/hello-world.js';

describe('HelloWorld Web Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should be defined in customElements registry', () => {
    expect(customElements.get('hello-world')).toBe(HelloWorld);
  });

  it('renders default greeting when name attribute is not set', () => {
    const element = document.createElement('hello-world');
    document.body.appendChild(element);

    const shadowRoot = element.shadowRoot;
    expect(shadowRoot).not.toBeNull();

    const p = shadowRoot.querySelector('p');
    expect(p).not.toBeNull();
    expect(p.textContent).toBe('Hello, World!');
  });

  it('renders customized greeting when name attribute is provided', () => {
    const element = document.createElement('hello-world');
    element.setAttribute('name', 'Vitest');
    document.body.appendChild(element);

    const p = element.shadowRoot.querySelector('p');
    expect(p.textContent).toBe('Hello, Vitest!');
  });

  it('updates textContent dynamically when name property is set', async () => {
    const element = document.createElement('hello-world');
    document.body.appendChild(element);

    element.name = 'Alice';
    expect(element.getAttribute('name')).toBe('Alice');

    const p = element.shadowRoot.querySelector('p');
    expect(p.textContent).toBe('Hello, Alice!');
  });

  it('removes name attribute when set to null or undefined', () => {
    const element = document.createElement('hello-world');
    element.name = 'Bob';
    expect(element.getAttribute('name')).toBe('Bob');

    element.name = null;
    expect(element.hasAttribute('name')).toBe(false);
    expect(element.name).toBe('World');
  });
});
