import{a as C}from"./chunks/chunk-6HXXGXV5.js";import{b as I}from"./chunks/chunk-2DESVE3Y.js";import{a as z}from"./chunks/chunk-7BAGKXKT.js";import{a as S,b as d,g as $,h as L}from"./chunks/chunk-EMR7U3YA.js";import{a as m,b as P,e as E,f as x,g as h}from"./chunks/chunk-5HHMTMB7.js";var U=E(()=>{L();var O=x(C());I();var R=x(z());async function M(l){var p;return!(l!=null&&l.connection)||!((p=l==null?void 0:l.user)!=null&&p.id)?{}:await l.connection.sendMessagePromise({type:"calorie_tracker/get_user_profile",user_id:l.user.id})}function q(l=new Date){let p=l.getFullYear(),e=String(l.getMonth()+1).padStart(2,"0"),t=String(l.getDate()).padStart(2,"0");return`${p}-${e}-${t}`}var y=class extends ${constructor(){super();h(this,"_contentBounds",{left:0,width:0});h(this,"_contentResizeObserver",null);h(this,"_onHassReconnect",()=>{this._initializeProfile(),this._fetchDiscoveredData()});h(this,"_onVisibilityChange",()=>{document.visibilityState==="visible"&&(this._initializeProfile(),this._fetchDiscoveredData())});h(this,"_onProfileModalOpen",()=>{var t;this._profileModalDepth+=1;let e=(t=this.renderRoot)==null?void 0:t.querySelector("ha-card.main-card");e&&e.classList.add("profile-modal-active")});h(this,"_onProfileModalClose",()=>{var e;if(this._profileModalDepth=Math.max(0,this._profileModalDepth-1),this._profileModalDepth===0){let t=(e=this.renderRoot)==null?void 0:e.querySelector("ha-card.main-card");t&&t.classList.remove("profile-modal-active")}});this._hass=null,this._profile=null,this._allProfiles=[],this._selectedEntityId="",this._defaultProfile=null,this._discoveredData=[],this._imageAnalyzers=[];let e=new Date;this._selectedDate=q(e),this._showLinkDiscoveredPopup=!1,this._linkProfileId="",this._linkSelections={},this._goals=[],this._profileModalDepth=0,this._contentBounds={left:0,width:0}}async _fetchDiscoveredData(){var e;if(!((e=this._hass)!=null&&e.connection)){this._discoveredData=[],this._imageAnalyzers=[];return}try{let t=await this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_discovered_data"});this._discoveredData=(t==null?void 0:t.discovered_data)||[],this._imageAnalyzers=(t==null?void 0:t.image_analyzers)||[]}catch(t){this._discoveredData=[],this._imageAnalyzers=[],console.error("[CalorieTrackerPanel] Error fetching discovered data:",t)}this.requestUpdate()}set hass(e){this._hass=e,this.isConnected&&(this._initializeProfile(),this._fetchDiscoveredData())}connectedCallback(){super.connectedCallback(),this._hass&&(this._initializeProfile(),this._fetchDiscoveredData()),window.addEventListener("hass-reconnected",this._onHassReconnect),document.addEventListener("visibilitychange",this._onVisibilityChange),this.addEventListener("profile-modal-open",this._onProfileModalOpen),this.addEventListener("profile-modal-close",this._onProfileModalClose),this._checkForDeepLink(),requestAnimationFrame(()=>{var t;let e=(t=this.shadowRoot)==null?void 0:t.querySelector(".content");e&&(this._updateContentBounds(),this._contentResizeObserver=new ResizeObserver(()=>{this._updateContentBounds()}),this._contentResizeObserver.observe(e))})}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hass-reconnected",this._onHassReconnect),document.removeEventListener("visibilitychange",this._onVisibilityChange),this.removeEventListener("profile-modal-open",this._onProfileModalOpen),this.removeEventListener("profile-modal-close",this._onProfileModalClose),this._contentResizeObserver&&(this._contentResizeObserver.disconnect(),this._contentResizeObserver=null)}_updateContentBounds(){var t;let e=(t=this.shadowRoot)==null?void 0:t.querySelector(".content");if(e){let i=e.getBoundingClientRect();this._contentBounds={left:i.left,width:i.width},this.requestUpdate()}}async _fetchProfileData(e,t=null){var i,o,s,a,r,c,_,f,v,w,b,D;try{if(!((i=this._hass)!=null&&i.connection)||!e)return{log:{},weight:null,weekly_summary:{},linked_components:{}};let[n,u,g,k]=await Promise.all([this._hass.connection.sendMessagePromise(m({type:"calorie_tracker/get_daily_data",entity_id:e},t?{date:t}:{})),this._hass.connection.sendMessagePromise(m({type:"calorie_tracker/get_weekly_summary",entity_id:e},t?{date:t}:{})),this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_linked_components",entity_id:e}),this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:e})]);return{log:{food_entries:(o=n==null?void 0:n.food_entries)!=null?o:[],exercise_entries:(s=n==null?void 0:n.exercise_entries)!=null?s:[],weight:(a=n==null?void 0:n.weight)!=null?a:null,body_fat_pct:(r=n==null?void 0:n.body_fat_pct)!=null?r:null,bmr_and_neat:(c=n==null?void 0:n.bmr_and_neat)!=null?c:null,macros:(_=n==null?void 0:n.macros)!=null?_:{},config_entry_id:(f=n==null?void 0:n.config_entry_id)!=null?f:null},weight:(v=n==null?void 0:n.weight)!=null?v:null,weekly_summary:(w=u==null?void 0:u.weekly_summary)!=null?w:{},linked_components:(b=g==null?void 0:g.linked_components)!=null?b:{},goals:(D=k==null?void 0:k.goals)!=null?D:[]}}catch(n){if(n&&(n.code===403||n.status===403)){window.location.href="/";return}throw n}}async _initializeProfile(){try{let e=await M(this._hass);this._defaultProfile=(e==null?void 0:e.default_profile)||null,this._allProfiles=(e==null?void 0:e.all_profiles)||[];let t=this._selectedEntityId;if((!t||!this._allProfiles.some(i=>i.entity_id===t))&&(e!=null&&e.default_profile&&e.default_profile.entity_id?t=e.default_profile.entity_id:this._allProfiles.length>0?t=this._allProfiles[0].entity_id:t=""),this._selectedEntityId=t,this._selectedEntityId){let{log:i,weight:o,weekly_summary:s,linked_components:a,goals:r}=await this._fetchProfileData(this._selectedEntityId,this._selectedDate);this._log=i,this._weight=o,this._weeklySummary=s,this._linkedComponents=a,this._goals=r}else this._log={},this._weight=null,this._weeklySummary={},this._linkedComponents={},this._goals=[]}catch(e){this._defaultProfile=null,this._allProfiles=[],this._selectedEntityId="",this._log={},this._weight=null,this._weeklySummary={},this._linkedComponents={},this._goals=[],console.error("Failed to fetch user profile:",e)}this._selectProfile(),this.requestUpdate()}async _checkForDeepLink(){try{let e=new URLSearchParams(window.location.search||window.location.hash.replace(/^#/,"?")),t=e.get("modal"),i=e.get("profile")||e.get("entity_id")||e.get("config_entry_id");if(!t)return;if(i)if(this._allProfiles&&this._allProfiles.length){let o=i,s=(o||"").trim().toLowerCase(),a=this._allProfiles.find(r=>r.entity_id===o||r.config_entry_id===o||r.entity_id===`profile.${o}`);if(!a){let r=_=>(_||"").toString().trim().toLowerCase().replace(/[\s_-]+/g,""),c=r(s);a=this._allProfiles.find(_=>{if(!_.spoken_name)return!1;let f=_.spoken_name.toString().trim().toLowerCase();return f===s||r(f)===c})}a&&(this._selectedEntityId=a.entity_id,await this._fetchProfileData(this._selectedEntityId,this._selectedDate),this._selectProfile(),this.requestUpdate())}else{setTimeout(()=>this._checkForDeepLink(),250);return}setTimeout(()=>this._openCameraOnLoad(t),300),this._clearModalParam()}catch(e){console.warn("[CalorieTrackerPanel] deep-link check failed",e)}}_openCameraOnLoad(e){var t;try{let i=(t=this.renderRoot)==null?void 0:t.querySelector("daily-data-card");i&&typeof i._openPhotoAnalysis=="function"?(i._openPhotoAnalysis(),e&&setTimeout(()=>{try{e==="food_camera"&&typeof i._selectAnalysisType=="function"?i._selectAnalysisType("food"):e==="bodyfat_camera"&&typeof i._selectAnalysisType=="function"&&i._selectAnalysisType("bodyfat")}catch(o){}},250)):i?i.dispatchEvent(new CustomEvent("open-photo-analysis",{detail:{modal:e},bubbles:!0,composed:!0})):setTimeout(()=>this._openCameraOnLoad(e),200)}catch(i){console.warn("[CalorieTrackerPanel] failed to open camera modal on load",i)}}_clearModalParam(){try{let e=new URL(window.location.href),t=e.searchParams;if(t.has("modal")){t.delete("modal");let i=`${e.pathname}${t.toString()?`?${t.toString()}`:""}${e.hash}`;window.history.replaceState({},document.title,i)}}catch(e){}}_selectProfile(){if(!this._hass||!this._allProfiles.length){this._profile=null,this._selectedEntityId="";return}let e=this._selectedEntityId;(!e||!this._allProfiles.some(t=>t.entity_id===e))&&(e=this._allProfiles[0].entity_id),this._selectedEntityId=e,this._profile=this._hass.states[e]||null}_openLinkDiscoveredPopup(){this._linkProfileId=this._allProfiles.length>0?this._allProfiles[0].entity_id:"",this._linkSelections=Object.fromEntries((this._discoveredData||[]).map(e=>[e.entry_id,!0])),this._showLinkDiscoveredPopup=!0}_closeLinkDiscoveredPopup(){this._showLinkDiscoveredPopup=!1}_onLinkProfileChange(e){this._linkProfileId=e.target.value}_onLinkSelectionChange(e,t){this._linkSelections=P(m({},this._linkSelections),{[t]:e.target.checked})}async _saveLinkSelections(){var i;if(!((i=this._hass)!=null&&i.connection)||!this._linkProfileId)return;let e=Object.entries(this._linkSelections).filter(([o,s])=>s).map(([o,s])=>{let a=(this._discoveredData||[]).find(r=>r.entry_id===o);return a?{linked_domain:a.domain,linked_component_entry_id:a.entry_id}:null}).filter(Boolean);if(e.length===0){this._showSnackbar&&this._showSnackbar("No devices selected",!0);return}let t={};for(let{linked_domain:o,linked_component_entry_id:s}of e)t[o]||(t[o]=[]),t[o].push(s);try{for(let[o,s]of Object.entries(t))await this._hass.connection.sendMessagePromise({type:"calorie_tracker/link_discovered_components",calorie_tracker_entity_id:this._linkProfileId,linked_domain:o,linked_component_entry_ids:s});this._showSnackbar&&this._showSnackbar("Devices linked"),this._showLinkDiscoveredPopup=!1,this._fetchDiscoveredData(),this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:o,weight:s,weekly_summary:a,linked_components:r,goals:c})=>{this._log=o,this._weight=s,this._weeklySummary=a,this._linkedComponents=r||{},this._goals=c||[],this.requestUpdate()}).catch(o=>{console.error("Failed to refresh profile data after linking:",o)})}catch(o){this._showSnackbar&&this._showSnackbar("Failed to link devices",!0)}}_renderLinkDiscoveredPopup(){let e=this._allProfiles;return d`
      <div id="link-discovered-modal" class="modal" @click=${this._closeLinkDiscoveredPopup}>
        <div class="modal-content" @click=${t=>t.stopPropagation()}>
          <div class="modal-header">Link Discovered Data</div>
          <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <span>Link data to</span>
            <select class="edit-input" style="min-width: 90px; max-width: 180px; flex: 0 1 auto;" @change=${this._onLinkProfileChange} .value=${this._linkProfileId}>
              ${e.map(t=>d`<option value="${t.entity_id}">${t.spoken_name}</option>`)}
            </select>
          </div>
          <div style="max-height:260px;overflow-y:auto;">
            ${(this._discoveredData||[]).map(t=>d`
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <input type="checkbox" .checked=${!!this._linkSelections[t.entry_id]} @change=${i=>this._onLinkSelectionChange(i,t.entry_id)} />
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
    `}render(){var e,t,i,o,s,a,r,c;return d`
      <ha-app-layout>
        <app-header slot="header" fixed>
          <app-toolbar>
            <ha-menu-button
              .hass=${this._hass}
              narrow
              @click=${this._toggleSidebar}
            ></ha-menu-button>
            <div class="toolbar-title">Calorie Tracker</div>
          </app-toolbar>
        </app-header>

        <div class="content">
          <ha-card class="main-card">
            <div class="card-content">
              <profile-card
                .hass=${this._hass}
                .profile=${this._profile}
                .allProfiles=${this._allProfiles}
                .defaultProfile=${this._defaultProfile}
                .linkedDevices=${this._linkedComponents}
                .goalType=${((t=(e=this._weeklySummary)==null?void 0:e[this._selectedDate])==null?void 0:t[4])||"Not Set"}
                .dailyGoal=${((o=(i=this._weeklySummary)==null?void 0:i[this._selectedDate])==null?void 0:o[3])||null}
                .currentWeight=${((a=(s=this._weeklySummary)==null?void 0:s[this._selectedDate])==null?void 0:a[5])||null}
                .goalValue=${((c=(r=this._weeklySummary)==null?void 0:r[this._selectedDate])==null?void 0:c[6])||null}
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
        </div>
      </ha-app-layout>
      ${this._showLinkDiscoveredPopup?this._renderLinkDiscoveredPopup():""}
    `}_toggleSidebar(e){e.preventDefault(),e.stopPropagation();let t=document.querySelector("home-assistant");if(!(t!=null&&t.shadowRoot))return;let i=t.shadowRoot.querySelector("home-assistant-main");if(!(i!=null&&i.shadowRoot))return;let o=i.shadowRoot.querySelector("ha-sidebar");o&&typeof o.toggle=="function"&&o.toggle()}_onSelectSummaryDate(e){let t=e.detail.date;this._selectedDate=t,this._fetchProfileData(this._selectedEntityId,t).then(({log:i,weight:o,weekly_summary:s})=>{this._log=i,this._weight=o,this._weeklySummary=s,this.requestUpdate()})}_onProfileSelected(e){this._selectedEntityId=e.detail.entityId,this._selectProfile(),this._profile&&this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:t,weight:i,weekly_summary:o,linked_components:s,goals:a})=>{this._log=t,this._weight=i,this._weeklySummary=o,this._linkedComponents=s||{},this._goals=a||[],this.requestUpdate()})}_onRefreshProfile(e){this._selectedEntityId&&this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:t,weight:i,weekly_summary:o,linked_components:s,goals:a})=>{this._log=t,this._weight=i,this._weeklySummary=o,this._linkedComponents=s||{},this._goals=a||[],this.requestUpdate()}).catch(t=>{console.error("Failed to refresh profile data:",t)})}_onEditDailyEntry(e){var s;let{entry_id:t,entry_type:i,entry:o}=e.detail;!((s=this._hass)!=null&&s.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/update_entry",entity_id:this._selectedEntityId,entry_id:t,entry_type:i,entry:o}).then(()=>{this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:a,weekly_summary:r})=>{this._log=a,this._weeklySummary=r,this.requestUpdate()}).catch(a=>{console.error("Failed to refresh profile data after update:",a)})}).catch(a=>{console.error("Failed to update entry:",a)})}_onDeleteDailyEntry(e){var o;let{entry_id:t,entry_type:i}=e.detail;!((o=this._hass)!=null&&o.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/delete_entry",entity_id:this._selectedEntityId,entry_id:t,entry_type:i}).then(()=>{this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:s,weekly_summary:a})=>{this._log=s,this._weeklySummary=a,this.requestUpdate()}).catch(s=>{console.error("Failed to refresh profile data after delete:",s)})}).catch(s=>{console.error("Failed to delete entry:",s)})}_onRefreshSummary(){this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:e,weight:t,weekly_summary:i})=>{this._log=e,this._weight=t,this._weeklySummary=i,this.requestUpdate()})}_onRefreshDailyData(){this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:e,weight:t,weekly_summary:i})=>{this._log=e,this._weight=t,this._weeklySummary=i,this.requestUpdate()})}_onAddDailyEntry(e){var o;let{entry_type:t,entry:i}=e.detail;!((o=this._hass)!=null&&o.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/create_entry",entity_id:this._selectedEntityId,entry_type:t,entry:i}).then(()=>{this._fetchProfileData(this._selectedEntityId,this._selectedDate).then(({log:s,weight:a,weekly_summary:r})=>{this._log=s,this._weight=a,this._weeklySummary=r,this.requestUpdate()}).catch(s=>{console.error("Failed to refresh profile data after add:",s)})}).catch(s=>{console.error("Failed to add entry:",s)})}_onGoalsUpdated(e){var t;!((t=this._hass)!=null&&t.connection)||!this._selectedEntityId||this._hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:this._selectedEntityId}).then(i=>{this._goals=(i==null?void 0:i.goals)||[],this.requestUpdate()}).catch(i=>{console.error("Failed to refresh goals:",i)})}};h(y,"styles",[S`
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
    `]),h(y,"properties",{_hass:{attribute:!1},_profile:{attribute:!1},_allProfiles:{attribute:!1},_selectedEntityId:{type:String},_defaultProfile:{attribute:!1},_selectedDate:{type:String},_discoveredData:{attribute:!1},_showLinkDiscoveredPopup:{type:Boolean,attribute:!1},_linkProfileId:{type:String,attribute:!1},_linkSelections:{attribute:!1},_goals:{attribute:!1}});customElements.get("calorie-tracker-panel")||customElements.define("calorie-tracker-panel",y)});export default U();
//# sourceMappingURL=calorie-tracker-panel.js.map
