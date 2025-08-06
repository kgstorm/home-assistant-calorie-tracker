class CalorieSummaryCard extends HTMLElement {
  constructor() {
    super();
    this._eventsAttached = false;
    this._summaryLoaded = false;
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

    if (!this.innerHTML) {
      this.innerHTML = `<calorie-summary></calorie-summary>`;
    }
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

    // Wait for calorie-summary element to be defined
    await customElements.whenDefined('calorie-summary');

    const el = this.querySelector('calorie-summary');
    if (!el || !this.hass) return;

    // Fetch profile entity_id (from config or default)
    let entityId = this.profileEntityId;
    if (!entityId) {
      // Optionally, find the first calorie tracker profile entity
      entityId = Object.keys(this.hass.states).find(eid => eid.startsWith('sensor.calorie_tracker_profile'));
    }
    if (!entityId) {
      console.warn('No calorie tracker profile entity found');
      return;
    }

    // Check if entity exists
    if (!this.hass.states[entityId]) {
      console.error(`Entity not found: ${entityId}`);
      return;
    }

    const profile = this.hass.states[entityId];
    el.hass = this.hass;
    el.profile = profile;
    // Use browser's local date (YYYY-MM-DD format, no timezone)
    el.selectedDate = this.selectedDate || this._getLocalDateString();

    try {
      // Fetch weekly summary and weight via websocket
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

    // Attach event listeners only once
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
}

// Check if the element is already defined before defining it
if (!customElements.get('calorie-summary-card')) {
  customElements.define('calorie-summary-card', CalorieSummaryCard);
}