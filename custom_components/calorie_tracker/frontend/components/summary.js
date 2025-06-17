import { LitElement, html, css, svg } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

class CalorieSummary extends LitElement {
  static properties = {
    hass: { attribute: false },
    profile: { attribute: false },
    weeklySummary: { attribute: false },
    selectedDate: { type: String },
    weight: { type: Number },
    _barVisualHeight: { type: Number, state: true },
    _showCalendar: { type: Boolean, state: true },
    _calendarMonth: { type: Number, state: true },
    _calendarYear: { type: Number, state: true },
    _calendarDataDates: { type: Object, state: true },
    _showWeightPopup: { type: Boolean, state: true },
    _weightInput: { type: String, state: true },
    _weightInputError: { type: String, state: true },
  };

  constructor() {
    super();
    this._showCalendar = false;
    const today = new Date();
    this._calendarMonth = today.getMonth();
    this._calendarYear = today.getFullYear();
    this._calendarDataDates = new Set();
    this._showWeightPopup = false;
    this._weightInput = "";
    this._weightInputError = "";
  }

  set hass(value) {
    this._hass = value;
    this.requestUpdate();
  }

  get hass() {
    return this._hass;
  }

  static styles = [
    css`
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 16px;
      gap: 16px;
    }
    .summary-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      max-width: 700px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    .gauge-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .gauge-container {
      position: relative;
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0;
      margin-bottom: 0;
      min-width: 0;
    }
    .gauge-container svg {
      width: 100%;
      height: auto;
      max-width: 140px;
      max-height: 140px;
      display: block;
    }
    .weight-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
      font-size: 15px;
      color: var(--primary-text-color, #333);
    }
    .weight-label {
      font-weight: 500;
    }
    .weight-value-edit-row {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .edit-weight-btn {
      background: none;
      border: none;
      color: var(--primary-color, #2196f3);
      cursor: pointer;
      font-size: 1em;
      padding: 2px 6px;
      margin-left: 4px;
    }
    @media (max-width: 600px) {
      :host,
      .summary-container {
        padding-left: 0;
        padding-right: 0;
        gap: 4px;
      }
      .gauge-container {
        width: 90vw;
        max-width: 90px;
        height: auto;
        margin-top: 8px;
      }
      .gauge-container svg {
        max-width: 90px;
        max-height: 90px;
      }
      .weight-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0;
        font-size: 14px;
      }
      .weight-label,
      .weight-value-edit-row {
        width: 100%;
        text-align: left;
      }
      .weight-label {
        margin-bottom: 2px;
      }
      .weight-value-edit-row {
        margin-top: 0;
        margin-bottom: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 4px;
      }
    }
    .gauge-labels {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .titles {
      font-size: 14px;
      font-weight: bold;
      color: var(--primary-text-color, #333);
      text-align: center;
    }
    .gauge-value {
      font-size: 11px;
      color: var(--secondary-text-color, #666);
      text-align: center;
    }
    .bar-graph-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .bar-graph {
      display: flex;
      align-items: stretch;
      height: 140px;
      gap: 6px;
      padding: 0 8px;
      position: relative;
    }
    .goal-line-horizontal {
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-color, #2196f3);
      opacity: 0.7;
      z-index: 2;
    }
    .bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      position: relative;
      cursor: pointer; /* <-- Add this line */
    }
    .bar:hover {
      cursor: pointer; /* Optional, for extra clarity */
    }
    .bar-visual {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column-reverse;
      background-color: var(--divider-color, #eee);
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 2px;
      overflow: visible;
      position: relative;
      min-height: 0;
    }
    .bar-outline {
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      border: 1px dashed var(--secondary-text-color, #999);
      border-radius: 2px;
      pointer-events: none;
      background: transparent;
    }
    .bar-fill-green {
      width: 100%;
      background-color: #4caf50;
      transition: height 0.3s ease;
    }
    .bar-fill-red {
      width: 100%;
      background-color: #f44336;
      transition: height 0.3s ease;
    }
    .bar-label {
      font-size: 11px;
      line-height: 1;
      text-align: center;
      margin-top: 6px;
      color: var(--primary-text-color, #333);
      flex-shrink: 0;
    }
    .day-label {
      font-size: 11px;
      line-height: 1;
      text-align: center;
      margin-top: 4px;
      opacity: 0.7;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .date-label {
      font-size: 11px;
      line-height: 1;
      text-align: center;
      margin-top: 2px;
      opacity: 0.6;
      letter-spacing: 0.02em;
      flex-shrink: 0;
    }
    .weekly-summary {
      font-size: 16px;
      text-align: center;
      color: var(--primary-text-color, #333);
      font-weight: bold;
    }
    .bar.selected {
      border: 2px solid var(--primary-color, #2196f3);
      border-radius: 4px;
    }
    .calendar-popup,
    .themed-calendar-popup {
      position: absolute;
      z-index: 10;
      top: 36px;
      right: 0;
      left: 0;
      margin: 0 auto;
      max-width: 320px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.15));
      padding: 12px;
      font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
    }
    .themed-calendar-popup th,
    .themed-calendar-popup td {
      text-align: center;
      padding: 2px 0;
      color: var(--primary-text-color, #212121);
      background: transparent;
      border: none;
    }
    .themed-calendar-popup th {
      font-size: 11px;
      color: var(--secondary-text-color, #666);
      background: transparent;
    }
    .themed-calendar-popup td {
      font-size: 14px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.15s;
    }
    .themed-calendar-popup td:hover {
      background: var(--primary-color-light, #e3f2fd);
    }
    .themed-calendar-popup .selected-date {
      background: var(--primary-color, #e3f2fd);
      color: var(--primary-text-color, #212121);
      font-weight: bold;
    }
    .themed-calendar-popup .calendar-close-btn {
      background: none;
      border: none;
      color: var(--primary-color, #2196f3);
      cursor: pointer;
      font-size: 1em;
      padding: 2px 8px;
      border-radius: 4px;
      transition: background 0.15s;
    }
    .themed-calendar-popup .calendar-close-btn:hover {
      background: var(--primary-color-light, #e3f2fd);
    }
    .themed-calendar-popup td.has-entry {
      font-weight: 900;
      color: var(--primary-color, #1976d2);
      text-shadow: 0 1px 2px rgba(33, 150, 243, 0.15);
    }
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.32);
      z-index: 1000;
    }
    .modal-popup {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      padding: 24px;
      border-radius: 12px;
      min-width: 320px;
      max-width: 95vw;
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.2));
      z-index: 1001;
      display: flex;
      flex-direction: column;
      gap: 0;
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
    .edit-actions .ha-btn {
      margin-left: 0;
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border: none;
      border-radius: 4px;
      padding: 8px 18px;
      font-size: 1em;
      cursor: pointer;
      font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      transition: background 0.2s;
      min-width: 64px;
      min-height: 36px;
      font-weight: 500;
      letter-spacing: 0.0892857em;
      text-transform: uppercase;
    }
    .edit-actions .ha-btn:hover {
      background: var(--primary-color-dark, #0288d1);
    }
    .fat-note {
      font-size: 0.95em;
      color: var(--secondary-text-color, #888);
    }
    @media (max-width: 600px) {
      .fat-note {
        display: none;
      }
    }
  `
  ];

