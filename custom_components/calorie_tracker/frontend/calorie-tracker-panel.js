import{a as C}from"./chunks/chunk-5KRPXR26.js";import{b as I}from"./chunks/chunk-TDKEUX4J.js";import{a as z}from"./chunks/chunk-TLFVXSJI.js";import{a as S,b as d,g as $,h as E}from"./chunks/chunk-EMR7U3YA.js";import{a as m,b as D,e as L,f as x,g as f}from"./chunks/chunk-5HHMTMB7.js";var U=L(()=>{E();var R=x(C());I();var A=x(z());async function M(c){var p;return!(c!=null&&c.connection)||!((p=c==null?void 0:c.user)!=null&&p.id)?{}:await c.connection.sendMessagePromise({type:"calorie_tracker/get_user_profile",user_id:c.user.id})}function T(c=new Date){let p=c.getFullYear(),i=String(c.getMonth()+1).padStart(2,"0"),t=String(c.getDate()).padStart(2,"0");return`${p}-${i}-${t}`}var u=class extends ${constructor(){super();f(this,"_contentBounds",{left:0,width:0});f(this,"_contentResizeObserver",null);f(this,"_translationsRequestedLang",null);f(this,"_translations",{});f(this,"_onHassReconnect",async()=>{await this._initializeProfile(),await this._fetchDiscoveredData()});f(this,"_onVisibilityChange",async()=>{if(document.visibilityState==="visible"){if(this._isLoading=!0,this.requestUpdate(),await this._ensureConnectionReady())try{await this._initializeProfile(),await this._fetchDiscoveredData()}catch(t){console.error("[CalorieTrackerPanel] Error refreshing data on visibility change:",t)}else console.warn("[CalorieTrackerPanel] Connection not ready after visibility change");this._isLoading=!1,this.requestUpdate()}});f(this,"_onProfileModalOpen",()=>{var t;this._profileModalDepth+=1;let i=(t=this.renderRoot)==null?void 0:t.querySelector("ha-card.main-card");i&&i.classList.add("profile-modal-active")});f(this,"_onProfileModalClose",()=>{var i;if(this._profileModalDepth=Math.max(0,this._profileModalDepth-1),this._profileModalDepth===0){let t=(i=this.renderRoot)==null?void 0:i.querySelector("ha-card.main-card");t&&t.classList.remove("profile-modal-active")}});this.narrow=!1,this._hass=null,this._profile=null,this._allProfiles=[],this._selectedEntityId="",this._defaultProfile=null,this._discoveredData=[],this._imageAnalyzers=[];let i=new Date;this._selectedDate=T(i),this._showLinkDiscoveredPopup=!1,this._linkProfileId="",this._linkSelections={},this._goals=[],this._profileModalDepth=0,this._contentBounds={left:0,width:0},this._isLoading=!1,this._log={},this._weeklySummary={}}_t(i,t){var s;let e=(s=this._translations)==null?void 0:s[i];return typeof e=="string"&&e.length>0?e:t}async _loadTranslationsForLanguage(i){var t;if((t=this._hass)!=null&&t.connection)try{let e=await this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_translations",language:i,namespace:"frontend.panel"});this._translations=(e==null?void 0:e.translations)||{},this._translationsRequestedLang=i,this._updatePanelTitles(),this.requestUpdate()}catch(e){this._translations=this._translations||{},this._translationsRequestedLang=i,this._updatePanelTitles()}}_updatePanelTitles(){var s;let i=this._t("panel_title","Calorie Tracker");document.title=i;let t=(s=this._hass)==null?void 0:s.panels,e=null;t!=null&&t.get?e=t.get("calorie_tracker")||t.get("calorie-tracker")||t.get("calorie_tracker_panel"):t&&typeof t=="object"&&(e=t.calorie_tracker||t["calorie-tracker"]||t.calorie_tracker_panel),e&&("title"in e&&(e.title=i),"sidebarTitle"in e&&(e.sidebarTitle=i),"_sidebarTitle"in e&&(e._sidebarTitle=i))}async _ensureConnectionReady(i=10,t=300){var e,s;for(let a=0;a<i;a++){if((s=(e=this._hass)==null?void 0:e.connection)!=null&&s.connected)try{return await this._hass.connection.sendMessagePromise({type:"get_config"}),!0}catch(n){console.debug("[CalorieTrackerPanel] Connection check failed, retrying...",n)}await new Promise(n=>setTimeout(n,t))}return console.warn("[CalorieTrackerPanel] Connection not ready after retries"),!1}async _fetchDiscoveredData(){var i,t;if(!((t=(i=this._hass)==null?void 0:i.connection)!=null&&t.connected)){this._discoveredData=[],this._imageAnalyzers=[],console.warn("[CalorieTrackerPanel] Connection not ready, skipping discovered data fetch");return}try{let e=await this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_discovered_data"});this._discoveredData=(e==null?void 0:e.discovered_data)||[],this._imageAnalyzers=(e==null?void 0:e.image_analyzers)||[]}catch(e){this._discoveredData=[],this._imageAnalyzers=[],console.error("[CalorieTrackerPanel] Error fetching discovered data:",e)}this.requestUpdate()}set hass(i){var e;this._hass=i;let t=((e=i==null?void 0:i.locale)==null?void 0:e.language)||(i==null?void 0:i.language)||"en";this._translationsRequestedLang!==t?this._loadTranslationsForLanguage(t):this._updatePanelTitles(),this.isConnected&&(this._initializeProfile(),this._fetchDiscoveredData())}connectedCallback(){super.connectedCallback(),this._updatePanelTitles(),this._hass&&(this._initializeProfile(),this._fetchDiscoveredData()),window.addEventListener("hass-reconnected",this._onHassReconnect),document.addEventListener("visibilitychange",this._onVisibilityChange),this.addEventListener("profile-modal-open",this._onProfileModalOpen),this.addEventListener("profile-modal-close",this._onProfileModalClose),this._checkForDeepLink(),requestAnimationFrame(()=>{var t;let i=(t=this.shadowRoot)==null?void 0:t.querySelector(".content");i&&(this._updateContentBounds(),this._contentResizeObserver=new ResizeObserver(()=>{this._updateContentBounds()}),this._contentResizeObserver.observe(i))})}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hass-reconnected",this._onHassReconnect),document.removeEventListener("visibilitychange",this._onVisibilityChange),this.removeEventListener("profile-modal-open",this._onProfileModalOpen),this.removeEventListener("profile-modal-close",this._onProfileModalClose),this._contentResizeObserver&&(this._contentResizeObserver.disconnect(),this._contentResizeObserver=null),document.title="Home Assistant"}_updateContentBounds(){var t;let i=(t=this.shadowRoot)==null?void 0:t.querySelector(".content");if(i){let e=i.getBoundingClientRect();this._contentBounds={left:e.left,width:e.width},this.requestUpdate()}}async _fetchProfileData(i,t=null){var e,s,a,n,r,l,_,h,y,w,b,P;try{if(!((e=this._hass)!=null&&e.connection)||!i)return{log:{},weight:null,weekly_summary:{},linked_components:{}};let[o,g,k,v]=await Promise.all([this._hass.connection.sendMessagePromise(m({type:"calorie_tracker/get_daily_data",entity_id:i},t?{date:t}:{})),this._hass.connection.sendMessagePromise(m({type:"calorie_tracker/get_weekly_summary",entity_id:i},t?{date:t}:{})),this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_linked_components",entity_id:i}),this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:i})]);return{log:{food_entries:(s=o==null?void 0:o.food_entries)!=null?s:[],exercise_entries:(a=o==null?void 0:o.exercise_entries)!=null?a:[],weight:(n=o==null?void 0:o.weight)!=null?n:null,body_fat_pct:(r=o==null?void 0:o.body_fat_pct)!=null?r:null,bmr_and_neat:(l=o==null?void 0:o.bmr_and_neat)!=null?l:null,macros:(_=o==null?void 0:o.macros)!=null?_:{},config_entry_id:(h=o==null?void 0:o.config_entry_id)!=null?h:null},weight:(y=o==null?void 0:o.weight)!=null?y:null,weekly_summary:(w=g==null?void 0:g.weekly_summary)!=null?w:{},linked_components:(b=k==null?void 0:k.linked_components)!=null?b:{},goals:(P=v==null?void 0:v.goals)!=null?P:[]}}catch(o){if(o&&(o.code===403||o.status===403)){window.location.href="/";return}throw o}}async _initializeProfile(){var i,t;if(!((t=(i=this._hass)==null?void 0:i.connection)!=null&&t.connected)){console.warn("[CalorieTrackerPanel] Connection not ready, skipping profile initialization");return}try{let e=await M(this._hass);this._defaultProfile=(e==null?void 0:e.default_profile)||null,this._allProfiles=(e==null?void 0:e.all_profiles)||[];let s=this._selectedEntityId;if((!s||!this._allProfiles.some(a=>a.entity_id===s))&&(e!=null&&e.default_profile&&e.default_profile.entity_id?s=e.default_profile.entity_id:this._allProfiles.length>0?s=this._allProfiles[0].entity_id:s=""),this._selectedEntityId=s,this._selectedEntityId){let{log:a,weight:n,weekly_summary:r,linked_components:l,goals:_}=await this._fetchProfileData(this._selectedEntityId,this._selectedDate);this._log=a,this._weight=n,this._weeklySummary=r,this._linkedComponents=l,this._goals=_}else this._log={},this._weight=null,this._weeklySummary={},this._linkedComponents={},this._goals=[]}catch(e){this._defaultProfile=null,this._allProfiles=[],this._selectedEntityId="",this._log={},this._weight=null,this._weeklySummary={},this._linkedComponents={},this._goals=[],console.error("[CalorieTrackerPanel] Failed to fetch user profile:",e)}this._selectProfile(),this.requestUpdate()}async _checkForDeepLink(){try{let{params:i,source:t}=this._getDeepLinkParams(),e=i.get("modal"),s=i.get("profile")||i.get("entity_id")||i.get("config_entry_id");if(!e)return;if(s)if(this._allProfiles&&this._allProfiles.length){let a=s,n=(a||"").trim().toLowerCase(),r=this._allProfiles.find(l=>l.entity_id===a||l.config_entry_id===a||l.entity_id===`profile.${a}`);if(!r){let l=h=>(h||"").toString().trim().toLowerCase().replace(/[\s_-]+/g,""),_=l(n);r=this._allProfiles.find(h=>{if(!h.spoken_name)return!1;let y=h.spoken_name.toString().trim().toLowerCase();return y===n||l(y)===_})}r&&(this._selectedEntityId=r.entity_id,await this._fetchProfileData(this._selectedEntityId,this._selectedDate),this._selectProfile(),this.requestUpdate())}else{setTimeout(()=>this._checkForDeepLink(),250);return}setTimeout(()=>this._openModalOnLoad(e),300),this._clearModalParam(t)}catch(i){console.warn("[CalorieTrackerPanel] deep-link check failed",i)}}_getDeepLinkParams(){let i=new URL(window.location.href);if(i.search){let s=new URLSearchParams(i.search);if(s.has("modal"))return{params:s,source:"search"}}let t=window.location.hash||"",e=t.indexOf("?");if(e!==-1&&e<t.length-1){let s=new URLSearchParams(t.slice(e+1));if(s.has("modal"))return{params:s,source:"hash"}}return{params:new URLSearchParams(i.search),source:"none"}}_openModalOnLoad(i){var t;try{let e=(t=this.renderRoot)==null?void 0:t.querySelector("daily-data-card");if(i==="chat"){e&&typeof e._openChatAssist=="function"?e._openChatAssist():e?e.dispatchEvent(new CustomEvent("open-chat-assist",{bubbles:!0,composed:!0})):setTimeout(()=>this._openModalOnLoad(i),200);return}e&&typeof e._openPhotoAnalysis=="function"?(e._openPhotoAnalysis(),i&&setTimeout(()=>{try{i==="food_camera"&&typeof e._selectAnalysisType=="function"?e._selectAnalysisType("food"):i==="bodyfat_camera"&&typeof e._selectAnalysisType=="function"&&e._selectAnalysisType("bodyfat")}catch(s){}},250)):e?e.dispatchEvent(new CustomEvent("open-photo-analysis",{detail:{modal:i},bubbles:!0,composed:!0})):setTimeout(()=>this._openModalOnLoad(i),200)}catch(e){console.warn("[CalorieTrackerPanel] failed to open modal on load",e)}}_clearModalParam(i="search"){try{let t=new URL(window.location.href);if(i==="hash"){let a=window.location.hash||"",n=a.indexOf("?");if(n===-1)return;let r=a.slice(0,n),l=new URLSearchParams(a.slice(n+1));if(!l.has("modal"))return;l.delete("modal");let _=`${r}${l.toString()?`?${l.toString()}`:""}`,h=`${t.pathname}${t.search}${_}`;window.history.replaceState({},document.title,h);return}let e=t.searchParams;if(!e.has("modal"))return;e.delete("modal");let s=`${t.pathname}${e.toString()?`?${e.toString()}`:""}${t.hash}`;window.history.replaceState({},document.title,s)}catch(t){}}_selectProfile(){if(!this._hass||!this._allProfiles.length){this._profile=null,this._selectedEntityId="";return}let i=this._selectedEntityId;(!i||!this._allProfiles.some(t=>t.entity_id===i))&&(i=this._allProfiles[0].entity_id),this._selectedEntityId=i,this._profile=this._hass.states[i]||null}_openLinkDiscoveredPopup(){this._linkProfileId=this._allProfiles.length>0?this._allProfiles[0].entity_id:"",this._linkSelections=Object.fromEntries((this._discoveredData||[]).map(i=>[i.entry_id,!0])),this._showLinkDiscoveredPopup=!0}_closeLinkDiscoveredPopup(){this._showLinkDiscoveredPopup=!1}_onLinkProfileChange(i){this._linkProfileId=i.target.value}_onLinkSelectionChange(i,t){this._linkSelections=D(m({},this._linkSelections),{[t]:i.target.checked})}async _saveLinkSelections(){var e;if(!((e=this._hass)!=null&&e.connection)||!this._linkProfileId)return;let i=Object.entries(this._linkSelections).filter(([s,a])=>a).map(([s,a])=>{let n=(this._discoveredData||[]).find(r=>r.entry_id===s);return n?{linked_domain:n.domain,linked_component_entry_id:n.entry_id}:null}).filter(Boolean);if(i.length===0){this._showSnackbar&&this._showSnackbar("No devices selected",!0);return}let t={};for(let{linked_domain:s,linked_component_entry_id:a}of i)t[s]||(t[s]=[]),t[s].push(a);try{for(let[s,a]of Object.entries(t))await this._hass.connection.sendMessagePromise({type:"calorie_tracker/link_discovered_components",calorie_tracker_entity_id:this._linkProfileId,linked_domain:s,linked_component_entry_ids:a});this._showSnackbar&&this._showSnackbar("Devices linked"),this._showLinkDiscoveredPopup=!1,this._fetchDiscoveredData(),this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:s,weight:a,weekly_summary:n,linked_components:r,goals:l})=>{this._log=s,this._weight=a,this._weeklySummary=n,this._linkedComponents=r||{},this._goals=l||[],this.requestUpdate()}).catch(s=>{console.error("Failed to refresh profile data after linking:",s)})}catch(s){this._showSnackbar&&this._showSnackbar("Failed to link devices",!0)}}_renderLinkDiscoveredPopup(){let i=this._allProfiles;return d`
      <div id="link-discovered-modal" class="modal" @click=${this._closeLinkDiscoveredPopup}>
        <div class="modal-content" @click=${t=>t.stopPropagation()}>
          <div class="modal-header">Link Discovered Data</div>
          <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <span>Link data to</span>
            <select class="edit-input" style="min-width: 90px; max-width: 180px; flex: 0 1 auto;" @change=${this._onLinkProfileChange} .value=${this._linkProfileId}>
              ${i.map(t=>d`<option value="${t.entity_id}">${t.spoken_name}</option>`)}
            </select>
          </div>
          <div style="max-height:260px;overflow-y:auto;">
            ${(this._discoveredData||[]).map(t=>d`
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <input type="checkbox" .checked=${!!this._linkSelections[t.entry_id]} @change=${e=>this._onLinkSelectionChange(e,t.entry_id)} />
                <span style="min-width:90px;">${t.domain}</span>
                <span style="min-width:60px;">${t.title||t.username||"?"}</span>
              </div>
            `)}
          </div>
          <div class="edit-actions" style="margin-top:18px;">
            <button class="ha-btn" style="font-size: 1em;" @click=${this._saveLinkSelections}>Save</button>
            <button class="ha-btn" style="font-size: 1em;" @click=${this._closeLinkDiscoveredPopup}>Cancel</button>
          </div>
        </div>
      </div>
    `}render(){var i,t,e,s,a,n,r,l,_,h;return d`
      <div class="header">
        <div class="header-row">
          ${this.narrow?d`<ha-menu-button .hass=${this._hass} .narrow=${this.narrow}></ha-menu-button>`:""}
          <div class="title">${this._t("panel_title","Calorie Tracker")}</div>
        </div>
      </div>

        <div class="content">
          ${this._isLoading?d`
            <ha-card>
              <div class="card-content" style="text-align: center; padding: 24px;">
                <div style="color: var(--primary-text-color);">Loading...</div>
              </div>
            </ha-card>
          `:d`
            <ha-card class="main-card">
              <div class="card-content">
                <profile-card
                  .hass=${this._hass}
                  .profile=${this._profile}
                  .allProfiles=${this._allProfiles}
                  .defaultProfile=${this._defaultProfile}
                  .linkedDevices=${this._linkedComponents}
                  .goalType=${((t=(i=this._weeklySummary)==null?void 0:i[this._selectedDate])==null?void 0:t[4])||"Not Set"}
                  .dailyGoal=${((s=(e=this._weeklySummary)==null?void 0:e[this._selectedDate])==null?void 0:s[3])||null}
                  .currentWeight=${((n=(a=this._weeklySummary)==null?void 0:a[this._selectedDate])==null?void 0:n[5])||null}
                  .goalValue=${((l=(r=this._weeklySummary)==null?void 0:r[this._selectedDate])==null?void 0:l[6])||null}
                  .goals=${this._goals}
                  @profile-selected=${this._onProfileSelected}
                  @goals-updated=${this._onGoalsUpdated}
                  @refresh-profile=${this._onRefreshProfile}
                />
              </div>
            </ha-card>

            ${this._discoveredData&&this._discoveredData.length>0?d`
              <div style="text-align:center; margin: 16px 0;">
                <button class="ha-btn" style="font-size: 1em; min-width: 120px; min-height: 36px;" @click=${this._openLinkDiscoveredPopup}>
                  Link Discovered Data
                </button>
              </div>
            `:""}

            <ha-card class="main-card">
              <div class="card-content">
                ${this._profile?d`
                      <calorie-summary
                        .hass=${this._hass}
                        .profile=${this._profile}
                        .weeklySummary=${this._weeklySummary}
                        .selectedDate=${this._selectedDate}
                        .weight=${this._weight}
                        .weekStartDay=${((h=(_=this._profile)==null?void 0:_.attributes)==null?void 0:h.week_start_day)||"sunday"}
                        @select-summary-date=${this._onSelectSummaryDate}
                        @refresh-summary=${this._onRefreshSummary}
                      ></calorie-summary>
                    `:d`<div>Calorie Tracker profile not found.</div>`}
              </div>
            </ha-card>

            <ha-card class="main-card">
              <div class="card-content">
                ${this._profile?d`
                      <daily-data-card
                        .hass=${this._hass}
                        .profile=${this._profile}
                        .log=${this._log}
                        .selectedDate=${this._selectedDate}
                        .imageAnalyzers=${this._imageAnalyzers}
                        .contentBounds=${this._contentBounds}
                        @edit-daily-entry=${this._onEditDailyEntry}
                        @delete-daily-entry=${this._onDeleteDailyEntry}
                        @add-daily-entry=${this._onAddDailyEntry}
                        @refresh-daily-data=${this._onRefreshDailyData}
                      ></daily-data-card>
                    `:d`<div>Calorie Tracker profile not found.</div>`}
              </div>
            </ha-card>
          `}
        </div>
      ${this._showLinkDiscoveredPopup?this._renderLinkDiscoveredPopup():""}
    `}_onSelectSummaryDate(i){let t=i.detail.date;this._selectedDate=t,this._fetchProfileData(this._selectedEntityId,t).then(({log:e,weight:s,weekly_summary:a})=>{this._log=e,this._weight=s,this._weeklySummary=a,this.requestUpdate()})}_onProfileSelected(i){this._selectedEntityId=i.detail.entityId,this._selectProfile(),this._profile&&this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:t,weight:e,weekly_summary:s,linked_components:a,goals:n})=>{this._log=t,this._weight=e,this._weeklySummary=s,this._linkedComponents=a||{},this._goals=n||[],this.requestUpdate()})}_onRefreshProfile(i){this._selectedEntityId&&this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:t,weight:e,weekly_summary:s,linked_components:a,goals:n})=>{this._log=t,this._weight=e,this._weeklySummary=s,this._linkedComponents=a||{},this._goals=n||[],this.requestUpdate()}).catch(t=>{console.error("Failed to refresh profile data:",t)})}_onEditDailyEntry(i){var a;let{entry_id:t,entry_type:e,entry:s}=i.detail;!((a=this._hass)!=null&&a.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/update_entry",entity_id:this._selectedEntityId,entry_id:t,entry_type:e,entry:s}).then(()=>{this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:n,weekly_summary:r})=>{this._log=n,this._weeklySummary=r,this.requestUpdate()}).catch(n=>{console.error("Failed to refresh profile data after update:",n)})}).catch(n=>{console.error("Failed to update entry:",n)})}_onDeleteDailyEntry(i){var s;let{entry_id:t,entry_type:e}=i.detail;!((s=this._hass)!=null&&s.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/delete_entry",entity_id:this._selectedEntityId,entry_id:t,entry_type:e}).then(()=>{this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:a,weekly_summary:n})=>{this._log=a,this._weeklySummary=n,this.requestUpdate()}).catch(a=>{console.error("Failed to refresh profile data after delete:",a)})}).catch(a=>{console.error("Failed to delete entry:",a)})}_onRefreshSummary(){this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:i,weight:t,weekly_summary:e})=>{this._log=i,this._weight=t,this._weeklySummary=e,this.requestUpdate()})}_onRefreshDailyData(){this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:i,weight:t,weekly_summary:e})=>{this._log=i,this._weight=t,this._weeklySummary=e,this.requestUpdate()})}_onAddDailyEntry(i){var s;let{entry_type:t,entry:e}=i.detail;!((s=this._hass)!=null&&s.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/create_entry",entity_id:this._selectedEntityId,entry_type:t,entry:e}).then(()=>{this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:a,weight:n,weekly_summary:r})=>{this._log=a,this._weight=n,this._weeklySummary=r,this.requestUpdate()}).catch(a=>{console.error("Failed to refresh profile data after add:",a)})}).catch(a=>{console.error("Failed to add entry:",a)})}_onGoalsUpdated(i){var t;!((t=this._hass)!=null&&t.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:this._selectedEntityId}).then(e=>{this._goals=(e==null?void 0:e.goals)||[],this.requestUpdate()}).catch(e=>{console.error("Failed to refresh goals:",e)})}};f(u,"styles",[S`
      :host {
        /* Unified modal layering variable for calorie tracker components */
        --ct-modal-z: 1500;
      }
      :host {
        display: block;
        min-height: 100vh;
        background-color: var(--primary-background-color);
      }

      /* Sticky (not fixed) so the header stays inside the panel area and never covers the sidebar */
      .header {
        position: sticky;
        top: 0;
        z-index: 100;
        box-sizing: border-box;
        padding-top: var(--safe-area-inset-top, 0px);
        padding-right: var(--safe-area-inset-right, 0px);
        background-color: var(--app-header-background-color);
        color: var(--app-header-text-color, var(--primary-text-color));
      }

      .header-row {
        box-sizing: border-box;
        height: var(--header-height, 56px);
        display: flex;
        align-items: center;
        padding: 0 12px;
        border-bottom: var(--app-header-border-bottom, none);
      }

      .header ha-menu-button {
        flex-shrink: 0;
        margin-inline-end: 4px;
      }

      .header .title {
        flex: 1;
        font-family: var(--mdc-typography-headline6-font-family, var(--paper-font-body1_-_font-family, Roboto, sans-serif));
        font-size: var(--mdc-typography-headline6-font-size, 1.25rem);
        font-weight: var(--mdc-typography-headline6-font-weight, 400);
        line-height: 1.5;
        padding-inline-start: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .content {
        padding: 8px;
        padding-bottom: calc(8px + var(--safe-area-inset-bottom, 0px));
        position: relative;
        z-index: 0; /* Keep content below sticky header */
      }

      .content > * {
        position: relative;
        z-index: 0;
      }

      .main-card {
        margin-bottom: 8px;
        position: relative;
      }

      /* When the profile card has an open modal, elevate its card above others */
      .main-card.profile-modal-active {
        z-index: 10;
      }

      .card-content {
        padding: 0px 16px;
      }
      .ha-btn {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border: none;
      border-radius: 4px;
      padding: 4px 9px;
      font-size: 0.85em;
      cursor: pointer;
      font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      transition: background 0.2s;
      min-width: 32px;
      min-height: 18px;
      font-weight: 500;
      letter-spacing: 0.0892857em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .ha-btn:hover {
      background: var(--primary-color-dark, #0288d1);
    }
    /* Modal styles copied and adapted from daily-data.js */
    .modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.32);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
    }
    .modal-content {
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      padding: 24px;
      border-radius: var(--ha-card-border-radius, 12px);
      min-width: 320px;
      max-width: 95vw;
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.2));
      text-align: left;
    }
    .modal-header {
      font-size: 1.15em;
      font-weight: 500;
      margin-bottom: 18px;
      color: var(--primary-text-color, #212121);
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
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
    .edit-actions button {
      min-width: 90px;
    }
    `]),f(u,"properties",{narrow:{type:Boolean},_hass:{attribute:!1},_profile:{attribute:!1},_allProfiles:{attribute:!1},_selectedEntityId:{type:String},_defaultProfile:{attribute:!1},_selectedDate:{type:String},_discoveredData:{attribute:!1},_showLinkDiscoveredPopup:{type:Boolean,attribute:!1},_linkProfileId:{type:String,attribute:!1},_linkSelections:{attribute:!1},_goals:{attribute:!1},_isLoading:{type:Boolean,attribute:!1},_log:{attribute:!1},_weeklySummary:{attribute:!1}});customElements.get("calorie-tracker-panel")||customElements.define("calorie-tracker-panel",u)});export default U();
//# sourceMappingURL=calorie-tracker-panel.js.map
