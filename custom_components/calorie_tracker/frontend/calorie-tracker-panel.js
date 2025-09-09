import { LitElement, html, css } from 'https://unpkg.com/lit@2/index.js?module';
import './components/summary.js?v=4';
import './components/profile-card.js';
import './components/daily-data.js';

async function fetchUserProfile(hass) {
  if (!hass?.connection || !hass?.user?.id) {
    return {};
  }
  return await hass.connection.sendMessagePromise({
    type: "calorie_tracker/get_user_profile",
    user_id: hass.user.id,
  });
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

class CalorieTrackerPanel extends LitElement {

  _onHassReconnect = () => {
    // Re-initialize profile and data on reconnect
    this._initializeProfile();
    this._fetchDiscoveredData();
  }

  _onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // When returning to the app, re-initialize profile and data
      this._initializeProfile();
      this._fetchDiscoveredData();
    }
  }
  _onProfileModalOpen = () => {
    this._profileModalDepth += 1;
    const firstCard = this.renderRoot?.querySelector('ha-card.main-card');
    if (firstCard) firstCard.classList.add('profile-modal-active');
  };

  _onProfileModalClose = () => {
    this._profileModalDepth = Math.max(0, this._profileModalDepth - 1);
    if (this._profileModalDepth === 0) {
      const firstCard = this.renderRoot?.querySelector('ha-card.main-card');
      if (firstCard) firstCard.classList.remove('profile-modal-active');
    }
  };
  static styles = [
    css`
      :host {
        /* Unified modal layering variable for calorie tracker components */
        --ct-modal-z: 1500;
      }
      ha-app-layout {
        /* Use Home Assistant's native theme variables */
      }

      ha-app-layout app-header {
        background-color: var(--app-header-background-color);
        color: var(--app-header-text-color);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100; /* Raised from 50 to give more room for modal layering */
        pointer-events: auto;
      }

      ha-app-layout app-header app-toolbar {
        background-color: transparent;
        color: var(--app-header-text-color);
        height: 50px;
        display: flex;
        align-items: center;
        padding: 0;
      }

      ha-app-layout app-header app-toolbar ha-menu-button {
        --mdc-theme-primary: var(--app-header-text-color);
        color: var(--app-header-text-color);
        flex-shrink: 0;
      }

      ha-app-layout .content {
        padding: 8px;
        padding-top: 58px;
        background-color: var(--primary-background-color);
        position: relative;
        z-index: 0; /* Keep content below fixed header */
      }

      ha-app-layout .content > * {
        position: relative;
        z-index: 0;
      }

      ha-app-layout app-header app-toolbar .toolbar-title {
        flex: 1;
        text-align: left;
        font-size: 20px;
        font-weight: 400;
        margin: 0;
        padding-left: 24px;
        transition: padding-left 0.2s ease;
      }

      @media (min-width: 870px) {
        ha-app-layout app-header app-toolbar .toolbar-title {
          padding-left: calc(var(--mdc-drawer-width, 256px) - 16px);
        }
      }

      .main-card {
        margin-bottom: 8px;
        position: relative;
      }

      /* When the profile card has an open modal, elevate its card above others */
      .main-card.profile-modal-active {
        z-index: 10;
      }

      .card-content {
        padding: 0px 16px;
      }
      .ha-btn {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border: none;
      border-radius: 4px;
      padding: 4px 9px;
      font-size: 0.85em;
      cursor: pointer;
      font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      transition: background 0.2s;
      min-width: 32px;
      min-height: 18px;
      font-weight: 500;
      letter-spacing: 0.0892857em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .ha-btn:hover {
      background: var(--primary-color-dark, #0288d1);
    }
    /* Modal styles copied and adapted from daily-data.js */
    .modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.32);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
    }
    .modal-content {
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      padding: 24px;
      border-radius: var(--ha-card-border-radius, 12px);
      min-width: 320px;
      max-width: 95vw;
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.2));
      text-align: left;
    }
    .modal-header {
      font-size: 1.15em;
      font-weight: 500;
      margin-bottom: 18px;
      color: var(--primary-text-color, #212121);
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }
    .edit-input {
      width: 100%;
      font-size: 1em;
      padding: 6px 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--input-background-color, var(--card-background-color, #fff));
      color: var(--primary-text-color, #212121);
      box-sizing: border-box;
    }
    .edit-input:focus {
      outline: 2px solid var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
    }
    .edit-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 12px;
    }
    .edit-actions button {
      min-width: 90px;
    }
    `];

  static properties = {
    _hass: { attribute: false },
    _profile: { attribute: false },
    _allProfiles: { attribute: false },
    _selectedEntityId: { type: String },
    _defaultProfile: { attribute: false },
    _selectedDate: { type: String },
    _discoveredData: { attribute: false },
    _showLinkDiscoveredPopup: { type: Boolean, attribute: false },
    _linkProfileId: { type: String, attribute: false },
    _linkSelections: { attribute: false },
    _goals: { attribute: false },
  };

  constructor() {
    super();
    this._hass = null;
    this._profile = null;
    this._allProfiles = [];
    this._selectedEntityId = "";
    this._defaultProfile = null;
    this._discoveredData = [];
    this._imageAnalyzers = [];
    const today = new Date();
    this._selectedDate = getLocalDateString(today);
    this._showLinkDiscoveredPopup = false;
    this._linkProfileId = "";
    this._linkSelections = {};
    this._goals = [];
    this._profileModalDepth = 0;
  }

  async _fetchDiscoveredData() {
    if (!this._hass?.connection) {
      this._discoveredData = [];
      this._imageAnalyzers = [];
      return;
    }
    try {
      const resp = await this._hass.connection.sendMessagePromise({
        type: "calorie_tracker/get_discovered_data",
      });
      this._discoveredData = resp?.discovered_data || [];
      this._imageAnalyzers = resp?.image_analyzers || [];
    } catch (err) {
      this._discoveredData = [];
      this._imageAnalyzers = [];
      console.error("[CalorieTrackerPanel] Error fetching discovered data:", err);
    }
    this.requestUpdate();
  }

  set hass(hass) {
    this._hass = hass;
    if (this.isConnected) {
      this._initializeProfile();
      this._fetchDiscoveredData();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._hass) {
      this._initializeProfile();
      this._fetchDiscoveredData();
    }
    window.addEventListener('hass-reconnected', this._onHassReconnect);
    document.addEventListener('visibilitychange', this._onVisibilityChange);
    this.addEventListener('profile-modal-open', this._onProfileModalOpen);
    this.addEventListener('profile-modal-close', this._onProfileModalClose);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hass-reconnected', this._onHassReconnect);
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    this.removeEventListener('profile-modal-open', this._onProfileModalOpen);
    this.removeEventListener('profile-modal-close', this._onProfileModalClose);
  }

  async _fetchProfileData(entityId, date = null) {
    try {
      if (!this._hass?.connection || !entityId) return { log: {}, weight: null, weekly_summary: {}, linked_components: {} };
      const [dailyResp, summaryResp, linkedResp, goalsResp] = await Promise.all([
        this._hass.connection.sendMessagePromise({
          type: "calorie_tracker/get_daily_data",
          entity_id: entityId,
          ...(date ? { date } : {}),
        }),
        this._hass.connection.sendMessagePromise({
          type: "calorie_tracker/get_weekly_summary",
          entity_id: entityId,
          ...(date ? { date } : {}),
        }),
        this._hass.connection.sendMessagePromise({
          type: "calorie_tracker/get_linked_components",
          entity_id: entityId,
        }),
        this._hass.connection.sendMessagePromise({
          type: "calorie_tracker/get_goals",
          entity_id: entityId,
        }),
      ]);
      return {
        log: {
          food_entries: dailyResp?.food_entries ?? [],
          exercise_entries: dailyResp?.exercise_entries ?? [],
          weight: dailyResp?.weight ?? null,
          body_fat_pct: dailyResp?.body_fat_pct ?? null,
          bmr_and_neat: dailyResp?.bmr_and_neat ?? null,
          macros: dailyResp?.macros ?? {},
          config_entry_id: dailyResp?.config_entry_id ?? null,
        },
        weight: dailyResp?.weight ?? null,
        weekly_summary: summaryResp?.weekly_summary ?? {},
        linked_components: linkedResp?.linked_components ?? {},
        goals: goalsResp?.goals ?? [],
      };
    } catch (err) {
      if (err && (err.code === 403 || err.status === 403)) {
        window.location.href = "/";
        return;
      }
      throw err;
    }
  }

  async _initializeProfile() {
    try {
      const resp = await fetchUserProfile(this._hass);
      this._defaultProfile = resp?.default_profile || null;
      this._allProfiles = resp?.all_profiles || [];

      // Select default profile if exists, else first profile
      let selectedEntityId = this._selectedEntityId;
      if (
        !selectedEntityId ||
        !this._allProfiles.some(p => p.entity_id === selectedEntityId)
      ) {
        if (resp?.default_profile && resp.default_profile.entity_id) {
          selectedEntityId = resp.default_profile.entity_id;
        } else if (this._allProfiles.length > 0) {
          selectedEntityId = this._allProfiles[0].entity_id;
        } else {
          selectedEntityId = "";
        }
      }
      this._selectedEntityId = selectedEntityId;

      if (this._selectedEntityId) {
        const { log, weight, weekly_summary, linked_components, goals } =
          await this._fetchProfileData(this._selectedEntityId, this._selectedDate);
        this._log = log;
        this._weight = weight;
        this._weeklySummary = weekly_summary;
        this._linkedComponents = linked_components;
        this._goals = goals;
      } else {
        this._log = {};
        this._weight = null;
        this._weeklySummary = {};
        this._linkedComponents = {};
        this._goals = [];
      }
    } catch (err) {
      this._defaultProfile = null;
      this._allProfiles = [];
      this._selectedEntityId = "";
      this._log = {};
      this._weight = null;
      this._weeklySummary = {};
      this._linkedComponents = {};
      this._goals = [];
      console.error("Failed to fetch user profile:", err);
    }
    this._selectProfile();
    this.requestUpdate();
  }

  _selectProfile() {
    if (!this._hass || !this._allProfiles.length) {
      this._profile = null;
      this._selectedEntityId = "";
      return;
    }

    let selectedEntityId = this._selectedEntityId;
    if (!selectedEntityId || !this._allProfiles.some(p => p.entity_id === selectedEntityId)) {
      selectedEntityId = this._allProfiles[0].entity_id;
    }
    this._selectedEntityId = selectedEntityId;

    this._profile = this._hass.states[selectedEntityId] || null;
  }

  _openLinkDiscoveredPopup() {
    // Default to first profile if available
    this._linkProfileId = this._allProfiles.length > 0 ? this._allProfiles[0].entity_id : "";
    // Default selections: all discovered data selected
    this._linkSelections = Object.fromEntries((this._discoveredData || []).map(e => [e.entry_id, true]));
    this._showLinkDiscoveredPopup = true;
  }

  _closeLinkDiscoveredPopup() {
    this._showLinkDiscoveredPopup = false;
  }

  _onLinkProfileChange(e) {
    this._linkProfileId = e.target.value;
  }

  _onLinkSelectionChange(e, entryId) {
    this._linkSelections = { ...this._linkSelections, [entryId]: e.target.checked };
  }

  async _saveLinkSelections() {
    if (!this._hass?.connection || !this._linkProfileId) return;

    // Get selected entries and group them by domain
    const selectedEntries = Object.entries(this._linkSelections)
      .filter(([_, isSelected]) => isSelected)
      .map(([entryId, _]) => {
        const entry = (this._discoveredData || []).find(e => e.entry_id === entryId);
        return entry ? { linked_domain: entry.domain, linked_component_entry_id: entry.entry_id } : null;
      })
      .filter(Boolean);

    if (selectedEntries.length === 0) {
      this._showSnackbar && this._showSnackbar("No devices selected", true);
      return;
    }

    // Group entries by linked_domain
    const entriesByDomain = {};
    for (const { linked_domain, linked_component_entry_id } of selectedEntries) {
      if (!entriesByDomain[linked_domain]) entriesByDomain[linked_domain] = [];
      entriesByDomain[linked_domain].push(linked_component_entry_id);
    }

    try {
      // Send one message per domain (API expects linked_domain and linked_component_entry_ids)
      for (const [linked_domain, linked_component_entry_ids] of Object.entries(entriesByDomain)) {
        await this._hass.connection.sendMessagePromise({
          type: "calorie_tracker/link_discovered_components",
          calorie_tracker_entity_id: this._linkProfileId,
          linked_domain,
          linked_component_entry_ids,
        });
      }
      this._showSnackbar && this._showSnackbar("Devices linked");
      this._showLinkDiscoveredPopup = false;
      this._fetchDiscoveredData();
      this.dispatchEvent(new CustomEvent("refresh-profile", { bubbles: true, composed: true }));
    } catch (err) {
      this._showSnackbar && this._showSnackbar("Failed to link devices", true);
    }
  }

  _renderLinkDiscoveredPopup() {
    const profiles = this._allProfiles;
    return html`
      <div class="modal" @click=${this._closeLinkDiscoveredPopup}>
        <div class="modal-content" @click=${e => e.stopPropagation()}>
          <div class="modal-header">Link Discovered Data</div>
          <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <span>Link data to</span>
            <select class="edit-input" style="min-width: 90px; max-width: 180px; flex: 0 1 auto;" @change=${this._onLinkProfileChange} .value=${this._linkProfileId}>
              ${profiles.map(p => html`<option value="${p.entity_id}">${p.spoken_name}</option>`)}
            </select>
          </div>
          <div style="max-height:260px;overflow-y:auto;">
            ${(this._discoveredData || []).map(entry => html`
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <input type="checkbox" .checked=${!!this._linkSelections[entry.entry_id]} @change=${e => this._onLinkSelectionChange(e, entry.entry_id)} />
                <span style="min-width:90px;">${entry.domain}</span>
                <span style="min-width:60px;">${entry.title || entry.username || "?"}</span>
              </div>
            `)}
          </div>
          <div class="edit-actions" style="margin-top:18px;">
            <button class="ha-btn" style="font-size: 1em;" @click=${this._saveLinkSelections}>Save</button>
            <button class="ha-btn" style="font-size: 1em;" @click=${this._closeLinkDiscoveredPopup}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <ha-app-layout>
        <app-header slot="header" fixed>
          <app-toolbar>
            <ha-menu-button
              .hass=${this._hass}
              narrow
              @click=${this._toggleSidebar}
            ></ha-menu-button>
            <div class="toolbar-title">Calorie Tracker</div>
          </app-toolbar>
        </app-header>

        <div class="content">
          <ha-card class="main-card">
            <div class="card-content">
              <profile-card
                .hass=${this._hass}
                .profile=${this._profile}
                .allProfiles=${this._allProfiles}
                .defaultProfile=${this._defaultProfile}
                .linkedDevices=${this._linkedComponents}
                .goalType=${this._weeklySummary?.[this._selectedDate]?.[4] || "Not Set"}
                .dailyGoal=${this._weeklySummary?.[this._selectedDate]?.[3] || null}
                .currentWeight=${this._weeklySummary?.[this._selectedDate]?.[5] || null}
                .goalValue=${this._weeklySummary?.[this._selectedDate]?.[6] || null}
                .goals=${this._goals}
                @profile-selected=${this._onProfileSelected}
                @goals-updated=${this._onGoalsUpdated}
              />
            </div>
          </ha-card>

          ${this._discoveredData && this._discoveredData.length > 0 ? html`
            <div style="text-align:center; margin: 16px 0;">
              <button class="ha-btn" style="font-size: 1em; min-width: 120px; min-height: 36px;" @click=${this._openLinkDiscoveredPopup}>
                Link Discovered Data
              </button>
            </div>
          ` : ""}

          <ha-card class="main-card">
            <div class="card-content">
              ${this._profile
                ? html`
                    <calorie-summary
                      .hass=${this._hass}
                      .profile=${this._profile}
                      .weeklySummary=${this._weeklySummary}
                      .selectedDate=${this._selectedDate}
                      .weight=${this._weight}
                      @select-summary-date=${this._onSelectSummaryDate}
                      @refresh-summary=${this._onRefreshSummary}
                    ></calorie-summary>
                  `
                : html`<div>Calorie Tracker profile not found.</div>`
              }
            </div>
          </ha-card>

          <ha-card class="main-card">
            <div class="card-content">
              ${this._profile
                ? html`
                    <daily-data-card
                      .hass=${this._hass}
                      .profile=${this._profile}
                      .log=${this._log}
                      .selectedDate=${this._selectedDate}
                      .imageAnalyzers=${this._imageAnalyzers}
                      @edit-daily-entry=${this._onEditDailyEntry}
                      @delete-daily-entry=${this._onDeleteDailyEntry}
                      @add-daily-entry=${this._onAddDailyEntry}
                      @refresh-daily-data=${this._onRefreshDailyData}
                    ></daily-data-card>
                  `
                : html`<div>Calorie Tracker profile not found.</div>`
              }
            </div>
          </ha-card>
        </div>
      </ha-app-layout>
      ${this._showLinkDiscoveredPopup ? this._renderLinkDiscoveredPopup() : ""}
    `;
  }

  _toggleSidebar(e) {
    e.preventDefault();
    e.stopPropagation();
    const homeAssistant = document.querySelector('home-assistant');
    if (!homeAssistant?.shadowRoot) return;
    const main = homeAssistant.shadowRoot.querySelector('home-assistant-main');
    if (!main?.shadowRoot) return;
    const sidebar = main.shadowRoot.querySelector('ha-sidebar');
    if (sidebar && typeof sidebar.toggle === 'function') {
      sidebar.toggle();
    }
  }

  _onSelectSummaryDate(e) {
    const date = e.detail.date;
    this._selectedDate = date;
    this._fetchProfileData(this._selectedEntityId, date).then(({ log, weight, weekly_summary }) => {
      this._log = log;
      this._weight = weight
      this._weeklySummary = weekly_summary;
      this.requestUpdate();
    });
  }

  _onProfileSelected(e) {
    this._selectedEntityId = e.detail.entityId;
    this._selectProfile();
    if (!this._profile) return;
    this._fetchProfileData(this._selectedEntityId, this._selectedDate).then(({ log, weight, weekly_summary, linked_components, goals }) => {
      this._log = log;
      this._weight = weight;
      this._weeklySummary = weekly_summary;
      this._linkedComponents = linked_components || {};
      this._goals = goals || [];
      this.requestUpdate();
    });
  }

  _onEditDailyEntry(e) {
    const { entry_id, entry_type, entry } = e.detail;
    if (!this._hass?.connection || !this._selectedEntityId) return;
    this._hass.connection.sendMessagePromise({
      type: "calorie_tracker/update_entry",
      entity_id: this._selectedEntityId,
      entry_id,
      entry_type,
      entry,
    }).then(() => {
      this._fetchProfileData(this._selectedEntityId, this._selectedDate).then(({ log, weekly_summary }) => {
        this._log = log;
        this._weeklySummary = weekly_summary;
        this.requestUpdate();
      }).catch(err => {
        console.error('Failed to refresh profile data after update:', err);
      });
    }).catch(err => {
      console.error("Failed to update entry:", err);
    });
  }

  _onDeleteDailyEntry(e) {
    const { entry_id, entry_type } = e.detail;
    if (!this._hass?.connection || !this._selectedEntityId) return;
    this._hass.connection.sendMessagePromise({
      type: "calorie_tracker/delete_entry",
      entity_id: this._selectedEntityId,
      entry_id,
      entry_type,
    }).then(() => {
      this._fetchProfileData(this._selectedEntityId, this._selectedDate).then(({ log, weekly_summary }) => {
        this._log = log;
        this._weeklySummary = weekly_summary;
        this.requestUpdate();
      }).catch(err => {
        console.error('Failed to refresh profile data after delete:', err);
      });
    }).catch(err => {
      console.error("Failed to delete entry:", err);
    });
  }

  _onRefreshSummary() {
    // Re-fetch log and summary for the current date/profile
    this._fetchProfileData(this._selectedEntityId, this._selectedDate).then(({ log, weight, weekly_summary }) => {
      this._log = log;
      this._weight = weight;
      this._weeklySummary = weekly_summary;
      this.requestUpdate();
    });
  }

  _onRefreshDailyData() {
    // Refresh data after chat assistant operations
    this._fetchProfileData(this._selectedEntityId, this._selectedDate).then(({ log, weight, weekly_summary }) => {
      this._log = log;
      this._weight = weight;
      this._weeklySummary = weekly_summary;
      this.requestUpdate();
    });
  }

  _onAddDailyEntry(e) {
    const { entry_type, entry } = e.detail;
    if (!this._hass?.connection || !this._selectedEntityId) return;
    this._hass.connection.sendMessagePromise({
      type: "calorie_tracker/create_entry",
      entity_id: this._selectedEntityId,
      entry_type,
      entry,
    }).then(() => {
          this._fetchProfileData(this._selectedEntityId, this._selectedDate).then(({ log, weight, weekly_summary }) => {
            this._log = log;
            this._weight = weight;
            this._weeklySummary = weekly_summary;
            this.requestUpdate();
          }).catch(err => {
            console.error('Failed to refresh profile data after add:', err);
          });
    }).catch(err => {
      console.error("Failed to add entry:", err);
    });
  }

  _onGoalsUpdated(e) {
    // Refresh goals data after goals are updated in profile-card
    if (!this._hass?.connection || !this._selectedEntityId) return;
    this._hass.connection.sendMessagePromise({
      type: "calorie_tracker/get_goals",
      entity_id: this._selectedEntityId,
    }).then((resp) => {
      this._goals = resp?.goals || [];
      this.requestUpdate();
    }).catch(err => {
      console.error("Failed to refresh goals:", err);
    });
  }
}

customElements.define('calorie-tracker-panel', CalorieTrackerPanel);
