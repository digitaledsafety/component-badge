import { HelloWorld } from './hello-world.js';

if (!customElements.get('hello-world')) {
  customElements.define('hello-world', HelloWorld);
}

export { HelloWorld };
