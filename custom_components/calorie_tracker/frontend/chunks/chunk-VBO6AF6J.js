import{a as pe,b as k,c as te,g as ge,h as me}from"./chunk-EMR7U3YA.js";import{e as xe,g as ne}from"./chunk-5HHMTMB7.js";var be=xe(()=>{me();function V(v=new Date){let e=v.getFullYear(),t=String(v.getMonth()+1).padStart(2,"0"),r=String(v.getDate()).padStart(2,"0");return`${e}-${t}-${r}`}function O(v){let[e,t,r]=v.split("-").map(Number);return new Date(e,t-1,r)}function ue(v,e){return e==="monday"?v===0?6:v-1:v}function ye(v){return v==="monday"?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]}var J=class extends ge{constructor(){super(),this._showCalendar=!1;let e=new Date;this._calendarMonth=e.getMonth(),this._calendarYear=e.getFullYear(),this._calendarDataDates=new Set,this.weekStartDay="sunday",this.translations={},this._translationsRequestedLang=null}async _loadTranslationsForLanguage(e){var t;if((t=this._hass)!=null&&t.connection)try{let r=await this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_translations",language:e,namespace:"frontend.summary"});this.translations=(r==null?void 0:r.translations)||{},this.requestUpdate()}catch(r){this.translations=this.translations||{}}}set hass(e){var i;this._hass=e;let t=((i=e==null?void 0:e.locale)==null?void 0:i.language)||(e==null?void 0:e.language)||"en";!(this.translations&&Object.keys(this.translations).length>0)&&this._translationsRequestedLang!==t&&(this._translationsRequestedLang=t,this._loadTranslationsForLanguage(t)),this.requestUpdate()}get hass(){return this._hass}_t(e,t){var i;let r=(i=this.translations)==null?void 0:i[e];return typeof r=="string"&&r.length>0?r:t}_tf(e,t,r={}){return this._t(e,t).replace(/\{(\w+)\}/g,(s,m)=>Object.prototype.hasOwnProperty.call(r,m)?String(r[m]):`{${m}}`)}render(){var U,j,B,Q,Z,ee,se;if(!this.profile||!this.hass)return k`<p>${this._t("loading","Loading...")}</p>`;let e={weeklySummary:this._t("weekly_summary","Weekly Summary"),previousWeek:this._t("previous_week","Previous week"),nextWeek:this._t("next_week","Next week"),pickWeekFromCalendar:this._t("pick_week_from_calendar","Pick week from calendar"),showDetailsFor:this._t("show_details_for","Show details for {date}"),editWeightFor:this._t("edit_weight_for","Edit Weight for"),weightLabel:this._t("weight_label","Weight"),weightPlaceholder:this._t("weight_placeholder","Enter weight in {unit}"),save:this._t("save","Save"),cancel:this._t("cancel","Cancel"),over:this._t("over","Over"),under:this._t("under","Under"),calOverGoal:this._t("cal_over_goal","{calories} Cal Over Goal"),calUnderGoal:this._t("cal_under_goal","{calories} Cal Under Goal"),gainedEstimate:this._t("gained_estimate","{value} {unit} gained (estimate)"),lostEstimate:this._t("lost_estimate","{value} {unit} lost (estimate)"),calOverWeek:this._t("cal_over_week","{calories} Cal Over - Week"),calUnderWeek:this._t("cal_under_week","{calories} Cal Under - Week"),prevYear:this._t("prev_year","Prev Year"),nextYear:this._t("next_year","Next Year"),close:this._t("close","Close")},t=(j=(U=this.profile)==null?void 0:U.attributes)!=null?j:{},r=(B=t.daily_goal)!=null?B:2e3,i="Not Set";if(this.weeklySummary&&this.selectedDate&&this.weeklySummary[this.selectedDate]){let a=this.weeklySummary[this.selectedDate];Array.isArray(a)&&a.length>=5&&(i=a[4]||"Not Set")}i==="Not Set"&&(i=(Q=t.goal_type)!=null?Q:"fixed_intake");let s=(Z=this.weeklySummary)!=null?Z:{},m=(ee=t.weight_today)!=null?ee:null,n=t.weight_unit||"lbs",y=this.selectedDate?O(this.selectedDate):new Date,g=new Date(y);g.setHours(0,0,0,0);let S=y.getDay(),W=ue(S,this.weekStartDay);g.setDate(y.getDate()-W);let D=Array.from({length:7},(a,o)=>{let h=new Date(g);return h.setDate(g.getDate()+o),V(h)}),c=this.selectedDate,f="Today",A=V();if(c||(c=A),c!==A){let a=O(c);f=`${a.getDate().toString().padStart(2,"0")} ${a.toLocaleString(void 0,{month:"short"})} ${a.getFullYear().toString().slice(-2)}`}let C=0,G=0,X=(se=this.weight)!=null?se:null,q=r,L=i,E=0;if(s[c]!==void 0){let a=s[c];if(Array.isArray(a)&&a.length>=9){let[o,h,,d,l,,,,p]=a;C=this._getDisplayCalories(o,h,l),G=h,q=d,L=l,E=p}else if(Array.isArray(a)&&a.length>=6){let[o,h,,d,l]=a;C=this._getDisplayCalories(o,h,l),G=h,q=d,L=l,E=d-C}}let K=D.map(a=>{if(s.hasOwnProperty(a)){let o=s[a];if(Array.isArray(o)&&o.length>=6){let[h,d,,l,p]=o;return this._getDisplayCalories(h,d,p)}}return 0}),ae=ye(this.weekStartDay),re=D.map((a,o)=>ae[o]),x=K.reduce((a,o)=>o!==null?a+o:a,0),Y=D.filter(a=>{if(s.hasOwnProperty(a)){let o=s[a];if(Array.isArray(o)&&o.length>=2){let[h,d]=o;return h!==0||d!==0}}return!1}).length,u="";if(Y>0){let a=0,o=0,h=0;if(D.forEach(d=>{if(s.hasOwnProperty(d)){let l=s[d];if(Array.isArray(l)&&l.length>=9){let[p,w,b,_,z,,,,M]=l;if(p!==0||w!==0){let T=V();if(d===T){let N=new Date,F=N.getHours()+N.getMinutes()/60;b=b*(F/24)}let I=b+w-p;a+=I,o+=-M,h++}}else if(Array.isArray(l)&&l.length>=6){let[p,w,b,_,z]=l;if(p!==0||w!==0){let M=V();if(d===M){let F=new Date,oe=F.getHours()+F.getMinutes()/60;b=b*(oe/24)}let T=b+w-p;a+=T;let N=this._getDisplayCalories(p,w,z)-_;o+=N,h++}}}}),h>0){let l=a/3500,p=l,w=n;n==="kg"&&(p=l*.45359237);let _=Math.abs(p).toFixed(1),z=o>0,M=z?this._tf("cal_over_goal",e.calOverGoal,{calories:Math.round(Math.abs(o))}):this._tf("cal_under_goal",e.calUnderGoal,{calories:Math.round(Math.abs(o))}),T=a<0?this._tf("gained_estimate",e.gainedEstimate,{value:_,unit:n}):this._tf("lost_estimate",e.lostEstimate,{value:_,unit:n});u={calorie:M,weight:T,calorieColor:z?"#f44336":"#4caf50",weightColor:i==="fixed_surplus"||i==="variable_bulk"?"#4caf50":a<0?"#f44336":"#4caf50"}}else{let d=0,l=0;D.forEach(b=>{if(s.hasOwnProperty(b)){let _=s[b];if(Array.isArray(_)&&_.length>=6){let[z,M,,T,I]=_;(z!==0||M!==0)&&(l+=this._getDisplayCalories(z,M,I),d+=T)}}});let p=l-d;u={calorie:p>=0?this._tf("cal_over_week",e.calOverWeek,{calories:p}):this._tf("cal_under_week",e.calUnderWeek,{calories:Math.abs(p)}),weight:null,calorieColor:p>=0?"#f44336":"#4caf50",weightColor:null}}}else u={calorie:this._tf("cal_under_goal",e.calUnderGoal,{calories:0}),weight:this._tf("lost_estimate",e.lostEstimate,{value:"0.0",unit:n}),calorieColor:"#4caf50",weightColor:"#4caf50"};let $=r;if(this.selectedDate&&s[this.selectedDate]){let a=s[this.selectedDate];if(Array.isArray(a)&&a.length>=6){let[,,,o]=a;$=o}}let P=this._barVisualHeight||95,H=(1-1/1.4)*P,R=new Set(Object.entries(s).filter(([a,o])=>{if(Array.isArray(o)&&o.length>=2){let[h,d]=o;return h!==0||d!==0}return!1}).map(([a])=>a));return k`
      <div class="summary-container">
        <div class="gauge-section">
          <div class="gauge-labels">
            <div class="titles">${f}</div>
          </div>
          <div class="gauge-container">
            ${this._renderGauge(C,q,L,E)}
          </div>
        </div>
        <div class="bar-graph-section">
          <div class="titles weekly-header">
            <button class="week-nav-btn" @click=${()=>this._changeWeek(-1)} title=${e.previousWeek} style="background:none;border:none;cursor:pointer;padding:0 2px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <span class="weekly-header-text">${e.weeklySummary}</span>
            <button class="week-nav-btn" @click=${()=>this._changeWeek(1)} title=${e.nextWeek} style="background:none;border:none;cursor:pointer;padding:0 2px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
            <button class="calendar-btn" @click=${()=>this._toggleCalendar()} title=${e.pickWeekFromCalendar}
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
              style="top: ${H}px; bottom: auto;"
            ></div>
            ${D.map((a,o)=>{let h=s[a],d=0,l=r,p=i,w="0";if(h&&Array.isArray(h)&&h.length>=6){let[le,ce,,fe,de]=h;if(l=fe,p=de,le!==0||ce!==0){let he=this._getDisplayCalories(le,ce,de);d=he;let ie=he-l;w=ie>0?`+${Math.round(ie)}`:`${Math.round(ie)}`}else d=0,w="0"}let b=l*1.4,_=Math.min(d,b),M=Math.min(l,d)/b*100,I=(_>l?_-l:0)/b*100,N=O(a),F=`${N.getDate().toString().padStart(2,"0")} ${N.toLocaleString(void 0,{month:"short"})}`,oe=this.selectedDate===a;return k`
                <div
                  class="bar${oe?" selected":""}"
                  style="cursor:pointer"
                  @click=${()=>this._onBarClick(a)}
                  title=${this._tf("show_details_for",e.showDetailsFor,{date:F})}
                >
                  <div class="bar-visual">
                    <div class="bar-outline"></div>
                    <div
                      class="bar-fill-green"
                      style="height: ${M}%"
                    ></div>
                    <div
                      class="bar-fill-red"
                      style="height: ${I}%"
                    ></div>
                  </div>
                  <div class="bar-label">${w}</div>
                  <div class="day-label">${re[o]}</div>
                  <div class="date-label">${F}</div>
                </div>
              `})}
          </div>
          ${u?k`
            <div class="weekly-summary">
              <div style="color: ${u.calorieColor};">${u.calorie}</div>
              ${u.weight?k`
                <div style="color: ${u.weightColor}; font-size: 14px; margin-top: 2px;">${u.weight}</div>
              `:""}
            </div>
          `:""}
        </div>
        ${this._showWeightPopup?k`
          <div class="modal-backdrop" @click=${this._closeWeightPopup}></div>
          <div class="modal-popup" @click=${a=>a.stopPropagation()}>
            <div class="modal-header">
              ${e.editWeightFor}
              ${(()=>{let a=this.selectedDate?O(this.selectedDate):new Date;return`${a.getDate().toString().padStart(2,"0")} ${a.toLocaleString(void 0,{month:"short"})} ${a.getFullYear()}`})()}
            </div>
            <div class="edit-grid" style="margin-bottom: 0;">
              <div class="edit-label">${e.weightLabel}</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                step="0.1"
                .value=${this._weightInput}
                @input=${this._onWeightInputChange}
                placeholder=${this._tf("weight_placeholder",e.weightPlaceholder,{unit:n})}
                style="width: 100%;"
              />
            </div>
            ${this._weightInputError?k`
              <div style="color: #f44336; font-size: 0.95em; margin-bottom: 8px;">
                ${this._weightInputError}
              </div>
            `:""}
            <div class="edit-actions">
              <button class="ha-btn" @click=${this._saveWeight}>${e.save}</button>
              <button class="ha-btn" @click=${this._closeWeightPopup}>${e.cancel}</button>
            </div>
          </div>
        `:""}
      </div>
    `}firstUpdated(){this._measureBarVisualHeight(),window.addEventListener("resize",()=>this._measureBarVisualHeight())}_measureBarVisualHeight(){let e=this.renderRoot.querySelector(".bar-visual");if(e){let t=e.offsetHeight;t!==this._barVisualHeight&&(this._barVisualHeight=t)}}_renderGauge(e,t,r,i=null){let m=t*(r==="variable_bulk"?1.1:1.4),n={x:70,y:70},y=40,g=8,S=-180,W=0,D=W-S,c=Math.max(Math.min(e/m,1),0),f=S+c*D,A=t/m,C=S+A*D,G=x=>x*Math.PI/180,X=(x,Y,u)=>{let $=G(x),P=G(Y),H=n.x+u*Math.cos($),R=n.y+u*Math.sin($),U=n.x+u*Math.cos(P),j=n.y+u*Math.sin(P),B=Math.abs(Y-x)>180?1:0;return`M ${H} ${R} A ${u} ${u} 0 ${B} 1 ${U} ${j}`},q=500,L=[];for(let x=0;x<=m;x+=q){let Y=x/m,u=S+Y*D,$=G(u),P=y+5,H=y+12,R=y+20,U=n.x+P*Math.cos($),j=n.y+P*Math.sin($),B=n.x+H*Math.cos($),Q=n.y+H*Math.sin($),Z=n.x+R*Math.cos($),ee=n.y+R*Math.sin($);L.push({line:`M ${U} ${j} L ${B} ${Q}`,label:{x:Z,y:ee,value:x}})}let E=G(f),K=y-5,ae=n.x+K*Math.cos(E),re=n.y+K*Math.sin(E);return te`
      <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
        <!-- Background arc -->
        <path
          d="${X(S,W,y)}"
          fill="none"
          stroke="#eee"
          stroke-width="${g}"
          stroke-linecap="round"
        />

        <!-- Green arc (0 to goal) -->
        <path
          d="${X(S,C,y)}"
          fill="none"
          stroke="#4caf50"
          stroke-width="${g}"
          stroke-linecap="round"
        />

        <!-- Red arc (goal to current, if over goal) -->
        <path
          d="${X(C,W,y)}"
          fill="none"
          stroke="#f44336"
          stroke-width="${g}"
          stroke-linecap="round"
        />

        <!-- Tick marks -->
        ${L.map(x=>te`
          <path
            d="${x.line}"
            stroke="var(--secondary-text-color, #666)"
            stroke-width="1"
          />
        `)}

        <!-- Tick labels -->
        ${L.map(x=>te`
          <text
            x="${x.label.x}"
            y="${x.label.y}"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="9"
            fill="var(--secondary-text-color, #666)"
          >
            ${x.label.value}
          </text>
        `)}

        <!-- Needle -->
        <line
          x1="${n.x}"
          y1="${n.y}"
          x2="${ae}"
          y2="${re}"
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
          y="${n.y+y-5}"
          text-anchor="middle"
          fill="${e<=t?"#4caf50":"#f44336"}"
        >
          ${Math.round(e)} Cal${["fixed_surplus","fixed_deficit","variable_cut","variable_bulk","fixed_net_calories"].includes(r)?" (net)":""}
        </text>

        <!-- Over/Under label -->
        <text
          class="gauge-over-label"
          x="${n.x}"
          y="${n.y+y+18}"
          text-anchor="middle"
          fill="${i!==null?i>=0?"#4caf50":"#f44336":e<=t?"#4caf50":"#f44336"}"
        >
          ${i!==null?i>=0?`${Math.round(i)} ${this._t("under","Under")}`:`${Math.round(Math.abs(i))} ${this._t("over","Over")}`:e-t>=0?`${Math.round(e-t)} ${this._t("over","Over")}`:`${Math.round(t-e)} ${this._t("under","Under")}`}
        </text>
      </svg>
    `}_onBarClick(e){this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:e},bubbles:!0,composed:!0}))}_changeWeek(e){let t=this.selectedDate?O(this.selectedDate):new Date,r=new Date(t);r.setHours(0,0,0,0);let i=t.getDay(),s=ue(i,this.weekStartDay);r.setDate(t.getDate()-s),r.setDate(r.getDate()+e*7);let m=V(r);this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:m},bubbles:!0,composed:!0}))}_toggleCalendar(){if(this._showCalendar=!this._showCalendar,this._showCalendar&&this.selectedDate){let e=O(this.selectedDate);this._calendarMonth=e.getMonth(),this._calendarYear=e.getFullYear(),this._fetchCalendarDataDates()}}async _fetchCalendarDataDates(){if(!this.hass||!this.profile)return;let e=this.profile.entity_id,t=this._calendarYear,r=this._calendarMonth+1;try{let i=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_month_data_days",entity_id:e,year:t,month:r});this._calendarDataDates=new Set(i.days||[])}catch(i){this._calendarDataDates=new Set}}_changeCalendarMonth(e){let t=this._calendarMonth+e,r=this._calendarYear;t<0?(t=11,r-=1):t>11&&(t=0,r+=1),this._calendarMonth=t,this._calendarYear=r,this._fetchCalendarDataDates()}_changeCalendarYear(e){this._calendarYear+=e,this._fetchCalendarDataDates()}_renderCalendar(e){let t=this._calendarMonth,r=this._calendarYear,s=new Date(r,t,1).getDay(),m;this.weekStartDay==="monday"?m=s===0?6:s-1:m=s;let n=new Date(r,t+1,0).getDate(),y=[],g=[];for(let c=0;c<m;c++)g.push(null);for(let c=1;c<=n;c++)g.push(c),g.length===7&&(y.push(g),g=[]);if(g.length){for(;g.length<7;)g.push(null);y.push(g)}let S=c=>{if(!c)return!1;let f=`${r}-${String(t+1).padStart(2,"0")}-${String(c).padStart(2,"0")}`;return this._calendarDataDates.has(f)},W=c=>{if(!c)return;let f=new Date(r,t,c),A=V(f);this._showCalendar=!1,this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:A},bubbles:!0,composed:!0}))};return k`
      <div class="calendar-popup themed-calendar-popup">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <button @click=${()=>this._changeCalendarMonth(-1)} style="background:none;border:none;cursor:pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <span style="font-weight:bold;">
            ${["January","February","March","April","May","June","July","August","September","October","November","December"][t]} ${r}
          </span>
          <button @click=${()=>this._changeCalendarMonth(1)} style="background:none;border:none;cursor:pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;">
          <button @click=${()=>this._changeCalendarYear(-1)} style="background:none;border:none;cursor:pointer;font-size:12px;">« ${this._t("prev_year","Prev Year")}</button>
          <button @click=${()=>this._changeCalendarYear(1)} style="background:none;border:none;cursor:pointer;font-size:12px;">${this._t("next_year","Next Year")} »</button>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              ${ye(this.weekStartDay).map(c=>k`
                <th style="font-size:11px;">${c}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${y.map(c=>k`
              <tr>
                ${c.map(f=>{let A=f&&this.selectedDate&&this._isSameDay(r,t,f,this.selectedDate),C=S(f);return k`
                    <td
                      class=${[A?"selected-date":"",C?"has-entry":""].join(" ")}
                      style="
                        text-align:center;
                        padding:2px 0;
                        cursor:${f?"pointer":"default"};
                        border-radius:4px;
                      "
                      @click=${()=>W(f)}
                    >
                      ${f||""}
                    </td>
                  `})}
              </tr>
            `)}
          </tbody>
        </table>
        <div style="text-align:right;margin-top:8px;">
          <button @click=${()=>this._showCalendar=!1} class="calendar-close-btn">${this._t("close","Close")}</button>
        </div>
      </div>
    `}_isSameDay(e,t,r,i){let s=O(i);return s.getFullYear()===e&&s.getMonth()===t&&s.getDate()===r}_getDisplayCalories(e,t,r){return r==="fixed_intake"?e:e-t}};ne(J,"properties",{hass:{attribute:!1},profile:{attribute:!1},translations:{attribute:!1},weeklySummary:{attribute:!1},selectedDate:{type:String},weight:{type:Number},weekStartDay:{type:String},_barVisualHeight:{type:Number,state:!0},_showCalendar:{type:Boolean,state:!0},_calendarMonth:{type:Number,state:!0},_calendarYear:{type:Number,state:!0},_calendarDataDates:{type:Object,state:!0}}),ne(J,"styles",[pe`
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
  `]);customElements.get("calorie-summary")||customElements.define("calorie-summary",J)});export{be as a};
//# sourceMappingURL=chunk-VBO6AF6J.js.map
