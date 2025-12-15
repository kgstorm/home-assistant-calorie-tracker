import{a as ce,b as $,c as Q,g as de,h as ge}from"./chunk-EMR7U3YA.js";import{e as pe,g as oe}from"./chunk-5HHMTMB7.js";var ue=pe(()=>{ge();function V(W=new Date){let t=W.getFullYear(),a=String(W.getMonth()+1).padStart(2,"0"),r=String(W.getDate()).padStart(2,"0");return`${t}-${a}-${r}`}function G(W){let[t,a,r]=W.split("-").map(Number);return new Date(t,a-1,r)}var J=class extends de{constructor(){super(),this._showCalendar=!1;let t=new Date;this._calendarMonth=t.getMonth(),this._calendarYear=t.getFullYear(),this._calendarDataDates=new Set}set hass(t){this._hass=t,this.requestUpdate()}get hass(){return this._hass}render(){var z,L,Y,F,j,U,K;if(!this.profile||!this.hass)return $`<p>Loading...</p>`;let t=(L=(z=this.profile)==null?void 0:z.attributes)!=null?L:{},a=(Y=t.daily_goal)!=null?Y:2e3,r="Not Set";if(this.weeklySummary&&this.selectedDate&&this.weeklySummary[this.selectedDate]){let e=this.weeklySummary[this.selectedDate];Array.isArray(e)&&e.length>=5&&(r=e[4]||"Not Set")}r==="Not Set"&&(r=(F=t.goal_type)!=null?F:"fixed_intake");let i=(j=this.weeklySummary)!=null?j:{},H=(U=t.weight_today)!=null?U:null,f=t.weight_unit||"lbs",n=this.selectedDate?G(this.selectedDate):new Date,l=new Date(n);l.setHours(0,0,0,0),l.setDate(n.getDate()-n.getDay());let b=Array.from({length:7},(e,o)=>{let d=new Date(l);return d.setDate(l.getDate()+o),V(d)}),y=this.selectedDate,P="Today",h=V();if(y||(y=h),y!==h){let e=G(y);P=`${e.getDate().toString().padStart(2,"0")} ${e.toLocaleString(void 0,{month:"short"})} ${e.getFullYear().toString().slice(-2)}`}let g=0,M=0,q=(K=this.weight)!=null?K:null,R=a,S=r,N=0;if(i[y]!==void 0){let e=i[y];if(Array.isArray(e)&&e.length>=9){let[o,d,,c,s,,,,p]=e;g=this._getDisplayCalories(o,d,s),M=d,R=c,S=s,N=p}else if(Array.isArray(e)&&e.length>=6){let[o,d,,c,s]=e;g=this._getDisplayCalories(o,d,s),M=d,R=c,S=s,N=c-g}}let Z=b.map(e=>{if(i.hasOwnProperty(e)){let o=i[e];if(Array.isArray(o)&&o.length>=6){let[d,c,,s,p]=o;return this._getDisplayCalories(d,c,p)}}return 0}),I=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],X=b.map(e=>{let o=G(e);return I[o.getDay()]}),ee=Z.reduce((e,o)=>o!==null?e+o:e,0),te=b.filter(e=>{if(i.hasOwnProperty(e)){let o=i[e];if(Array.isArray(o)&&o.length>=2){let[d,c]=o;return d!==0||c!==0}}return!1}).length,w="";if(te>0){let e=0,o=0,d=0;if(b.forEach(c=>{if(i.hasOwnProperty(c)){let s=i[c];if(Array.isArray(s)&&s.length>=9){let[p,m,x,v,_,,,,C]=s;if(p!==0||m!==0){let A=V();if(c===A){let E=new Date,O=E.getHours()+E.getMinutes()/60;x=x*(O/24)}let T=x+m-p;e+=T,o+=-C,d++}}else if(Array.isArray(s)&&s.length>=6){let[p,m,x,v,_]=s;if(p!==0||m!==0){let C=V();if(c===C){let O=new Date,ae=O.getHours()+O.getMinutes()/60;x=x*(ae/24)}let A=x+m-p;e+=A;let E=this._getDisplayCalories(p,m,_)-v;o+=E,d++}}}}),d>0){let s=e/3500,p=s,m=f;f==="kg"&&(p=s*.45359237);let v=Math.abs(p).toFixed(1),_=o>0,C=e<0?"gained":"lost",A=_?`${Math.round(Math.abs(o))} Cal Over Goal`:`${Math.round(Math.abs(o))} Cal Under Goal`,T=e<0?`${v} ${f} gained (estimate)`:`${v} ${f} lost (estimate)`;w={calorie:A,weight:T,calorieColor:_?"#f44336":"#4caf50",weightColor:r==="fixed_surplus"||r==="variable_bulk"?"#4caf50":e<0?"#f44336":"#4caf50"}}else{let c=0,s=0;b.forEach(x=>{if(i.hasOwnProperty(x)){let v=i[x];if(Array.isArray(v)&&v.length>=6){let[_,C,,A,T]=v;(_!==0||C!==0)&&(s+=this._getDisplayCalories(_,C,T),c+=A)}}});let p=s-c;w={calorie:p>=0?`${p} Cal Over - Week`:`${Math.abs(p)} Cal Under - Week`,weight:null,calorieColor:p>=0?"#f44336":"#4caf50",weightColor:null}}}else w={calorie:"0 Cal Under Goal",weight:`0.0 ${f} lost (estimate)`,calorieColor:"#4caf50",weightColor:"#4caf50"};let u=a;if(this.selectedDate&&i[this.selectedDate]){let e=i[this.selectedDate];if(Array.isArray(e)&&e.length>=6){let[,,,o]=e;u=o}}let B=this._barVisualHeight||95,D=(1-1/1.4)*B,k=new Set(Object.entries(i).filter(([e,o])=>{if(Array.isArray(o)&&o.length>=2){let[d,c]=o;return d!==0||c!==0}return!1}).map(([e])=>e));return $`
      <div class="summary-container">
        <div class="gauge-section">
          <div class="gauge-labels">
            <div class="titles">${P}</div>
          </div>
          <div class="gauge-container">
            ${this._renderGauge(g,R,S,N)}
          </div>
        </div>
        <div class="bar-graph-section">
          <div class="titles weekly-header">
            <button class="week-nav-btn" @click=${()=>this._changeWeek(-1)} title="Previous week" style="background:none;border:none;cursor:pointer;padding:0 2px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <span class="weekly-header-text">Weekly Summary</span>
            <button class="week-nav-btn" @click=${()=>this._changeWeek(1)} title="Next week" style="background:none;border:none;cursor:pointer;padding:0 2px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
            <button class="calendar-btn" @click=${()=>this._toggleCalendar()} title="Pick week from calendar"
              style="background:none;border:none;cursor:pointer;padding:0 2px; margin-left:4px;">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"/>
              </svg>
            </button>
          </div>
          ${this._showCalendar?this._renderCalendar(k):""}
          <div class="bar-graph">
            <div
              class="goal-line-horizontal"
              style="top: ${D}px; bottom: auto;"
            ></div>
            ${b.map((e,o)=>{let d=i[e],c=0,s=a,p=r,m="0";if(d&&Array.isArray(d)&&d.length>=6){let[ie,ne,,he,se]=d;if(s=he,p=se,ie!==0||ne!==0){let le=this._getDisplayCalories(ie,ne,se);c=le;let re=le-s;m=re>0?`+${Math.round(re)}`:`${Math.round(re)}`}else c=0,m="0"}let x=s*1.4,v=Math.min(c,x),C=Math.min(s,c)/x*100,T=(v>s?v-s:0)/x*100,E=G(e),O=`${E.getDate().toString().padStart(2,"0")} ${E.toLocaleString(void 0,{month:"short"})}`,ae=this.selectedDate===e;return $`
                <div
                  class="bar${ae?" selected":""}"
                  style="cursor:pointer"
                  @click=${()=>this._onBarClick(e)}
                  title="Show details for ${O}"
                >
                  <div class="bar-visual">
                    <div class="bar-outline"></div>
                    <div
                      class="bar-fill-green"
                      style="height: ${C}%"
                    ></div>
                    <div
                      class="bar-fill-red"
                      style="height: ${T}%"
                    ></div>
                  </div>
                  <div class="bar-label">${m}</div>
                  <div class="day-label">${X[o]}</div>
                  <div class="date-label">${O}</div>
                </div>
              `})}
          </div>
          ${w?$`
            <div class="weekly-summary">
              <div style="color: ${w.calorieColor};">${w.calorie}</div>
              ${w.weight?$`
                <div style="color: ${w.weightColor}; font-size: 14px; margin-top: 2px;">${w.weight}</div>
              `:""}
            </div>
          `:""}
        </div>
        ${this._showWeightPopup?$`
          <div class="modal-backdrop" @click=${this._closeWeightPopup}></div>
          <div class="modal-popup" @click=${e=>e.stopPropagation()}>
            <div class="modal-header">
              Edit Weight for
              ${(()=>{let e=this.selectedDate?G(this.selectedDate):new Date;return`${e.getDate().toString().padStart(2,"0")} ${e.toLocaleString(void 0,{month:"short"})} ${e.getFullYear()}`})()}
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
                placeholder="Enter weight in ${f}"
                style="width: 100%;"
              />
            </div>
            ${this._weightInputError?$`
              <div style="color: #f44336; font-size: 0.95em; margin-bottom: 8px;">
                ${this._weightInputError}
              </div>
            `:""}
            <div class="edit-actions">
              <button class="ha-btn" @click=${this._saveWeight}>Save</button>
              <button class="ha-btn" @click=${this._closeWeightPopup}>Cancel</button>
            </div>
          </div>
        `:""}
      </div>
    `}firstUpdated(){this._measureBarVisualHeight(),window.addEventListener("resize",()=>this._measureBarVisualHeight())}_measureBarVisualHeight(){let t=this.renderRoot.querySelector(".bar-visual");if(t){let a=t.offsetHeight;a!==this._barVisualHeight&&(this._barVisualHeight=a)}}_renderGauge(t,a,r,i=null){let f=a*(r==="variable_bulk"?1.1:1.4),n={x:70,y:70},l=40,b=8,y=-180,P=0,h=P-y,g=Math.max(Math.min(t/f,1),0),M=y+g*h,q=a/f,R=y+q*h,S=u=>u*Math.PI/180,N=(u,B,D)=>{let k=S(u),z=S(B),L=n.x+D*Math.cos(k),Y=n.y+D*Math.sin(k),F=n.x+D*Math.cos(z),j=n.y+D*Math.sin(z),U=Math.abs(B-u)>180?1:0;return`M ${L} ${Y} A ${D} ${D} 0 ${U} 1 ${F} ${j}`},Z=500,I=[];for(let u=0;u<=f;u+=Z){let B=u/f,D=y+B*h,k=S(D),z=l+5,L=l+12,Y=l+20,F=n.x+z*Math.cos(k),j=n.y+z*Math.sin(k),U=n.x+L*Math.cos(k),K=n.y+L*Math.sin(k),e=n.x+Y*Math.cos(k),o=n.y+Y*Math.sin(k);I.push({line:`M ${F} ${j} L ${U} ${K}`,label:{x:e,y:o,value:u}})}let X=S(M),ee=l-5,te=n.x+ee*Math.cos(X),w=n.y+ee*Math.sin(X);return Q`
      <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
        <!-- Background arc -->
        <path
          d="${N(y,P,l)}"
          fill="none"
          stroke="#eee"
          stroke-width="${b}"
          stroke-linecap="round"
        />

        <!-- Green arc (0 to goal) -->
        <path
          d="${N(y,R,l)}"
          fill="none"
          stroke="#4caf50"
          stroke-width="${b}"
          stroke-linecap="round"
        />

        <!-- Red arc (goal to current, if over goal) -->
        <path
          d="${N(R,P,l)}"
          fill="none"
          stroke="#f44336"
          stroke-width="${b}"
          stroke-linecap="round"
        />

        <!-- Tick marks -->
        ${I.map(u=>Q`
          <path
            d="${u.line}"
            stroke="var(--secondary-text-color, #666)"
            stroke-width="1"
          />
        `)}

        <!-- Tick labels -->
        ${I.map(u=>Q`
          <text
            x="${u.label.x}"
            y="${u.label.y}"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="9"
            fill="var(--secondary-text-color, #666)"
          >
            ${u.label.value}
          </text>
        `)}

        <!-- Needle -->
        <line
          x1="${n.x}"
          y1="${n.y}"
          x2="${te}"
          y2="${w}"
          stroke="var(--primary-text-color, #333)"
          stroke-width="2"
          stroke-linecap="round"
        />

        <!-- Center dot -->
        <circle
          cx="${n.x}"
          cy="${n.y}"
          r="3"
          fill="var(--primary-text-color, #333)"
        />

        <!-- Current value label -->
        <text
          class="gauge-cal-label"
          x="${n.x}"
          y="${n.y+l-5}"
          text-anchor="middle"
          fill="${t<=a?"#4caf50":"#f44336"}"
        >
          ${Math.round(t)} Cal${["fixed_surplus","fixed_deficit","variable_cut","variable_bulk","fixed_net_calories"].includes(r)?" (net)":""}
        </text>

        <!-- Over/Under label -->
        <text
          class="gauge-over-label"
          x="${n.x}"
          y="${n.y+l+18}"
          text-anchor="middle"
          fill="${i!==null?i>=0?"#4caf50":"#f44336":t<=a?"#4caf50":"#f44336"}"
        >
          ${i!==null?i>=0?`${Math.round(i)} Under`:`${Math.round(Math.abs(i))} Over`:t-a>=0?`${Math.round(t-a)} Over`:`${Math.round(a-t)} Under`}
        </text>
      </svg>
    `}_onBarClick(t){this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:t},bubbles:!0,composed:!0}))}_changeWeek(t){let a=this.selectedDate?G(this.selectedDate):new Date,r=new Date(a);r.setHours(0,0,0,0),r.setDate(a.getDate()-a.getDay()),r.setDate(r.getDate()+t*7);let i=V(r);this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:i},bubbles:!0,composed:!0}))}_toggleCalendar(){if(this._showCalendar=!this._showCalendar,this._showCalendar&&this.selectedDate){let t=G(this.selectedDate);this._calendarMonth=t.getMonth(),this._calendarYear=t.getFullYear(),this._fetchCalendarDataDates()}}async _fetchCalendarDataDates(){if(!this.hass||!this.profile)return;let t=this.profile.entity_id,a=this._calendarYear,r=this._calendarMonth+1;try{let i=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_month_data_days",entity_id:t,year:a,month:r});this._calendarDataDates=new Set(i.days||[])}catch(i){this._calendarDataDates=new Set}}_changeCalendarMonth(t){let a=this._calendarMonth+t,r=this._calendarYear;a<0?(a=11,r-=1):a>11&&(a=0,r+=1),this._calendarMonth=a,this._calendarYear=r,this._fetchCalendarDataDates()}_changeCalendarYear(t){this._calendarYear+=t,this._fetchCalendarDataDates()}_renderCalendar(t){let a=this._calendarMonth,r=this._calendarYear,H=new Date(r,a,1).getDay(),f=new Date(r,a+1,0).getDate(),n=[],l=[];for(let h=0;h<H;h++)l.push(null);for(let h=1;h<=f;h++)l.push(h),l.length===7&&(n.push(l),l=[]);if(l.length){for(;l.length<7;)l.push(null);n.push(l)}let b=h=>{if(!h)return!1;let g=`${r}-${String(a+1).padStart(2,"0")}-${String(h).padStart(2,"0")}`;return this._calendarDataDates.has(g)},y=h=>{if(!h)return;let g=new Date(r,a,h),M=V(g);this._showCalendar=!1,this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:M},bubbles:!0,composed:!0}))};return $`
      <div class="calendar-popup themed-calendar-popup">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <button @click=${()=>this._changeCalendarMonth(-1)} style="background:none;border:none;cursor:pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <span style="font-weight:bold;">
            ${["January","February","March","April","May","June","July","August","September","October","November","December"][a]} ${r}
          </span>
          <button @click=${()=>this._changeCalendarMonth(1)} style="background:none;border:none;cursor:pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;">
          <button @click=${()=>this._changeCalendarYear(-1)} style="background:none;border:none;cursor:pointer;font-size:12px;">« Prev Year</button>
          <button @click=${()=>this._changeCalendarYear(1)} style="background:none;border:none;cursor:pointer;font-size:12px;">Next Year »</button>
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
            ${n.map(h=>$`
              <tr>
                ${h.map(g=>{let M=g&&this.selectedDate&&this._isSameDay(r,a,g,this.selectedDate),q=b(g);return $`
                    <td
                      class=${[M?"selected-date":"",q?"has-entry":""].join(" ")}
                      style="
                        text-align:center;
                        padding:2px 0;
                        cursor:${g?"pointer":"default"};
                        border-radius:4px;
                      "
                      @click=${()=>y(g)}
                    >
                      ${g||""}
                    </td>
                  `})}
              </tr>
            `)}
          </tbody>
        </table>
        <div style="text-align:right;margin-top:8px;">
          <button @click=${()=>this._showCalendar=!1} class="calendar-close-btn">Close</button>
        </div>
      </div>
    `}_isSameDay(t,a,r,i){let H=G(i);return H.getFullYear()===t&&H.getMonth()===a&&H.getDate()===r}_getDisplayCalories(t,a,r){return r==="fixed_intake"?t:t-a}};oe(J,"properties",{hass:{attribute:!1},profile:{attribute:!1},weeklySummary:{attribute:!1},selectedDate:{type:String},weight:{type:Number},_barVisualHeight:{type:Number,state:!0},_showCalendar:{type:Boolean,state:!0},_calendarMonth:{type:Number,state:!0},_calendarYear:{type:Number,state:!0},_calendarDataDates:{type:Object,state:!0}}),oe(J,"styles",[ce`
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
    .titles.weekly-header { margin-bottom: 0; }
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
    /* Header containing week navigation + title */
    .weekly-header {
      display:flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      position:relative;
      white-space:nowrap; /* prefer single line */
    }
    .weekly-header-text { white-space:nowrap; }
    .weekly-header button.week-nav-btn,
    .weekly-header button.calendar-btn { flex:0 0 auto; }
    /* Tighten spacing on very small widths to keep one line */
    @media (max-width: 385px) {
      .weekly-header { gap:4px; }
      .weekly-header button.week-nav-btn svg,
      .weekly-header button.calendar-btn svg { width:16px; height:16px; }
      .weekly-header-text { font-size:14px; }
    }
    /* Extra tightening below 375px (iPhone SE) */
    @media (max-width: 375px) {
      .weekly-header { gap:2px; }
      .weekly-header-text { letter-spacing:0; }
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
  `]);customElements.get("calorie-summary")||customElements.define("calorie-summary",J)});export{ue as a};
//# sourceMappingURL=chunk-6HXXGXV5.js.map
