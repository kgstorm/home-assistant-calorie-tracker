import{a as pe,b,c as te,g as ge,h as xe}from"./chunk-EMR7U3YA.js";import{e as ye,g as ie}from"./chunk-5HHMTMB7.js";var me=ye(()=>{xe();function V(v=new Date){let t=v.getFullYear(),a=String(v.getMonth()+1).padStart(2,"0"),r=String(v.getDate()).padStart(2,"0");return`${t}-${a}-${r}`}function O(v){let[t,a,r]=v.split("-").map(Number);return new Date(t,a-1,r)}function ne(v,t){return t==="monday"?v===0?6:v-1:v}function fe(v){return v==="monday"?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]}var q=class extends ge{constructor(){super(),this._showCalendar=!1;let t=new Date;this._calendarMonth=t.getMonth(),this._calendarYear=t.getFullYear(),this._calendarDataDates=new Set,this.weekStartDay="sunday"}set hass(t){this._hass=t,this.requestUpdate()}get hass(){return this._hass}render(){var Y,B,j,U,Q,Z,ee;if(!this.profile||!this.hass)return b`<p>Loading...</p>`;let t=(B=(Y=this.profile)==null?void 0:Y.attributes)!=null?B:{},a=(j=t.daily_goal)!=null?j:2e3,r="Not Set";if(this.weeklySummary&&this.selectedDate&&this.weeklySummary[this.selectedDate]){let e=this.weeklySummary[this.selectedDate];Array.isArray(e)&&e.length>=5&&(r=e[4]||"Not Set")}r==="Not Set"&&(r=(U=t.goal_type)!=null?U:"fixed_intake");let i=(Q=this.weeklySummary)!=null?Q:{},z=(Z=t.weight_today)!=null?Z:null,y=t.weight_unit||"lbs",n=this.selectedDate?O(this.selectedDate):new Date,p=new Date(n);p.setHours(0,0,0,0);let x=n.getDay(),S=ne(x,this.weekStartDay);p.setDate(n.getDate()-S);let w=Array.from({length:7},(e,o)=>{let c=new Date(p);return c.setDate(p.getDate()+o),V(c)}),$=this.selectedDate,h="Today",u=V();if($||($=u),$!==u){let e=O($);h=`${e.getDate().toString().padStart(2,"0")} ${e.toLocaleString(void 0,{month:"short"})} ${e.getFullYear().toString().slice(-2)}`}let M=0,H=0,I=(ee=this.weight)!=null?ee:null,P=a,J=r,L=0;if(i[$]!==void 0){let e=i[$];if(Array.isArray(e)&&e.length>=9){let[o,c,,l,s,,,,d]=e;M=this._getDisplayCalories(o,c,s),H=c,P=l,J=s,L=d}else if(Array.isArray(e)&&e.length>=6){let[o,c,,l,s]=e;M=this._getDisplayCalories(o,c,s),H=c,P=l,J=s,L=l-M}}let X=w.map(e=>{if(i.hasOwnProperty(e)){let o=i[e];if(Array.isArray(o)&&o.length>=6){let[c,l,,s,d]=o;return this._getDisplayCalories(c,l,d)}}return 0}),K=fe(this.weekStartDay),ae=w.map((e,o)=>K[o]),se=X.reduce((e,o)=>o!==null?e+o:e,0),g=w.filter(e=>{if(i.hasOwnProperty(e)){let o=i[e];if(Array.isArray(o)&&o.length>=2){let[c,l]=o;return c!==0||l!==0}}return!1}).length,m="";if(g>0){let e=0,o=0,c=0;if(w.forEach(l=>{if(i.hasOwnProperty(l)){let s=i[l];if(Array.isArray(s)&&s.length>=9){let[d,k,f,D,A,,,,T]=s;if(d!==0||k!==0){let G=V();if(l===G){let E=new Date,F=E.getHours()+E.getMinutes()/60;f=f*(F/24)}let N=f+k-d;e+=N,o+=-T,c++}}else if(Array.isArray(s)&&s.length>=6){let[d,k,f,D,A]=s;if(d!==0||k!==0){let T=V();if(l===T){let F=new Date,re=F.getHours()+F.getMinutes()/60;f=f*(re/24)}let G=f+k-d;e+=G;let E=this._getDisplayCalories(d,k,A)-D;o+=E,c++}}}}),c>0){let s=e/3500,d=s,k=y;y==="kg"&&(d=s*.45359237);let D=Math.abs(d).toFixed(1),A=o>0,T=e<0?"gained":"lost",G=A?`${Math.round(Math.abs(o))} Cal Over Goal`:`${Math.round(Math.abs(o))} Cal Under Goal`,N=e<0?`${D} ${y} gained (estimate)`:`${D} ${y} lost (estimate)`;m={calorie:G,weight:N,calorieColor:A?"#f44336":"#4caf50",weightColor:r==="fixed_surplus"||r==="variable_bulk"?"#4caf50":e<0?"#f44336":"#4caf50"}}else{let l=0,s=0;w.forEach(f=>{if(i.hasOwnProperty(f)){let D=i[f];if(Array.isArray(D)&&D.length>=6){let[A,T,,G,N]=D;(A!==0||T!==0)&&(s+=this._getDisplayCalories(A,T,N),l+=G)}}});let d=s-l;m={calorie:d>=0?`${d} Cal Over - Week`:`${Math.abs(d)} Cal Under - Week`,weight:null,calorieColor:d>=0?"#f44336":"#4caf50",weightColor:null}}}else m={calorie:"0 Cal Under Goal",weight:`0.0 ${y} lost (estimate)`,calorieColor:"#4caf50",weightColor:"#4caf50"};let C=a;if(this.selectedDate&&i[this.selectedDate]){let e=i[this.selectedDate];if(Array.isArray(e)&&e.length>=6){let[,,,o]=e;C=o}}let _=this._barVisualHeight||95,W=(1-1/1.4)*_,R=new Set(Object.entries(i).filter(([e,o])=>{if(Array.isArray(o)&&o.length>=2){let[c,l]=o;return c!==0||l!==0}return!1}).map(([e])=>e));return b`
      <div class="summary-container">
        <div class="gauge-section">
          <div class="gauge-labels">
            <div class="titles">${h}</div>
          </div>
          <div class="gauge-container">
            ${this._renderGauge(M,P,J,L)}
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
          ${this._showCalendar?this._renderCalendar(R):""}
          <div class="bar-graph">
            <div
              class="goal-line-horizontal"
              style="top: ${W}px; bottom: auto;"
            ></div>
            ${w.map((e,o)=>{let c=i[e],l=0,s=a,d=r,k="0";if(c&&Array.isArray(c)&&c.length>=6){let[le,ce,,ue,de]=c;if(s=ue,d=de,le!==0||ce!==0){let he=this._getDisplayCalories(le,ce,de);l=he;let oe=he-s;k=oe>0?`+${Math.round(oe)}`:`${Math.round(oe)}`}else l=0,k="0"}let f=s*1.4,D=Math.min(l,f),T=Math.min(s,l)/f*100,N=(D>s?D-s:0)/f*100,E=O(e),F=`${E.getDate().toString().padStart(2,"0")} ${E.toLocaleString(void 0,{month:"short"})}`,re=this.selectedDate===e;return b`
                <div
                  class="bar${re?" selected":""}"
                  style="cursor:pointer"
                  @click=${()=>this._onBarClick(e)}
                  title="Show details for ${F}"
                >
                  <div class="bar-visual">
                    <div class="bar-outline"></div>
                    <div
                      class="bar-fill-green"
                      style="height: ${T}%"
                    ></div>
                    <div
                      class="bar-fill-red"
                      style="height: ${N}%"
                    ></div>
                  </div>
                  <div class="bar-label">${k}</div>
                  <div class="day-label">${ae[o]}</div>
                  <div class="date-label">${F}</div>
                </div>
              `})}
          </div>
          ${m?b`
            <div class="weekly-summary">
              <div style="color: ${m.calorieColor};">${m.calorie}</div>
              ${m.weight?b`
                <div style="color: ${m.weightColor}; font-size: 14px; margin-top: 2px;">${m.weight}</div>
              `:""}
            </div>
          `:""}
        </div>
        ${this._showWeightPopup?b`
          <div class="modal-backdrop" @click=${this._closeWeightPopup}></div>
          <div class="modal-popup" @click=${e=>e.stopPropagation()}>
            <div class="modal-header">
              Edit Weight for
              ${(()=>{let e=this.selectedDate?O(this.selectedDate):new Date;return`${e.getDate().toString().padStart(2,"0")} ${e.toLocaleString(void 0,{month:"short"})} ${e.getFullYear()}`})()}
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
                placeholder="Enter weight in ${y}"
                style="width: 100%;"
              />
            </div>
            ${this._weightInputError?b`
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
    `}firstUpdated(){this._measureBarVisualHeight(),window.addEventListener("resize",()=>this._measureBarVisualHeight())}_measureBarVisualHeight(){let t=this.renderRoot.querySelector(".bar-visual");if(t){let a=t.offsetHeight;a!==this._barVisualHeight&&(this._barVisualHeight=a)}}_renderGauge(t,a,r,i=null){let y=a*(r==="variable_bulk"?1.1:1.4),n={x:70,y:70},p=40,x=8,S=-180,w=0,$=w-S,h=Math.max(Math.min(t/y,1),0),u=S+h*$,M=a/y,H=S+M*$,I=g=>g*Math.PI/180,P=(g,m,C)=>{let _=I(g),W=I(m),R=n.x+C*Math.cos(_),Y=n.y+C*Math.sin(_),B=n.x+C*Math.cos(W),j=n.y+C*Math.sin(W),U=Math.abs(m-g)>180?1:0;return`M ${R} ${Y} A ${C} ${C} 0 ${U} 1 ${B} ${j}`},J=500,L=[];for(let g=0;g<=y;g+=J){let m=g/y,C=S+m*$,_=I(C),W=p+5,R=p+12,Y=p+20,B=n.x+W*Math.cos(_),j=n.y+W*Math.sin(_),U=n.x+R*Math.cos(_),Q=n.y+R*Math.sin(_),Z=n.x+Y*Math.cos(_),ee=n.y+Y*Math.sin(_);L.push({line:`M ${B} ${j} L ${U} ${Q}`,label:{x:Z,y:ee,value:g}})}let X=I(u),K=p-5,ae=n.x+K*Math.cos(X),se=n.y+K*Math.sin(X);return te`
      <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
        <!-- Background arc -->
        <path
          d="${P(S,w,p)}"
          fill="none"
          stroke="#eee"
          stroke-width="${x}"
          stroke-linecap="round"
        />

        <!-- Green arc (0 to goal) -->
        <path
          d="${P(S,H,p)}"
          fill="none"
          stroke="#4caf50"
          stroke-width="${x}"
          stroke-linecap="round"
        />

        <!-- Red arc (goal to current, if over goal) -->
        <path
          d="${P(H,w,p)}"
          fill="none"
          stroke="#f44336"
          stroke-width="${x}"
          stroke-linecap="round"
        />

        <!-- Tick marks -->
        ${L.map(g=>te`
          <path
            d="${g.line}"
            stroke="var(--secondary-text-color, #666)"
            stroke-width="1"
          />
        `)}

        <!-- Tick labels -->
        ${L.map(g=>te`
          <text
            x="${g.label.x}"
            y="${g.label.y}"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="9"
            fill="var(--secondary-text-color, #666)"
          >
            ${g.label.value}
          </text>
        `)}

        <!-- Needle -->
        <line
          x1="${n.x}"
          y1="${n.y}"
          x2="${ae}"
          y2="${se}"
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
          y="${n.y+p-5}"
          text-anchor="middle"
          fill="${t<=a?"#4caf50":"#f44336"}"
        >
          ${Math.round(t)} Cal${["fixed_surplus","fixed_deficit","variable_cut","variable_bulk","fixed_net_calories"].includes(r)?" (net)":""}
        </text>

        <!-- Over/Under label -->
        <text
          class="gauge-over-label"
          x="${n.x}"
          y="${n.y+p+18}"
          text-anchor="middle"
          fill="${i!==null?i>=0?"#4caf50":"#f44336":t<=a?"#4caf50":"#f44336"}"
        >
          ${i!==null?i>=0?`${Math.round(i)} Under`:`${Math.round(Math.abs(i))} Over`:t-a>=0?`${Math.round(t-a)} Over`:`${Math.round(a-t)} Under`}
        </text>
      </svg>
    `}_onBarClick(t){this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:t},bubbles:!0,composed:!0}))}_changeWeek(t){let a=this.selectedDate?O(this.selectedDate):new Date,r=new Date(a);r.setHours(0,0,0,0);let i=a.getDay(),z=ne(i,this.weekStartDay);r.setDate(a.getDate()-z),r.setDate(r.getDate()+t*7);let y=V(r);this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:y},bubbles:!0,composed:!0}))}_toggleCalendar(){if(this._showCalendar=!this._showCalendar,this._showCalendar&&this.selectedDate){let t=O(this.selectedDate);this._calendarMonth=t.getMonth(),this._calendarYear=t.getFullYear(),this._fetchCalendarDataDates()}}async _fetchCalendarDataDates(){if(!this.hass||!this.profile)return;let t=this.profile.entity_id,a=this._calendarYear,r=this._calendarMonth+1;try{let i=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_month_data_days",entity_id:t,year:a,month:r});this._calendarDataDates=new Set(i.days||[])}catch(i){this._calendarDataDates=new Set}}_changeCalendarMonth(t){let a=this._calendarMonth+t,r=this._calendarYear;a<0?(a=11,r-=1):a>11&&(a=0,r+=1),this._calendarMonth=a,this._calendarYear=r,this._fetchCalendarDataDates()}_changeCalendarYear(t){this._calendarYear+=t,this._fetchCalendarDataDates()}_renderCalendar(t){let a=this._calendarMonth,r=this._calendarYear,z=new Date(r,a,1).getDay(),y=ne(z,this.weekStartDay),n=new Date(r,a+1,0).getDate(),p=[],x=[];for(let h=0;h<y;h++)x.push(null);for(let h=1;h<=n;h++)x.push(h),x.length===7&&(p.push(x),x=[]);if(x.length){for(;x.length<7;)x.push(null);p.push(x)}let S=h=>{if(!h)return!1;let u=`${r}-${String(a+1).padStart(2,"0")}-${String(h).padStart(2,"0")}`;return this._calendarDataDates.has(u)},w=h=>{if(!h)return;let u=new Date(r,a,h),M=V(u);this._showCalendar=!1,this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:M},bubbles:!0,composed:!0}))};return b`
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
              ${this.weekStartDay==="monday"?b`
                <th style="font-size:11px;">Mon</th>
                <th style="font-size:11px;">Tue</th>
                <th style="font-size:11px;">Wed</th>
                <th style="font-size:11px;">Thu</th>
                <th style="font-size:11px;">Fri</th>
                <th style="font-size:11px;">Sat</th>
                <th style="font-size:11px;">Sun</th>
              `:b`
                <th style="font-size:11px;">Sun</th>
                <th style="font-size:11px;">Mon</th>
                <th style="font-size:11px;">Tue</th>
                <th style="font-size:11px;">Wed</th>
                <th style="font-size:11px;">Thu</th>
                <th style="font-size:11px;">Fri</th>
                <th style="font-size:11px;">Sat</th>
              `}
            </tr>
          </thead>
          <tbody>
            ${p.map(h=>b`
              <tr>
                ${h.map(u=>{let M=u&&this.selectedDate&&this._isSameDay(r,a,u,this.selectedDate),H=S(u);return b`
                    <td
                      class=${[M?"selected-date":"",H?"has-entry":""].join(" ")}
                      style="
                        text-align:center;
                        padding:2px 0;
                        cursor:${u?"pointer":"default"};
                        border-radius:4px;
                      "
                      @click=${()=>w(u)}
                    >
                      ${u||""}
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
    `}_isSameDay(t,a,r,i){let z=O(i);return z.getFullYear()===t&&z.getMonth()===a&&z.getDate()===r}_getDisplayCalories(t,a,r){return r==="fixed_intake"?t:t-a}};ie(q,"properties",{hass:{attribute:!1},profile:{attribute:!1},weeklySummary:{attribute:!1},selectedDate:{type:String},weight:{type:Number},weekStartDay:{type:String},_barVisualHeight:{type:Number,state:!0},_showCalendar:{type:Boolean,state:!0},_calendarMonth:{type:Number,state:!0},_calendarYear:{type:Number,state:!0},_calendarDataDates:{type:Object,state:!0}}),ie(q,"styles",[pe`
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
  `]);customElements.get("calorie-summary")||customElements.define("calorie-summary",q)});export{me as a};
//# sourceMappingURL=chunk-TY3PXZZH.js.map
