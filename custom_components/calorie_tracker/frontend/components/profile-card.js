import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class ProfileCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    profile: { attribute: false },
    isDefault: { type: Boolean },
    showSettings: { type: Boolean },
    spokenNameInput: { type: String },
    calorieGoalInput: { type: Number },
    startingWeightInput: { type: Number },
    goalWeightInput: { type: Number },
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
    includeExerciseInNetInput: { type: Boolean },
    birthYearInput: { type: String },
    sexInput: { type: String },
    heightInput: { type: String },
    heightUnitInput: { type: String },
    heightFeetInput: { type: String },
    heightInchesInput: { type: String },
    bodyFatPctInput: { type: String },
    preferredImageAnalyzer: { attribute: false },
    imageAnalyzers: { attribute: false },
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
        gap: 12px;
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
        min-width: 90px;
        margin-right: 8px;
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
      .settings-actions .ha-btn {
        margin-left: 0;
        min-width: 90px;
      }
      .settings-footer {
        margin-top: 12px;
        display: flex;
        justify-content: flex-end;
      }
    `
  ];

  constructor() {
    super();
    this.isDefault = false;
    this.showSettings = false;
    this.spokenNameInput = "";
    this.calorieGoalInput = 0;
    this.startingWeightInput = 0;
    this.goalWeightInput = 0;
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
    this.includeExerciseInNetInput = true;
    this.birthYearInput = "";
    this.sexInput = "";
    this.heightInput = "";
    this.heightUnitInput = "cm";
    this.heightFeetInput = "";
    this.heightInchesInput = "";
    this.bodyFatPctInput = "";
  }

  render() {
    const spokenName = this.profile?.attributes?.spoken_name || "";
    const dailyGoal = this.profile?.attributes?.daily_goal ?? null;
    const startingWeight = this.profile?.attributes?.starting_weight ?? null;
    const goalWeight = this.profile?.attributes?.goal_weight ?? null;
    const includeExerciseInNet = this.profile?.attributes?.include_exercise_in_net !== false;
    const linkedDevicesArr = Array.isArray(this.linkedDevices)
      ? this.linkedDevices
      : (this.linkedDevices && typeof this.linkedDevices === 'object')
        ? Object.values(this.linkedDevices).flat()
        : [];
    return html`
      <div class="profile-card">
        <div class="profile-name-col">
          <span class="spoken-name">${spokenName}</span>
          ${this.isDefault
            ? html`<span class="default-label">(Default)</span>`
            : ""}
        </div>
        <div class="profile-details-stack">
          ${dailyGoal !== null
            ? html`<span class="profile-detail">
                Daily Goal:&nbsp;&nbsp;<b>${dailyGoal} Cal</b>
              </span>`
            : ""}
        </div>
        <button class="settings-btn" @click=${this._openSettings} title="Settings">
          <svg viewBox="0 0 24 24">
            <path class="primary-path" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"></path>
          </svg>
        </button>
        ${this.showSettings ? html`
          <div class="modal" @click=${this._closeSettings}>
            <div class="modal-content" @click=${e => e.stopPropagation()}>
              <div class="modal-header">Settings</div>
              <div class="settings-profile-row" style="display: flex; align-items: center; gap: 18px;">
                <div class="settings-label">Profile</div>
                <select class="settings-input"
                  @change=${e => this._pendingProfileId = e.target.value}
                >
                  ${this.allProfiles.map(
                    p => html`
                      <option value=${p.entity_id} ?selected=${p.entity_id === (this.selectedProfileId || this.profile?.entity_id)}>
                        ${p.spoken_name || p.entity_id}
                      </option>
                    `
                  )}
                </select>
              </div>
              <div class="settings-profile-actions" style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;">
                <button class="ha-btn" @click=${this._selectProfileFromDropdown}>Select</button>
                <button class="ha-btn" @click=${this._setDefault}>Set as Default Profile</button>
              </div>
              <div style="height: 18px;"></div>
              <div class="settings-grid" style="margin-top: 0;">
                <div class="settings-label">Spoken Name</div>
                <input class="settings-input"
                  .value=${this.spokenNameInput}
                  @input=${e => (this.spokenNameInput = e.target.value)}
                />
                <div class="settings-label">Daily Calorie Goal</div>
                <input class="settings-input"
                  type="number"
                  min="0"
                  .value=${this.calorieGoalInput}
                  @input=${e => (this.calorieGoalInput = e.target.value)}
                />
                <div class="settings-label">Starting Weight</div>
                <input class="settings-input"
                  type="number"
                  min="0"
                  .value=${this.startingWeightInput}
                  @input=${e => (this.startingWeightInput = e.target.value)}
                />
                <div class="settings-label">Goal Weight</div>
                <input class="settings-input"
                  type="number"
                  min="0"
                  .value=${this.goalWeightInput}
                  @input=${e => (this.goalWeightInput = e.target.value)}
                />
                <div class="settings-label">Weight Units</div>
                <div style="display:flex;gap:16px;align-items:center;">
                  <label><input type="radio" name="weight-unit" value="lbs" .checked=${this.weightUnitInput === 'lbs'} @change=${e => this.weightUnitInput = e.target.value} /> lbs</label>
                  <label><input type="radio" name="weight-unit" value="kg" .checked=${this.weightUnitInput === 'kg'} @change=${e => this.weightUnitInput = e.target.value} /> kg</label>
                </div>
                <div class="settings-label">Include Exercise In Net</div>
                <div style="display:flex;align-items:center;gap:12px;">
                  <label style="display:flex;align-items:center;gap:6px;">
                    <input type="checkbox" .checked=${this.includeExerciseInNetInput} @change=${e => this.includeExerciseInNetInput = e.target.checked} />
                    <span style="font-size:0.9em;">Subtract exercise from total when calculating calories towards the daily goal.</span>
                  </label>
                </div>
              </div>

              <!-- BMR Section -->
              <div style="width: 100%; margin: 16px 0 8px 0; border-top: 1px solid var(--divider-color, #e0e0e0); padding-top: 16px;">
                <div style="font-weight: 500; margin-bottom: 12px; font-size: 1.1em;">Baseline Calorie Burn Metrics</div>
                <div class="settings-grid" style="margin-bottom: 0;">
                  <div class="settings-label">Birth Year</div>
                  <input class="settings-input"
                    type="number"
                    min="1900"
                    max="2025"
                    .value=${this.birthYearInput || ''}
                    @input=${e => (this.birthYearInput = e.target.value)}
                  />
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
                  ${this.heightUnitInput === 'in'
                    ? html`
                        <div style="display:flex;gap:8px;align-items:center;">
                          <input class="settings-input"
                            type="number"
                            min="3"
                            max="8"
                            .value=${this.heightFeetInput || ''}
                            @input=${e => (this.heightFeetInput = e.target.value)}
                            placeholder="ft"
                            style="width: 60px;"
                          />
                          <span>ft</span>
                          <input class="settings-input"
                            type="number"
                            min="0"
                            max="11"
                            .value=${this.heightInchesInput || ''}
                            @input=${e => (this.heightInchesInput = e.target.value)}
                            placeholder="in"
                            style="width: 60px;"
                          />
                          <span>in</span>
                        </div>
                      `
                    : html`
                        <input class="settings-input"
                          type="number"
                          min="100"
                          max="250"
                          .value=${this.heightInput || ''}
                          @input=${e => (this.heightInput = e.target.value)}
                          placeholder="Height in cm"
                        />
                      `
                  }
                  <div class="settings-label">Body Fat %</div>
                  <input class="settings-input"
                    type="number"
                    min="3"
                    max="50"
                    step="0.1"
                    placeholder="Optional"
                    .value=${this.bodyFatPctInput || ''}
                    @input=${e => (this.bodyFatPctInput = e.target.value)}
                  />
                  <div class="settings-label" style="display:flex;align-items:center;gap:6px;">Activity Multiplier
                    <button @click=${() => this._showPopup('Activity Multiplier', `Your amount of calories you burn is highly dependent on how active you are.<br>This multiplier is used to estimate the calories burned from your daily routine.<br><br><b>NOTE</b> - Do not double count workouts. If you plan to manually log workouts, do not include them in this estimate.<br><ul style='margin:8px 0 8px 18px;padding:0;'><li><b>1.1</b>: Use 1.1 if you plan to manually log all exercise (e.g. calories burned from a daily step counter).</li><li><b>1.2</b>: Low activity (desk work, &lt;5,000 steps/day)</li><li><b>1.275</b>: Light activity (5,000-7,500 steps/day)</li><li><b>1.35</b>: Moderate activity (7,500-10,000 steps/day)</li><li><b>1.425</b>: High activity (10,000-12,500 steps/day)</li><li><b>1.5</b>: Very active (15,000 steps/day))</li></ul>Choose a value that best matches your typical day. This helps improve the accuracy of your weight gain/loss predictions.`, 'info')} style="background:none;border:none;padding:0;margin:0;cursor:pointer;">
                      <svg width="24" height="24" viewBox="0 0 24 24" style="vertical-align:middle;">
                        <path class="primary-path" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" fill="var(--primary-color, #03a9f4)"/>
                      </svg>
                    </button>
                  </div>
                  <input class="settings-input"
                    type="number"
                    min="1.0"
                    max="2.0"
                    step=any
                    placeholder="e.g. 1.2"
                    .value=${this.activityMultiplierInput || ''}
                    @input=${e => (this.activityMultiplierInput = e.target.value)}
                  />
                </div>
              </div>

              <!-- Image Analyzer Preference Section -->
              <div style="width: 100%; margin: 16px 0 8px 0; border-top: 1px solid var(--divider-color, #e0e0e0); padding-top: 16px;">
                <div style="font-weight: 500; margin-bottom: 12px; font-size: 1.1em;">Photo Analysis</div>
                <div class="settings-grid" style="margin-bottom: 0;">
                  <div class="settings-label">Preferred Image Analyzer</div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <select class="settings-input" @change=${this._onPreferredAnalyzerChange}>
                      <option value="" .selected=${!this.preferredImageAnalyzer}>Select each time</option>
                      ${(this.imageAnalyzers || []).map(analyzer => html`
                        <option
                          value=${analyzer.config_entry}
                          .selected=${this.preferredImageAnalyzer?.config_entry === analyzer.config_entry}
                        >
                          ${analyzer.name} (${analyzer.model || 'Unknown model'})
                        </option>
                      `)}
                    </select>
                    <div style="font-size: 0.85em; color: var(--secondary-text-color, #666); line-height: 1.3;">
                      When set, this analyzer will be automatically used when you click the camera button for food or body fat analysis.
                    </div>
                  </div>
                </div>
              </div>

              <div style="width: 100%; margin: 8px 0 0 0;">
                <div style="font-weight: 500; margin-bottom: 2px;">Linked Components:</div>
                ${!linkedDevicesArr.length
                  ? html`<div style="color: var(--secondary-text-color, #888);">None</div>`
                  : html`
                      <ul style="list-style: none; padding: 0 0 0 18px; margin: 0;">
                        ${linkedDevicesArr.map((dev, idx) => html`
                          <li style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                            <span style="font-size: 0.97em;">
                                ${dev && dev.linked_domain
                                  ? (dev.linked_domain === "peloton"
                                      ? html`<b>${dev.title}</b>`
                                      : html`<b>${dev.linked_domain}</b>: ${dev.title || dev.user_id}`
                                    )
                                  : html`<b>?</b> ${JSON.stringify(dev)}`
                                }
                            </span>
                            <button title="Unlink" style="background: none; border: none; cursor: pointer; color: var(--error-color, #f44336); padding: 2px; font-size: 0.97em; text-decoration: underline;" @click=${() => this._confirmRemoveLinkedDevice(idx)}>
                              Unlink
                            </button>
                          </li>
                        `)}
                      </ul>
                    `}
              </div>
              <div class="settings-actions" style="display: flex; gap: 12px; margin-top: 12px;">
                <button class="ha-btn" @click=${this._saveSettings}>Save</button>
                <button class="ha-btn" @click=${this._closeSettings}>Close</button>
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
      this.calorieGoalInput = this.profile?.attributes?.daily_goal || "";
      this.startingWeightInput = this.profile?.attributes?.starting_weight || "";
      this.goalWeightInput = this.profile?.attributes?.goal_weight || "";
      this.weightUnitInput = this.profile?.attributes?.weight_unit || 'lbs';
      this.includeExerciseInNetInput = this.profile?.attributes?.include_exercise_in_net !== false;
      this.birthYearInput = this.profile?.attributes?.birth_year?.toString() || "";
      this.sexInput = this.profile?.attributes?.sex || "";
      this.heightUnitInput = this.profile?.attributes?.height_unit || 'cm';
      this._setHeightInputsFromValue(this.profile?.attributes?.height, this.heightUnitInput);
      this.bodyFatPctInput = this.profile?.attributes?.body_fat_pct?.toString() || "";
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

  _openSettings = async () => {
    this.showSettings = true;
    this.spokenNameInput = this.profile?.attributes?.spoken_name || "";
    this.calorieGoalInput = this.profile?.attributes?.daily_goal || "";
    this.startingWeightInput = this.profile?.attributes?.starting_weight || "";
    this.goalWeightInput = this.profile?.attributes?.goal_weight || "";
    this.selectedProfileId = this.profile?.entity_id || (this.allProfiles[0]?.entity_id ?? "");
    this.weightUnitInput = this.profile?.attributes?.weight_unit || 'lbs';
    this.includeExerciseInNetInput = this.profile?.attributes?.include_exercise_in_net !== false;
    this.birthYearInput = this.profile?.attributes?.birth_year?.toString() || "";
    this.sexInput = this.profile?.attributes?.sex || "";
    this.heightUnitInput = this.profile?.attributes?.height_unit || 'cm';
    this._setHeightInputsFromValue(this.profile?.attributes?.height, this.heightUnitInput);
    this.bodyFatPctInput = this.profile?.attributes?.body_fat_pct?.toString() || "";
    this.activityMultiplierInput = this.profile?.attributes?.activity_multiplier?.toString() || "";

    // Load image analyzers and preferred analyzer
    await this._loadImageAnalyzersAndPreference();
  };

  _closeSettings = () => {
    this.showSettings = false;
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
      this.calorieGoalInput = newProfile.attributes.daily_goal || "";
      this.startingWeightInput = newProfile.attributes.starting_weight || "";
      this.goalWeightInput = newProfile.attributes.goal_weight || "";
      this.weightUnitInput = newProfile.attributes.weight_unit || 'lbs';
      this.includeExerciseInNetInput = newProfile.attributes.include_exercise_in_net !== false;
      this.birthYearInput = newProfile.attributes.birth_year?.toString() || "";
      this.sexInput = newProfile.attributes.sex || "";
      this.heightUnitInput = newProfile.attributes.height_unit || 'cm';
      this._setHeightInputsFromValue(newProfile.attributes.height, this.heightUnitInput);
      this.bodyFatPctInput = newProfile.attributes.body_fat_pct?.toString() || "";
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
      const updateData = {
        type: "calorie_tracker/update_profile",
        entity_id: entityId,
        spoken_name: this.spokenNameInput,
        daily_goal: Number(this.calorieGoalInput),
        starting_weight: Number(this.startingWeightInput),
        goal_weight: Number(this.goalWeightInput),
        weight_unit: this.weightUnitInput,
        include_exercise_in_net: this.includeExerciseInNetInput,
      };

      // Only include BMR fields if they have values
      if (this.birthYearInput && this.birthYearInput.trim()) {
        updateData.birth_year = Number(this.birthYearInput);
      }
      if (this.sexInput && this.sexInput.trim()) {
        updateData.sex = this.sexInput;
      }
      // Check if height has been entered (either cm or feet/inches)
      const heightValue = this._getHeightInStorageUnit();
      if (heightValue > 0) {
        updateData.height = heightValue;
        updateData.height_unit = this.heightUnitInput;
      }
      if (this.bodyFatPctInput && this.bodyFatPctInput.trim()) {
        updateData.body_fat_pct = Number(this.bodyFatPctInput);
      }
      if (this.activityMultiplierInput && this.activityMultiplierInput.trim()) {
        updateData.activity_multiplier = Number(this.activityMultiplierInput);
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
  }

  _closePopup() {
    this.showPopup = false;
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
  }

  _cancelRemoveLinkedDevice() {
    this.showRemoveLinkedConfirm = false;
    this.deviceToRemove = null;
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

      // Fetch current preference
      const configEntryId = this.profile?.attributes?.config_entry_id;
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
      const configEntryId = this.profile?.attributes?.config_entry_id;

      if (!configEntryId) return false;

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
      const data = await resp.json();
      return data.success === true;
    } catch (err) {
      console.warn('Failed to save preferred analyzer:', err);
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
}

customElements.define("profile-card", ProfileCard);