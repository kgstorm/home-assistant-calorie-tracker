class CalorieGaugeCard extends HTMLElement {
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
    this.maxHeight = config.max_height || "400px"; // Default to 400px if not specified

    this.innerHTML = `
      <ha-card>
        ${this.title && this.title.trim() ? `<div class="card-header">${this.title}</div>` : ""}
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
      entityId = Object.keys(this.hass.states).find(eid =>
        eid.startsWith('sensor.calorie_tracker_') &&
        eid.includes('_profile') &&
        this.hass.states[eid] // Ensure entity actually exists
      );
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
    // Use browser's local date (YYYY-MM-DD format, no timezone)
    el.selectedDate = this.selectedDate || this._getLocalDateString();

    // Apply gauge-only styling
    this._applyGaugeOnlyStyles(el);

    // Set up observer to reapply styles when component re-renders
    if (!this._styleObserver && el.renderRoot) {
      this._styleObserver = new MutationObserver(() => {
        this._applyGaugeOnlyStyles(el);
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

  _applyGaugeOnlyStyles(el) {
    if (!el?.renderRoot) return;

    // Hide the bar graph section completely
    const barGraphSection = el.renderRoot.querySelector('.bar-graph-section');
    if (barGraphSection) {
      barGraphSection.style.display = 'none';
    }

    // Hide the "Today" title text above the gauge
    const gaugeLabels = el.renderRoot.querySelector('.gauge-labels');
    if (gaugeLabels) {
      gaugeLabels.style.display = 'none';
    }

    // Adjust the summary container to center the gauge
    const summaryContainer = el.renderRoot.querySelector('.summary-container');
    if (summaryContainer) {
      summaryContainer.style.justifyContent = 'center';
      summaryContainer.style.alignItems = 'center';
      summaryContainer.style.height = '100%';
      summaryContainer.style.maxWidth = 'none';
    }

    // Make gauge section fill available space
    const gaugeSection = el.renderRoot.querySelector('.gauge-section');
    if (gaugeSection) {
      gaugeSection.style.width = '100%';
      gaugeSection.style.flex = '1';
      gaugeSection.style.maxWidth = 'none';
    }

    // Make gauge container responsive with user-defined max height
    const gaugeContainer = el.renderRoot.querySelector('.gauge-container');
    if (gaugeContainer) {
      gaugeContainer.style.width = '100%';
      gaugeContainer.style.height = 'auto';
      gaugeContainer.style.aspectRatio = '1 / 1';
      gaugeContainer.style.maxWidth = this.maxHeight; // Use maxHeight for maxWidth to maintain square
      gaugeContainer.style.maxHeight = this.maxHeight;
    }

    // Make SVG fill the container
    const svg = el.renderRoot.querySelector('.gauge-container svg');
    if (svg) {
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.maxWidth = 'none';
      svg.style.maxHeight = 'none';
    }

    // Adjust the host element to fill the card
    if (el.style) {
      el.style.height = '100%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
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
if (!customElements.get('calorie-gauge-card')) {
  customElements.define('calorie-gauge-card', CalorieGaugeCard);
}

// Register card for Lovelace Add Card dialog
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'calorie-gauge-card',
  name: 'Calorie Gauge',
  description: 'A compact gauge-only view for the Calorie Tracker summary',
  editor: 'calorie-gauge-editor',
  preview: true,
});

class CalorieGaugeEditor extends HTMLElement {
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
        <paper-input label="Max height (e.g. 400px)" value="${this._escape(
          this._config.max_height || '400px'
        )}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;

    const titleInput = this.querySelector('paper-input');
    const picker = this.querySelector('ha-entity-picker');
    const heightInput = this.querySelectorAll('paper-input')[1];
    const err = this.querySelector('.error');

    const valueChanged = () => {
      const cfg = { ...this._config };
      if (titleInput && titleInput.value) cfg.title = titleInput.value.trim();
      else delete cfg.title;
      if (picker && picker.value) cfg.profile_entity_id = picker.value;
      else delete cfg.profile_entity_id;
      if (heightInput && heightInput.value) cfg.max_height = heightInput.value.trim();
      else delete cfg.max_height;

      if (!cfg.profile_entity_id) {
        if (err) err.style.display = 'block';
      } else {
        if (err) err.style.display = 'none';
      }

      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg } }));
    };

    if (titleInput) titleInput.addEventListener('value-changed', valueChanged);
    if (picker) picker.addEventListener('value-changed', valueChanged);
    if (heightInput) heightInput.addEventListener('value-changed', valueChanged);
  }

  _escape(str) {
    return String(str).replace(/"/g, '&quot;');
  }
}

if (!customElements.get('calorie-gauge-editor')) {
  customElements.define('calorie-gauge-editor', CalorieGaugeEditor);
}

// Provide built-in visual editor schema for Lovelace
CalorieGaugeCard.getConfigForm = function () {
  return {
    schema: [
      { name: 'title', selector: { text: {} } },
      {
        name: 'profile_entity_id',
        required: true,
        selector: { entity: { domain: 'sensor', allow_custom_entity: true } },
      },
      { name: 'max_height', selector: { text: {} } },
    ],
  };
};

CalorieGaugeCard.getStubConfig = function () {
  return { profile_entity_id: '', max_height: '400px' };
};
