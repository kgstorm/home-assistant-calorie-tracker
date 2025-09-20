import { BaseElement, html, css, svg, renderToShadowRoot } from '../base-element.js';

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

class CalorieSummary extends BaseElement {
  constructor() {
    super();
    // Public-ish inputs
    this._hass = undefined;
    this.profile = undefined;
    this.weeklySummary = undefined;
    this.selectedDate = undefined;
    this.weight = undefined;
    // Internal state
    this._barVisualHeight = 95;
    this._showCalendar = false;
    const today = new Date();
    this._calendarMonth = today.getMonth();
    this._calendarYear = today.getFullYear();
    this._calendarDataDates = new Set();
    // Weight popup state (stubs maintained for compatibility)
    this._showWeightPopup = false;
    this._weightInput = '';
    this._weightInputError = '';
  }

  // External property setters to trigger re-render
  set hass(v) { this._hass = v; this.requestUpdate(); }
  get hass() { return this._hass; }
  set weeklySummary(v) { this._weeklySummary = v; this.requestUpdate(); }
  get weeklySummary() { return this._weeklySummary; }
  set selectedDate(v) { this._selectedDate = v; this.requestUpdate(); }
  get selectedDate() { return this._selectedDate; }
  set profile(v) { this._profile = v; this.requestUpdate(); }
  get profile() { return this._profile; }
  set weight(v) { this._weight = v; this.requestUpdate(); }
  get weight() { return this._weight; }

  static get styles() {
    return css`
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 6px;
      gap: 16px;
      position: relative;
      z-index: 1; /* Keep summary card below modals */
    }
    .summary-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      max-width: 700px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    .gauge-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: 0;
      position: relative;
      z-index: 1;
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
    @media (max-width: 455px) {
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
    }
    .gauge-labels {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .titles {
      font-size: 16px;
      font-weight: bold;
      color: var(--primary-text-color, #333);
      text-align: center;
      margin-bottom: 4px;
    }
    .gauge-value {
      font-size: 16px;
      font-weight: bold;
      color: var(--secondary-text-color, #666);
      text-align: center;
    }
    .weekly-summary {
      font-size: 16px;
      text-align: center;
      color: var(--primary-text-color, #333);
      font-weight: bold;
    }
    .bar-graph-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      z-index: 2;
      background: var(--card-background-color, #fff);
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
    @media (max-width: 455px) {
      .fat-note {
        display: none;
      }
    }
    .gauge-cal-label {
      font-size: 16px;
    }
    @media (max-width: 455px) {
      .gauge-cal-label {
        font-size: 23px;
      }
    }
    .gauge-over-label {
      font-size: 18px;
    }
    @media (max-width: 455px) {
      .gauge-over-label {
        font-size: 26px;
      }
    }
  `;
  }

