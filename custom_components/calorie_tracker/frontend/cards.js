import{a as it,e as Y,f as B}from"./chunks/chunk-5HHMTMB7.js";var _t=Y(()=>{var ut=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._summaryLoaded=!1,this._styleObserver=null}async _ensureSummaryLoaded(){if(!this._summaryLoaded&&!customElements.get("calorie-summary"))try{await import("./chunks/summary-QF4JDFJX.js"),this._summaryLoaded=!0}catch(t){console.error("Failed to load summary component:",t)}}setConfig(t){this.config=t,this.profileEntityId=t.profile_entity_id||null,this.title=typeof t.title=="string"?t.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <calorie-summary></calorie-summary>
      </ha-card>
    `}set hass(t){this._hass=t,this._updateCard()}get hass(){return this._hass}_getLocalDateString(t=new Date){let e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0");return`${e}-${a}-${o}`}async _updateCard(){var o,r;await this._ensureSummaryLoaded(),await customElements.whenDefined("calorie-summary");let t=this.querySelector("calorie-summary");if(!t||!this.hass)return;let e=this.profileEntityId;if(e||(e=Object.keys(this.hass.states).find(s=>s.startsWith("sensor.calorie_tracker_profile"))),!e){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[e]){console.error(`Entity not found: ${e}`);return}let a=this.hass.states[e];t.hass=this.hass,t.profile=a,t.selectedDate=this.selectedDate||this._getLocalDateString(),this._applyWrapperStyles(t),!this._styleObserver&&t.renderRoot&&(this._styleObserver=new MutationObserver(()=>{this._applyWrapperStyles(t)}),this._styleObserver.observe(t.renderRoot,{childList:!0,subtree:!0}));try{let[s,n]=await Promise.all([this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_weekly_summary",entity_id:e,date:t.selectedDate}),this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:e,date:t.selectedDate})]);t.weeklySummary=(o=s==null?void 0:s.weekly_summary)!=null?o:{},t.weight=(r=n==null?void 0:n.weight)!=null?r:null}catch(s){console.error("Failed to fetch calorie data:",s)}this._eventsAttached||(t.addEventListener("select-summary-date",s=>{this.selectedDate=s.detail.date,this._updateCard()}),t.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyWrapperStyles(t){if(!(t!=null&&t.renderRoot))return;let e=t.renderRoot.querySelector(".gauge-container");if(e){e.style.width="120px",e.style.height="120px",e.style.maxWidth="120px";let a=e.querySelector("svg");a&&(a.style.maxWidth="120px",a.style.maxHeight="120px")}}disconnectedCallback(){this._styleObserver&&(this._styleObserver.disconnect(),this._styleObserver=null)}};customElements.get("calorie-summary-card")||customElements.define("calorie-summary-card",ut)});var xt=Y(()=>{var gt=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._dailyDataLoaded=!1}async _ensureDailyDataLoaded(){if(!this._dailyDataLoaded&&!customElements.get("daily-data-card"))try{await import("./chunks/daily-data-X6RJNH7I.js"),this._dailyDataLoaded=!0}catch(t){console.error("Failed to load daily-data component:",t)}}setConfig(t){this.config=t,this.profileEntityId=t.profile_entity_id||null,this.title=typeof t.title=="string"?t.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <daily-data-card></daily-data-card>
      </ha-card>
    `}set hass(t){this._hass=t,this._updateCard()}get hass(){return this._hass}_getLocalDateString(t=new Date){let e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0");return`${e}-${a}-${o}`}async _updateCard(){var o,r,s,n;await this._ensureDailyDataLoaded(),await customElements.whenDefined("daily-data-card");let t=this.querySelector("daily-data-card");if(!t||!this.hass)return;let e=this.profileEntityId;if(e||(e=Object.keys(this.hass.states).find(c=>c.startsWith("sensor.calorie_tracker_")&&c.includes("_profile")&&this.hass.states[c])),!e){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[e]){console.error(`Entity not found: ${e}`);return}let a=this.hass.states[e];t.hass=this.hass,t.profile=a,t.selectedDate=this.selectedDate||this._getLocalDateString();try{let c=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:e,date:t.selectedDate});t.log={food_entries:(c==null?void 0:c.food_entries)||[],exercise_entries:(c==null?void 0:c.exercise_entries)||[],weight:(o=c==null?void 0:c.weight)!=null?o:null,body_fat_pct:(r=c==null?void 0:c.body_fat_pct)!=null?r:null,bmr_and_neat:(s=c==null?void 0:c.bmr_and_neat)!=null?s:null,macros:(c==null?void 0:c.macros)||null,config_entry_id:(n=c==null?void 0:c.config_entry_id)!=null?n:null}}catch(c){console.error("Failed to fetch daily data:",c),t.log={food_entries:[],exercise_entries:[],weight:null,body_fat_pct:null,bmr_and_neat:null}}this._eventsAttached||(t.addEventListener("select-daily-date",c=>{this.selectedDate=c.detail.date,this._updateCard()}),t.addEventListener("refresh-daily-data",()=>{this._updateCard()}),t.addEventListener("add-daily-entry",async c=>{try{await this.hass.connection.sendMessagePromise(it({type:"calorie_tracker/add_entry",entity_id:e},c.detail)),this._updateCard()}catch(h){console.error("Failed to add entry:",h)}}),t.addEventListener("edit-daily-entry",async c=>{try{await this.hass.connection.sendMessagePromise(it({type:"calorie_tracker/update_entry",entity_id:e},c.detail)),this._updateCard()}catch(h){console.error("Failed to edit entry:",h)}}),t.addEventListener("delete-daily-entry",async c=>{try{await this.hass.connection.sendMessagePromise(it({type:"calorie_tracker/delete_entry",entity_id:e},c.detail)),this._updateCard()}catch(h){console.error("Failed to delete entry:",h)}}),this._eventsAttached=!0)}};customElements.get("calorie-daily-log-card")||customElements.define("calorie-daily-log-card",gt)});var bt=Y(()=>{var ft=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._profileLoaded=!1}async _ensureProfileLoaded(){if(!this._profileLoaded&&!customElements.get("profile-card"))try{await import("./chunks/profile-card-K6XLSMCR.js"),this._profileLoaded=!0}catch(t){console.error("Failed to load profile component:",t)}}setConfig(t){this.config=t,this.profileEntityId=t.profile_entity_id||null,this.title=typeof t.title=="string"?t.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header" id="ct-header">${this.title}</div>`:""}
        <profile-card></profile-card>
      </ha-card>
    `}set hass(t){this._hass=t,this._updateCard()}get hass(){return this._hass}async _updateCard(){var s,n,c,h,d,v,N,T,$;await this._ensureProfileLoaded(),await customElements.whenDefined("profile-card");let t=this.querySelector("profile-card");if(!t||!this.hass)return;let e=this.profileEntityId;if(e||(e=Object.keys(this.hass.states).find(b=>b.startsWith("sensor.calorie_tracker_")&&b.includes("_profile")&&this.hass.states[b])),!e){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[e]){console.error(`Entity not found: ${e}`);return}let a=this.hass.states[e];t.hass=this.hass,t.profile=a;let o=a.attributes||{};t.goalType=(s=o.goal_type)!=null?s:"Not Set",t.dailyGoal=(n=o.daily_goal_calories)!=null?n:null,t.goalValue=(c=o.goal_value)!=null?c:null,t.currentWeight=(h=o.current_weight)!=null?h:null;let r=this.querySelector("#ct-header");if(r)if(this.title)r.textContent=this.title;else{let b=((d=a.attributes)==null?void 0:d.spoken_name)||e||"Calorie Tracker";r.textContent=`${b} Calorie Tracker Profile`}try{let[b,y]=await Promise.all([this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_user_profile",user_id:((v=this.hass.user)==null?void 0:v.id)||"unknown"}),this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_linked_components",entity_id:e})]);t.allProfiles=(N=b==null?void 0:b.all_profiles)!=null?N:[],t.defaultProfile=(T=b==null?void 0:b.default_profile)!=null?T:null,t.linkedDevices=($=y==null?void 0:y.linked_components)!=null?$:[]}catch(b){console.error("Failed to fetch profile data:",b);let y=Object.keys(this.hass.states).filter(M=>M.startsWith("sensor.calorie_tracker_profile")).map(M=>{var p;let k=this.hass.states[M];return{entity_id:M,spoken_name:((p=k.attributes)==null?void 0:p.spoken_name)||M}}).filter(M=>M);t.allProfiles=y,t.linkedDevices=[]}this._eventsAttached||(t.addEventListener("refresh-profile",()=>{this._updateCard()}),t.addEventListener("profile-selected",b=>{this.profileEntityId=b.detail.entityId,this._updateCard()}),t.addEventListener("profiles-updated",b=>{this._updateCard()}),this._eventsAttached=!0)}};customElements.get("calorie-profile-card")||customElements.define("calorie-profile-card",ft)});var vt=Y(()=>{var yt=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._summaryLoaded=!1,this._styleObserver=null}async _ensureSummaryLoaded(){if(!this._summaryLoaded&&!customElements.get("calorie-summary"))try{await import("./chunks/summary-QF4JDFJX.js"),this._summaryLoaded=!0}catch(t){console.error("Failed to load summary component:",t)}}setConfig(t){this.config=t,this.profileEntityId=t.profile_entity_id||null,this.title=typeof t.title=="string"?t.title:"",this.maxHeight=t.max_height||"400px",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <calorie-summary></calorie-summary>
      </ha-card>
    `}set hass(t){this._hass=t,this._updateCard()}get hass(){return this._hass}_getLocalDateString(t=new Date){let e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0");return`${e}-${a}-${o}`}async _updateCard(){var o,r;await this._ensureSummaryLoaded(),await customElements.whenDefined("calorie-summary");let t=this.querySelector("calorie-summary");if(!t||!this.hass)return;let e=this.profileEntityId;if(e||(e=Object.keys(this.hass.states).find(s=>s.startsWith("sensor.calorie_tracker_")&&s.includes("_profile")&&this.hass.states[s])),!e){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[e]){console.error(`Entity not found: ${e}`);return}let a=this.hass.states[e];t.hass=this.hass,t.profile=a,t.selectedDate=this.selectedDate||this._getLocalDateString(),this._applyGaugeOnlyStyles(t),!this._styleObserver&&t.renderRoot&&(this._styleObserver=new MutationObserver(()=>{this._applyGaugeOnlyStyles(t)}),this._styleObserver.observe(t.renderRoot,{childList:!0,subtree:!0}));try{let[s,n]=await Promise.all([this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_weekly_summary",entity_id:e,date:t.selectedDate}),this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:e,date:t.selectedDate})]);t.weeklySummary=(o=s==null?void 0:s.weekly_summary)!=null?o:{},t.weight=(r=n==null?void 0:n.weight)!=null?r:null}catch(s){console.error("Failed to fetch calorie data:",s)}this._eventsAttached||(t.addEventListener("select-summary-date",s=>{this.selectedDate=s.detail.date,this._updateCard()}),t.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyGaugeOnlyStyles(t){if(!(t!=null&&t.renderRoot))return;let e=t.renderRoot.querySelector(".bar-graph-section");e&&(e.style.display="none");let a=t.renderRoot.querySelector(".gauge-labels");a&&(a.style.display="none");let o=t.renderRoot.querySelector(".summary-container");o&&(o.style.justifyContent="center",o.style.alignItems="center",o.style.height="100%",o.style.maxWidth="none");let r=t.renderRoot.querySelector(".gauge-section");r&&(r.style.width="100%",r.style.flex="1",r.style.maxWidth="none");let s=t.renderRoot.querySelector(".gauge-container");s&&(s.style.width="100%",s.style.height="auto",s.style.aspectRatio="1 / 1",s.style.maxWidth=this.maxHeight,s.style.maxHeight=this.maxHeight);let n=t.renderRoot.querySelector(".gauge-container svg");n&&(n.style.width="100%",n.style.height="100%",n.style.maxWidth="none",n.style.maxHeight="none"),t.style&&(t.style.height="100%",t.style.display="flex",t.style.alignItems="center",t.style.justifyContent="center")}disconnectedCallback(){this._styleObserver&&(this._styleObserver.disconnect(),this._styleObserver=null)}};customElements.get("calorie-gauge-card")||customElements.define("calorie-gauge-card",yt)});var wt=Y(()=>{var nt=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(t){this.config=t||{},this.profileEntityId=t.profile_entity_id||null,this.title=typeof t.title=="string"?t.title:"",this.maxHeight=t.max_height||"400px",this.min=typeof t.min=="number"?t.min:null,this.max=typeof t.max=="number"?t.max:null,this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="protein-gauge-wrapper">
          <div class="protein-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="protein-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
          </div>
        </div>
      </ha-card>
    `}set hass(t){this._hass=t,this._updateCard()}get hass(){return this._hass}_getLocalDateString(t=new Date){let e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0");return`${e}-${a}-${o}`}async _updateCard(){var o,r,s;let t=this.querySelector(".protein-gauge");if(!t||!this.hass)return;let e=this.profileEntityId;if(e||(e=Object.keys(this.hass.states).find(n=>n.startsWith("sensor.calorie_tracker_")&&this.hass.states[n])),!e){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[e]){console.error(`Entity not found: ${e}`);return}let a=this.hass.states[e];this._profile=a,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyProteinStyles(t);try{let n=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:e,date:this._selectedDate}),c=(o=n==null?void 0:n.weight)!=null?o:null,h=(r=n==null?void 0:n.weight_unit)!=null?r:null,d=(s=n==null?void 0:n.macros)!=null?s:{},v=Math.round(d.p||d.protein||0),N=this._profile&&this._profile.attributes||{},T=Number(N.current_weight),$=N.weight_unit||h||"lbs",b=(m,g,w)=>Number.isFinite(m)?!g||!w||g===w?m:g==="kg"&&w==="lbs"?m*2.20462:g==="lbs"&&w==="kg"?m/2.20462:m:null,y=Number.isFinite(T)?T:null;!Number.isFinite(y)&&Number.isFinite(c)&&(y=b(Number(c),h||$,$));let M=Number.isFinite(y)?y:null,k=Number.isFinite(y)?$==="kg"?y*2.20462:y:null,p=m=>m==null?null:m<5&&M!==null?Math.round(m*M):m,u=p(this.min),L=p(this.max),C=k!=null?k:150,S=Math.ceil(C/10)*10;(!Number.isFinite(S)||S<=0)&&(S=150),L!==null&&(S=L),this._gaugeMax=S,this._gaugeMin=u!==null?u:0,this._proteinValue=v,this._proteinWeight=k||0,this._proteinMin=u,this._proteinMax=L,this._renderGauge()}catch(n){console.error("Failed to fetch protein data:",n)}this._eventsAttached||(t.addEventListener("select-summary-date",n=>{this.selectedDate=n.detail.date,this._updateCard()}),t.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyProteinStyles(t){if(!t)return;let e=t.querySelector(".protein-svg");e&&(e.style.width="100%",e.style.height="auto",e.style.maxWidth=this.maxHeight,e.style.maxHeight=this.maxHeight)}};customElements.get("protein-gauge-card")||customElements.define("protein-gauge-card",nt);nt.prototype._renderGauge=function(){let I=this.querySelector(".protein-svg");if(!I)return;let t=Math.max(0,this._proteinValue||0),e=this._proteinMin,a=this._proteinMax,o=this._gaugeMax||100,r=a!==null?a*1.1:o*1.1,s={x:70,y:70},n=40,c=8,h=-180,d=0,v=d-h,N=Math.max(Math.min(t/r,1),0),T=h+N*v,$=i=>i*Math.PI/180,b=(i,f,_)=>{let x=$(i),P=$(f),H=s.x+_*Math.cos(x),F=s.y+_*Math.sin(x),q=s.x+_*Math.cos(P),O=s.y+_*Math.sin(P),G=Math.abs(f-i)>180?1:0;return`M ${H} ${F} A ${_} ${_} 0 ${G} 1 ${q} ${O}`},y=8,M=[5,10,25,50,100,200],k=M[0];for(let i of M)if(r/i<=y){k=i;break}let p=[];for(let i=0;i<=r;i+=k){let f=i/r,_=h+f*v,x=$(_),P=n+5,H=n+12,F=n+20,q=s.x+P*Math.cos(x),O=s.y+P*Math.sin(x),G=s.x+H*Math.cos(x),j=s.y+H*Math.sin(x),V=s.x+F*Math.cos(x),W=s.y+F*Math.sin(x);p.push({line:`M ${q} ${O} L ${G} ${j}`,label:{x:V,y:W,value:i}})}let u=[];if(e===null&&a===null)u.push({startAngle:h,endAngle:d,color:"#4caf50"});else if(e!==null&&a===null){let i=e/r,f=h+i*v;u.push({startAngle:h,endAngle:f,color:"#ffeb3b"}),u.push({startAngle:f,endAngle:d,color:"#4caf50"})}else if(e===null&&a!==null){let i=a/r,f=h+i*v;u.push({startAngle:h,endAngle:f,color:"#4caf50"}),u.push({startAngle:f,endAngle:d,color:"#f44336"})}else{let i=e/r,f=a/r,_=h+i*v,x=h+f*v;u.push({startAngle:h,endAngle:_,color:"#ffeb3b"}),u.push({startAngle:_,endAngle:x,color:"#4caf50"}),u.push({startAngle:x,endAngle:d,color:"#f44336"})}let L=$(T),C=n-5,S=s.x+C*Math.cos(L),m=s.y+C*Math.sin(L),g="#4caf50";e!==null&&a!==null?t<e?g="#ffeb3b":t>=e&&t<=a?g="#4caf50":g="#f44336":e!==null&&a===null?t<e?g="#ffeb3b":g="#4caf50":e===null&&a!==null&&(t<=a?g="#4caf50":g="#f44336");let w=`
    <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
      <!-- Background arc -->
      <path
        d="${b(h,d,n)}"
        fill="none"
        stroke="#eee"
        stroke-width="${c}"
        stroke-linecap="round"
      />
  `;u.forEach(i=>{w+=`
      <path
        d="${b(i.startAngle,i.endAngle,n)}"
        fill="none"
        stroke="${i.color}"
        stroke-width="${c}"
        stroke-linecap="round"
      />
    `}),p.forEach(i=>{w+=`
      <path
        d="${i.line}"
        stroke="var(--secondary-text-color, #666)"
        stroke-width="1"
      />
    `}),p.forEach(i=>{w+=`
      <text
        x="${i.label.x}"
        y="${i.label.y}"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="9"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        fill="var(--secondary-text-color, #666)"
      >
        ${i.label.value}
      </text>
    `}),w+=`
      <!-- Needle -->
      <line
        x1="${s.x}"
        y1="${s.y}"
        x2="${S}"
        y2="${m}"
        stroke="var(--primary-text-color, #333)"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Center dot -->
      <circle
        cx="${s.x}"
        cy="${s.y}"
        r="3"
        fill="var(--primary-text-color, #333)"
      />

      <!-- Current value label -->
      <text
        x="${s.x}"
        y="${s.y+n-5}"
        text-anchor="middle"
        font-size="12"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        font-weight="600"
        fill="${g}"
      >
        ${Math.round(t)} g Protein
      </text>

    </svg>
  `,I.innerHTML=w}});var $t=Y(()=>{var rt=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(t){this.config=t||{},this.profileEntityId=t.profile_entity_id||null,this.title=typeof t.title=="string"?t.title:"",this.maxHeight=t.max_height||"400px",this.min=typeof t.min=="number"?t.min:null,this.max=typeof t.max=="number"?t.max:null,this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="fat-gauge-wrapper">
          <div class="fat-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="fat-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
          </div>
        </div>
      </ha-card>
    `}set hass(t){this._hass=t,this._updateCard()}get hass(){return this._hass}_getLocalDateString(t=new Date){let e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0");return`${e}-${a}-${o}`}async _updateCard(){var o,r,s;let t=this.querySelector(".fat-gauge");if(!t||!this.hass)return;let e=this.profileEntityId;if(e||(e=Object.keys(this.hass.states).find(n=>n.startsWith("sensor.calorie_tracker_")&&this.hass.states[n])),!e){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[e]){console.error(`Entity not found: ${e}`);return}let a=this.hass.states[e];this._profile=a,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyFatStyles(t);try{let n=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:e,date:this._selectedDate}),c=(o=n==null?void 0:n.weight)!=null?o:null,h=(r=n==null?void 0:n.weight_unit)!=null?r:null,d=(s=n==null?void 0:n.macros)!=null?s:{},v=Math.round(d.f||d.fat||0),N=this._profile&&this._profile.attributes||{},T=Number(N.current_weight),$=N.weight_unit||h||"lbs",b=(m,g,w)=>Number.isFinite(m)?!g||!w||g===w?m:g==="kg"&&w==="lbs"?m*2.20462:g==="lbs"&&w==="kg"?m/2.20462:m:null,y=Number.isFinite(T)?T:null;!Number.isFinite(y)&&Number.isFinite(c)&&(y=b(Number(c),h||$,$));let M=Number.isFinite(y)?y:null,k=Number.isFinite(y)?$==="kg"?y*2.20462:y:null,p=m=>m==null?null:m<5&&M!==null?Math.round(m*M):m,u=p(this.min),L=p(this.max),C=k!=null?k:150,S=Math.ceil(C*.36/10)*10;(!Number.isFinite(S)||S<=0)&&(S=80),L!==null&&(S=L),this._gaugeMax=S,this._gaugeMin=u!==null?u:0,this._fatValue=v,this._fatWeight=k||0,this._fatMin=u,this._fatMax=L,this._renderGauge()}catch(n){console.error("Failed to fetch fat data:",n)}this._eventsAttached||(t.addEventListener("select-summary-date",n=>{this.selectedDate=n.detail.date,this._updateCard()}),t.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyFatStyles(t){if(!t)return;let e=t.querySelector(".fat-svg");e&&(e.style.width="100%",e.style.height="auto",e.style.maxWidth=this.maxHeight,e.style.maxHeight=this.maxHeight)}};customElements.get("fat-gauge-card")||customElements.define("fat-gauge-card",rt);rt.prototype._renderGauge=function(){let I=this.querySelector(".fat-svg");if(!I)return;let t=Math.max(0,this._fatValue||0),e=this._fatMin,a=this._fatMax,o=this._gaugeMax||100,r=a!==null?a*1.1:o*1.1,s={x:70,y:70},n=40,c=8,h=-180,d=0,v=d-h,N=Math.max(Math.min(t/r,1),0),T=h+N*v,$=i=>i*Math.PI/180,b=(i,f,_)=>{let x=$(i),P=$(f),H=s.x+_*Math.cos(x),F=s.y+_*Math.sin(x),q=s.x+_*Math.cos(P),O=s.y+_*Math.sin(P),G=Math.abs(f-i)>180?1:0;return`M ${H} ${F} A ${_} ${_} 0 ${G} 1 ${q} ${O}`},y=8,M=[5,10,25,50,100,200],k=M[0];for(let i of M)if(r/i<=y){k=i;break}let p=[];for(let i=0;i<=r;i+=k){let f=i/r,_=h+f*v,x=$(_),P=n+5,H=n+12,F=n+20,q=s.x+P*Math.cos(x),O=s.y+P*Math.sin(x),G=s.x+H*Math.cos(x),j=s.y+H*Math.sin(x),V=s.x+F*Math.cos(x),W=s.y+F*Math.sin(x);p.push({line:`M ${q} ${O} L ${G} ${j}`,label:{x:V,y:W,value:i}})}let u=[];if(e===null&&a===null)u.push({startAngle:h,endAngle:d,color:"#4caf50"});else if(e!==null&&a===null){let i=e/r,f=h+i*v;u.push({startAngle:h,endAngle:f,color:"#ffeb3b"}),u.push({startAngle:f,endAngle:d,color:"#4caf50"})}else if(e===null&&a!==null){let i=a/r,f=h+i*v;u.push({startAngle:h,endAngle:f,color:"#4caf50"}),u.push({startAngle:f,endAngle:d,color:"#f44336"})}else{let i=e/r,f=a/r,_=h+i*v,x=h+f*v;u.push({startAngle:h,endAngle:_,color:"#ffeb3b"}),u.push({startAngle:_,endAngle:x,color:"#4caf50"}),u.push({startAngle:x,endAngle:d,color:"#f44336"})}let L=$(T),C=n-5,S=s.x+C*Math.cos(L),m=s.y+C*Math.sin(L),g="#4caf50";e!==null&&a!==null?t<e?g="#ffeb3b":t>=e&&t<=a?g="#4caf50":g="#f44336":e!==null&&a===null?t<e?g="#ffeb3b":g="#4caf50":e===null&&a!==null&&(t<=a?g="#4caf50":g="#f44336");let w=`
    <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
      <!-- Background arc -->
      <path
        d="${b(h,d,n)}"
        fill="none"
        stroke="#eee"
        stroke-width="${c}"
        stroke-linecap="round"
      />
  `;u.forEach(i=>{w+=`
      <path
        d="${b(i.startAngle,i.endAngle,n)}"
        fill="none"
        stroke="${i.color}"
        stroke-width="${c}"
        stroke-linecap="round"
      />
    `}),p.forEach(i=>{w+=`
      <path
        d="${i.line}"
        stroke="var(--secondary-text-color, #666)"
        stroke-width="1"
      />
    `}),p.forEach(i=>{w+=`
      <text
        x="${i.label.x}"
        y="${i.label.y}"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="9"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        fill="var(--secondary-text-color, #666)"
      >
        ${i.label.value}
      </text>
    `}),w+=`
      <!-- Needle -->
      <line
        x1="${s.x}"
        y1="${s.y}"
        x2="${S}"
        y2="${m}"
        stroke="var(--primary-text-color, #333)"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Center dot -->
      <circle
        cx="${s.x}"
        cy="${s.y}"
        r="3"
        fill="var(--primary-text-color, #333)"
      />

      <!-- Current value label -->
      <text
        x="${s.x}"
        y="${s.y+n-5}"
        text-anchor="middle"
        font-size="12"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        font-weight="600"
        fill="${g}"
      >
        ${Math.round(t)} g Fat
      </text>

    </svg>
  `,I.innerHTML=w}});var Mt=Y(()=>{var ot=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(t){this.config=t||{},this.profileEntityId=t.profile_entity_id||null,this.title=typeof t.title=="string"?t.title:"",this.maxHeight=t.max_height||"400px",this.min=typeof t.min=="number"?t.min:null,this.max=typeof t.max=="number"?t.max:null,this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="carbs-gauge-wrapper">
          <div class="carbs-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="carbs-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
          </div>
        </div>
      </ha-card>
    `}set hass(t){this._hass=t,this._updateCard()}get hass(){return this._hass}_getLocalDateString(t=new Date){let e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0");return`${e}-${a}-${o}`}async _updateCard(){var o,r,s;let t=this.querySelector(".carbs-gauge");if(!t||!this.hass)return;let e=this.profileEntityId;if(e||(e=Object.keys(this.hass.states).find(n=>n.startsWith("sensor.calorie_tracker_")&&this.hass.states[n])),!e){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[e]){console.error(`Entity not found: ${e}`);return}let a=this.hass.states[e];this._profile=a,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyCarbsStyles(t);try{let n=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:e,date:this._selectedDate}),c=(o=n==null?void 0:n.weight)!=null?o:null,h=(r=n==null?void 0:n.weight_unit)!=null?r:null,d=(s=n==null?void 0:n.macros)!=null?s:{},v=Math.round(d.c||d.carbs||0),N=this._profile&&this._profile.attributes||{},T=Number(N.current_weight),$=N.weight_unit||h||"lbs",b=(m,g,w)=>Number.isFinite(m)?!g||!w||g===w?m:g==="kg"&&w==="lbs"?m*2.20462:g==="lbs"&&w==="kg"?m/2.20462:m:null,y=Number.isFinite(T)?T:null;!Number.isFinite(y)&&Number.isFinite(c)&&(y=b(Number(c),h||$,$));let M=Number.isFinite(y)?y:null,k=Number.isFinite(y)?$==="kg"?y*2.20462:y:null,p=m=>m==null?null:m<5&&M!==null?Math.round(m*M):m,u=p(this.min),L=p(this.max),C=k!=null?k:150,S=Math.ceil(C*1.36/10)*10;(!Number.isFinite(S)||S<=0)&&(S=200),L!==null&&(S=L),this._gaugeMax=S,this._gaugeMin=u!==null?u:0,this._carbsValue=v,this._carbsWeight=k||0,this._carbsMin=u,this._carbsMax=L,this._renderGauge()}catch(n){console.error("Failed to fetch carbs data:",n)}this._eventsAttached||(t.addEventListener("select-summary-date",n=>{this.selectedDate=n.detail.date,this._updateCard()}),t.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyCarbsStyles(t){if(!t)return;let e=t.querySelector(".carbs-svg");e&&(e.style.width="100%",e.style.height="auto",e.style.maxWidth=this.maxHeight,e.style.maxHeight=this.maxHeight)}};customElements.get("carbs-gauge-card")||customElements.define("carbs-gauge-card",ot);ot.prototype._renderGauge=function(){let I=this.querySelector(".carbs-svg");if(!I)return;let t=Math.max(0,this._carbsValue||0),e=this._carbsMin,a=this._carbsMax,o=this._gaugeMax||100,r=a!==null?a*1.1:o*1.1,s={x:70,y:70},n=40,c=8,h=-180,d=0,v=d-h,N=Math.max(Math.min(t/r,1),0),T=h+N*v,$=i=>i*Math.PI/180,b=(i,f,_)=>{let x=$(i),P=$(f),H=s.x+_*Math.cos(x),F=s.y+_*Math.sin(x),q=s.x+_*Math.cos(P),O=s.y+_*Math.sin(P),G=Math.abs(f-i)>180?1:0;return`M ${H} ${F} A ${_} ${_} 0 ${G} 1 ${q} ${O}`},y=8,M=[5,10,25,50,100,200],k=M[0];for(let i of M)if(r/i<=y){k=i;break}let p=[];for(let i=0;i<=r;i+=k){let f=i/r,_=h+f*v,x=$(_),P=n+5,H=n+12,F=n+20,q=s.x+P*Math.cos(x),O=s.y+P*Math.sin(x),G=s.x+H*Math.cos(x),j=s.y+H*Math.sin(x),V=s.x+F*Math.cos(x),W=s.y+F*Math.sin(x);p.push({line:`M ${q} ${O} L ${G} ${j}`,label:{x:V,y:W,value:i}})}let u=[];if(e===null&&a===null)u.push({startAngle:h,endAngle:d,color:"#4caf50"});else if(e!==null&&a===null){let i=e/r,f=h+i*v;u.push({startAngle:h,endAngle:f,color:"#ffeb3b"}),u.push({startAngle:f,endAngle:d,color:"#4caf50"})}else if(e===null&&a!==null){let i=a/r,f=h+i*v;u.push({startAngle:h,endAngle:f,color:"#4caf50"}),u.push({startAngle:f,endAngle:d,color:"#f44336"})}else{let i=e/r,f=a/r,_=h+i*v,x=h+f*v;u.push({startAngle:h,endAngle:_,color:"#ffeb3b"}),u.push({startAngle:_,endAngle:x,color:"#4caf50"}),u.push({startAngle:x,endAngle:d,color:"#f44336"})}let L=$(T),C=n-5,S=s.x+C*Math.cos(L),m=s.y+C*Math.sin(L),g="#4caf50";e!==null&&a!==null?t<e?g="#ffeb3b":t>=e&&t<=a?g="#4caf50":g="#f44336":e!==null&&a===null?t<e?g="#ffeb3b":g="#4caf50":e===null&&a!==null&&(t<=a?g="#4caf50":g="#f44336");let w=`
    <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
      <!-- Background arc -->
      <path
        d="${b(h,d,n)}"
        fill="none"
        stroke="#eee"
        stroke-width="${c}"
        stroke-linecap="round"
      />
  `;u.forEach(i=>{w+=`
      <path
        d="${b(i.startAngle,i.endAngle,n)}"
        fill="none"
        stroke="${i.color}"
        stroke-width="${c}"
        stroke-linecap="round"
      />
    `}),p.forEach(i=>{w+=`
      <path
        d="${i.line}"
        stroke="var(--secondary-text-color, #666)"
        stroke-width="1"
      />
    `}),p.forEach(i=>{w+=`
      <text
        x="${i.label.x}"
        y="${i.label.y}"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="9"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        fill="var(--secondary-text-color, #666)"
      >
        ${i.label.value}
      </text>
    `}),w+=`
      <!-- Needle -->
      <line
        x1="${s.x}"
        y1="${s.y}"
        x2="${S}"
        y2="${m}"
        stroke="var(--primary-text-color, #333)"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Center dot -->
      <circle
        cx="${s.x}"
        cy="${s.y}"
        r="3"
        fill="var(--primary-text-color, #333)"
      />

      <!-- Current value label -->
      <text
        x="${s.x}"
        y="${s.y+n-5}"
        text-anchor="middle"
        font-size="12"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        font-weight="600"
        fill="${g}"
      >
        ${Math.round(t)} g Carbs
      </text>

    </svg>
  `,I.innerHTML=w}});var kt=Y(()=>{var lt=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(t){this.config=t||{},this.profileEntityId=t.profile_entity_id||null,this.title=typeof t.title=="string"?t.title:"Percent of Total Calories",this.maxHeight=t.max_height||"400px",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="macro-percentages-wrapper">
          <div class="macro-percentages" style="display:flex;align-items:center;justify-content:center;padding:20px;flex-direction:column;">
            <div style="display:flex;align-items:center;justify-content:center;">
              <svg class="pie-svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" style="width:150px;height:150px;flex-shrink:0;"></svg>
              <div class="legend" style="margin-left:20px;font-family:var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif);">
                <div class="legend-item" style="display:flex;align-items:center;margin-bottom:8px;">
                  <div class="legend-color protein-color" style="width:16px;height:16px;margin-right:8px;border-radius:2px;background-color:#4CAF50;"></div>
                  <span class="protein-text">Protein: --g (--)</span>
                </div>
                <div class="legend-item" style="display:flex;align-items:center;margin-bottom:8px;">
                  <div class="legend-color carbs-color" style="width:16px;height:16px;margin-right:8px;border-radius:2px;background-color:#2196F3;"></div>
                  <span class="carbs-text">Carbs: --g (--)</span>
                </div>
                <div class="legend-item" style="display:flex;align-items:center;margin-bottom:8px;">
                  <div class="legend-color fat-color" style="width:16px;height:16px;margin-right:8px;border-radius:2px;background-color:#FF9800;"></div>
                  <span class="fat-text">Fat: --g (--)</span>
                </div>
                <div class="legend-item" style="display:flex;align-items:center;margin-bottom:8px;">
                  <div class="legend-color alcohol-color" style="width:16px;height:16px;margin-right:8px;border-radius:2px;background-color:#9C27B0;"></div>
                  <span class="alcohol-text">Alcohol: --g (--)</span>
                </div>
              </div>
            </div>
            <div class="chart-label" style="margin-top:15px;font-family:var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif);font-size:14px;color:var(--secondary-text-color, #666);text-align:center;">
              Percent of Total Calories
            </div>
          </div>
        </div>
      </ha-card>
    `}set hass(t){this._hass=t,this._updateCard()}get hass(){return this._hass}_getLocalDateString(t=new Date){let e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0");return`${e}-${a}-${o}`}async _updateCard(){var o;let t=this.querySelector(".macro-percentages");if(!t||!this.hass)return;let e=this.profileEntityId;if(e||(e=Object.keys(this.hass.states).find(r=>r.startsWith("sensor.calorie_tracker_")&&this.hass.states[r])),!e){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[e]){console.error(`Entity not found: ${e}`);return}let a=this.hass.states[e];this._profile=a,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyMacroStyles(t);try{let r=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:e,date:this._selectedDate}),s=(o=r==null?void 0:r.macros)!=null?o:{},n=Math.round(s.p||s.protein||0),c=Math.round(s.c||s.carbs||0),h=Math.round(s.f||s.fat||0),d=Math.round(s.a||s.alcohol||0),v=n*4,N=c*4,T=h*9,$=d*7,b=v+N+T+$;this._proteinGrams=n,this._carbsGrams=c,this._fatGrams=h,this._alcoholGrams=d,this._proteinCals=v,this._carbsCals=N,this._fatCals=T,this._alcoholCals=$,this._totalCals=b,this._renderPieChart()}catch(r){console.error("Failed to fetch macro data:",r)}this._eventsAttached||(t.addEventListener("select-summary-date",r=>{this.selectedDate=r.detail.date,this._updateCard()}),t.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyMacroStyles(t){if(!t)return;let e=t.querySelector(".pie-svg");e&&(e.style.width="150px",e.style.height="150px")}};customElements.get("macro-percentages-card")||customElements.define("macro-percentages-card",lt);lt.prototype._renderPieChart=function(){let I=this.querySelector(".pie-svg");if(!I)return;let t=this._proteinCals||0,e=this._carbsCals||0,a=this._fatCals||0,o=this._alcoholCals||0,r=this._totalCals||1,s=this._proteinGrams||0,n=this._carbsGrams||0,c=this._fatGrams||0,h=this._alcoholGrams||0,d=r>0?Math.round(t/r*100):0,v=r>0?Math.round(e/r*100):0,N=r>0?Math.round(a/r*100):0,T=r>0?Math.round(o/r*100):0,$=this.querySelector(".protein-text"),b=this.querySelector(".carbs-text"),y=this.querySelector(".fat-text"),M=this.querySelector(".alcohol-text");$&&($.textContent=`Protein: ${s}g (${d}%)`),b&&(b.textContent=`Carbs: ${n}g (${v}%)`),y&&(y.textContent=`Fat: ${c}g (${N}%)`),M&&(M.textContent=`Alcohol: ${h}g (${T}%)`);let k=100,p=100,u=70,L={protein:"#4CAF50",carbs:"#2196F3",fat:"#FF9800",alcohol:"#9C27B0"},C=-90,S=[];if(r>0){if(t>0){let i=t/r*360;S.push({startAngle:C,endAngle:C+i,color:L.protein,label:"Protein"}),C+=i}if(e>0){let i=e/r*360;S.push({startAngle:C,endAngle:C+i,color:L.carbs,label:"Carbs"}),C+=i}if(a>0){let i=a/r*360;S.push({startAngle:C,endAngle:C+i,color:L.fat,label:"Fat"}),C+=i}if(o>0){let i=o/r*360;S.push({startAngle:C,endAngle:C+i,color:L.alcohol,label:"Alcohol"})}}let m=i=>i*Math.PI/180,g=(i,f)=>{let _=m(i),x=m(f),P=k+u*Math.cos(_),H=p+u*Math.sin(_),F=k+u*Math.cos(x),q=p+u*Math.sin(x),O=Math.abs(f-i)>180?1:0;return`M ${k} ${p} L ${P} ${H} A ${u} ${u} 0 ${O} 1 ${F} ${q} Z`},w='<svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">';r===0||S.length===0?w+=`
      <circle cx="${k}" cy="${p}" r="${u}"
              fill="none" stroke="#eee" stroke-width="2"/>
      <text x="${k}" y="${p}" text-anchor="middle"
            font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
            font-size="14" fill="var(--secondary-text-color, #666)">No Data</text>
    `:S.forEach(i=>{w+=`
        <path d="${g(i.startAngle,i.endAngle)}"
              fill="${i.color}"
              stroke="#fff"
              stroke-width="1"/>
      `}),w+="</svg>",I.innerHTML=w}});var St=Y(()=>{var mt=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._range="1m",this._weightData=[],this._lastGoalStartDate=null,this._resizeObserver=null,this.ranges=[{label:"Last 2 weeks",value:"2w"},{label:"Last month",value:"1m"},{label:"Last 2 months",value:"2m"},{label:"Last 4 months",value:"4m"},{label:"Last 6 months",value:"6m"},{label:"Last year",value:"1y"},{label:"Since last goal",value:"goal"},{label:"All",value:"all"}]}setConfig(t){this.config=t||{},this.profileEntityId=t.profile_entity_id||null,this.title=typeof t.title=="string"?t.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="weight-progress-wrapper" style="padding:16px;">
          <div class="weight-controls" style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;">
            <select class="weight-range-select" style="padding:4px 8px;">
              ${this.ranges.map(e=>`<option value='${e.value}'>${e.label}</option>`).join("")}
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
    `,this._syncLastGoalRangeAvailability()}set hass(t){this._hass=t,this._updateCard()}get hass(){return this._hass}async _updateCard(){let t=this.querySelector(".weight-chart");if(!t||!this._hass)return;let e=this.profileEntityId;if(e||(e=Object.keys(this._hass.states).find(a=>a.startsWith("sensor.calorie_tracker_")&&this._hass.states[a])),!e){t.innerHTML="<div>No calorie tracker profile entity found</div>";return}try{let a=this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_weight_history",entity_id:e}),o=this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:e}).catch(()=>null),[r,s]=await Promise.all([a,o]);this._weightData=r.weight_history||[],this._lastGoalStartDate=this._extractLastGoalStartDate(s&&Array.isArray(s.goals)?s.goals:null),this._syncLastGoalRangeAvailability(),this._renderChart()}catch(a){this._lastGoalStartDate=null,this._syncLastGoalRangeAvailability(),t.innerHTML="<div>Failed to fetch weight data</div>"}if(!this._eventsAttached){let a=this.querySelector(".weight-range-select");a&&(a.value=this._range,a.addEventListener("change",r=>{if(this._range=r.target.value,this._range==="goal"&&!this._lastGoalStartDate){this._range="1m",a.value=this._range;return}this._renderChart()}));let o=this.querySelector(".weight-chart");o&&window.ResizeObserver&&(this._resizeObserver=new ResizeObserver(()=>{this._renderChart()}),this._resizeObserver.observe(o)),this._eventsAttached=!0}}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null)}_filterDataByRange(t,e){if(!t||!Array.isArray(t)||t.length===0)return[];if(e==="all")return t;if(e==="goal"){if(!this._lastGoalStartDate)return[];let r=this._lastGoalStartDate;return t.filter(s=>!s||typeof s.date!="string"?!1:s.date.slice(0,10)>=r)}let a=new Date,o;switch(e){case"2w":o=new Date(a),o.setDate(a.getDate()-13);break;case"1m":o=new Date(a),o.setMonth(a.getMonth()-1);break;case"2m":o=new Date(a),o.setMonth(a.getMonth()-2);break;case"4m":o=new Date(a),o.setMonth(a.getMonth()-4);break;case"6m":o=new Date(a),o.setMonth(a.getMonth()-6);break;case"1y":o=new Date(a),o.setFullYear(a.getFullYear()-1);break;default:return t}return t.filter(r=>new Date(r.date)>=o)}_renderChart(){let t=this.querySelector(".weight-chart"),e=this.querySelector(".legend-items");t&&requestAnimationFrame(()=>{this._doRenderChart(t,e)})}_doRenderChart(t,e){if(!t)return;let a=this._filterDataByRange(this._weightData,this._range);if(!a.length||a.length<2){let l="No weight data available for this range.";this._range==="goal"&&(l=this._lastGoalStartDate?"Need more weight entries since your last goal to display progress.":"Set a goal to track progress from your most recent goal start date."),t.innerHTML=`<div>${l}</div>`,e&&(e.innerHTML="");return}let o=this.profileEntityId||this._hass&&Object.keys(this._hass.states).find(l=>l.startsWith("sensor.calorie_tracker_")),r=null,s=null,n="kg";if(o&&this._hass&&this._hass.states[o]){let l=this._hass.states[o].attributes||{},A=D=>{if(D==null)return null;let E=Number(D);return Number.isFinite(E)?E:null};r=A(l.starting_weight),s=A(l.goal_weight),n=l.weight_unit||"kg"}let c=400,h=260,d=40,v=a.map(l=>new Date(l.date)),N=a.map(l=>l.weight),T=Math.min(...N),$=Math.max(...N),b=v[0],y=v[v.length-1],M=1440*60*1e3,k=Math.max((y-b)/M,1),p=(()=>{if(v.length<2)return null;let l=v.map(z=>(z.getTime()-b.getTime())/M),A=N,D=l.length,E=0,R=0,Z=0,Q=0;for(let z=0;z<D;z++){let J=l[z],at=A[z];E+=J,R+=at,Z+=J*at,Q+=J*J}let U=D*Q-E*E;if(Math.abs(U)<1e-9)return null;let X=(D*Z-E*R)/U,st=(R-X*E)/D,ct=R/D,K=0,tt=0;for(let z=0;z<D;z++){let J=st+X*l[z],at=A[z];K+=(at-ct)**2,tt+=(at-J)**2}let ht=K>0?1-tt/K:1;return{slope:X,intercept:st,weightAt:z=>{let J=(z.getTime()-b.getTime())/M;return st+X*J},rSquared:ht}})(),u=0,L=y,C=null,S=!1;if(p){let l=p.slope,A=k,D=p.weightAt(y),E=A;if(s!==null&&Math.abs(l)>1e-6){let R=(s-D)/l;R>=0&&(S=!0,C=R,E=Math.min(E,R))}Math.abs(l)>1e-6&&(u=Math.max(0,E),u>0&&(L=new Date(y.getTime()+u*M)))}let m=u>0?L:y,g=b.getTime(),w=m.getTime(),i=l=>d+(l.getTime()-g)/Math.max(w-g,1)*(c-2*d),f=T,_=$;if(s!==null&&(f=Math.min(f,s),_=Math.max(_,s)),p&&u>0){let l=p.weightAt(L);f=Math.min(f,l),_=Math.max(_,l)}let x=_-f||1,P=.15,H=f-x*P,F=_+x*P,q=r!==null&&r>=H&&r<=F,O=s!==null&&s>=H&&s<=F;if(e){let l="";if(r!==null){let A=q?"":r>F?" \u2191":" \u2193";l+=`<div style="display:flex;align-items:center;"><div style="width:12px;height:2px;background:#ff9800;margin-right:4px;border-style:dashed;border-width:1px 0;border-color:#ff9800;"></div><span style="font-size:12px;">Start: ${r}${A}</span></div>`}if(s!==null){let A=O?"":s>F?" \u2191":" \u2193";l+=`<div style="display:flex;align-items:center;"><div style="width:12px;height:2px;background:#8bc34a;margin-right:4px;border-style:dashed;border-width:1px 0;border-color:#8bc34a;"></div><span style="font-size:12px;">Goal: ${s}${A}</span></div>`}e.innerHTML=l}let G=this.querySelector(".weight-prediction");if(G)if(!p)G.style.display="none";else{let l=p.slope*7,A=l>=0?`+${l.toFixed(2)}`:l.toFixed(2),D=p.rSquared>.8?"high":p.rSquared>.5?"medium":"low",R=`<strong>Trend:</strong> ${A} ${n}/week <span style="color:${D==="high"?"var(--success-color, #4caf50)":D==="medium"?"var(--warning-color, #ff9800)":"var(--error-color, #f44336)"};font-weight:bold;">(${D} confidence)</span>`;if(s===null)R+="<br/><em>Set a goal weight to see a predicted goal date.</em>";else if(Math.abs(p.slope)<1e-6)R+="<br/><em>Trend is flat, unable to project goal date.</em>";else if(!S)R+="<br/><em>Trend is moving away from the goal weight.</em>";else if(C!==null&&Number.isFinite(C)){let Z=new Date(y.getTime()+C*M),U=Math.round((Z-new Date)/M),X=Z.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});R+=`<br/><strong>Goal projection:</strong> ${X} (${U} days)`}else R+="<br/><em>Unable to calculate goal projection.</em>";G.innerHTML=R,G.style.display="block"}let j=l=>h-d-(l-H)/(F-H)*(h-2*d),V=a.map(l=>[i(new Date(l.date)),j(l.weight)]),W=`<svg viewBox='0 0 ${c} ${h}' preserveAspectRatio='xMidYMid meet' style='width:100%;height:auto;'>`,pt=l=>{let A=l.getDate().toString().padStart(2,"0"),E=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][l.getMonth()];return`${A} ${E}`};for(let l=0;l<5;l++){let A=l/4,D=g+A*(w-g),E=new Date(D),R=i(E);W+=`<line x1='${R}' y1='${d}' x2='${R}' y2='${h-d}' stroke='#d0d0d0' stroke-width='0.5' stroke-dasharray='3,3' />`,W+=`<text x='${R}' y='${h-d+18}' font-size='11' fill='#888' text-anchor='middle'>${pt(E)}</text>`}for(let l=0;l<5;l++){let A=l/4,D=H+A*(F-H),E=j(D);W+=`<line x1='${d}' y1='${E}' x2='${c-d}' y2='${E}' stroke='#d0d0d0' stroke-width='0.5' stroke-dasharray='3,3' />`,W+=`<text x='${d-12}' y='${E+4}' font-size='11' fill='#888' text-anchor='end'>${D.toFixed(1)}</text>`}if(W+=`<polyline fill='none' stroke='#03a9f4' stroke-width='2' points='${V.map(l=>l.join(",")).join(" ")}' />`,p){let l=b,A=y,D=i(l),E=j(p.weightAt(l)),R=i(A),Z=j(p.weightAt(A));if(W+=`<line x1='${D}' y1='${E}' x2='${R}' y2='${Z}' stroke='#9c27b0' stroke-width='2' opacity='0.9' />`,u>0){let Q=y,U=p.weightAt(Q),X=p.weightAt(L),st=i(Q),ct=j(U),K=i(L),tt=j(X);W+=`<line x1='${st}' y1='${ct}' x2='${K}' y2='${tt}' stroke='#9c27b0' stroke-width='1.75' stroke-dasharray='8,6' opacity='0.6' />`,W+=`<circle cx='${K}' cy='${tt}' r='3.5' fill='#9c27b0' opacity='0.6' />`;let ht=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dt=L,z=`${dt.getDate()} ${ht[dt.getMonth()]}`;W+=`<text x='${K}' y='${tt-12}' font-size='10' fill='#9c27b0' text-anchor='middle' opacity='0.7'>${z}</text>`}}if(V.forEach((l,A)=>{W+=`<circle class='weight-point' data-index='${A}' cx='${l[0]}' cy='${l[1]}' r='4' fill='#03a9f4' stroke='#fff' stroke-width='1.5' style='cursor:pointer;' />`}),q){let l=j(r);W+=`<line x1='${d}' y1='${l}' x2='${c-d}' y2='${l}' stroke='#ff9800' stroke-dasharray='4,2' stroke-width='1.5' />`}if(O){let l=j(s);W+=`<line x1='${d}' y1='${l}' x2='${c-d}' y2='${l}' stroke='#8bc34a' stroke-dasharray='4,2' stroke-width='1.5' />`}if(r!==null&&!q){let l=r>F,A=l?d+5:h-d-5,D=l?"\u2191":"\u2193";W+=`<text x='${c-d-40}' y='${A}' font-size='12' fill='#ff9800' text-anchor='start'>Start ${D}</text>`}if(s!==null&&!O){let l=s>F,A=l?d+5:h-d-5,D=l?"\u2191":"\u2193",E=r!==null&&!q&&s>F==r>F?80:40;W+=`<text x='${c-d-E}' y='${A}' font-size='12' fill='#8bc34a' text-anchor='start'>Goal ${D}</text>`}W+="</svg>",t.innerHTML=`<div style="position:relative;width:100%;">${W}<div class="weight-tooltip" style="position:absolute;display:none;background:rgba(0,0,0,0.8);color:white;padding:8px 12px;border-radius:4px;font-size:12px;pointer-events:none;z-index:1000;white-space:nowrap;"></div></div>`;let et=t.querySelector(".weight-tooltip");t.querySelectorAll(".weight-point").forEach(l=>{l.addEventListener("mouseenter",A=>{let D=parseInt(A.target.getAttribute("data-index")),E=a[D],R=new Date(E.date);et.innerHTML=`<div><strong>${pt(R)}</strong></div><div>${E.weight} ${n}</div>`,et.style.display="block"}),l.addEventListener("mousemove",A=>{let D=t.getBoundingClientRect();et.style.left=A.clientX-D.left+10+"px",et.style.top=A.clientY-D.top-10+"px"}),l.addEventListener("mouseleave",()=>{et.style.display="none"})})}_extractLastGoalStartDate(t){if(!Array.isArray(t)||t.length===0)return null;let e=t.map(a=>{if(!a||typeof a.start_date!="string")return null;let o=a.start_date.trim();return o?o.slice(0,10):null}).filter(Boolean);return e.length?e.reduce((a,o)=>a&&a>o?a:o,null):null}_syncLastGoalRangeAvailability(){let t=this.querySelector(".weight-range-select");if(!t)return;let e=[...t.options].find(o=>o.value==="goal");if(!e)return;let a=!!this._lastGoalStartDate;if(e.disabled=!a,e.hidden=!a,a){let o=new Date(this._lastGoalStartDate);if(Number.isNaN(o.getTime()))e.textContent="Since last goal";else{let r=o.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});e.textContent=`Since last goal (${r})`}}else e.textContent="Since last goal",this._range==="goal"&&(this._range="1m",t.value=this._range)}};customElements.get("weight-progress-card")||customElements.define("weight-progress-card",mt)});var At=Y(()=>{var Xt=B(_t()),Jt=B(xt()),Zt=B(bt()),Kt=B(vt()),Qt=B(wt()),Ut=B($t()),te=B(Mt()),ee=B(kt()),se=B(St())});export default At();
//# sourceMappingURL=cards.js.map
