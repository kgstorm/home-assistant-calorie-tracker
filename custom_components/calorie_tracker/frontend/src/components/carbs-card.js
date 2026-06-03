class CarbsGaugeCard extends HTMLElement {
  constructor() {
    super();
    this._eventsAttached = false;
    this.maxHeight = '400px';
    this.translations = {};
    this._translationsRequestedLang = null;
  }

  _t(key, fallback) {
    const value = this.translations?.[key];
    return typeof value === 'string' && value.length > 0 ? value : fallback;
  }

  _tf(key, fallback, vars = {}) {
    const template = this._t(key, fallback);
    return template.replace(/\{(\w+)\}/g, (_, token) =>
      Object.prototype.hasOwnProperty.call(vars, token) ? String(vars[token]) : `{${token}}`
    );
  }

  async _loadTranslationsForLanguage(language) {
    if (!this._hass?.connection) return;
    try {
      const resp = await this._hass.connection.sendMessagePromise({
        type: 'calorie_tracker/get_translations',
        language,
        namespace: 'frontend.cards',
      });
      this.translations = resp?.translations || {};
      this._translationsRequestedLang = language;
      this._renderGauge();
    } catch (_err) {
      this.translations = this.translations || {};
      this._translationsRequestedLang = language;
    }
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
        <div class="carbs-gauge-wrapper">
          <div class="carbs-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="carbs-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
          </div>
        </div>
      </ha-card>
    `;
  }

  set hass(hass) {
    this._hass = hass;
    const language = hass?.locale?.language || hass?.language || 'en';
    if (this._translationsRequestedLang !== language) {
      this._loadTranslationsForLanguage(language);
    }
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
    const wrapper = this.querySelector('.carbs-gauge');
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
  this._applyCarbsStyles(wrapper);

    try {
      const dailyResp = await this.hass.connection.sendMessagePromise({
        type: 'calorie_tracker/get_daily_data',
        entity_id: entityId,
        date: this._selectedDate,
      });

      const weight = dailyResp?.weight ?? null;
      const respWeightUnit = dailyResp?.weight_unit ?? null;
      const macros = dailyResp?.macros ?? {};
      const carbs = Math.round(macros.c || macros.carbs || 0);

      const attrs = (this._profile && this._profile.attributes) || {};
      const profileWeightRaw = Number(attrs.current_weight);
      const weightUnit = attrs.weight_unit || respWeightUnit || 'lbs';

      const convertWeight = (value, fromUnit, toUnit) => {
        if (!Number.isFinite(value)) {
          return null;
        }
        if (!fromUnit || !toUnit || fromUnit === toUnit) {
          return value;
        }
        if (fromUnit === 'kg' && toUnit === 'lbs') {
          return value * 2.20462;
        }
        if (fromUnit === 'lbs' && toUnit === 'kg') {
          return value / 2.20462;
        }
        return value;
      };

      let currentWeight = Number.isFinite(profileWeightRaw) ? profileWeightRaw : null;
      if (!Number.isFinite(currentWeight) && Number.isFinite(weight)) {
        currentWeight = convertWeight(Number(weight), respWeightUnit || weightUnit, weightUnit);
      }

      const weightForRatio = Number.isFinite(currentWeight) ? currentWeight : null;
      const weightLb = Number.isFinite(currentWeight)
        ? (weightUnit === 'kg' ? currentWeight * 2.20462 : currentWeight)
        : null;

      const resolveTarget = (value) => {
        if (value === null || value === undefined) {
          return null;
        }
        if (value < 5 && weightForRatio !== null) {
          return Math.round(value * weightForRatio);
        }
        return value;
      };

      const resolvedMin = resolveTarget(this.min);
      const resolvedMax = resolveTarget(this.max);

      const defaultWeightLb = weightLb ?? 150;
      let computedMax = Math.ceil((defaultWeightLb * 1.36) / 10) * 10;
      if (!Number.isFinite(computedMax) || computedMax <= 0) {
        computedMax = 200;
      }
      if (resolvedMax !== null) {
        computedMax = resolvedMax;
      }

  this._gaugeMax = computedMax;
  this._gaugeMin = resolvedMin !== null ? resolvedMin : 0;
  this._carbsValue = carbs;
  this._carbsWeight = weightLb || 0;
  this._carbsMin = resolvedMin;
  this._carbsMax = resolvedMax;

  // Render gauge now
  this._renderGauge();

    } catch (err) {
      console.error('Failed to fetch carbs data:', err);
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

  _applyCarbsStyles(wrapper) {
    if (!wrapper) return;
    // Basic container sizing
    const svg = wrapper.querySelector('.carbs-svg');
    if (svg) {
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxWidth = this.maxHeight;
      svg.style.maxHeight = this.maxHeight;
    }
  }


}

if (!customElements.get('carbs-gauge-card')) {
  customElements.define('carbs-gauge-card', CarbsGaugeCard);
}

// Register card for Lovelace Add Card dialog
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'carbs-gauge-card',
  name: 'Calorie Tracker: Carbs Gauge',
  description: 'Displays a carbs gauge for the Calorie Tracker integration',
  editor: 'carbs-gauge-editor',
  preview: true,
});

class CarbsGaugeEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._config) this._config = {};
    this.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(
          this._config.title || ''
        )}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(
          this._config.profile_entity_id || ''
        )}"></ha-entity-picker>
        <paper-input label="Max height (e.g. 400px)" value="${this._escape(
          this._config.max_height || '400px'
        )}"></paper-input>
        <paper-input label="Min (optional, grams or fraction)" value="${this._escape(
          this._config.min ?? ''
        )}"></paper-input>
        <paper-input label="Max (optional, grams or fraction)" value="${this._escape(
          this._config.max ?? ''
        )}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;

    const inputs = this.querySelectorAll('paper-input');
    const titleInput = inputs[0];
    const heightInput = inputs[1];
    const minInput = inputs[2];
    const maxInput = inputs[3];
    const picker = this.querySelector('ha-entity-picker');
    const err = this.querySelector('.error');

    const valueChanged = () => {
      const cfg = { ...this._config };
      if (titleInput && titleInput.value) cfg.title = titleInput.value.trim();
      else delete cfg.title;
      if (picker && picker.value) cfg.profile_entity_id = picker.value;
      else delete cfg.profile_entity_id;
      if (heightInput && heightInput.value) cfg.max_height = heightInput.value.trim();
      else delete cfg.max_height;
      if (minInput && minInput.value) cfg.min = Number(minInput.value);
      else delete cfg.min;
      if (maxInput && maxInput.value) cfg.max = Number(maxInput.value);
      else delete cfg.max;

      if (!cfg.profile_entity_id) {
        if (err) err.style.display = 'block';
      } else {
        if (err) err.style.display = 'none';
      }

      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg } }));
    };

    inputs.forEach(i => i.addEventListener('value-changed', valueChanged));
    if (picker) picker.addEventListener('value-changed', valueChanged);
  }

  _escape(str) {
    return String(str).replace(/"/g, '&quot;');
  }
}

if (!customElements.get('carbs-gauge-editor')) {
  customElements.define('carbs-gauge-editor', CarbsGaugeEditor);
}
// Provide built-in visual editor schema for Lovelace
CarbsGaugeCard.getConfigForm = function () {
  return {
    schema: [
      { name: 'title', selector: { text: {} } },
      {
        name: 'profile_entity_id',
        required: true,
        selector: { entity: { domain: 'sensor', allow_custom_entity: true } },
      },
      { name: 'max_height', selector: { text: {} } },
      { name: 'min', selector: { number: {} } },
      { name: 'max', selector: { number: {} } },
    ],
  };
};

CarbsGaugeCard.getStubConfig = function () {
  return { profile_entity_id: '', max_height: '400px' };
};
// Render helper functions attached to the class prototype
CarbsGaugeCard.prototype._renderGauge = function () {
  const svg = this.querySelector('.carbs-svg');
  if (!svg) return;

  const value = Math.max(0, this._carbsValue || 0);
  const min = this._carbsMin;
  const max = this._carbsMax;
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
        ${this._tf('macro_value_label', '{value} g {macro}', { value: Math.round(value), macro: this._t('carbs', 'Carbs') })}
      </text>

    </svg>
  `;

  svg.innerHTML = svgContent;
};
