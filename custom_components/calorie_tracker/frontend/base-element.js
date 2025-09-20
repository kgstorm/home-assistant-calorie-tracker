// Minimal reactive base & template utilities
export class BaseElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._properties = new Map();
    this._updateScheduled = false;
  }

  static get observedAttributes() { return []; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this.requestUpdate();
  }

  connectedCallback() { this.requestUpdate(); }

  disconnectedCallback() {
    // No-op; subclasses may override. Exists so super.disconnectedCallback() is always safe.
  }

  requestUpdate() {
    if (this._updateScheduled) return;
    this._updateScheduled = true;
    Promise.resolve().then(() => {
      this._updateScheduled = false;
      this.update();
    });
  }

  update() { this.render(); }
  render() { /* override */ }
  dispatchEvent(event) { return super.dispatchEvent(event); }
}

export function html(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const v = values[i];
      if (Array.isArray(v)) result += v.join('');
      else if (v != null) result += v;
    }
  }
  return result;
}

export const svg = html;

export function css(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) result += values[i];
  }
  return result;
}

export function unsafeHTML(str) { return str; }

export function renderToShadowRoot(shadowRoot, htmlString, styles = '') {
  shadowRoot.innerHTML = `
    ${styles ? `<style>${styles}</style>` : ''}
    ${htmlString}
  `;
}
