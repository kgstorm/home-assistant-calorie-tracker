class CalorieDailyDataCard extends HTMLElement {
  constructor() {
    super();
    this._eventsAttached = false;
    this._dailyDataLoaded = false;
  }

  async _ensureDailyDataLoaded() {
    if (!this._dailyDataLoaded && !customElements.get('daily-data-card')) {
      try {
        await import('./daily-data.js');
        this._dailyDataLoaded = true;
      } catch (error) {
        console.error('Failed to load daily-data component:', error);
      }
    }
  }

  setConfig(config) {
    this.config = config;
    this.profileEntityId = config.profile_entity_id || null;
    this.title = typeof config.title === "string" ? config.title : "";

    this.innerHTML = `
      <ha-card>
        ${this.title && this.title.trim() ? `<div class="card-header">${this.title}</div>` : ""}
        <daily-data-card></daily-data-card>
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
    await this._ensureDailyDataLoaded();

    await customElements.whenDefined('daily-data-card');

    const el = this.querySelector('daily-data-card');
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

    try {
      // Fetch daily data
      const dailyResp = await this.hass.connection.sendMessagePromise({
        type: "calorie_tracker/get_daily_data",
        entity_id: entityId,
        date: el.selectedDate,
      });

      // Set the log data - always use top-level structure from websocket
      el.log = {
        food_entries: dailyResp?.food_entries || [],
        exercise_entries: dailyResp?.exercise_entries || [],
        weight: dailyResp?.weight ?? null,
        body_fat_pct: dailyResp?.body_fat_pct ?? null,
        bmr_and_neat: dailyResp?.bmr_and_neat ?? null,
        macros: dailyResp?.macros || null,
        config_entry_id: dailyResp?.config_entry_id ?? null
      };
    } catch (err) {
      console.error("Failed to fetch daily data:", err);
      // Set empty log on error
      el.log = {
        food_entries: [],
        exercise_entries: [],
        weight: null,
        body_fat_pct: null,
        bmr_and_neat: null
      };
    }

    // Attach event listeners
    if (!this._eventsAttached) {
      el.addEventListener("select-daily-date", (e) => {
        this.selectedDate = e.detail.date;
        this._updateCard();
      });
      el.addEventListener("refresh-daily-data", () => {
        this._updateCard();
      });
      el.addEventListener("add-daily-entry", async (e) => {
        try {
          await this.hass.connection.sendMessagePromise({
            type: "calorie_tracker/add_entry",
            entity_id: entityId,
            ...e.detail,
          });
          this._updateCard();
        } catch (err) {
          console.error("Failed to add entry:", err);
        }
      });
      el.addEventListener("edit-daily-entry", async (e) => {
        try {
          await this.hass.connection.sendMessagePromise({
            type: "calorie_tracker/update_entry",
            entity_id: entityId,
            ...e.detail,
          });
          this._updateCard();
        } catch (err) {
          console.error("Failed to edit entry:", err);
        }
      });
      el.addEventListener("delete-daily-entry", async (e) => {
        try {
          await this.hass.connection.sendMessagePromise({
            type: "calorie_tracker/delete_entry",
            entity_id: entityId,
            ...e.detail,
          });
          this._updateCard();
        } catch (err) {
          console.error("Failed to delete entry:", err);
        }
      });
      this._eventsAttached = true;
    }
  }
}

// Check if the element is already defined
if (!customElements.get('calorie-daily-log-card')) {
  customElements.define('calorie-daily-log-card', CalorieDailyDataCard);
}// Cache bust: Tue Sep  9 12:27:41 AM UTC 2025
