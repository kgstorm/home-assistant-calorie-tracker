class MacroPercentagesCard extends HTMLElement {
  constructor() {
    super();
    this._eventsAttached = false;
    this.maxHeight = '400px';
  }

  setConfig(config) {
    this.config = config || {};
    this.profileEntityId = config.profile_entity_id || null;
    this.title = typeof config.title === 'string' ? config.title : 'Percent of Total Calories';
    this.maxHeight = config.max_height || '400px';

    this.innerHTML = `
      <ha-card>
        ${this.title && this.title.trim() ? `<div class="card-header">${this.title}</div>` : ""}
        <div class="macro-percentages-wrapper">
          <div class="macro-percentages" style="display:flex;align-items:center;justify-content:center;padding:20px;flex-direction:column;">
            <div style="display:flex;align-items:center;justify-content:center;">
              <svg class="pie-svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" style="width:150px;height:150px;flex-shrink:0;"></svg>
              <div class="legend" style="margin-left:20px;font-family:var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif);">
                <div class="legend-item" style="display:flex;align-items:center;margin-bottom:8px;">
                  <div class="legend-color protein-color" style="width:16px;height:16px;margin-right:8px;border-radius:2px;background-color:#4CAF50;"></div>
                  <span class="protein-text">Protein: --g (--)</span>
                </div>
                <div class="legend-item" style="display:flex;align-items:center;margin-bottom:8px;">
                  <div class="legend-color carbs-color" style="width:16px;height:16px;margin-right:8px;border-radius:2px;background-color:#2196F3;"></div>
                  <span class="carbs-text">Carbs: --g (--)</span>
                </div>
                <div class="legend-item" style="display:flex;align-items:center;margin-bottom:8px;">
                  <div class="legend-color fat-color" style="width:16px;height:16px;margin-right:8px;border-radius:2px;background-color:#FF9800;"></div>
                  <span class="fat-text">Fat: --g (--)</span>
                </div>
                <div class="legend-item" style="display:flex;align-items:center;margin-bottom:8px;">
                  <div class="legend-color alcohol-color" style="width:16px;height:16px;margin-right:8px;border-radius:2px;background-color:#9C27B0;"></div>
                  <span class="alcohol-text">Alcohol: --g (--)</span>
                </div>
              </div>
            </div>
            <div class="chart-label" style="margin-top:15px;font-family:var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif);font-size:14px;color:var(--secondary-text-color, #666);text-align:center;">
              Percent of Total Calories
            </div>
          </div>
        </div>
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

  _getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async _updateCard() {
    const wrapper = this.querySelector('.macro-percentages');
    if (!wrapper || !this.hass) return;

    // Fetch profile entity_id (from config or default)
    let entityId = this.profileEntityId;
    if (!entityId) {
      entityId = Object.keys(this.hass.states).find(eid =>
        eid.startsWith('sensor.calorie_tracker_') &&
        this.hass.states[eid]
      );
    }
    if (!entityId) {
      console.warn('No calorie tracker profile entity found');
      return;
    }

    if (!this.hass.states[entityId]) {
      console.error(`Entity not found: ${entityId}`);
      return;
    }

    const profile = this.hass.states[entityId];
    this._profile = profile;
    this._selectedDate = this.selectedDate || this._getLocalDateString();

    // Apply basic styling tweaks
    this._applyMacroStyles(wrapper);

    try {
      const dailyResp = await this.hass.connection.sendMessagePromise({
        type: 'calorie_tracker/get_daily_data',
        entity_id: entityId,
        date: this._selectedDate,
      });

      const macros = dailyResp?.macros ?? {};
      const protein = Math.round(macros.p || macros.protein || 0);
      const carbs = Math.round(macros.c || macros.carbs || 0);
      const fat = Math.round(macros.f || macros.fat || 0);
      const alcohol = Math.round(macros.a || macros.alcohol || 0);

      // Calculate calories from each macro (4 cal/g for protein and carbs, 9 cal/g for fat, 7 cal/g for alcohol)
      const proteinCals = protein * 4;
      const carbsCals = carbs * 4;
      const fatCals = fat * 9;
      const alcoholCals = alcohol * 7;
      const totalCals = proteinCals + carbsCals + fatCals + alcoholCals;

      this._proteinGrams = protein;
      this._carbsGrams = carbs;
      this._fatGrams = fat;
      this._alcoholGrams = alcohol;
      this._proteinCals = proteinCals;
      this._carbsCals = carbsCals;
      this._fatCals = fatCals;
      this._alcoholCals = alcoholCals;
      this._totalCals = totalCals;

      // Render pie chart
      this._renderPieChart();

    } catch (err) {
      console.error('Failed to fetch macro data:', err);
    }

    // Attach event listeners to the wrapper (no-op unless external code dispatches them)
    if (!this._eventsAttached) {
      wrapper.addEventListener('select-summary-date', (e) => {
        this.selectedDate = e.detail.date;
        this._updateCard();
      });
      wrapper.addEventListener('refresh-summary', () => {
        this._updateCard();
      });
      this._eventsAttached = true;
    }
  }

  _applyMacroStyles(wrapper) {
    if (!wrapper) return;
    // Basic container sizing
    const svg = wrapper.querySelector('.pie-svg');
    if (svg) {
      svg.style.width = '150px';
      svg.style.height = '150px';
    }
  }
}

if (!customElements.get('macro-percentages-card')) {
  customElements.define('macro-percentages-card', MacroPercentagesCard);
}

// Render helper functions attached to the class prototype
MacroPercentagesCard.prototype._renderPieChart = function () {
  const svg = this.querySelector('.pie-svg');
  if (!svg) return;

  const proteinCals = this._proteinCals || 0;
  const carbsCals = this._carbsCals || 0;
  const fatCals = this._fatCals || 0;
  const alcoholCals = this._alcoholCals || 0;
  const totalCals = this._totalCals || 1; // Avoid division by zero

  const proteinGrams = this._proteinGrams || 0;
  const carbsGrams = this._carbsGrams || 0;
  const fatGrams = this._fatGrams || 0;
  const alcoholGrams = this._alcoholGrams || 0;

  // Calculate percentages
  const proteinPercent = totalCals > 0 ? Math.round((proteinCals / totalCals) * 100) : 0;
  const carbsPercent = totalCals > 0 ? Math.round((carbsCals / totalCals) * 100) : 0;
  const fatPercent = totalCals > 0 ? Math.round((fatCals / totalCals) * 100) : 0;
  const alcoholPercent = totalCals > 0 ? Math.round((alcoholCals / totalCals) * 100) : 0;

  // Update legend
  const proteinText = this.querySelector('.protein-text');
  const carbsText = this.querySelector('.carbs-text');
  const fatText = this.querySelector('.fat-text');
  const alcoholText = this.querySelector('.alcohol-text');

  if (proteinText) proteinText.textContent = `Protein: ${proteinGrams}g (${proteinPercent}%)`;
  if (carbsText) carbsText.textContent = `Carbs: ${carbsGrams}g (${carbsPercent}%)`;
  if (fatText) fatText.textContent = `Fat: ${fatGrams}g (${fatPercent}%)`;
  if (alcoholText) alcoholText.textContent = `Alcohol: ${alcoholGrams}g (${alcoholPercent}%)`;

  // Pie chart setup
  const centerX = 100;
  const centerY = 100;
  const radius = 70;

  // Colors for each macro
  const colors = {
    protein: '#4CAF50', // Green
    carbs: '#2196F3',   // Blue
    fat: '#FF9800',     // Orange
    alcohol: '#9C27B0'  // Purple
  };

  // Calculate angles for pie slices
  let currentAngle = -90; // Start at top (12 o'clock)
  const slices = [];

  if (totalCals > 0) {
    // Protein slice
    if (proteinCals > 0) {
      const proteinAngle = (proteinCals / totalCals) * 360;
      slices.push({
        startAngle: currentAngle,
        endAngle: currentAngle + proteinAngle,
        color: colors.protein,
        label: 'Protein'
      });
      currentAngle += proteinAngle;
    }

    // Carbs slice
    if (carbsCals > 0) {
      const carbsAngle = (carbsCals / totalCals) * 360;
      slices.push({
        startAngle: currentAngle,
        endAngle: currentAngle + carbsAngle,
        color: colors.carbs,
        label: 'Carbs'
      });
      currentAngle += carbsAngle;
    }

    // Fat slice
    if (fatCals > 0) {
      const fatAngle = (fatCals / totalCals) * 360;
      slices.push({
        startAngle: currentAngle,
        endAngle: currentAngle + fatAngle,
        color: colors.fat,
        label: 'Fat'
      });
      currentAngle += fatAngle;
    }

    // Alcohol slice
    if (alcoholCals > 0) {
      const alcoholAngle = (alcoholCals / totalCals) * 360;
      slices.push({
        startAngle: currentAngle,
        endAngle: currentAngle + alcoholAngle,
        color: colors.alcohol,
        label: 'Alcohol'
      });
    }
  }

  // Helper function to convert angle to radians
  const toRadians = (deg) => (deg * Math.PI) / 180;

  // Helper function to create SVG arc path
  const createArcPath = (startAngle, endAngle) => {
    const startRad = toRadians(startAngle);
    const endRad = toRadians(endAngle);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Build SVG content
  let svgContent = `<svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">`;

  if (totalCals === 0 || slices.length === 0) {
    // Show empty circle if no data
    svgContent += `
      <circle cx="${centerX}" cy="${centerY}" r="${radius}"
              fill="none" stroke="#eee" stroke-width="2"/>
      <text x="${centerX}" y="${centerY}" text-anchor="middle"
            font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
            font-size="14" fill="var(--secondary-text-color, #666)">No Data</text>
    `;
  } else {
    // Draw pie slices
    slices.forEach(slice => {
      svgContent += `
        <path d="${createArcPath(slice.startAngle, slice.endAngle)}"
              fill="${slice.color}"
              stroke="#fff"
              stroke-width="1"/>
      `;
    });
  }

  svgContent += `</svg>`;
  svg.innerHTML = svgContent;
};
