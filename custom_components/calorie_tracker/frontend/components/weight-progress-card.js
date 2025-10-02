class WeightProgressCard extends HTMLElement {
  constructor() {
    super();
    this._eventsAttached = false;
    this._range = '1m';
    this._weightData = [];
    this.ranges = [
      { label: 'Last 2 weeks', value: '2w' },
      { label: 'Last month', value: '1m' },
      { label: 'Last 2 months', value: '2m' },
      { label: 'Last year', value: '1y' },
      { label: 'All', value: 'all' },
    ];
  }

  setConfig(config) {
    this.config = config || {};
    this.profileEntityId = config.profile_entity_id || null;
    this.title = typeof config.title === 'string' ? config.title : '';
    this.innerHTML = `
      <ha-card>
        ${this.title && this.title.trim() ? `<div class="card-header">${this.title}</div>` : ""}
        <div class="weight-progress-wrapper">
          <div style="display:flex;flex-direction:column;align-items:center;">
            <label style="margin-bottom:8px;">
              Range:
              <select class="weight-range-select">
                ${this.ranges.map(r => `<option value='${r.value}'>${r.label}</option>`).join('')}
              </select>
            </label>
            <div class="weight-chart" style="width:100%;max-width:400px;min-height:220px;"></div>
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

  async _updateCard() {
    const chartDiv = this.querySelector('.weight-chart');
    if (!chartDiv || !this._hass) return;
    let entityId = this.profileEntityId;
    if (!entityId) {
      entityId = Object.keys(this._hass.states).find(eid =>
        eid.startsWith('sensor.calorie_tracker_') && this._hass.states[eid]
      );
    }
    if (!entityId) {
      chartDiv.innerHTML = '<div>No calorie tracker profile entity found</div>';
      return;
    }
    try {
      const resp = await this._hass.connection.sendMessagePromise({
        type: 'calorie_tracker/get_weight_history',
        entity_id: entityId,
      });
      this._weightData = resp.weight_history || [];
      this._renderChart();
    } catch (err) {
      chartDiv.innerHTML = '<div>Failed to fetch weight data</div>';
    }
    // Attach dropdown event
    if (!this._eventsAttached) {
      const select = this.querySelector('.weight-range-select');
      if (select) {
        select.value = this._range;
        select.addEventListener('change', (e) => {
          this._range = e.target.value;
          this._renderChart();
        });
      }
      this._eventsAttached = true;
    }
  }

  _filterDataByRange(data, range) {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    if (range === 'all') return data;
    const now = new Date();
    let cutoff;
    switch (range) {
      case '2w':
        cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 13);
        break;
      case '1m':
        cutoff = new Date(now);
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case '2m':
        cutoff = new Date(now);
        cutoff.setMonth(now.getMonth() - 2);
        break;
      case '1y':
        cutoff = new Date(now);
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    return data.filter((d) => new Date(d.date) >= cutoff);
  }

  _renderChart() {
    const chartDiv = this.querySelector('.weight-chart');
    if (!chartDiv) return;
    const filtered = this._filterDataByRange(this._weightData, this._range);
    if (!filtered.length || filtered.length < 2) {
      chartDiv.innerHTML = '<div>No weight data available for this range.</div>';
      return;
    }
    // Get starting_weight and goal_weight from entity attributes
    const entityId = this.profileEntityId || (this._hass && Object.keys(this._hass.states).find(eid => eid.startsWith('sensor.calorie_tracker_')));
    let startingWeight = null, goalWeight = null;
    if (entityId && this._hass && this._hass.states[entityId]) {
      const attrs = this._hass.states[entityId].attributes || {};
      startingWeight = attrs.starting_weight || null;
      goalWeight = attrs.goal_weight || null;
    }
    // SVG line chart
    const w = 340, h = 180, pad = 32;
    const dates = filtered.map(d => new Date(d.date));
    const weights = filtered.map(d => d.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const minD = Math.min(...dates.map(d => d.getTime()));
    const maxD = Math.max(...dates.map(d => d.getTime()));
    const x = (date) => pad + ((date.getTime() - minD) / (maxD - minD || 1)) * (w - 2 * pad);
    // Compute y-axis min/max with 10% padding, considering all weights, startingWeight, and goalWeight
    let yMin = Math.min(...weights);
    let yMax = Math.max(...weights);
    if (startingWeight !== null) yMin = Math.min(yMin, startingWeight);
    if (goalWeight !== null) yMin = Math.min(yMin, goalWeight);
    if (startingWeight !== null) yMax = Math.max(yMax, startingWeight);
    if (goalWeight !== null) yMax = Math.max(yMax, goalWeight);
    const yRange = yMax - yMin || 1;
    const padFrac = 0.1;
    const yMinPad = yMin - yRange * padFrac;
    const yMaxPad = yMax + yRange * padFrac;
    // Redefine y() to use padded min/max
    const y = (weight) => h - pad - ((weight - yMinPad) / (yMaxPad - yMinPad)) * (h - 2 * pad);
    const points = filtered.map(d => [x(new Date(d.date)), y(d.weight)]);
    let svg = `<svg width='${w}' height='${h}'>`;
    // Line
    svg += `<polyline fill='none' stroke='#03a9f4' stroke-width='2' points='${points.map(p => p.join(",")).join(" ")}' />`;
    // Points
    points.forEach((p, i) => {
      svg += `<circle cx='${p[0]}' cy='${p[1]}' r='4' fill='#03a9f4' stroke='#fff' stroke-width='1.5'><title>${filtered[i].weight}</title></circle>`;
    });
    // Y axis labels
    svg += `<text x='${pad - 8}' y='${y(minW) + 4}' font-size='11' fill='#888' text-anchor='end'>${minW}</text>`;
    svg += `<text x='${pad - 8}' y='${y(maxW) + 4}' font-size='11' fill='#888' text-anchor='end'>${maxW}</text>`;
    // X axis labels
    svg += `<text x='${x(dates[0])}' y='${h - pad + 18}' font-size='11' fill='#888' text-anchor='middle'>${dates[0].toLocaleDateString()}</text>`;
    svg += `<text x='${x(dates[dates.length - 1])}' y='${h - pad + 18}' font-size='11' fill='#888' text-anchor='middle'>${dates[dates.length - 1].toLocaleDateString()}</text>`;
    // Plot horizontal lines for starting_weight and goal_weight if available
    if (startingWeight !== null) {
      const yStart = y(startingWeight);
      svg += `<line x1='${pad}' y1='${yStart}' x2='${w - pad}' y2='${yStart}' stroke='#8bc34a' stroke-dasharray='4,2' stroke-width='2' />`;
      svg += `<text x='${w - pad + 4}' y='${yStart + 4}' font-size='11' fill='#8bc34a' text-anchor='start'>Start (${startingWeight})</text>`;
    }
    if (goalWeight !== null) {
      const yGoal = y(goalWeight);
      svg += `<line x1='${pad}' y1='${yGoal}' x2='${w - pad}' y2='${yGoal}' stroke='#ff9800' stroke-dasharray='4,2' stroke-width='2' />`;
      svg += `<text x='${w - pad + 4}' y='${yGoal + 4}' font-size='11' fill='#ff9800' text-anchor='start'>Goal (${goalWeight})</text>`;
    }
    svg += `</svg>`;
    chartDiv.innerHTML = svg;
  }
}

if (!customElements.get('weight-progress-card')) {
  customElements.define('weight-progress-card', WeightProgressCard);
}
