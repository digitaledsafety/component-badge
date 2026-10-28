import { AttributionBadge } from './attribution-badge.js';

if (!customElements.get('attribution-badge')) {
  customElements.define('attribution-badge', AttributionBadge);
}

export { AttributionBadge };
