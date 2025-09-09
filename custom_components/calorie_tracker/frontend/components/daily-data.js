import { LitElement, html, css } from 'https://unpkg.com/lit@2/index.js?module';

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

function parseLocalDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateString(dateStr) {
  const d = dateStr ? parseLocalDateString(dateStr) : new Date();
  return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString(undefined, { month: "short" })} ${d.getFullYear()}`;
}

// =============================================================================
// ICONS (inline SVGs, theme-aware via currentColor)
// =============================================================================

const iconPlate = (size = 24) => html`
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- Plate (slightly smaller to create visual gap) -->
    <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5.25" fill="currentColor" opacity="0.12"/>
    <!-- Fork just left of the plate (outside left edge at ~3.5) -->
    <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <!-- Tines -->
      <path d="M2.6 6.2 V10.6"/>
      <path d="M3.4 6.2 V10.6"/>
      <path d="M4.2 6.2 V10.6"/>
      <!-- Handle -->
      <path d="M3.4 10.6 V18"/>
    </g>
    <!-- Knife just right of the plate (outside right edge at ~20.5) -->
    <g stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Blade -->
      <path d="M21.0 6 L22.8 9 L21.0 12"/>
      <!-- Handle -->
      <path d="M21.0 12 V18"/>
    </g>
  </svg>
`;

const iconCaliper = (size = 24) => html`
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <!-- Single angled caliper arm -->
      <path d="M6 18 L16.5 7"/>
      <!-- Fixed jaw near the tip -->
      <path d="M16.5 7 L19 8.5"/>
      <!-- Secondary small jaw -->
      <path d="M14.5 9 L16.2 10.2"/>
      <!-- Measurement ticks along the arm -->
      <path d="M9 15 L7.8 14"/>
      <path d="M11 13 L9.8 12"/>
      <!-- Hinge/pin at the tip -->
      <circle cx="16.5" cy="7" r="1.2"/>
    </g>
  </svg>
`;

const iconScale = (size = 24) => html`
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <!-- Scale platform -->
      <rect x="2" y="18" width="20" height="2" rx="1"/>
      <!-- Scale body -->
      <rect x="10" y="12" width="4" height="6"/>
      <!-- Scale display -->
      <rect x="8" y="8" width="8" height="4" rx="1"/>
      <!-- Display numbers -->
      <path d="M10 10.5h4M10 11.5h2"/>
      <!-- Scale feet -->
      <circle cx="4" cy="20" r="1"/>
      <circle cx="20" cy="20" r="1"/>
    </g>
  </svg>
