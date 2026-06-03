import{a as C}from"./chunks/chunk-5KRPXR26.js";import{b as I}from"./chunks/chunk-TDKEUX4J.js";import{a as z}from"./chunks/chunk-JGZCO54Z.js";import{a as S,b as d,g as $,h as L}from"./chunks/chunk-EMR7U3YA.js";import{a as u,b as D,e as E,f as x,g as _}from"./chunks/chunk-5HHMTMB7.js";var q=E(()=>{L();var R=x(C());I();var F=x(z());async function M(l){var f;return!(l!=null&&l.connection)||!((f=l==null?void 0:l.user)!=null&&f.id)?{}:await l.connection.sendMessagePromise({type:"calorie_tracker/get_user_profile",user_id:l.user.id})}function T(l=new Date){let f=l.getFullYear(),i=String(l.getMonth()+1).padStart(2,"0"),t=String(l.getDate()).padStart(2,"0");return`${f}-${i}-${t}`}var y=class extends ${constructor(){super();_(this,"_contentBounds",{left:0,width:0});_(this,"_contentResizeObserver",null);_(this,"_translationsRequestedLang",null);_(this,"_translations",{});_(this,"_onHassReconnect",async()=>{await this._initializeProfile(),await this._fetchDiscoveredData()});_(this,"_onVisibilityChange",async()=>{if(document.visibilityState==="visible"){if(this._isLoading=!0,this.requestUpdate(),await this._ensureConnectionReady())try{await this._initializeProfile(),await this._fetchDiscoveredData()}catch(t){console.error("[CalorieTrackerPanel] Error refreshing data on visibility change:",t)}else console.warn("[CalorieTrackerPanel] Connection not ready after visibility change");this._isLoading=!1,this.requestUpdate()}});_(this,"_onProfileModalOpen",()=>{var t;this._profileModalDepth+=1;let i=(t=this.renderRoot)==null?void 0:t.querySelector("ha-card.main-card");i&&i.classList.add("profile-modal-active")});_(this,"_onProfileModalClose",()=>{var i;if(this._profileModalDepth=Math.max(0,this._profileModalDepth-1),this._profileModalDepth===0){let t=(i=this.renderRoot)==null?void 0:i.querySelector("ha-card.main-card");t&&t.classList.remove("profile-modal-active")}});this._hass=null,this._profile=null,this._allProfiles=[],this._selectedEntityId="",this._defaultProfile=null,this._discoveredData=[],this._imageAnalyzers=[];let i=new Date;this._selectedDate=T(i),this._showLinkDiscoveredPopup=!1,this._linkProfileId="",this._linkSelections={},this._goals=[],this._profileModalDepth=0,this._contentBounds={left:0,width:0},this._isLoading=!1,this._log={},this._weeklySummary={}}_t(i,t){var a;let e=(a=this._translations)==null?void 0:a[i];return typeof e=="string"&&e.length>0?e:t}async _loadTranslationsForLanguage(i){var t;if((t=this._hass)!=null&&t.connection)try{let e=await this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_translations",language:i,namespace:"frontend.panel"});this._translations=(e==null?void 0:e.translations)||{},this._translationsRequestedLang=i,this._updatePanelTitles(),this.requestUpdate()}catch(e){this._translations=this._translations||{},this._translationsRequestedLang=i,this._updatePanelTitles()}}_updatePanelTitles(){var a;let i=this._t("panel_title","Calorie Tracker");document.title=i;let t=(a=this._hass)==null?void 0:a.panels,e=null;t!=null&&t.get?e=t.get("calorie_tracker")||t.get("calorie-tracker")||t.get("calorie_tracker_panel"):t&&typeof t=="object"&&(e=t.calorie_tracker||t["calorie-tracker"]||t.calorie_tracker_panel),e&&("title"in e&&(e.title=i),"sidebarTitle"in e&&(e.sidebarTitle=i),"_sidebarTitle"in e&&(e._sidebarTitle=i))}async _ensureConnectionReady(i=10,t=300){var e,a;for(let s=0;s<i;s++){if((a=(e=this._hass)==null?void 0:e.connection)!=null&&a.connected)try{return await this._hass.connection.sendMessagePromise({type:"get_config"}),!0}catch(o){console.debug("[CalorieTrackerPanel] Connection check failed, retrying...",o)}await new Promise(o=>setTimeout(o,t))}return console.warn("[CalorieTrackerPanel] Connection not ready after retries"),!1}async _fetchDiscoveredData(){var i,t;if(!((t=(i=this._hass)==null?void 0:i.connection)!=null&&t.connected)){this._discoveredData=[],this._imageAnalyzers=[],console.warn("[CalorieTrackerPanel] Connection not ready, skipping discovered data fetch");return}try{let e=await this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_discovered_data"});this._discoveredData=(e==null?void 0:e.discovered_data)||[],this._imageAnalyzers=(e==null?void 0:e.image_analyzers)||[]}catch(e){this._discoveredData=[],this._imageAnalyzers=[],console.error("[CalorieTrackerPanel] Error fetching discovered data:",e)}this.requestUpdate()}set hass(i){var e;this._hass=i;let t=((e=i==null?void 0:i.locale)==null?void 0:e.language)||(i==null?void 0:i.language)||"en";this._translationsRequestedLang!==t?this._loadTranslationsForLanguage(t):this._updatePanelTitles(),this.isConnected&&(this._initializeProfile(),this._fetchDiscoveredData())}connectedCallback(){super.connectedCallback(),this._updatePanelTitles(),this._hass&&(this._initializeProfile(),this._fetchDiscoveredData()),window.addEventListener("hass-reconnected",this._onHassReconnect),document.addEventListener("visibilitychange",this._onVisibilityChange),this.addEventListener("profile-modal-open",this._onProfileModalOpen),this.addEventListener("profile-modal-close",this._onProfileModalClose),this._checkForDeepLink(),requestAnimationFrame(()=>{var t;let i=(t=this.shadowRoot)==null?void 0:t.querySelector(".content");i&&(this._updateContentBounds(),this._contentResizeObserver=new ResizeObserver(()=>{this._updateContentBounds()}),this._contentResizeObserver.observe(i))})}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hass-reconnected",this._onHassReconnect),document.removeEventListener("visibilitychange",this._onVisibilityChange),this.removeEventListener("profile-modal-open",this._onProfileModalOpen),this.removeEventListener("profile-modal-close",this._onProfileModalClose),this._contentResizeObserver&&(this._contentResizeObserver.disconnect(),this._contentResizeObserver=null),document.title="Home Assistant"}_updateContentBounds(){var t;let i=(t=this.shadowRoot)==null?void 0:t.querySelector(".content");if(i){let e=i.getBoundingClientRect();this._contentBounds={left:e.left,width:e.width},this.requestUpdate()}}async _fetchProfileData(i,t=null){var e,a,s,o,r,h,c,p,v,w,b,P;try{if(!((e=this._hass)!=null&&e.connection)||!i)return{log:{},weight:null,weekly_summary:{},linked_components:{}};let[n,m,g,k]=await Promise.all([this._hass.connection.sendMessagePromise(u({type:"calorie_tracker/get_daily_data",entity_id:i},t?{date:t}:{})),this._hass.connection.sendMessagePromise(u({type:"calorie_tracker/get_weekly_summary",entity_id:i},t?{date:t}:{})),this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_linked_components",entity_id:i}),this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:i})]);return{log:{food_entries:(a=n==null?void 0:n.food_entries)!=null?a:[],exercise_entries:(s=n==null?void 0:n.exercise_entries)!=null?s:[],weight:(o=n==null?void 0:n.weight)!=null?o:null,body_fat_pct:(r=n==null?void 0:n.body_fat_pct)!=null?r:null,bmr_and_neat:(h=n==null?void 0:n.bmr_and_neat)!=null?h:null,macros:(c=n==null?void 0:n.macros)!=null?c:{},config_entry_id:(p=n==null?void 0:n.config_entry_id)!=null?p:null},weight:(v=n==null?void 0:n.weight)!=null?v:null,weekly_summary:(w=m==null?void 0:m.weekly_summary)!=null?w:{},linked_components:(b=g==null?void 0:g.linked_components)!=null?b:{},goals:(P=k==null?void 0:k.goals)!=null?P:[]}}catch(n){if(n&&(n.code===403||n.status===403)){window.location.href="/";return}throw n}}async _initializeProfile(){var i,t;if(!((t=(i=this._hass)==null?void 0:i.connection)!=null&&t.connected)){console.warn("[CalorieTrackerPanel] Connection not ready, skipping profile initialization");return}try{let e=await M(this._hass);this._defaultProfile=(e==null?void 0:e.default_profile)||null,this._allProfiles=(e==null?void 0:e.all_profiles)||[];let a=this._selectedEntityId;if((!a||!this._allProfiles.some(s=>s.entity_id===a))&&(e!=null&&e.default_profile&&e.default_profile.entity_id?a=e.default_profile.entity_id:this._allProfiles.length>0?a=this._allProfiles[0].entity_id:a=""),this._selectedEntityId=a,this._selectedEntityId){let{log:s,weight:o,weekly_summary:r,linked_components:h,goals:c}=await this._fetchProfileData(this._selectedEntityId,this._selectedDate);this._log=s,this._weight=o,this._weeklySummary=r,this._linkedComponents=h,this._goals=c}else this._log={},this._weight=null,this._weeklySummary={},this._linkedComponents={},this._goals=[]}catch(e){this._defaultProfile=null,this._allProfiles=[],this._selectedEntityId="",this._log={},this._weight=null,this._weeklySummary={},this._linkedComponents={},this._goals=[],console.error("[CalorieTrackerPanel] Failed to fetch user profile:",e)}this._selectProfile(),this.requestUpdate()}async _checkForDeepLink(){try{let i=new URLSearchParams(window.location.search||window.location.hash.replace(/^#/,"?")),t=i.get("modal"),e=i.get("profile")||i.get("entity_id")||i.get("config_entry_id");if(!t)return;if(e)if(this._allProfiles&&this._allProfiles.length){let a=e,s=(a||"").trim().toLowerCase(),o=this._allProfiles.find(r=>r.entity_id===a||r.config_entry_id===a||r.entity_id===`profile.${a}`);if(!o){let r=c=>(c||"").toString().trim().toLowerCase().replace(/[\s_-]+/g,""),h=r(s);o=this._allProfiles.find(c=>{if(!c.spoken_name)return!1;let p=c.spoken_name.toString().trim().toLowerCase();return p===s||r(p)===h})}o&&(this._selectedEntityId=o.entity_id,await this._fetchProfileData(this._selectedEntityId,this._selectedDate),this._selectProfile(),this.requestUpdate())}else{setTimeout(()=>this._checkForDeepLink(),250);return}setTimeout(()=>this._openModalOnLoad(t),300),this._clearModalParam()}catch(i){console.warn("[CalorieTrackerPanel] deep-link check failed",i)}}_openModalOnLoad(i){var t;try{let e=(t=this.renderRoot)==null?void 0:t.querySelector("daily-data-card");if(i==="chat"){e&&typeof e._openChatAssist=="function"?e._openChatAssist():e?e.dispatchEvent(new CustomEvent("open-chat-assist",{bubbles:!0,composed:!0})):setTimeout(()=>this._openModalOnLoad(i),200);return}e&&typeof e._openPhotoAnalysis=="function"?(e._openPhotoAnalysis(),i&&setTimeout(()=>{try{i==="food_camera"&&typeof e._selectAnalysisType=="function"?e._selectAnalysisType("food"):i==="bodyfat_camera"&&typeof e._selectAnalysisType=="function"&&e._selectAnalysisType("bodyfat")}catch(a){}},250)):e?e.dispatchEvent(new CustomEvent("open-photo-analysis",{detail:{modal:i},bubbles:!0,composed:!0})):setTimeout(()=>this._openModalOnLoad(i),200)}catch(e){console.warn("[CalorieTrackerPanel] failed to open modal on load",e)}}_clearModalParam(){try{let i=new URL(window.location.href),t=i.searchParams;if(t.has("modal")){t.delete("modal");let e=`${i.pathname}${t.toString()?`?${t.toString()}`:""}${i.hash}`;window.history.replaceState({},document.title,e)}}catch(i){}}_selectProfile(){if(!this._hass||!this._allProfiles.length){this._profile=null,this._selectedEntityId="";return}let i=this._selectedEntityId;(!i||!this._allProfiles.some(t=>t.entity_id===i))&&(i=this._allProfiles[0].entity_id),this._selectedEntityId=i,this._profile=this._hass.states[i]||null}_openLinkDiscoveredPopup(){this._linkProfileId=this._allProfiles.length>0?this._allProfiles[0].entity_id:"",this._linkSelections=Object.fromEntries((this._discoveredData||[]).map(i=>[i.entry_id,!0])),this._showLinkDiscoveredPopup=!0}_closeLinkDiscoveredPopup(){this._showLinkDiscoveredPopup=!1}_onLinkProfileChange(i){this._linkProfileId=i.target.value}_onLinkSelectionChange(i,t){this._linkSelections=D(u({},this._linkSelections),{[t]:i.target.checked})}async _saveLinkSelections(){var e;if(!((e=this._hass)!=null&&e.connection)||!this._linkProfileId)return;let i=Object.entries(this._linkSelections).filter(([a,s])=>s).map(([a,s])=>{let o=(this._discoveredData||[]).find(r=>r.entry_id===a);return o?{linked_domain:o.domain,linked_component_entry_id:o.entry_id}:null}).filter(Boolean);if(i.length===0){this._showSnackbar&&this._showSnackbar("No devices selected",!0);return}let t={};for(let{linked_domain:a,linked_component_entry_id:s}of i)t[a]||(t[a]=[]),t[a].push(s);try{for(let[a,s]of Object.entries(t))await this._hass.connection.sendMessagePromise({type:"calorie_tracker/link_discovered_components",calorie_tracker_entity_id:this._linkProfileId,linked_domain:a,linked_component_entry_ids:s});this._showSnackbar&&this._showSnackbar("Devices linked"),this._showLinkDiscoveredPopup=!1,this._fetchDiscoveredData(),this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:a,weight:s,weekly_summary:o,linked_components:r,goals:h})=>{this._log=a,this._weight=s,this._weeklySummary=o,this._linkedComponents=r||{},this._goals=h||[],this.requestUpdate()}).catch(a=>{console.error("Failed to refresh profile data after linking:",a)})}catch(a){this._showSnackbar&&this._showSnackbar("Failed to link devices",!0)}}_renderLinkDiscoveredPopup(){let i=this._allProfiles;return d`
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
    `}render(){var i,t,e,a,s,o,r,h,c,p;return d`
      <ha-app-layout>
        <app-header slot="header" fixed>
          <app-toolbar>
            <ha-menu-button
              .hass=${this._hass}
              narrow
              @click=${this._toggleSidebar}
            ></ha-menu-button>
            <div class="toolbar-title">${this._t("panel_title","Calorie Tracker")}</div>
          </app-toolbar>
        </app-header>

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
                  .dailyGoal=${((a=(e=this._weeklySummary)==null?void 0:e[this._selectedDate])==null?void 0:a[3])||null}
                  .currentWeight=${((o=(s=this._weeklySummary)==null?void 0:s[this._selectedDate])==null?void 0:o[5])||null}
                  .goalValue=${((h=(r=this._weeklySummary)==null?void 0:r[this._selectedDate])==null?void 0:h[6])||null}
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
                        .weekStartDay=${((p=(c=this._profile)==null?void 0:c.attributes)==null?void 0:p.week_start_day)||"sunday"}
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
      </ha-app-layout>
      ${this._showLinkDiscoveredPopup?this._renderLinkDiscoveredPopup():""}
    `}_toggleSidebar(i){i.preventDefault(),i.stopPropagation();let t=document.querySelector("home-assistant");if(!(t!=null&&t.shadowRoot))return;let e=t.shadowRoot.querySelector("home-assistant-main");if(!(e!=null&&e.shadowRoot))return;let a=e.shadowRoot.querySelector("ha-sidebar");a&&typeof a.toggle=="function"&&a.toggle()}_onSelectSummaryDate(i){let t=i.detail.date;this._selectedDate=t,this._fetchProfileData(this._selectedEntityId,t).then(({log:e,weight:a,weekly_summary:s})=>{this._log=e,this._weight=a,this._weeklySummary=s,this.requestUpdate()})}_onProfileSelected(i){this._selectedEntityId=i.detail.entityId,this._selectProfile(),this._profile&&this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:t,weight:e,weekly_summary:a,linked_components:s,goals:o})=>{this._log=t,this._weight=e,this._weeklySummary=a,this._linkedComponents=s||{},this._goals=o||[],this.requestUpdate()})}_onRefreshProfile(i){this._selectedEntityId&&this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:t,weight:e,weekly_summary:a,linked_components:s,goals:o})=>{this._log=t,this._weight=e,this._weeklySummary=a,this._linkedComponents=s||{},this._goals=o||[],this.requestUpdate()}).catch(t=>{console.error("Failed to refresh profile data:",t)})}_onEditDailyEntry(i){var s;let{entry_id:t,entry_type:e,entry:a}=i.detail;!((s=this._hass)!=null&&s.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/update_entry",entity_id:this._selectedEntityId,entry_id:t,entry_type:e,entry:a}).then(()=>{this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:o,weekly_summary:r})=>{this._log=o,this._weeklySummary=r,this.requestUpdate()}).catch(o=>{console.error("Failed to refresh profile data after update:",o)})}).catch(o=>{console.error("Failed to update entry:",o)})}_onDeleteDailyEntry(i){var a;let{entry_id:t,entry_type:e}=i.detail;!((a=this._hass)!=null&&a.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/delete_entry",entity_id:this._selectedEntityId,entry_id:t,entry_type:e}).then(()=>{this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:s,weekly_summary:o})=>{this._log=s,this._weeklySummary=o,this.requestUpdate()}).catch(s=>{console.error("Failed to refresh profile data after delete:",s)})}).catch(s=>{console.error("Failed to delete entry:",s)})}_onRefreshSummary(){this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:i,weight:t,weekly_summary:e})=>{this._log=i,this._weight=t,this._weeklySummary=e,this.requestUpdate()})}_onRefreshDailyData(){this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:i,weight:t,weekly_summary:e})=>{this._log=i,this._weight=t,this._weeklySummary=e,this.requestUpdate()})}_onAddDailyEntry(i){var a;let{entry_type:t,entry:e}=i.detail;!((a=this._hass)!=null&&a.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/create_entry",entity_id:this._selectedEntityId,entry_type:t,entry:e}).then(()=>{this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:s,weight:o,weekly_summary:r})=>{this._log=s,this._weight=o,this._weeklySummary=r,this.requestUpdate()}).catch(s=>{console.error("Failed to refresh profile data after add:",s)})}).catch(s=>{console.error("Failed to add entry:",s)})}_onGoalsUpdated(i){var t;!((t=this._hass)!=null&&t.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:this._selectedEntityId}).then(e=>{this._goals=(e==null?void 0:e.goals)||[],this.requestUpdate()}).catch(e=>{console.error("Failed to refresh goals:",e)})}};_(y,"styles",[S`
      :host {
        /* Unified modal layering variable for calorie tracker components */
        --ct-modal-z: 1500;
      }
      ha-app-layout {
        /* Use Home Assistant's native theme variables */
      }

      ha-app-layout app-header {
        background-color: var(--app-header-background-color);
        color: var(--app-header-text-color);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100; /* Raised from 50 to give more room for modal layering */
        pointer-events: auto;
      }

      ha-app-layout app-header app-toolbar {
        background-color: transparent;
        color: var(--app-header-text-color);
        height: 50px;
        display: flex;
        align-items: center;
        padding: 0;
      }

      ha-app-layout app-header app-toolbar ha-menu-button {
        --mdc-theme-primary: var(--app-header-text-color);
        color: var(--app-header-text-color);
        flex-shrink: 0;
      }

      ha-app-layout .content {
        padding: 8px;
        padding-top: 58px;
        background-color: var(--primary-background-color);
        position: relative;
        z-index: 0; /* Keep content below fixed header */
      }

      ha-app-layout .content > * {
        position: relative;
        z-index: 0;
      }

      ha-app-layout app-header app-toolbar .toolbar-title {
        flex: 1;
        text-align: left;
        font-size: 20px;
        font-weight: 400;
        margin: 0;
        padding-left: 24px;
        transition: padding-left 0.2s ease;
      }

      @media (min-width: 870px) {
        ha-app-layout app-header app-toolbar .toolbar-title {
          padding-left: calc(var(--mdc-drawer-width, 256px) - 16px);
        }
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
    `]),_(y,"properties",{_hass:{attribute:!1},_profile:{attribute:!1},_allProfiles:{attribute:!1},_selectedEntityId:{type:String},_defaultProfile:{attribute:!1},_selectedDate:{type:String},_discoveredData:{attribute:!1},_showLinkDiscoveredPopup:{type:Boolean,attribute:!1},_linkProfileId:{type:String,attribute:!1},_linkSelections:{attribute:!1},_goals:{attribute:!1},_isLoading:{type:Boolean,attribute:!1},_log:{attribute:!1},_weeklySummary:{attribute:!1}});customElements.get("calorie-tracker-panel")||customElements.define("calorie-tracker-panel",y)});export default q();
//# sourceMappingURL=calorie-tracker-panel.js.map
