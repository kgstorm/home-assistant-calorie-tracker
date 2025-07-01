import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

function toLocalISOString(date) {
  // Returns YYYY-MM-DDTHH:mm:ss (local time, no Z)
  const pad = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

class DailyDataCard extends LitElement {
  static properties = {
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
  };

  static styles = [
    css`
      .ha-btn {
        margin-left: 8px;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: var(--ha-button-border-radius, 4px);
        padding: 8px 18px;
        font-size: 1em;
        cursor: pointer;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
        transition: background 0.2s;
        box-shadow: var(--ha-button-box-shadow, none);
        min-width: 64px;
        min-height: 36px;
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
        gap: 4px;
      }
      .ha-btn.add-entry-btn:hover {
        background: var(--primary-color-dark, #0288d1);
      }
    `
  ];

  constructor() {
    super();
    this._editIndex = -1;
    this._editData = null;
    this._showEditPopup = false;
  }

  render() {
    const foodEntries = this.log?.food_entries ?? [];
    const exerciseEntries = this.log?.exercise_entries ?? [];

    // Determine the date to display in the header
    let dateStr = "";
    if (this.selectedDate) {
      const d = new Date(this.selectedDate);
      dateStr = `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString(undefined, { month: "short" })} ${d.getFullYear()}`;
    } else {
      const d = new Date();
      dateStr = `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString(undefined, { month: "short" })} ${d.getFullYear()}`;
    }

    const renderEntry = (item, idx, type) => {
      let time = "";
      if (item.timestamp) {
        const d = new Date(item.timestamp);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        time = `${hh}:${mm}`;
      }
      if (type === "exercise") {
        return html`
          <li class="item">
            <span class="item-time">${time}</span>
            <span class="item-name">${item.exercise_type ?? 'Exercise'}</span>
            <span class="item-calories">-${item.calories_burned ?? 0} Cal</span>
            <button class="edit-btn" title="Edit" @click=${() => this._openEdit(idx, { ...item, type: "exercise" })}>
              ✏️
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
              ✏️
            </button>
          </li>
        `;
      }
    };

    const hasExercise = exerciseEntries.length > 0;
    const hasFood = foodEntries.length > 0;

    return html`
      <div class="daily-data-card">
        <div class="header" style="display:flex;align-items:center;justify-content:space-between;">
          <span>Daily Data for ${dateStr}</span>
          <button class="ha-btn add-entry-btn" title="Add Entry" @click=${this._openAddEntry}>
            <span style="font-size: 1.2em; font-weight: bold; margin-right: 6px;">＋</span>
            Add Entry
          </button>
        </div>
        ${!hasExercise && !hasFood
          ? html`<div class="no-items">No items logged for today.</div>`
          : html`
              ${hasExercise ? html`
                <div class="table-header" style="margin-top:8px;">Exercise</div>
                <ul class="item-list">
                  ${exerciseEntries.map((item, idx) => renderEntry(item, idx, "exercise"))}
                </ul>
              ` : ""}
              ${hasFood ? html`
                <div class="table-header" style="margin-top:16px;">Food Log</div>
                <ul class="item-list">
                  ${foodEntries.map((item, idx) => renderEntry(item, idx, "food"))}
                </ul>
              ` : ""}
            `
        }
        ${this._showEditPopup ? this._renderEditPopup() : ""}
        ${this._showAddPopup ? this._renderAddPopup() : ""}
      </div>
    `;
  }

  _openEdit(idx, item) {
    // Parse time as HH:MM from timestamp
    let time = "";
    if (item.timestamp) {
      const d = new Date(item.timestamp);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      time = `${hh}:${mm}`;
    }
    this._editIndex = idx;
    this._editData = {
      ...item,
      food_item: item.food_item ?? "",
      calories: item.calories ?? 0,
      time,
    };
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
    // Fire event with updated entry, entry_id, and entry_type
    const { time, type, ...entryToSave } = this._editData;
    this.dispatchEvent(new CustomEvent("edit-daily-entry", {
      detail: {
        entry_id: this._editData.id,
        entry_type: this._editData.type,
        entry: {
          ...entryToSave,
          timestamp: newTimestamp,
          calories: Number(this._editData.calories),
        }
      },
      bubbles: true,
      composed: true,
    }));
    this._closeEdit();
  }

  _renderEditPopup() {
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

  _openAddEntry = () => {
    this._addEntryType = "food";
    this._addData = {
      food_item: "",
      calories: 0,
      exercise_type: "",
      duration_minutes: 0,
      calories_burned: 0,
      time: "12:00"
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
}

// No changes needed for device linking/unlinking in this file.

customElements.define('daily-data-card', DailyDataCard);