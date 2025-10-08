class WeightProgressCard extends HTMLElement {
  constructor() {
    super();
    this._eventsAttached = false;
    this._range = '1m';
    this._weightData = [];
    this._analysis = null;
    this._resizeObserver = null;
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
        <div class="weight-progress-wrapper" style="padding:16px;">
          <div class="weight-controls" style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;">
            <select class="weight-range-select" style="padding:4px 8px;">
              ${this.ranges.map(r => `<option value='${r.value}'>${r.label}</option>`).join('')}
            </select>
            <div class="legend-items" style="display:flex;gap:12px;flex-wrap:wrap;"></div>
          </div>
          <div class="weight-prediction" style="margin-bottom:8px;padding:8px;background:#f0f0f0;border-radius:4px;font-size:13px;display:none;"></div>
          <div class="weight-chart" style="width:100%;min-height:280px;position:relative;">
            <div class="weight-tooltip" style="position:absolute;display:none;background:rgba(0,0,0,0.8);color:white;padding:8px 12px;border-radius:4px;font-size:12px;pointer-events:none;z-index:1000;white-space:nowrap;"></div>
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

      // Fetch weight trend analysis
      try {
        const analysisResp = await this._hass.connection.sendMessagePromise({
          type: 'calorie_tracker/analyze_weight_trend',
          entity_id: entityId,
        });
        this._analysis = analysisResp;
      } catch (err) {
        // Analysis optional - might not have enough data or missing dependencies
        this._analysis = null;
      }

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

      // Setup resize observer to re-render chart when card size changes
      const chartDiv = this.querySelector('.weight-chart');
      if (chartDiv && window.ResizeObserver) {
        this._resizeObserver = new ResizeObserver(() => {
          this._renderChart();
        });
        this._resizeObserver.observe(chartDiv);
      }

      this._eventsAttached = true;
    }
  }

  disconnectedCallback() {
    // Clean up resize observer when element is removed
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
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
    const legendDiv = this.querySelector('.legend-items');
    if (!chartDiv) return;

    // Wait for next frame to ensure layout is calculated
    requestAnimationFrame(() => {
      this._doRenderChart(chartDiv, legendDiv);
    });
  }

  _doRenderChart(chartDiv, legendDiv) {
    if (!chartDiv) return;
    const filtered = this._filterDataByRange(this._weightData, this._range);
    if (!filtered.length || filtered.length < 2) {
      chartDiv.innerHTML = '<div>No weight data available for this range.</div>';
      if (legendDiv) legendDiv.innerHTML = '';
      return;
    }
    // Get starting_weight, goal_weight, and weight_unit from entity attributes
    const entityId = this.profileEntityId || (this._hass && Object.keys(this._hass.states).find(eid => eid.startsWith('sensor.calorie_tracker_')));
    let startingWeight = null, goalWeight = null, weightUnit = 'kg';
    if (entityId && this._hass && this._hass.states[entityId]) {
      const attrs = this._hass.states[entityId].attributes || {};
      startingWeight = attrs.starting_weight || null;
      goalWeight = attrs.goal_weight || null;
      weightUnit = attrs.weight_unit || 'kg';
    }

    // SVG line chart - use viewBox for responsive scaling
    const w = 400, h = 260, pad = 32; // Fixed viewBox dimensions
    const dates = filtered.map(d => new Date(d.date));
    const weights = filtered.map(d => d.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const minD = Math.min(...dates.map(d => d.getTime()));
    const maxD = Math.max(...dates.map(d => d.getTime()));
    const x = (date) => pad + ((date.getTime() - minD) / (maxD - minD || 1)) * (w - 2 * pad);
    // Focus y-axis on actual data range for better detail, handle reference lines separately
    let yMin = Math.min(...weights);
    let yMax = Math.max(...weights);
    const dataRange = yMax - yMin || 1;

    // Add padding to data range
    const padFrac = 0.15; // Slightly more padding for better visibility
    const yMinPad = yMin - dataRange * padFrac;
    const yMaxPad = yMax + dataRange * padFrac;

    // Check if reference lines are within visible range
    const startInRange = startingWeight !== null && startingWeight >= yMinPad && startingWeight <= yMaxPad;
    const goalInRange = goalWeight !== null && goalWeight >= yMinPad && goalWeight <= yMaxPad;

    // Update legend with range indicators - compact inline format
    if (legendDiv) {
      let legendHtml = '';
      if (startingWeight !== null) {
        const rangeText = startInRange ? '' : (startingWeight > yMaxPad ? ' ↑' : ' ↓');
        legendHtml += `<div style="display:flex;align-items:center;"><div style="width:12px;height:2px;background:#ff9800;margin-right:4px;border-style:dashed;border-width:1px 0;border-color:#ff9800;"></div><span style="font-size:12px;">Start: ${startingWeight}${rangeText}</span></div>`;
      }
      if (goalWeight !== null) {
        const rangeText = goalInRange ? '' : (goalWeight > yMaxPad ? ' ↑' : ' ↓');
        legendHtml += `<div style="display:flex;align-items:center;"><div style="width:12px;height:2px;background:#8bc34a;margin-right:4px;border-style:dashed;border-width:1px 0;border-color:#8bc34a;"></div><span style="font-size:12px;">Goal: ${goalWeight}${rangeText}</span></div>`;
      }
      legendDiv.innerHTML = legendHtml;
    }

    // Display prediction text if available
    const predictionDiv = this.querySelector('.weight-prediction');
    if (predictionDiv && this._analysis && this._analysis.prediction) {
      const pred = this._analysis.prediction;
      let predText = '';
      if (pred.predicted_date) {
        const predDate = new Date(pred.predicted_date);
        const now = new Date();
        const daysRemaining = Math.round((predDate - now) / (1000 * 60 * 60 * 24));
        const dateStr = predDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const rateStr = pred.current_rate > 0 ? `+${pred.current_rate.toFixed(2)}` : pred.current_rate.toFixed(2);
        const confidenceColor = pred.confidence === 'high' ? '#4caf50' : (pred.confidence === 'medium' ? '#ff9800' : '#f44336');
        predText = `<strong>Prediction:</strong> Goal weight expected by <strong>${dateStr}</strong> (${daysRemaining} days) at current rate of <strong>${rateStr} ${weightUnit}/day</strong> <span style="color:${confidenceColor};font-weight:bold;">(${pred.confidence} confidence)</span>`;
      } else {
        predText = `<strong>Prediction:</strong> ${pred.message || 'Unable to predict goal achievement'}`;
      }
      predictionDiv.innerHTML = predText;
      predictionDiv.style.display = 'block';
    } else if (predictionDiv) {
      predictionDiv.style.display = 'none';
    }

    // Redefine y() to use padded min/max
    const y = (weight) => h - pad - ((weight - yMinPad) / (yMaxPad - yMinPad)) * (h - 2 * pad);
    const points = filtered.map(d => [x(new Date(d.date)), y(d.weight)]);
    let svg = `<svg viewBox='0 0 ${w} ${h}' preserveAspectRatio='xMidYMid meet' style='width:100%;height:auto;'>`;

    // Helper function to format date as "DD Mmm"
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      return `${day} ${month}`;
    };

    // Draw 5 evenly spaced vertical gridlines with date labels
    for (let i = 0; i < 5; i++) {
      const t = i / 4; // 0, 0.25, 0.5, 0.75, 1
      const dateTime = minD + t * (maxD - minD);
      const date = new Date(dateTime);
      const xPos = x(date);
      // Vertical gridline
      svg += `<line x1='${xPos}' y1='${pad}' x2='${xPos}' y2='${h - pad}' stroke='#d0d0d0' stroke-width='0.5' stroke-dasharray='3,3' />`;
      // Date label
      svg += `<text x='${xPos}' y='${h - pad + 18}' font-size='11' fill='#888' text-anchor='middle'>${formatDate(date)}</text>`;
    }

    // Draw 3 evenly spaced horizontal gridlines with weight labels
    for (let i = 0; i < 3; i++) {
      const t = i / 2; // 0, 0.5, 1
      const weight = yMinPad + t * (yMaxPad - yMinPad);
      const yPos = y(weight);
      // Horizontal gridline
      svg += `<line x1='${pad}' y1='${yPos}' x2='${w - pad}' y2='${yPos}' stroke='#d0d0d0' stroke-width='0.5' stroke-dasharray='3,3' />`;
      // Weight label
      svg += `<text x='${pad - 8}' y='${yPos + 4}' font-size='11' fill='#888' text-anchor='end'>${weight.toFixed(1)}</text>`;
    }

    // Line
    svg += `<polyline fill='none' stroke='#03a9f4' stroke-width='2' points='${points.map(p => p.join(",")).join(" ")}' />`;

    // Find the most recent change point from the full weight data (not just filtered view)
    let lastChangePointDate = null;
    let lastChangePointWeight = null;
    if (this._analysis && this._analysis.change_points && this._analysis.change_points.length > 0) {
      // Find the absolute last change point (from all data, not just visible)
      const allChangePoints = this._analysis.change_points;
      const lastChangePoint = allChangePoints[allChangePoints.length - 1];
      const lastCPDate = new Date(lastChangePoint.date);

      // Only use it if it's within our data range
      if (lastCPDate >= dates[0] && lastCPDate <= dates[dates.length - 1]) {
        lastChangePointDate = lastCPDate;
        // Find the weight at this change point
        const cpDataPoint = filtered.find(d => d.date === lastChangePoint.date);
        if (cpDataPoint) {
          lastChangePointWeight = cpDataPoint.weight;
        }
      }

      // Draw all visible change point markers
      allChangePoints.forEach(cp => {
        const cpDate = new Date(cp.date);
        if (cpDate >= dates[0] && cpDate <= dates[dates.length - 1]) {
          const xPos = x(cpDate);
          // Find corresponding weight at this date
          const dataPoint = filtered.find(d => d.date === cp.date);
          if (dataPoint) {
            const yPos = y(dataPoint.weight);
            // Draw vertical marker line
            svg += `<line x1='${xPos}' y1='${pad}' x2='${xPos}' y2='${h - pad}' stroke='#ff5722' stroke-width='1' stroke-dasharray='2,2' opacity='0.5' />`;
            // Draw marker circle
            svg += `<circle cx='${xPos}' cy='${yPos}' r='6' fill='none' stroke='#ff5722' stroke-width='2' />`;
          }
        }
      });
    }

    // Draw trend line if prediction available
    if (this._analysis && this._analysis.prediction && this._analysis.prediction.current_rate) {
      const pred = this._analysis.prediction;
      const dailyRate = pred.current_rate / 7; // Convert weekly rate to daily

      // Use the prediction rate from backend (calculated on full dataset after last change point)
      // The backend already considers change points when calculating the prediction

      // Find where to start the trend line in the visible data
      let trendStartDate, trendStartWeight;

      if (lastChangePointDate && lastChangePointWeight) {
        // Start from the last change point
        trendStartDate = lastChangePointDate;
        trendStartWeight = lastChangePointWeight;
      } else {
        // No change points visible, start from first visible data point
        trendStartDate = dates[0];
        trendStartWeight = weights[0];
      }

      // The last actual data point (end of solid line)
      const lastDate = dates[dates.length - 1];
      const lastWeight = weights[weights.length - 1];

      // Calculate future projection point
      let futureDays = 30; // Default to 30 days ahead
      if (pred.days_remaining) {
        if (pred.days_remaining < 90) {
          // Show up to goal date if it's within 90 days
          futureDays = Math.min(pred.days_remaining + 10, 60); // Show a bit past goal, cap at 60 days
        } else {
          // Goal is far away, just show 60 days
          futureDays = 60;
        }
      }

      const futureDate = new Date(lastDate.getTime() + futureDays * 24 * 60 * 60 * 1000);
      const futureWeight = lastWeight + (dailyRate * futureDays);

      // Extend the time domain to include future dates
      const extendedMaxD = futureDate.getTime();
      const xExtended = (date) => pad + ((date.getTime() - minD) / (extendedMaxD - minD || 1)) * (w - 2 * pad);

      // Calculate trend line endpoint at last data point using backend's predicted slope
      const daysSinceStart = (lastDate - trendStartDate) / (1000 * 60 * 60 * 24);
      const trendEndWeight = trendStartWeight + (dailyRate * daysSinceStart);

      // Draw trend line from change point/start through current data
      const x1 = xExtended(trendStartDate);
      const y1 = y(trendStartWeight);
      const x2 = xExtended(lastDate);
      const y2 = y(trendEndWeight);

      // Solid trend line through existing data
      svg += `<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='#9c27b0' stroke-width='2' stroke-dasharray='5,3' opacity='0.8' />`;

      // Future projection line
      const x3 = xExtended(futureDate);
      const y3 = y(futureWeight);
      svg += `<line x1='${x2}' y1='${y2}' x2='${x3}' y2='${y3}' stroke='#9c27b0' stroke-width='1.5' stroke-dasharray='8,6' opacity='0.5' />`;

      // Add circle at end of projection
      svg += `<circle cx='${x3}' cy='${y3}' r='3' fill='#9c27b0' opacity='0.5' />`;

      // Add date label at future point for context
      const futureMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const futureLabel = `${futureDate.getDate()} ${futureMonthNames[futureDate.getMonth()]}`;
      svg += `<text x='${x3}' y='${y3 - 12}' font-size='10' fill='#9c27b0' text-anchor='middle' opacity='0.7'>${futureLabel}</text>`;
    }

    // Points with data attributes for hover
    points.forEach((p, i) => {
      svg += `<circle class='weight-point' data-index='${i}' cx='${p[0]}' cy='${p[1]}' r='4' fill='#03a9f4' stroke='#fff' stroke-width='1.5' style='cursor:pointer;' />`;
    });
    // Plot horizontal lines for starting_weight and goal_weight only if in visible range
    if (startInRange) {
      const yStart = y(startingWeight);
      svg += `<line x1='${pad}' y1='${yStart}' x2='${w - pad}' y2='${yStart}' stroke='#ff9800' stroke-dasharray='4,2' stroke-width='1.5' />`;
    }
    if (goalInRange) {
      const yGoal = y(goalWeight);
      svg += `<line x1='${pad}' y1='${yGoal}' x2='${w - pad}' y2='${yGoal}' stroke='#8bc34a' stroke-dasharray='4,2' stroke-width='1.5' />`;
    }

    // Add indicators for reference lines outside visible range
    if (startingWeight !== null && !startInRange) {
      const isAbove = startingWeight > yMaxPad;
      const indicatorY = isAbove ? pad + 5 : h - pad - 5;
      const arrow = isAbove ? '↑' : '↓';
      svg += `<text x='${w - pad - 40}' y='${indicatorY}' font-size='12' fill='#ff9800' text-anchor='start'>Start ${arrow}</text>`;
    }
    if (goalWeight !== null && !goalInRange) {
      const isAbove = goalWeight > yMaxPad;
      const indicatorY = isAbove ? pad + 5 : h - pad - 5;
      const arrow = isAbove ? '↑' : '↓';
      const xOffset = (startingWeight !== null && !startInRange && (goalWeight > yMaxPad) === (startingWeight > yMaxPad)) ? 80 : 40;
      svg += `<text x='${w - pad - xOffset}' y='${indicatorY}' font-size='12' fill='#8bc34a' text-anchor='start'>Goal ${arrow}</text>`;
    }
    svg += `</svg>`;
    chartDiv.innerHTML = `<div style="position:relative;width:100%;">${svg}<div class="weight-tooltip" style="position:absolute;display:none;background:rgba(0,0,0,0.8);color:white;padding:8px 12px;border-radius:4px;font-size:12px;pointer-events:none;z-index:1000;white-space:nowrap;"></div></div>`;

    // Add hover event listeners to points
    const tooltip = chartDiv.querySelector('.weight-tooltip');
    const svgPoints = chartDiv.querySelectorAll('.weight-point');
    svgPoints.forEach((point) => {
      point.addEventListener('mouseenter', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        const data = filtered[idx];
        const date = new Date(data.date);
        tooltip.innerHTML = `<div><strong>${formatDate(date)}</strong></div><div>${data.weight} ${weightUnit}</div>`;
        tooltip.style.display = 'block';
      });

      point.addEventListener('mousemove', (e) => {
        const rect = chartDiv.getBoundingClientRect();
        tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
        tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
      });

      point.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });
  }
}

if (!customElements.get('weight-progress-card')) {
  customElements.define('weight-progress-card', WeightProgressCard);
}
