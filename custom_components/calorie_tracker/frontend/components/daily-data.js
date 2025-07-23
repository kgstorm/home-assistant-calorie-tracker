import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function toLocalISOString(date) {
  // Returns YYYY-MM-DDTHH:mm:ss (local time)
  const pad = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatDateString(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString(undefined, { month: "short" })} ${d.getFullYear()}`;
}

// =============================================================================
// DAILY DATA CARD COMPONENT
// =============================================================================

class DailyDataCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    profile: { attribute: false },
    log: { attribute: false },
    selectedDate: { type: String },
    _editIndex: { type: Number, state: true },
    _editData: { attribute: false, state: true },
    _showEditPopup: { type: Boolean, state: true },
    _addEntryType: { type: String, state: true },
    _showAddPopup: { type: Boolean, state: true },
    _addData: { attribute: false, state: true },
    _addError: { type: String, state: true },
    imageAnalyzers: { attribute: false },
    _showAnalyzerSelect: { type: Boolean, state: true },
    _showPhotoUpload: { type: Boolean, state: true },
    _showPhotoReview: { type: Boolean, state: true },
    _photoLoading: { type: Boolean, state: true },
    _photoError: { type: String, state: true },
    _showChatAssist: { type: Boolean, state: true },
    _chatHistory: { attribute: false, state: true },
    _chatInput: { attribute: false, state: true },
    _showMissingLLMModal: { type: Boolean, state: true },
    _missingLLMModalType: { type: String, state: true },
  };

  static styles = [
    css`
      .ha-btn {
        margin-left: 0;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: var(--ha-button-border-radius, 4px);
        padding: 4px 10px;
        font-size: 0.95em;
        cursor: pointer;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
        transition: background 0.2s;
        box-shadow: var(--ha-button-box-shadow, none);
        min-width: 32px;
        min-height: 28px;
        font-weight: 500;
        letter-spacing: 0.0892857em;
        text-transform: uppercase;
      }
      .ha-btn:hover {
        background: var(--primary-color-dark, #0288d1);
      }
      .ha-btn.error {
        background: var(--error-color, #f44336);
        color: #fff;
      }
      .daily-data-card {
        background: var(--card-background-color, #fff);
        border-radius: 8px;
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.05));
        padding: 8px 0 8px 0;
        margin: 0;
        width: 100%;
        box-sizing: border-box;
        max-width: 420px; /* Add a max-width for desktop */
        margin-left: auto;
        margin-right: auto;
      }
      .header {
        font-size: 16px;
        font-weight: bold;
        color: var(--primary-text-color, #333);
        padding: 0 16px 8px 16px;
      }
      .header-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      @media (min-width: 600px) {
        .header-text {
          flex-direction: row;
          align-items: center;
          gap: 4px;
        }
      }
      .item-list {
        list-style: none;
        margin: 0;
        padding: 0 16px;
      }
      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--divider-color, #eee);
        padding: 6px 0;
        font-size: 14px;
        color: var(--primary-text-color, #333);
      }
      .item:last-child {
        border-bottom: none;
      }
      .item-time {
        color: var(--secondary-text-color, #888);
        font-size: 13px;
        min-width: 48px;
        text-align: left;
        margin-right: 8px;
        flex-shrink: 0;
      }
      .item-name {
        font-weight: 500;
        flex: 1;
        margin-right: 8px;
        color: var(--primary-text-color, #333);
      }
      .item-calories {
        color: var(--secondary-text-color, #666);
        font-size: 13px;
        min-width: 60px;
        text-align: right;
        margin-right: 8px;
      }
      .edit-btn {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        cursor: pointer;
        font-size: 16px;
        padding: 2px 6px;
        border-radius: 4px;
        transition: background 0.2s;
        margin-left: 2px;
      }
      .edit-btn:hover {
        background: var(--primary-color-light, #e3f2fd);
      }
      .no-items {
        color: var(--secondary-text-color, #888);
        font-size: 14px;
        text-align: center;
        padding: 12px 0;
      }
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        font-weight: 600;
        color: var(--secondary-text-color, #666);
        padding: 0 16px 4px 16px;
        border-bottom: 1px solid var(--divider-color, #eee);
      }
      .table-header span {
        flex-shrink: 0;
      }
      .table-header .header-time {
        min-width: 48px;
        text-align: left;
        margin-right: 8px;
      }
      .table-header .header-name {
        flex: 1;
        margin-right: 8px;
        text-align: left;
      }
      .table-header .header-calories {
        min-width: 60px;
        text-align: right;
      }
      /* Popup styles */
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
      .edit-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 12px 18px;
        align-items: center;
        margin-bottom: 18px;
      }
      .edit-label {
        font-weight: 500;
        color: var(--primary-text-color, #212121);
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
      .add-btn {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        cursor: pointer;
        font-size: 22px;
        padding: 2px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .add-btn:hover {
        background: var(--primary-color-light, #e3f2fd);
      }
      .ha-btn.add-entry-btn {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: 8px;
        width: 32px;
        height: 32px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
        transition: background 0.2s;
        min-width: 28px;
        min-height: 18px;
        font-weight: 500;
        letter-spacing: 0.0892857em;
        text-transform: uppercase;
      }
      .ha-btn.add-entry-btn:hover {
        background: var(--primary-color-light, #e3f2fd);
        color: var(--primary-color, #03a9f4);
      }
    `
  ];

  // ===========================================================================
  // CONSTRUCTOR & INITIALIZATION
  // ===========================================================================

  constructor() {
    super();
    this._initializeState();
  }

  _initializeState() {
    // Edit state
    this._editIndex = -1;
    this._editData = null;
    this._showEditPopup = false;

    // Add entry state
    this._addEntryType = "food";
    this._addData = {};
    this._addError = "";
    this._showAddPopup = false;

    // Photo analysis state
    this.imageAnalyzers = [];
    this._showAnalyzerSelect = false;
    this._showPhotoUpload = false;
    this._selectedAnalyzer = null;
    this._photoFile = null;
    this._photoError = '';
    this._photoLoading = false;
    this._photoDetectedItems = null;
    this._showPhotoReview = false;
    this._photoReviewItems = null;
    this._photoReviewRaw = null;
    this._photoReviewAnalyzer = null;

    // Chat assistant state
    this._showChatAssist = false;
    this._assistPipelines = [];
    this._selectedPipeline = null;
    this._conversationAgents = [];
    this._selectedAgent = null;
    this._chatHistory = [];
    this._chatInput = "";
    this._conversationId = null;

    // MissingLLM modal state
    this._showMissingLLMModal = false;
    this._missingLLMModalType = null;
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  _logToServer(level, message) {
    try {
      const hass = this.hass || window?.hass;
      if (hass?.callService) {
        hass.callService('system_log', 'write', {
          level: level, // 'debug', 'info', 'warning', 'error'
          message: `Calorie Tracker Frontend: ${message}`,
        });
      } else {
        console.warn("Cannot log to server, hass.callService not available.");
      }
    } catch (err) {
      console.error("Failed to send log to server:", err);
    }
  }

  _closeAllModals() {
    this._showEditPopup = false;
    this._showAddPopup = false;
    this._showAnalyzerSelect = false;
    this._showPhotoUpload = false;
    this._showPhotoReview = false;
    this._showChatAssist = false;
    this._showMissingLLMModal = false;
  }

  // ===========================================================================
  // MAIN RENDER METHOD
  // ===========================================================================

  render() {
    const foodEntries = this.log?.food_entries ?? [];
    const exerciseEntries = this.log?.exercise_entries ?? [];
    const dateStr = formatDateString(this.selectedDate);
    const hasExercise = exerciseEntries.length > 0;
    const hasFood = foodEntries.length > 0;

    return html`
      <div class="daily-data-card">
        ${this._renderHeader(dateStr)}
        ${this._renderContent(hasExercise, hasFood, exerciseEntries, foodEntries)}
        ${this._renderModals()}
      </div>
    `;
  }

  _renderHeader(dateStr) {
    return html`
      <div class="header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
        <div class="header-text">
          <span>Daily Data for</span>
          <span>${dateStr}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          ${this._renderActionButtons()}
        </div>
      </div>
    `;
  }

  _renderActionButtons() {
    return html`
      <button class="ha-btn add-entry-btn" title="Add Manual Entry" @click=${this._openAddEntry}>
        <svg width="22" height="22" viewBox="0 0 24 24" style="vertical-align:middle;fill:#fff;">
          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
        </svg>
      </button>
      <button class="ha-btn add-entry-btn" title="Assist" @click=${this._openChatAssist}>
        <svg width="22" height="22" viewBox="0 0 24 24" style="vertical-align:middle;fill:#fff;">
          <g>
            <path class="primary-path" d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9M10,16V19.08L13.08,16H20V4H4V16H10M17,11H15V9H17V11M13,11H11V9H13V11M9,11H7V9H9V11Z"></path>
          </g>
        </svg>
      </button>
      <button class="ha-btn add-entry-btn" title="Log Food from Photo" @click=${this._openPhotoFoodEntry}>
        <svg width="22" height="22" viewBox="0 0 16 16" style="vertical-align:middle;fill:#fff;">
          <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
          <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
        </svg>
      </button>
    `;
  }

  _renderContent(hasExercise, hasFood, exerciseEntries, foodEntries) {
    if (!hasExercise && !hasFood) {
      return html`<div class="no-items">No items logged for today.</div>`;
    }

    return html`
      ${hasExercise ? this._renderExerciseSection(exerciseEntries) : ""}
      ${hasFood ? this._renderFoodSection(foodEntries) : ""}
    `;
  }

  _renderExerciseSection(exerciseEntries) {
    return html`
      <div class="table-header" style="margin-top:8px;">Exercise</div>
      <ul class="item-list">
        ${exerciseEntries.map((item, idx) => this._renderEntry(item, idx, "exercise"))}
      </ul>
    `;
  }

  _renderFoodSection(foodEntries) {
    return html`
      <div class="table-header" style="margin-top:16px;">Food Log</div>
      <ul class="item-list">
        ${foodEntries.map((item, idx) => this._renderEntry(item, idx, "food"))}
      </ul>
    `;
  }

  _renderEntry(item, idx, type) {
    const time = formatTime(item.timestamp);

    if (type === "exercise") {
      return html`
        <li class="item">
          <span class="item-time">${time}</span>
          <span class="item-name">${item.exercise_type ?? 'Exercise'}</span>
          <span class="item-calories">-${item.calories_burned ?? 0} Cal</span>
          <button class="edit-btn" title="Edit" @click=${() => this._openEdit(idx, { ...item, type: "exercise" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" style="fill: var(--primary-text-color, #333);">
              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
            </svg>
          </button>
        </li>
      `;
    } else {
      return html`
        <li class="item">
          <span class="item-time">${time}</span>
          <span class="item-name">${item.food_item ?? 'Unknown'}</span>
          <span class="item-calories">${item.calories ?? 0} Cal</span>
          <button class="edit-btn" title="Edit" @click=${() => this._openEdit(idx, { ...item, type: "food" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" style="fill: var(--primary-text-color, #333);">
              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
            </svg>
          </button>
        </li>
      `;
    }
  }

  _renderModals() {
    return html`
      ${this._showEditPopup ? this._renderEditPopup() : ""}
      ${this._showAddPopup ? this._renderAddPopup() : ""}
      ${this._showAnalyzerSelect ? this._renderAnalyzerSelectModal() : ""}
      ${this._showPhotoUpload ? this._renderPhotoUploadModal() : ""}
      ${this._showPhotoReview ? this._renderPhotoReviewModal() : ""}
      ${this._renderPhotoProcessingModal()}
      ${this._showChatAssist ? this._renderChatAssistModal() : ""}
      ${this._showMissingLLMModal ? this._renderMissingLLMModal() : ""}
    `;
  }

  // ===========================================================================
  // EDIT FUNCTIONALITY
  // ===========================================================================

  _openEdit(idx, item) {
    // Parse time as HH:MM from timestamp
    let time = "";
    if (item.timestamp) {
      const d = new Date(item.timestamp);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      time = `${hh}:${mm}`;
    }
    if (item.type === "exercise") {
      this._editData = {
        ...item,
        exercise_type: item.exercise_type ?? "",
        duration_minutes: item.duration_minutes ?? 0,
        calories_burned: item.calories_burned ?? 0,
        time,
      };
    } else {
      this._editData = {
        ...item,
        food_item: item.food_item ?? "",
        calories: item.calories ?? 0,
        time,
      };
    }
    this._editIndex = idx;
    this._showEditPopup = true;
  }

  _closeEdit() {
    this._showEditPopup = false;
    this._editIndex = -1;
    this._editData = null;
  }

  _onEditInput(e, field) {
    this._editData = { ...this._editData, [field]: e.target.value };
  }

  _onEditTimeInput(e) {
    // Validate and update time in HH:MM
    const value = e.target.value;
    this._editData = { ...this._editData, time: value };
  }

  _saveEdit() {
    // Compose new timestamp with the original date and edited time (HH:MM)
    let newTimestamp = this._editData.timestamp;
    if (this._editData.time && this._editData.timestamp) {
      const oldDate = new Date(this._editData.timestamp);
      const [hh, mm] = this._editData.time.split(":");
      oldDate.setHours(Number(hh));
      oldDate.setMinutes(Number(mm));
      oldDate.setSeconds(0, 0);
      newTimestamp = toLocalISOString(oldDate);
    }
    const { time, type, ...entryToSave } = this._editData;
    let detail;
    if (type === "exercise") {
      detail = {
        entry_id: this._editData.id,
        entry_type: "exercise",
        entry: {
          ...entryToSave,
          timestamp: newTimestamp,
          duration_minutes: Number(this._editData.duration_minutes),
          calories_burned: Number(this._editData.calories_burned),
        }
      };
    } else {
      detail = {
        entry_id: this._editData.id,
        entry_type: "food",
        entry: {
          ...entryToSave,
          timestamp: newTimestamp,
          calories: Number(this._editData.calories),
        }
      };
    }
    this.dispatchEvent(new CustomEvent("edit-daily-entry", {
      detail,
      bubbles: true,
      composed: true,
    }));
    this._closeEdit();
  }

  _renderEditPopup() {
    const isExercise = this._editData.type === "exercise";
    return html`
      <div class="modal" @click=${this._closeEdit}>
        <div class="modal-content" @click=${e => e.stopPropagation()}>
          <div class="modal-header">Edit Entry</div>
          <div class="edit-grid">
            <div class="edit-label">Time</div>
            <input
              class="edit-input"
              type="time"
              .value=${this._editData.time}
              @input=${e => this._onEditTimeInput(e)}
            />
            ${isExercise ? html`
              <div class="edit-label">Exercise</div>
              <input
                class="edit-input"
                type="text"
                .value=${this._editData.exercise_type}
                @input=${e => this._onEditInput(e, "exercise_type")}
              />
              <div class="edit-label">Duration (min)</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._editData.duration_minutes}
                @input=${e => this._onEditInput(e, "duration_minutes")}
              />
              <div class="edit-label">Calories Burned</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._editData.calories_burned}
                @input=${e => this._onEditInput(e, "calories_burned")}
              />
            ` : html`
              <div class="edit-label">Item</div>
              <input
                class="edit-input"
                type="text"
                .value=${this._editData.food_item}
                @input=${e => this._onEditInput(e, "food_item")}
              />
              <div class="edit-label">Calories</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._editData.calories}
                @input=${e => this._onEditInput(e, "calories")}
              />
            `}
          </div>
          <div class="edit-actions">
            <button class="ha-btn" @click=${this._saveEdit}>Save</button>
            <button class="ha-btn" @click=${this._closeEdit}>Cancel</button>
            <button class="ha-btn error" @click=${this._deleteEdit}>Delete</button>
          </div>
        </div>
      </div>
    `;
  }

  _deleteEdit() {
    // Fire event with entry_id and entry_type for deletion
    this.dispatchEvent(new CustomEvent("delete-daily-entry", {
      detail: {
        entry_id: this._editData.id,
        entry_type: this._editData.type,
      },
      bubbles: true,
      composed: true,
    }));
    this._closeEdit();
  }

  // ===========================================================================
  // ADD ENTRY FUNCTIONALITY
  // ===========================================================================

  _openAddEntry = () => {
    this._closeAllModals();
    this._addEntryType = "food";
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    this._addData = {
      food_item: "",
      calories: 0,
      exercise_type: "",
      duration_minutes: 0,
      calories_burned: 0,
      time: `${hh}:${mm}`
    };
    this._addError = "";
    this._showAddPopup = true;
  };

  _closeAddEntry = () => {
    this._showAddPopup = false;
    this._addError = "";
  };

  _onAddTypeChange = (e) => {
    this._addEntryType = e.target.value;
    this._addError = "";
  };

  _onAddInputChange = (e, field) => {
    this._addData = { ...this._addData, [field]: e.target.value };
    this._addError = "";
  };

  _onAddTimeInput = (e) => {
    this._addData = { ...this._addData, time: e.target.value };
    this._addError = "";
  };

  _saveAddEntry = () => {
    // Validate
    if (this._addEntryType === "food") {
      if (!this._addData.food_item || !this._addData.calories) {
        this._addError = "Please enter food item and calories.";
        return;
      }
    } else {
      if (!this._addData.exercise_type || !this._addData.duration_minutes) {
        this._addError = "Please enter exercise type and duration.";
        return;
      }
    }
    // Compose timestamp using selectedDate
    let dateStr = this.selectedDate;
    if (!dateStr) {
      // fallback to today if not set
      dateStr = (new Date()).toISOString().slice(0, 10);
    }
    let timeStr = this._addData.time || "12:00";
    let timestamp = `${dateStr}T${timeStr}:00`;
    // Fire event to parent
    this.dispatchEvent(new CustomEvent("add-daily-entry", {
      detail: {
        entry_type: this._addEntryType,
        entry: this._addEntryType === "food"
          ? {
              food_item: this._addData.food_item,
              calories: Number(this._addData.calories),
              timestamp
            }
          : {
              exercise_type: this._addData.exercise_type,
              duration_minutes: Number(this._addData.duration_minutes),
              calories_burned: Number(this._addData.calories_burned),
              timestamp
            }
      },
      bubbles: true,
      composed: true,
    }));
    this._closeAddEntry();
  };

  _renderAddPopup() {
    return html`
      <div class="modal" @click=${this._closeAddEntry}>
        <div class="modal-content" @click=${e => e.stopPropagation()}>
          <div class="modal-header">Add Entry</div>
          <div style="margin-bottom: 16px;">
            <label>
              <input type="radio" name="add-type" value="food"
                .checked=${this._addEntryType === "food"}
                @change=${this._onAddTypeChange}
              /> Food
            </label>
            <label style="margin-left: 18px;">
              <input type="radio" name="add-type" value="exercise"
                .checked=${this._addEntryType === "exercise"}
                @change=${this._onAddTypeChange}
              /> Exercise
            </label>
          </div>
          <div class="edit-grid">
            <div class="edit-label">Time</div>
            <input
              class="edit-input"
              type="time"
              .value=${this._addData.time}
              @input=${this._onAddTimeInput}
            />
            ${this._addEntryType === "food" ? html`
              <div class="edit-label">Item</div>
              <input
                class="edit-input"
                type="text"
                .value=${this._addData.food_item}
                @input=${e => this._onAddInputChange(e, "food_item")}
              />
              <div class="edit-label">Calories</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._addData.calories}
                @input=${e => this._onAddInputChange(e, "calories")}
              />
            ` : html`
              <div class="edit-label">Exercise</div>
              <input
                class="edit-input"
                type="text"
                .value=${this._addData.exercise_type}
                @input=${e => this._onAddInputChange(e, "exercise_type")}
              />
              <div class="edit-label">Duration (min)</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._addData.duration_minutes}
                @input=${e => this._onAddInputChange(e, "duration_minutes")}
              />
              <div class="edit-label">Calories Burned</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._addData.calories_burned}
                @input=${e => this._onAddInputChange(e, "calories_burned")}
              />
            `}
          </div>
          ${this._addError ? html`
            <div style="color: #f44336; font-size: 0.95em; margin-bottom: 8px;">
              ${this._addError}
            </div>
          ` : ""}
          <div class="edit-actions">
            <button class="ha-btn" @click=${this._saveAddEntry}>Save</button>
            <button class="ha-btn" @click=${this._closeAddEntry}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  // ===========================================================================
  // PHOTO ANALYSIS FUNCTIONALITY
  // ===========================================================================

  _openPhotoFoodEntry = async () => {
    this._closeAllModals();
    // Fetch latest analyzers from backend
    try {
      const hass = this.hass || window?.hass;
      const authToken = hass?.connection?.options?.auth?.accessToken;
      const resp = await fetch('/api/calorie_tracker/fetch_analyzers', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await resp.json();
      this.imageAnalyzers = data.analyzers || [];
    } catch (err) {
      alert('Failed to fetch image analyzers');
      return;
    }
    if (!this.imageAnalyzers || this.imageAnalyzers.length === 0) {
      this._openMissingLLMModal('analyzers');
      return;
    }
    if (this.imageAnalyzers.length === 1) {
      this._selectedAnalyzer = this.imageAnalyzers[0];
      this._showPhotoUpload = true;
      this._photoFile = null;
      this._photoError = '';
      return;
    }
    // Multiple analyzers, show selection dialog
    this._showAnalyzerSelect = true;
    this._selectedAnalyzer = null;
    this._photoFile = null;
    this._photoError = '';
  };

  // --- Modal State Management Helper ---
  // (Moved to utility methods section above)

  _renderAnalyzerSelectModal() {
    return html`
      <div class="modal" @click=${this._closeAnalyzerSelect}>
        <div class="modal-content" @click=${e => e.stopPropagation()}>
          <div class="modal-header">Select Image Analyzer</div>
          <div style="margin-bottom: 18px;">
            ${this.imageAnalyzers.map(analyzer => html`
              <div style="margin-bottom: 8px;">
                <button class="ha-btn" style="width:100%;text-align:left;" @click=${() => this._selectAnalyzer(analyzer)}>
                  ${analyzer.name}: <span style="font-weight:normal;">${analyzer.model ?? 'Unknown'}</span>
                </button>
              </div>
            `)}
          </div>
          <div class="edit-actions">
            <button class="ha-btn" @click=${this._closeAnalyzerSelect}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _selectAnalyzer(analyzer) {
    this._selectedAnalyzer = analyzer;
    this._showAnalyzerSelect = false;
    this._showPhotoUpload = true;
    this._photoFile = null;
    this._photoError = '';
  }

  _closeAnalyzerSelect = () => {
    this._showAnalyzerSelect = false;
  };

  _renderPhotoUploadModal() {
    return html`
      <div class="modal" @click=${() => this._closePhotoUpload()}>
        <div class="modal-content" @click=${e => e.stopPropagation()}>
          <div class="modal-header">Upload Food Photo</div>
          <div style="margin-bottom: 12px;">
            <div style="font-size:1.08em;font-weight:bold;margin-bottom:8px;">
              NOTE:
              <div style="margin-left:18px;font-size:1em;font-weight:bold;">
                For paid models, standard rates apply.<br>
                Selected model must support image inputs.
              </div>
            </div>
            <div style="font-size:0.98em;margin-bottom:8px;">Analyzer: <b>${this._selectedAnalyzer?.name ?? ''}</b></div>
            <input type="file" accept="image/*" @change=${this._onPhotoFileChange} />
            ${this._photoFile ? html`<div style="margin-top:8px;font-size:0.95em;">Selected: ${this._photoFile.name}</div>` : ''}
            ${this._photoError ? html`<div style="color:#f44336;font-size:0.95em;margin-top:8px;">${this._photoError}</div>` : ''}
          </div>
          <div class="edit-actions">
            <button class="ha-btn" @click=${() => this._closePhotoUpload()} ?disabled=${this._photoLoading}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _onPhotoFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      this._photoFile = null;
      this._photoError = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      this._photoError = 'Please select an image file.';
      this._photoFile = null;
      return;
    }
    this._photoFile = file;
    this._photoError = '';

    // Show processing modal immediately and yield to event loop
    this._photoLoading = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    // Start analysis without awaiting - let it run in background
    this._submitPhotoFoodEntry().catch(err => {
      this._photoLoading = false;
      this._photoError = err?.message || 'Failed to analyze photo';
    });
  };

  async _submitPhotoFoodEntry() {
    if (!this._photoFile || !this._selectedAnalyzer) {
      this._photoError = 'Please select an analyzer and a photo';
      this._photoLoading = false;
      return;
    }

    this._photoError = '';

    try {
      // Create FormData for multipart upload (no base64 conversion needed)
      const formData = new FormData();
      formData.append('config_entry', this._selectedAnalyzer.config_entry);
      formData.append('image', this._photoFile);
      formData.append('model', this._selectedAnalyzer.model);

      const hass = this.hass || (window?.hass);
      if (!hass?.connection) {
        throw new Error('Home Assistant connection not available');
      }

      // Get auth token for API call
      const authToken = hass.connection.options?.auth?.accessToken;
      if (!authToken) {
        throw new Error('Authentication token not available');
      }

      // Make HTTP request to upload endpoint
      const response = await fetch('/api/calorie_tracker/upload_photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      this._photoLoading = false;

      if (result?.success && result?.food_items?.length > 0) {
        // Show review modal for detected items
        this._showPhotoUpload = false;
        this._photoReviewItems = result.food_items.map(item => ({
          ...item,
          selected: true
        }));
        this._photoReviewRaw = result.raw_result;
        this._photoReviewAnalyzer = this._selectedAnalyzer.name;
        this._showPhotoReview = true;
        this._selectedAnalyzer = null;
        this._photoFile = null;
        this._photoError = '';
      } else {
        this._photoError = result?.error || 'Could not analyze photo';
      }
    } catch (err) {
      this._photoLoading = false;
      this._photoError = err?.message || 'Failed to analyze photo';
    }
  }

  // --- Photo Review Modal Logic ---
  _renderPhotoReviewModal() {
    if (!this._showPhotoReview || !this._photoReviewItems) return '';
    return html`
      <div class="modal" @click=${() => this._closePhotoReview()}>
        <div class="modal-content" @click=${e => e.stopPropagation()} style="min-width:340px;max-width:98vw;">
          <div class="modal-header">Review Detected Food Items</div>
          <div style="margin-bottom:12px;font-size:0.98em;">
            Analyzer: <b>${this._photoReviewAnalyzer ?? ''}</b>
          </div>
          <form @submit=${e => { e.preventDefault(); this._confirmPhotoReview(); }}>
            <div style="max-height:260px;overflow-y:auto;">
              ${this._photoReviewItems.map((item, idx) => html`
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                  <input type="checkbox" .checked=${item.selected} @change=${e => this._togglePhotoReviewItem(idx, e)} />
                  <input class="edit-input" style="flex:2;" type="text" .value=${item.food_item} @input=${e => this._editPhotoReviewItem(idx, 'food_item', e)} placeholder="Food item" />
                  <input class="edit-input" style="width:80px;" type="number" min="0" .value=${item.calories} @input=${e => this._editPhotoReviewItem(idx, 'calories', e)} placeholder="Calories" />
                </div>
              `)}
            </div>
            <div class="edit-actions" style="margin-top:18px;">
              <button class="ha-btn" type="submit">Add Selected</button>
              <button class="ha-btn" type="button" @click=${this._closePhotoReview}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  _togglePhotoReviewItem(idx, e) {
    const items = [...this._photoReviewItems];
    items[idx] = { ...items[idx], selected: e.target.checked };
    this._photoReviewItems = items;
  }

  _editPhotoReviewItem(idx, field, e) {
    const items = [...this._photoReviewItems];
    items[idx] = { ...items[idx], [field]: field === 'calories' ? Number(e.target.value) : e.target.value };
    this._photoReviewItems = items;
  }

  _closePhotoReview = () => {
    this._showPhotoReview = false;
    this._photoReviewItems = null;
    this._photoReviewRaw = null;
    this._photoReviewAnalyzer = null;
  };

  _closePhotoUpload = () => {
    this._showPhotoUpload = false;
    this._photoFile = null;
    this._photoError = '';
    this._photoLoading = false;
  };

  _confirmPhotoReview() {
    // Add all selected items as food entries
    const selected = (this._photoReviewItems || []).filter(i => i.selected && i.food_item && i.calories !== undefined);
    if (selected.length === 0) {
      this._closePhotoReview();
      return;
    }
    // Compose timestamp using selectedDate and now's time for each
    let dateStr = this.selectedDate;
    if (!dateStr) {
      dateStr = (new Date()).toISOString().slice(0, 10);
    }

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${dateStr}T${hh}:${mm}:00`;

    selected.forEach((item, idx) => {
      this.dispatchEvent(new CustomEvent('add-daily-entry', {
        detail: {
          entry_type: 'food',
          entry: {
            food_item: item.food_item,
            calories: Number(item.calories),
            timestamp,
            analyzer: this._photoReviewAnalyzer,
            raw_result: this._photoReviewRaw,
          }
        },
        bubbles: true,
        composed: true,
      }));
    });
    this._closePhotoReview();
  }

  _renderPhotoProcessingModal() {
    if (!this._photoLoading) return '';
    return html`
      <div class="modal">
        <div class="modal-content" style="text-align:center;">
          <div class="modal-header">Analyzing Photo...</div>
          <div style="margin:24px 0;">
            <svg width="48" height="48" viewBox="0 0 24 24" style="animation: spin 2s linear infinite;">
              <circle cx="12" cy="12" r="10" stroke="var(--primary-color, #03a9f4)" stroke-width="2" fill="none" stroke-dasharray="62.83" stroke-dashoffset="15.71">
                <animate attributeName="stroke-dashoffset" dur="2s" values="62.83;0;62.83" repeatCount="indefinite"/>
              </circle>
            </svg>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
          <div style="font-size:1em;">Please wait while we analyze your food photo.</div>
        </div>
      </div>
    `;
  }

  // ===========================================================================
  // MISSINGLLM MODAL FUNCTIONALITY
  // ===========================================================================

  _openMissingLLMModal(type) {
    this._closeAllModals();
    this._missingLLMModalType = type;
    this._showMissingLLMModal = true;
  }

  _closeMissingLLMModal = () => {
    this._showMissingLLMModal = false;
    this._missingLLMModalType = null;
  };

  _renderMissingLLMModal() {
    if (!this._showMissingLLMModal) return '';

    const isAnalyzers = this._missingLLMModalType === 'analyzers';
    const title = isAnalyzers ? 'No Image Analyzer Found' : 'No Conversation Agent Found';

    const integrations = [
      { name: 'Anthropic Claude', url: 'https://www.home-assistant.io/integrations/anthropic' },
      { name: 'Azure OpenAI Conversation', url: 'https://github.com/joselcaguilar/azure-openai-ha' },
      { name: 'Google Generative AI Conversation', url: 'https://www.home-assistant.io/integrations/google_generative_ai_conversation' },
      { name: 'OpenAI Conversation', url: 'https://www.home-assistant.io/integrations/openai_conversation' },
      { name: 'Ollama', url: 'https://www.home-assistant.io/integrations/ollama' }
    ];

    return html`
      <div class="modal" @click=${this._closeMissingLLMModal}>
        <div class="modal-content" @click=${e => e.stopPropagation()} style="max-width: 480px;">
          <div class="modal-header">${title}</div>
          <div style="margin-bottom: 16px; line-height: 1.5;">
            ${isAnalyzers
              ? html`To analyze food photos, you need one of the following supported conversation agents:`
              : html`To use the chat assistant, you need a conversation agent integration. Here are a few options:`
            }
          </div>
          <ul style="margin: 0 0 20px 20px; padding: 0; line-height: 1.6;">
            ${integrations.map(integration => html`
              <li style="margin-bottom: 8px;">
                <a
                  href="${integration.url}"
                  target="_blank"
                  style="
                    color: var(--primary-color, #03a9f4);
                    text-decoration: none;
                    font-weight: 500;
                  "
                  @mouseover=${e => e.target.style.textDecoration = 'underline'}
                  @mouseout=${e => e.target.style.textDecoration = 'none'}
                >
                  ${integration.name}
                </a>
              </li>
            `)}
          </ul>
          <div style="font-size: 0.9em; color: var(--secondary-text-color, #666); margin-bottom: 16px; line-height: 1.4;">
            ${isAnalyzers
              ? html`Note: For paid services, standard API rates apply.<br><br>
                     If you would like another image analyzer supported, <a href="https://github.com/kgstorm/home-assistant-calorie-tracker/issues" target="_blank" style="color: var(--primary-color, #03a9f4); text-decoration: none;">submit an issue here</a>.`
              : html`Note: For paid services, standard API rates apply.`
            }
          </div>
          <div class="edit-actions">
            <button class="ha-btn" @click=${this._closeMissingLLMModal}>Close</button>
          </div>
        </div>
      </div>
    `;
  }

  // ===========================================================================
  // CHAT ASSISTANT FUNCTIONALITY
  // ===========================================================================

  _openChatAssist = async () => {
    this._logToServer('debug', 'Chat assist opened.');
    this._closeAllModals();

    // Reset state
    this._chatHistory = [];
    this._chatInput = "";
    this._conversationId = null;

    // Fetch pipelines and agents in the background
    await this._fetchPipelinesAndAgents();

    // Check if any LLM agents are available
    if (!this._conversationAgents || this._conversationAgents.length === 0) {
      this._openMissingLLMModal('agents');
      return;
    }

    this._showChatAssist = true;
  };

  _fetchPipelinesAndAgents = async () => {
    try {
      const hass = this.hass || window?.hass;
      if (hass?.connection) {
        // Fetch pipelines
        const pipelines = await hass.connection.sendMessagePromise({
          type: "assist_pipeline/pipeline/list"
        });
        this._assistPipelines = pipelines.pipelines || [];
        let preferredId = pipelines.preferred_pipeline;
        if (preferredId) {
          this._selectedPipeline = this._assistPipelines.find(p => p.id === preferredId);
        }
        if (!this._selectedPipeline && this._assistPipelines.length > 0) {
          this._selectedPipeline = this._assistPipelines[0];
        }

        // Fetch conversation agents
        const agentsResp = await hass.connection.sendMessagePromise({
          type: "conversation/agent/list"
        });

        // Filter out Home Assistant agent (id: 'homeassistant')
        this._conversationAgents = (agentsResp.agents || []).filter(a => {
          return a.id !== 'conversation.home_assistant';
        });

        // Default to agent matching preferred pipeline's conversation_engine
        let defaultAgentId = this._selectedPipeline?.conversation_engine;
        this._selectedAgent = this._conversationAgents.find(a => a.id === defaultAgentId) || this._conversationAgents[0] || null;
      } else {
        this._assistPipelines = [];
        this._selectedPipeline = null;
        this._conversationAgents = [];
        this._selectedAgent = null;
      }
    } catch (err) {
      console.log('Failed to fetch pipelines or agents:', err);
      this._assistPipelines = [];
      this._selectedPipeline = null;
      this._conversationAgents = [];
      this._selectedAgent = null;
    }
    this.requestUpdate();
  };

  _closeChatAssist = () => {
    this._showChatAssist = false;
  };

  _renderChatAssistModal() {
    if (!this._showChatAssist) return '';

    // Detect theme
    let isDark = false;
    if (this.hass && this.hass.themes && this.hass.selectedTheme) {
      const theme = this.hass.selectedTheme;
      isDark = theme?.theme?.toLowerCase().includes("dark") || theme?.dark === true;
    } else if (window.matchMedia) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    const bg = 'var(--card-background-color)';
    const fg = 'var(--primary-text-color)';
    const border = 'var(--divider-color)';
    const chatBg = isDark
      ? 'var(--ha-card-background, #23272e)'
      : 'var(--ha-card-background, #fafbfc)';

    return html`
      <div class="modal" @click=${this._closeChatAssist}>
        <div
          class="modal-content"
          @click=${e => e.stopPropagation()}
          style="
            min-width:340px;
            max-width:90vw;
            max-height:600px;
            height:540px;
            display:flex;
            flex-direction:column;
          "
        >
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <button
              @click=${this._closeChatAssist}
              style="background:none;border:none;cursor:pointer;padding:4px;line-height:0;color:${fg};"
              title="Close"
              tabindex="0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" style="fill:currentColor;">
                <path class="primary-path" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
              </svg>
            </button>
            <span style="font-size:1.15em;font-weight:500;margin-right:8px;">Agent</span>
            <select class="edit-input" style="flex:1;min-width:0;background:${bg};color:${fg};border:1px solid ${border};" @change=${this._onAgentChange}>
              ${this._conversationAgents.length > 0 ? this._conversationAgents.map(agent => html`
                <option value=${agent.id} .selected=${agent.id === this._selectedAgent?.id}>
                  ${agent.name}
                </option>
              `) : html`
                <option disabled>No conversation agents available</option>
              `}
            </select>
          </div>
          <div style="flex:1;overflow-y:auto;margin-bottom:12px;border:1px solid ${border};padding:8px 6px 8px 6px;background:${chatBg};">
            ${this._chatHistory.length === 0
              ? html`<div style="color:${isDark ? '#aaa' : '#888'};text-align:center;">No conversation yet.</div>`
              : this._chatHistory.map(msg => html`
                  <div style="margin-bottom:8px;">
                    <div style="font-weight:bold;color:${isDark ? '#90caf9' : '#1976d2'};">${msg.role === "user" ? "You" : "Assistant"}:</div>
                    <div style="white-space:pre-line;">${msg.text}</div>
                  </div>
                `)
            }
          </div>
          <div style="margin-bottom:12px;text-align:center;">
            <textarea
              class="edit-input"
              placeholder="Type command here..."
              rows="3"
              style="width:100%;resize:vertical;background:${bg};color:${fg};border:1px solid ${border};"
              id="chat-text-input"
              .value=${this._chatInput}
              @input=${e => this._onChatInput(e)}
              @keydown=${e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  this._processChatCommand();
                }
              }}
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  _onChatInput(e) {
    const value = e.target.value;
    // If the last character is a newline, treat as submit
    if (value.endsWith('\n')) {
      this._chatInput = value.trim();
      this._processChatCommand();
      // Remove the newline from the textarea
      e.target.value = '';
    } else {
      this._chatInput = value;
    }
  }

  _onAgentChange = (e) => {
    const agentId = e.target.value;
    this._selectedAgent = this._conversationAgents.find(a => a.id === agentId) || null;
  };

  _processChatCommand = async (commandArg) => {
    // Accepts optional commandArg for direct input
    const textInput = this.shadowRoot.querySelector('#chat-text-input');
    const command = typeof commandArg === "string"
      ? commandArg.trim()
      : (textInput ? textInput.value.trim() : "");
    if (!command) {
      this._chatHistory = [...this._chatHistory, { role: "assistant", text: "Please enter a command." }];
      return;
    }
    // Only add to history if not already added
    if (!commandArg) {
      this._chatHistory = [...this._chatHistory, { role: "user", text: command }];
    }
    this._chatInput = "";
    try {
      const hass = this.hass || window?.hass;
      if (!hass?.connection) throw new Error('Home Assistant connection not available');
      const conversationRequest = {
        type: "conversation/process",
        text: command,
        conversation_id: this._conversationId,
        language: hass.language || 'en'
      };
      if (this._selectedAgent?.id) {
        conversationRequest.agent_id = this._selectedAgent.id;
      }
      const response = await hass.connection.sendMessagePromise(conversationRequest);

      // Store the conversation ID for future messages
      if (response.conversation_id) {
        this._conversationId = response.conversation_id;
      }

      let speechText = 'Command processed successfully';
      if (response.response?.speech?.plain?.speech) {
        speechText = response.response.speech.plain.speech;
      } else if (response.response?.text) {
        speechText = response.response.text;
      } else if (typeof response.response === 'string') {
        speechText = response.response;
      } else if (response.response && typeof response.response === 'object') {
        if (response.response.profile) {
          const profile = response.response.profile;
          const remaining = profile.daily_goal - profile.calories_today;
          speechText = `Logged successfully for ${profile.spoken_name}. You have ${remaining} calories remaining today.`;
        } else {
          speechText = JSON.stringify(response.response);
        }
      }
      this._chatHistory = [...this._chatHistory, { role: "assistant", text: speechText }];
    } catch (error) {
      this._chatHistory = [...this._chatHistory, { role: "assistant", text: `Failed to process command: ${error.message}` }];
    }
  };
}

// =============================================================================
// COMPONENT REGISTRATION
// =============================================================================

customElements.define('daily-data-card', DailyDataCard);
