class CalorieProfileCard extends HTMLElement {
  constructor() {
    super();
    this._eventsAttached = false;
    this._profileLoaded = false;
  }

  async _ensureProfileLoaded() {
    if (!this._profileLoaded && !customElements.get('profile-card')) {
      try {
        await import('./profile-card.js');
        this._profileLoaded = true;
      } catch (error) {
        console.error('Failed to load profile component:', error);
      }
    }
  }

  setConfig(config) {
    this.config = config;
    this.profileEntityId = config.profile_entity_id || null;
    this.title = typeof config.title === "string" ? config.title : "";

    this.innerHTML = `
      <ha-card>
        ${this.title && this.title.trim() ? `<div class="card-header" id="ct-header">${this.title}</div>` : ""}
        <profile-card></profile-card>
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

  async _updateCard() {
    await this._ensureProfileLoaded();

    // Wait for profile-card element to be defined
    await customElements.whenDefined('profile-card');

    const el = this.querySelector('profile-card');
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
    // Auto-title if not provided
    const hdr = this.querySelector('#ct-header');
    if (hdr) {
      if (this.title) {
        hdr.textContent = this.title;
      } else {
        const spoken = profile.attributes?.spoken_name || entityId || 'Calorie Tracker';
        hdr.textContent = `${spoken} Calorie Tracker Profile`;
      }
    }

    try {
      // Fetch all profiles and linked devices
      const [profilesResp, linkedResp] = await Promise.all([
        this.hass.connection.sendMessagePromise({
          type: "calorie_tracker/get_user_profile",
          user_id: this.hass.user?.id || "unknown",
        }),
        this.hass.connection.sendMessagePromise({
          type: "calorie_tracker/get_linked_components",
          entity_id: entityId,
        }),
      ]);

      el.allProfiles = profilesResp?.all_profiles ?? [];
      el.linkedDevices = linkedResp?.linked_components ?? [];
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
      // Fallback to getting profiles from hass.states
      const allProfiles = Object.keys(this.hass.states)
        .filter(eid => eid.startsWith('sensor.calorie_tracker_profile'))
        .map(eid => {
          const state = this.hass.states[eid];
          return {
            entity_id: eid,
            spoken_name: state.attributes?.spoken_name || eid
          };
        })
        .filter(profile => profile);

      el.allProfiles = allProfiles;
      el.linkedDevices = [];
    }

    // Attach event listeners
    if (!this._eventsAttached) {
      el.addEventListener("refresh-profile", () => {
        this._updateCard();
      });
      el.addEventListener("profile-selected", (e) => {
        this.profileEntityId = e.detail.entityId;
        this._updateCard();
      });
      el.addEventListener("profiles-updated", (e) => {
        // Refresh the card when profiles are updated
        this._updateCard();
      });
      this._eventsAttached = true;
    }
  }
}

// Check if the element is already defined
if (!customElements.get('calorie-profile-card')) {
  customElements.define('calorie-profile-card', CalorieProfileCard);
}