import{a as he,b as D,c as te,g as pe,h as fe}from"./chunk-EMR7U3YA.js";import{e as ye,g as ie}from"./chunk-5HHMTMB7.js";var me=ye(()=>{fe();function V(w=new Date){let e=w.getFullYear(),t=String(w.getMonth()+1).padStart(2,"0"),a=String(w.getDate()).padStart(2,"0");return`${e}-${t}-${a}`}function L(w){let[e,t,a]=w.split("-").map(Number);return new Date(e,t-1,a)}function ge(w,e){return e==="monday"?w===0?6:w-1:w}function xe(w,e){let t=new Intl.DateTimeFormat(e,{weekday:"short"}),a=Array.from({length:7},(o,s)=>{let u=new Date(2023,0,1+s);return t.format(u)});return w==="monday"?[...a.slice(1),a[0]]:a}var X=class extends pe{constructor(){super(),this._showCalendar=!1;let e=new Date;this._calendarMonth=e.getMonth(),this._calendarYear=e.getFullYear(),this._calendarDataDates=new Set,this.weekStartDay="sunday",this.translations={},this._translationsRequestedLang=null}async _loadTranslationsForLanguage(e){var t;if((t=this._hass)!=null&&t.connection)try{let a=await this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_translations",language:e,namespace:"frontend.summary"});this.translations=(a==null?void 0:a.translations)||{},this.requestUpdate()}catch(a){this.translations=this.translations||{}}}set hass(e){var o;this._hass=e;let t=((o=e==null?void 0:e.locale)==null?void 0:o.language)||(e==null?void 0:e.language)||"en";!(this.translations&&Object.keys(this.translations).length>0)&&this._translationsRequestedLang!==t&&(this._translationsRequestedLang=t,this._loadTranslationsForLanguage(t)),this.requestUpdate()}get hass(){return this._hass}_t(e,t){var o;let a=(o=this.translations)==null?void 0:o[e];return typeof a=="string"&&a.length>0?a:t}_tf(e,t,a={}){return this._t(e,t).replace(/\{(\w+)\}/g,(s,u)=>Object.prototype.hasOwnProperty.call(a,u)?String(a[u]):`{${u}}`)}_getLocale(){var e,t,a;return((t=(e=this._hass)==null?void 0:e.locale)==null?void 0:t.language)||((a=this._hass)==null?void 0:a.language)||void 0}_formatMonthShort(e,t=this._getLocale()){return new Intl.DateTimeFormat(t,{month:"short"}).format(e)}_formatWeekdayShort(e,t=this._getLocale()){return new Intl.DateTimeFormat(t,{weekday:"short"}).format(e)}render(){var Y,U,j,B,Q,Z,ee;if(!this.profile||!this.hass)return D`<p>${this._t("loading","Loading...")}</p>`;let e={weeklySummary:this._t("weekly_summary","Weekly Summary"),previousWeek:this._t("previous_week","Previous week"),nextWeek:this._t("next_week","Next week"),pickWeekFromCalendar:this._t("pick_week_from_calendar","Pick week from calendar"),showDetailsFor:this._t("show_details_for","Show details for {date}"),editWeightFor:this._t("edit_weight_for","Edit Weight for"),weightLabel:this._t("weight_label","Weight"),weightPlaceholder:this._t("weight_placeholder","Enter weight in {unit}"),save:this._t("save","Save"),cancel:this._t("cancel","Cancel"),over:this._t("over","Over"),under:this._t("under","Under"),calOverGoal:this._t("cal_over_goal","{calories} Cal Over Goal"),calUnderGoal:this._t("cal_under_goal","{calories} Cal Under Goal"),gainedEstimate:this._t("gained_estimate","{value} {unit} gained (estimate)"),lostEstimate:this._t("lost_estimate","{value} {unit} lost (estimate)"),calOverWeek:this._t("cal_over_week","{calories} Cal Over - Week"),calUnderWeek:this._t("cal_under_week","{calories} Cal Under - Week"),prevYear:this._t("prev_year","Prev Year"),nextYear:this._t("next_year","Next Year"),close:this._t("close","Close")},t=(U=(Y=this.profile)==null?void 0:Y.attributes)!=null?U:{},a=(j=t.daily_goal)!=null?j:2e3,o="Not Set";if(this.weeklySummary&&this.selectedDate&&this.weeklySummary[this.selectedDate]){let r=this.weeklySummary[this.selectedDate];Array.isArray(r)&&r.length>=5&&(o=r[4]||"Not Set")}o==="Not Set"&&(o=(B=t.goal_type)!=null?B:"fixed_intake");let s=(Q=this.weeklySummary)!=null?Q:{},u=(Z=t.weight_today)!=null?Z:null,n=t.weight_unit||"lbs",y=this.selectedDate?L(this.selectedDate):new Date,g=new Date(y);g.setHours(0,0,0,0);let C=y.getDay(),P=ge(C,this.weekStartDay);g.setDate(y.getDate()-P);let v=Array.from({length:7},(r,i)=>{let d=new Date(g);return d.setDate(g.getDate()+i),V(d)}),M=this.selectedDate,h=this._t("today","Today"),x=V();if(M||(M=x),M!==x){let r=L(M);h=`${r.getDate().toString().padStart(2,"0")} ${this._formatMonthShort(r)} ${r.getFullYear().toString().slice(-2)}`}let $=0,T=0,K=(ee=this.weight)!=null?ee:null,q=a,E=o,N=0;if(s[M]!==void 0){let r=s[M];if(Array.isArray(r)&&r.length>=9){let[i,d,,c,l,,,,p]=r;$=this._getDisplayCalories(i,d,l),T=d,q=c,E=l,N=p}else if(Array.isArray(r)&&r.length>=6){let[i,d,,c,l]=r;$=this._getDisplayCalories(i,d,l),T=d,q=c,E=l,N=c-$}}let J=v.map(r=>{if(s.hasOwnProperty(r)){let i=s[r];if(Array.isArray(i)&&i.length>=6){let[d,c,,l,p]=i;return this._getDisplayCalories(d,c,p)}}return 0}),ae=v.map(r=>this._formatWeekdayShort(L(r))),ne=J.reduce((r,i)=>i!==null?r+i:r,0),f=v.filter(r=>{if(s.hasOwnProperty(r)){let i=s[r];if(Array.isArray(i)&&i.length>=2){let[d,c]=i;return d!==0||c!==0}}return!1}).length,b="";if(f>0){let r=0,i=0,d=0;if(v.forEach(c=>{if(s.hasOwnProperty(c)){let l=s[c];if(Array.isArray(l)&&l.length>=9){let[p,_,m,k,W,,,,A]=l;if(p!==0||_!==0){let G=V();if(c===G){let F=new Date,H=F.getHours()+F.getMinutes()/60;m=m*(H/24)}let I=m+_-p;r+=I,i+=-A,d++}}else if(Array.isArray(l)&&l.length>=6){let[p,_,m,k,W]=l;if(p!==0||_!==0){let A=V();if(c===A){let H=new Date,re=H.getHours()+H.getMinutes()/60;m=m*(re/24)}let G=m+_-p;r+=G;let F=this._getDisplayCalories(p,_,W)-k;i+=F,d++}}}}),d>0){let l=r/3500,p=l,_=n;n==="kg"&&(p=l*.45359237);let k=Math.abs(p).toFixed(1),W=i>0,A=W?this._tf("cal_over_goal",e.calOverGoal,{calories:Math.round(Math.abs(i))}):this._tf("cal_under_goal",e.calUnderGoal,{calories:Math.round(Math.abs(i))}),G=r<0?this._tf("gained_estimate",e.gainedEstimate,{value:k,unit:n}):this._tf("lost_estimate",e.lostEstimate,{value:k,unit:n});b={calorie:A,weight:G,calorieColor:W?"#f44336":"#4caf50",weightColor:o==="fixed_surplus"||o==="variable_bulk"?"#4caf50":r<0?"#f44336":"#4caf50"}}else{let c=0,l=0;v.forEach(m=>{if(s.hasOwnProperty(m)){let k=s[m];if(Array.isArray(k)&&k.length>=6){let[W,A,,G,I]=k;(W!==0||A!==0)&&(l+=this._getDisplayCalories(W,A,I),c+=G)}}});let p=l-c;b={calorie:p>=0?this._tf("cal_over_week",e.calOverWeek,{calories:p}):this._tf("cal_under_week",e.calUnderWeek,{calories:Math.abs(p)}),weight:null,calorieColor:p>=0?"#f44336":"#4caf50",weightColor:null}}}else b={calorie:this._tf("cal_under_goal",e.calUnderGoal,{calories:0}),weight:this._tf("lost_estimate",e.lostEstimate,{value:"0.0",unit:n}),calorieColor:"#4caf50",weightColor:"#4caf50"};let z=a;if(this.selectedDate&&s[this.selectedDate]){let r=s[this.selectedDate];if(Array.isArray(r)&&r.length>=6){let[,,,i]=r;z=i}}let S=this._barVisualHeight||95,O=(1-1/1.4)*S,R=new Set(Object.entries(s).filter(([r,i])=>{if(Array.isArray(i)&&i.length>=2){let[d,c]=i;return d!==0||c!==0}return!1}).map(([r])=>r));return D`
      <div class="summary-container">
        <div class="gauge-section">
          <div class="gauge-labels">
            <div class="titles">${h}</div>
          </div>
          <div class="gauge-container">
            ${this._renderGauge($,q,E,N)}
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
              style="top: ${O}px; bottom: auto;"
            ></div>
            ${v.map((r,i)=>{let d=s[r],c=0,l=a,p=o,_="0";if(d&&Array.isArray(d)&&d.length>=6){let[se,le,,ue,ce]=d;if(l=ue,p=ce,se!==0||le!==0){let de=this._getDisplayCalories(se,le,ce);c=de;let oe=de-l;_=oe>0?`+${Math.round(oe)}`:`${Math.round(oe)}`}else c=0,_="0"}let m=l*1.4,k=Math.min(c,m),A=Math.min(l,c)/m*100,I=(k>l?k-l:0)/m*100,F=L(r),H=`${F.getDate().toString().padStart(2,"0")} ${this._formatMonthShort(F)}`,re=this.selectedDate===r;return D`
                <div
                  class="bar${re?" selected":""}"
                  style="cursor:pointer"
                  @click=${()=>this._onBarClick(r)}
                  title=${this._tf("show_details_for",e.showDetailsFor,{date:H})}
                >
                  <div class="bar-visual">
                    <div class="bar-outline"></div>
                    <div
                      class="bar-fill-green"
                      style="height: ${A}%"
                    ></div>
                    <div
                      class="bar-fill-red"
                      style="height: ${I}%"
                    ></div>
                  </div>
                  <div class="bar-label">${_}</div>
                  <div class="day-label">${ae[i]}</div>
                  <div class="date-label">${H}</div>
                </div>
              `})}
          </div>
          ${b?D`
            <div class="weekly-summary">
              <div style="color: ${b.calorieColor};">${b.calorie}</div>
              ${b.weight?D`
                <div style="color: ${b.weightColor}; font-size: 14px; margin-top: 2px;">${b.weight}</div>
              `:""}
            </div>
          `:""}
        </div>
        ${this._showWeightPopup?D`
          <div class="modal-backdrop" @click=${this._closeWeightPopup}></div>
          <div class="modal-popup" @click=${r=>r.stopPropagation()}>
            <div class="modal-header">
              ${e.editWeightFor}
              ${(()=>{let r=this.selectedDate?L(this.selectedDate):new Date;return`${r.getDate().toString().padStart(2,"0")} ${this._formatMonthShort(r)} ${r.getFullYear()}`})()}
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
            ${this._weightInputError?D`
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
    `}firstUpdated(){this._measureBarVisualHeight(),window.addEventListener("resize",()=>this._measureBarVisualHeight())}_measureBarVisualHeight(){let e=this.renderRoot.querySelector(".bar-visual");if(e){let t=e.offsetHeight;t!==this._barVisualHeight&&(this._barVisualHeight=t)}}_renderGauge(e,t,a,o=null){let u=t*(a==="variable_bulk"?1.1:1.4),n={x:70,y:70},y=40,g=8,C=-180,P=0,v=P-C,M=Math.max(Math.min(e/u,1),0),h=C+M*v,x=t/u,$=C+x*v,T=f=>f*Math.PI/180,K=(f,b,z)=>{let S=T(f),O=T(b),R=n.x+z*Math.cos(S),Y=n.y+z*Math.sin(S),U=n.x+z*Math.cos(O),j=n.y+z*Math.sin(O),B=Math.abs(b-f)>180?1:0;return`M ${R} ${Y} A ${z} ${z} 0 ${B} 1 ${U} ${j}`},q=500,E=[];for(let f=0;f<=u;f+=q){let b=f/u,z=C+b*v,S=T(z),O=y+5,R=y+12,Y=y+20,U=n.x+O*Math.cos(S),j=n.y+O*Math.sin(S),B=n.x+R*Math.cos(S),Q=n.y+R*Math.sin(S),Z=n.x+Y*Math.cos(S),ee=n.y+Y*Math.sin(S);E.push({line:`M ${U} ${j} L ${B} ${Q}`,label:{x:Z,y:ee,value:f}})}let N=T(h),J=y-5,ae=n.x+J*Math.cos(N),ne=n.y+J*Math.sin(N);return te`
      <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
        <!-- Background arc -->
        <path
          d="${K(C,P,y)}"
          fill="none"
          stroke="#eee"
          stroke-width="${g}"
          stroke-linecap="round"
        />

        <!-- Green arc (0 to goal) -->
        <path
          d="${K(C,$,y)}"
          fill="none"
          stroke="#4caf50"
          stroke-width="${g}"
          stroke-linecap="round"
        />

        <!-- Red arc (goal to current, if over goal) -->
        <path
          d="${K($,P,y)}"
          fill="none"
          stroke="#f44336"
          stroke-width="${g}"
          stroke-linecap="round"
        />

        <!-- Tick marks -->
        ${E.map(f=>te`
          <path
            d="${f.line}"
            stroke="var(--secondary-text-color, #666)"
            stroke-width="1"
          />
        `)}

        <!-- Tick labels -->
        ${E.map(f=>te`
          <text
            x="${f.label.x}"
            y="${f.label.y}"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="9"
            fill="var(--secondary-text-color, #666)"
          >
            ${f.label.value}
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
          y="${n.y+y-5}"
          text-anchor="middle"
          fill="${e<=t?"#4caf50":"#f44336"}"
        >
          ${Math.round(e)} Cal${["fixed_surplus","fixed_deficit","variable_cut","variable_bulk","fixed_net_calories"].includes(a)?" (net)":""}
        </text>

        <!-- Over/Under label -->
        <text
          class="gauge-over-label"
          x="${n.x}"
          y="${n.y+y+18}"
          text-anchor="middle"
          fill="${o!==null?o>=0?"#4caf50":"#f44336":e<=t?"#4caf50":"#f44336"}"
        >
          ${o!==null?o>=0?`${Math.round(o)} ${this._t("under","Under")}`:`${Math.round(Math.abs(o))} ${this._t("over","Over")}`:e-t>=0?`${Math.round(e-t)} ${this._t("over","Over")}`:`${Math.round(t-e)} ${this._t("under","Under")}`}
        </text>
      </svg>
    `}_onBarClick(e){this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:e},bubbles:!0,composed:!0}))}_changeWeek(e){let t=this.selectedDate?L(this.selectedDate):new Date,a=new Date(t);a.setHours(0,0,0,0);let o=t.getDay(),s=ge(o,this.weekStartDay);a.setDate(t.getDate()-s),a.setDate(a.getDate()+e*7);let u=V(a);this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:u},bubbles:!0,composed:!0}))}_toggleCalendar(){if(this._showCalendar=!this._showCalendar,this._showCalendar&&this.selectedDate){let e=L(this.selectedDate);this._calendarMonth=e.getMonth(),this._calendarYear=e.getFullYear(),this._fetchCalendarDataDates()}}async _fetchCalendarDataDates(){if(!this.hass||!this.profile)return;let e=this.profile.entity_id,t=this._calendarYear,a=this._calendarMonth+1;try{let o=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_month_data_days",entity_id:e,year:t,month:a});this._calendarDataDates=new Set(o.days||[])}catch(o){this._calendarDataDates=new Set}}_changeCalendarMonth(e){let t=this._calendarMonth+e,a=this._calendarYear;t<0?(t=11,a-=1):t>11&&(t=0,a+=1),this._calendarMonth=t,this._calendarYear=a,this._fetchCalendarDataDates()}_changeCalendarYear(e){this._calendarYear+=e,this._fetchCalendarDataDates()}_renderCalendar(e){let t=this._calendarMonth,a=this._calendarYear,s=new Date(a,t,1).getDay(),u;this.weekStartDay==="monday"?u=s===0?6:s-1:u=s;let n=new Date(a,t+1,0).getDate(),y=[],g=[];for(let h=0;h<u;h++)g.push(null);for(let h=1;h<=n;h++)g.push(h),g.length===7&&(y.push(g),g=[]);if(g.length){for(;g.length<7;)g.push(null);y.push(g)}let C=h=>{if(!h)return!1;let x=`${a}-${String(t+1).padStart(2,"0")}-${String(h).padStart(2,"0")}`;return this._calendarDataDates.has(x)},P=h=>{if(!h)return;let x=new Date(a,t,h),$=V(x);this._showCalendar=!1,this.dispatchEvent(new CustomEvent("select-summary-date",{detail:{date:$},bubbles:!0,composed:!0}))},v=this._getLocale(),M=new Intl.DateTimeFormat(v,{month:"long"}).format(new Date(a,t,1));return D`
      <div class="calendar-popup themed-calendar-popup">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <button @click=${()=>this._changeCalendarMonth(-1)} style="background:none;border:none;cursor:pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <span style="font-weight:bold;">
            ${M} ${a}
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
              ${xe(this.weekStartDay,v).map(h=>D`
                <th style="font-size:11px;">${h}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${y.map(h=>D`
              <tr>
                ${h.map(x=>{let $=x&&this.selectedDate&&this._isSameDay(a,t,x,this.selectedDate),T=C(x);return D`
                    <td
                      class=${[$?"selected-date":"",T?"has-entry":""].join(" ")}
                      style="
                        text-align:center;
                        padding:2px 0;
                        cursor:${x?"pointer":"default"};
                        border-radius:4px;
                      "
                      @click=${()=>P(x)}
                    >
                      ${x||""}
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
    `}_isSameDay(e,t,a,o){let s=L(o);return s.getFullYear()===e&&s.getMonth()===t&&s.getDate()===a}_getDisplayCalories(e,t,a){return a==="fixed_intake"?e:e-t}};ie(X,"properties",{hass:{attribute:!1},profile:{attribute:!1},translations:{attribute:!1},weeklySummary:{attribute:!1},selectedDate:{type:String},weight:{type:Number},weekStartDay:{type:String},_barVisualHeight:{type:Number,state:!0},_showCalendar:{type:Boolean,state:!0},_calendarMonth:{type:Number,state:!0},_calendarYear:{type:Number,state:!0},_calendarDataDates:{type:Object,state:!0}}),ie(X,"styles",[he`
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
  `]);customElements.get("calorie-summary")||customElements.define("calorie-summary",X)});export{me as a};
//# sourceMappingURL=chunk-T65Z6DZL.js.map
