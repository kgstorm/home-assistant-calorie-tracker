import{a as W,e as B,f as V}from"./chunks/chunk-5HHMTMB7.js";var Se=B(()=>{var ce=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._summaryLoaded=!1,this._styleObserver=null}async _ensureSummaryLoaded(){if(!this._summaryLoaded&&!customElements.get("calorie-summary"))try{await import("./chunks/summary-QF4JDFJX.js"),this._summaryLoaded=!0}catch(e){console.error("Failed to load summary component:",e)}}setConfig(e){this.config=e,this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <calorie-summary></calorie-summary>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${r}`}async _updateCard(){var r,a;await this._ensureSummaryLoaded(),await customElements.whenDefined("calorie-summary");let e=this.querySelector("calorie-summary");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(i=>i.startsWith("sensor.calorie_tracker_profile"))),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];e.hass=this.hass,e.profile=s,e.selectedDate=this.selectedDate||this._getLocalDateString(),this._applyWrapperStyles(e),!this._styleObserver&&e.renderRoot&&(this._styleObserver=new MutationObserver(()=>{this._applyWrapperStyles(e)}),this._styleObserver.observe(e.renderRoot,{childList:!0,subtree:!0}));try{let[i,n]=await Promise.all([this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_weekly_summary",entity_id:t,date:e.selectedDate}),this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:e.selectedDate})]);e.weeklySummary=(r=i==null?void 0:i.weekly_summary)!=null?r:{},e.weight=(a=n==null?void 0:n.weight)!=null?a:null}catch(i){console.error("Failed to fetch calorie data:",i)}this._eventsAttached||(e.addEventListener("select-summary-date",i=>{this.selectedDate=i.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyWrapperStyles(e){if(!(e!=null&&e.renderRoot))return;let t=e.renderRoot.querySelector(".gauge-container");if(t){t.style.width="120px",t.style.height="120px",t.style.maxWidth="120px";let s=t.querySelector("svg");s&&(s.style.maxWidth="120px",s.style.maxHeight="120px")}}disconnectedCallback(){this._styleObserver&&(this._styleObserver.disconnect(),this._styleObserver=null)}};customElements.get("calorie-summary-card")||customElements.define("calorie-summary-card",ce);window.customCards=window.customCards||[];window.customCards.push({type:"calorie-summary-card",name:"Calorie Tracker: Summary",description:"Full weekly summary card for the Calorie Tracker integration",editor:"calorie-summary-editor",preview:!0});var me=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelector("paper-input"),t=this.querySelector("ha-entity-picker"),s=this.querySelector(".error"),r=()=>{let a=W({},this._config);e&&e.value?a.title=e.value.trim():delete a.title,t&&t.value?a.profile_entity_id=t.value:delete a.profile_entity_id,a.profile_entity_id?s&&(s.style.display="none"):s&&(s.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:a}}))};e&&e.addEventListener("value-changed",r),t&&t.addEventListener("value-changed",r)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("calorie-summary-editor")||customElements.define("calorie-summary-editor",me);ce.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}}]}};ce.getStubConfig=function(){return{profile_entity_id:""}}});var Ee=B(()=>{var he=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._dailyDataLoaded=!1}async _ensureDailyDataLoaded(){if(!this._dailyDataLoaded&&!customElements.get("daily-data-card"))try{await import("./chunks/daily-data-4NRDCBGM.js"),this._dailyDataLoaded=!0}catch(e){console.error("Failed to load daily-data component:",e)}}setConfig(e){this.config=e,this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <daily-data-card></daily-data-card>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${r}`}async _updateCard(){var r,a,i,n;await this._ensureDailyDataLoaded(),await customElements.whenDefined("daily-data-card");let e=this.querySelector("daily-data-card");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(l=>l.startsWith("sensor.calorie_tracker_")&&l.includes("_profile")&&this.hass.states[l])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];e.hass=this.hass,e.profile=s,e.selectedDate=this.selectedDate||this._getLocalDateString();try{let l=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:e.selectedDate});e.log={food_entries:(l==null?void 0:l.food_entries)||[],exercise_entries:(l==null?void 0:l.exercise_entries)||[],weight:(r=l==null?void 0:l.weight)!=null?r:null,body_fat_pct:(a=l==null?void 0:l.body_fat_pct)!=null?a:null,bmr_and_neat:(i=l==null?void 0:l.bmr_and_neat)!=null?i:null,macros:(l==null?void 0:l.macros)||null,config_entry_id:(n=l==null?void 0:l.config_entry_id)!=null?n:null}}catch(l){console.error("Failed to fetch daily data:",l),e.log={food_entries:[],exercise_entries:[],weight:null,body_fat_pct:null,bmr_and_neat:null}}this._eventsAttached||(e.addEventListener("select-daily-date",l=>{this.selectedDate=l.detail.date,this._updateCard()}),e.addEventListener("refresh-daily-data",()=>{this._updateCard()}),e.addEventListener("add-daily-entry",async l=>{try{await this.hass.connection.sendMessagePromise(W({type:"calorie_tracker/add_entry",entity_id:t},l.detail)),this._updateCard()}catch(h){console.error("Failed to add entry:",h)}}),e.addEventListener("edit-daily-entry",async l=>{try{await this.hass.connection.sendMessagePromise(W({type:"calorie_tracker/update_entry",entity_id:t},l.detail)),this._updateCard()}catch(h){console.error("Failed to edit entry:",h)}}),e.addEventListener("delete-daily-entry",async l=>{try{await this.hass.connection.sendMessagePromise(W({type:"calorie_tracker/delete_entry",entity_id:t},l.detail)),this._updateCard()}catch(h){console.error("Failed to delete entry:",h)}}),this._eventsAttached=!0)}};customElements.get("calorie-daily-log-card")||customElements.define("calorie-daily-log-card",he);window.customCards=window.customCards||[];window.customCards.push({type:"calorie-daily-log-card",name:"Calorie Tracker: Daily Log",description:"Daily food/exercise log UI for the Calorie Tracker integration",editor:"calorie-daily-log-editor",preview:!0});var _e=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelector("paper-input"),t=this.querySelector("ha-entity-picker"),s=this.querySelector(".error"),r=()=>{let a=W({},this._config);e&&e.value?a.title=e.value.trim():delete a.title,t&&t.value?a.profile_entity_id=t.value:delete a.profile_entity_id,a.profile_entity_id?s&&(s.style.display="none"):s&&(s.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:a}}))};e&&e.addEventListener("value-changed",r),t&&t.addEventListener("value-changed",r)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("calorie-daily-log-editor")||customElements.define("calorie-daily-log-editor",_e);he.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}}]}};he.getStubConfig=function(){return{profile_entity_id:""}}});var Le=B(()=>{var de=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._profileLoaded=!1}async _ensureProfileLoaded(){if(!this._profileLoaded&&!customElements.get("profile-card"))try{await import("./chunks/profile-card-K6XLSMCR.js"),this._profileLoaded=!0}catch(e){console.error("Failed to load profile component:",e)}}setConfig(e){this.config=e,this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header" id="ct-header">${this.title}</div>`:""}
        <profile-card></profile-card>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}async _updateCard(){var i,n,l,h,u,c,F,H,$;await this._ensureProfileLoaded(),await customElements.whenDefined("profile-card");let e=this.querySelector("profile-card");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(b=>b.startsWith("sensor.calorie_tracker_")&&b.includes("_profile")&&this.hass.states[b])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];e.hass=this.hass,e.profile=s;let r=s.attributes||{};e.goalType=(i=r.goal_type)!=null?i:"Not Set",e.dailyGoal=(n=r.daily_goal_calories)!=null?n:null,e.goalValue=(l=r.goal_value)!=null?l:null,e.currentWeight=(h=r.current_weight)!=null?h:null;let a=this.querySelector("#ct-header");if(a)if(this.title)a.textContent=this.title;else{let b=((u=s.attributes)==null?void 0:u.spoken_name)||t||"Calorie Tracker";a.textContent=`${b} Calorie Tracker Profile`}try{let[b,y]=await Promise.all([this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_user_profile",user_id:((c=this.hass.user)==null?void 0:c.id)||"unknown"}),this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_linked_components",entity_id:t})]);e.allProfiles=(F=b==null?void 0:b.all_profiles)!=null?F:[],e.defaultProfile=(H=b==null?void 0:b.default_profile)!=null?H:null,e.linkedDevices=($=y==null?void 0:y.linked_components)!=null?$:[]}catch(b){console.error("Failed to fetch profile data:",b);let y=Object.keys(this.hass.states).filter(M=>M.startsWith("sensor.calorie_tracker_profile")).map(M=>{var _;let k=this.hass.states[M];return{entity_id:M,spoken_name:((_=k.attributes)==null?void 0:_.spoken_name)||M}}).filter(M=>M);e.allProfiles=y,e.linkedDevices=[]}this._eventsAttached||(e.addEventListener("refresh-profile",()=>{this._updateCard()}),e.addEventListener("profile-selected",b=>{this.profileEntityId=b.detail.entityId,this._updateCard()}),e.addEventListener("profiles-updated",b=>{this._updateCard()}),this._eventsAttached=!0)}};customElements.get("calorie-profile-card")||customElements.define("calorie-profile-card",de);window.customCards=window.customCards||[];window.customCards.push({type:"calorie-profile-card",name:"Calorie Tracker: Profile",description:"Profile card for Calorie Tracker (shows user profile and settings)",editor:"calorie-profile-editor",preview:!0});var xe=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelector("paper-input"),t=this.querySelector("ha-entity-picker"),s=this.querySelector(".error"),r=()=>{let a=W({},this._config);e&&e.value?a.title=e.value.trim():delete a.title,t&&t.value?a.profile_entity_id=t.value:delete a.profile_entity_id,a.profile_entity_id?s&&(s.style.display="none"):s&&(s.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:a}}))};e&&e.addEventListener("value-changed",r),t&&t.addEventListener("value-changed",r)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("calorie-profile-editor")||customElements.define("calorie-profile-editor",xe);de.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}}]}};de.getStubConfig=function(){return{profile_entity_id:""}}});var Ae=B(()=>{var ue=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._summaryLoaded=!1,this._styleObserver=null}async _ensureSummaryLoaded(){if(!this._summaryLoaded&&!customElements.get("calorie-summary"))try{await import("./chunks/summary-QF4JDFJX.js"),this._summaryLoaded=!0}catch(e){console.error("Failed to load summary component:",e)}}setConfig(e){this.config=e,this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.maxHeight=e.max_height||"400px",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <calorie-summary></calorie-summary>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${r}`}async _updateCard(){var r,a;await this._ensureSummaryLoaded(),await customElements.whenDefined("calorie-summary");let e=this.querySelector("calorie-summary");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(i=>i.startsWith("sensor.calorie_tracker_")&&i.includes("_profile")&&this.hass.states[i])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];e.hass=this.hass,e.profile=s,e.selectedDate=this.selectedDate||this._getLocalDateString(),this._applyGaugeOnlyStyles(e),!this._styleObserver&&e.renderRoot&&(this._styleObserver=new MutationObserver(()=>{this._applyGaugeOnlyStyles(e)}),this._styleObserver.observe(e.renderRoot,{childList:!0,subtree:!0}));try{let[i,n]=await Promise.all([this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_weekly_summary",entity_id:t,date:e.selectedDate}),this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:e.selectedDate})]);e.weeklySummary=(r=i==null?void 0:i.weekly_summary)!=null?r:{},e.weight=(a=n==null?void 0:n.weight)!=null?a:null}catch(i){console.error("Failed to fetch calorie data:",i)}this._eventsAttached||(e.addEventListener("select-summary-date",i=>{this.selectedDate=i.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyGaugeOnlyStyles(e){if(!(e!=null&&e.renderRoot))return;let t=e.renderRoot.querySelector(".bar-graph-section");t&&(t.style.display="none");let s=e.renderRoot.querySelector(".gauge-labels");s&&(s.style.display="none");let r=e.renderRoot.querySelector(".summary-container");r&&(r.style.justifyContent="center",r.style.alignItems="center",r.style.height="100%",r.style.maxWidth="none");let a=e.renderRoot.querySelector(".gauge-section");a&&(a.style.width="100%",a.style.flex="1",a.style.maxWidth="none");let i=e.renderRoot.querySelector(".gauge-container");i&&(i.style.width="100%",i.style.height="auto",i.style.aspectRatio="1 / 1",i.style.maxWidth=this.maxHeight,i.style.maxHeight=this.maxHeight);let n=e.renderRoot.querySelector(".gauge-container svg");n&&(n.style.width="100%",n.style.height="100%",n.style.maxWidth="none",n.style.maxHeight="none"),e.style&&(e.style.height="100%",e.style.display="flex",e.style.alignItems="center",e.style.justifyContent="center")}disconnectedCallback(){this._styleObserver&&(this._styleObserver.disconnect(),this._styleObserver=null)}};customElements.get("calorie-gauge-card")||customElements.define("calorie-gauge-card",ue);window.customCards=window.customCards||[];window.customCards.push({type:"calorie-gauge-card",name:"Calorie Gauge",description:"A compact gauge-only view for the Calorie Tracker summary",editor:"calorie-gauge-editor",preview:!0});var ve=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <paper-input label="Max height (e.g. 400px)" value="${this._escape(this._config.max_height||"400px")}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelector("paper-input"),t=this.querySelector("ha-entity-picker"),s=this.querySelectorAll("paper-input")[1],r=this.querySelector(".error"),a=()=>{let i=W({},this._config);e&&e.value?i.title=e.value.trim():delete i.title,t&&t.value?i.profile_entity_id=t.value:delete i.profile_entity_id,s&&s.value?i.max_height=s.value.trim():delete i.max_height,i.profile_entity_id?r&&(r.style.display="none"):r&&(r.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i}}))};e&&e.addEventListener("value-changed",a),t&&t.addEventListener("value-changed",a),s&&s.addEventListener("value-changed",a)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("calorie-gauge-editor")||customElements.define("calorie-gauge-editor",ve);ue.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"max_height",selector:{text:{}}}]}};ue.getStubConfig=function(){return{profile_entity_id:"",max_height:"400px"}}});var De=B(()=>{var ie=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(e){this.config=e||{},this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.maxHeight=e.max_height||"400px",this.min=typeof e.min=="number"?e.min:null,this.max=typeof e.max=="number"?e.max:null,this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="protein-gauge-wrapper">
          <div class="protein-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="protein-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
          </div>
        </div>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${r}`}async _updateCard(){var r,a,i;let e=this.querySelector(".protein-gauge");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(n=>n.startsWith("sensor.calorie_tracker_")&&this.hass.states[n])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];this._profile=s,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyProteinStyles(e);try{let n=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:this._selectedDate}),l=(r=n==null?void 0:n.weight)!=null?r:null,h=(a=n==null?void 0:n.weight_unit)!=null?a:null,u=(i=n==null?void 0:n.macros)!=null?i:{},c=Math.round(u.p||u.protein||0),F=this._profile&&this._profile.attributes||{},H=Number(F.current_weight),$=F.weight_unit||h||"lbs",b=(m,g,w)=>Number.isFinite(m)?!g||!w||g===w?m:g==="kg"&&w==="lbs"?m*2.20462:g==="lbs"&&w==="kg"?m/2.20462:m:null,y=Number.isFinite(H)?H:null;!Number.isFinite(y)&&Number.isFinite(l)&&(y=b(Number(l),h||$,$));let M=Number.isFinite(y)?y:null,k=Number.isFinite(y)?$==="kg"?y*2.20462:y:null,_=m=>m==null?null:m<5&&M!==null?Math.round(m*M):m,p=_(this.min),L=_(this.max),A=k!=null?k:150,C=Math.ceil(A/10)*10;(!Number.isFinite(C)||C<=0)&&(C=150),L!==null&&(C=L),this._gaugeMax=C,this._gaugeMin=p!==null?p:0,this._proteinValue=c,this._proteinWeight=k||0,this._proteinMin=p,this._proteinMax=L,this._renderGauge()}catch(n){console.error("Failed to fetch protein data:",n)}this._eventsAttached||(e.addEventListener("select-summary-date",n=>{this.selectedDate=n.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyProteinStyles(e){if(!e)return;let t=e.querySelector(".protein-svg");t&&(t.style.width="100%",t.style.height="auto",t.style.maxWidth=this.maxHeight,t.style.maxHeight=this.maxHeight)}};customElements.get("protein-gauge-card")||customElements.define("protein-gauge-card",ie);window.customCards=window.customCards||[];window.customCards.push({type:"protein-gauge-card",name:"Calorie Tracker: Protein Gauge",description:"Displays a protein gauge for the Calorie Tracker integration",editor:"protein-gauge-editor",preview:!0});var be=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){var h,u;this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <paper-input label="Max height (e.g. 400px)" value="${this._escape(this._config.max_height||"400px")}"></paper-input>
        <paper-input label="Min (optional, grams or fraction)" value="${this._escape((h=this._config.min)!=null?h:"")}"></paper-input>
        <paper-input label="Max (optional, grams or fraction)" value="${this._escape((u=this._config.max)!=null?u:"")}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelectorAll("paper-input"),t=e[0],s=e[1],r=e[2],a=e[3],i=this.querySelector("ha-entity-picker"),n=this.querySelector(".error"),l=()=>{let c=W({},this._config);t&&t.value?c.title=t.value.trim():delete c.title,i&&i.value?c.profile_entity_id=i.value:delete c.profile_entity_id,s&&s.value?c.max_height=s.value.trim():delete c.max_height,r&&r.value?c.min=Number(r.value):delete c.min,a&&a.value?c.max=Number(a.value):delete c.max,c.profile_entity_id?n&&(n.style.display="none"):n&&(n.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:c}}))};e.forEach(c=>c.addEventListener("value-changed",l)),i&&i.addEventListener("value-changed",l)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("protein-gauge-editor")||customElements.define("protein-gauge-editor",be);ie.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"max_height",selector:{text:{}}},{name:"min",selector:{number:{}}},{name:"max",selector:{number:{}}}]}};ie.getStubConfig=function(){return{profile_entity_id:"",max_height:"400px"}};ie.prototype._renderGauge=function(){let D=this.querySelector(".protein-svg");if(!D)return;let e=Math.max(0,this._proteinValue||0),t=this._proteinMin,s=this._proteinMax,r=this._gaugeMax||100,a=s!==null?s*1.1:r*1.1,i={x:70,y:70},n=40,l=8,h=-180,u=0,c=u-h,F=Math.max(Math.min(e/a,1),0),H=h+F*c,$=o=>o*Math.PI/180,b=(o,f,x)=>{let v=$(o),I=$(f),P=i.x+x*Math.cos(v),T=i.y+x*Math.sin(v),O=i.x+x*Math.cos(I),G=i.y+x*Math.sin(I),z=Math.abs(f-o)>180?1:0;return`M ${P} ${T} A ${x} ${x} 0 ${z} 1 ${O} ${G}`},y=8,M=[5,10,25,50,100,200],k=M[0];for(let o of M)if(a/o<=y){k=o;break}let _=[];for(let o=0;o<=a;o+=k){let f=o/a,x=h+f*c,v=$(x),I=n+5,P=n+12,T=n+20,O=i.x+I*Math.cos(v),G=i.y+I*Math.sin(v),z=i.x+P*Math.cos(v),Y=i.y+P*Math.sin(v),X=i.x+T*Math.cos(v),R=i.y+T*Math.sin(v);_.push({line:`M ${O} ${G} L ${z} ${Y}`,label:{x:X,y:R,value:o}})}let p=[];if(t===null&&s===null)p.push({startAngle:h,endAngle:u,color:"#4caf50"});else if(t!==null&&s===null){let o=t/a,f=h+o*c;p.push({startAngle:h,endAngle:f,color:"#ffeb3b"}),p.push({startAngle:f,endAngle:u,color:"#4caf50"})}else if(t===null&&s!==null){let o=s/a,f=h+o*c;p.push({startAngle:h,endAngle:f,color:"#4caf50"}),p.push({startAngle:f,endAngle:u,color:"#f44336"})}else{let o=t/a,f=s/a,x=h+o*c,v=h+f*c;p.push({startAngle:h,endAngle:x,color:"#ffeb3b"}),p.push({startAngle:x,endAngle:v,color:"#4caf50"}),p.push({startAngle:v,endAngle:u,color:"#f44336"})}let L=$(H),A=n-5,C=i.x+A*Math.cos(L),m=i.y+A*Math.sin(L),g="#4caf50";t!==null&&s!==null?e<t?g="#ffeb3b":e>=t&&e<=s?g="#4caf50":g="#f44336":t!==null&&s===null?e<t?g="#ffeb3b":g="#4caf50":t===null&&s!==null&&(e<=s?g="#4caf50":g="#f44336");let w=`
    <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
      <!-- Background arc -->
      <path
        d="${b(h,u,n)}"
        fill="none"
        stroke="#eee"
        stroke-width="${l}"
        stroke-linecap="round"
      />
  `;p.forEach(o=>{w+=`
      <path
        d="${b(o.startAngle,o.endAngle,n)}"
        fill="none"
        stroke="${o.color}"
        stroke-width="${l}"
        stroke-linecap="round"
      />
    `}),_.forEach(o=>{w+=`
      <path
        d="${o.line}"
        stroke="var(--secondary-text-color, #666)"
        stroke-width="1"
      />
    `}),_.forEach(o=>{w+=`
      <text
        x="${o.label.x}"
        y="${o.label.y}"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="9"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        fill="var(--secondary-text-color, #666)"
      >
        ${o.label.value}
      </text>
    `}),w+=`
      <!-- Needle -->
      <line
        x1="${i.x}"
        y1="${i.y}"
        x2="${C}"
        y2="${m}"
        stroke="var(--primary-text-color, #333)"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Center dot -->
      <circle
        cx="${i.x}"
        cy="${i.y}"
        r="3"
        fill="var(--primary-text-color, #333)"
      />

      <!-- Current value label -->
      <text
        x="${i.x}"
        y="${i.y+n-5}"
        text-anchor="middle"
        font-size="12"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        font-weight="600"
        fill="${g}"
      >
        ${Math.round(e)} g Protein
      </text>

    </svg>
  `,D.innerHTML=w}});var qe=B(()=>{var se=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(e){this.config=e||{},this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.maxHeight=e.max_height||"400px",this.min=typeof e.min=="number"?e.min:null,this.max=typeof e.max=="number"?e.max:null,this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="fat-gauge-wrapper">
          <div class="fat-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="fat-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
          </div>
        </div>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${r}`}async _updateCard(){var r,a,i;let e=this.querySelector(".fat-gauge");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(n=>n.startsWith("sensor.calorie_tracker_")&&this.hass.states[n])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];this._profile=s,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyFatStyles(e);try{let n=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:this._selectedDate}),l=(r=n==null?void 0:n.weight)!=null?r:null,h=(a=n==null?void 0:n.weight_unit)!=null?a:null,u=(i=n==null?void 0:n.macros)!=null?i:{},c=Math.round(u.f||u.fat||0),F=this._profile&&this._profile.attributes||{},H=Number(F.current_weight),$=F.weight_unit||h||"lbs",b=(m,g,w)=>Number.isFinite(m)?!g||!w||g===w?m:g==="kg"&&w==="lbs"?m*2.20462:g==="lbs"&&w==="kg"?m/2.20462:m:null,y=Number.isFinite(H)?H:null;!Number.isFinite(y)&&Number.isFinite(l)&&(y=b(Number(l),h||$,$));let M=Number.isFinite(y)?y:null,k=Number.isFinite(y)?$==="kg"?y*2.20462:y:null,_=m=>m==null?null:m<5&&M!==null?Math.round(m*M):m,p=_(this.min),L=_(this.max),A=k!=null?k:150,C=Math.ceil(A*.36/10)*10;(!Number.isFinite(C)||C<=0)&&(C=80),L!==null&&(C=L),this._gaugeMax=C,this._gaugeMin=p!==null?p:0,this._fatValue=c,this._fatWeight=k||0,this._fatMin=p,this._fatMax=L,this._renderGauge()}catch(n){console.error("Failed to fetch fat data:",n)}this._eventsAttached||(e.addEventListener("select-summary-date",n=>{this.selectedDate=n.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyFatStyles(e){if(!e)return;let t=e.querySelector(".fat-svg");t&&(t.style.width="100%",t.style.height="auto",t.style.maxWidth=this.maxHeight,t.style.maxHeight=this.maxHeight)}};customElements.get("fat-gauge-card")||customElements.define("fat-gauge-card",se);window.customCards=window.customCards||[];window.customCards.push({type:"fat-gauge-card",name:"Calorie Tracker: Fat Gauge",description:"Displays a fat gauge for the Calorie Tracker integration",editor:"fat-gauge-editor",preview:!0});var we=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){var h,u;this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <paper-input label="Max height (e.g. 400px)" value="${this._escape(this._config.max_height||"400px")}"></paper-input>
        <paper-input label="Min (optional, grams or fraction)" value="${this._escape((h=this._config.min)!=null?h:"")}"></paper-input>
        <paper-input label="Max (optional, grams or fraction)" value="${this._escape((u=this._config.max)!=null?u:"")}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelectorAll("paper-input"),t=e[0],s=e[1],r=e[2],a=e[3],i=this.querySelector("ha-entity-picker"),n=this.querySelector(".error"),l=()=>{let c=W({},this._config);t&&t.value?c.title=t.value.trim():delete c.title,i&&i.value?c.profile_entity_id=i.value:delete c.profile_entity_id,s&&s.value?c.max_height=s.value.trim():delete c.max_height,r&&r.value?c.min=Number(r.value):delete c.min,a&&a.value?c.max=Number(a.value):delete c.max,c.profile_entity_id?n&&(n.style.display="none"):n&&(n.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:c}}))};e.forEach(c=>c.addEventListener("value-changed",l)),i&&i.addEventListener("value-changed",l)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("fat-gauge-editor")||customElements.define("fat-gauge-editor",we);se.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"max_height",selector:{text:{}}},{name:"min",selector:{number:{}}},{name:"max",selector:{number:{}}}]}};se.getStubConfig=function(){return{profile_entity_id:"",max_height:"400px"}};se.prototype._renderGauge=function(){let D=this.querySelector(".fat-svg");if(!D)return;let e=Math.max(0,this._fatValue||0),t=this._fatMin,s=this._fatMax,r=this._gaugeMax||100,a=s!==null?s*1.1:r*1.1,i={x:70,y:70},n=40,l=8,h=-180,u=0,c=u-h,F=Math.max(Math.min(e/a,1),0),H=h+F*c,$=o=>o*Math.PI/180,b=(o,f,x)=>{let v=$(o),I=$(f),P=i.x+x*Math.cos(v),T=i.y+x*Math.sin(v),O=i.x+x*Math.cos(I),G=i.y+x*Math.sin(I),z=Math.abs(f-o)>180?1:0;return`M ${P} ${T} A ${x} ${x} 0 ${z} 1 ${O} ${G}`},y=8,M=[5,10,25,50,100,200],k=M[0];for(let o of M)if(a/o<=y){k=o;break}let _=[];for(let o=0;o<=a;o+=k){let f=o/a,x=h+f*c,v=$(x),I=n+5,P=n+12,T=n+20,O=i.x+I*Math.cos(v),G=i.y+I*Math.sin(v),z=i.x+P*Math.cos(v),Y=i.y+P*Math.sin(v),X=i.x+T*Math.cos(v),R=i.y+T*Math.sin(v);_.push({line:`M ${O} ${G} L ${z} ${Y}`,label:{x:X,y:R,value:o}})}let p=[];if(t===null&&s===null)p.push({startAngle:h,endAngle:u,color:"#4caf50"});else if(t!==null&&s===null){let o=t/a,f=h+o*c;p.push({startAngle:h,endAngle:f,color:"#ffeb3b"}),p.push({startAngle:f,endAngle:u,color:"#4caf50"})}else if(t===null&&s!==null){let o=s/a,f=h+o*c;p.push({startAngle:h,endAngle:f,color:"#4caf50"}),p.push({startAngle:f,endAngle:u,color:"#f44336"})}else{let o=t/a,f=s/a,x=h+o*c,v=h+f*c;p.push({startAngle:h,endAngle:x,color:"#ffeb3b"}),p.push({startAngle:x,endAngle:v,color:"#4caf50"}),p.push({startAngle:v,endAngle:u,color:"#f44336"})}let L=$(H),A=n-5,C=i.x+A*Math.cos(L),m=i.y+A*Math.sin(L),g="#4caf50";t!==null&&s!==null?e<t?g="#ffeb3b":e>=t&&e<=s?g="#4caf50":g="#f44336":t!==null&&s===null?e<t?g="#ffeb3b":g="#4caf50":t===null&&s!==null&&(e<=s?g="#4caf50":g="#f44336");let w=`
    <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
      <!-- Background arc -->
      <path
        d="${b(h,u,n)}"
        fill="none"
        stroke="#eee"
        stroke-width="${l}"
        stroke-linecap="round"
      />
  `;p.forEach(o=>{w+=`
      <path
        d="${b(o.startAngle,o.endAngle,n)}"
        fill="none"
        stroke="${o.color}"
        stroke-width="${l}"
        stroke-linecap="round"
      />
    `}),_.forEach(o=>{w+=`
      <path
        d="${o.line}"
        stroke="var(--secondary-text-color, #666)"
        stroke-width="1"
      />
    `}),_.forEach(o=>{w+=`
      <text
        x="${o.label.x}"
        y="${o.label.y}"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="9"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        fill="var(--secondary-text-color, #666)"
      >
        ${o.label.value}
      </text>
    `}),w+=`
      <!-- Needle -->
      <line
        x1="${i.x}"
        y1="${i.y}"
        x2="${C}"
        y2="${m}"
        stroke="var(--primary-text-color, #333)"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Center dot -->
      <circle
        cx="${i.x}"
        cy="${i.y}"
        r="3"
        fill="var(--primary-text-color, #333)"
      />

      <!-- Current value label -->
      <text
        x="${i.x}"
        y="${i.y+n-5}"
        text-anchor="middle"
        font-size="12"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        font-weight="600"
        fill="${g}"
      >
        ${Math.round(e)} g Fat
      </text>

    </svg>
  `,D.innerHTML=w}});var Te=B(()=>{var ae=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(e){this.config=e||{},this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.maxHeight=e.max_height||"400px",this.min=typeof e.min=="number"?e.min:null,this.max=typeof e.max=="number"?e.max:null,this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="carbs-gauge-wrapper">
          <div class="carbs-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="carbs-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
          </div>
        </div>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${r}`}async _updateCard(){var r,a,i;let e=this.querySelector(".carbs-gauge");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(n=>n.startsWith("sensor.calorie_tracker_")&&this.hass.states[n])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];this._profile=s,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyCarbsStyles(e);try{let n=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:this._selectedDate}),l=(r=n==null?void 0:n.weight)!=null?r:null,h=(a=n==null?void 0:n.weight_unit)!=null?a:null,u=(i=n==null?void 0:n.macros)!=null?i:{},c=Math.round(u.c||u.carbs||0),F=this._profile&&this._profile.attributes||{},H=Number(F.current_weight),$=F.weight_unit||h||"lbs",b=(m,g,w)=>Number.isFinite(m)?!g||!w||g===w?m:g==="kg"&&w==="lbs"?m*2.20462:g==="lbs"&&w==="kg"?m/2.20462:m:null,y=Number.isFinite(H)?H:null;!Number.isFinite(y)&&Number.isFinite(l)&&(y=b(Number(l),h||$,$));let M=Number.isFinite(y)?y:null,k=Number.isFinite(y)?$==="kg"?y*2.20462:y:null,_=m=>m==null?null:m<5&&M!==null?Math.round(m*M):m,p=_(this.min),L=_(this.max),A=k!=null?k:150,C=Math.ceil(A*1.36/10)*10;(!Number.isFinite(C)||C<=0)&&(C=200),L!==null&&(C=L),this._gaugeMax=C,this._gaugeMin=p!==null?p:0,this._carbsValue=c,this._carbsWeight=k||0,this._carbsMin=p,this._carbsMax=L,this._renderGauge()}catch(n){console.error("Failed to fetch carbs data:",n)}this._eventsAttached||(e.addEventListener("select-summary-date",n=>{this.selectedDate=n.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyCarbsStyles(e){if(!e)return;let t=e.querySelector(".carbs-svg");t&&(t.style.width="100%",t.style.height="auto",t.style.maxWidth=this.maxHeight,t.style.maxHeight=this.maxHeight)}};customElements.get("carbs-gauge-card")||customElements.define("carbs-gauge-card",ae);window.customCards=window.customCards||[];window.customCards.push({type:"carbs-gauge-card",name:"Calorie Tracker: Carbs Gauge",description:"Displays a carbs gauge for the Calorie Tracker integration",editor:"carbs-gauge-editor",preview:!0});var $e=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){var h,u;this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <paper-input label="Max height (e.g. 400px)" value="${this._escape(this._config.max_height||"400px")}"></paper-input>
        <paper-input label="Min (optional, grams or fraction)" value="${this._escape((h=this._config.min)!=null?h:"")}"></paper-input>
        <paper-input label="Max (optional, grams or fraction)" value="${this._escape((u=this._config.max)!=null?u:"")}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelectorAll("paper-input"),t=e[0],s=e[1],r=e[2],a=e[3],i=this.querySelector("ha-entity-picker"),n=this.querySelector(".error"),l=()=>{let c=W({},this._config);t&&t.value?c.title=t.value.trim():delete c.title,i&&i.value?c.profile_entity_id=i.value:delete c.profile_entity_id,s&&s.value?c.max_height=s.value.trim():delete c.max_height,r&&r.value?c.min=Number(r.value):delete c.min,a&&a.value?c.max=Number(a.value):delete c.max,c.profile_entity_id?n&&(n.style.display="none"):n&&(n.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:c}}))};e.forEach(c=>c.addEventListener("value-changed",l)),i&&i.addEventListener("value-changed",l)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("carbs-gauge-editor")||customElements.define("carbs-gauge-editor",$e);ae.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"max_height",selector:{text:{}}},{name:"min",selector:{number:{}}},{name:"max",selector:{number:{}}}]}};ae.getStubConfig=function(){return{profile_entity_id:"",max_height:"400px"}};ae.prototype._renderGauge=function(){let D=this.querySelector(".carbs-svg");if(!D)return;let e=Math.max(0,this._carbsValue||0),t=this._carbsMin,s=this._carbsMax,r=this._gaugeMax||100,a=s!==null?s*1.1:r*1.1,i={x:70,y:70},n=40,l=8,h=-180,u=0,c=u-h,F=Math.max(Math.min(e/a,1),0),H=h+F*c,$=o=>o*Math.PI/180,b=(o,f,x)=>{let v=$(o),I=$(f),P=i.x+x*Math.cos(v),T=i.y+x*Math.sin(v),O=i.x+x*Math.cos(I),G=i.y+x*Math.sin(I),z=Math.abs(f-o)>180?1:0;return`M ${P} ${T} A ${x} ${x} 0 ${z} 1 ${O} ${G}`},y=8,M=[5,10,25,50,100,200],k=M[0];for(let o of M)if(a/o<=y){k=o;break}let _=[];for(let o=0;o<=a;o+=k){let f=o/a,x=h+f*c,v=$(x),I=n+5,P=n+12,T=n+20,O=i.x+I*Math.cos(v),G=i.y+I*Math.sin(v),z=i.x+P*Math.cos(v),Y=i.y+P*Math.sin(v),X=i.x+T*Math.cos(v),R=i.y+T*Math.sin(v);_.push({line:`M ${O} ${G} L ${z} ${Y}`,label:{x:X,y:R,value:o}})}let p=[];if(t===null&&s===null)p.push({startAngle:h,endAngle:u,color:"#4caf50"});else if(t!==null&&s===null){let o=t/a,f=h+o*c;p.push({startAngle:h,endAngle:f,color:"#ffeb3b"}),p.push({startAngle:f,endAngle:u,color:"#4caf50"})}else if(t===null&&s!==null){let o=s/a,f=h+o*c;p.push({startAngle:h,endAngle:f,color:"#4caf50"}),p.push({startAngle:f,endAngle:u,color:"#f44336"})}else{let o=t/a,f=s/a,x=h+o*c,v=h+f*c;p.push({startAngle:h,endAngle:x,color:"#ffeb3b"}),p.push({startAngle:x,endAngle:v,color:"#4caf50"}),p.push({startAngle:v,endAngle:u,color:"#f44336"})}let L=$(H),A=n-5,C=i.x+A*Math.cos(L),m=i.y+A*Math.sin(L),g="#4caf50";t!==null&&s!==null?e<t?g="#ffeb3b":e>=t&&e<=s?g="#4caf50":g="#f44336":t!==null&&s===null?e<t?g="#ffeb3b":g="#4caf50":t===null&&s!==null&&(e<=s?g="#4caf50":g="#f44336");let w=`
    <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
      <!-- Background arc -->
      <path
        d="${b(h,u,n)}"
        fill="none"
        stroke="#eee"
        stroke-width="${l}"
        stroke-linecap="round"
      />
  `;p.forEach(o=>{w+=`
      <path
        d="${b(o.startAngle,o.endAngle,n)}"
        fill="none"
        stroke="${o.color}"
        stroke-width="${l}"
        stroke-linecap="round"
      />
    `}),_.forEach(o=>{w+=`
      <path
        d="${o.line}"
        stroke="var(--secondary-text-color, #666)"
        stroke-width="1"
      />
    `}),_.forEach(o=>{w+=`
      <text
        x="${o.label.x}"
        y="${o.label.y}"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="9"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        fill="var(--secondary-text-color, #666)"
      >
        ${o.label.value}
      </text>
    `}),w+=`
      <!-- Needle -->
      <line
        x1="${i.x}"
        y1="${i.y}"
        x2="${C}"
        y2="${m}"
        stroke="var(--primary-text-color, #333)"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Center dot -->
      <circle
        cx="${i.x}"
        cy="${i.y}"
        r="3"
        fill="var(--primary-text-color, #333)"
      />

      <!-- Current value label -->
      <text
        x="${i.x}"
        y="${i.y+n-5}"
        text-anchor="middle"
        font-size="12"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        font-weight="600"
        fill="${g}"
      >
        ${Math.round(e)} g Carbs
      </text>

    </svg>
  `,D.innerHTML=w}});var Fe=B(()=>{var re=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(e){this.config=e||{},this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"Percent of Total Calories",this.maxHeight=e.max_height||"400px",this.innerHTML=`
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
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${r}`}async _updateCard(){var r;let e=this.querySelector(".macro-percentages");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(a=>a.startsWith("sensor.calorie_tracker_")&&this.hass.states[a])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];this._profile=s,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyMacroStyles(e);try{let a=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:this._selectedDate}),i=(r=a==null?void 0:a.macros)!=null?r:{},n=Math.round(i.p||i.protein||0),l=Math.round(i.c||i.carbs||0),h=Math.round(i.f||i.fat||0),u=Math.round(i.a||i.alcohol||0),c=n*4,F=l*4,H=h*9,$=u*7,b=c+F+H+$;this._proteinGrams=n,this._carbsGrams=l,this._fatGrams=h,this._alcoholGrams=u,this._proteinCals=c,this._carbsCals=F,this._fatCals=H,this._alcoholCals=$,this._totalCals=b,this._renderPieChart()}catch(a){console.error("Failed to fetch macro data:",a)}this._eventsAttached||(e.addEventListener("select-summary-date",a=>{this.selectedDate=a.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyMacroStyles(e){if(!e)return;let t=e.querySelector(".pie-svg");t&&(t.style.width="150px",t.style.height="150px")}};customElements.get("macro-percentages-card")||customElements.define("macro-percentages-card",re);window.customCards=window.customCards||[];window.customCards.push({type:"macro-percentages-card",name:"Macro Pie Chart",description:"Shows macro percentage breakdown (protein/carbs/fat) for Calorie Tracker",editor:"macro-percentages-editor",preview:!0});var Me=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"Percent of Total Calories")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <paper-input label="Max height (optional)" value="${this._escape(this._config.max_height||"400px")}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelector("paper-input"),t=this.querySelector("ha-entity-picker"),s=this.querySelectorAll("paper-input")[1],r=this.querySelector(".error"),a=()=>{let i=W({},this._config);e&&e.value?i.title=e.value.trim():delete i.title,t&&t.value?i.profile_entity_id=t.value:delete i.profile_entity_id,s&&s.value?i.max_height=s.value.trim():delete i.max_height,i.profile_entity_id?r&&(r.style.display="none"):r&&(r.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i}}))};e&&e.addEventListener("value-changed",a),t&&t.addEventListener("value-changed",a),s&&s.addEventListener("value-changed",a)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("macro-percentages-editor")||customElements.define("macro-percentages-editor",Me);re.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"max_height",selector:{text:{}}}]}};re.getStubConfig=function(){return{profile_entity_id:"",max_height:"400px"}};re.prototype._renderPieChart=function(){let D=this.querySelector(".pie-svg");if(!D)return;let e=this._proteinCals||0,t=this._carbsCals||0,s=this._fatCals||0,r=this._alcoholCals||0,a=this._totalCals||1,i=this._proteinGrams||0,n=this._carbsGrams||0,l=this._fatGrams||0,h=this._alcoholGrams||0,u=a>0?Math.round(e/a*100):0,c=a>0?Math.round(t/a*100):0,F=a>0?Math.round(s/a*100):0,H=a>0?Math.round(r/a*100):0,$=this.querySelector(".protein-text"),b=this.querySelector(".carbs-text"),y=this.querySelector(".fat-text"),M=this.querySelector(".alcohol-text");$&&($.textContent=`Protein: ${i}g (${u}%)`),b&&(b.textContent=`Carbs: ${n}g (${c}%)`),y&&(y.textContent=`Fat: ${l}g (${F}%)`),M&&(M.textContent=`Alcohol: ${h}g (${H}%)`);let k=100,_=100,p=70,L={protein:"#4CAF50",carbs:"#2196F3",fat:"#FF9800",alcohol:"#9C27B0"},A=-90,C=[];if(a>0){if(e>0){let o=e/a*360;C.push({startAngle:A,endAngle:A+o,color:L.protein,label:"Protein"}),A+=o}if(t>0){let o=t/a*360;C.push({startAngle:A,endAngle:A+o,color:L.carbs,label:"Carbs"}),A+=o}if(s>0){let o=s/a*360;C.push({startAngle:A,endAngle:A+o,color:L.fat,label:"Fat"}),A+=o}if(r>0){let o=r/a*360;C.push({startAngle:A,endAngle:A+o,color:L.alcohol,label:"Alcohol"})}}let m=o=>o*Math.PI/180,g=(o,f)=>{let x=m(o),v=m(f),I=k+p*Math.cos(x),P=_+p*Math.sin(x),T=k+p*Math.cos(v),O=_+p*Math.sin(v),G=Math.abs(f-o)>180?1:0;return`M ${k} ${_} L ${I} ${P} A ${p} ${p} 0 ${G} 1 ${T} ${O} Z`},w='<svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">';a===0||C.length===0?w+=`
      <circle cx="${k}" cy="${_}" r="${p}"
              fill="none" stroke="#eee" stroke-width="2"/>
      <text x="${k}" y="${_}" text-anchor="middle"
            font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
            font-size="14" fill="var(--secondary-text-color, #666)">No Data</text>
    `:C.forEach(o=>{w+=`
        <path d="${g(o.startAngle,o.endAngle)}"
              fill="${o.color}"
              stroke="#fff"
              stroke-width="1"/>
      `}),w+="</svg>",D.innerHTML=w}});var He=B(()=>{var pe=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._range="1m",this._weightData=[],this._lastGoalStartDate=null,this._resizeObserver=null,this.ranges=[{label:"Last 2 weeks",value:"2w"},{label:"Last month",value:"1m"},{label:"Last 2 months",value:"2m"},{label:"Last 4 months",value:"4m"},{label:"Last 6 months",value:"6m"},{label:"Last year",value:"1y"},{label:"Since last goal",value:"goal"},{label:"All",value:"all"}]}setConfig(e){this.config=e||{},this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="weight-progress-wrapper" style="padding:16px;">
          <div class="weight-controls" style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;">
            <select class="weight-range-select" style="padding:4px 8px;">
              ${this.ranges.map(t=>`<option value='${t.value}'>${t.label}</option>`).join("")}
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
    `,this._syncLastGoalRangeAvailability()}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}async _updateCard(){let e=this.querySelector(".weight-chart");if(!e||!this._hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this._hass.states).find(s=>s.startsWith("sensor.calorie_tracker_")&&this._hass.states[s])),!t){e.innerHTML="<div>No calorie tracker profile entity found</div>";return}try{let s=this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_weight_history",entity_id:t}),r=this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:t}).catch(()=>null),[a,i]=await Promise.all([s,r]);this._weightData=a.weight_history||[],this._lastGoalStartDate=this._extractLastGoalStartDate(i&&Array.isArray(i.goals)?i.goals:null),this._syncLastGoalRangeAvailability(),this._renderChart()}catch(s){this._lastGoalStartDate=null,this._syncLastGoalRangeAvailability(),e.innerHTML="<div>Failed to fetch weight data</div>"}if(!this._eventsAttached){let s=this.querySelector(".weight-range-select");s&&(s.value=this._range,s.addEventListener("change",a=>{if(this._range=a.target.value,this._range==="goal"&&!this._lastGoalStartDate){this._range="1m",s.value=this._range;return}this._renderChart()}));let r=this.querySelector(".weight-chart");r&&window.ResizeObserver&&(this._resizeObserver=new ResizeObserver(()=>{this._renderChart()}),this._resizeObserver.observe(r)),this._eventsAttached=!0}}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null)}_filterDataByRange(e,t){if(!e||!Array.isArray(e)||e.length===0)return[];if(t==="all")return e;if(t==="goal"){if(!this._lastGoalStartDate)return[];let a=this._lastGoalStartDate;return e.filter(i=>!i||typeof i.date!="string"?!1:i.date.slice(0,10)>=a)}let s=new Date,r;switch(t){case"2w":r=new Date(s),r.setDate(s.getDate()-13);break;case"1m":r=new Date(s),r.setMonth(s.getMonth()-1);break;case"2m":r=new Date(s),r.setMonth(s.getMonth()-2);break;case"4m":r=new Date(s),r.setMonth(s.getMonth()-4);break;case"6m":r=new Date(s),r.setMonth(s.getMonth()-6);break;case"1y":r=new Date(s),r.setFullYear(s.getFullYear()-1);break;default:return e}return e.filter(a=>new Date(a.date)>=r)}_renderChart(){let e=this.querySelector(".weight-chart"),t=this.querySelector(".legend-items");e&&requestAnimationFrame(()=>{this._doRenderChart(e,t)})}_doRenderChart(e,t){if(!e)return;let s=this._filterDataByRange(this._weightData,this._range);if(!s.length||s.length<2){let d="No weight data available for this range.";this._range==="goal"&&(d=this._lastGoalStartDate?"Need more weight entries since your last goal to display progress.":"Set a goal to track progress from your most recent goal start date."),e.innerHTML=`<div>${d}</div>`,t&&(t.innerHTML="");return}let r=this.profileEntityId||this._hass&&Object.keys(this._hass.states).find(d=>d.startsWith("sensor.calorie_tracker_")),a=null,i=null,n="kg";if(r&&this._hass&&this._hass.states[r]){let d=this._hass.states[r].attributes||{},S=E=>{if(E==null)return null;let q=Number(E);return Number.isFinite(q)?q:null};a=S(d.starting_weight),i=S(d.goal_weight),n=d.weight_unit||"kg"}let l=400,h=260,u=40,c=s.map(d=>new Date(d.date)),F=s.map(d=>d.weight),H=Math.min(...F),$=Math.max(...F),b=c[0],y=c[c.length-1],M=1440*60*1e3,k=Math.max((y-b)/M,1),_=(()=>{if(c.length<2)return null;let d=c.map(j=>(j.getTime()-b.getTime())/M),S=F,E=d.length,q=0,N=0,K=0,U=0;for(let j=0;j<E;j++){let Z=d[j],le=S[j];q+=Z,N+=le,K+=Z*le,U+=Z*Z}let ee=E*U-q*q;if(Math.abs(ee)<1e-9)return null;let J=(E*K-q*N)/ee,oe=(N-J*q)/E,ge=N/E,Q=0,te=0;for(let j=0;j<E;j++){let Z=oe+J*d[j],le=S[j];Q+=(le-ge)**2,te+=(le-Z)**2}let fe=Q>0?1-te/Q:1;return{slope:J,intercept:oe,weightAt:j=>{let Z=(j.getTime()-b.getTime())/M;return oe+J*Z},rSquared:fe}})(),p=0,L=y,A=null,C=!1;if(_){let d=_.slope,S=k,E=_.weightAt(y),q=S;if(i!==null&&Math.abs(d)>1e-6){let N=(i-E)/d;N>=0&&(C=!0,A=N,q=Math.min(q,N))}Math.abs(d)>1e-6&&(p=Math.max(0,q),p>0&&(L=new Date(y.getTime()+p*M)))}let m=p>0?L:y,g=b.getTime(),w=m.getTime(),o=d=>u+(d.getTime()-g)/Math.max(w-g,1)*(l-2*u),f=H,x=$;if(i!==null&&(f=Math.min(f,i),x=Math.max(x,i)),_&&p>0){let d=_.weightAt(L);f=Math.min(f,d),x=Math.max(x,d)}let v=x-f||1,I=.15,P=f-v*I,T=x+v*I,O=a!==null&&a>=P&&a<=T,G=i!==null&&i>=P&&i<=T;if(t){let d="";if(a!==null){let S=O?"":a>T?" \u2191":" \u2193";d+=`<div style="display:flex;align-items:center;"><div style="width:12px;height:2px;background:#ff9800;margin-right:4px;border-style:dashed;border-width:1px 0;border-color:#ff9800;"></div><span style="font-size:12px;">Start: ${a}${S}</span></div>`}if(i!==null){let S=G?"":i>T?" \u2191":" \u2193";d+=`<div style="display:flex;align-items:center;"><div style="width:12px;height:2px;background:#8bc34a;margin-right:4px;border-style:dashed;border-width:1px 0;border-color:#8bc34a;"></div><span style="font-size:12px;">Goal: ${i}${S}</span></div>`}t.innerHTML=d}let z=this.querySelector(".weight-prediction");if(z)if(!_)z.style.display="none";else{let d=_.slope*7,S=d>=0?`+${d.toFixed(2)}`:d.toFixed(2),E=_.rSquared>.8?"high":_.rSquared>.5?"medium":"low",N=`<strong>Trend:</strong> ${S} ${n}/week <span style="color:${E==="high"?"var(--success-color, #4caf50)":E==="medium"?"var(--warning-color, #ff9800)":"var(--error-color, #f44336)"};font-weight:bold;">(${E} confidence)</span>`;if(i===null)N+="<br/><em>Set a goal weight to see a predicted goal date.</em>";else if(Math.abs(_.slope)<1e-6)N+="<br/><em>Trend is flat, unable to project goal date.</em>";else if(!C)N+="<br/><em>Trend is moving away from the goal weight.</em>";else if(A!==null&&Number.isFinite(A)){let K=new Date(y.getTime()+A*M),ee=Math.round((K-new Date)/M),J=K.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});N+=`<br/><strong>Goal projection:</strong> ${J} (${ee} days)`}else N+="<br/><em>Unable to calculate goal projection.</em>";z.innerHTML=N,z.style.display="block"}let Y=d=>h-u-(d-P)/(T-P)*(h-2*u),X=s.map(d=>[o(new Date(d.date)),Y(d.weight)]),R=`<svg viewBox='0 0 ${l} ${h}' preserveAspectRatio='xMidYMid meet' style='width:100%;height:auto;'>`,Ce=d=>{let S=d.getDate().toString().padStart(2,"0"),q=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];return`${S} ${q}`};for(let d=0;d<5;d++){let S=d/4,E=g+S*(w-g),q=new Date(E),N=o(q);R+=`<line x1='${N}' y1='${u}' x2='${N}' y2='${h-u}' stroke='#d0d0d0' stroke-width='0.5' stroke-dasharray='3,3' />`,R+=`<text x='${N}' y='${h-u+18}' font-size='11' fill='#888' text-anchor='middle'>${Ce(q)}</text>`}for(let d=0;d<5;d++){let S=d/4,E=P+S*(T-P),q=Y(E);R+=`<line x1='${u}' y1='${q}' x2='${l-u}' y2='${q}' stroke='#d0d0d0' stroke-width='0.5' stroke-dasharray='3,3' />`,R+=`<text x='${u-12}' y='${q+4}' font-size='11' fill='#888' text-anchor='end'>${E.toFixed(1)}</text>`}if(R+=`<polyline fill='none' stroke='#03a9f4' stroke-width='2' points='${X.map(d=>d.join(",")).join(" ")}' />`,_){let d=b,S=y,E=o(d),q=Y(_.weightAt(d)),N=o(S),K=Y(_.weightAt(S));if(R+=`<line x1='${E}' y1='${q}' x2='${N}' y2='${K}' stroke='#9c27b0' stroke-width='2' opacity='0.9' />`,p>0){let U=y,ee=_.weightAt(U),J=_.weightAt(L),oe=o(U),ge=Y(ee),Q=o(L),te=Y(J);R+=`<line x1='${oe}' y1='${ge}' x2='${Q}' y2='${te}' stroke='#9c27b0' stroke-width='1.75' stroke-dasharray='8,6' opacity='0.6' />`,R+=`<circle cx='${Q}' cy='${te}' r='3.5' fill='#9c27b0' opacity='0.6' />`;let fe=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],ye=L,j=`${ye.getDate()} ${fe[ye.getMonth()]}`;R+=`<text x='${Q}' y='${te-12}' font-size='10' fill='#9c27b0' text-anchor='middle' opacity='0.7'>${j}</text>`}}if(X.forEach((d,S)=>{R+=`<circle class='weight-point' data-index='${S}' cx='${d[0]}' cy='${d[1]}' r='4' fill='#03a9f4' stroke='#fff' stroke-width='1.5' style='cursor:pointer;' />`}),O){let d=Y(a);R+=`<line x1='${u}' y1='${d}' x2='${l-u}' y2='${d}' stroke='#ff9800' stroke-dasharray='4,2' stroke-width='1.5' />`}if(G){let d=Y(i);R+=`<line x1='${u}' y1='${d}' x2='${l-u}' y2='${d}' stroke='#8bc34a' stroke-dasharray='4,2' stroke-width='1.5' />`}if(a!==null&&!O){let d=a>T,S=d?u+5:h-u-5,E=d?"\u2191":"\u2193";R+=`<text x='${l-u-40}' y='${S}' font-size='12' fill='#ff9800' text-anchor='start'>Start ${E}</text>`}if(i!==null&&!G){let d=i>T,S=d?u+5:h-u-5,E=d?"\u2191":"\u2193",q=a!==null&&!O&&i>T==a>T?80:40;R+=`<text x='${l-u-q}' y='${S}' font-size='12' fill='#8bc34a' text-anchor='start'>Goal ${E}</text>`}R+="</svg>",e.innerHTML=`<div style="position:relative;width:100%;">${R}<div class="weight-tooltip" style="position:absolute;display:none;background:rgba(0,0,0,0.8);color:white;padding:8px 12px;border-radius:4px;font-size:12px;pointer-events:none;z-index:1000;white-space:nowrap;"></div></div>`;let ne=e.querySelector(".weight-tooltip");e.querySelectorAll(".weight-point").forEach(d=>{d.addEventListener("mouseenter",S=>{let E=parseInt(S.target.getAttribute("data-index")),q=s[E],N=new Date(q.date);ne.innerHTML=`<div><strong>${Ce(N)}</strong></div><div>${q.weight} ${n}</div>`,ne.style.display="block"}),d.addEventListener("mousemove",S=>{let E=e.getBoundingClientRect();ne.style.left=S.clientX-E.left+10+"px",ne.style.top=S.clientY-E.top-10+"px"}),d.addEventListener("mouseleave",()=>{ne.style.display="none"})})}_extractLastGoalStartDate(e){if(!Array.isArray(e)||e.length===0)return null;let t=e.map(s=>{if(!s||typeof s.start_date!="string")return null;let r=s.start_date.trim();return r?r.slice(0,10):null}).filter(Boolean);return t.length?t.reduce((s,r)=>s&&s>r?s:r,null):null}_syncLastGoalRangeAvailability(){let e=this.querySelector(".weight-range-select");if(!e)return;let t=[...e.options].find(r=>r.value==="goal");if(!t)return;let s=!!this._lastGoalStartDate;if(t.disabled=!s,t.hidden=!s,s){let r=new Date(this._lastGoalStartDate);if(Number.isNaN(r.getTime()))t.textContent="Since last goal";else{let a=r.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});t.textContent=`Since last goal (${a})`}}else t.textContent="Since last goal",this._range==="goal"&&(this._range="1m",e.value=this._range)}};customElements.get("weight-progress-card")||customElements.define("weight-progress-card",pe);window.customCards=window.customCards||[];window.customCards.push({type:"weight-progress-card",name:"Calorie Tracker: Weight Progress",description:"Displays weight history and progress for Calorie Tracker",editor:"weight-progress-editor",preview:!0});var ke=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={});let e=[["2w","Last 2 weeks"],["1m","Last month"],["2m","Last 2 months"],["4m","Last 4 months"],["6m","Last 6 months"],["1y","Last year"],["goal","Since last goal"],["all","All"]],t=this._config.default_range||"1m";this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <label style="font-size:12px;color:var(--secondary-text-color);">Default range</label>
        <select>${e.map(l=>`<option value="${l[0]}" ${l[0]===t?"selected":""}>${l[1]}</option>`).join("")}</select>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let s=this.querySelector("paper-input"),r=this.querySelector("ha-entity-picker"),a=this.querySelector("select"),i=this.querySelector(".error"),n=()=>{let l=W({},this._config);s&&s.value?l.title=s.value.trim():delete l.title,r&&r.value?l.profile_entity_id=r.value:delete l.profile_entity_id,a&&a.value?l.default_range=a.value:delete l.default_range,l.profile_entity_id?i&&(i.style.display="none"):i&&(i.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:l}}))};s&&s.addEventListener("value-changed",n),r&&r.addEventListener("value-changed",n),a&&a.addEventListener("change",n)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("weight-progress-editor")||customElements.define("weight-progress-editor",ke);pe.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"default_range",selector:{select:{options:[{value:"2w",label:"Last 2 weeks"},{value:"1m",label:"Last month"},{value:"2m",label:"Last 2 months"},{value:"4m",label:"Last 4 months"},{value:"6m",label:"Last 6 months"},{value:"1y",label:"Last year"},{value:"goal",label:"Since last goal"},{value:"all",label:"All"}]}}}]}};pe.getStubConfig=function(){return{profile_entity_id:"",default_range:"1m"}}});var Pe=B(()=>{var dt=V(Se()),ut=V(Ee()),pt=V(Le()),gt=V(Ae()),ft=V(De()),yt=V(qe()),mt=V(Te()),_t=V(Fe()),xt=V(He())});export default Pe();
//# sourceMappingURL=cards.js.map
