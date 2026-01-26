class CalorieSummaryCard extends HTMLElement {
  constructor() {
    super();
    this._eventsAttached = false;
    this._summaryLoaded = false;
    this._styleObserver = null;
  }

  async _ensureSummaryLoaded() {
    if (!this._summaryLoaded && !customElements.get('calorie-summary')) {
      try {
        await import('./summary.js');
        this._summaryLoaded = true;
      } catch (error) {
        console.error('Failed to load summary component:', error);
      }
    }
  }

  setConfig(config) {
    this.config = config;
    this.profileEntityId = config.profile_entity_id || null;
    this.title = typeof config.title === "string" ? config.title : "";

    this.innerHTML = `
      <ha-card>
        ${this.title && this.title.trim() ? `<div class=\"card-header\">${this.title}</div>` : ""}
        <calorie-summary></calorie-summary>
      </ha-card>
    `;
  }

  set hass(hass) {
    this._hass = hass;
    this._updateCard();
  }

  get hass() {
    return this._hass;
  }

  _getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async _updateCard() {
    await this._ensureSummaryLoaded();

    await customElements.whenDefined('calorie-summary');

    const el = this.querySelector('calorie-summary');
    if (!el || !this.hass) return;

    // Fetch profile entity_id (from config or default)
    let entityId = this.profileEntityId;
    if (!entityId) {
      entityId = Object.keys(this.hass.states).find(eid => eid.startsWith('sensor.calorie_tracker_profile'));
    }
    if (!entityId) {
      console.warn('No calorie tracker profile entity found');
      return;
    }

    if (!this.hass.states[entityId]) {
      console.error(`Entity not found: ${entityId}`);
      return;
    }

    const profile = this.hass.states[entityId];
    el.hass = this.hass;
    el.profile = profile;
    // Pass user's saved week start preference to inner summary component
    el.weekStartDay = profile?.attributes?.week_start_day || 'sunday';
    // Use browser's local date (YYYY-MM-DD format, no timezone)
    el.selectedDate = this.selectedDate || this._getLocalDateString();

    // Force small gauge size for dashboard use and set up persistent styling
    this._applyWrapperStyles(el);

    // Set up observer to reapply styles when component re-renders
    if (!this._styleObserver && el.renderRoot) {
      this._styleObserver = new MutationObserver(() => {
        this._applyWrapperStyles(el);
      });
      this._styleObserver.observe(el.renderRoot, { childList: true, subtree: true });
    }

    try {
      // Fetch weekly summary and weight
      const [summaryResp, dailyResp] = await Promise.all([
        this.hass.connection.sendMessagePromise({
          type: "calorie_tracker/get_weekly_summary",
          entity_id: entityId,
          date: el.selectedDate,
        }),
        this.hass.connection.sendMessagePromise({
          type: "calorie_tracker/get_daily_data",
          entity_id: entityId,
          date: el.selectedDate,
        }),
      ]);
      el.weeklySummary = summaryResp?.weekly_summary ?? {};
      el.weight = dailyResp?.weight ?? null;
    } catch (err) {
      console.error("Failed to fetch calorie data:", err);
    }

    // Attach event listeners
    if (!this._eventsAttached) {
      el.addEventListener("select-summary-date", (e) => {
        this.selectedDate = e.detail.date;
        this._updateCard();
      });
      el.addEventListener("refresh-summary", () => {
        this._updateCard();
      });
      this._eventsAttached = true;
    }
  }

  _applyWrapperStyles(el) {
    if (!el?.renderRoot) return;

    const gaugeContainer = el.renderRoot.querySelector('.gauge-container');
    if (gaugeContainer) {
      gaugeContainer.style.width = '120px';
      gaugeContainer.style.height = '120px';
      gaugeContainer.style.maxWidth = '120px';
      const svg = gaugeContainer.querySelector('svg');
      if (svg) {
        svg.style.maxWidth = '120px';
        svg.style.maxHeight = '120px';
      }
    }
  }

  disconnectedCallback() {
    if (this._styleObserver) {
      this._styleObserver.disconnect();
      this._styleObserver = null;
    }
  }
}

// Check if the element is already defined
if (!customElements.get('calorie-summary-card')) {
  customElements.define('calorie-summary-card', CalorieSummaryCard);
}

// Register card for Lovelace Add Card dialog
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'calorie-summary-card',
  name: 'Calorie Tracker: Summary',
  description: 'Full weekly summary card for the Calorie Tracker integration',
  editor: 'calorie-summary-editor',
  preview: true,
});

// Simple card editor for the summary card
class CalorieSummaryEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._config) this._config = {};
    this.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(
          this._config.title || ''
        )}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(
          this._config.profile_entity_id || ''
        )}"></ha-entity-picker>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;

    const titleInput = this.querySelector('paper-input');
    const picker = this.querySelector('ha-entity-picker');
    const err = this.querySelector('.error');

    const valueChanged = () => {
      const cfg = { ...this._config };
      if (titleInput && titleInput.value) cfg.title = titleInput.value.trim();
      else delete cfg.title;
      if (picker && picker.value) cfg.profile_entity_id = picker.value;
      else delete cfg.profile_entity_id;

      if (!cfg.profile_entity_id) {
        if (err) err.style.display = 'block';
      } else {
        if (err) err.style.display = 'none';
      }

      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg } }));
    };

    if (titleInput) titleInput.addEventListener('value-changed', valueChanged);
    if (picker) picker.addEventListener('value-changed', valueChanged);
  }

  _escape(str) {
    return String(str).replace(/"/g, '&quot;');
  }
}

if (!customElements.get('calorie-summary-editor')) {
  customElements.define('calorie-summary-editor', CalorieSummaryEditor);
}

// Provide built-in visual editor schema for Lovelace
CalorieSummaryCard.getConfigForm = function () {
  return {
    schema: [
      { name: 'title', selector: { text: {} } },
      {
        name: 'profile_entity_id',
        required: true,
        selector: { entity: { domain: 'sensor', allow_custom_entity: true } },
      },
    ],
  };
};

CalorieSummaryCard.getStubConfig = function () {
  return { profile_entity_id: '' };
};