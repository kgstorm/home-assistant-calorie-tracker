class WeightProgressCard extends HTMLElement {
  constructor() {
    super();
    this._eventsAttached = false;
    this._range = '1m';
    this._weightData = [];
    this._lastGoalStartDate = null;
    this._resizeObserver = null;
    this.ranges = ['2w', '1m', '2m', '4m', '6m', '1y', 'goal', 'all'];
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

  _getLocale() {
    return this._hass?.locale?.language || this._hass?.language || undefined;
  }

  _getRangeLabel(value) {
    const map = {
      '2w': this._t('range_last_2_weeks', 'Last 2 weeks'),
      '1m': this._t('range_last_month', 'Last month'),
      '2m': this._t('range_last_2_months', 'Last 2 months'),
      '4m': this._t('range_last_4_months', 'Last 4 months'),
      '6m': this._t('range_last_6_months', 'Last 6 months'),
      '1y': this._t('range_last_year', 'Last year'),
      'goal': this._t('range_since_last_goal', 'Since last goal'),
      'all': this._t('range_all', 'All'),
    };
    return map[value] || value;
  }

  _getRangeOptions() {
    return this.ranges.map((value) => ({ value, label: this._getRangeLabel(value) }));
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
      this._refreshRangeSelectOptions();
      this._renderChart();
    } catch (_err) {
      this.translations = this.translations || {};
      this._translationsRequestedLang = language;
    }
  }

  _refreshRangeSelectOptions() {
    const select = this.querySelector('.weight-range-select');
    if (!select) return;
    const selected = select.value || this._range;
    select.innerHTML = this._getRangeOptions()
      .map((r) => `<option value='${r.value}'>${r.label}</option>`)
      .join('');
    select.value = selected;
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
              ${this._getRangeOptions().map(r => `<option value='${r.value}'>${r.label}</option>`).join('')}
            </select>
            <div class="legend-items" style="display:flex;gap:12px;flex-wrap:wrap;"></div>
          </div>
          <div class="weight-prediction" style="margin-bottom:8px;padding:10px;background:var(--secondary-background-color, rgba(0, 0, 0, 0.05));color:var(--primary-text-color);border-radius:6px;border:1px solid var(--divider-color, rgba(0, 0, 0, 0.12));font-size:13px;line-height:1.4;display:none;">
          </div>
          <div class="weight-chart" style="width:100%;min-height:280px;position:relative;">
            <div class="weight-tooltip" style="position:absolute;display:none;background:rgba(0,0,0,0.8);color:white;padding:8px 12px;border-radius:4px;font-size:12px;pointer-events:none;z-index:1000;white-space:nowrap;"></div>
          </div>
        </div>
      </ha-card>
    `;
    this._syncLastGoalRangeAvailability();
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
      chartDiv.innerHTML = `<div>${this._t('no_profile_entity_found', 'No calorie tracker profile entity found')}</div>`;
      return;
    }
    try {
      const weightPromise = this._hass.connection.sendMessagePromise({
        type: 'calorie_tracker/get_weight_history',
        entity_id: entityId,
      });
      const goalsPromise = this._hass.connection
        .sendMessagePromise({
          type: 'calorie_tracker/get_goals',
          entity_id: entityId,
        })
        .catch(() => null);

      const [weightResp, goalsResp] = await Promise.all([weightPromise, goalsPromise]);
      this._weightData = weightResp.weight_history || [];
      this._lastGoalStartDate = this._extractLastGoalStartDate(
        goalsResp && Array.isArray(goalsResp.goals) ? goalsResp.goals : null,
      );
      this._syncLastGoalRangeAvailability();
      this._renderChart();
    } catch (err) {
      this._lastGoalStartDate = null;
      this._syncLastGoalRangeAvailability();
      chartDiv.innerHTML = `<div>${this._t('failed_fetch_weight_data', 'Failed to fetch weight data')}</div>`;
    }
    // Attach dropdown event
    if (!this._eventsAttached) {
      const select = this.querySelector('.weight-range-select');
      if (select) {
        select.value = this._range;
        select.addEventListener('change', (e) => {
          this._range = e.target.value;
          if (this._range === 'goal' && !this._lastGoalStartDate) {
            this._range = '1m';
            select.value = this._range;
            return;
          }
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
    if (range === 'goal') {
      if (!this._lastGoalStartDate) {
        return [];
      }
      const cutoffStr = this._lastGoalStartDate;
      return data.filter((d) => {
        if (!d || typeof d.date !== 'string') {
          return false;
        }
        return d.date.slice(0, 10) >= cutoffStr;
      });
    }
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
      case '4m':
        cutoff = new Date(now);
        cutoff.setMonth(now.getMonth() - 4);
        break;
      case '6m':
        cutoff = new Date(now);
        cutoff.setMonth(now.getMonth() - 6);
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
      let emptyMessage = this._t('no_weight_data_for_range', 'No weight data available for this range.');
      if (this._range === 'goal') {
        emptyMessage = this._lastGoalStartDate
          ? this._t('need_more_weight_entries_since_goal', 'Need more weight entries since your last goal to display progress.')
          : this._t('set_goal_to_track_progress', 'Set a goal to track progress from your most recent goal start date.');
      }
      chartDiv.innerHTML = `<div>${emptyMessage}</div>`;
      if (legendDiv) legendDiv.innerHTML = '';
      return;
    }
    // Get starting_weight, goal_weight, and weight_unit from entity attributes
    const entityId = this.profileEntityId || (this._hass && Object.keys(this._hass.states).find(eid => eid.startsWith('sensor.calorie_tracker_')));
    let startingWeight = null, goalWeight = null, weightUnit = 'kg';
    if (entityId && this._hass && this._hass.states[entityId]) {
      const attrs = this._hass.states[entityId].attributes || {};
      const toNumber = (value) => {
        if (value === null || value === undefined) {
          return null;
        }
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
      };
      startingWeight = toNumber(attrs.starting_weight);
      goalWeight = toNumber(attrs.goal_weight);
      weightUnit = attrs.weight_unit || 'kg';
    }

  // SVG line chart - use viewBox for responsive scaling
  const w = 400, h = 260, pad = 40;
    const dates = filtered.map(d => new Date(d.date));
    const weights = filtered.map(d => d.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const firstVisibleDate = dates[0];
    const lastVisibleDate = dates[dates.length - 1];
    const msPerDay = 24 * 60 * 60 * 1000;
    const rangeDurationDays = Math.max((lastVisibleDate - firstVisibleDate) / msPerDay, 1);

    const regression = (() => {
      if (dates.length < 2) {
        return null;
      }

      const xValues = dates.map((date) => (date.getTime() - firstVisibleDate.getTime()) / msPerDay);
      const yValues = weights;
      const n = xValues.length;

      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumXX = 0;

      for (let i = 0; i < n; i++) {
        const x = xValues[i];
        const y = yValues[i];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
      }

      const denominator = n * sumXX - sumX * sumX;
      if (Math.abs(denominator) < 1e-9) {
        return null;
      }

      const slope = (n * sumXY - sumX * sumY) / denominator;
      const intercept = (sumY - slope * sumX) / n;

      const meanY = sumY / n;
      let ssTot = 0;
      let ssRes = 0;
      for (let i = 0; i < n; i++) {
        const predicted = intercept + slope * xValues[i];
        const actual = yValues[i];
        ssTot += (actual - meanY) ** 2;
        ssRes += (actual - predicted) ** 2;
      }
      const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 1;

      const weightAt = (date) => {
        const dayDiff = (date.getTime() - firstVisibleDate.getTime()) / msPerDay;
        return intercept + slope * dayDiff;
      };

      return {
        slope,
        intercept,
        weightAt,
        rSquared,
      };
    })();

    let futureProjectionDays = 0;
    let futureEndDate = lastVisibleDate;
    let daysToGoal = null;
    let headingTowardGoal = false;

    if (regression) {
      const slopePerDay = regression.slope;
      const limitDays = rangeDurationDays;
      const weightAtRangeEnd = regression.weightAt(lastVisibleDate);

      let projectionLimit = limitDays;
      if (goalWeight !== null && Math.abs(slopePerDay) > 1e-6) {
        const rawDays = (goalWeight - weightAtRangeEnd) / slopePerDay;
        if (rawDays >= 0) {
          headingTowardGoal = true;
          daysToGoal = rawDays;
          projectionLimit = Math.min(projectionLimit, rawDays);
        }
      }

      if (Math.abs(slopePerDay) > 1e-6) {
        futureProjectionDays = Math.max(0, projectionLimit);
        if (futureProjectionDays > 0) {
          futureEndDate = new Date(lastVisibleDate.getTime() + futureProjectionDays * msPerDay);
        }
      }
    }

    const displayMaxDate = futureProjectionDays > 0 ? futureEndDate : lastVisibleDate;
    const minD = firstVisibleDate.getTime();
    const maxD = displayMaxDate.getTime();
    const x = (date) => pad + ((date.getTime() - minD) / (Math.max(maxD - minD, 1))) * (w - 2 * pad);
    // Focus y-axis on actual data range for better detail, handle reference lines separately
    let yMin = minW;
    let yMax = maxW;

    if (goalWeight !== null) {
      yMin = Math.min(yMin, goalWeight);
      yMax = Math.max(yMax, goalWeight);
    }
    if (regression && futureProjectionDays > 0) {
      const projectedWeight = regression.weightAt(futureEndDate);
      yMin = Math.min(yMin, projectedWeight);
      yMax = Math.max(yMax, projectedWeight);
    }
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
        legendHtml += `<div style="display:flex;align-items:center;"><div style="width:12px;height:2px;background:#ff9800;margin-right:4px;border-style:dashed;border-width:1px 0;border-color:#ff9800;"></div><span style="font-size:12px;">${this._t('start', 'Start')}: ${startingWeight}${rangeText}</span></div>`;
      }
      if (goalWeight !== null) {
        const rangeText = goalInRange ? '' : (goalWeight > yMaxPad ? ' ↑' : ' ↓');
        legendHtml += `<div style="display:flex;align-items:center;"><div style="width:12px;height:2px;background:#8bc34a;margin-right:4px;border-style:dashed;border-width:1px 0;border-color:#8bc34a;"></div><span style="font-size:12px;">${this._t('goal', 'Goal')}: ${goalWeight}${rangeText}</span></div>`;
      }
      legendDiv.innerHTML = legendHtml;
    }

    // Display prediction text if available
    const predictionDiv = this.querySelector('.weight-prediction');
    if (predictionDiv) {
      if (!regression) {
        predictionDiv.style.display = 'none';
      } else {
        const ratePerWeek = regression.slope * 7;
        const rateStr = ratePerWeek >= 0 ? `+${ratePerWeek.toFixed(2)}` : ratePerWeek.toFixed(2);
        const confidenceBucket = regression.rSquared > 0.8 ? 'high' : (regression.rSquared > 0.5 ? 'medium' : 'low');
        const confidenceLevel = confidenceBucket === 'high'
          ? this._t('confidence_high', 'high')
          : (confidenceBucket === 'medium' ? this._t('confidence_medium', 'medium') : this._t('confidence_low', 'low'));
        const confidenceColor = confidenceBucket === 'high'
          ? 'var(--success-color, #4caf50)'
          : (confidenceBucket === 'medium'
            ? 'var(--warning-color, #ff9800)'
            : 'var(--error-color, #f44336)');

        let message = `<strong>${this._t('trend', 'Trend')}:</strong> ${rateStr} ${weightUnit}/${this._t('week', 'week')} <span style="color:${confidenceColor};font-weight:bold;">(${confidenceLevel} ${this._t('confidence', 'confidence')})</span>`;

        if (goalWeight === null) {
          message += `<br/><em>${this._t('set_goal_weight_to_predict', 'Set a goal weight to see a predicted goal date.')}</em>`;
        } else if (Math.abs(regression.slope) < 1e-6) {
          message += `<br/><em>${this._t('trend_flat_unable_project', 'Trend is flat, unable to project goal date.')}</em>`;
        } else if (!headingTowardGoal) {
          message += `<br/><em>${this._t('trend_moving_away_goal', 'Trend is moving away from the goal weight.')}</em>`;
        } else if (daysToGoal !== null && Number.isFinite(daysToGoal)) {
          const predDate = new Date(lastVisibleDate.getTime() + daysToGoal * msPerDay);
          const now = new Date();
          const daysRemaining = Math.round((predDate - now) / msPerDay);
          const dateStr = predDate.toLocaleDateString(this._getLocale(), { month: 'short', day: 'numeric', year: 'numeric' });
          message += `<br/><strong>${this._t('goal_projection', 'Goal projection')}:</strong> ${dateStr} (${this._tf('days_remaining', '{days} days', { days: daysRemaining })})`;
        } else {
          message += `<br/><em>${this._t('unable_calculate_goal_projection', 'Unable to calculate goal projection.')}</em>`;
        }

        predictionDiv.innerHTML = message;
        predictionDiv.style.display = 'block';
      }
    }

    // Redefine y() to use padded min/max
    const y = (weight) => h - pad - ((weight - yMinPad) / (yMaxPad - yMinPad)) * (h - 2 * pad);
    const points = filtered.map(d => [x(new Date(d.date)), y(d.weight)]);
    let svg = `<svg viewBox='0 0 ${w} ${h}' preserveAspectRatio='xMidYMid meet' style='width:100%;height:auto;'>`;

    // Helper function to format date as "DD Mmm"
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = new Intl.DateTimeFormat(this._getLocale(), { month: 'short' }).format(date);
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

    // Draw 5 evenly spaced horizontal gridlines with weight labels
    for (let i = 0; i < 5; i++) {
      const t = i / 4; // 0, 0.25, 0.5, 0.75, 1
      const weight = yMinPad + t * (yMaxPad - yMinPad);
      const yPos = y(weight);
      // Horizontal gridline
      svg += `<line x1='${pad}' y1='${yPos}' x2='${w - pad}' y2='${yPos}' stroke='#d0d0d0' stroke-width='0.5' stroke-dasharray='3,3' />`;
      // Weight label
      svg += `<text x='${pad - 12}' y='${yPos + 4}' font-size='11' fill='#888' text-anchor='end'>${weight.toFixed(1)}</text>`;
    }

    // Line
    svg += `<polyline fill='none' stroke='#03a9f4' stroke-width='2' points='${points.map(p => p.join(",")).join(" ")}' />`;


    // Draw best-fit trend line for the currently visible data, with dashed projection
    if (regression) {
      const solidStartDate = firstVisibleDate;
      const solidEndDate = lastVisibleDate;

      const x1 = x(solidStartDate);
      const y1 = y(regression.weightAt(solidStartDate));
      const x2 = x(solidEndDate);
      const y2 = y(regression.weightAt(solidEndDate));
      svg += `<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='#9c27b0' stroke-width='2' opacity='0.9' />`;

      if (futureProjectionDays > 0) {
        const projectionStartDate = lastVisibleDate;
        const projectionStartWeight = regression.weightAt(projectionStartDate);
        const projectionEndWeight = regression.weightAt(futureEndDate);
        const xStart = x(projectionStartDate);
        const yStart = y(projectionStartWeight);
        const xEnd = x(futureEndDate);
        const yEnd = y(projectionEndWeight);

        svg += `<line x1='${xStart}' y1='${yStart}' x2='${xEnd}' y2='${yEnd}' stroke='#9c27b0' stroke-width='1.75' stroke-dasharray='8,6' opacity='0.6' />`;
        svg += `<circle cx='${xEnd}' cy='${yEnd}' r='3.5' fill='#9c27b0' opacity='0.6' />`;

        const labelDate = futureEndDate;
        const futureLabel = `${labelDate.getDate()} ${new Intl.DateTimeFormat(this._getLocale(), { month: 'short' }).format(labelDate)}`;
        svg += `<text x='${xEnd}' y='${yEnd - 12}' font-size='10' fill='#9c27b0' text-anchor='middle' opacity='0.7'>${futureLabel}</text>`;
      }
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
      svg += `<text x='${w - pad - 40}' y='${indicatorY}' font-size='12' fill='#ff9800' text-anchor='start'>${this._t('start', 'Start')} ${arrow}</text>`;
    }
    if (goalWeight !== null && !goalInRange) {
      const isAbove = goalWeight > yMaxPad;
      const indicatorY = isAbove ? pad + 5 : h - pad - 5;
      const arrow = isAbove ? '↑' : '↓';
      const xOffset = (startingWeight !== null && !startInRange && (goalWeight > yMaxPad) === (startingWeight > yMaxPad)) ? 80 : 40;
      svg += `<text x='${w - pad - xOffset}' y='${indicatorY}' font-size='12' fill='#8bc34a' text-anchor='start'>${this._t('goal', 'Goal')} ${arrow}</text>`;
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

  _extractLastGoalStartDate(goals) {
    if (!Array.isArray(goals) || goals.length === 0) {
      return null;
    }
    const dates = goals
      .map((goal) => {
        if (!goal || typeof goal.start_date !== 'string') {
          return null;
        }
        const trimmed = goal.start_date.trim();
        if (!trimmed) {
          return null;
        }
        return trimmed.slice(0, 10);
      })
      .filter(Boolean);
    if (!dates.length) {
      return null;
    }
    return dates.reduce((latest, current) =>
      latest && latest > current ? latest : current,
    null);
  }

  _syncLastGoalRangeAvailability() {
    const select = this.querySelector('.weight-range-select');
    if (!select) {
      return;
    }
    const option = [...select.options].find((opt) => opt.value === 'goal');
    if (!option) {
      return;
    }
    const available = Boolean(this._lastGoalStartDate);
    option.disabled = !available;
    option.hidden = !available;
    if (available) {
      const labelDate = new Date(this._lastGoalStartDate);
      if (!Number.isNaN(labelDate.getTime())) {
        const formatted = labelDate.toLocaleDateString(this._getLocale(), {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        option.textContent = this._tf('range_since_last_goal_with_date', 'Since last goal ({date})', { date: formatted });
      } else {
        option.textContent = this._t('range_since_last_goal', 'Since last goal');
      }
    } else {
      option.textContent = this._t('range_since_last_goal', 'Since last goal');
      if (this._range === 'goal') {
        this._range = '1m';
        select.value = this._range;
      }
    }
  }
}

if (!customElements.get('weight-progress-card')) {
  customElements.define('weight-progress-card', WeightProgressCard);
}

// Register card for Lovelace Add Card dialog
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'weight-progress-card',
  name: 'Calorie Tracker: Weight Progress',
  description: 'Displays weight history and progress for Calorie Tracker',
  editor: 'weight-progress-editor',
  preview: true,
});

class WeightProgressEditor extends HTMLElement {
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
    const ranges = [
      ['2w', 'Last 2 weeks'],
      ['1m', 'Last month'],
      ['2m', 'Last 2 months'],
      ['4m', 'Last 4 months'],
      ['6m', 'Last 6 months'],
      ['1y', 'Last year'],
      ['goal', 'Since last goal'],
      ['all', 'All'],
    ];
    const defaultRange = this._config.default_range || '1m';
    this.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(
          this._config.title || ''
        )}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(
          this._config.profile_entity_id || ''
        )}"></ha-entity-picker>
        <label style="font-size:12px;color:var(--secondary-text-color);">Default range</label>
        <select>${ranges
          .map(
            r => `<option value="${r[0]}" ${r[0] === defaultRange ? 'selected' : ''}>${r[1]}</option>`
          )
          .join('')}</select>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;

    const titleInput = this.querySelector('paper-input');
    const picker = this.querySelector('ha-entity-picker');
    const select = this.querySelector('select');
    const err = this.querySelector('.error');

    const valueChanged = () => {
      const cfg = { ...this._config };
      if (titleInput && titleInput.value) cfg.title = titleInput.value.trim();
      else delete cfg.title;
      if (picker && picker.value) cfg.profile_entity_id = picker.value;
      else delete cfg.profile_entity_id;
      if (select && select.value) cfg.default_range = select.value;
      else delete cfg.default_range;

      if (!cfg.profile_entity_id) {
        if (err) err.style.display = 'block';
      } else {
        if (err) err.style.display = 'none';
      }

      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg } }));
    };

    if (titleInput) titleInput.addEventListener('value-changed', valueChanged);
    if (picker) picker.addEventListener('value-changed', valueChanged);
    if (select) select.addEventListener('change', valueChanged);
  }

  _escape(str) {
    return String(str).replace(/"/g, '&quot;');
  }
}

if (!customElements.get('weight-progress-editor')) {
  customElements.define('weight-progress-editor', WeightProgressEditor);
}

// Provide built-in visual editor schema for Lovelace
WeightProgressCard.getConfigForm = function () {
  return {
    schema: [
      { name: 'title', selector: { text: {} } },
      {
        name: 'profile_entity_id',
        required: true,
        selector: { entity: { domain: 'sensor', allow_custom_entity: true } },
      },
      {
        name: 'default_range',
        selector: {
          select: {
            options: [
              { value: '2w', label: 'Last 2 weeks' },
              { value: '1m', label: 'Last month' },
              { value: '2m', label: 'Last 2 months' },
              { value: '4m', label: 'Last 4 months' },
              { value: '6m', label: 'Last 6 months' },
              { value: '1y', label: 'Last year' },
              { value: 'goal', label: 'Since last goal' },
              { value: 'all', label: 'All' },
            ],
          },
        },
      },
    ],
  };
};

WeightProgressCard.getStubConfig = function () {
  return { profile_entity_id: '', default_range: '1m' };
};
