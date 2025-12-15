import{a as he,b as D,c as te,g as pe,h as fe}from"./chunk-EMR7U3YA.js";import{e as xe,g as ie}from"./chunk-5HHMTMB7.js";var me=xe(()=>{fe();function V(b=new Date){let t=b.getFullYear(),a=String(b.getMonth()+1).padStart(2,"0"),r=String(b.getDate()).padStart(2,"0");return`${t}-${a}-${r}`}function O(b){let[t,a,r]=b.split("-").map(Number);return new Date(t,a-1,r)}function ge(b,t){return t==="monday"?b===0?6:b-1:b}function ue(b){return b==="monday"?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]}var q=class extends pe{constructor(){super(),this._showCalendar=!1;let t=new Date;this._calendarMonth=t.getMonth(),this._calendarYear=t.getFullYear(),this._calendarDataDates=new Set,this.weekStartDay="sunday"}set hass(t){this._hass=t,this.requestUpdate()}get hass(){return this._hass}render(){var E,B,j,U,Q,Z,ee;if(!this.profile||!this.hass)return D`<p>Loading...</p>`;let t=(B=(E=this.profile)==null?void 0:E.attributes)!=null?B:{},a=(j=t.daily_goal)!=null?j:2e3,r="Not Set";if(this.weeklySummary&&this.selectedDate&&this.weeklySummary[this.selectedDate]){let e=this.weeklySummary[this.selectedDate];Array.isArray(e)&&e.length>=5&&(r=e[4]||"Not Set")}r==="Not Set"&&(r=(U=t.goal_type)!=null?U:"fixed_intake");let i=(Q=this.weeklySummary)!=null?Q:{},$=(Z=t.weight_today)!=null?Z:null,g=t.weight_unit||"lbs",n=this.selectedDate?O(this.selectedDate):new Date,p=new Date(n);p.setHours(0,0,0,0);let x=n.getDay(),M=ge(x,this.weekStartDay);p.setDate(n.getDate()-M);let v=Array.from({length:7},(e,o)=>{let c=new Date(p);return c.setDate(p.getDate()+o),V(c)}),_=this.selectedDate,d="Today",y=V();if(_||(_=y),_!==y){let e=O(_);d=`${e.getDate().toString().padStart(2,"0")} ${e.toLocaleString(void 0,{month:"short"})} ${e.getFullYear().toString().slice(-2)}`}let C=0,H=0,I=(ee=this.weight)!=null?ee:null,P=a,J=r,L=0;if(i[_]!==void 0){let e=i[_];if(Array.isArray(e)&&e.length>=9){let[o,c,,l,s,,,,h]=e;C=this._getDisplayCalories(o,c,s),H=c,P=l,J=s,L=h}else if(Array.isArray(e)&&e.length>=6){let[o,c,,l,s]=e;C=this._getDisplayCalories(o,c,s),H=c,P=l,J=s,L=l-C}}let X=v.map(e=>{if(i.hasOwnProperty(e)){let o=i[e];if(Array.isArray(o)&&o.length>=6){let[c,l,,s,h]=o;return this._getDisplayCalories(c,l,h)}}return 0}),K=ue(this.weekStartDay),ae=v.map((e,o)=>K[o]),ne=X.reduce((e,o)=>o!==null?e+o:e,0),u=v.filter(e=>{if(i.hasOwnProperty(e)){let o=i[e];if(Array.isArray(o)&&o.length>=2){let[c,l]=o;return c!==0||l!==0}}return!1}).length,m="";if(u>0){let e=0,o=0,c=0;if(v.forEach(l=>{if(i.hasOwnProperty(l)){let s=i[l];if(Array.isArray(s)&&s.length>=9){let[h,w,f,k,A,,,,T]=s;if(h!==0||w!==0){let G=V();if(l===G){let W=new Date,F=W.getHours()+W.getMinutes()/60;f=f*(F/24)}let N=f+w-h;e+=N,o+=-T,c++}}else if(Array.isArray(s)&&s.length>=6){let[h,w,f,k,A]=s;if(h!==0||w!==0){let T=V();if(l===T){let F=new Date,re=F.getHours()+F.getMinutes()/60;f=f*(re/24)}let G=f+w-h;e+=G;let W=this._getDisplayCalories(h,w,A)-k;o+=W,c++}}}}),c>0){let s=e/3500,h=s,w=g;g==="kg"&&(h=s*.45359237);let k=Math.abs(h).toFixed(1),A=o>0,T=e<0?"gained":"lost",G=A?`${Math.round(Math.abs(o))} Cal Over Goal`:`${Math.round(Math.abs(o))} Cal Under Goal`,N=e<0?`${k} ${g} gained (estimate)`:`${k} ${g} lost (estimate)`;m={calorie:G,weight:N,calorieColor:A?"#f44336":"#4caf50",weightColor:r==="fixed_surplus"||r==="variable_bulk"?"#4caf50":e<0?"#f44336":"#4caf50"}}else{let l=0,s=0;v.forEach(f=>{if(i.hasOwnProperty(f)){let k=i[f];if(Array.isArray(k)&&k.length>=6){let[A,T,,G,N]=k;(A!==0||T!==0)&&(s+=this._getDisplayCalories(A,T,N),l+=G)}}});let h=s-l;m={calorie:h>=0?`${h} Cal Over - Week`:`${Math.abs(h)} Cal Under - Week`,weight:null,calorieColor:h>=0?"#f44336":"#4caf50",weightColor:null}}}else m={calorie:"0 Cal Under Goal",weight:`0.0 ${g} lost (estimate)`,calorieColor:"#4caf50",weightColor:"#4caf50"};let z=a;if(this.selectedDate&&i[this.selectedDate]){let e=i[this.selectedDate];if(Array.isArray(e)&&e.length>=6){let[,,,o]=e;z=o}}let S=this._barVisualHeight||95,Y=(1-1/1.4)*S,R=new Set(Object.entries(i).filter(([e,o])=>{if(Array.isArray(o)&&o.length>=2){let[c,l]=o;return c!==0||l!==0}return!1}).map(([e])=>e));return D`
      <div class="summary-container">
        <div class="gauge-section">
          <div class="gauge-labels">
            <div class="titles">${d}</div>
          </div>
          <div class="gauge-container">
            ${this._renderGauge(C,P,J,L)}
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
              style="top: ${Y}px; bottom: auto;"
            ></div>
            ${v.map((e,o)=>{let c=i[e],l=0,s=a,h=r,w="0";if(c&&Array.isArray(c)&&c.length>=6){let[se,le,,ye,ce]=c;if(s=ye,h=ce,se!==0||le!==0){let de=this._getDisplayCalories(se,le,ce);l=de;let oe=de-s;w=oe>0?`+${Math.round(oe)}`:`${Math.round(oe)}`}else l=0,w="0"}let f=s*1.4,k=Math.min(l,f),T=Math.min(s,l)/f*100,N=(k>s?k-s:0)/f*100,W=O(e),F=`${W.getDate().toString().padStart(2,"0")} ${W.toLocaleString(void 0,{month:"short"})}`,re=this.selectedDate===e;return D`
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
                  <div class="bar-label">${w}</div>
                  <div class="day-label">${ae[o]}</div>
                  <div class="date-label">${F}</div>
                </div>
              `})}
          </div>
          ${m?D`
            <div class="weekly-summary">
              <div style="color: ${m.calorieColor};">${m.calorie}</div>
              ${m.weight?D`
                <div style="color: ${m.weightColor}; font-size: 14px; margin-top: 2px;">${m.weight}</div>
              `:""}
            </div>
          `:""}
        </div>
        ${this._showWeightPopup?D`
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
                placeholder="Enter weight in ${g}"
                style="width: 100%;"
              />
            </div>
            ${this._weightInputError?D`
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
    `}firstUpdated(){this._measureBarVisualHeight(),window.addEventListener("resize",()=>this._measureBarVisualHeight())}_measureBarVisualHeight(){let t=this.renderRoot.querySelector(".bar-visual");if(t){let a=t.offsetHeight;a!==this._barVisualHeight&&(this._barVisualHeight=a)}}_renderGauge(t,a,r,i=null){let g=a*(r==="variable_bulk"?1.1:1.4),n={x:70,y:70},p=40,x=8,M=-180,v=0,_=v-M,d=Math.max(Math.min(t/g,1),0),y=M+d*_,C=a/g,H=M+C*_,I=u=>u*Math.PI/180,P=(u,m,z)=>{let S=I(u),Y=I(m),R=n.x+z*Math.cos(S),E=n.y+z*Math.sin(S),B=n.x+z*Math.cos(Y),j=n.y+z*Math.sin(Y),U=Math.abs(m-u)>180?1:0;return`M ${R} ${E} A ${z} ${z} 0 ${U} 1 ${B} ${j}`},J=500,L=[];for(let u=0;u<=g;u+=J){let m=u/g,z=M+m*_,S=I(z),Y=p+5,R=p+12,E=p+20,B=n.x+Y*Math.cos(S),j=n.y+Y*Math.sin(S),U=n.x+R*Math.cos(S),Q=n.y+R*Math.sin(S),Z=n.x+E*Math.cos(S),ee=n.y+E*Math.sin(S);L.push({line:`M ${B} ${j} L ${U} ${Q}`,label:{x:Z,y:ee,value:u}})}let X=I(y),K=p-5,ae=n.x+K*Math.cos(X),ne=n.y+K*Math.sin(X);return te`
      <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
        <!-- Background arc -->
        <path
          d="${P(M,v,p)}"
          fill="none"
          stroke="#eee"
          stroke-width="${x}"
          stroke-linecap="round"
        />

        <!-- Green arc (0 to goal) -->
        <path
          d="${P(M,H,p)}"
          fill="none"
          stroke="#4caf50"
          stroke-width="${x}"
          stroke-linecap="round"
        />

        <!-- Red arc (goal to current, if over goal) -->
        <path
          d="${P(H,v,p)}"
          fill="none"
          stroke="#f44336"
          stroke-width="${x}"
          stroke-linecap="round"
        />

        <!-- Tick marks -->
        ${L.map(u=>te`
          <path
            d="${u.line}"
            stroke="var(--secondary-text-color, #666)"
            stroke-width="1"
          />
        `)}

        <!-- Tick labels -->
        ${L.map(u=>te`
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
          x2="${ae}"
          y2="${ne}"
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
    `}_onBarClick(t){this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:t},bubbles:!0,composed:!0}))}_changeWeek(t){let a=this.selectedDate?O(this.selectedDate):new Date,r=new Date(a);r.setHours(0,0,0,0);let i=a.getDay(),$=ge(i,this.weekStartDay);r.setDate(a.getDate()-$),r.setDate(r.getDate()+t*7);let g=V(r);this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:g},bubbles:!0,composed:!0}))}_toggleCalendar(){if(this._showCalendar=!this._showCalendar,this._showCalendar&&this.selectedDate){let t=O(this.selectedDate);this._calendarMonth=t.getMonth(),this._calendarYear=t.getFullYear(),this._fetchCalendarDataDates()}}async _fetchCalendarDataDates(){if(!this.hass||!this.profile)return;let t=this.profile.entity_id,a=this._calendarYear,r=this._calendarMonth+1;try{let i=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_month_data_days",entity_id:t,year:a,month:r});this._calendarDataDates=new Set(i.days||[])}catch(i){this._calendarDataDates=new Set}}_changeCalendarMonth(t){let a=this._calendarMonth+t,r=this._calendarYear;a<0?(a=11,r-=1):a>11&&(a=0,r+=1),this._calendarMonth=a,this._calendarYear=r,this._fetchCalendarDataDates()}_changeCalendarYear(t){this._calendarYear+=t,this._fetchCalendarDataDates()}_renderCalendar(t){let a=this._calendarMonth,r=this._calendarYear,$=new Date(r,a,1).getDay(),g;this.weekStartDay==="monday"?g=$===0?6:$-1:g=$;let n=new Date(r,a+1,0).getDate(),p=[],x=[];for(let d=0;d<g;d++)x.push(null);for(let d=1;d<=n;d++)x.push(d),x.length===7&&(p.push(x),x=[]);if(x.length){for(;x.length<7;)x.push(null);p.push(x)}let M=d=>{if(!d)return!1;let y=`${r}-${String(a+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;return this._calendarDataDates.has(y)},v=d=>{if(!d)return;let y=new Date(r,a,d),C=V(y);this._showCalendar=!1,this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:C},bubbles:!0,composed:!0}))};return D`
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
              ${ue(this.weekStartDay).map(d=>D`
                <th style="font-size:11px;">${d}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${p.map(d=>D`
              <tr>
                ${d.map(y=>{let C=y&&this.selectedDate&&this._isSameDay(r,a,y,this.selectedDate),H=M(y);return D`
                    <td
                      class=${[C?"selected-date":"",H?"has-entry":""].join(" ")}
                      style="
                        text-align:center;
                        padding:2px 0;
                        cursor:${y?"pointer":"default"};
                        border-radius:4px;
                      "
                      @click=${()=>v(y)}
                    >
                      ${y||""}
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
    `}_isSameDay(t,a,r,i){let $=O(i);return $.getFullYear()===t&&$.getMonth()===a&&$.getDate()===r}_getDisplayCalories(t,a,r){return r==="fixed_intake"?t:t-a}};ie(q,"properties",{hass:{attribute:!1},profile:{attribute:!1},weeklySummary:{attribute:!1},selectedDate:{type:String},weight:{type:Number},weekStartDay:{type:String},_barVisualHeight:{type:Number,state:!0},_showCalendar:{type:Boolean,state:!0},_calendarMonth:{type:Number,state:!0},_calendarYear:{type:Number,state:!0},_calendarDataDates:{type:Object,state:!0}}),ie(q,"styles",[he`
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
//# sourceMappingURL=chunk-4E4HTHAA.js.map