  render() {
    if (!this.profile || !this.hass) {
      return html`<p>Loading...</p>`;
    }

    const attrs = this.profile?.attributes ?? {};
    const dailyGoal = attrs.daily_goal ?? 2000;
    const weeklySummary = this.weeklySummary ?? {};
    const weightToday = attrs.weight_today ?? null;

    // Always generate weekDates in Sun-Sat order
    let weekDates;
    const summaryDates = Object.keys(weeklySummary);
    if (summaryDates.length === 7) {
      weekDates = summaryDates;
    } else if (summaryDates.length > 0) {
      const firstDate = new Date(Math.min(...summaryDates.map(d => new Date(d))));
      weekDates = Array.from({length: 7}, (_, i) => {
        const d = new Date(firstDate);
        d.setDate(d.getDate() + i);
        return getLocalDateString(d);
      });
    } else {
      const today = new Date();
      const sunday = new Date(today);
      sunday.setHours(0, 0, 0, 0);
      sunday.setDate(today.getDate() - today.getDay());
      weekDates = Array.from({length: 7}, (_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        return getLocalDateString(d);
      });
    }

    // --- Gauge logic: show for selected day ---
    let gaugeDateStr = this.selectedDate;
    let gaugeTitle = "Today";
    const todayStr = getLocalDateString();
    if (!gaugeDateStr) {
      gaugeDateStr = todayStr;
    }
    if (gaugeDateStr !== todayStr) {
      const d = parseLocalDateString(gaugeDateStr);
      gaugeTitle = `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString(undefined, { month: "short" })} ${d.getFullYear().toString().slice(-2)}`;
    }

    // Find calories and weight for the selected day using weeklySummary and daily_log
    let caloriesForSelectedDay = 0;
    let weightForSelectedDay = this.weight ?? null;
    if (this.log && typeof this.log.net_calories === "number") {
      caloriesForSelectedDay = this.log.net_calories;
    }

    // Try weeklySummary first (for calories)
    if (weeklySummary[gaugeDateStr] !== undefined) {
      caloriesForSelectedDay = weeklySummary[gaugeDateStr] ?? 0;
    }

    // Try daily_log for weight (and calories if not found above)
    if (attrs.daily_log && Array.isArray(attrs.daily_log)) {
      const entry = attrs.daily_log.find(e => e.date === gaugeDateStr);
      if (entry) {
        if (entry.calories !== undefined) {
          caloriesForSelectedDay = entry.calories;
        }
        if (entry.weight !== undefined) {
          weightForSelectedDay = entry.weight;
        }
      }
    }

    // Fallback to today's attributes if still not found and today is selected
    if (gaugeDateStr === todayStr) {
      if (attrs.calories_today !== undefined) {
        caloriesForSelectedDay = attrs.calories_today;
      }
      if (attrs.weight_today !== undefined) {
        weightForSelectedDay = attrs.weight_today;
      }
    }

    // --- Weekly summary logic (unchanged) ---
    const weekValues = weekDates.map(date => weeklySummary[date] ?? 0);

    // Map dates to day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekDayLabels = weekDates.map(date => {
      const d = parseLocalDateString(date);
      return dayNames[d.getDay()];
    });

    // Weekly summary calculations
    const weeklyTotal = weekValues.reduce((sum, v) => v > 0 ? sum + v : sum, 0);
    const daysWithData = weekValues.filter(v => v > 0).length;
    const weeklyGoalTotal = daysWithData * dailyGoal;
    const weeklyDifference = weeklyTotal - weeklyGoalTotal;
    const weeklyText = daysWithData > 0
      ? (weeklyDifference >= 0
          ? `${weeklyDifference} Cal Over`
          : `${Math.abs(weeklyDifference)} Cal Under`)
      : '';

    // Goal line position (element bar-visual is 1.4*daily_goal)
    const barVisualHeight = this._barVisualHeight || 95;
    const goalLinePositionFromTop = (1 - (1 / 1.4)) * (barVisualHeight);

    // Only use weeklySummary keys (dates with calories > 0)
    const allDataDates = new Set(
      Object.entries(weeklySummary)
        .filter(([_, val]) => val > 0)
        .map(([date]) => date)
    );

    return html`
      <div class="summary-container">
        <div class="gauge-section">
          <div class="gauge-labels">
            <div class="titles">${gaugeTitle}</div>
          </div>
          <div class="gauge-container">
            ${this._renderGauge(caloriesForSelectedDay, dailyGoal)}
          </div>
          <div class="weight-row">
            <div class="weight-label">Weight:</div>
            <div class="weight-value-edit-row">
              <span class="weight-value">
                ${weightForSelectedDay !== null && weightForSelectedDay !== undefined ? `${weightForSelectedDay} lbs` : "None"}
              </span>
              <button class="edit-weight-btn" @click=${this._editWeight}>✏️</button>
            </div>
          </div>
        </div>
        <div class="bar-graph-section">
          <div class="titles" style="display:flex; align-items:center; justify-content:center; gap:8px; position:relative;">
            <button class="week-nav-btn" @click=${() => this._changeWeek(-1)} title="Previous week" style="background:none;border:none;cursor:pointer;padding:0 4px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            Weekly Summary
            <button class="week-nav-btn" @click=${() => this._changeWeek(1)} title="Next week" style="background:none;border:none;cursor:pointer;padding:0 4px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
            <button class="calendar-btn" @click=${() => this._toggleCalendar()} title="Pick week from calendar"
              style="background:none;border:none;cursor:pointer;padding:0 4px; margin-left:8px;">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"/>
              </svg>
            </button>
          </div>
          ${this._showCalendar ? this._renderCalendar(allDataDates) : ""}
          <div class="bar-graph">
            <div
              class="goal-line-horizontal"
              style="top: ${goalLinePositionFromTop}px; bottom: auto;"
            ></div>
            ${weekDates.map((date, index) => {
              const value = weeklySummary[date] ?? 0;
              const maxRepresentableValue = dailyGoal * 1.4;
              const cappedValue = Math.min(value, maxRepresentableValue);
              const greenValue = Math.min(dailyGoal, value);
              const greenHeightPercent = (greenValue / maxRepresentableValue) * 100;
              const redValue = cappedValue > dailyGoal ? (cappedValue - dailyGoal) : 0;
              const redHeightPercent = (redValue / maxRepresentableValue) * 100;
              const d = parseLocalDateString(date);
              const dateLabel = `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString(undefined, { month: "short" })}`;
              const isSelected = this.selectedDate === date;
              return html`
                <div
                  class="bar${isSelected ? ' selected' : ''}"
                  style="cursor:pointer"
                  @click=${() => this._onBarClick(date)}
                  title="Show details for ${dateLabel}"
                >
                  <div class="bar-visual">
                    <div class="bar-outline"></div>
                    <div
                      class="bar-fill-green"
                      style="height: ${greenHeightPercent}%"
                    ></div>
                    <div
                      class="bar-fill-red"
                      style="height: ${redHeightPercent}%"
                    ></div>
                  </div>
                  <div class="bar-label">${value}</div>
                  <div class="day-label">${weekDayLabels[index]}</div>
                  <div class="date-label">${dateLabel}</div>
                </div>
              `;
            })}
          </div>
          ${weeklyText ? html`
            <div class="weekly-summary" style="color: ${weeklyDifference >= 0 ? '#f44336' : '#4caf50'};">
              ${weeklyText}
              <span class="fat-note" style="color: var(--secondary-text-color, #888); font-size: 12px; margin-left: 8px;">
                (1 lb of body fat ≈3,500 Cal)
              </span>
            </div>
          ` : ''}
        </div>
        ${this._showWeightPopup ? html`
          <div class="modal-backdrop" @click=${this._closeWeightPopup}></div>
          <div class="modal-popup" @click=${e => e.stopPropagation()}>
            <div class="modal-header">
              Edit Weight for
              ${(() => {
                const d = this.selectedDate ? new Date(this.selectedDate) : new Date();
                return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString(undefined, { month: "short" })} ${d.getFullYear()}`;
              })()}
            </div>
            <div class="edit-grid" style="margin-bottom: 0;">
              <div class="edit-label">Weight</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                step="0.1"
                .value=${this._weightInput}
                @input=${this._onWeightInputChange}
                placeholder="Enter weight in lbs"
                style="width: 100%;"
              />
            </div>
            ${this._weightInputError ? html`
              <div style="color: #f44336; font-size: 0.95em; margin-bottom: 8px;">
                ${this._weightInputError}
              </div>
            ` : ""}
            <div class="edit-actions">
              <button class="ha-btn" @click=${this._saveWeight}>Save</button>
              <button class="ha-btn" @click=${this._closeWeightPopup}>Cancel</button>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  firstUpdated() {
    this._measureBarVisualHeight();
    window.addEventListener('resize', () => this._measureBarVisualHeight());
  }

  _measureBarVisualHeight() {
    const barVisual = this.renderRoot.querySelector('.bar-visual');
    if (barVisual) {
      const height = barVisual.offsetHeight;
      if (height !== this._barVisualHeight) {
        this._barVisualHeight = height;
      }
    }
  }

  _renderGauge(currentValue, goalValue) {
    const maxValue = goalValue * 1.5;
    const center = { x: 70, y: 70 };
    const radius = 40;
    const strokeWidth = 8;

    // Gauge spans 180 degrees (semicircle), from -180 to 0 degrees
    const startAngle = -180;
    const endAngle = 0;
    const totalAngle = endAngle - startAngle;

    // Calculate needle angle
    const valueRatio = Math.max(Math.min(currentValue / maxValue, 1), 0);
    const needleAngle = startAngle + (valueRatio * totalAngle);

    // Calculate arc paths
    const goalRatio = goalValue / maxValue;
    const goalAngle = startAngle + (goalRatio * totalAngle);

    // Convert angles to radians for calculations
    const toRadians = (deg) => (deg * Math.PI) / 180;

    // Create arc path
    const createArcPath = (startA, endA, r) => {
      const startRad = toRadians(startA);
      const endRad = toRadians(endA);
      const x1 = center.x + r * Math.cos(startRad);
      const y1 = center.y + r * Math.sin(startRad);
      const x2 = center.x + r * Math.cos(endRad);
      const y2 = center.y + r * Math.sin(endRad);
      const largeArc = Math.abs(endA - startA) > 180 ? 1 : 0;
      return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
    };

    // Calculate tick marks and labels every 500 calories
    const tickInterval = 500;
    const ticks = [];
    for (let value = 0; value <= maxValue; value += tickInterval) {
      const ratio = value / maxValue;
      const angle = startAngle + (ratio * totalAngle);
      const angleRad = toRadians(angle);

      const tickRadius = radius + 5;
      const tickEndRadius = radius + 12;
      const labelRadius = radius + 20;

      const x1 = center.x + tickRadius * Math.cos(angleRad);
      const y1 = center.y + tickRadius * Math.sin(angleRad);
      const x2 = center.x + tickEndRadius * Math.cos(angleRad);
      const y2 = center.y + tickEndRadius * Math.sin(angleRad);
      const labelX = center.x + labelRadius * Math.cos(angleRad);
      const labelY = center.y + labelRadius * Math.sin(angleRad);

      ticks.push({
        line: `M ${x1} ${y1} L ${x2} ${y2}`,
        label: { x: labelX, y: labelY, value: value }
      });
    }

    // Calculate needle points
    const needleRad = toRadians(needleAngle);
    const needleLength = radius - 5;
    const needleX = center.x + needleLength * Math.cos(needleRad);
    const needleY = center.y + needleLength * Math.sin(needleRad);

    return svg`
      <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
        <!-- Background arc -->
        <path
          d="${createArcPath(startAngle, endAngle, radius)}"
          fill="none"
          stroke="#eee"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
        />

        <!-- Green arc (0 to goal) -->
        <path
          d="${createArcPath(startAngle, goalAngle, radius)}"
          fill="none"
          stroke="#4caf50"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
        />

        <!-- Red arc (goal to current, if over goal) -->
        <path
          d="${createArcPath(goalAngle, endAngle, radius)}"
          fill="none"
          stroke="#f44336"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
        />

        <!-- Tick marks -->
        ${ticks.map(tick => svg`
          <path
            d="${tick.line}"
            stroke="var(--secondary-text-color, #666)"
            stroke-width="1"
          />
        `)}

        <!-- Tick labels -->
        ${ticks.map(tick => svg`
          <text
            x="${tick.label.x}"
            y="${tick.label.y}"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="9"
            fill="var(--secondary-text-color, #666)"
          >
            ${tick.label.value}
          </text>
        `)}

        <!-- Needle -->
        <line
          x1="${center.x}"
          y1="${center.y}"
          x2="${needleX}"
          y2="${needleY}"
          stroke="var(--primary-text-color, #333)"
          stroke-width="2"
          stroke-linecap="round"
        />

        <!-- Center dot -->
        <circle
          cx="${center.x}"
          cy="${center.y}"
          r="3"
          fill="var(--primary-text-color, #333)"
        />

        <!-- Current value label -->
        <text
          x="${center.x}"
          y="${center.y + radius -5}"
          text-anchor="middle"
          font-size="16"
          fill="${currentValue <= goalValue ? '#4caf50' : '#f44336'}"
        >
          ${currentValue} Cal
        </text>

        <!-- Over/Under label -->
        <text
          x="${center.x}"
          y="${center.y + radius + 8}"
          text-anchor="middle"
          font-size="12"
          fill="${currentValue <= goalValue ? '#4caf50' : '#f44336'}"
        >
          ${currentValue - goalValue >= 0
            ? `${currentValue - goalValue} Over`
            : `${goalValue - currentValue} Under`}
        </text>
      </svg>
    `;
  }

  _onBarClick(date) {
    this.dispatchEvent(new CustomEvent("select-summary-date", {
      detail: { date },
      bubbles: true,
      composed: true,
    }));
  }

  _changeWeek(direction) {
    let currentSunday;
    if (this.weeklySummary && Object.keys(this.weeklySummary).length > 0) {
      currentSunday = new Date(Object.keys(this.weeklySummary)[0]);
    } else {
      const today = new Date();
      currentSunday = new Date(today);
      currentSunday.setDate(today.getDate() - today.getDay());
    }
    currentSunday.setDate(currentSunday.getDate() + direction * 7);
    const targetDate = getLocalDateString(currentSunday);
    this.dispatchEvent(new CustomEvent("select-summary-date", {
      detail: { date: targetDate },
      bubbles: true,
      composed: true,
    }));
  }

  _toggleCalendar() {
    this._showCalendar = !this._showCalendar;
    if (this._showCalendar && this.selectedDate) {
      const d = new Date(this.selectedDate);
      this._calendarMonth = d.getMonth();
      this._calendarYear = d.getFullYear();
      this._fetchCalendarDataDates();
    }
  }

  async _fetchCalendarDataDates() {
    if (!this.hass || !this.profile) return;
    const entityId = this.profile.entity_id;
    const year = this._calendarYear;
    const month = this._calendarMonth + 1; // JS: 0-based, backend: 1-based
    try {
      const resp = await this.hass.connection.sendMessagePromise({
        type: "calorie_tracker/get_month_data_days",
        entity_id: entityId,
        year,
        month,
      });
      this._calendarDataDates = new Set(resp.days || []);
    } catch (err) {
      this._calendarDataDates = new Set();
    }
  }

  _changeCalendarMonth(delta) {
    let month = this._calendarMonth + delta;
    let year = this._calendarYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    this._calendarMonth = month;
    this._calendarYear = year;
    this._fetchCalendarDataDates();
  }

  _changeCalendarYear(delta) {
    this._calendarYear += delta;
    this._fetchCalendarDataDates();
  }

  _renderCalendar(allDataDates) {
    const month = this._calendarMonth;
    const year = this._calendarYear;
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks = [];
    let week = [];
    for (let i = 0; i < startDay; i++) week.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    const hasData = (d) => {
      if (!d) return false;
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      return this._calendarDataDates.has(dateStr);
    };

    const selectDate = (d) => {
      if (!d) return;
      const date = new Date(year, month, d);
      const selected = getLocalDateString(date);
      this._showCalendar = false;
      this.dispatchEvent(new CustomEvent("select-summary-date", {
        detail: { date: selected },
        bubbles: true,
        composed: true,
      }));
    };

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return html`
      <div class="calendar-popup themed-calendar-popup">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <button @click=${() => this._changeCalendarMonth(-1)} style="background:none;border:none;cursor:pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <span style="font-weight:bold;">
            ${monthNames[month]} ${year}
          </span>
          <button @click=${() => this._changeCalendarMonth(1)} style="background:none;border:none;cursor:pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;">
          <button @click=${() => this._changeCalendarYear(-1)} style="background:none;border:none;cursor:pointer;font-size:12px;">« Prev Year</button>
          <button @click=${() => this._changeCalendarYear(1)} style="background:none;border:none;cursor:pointer;font-size:12px;">Next Year »</button>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="font-size:11px;">Sun</th>
              <th style="font-size:11px;">Mon</th>
              <th style="font-size:11px;">Tue</th>
              <th style="font-size:11px;">Wed</th>
              <th style="font-size:11px;">Thu</th>
              <th style="font-size:11px;">Fri</th>
              <th style="font-size:11px;">Sat</th>
            </tr>
          </thead>
          <tbody>
            ${weeks.map(week => html`
              <tr>
                ${week.map(day => {
                  const isSelected = day && this.selectedDate && this._isSameDay(year, month, day, this.selectedDate);
                  const hasEntry = hasData(day);
                  return html`
                    <td
                      class=${[
                        isSelected ? 'selected-date' : '',
                        hasEntry ? 'has-entry' : ''
                      ].join(' ')}
                      style="
                        text-align:center;
                        padding:2px 0;
                        cursor:${day ? 'pointer' : 'default'};
                        border-radius:4px;
                      "
                      @click=${() => selectDate(day)}
                    >
                      ${day ? day : ''}
                    </td>
                  `;
                })}
              </tr>
            `)}
          </tbody>
        </table>
        <div style="text-align:right;margin-top:8px;">
          <button @click=${() => this._showCalendar = false} class="calendar-close-btn">Close</button>
        </div>
      </div>
    `;
  }

  _changeCalendarMonth(delta) {
    let month = this._calendarMonth + delta;
    let year = this._calendarYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    this._calendarMonth = month;
    this._calendarYear = year;
    this._fetchCalendarDataDates();
  }

  _changeCalendarYear(delta) {
    this._calendarYear += delta;
    this._fetchCalendarDataDates();
  }

  _isSameDay(year, month, day, dateStr) {
    const d = new Date(dateStr);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  }

  _editWeight = () => {
    let weight = "";
    if (this.selectedDate && this.profile?.attributes?.daily_log) {
      const entry = this.profile.attributes.daily_log.find(e => e.date === this.selectedDate);
      if (entry && entry.weight !== undefined && entry.weight !== null) {
        weight = entry.weight.toString();
      }
    } else if (this.profile?.attributes?.weight_today && this.selectedDate === getLocalDateString()) {
      weight = this.profile.attributes.weight_today.toString();
    }
    this._weightInput = this.weight !== undefined && this.weight !== null ? this.weight.toString() : "";
    this._weightInputError = "";
    this._showWeightPopup = true;
  };

  _closeWeightPopup = () => {
    this._showWeightPopup = false;
    this._weightInputError = "";
  };

  _onWeightInputChange = (e) => {
    this._weightInput = e.target.value;
    this._weightInputError = "";
  };

  async _saveWeight() {
    const weight = parseFloat(this._weightInput);
    if (isNaN(weight) || weight <= 0) {
      this._weightInputError = "Please enter a valid weight.";
      return;
    }
    if (this.hass && this.profile) {
      try {
        await this.hass.connection.sendMessagePromise({
          type: "calorie_tracker/log_weight",
          entity_id: this.profile.entity_id,
          weight,
          date: this.selectedDate || getLocalDateString(),
        });
        this._showWeightPopup = false;
        this._weightInputError = "";
        this.dispatchEvent(new CustomEvent("refresh-summary", { bubbles: true, composed: true }));
      } catch (err) {
        this._weightInputError = "Failed to save weight.";
      }
    }
  }
}

customElements.define('calorie-summary', CalorieSummary);