  connectedCallback() {
    super.connectedCallback();
    // Initial measure after first paint
    requestAnimationFrame(() => this._measureBarVisualHeight());
    // Debounced resize handling
    this._onResize = () => {
      if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
      this._resizeRaf = requestAnimationFrame(() => this._measureBarVisualHeight());
    };
    window.addEventListener('resize', this._onResize);
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
    }
  }

  update() {
    this.render();
  }

  render() {
    const profile = this.profile ?? this._profile;
    if (!profile || !this.hass) {
      renderToShadowRoot(this.shadowRoot, '<p>Loading...</p>', CalorieSummary.styles);
      return;
    }

    const attrs = profile?.attributes ?? {};
    const dailyGoal = attrs.daily_goal ?? 2000;
    let goalType = 'Not Set';
    if (this.weeklySummary && this.selectedDate && this.weeklySummary[this.selectedDate]) {
      const entry = this.weeklySummary[this.selectedDate];
      if (Array.isArray(entry) && entry.length >= 5) {
        goalType = entry[4] || 'Not Set';
      }
    }
    if (goalType === 'Not Set') {
      goalType = attrs.goal_type ?? 'fixed_intake';
    }
    const weeklySummary = this.weeklySummary ?? {};
    const weightUnit = attrs.weight_unit || 'lbs';
    const selected = this.selectedDate ? parseLocalDateString(this.selectedDate) : new Date();
    const sunday = new Date(selected); sunday.setHours(0,0,0,0); sunday.setDate(selected.getDate() - selected.getDay());
    const weekDates = Array.from({length:7}, (_,i)=>{const d=new Date(sunday); d.setDate(sunday.getDate()+i); return getLocalDateString(d);});

    // Gauge setup
    let gaugeDateStr = this.selectedDate || getLocalDateString();
    const todayStr = getLocalDateString();
    let gaugeTitle = 'Today';
    if (gaugeDateStr !== todayStr) {
      const d = parseLocalDateString(gaugeDateStr);
      gaugeTitle = `${d.getDate().toString().padStart(2,'0')} ${d.toLocaleString(undefined,{month:'short'})} ${d.getFullYear().toString().slice(-2)}`;
    }

    let caloriesForSelectedDay = 0;
    let selectedDayGoal = dailyGoal;
    let selectedDayGoalType = goalType;
    let selectedDayRemainingCalories = 0;
    if (weeklySummary[gaugeDateStr] !== undefined) {
      const entry = weeklySummary[gaugeDateStr];
      if (Array.isArray(entry) && entry.length >= 9) {
        const [food, exercise, , dayGoal, dayGoalType, , , , remainingCalories] = entry;
        caloriesForSelectedDay = this._getDisplayCalories(food, exercise, dayGoalType);
        selectedDayGoal = dayGoal; selectedDayGoalType = dayGoalType; selectedDayRemainingCalories = remainingCalories;
      } else if (Array.isArray(entry) && entry.length >= 6) {
        const [food, exercise, , dayGoal, dayGoalType] = entry;
        caloriesForSelectedDay = this._getDisplayCalories(food, exercise, dayGoalType);
        selectedDayGoal = dayGoal; selectedDayGoalType = dayGoalType; selectedDayRemainingCalories = dayGoal - caloriesForSelectedDay;
      }
    }

    const weekValues = weekDates.map(date => {
      if (weeklySummary.hasOwnProperty(date)) {
        const entry = weeklySummary[date];
        if (Array.isArray(entry) && entry.length >= 6) {
          const [food, exercise, , dailyGoalEntry, goalTypeEntry] = entry;
            return this._getDisplayCalories(food, exercise, goalTypeEntry);
        }
      }
      return 0;
    });

    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weekDayLabels = weekDates.map(date => dayNames[parseLocalDateString(date).getDay()]);

    // Weekly analysis
    const daysWithData = weekDates.filter(date => {
      if (weeklySummary.hasOwnProperty(date)) {
        const entry = weeklySummary[date];
        if (Array.isArray(entry) && entry.length >= 2) {
          const [food, exercise] = entry; return food !== 0 || exercise !== 0;
        }
      }
      return false;}).length;

    let weeklyText = '';
    if (daysWithData > 0) {
      let totalCalorieDeficit = 0; let totalCalorieGoalComparison = 0; let validBmrDays = 0;
      weekDates.forEach(date => {
        if (weeklySummary.hasOwnProperty(date)) {
          const entry = weeklySummary[date];
          if (Array.isArray(entry) && entry.length >= 9) {
            let [food, exercise, bmrAndNeat, , goalTypeEntry, , , , remainingCalories] = entry;
            if (food !== 0 || exercise !== 0) {
              if (date === todayStr) { const now=new Date(); const currentHour=now.getHours()+now.getMinutes()/60; bmrAndNeat = bmrAndNeat * (currentHour/24); }
              const dailyDeficit = bmrAndNeat + exercise - food; totalCalorieDeficit += dailyDeficit;
              totalCalorieGoalComparison += -remainingCalories; validBmrDays++; }
          } else if (Array.isArray(entry) && entry.length >= 6) {
            let [food, exercise, bmrAndNeat, dayGoal, goalTypeEntry] = entry;
            if (food !== 0 || exercise !== 0) {
              if (date === todayStr) { const now=new Date(); const currentHour=now.getHours()+now.getMinutes()/60; bmrAndNeat = bmrAndNeat * (currentHour/24); }
              const dailyDeficit = bmrAndNeat + exercise - food; totalCalorieDeficit += dailyDeficit;
              const actualIntake = this._getDisplayCalories(food, exercise, goalTypeEntry); totalCalorieGoalComparison += (actualIntake - dayGoal); validBmrDays++; }
          }
        }
      });
      if (validBmrDays > 0) {
        const caloriesPerPound = 3500; let weightChangeLbs = totalCalorieDeficit / caloriesPerPound; let weightChangeDisplay = weightChangeLbs; let displayUnit = weightUnit;
        if (weightUnit === 'kg') weightChangeDisplay = weightChangeLbs * 0.45359237;
        const changeText = Math.abs(weightChangeDisplay).toFixed(1);
        const isOverGoal = totalCalorieGoalComparison > 0;
        const calorieText = isOverGoal ? `${Math.round(Math.abs(totalCalorieGoalComparison))} Cal Over Goal` : `${Math.round(Math.abs(totalCalorieGoalComparison))} Cal Under Goal`;
        const weightText = totalCalorieDeficit < 0 ? `${changeText} ${weightUnit} gained (estimate)` : `${changeText} ${weightUnit} lost (estimate)`;
        weeklyText = { calorie: calorieText, weight: weightText, calorieColor: isOverGoal ? '#f44336' : '#4caf50', weightColor: (goalType === 'fixed_surplus' || goalType === 'variable_bulk') ? '#4caf50' : ((totalCalorieDeficit < 0) ? '#f44336' : '#4caf50') };
      } else {
        let totalGoalCalories = 0; let totalActualCalories = 0;
        weekDates.forEach(date => { if (weeklySummary.hasOwnProperty(date)) { const entry = weeklySummary[date]; if (Array.isArray(entry) && entry.length >=6) { const [food, exercise, , dayGoal, dayGoalType] = entry; if (food!==0 || exercise!==0) { totalActualCalories += this._getDisplayCalories(food,exercise,dayGoalType); totalGoalCalories += dayGoal; } } } });
        const weeklyDifference = totalActualCalories - totalGoalCalories; const calorieText = weeklyDifference >=0 ? `${weeklyDifference} Cal Over - Week` : `${Math.abs(weeklyDifference)} Cal Under - Week`;
        weeklyText = { calorie: calorieText, weight: null, calorieColor: weeklyDifference >=0 ? '#f44336' : '#4caf50', weightColor: null };
      }
    } else {
      weeklyText = { calorie: '0 Cal Under Goal', weight: `0.0 ${weightUnit} lost (estimate)`, calorieColor:'#4caf50', weightColor:'#4caf50' };
    }

    // Goal line visuals
    let goalLinePosition = dailyGoal;
    if (this.selectedDate && weeklySummary[this.selectedDate]) {
      const entry = weeklySummary[this.selectedDate];
      if (Array.isArray(entry) && entry.length >= 6) {
        const [, , , selectedDayGoal] = entry; goalLinePosition = selectedDayGoal; }
    }
    const barVisualHeight = this._barVisualHeight || 95;
    const goalLinePositionFromTop = (1 - (1/1.4)) * (barVisualHeight);

    const allDataDates = new Set(Object.entries(weeklySummary).filter(([_, entry]) => { if (Array.isArray(entry) && entry.length >=2) { const [food, exercise] = entry; return food!==0 || exercise!==0;} return false; }).map(([date])=>date));

    const gaugeMarkup = this._renderGauge(caloriesForSelectedDay, selectedDayGoal, selectedDayGoalType, selectedDayRemainingCalories);

    const barsMarkup = weekDates.map((date, index) => {
      const entry = weeklySummary[date];
      let value = 0; let dayGoal = dailyGoal; let dayGoalType = goalType;
      if (entry && Array.isArray(entry) && entry.length >= 6) {
        const [food, exercise, , entryGoal, entryGoalType] = entry; value = this._getDisplayCalories(food, exercise, entryGoalType); dayGoal = entryGoal; dayGoalType = entryGoalType; }
      const maxRepresentableValue = dayGoal * 1.4; const cappedValue = Math.min(value, maxRepresentableValue); const greenValue = Math.min(dayGoal, value);
      const greenHeightPercent = (greenValue / maxRepresentableValue) * 100; const redValue = cappedValue > dayGoal ? (cappedValue - dayGoal) : 0; const redHeightPercent = (redValue / maxRepresentableValue) * 100;
      const d = parseLocalDateString(date); const dateLabel = `${d.getDate().toString().padStart(2,'0')} ${d.toLocaleString(undefined,{month:'short'})}`; const isSelected = this.selectedDate === date;
      return html`<div class="bar${isSelected ? ' selected' : ''}" data-action="select-day" data-date="${date}" title="Show details for ${dateLabel}" style="cursor:pointer">
        <div class="bar-visual">
          <div class="bar-outline"></div>
          <div class="bar-fill-green" style="height:${greenHeightPercent}%"></div>
          <div class="bar-fill-red" style="height:${redHeightPercent}%"></div>
        </div>
        <div class="bar-label">${Math.round(value)}</div>
        <div class="day-label">${weekDayLabels[index]}</div>
        <div class="date-label">${dateLabel}</div>
      </div>`; }).join('');

    const calendarMarkup = this._showCalendar ? this._renderCalendar(allDataDates) : '';

    const weeklySummaryMarkup = weeklyText ? html`<div class="weekly-summary">
        <div style="color:${weeklyText.calorieColor};">${weeklyText.calorie}</div>
        ${weeklyText.weight ? `<div style="color:${weeklyText.weightColor}; font-size:14px; margin-top:2px;">${weeklyText.weight}</div>` : ''}
      </div>` : '';

    const weightPopup = this._showWeightPopup ? html`
      <div class="modal-backdrop" data-action="weight-cancel"></div>
      <div class="modal-popup">
        <div class="modal-header">Edit Weight</div>
        <div class="edit-grid" style="margin-bottom:0;">
          <div class="edit-label">Weight</div>
          <input class="edit-input" type="number" min="0" step="0.1" data-role="weight-input" value="${this._weightInput}" placeholder="Enter weight in ${weightUnit}" />
        </div>
        ${this._weightInputError ? `<div style='color:#f44336;font-size:.95em;margin-bottom:8px;'>${this._weightInputError}</div>` : ''}
        <div class="edit-actions">
          <button class="ha-btn" data-action="weight-save">Save</button>
          <button class="ha-btn" data-action="weight-cancel">Cancel</button>
        </div>
      </div>` : '';

    const markup = html`
      <div class="summary-container">
        <div class="gauge-section">
          <div class="gauge-labels"><div class="titles">${gaugeTitle}</div></div>
          <div class="gauge-container">${gaugeMarkup}</div>
        </div>
        <div class="bar-graph-section">
          <div class="titles" style="display:flex;align-items:center;justify-content:center;gap:8px;position:relative;">
            <button data-action="prev-week" title="Previous week" style="background:none;border:none;cursor:pointer;padding:0 4px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            Weekly Summary
            <button data-action="next-week" title="Next week" style="background:none;border:none;cursor:pointer;padding:0 4px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
            <button data-action="toggle-calendar" title="Pick week from calendar" style="background:none;border:none;cursor:pointer;padding:0 4px; margin-left:8px;">
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"/></svg>
            </button>
          </div>
          ${calendarMarkup}
          <div class="bar-graph">
            <div class="goal-line-horizontal" style="top:${goalLinePositionFromTop}px; bottom:auto;"></div>
            ${barsMarkup}
          </div>
          ${weeklySummaryMarkup}
        </div>
        ${weightPopup}
      </div>`;

    renderToShadowRoot(this.shadowRoot, markup, CalorieSummary.styles);
    this._bindEvents();
    // Re-measure after render if needed
    requestAnimationFrame(()=>this._measureBarVisualHeight());
  }

  _measureBarVisualHeight() {
    const root = this.shadowRoot;
    if (!root) return; // Not yet attached
    const barVisual = root.querySelector('.bar-visual');
    if (!barVisual) return; // Elements not rendered yet
    const height = barVisual.getBoundingClientRect().height || barVisual.offsetHeight;
    if (height && height !== this._barVisualHeight) {
      this._barVisualHeight = height;
      // Trigger re-render so dependent layout (goal line position) updates
      this.requestUpdate();
    }
  }

  _renderGauge(currentValue, goalValue, goalType, remainingCalories = null) {
    // Use different max multiplier for variable_bulk goal type
    const maxMultiplier = goalType === "variable_bulk" ? 1.1 : 1.4;
    const maxValue = goalValue * maxMultiplier;
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
          class="gauge-cal-label"
          x="${center.x}"
          y="${center.y + radius -5}"
          text-anchor="middle"
          fill="${currentValue <= goalValue ? '#4caf50' : '#f44336'}"
        >
          ${Math.round(currentValue)} Cal${['fixed_surplus','fixed_deficit','variable_cut','variable_bulk','fixed_net_calories'].includes(goalType) ? ' (net)' : ''}
        </text>

        <!-- Over/Under label -->
        <text
          class="gauge-over-label"
          x="${center.x}"
          y="${center.y + radius + 18}"
          text-anchor="middle"
          fill="${remainingCalories !== null ? (remainingCalories >= 0 ? '#4caf50' : '#f44336') : (currentValue <= goalValue ? '#4caf50' : '#f44336')}"
        >
          ${remainingCalories !== null
            ? (remainingCalories >= 0
                ? `${Math.round(remainingCalories)} Under`
                : `${Math.round(Math.abs(remainingCalories))} Over`)
            : (currentValue - goalValue >= 0
                ? `${Math.round(currentValue - goalValue)} Over`
                : `${Math.round(goalValue - currentValue)} Under`)}
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
    // Use selected date, or default to today if none selected
    const selected = this.selectedDate ? parseLocalDateString(this.selectedDate) : new Date();
    const currentSunday = new Date(selected);
    currentSunday.setHours(0, 0, 0, 0);
    currentSunday.setDate(selected.getDate() - selected.getDay());

    // Move to the target week
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
      const d = parseLocalDateString(this.selectedDate);
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
    return html`<div class="calendar-popup themed-calendar-popup">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <button data-action="cal-month-prev" style="background:none;border:none;cursor:pointer;">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <span style="font-weight:bold;">${monthNames[month]} ${year}</span>
        <button data-action="cal-month-next" style="background:none;border:none;cursor:pointer;">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;">
        <button data-action="cal-year-prev" style="background:none;border:none;cursor:pointer;font-size:12px;">« Prev Year</button>
        <button data-action="cal-year-next" style="background:none;border:none;cursor:pointer;font-size:12px;">Next Year »</button>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="font-size:11px;">Sun</th><th style="font-size:11px;">Mon</th><th style="font-size:11px;">Tue</th><th style="font-size:11px;">Wed</th><th style="font-size:11px;">Thu</th><th style="font-size:11px;">Fri</th><th style="font-size:11px;">Sat</th>
        </tr></thead>
        <tbody>
          ${weeks.map(week => html`<tr>
            ${week.map(day => {
              const isSelected = day && this.selectedDate && this._isSameDay(year, month, day, this.selectedDate);
              const hasEntry = hasData(day);
              const dateStr = day ? `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : '';
              return `<td class="${isSelected ? 'selected-date ' : ''}${hasEntry ? 'has-entry' : ''}" data-action="calendar-select" data-date="${dateStr}" style="text-align:center;padding:2px 0;cursor:${day ? 'pointer':'default'};border-radius:4px;">${day ? day : ''}</td>`;}).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="text-align:right;margin-top:8px;">
        <button data-action="calendar-close" class="calendar-close-btn">Close</button>
      </div>
    </div>`;
  }

  _isSameDay(year, month, day, dateStr) {
    const d = parseLocalDateString(dateStr);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  }

  _getDisplayCalories(food, exercise, goalType) {
    // fixed_intake: show gross calories (food only)
    // all other goal_types: show net calories (food - exercise)
    if (goalType === 'fixed_intake') {
      return food;
    } else {
      return food - exercise;
    }
  }

  // Event binding after each render
  _bindEvents() {
    const root = this.shadowRoot;
    if (!root) return;
    const actions = root.querySelectorAll('[data-action]');
    actions.forEach(el => {
      const action = el.getAttribute('data-action');
      el.onclick = null; // clear previous
      switch(action) {
        case 'prev-week': el.onclick = () => this._changeWeek(-1); break;
        case 'next-week': el.onclick = () => this._changeWeek(1); break;
        case 'toggle-calendar': el.onclick = () => { this._toggleCalendar(); this.requestUpdate(); }; break;
        case 'cal-month-prev': el.onclick = () => this._changeCalendarMonth(-1); break;
        case 'cal-month-next': el.onclick = () => this._changeCalendarMonth(1); break;
        case 'cal-year-prev': el.onclick = () => this._changeCalendarYear(-1); break;
        case 'cal-year-next': el.onclick = () => this._changeCalendarYear(1); break;
        case 'calendar-close': el.onclick = () => { this._showCalendar = false; this.requestUpdate(); }; break;
        case 'weight-save': el.onclick = () => this._saveWeight(); break;
        case 'weight-cancel': el.onclick = () => this._closeWeightPopup(); break;
        case 'calendar-select': el.onclick = () => {
          const date = el.getAttribute('data-date');
            if (date) {
              this._showCalendar = false;
              this.dispatchEvent(new CustomEvent('select-summary-date',{detail:{date},bubbles:true,composed:true}));
            }
          }; break;
        case 'select-day':
          el.onclick = () => {
            const date = el.getAttribute('data-date');
            if (date) this._onBarClick(date);
          }; break;
      }
    });
    const weightInput = root.querySelector('[data-role="weight-input"]');
    if (weightInput) {
      weightInput.oninput = (e) => this._onWeightInputChange(e);
    }
  }

  _closeWeightPopup() { this._showWeightPopup = false; this.requestUpdate(); }
  _saveWeight() { this._closeWeightPopup(); }
  _onWeightInputChange(e) { this._weightInput = e.target.value; }
}

// Check if the element is already defined before defining it
if (!customElements.get('calorie-summary')) {
  customElements.define('calorie-summary', CalorieSummary);
}
