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

    // Hide weight text and BMR
    const weightRow = el.renderRoot.querySelector('.weight-row');
    if (weightRow) {
      weightRow.style.display = 'none';
    }

    // Hide BMR row
    const bmrRow = el.renderRoot.querySelector('.bmr-row');
    if (bmrRow) {
      bmrRow.style.display = 'none';
    }

    // Hide the entire weight-bmr container
    const weightBmrContainer = el.renderRoot.querySelector('.weight-bmr-container');
    if (weightBmrContainer) {
      weightBmrContainer.style.display = 'none';
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
