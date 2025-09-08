class FatGaugeCard extends HTMLElement {
  constructor() {
    super();
    this._eventsAttached = false;
    this.maxHeight = '400px';
  }



  setConfig(config) {
    this.config = config || {};
    this.profileEntityId = config.profile_entity_id || null;
    this.title = typeof config.title === 'string' ? config.title : '';
    this.maxHeight = config.max_height || '400px';
    // Optional min/max in grams
    this.min = typeof config.min === 'number' ? config.min : null;
    this.max = typeof config.max === 'number' ? config.max : null;

    this.innerHTML = `
      <ha-card>
        ${this.title && this.title.trim() ? `<div class="card-header">${this.title}</div>` : ""}
        <div class="fat-gauge-wrapper">
          <div class="fat-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="fat-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
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
    const wrapper = this.querySelector('.fat-gauge');
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
  this._applyFatStyles(wrapper);

    try {
      const dailyResp = await this.hass.connection.sendMessagePromise({
        type: 'calorie_tracker/get_daily_data',
        entity_id: entityId,
        date: this._selectedDate,
      });

      const weight = dailyResp?.weight ?? null;
      const weight_unit = dailyResp?.weight_unit ?? 'lbs';
      const macros = dailyResp?.macros ?? {};
      const fat = Math.round(macros.f || macros.fat || 0);

      // Compute gauge min/max based on config + weight fallback
      const weightLb = weight && weight_unit === 'kg' ? Math.round(weight * 2.20462) : weight;
      let computedMax = Math.ceil(((weightLb || 0) * 0.36) / 10) * 10; // default: user's weight in lbs * 0.36 rounded up to nearest 10 (roughly 20-35% of calories from fat, adjusted for 1.1x display)
      if (this.max !== null) {
        // If config max provided, use the max value directly (display range will be max * 1.1)
        computedMax = this.max;
      }

  this._gaugeMax = computedMax;
  this._gaugeMin = this.min !== null ? this.min : 0;
  this._fatValue = fat;
  this._fatWeight = weightLb || 0;
  this._fatMin = this.min;
  this._fatMax = this.max;

  // Render gauge now
  this._renderGauge();

    } catch (err) {
      console.error('Failed to fetch fat data:', err);
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

  _applyFatStyles(wrapper) {
    if (!wrapper) return;
    // Basic container sizing
    const svg = wrapper.querySelector('.fat-svg');
    if (svg) {
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxWidth = this.maxHeight;
      svg.style.maxHeight = this.maxHeight;
    }
  }


}

if (!customElements.get('fat-gauge-card')) {
  customElements.define('fat-gauge-card', FatGaugeCard);
}

// Render helper functions attached to the class prototype
FatGaugeCard.prototype._renderGauge = function () {
  const svg = this.querySelector('.fat-svg');
  if (!svg) return;

  const value = Math.max(0, this._fatValue || 0);
  const min = this._fatMin;
  const max = this._fatMax;
  const gaugeMax = this._gaugeMax || 100;

  // If user specified a max, gauge displays up to 1.1 * max, otherwise use gaugeMax * 1.1
  const maxValue = max !== null ? max * 1.1 : gaugeMax * 1.1;
  const center = { x: 70, y: 70 };
  const radius = 40;
  const strokeWidth = 8;

  // Gauge spans 180 degrees (semicircle), from -180 to 0 degrees (half dome)
  const startAngle = -180; // Left side (0g)
  const endAngle = 0;      // Right side (max)
  const totalAngle = endAngle - startAngle;

  // Calculate needle angle
  const valueRatio = Math.max(Math.min(value / maxValue, 1), 0);
  const needleAngle = startAngle + (valueRatio * totalAngle);

  // Convert angles to radians for calculations
  const toRadians = (deg) => (deg * Math.PI) / 180;

  // Create arc path helper
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

  // Calculate tick marks with dynamic interval for consistent count
  const targetTickCount = 8; // Aim for ~8 ticks
  const possibleIntervals = [5, 10, 25, 50, 100, 200]; // Nice round numbers
  let tickInterval = possibleIntervals[0];
  
  for (const interval of possibleIntervals) {
    if (maxValue / interval <= targetTickCount) {
      tickInterval = interval;
      break;
    }
  }
  
  const ticks = [];
  for (let tickValue = 0; tickValue <= maxValue; tickValue += tickInterval) {
    const ratio = tickValue / maxValue;
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
      label: { x: labelX, y: labelY, value: tickValue }
    });
  }

  // Calculate color zones based on min/max configuration
  let arcs = [];
  if (min === null && max === null) {
    // No thresholds - all green
    arcs.push({ startAngle, endAngle, color: '#4caf50' });
  } else if (min !== null && max === null) {
    // Only min threshold - yellow until min, then green
    const minRatio = min / maxValue;
    const minAngle = startAngle + (minRatio * totalAngle);
    arcs.push({ startAngle, endAngle: minAngle, color: '#ffeb3b' });
    arcs.push({ startAngle: minAngle, endAngle, color: '#4caf50' });
  } else if (min === null && max !== null) {
    // Only max threshold - green until max, then red
    const maxRatio = max / maxValue;
    const maxAngle = startAngle + (maxRatio * totalAngle);
    arcs.push({ startAngle, endAngle: maxAngle, color: '#4caf50' });
    arcs.push({ startAngle: maxAngle, endAngle, color: '#f44336' });
  } else {
    // Both thresholds - yellow, green, red
    const minRatio = min / maxValue;
    const maxRatio = max / maxValue;
    const minAngle = startAngle + (minRatio * totalAngle);
    const maxAngle = startAngle + (maxRatio * totalAngle);
    arcs.push({ startAngle, endAngle: minAngle, color: '#ffeb3b' });
    arcs.push({ startAngle: minAngle, endAngle: maxAngle, color: '#4caf50' });
    arcs.push({ startAngle: maxAngle, endAngle, color: '#f44336' });
  }

  // Calculate needle points
  const needleRad = toRadians(needleAngle);
  const needleLength = radius - 5;
  const needleX = center.x + needleLength * Math.cos(needleRad);
  const needleY = center.y + needleLength * Math.sin(needleRad);

  // Determine needle color based on value and thresholds
  let needleColor = '#4caf50'; // default green
  if (min !== null && max !== null) {
    // Both thresholds
    if (value < min) needleColor = '#ffeb3b'; // yellow
    else if (value >= min && value <= max) needleColor = '#4caf50'; // green
    else needleColor = '#f44336'; // red
  } else if (min !== null && max === null) {
    // Only min threshold
    if (value < min) needleColor = '#ffeb3b'; // yellow
    else needleColor = '#4caf50'; // green
  } else if (min === null && max !== null) {
    // Only max threshold
    if (value <= max) needleColor = '#4caf50'; // green
    else needleColor = '#f44336'; // red
  }
  // If no thresholds, stays green

  // Build SVG content
  let svgContent = `
    <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
      <!-- Background arc -->
      <path
        d="${createArcPath(startAngle, endAngle, radius)}"
        fill="none"
        stroke="#eee"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
      />
  `;

  // Add color zone arcs
  arcs.forEach(arc => {
    svgContent += `
      <path
        d="${createArcPath(arc.startAngle, arc.endAngle, radius)}"
        fill="none"
        stroke="${arc.color}"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
      />
    `;
  });

  // Add tick marks
  ticks.forEach(tick => {
    svgContent += `
      <path
        d="${tick.line}"
        stroke="var(--secondary-text-color, #666)"
        stroke-width="1"
      />
    `;
  });

  // Add tick labels
  ticks.forEach(tick => {
    svgContent += `
      <text
        x="${tick.label.x}"
        y="${tick.label.y}"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="9"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        fill="var(--secondary-text-color, #666)"
      >
        ${tick.label.value}
      </text>
    `;
  });

  // Add needle and center
  svgContent += `
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
        y="${center.y + radius - 5}"
        text-anchor="middle"
        font-size="12"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        font-weight="600"
        fill="${needleColor}"
      >
        ${Math.round(value)} g Fat
      </text>

    </svg>
  `;

  svg.innerHTML = svgContent;
};
