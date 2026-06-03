import{a as W,e as B,f as V}from"./chunks/chunk-5HHMTMB7.js";var Se=B(()=>{var ce=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._summaryLoaded=!1,this._styleObserver=null,this._translations=null,this._translationsLang=null}async _ensureSummaryLoaded(){if(!this._summaryLoaded&&!customElements.get("calorie-summary"))try{await import("./chunks/summary-LAEYWALK.js"),this._summaryLoaded=!0}catch(e){console.error("Failed to load summary component:",e)}}setConfig(e){this.config=e,this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <calorie-summary></calorie-summary>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${n}`}async _updateCard(){var a,i,r,c,h,u;await this._ensureSummaryLoaded(),await customElements.whenDefined("calorie-summary");let e=this.querySelector("calorie-summary");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(l=>l.startsWith("sensor.calorie_tracker_profile"))),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];e.hass=this.hass,e.profile=s,e.weekStartDay=((a=s==null?void 0:s.attributes)==null?void 0:a.week_start_day)||"sunday",e.selectedDate=this.selectedDate||this._getLocalDateString(),this._applyWrapperStyles(e),!this._styleObserver&&e.renderRoot&&(this._styleObserver=new MutationObserver(()=>{this._applyWrapperStyles(e)}),this._styleObserver.observe(e.renderRoot,{childList:!0,subtree:!0}));let n=((r=(i=this.hass)==null?void 0:i.locale)==null?void 0:r.language)||((c=this.hass)==null?void 0:c.language)||"en";if(!this._translations||this._translationsLang!==n)try{let l=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_translations",language:n,namespace:"frontend.summary"});this._translations=(l==null?void 0:l.translations)||{},this._translationsLang=n}catch(l){console.warn("Failed to fetch summary translations:",l),this._translations={},this._translationsLang=n}e.translations=this._translations||{};try{let[l,D]=await Promise.all([this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_weekly_summary",entity_id:t,date:e.selectedDate}),this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:e.selectedDate})]);e.weeklySummary=(h=l==null?void 0:l.weekly_summary)!=null?h:{},e.weight=(u=D==null?void 0:D.weight)!=null?u:null}catch(l){console.error("Failed to fetch calorie data:",l)}this._eventsAttached||(e.addEventListener("select-summary-date",l=>{this.selectedDate=l.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyWrapperStyles(e){if(!(e!=null&&e.renderRoot))return;let t=e.renderRoot.querySelector(".gauge-container");if(t){t.style.width="120px",t.style.height="120px",t.style.maxWidth="120px";let s=t.querySelector("svg");s&&(s.style.maxWidth="120px",s.style.maxHeight="120px")}}disconnectedCallback(){this._styleObserver&&(this._styleObserver.disconnect(),this._styleObserver=null)}};customElements.get("calorie-summary-card")||customElements.define("calorie-summary-card",ce);window.customCards=window.customCards||[];window.customCards.push({type:"calorie-summary-card",name:"Calorie Tracker: Summary",description:"Full weekly summary card for the Calorie Tracker integration",editor:"calorie-summary-editor",preview:!0});var me=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelector("paper-input"),t=this.querySelector("ha-entity-picker"),s=this.querySelector(".error"),n=()=>{let a=W({},this._config);e&&e.value?a.title=e.value.trim():delete a.title,t&&t.value?a.profile_entity_id=t.value:delete a.profile_entity_id,a.profile_entity_id?s&&(s.style.display="none"):s&&(s.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:a}}))};e&&e.addEventListener("value-changed",n),t&&t.addEventListener("value-changed",n)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("calorie-summary-editor")||customElements.define("calorie-summary-editor",me);ce.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}}]}};ce.getStubConfig=function(){return{profile_entity_id:""}}});var Le=B(()=>{var he=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._dailyDataLoaded=!1}async _ensureDailyDataLoaded(){if(!this._dailyDataLoaded&&!customElements.get("daily-data-card"))try{await import("./chunks/daily-data-FZQLQRKZ.js"),this._dailyDataLoaded=!0}catch(e){console.error("Failed to load daily-data component:",e)}}setConfig(e){this.config=e,this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <daily-data-card></daily-data-card>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${n}`}async _updateCard(){var n,a,i,r;await this._ensureDailyDataLoaded(),await customElements.whenDefined("daily-data-card");let e=this.querySelector("daily-data-card");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(c=>c.startsWith("sensor.calorie_tracker_")&&c.includes("_profile")&&this.hass.states[c])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];e.hass=this.hass,e.profile=s,e.selectedDate=this.selectedDate||this._getLocalDateString();try{let c=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:e.selectedDate});e.log={food_entries:(c==null?void 0:c.food_entries)||[],exercise_entries:(c==null?void 0:c.exercise_entries)||[],weight:(n=c==null?void 0:c.weight)!=null?n:null,body_fat_pct:(a=c==null?void 0:c.body_fat_pct)!=null?a:null,bmr_and_neat:(i=c==null?void 0:c.bmr_and_neat)!=null?i:null,macros:(c==null?void 0:c.macros)||null,config_entry_id:(r=c==null?void 0:c.config_entry_id)!=null?r:null}}catch(c){console.error("Failed to fetch daily data:",c),e.log={food_entries:[],exercise_entries:[],weight:null,body_fat_pct:null,bmr_and_neat:null}}this._eventsAttached||(e.addEventListener("select-daily-date",c=>{this.selectedDate=c.detail.date,this._updateCard()}),e.addEventListener("refresh-daily-data",()=>{this._updateCard()}),e.addEventListener("add-daily-entry",async c=>{try{await this.hass.connection.sendMessagePromise(W({type:"calorie_tracker/add_entry",entity_id:t},c.detail)),this._updateCard()}catch(h){console.error("Failed to add entry:",h)}}),e.addEventListener("edit-daily-entry",async c=>{try{await this.hass.connection.sendMessagePromise(W({type:"calorie_tracker/update_entry",entity_id:t},c.detail)),this._updateCard()}catch(h){console.error("Failed to edit entry:",h)}}),e.addEventListener("delete-daily-entry",async c=>{try{await this.hass.connection.sendMessagePromise(W({type:"calorie_tracker/delete_entry",entity_id:t},c.detail)),this._updateCard()}catch(h){console.error("Failed to delete entry:",h)}}),this._eventsAttached=!0)}};customElements.get("calorie-daily-log-card")||customElements.define("calorie-daily-log-card",he);window.customCards=window.customCards||[];window.customCards.push({type:"calorie-daily-log-card",name:"Calorie Tracker: Daily Log",description:"Daily food/exercise log UI for the Calorie Tracker integration",editor:"calorie-daily-log-editor",preview:!0});var _e=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelector("paper-input"),t=this.querySelector("ha-entity-picker"),s=this.querySelector(".error"),n=()=>{let a=W({},this._config);e&&e.value?a.title=e.value.trim():delete a.title,t&&t.value?a.profile_entity_id=t.value:delete a.profile_entity_id,a.profile_entity_id?s&&(s.style.display="none"):s&&(s.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:a}}))};e&&e.addEventListener("value-changed",n),t&&t.addEventListener("value-changed",n)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("calorie-daily-log-editor")||customElements.define("calorie-daily-log-editor",_e);he.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}}]}};he.getStubConfig=function(){return{profile_entity_id:""}}});var Ee=B(()=>{var de=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._profileLoaded=!1}async _ensureProfileLoaded(){if(!this._profileLoaded&&!customElements.get("profile-card"))try{await import("./chunks/profile-card-Q5HMXRPY.js"),this._profileLoaded=!0}catch(e){console.error("Failed to load profile component:",e)}}setConfig(e){this.config=e,this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header" id="ct-header">${this.title}</div>`:""}
        <profile-card></profile-card>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}async _updateCard(){var i,r,c,h,u,l,D,H,$;await this._ensureProfileLoaded(),await customElements.whenDefined("profile-card");let e=this.querySelector("profile-card");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(b=>b.startsWith("sensor.calorie_tracker_")&&b.includes("_profile")&&this.hass.states[b])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];e.hass=this.hass,e.profile=s;let n=s.attributes||{};e.goalType=(i=n.goal_type)!=null?i:"Not Set",e.dailyGoal=(r=n.daily_goal_calories)!=null?r:null,e.goalValue=(c=n.goal_value)!=null?c:null,e.currentWeight=(h=n.current_weight)!=null?h:null;let a=this.querySelector("#ct-header");if(a)if(this.title)a.textContent=this.title;else{let b=((u=s.attributes)==null?void 0:u.spoken_name)||t||"Calorie Tracker";a.textContent=`${b} Calorie Tracker Profile`}try{let[b,y]=await Promise.all([this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_user_profile",user_id:((l=this.hass.user)==null?void 0:l.id)||"unknown"}),this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_linked_components",entity_id:t})]);e.allProfiles=(D=b==null?void 0:b.all_profiles)!=null?D:[],e.defaultProfile=(H=b==null?void 0:b.default_profile)!=null?H:null,e.linkedDevices=($=y==null?void 0:y.linked_components)!=null?$:[]}catch(b){console.error("Failed to fetch profile data:",b);let y=Object.keys(this.hass.states).filter(M=>M.startsWith("sensor.calorie_tracker_profile")).map(M=>{var _;let k=this.hass.states[M];return{entity_id:M,spoken_name:((_=k.attributes)==null?void 0:_.spoken_name)||M}}).filter(M=>M);e.allProfiles=y,e.linkedDevices=[]}this._eventsAttached||(e.addEventListener("refresh-profile",()=>{this._updateCard()}),e.addEventListener("profile-selected",b=>{this.profileEntityId=b.detail.entityId,this._updateCard()}),e.addEventListener("profiles-updated",b=>{this._updateCard()}),this._eventsAttached=!0)}};customElements.get("calorie-profile-card")||customElements.define("calorie-profile-card",de);window.customCards=window.customCards||[];window.customCards.push({type:"calorie-profile-card",name:"Calorie Tracker: Profile",description:"Profile card for Calorie Tracker (shows user profile and settings)",editor:"calorie-profile-editor",preview:!0});var xe=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelector("paper-input"),t=this.querySelector("ha-entity-picker"),s=this.querySelector(".error"),n=()=>{let a=W({},this._config);e&&e.value?a.title=e.value.trim():delete a.title,t&&t.value?a.profile_entity_id=t.value:delete a.profile_entity_id,a.profile_entity_id?s&&(s.style.display="none"):s&&(s.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:a}}))};e&&e.addEventListener("value-changed",n),t&&t.addEventListener("value-changed",n)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("calorie-profile-editor")||customElements.define("calorie-profile-editor",xe);de.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}}]}};de.getStubConfig=function(){return{profile_entity_id:""}}});var Ae=B(()=>{var ue=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._summaryLoaded=!1,this._styleObserver=null}async _ensureSummaryLoaded(){if(!this._summaryLoaded&&!customElements.get("calorie-summary"))try{await import("./chunks/summary-LAEYWALK.js"),this._summaryLoaded=!0}catch(e){console.error("Failed to load summary component:",e)}}setConfig(e){this.config=e,this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.maxHeight=e.max_height||"400px",this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <calorie-summary></calorie-summary>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${n}`}async _updateCard(){var n,a;await this._ensureSummaryLoaded(),await customElements.whenDefined("calorie-summary");let e=this.querySelector("calorie-summary");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(i=>i.startsWith("sensor.calorie_tracker_")&&i.includes("_profile")&&this.hass.states[i])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];e.hass=this.hass,e.profile=s,e.selectedDate=this.selectedDate||this._getLocalDateString(),this._applyGaugeOnlyStyles(e),!this._styleObserver&&e.renderRoot&&(this._styleObserver=new MutationObserver(()=>{this._applyGaugeOnlyStyles(e)}),this._styleObserver.observe(e.renderRoot,{childList:!0,subtree:!0}));try{let[i,r]=await Promise.all([this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_weekly_summary",entity_id:t,date:e.selectedDate}),this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:e.selectedDate})]);e.weeklySummary=(n=i==null?void 0:i.weekly_summary)!=null?n:{},e.weight=(a=r==null?void 0:r.weight)!=null?a:null}catch(i){console.error("Failed to fetch calorie data:",i)}this._eventsAttached||(e.addEventListener("select-summary-date",i=>{this.selectedDate=i.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyGaugeOnlyStyles(e){if(!(e!=null&&e.renderRoot))return;let t=e.renderRoot.querySelector(".bar-graph-section");t&&(t.style.display="none");let s=e.renderRoot.querySelector(".gauge-labels");s&&(s.style.display="none");let n=e.renderRoot.querySelector(".summary-container");n&&(n.style.justifyContent="center",n.style.alignItems="center",n.style.height="100%",n.style.maxWidth="none");let a=e.renderRoot.querySelector(".gauge-section");a&&(a.style.width="100%",a.style.flex="1",a.style.maxWidth="none");let i=e.renderRoot.querySelector(".gauge-container");i&&(i.style.width="100%",i.style.height="auto",i.style.aspectRatio="1 / 1",i.style.maxWidth=this.maxHeight,i.style.maxHeight=this.maxHeight);let r=e.renderRoot.querySelector(".gauge-container svg");r&&(r.style.width="100%",r.style.height="100%",r.style.maxWidth="none",r.style.maxHeight="none"),e.style&&(e.style.height="100%",e.style.display="flex",e.style.alignItems="center",e.style.justifyContent="center")}disconnectedCallback(){this._styleObserver&&(this._styleObserver.disconnect(),this._styleObserver=null)}};customElements.get("calorie-gauge-card")||customElements.define("calorie-gauge-card",ue);window.customCards=window.customCards||[];window.customCards.push({type:"calorie-gauge-card",name:"Calorie Gauge",description:"A compact gauge-only view for the Calorie Tracker summary",editor:"calorie-gauge-editor",preview:!0});var ve=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <paper-input label="Max height (e.g. 400px)" value="${this._escape(this._config.max_height||"400px")}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelector("paper-input"),t=this.querySelector("ha-entity-picker"),s=this.querySelectorAll("paper-input")[1],n=this.querySelector(".error"),a=()=>{let i=W({},this._config);e&&e.value?i.title=e.value.trim():delete i.title,t&&t.value?i.profile_entity_id=t.value:delete i.profile_entity_id,s&&s.value?i.max_height=s.value.trim():delete i.max_height,i.profile_entity_id?n&&(n.style.display="none"):n&&(n.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i}}))};e&&e.addEventListener("value-changed",a),t&&t.addEventListener("value-changed",a),s&&s.addEventListener("value-changed",a)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("calorie-gauge-editor")||customElements.define("calorie-gauge-editor",ve);ue.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"max_height",selector:{text:{}}}]}};ue.getStubConfig=function(){return{profile_entity_id:"",max_height:"400px"}}});var De=B(()=>{var se=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(e){this.config=e||{},this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.maxHeight=e.max_height||"400px",this.min=typeof e.min=="number"?e.min:null,this.max=typeof e.max=="number"?e.max:null,this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="protein-gauge-wrapper">
          <div class="protein-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="protein-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
          </div>
        </div>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${n}`}async _updateCard(){var n,a,i;let e=this.querySelector(".protein-gauge");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(r=>r.startsWith("sensor.calorie_tracker_")&&this.hass.states[r])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];this._profile=s,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyProteinStyles(e);try{let r=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:this._selectedDate}),c=(n=r==null?void 0:r.weight)!=null?n:null,h=(a=r==null?void 0:r.weight_unit)!=null?a:null,u=(i=r==null?void 0:r.macros)!=null?i:{},l=Math.round(u.p||u.protein||0),D=this._profile&&this._profile.attributes||{},H=Number(D.current_weight),$=D.weight_unit||h||"lbs",b=(m,p,w)=>Number.isFinite(m)?!p||!w||p===w?m:p==="kg"&&w==="lbs"?m*2.20462:p==="lbs"&&w==="kg"?m/2.20462:m:null,y=Number.isFinite(H)?H:null;!Number.isFinite(y)&&Number.isFinite(c)&&(y=b(Number(c),h||$,$));let M=Number.isFinite(y)?y:null,k=Number.isFinite(y)?$==="kg"?y*2.20462:y:null,_=m=>m==null?null:m<5&&M!==null?Math.round(m*M):m,g=_(this.min),E=_(this.max),A=k!=null?k:150,C=Math.ceil(A/10)*10;(!Number.isFinite(C)||C<=0)&&(C=150),E!==null&&(C=E),this._gaugeMax=C,this._gaugeMin=g!==null?g:0,this._proteinValue=l,this._proteinWeight=k||0,this._proteinMin=g,this._proteinMax=E,this._renderGauge()}catch(r){console.error("Failed to fetch protein data:",r)}this._eventsAttached||(e.addEventListener("select-summary-date",r=>{this.selectedDate=r.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyProteinStyles(e){if(!e)return;let t=e.querySelector(".protein-svg");t&&(t.style.width="100%",t.style.height="auto",t.style.maxWidth=this.maxHeight,t.style.maxHeight=this.maxHeight)}};customElements.get("protein-gauge-card")||customElements.define("protein-gauge-card",se);window.customCards=window.customCards||[];window.customCards.push({type:"protein-gauge-card",name:"Calorie Tracker: Protein Gauge",description:"Displays a protein gauge for the Calorie Tracker integration",editor:"protein-gauge-editor",preview:!0});var be=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){var h,u;this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <paper-input label="Max height (e.g. 400px)" value="${this._escape(this._config.max_height||"400px")}"></paper-input>
        <paper-input label="Min (optional, grams or fraction)" value="${this._escape((h=this._config.min)!=null?h:"")}"></paper-input>
        <paper-input label="Max (optional, grams or fraction)" value="${this._escape((u=this._config.max)!=null?u:"")}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelectorAll("paper-input"),t=e[0],s=e[1],n=e[2],a=e[3],i=this.querySelector("ha-entity-picker"),r=this.querySelector(".error"),c=()=>{let l=W({},this._config);t&&t.value?l.title=t.value.trim():delete l.title,i&&i.value?l.profile_entity_id=i.value:delete l.profile_entity_id,s&&s.value?l.max_height=s.value.trim():delete l.max_height,n&&n.value?l.min=Number(n.value):delete l.min,a&&a.value?l.max=Number(a.value):delete l.max,l.profile_entity_id?r&&(r.style.display="none"):r&&(r.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:l}}))};e.forEach(l=>l.addEventListener("value-changed",c)),i&&i.addEventListener("value-changed",c)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("protein-gauge-editor")||customElements.define("protein-gauge-editor",be);se.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"max_height",selector:{text:{}}},{name:"min",selector:{number:{}}},{name:"max",selector:{number:{}}}]}};se.getStubConfig=function(){return{profile_entity_id:"",max_height:"400px"}};se.prototype._renderGauge=function(){let q=this.querySelector(".protein-svg");if(!q)return;let e=Math.max(0,this._proteinValue||0),t=this._proteinMin,s=this._proteinMax,n=this._gaugeMax||100,a=s!==null?s*1.1:n*1.1,i={x:70,y:70},r=40,c=8,h=-180,u=0,l=u-h,D=Math.max(Math.min(e/a,1),0),H=h+D*l,$=o=>o*Math.PI/180,b=(o,f,x)=>{let v=$(o),I=$(f),P=i.x+x*Math.cos(v),F=i.y+x*Math.sin(v),O=i.x+x*Math.cos(I),G=i.y+x*Math.sin(I),z=Math.abs(f-o)>180?1:0;return`M ${P} ${F} A ${x} ${x} 0 ${z} 1 ${O} ${G}`},y=8,M=[5,10,25,50,100,200],k=M[0];for(let o of M)if(a/o<=y){k=o;break}let _=[];for(let o=0;o<=a;o+=k){let f=o/a,x=h+f*l,v=$(x),I=r+5,P=r+12,F=r+20,O=i.x+I*Math.cos(v),G=i.y+I*Math.sin(v),z=i.x+P*Math.cos(v),Y=i.y+P*Math.sin(v),X=i.x+F*Math.cos(v),R=i.y+F*Math.sin(v);_.push({line:`M ${O} ${G} L ${z} ${Y}`,label:{x:X,y:R,value:o}})}let g=[];if(t===null&&s===null)g.push({startAngle:h,endAngle:u,color:"#4caf50"});else if(t!==null&&s===null){let o=t/a,f=h+o*l;g.push({startAngle:h,endAngle:f,color:"#ffeb3b"}),g.push({startAngle:f,endAngle:u,color:"#4caf50"})}else if(t===null&&s!==null){let o=s/a,f=h+o*l;g.push({startAngle:h,endAngle:f,color:"#4caf50"}),g.push({startAngle:f,endAngle:u,color:"#f44336"})}else{let o=t/a,f=s/a,x=h+o*l,v=h+f*l;g.push({startAngle:h,endAngle:x,color:"#ffeb3b"}),g.push({startAngle:x,endAngle:v,color:"#4caf50"}),g.push({startAngle:v,endAngle:u,color:"#f44336"})}let E=$(H),A=r-5,C=i.x+A*Math.cos(E),m=i.y+A*Math.sin(E),p="#4caf50";t!==null&&s!==null?e<t?p="#ffeb3b":e>=t&&e<=s?p="#4caf50":p="#f44336":t!==null&&s===null?e<t?p="#ffeb3b":p="#4caf50":t===null&&s!==null&&(e<=s?p="#4caf50":p="#f44336");let w=`
    <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
      <!-- Background arc -->
      <path
        d="${b(h,u,r)}"
        fill="none"
        stroke="#eee"
        stroke-width="${c}"
        stroke-linecap="round"
      />
  `;g.forEach(o=>{w+=`
      <path
        d="${b(o.startAngle,o.endAngle,r)}"
        fill="none"
        stroke="${o.color}"
        stroke-width="${c}"
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
        y="${i.y+r-5}"
        text-anchor="middle"
        font-size="12"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        font-weight="600"
        fill="${p}"
      >
        ${Math.round(e)} g Protein
      </text>

    </svg>
  `,q.innerHTML=w}});var qe=B(()=>{var ie=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(e){this.config=e||{},this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.maxHeight=e.max_height||"400px",this.min=typeof e.min=="number"?e.min:null,this.max=typeof e.max=="number"?e.max:null,this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="fat-gauge-wrapper">
          <div class="fat-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="fat-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
          </div>
        </div>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${n}`}async _updateCard(){var n,a,i;let e=this.querySelector(".fat-gauge");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(r=>r.startsWith("sensor.calorie_tracker_")&&this.hass.states[r])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];this._profile=s,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyFatStyles(e);try{let r=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:this._selectedDate}),c=(n=r==null?void 0:r.weight)!=null?n:null,h=(a=r==null?void 0:r.weight_unit)!=null?a:null,u=(i=r==null?void 0:r.macros)!=null?i:{},l=Math.round(u.f||u.fat||0),D=this._profile&&this._profile.attributes||{},H=Number(D.current_weight),$=D.weight_unit||h||"lbs",b=(m,p,w)=>Number.isFinite(m)?!p||!w||p===w?m:p==="kg"&&w==="lbs"?m*2.20462:p==="lbs"&&w==="kg"?m/2.20462:m:null,y=Number.isFinite(H)?H:null;!Number.isFinite(y)&&Number.isFinite(c)&&(y=b(Number(c),h||$,$));let M=Number.isFinite(y)?y:null,k=Number.isFinite(y)?$==="kg"?y*2.20462:y:null,_=m=>m==null?null:m<5&&M!==null?Math.round(m*M):m,g=_(this.min),E=_(this.max),A=k!=null?k:150,C=Math.ceil(A*.36/10)*10;(!Number.isFinite(C)||C<=0)&&(C=80),E!==null&&(C=E),this._gaugeMax=C,this._gaugeMin=g!==null?g:0,this._fatValue=l,this._fatWeight=k||0,this._fatMin=g,this._fatMax=E,this._renderGauge()}catch(r){console.error("Failed to fetch fat data:",r)}this._eventsAttached||(e.addEventListener("select-summary-date",r=>{this.selectedDate=r.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyFatStyles(e){if(!e)return;let t=e.querySelector(".fat-svg");t&&(t.style.width="100%",t.style.height="auto",t.style.maxWidth=this.maxHeight,t.style.maxHeight=this.maxHeight)}};customElements.get("fat-gauge-card")||customElements.define("fat-gauge-card",ie);window.customCards=window.customCards||[];window.customCards.push({type:"fat-gauge-card",name:"Calorie Tracker: Fat Gauge",description:"Displays a fat gauge for the Calorie Tracker integration",editor:"fat-gauge-editor",preview:!0});var we=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){var h,u;this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <paper-input label="Max height (e.g. 400px)" value="${this._escape(this._config.max_height||"400px")}"></paper-input>
        <paper-input label="Min (optional, grams or fraction)" value="${this._escape((h=this._config.min)!=null?h:"")}"></paper-input>
        <paper-input label="Max (optional, grams or fraction)" value="${this._escape((u=this._config.max)!=null?u:"")}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelectorAll("paper-input"),t=e[0],s=e[1],n=e[2],a=e[3],i=this.querySelector("ha-entity-picker"),r=this.querySelector(".error"),c=()=>{let l=W({},this._config);t&&t.value?l.title=t.value.trim():delete l.title,i&&i.value?l.profile_entity_id=i.value:delete l.profile_entity_id,s&&s.value?l.max_height=s.value.trim():delete l.max_height,n&&n.value?l.min=Number(n.value):delete l.min,a&&a.value?l.max=Number(a.value):delete l.max,l.profile_entity_id?r&&(r.style.display="none"):r&&(r.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:l}}))};e.forEach(l=>l.addEventListener("value-changed",c)),i&&i.addEventListener("value-changed",c)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("fat-gauge-editor")||customElements.define("fat-gauge-editor",we);ie.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"max_height",selector:{text:{}}},{name:"min",selector:{number:{}}},{name:"max",selector:{number:{}}}]}};ie.getStubConfig=function(){return{profile_entity_id:"",max_height:"400px"}};ie.prototype._renderGauge=function(){let q=this.querySelector(".fat-svg");if(!q)return;let e=Math.max(0,this._fatValue||0),t=this._fatMin,s=this._fatMax,n=this._gaugeMax||100,a=s!==null?s*1.1:n*1.1,i={x:70,y:70},r=40,c=8,h=-180,u=0,l=u-h,D=Math.max(Math.min(e/a,1),0),H=h+D*l,$=o=>o*Math.PI/180,b=(o,f,x)=>{let v=$(o),I=$(f),P=i.x+x*Math.cos(v),F=i.y+x*Math.sin(v),O=i.x+x*Math.cos(I),G=i.y+x*Math.sin(I),z=Math.abs(f-o)>180?1:0;return`M ${P} ${F} A ${x} ${x} 0 ${z} 1 ${O} ${G}`},y=8,M=[5,10,25,50,100,200],k=M[0];for(let o of M)if(a/o<=y){k=o;break}let _=[];for(let o=0;o<=a;o+=k){let f=o/a,x=h+f*l,v=$(x),I=r+5,P=r+12,F=r+20,O=i.x+I*Math.cos(v),G=i.y+I*Math.sin(v),z=i.x+P*Math.cos(v),Y=i.y+P*Math.sin(v),X=i.x+F*Math.cos(v),R=i.y+F*Math.sin(v);_.push({line:`M ${O} ${G} L ${z} ${Y}`,label:{x:X,y:R,value:o}})}let g=[];if(t===null&&s===null)g.push({startAngle:h,endAngle:u,color:"#4caf50"});else if(t!==null&&s===null){let o=t/a,f=h+o*l;g.push({startAngle:h,endAngle:f,color:"#ffeb3b"}),g.push({startAngle:f,endAngle:u,color:"#4caf50"})}else if(t===null&&s!==null){let o=s/a,f=h+o*l;g.push({startAngle:h,endAngle:f,color:"#4caf50"}),g.push({startAngle:f,endAngle:u,color:"#f44336"})}else{let o=t/a,f=s/a,x=h+o*l,v=h+f*l;g.push({startAngle:h,endAngle:x,color:"#ffeb3b"}),g.push({startAngle:x,endAngle:v,color:"#4caf50"}),g.push({startAngle:v,endAngle:u,color:"#f44336"})}let E=$(H),A=r-5,C=i.x+A*Math.cos(E),m=i.y+A*Math.sin(E),p="#4caf50";t!==null&&s!==null?e<t?p="#ffeb3b":e>=t&&e<=s?p="#4caf50":p="#f44336":t!==null&&s===null?e<t?p="#ffeb3b":p="#4caf50":t===null&&s!==null&&(e<=s?p="#4caf50":p="#f44336");let w=`
    <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
      <!-- Background arc -->
      <path
        d="${b(h,u,r)}"
        fill="none"
        stroke="#eee"
        stroke-width="${c}"
        stroke-linecap="round"
      />
  `;g.forEach(o=>{w+=`
      <path
        d="${b(o.startAngle,o.endAngle,r)}"
        fill="none"
        stroke="${o.color}"
        stroke-width="${c}"
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
        y="${i.y+r-5}"
        text-anchor="middle"
        font-size="12"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        font-weight="600"
        fill="${p}"
      >
        ${Math.round(e)} g Fat
      </text>

    </svg>
  `,q.innerHTML=w}});var Te=B(()=>{var ae=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(e){this.config=e||{},this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.maxHeight=e.max_height||"400px",this.min=typeof e.min=="number"?e.min:null,this.max=typeof e.max=="number"?e.max:null,this.innerHTML=`
      <ha-card>
        ${this.title&&this.title.trim()?`<div class="card-header">${this.title}</div>`:""}
        <div class="carbs-gauge-wrapper">
          <div class="carbs-gauge" style="display:flex;flex-direction:column;align-items:center;">
            <svg class="carbs-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-width:${this.maxHeight};max-height:${this.maxHeight};"></svg>
          </div>
        </div>
      </ha-card>
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${n}`}async _updateCard(){var n,a,i;let e=this.querySelector(".carbs-gauge");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(r=>r.startsWith("sensor.calorie_tracker_")&&this.hass.states[r])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];this._profile=s,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyCarbsStyles(e);try{let r=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:this._selectedDate}),c=(n=r==null?void 0:r.weight)!=null?n:null,h=(a=r==null?void 0:r.weight_unit)!=null?a:null,u=(i=r==null?void 0:r.macros)!=null?i:{},l=Math.round(u.c||u.carbs||0),D=this._profile&&this._profile.attributes||{},H=Number(D.current_weight),$=D.weight_unit||h||"lbs",b=(m,p,w)=>Number.isFinite(m)?!p||!w||p===w?m:p==="kg"&&w==="lbs"?m*2.20462:p==="lbs"&&w==="kg"?m/2.20462:m:null,y=Number.isFinite(H)?H:null;!Number.isFinite(y)&&Number.isFinite(c)&&(y=b(Number(c),h||$,$));let M=Number.isFinite(y)?y:null,k=Number.isFinite(y)?$==="kg"?y*2.20462:y:null,_=m=>m==null?null:m<5&&M!==null?Math.round(m*M):m,g=_(this.min),E=_(this.max),A=k!=null?k:150,C=Math.ceil(A*1.36/10)*10;(!Number.isFinite(C)||C<=0)&&(C=200),E!==null&&(C=E),this._gaugeMax=C,this._gaugeMin=g!==null?g:0,this._carbsValue=l,this._carbsWeight=k||0,this._carbsMin=g,this._carbsMax=E,this._renderGauge()}catch(r){console.error("Failed to fetch carbs data:",r)}this._eventsAttached||(e.addEventListener("select-summary-date",r=>{this.selectedDate=r.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyCarbsStyles(e){if(!e)return;let t=e.querySelector(".carbs-svg");t&&(t.style.width="100%",t.style.height="auto",t.style.maxWidth=this.maxHeight,t.style.maxHeight=this.maxHeight)}};customElements.get("carbs-gauge-card")||customElements.define("carbs-gauge-card",ae);window.customCards=window.customCards||[];window.customCards.push({type:"carbs-gauge-card",name:"Calorie Tracker: Carbs Gauge",description:"Displays a carbs gauge for the Calorie Tracker integration",editor:"carbs-gauge-editor",preview:!0});var $e=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){var h,u;this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <paper-input label="Max height (e.g. 400px)" value="${this._escape(this._config.max_height||"400px")}"></paper-input>
        <paper-input label="Min (optional, grams or fraction)" value="${this._escape((h=this._config.min)!=null?h:"")}"></paper-input>
        <paper-input label="Max (optional, grams or fraction)" value="${this._escape((u=this._config.max)!=null?u:"")}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelectorAll("paper-input"),t=e[0],s=e[1],n=e[2],a=e[3],i=this.querySelector("ha-entity-picker"),r=this.querySelector(".error"),c=()=>{let l=W({},this._config);t&&t.value?l.title=t.value.trim():delete l.title,i&&i.value?l.profile_entity_id=i.value:delete l.profile_entity_id,s&&s.value?l.max_height=s.value.trim():delete l.max_height,n&&n.value?l.min=Number(n.value):delete l.min,a&&a.value?l.max=Number(a.value):delete l.max,l.profile_entity_id?r&&(r.style.display="none"):r&&(r.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:l}}))};e.forEach(l=>l.addEventListener("value-changed",c)),i&&i.addEventListener("value-changed",c)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("carbs-gauge-editor")||customElements.define("carbs-gauge-editor",$e);ae.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"max_height",selector:{text:{}}},{name:"min",selector:{number:{}}},{name:"max",selector:{number:{}}}]}};ae.getStubConfig=function(){return{profile_entity_id:"",max_height:"400px"}};ae.prototype._renderGauge=function(){let q=this.querySelector(".carbs-svg");if(!q)return;let e=Math.max(0,this._carbsValue||0),t=this._carbsMin,s=this._carbsMax,n=this._gaugeMax||100,a=s!==null?s*1.1:n*1.1,i={x:70,y:70},r=40,c=8,h=-180,u=0,l=u-h,D=Math.max(Math.min(e/a,1),0),H=h+D*l,$=o=>o*Math.PI/180,b=(o,f,x)=>{let v=$(o),I=$(f),P=i.x+x*Math.cos(v),F=i.y+x*Math.sin(v),O=i.x+x*Math.cos(I),G=i.y+x*Math.sin(I),z=Math.abs(f-o)>180?1:0;return`M ${P} ${F} A ${x} ${x} 0 ${z} 1 ${O} ${G}`},y=8,M=[5,10,25,50,100,200],k=M[0];for(let o of M)if(a/o<=y){k=o;break}let _=[];for(let o=0;o<=a;o+=k){let f=o/a,x=h+f*l,v=$(x),I=r+5,P=r+12,F=r+20,O=i.x+I*Math.cos(v),G=i.y+I*Math.sin(v),z=i.x+P*Math.cos(v),Y=i.y+P*Math.sin(v),X=i.x+F*Math.cos(v),R=i.y+F*Math.sin(v);_.push({line:`M ${O} ${G} L ${z} ${Y}`,label:{x:X,y:R,value:o}})}let g=[];if(t===null&&s===null)g.push({startAngle:h,endAngle:u,color:"#4caf50"});else if(t!==null&&s===null){let o=t/a,f=h+o*l;g.push({startAngle:h,endAngle:f,color:"#ffeb3b"}),g.push({startAngle:f,endAngle:u,color:"#4caf50"})}else if(t===null&&s!==null){let o=s/a,f=h+o*l;g.push({startAngle:h,endAngle:f,color:"#4caf50"}),g.push({startAngle:f,endAngle:u,color:"#f44336"})}else{let o=t/a,f=s/a,x=h+o*l,v=h+f*l;g.push({startAngle:h,endAngle:x,color:"#ffeb3b"}),g.push({startAngle:x,endAngle:v,color:"#4caf50"}),g.push({startAngle:v,endAngle:u,color:"#f44336"})}let E=$(H),A=r-5,C=i.x+A*Math.cos(E),m=i.y+A*Math.sin(E),p="#4caf50";t!==null&&s!==null?e<t?p="#ffeb3b":e>=t&&e<=s?p="#4caf50":p="#f44336":t!==null&&s===null?e<t?p="#ffeb3b":p="#4caf50":t===null&&s!==null&&(e<=s?p="#4caf50":p="#f44336");let w=`
    <svg viewBox="0 0 140 140" style="width: 100%; height: 100%;">
      <!-- Background arc -->
      <path
        d="${b(h,u,r)}"
        fill="none"
        stroke="#eee"
        stroke-width="${c}"
        stroke-linecap="round"
      />
  `;g.forEach(o=>{w+=`
      <path
        d="${b(o.startAngle,o.endAngle,r)}"
        fill="none"
        stroke="${o.color}"
        stroke-width="${c}"
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
        y="${i.y+r-5}"
        text-anchor="middle"
        font-size="12"
        font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
        font-weight="600"
        fill="${p}"
      >
        ${Math.round(e)} g Carbs
      </text>

    </svg>
  `,q.innerHTML=w}});var Fe=B(()=>{var ne=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this.maxHeight="400px"}setConfig(e){this.config=e||{},this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"Percent of Total Calories",this.maxHeight=e.max_height||"400px",this.innerHTML=`
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
    `}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}_getLocalDateString(e=new Date){let t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${n}`}async _updateCard(){var n;let e=this.querySelector(".macro-percentages");if(!e||!this.hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this.hass.states).find(a=>a.startsWith("sensor.calorie_tracker_")&&this.hass.states[a])),!t){console.warn("No calorie tracker profile entity found");return}if(!this.hass.states[t]){console.error(`Entity not found: ${t}`);return}let s=this.hass.states[t];this._profile=s,this._selectedDate=this.selectedDate||this._getLocalDateString(),this._applyMacroStyles(e);try{let a=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t,date:this._selectedDate}),i=(n=a==null?void 0:a.macros)!=null?n:{},r=Math.round(i.p||i.protein||0),c=Math.round(i.c||i.carbs||0),h=Math.round(i.f||i.fat||0),u=Math.round(i.a||i.alcohol||0),l=r*4,D=c*4,H=h*9,$=u*7,b=l+D+H+$;this._proteinGrams=r,this._carbsGrams=c,this._fatGrams=h,this._alcoholGrams=u,this._proteinCals=l,this._carbsCals=D,this._fatCals=H,this._alcoholCals=$,this._totalCals=b,this._renderPieChart()}catch(a){console.error("Failed to fetch macro data:",a)}this._eventsAttached||(e.addEventListener("select-summary-date",a=>{this.selectedDate=a.detail.date,this._updateCard()}),e.addEventListener("refresh-summary",()=>{this._updateCard()}),this._eventsAttached=!0)}_applyMacroStyles(e){if(!e)return;let t=e.querySelector(".pie-svg");t&&(t.style.width="150px",t.style.height="150px")}};customElements.get("macro-percentages-card")||customElements.define("macro-percentages-card",ne);window.customCards=window.customCards||[];window.customCards.push({type:"macro-percentages-card",name:"Calorie Tracker Macro Pie Chart",description:"Shows macro percentage breakdown (protein/carbs/fat) for Calorie Tracker",editor:"macro-percentages-editor",preview:!0});var Me=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={}),this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"Percent of Total Calories")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <paper-input label="Max height (optional)" value="${this._escape(this._config.max_height||"400px")}"></paper-input>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let e=this.querySelector("paper-input"),t=this.querySelector("ha-entity-picker"),s=this.querySelectorAll("paper-input")[1],n=this.querySelector(".error"),a=()=>{let i=W({},this._config);e&&e.value?i.title=e.value.trim():delete i.title,t&&t.value?i.profile_entity_id=t.value:delete i.profile_entity_id,s&&s.value?i.max_height=s.value.trim():delete i.max_height,i.profile_entity_id?n&&(n.style.display="none"):n&&(n.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i}}))};e&&e.addEventListener("value-changed",a),t&&t.addEventListener("value-changed",a),s&&s.addEventListener("value-changed",a)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("macro-percentages-editor")||customElements.define("macro-percentages-editor",Me);ne.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"max_height",selector:{text:{}}}]}};ne.getStubConfig=function(){return{profile_entity_id:"",max_height:"400px"}};ne.prototype._renderPieChart=function(){let q=this.querySelector(".pie-svg");if(!q)return;let e=this._proteinCals||0,t=this._carbsCals||0,s=this._fatCals||0,n=this._alcoholCals||0,a=this._totalCals||1,i=this._proteinGrams||0,r=this._carbsGrams||0,c=this._fatGrams||0,h=this._alcoholGrams||0,u=a>0?Math.round(e/a*100):0,l=a>0?Math.round(t/a*100):0,D=a>0?Math.round(s/a*100):0,H=a>0?Math.round(n/a*100):0,$=this.querySelector(".protein-text"),b=this.querySelector(".carbs-text"),y=this.querySelector(".fat-text"),M=this.querySelector(".alcohol-text");$&&($.textContent=`Protein: ${i}g (${u}%)`),b&&(b.textContent=`Carbs: ${r}g (${l}%)`),y&&(y.textContent=`Fat: ${c}g (${D}%)`),M&&(M.textContent=`Alcohol: ${h}g (${H}%)`);let k=100,_=100,g=70,E={protein:"#4CAF50",carbs:"#2196F3",fat:"#FF9800",alcohol:"#9C27B0"},A=-90,C=[];if(a>0){if(e>0){let o=e/a*360;C.push({startAngle:A,endAngle:A+o,color:E.protein,label:"Protein"}),A+=o}if(t>0){let o=t/a*360;C.push({startAngle:A,endAngle:A+o,color:E.carbs,label:"Carbs"}),A+=o}if(s>0){let o=s/a*360;C.push({startAngle:A,endAngle:A+o,color:E.fat,label:"Fat"}),A+=o}if(n>0){let o=n/a*360;C.push({startAngle:A,endAngle:A+o,color:E.alcohol,label:"Alcohol"})}}let m=o=>o*Math.PI/180,p=(o,f)=>{let x=m(o),v=m(f),I=k+g*Math.cos(x),P=_+g*Math.sin(x),F=k+g*Math.cos(v),O=_+g*Math.sin(v),G=Math.abs(f-o)>180?1:0;return`M ${k} ${_} L ${I} ${P} A ${g} ${g} 0 ${G} 1 ${F} ${O} Z`},w='<svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">';a===0||C.length===0?w+=`
      <circle cx="${k}" cy="${_}" r="${g}"
              fill="none" stroke="#eee" stroke-width="2"/>
      <text x="${k}" y="${_}" text-anchor="middle"
            font-family="var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif)"
            font-size="14" fill="var(--secondary-text-color, #666)">No Data</text>
    `:C.forEach(o=>{w+=`
        <path d="${p(o.startAngle,o.endAngle)}"
              fill="${o.color}"
              stroke="#fff"
              stroke-width="1"/>
      `}),w+="</svg>",q.innerHTML=w}});var He=B(()=>{var ge=class extends HTMLElement{constructor(){super(),this._eventsAttached=!1,this._range="1m",this._weightData=[],this._lastGoalStartDate=null,this._resizeObserver=null,this.ranges=[{label:"Last 2 weeks",value:"2w"},{label:"Last month",value:"1m"},{label:"Last 2 months",value:"2m"},{label:"Last 4 months",value:"4m"},{label:"Last 6 months",value:"6m"},{label:"Last year",value:"1y"},{label:"Since last goal",value:"goal"},{label:"All",value:"all"}]}setConfig(e){this.config=e||{},this.profileEntityId=e.profile_entity_id||null,this.title=typeof e.title=="string"?e.title:"",this.innerHTML=`
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
    `,this._syncLastGoalRangeAvailability()}set hass(e){this._hass=e,this._updateCard()}get hass(){return this._hass}async _updateCard(){let e=this.querySelector(".weight-chart");if(!e||!this._hass)return;let t=this.profileEntityId;if(t||(t=Object.keys(this._hass.states).find(s=>s.startsWith("sensor.calorie_tracker_")&&this._hass.states[s])),!t){e.innerHTML="<div>No calorie tracker profile entity found</div>";return}try{let s=this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_weight_history",entity_id:t}),n=this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:t}).catch(()=>null),[a,i]=await Promise.all([s,n]);this._weightData=a.weight_history||[],this._lastGoalStartDate=this._extractLastGoalStartDate(i&&Array.isArray(i.goals)?i.goals:null),this._syncLastGoalRangeAvailability(),this._renderChart()}catch(s){this._lastGoalStartDate=null,this._syncLastGoalRangeAvailability(),e.innerHTML="<div>Failed to fetch weight data</div>"}if(!this._eventsAttached){let s=this.querySelector(".weight-range-select");s&&(s.value=this._range,s.addEventListener("change",a=>{if(this._range=a.target.value,this._range==="goal"&&!this._lastGoalStartDate){this._range="1m",s.value=this._range;return}this._renderChart()}));let n=this.querySelector(".weight-chart");n&&window.ResizeObserver&&(this._resizeObserver=new ResizeObserver(()=>{this._renderChart()}),this._resizeObserver.observe(n)),this._eventsAttached=!0}}disconnectedCallback(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=null)}_filterDataByRange(e,t){if(!e||!Array.isArray(e)||e.length===0)return[];if(t==="all")return e;if(t==="goal"){if(!this._lastGoalStartDate)return[];let a=this._lastGoalStartDate;return e.filter(i=>!i||typeof i.date!="string"?!1:i.date.slice(0,10)>=a)}let s=new Date,n;switch(t){case"2w":n=new Date(s),n.setDate(s.getDate()-13);break;case"1m":n=new Date(s),n.setMonth(s.getMonth()-1);break;case"2m":n=new Date(s),n.setMonth(s.getMonth()-2);break;case"4m":n=new Date(s),n.setMonth(s.getMonth()-4);break;case"6m":n=new Date(s),n.setMonth(s.getMonth()-6);break;case"1y":n=new Date(s),n.setFullYear(s.getFullYear()-1);break;default:return e}return e.filter(a=>new Date(a.date)>=n)}_renderChart(){let e=this.querySelector(".weight-chart"),t=this.querySelector(".legend-items");e&&requestAnimationFrame(()=>{this._doRenderChart(e,t)})}_doRenderChart(e,t){if(!e)return;let s=this._filterDataByRange(this._weightData,this._range);if(!s.length||s.length<2){let d="No weight data available for this range.";this._range==="goal"&&(d=this._lastGoalStartDate?"Need more weight entries since your last goal to display progress.":"Set a goal to track progress from your most recent goal start date."),e.innerHTML=`<div>${d}</div>`,t&&(t.innerHTML="");return}let n=this.profileEntityId||this._hass&&Object.keys(this._hass.states).find(d=>d.startsWith("sensor.calorie_tracker_")),a=null,i=null,r="kg";if(n&&this._hass&&this._hass.states[n]){let d=this._hass.states[n].attributes||{},S=L=>{if(L==null)return null;let T=Number(L);return Number.isFinite(T)?T:null};a=S(d.starting_weight),i=S(d.goal_weight),r=d.weight_unit||"kg"}let c=400,h=260,u=40,l=s.map(d=>new Date(d.date)),D=s.map(d=>d.weight),H=Math.min(...D),$=Math.max(...D),b=l[0],y=l[l.length-1],M=1440*60*1e3,k=Math.max((y-b)/M,1),_=(()=>{if(l.length<2)return null;let d=l.map(j=>(j.getTime()-b.getTime())/M),S=D,L=d.length,T=0,N=0,K=0,U=0;for(let j=0;j<L;j++){let Z=d[j],le=S[j];T+=Z,N+=le,K+=Z*le,U+=Z*Z}let ee=L*U-T*T;if(Math.abs(ee)<1e-9)return null;let J=(L*K-T*N)/ee,oe=(N-J*T)/L,pe=N/L,Q=0,te=0;for(let j=0;j<L;j++){let Z=oe+J*d[j],le=S[j];Q+=(le-pe)**2,te+=(le-Z)**2}let fe=Q>0?1-te/Q:1;return{slope:J,intercept:oe,weightAt:j=>{let Z=(j.getTime()-b.getTime())/M;return oe+J*Z},rSquared:fe}})(),g=0,E=y,A=null,C=!1;if(_){let d=_.slope,S=k,L=_.weightAt(y),T=S;if(i!==null&&Math.abs(d)>1e-6){let N=(i-L)/d;N>=0&&(C=!0,A=N,T=Math.min(T,N))}Math.abs(d)>1e-6&&(g=Math.max(0,T),g>0&&(E=new Date(y.getTime()+g*M)))}let m=g>0?E:y,p=b.getTime(),w=m.getTime(),o=d=>u+(d.getTime()-p)/Math.max(w-p,1)*(c-2*u),f=H,x=$;if(i!==null&&(f=Math.min(f,i),x=Math.max(x,i)),_&&g>0){let d=_.weightAt(E);f=Math.min(f,d),x=Math.max(x,d)}let v=x-f||1,I=.15,P=f-v*I,F=x+v*I,O=a!==null&&a>=P&&a<=F,G=i!==null&&i>=P&&i<=F;if(t){let d="";if(a!==null){let S=O?"":a>F?" \u2191":" \u2193";d+=`<div style="display:flex;align-items:center;"><div style="width:12px;height:2px;background:#ff9800;margin-right:4px;border-style:dashed;border-width:1px 0;border-color:#ff9800;"></div><span style="font-size:12px;">Start: ${a}${S}</span></div>`}if(i!==null){let S=G?"":i>F?" \u2191":" \u2193";d+=`<div style="display:flex;align-items:center;"><div style="width:12px;height:2px;background:#8bc34a;margin-right:4px;border-style:dashed;border-width:1px 0;border-color:#8bc34a;"></div><span style="font-size:12px;">Goal: ${i}${S}</span></div>`}t.innerHTML=d}let z=this.querySelector(".weight-prediction");if(z)if(!_)z.style.display="none";else{let d=_.slope*7,S=d>=0?`+${d.toFixed(2)}`:d.toFixed(2),L=_.rSquared>.8?"high":_.rSquared>.5?"medium":"low",N=`<strong>Trend:</strong> ${S} ${r}/week <span style="color:${L==="high"?"var(--success-color, #4caf50)":L==="medium"?"var(--warning-color, #ff9800)":"var(--error-color, #f44336)"};font-weight:bold;">(${L} confidence)</span>`;if(i===null)N+="<br/><em>Set a goal weight to see a predicted goal date.</em>";else if(Math.abs(_.slope)<1e-6)N+="<br/><em>Trend is flat, unable to project goal date.</em>";else if(!C)N+="<br/><em>Trend is moving away from the goal weight.</em>";else if(A!==null&&Number.isFinite(A)){let K=new Date(y.getTime()+A*M),ee=Math.round((K-new Date)/M),J=K.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});N+=`<br/><strong>Goal projection:</strong> ${J} (${ee} days)`}else N+="<br/><em>Unable to calculate goal projection.</em>";z.innerHTML=N,z.style.display="block"}let Y=d=>h-u-(d-P)/(F-P)*(h-2*u),X=s.map(d=>[o(new Date(d.date)),Y(d.weight)]),R=`<svg viewBox='0 0 ${c} ${h}' preserveAspectRatio='xMidYMid meet' style='width:100%;height:auto;'>`,Ce=d=>{let S=d.getDate().toString().padStart(2,"0"),T=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];return`${S} ${T}`};for(let d=0;d<5;d++){let S=d/4,L=p+S*(w-p),T=new Date(L),N=o(T);R+=`<line x1='${N}' y1='${u}' x2='${N}' y2='${h-u}' stroke='#d0d0d0' stroke-width='0.5' stroke-dasharray='3,3' />`,R+=`<text x='${N}' y='${h-u+18}' font-size='11' fill='#888' text-anchor='middle'>${Ce(T)}</text>`}for(let d=0;d<5;d++){let S=d/4,L=P+S*(F-P),T=Y(L);R+=`<line x1='${u}' y1='${T}' x2='${c-u}' y2='${T}' stroke='#d0d0d0' stroke-width='0.5' stroke-dasharray='3,3' />`,R+=`<text x='${u-12}' y='${T+4}' font-size='11' fill='#888' text-anchor='end'>${L.toFixed(1)}</text>`}if(R+=`<polyline fill='none' stroke='#03a9f4' stroke-width='2' points='${X.map(d=>d.join(",")).join(" ")}' />`,_){let d=b,S=y,L=o(d),T=Y(_.weightAt(d)),N=o(S),K=Y(_.weightAt(S));if(R+=`<line x1='${L}' y1='${T}' x2='${N}' y2='${K}' stroke='#9c27b0' stroke-width='2' opacity='0.9' />`,g>0){let U=y,ee=_.weightAt(U),J=_.weightAt(E),oe=o(U),pe=Y(ee),Q=o(E),te=Y(J);R+=`<line x1='${oe}' y1='${pe}' x2='${Q}' y2='${te}' stroke='#9c27b0' stroke-width='1.75' stroke-dasharray='8,6' opacity='0.6' />`,R+=`<circle cx='${Q}' cy='${te}' r='3.5' fill='#9c27b0' opacity='0.6' />`;let fe=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],ye=E,j=`${ye.getDate()} ${fe[ye.getMonth()]}`;R+=`<text x='${Q}' y='${te-12}' font-size='10' fill='#9c27b0' text-anchor='middle' opacity='0.7'>${j}</text>`}}if(X.forEach((d,S)=>{R+=`<circle class='weight-point' data-index='${S}' cx='${d[0]}' cy='${d[1]}' r='4' fill='#03a9f4' stroke='#fff' stroke-width='1.5' style='cursor:pointer;' />`}),O){let d=Y(a);R+=`<line x1='${u}' y1='${d}' x2='${c-u}' y2='${d}' stroke='#ff9800' stroke-dasharray='4,2' stroke-width='1.5' />`}if(G){let d=Y(i);R+=`<line x1='${u}' y1='${d}' x2='${c-u}' y2='${d}' stroke='#8bc34a' stroke-dasharray='4,2' stroke-width='1.5' />`}if(a!==null&&!O){let d=a>F,S=d?u+5:h-u-5,L=d?"\u2191":"\u2193";R+=`<text x='${c-u-40}' y='${S}' font-size='12' fill='#ff9800' text-anchor='start'>Start ${L}</text>`}if(i!==null&&!G){let d=i>F,S=d?u+5:h-u-5,L=d?"\u2191":"\u2193",T=a!==null&&!O&&i>F==a>F?80:40;R+=`<text x='${c-u-T}' y='${S}' font-size='12' fill='#8bc34a' text-anchor='start'>Goal ${L}</text>`}R+="</svg>",e.innerHTML=`<div style="position:relative;width:100%;">${R}<div class="weight-tooltip" style="position:absolute;display:none;background:rgba(0,0,0,0.8);color:white;padding:8px 12px;border-radius:4px;font-size:12px;pointer-events:none;z-index:1000;white-space:nowrap;"></div></div>`;let re=e.querySelector(".weight-tooltip");e.querySelectorAll(".weight-point").forEach(d=>{d.addEventListener("mouseenter",S=>{let L=parseInt(S.target.getAttribute("data-index")),T=s[L],N=new Date(T.date);re.innerHTML=`<div><strong>${Ce(N)}</strong></div><div>${T.weight} ${r}</div>`,re.style.display="block"}),d.addEventListener("mousemove",S=>{let L=e.getBoundingClientRect();re.style.left=S.clientX-L.left+10+"px",re.style.top=S.clientY-L.top-10+"px"}),d.addEventListener("mouseleave",()=>{re.style.display="none"})})}_extractLastGoalStartDate(e){if(!Array.isArray(e)||e.length===0)return null;let t=e.map(s=>{if(!s||typeof s.start_date!="string")return null;let n=s.start_date.trim();return n?n.slice(0,10):null}).filter(Boolean);return t.length?t.reduce((s,n)=>s&&s>n?s:n,null):null}_syncLastGoalRangeAvailability(){let e=this.querySelector(".weight-range-select");if(!e)return;let t=[...e.options].find(n=>n.value==="goal");if(!t)return;let s=!!this._lastGoalStartDate;if(t.disabled=!s,t.hidden=!s,s){let n=new Date(this._lastGoalStartDate);if(Number.isNaN(n.getTime()))t.textContent="Since last goal";else{let a=n.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});t.textContent=`Since last goal (${a})`}}else t.textContent="Since last goal",this._range==="goal"&&(this._range="1m",e.value=this._range)}};customElements.get("weight-progress-card")||customElements.define("weight-progress-card",ge);window.customCards=window.customCards||[];window.customCards.push({type:"weight-progress-card",name:"Calorie Tracker: Weight Progress",description:"Displays weight history and progress for Calorie Tracker",editor:"weight-progress-editor",preview:!0});var ke=class extends HTMLElement{setConfig(e){this._config=e||{},this._render()}set hass(e){this._hass=e,this._render()}_render(){this._config||(this._config={});let e=[["2w","Last 2 weeks"],["1m","Last month"],["2m","Last 2 months"],["4m","Last 4 months"],["6m","Last 6 months"],["1y","Last year"],["goal","Since last goal"],["all","All"]],t=this._config.default_range||"1m";this.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:8px;">
        <paper-input label="Title (optional)" value="${this._escape(this._config.title||"")}"></paper-input>
        <label style="font-size:12px;color:var(--secondary-text-color);">Profile entity (required)</label>
        <ha-entity-picker dialog-opp="right" include-domains="sensor" allow-custom-entity value="${this._escape(this._config.profile_entity_id||"")}"></ha-entity-picker>
        <label style="font-size:12px;color:var(--secondary-text-color);">Default range</label>
        <select>${e.map(c=>`<option value="${c[0]}" ${c[0]===t?"selected":""}>${c[1]}</option>`).join("")}</select>
        <div class="error" style="color:var(--error-color);display:none;">Profile entity is required</div>
      </div>
    `;let s=this.querySelector("paper-input"),n=this.querySelector("ha-entity-picker"),a=this.querySelector("select"),i=this.querySelector(".error"),r=()=>{let c=W({},this._config);s&&s.value?c.title=s.value.trim():delete c.title,n&&n.value?c.profile_entity_id=n.value:delete c.profile_entity_id,a&&a.value?c.default_range=a.value:delete c.default_range,c.profile_entity_id?i&&(i.style.display="none"):i&&(i.style.display="block"),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:c}}))};s&&s.addEventListener("value-changed",r),n&&n.addEventListener("value-changed",r),a&&a.addEventListener("change",r)}_escape(e){return String(e).replace(/"/g,"&quot;")}};customElements.get("weight-progress-editor")||customElements.define("weight-progress-editor",ke);ge.getConfigForm=function(){return{schema:[{name:"title",selector:{text:{}}},{name:"profile_entity_id",required:!0,selector:{entity:{domain:"sensor",allow_custom_entity:!0}}},{name:"default_range",selector:{select:{options:[{value:"2w",label:"Last 2 weeks"},{value:"1m",label:"Last month"},{value:"2m",label:"Last 2 months"},{value:"4m",label:"Last 4 months"},{value:"6m",label:"Last 6 months"},{value:"1y",label:"Last year"},{value:"goal",label:"Since last goal"},{value:"all",label:"All"}]}}}]}};ge.getStubConfig=function(){return{profile_entity_id:"",default_range:"1m"}}});var Pe=B(()=>{var dt=V(Se()),ut=V(Le()),gt=V(Ee()),pt=V(Ae()),ft=V(De()),yt=V(qe()),mt=V(Te()),_t=V(Fe()),xt=V(He())});export default Pe();
//# sourceMappingURL=cards.js.map
