import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';
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
  static styles = [
    css`
      ha-app-layout {
        /* Use Home Assistant's native theme variables */
      }

      app-header {
        background-color: var(--app-header-background-color) !important;
        color: var(--app-header-text-color) !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 1 !important;
      }

      app-toolbar {
        background-color: transparent !important;
        color: var(--app-header-text-color) !important;
        height: 64px !important;
        display: flex !important;
        align-items: center !important;
        padding: 0 16px !important;
      }

      ha-menu-button {
        --mdc-theme-primary: var(--app-header-text-color);
        color: var(--app-header-text-color) !important;
        margin-right: 16px !important;
        flex-shrink: 0 !important;
      }

      .content {
        padding: 16px;
        padding-top: 80px; /* Account for fixed header */
        background-color: var(--primary-background-color);
      }

      .toolbar-title {
        flex: 1 !important;
        text-align: center !important;
        font-size: 20px !important;
        font-weight: 400 !important;
        margin: 0 !important;
        padding-right: 48px !important; /* Offset for hamburger button to center text */
      }

      .main-card {
        margin-bottom: 8px;
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
  };

  constructor() {
    super();
    this._hass = null;
    this._profile = null;
    this._allProfiles = [];
    this._selectedEntityId = "";
    this._defaultProfile = null;
    this._discoveredData = [];
    const today = new Date();
    this._selectedDate = getLocalDateString(today);
    this._showLinkDiscoveredPopup = false;
    this._linkProfileId = "";
    this._linkSelections = {};
  }

  async _fetchDiscoveredData() {
    if (!this._hass?.connection) {
      this._discoveredData = [];
      return;
    }
    try {
      const resp = await this._hass.connection.sendMessagePromise({
        type: "calorie_tracker/get_discovered_data",
      });
      this._discoveredData = resp?.discovered_data || [];
    } catch (err) {
      this._discoveredData = [];
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
  }

  async _fetchLogAndSummary(entityId, date = null) {
    try {
      if (!this._hass?.connection || !entityId) return { log: {}, weight: null, weekly_summary: {} };
      const [dailyResp, summaryResp] = await Promise.all([
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
      ]);
      return {
        log: {
          food_entries: dailyResp?.food_entries ?? [],
          exercise_entries: dailyResp?.exercise_entries ?? [],
        },
        weight: dailyResp?.weight ?? null,
        weekly_summary: summaryResp?.weekly_summary ?? {},
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
        const { log, weight, weekly_summary } = await this._fetchLogAndSummary(this._selectedEntityId, this._selectedDate);
        this._log = log;
        this._weight = weight;
        this._weeklySummary = weekly_summary;
      } else {
        this._log = {};
        this._weight = null;
        this._weeklySummary = {};
      }
    } catch (err) {
      this._defaultProfile = null;
      this._allProfiles = [];
      this._selectedEntityId = "";
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
    this._linkSelections = Object.fromEntries((this._discoveredData || []).map(e => [e.id, true]));
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
                <input type="checkbox" .checked=${!!this._linkSelections[entry.id]} @change=${e => this._onLinkSelectionChange(e, entry.id)} />
                <span style="min-width:90px;">${(new Date(entry.timestamp)).toLocaleDateString()}</span>
                <span style="min-width:60px;">${entry.type || entry.exercise_type || "?"}</span>
                <button class="ha-btn" style="padding:2px 8px;min-width:60px;">Details</button>
              </div>
            `)}
          </div>
          <div class="edit-actions" style="margin-top:18px;">
            <button class="ha-btn" style="font-size: 1em;" @click=${() => {}}>Save</button>
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
            <div class="toolbar-title">🍎 Calorie Tracker</div>
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
                @profile-selected=${this._onProfileSelected}
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
                      @edit-daily-entry=${this._onEditDailyEntry}
                      @delete-daily-entry=${this._onDeleteDailyEntry}
                      @add-daily-entry=${this._onAddDailyEntry}
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
    this._fetchLogAndSummary(this._selectedEntityId, date).then(({ log, weight, weekly_summary }) => {
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
    this._fetchLogAndSummary(this._selectedEntityId).then(({ log, weight, weekly_summary }) => {
      this._log = log;
      this._weight = weight
      this._weeklySummary = weekly_summary;
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
      this._fetchLogAndSummary(this._selectedEntityId, this._selectedDate).then(({ log, weekly_summary }) => {
        this._log = log;
        this._weeklySummary = weekly_summary;
        this.requestUpdate();
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
      this._fetchLogAndSummary(this._selectedEntityId, this._selectedDate).then(({ log, weekly_summary }) => {
        this._log = log;
        this._weeklySummary = weekly_summary;
        this.requestUpdate();
      });
    }).catch(err => {
      console.error("Failed to delete entry:", err);
    });
  }

  _onRefreshSummary() {
    // Re-fetch log and summary for the current date/profile
    this._fetchLogAndSummary(this._selectedEntityId, this._selectedDate).then(({ log, weight, weekly_summary }) => {
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
      this._fetchLogAndSummary(this._selectedEntityId, this._selectedDate).then(({ log, weight, weekly_summary }) => {
        this._log = log;
        this._weight = weight;
        this._weeklySummary = weekly_summary;
        this.requestUpdate();
      });
    }).catch(err => {
      console.error("Failed to add entry:", err);
    });
  }
}

customElements.define('calorie-tracker-panel', CalorieTrackerPanel);