`;

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
    _editError: { type: String, state: true },
    _addEntryType: { type: String, state: true },
    _showAddPopup: { type: Boolean, state: true },
    _addData: { attribute: false, state: true },
    _addError: { type: String, state: true },
    imageAnalyzers: { attribute: false },
    _showAnalyzerSelect: { type: Boolean, state: true },
    _showAnalysisTypeSelect: { type: Boolean, state: true },
    _selectedAnalysisType: { type: String, state: true },
    _showPhotoUpload: { type: Boolean, state: true },
    _showPhotoReview: { type: Boolean, state: true },
    _photoLoading: { type: Boolean, state: true },
    _photoError: { type: String, state: true },
    _showChatAssist: { type: Boolean, state: true },
    _chatHistory: { attribute: false, state: true },
    _chatInput: { attribute: false, state: true },
    _showMissingLLMModal: { type: Boolean, state: true },
    _missingLLMModalType: { type: String, state: true },
    _showMetrics: { type: Boolean, state: true },
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
        padding: 6px 0;
        margin: 0;
        width: 100%;
        box-sizing: border-box;
        max-width: 420px; /* Add a max-width for desktop */
        margin-left: auto;
        margin-right: auto;
        position: relative;
  /* Removed z-index to prevent stacking context that could trap internal fixed modals */
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
      @media (min-width: 370px) {
        .header-text {
          flex-direction: row;
          align-items: center;
          gap: 4px;
        }
      }
      .baseline-burn-label .long-label { display: none; }
      .baseline-burn-label .short-label { display: inline; }
      @media (min-width: 420px) {
        .baseline-burn-label .long-label { display: inline; }
        .baseline-burn-label .short-label { display: none; }
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
        font-size: 14px;
        padding: 1px 4px;
        border-radius: 4px;
        transition: background 0.2s;
        margin-left: 2px;
      }
      .edit-btn:hover {
        background: var(--primary-color-light, #e3f2fd);
      }
      .measurements-list .edit-btn {
        height: 22px;
        min-height: 22px;
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
        z-index: var(--ct-modal-z, 1500);
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }
      .modal.chat-assist {
        z-index: calc(var(--ct-modal-z, 1500) + 50);
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
      .analysis-type-btn {
        width: 100%;
        text-align: left;
        padding: 16px;
        margin-bottom: 12px;
        background: var(--card-background-color, #fff);
        border: 2px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .analysis-type-btn:hover {
        border-color: var(--primary-color, #03a9f4);
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
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

      /* Analysis Type Selection Modal */
      .analysis-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.32);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .analysis-modal-content {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        padding: 24px;
        border-radius: var(--ha-card-border-radius, 12px);
        min-width: 350px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.2));
        text-align: left;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }

      .analysis-modal-header {
        font-size: 1.25em;
        font-weight: 500;
        margin-bottom: 18px;
        color: var(--primary-text-color, #212121);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding-bottom: 8px;
      }

      .analysis-modal-body {
        margin: 20px 0;
      }

      .analysis-modal-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .ha-btn.secondary {
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color, #212121);
      }

      .ha-btn.secondary:hover {
        background: var(--divider-color, #e0e0e0);
      }

      /* Responsive modal for small screens */
      @media (max-width: 480px) {
        .analysis-modal-content {
          min-width: 0;
          max-width: 92vw;
          max-height: 85vh;
          padding: 16px;
          margin: 8px;
        }
        .analysis-modal-header {
          font-size: 1.1em;
          margin-bottom: 16px;
        }
      }

      /* Measurements section styles */
      .measurements-list .measurement-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 8px;
        align-items: center;
        padding: 2px 0;
        border-bottom: none;
        font-size: 12px;
      }
      .measurement-label {
        font-weight: normal;
        color: var(--primary-text-color, #333);
      }
      .measurement-value {
        color: var(--secondary-text-color, #666);
        font-size: 12px;
        text-align: right;
        min-width: 80px;
      }
      .macro-line {
        padding: 0 16px;
      }
      .calculation-item {
        grid-template-columns: 1fr auto auto !important;
      }
      .calculation-item .edit-btn {
        display: none;
      }

      .metrics-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        color: var(--secondary-text-color, #666);
        padding: 0 16px 4px 16px;
        border-bottom: 1px solid var(--divider-color, #eee)
      }
      .metrics-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--secondary-text-color, #666);
      }
      .metrics-toggle-btn {
        background: none;
        border: none;
        font-size: 14px;
        cursor: pointer;
        padding: 2px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .metrics-toggle-btn:hover {
        background: var(--primary-color-light, #e3f2fd);
      }
    `
  ];

  // ===========================================================================
  // CONSTRUCTOR & INITIALIZATION
  // ===========================================================================

  constructor() {
    super();
    this._initializeState();
    this._showMetrics = window.matchMedia('(min-width: 600px)').matches;
    this._mediaQuery = window.matchMedia('(min-width: 600px)');
    this._userToggledMetrics = false;
    this._mediaQueryListener = (e) => {
      if (!this._userToggledMetrics) {
        this._showMetrics = e.matches;
        this.requestUpdate();
      }
    };
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
    this._rememberAnalyzerChoice = false;

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
    // Validation errors
    this._editError = "";
  }

  connectedCallback() {
    super.connectedCallback();
    this._mediaQuery.addEventListener('change', this._mediaQueryListener);
    this._showMetrics = this._mediaQuery.matches;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._mediaQuery.removeEventListener('change', this._mediaQueryListener);
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

  _sanitizeDecimal(str) {
    if (str == null) return '';
    // Keep only digits and at most one decimal point
    let cleaned = String(str).replace(/[^0-9.]/g, '');
    const first = cleaned.indexOf('.');
    if (first !== -1) {
      // Remove subsequent dots
      cleaned = cleaned.slice(0, first + 1) + cleaned.slice(first + 1).replace(/\./g, '');
    }
    // Prevent leading zeros like 00 unless immediately followed by '.'
    if (/^0\d/.test(cleaned)) {
      cleaned = cleaned.replace(/^0+/, '0');
    }
    return cleaned;
  }

  _isValidNumberStr(v) {
    return v !== undefined && v !== null && v !== '' && !isNaN(Number(v));
  }

  _validateMacroCalories(totalCalories, p, c, f, a, setError, silent=false) {
    if (!this.profile?.attributes?.track_macros) return true; // skip if macros not tracked
    if (!totalCalories || isNaN(Number(totalCalories))) return true; // nothing to compare
    const cal = Number(totalCalories);
    // Macro calorie factors
    const pCal = this._isValidNumberStr(p) ? Number(p) * 4 : 0;
    const cCal = this._isValidNumberStr(c) ? Number(c) * 4 : 0;
    const fCal = this._isValidNumberStr(f) ? Number(f) * 9 : 0;
    const aCal = this._isValidNumberStr(a) ? Number(a) * 7 : 0; // alcohol
    const macroSum = pCal + cCal + fCal + aCal;
    if (macroSum === 0) return true; // nothing to check
    // Allow up to 10% over OR within 20 calories for low-calorie foods
    const tolerance = Math.max(cal * 0.1, 20);
    if (macroSum > cal + tolerance) {
      const msg = `Calories from macros (${Math.round(macroSum)}) exceed total calories (${cal})`;
      if (!silent) setError(msg);
      else setError && setError(msg);
      return false;
    }
    return true;
  }

  _closeAllModals() {
    this._showEditPopup = false;
    this._showAddPopup = false;
    this._showAnalyzerSelect = false;
    this._showAnalysisTypeSelect = false;
    this._showPhotoUpload = false;
    this._showPhotoReview = false;
    this._showChatAssist = false;
    this._showMissingLLMModal = false;
  }

  _toggleMetrics() {
    this._userToggledMetrics = true;
    this._showMetrics = !this._showMetrics;
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
          <span>Data for</span>
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
      <button class="ha-btn add-entry-btn" title="Photo Analysis (Food or Body Fat)" @click=${this._openPhotoAnalysis}>
        <svg width="22" height="22" viewBox="0 0 16 16" style="vertical-align:middle;fill:#fff;">
          <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
          <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
        </svg>
      </button>
    `;
  }

  _renderContent(hasExercise, hasFood, exerciseEntries, foodEntries) {
    return html`
      ${this._renderMeasurementsSection()}
      ${hasExercise ? this._renderExerciseSection(exerciseEntries) : ""}
      ${hasFood ? this._renderFoodSection(foodEntries) : ""}
      ${!hasExercise && !hasFood ? html`<div class="no-items" style="margin-top: 16px;">No food or exercise entries logged for today.</div>` : ""}
    `;
  }

  _renderExerciseSection(exerciseEntries) {
    // Calculate total exercise calories burned
    const totalBurned = exerciseEntries.reduce((sum, entry) => sum + (Number(entry.calories_burned) || 0), 0);
    return html`
      <div class="table-header" style="margin-top:8px; display: flex; align-items: center; justify-content: space-between;">
        <span>Exercise</span>
        <span style="font-size: 0.98em; color: var(--secondary-text-color, #666); font-weight: 500;">-${totalBurned} Cal</span>
      </div>
      <ul class="item-list">
        ${exerciseEntries.map((item, idx) => this._renderEntry(item, idx, "exercise"))}
      </ul>
    `;
  }

  _renderMeasurementsSection() {
    const attrs = this.profile?.attributes ?? {};
    const weightUnit = attrs.weight_unit || "lbs";

    // Get weight and body fat from the daily log for the selected date, fallback to profile
    const logWeight = this.log?.weight;
    const profileWeight = attrs.current_weight;
    const currentWeight = logWeight ?? profileWeight ?? null;

    const logBodyFat = this.log?.body_fat_pct;
    const profileBodyFat = attrs.body_fat_percentage;
    const currentBodyFat = logBodyFat ?? profileBodyFat ?? null;

    // Get BMR and NEAT combined value from the daily log for the selected date, fallback to profile
    const logBmrAndNeat = this.log?.bmr_and_neat;
    const profileBmrAndNeat = this.profile?.attributes?.bmr_and_neat;
    const bmrAndNeat = logBmrAndNeat ?? profileBmrAndNeat ?? null;

  // Macros: protein (p), carbs (c), fat (f), alcohol (a)
  const macros = this.log?.macros ?? null;
  const macrosEnabled = Boolean(this.profile?.attributes?.track_macros);
  const protein = macros ? Number(macros.p ?? macros.protein ?? 0) : 0;
  const carbs = macros ? Number(macros.c ?? macros.carbs ?? 0) : 0;
  const fat = macros ? Number(macros.f ?? macros.fat ?? 0) : 0;
  const alcohol = macros ? Number(macros.a ?? macros.alcohol ?? 0) : 0;

  // Calculate calories from each macro and percentages
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  const alcoholCals = alcohol * 7;
  const totalMacroCals = proteinCals + carbsCals + fatCals + alcoholCals;

  const proteinPercent = totalMacroCals > 0 ? Math.round((proteinCals / totalMacroCals) * 100) : 0;
  const carbsPercent = totalMacroCals > 0 ? Math.round((carbsCals / totalMacroCals) * 100) : 0;
  const fatPercent = totalMacroCals > 0 ? Math.round((fatCals / totalMacroCals) * 100) : 0;
  const alcoholPercent = totalMacroCals > 0 ? Math.round((alcoholCals / totalMacroCals) * 100) : 0;

  const shouldShowMacros = macrosEnabled;

    // Arrow SVGs with theme-aware color (inherits text color)
    const arrowDown = html`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;">
        <path class="primary-path" d="M7.41,8.58L12,13.17l4.59-4.59L18,10l-6,6-6-6z"/>
      </svg>
    `;
    const arrowUp = html`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;">
        <path class="primary-path" d="M7.41,15.41L12,10.83l4.59,4.58L18,14l-6-6-6,6z"/>
      </svg>
    `;

    return html`
      ${shouldShowMacros ? html`
        <style>
          .macro-line .fat-grams {
            display: inline;
          }
          .macro-line .fat-percent {
            display: none;
          }
          .macro-line .protein-percent,
          .macro-line .carbs-percent {
            display: inline;
          }

          @media (max-width: 450px) {
            .macro-line .fat-grams {
              display: inline;
            }
            .macro-line .fat-percent {
              display: none;
            }
            .macro-line .protein-percent,
            .macro-line .carbs-percent {
              display: none;
            }
          }
        </style>
        <div class="macro-line" style="margin-top:8px; font-size:0.98em; color: var(--secondary-text-color, #666);">
          Protein: ${protein}g<span class="protein-percent">${proteinPercent > 0 ? ` (${proteinPercent}%)` : ''}</span>&nbsp;&nbsp;&nbsp;Carbs: ${carbs}g<span class="carbs-percent">${carbsPercent > 0 ? ` (${carbsPercent}%)` : ''}</span>&nbsp;&nbsp;&nbsp;Fat: <span class="fat-grams">${fat}g${fatPercent > 0 ? ` (${fatPercent}%)` : ''}</span><span class="fat-percent">${fatPercent > 0 ? `${fatPercent}%` : '0%'}</span>
        </div>
      ` : ''}

      <div class="table-header" style="margin-top:8px; display:flex; align-items:center; gap:0; justify-content:flex-start; border-bottom:1px solid var(--divider-color, #eee);">
        <span class="metrics-title" style="display: flex; align-items: center; gap: 6px;">
          Body metrics
          <button
            class="metrics-toggle-btn"
            @click=${() => this._toggleMetrics()}
            title="Show/hide body metrics"
            aria-label="Show/hide body metrics"
            style="margin-left: 6px; color: inherit; vertical-align: middle; padding: 0 2px;"
          >
            ${this._showMetrics ? arrowUp : arrowDown}
          </button>
        </span>
      </div>
      <div ?hidden=${!this._showMetrics}>
        <ul class="item-list measurements-list">
          <li class="item measurement-item">
            <span class="measurement-label">Weight</span>
            <span class="measurement-value">
              ${currentWeight ? `${currentWeight} ${weightUnit}` : 'Not set'}
            </span>
            <button class="edit-btn" title="Edit Weight" @click=${this._editWeight}>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.06,6.18L3,17.25V21H6.75L17.81,9.93L14.06,6.18Z" fill="#FFD700"/>
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87L20.71,7.04Z" fill="#FF6B6B"/>
              </svg>
            </button>
          </li>
          <li class="item measurement-item">
            <span class="measurement-label">Body Fat</span>
            <span class="measurement-value">
              ${currentBodyFat ? `${currentBodyFat.toFixed(1)}%` : 'Not set'}
            </span>
            <button class="edit-btn" title="Edit Body Fat" @click=${this._editBodyFat}>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.06,6.18L3,17.25V21H6.75L17.81,9.93L14.06,6.18Z" fill="#FFD700"/>
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87L20.71,7.04Z" fill="#FF6B6B"/>
              </svg>
            </button>
          </li>
          ${bmrAndNeat ? html`
            <li class="item measurement-item calculation-item">
              <span class="measurement-label baseline-burn-label">
                <span class="short-label">Baseline Calorie Burn</span>
                <span class="long-label">Baseline Calorie Burn (excluding workouts)</span>
              </span>
              <span class="measurement-value">${Math.round(bmrAndNeat)} Cal</span>
              <span></span>
            </li>
          ` : ''}
        </ul>
      </div>
    `;
  }

  _renderFoodSection(foodEntries) {
    // Calculate total food calories
    const totalCalories = foodEntries.reduce((sum, entry) => sum + (Number(entry.calories) || 0), 0);
    return html`
      <div class="table-header" style="margin-top:16px; display: flex; align-items: center; justify-content: space-between;">
        <span>Food Log</span>
        <span style="font-size: 0.98em; color: var(--secondary-text-color, #666); font-weight: 500;">${totalCalories} Cal</span>
      </div>
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
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.06,6.18L3,17.25V21H6.75L17.81,9.93L14.06,6.18Z" fill="#FFD700"/>
              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87L20.71,7.04Z" fill="#FF6B6B"/>
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
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.06,6.18L3,17.25V21H6.75L17.81,9.93L14.06,6.18Z" fill="#FFD700"/>
              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87L20.71,7.04Z" fill="#FF6B6B"/>
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
      ${this._showAnalysisTypeSelect ? this._renderAnalysisTypeSelectModal() : ""}
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
        duration_minutes: item.duration_minutes ?? "",
        calories_burned: item.calories_burned ?? 0,
        time,
      };
    } else {
      this._editData = {
        ...item,
        food_item: item.food_item ?? "",
        calories: item.calories ?? 0,
        time,
        // Preserve macros if present so edit modal can show them
        ...(item.p !== undefined ? { p: String(item.p) } : {}),
        ...(item.c !== undefined ? { c: String(item.c) } : {}),
        ...(item.f !== undefined ? { f: String(item.f) } : {}),
        ...(item.a !== undefined ? { a: String(item.a) } : {}),
      };
    }
    this._editIndex = idx;
    this._showEditPopup = true;
    this._editError = "";
  }

  _closeEdit() {
    this._showEditPopup = false;
    this._editIndex = -1;
    this._editData = null;
    this._editError = "";
  }

  _onEditInput(e, field) {
    let value = e.target.value;
    if (["p","c","f","a"].includes(field)) {
      value = this._sanitizeDecimal(value);
      // Reflect sanitized value in the live input if it changed
      if (value !== e.target.value) {
        e.target.value = value;
      }
    }
    this._editData = { ...this._editData, [field]: value };
    this._editError = "";
  }

  _onEditTimeInput(e) {
    // Validate and update time in HH:MM
    const value = e.target.value;
    this._editData = { ...this._editData, time: value };
  }

  _saveEdit() {
    // Validate food macro sanity before dispatch
    if (this._editData.type === 'food') {
      const ok = this._validateMacroCalories(
        this._editData.calories,
        this._editData.p,
        this._editData.c,
        this._editData.f,
        this._editData.a,
        (msg) => { this._editError = msg; }
      );
      if (!ok) {
        return; // abort save
      }
    }
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
          ...(this._editData.duration_minutes ? { duration_minutes: Number(this._editData.duration_minutes) } : {}),
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
          ...(this._isValidNumberStr(this._editData.p) ? { p: Number(this._editData.p) } : {}),
          ...(this._isValidNumberStr(this._editData.c) ? { c: Number(this._editData.c) } : {}),
          ...(this._isValidNumberStr(this._editData.f) ? { f: Number(this._editData.f) } : {}),
          ...(this._isValidNumberStr(this._editData.a) ? { a: Number(this._editData.a) } : {}),
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
          ${this._editError ? html`<div role="alert" style="color:#f44336;font-size:0.9em;margin:0 0 10px 0;line-height:1.3;">${this._editError}</div>` : ''}
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
                data-edit-field="exercise_type"
                @input=${e => this._onEditInput(e, "exercise_type")}
              />
              <div class="edit-label">Duration</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                placeholder="Optional"
                .value=${this._editData.duration_minutes || ''}
                data-edit-field="duration_minutes"
                @input=${e => this._onEditInput(e, "duration_minutes")}
              />
              <div class="edit-label">Calories Burned</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._editData.calories_burned}
                data-edit-field="calories_burned"
                @input=${e => this._onEditInput(e, "calories_burned")}
              />
            ` : html`
              <div class="edit-label">Item</div>
              <input
                class="edit-input"
                type="text"
                .value=${this._editData.food_item}
                data-edit-field="food_item"
                @input=${e => this._onEditInput(e, "food_item")}
              />
              <div class="edit-label">Calories</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._editData.calories}
                data-edit-field="calories"
                @input=${e => this._onEditInput(e, "calories")}
              />
              ${this.profile?.attributes?.track_macros ? html`
                <div class="edit-label">Protein (g) <small style="opacity:0.7">optional</small></div>
                <input
                  class="edit-input"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  .value=${this._editData.p ?? ''}
                  @input=${e => this._onEditInput(e, "p")}
                />
                <div class="edit-label">Carbs (g) <small style="opacity:0.7">optional</small></div>
                <input
                  class="edit-input"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  .value=${this._editData.c ?? ''}
                  @input=${e => this._onEditInput(e, "c")}
                />
                <div class="edit-label">Fat (g) <small style="opacity:0.7">optional</small></div>
                <input
                  class="edit-input"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  .value=${this._editData.f ?? ''}
                  @input=${e => this._onEditInput(e, "f")}
                />
                <div class="edit-label">Alcohol (g) <small style="opacity:0.7">optional</small></div>
                <input
                  class="edit-input"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  .value=${this._editData.a ?? ''}
                  @input=${e => this._onEditInput(e, "a")}
                />
              ` : ''}
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
      duration_minutes: "",
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
    let value = e.target.value;
    if (["p","c","f","a"].includes(field)) {
      value = this._sanitizeDecimal(value);
      if (value !== e.target.value) {
        e.target.value = value;
      }
    }
    this._addData = { ...this._addData, [field]: value };
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
      const ok = this._validateMacroCalories(
        this._addData.calories,
        this._addData.p,
        this._addData.c,
        this._addData.f,
        this._addData.a,
        (msg) => { this._addError = msg; }
      );
      if (!ok) return;
    } else {
      if (!this._addData.exercise_type || !this._addData.calories_burned) {
        this._addError = "Please enter exercise type and calories burned.";
        return;
      }
    }
    // Compose timestamp using selectedDate
    let dateStr = this.selectedDate;
    if (!dateStr) {
      // fallback to today if not set
      dateStr = getLocalDateString();
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
              timestamp,
              ...(this._isValidNumberStr(this._addData.p) ? { p: Number(this._addData.p) } : {}),
              ...(this._isValidNumberStr(this._addData.c) ? { c: Number(this._addData.c) } : {}),
              ...(this._isValidNumberStr(this._addData.f) ? { f: Number(this._addData.f) } : {}),
              ...(this._isValidNumberStr(this._addData.a) ? { a: Number(this._addData.a) } : {}),
            }
          : {
              exercise_type: this._addData.exercise_type,
              ...(this._addData.duration_minutes ? { duration_minutes: Number(this._addData.duration_minutes) } : {}),
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
                data-edit-field="food_item"
                .value=${this._addData.food_item}
                @input=${e => this._onAddInputChange(e, "food_item")}
              />
              <div class="edit-label">Calories</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                data-edit-field="calories"
                .value=${this._addData.calories}
                @input=${e => this._onAddInputChange(e, "calories")}
              />
              <div class="edit-label">Protein (g) <small style="opacity:0.7">optional</small></div>
              <input
                class="edit-input"
                type="text"
                inputmode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                data-edit-field="p"
                .value=${this._addData.p || ''}
                @input=${e => this._onAddInputChange(e, "p")}
              />
              <div class="edit-label">Carbs (g) <small style="opacity:0.7">optional</small></div>
              <input
                class="edit-input"
                type="text"
                inputmode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                data-edit-field="c"
                .value=${this._addData.c || ''}
                @input=${e => this._onAddInputChange(e, "c")}
              />
              <div class="edit-label">Fat (g) <small style="opacity:0.7">optional</small></div>
              <input
                class="edit-input"
                type="text"
                inputmode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                data-edit-field="f"
                .value=${this._addData.f || ''}
                @input=${e => this._onAddInputChange(e, "f")}
              />
              <div class="edit-label">Alcohol (g) <small style="opacity:0.7">optional</small></div>
              <input
                class="edit-input"
                type="text"
                inputmode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                data-edit-field="a"
                .value=${this._addData.a || ''}
                @input=${e => this._onAddInputChange(e, "a")}
              />
            ` : html`
              <div class="edit-label">Exercise</div>
              <input
                class="edit-input"
                type="text"
                .value=${this._addData.exercise_type}
                @input=${e => this._onAddInputChange(e, "exercise_type")}
              />
              <div class="edit-label">Duration</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                placeholder="Optional"
                .value=${this._addData.duration_minutes || ''}
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

  async _getPreferredAnalyzer() {
    try {
      const hass = this.hass || window?.hass;
      const authToken = hass?.connection?.options?.auth?.accessToken;

      // Get config entry ID from profile entity
      const configEntryId = this._getConfigEntryId();
      if (!configEntryId) return null;

      const resp = await fetch('/api/calorie_tracker/get_preferred_analyzer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config_entry_id: configEntryId })
      });
      const data = await resp.json();
      return data.preferred_analyzer;
    } catch (err) {
      this._logToServer('debug', `Failed to get preferred analyzer: ${err}`);
      return null;
    }
  }

  async _setPreferredAnalyzer(analyzer) {
    try {
      const hass = this.hass || window?.hass;
      const authToken = hass?.connection?.options?.auth?.accessToken;

      // Get config entry ID from profile entity
      const configEntryId = this._getConfigEntryId();

      if (!configEntryId) {
        console.error('No config_entry_id available in daily-data card');
        return false;
      }

      const resp = await fetch('/api/calorie_tracker/set_preferred_analyzer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config_entry_id: configEntryId,
          analyzer_data: analyzer
        })
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('HTTP Error:', resp.status, errorText);
        this._logToServer('debug', `HTTP Error ${resp.status}: ${errorText}`);
        return false;
      }

      const data = await resp.json();

      if (data.success === true) {
        return true;
      } else {
        console.error('API returned success=false:', data);
        return false;
      }
    } catch (err) {
      console.error('Exception in _setPreferredAnalyzer:', err);
      this._logToServer('debug', `Failed to set preferred analyzer: ${err}`);
      return false;
    }
  }

  _getConfigEntryId() {
    // Get config entry ID from the websocket data (passed from backend)
    const configId = this.log?.config_entry_id || null;
    return configId;
  }

  _isAnalyzerAvailable(analyzer) {
    if (!analyzer || !this.imageAnalyzers) return false;
    return this.imageAnalyzers.some(a =>
      a.config_entry === analyzer.config_entry &&
      a.name === analyzer.name
    );
  }

  _openPhotoAnalysis = async () => {
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

    // Always clear the photo description when opening the modal
    this._photoDescription = '';

    // Check for preferred analyzer first
    const preferredAnalyzer = await this._getPreferredAnalyzer();
    if (preferredAnalyzer) {
      if (this._isAnalyzerAvailable(preferredAnalyzer)) {
        this._selectedAnalyzer = preferredAnalyzer;
        this._showAnalysisTypeSelect = true;
        this._photoFile = null;
        this._photoError = '';
        return;
      } else {
        // Preferred analyzer is set but not available, force user to pick
        this._showAnalyzerSelect = true;
        this._selectedAnalyzer = null;
        this._photoFile = null;
        this._photoError = '';
        return;
      }
    }

    if (this.imageAnalyzers.length === 1) {
      this._selectedAnalyzer = this.imageAnalyzers[0];
      this._showAnalysisTypeSelect = true;
      this._photoFile = null;
      this._photoError = '';
      return;
    }

    // Show selection dialog for multiple analyzers or if no preferred is set
    this._showAnalyzerSelect = true;
    this._selectedAnalyzer = null;
    this._photoFile = null;
    this._photoError = '';
  };

  _renderAnalyzerSelectModal() {
    return html`
      <div class="modal" @click=${this._closeAnalyzerSelect}>
        <div class="modal-content" @click=${e => e.stopPropagation()}>
          <div class="modal-header">Select Image Analyzer</div>
          <div style="margin-bottom: 18px;">
            ${this.imageAnalyzers.map(analyzer => html`
              <div style="margin-bottom: 8px;">
                <button class="ha-btn" style="width:100%;text-align:left;padding:12px;" @click=${() => this._selectAnalyzer(analyzer)}>
                  <div style="line-height:1.3;">
                    <div style="font-weight:500;">${analyzer.name}</div>
                    <div style="font-size:0.85em;opacity:0.8;font-weight:normal;">Title: ${analyzer.title}; Model: ${analyzer.model ?? 'Unknown'}</div>
                  </div>
                </button>
              </div>
            `)}
          </div>
          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.95em;">
              <input type="checkbox" .checked=${this._rememberAnalyzerChoice} @change=${e => this._rememberAnalyzerChoice = e.target.checked} />
              Remember my choice for next time
            </label>
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
    this._showAnalysisTypeSelect = true;
    this._photoFile = null;
    this._photoError = '';

    // Save as preferred if user checked the remember option
    if (this._rememberAnalyzerChoice) {
      this._setPreferredAnalyzer(analyzer).then(success => {
        if (success) {
          this._logToServer('debug', `Saved preferred analyzer: ${analyzer.name}`);
        } else {
          this._logToServer('warning', `Failed to save preferred analyzer: ${analyzer.name}`);
        }
      });
    }
  }

  _closeAnalyzerSelect = () => {
    this._showAnalyzerSelect = false;
  };

  _renderAnalysisTypeSelectModal() {
    return html`
      <div class="analysis-modal-overlay" @click=${this._closeAnalysisTypeSelect}>
        <div class="analysis-modal-content" @click=${e => e.stopPropagation()}>
          <div class="analysis-modal-header">Choose Analysis Type</div>
          <div class="analysis-modal-body">
            <button class="ha-btn analysis-type-btn" @click=${() => this._selectAnalysisType('food')}>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 26px; line-height: 1;">🍽️</div>
                <div style="text-align: left;">
                  <div style="font-weight: bold; margin-bottom: 4px;">Analyze Food</div>
                  <div style="font-size: 0.9em; opacity: 0.8;">Estimate food calories from an image</div>
                </div>
              </div>
            </button>

            <button class="ha-btn analysis-type-btn" @click=${() => this._selectAnalysisType('bodyfat')}>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px; line-height: 1;">📏</div>
                <div style="text-align: left;">
                  <div style="font-weight: bold; margin-bottom: 4px;">Analyze Body Fat</div>
                  <div style="font-size: 0.9em; opacity: 0.8;">Upload an image of your torso</div>
                </div>
              </div>
            </button>
          </div>
          <div class="analysis-modal-footer">
            <button class="ha-btn" @click=${this._closeAnalysisTypeSelect}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _selectAnalysisType(type) {
    this._selectedAnalysisType = type;
    this._showAnalysisTypeSelect = false;
    this._showPhotoUpload = true;
  }

  _closeAnalysisTypeSelect = () => {
    this._showAnalysisTypeSelect = false;
  };

  _openProfileSettings = () => {
    this._closeAnalyzerSelect();
    // Dispatch event to open profile settings
    this.dispatchEvent(new CustomEvent("open-profile-settings", {
      bubbles: true,
      composed: true,
    }));
  };

  _renderPhotoUploadModal() {
    const isBodyFat = this._selectedAnalysisType === 'bodyfat';
    const modalTitle = isBodyFat ? 'Upload Body Fat Photo' : 'Upload Food Photo';

    const isFood = this._selectedAnalysisType === 'food';
    return html`
      <div class="modal" @click=${() => this._closePhotoUpload()}>
        <div class="modal-content" @click=${e => e.stopPropagation()}>
          <div class="modal-header">${modalTitle}</div>
          <div style="margin-bottom: 12px;">
            <div style="font-size:1.08em;font-weight:bold;margin-bottom:8px;">
              NOTE:
              <div style="margin-left:18px;font-size:1em;font-weight:bold;">
                For paid models, standard rates apply.<br>
                Selected model must support image inputs.
              </div>
            </div>
            <div style="font-size:0.98em;margin-bottom:8px;">
              <div>Analyzer: <b>${this._selectedAnalyzer?.name ?? ''}</b></div>
              <div style="font-size:0.9em;opacity:0.8;">Title: ${this._selectedAnalyzer?.title ?? ''}; Model: ${this._selectedAnalyzer?.model ?? 'Unknown'}</div>
            </div>
            ${isFood ? html`
              <div style="margin-bottom:10px;">
                <label style="font-size:0.98em;font-weight:500;display:block;margin-bottom:4px;">OPTIONAL: text description</label>
                <textarea class="edit-input" rows="3" style="font-size:1.05em;min-width:0;width:100%;resize:vertical;" placeholder="e.g. mashed potatoes with gravy under the steak, butter on broccoli" .value=${this._photoDescription || ''} @input=${e => { this._photoDescription = e.target.value; }}></textarea>
              </div>
            ` : ''}
            <label style="display:inline-block; margin-bottom:8px;">
              <input type="file" accept="image/*" @change=${this._onPhotoFileChange}
                style="display:none;" id="photo-upload-input" />
              <button type="button" class="ha-btn" style="font-size:1.1em; min-width: 150px; min-height: 44px; padding: 10px 18px;" @click=${() => this.shadowRoot.getElementById('photo-upload-input').click()}>
                Choose Photo
              </button>
            </label>
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
    this._submitPhotoAnalysis().catch(err => {
      this._photoLoading = false;
      this._photoError = err?.message || 'Failed to analyze photo';
    });
  };

  async _submitPhotoAnalysis() {
    if (!this._photoFile || !this._selectedAnalyzer) {
      this._photoError = 'Please select an analyzer and a photo';
      this._photoLoading = false;
      return;
    }

    this._photoError = '';

    try {
      // Determine the endpoint based on analysis type
      const isBodyFat = this._selectedAnalysisType === 'bodyfat';
      const endpoint = isBodyFat ? '/api/calorie_tracker/analyze_body_fat' : '/api/calorie_tracker/upload_photo';

      // Create FormData for multipart upload (no base64 conversion needed)
      const formData = new FormData();
      formData.append('config_entry', this._selectedAnalyzer.config_entry);
      formData.append('image', this._photoFile);
      formData.append('model', this._selectedAnalyzer.model);
      if (!isBodyFat && this._photoDescription) {
        formData.append('description', this._photoDescription);
      }
      if (!isBodyFat && Boolean(this.profile?.attributes?.track_macros)) {
        // Hint backend/LLM to estimate macronutrients
        formData.append('estimate_macros', '1');
      }

      const hass = this.hass || (window?.hass);
      if (!hass?.connection) {
        throw new Error('Home Assistant connection not available');
      }

      // Get auth token for API call
      const authToken = hass.connection.options?.auth?.accessToken;
      if (!authToken) {
        throw new Error('Authentication token not available');
      }

      // Make HTTP request to appropriate endpoint
      const response = await fetch(endpoint, {
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

      if (isBodyFat) {
        // Handle body fat analysis result
        if (result?.success && result?.body_fat_data) {
          // Show review modal for body fat data
          this._showPhotoUpload = false;
          this._photoReviewItems = [result.body_fat_data]; // Wrap in array for consistency
          this._photoReviewRaw = result.raw_result;
          this._photoReviewAnalyzer = this._selectedAnalyzer.name;
          this._showPhotoReview = true;
          this._selectedAnalyzer = null;
          this._photoFile = null;
          this._photoError = '';
        } else {
          this._photoError = result?.error || 'Could not analyze body fat from photo';
        }
      } else {
        // Handle food analysis result
        if (result?.success && result?.food_items?.length > 0) {
          // Show review modal for detected items
          this._showPhotoUpload = false;
          this._photoReviewItems = result.food_items.map(item => ({
            ...item,
            // Add short key aliases for easier editing & ensure populated
            p: item.p ?? item.protein,
            f: item.f ?? item.fat,
            c: item.c ?? item.carbs,
            a: item.a ?? item.alcohol,
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
      }
    } catch (err) {
      this._photoLoading = false;
      this._photoError = err?.message || 'Failed to analyze photo';
    }
  }

  // --- Photo Review Modal Logic ---
  _renderPhotoReviewModal() {
    if (!this._showPhotoReview || !this._photoReviewItems) return '';

    const isBodyFat = this._photoReviewItems[0]?.measurement_type === 'body_fat';
    const modalTitle = isBodyFat ? 'Review Body Fat Analysis' : 'Review Detected Food Items';

    return html`
      <div class="modal" @click=${() => this._closePhotoReview()}>
        <div class="modal-content" @click=${e => e.stopPropagation()} style="min-width:340px;max-width:98vw;">
          <div class="modal-header">${modalTitle}</div>
          <div style="margin-bottom:12px;font-size:0.98em;">
            Analyzer: <b>${this._photoReviewAnalyzer ?? ''}</b>
          </div>
          <form @submit=${e => { e.preventDefault(); this._confirmPhotoReview(); }}>
            <div style="max-height:260px;overflow-y:auto;">
              ${isBodyFat ? this._renderBodyFatReview() : this._renderFoodItemsReview()}
            </div>
            <div class="edit-actions" style="margin-top:18px;">
              <button class="ha-btn" type="submit">${isBodyFat ? 'Save Body Fat' : 'Add Selected'}</button>
              <button class="ha-btn" type="button" @click=${this._closePhotoReview}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  _renderFoodItemsReview() {
    const macrosEnabled = Boolean(this.profile?.attributes?.track_macros);
    return html`
      ${this._photoReviewItems.map((item, idx) => html`
        <div style="padding:6px 0;border-bottom:1px solid var(--divider-color,#ddd);">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:${macrosEnabled ? '6px':'0'};">
            <input type="checkbox" .checked=${item.selected} @change=${e => this._togglePhotoReviewItem(idx, e)} />
            <input data-edit-field="photo_item_${idx}_food_item" class="edit-input" style="flex:2;" type="text" .value=${item.food_item} @input=${e => this._editPhotoReviewItem(idx, 'food_item', e)} placeholder="Food item" />
            <input data-edit-field="photo_item_${idx}_calories" class="edit-input" style="width:80px;" type="number" min="0" .value=${item.calories} @input=${e => this._editPhotoReviewItem(idx, 'calories', e)} placeholder="Calories" />
          </div>
          ${macrosEnabled ? html`
            <div style="display:flex;flex-wrap:wrap;gap:6px;font-size:0.72em;align-items:center;">
              <label>Protein:
                <span style="position:relative;display:inline-flex;align-items:center;">
                  <input data-edit-field="photo_item_${idx}_p" class="edit-input" style="width:46px;padding-right:12px;" type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" .value=${item.p ?? ''} @input=${e => this._editPhotoReviewItem(idx, 'p', e)} />
                  ${(item.p !== undefined && item.p !== '' && Number(item.p) !== 0) ? html`<span style="position:absolute;right:4px;pointer-events:none;opacity:0.6;">g</span>` : ''}
                </span>
              </label>
              <label>Fat:
                <span style="position:relative;display:inline-flex;align-items:center;">
                  <input data-edit-field="photo_item_${idx}_f" class="edit-input" style="width:46px;padding-right:12px;" type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" .value=${item.f ?? ''} @input=${e => this._editPhotoReviewItem(idx, 'f', e)} />
                  ${(item.f !== undefined && item.f !== '' && Number(item.f) !== 0) ? html`<span style="position:absolute;right:4px;pointer-events:none;opacity:0.6;">g</span>` : ''}
                </span>
              </label>
              <label>Carbs:
                <span style="position:relative;display:inline-flex;align-items:center;">
                  <input data-edit-field="photo_item_${idx}_c" class="edit-input" style="width:46px;padding-right:12px;" type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" .value=${item.c ?? ''} @input=${e => this._editPhotoReviewItem(idx, 'c', e)} />
                  ${(item.c !== undefined && item.c !== '' && Number(item.c) !== 0) ? html`<span style="position:absolute;right:4px;pointer-events:none;opacity:0.6;">g</span>` : ''}
                </span>
              </label>
              <label>Alcohol:
                <span style="position:relative;display:inline-flex;align-items:center;">
                  <input data-edit-field="photo_item_${idx}_a" class="edit-input" style="width:46px;padding-right:12px;" type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" .value=${item.a ?? ''} @input=${e => this._editPhotoReviewItem(idx, 'a', e)} />
                  ${(item.a !== undefined && item.a !== '' && Number(item.a) !== 0) ? html`<span style="position:absolute;right:4px;pointer-events:none;opacity:0.6;">g</span>` : ''}
                </span>
              </label>
            </div>
          ` : ''}
        </div>
      `)}
    `;
  }

  _renderBodyFatReview() {
    const bodyFatData = this._photoReviewItems[0];
    return html`
      <div style="background:var(--secondary-background-color, #f5f5f5);padding:16px;border-radius:8px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <div style="font-size:32px; line-height: 0; color: currentColor;">${iconCaliper(32)}</div>
          <span style="font-size:1.1em;font-weight:bold;">Body Fat Analysis Result</span>
        </div>
        <div style="margin-bottom:8px;">
          <label style="display:block;font-weight:bold;margin-bottom:4px;">Body Fat Percentage:</label>
          <input class="edit-input" type="number" min="3" max="50" step="0.1" .value=${bodyFatData.percentage}
                 @input=${e => this._editPhotoReviewItem(0, 'percentage', e)}
                 style="width:100px;" /> %
        </div>
        <div style="font-size:0.9em;opacity:0.7;margin-top:8px;">
          Review and adjust the detected body fat percentage if needed, then save.
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
  const numericFields = ['calories','p','f','c','a','percentage'];
  const raw = e.target.value;
  if (["p","c","f","c","a","percentage"].includes(field) && field !== 'calories') {
    // For macro fields keep as sanitized string until final add
    const sanitized = this._sanitizeDecimal(raw);
    if (sanitized !== raw) {
      e.target.value = sanitized;
    }
    items[idx] = { ...items[idx], [field]: sanitized };
  } else if (numericFields.includes(field)) {
    items[idx] = { ...items[idx], [field]: raw === '' ? undefined : Number(raw) };
  } else {
    items[idx] = { ...items[idx], [field]: raw };
  }
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
    if (!this._photoReviewItems || this._photoReviewItems.length === 0) {
      this._closePhotoReview();
      return;
    }

    const isBodyFat = this._photoReviewItems[0]?.measurement_type === 'body_fat';

    if (isBodyFat) {
      // Handle body fat measurement
      const bodyFatData = this._photoReviewItems[0];

      if (!bodyFatData.percentage || bodyFatData.percentage < 3 || bodyFatData.percentage > 50) {
        alert('Please enter a valid body fat percentage (3-50%)');
        return;
      }

      // Compose timestamp using selectedDate and now's time
      let dateStr = this.selectedDate;
      if (!dateStr) {
        dateStr = getLocalDateString();
      }

      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const timestamp = `${dateStr}T${hh}:${mm}:00`;

      this.dispatchEvent(new CustomEvent('add-daily-entry', {
        detail: {
          entry_type: 'body_fat',
          entry: {
            body_fat_percentage: Number(bodyFatData.percentage),
            timestamp,
          }
        },
        bubbles: true,
        composed: true,
      }));
    } else {
      // Handle food entries (existing logic)
      const selected = this._photoReviewItems.filter(i => i.selected && i.food_item && i.calories !== undefined);
      if (selected.length === 0) {
        this._closePhotoReview();
        return;
      }

      // Validate each selected item for macro sanity (ignore those without macros)
      const invalid = [];
      for (const item of selected) {
        const warn = [];
        const ok = this._validateMacroCalories(
          item.calories,
          item.p,
          item.c,
          item.f,
          item.a,
          (msg) => warn.push(msg),
          true // silent mode (collect)
        );
        if (!ok) {
          invalid.push({ item, warn: warn[0] });
        }
      }
      if (invalid.length > 0) {
        alert(`One or more food items have calories from macros exceeding total calories. First issue: ${invalid[0].warn}`);
        return;
      }

      // Compose timestamp using selectedDate and now's time for each
      let dateStr = this.selectedDate;
      if (!dateStr) {
        dateStr = getLocalDateString();
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
            ...(this._isValidNumberStr(item.p) ? { p: Number(item.p) } : {}),
            ...(this._isValidNumberStr(item.f) ? { f: Number(item.f) } : {}),
            ...(this._isValidNumberStr(item.c) ? { c: Number(item.c) } : {}),
            ...(this._isValidNumberStr(item.a) ? { a: Number(item.a) } : {}),
        }
      },
      bubbles: true,
      composed: true,
    }));
  });
}

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

        // Filter out Home Assistant agent (multiple possible IDs)
        const rawAgents = agentsResp.agents || [];
        this._conversationAgents = rawAgents.filter(a => {
          const isHomeAssistant = a.id === 'conversation.home_assistant' ||
                                  a.id === 'homeassistant' ||
                                  a.id === 'home_assistant';
          return !isHomeAssistant;
        });

        // Check for duplicates and remove them
        const uniqueAgents = [];
        const seenIds = new Set();
        for (const agent of this._conversationAgents) {
          if (!seenIds.has(agent.id)) {
            seenIds.add(agent.id);
            uniqueAgents.push(agent);
          }
        }
        this._conversationAgents = uniqueAgents;

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
  // Failed to fetch pipelines or agents
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
          <div style="margin-bottom:12px;">
            <div style="display:flex;gap:8px;align-items:flex-end;">
              <textarea
                class="edit-input"
                placeholder="Type command here..."
                rows="3"
                style="flex:1;resize:vertical;background:${bg};color:${fg};border:1px solid ${border};"
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
              <button
                title="Send Message"
                @click=${this._processChatCommand}
                style="
                  align-items: center;
                  background: var(--primary-color, #03a9f4);
                  border: none;
                  border-radius: 8px;
                  color: rgb(255, 255, 255);
                  cursor: pointer;
                  display: flex;
                  font-family: var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif);
                  font-size: 24px;
                  font-weight: 400;
                  height: 32px;
                  justify-content: center;
                  line-height: normal;
                  margin-bottom: 0;
                  padding: 0;
                  pointer-events: auto;
                  text-align: center;
                  transition: background 0.2s;
                  user-select: none;
                  vertical-align: middle;
                  width: 32px;
                  -webkit-font-smoothing: antialiased;
                  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                "
                @mouseover=${(e) => e.target.style.background = 'var(--primary-color-dark, #0288d1)'}
                @mouseout=${(e) => e.target.style.background = 'var(--primary-color, #03a9f4)'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" style="fill: rgb(255, 255, 255); vertical-align: middle;">
                  <path class="primary-path" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _onChatInput(e) {
    const value = e.target.value;
    this._chatInput = value;
    // If the last character is a newline, treat as submit
    if (value.endsWith('\n')) {
      this._processChatCommand();
      // Remove the newline from the textarea
      e.target.value = '';
      this._chatInput = '';
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
      : (this._chatInput || (textInput ? textInput.value : "")).trim();

    if (!command) {
      this._chatHistory = [...this._chatHistory, { role: "assistant", text: "Please enter a command." }];
      return;
    }
    // Only add to history if commandArg is a string (direct command input)
    // For button clicks and Enter key presses, always add to history
    if (typeof commandArg !== "string") {
      this._chatHistory = [...this._chatHistory, { role: "user", text: command }];
    }
    this._chatInput = "";
    // Clear the textarea
    if (textInput) {
      textInput.value = "";
    }
    try {
      const hass = this.hass || window?.hass;
      if (!hass?.connection) throw new Error('Home Assistant connection not available');

      // Get user context from profile
      const userContext = this.profile ? {
        spoken_name: this.profile.attributes?.spoken_name || 'default',
        entity_id: this.profile.entity_id,
        daily_goal: this.profile.attributes?.daily_goal || 2000,
        calories_today: this.profile.attributes?.calories_today || 0,
        weight_unit: this.profile.attributes?.weight_unit || 'lbs'
      } : null;

      // Format the selected date for context
      const selectedDateContext = this.selectedDate || getLocalDateString();

      // Enhance the command with context information
      let enhancedCommand = command;
      if (userContext) {
        enhancedCommand = `Context: You are a calorie tracking assistant. Log nutritional data, physical activity, and health metrics. The person is ${userContext.spoken_name}, selected date is ${selectedDateContext}. When logging entries, use this person (${userContext.spoken_name}) and this date (${selectedDateContext}) unless the user explicitly specifies otherwise.\n\nUser request: ${command}`;
      }

      const conversationRequest = {
        type: "conversation/process",
        text: enhancedCommand,
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

      // Always refresh after chat assistant responses to ensure UI stays up to date
      this.dispatchEvent(new CustomEvent("refresh-daily-data", {
        bubbles: true,
        composed: true,
      }));
      this.dispatchEvent(new CustomEvent("refresh-summary", {
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      this._chatHistory = [...this._chatHistory, { role: "assistant", text: `Failed to process command: ${error.message}` }];
    }
  };

  // ===========================================================================
  // MEASUREMENTS EDIT FUNCTIONALITY
  // ===========================================================================

  _editWeight = async () => {
    // Get current weight from log for this date, fallback to profile
    const logWeight = this.log?.weight;
    const profileWeight = this.profile?.attributes?.current_weight;
    const currentWeight = logWeight ?? profileWeight ?? null;
    const weightUnit = this.profile?.attributes?.weight_unit || "lbs";

    const newValue = prompt(`Enter weight in ${weightUnit} (current: ${currentWeight ? currentWeight + ' ' + weightUnit : 'not set'}):`, currentWeight || '');

    if (newValue !== null && newValue.trim() !== '') {
      const weight = parseFloat(newValue.trim());
      if (!isNaN(weight) && weight > 0) {
        try {
          // Call the log_weight service
          await this.hass.callService('calorie_tracker', 'log_weight', {
            spoken_name: this.profile.attributes.spoken_name,
            weight: weight,
            timestamp: this.selectedDate || new Date().toISOString().split('T')[0]
          });

          // Refresh the data
          this.dispatchEvent(new CustomEvent("refresh-daily-data", {
            bubbles: true,
            composed: true,
          }));
          this.dispatchEvent(new CustomEvent("refresh-summary", {
            bubbles: true,
            composed: true,
          }));
        } catch (error) {
          alert(`Error saving weight: ${error.message}`);
        }
      } else {
        alert('Please enter a valid weight greater than 0.');
      }
    }
  };

  _editBodyFat = async () => {
    // Get current body fat from log for this date, fallback to profile
    const logBodyFat = this.log?.body_fat_pct;
    const profileBodyFat = this.profile?.attributes?.body_fat_percentage;
    const currentBodyFat = logBodyFat ?? profileBodyFat ?? null;

    const newValue = prompt(`Enter body fat percentage (current: ${currentBodyFat ? currentBodyFat.toFixed(1) + '%' : 'not set'}):`, currentBodyFat || '');

    if (newValue !== null && newValue.trim() !== '') {
      const bodyFat = parseFloat(newValue.trim());
      if (!isNaN(bodyFat) && bodyFat >= 1 && bodyFat <= 50) {
        try {
          // Call the log_body_fat service
          await this.hass.callService('calorie_tracker', 'log_body_fat', {
            spoken_name: this.profile.attributes.spoken_name,
            body_fat_pct: bodyFat,
            timestamp: this.selectedDate || new Date().toISOString().split('T')[0]
          });

          // Refresh the data
          this.dispatchEvent(new CustomEvent("refresh-daily-data", {
            bubbles: true,
            composed: true,
          }));
          this.dispatchEvent(new CustomEvent("refresh-summary", {
            bubbles: true,
            composed: true,
          }));
        } catch (error) {
          alert(`Error saving body fat: ${error.message}`);
        }
      } else {
        alert('Please enter a valid body fat percentage between 1 and 50.');
      }
    }
  };
}

// =============================================================================
// COMPONENT REGISTRATION
// =============================================================================

// Check if the element is already defined before defining it
if (!customElements.get('daily-data-card')) {
  customElements.define('daily-data-card', DailyDataCard);
}
