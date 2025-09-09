import { LitElement, html, css } from 'https://unpkg.com/lit@2/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit@2/directives/unsafe-html.js?module';

export class ProfileCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    profile: { attribute: false },
    isDefault: { type: Boolean },
    showSettings: { type: Boolean },
    spokenNameInput: { type: String },
    calorieGoalInput: { type: Number },
    startingWeightInput: { type: String },
    goalWeightInput: { type: String },
    showPopup: { type: Boolean },
    popupTitle: { type: String },
    popupMessage: { type: String },
    popupType: { type: String },
    allProfiles: { attribute: false },
    selectedProfileId: { type: String },
    defaultProfile: { attribute: false },
    linkedDevices: { attribute: false },
    showRemoveLinkedConfirm: { type: Boolean },
    deviceToRemove: { attribute: false },
    weightUnitInput: { type: String },
    birthYearInput: { type: String },
    sexInput: { type: String },
    heightInput: { type: String },
    heightUnitInput: { type: String },
    heightFeetInput: { type: String },
    heightInchesInput: { type: String },
    preferredImageAnalyzer: { attribute: false },
    imageAnalyzers: { attribute: false },
    goalType: { type: String },
    dailyGoal: { type: Number },
    currentWeight: { type: Number },
    showGoalPopup: { type: Boolean },
  goals: { type: Array },
  trackMacrosInput: { type: Boolean },
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
      .profile-card {
        padding: 4px;
        display: flex;
        align-items: center;
        gap: 6px; /* Reduced from 12px to bring goal closer to spoken name */
        position: relative;
        flex-wrap: wrap;
        box-sizing: border-box;
        width: 100%;
        max-width: 100vw;
      }
      .profile-name-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-right: 6px;
        flex-shrink: 0;
      }
      .spoken-name {
        font-size: 1.2em;
        font-weight: bold;
        line-height: 1.1;
        margin-bottom: 0;
        word-break: break-word;
        text-align: left;
      }
      .default-label {
        color: var(--success-color, #4caf50);
        font-size: 0.9em;
        margin: 0;
        padding: 0;
        line-height: 1;
        text-align: left;
      }
      .profile-details-stack {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 16px;
        flex: 1;
        min-width: 0;
      }
      .profile-detail {
        color: var(--secondary-text-color, #888);
        font-size: 1em;
        line-height: 1.2;
        margin: 0;
        display: flex;
        align-items: center;
        word-break: break-word;
      }
      .settings-btn {
        margin-left: auto;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: flex-start;
        order: 99;
        flex-shrink: 0;
        position: absolute;
        top: 50%;
        right: 8px;
        transform: translateY(-50%);
      }
      .settings-btn svg {
        width: 26px;
        height: 26px;
        fill: var(--primary-text-color, #212121);
      }
      .modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.32);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--ct-modal-z, 1500);
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }
      .modal-content {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        padding: 24px;
        border-radius: var(--ha-card-border-radius, 12px);
        min-width: 350px;
        max-width: 95vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.2));
        text-align: left;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }

      /* Responsive modal for small screens */
      @media (max-width: 480px) {
        .modal-content {
          min-width: 0;
          max-width: 92vw;
          max-height: 85vh;
          padding: 16px;
          margin: 8px;
        }
        .modal-header {
          font-size: 1.1em;
          margin-bottom: 16px;
        }
        .settings-grid {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .settings-label {
          font-size: 0.95em;
          margin-bottom: 4px;
        }
        .settings-input {
          padding: 8px;
          font-size: 16px; /* Prevents zoom on iOS */
        }
      }
      .modal-header {
        font-size: 1.25em;
        font-weight: 500;
        margin-bottom: 18px;
        color: var(--primary-text-color, #212121);
        border-bottom: 1px solid #eee;
        padding-bottom: 8px;
      }
      .settings-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 12px 18px;
        align-items: center;
        margin-bottom: 18px;
      }
      .settings-label {
        font-weight: 500;
        color: var(--primary-text-color, #212121);
      }
      .settings-input {
        width: 100%;
        font-size: 1em;
        padding: 6px 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background: var(--input-background-color, var(--card-background-color, #fff));
        color: var(--primary-text-color, #212121);
        box-sizing: border-box;
      }
      .settings-input:focus {
        outline: 2px solid var(--primary-color, #03a9f4);
        border-color: var(--primary-color, #03a9f4);
        background: var(--input-background-color, var(--card-background-color, #fff));
        color: var(--primary-text-color, #212121);
      }
      .settings-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }
      .goal-icon {
        font-size: 1.05em;
        margin-right: 8px;
        line-height: 1;
      }
      .goal-main {
        font-weight: 600;
        margin-right: 6px;
      }
      .goal-sub {
        color: var(--secondary-text-color, #666);
        font-size: 0.95em;
      }
      @media (max-width: 500px) {
        /* Stack goalMain and goalSub vertically on narrow screens */
        .profile-detail {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
        .goal-main {
          margin-right: 0;
        }
        .goal-sub {
          display: block;
          margin-top: 0;
        }
      }
      .settings-actions .ha-btn {
        margin-left: 0;
        min-width: 90px;
      }
      .settings-footer {
        margin-top: 12px;
        display: flex;
        justify-content: flex-end;
      }
      .goal-matrix {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-top: 12px;
        margin-bottom: 20px;
      }
      .goal-row {
        display: contents;
      }
      .goal-cell {
        background: var(--card-background-color, #fff);
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .goal-header {
        font-weight: 500;
        color: var(--primary-text-color, #212121);
        font-size: 1.1em;
        margin-bottom: 8px;
      }
      .goal-header.new-goal {
        font-weight: 700;
        color: var(--primary-color, #03a9f4);
        font-size: 1.22em;
      }
      .goal-header.current-goal {
        color: var(--primary-color, #03a9f4);
        font-weight: 600;
      }
      .goal-value {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
      }
      .goal-type {
        font-size: 0.9em;
        color: var(--secondary-text-color, #666);
      }
      .goal-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      /* Responsive goal inputs */
      @media (max-width: 768px) {
        .goal-matrix {
          grid-template-columns: 1fr;
        }
        .goal-inputs {
          grid-template-columns: 1fr !important;
          gap: 8px !important;
        }
      }
    `
  ];

  constructor() {
    super();
    this.isDefault = false;
    this.showSettings = false;
    this.spokenNameInput = "";
    this.calorieGoalInput = 0;
    this.startingWeightInput = "";
    this.goalWeightInput = "";
    this.showPopup = false;
    this.popupTitle = "";
    this.popupMessage = "";
    this.popupType = "";
    this.allProfiles = [];
    this.selectedProfileId = "";
    this.linkedDevices = [];
    this.showRemoveLinkedConfirm = false;
    this.deviceToRemove = null;
    this.weightUnitInput = "lbs";
    this.birthYearInput = "";
    this.sexInput = "";
    this.heightInput = "";
    this.heightUnitInput = "cm";
    this.heightFeetInput = "";
    this.heightInchesInput = "";
    this.bodyFatPctInput = "";
    this.goalType = "Not Set";
    this.dailyGoal = null;
    this.showGoalPopup = false;
  this.goals = [];
  this.trackMacrosInput = false;
  }

  // Validate numeric input - returns number or null if invalid
  _validateNumericInput(value, minVal = null, maxVal = null) {
    if (!value || value.trim() === '') return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (minVal !== null && num < minVal) return null;
    if (maxVal !== null && num > maxVal) return null;
    return num;
  }

  render() {
    const spokenName = this.profile?.attributes?.spoken_name || "";
    const dailyGoal = this.dailyGoal ?? null;
    const goalType = this.goalType || "Not Set";
    const weightUnit = this.profile?.attributes?.weight_unit || 'lbs';
    const goalValue = this.goalValue ?? null;
    const currentWeight = this.currentWeight;
    const linkedDevicesArr = Array.isArray(this.linkedDevices)
      ? this.linkedDevices
      : (this.linkedDevices && typeof this.linkedDevices === 'object')
        ? Object.values(this.linkedDevices).flat()
        : [];

    let goalMain = '';
    let goalSub = '';

    if ((goalType === 'fixed_intake' || goalType === 'fixed_net_calories') && dailyGoal !== null) {
      goalMain = `Goal: ${dailyGoal} Cal/day ${goalType === 'fixed_net_calories' ? ' (net)' : ''}`;
      goalSub = ``;
    } else if ((goalType === 'fixed_deficit' || goalType === 'fixed_surplus') && dailyGoal !== null) {
      // fixed_deficit/fixed_surplus: show the computed daily goal and the
      // original delta (kcal below/above BMR+NEAT) as the subtext
      goalMain = `Goal: ${goalValue} Cal Daily ${goalType === 'fixed_deficit' ? 'Deficit' : 'Surplus'} `;
      goalSub = `(${dailyGoal} net Cal/day)`;
    } else if (goalType === 'variable_cut' && dailyGoal !== null) {
      if (currentWeight !== null && !isNaN(currentWeight)) {
        const perWeek = this._percentToWeightPerWeek(goalValue, currentWeight, weightUnit);
        goalMain = `Goal: Lose ${goalValue}% (${perWeek}${weightUnit}) / wk `;
        goalSub = `(${dailyGoal} net Cal/day)`;
      } else {
        goalMain = `Goal: Lose ${goalValue}% (${perWeek}${weightUnit}) / wk `;
        goalSub = '';
      }
    } else if (goalType === 'variable_bulk' && dailyGoal !== null) {
      if (currentWeight !== null && !isNaN(currentWeight)) {
        const perWeek = this._percentToWeightPerWeek(goalValue, currentWeight, weightUnit);
        goalMain = `Goal: Gain ${goalValue}% (${perWeek}${weightUnit}) /wk`;
        goalSub = `(${dailyGoal} net Cal/day)`;
      } else {
        goalMain = `Goal: Gain ${goalValue}% (${perWeek}${weightUnit}) /wk`;
        goalSub = '';
      }
    } else if (!goalType || goalType === 'Not Set') {
      goalMain = 'Not set';
      goalSub = '';
    } else if (dailyGoal !== null) {
      goalMain = `Goal: ${dailyGoal}`;
      goalSub = `${goalType}`;
    } else {
      goalMain = `Goal: ${goalType}`;
      goalSub = '';
    }

    const anyModalOpen = this.showSettings || this.showGoalPopup || this.showRemoveLinkedConfirm || this.showPopup;
    return html`
      <div class="profile-card" style=${anyModalOpen ? 'z-index:10050;' : ''}>
        <div class="profile-name-col">
          <span class="spoken-name">${spokenName}</span>
          ${this.isDefault
            ? html`<span class="default-label">(Default)</span>`
            : ""}
        </div>
        <div class="profile-details-stack">
          <span class="profile-detail">
            <span class="goal-main">${goalMain}</span>
            ${goalSub ? html`<span class="goal-sub">${goalSub}</span>` : ''}
          </span>
        </div>
        <button class="settings-btn" @click=${this._openSettings} title="Settings">
          <svg viewBox="0 0 24 24">
            <path class="primary-path" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"></path>
          </svg>
        </button>
        ${this.showSettings ? html`
          <div id="settings-modal" class="modal" @click=${this._closeSettings}>
            <div class="modal-content" @click=${e => e.stopPropagation()}>
              <div class="modal-header">Settings</div>
              <div class="settings-profile-row" style="display: flex; align-items: center; gap: 18px;">
                <div class="settings-label">Profile</div>
                <select class="settings-input" @change=${e => this._pendingProfileId = e.target.value}>
                  ${this.allProfiles.map(p => html`<option value=${p.entity_id} ?selected=${p.entity_id === (this.selectedProfileId || this.profile?.entity_id)}>${p.spoken_name || p.entity_id}</option>`) }
                </select>
              </div>
              <div class="settings-profile-actions" style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;">
                <button class="ha-btn" @click=${this._selectProfileFromDropdown}>Select</button>
                <button class="ha-btn" @click=${this._setDefault}>Set as Default Profile</button>
              </div>
              <div style="height: 18px;"></div>
              <div class="settings-grid" style="margin-top: 0;">
                <div class="settings-label">Spoken Name</div>
                <input class="settings-input" .value=${this.spokenNameInput} @input=${e => (this.spokenNameInput = e.target.value)} />
                <div class="settings-label">Current Goal</div>
                <div style="display: flex; align-items: center;">
                  <span>${goalMain} ${goalSub}</span>
                  <button class="ha-btn" @click=${this._openGoalPopup} style="margin-left: auto;">Edit</button>
                </div>
                <div class="settings-label">Starting Weight</div>
                <input class="settings-input" type="text" placeholder="e.g. 150.5" .value=${this.startingWeightInput} @input=${e => (this.startingWeightInput = e.target.value)} />
                <div class="settings-label">Goal Weight</div>
                <input class="settings-input" type="text" placeholder="e.g. 140.0" .value=${this.goalWeightInput} @input=${e => (this.goalWeightInput = e.target.value)} />
                <div class="settings-label">Weight Units</div>
                <div style="display:flex;gap:16px;align-items:center;">
                  <label><input type="radio" name="weight-unit" value="lbs" .checked=${this.weightUnitInput === 'lbs'} @change=${e => this.weightUnitInput = e.target.value} /> lbs</label>
                  <label><input type="radio" name="weight-unit" value="kg" .checked=${this.weightUnitInput === 'kg'} @change=${e => this.weightUnitInput = e.target.value} /> kg</label>
                </div>
                <div class="settings-label">Track macros</div>
                <div>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.95em;">
                    <input type="checkbox" .checked=${this.trackMacrosInput} @change=${e => this.trackMacrosInput = e.target.checked} />
                    <span style="font-size:0.95em;color:var(--secondary-text-color, #666);">Enable per-food macronutrient tracking (carbs/protein/fat/alcohol)</span>
                  </label>
                </div>
              </div>
              <div style="width: 100%; margin: 16px 0 8px 0; border-top: 1px solid var(--divider-color, #e0e0e0); padding-top: 16px;">
                <div style="font-weight: 500; margin-bottom: 12px; font-size: 1.1em;">Baseline Calorie Burn Metrics</div>
                <div class="settings-grid" style="margin-bottom: 0;">
                  <div class="settings-label">Birth Year</div>
                  <input class="settings-input" type="number" min="1900" max="2025" .value=${this.birthYearInput || ''} @input=${e => (this.birthYearInput = e.target.value)} />
                  <div class="settings-label">Sex</div>
                  <div style="display:flex;gap:16px;align-items:center;">
                    <label><input type="radio" name="sex" value="male" .checked=${this.sexInput === 'male'} @change=${e => this.sexInput = e.target.value} /> Male</label>
                    <label><input type="radio" name="sex" value="female" .checked=${this.sexInput === 'female'} @change=${e => this.sexInput = e.target.value} /> Female</label>
                  </div>
                  <div class="settings-label">Height Units</div>
                  <div style="display:flex;gap:16px;align-items:center;">
                    <label><input type="radio" name="height-unit" value="in" .checked=${this.heightUnitInput === 'in'} @change=${e => this.heightUnitInput = e.target.value} /> Imperial</label>
                    <label><input type="radio" name="height-unit" value="cm" .checked=${this.heightUnitInput === 'cm'} @change=${e => this.heightUnitInput = e.target.value} /> Metric</label>
                  </div>
                  <div class="settings-label">Height</div>
                  ${this.heightUnitInput === 'in' ? html`<div style="display:flex;gap:8px;align-items:center;">
                    <input class="settings-input" type="number" min="3" max="8" .value=${this.heightFeetInput || ''} @input=${e => (this.heightFeetInput = e.target.value)} placeholder="ft" style="width: 60px;" />
                    <span>ft</span>
                    <input class="settings-input" type="number" min="0" max="11" .value=${this.heightInchesInput || ''} @input=${e => (this.heightInchesInput = e.target.value)} placeholder="in" style="width: 60px;" />
                    <span>in</span>
                  </div>` : html`<input class="settings-input" type="number" min="100" max="250" .value=${this.heightInput || ''} @input=${e => (this.heightInput = e.target.value)} placeholder="Height in cm" />`}
                  <div class="settings-label">Activity Multiplier
                    <button @click=${() => this._showPopup('Activity Multiplier', `Your amount of calories you burn is highly dependent on how active you are.<br>This multiplier is used to estimate the calories burned from your daily routine.<br><br><b>NOTE</b> - Do not double count workouts. If you plan to manually log workouts, do not include them in this estimate.<br><ul style='margin:8px 0 8px 18px;padding:0;'><li><b>1.1</b>: Use 1.1 if you plan to manually log all exercise (e.g. calories burned from a daily step counter).</li><li><b>1.2</b>: Low activity (desk work, &lt;5,000 steps/day)</li><li><b>1.275</b>: Light activity (5,000-7,500 steps/day)</li><li><b>1.35</b>: Moderate activity (7,500-10,000 steps/day)</li><li><b>1.425</b>: High activity (10,000-12,500 steps/day)</li><li><b>1.5</b>: Very active (15,000 steps/day))</li></ul>Choose a value that best matches your typical day. This helps improve the accuracy of your weight gain/loss predictions.`, 'info')} style="background:none;border:none;padding:0;margin:0;cursor:pointer;">
                      <svg width="24" height="24" viewBox="0 0 24 24" style="vertical-align:middle;">
                        <path class="primary-path" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" fill="var(--primary-color, #03a9f4)" />
                      </svg>
                    </button>
                  </div>
                  <input class="settings-input" type="text" placeholder="e.g. 1.2" .value=${this.activityMultiplierInput || ''} @input=${e => (this.activityMultiplierInput = e.target.value)} />
                </div>
              </div>
              <div style="width: 100%; margin: 16px 0 8px 0; border-top: 1px solid var(--divider-color, #e0e0e0); padding-top: 16px;">
                <div style="font-weight: 500; margin-bottom: 12px; font-size: 1.1em;">Photo Analysis</div>
                <div class="settings-grid" style="margin-bottom: 0;">
                  <div class="settings-label">Preferred Image Analyzer</div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <select class="settings-input" @change=${this._onPreferredAnalyzerChange}>
                      <option value="" .selected=${!this.preferredImageAnalyzer}>Select each time</option>
                      ${(this.imageAnalyzers || []).map(analyzer => html`<option value=${analyzer.config_entry} .selected=${this.preferredImageAnalyzer?.config_entry === analyzer.config_entry}>${analyzer.name} (${analyzer.model || 'Unknown model'})</option>`)}
                    </select>
                    <div style="font-size: 0.85em; color: var(--secondary-text-color, #666); line-height: 1.3;">When set, this analyzer will be automatically used when you click the camera button for food or body fat analysis.</div>
                  </div>
                </div>
              </div>
              <div style="width: 100%; margin: 8px 0 0 0;">
                <div style="font-weight: 500; margin-bottom: 2px;">Linked Components:</div>
                ${!linkedDevicesArr.length ? html`<div style="color: var(--secondary-text-color, #888);">None</div>` : html`<ul style="list-style: none; padding: 0 0 0 18px; margin: 0;">${linkedDevicesArr.map((dev, idx) => html`<li style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;"><span style="font-size: 0.97em;">${dev && dev.linked_domain ? (dev.linked_domain === 'peloton' ? html`<b>${dev.title}</b>` : html`<b>${dev.linked_domain}</b>: ${dev.title || dev.user_id}`) : html`<b>?</b> ${JSON.stringify(dev)}`}</span><button title="Unlink" style="background: none; border: none; cursor: pointer; color: var(--error-color, #f44336); padding: 2px; font-size: 0.97em; text-decoration: underline;" @click=${() => this._confirmRemoveLinkedDevice(idx)}>Unlink</button></li>` )}</ul>`}
              </div>
              <div class="settings-actions" style="display: flex; gap: 12px; margin-top: 12px;">
                <button class="ha-btn" @click=${this._saveSettings}>Save</button>
                <button class="ha-btn" @click=${this._closeSettings}>Close</button>
              </div>
            </div>
          </div>
        ` : ""}
        ${this.showGoalPopup ? html`
          <div class="modal" @click=${this._closeGoalPopup}>
            <div class="modal-content" @click=${e => e.stopPropagation()}>
              <div class="modal-header">
                Goals
                <button @click=${() => this._showPopup('Goal Help', `Set your goal type and daily target.<br><br><b>Fixed Intake</b>: Enter the daily calorie target. Only food calories count toward your goal.<br><br><b>Fixed Net Calories</b>: Enter the daily net calorie target. Food minus exercise calories count toward your goal.<br><br><b>Lose a fixed percent of body weight per week (Cutting)</b>:<br>• Enter your target weight loss percentage per week.<br>• Studies show that 0.5-1.0% per week is the sweet spot.<br>• Daily goal will then be calculated to meet your weekly weight loss goal.<br>• Recommend goal of 0.5-1.0% body weight per week<br>• Choosing more than 1.0% body weight per week will put you at high risk of losing lean body mass, which is counter productive<br>• Ensure you are eating enough protein and strength training to avoid muscle atrophy while cutting<br><br><b>Gain a fixed percent of body weight per week (Bulking)</b>:<br>• Enter your target weight gain percentage per week.<br>• Studies show that 0.25-0.5% body weight gain per week is the sweet spot.<br>• Daily goal will then be calculated to meet your weekly weight gain goal.<br>• Recommend goal of 0.25-0.5% body weight per week<br>• Choosing more than 0.5% body weight per week will put you at risk of gaining excess fat`, 'info')} style="background:none;border:none;padding:0;margin:0;cursor:pointer;margin-left:8px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" style="vertical-align:middle;">
                    <path class="primary-path" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" fill="var(--primary-color, #03a9f4)"/>
                  </svg>
                </button>
              </div>
              <div class="goal-matrix">
    ${(this.displayGoals || []).map((goal, displayIndex) => html`
                  <div class="goal-row">
                    <div class="goal-cell">
                      <div class="goal-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div class="goal-header ${goal?.is_new ? 'new-goal' : (displayIndex === 0 ? 'current-goal' : '')}">${this._getGoalLabel(goal, displayIndex)}</div>
                        <button class="ha-btn error" @click=${() => this._deleteGoal(displayIndex)} style="padding: 4px 8px; font-size: 0.9em;">Delete</button>
                      </div>
                      <div class="goal-inputs" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                        <div>
                          <label style="display: block; font-size: 0.9em; margin-bottom: 4px; color: var(--primary-text-color, #212121);">Goal Type</label>
                          <select class="settings-input" .value=${goal.goal_type} @change=${(e) => this._updateGoalField(displayIndex, 'goal_type', e.target.value)} style="font-size: 0.9em; padding: 6px;">
                            <option value="fixed_intake">Fixed Intake</option>
                            <option value="fixed_net_calories">Fixed Net Calories</option>
                            <option value="fixed_deficit">Fixed Deficit</option>
                            <option value="fixed_surplus">Fixed Surplus</option>
                            <option value="variable_cut">Lose fixed percent of weight per week</option>
                            <option value="variable_bulk">Gain a fixed percent of weight per week</option>
                          </select>
                        </div>
                        <div>
                          <label style="display: block; font-size: 0.9em; margin-bottom: 4px; color: var(--primary-text-color, #212121);">Goal Value</label>
                          <input class="settings-input" type="text" .value=${goal.goal_value} @input=${(e) => this._updateGoalField(displayIndex, 'goal_value', e.target.value)} style="font-size: 0.9em; padding: 6px;" />
                        </div>
                        <div>
                          <label style="display: block; font-size: 0.9em; margin-bottom: 4px; color: var(--primary-text-color, #212121);">Start Date</label>
                          <input class="settings-input" type="date" .value=${goal.start_date} @change=${(e) => this._updateGoalField(displayIndex, 'start_date', e.target.value)} style="font-size: 0.9em; padding: 6px;" />
                        </div>
                      </div>
                    </div>
                  </div>
                `)}
              </div>
              <div class="modal-actions">
                <button class="ha-btn" @click=${this._addGoalRow} style="background: var(--success-color, #4caf50); color: white;">+ Add Goal</button>
                <button class="ha-btn" @click=${this._saveGoals}>Save</button>
                <button class="ha-btn" @click=${this._closeGoalPopup}>Cancel</button>
              </div>
            </div>
          </div>
        ` : ""}
        ${this.showRemoveLinkedConfirm && this.deviceToRemove ? html`
          <div class="modal" @click=${this._cancelRemoveLinkedDevice}>
            <div class="modal-content" @click=${e => e.stopPropagation()}>
              <div class="modal-header">
                Confirm unlink
                <b>${this.deviceToRemove.title || this.deviceToRemove.user_id || "?"}</b>
                from
                <b>${this.profile?.attributes?.spoken_name || this.profile?.entity_id || "profile"}</b>
              </div>
              <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="ha-btn error" @click=${this._doRemoveLinkedDevice}>Confirm</button>
                <button class="ha-btn" @click=${this._cancelRemoveLinkedDevice}>Cancel</button>
              </div>
            </div>
          </div>
        ` : ""}
        ${this.showPopup ? html`
          <div class="modal" @click=${this._closePopup}>
            <div class="modal-content" @click=${e => e.stopPropagation()}>
              <div class="modal-header">${this.popupTitle}</div>
              <div class="modal-message" style="margin-bottom: 16px;">
                ${unsafeHTML(this.popupMessage)}
              </div>
              <div class="modal-actions" style="display: flex; gap: 12px, justify-content: flex-end;">
                ${this.popupType === "restart"
                  ? html`<button class="ha-btn" @click=${this._restartHass}>Restart Now</button>`
                  : ""}
                <button class="ha-btn" @click=${this._closePopup}>Close</button>
              </div>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  _profileDropdownOptions() {
    // Show the current profile first, then the rest
    const currentId = this.selectedProfileId || this.profile?.entity_id;
    const current = this.allProfiles.find(p => p.entity_id === currentId);
    const others = this.allProfiles.filter(p => p.entity_id !== currentId);
    const options = [];
    if (current) {
      options.push(html`<option value=${current.entity_id}>${current.spoken_name || current.entity_id}</option>`);
    }
    for (const p of others) {
      options.push(html`<option value=${p.entity_id}>${p.spoken_name || p.entity_id}</option>`);
    }
    return options;
  }

  updated(changedProperties) {
    if (changedProperties.has('profile')) {
      const newEntityId = this.profile?.entity_id;
      this.selectedProfileId = newEntityId || "";
      this.spokenNameInput = this.profile?.attributes?.spoken_name || "";
      this.startingWeightInput = this.profile?.attributes?.starting_weight?.toString() || "";
      this.goalWeightInput = this.profile?.attributes?.goal_weight?.toString() || "";
      this.weightUnitInput = this.profile?.attributes?.weight_unit || 'lbs';
      this.birthYearInput = this.profile?.attributes?.birth_year?.toString() || "";
      this.sexInput = this.profile?.attributes?.sex || "";
      this.heightUnitInput = this.profile?.attributes?.height_unit || 'cm';
      this._setHeightInputsFromValue(this.profile?.attributes?.height, this.heightUnitInput);
      this.activityMultiplierInput = this.profile?.attributes?.activity_multiplier?.toString() || "";
      this._checkIsDefault();
    }
    if (changedProperties.has('allProfiles') && this.allProfiles.length > 0) {
      if (!this.selectedProfileId || !this.allProfiles.some(p => p.entity_id === this.selectedProfileId)) {
        this.selectedProfileId = this.profile?.entity_id || this.allProfiles[0].entity_id;
      }
    }
    // Always flatten linkedDevices to an array of device objects
    if (changedProperties.has('linkedDevices')) {
      if (Array.isArray(this.linkedDevices)) {
        // already flat
        return;
      }
      if (this.linkedDevices && typeof this.linkedDevices === 'object') {
        this.linkedDevices = Object.values(this.linkedDevices).flat();
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._checkIsDefault();
  }

  _openSettings = async (e) => {
    e.stopPropagation();
    this.showSettings = true;
    this.dispatchEvent(new CustomEvent('profile-modal-open', { bubbles: true, composed: true }));
    this.spokenNameInput = this.profile?.attributes?.spoken_name || "";
    this.startingWeightInput = this.profile?.attributes?.starting_weight?.toString() || "";
    this.goalWeightInput = this.profile?.attributes?.goal_weight?.toString() || "";
    this.selectedProfileId = this.profile?.entity_id || (this.allProfiles[0]?.entity_id ?? "");
    this.weightUnitInput = this.profile?.attributes?.weight_unit || 'lbs';
    this.birthYearInput = this.profile?.attributes?.birth_year?.toString() || "";
    this.sexInput = this.profile?.attributes?.sex || "";
    this.heightUnitInput = this.profile?.attributes?.height_unit || 'cm';
    this._setHeightInputsFromValue(this.profile?.attributes?.height, this.heightUnitInput);
    this.activityMultiplierInput = this.profile?.attributes?.activity_multiplier?.toString() || "";
    this.trackMacrosInput = !!this.profile?.attributes?.track_macros;

    // Load image analyzers and preferred analyzer
    await this._loadImageAnalyzersAndPreference();
  };

  _closeSettings = () => {
    this.showSettings = false;
    this.dispatchEvent(new CustomEvent('profile-modal-close', { bubbles: true, composed: true }));
  };

  _selectProfileFromDropdown() {
    const selectEl = this.renderRoot?.querySelector('.settings-input[type="select"], select.settings-input');
    const newProfileEntityId = selectEl ? selectEl.value : (this._pendingProfileId || this.selectedProfileId || this.profile?.entity_id);

    this.selectedProfileId = newProfileEntityId;

    // Find the entity in hass.states with this entity_id
    let newProfile = null;
    if (this.hass && this.hass.states) {
      newProfile = this.hass.states[newProfileEntityId];
    }
    if (newProfile) {
      this.profile = newProfile;
      this.spokenNameInput = newProfile.attributes.spoken_name || "";
      this.startingWeightInput = newProfile.attributes.starting_weight?.toString() || "";
      this.goalWeightInput = newProfile.attributes.goal_weight?.toString() || "";
      this.weightUnitInput = newProfile.attributes.weight_unit || 'lbs';
      this.birthYearInput = newProfile.attributes.birth_year?.toString() || "";
      this.sexInput = newProfile.attributes.sex || "";
      this.heightUnitInput = newProfile.attributes.height_unit || 'cm';
      this._setHeightInputsFromValue(newProfile.attributes.height, this.heightUnitInput);
      this.activityMultiplierInput = newProfile.attributes.activity_multiplier?.toString() || "";
    }

    this.dispatchEvent(new CustomEvent("profile-selected", {
      detail: { entityId: newProfileEntityId },
      bubbles: true,
      composed: true,
    }));
    this.showSettings = false;
  }

  async _saveSettings() {
    this.showSettings = false;
    const entityId = this.selectedProfileId || this.profile?.entity_id;
    if (!entityId || !this.hass?.connection) return;

    // Compare previous spoken name to new value
    const prevSpokenName = this.profile?.attributes?.spoken_name || "";
    const spokenNameChanged = prevSpokenName !== this.spokenNameInput;

    try {
      // Validate numeric inputs
      const startingWeight = this._validateNumericInput(this.startingWeightInput, 0);
      const goalWeight = this._validateNumericInput(this.goalWeightInput, 0);
      
      if (this.startingWeightInput && startingWeight === null) {
        this.showPopup = true;
        this.popupType = "error";
        this.popupTitle = "Invalid Starting Weight";
        this.popupMessage = "Please enter a valid starting weight (must be a positive number).";
        return;
      }
      
      if (this.goalWeightInput && goalWeight === null) {
        this.showPopup = true;
        this.popupType = "error";
        this.popupTitle = "Invalid Goal Weight";
        this.popupMessage = "Please enter a valid goal weight (must be a positive number).";
        return;
      }

      const updateData = {
        type: "calorie_tracker/update_profile",
        entity_id: entityId,
        spoken_name: this.spokenNameInput,
        weight_unit: this.weightUnitInput,
        track_macros: Boolean(this.trackMacrosInput),
      };
      
      // Only include weights if they're valid
      if (startingWeight !== null) updateData.starting_weight = startingWeight;
      if (goalWeight !== null) updateData.goal_weight = goalWeight;

      // Only include BMR fields if they have values
      if (this.birthYearInput && this.birthYearInput.toString().trim()) {
        updateData.birth_year = Number(this.birthYearInput);
      }
      if (this.sexInput && this.sexInput.toString().trim()) {
        updateData.sex = this.sexInput;
      }
      // Check if height has been entered (either cm or feet/inches)
      const heightValue = this._getHeightInStorageUnit();
      if (heightValue > 0) {
        updateData.height = heightValue;
        updateData.height_unit = this.heightUnitInput;
      }
      if (this.activityMultiplierInput && this.activityMultiplierInput.toString().trim()) {
        const activityMultiplier = this._validateNumericInput(this.activityMultiplierInput, 1.0, 2.0);
        if (activityMultiplier === null) {
          this.showPopup = true;
          this.popupType = "error";
          this.popupTitle = "Invalid Activity Multiplier";
          this.popupMessage = "Please enter a valid activity multiplier (must be between 1.0 and 2.0).";
          return;
        }
        updateData.activity_multiplier = activityMultiplier;
      }

      const resp = await this.hass.connection.sendMessagePromise(updateData);

      // Save preferred analyzer separately
      await this._savePreferredAnalyzer();

      this.dispatchEvent(new CustomEvent("profiles-updated", { detail: resp.all_profiles, bubbles: true, composed: true }));

      if (spokenNameChanged) {
        this._showPopup(
          "Restart Required",
          "Restart Home Assistant for changes to take effect.",
          "restart"
        );
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      this._showPopup("Error", "Failed to update profile.", "info");
    }
  }

  async _setDefault() {
    const newProfileId = this._pendingProfileId || this.selectedProfileId || this.profile?.entity_id;
    this.selectedProfileId = newProfileId;
    this.dispatchEvent(new CustomEvent("profile-selected", {
      detail: { entityId: newProfileId },
      bubbles: true,
      composed: true,
    }));

    const entityId = newProfileId;
    const userId = this.hass?.user?.id;
    const userName = this.hass?.user?.name || "this user";
    const selectedProfile = this.allProfiles.find(p => p.entity_id === entityId);
    const spokenName = selectedProfile?.spoken_name || "";
    if (!entityId || !userId || !this.hass?.connection) return;
    try {
      const resp = await this.hass.connection.sendMessagePromise({
        type: "calorie_tracker/update_profile",
        entity_id: entityId,
        username: userId,
      });
      this.dispatchEvent(new CustomEvent("profiles-updated", { detail: resp.all_profiles, bubbles: true, composed: true }));
      this._showPopup(
        "Default Profile Set",
        `Default profile set to <b>${spokenName}</b> for <b>${userName}</b>.`,
        "info"
      );
      this.isDefault = true;
    } catch (err) {
      console.error("Failed to set default profile:", err);
      this._showPopup("Error", "Failed to set default profile.", "info");
    }
  }

  _showPopup(title, message, type = "info") {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;
    this.dispatchEvent(new CustomEvent('profile-modal-open', { bubbles: true, composed: true }));
  }

  _closePopup() {
    this.showPopup = false;
    this.dispatchEvent(new CustomEvent('profile-modal-close', { bubbles: true, composed: true }));
  }

  async _restartHass() {
    this.showPopup = false;
    if (this.hass) {
      try {
        await this.hass.callService("homeassistant", "restart");
      } catch (err) {
        this._showPopup("Error", "Failed to restart Home Assistant.", "info");
      }
    }
  }

  async _checkIsDefault() {
    const userId = this.hass?.user?.id;
    if (!userId || !this.hass?.connection) {
      this.isDefault = false;
      return;
    }
    try {
      const result = await this.hass.connection.sendMessagePromise({
        type: "calorie_tracker/get_user_profile",
        user_id: userId,
      });
      const entityId = this.profile?.entity_id;
      this.isDefault = !!result?.default_profile && entityId && result.default_profile.entity_id === entityId;
    } catch (err) {
      this.isDefault = false;
    }
  }

  _confirmRemoveLinkedDevice(idx) {
    // Store the device object to remove
    this.deviceToRemove = this.linkedDevices[idx];
    this.showRemoveLinkedConfirm = true;
    this.dispatchEvent(new CustomEvent('profile-modal-open', { bubbles: true, composed: true }));
  }

  _cancelRemoveLinkedDevice() {
    this.showRemoveLinkedConfirm = false;
    this.deviceToRemove = null;
    this.dispatchEvent(new CustomEvent('profile-modal-close', { bubbles: true, composed: true }));
  }

  async _doRemoveLinkedDevice() {
    if (!this.hass?.connection || !this.deviceToRemove) {
      return;
    }
    const { linked_domain, linked_component_entry_id } = this.deviceToRemove;
    try {
      await this.hass.connection.sendMessagePromise({
        type: "calorie_tracker/unlink_linked_component",
        calorie_tracker_entity_id: this.profile.entity_id,
        linked_domain,
        linked_component_entry_id,
      });
      this._showSnackbar("Device unlinked");
      this.showRemoveLinkedConfirm = false;
      this.deviceToRemove = null;
      // Optionally trigger a refresh of linked devices here
      this.dispatchEvent(new CustomEvent("refresh-profile", { bubbles: true, composed: true }));
    } catch (err) {
      this._showSnackbar("Failed to unlink device", true);
    }
  }

  _getDisplayHeight(heightValue, heightUnit) {
    if (!heightValue) return "";

    if (heightUnit === "in") {
      const feet = Math.floor(heightValue / 12);
      const inches = heightValue % 12;
      return `${feet}'${inches.toString().padStart(2, '0')}"`;
    }

    return `${heightValue} cm`;
  }

  /**
   * Convert percent of body weight per week to absolute weight change per week.
   * percentValue is expected as a number like 0.5 meaning 0.5%.
   */
  _percentToWeightPerWeek(percentValue, currentWeight, weightUnit) {
    if (percentValue == null || currentWeight == null || isNaN(percentValue) || isNaN(currentWeight)) return null;
    // percentValue is percent (e.g., 0.5 = 0.5%) convert to fraction
    const fraction = Number(percentValue) / 100.0;
    const weightChange = Math.abs(currentWeight * fraction);
    // Format: use 1 decimal for kg, 1 decimal for lbs
    return this._formatWeightValue(weightChange, weightUnit);
  }

  _formatWeightValue(value, weightUnit) {
    if (value == null || isNaN(value)) return '';
    // For kg show one decimal, for lbs show one decimal
    const rounded = Math.round(value * 10) / 10;
    return `${rounded}`;
  }

  _setHeightInputsFromValue(heightValue, heightUnit) {
    if (heightUnit === 'in' && heightValue) {
      // Convert total inches to feet and inches
      this.heightFeetInput = Math.floor(heightValue / 12).toString();
      this.heightInchesInput = (heightValue % 12).toString();
      this.heightInput = ""; // Clear the cm input
    } else if (heightUnit === 'cm' && heightValue) {
      // Use cm value directly
      this.heightInput = heightValue.toString();
      this.heightFeetInput = ""; // Clear the feet input
      this.heightInchesInput = ""; // Clear the inches input
    } else {
      // Clear all inputs if no value
      this.heightInput = "";
      this.heightFeetInput = "";
      this.heightInchesInput = "";
    }
  }

  _getHeightInStorageUnit() {
    if (this.heightUnitInput === 'in') {
      // Convert feet and inches to total inches
      const feet = parseInt(this.heightFeetInput) || 0;
      const inches = parseInt(this.heightInchesInput) || 0;
      return feet * 12 + inches;
    } else {
      // Return cm value directly
      return parseInt(this.heightInput) || 0;
    }
  }

  async _loadImageAnalyzersAndPreference() {
    try {
      const hass = this.hass || window?.hass;
      const authToken = hass?.connection?.options?.auth?.accessToken;

      // Fetch available analyzers
      const resp = await fetch('/api/calorie_tracker/fetch_analyzers', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await resp.json();
      this.imageAnalyzers = data.analyzers || [];

      // Fetch current preference for the selected profile using a secure source for config_entry_id
      const targetEntityId = this.selectedProfileId || this.profile?.entity_id;
      const configEntryId = await this._resolveConfigEntryIdForEntity(targetEntityId);
      if (configEntryId) {
        const prefResp = await fetch('/api/calorie_tracker/get_preferred_analyzer', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ config_entry_id: configEntryId })
        });
        const prefData = await prefResp.json();
        this.preferredImageAnalyzer = prefData.preferred_analyzer;
      }
    } catch (err) {
    console.warn('Failed to load image analyzers:', err);
      this.imageAnalyzers = [];
      this.preferredImageAnalyzer = null;
    }
  }

  async _resolveConfigEntryIdForEntity(entityId) {
    try {
      const hass = this.hass || window?.hass;
      if (!hass?.connection || !entityId) return null;
      // If the requested entity matches defaultProfile and it has an id, use it
      if (this.defaultProfile?.entity_id === entityId && this.defaultProfile?.config_entry_id) {
        return this.defaultProfile.config_entry_id;
      }
      // Otherwise, fetch daily data (lightweight) to get config_entry_id for that entity
      const dailyResp = await hass.connection.sendMessagePromise({
        type: 'calorie_tracker/get_daily_data',
        entity_id: entityId,
      });
      return dailyResp?.config_entry_id ?? null;
    } catch (err) {
      console.warn('Failed to resolve config_entry_id for entity:', entityId, err);
      return null;
    }
  }

  _onPreferredAnalyzerChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "") {
      this.preferredImageAnalyzer = null;
    } else {
      // Find the selected analyzer by config_entry
      this.preferredImageAnalyzer = this.imageAnalyzers.find(
        analyzer => analyzer.config_entry === selectedValue
      ) || null;
    }
  };

  async _savePreferredAnalyzer() {
    try {
      const hass = this.hass || window?.hass;
      const authToken = hass?.connection?.options?.auth?.accessToken;
  // Resolve config entry for the currently selected profile (not always the default)
  const targetEntityId = this.selectedProfileId || this.profile?.entity_id;
  const configEntryId = await this._resolveConfigEntryIdForEntity(targetEntityId);


      if (!configEntryId) {
        console.error('No config_entry_id available in profile card defaultProfile');
        return false;
      }

  // Send preferred analyzer to backend

      const resp = await fetch('/api/calorie_tracker/set_preferred_analyzer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config_entry_id: configEntryId,
          analyzer_data: this.preferredImageAnalyzer || null
        })
      });


      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('Profile card HTTP Error:', resp.status, errorText);
        return false;
      }

      const data = await resp.json();

      if (data.success === true) {
        return true;
      } else {
        console.error('Profile card API returned success=false:', data);
        return false;
      }
    } catch (err) {
      console.error('Profile card exception in _savePreferredAnalyzer:', err);
      return false;
    }
  }

  _showSnackbar(message, isError = false) {
    // Always use the event, do not call the frontend service
    this.dispatchEvent(new CustomEvent("hass-notification", {
      detail: { message },
      bubbles: true,
      composed: true,
    }));
  }

  _openGoalPopup = async () => {
    // Fetch fresh goals data from backend before showing modal
    try {
      const entityId = this.selectedProfileId || this.profile?.entity_id;
      if (!entityId || !this.hass?.connection) {
        this._showSnackbar("Unable to load goals data", true);
        return;
      }

      const resp = await this.hass.connection.sendMessagePromise({
        type: "calorie_tracker/get_goals",
        entity_id: entityId,
      });

  // Update goals with fresh data from backend and sort once for display
  this.goals = resp?.goals || [];
  // Add original_start_date to goals array for tracking
  this.goals = this.goals.map((g) => ({ ...g, original_start_date: g.start_date }));
  // Sort goals once when opening modal and store in displayGoals
  this.displayGoals = [...this.goals].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
      this.requestUpdate();
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      this._showSnackbar("Failed to load goals data", true);
      return;
    }

    this.showGoalPopup = true;
    this.dispatchEvent(new CustomEvent('profile-modal-open', { bubbles: true, composed: true }));
  };

  _closeGoalPopup = () => {
    this.showGoalPopup = false;
    this.dispatchEvent(new CustomEvent('profile-modal-close', { bubbles: true, composed: true }));
    // Clear displayGoals and goals to force fresh load next time
    this.displayGoals = null;
    this.goals = [];
  };

  _addGoalRow = () => {
  // Add a new default goal row at the top and mark as temporary 'is_new'
  const today = new Date().toISOString().split('T')[0];
  const newRow = { goal_type: 'fixed_intake', goal_value: 2000, start_date: today, original_start_date: today, is_new: true };
  if (!Array.isArray(this.goals)) this.goals = [];
  if (!Array.isArray(this.displayGoals)) this.displayGoals = [];
  // Insert at the start so it becomes the current goal and pushes others down
  this.goals.unshift(newRow);
  this.displayGoals.unshift(newRow);
  this.requestUpdate();
  };



  _getSortedGoals() {
    // Sort goals by start_date in descending order (most recent first)
    // Preserve original_start_date for tracking edits
    return [...this.goals].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  }

  _getGoalLabel(goal, index) {
    if (goal?.is_new) return 'New Goal';
    if (index === 0) {
      return 'Current Goal';
    }
    return `Previous Goal ${index}`;
  }

  _editGoal = (displayIndex) => {
    const goal = this.displayGoals[displayIndex];
    const newGoalType = prompt('Goal Type:', goal.goal_type);
    const newGoalValue = prompt('Goal Value:', goal.goal_value);
    const newStartDate = prompt('Start Date (YYYY-MM-DD):', goal.start_date);

    if (newGoalType && newGoalValue && newStartDate) {
      this._updateGoalField(displayIndex, 'goal_type', newGoalType, goal.original_start_date);
      this._updateGoalField(displayIndex, 'goal_value', parseFloat(newGoalValue), goal.original_start_date);
      this._updateGoalField(displayIndex, 'start_date', newStartDate, goal.original_start_date);
    } else {
  // Edit cancelled or invalid input
    }
  };

  _updateGoalField = (displayIndex, field, value, original_start_date = undefined) => {
    if (displayIndex >= 0 && displayIndex < this.displayGoals.length && this.displayGoals[displayIndex]) {
  const goalToUpdate = this.displayGoals[displayIndex];

  // Use the original_start_date from the goal being updated, or the provided parameter
  const matchStartDate = original_start_date || goalToUpdate.original_start_date;

  // Find the goal in the main goals array using original_start_date
  const originalIndex = this.goals.findIndex((g) => g.original_start_date === matchStartDate);

      if (originalIndex >= 0) {
        // Convert goal_value to number for validation
        if (field === 'goal_value') {
          const numValue = this._validateNumericInput(value, 0);
          value = numValue !== null ? numValue : value; // Keep original value if invalid for user to see and correct
        }
        
        // Update displayGoals first
        this.displayGoals[displayIndex] = { ...this.displayGoals[displayIndex], [field]: value };

        // Update the corresponding goal in the main goals array
        this.goals[originalIndex] = { ...this.goals[originalIndex], [field]: value };

        // If updating start_date, also update original_start_date to track the new date
        if (field === 'start_date') {
          this.displayGoals[displayIndex].original_start_date = value;
          this.goals[originalIndex].original_start_date = value;
        }
      } else {
        console.error('Could not find goal to update with original_start_date:', matchStartDate);
      }
      this.requestUpdate();
    }
  };

  _deleteGoal = async (displayIndex) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      // Get the goal to delete from displayGoals
      const goalToDelete = this.displayGoals[displayIndex];
      if (!goalToDelete) {
        return;
      }

      // Use original_start_date for consistent matching
      const deleteKey = goalToDelete.original_start_date || goalToDelete.start_date;

      // Remove from displayGoals by original_start_date
      const beforeDisplayCount = this.displayGoals.length;
      this.displayGoals = this.displayGoals.filter(g => g.original_start_date !== deleteKey);

      // Remove from main goals array by original_start_date
      const beforeGoalsCount = this.goals.length;
      this.goals = this.goals.filter(g => g.original_start_date !== deleteKey);

      this.requestUpdate();

      // Save the updated goals to persist the deletion
      try {
        const entityId = this.selectedProfileId || this.profile?.entity_id;
        if (!entityId || !this.hass?.connection) {
    // Cannot save goals: missing entityId or connection
          return;
        }

        const goalsToSave = this.goals.map(({ original_start_date, ...goal }) => goal);


        const result = await this.hass.connection.sendMessagePromise({
          type: "calorie_tracker/save_goals",
          entity_id: entityId,
          goals: goalsToSave,
        });



        // Notify parent component that goals were updated
        this.dispatchEvent(new CustomEvent("goals-updated", {
          detail: { action: 'delete' },
          bubbles: true,
          composed: true,
        }));


      } catch (err) {
        console.error("Failed to delete goal:", err);
        this._showSnackbar("Failed to delete goal", true);
      }
    }
  };

  async _saveGoals() {
    try {
      const entityId = this.selectedProfileId || this.profile?.entity_id;
      if (!entityId || !this.hass?.connection) return;

      // sync displayGoals to goals before saving
      this.goals = Array.isArray(this.displayGoals) ? [...this.displayGoals] : [];

      // Validation
      const today = new Date();
      let errorMsg = "";
      for (let i = 0; i < this.goals.length; i++) {
        const g = this.goals[i];
        // Date must be today or past
        if (!g.start_date) {
          errorMsg = `Goal ${i + 1}: Start date is required.`;
          break;
        }
        const goalDate = new Date(g.start_date);
        if (isNaN(goalDate.getTime())) {
          errorMsg = `Goal ${i + 1}: Invalid start date.`;
          break;
        }
        // Remove time for comparison
        goalDate.setHours(0,0,0,0);
        const todayNoTime = new Date(today);
        todayNoTime.setHours(0,0,0,0);
        if (goalDate > todayNoTime) {
          errorMsg = `Goal ${i + 1}: Start date cannot be in the future.`;
          break;
        }
        // Value validation
        if (g.goal_type === "variable_cut" || g.goal_type === "variable_bulk") {
          if (typeof g.goal_value !== "number" || g.goal_value < 0 || g.goal_value > 2) {
            errorMsg = `Goal ${i + 1}: Percent goal value must be between 0 and 2.`;
            break;
          }
        } else if (g.goal_type === "fixed_intake" || g.goal_type === "fixed_net_calories") {
          if (typeof g.goal_value !== "number" || g.goal_value < 500 || g.goal_value > 5000) {
            errorMsg = `Goal ${i + 1}: Fixed goal value must be between 500 and 5000.`;
            break;
          }
        }
      }
      if (errorMsg) {
        this._showPopup("Invalid Goal", errorMsg, "info");
        return;
      }

      // Sort goals by date before saving (most recent first)
      const sortedGoals = [...this.goals].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  // Clean up goals for backend - remove frontend-only fields (original_start_date, is_new)
  const goalsForBackend = sortedGoals.map(({ original_start_date, is_new, ...goal }) => goal);

      await this.hass.connection.sendMessagePromise({
        type: "calorie_tracker/save_goals",
        entity_id: entityId,
        goals: goalsForBackend,
      });

      this._closeGoalPopup();

      // Notify parent component that goals were updated
      this.dispatchEvent(new CustomEvent("goals-updated", {
        detail: { action: 'save' },
        bubbles: true,
        composed: true,
      }));
    } catch (err) {
      console.error("Failed to save goals:", err);
    }
  }

  _formatGoalDisplay(goal) {
    const weightUnit = this.profile?.attributes?.weight_unit || 'lbs';
    const currentWeight = this.currentWeight;

    if (goal.goal_type === 'fixed_intake' || goal.goal_type === 'fixed_net_calories') {
      return `${goal.goal_value} kcal/day${goal.goal_type === 'fixed_net_calories' ? ' (net)' : ''}`;
    } else if (goal.goal_type === 'variable_cut' && currentWeight) {
      const perWeek = this._percentToWeightPerWeek(goal.goal_value, currentWeight, weightUnit);
      return `${perWeek} ${weightUnit}/wk (lose)`;
    } else if (goal.goal_type === 'variable_bulk' && currentWeight) {
      const perWeek = this._percentToWeightPerWeek(goal.goal_value, currentWeight, weightUnit);
      return `${perWeek} ${weightUnit}/wk (gain)`;
    } else {
      return `${goal.goal_value} (${goal.goal_type})`;
    }
  }
}

customElements.define("profile-card", ProfileCard);