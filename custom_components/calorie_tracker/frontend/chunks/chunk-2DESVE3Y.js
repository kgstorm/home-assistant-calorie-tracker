import{a as W,b as f,d as H,e as U,f as Z,g as B,h as K}from"./chunk-EMR7U3YA.js";import{a as A,b as z,c as L,d as R,g as y}from"./chunk-5HHMTMB7.js";var j,Y,F,q=R(()=>{j={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Y=M=>(...g)=>({_$litDirective$:M,values:g}),F=class{constructor(g){}get _$AU(){return this._$AM._$AU}_$AT(g,t,i){this._$Ct=g,this._$AM=t,this._$Ci=i}_$AS(g,t){return this.update(g,t)}update(g,t){return this.render(...t)}}});var E,O,V=R(()=>{Z();q();E=class extends F{constructor(g){if(super(g),this.et=U,g.type!==j.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(g){if(g===U||g==null)return this.ft=void 0,this.et=g;if(g===H)return g;if(typeof g!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(g===this.et)return this.ft;this.et=g;let t=[g];return t.raw=t,this.ft={_$litType$:this.constructor.resultType,strings:t,values:[]}}};E.directiveName="unsafeHTML",E.resultType=1;O=Y(E)});var J=R(()=>{V()});var T,Q=R(()=>{K();J();T=class extends B{constructor(){super();y(this,"_openSettings",async t=>{var i,e,a,s,n,d,p,l,r,h,u,c,b,_,w,x,k,I,$,P,S,C,G,D,v,o,m;t.stopPropagation(),this.showSettings=!0,this.dispatchEvent(new CustomEvent("profile-modal-open",{bubbles:!0,composed:!0})),this.spokenNameInput=((e=(i=this.profile)==null?void 0:i.attributes)==null?void 0:e.spoken_name)||"",this.startingWeightInput=((n=(s=(a=this.profile)==null?void 0:a.attributes)==null?void 0:s.starting_weight)==null?void 0:n.toString())||"",this.goalWeightInput=((l=(p=(d=this.profile)==null?void 0:d.attributes)==null?void 0:p.goal_weight)==null?void 0:l.toString())||"",this.selectedProfileId=((r=this.profile)==null?void 0:r.entity_id)||((u=(h=this.allProfiles[0])==null?void 0:h.entity_id)!=null?u:""),this.weightUnitInput=((b=(c=this.profile)==null?void 0:c.attributes)==null?void 0:b.weight_unit)||"lbs",this.birthYearInput=((x=(w=(_=this.profile)==null?void 0:_.attributes)==null?void 0:w.birth_year)==null?void 0:x.toString())||"",this.sexInput=((I=(k=this.profile)==null?void 0:k.attributes)==null?void 0:I.sex)||"",this.heightUnitInput=((P=($=this.profile)==null?void 0:$.attributes)==null?void 0:P.height_unit)||"cm",this._setHeightInputsFromValue((C=(S=this.profile)==null?void 0:S.attributes)==null?void 0:C.height,this.heightUnitInput),this.activityMultiplierInput=((v=(D=(G=this.profile)==null?void 0:G.attributes)==null?void 0:D.activity_multiplier)==null?void 0:v.toString())||"",this.trackMacrosInput=!!((m=(o=this.profile)==null?void 0:o.attributes)!=null&&m.track_macros),await this._loadImageAnalyzersAndPreference(),await this.updateComplete,this._positionModalInContentArea()});y(this,"_closeSettings",()=>{this.showSettings=!1,this.dispatchEvent(new CustomEvent("profile-modal-close",{bubbles:!0,composed:!0})),this._cleanupModalPositioning("#settings-modal")});y(this,"_onPreferredAnalyzerChange",t=>{let i=t.target.value;i===""?this.preferredImageAnalyzer=null:this.preferredImageAnalyzer=this.imageAnalyzers.find(e=>e.config_entry===i)||null});y(this,"_openGoalPopup",async()=>{var t,i;try{let e=this.selectedProfileId||((t=this.profile)==null?void 0:t.entity_id);if(!e||!((i=this.hass)!=null&&i.connection)){this._showSnackbar("Unable to load goals data",!0);return}let a=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:e});this.goals=(a==null?void 0:a.goals)||[],this.goals=this.goals.map(s=>z(A({},s),{original_start_date:s.start_date})),this.displayGoals=[...this.goals].sort((s,n)=>new Date(n.start_date)-new Date(s.start_date)),this.requestUpdate()}catch(e){console.error("Failed to fetch goals:",e),this._showSnackbar("Failed to load goals data",!0);return}this.showGoalPopup=!0,this.dispatchEvent(new CustomEvent("profile-modal-open",{bubbles:!0,composed:!0})),await this.updateComplete});y(this,"_closeGoalPopup",()=>{this.showGoalPopup=!1,this.dispatchEvent(new CustomEvent("profile-modal-close",{bubbles:!0,composed:!0})),this.displayGoals=null,this.goals=[]});y(this,"_addGoalRow",()=>{let t=new Date().toISOString().split("T")[0],i={goal_type:"fixed_intake",goal_value:2e3,start_date:t,original_start_date:t,is_new:!0};Array.isArray(this.goals)||(this.goals=[]),Array.isArray(this.displayGoals)||(this.displayGoals=[]),this.goals.unshift(i),this.displayGoals.unshift(i),this.requestUpdate()});y(this,"_editGoal",t=>{let i=this.displayGoals[t],e=prompt("Goal Type:",i.goal_type),a=prompt("Goal Value:",i.goal_value),s=prompt("Start Date (YYYY-MM-DD):",i.start_date);e&&a&&s&&(this._updateGoalField(t,"goal_type",e,i.original_start_date),this._updateGoalField(t,"goal_value",this._validateNumericInput(a)||a,i.original_start_date),this._updateGoalField(t,"start_date",s,i.original_start_date))});y(this,"_updateGoalField",(t,i,e,a=void 0)=>{if(t>=0&&t<this.displayGoals.length&&this.displayGoals[t]){let s=this.displayGoals[t],n=a||s.original_start_date,d=this.goals.findIndex(p=>p.original_start_date===n);if(d>=0){if(i==="goal_value"){let p=this._validateNumericInput(e,0);if(p!==null)e=p;else{console.warn("Invalid goal value entered:",e,"for goal at index",t),this._showSnackbar(`Invalid goal value: "${e}". Please enter a number greater than 0.`,!0);return}}this.displayGoals[t]=z(A({},this.displayGoals[t]),{[i]:e}),this.goals[d]=z(A({},this.goals[d]),{[i]:e}),i==="start_date"&&(this.displayGoals[t].original_start_date=e,this.goals[d].original_start_date=e)}else console.error("Could not find goal to update with original_start_date:",n);this.requestUpdate()}});y(this,"_deleteGoal",async t=>{var i,e;if(confirm("Are you sure you want to delete this goal?")){let a=this.displayGoals[t];if(!a)return;let s=a.original_start_date||a.start_date,n=this.displayGoals.length;this.displayGoals=this.displayGoals.filter(p=>p.original_start_date!==s);let d=this.goals.length;this.goals=this.goals.filter(p=>p.original_start_date!==s),this.requestUpdate();try{let p=this.selectedProfileId||((i=this.profile)==null?void 0:i.entity_id);if(!p||!((e=this.hass)!=null&&e.connection))return;let l=this.goals.map(c=>{var b=c,{original_start_date:h}=b,u=L(b,["original_start_date"]);return u}),r=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/save_goals",entity_id:p,goals:l});this.dispatchEvent(new CustomEvent("goals-updated",{detail:{action:"delete"},bubbles:!0,composed:!0}))}catch(p){console.error("Failed to delete goal:",p),this._showSnackbar("Failed to delete goal",!0)}}});this.isDefault=!1,this.showSettings=!1,this.spokenNameInput="",this.calorieGoalInput=0,this.startingWeightInput="",this.goalWeightInput="",this.showPopup=!1,this.popupTitle="",this.popupMessage="",this.popupType="",this.allProfiles=[],this.selectedProfileId="",this.linkedDevices=[],this.showRemoveLinkedConfirm=!1,this.deviceToRemove=null,this.weightUnitInput="lbs",this.birthYearInput="",this.sexInput="",this.heightInput="",this.heightUnitInput="cm",this.heightFeetInput="",this.heightInchesInput="",this.bodyFatPctInput="",this.goalType="Not Set",this.dailyGoal=null,this.showGoalPopup=!1,this.goals=[],this.trackMacrosInput=!1}_validateNumericInput(t,i=null,e=null){if(!t||typeof t=="string"&&t.trim()==="")return null;if(typeof t=="number")return isNaN(t)||i!==null&&t<i||e!==null&&t>e?null:t;let a=String(t).trim();a=a.replace(",","."),a=a.replace(/[^\d.-]/g,"");let s=parseFloat(a);return isNaN(s)||i!==null&&s<i||e!==null&&s>e?null:s}_getTodayGoalDisplay(t){var l,r,h,u;let i=(r=(l=this.profile)==null?void 0:l.attributes)==null?void 0:r.goal_type,e=(u=(h=this.profile)==null?void 0:h.attributes)==null?void 0:u.goal_value,a={main:"Not set",sub:""};if(!i||i==="Not Set"||e===void 0||e===null)return a;let s=Number(e);if(isNaN(s))return a;let p=["variable_cut","variable_bulk"].includes(i)?(Math.round(s*100)/100).toString():Math.round(s).toString();switch(i){case"fixed_intake":a.main=`Goal: ${p} Cal/day`;break;case"fixed_net_calories":a.main=`Goal: ${p} Cal/day (net)`;break;case"fixed_deficit":a.main=`Goal: ${p} Cal Daily Deficit`;break;case"fixed_surplus":a.main=`Goal: ${p} Cal Daily Surplus`;break;case"variable_cut":a.main=`Goal: Lose ${p}% / wk`;break;case"variable_bulk":a.main=`Goal: Gain ${p}% / wk`;break;default:a.main=`Goal: ${p}`,a.sub=i}return a}render(){var b,_,w,x,k,I,$,P,S,C,G,D,v;let t=((_=(b=this.profile)==null?void 0:b.attributes)==null?void 0:_.spoken_name)||"",i=((x=(w=this.hass)==null?void 0:w.user)==null?void 0:x.name)||((I=(k=this.hass)==null?void 0:k.user)==null?void 0:I.id)||"this Home Assistant account",e=($=this.dailyGoal)!=null?$:null,a=this.goalType||"Not Set",s=((S=(P=this.profile)==null?void 0:P.attributes)==null?void 0:S.weight_unit)||"lbs",n=(C=this.goalValue)!=null?C:null,d=this.currentWeight,p=Array.isArray(this.linkedDevices)?this.linkedDevices:this.linkedDevices&&typeof this.linkedDevices=="object"?Object.values(this.linkedDevices).flat():[],l="",r="";if((a==="fixed_intake"||a==="fixed_net_calories")&&e!==null)l=`Goal: ${e} Cal/day ${a==="fixed_net_calories"?" (net)":""}`,r="";else if((a==="fixed_deficit"||a==="fixed_surplus")&&e!==null)l=`Goal: ${n} Cal Daily ${a==="fixed_deficit"?"Deficit":"Surplus"} `,r=`(${e} net Cal/day)`;else if(a==="variable_cut"&&e!==null)if(d!==null&&!isNaN(d)){let o=this._percentToWeightPerWeek(n,d,s);l=`Goal: Lose ${n}% (${o}${s}) / wk `,r=`(${e} net Cal/day)`}else l=`Goal: Lose ${n}% (${perWeek}${s}) / wk `,r="";else if(a==="variable_bulk"&&e!==null)if(d!==null&&!isNaN(d)){let o=this._percentToWeightPerWeek(n,d,s);l=`Goal: Gain ${n}% (${o}${s}) /wk`,r=`(${e} net Cal/day)`}else l=`Goal: Gain ${n}% (${perWeek}${s}) /wk`,r="";else!a||a==="Not Set"?(l="Not set",r=""):e!==null?(l=`Goal: ${e}`,r=`${a}`):(l=`Goal: ${a}`,r="");let h=this.showSettings||this.showGoalPopup||this.showRemoveLinkedConfirm||this.showPopup,{main:u,sub:c}=this._getTodayGoalDisplay(s);return f`
      <div class="profile-card" style=${h?"z-index:10050;":""}>
        <div class="profile-name-col">
          <span class="spoken-name">${t}</span>
        </div>
        <div class="profile-details-stack">
          <span class="profile-detail">
            <span class="goal-main">${l}</span>
            ${r?f`<span class="goal-sub">${r}</span>`:""}
          </span>
        </div>
        <button class="settings-btn" @click=${this._openSettings} title="Settings">
          <svg viewBox="0 0 24 24">
            <path class="primary-path" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"></path>
          </svg>
        </button>
        ${this.showSettings?f`
          <div id="settings-modal" class="modal" @click=${this._closeSettings}>
            <div class="modal-content" @click=${o=>o.stopPropagation()}>
              <div class="modal-header">Settings</div>
              <div class="settings-profile-row" style="display: flex; align-items: center; gap: 18px;">
                <div class="settings-label">Profile</div>
                <select class="settings-input" @change=${o=>this._pendingProfileId=o.target.value}>
                  ${this.allProfiles.map(o=>{var m;return f`<option value=${o.entity_id} ?selected=${o.entity_id===(this.selectedProfileId||((m=this.profile)==null?void 0:m.entity_id))}>${o.spoken_name||o.entity_id}</option>`})}
                </select>
              </div>
              <div class="settings-profile-actions" style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;">
                <button class="ha-btn" @click=${this._selectProfileFromDropdown}>Select</button>
                <button class="ha-btn" @click=${this._setDefault}>Set as Default Profile</button>
              </div>
              <div style="height: 18px;"></div>
              <div class="settings-grid" style="margin-top: 0;">
                <div class="settings-label">Spoken Name</div>
                <input class="settings-input" .value=${this.spokenNameInput} @input=${o=>this.spokenNameInput=o.target.value} />
                <div class="settings-label">Current Goal</div>
                <div style="display: flex; align-items: center;">
                  <span>${u} ${c}</span>
                  <button class="ha-btn" @click=${this._openGoalPopup} style="margin-left: auto;">Edit</button>
                </div>
                <div class="settings-label">Starting Weight</div>
                <input class="settings-input" type="text" placeholder="e.g. 150.5" .value=${this.startingWeightInput} @input=${o=>this.startingWeightInput=o.target.value} />
                <div class="settings-label">Goal Weight</div>
                <input class="settings-input" type="text" placeholder="e.g. 140.0" .value=${this.goalWeightInput} @input=${o=>this.goalWeightInput=o.target.value} />
                <div class="settings-label">Weight Units</div>
                <div style="display:flex;gap:16px;align-items:center;">
                  <label><input type="radio" name="weight-unit" value="lbs" .checked=${this.weightUnitInput==="lbs"} @change=${o=>this.weightUnitInput=o.target.value} /> lbs</label>
                  <label><input type="radio" name="weight-unit" value="kg" .checked=${this.weightUnitInput==="kg"} @change=${o=>this.weightUnitInput=o.target.value} /> kg</label>
                </div>
                <div class="settings-label">Track macros</div>
                <div>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.95em;">
                    <input type="checkbox" .checked=${this.trackMacrosInput} @change=${o=>this.trackMacrosInput=o.target.checked} />
                    <span style="font-size:0.95em;color:var(--secondary-text-color, #666);">Enable per-food macronutrient tracking (carbs/protein/fat/alcohol)</span>
                  </label>
                </div>
              </div>
              <div style="width: 100%; margin: 16px 0 8px 0; border-top: 1px solid var(--divider-color, #e0e0e0); padding-top: 16px;">
                <div style="font-weight: 500; margin-bottom: 12px; font-size: 1.1em;">Baseline Calorie Burn Metrics</div>
                <div class="settings-grid" style="margin-bottom: 0;">
                  <div class="settings-label">Birth Year</div>
                  <input class="settings-input" type="number" min="1900" max="2025" .value=${this.birthYearInput||""} @input=${o=>this.birthYearInput=o.target.value} />
                  <div class="settings-label">Sex</div>
                  <div style="display:flex;gap:16px;align-items:center;">
                    <label><input type="radio" name="sex" value="male" .checked=${this.sexInput==="male"} @change=${o=>this.sexInput=o.target.value} /> Male</label>
                    <label><input type="radio" name="sex" value="female" .checked=${this.sexInput==="female"} @change=${o=>this.sexInput=o.target.value} /> Female</label>
                  </div>
                  <div class="settings-label">Height Units</div>
                  <div style="display:flex;gap:16px;align-items:center;">
                    <label><input type="radio" name="height-unit" value="in" .checked=${this.heightUnitInput==="in"} @change=${o=>this.heightUnitInput=o.target.value} /> Imperial</label>
                    <label><input type="radio" name="height-unit" value="cm" .checked=${this.heightUnitInput==="cm"} @change=${o=>this.heightUnitInput=o.target.value} /> Metric</label>
                  </div>
                  <div class="settings-label">Height</div>
                  ${this.heightUnitInput==="in"?f`<div style="display:flex;gap:8px;align-items:center;">
                    <input class="settings-input" type="number" min="3" max="8" .value=${this.heightFeetInput||""} @input=${o=>this.heightFeetInput=o.target.value} placeholder="ft" style="width: 60px;" />
                    <span>ft</span>
                    <input class="settings-input" type="number" min="0" max="11" .value=${this.heightInchesInput||""} @input=${o=>this.heightInchesInput=o.target.value} placeholder="in" style="width: 60px;" />
                    <span>in</span>
                  </div>`:f`<input class="settings-input" type="number" min="100" max="250" .value=${this.heightInput||""} @input=${o=>this.heightInput=o.target.value} placeholder="Height in cm" />`}
                  <div class="settings-label">Activity Multiplier
                    <button @click=${()=>this._showPopup("Activity Multiplier","Your amount of calories you burn is highly dependent on how active you are.<br>This multiplier is used to estimate the calories burned from your daily routine.<br><br><b>NOTE</b> - Do not double count workouts. If you plan to manually log workouts, do not include them in this estimate.<br><ul style='margin:8px 0 8px 18px;padding:0;'><li><b>1.1</b>: Use 1.1 if you plan to manually log all exercise (e.g. calories burned from a daily step counter).</li><li><b>1.2</b>: Low activity (desk work, &lt;5,000 steps/day)</li><li><b>1.275</b>: Light activity (5,000-7,500 steps/day)</li><li><b>1.35</b>: Moderate activity (7,500-10,000 steps/day)</li><li><b>1.425</b>: High activity (10,000-12,500 steps/day)</li><li><b>1.5</b>: Very active (15,000 steps/day))</li></ul>Choose a value that best matches your typical day. This helps improve the accuracy of your weight gain/loss predictions.","info")} style="background:none;border:none;padding:0;margin:0;cursor:pointer;">
                      <svg width="24" height="24" viewBox="0 0 24 24" style="vertical-align:middle;">
                        <path class="primary-path" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" fill="var(--primary-color, #03a9f4)" />
                      </svg>
                    </button>
                  </div>
                  <input class="settings-input" type="text" placeholder="e.g. 1.2" .value=${this.activityMultiplierInput||""} @input=${o=>this.activityMultiplierInput=o.target.value} />
                </div>
              </div>
              <div style="width: 100%; margin: 16px 0 8px 0; border-top: 1px solid var(--divider-color, #e0e0e0); padding-top: 16px;">
                <div style="font-weight: 500; margin-bottom: 12px; font-size: 1.1em;">Photo Analysis</div>
                <div class="settings-grid" style="margin-bottom: 0;">
                  <div class="settings-label">Preferred Image Analyzer</div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <select class="settings-input" @change=${this._onPreferredAnalyzerChange}>
                      <option value="" .selected=${!this.preferredImageAnalyzer}>Select each time</option>
                      ${(this.imageAnalyzers||[]).map(o=>{var m;return f`<option value=${o.config_entry} .selected=${((m=this.preferredImageAnalyzer)==null?void 0:m.config_entry)===o.config_entry}>${o.name} (${o.model||"Unknown model"})</option>`})}
                    </select>
                    <div style="font-size: 0.85em; color: var(--secondary-text-color, #666); line-height: 1.3;">When set, this analyzer will be automatically used when you click the camera button for food or body fat analysis.</div>
                  </div>
                </div>
              </div>
              <div style="width: 100%; margin: 8px 0 0 0;">
                <div style="font-weight: 500; margin-bottom: 2px;">Linked Components:</div>
                ${p.length?f`<ul style="list-style: none; padding: 0 0 0 18px; margin: 0;">${p.map((o,m)=>f`<li style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;"><span style="font-size: 0.97em;">${o&&o.linked_domain?o.linked_domain==="peloton"?f`<b>${o.title}</b>`:f`<b>${o.linked_domain}</b>: ${o.title||o.user_id}`:f`<b>?</b> ${JSON.stringify(o)}`}</span><button title="Unlink" style="background: none; border: none; cursor: pointer; color: var(--error-color, #f44336); padding: 2px; font-size: 0.97em; text-decoration: underline;" @click=${()=>this._confirmRemoveLinkedDevice(m)}>Unlink</button></li>`)}</ul>`:f`<div style="color: var(--secondary-text-color, #888);">None</div>`}
              </div>
              <div class="settings-actions" style="display: flex; gap: 12px; margin-top: 12px;">
                <button class="ha-btn" @click=${this._saveSettings}>Save</button>
                <button class="ha-btn" @click=${this._closeSettings}>Close</button>
              </div>
            </div>
          </div>
        `:""}
        ${this.showGoalPopup?f`
          <div id="goal-modal" class="modal" @click=${this._closeGoalPopup}>
            <div class="modal-content" @click=${o=>o.stopPropagation()}>
              <div class="modal-header">
                Goals
                <button @click=${()=>this._showPopup("Goal Help","Set your goal type and daily target.<br><br><b>Fixed Intake</b>: Enter the daily calorie target. Only food calories count toward your goal.<br><br><b>Fixed Net Calories</b>: Enter the daily net calorie target. Food minus exercise calories count toward your goal.<br><br><b>Fixed Deficit</b>: Enter the daily calorie deficit below your BMR + activity level. Your daily goal will be BMR + activity - deficit value.<br><br><b>Fixed Surplus</b>: Enter the daily calorie surplus above your BMR + activity level. Your daily goal will be BMR + activity + surplus value.<br><br><b>Lose a fixed percent of body weight per week (Cutting)</b>:<br>\u2022 Enter your target weight loss percentage per week.<br>\u2022 Studies show that 0.5-1.0% per week is the sweet spot.<br>\u2022 Daily goal will then be calculated to meet your weekly weight loss goal.<br>\u2022 Recommend goal of 0.5-1.0% body weight per week<br>\u2022 Choosing more than 1.0% body weight per week will put you at high risk of losing lean body mass, which is counter productive<br>\u2022 Ensure you are eating enough protein and strength training to avoid muscle atrophy while cutting<br><br><b>Gain a fixed percent of body weight per week (Bulking)</b>:<br>\u2022 Enter your target weight gain percentage per week.<br>\u2022 Studies show that 0.25-0.5% body weight gain per week is the sweet spot.<br>\u2022 Daily goal will then be calculated to meet your weekly weight gain goal.<br>\u2022 Recommend goal of 0.25-0.5% body weight per week<br>\u2022 Choosing more than 0.5% body weight per week will put you at risk of gaining excess fat","info")} style="background:none;border:none;padding:0;margin:0;cursor:pointer;margin-left:8px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" style="vertical-align:middle;">
                    <path class="primary-path" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" fill="var(--primary-color, #03a9f4)"/>
                  </svg>
                </button>
              </div>
              <div class="goal-matrix">
    ${(this.displayGoals||[]).map((o,m)=>f`
                  <div class="goal-row">
                    <div class="goal-cell" data-index="${m}" data-original-start="${o.original_start_date}" data-is-new="${o.is_new?"1":"0"}">
                      <div class="goal-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div class="goal-header ${o!=null&&o.is_new?"new-goal":m===0?"current-goal":""}">${this._getGoalLabel(o,m)}</div>
                        <button class="ha-btn error" @click=${()=>this._deleteGoal(m)} style="padding: 4px 8px; font-size: 0.9em;">Delete</button>
                      </div>
                      <div class="goal-inputs" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                        <div>
                          <label style="display: block; font-size: 0.9em; margin-bottom: 4px; color: var(--primary-text-color, #212121);">Goal Type</label>
                          <select class="settings-input" .value=${o.goal_type} @change=${N=>this._updateGoalField(m,"goal_type",N.target.value)} style="font-size: 0.9em; padding: 6px;">
                            <option value="fixed_intake">Fixed Intake</option>
                            <option value="fixed_net_calories">Fixed Net Calories</option>
                            <option value="fixed_deficit">Fixed Deficit</option>
                            <option value="fixed_surplus">Fixed Surplus</option>
                            <option value="variable_cut">Lose fixed percent of weight per week</option>
                            <option value="variable_bulk">Gain a fixed percent of weight per week</option>
                          </select>
                        </div>
                        <div>
                          <label style="display: block; font-size: 0.9em; margin-bottom: 4px; color: var(--primary-text-color, #212121);">Goal Value</label>
                          <input class="settings-input" type="text" inputmode="decimal" .value=${this._formatGoalValueForInput(o)} @input=${N=>this._updateGoalField(m,"goal_value",N.target.value)} style="font-size: 0.9em; padding: 6px;" />
                        </div>
                        <div>
                          <label style="display: block; font-size: 0.9em; margin-bottom: 4px; color: var(--primary-text-color, #212121);">Start Date</label>
                          <input class="settings-input" type="date" .value=${o.start_date} @change=${N=>this._updateGoalField(m,"start_date",N.target.value)} style="font-size: 0.9em; padding: 6px;" />
                        </div>
                      </div>
                    </div>
                  </div>
                `)}
              </div>
              <div class="modal-actions">
                <button class="ha-btn" @click=${this._addGoalRow} style="background: var(--success-color, #4caf50); color: white;">+ Add Goal</button>
                <button class="ha-btn" @click=${this._saveGoals}>Save</button>
                <button class="ha-btn" @click=${this._closeGoalPopup}>Cancel</button>
              </div>
            </div>
          </div>
        `:""}
        ${this.showRemoveLinkedConfirm&&this.deviceToRemove?f`
          <div id="remove-linked-modal" class="modal" @click=${this._cancelRemoveLinkedDevice}>
            <div class="modal-content" @click=${o=>o.stopPropagation()}>
              <div class="modal-header">
                Confirm unlink
                <b>${this.deviceToRemove.title||this.deviceToRemove.user_id||"?"}</b>
                from
                <b>${((D=(G=this.profile)==null?void 0:G.attributes)==null?void 0:D.spoken_name)||((v=this.profile)==null?void 0:v.entity_id)||"profile"}</b>
              </div>
              <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="ha-btn error" @click=${this._doRemoveLinkedDevice}>Confirm</button>
                <button class="ha-btn" @click=${this._cancelRemoveLinkedDevice}>Cancel</button>
              </div>
            </div>
          </div>
        `:""}
        ${this.showPopup?f`
          <div id="popup-modal" class="modal" @click=${this._closePopup}>
            <div class="modal-content" @click=${o=>o.stopPropagation()}>
              <div class="modal-header">${this.popupTitle}</div>
              <div class="modal-message" style="margin-bottom: 16px;">
                ${O(this.popupMessage)}
              </div>
              <div class="modal-actions" style="display: flex; gap: 12px, justify-content: flex-end;">
                ${this.popupType==="restart"?f`<button class="ha-btn" @click=${this._restartHass}>Restart Now</button>`:""}
                <button class="ha-btn" @click=${this._closePopup}>Close</button>
              </div>
            </div>
          </div>
        `:""}
      </div>
    `}_profileDropdownOptions(){var s;let t=this.selectedProfileId||((s=this.profile)==null?void 0:s.entity_id),i=this.allProfiles.find(n=>n.entity_id===t),e=this.allProfiles.filter(n=>n.entity_id!==t),a=[];i&&a.push(f`<option value=${i.entity_id}>${i.spoken_name||i.entity_id}</option>`);for(let n of e)a.push(f`<option value=${n.entity_id}>${n.spoken_name||n.entity_id}</option>`);return a}updated(t){var i,e,a,s,n,d,p,l,r,h,u,c,b,_,w,x,k,I,$,P,S,C,G,D;if(t.has("profile")){let v=(i=this.profile)==null?void 0:i.entity_id;this.selectedProfileId=v||"",this.spokenNameInput=((a=(e=this.profile)==null?void 0:e.attributes)==null?void 0:a.spoken_name)||"",this.startingWeightInput=((d=(n=(s=this.profile)==null?void 0:s.attributes)==null?void 0:n.starting_weight)==null?void 0:d.toString())||"",this.goalWeightInput=((r=(l=(p=this.profile)==null?void 0:p.attributes)==null?void 0:l.goal_weight)==null?void 0:r.toString())||"",this.weightUnitInput=((u=(h=this.profile)==null?void 0:h.attributes)==null?void 0:u.weight_unit)||"lbs",this.birthYearInput=((_=(b=(c=this.profile)==null?void 0:c.attributes)==null?void 0:b.birth_year)==null?void 0:_.toString())||"",this.sexInput=((x=(w=this.profile)==null?void 0:w.attributes)==null?void 0:x.sex)||"",this.heightUnitInput=((I=(k=this.profile)==null?void 0:k.attributes)==null?void 0:I.height_unit)||"cm",this._setHeightInputsFromValue((P=($=this.profile)==null?void 0:$.attributes)==null?void 0:P.height,this.heightUnitInput),this.activityMultiplierInput=((G=(C=(S=this.profile)==null?void 0:S.attributes)==null?void 0:C.activity_multiplier)==null?void 0:G.toString())||"",this._checkIsDefault()}if(t.has("allProfiles")&&this.allProfiles.length>0&&(!this.selectedProfileId||!this.allProfiles.some(v=>v.entity_id===this.selectedProfileId))&&(this.selectedProfileId=((D=this.profile)==null?void 0:D.entity_id)||this.allProfiles[0].entity_id),t.has("linkedDevices")){if(Array.isArray(this.linkedDevices))return;this.linkedDevices&&typeof this.linkedDevices=="object"&&(this.linkedDevices=Object.values(this.linkedDevices).flat(),this.requestUpdate())}}connectedCallback(){super.connectedCallback(),this._checkIsDefault(),this._handleResize=this._handleResize.bind(this),window.addEventListener("resize",this._handleResize)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",this._handleResize)}_handleResize(){this.showSettings&&this._positionModalInContentArea()}_positionModalInContentArea(t="#settings-modal"){var i;try{let e=(i=this.renderRoot)==null?void 0:i.querySelector(t);if(!e)return;let a=this._findContentContainer();if(!a)return;let s=a.getBoundingClientRect();e.style.position="fixed",e.style.left=`${s.left}px`,e.style.right=`${window.innerWidth-s.right}px`,e.style.top=`${s.top}px`,e.style.bottom=`${window.innerHeight-s.bottom}px`,e.style.alignItems="flex-start",e.style.paddingTop="0",e.style.background="transparent"}catch(e){console.warn("Failed to position modal in content area:",e)}}_cleanupModalPositioning(t="#settings-modal"){var i;try{let e=(i=this.renderRoot)==null?void 0:i.querySelector(t);e&&(e.style.position="",e.style.left="",e.style.right="",e.style.top="",e.style.bottom="",e.style.alignItems="",e.style.paddingTop="",e.style.background="")}catch(e){}}_findContentContainer(){let t=this;for(;t;){let i=t.getRootNode&&t.getRootNode();if(i&&i.host){t=i.host;continue}if(t=t.parentNode,!t)break;if(t.querySelector){let e=t.querySelector(".content");if(e)return e}}return document.querySelector(".content")}_selectProfileFromDropdown(){var a,s,n,d,p,l;let t=(a=this.renderRoot)==null?void 0:a.querySelector('.settings-input[type="select"], select.settings-input'),i=t?t.value:this._pendingProfileId||this.selectedProfileId||((s=this.profile)==null?void 0:s.entity_id);this.selectedProfileId=i;let e=null;this.hass&&this.hass.states&&(e=this.hass.states[i]),e&&(this.profile=e,this.spokenNameInput=e.attributes.spoken_name||"",this.startingWeightInput=((n=e.attributes.starting_weight)==null?void 0:n.toString())||"",this.goalWeightInput=((d=e.attributes.goal_weight)==null?void 0:d.toString())||"",this.weightUnitInput=e.attributes.weight_unit||"lbs",this.birthYearInput=((p=e.attributes.birth_year)==null?void 0:p.toString())||"",this.sexInput=e.attributes.sex||"",this.heightUnitInput=e.attributes.height_unit||"cm",this._setHeightInputsFromValue(e.attributes.height,this.heightUnitInput),this.activityMultiplierInput=((l=e.attributes.activity_multiplier)==null?void 0:l.toString())||""),this.dispatchEvent(new CustomEvent("profile-selected",{detail:{entityId:i},bubbles:!0,composed:!0})),this.showSettings=!1}async _saveSettings(){var a,s,n,d;this.showSettings=!1;let t=this.selectedProfileId||((a=this.profile)==null?void 0:a.entity_id);if(!t||!((s=this.hass)!=null&&s.connection))return;let e=(((d=(n=this.profile)==null?void 0:n.attributes)==null?void 0:d.spoken_name)||"")!==this.spokenNameInput;try{let p=this._validateNumericInput(this.startingWeightInput,0),l=this._validateNumericInput(this.goalWeightInput,0);if(this.startingWeightInput&&p===null){this.showPopup=!0,this.popupType="error",this.popupTitle="Invalid Starting Weight",this.popupMessage="Please enter a valid starting weight (must be a positive number).";return}if(this.goalWeightInput&&l===null){this.showPopup=!0,this.popupType="error",this.popupTitle="Invalid Goal Weight",this.popupMessage="Please enter a valid goal weight (must be a positive number).";return}let r={type:"calorie_tracker/update_profile",entity_id:t,spoken_name:this.spokenNameInput,weight_unit:this.weightUnitInput,track_macros:!!this.trackMacrosInput};p!==null&&(r.starting_weight=p),l!==null&&(r.goal_weight=l),this.birthYearInput&&this.birthYearInput.toString().trim()&&(r.birth_year=Number(this.birthYearInput)),this.sexInput&&this.sexInput.toString().trim()&&(r.sex=this.sexInput);let h=this._getHeightInStorageUnit();if(h>0&&(r.height=h,r.height_unit=this.heightUnitInput),this.activityMultiplierInput&&this.activityMultiplierInput.toString().trim()){let c=this._validateNumericInput(this.activityMultiplierInput,1,2);if(c===null){this.showPopup=!0,this.popupType="error",this.popupTitle="Invalid Activity Multiplier",this.popupMessage="Please enter a valid activity multiplier (must be between 1.0 and 2.0).";return}r.activity_multiplier=c}let u=await this.hass.connection.sendMessagePromise(r);await this._savePreferredAnalyzer(),this.dispatchEvent(new CustomEvent("profiles-updated",{detail:u.all_profiles,bubbles:!0,composed:!0})),e&&this._showPopup("Restart Required","Restart Home Assistant for changes to take effect.","restart")}catch(p){console.error("Failed to update profile:",p),this._showPopup("Error","Failed to update profile.","info")}}async _setDefault(){var d,p,l,r,h,u;let t=this._pendingProfileId||this.selectedProfileId||((d=this.profile)==null?void 0:d.entity_id);this.selectedProfileId=t,this.dispatchEvent(new CustomEvent("profile-selected",{detail:{entityId:t},bubbles:!0,composed:!0}));let i=t,e=(l=(p=this.hass)==null?void 0:p.user)==null?void 0:l.id,a=((h=(r=this.hass)==null?void 0:r.user)==null?void 0:h.name)||"this user",s=this.allProfiles.find(c=>c.entity_id===i),n=(s==null?void 0:s.spoken_name)||"";if(!(!i||!e||!((u=this.hass)!=null&&u.connection)))try{let c=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/update_profile",entity_id:i,username:e});this.dispatchEvent(new CustomEvent("profiles-updated",{detail:c.all_profiles,bubbles:!0,composed:!0})),this._showPopup("Default Profile Set",`Default profile set to <b>${n}</b> for HA user <b>${a}</b>.<br>  When using a voice assistant from <b>${a}</b>'s companion app, <b>${n}</b> will be the default name used when logging items (meaning you do not have to specify the user in the command. Simply "Log a cup of milk").<br>  <b>${n}</b> will also be the default profile loaded on the Calorie Tracker side panel when logged in as <b>${a}</b>.<br><br>  NOTE: A calorie tracker spoken name must still be used when logging via voice assistants not associated with a Home Assistant user, such as a Home Assistant Voice Preview Edition device.`,"info"),this.isDefault=!0}catch(c){console.error("Failed to set default profile:",c),this._showPopup("Error","Failed to set default profile.","info")}}async _showPopup(t,i,e="info"){this.popupTitle=t,this.popupMessage=i,this.popupType=e,this.showPopup=!0,this.dispatchEvent(new CustomEvent("profile-modal-open",{bubbles:!0,composed:!0})),await this.updateComplete}_closePopup(){this.showPopup=!1,this.dispatchEvent(new CustomEvent("profile-modal-close",{bubbles:!0,composed:!0}))}async _restartHass(){if(this.showPopup=!1,this.hass)try{await this.hass.callService("homeassistant","restart")}catch(t){await this._showPopup("Error","Failed to restart Home Assistant.","info")}}async _checkIsDefault(){var i,e,a,s;let t=(e=(i=this.hass)==null?void 0:i.user)==null?void 0:e.id;if(!t||!((a=this.hass)!=null&&a.connection)){this.isDefault=!1;return}try{let n=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_user_profile",user_id:t}),d=(s=this.profile)==null?void 0:s.entity_id;this.isDefault=!!(n!=null&&n.default_profile)&&d&&n.default_profile.entity_id===d}catch(n){this.isDefault=!1}}async _confirmRemoveLinkedDevice(t){let i=Array.isArray(this.linkedDevices)?this.linkedDevices:this.linkedDevices&&typeof this.linkedDevices=="object"?Object.values(this.linkedDevices).flat():[];this.deviceToRemove=i[t],this.showRemoveLinkedConfirm=!0,this.dispatchEvent(new CustomEvent("profile-modal-open",{bubbles:!0,composed:!0})),await this.updateComplete,this._positionModalInContentArea("#remove-linked-modal")}_cancelRemoveLinkedDevice(){this.showRemoveLinkedConfirm=!1,this.deviceToRemove=null,this.dispatchEvent(new CustomEvent("profile-modal-close",{bubbles:!0,composed:!0})),this._cleanupModalPositioning("#remove-linked-modal")}async _doRemoveLinkedDevice(){var e,a;if(!((e=this.hass)!=null&&e.connection)||!this.deviceToRemove)return;let{linked_domain:t,linked_component_entry_id:i}=this.deviceToRemove;try{await this.hass.connection.sendMessagePromise({type:"calorie_tracker/unlink_linked_component",calorie_tracker_entity_id:this.profile.entity_id,linked_domain:t,linked_component_entry_id:i}),this.showRemoveLinkedConfirm=!1,this.deviceToRemove=null,this._cleanupModalPositioning("#remove-linked-modal");try{let s=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_linked_components",entity_id:this.profile.entity_id}),n=(a=s==null?void 0:s.linked_components)!=null?a:{};console.log("Refreshed linked devices:",n),this.linkedDevices=n,await this.updateComplete,this._showSnackbar("Device unlinked")}catch(s){console.error("Failed to refresh linked devices:",s),this._showSnackbar("Failed to refresh linked devices",!0)}this.dispatchEvent(new CustomEvent("refresh-profile",{bubbles:!0,composed:!0}))}catch(s){console.error("Failed to unlink device:",s),this._showSnackbar("Failed to unlink device",!0)}}_getDisplayHeight(t,i){if(!t)return"";if(i==="in"){let e=Math.floor(t/12),a=t%12;return`${e}'${a.toString().padStart(2,"0")}"`}return`${t} cm`}_percentToWeightPerWeek(t,i,e){if(t==null||i==null||isNaN(t)||isNaN(i))return null;let a=Number(t)/100,s=Math.abs(i*a);return this._formatWeightValue(s,e)}_formatWeightValue(t,i){return t==null||isNaN(t)?"":`${Math.round(t*10)/10}`}_setHeightInputsFromValue(t,i){i==="in"&&t?(this.heightFeetInput=Math.floor(t/12).toString(),this.heightInchesInput=(t%12).toString(),this.heightInput=""):i==="cm"&&t?(this.heightInput=t.toString(),this.heightFeetInput="",this.heightInchesInput=""):(this.heightInput="",this.heightFeetInput="",this.heightInchesInput="")}_getHeightInStorageUnit(){if(this.heightUnitInput==="in"){let t=parseInt(this.heightFeetInput)||0,i=parseInt(this.heightInchesInput)||0;return t*12+i}else return parseInt(this.heightInput)||0}async _loadImageAnalyzersAndPreference(){var t,i,e,a;try{let s=this.hass||(window==null?void 0:window.hass),n=(e=(i=(t=s==null?void 0:s.connection)==null?void 0:t.options)==null?void 0:i.auth)==null?void 0:e.accessToken,p=await(await fetch("/api/calorie_tracker/fetch_analyzers",{headers:{Authorization:`Bearer ${n}`}})).json();this.imageAnalyzers=p.analyzers||[];let l=this.selectedProfileId||((a=this.profile)==null?void 0:a.entity_id),r=await this._resolveConfigEntryIdForEntity(l);if(r){let u=await(await fetch("/api/calorie_tracker/get_preferred_analyzer",{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({config_entry_id:r})})).json();this.preferredImageAnalyzer=u.preferred_analyzer}}catch(s){console.warn("Failed to load image analyzers:",s),this.imageAnalyzers=[],this.preferredImageAnalyzer=null}}async _resolveConfigEntryIdForEntity(t){var i,e,a;try{let s=this.hass||(window==null?void 0:window.hass);if(!(s!=null&&s.connection)||!t)return null;if(((i=this.defaultProfile)==null?void 0:i.entity_id)===t&&((e=this.defaultProfile)!=null&&e.config_entry_id))return this.defaultProfile.config_entry_id;let n=await s.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t});return(a=n==null?void 0:n.config_entry_id)!=null?a:null}catch(s){return console.warn("Failed to resolve config_entry_id for entity:",t,s),null}}async _savePreferredAnalyzer(){var t,i,e,a;try{let s=this.hass||(window==null?void 0:window.hass),n=(e=(i=(t=s==null?void 0:s.connection)==null?void 0:t.options)==null?void 0:i.auth)==null?void 0:e.accessToken,d=this.selectedProfileId||((a=this.profile)==null?void 0:a.entity_id),p=await this._resolveConfigEntryIdForEntity(d);if(!p)return console.error("No config_entry_id available in profile card defaultProfile"),!1;let l=await fetch("/api/calorie_tracker/set_preferred_analyzer",{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({config_entry_id:p,analyzer_data:this.preferredImageAnalyzer||null})});if(!l.ok){let h=await l.text();return console.error("Profile card HTTP Error:",l.status,h),!1}let r=await l.json();return r.success===!0?!0:(console.error("Profile card API returned success=false:",r),!1)}catch(s){return console.error("Profile card exception in _savePreferredAnalyzer:",s),!1}}_showSnackbar(t,i=!1){this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:t},bubbles:!0,composed:!0}))}_getSortedGoals(){return[...this.goals].sort((t,i)=>new Date(i.start_date)-new Date(t.start_date))}_getGoalLabel(t,i){return t!=null&&t.is_new?"New Goal":i===0?"Current Goal":`Previous Goal ${i}`}async _saveGoals(){var t,i;try{let e=this.selectedProfileId||((t=this.profile)==null?void 0:t.entity_id);if(!e||!((i=this.hass)!=null&&i.connection))return;let a=this._collectGoalsFromUI();if(a.length===0){this._showPopup("Invalid Goal","No goals to save.","info");return}this.goals=a.map(l=>A({},l));let s=new Date,n="";for(let l=0;l<this.goals.length;l++){let r=this.goals[l];if(!r.start_date){n=`Goal ${l+1}: Start date is required.`;break}let h=new Date(r.start_date);if(isNaN(h.getTime())){n=`Goal ${l+1}: Invalid start date.`;break}h.setHours(0,0,0,0);let u=new Date(s);if(u.setHours(0,0,0,0),h>u){n=`Goal ${l+1}: Start date cannot be in the future.`;break}let c=this._validateNumericInput(r.goal_value);if(c===null){n=`Goal ${l+1}: Goal value "${r.goal_value}" is not a valid number.`;break}if(r.goal_type==="variable_cut"||r.goal_type==="variable_bulk"?r.goal_value=Math.round(c*100)/100:r.goal_value=Math.round(c),r.goal_type==="variable_cut"||r.goal_type==="variable_bulk"){if(c<0||c>2){n=`Goal ${l+1}: Percent goal value must be between 0 and 2 (e.g. 0.75 for 0.75%).`;break}}else if(r.goal_type==="fixed_intake"||r.goal_type==="fixed_net_calories"){if(c<500||c>5e3){n=`Goal ${l+1}: Fixed goal value must be between 500 and 5000.`;break}}else if((r.goal_type==="fixed_deficit"||r.goal_type==="fixed_surplus")&&(c<0||c>3e3)){n=`Goal ${l+1}: Deficit/surplus value must be between 0 and 3000.`;break}}if(n){this._showPopup("Invalid Goal",n,"info");return}let p=[...this.goals].sort((l,r)=>new Date(r.start_date)-new Date(l.start_date)).map(u=>{var c=u,{original_start_date:l,is_new:r}=c,h=L(c,["original_start_date","is_new"]);return h});await this.hass.connection.sendMessagePromise({type:"calorie_tracker/save_goals",entity_id:e,goals:p}),this._closeGoalPopup(),this.dispatchEvent(new CustomEvent("goals-updated",{detail:{action:"save"},bubbles:!0,composed:!0}))}catch(e){console.error("Failed to save goals:",e)}}_collectGoalsFromUI(){var t;try{let i=(t=this.renderRoot)==null?void 0:t.querySelector("#goal-modal");if(!i)return[];let e=Array.from(i.querySelectorAll(".goal-cell")),a=[];for(let s of e){let n=s.querySelector("select"),d=s.querySelector('input[type="text"]'),p=s.querySelector('input[type="date"]');if(!n||!d||!p)continue;let l=s.getAttribute("data-original-start")||p.value,r=s.getAttribute("data-is-new")==="1";a.push({goal_type:n.value,goal_value:d.value,start_date:p.value,original_start_date:l,is_new:r})}return a}catch(i){return console.warn("Failed to collect goals from UI:",i),Array.isArray(this.displayGoals)?[...this.displayGoals]:[]}}_formatGoalDisplay(t){var a,s;let i=((s=(a=this.profile)==null?void 0:a.attributes)==null?void 0:s.weight_unit)||"lbs",e=this.currentWeight;return t.goal_type==="fixed_intake"||t.goal_type==="fixed_net_calories"?`${t.goal_value} kcal/day${t.goal_type==="fixed_net_calories"?" (net)":""}`:t.goal_type==="variable_cut"&&e?`${this._percentToWeightPerWeek(t.goal_value,e,i)} ${i}/wk (lose)`:t.goal_type==="variable_bulk"&&e?`${this._percentToWeightPerWeek(t.goal_value,e,i)} ${i}/wk (gain)`:`${t.goal_value} (${t.goal_type})`}_formatGoalValueForInput(t){if(!t)return"";let{goal_type:i,goal_value:e}=t;if(e==null||e==="")return"";let a=Number(e);return isNaN(a)?"":i==="variable_cut"||i==="variable_bulk"?(Math.round(a*100)/100).toString():Math.round(a).toString()}};y(T,"properties",{hass:{attribute:!1},profile:{attribute:!1},isDefault:{type:Boolean},showSettings:{type:Boolean},spokenNameInput:{type:String},calorieGoalInput:{type:Number},startingWeightInput:{type:String},goalWeightInput:{type:String},showPopup:{type:Boolean},popupTitle:{type:String},popupMessage:{type:String},popupType:{type:String},allProfiles:{attribute:!1},selectedProfileId:{type:String},defaultProfile:{attribute:!1},linkedDevices:{attribute:!1},showRemoveLinkedConfirm:{type:Boolean},deviceToRemove:{attribute:!1},weightUnitInput:{type:String},birthYearInput:{type:String},sexInput:{type:String},heightInput:{type:String},heightUnitInput:{type:String},heightFeetInput:{type:String},heightInchesInput:{type:String},preferredImageAnalyzer:{attribute:!1},imageAnalyzers:{attribute:!1},goalType:{type:String},dailyGoal:{type:Number},currentWeight:{type:Number},showGoalPopup:{type:Boolean},goals:{type:Array},trackMacrosInput:{type:Boolean}}),y(T,"styles",[W`
      .ha-btn {
        margin-left: 8px;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: var(--ha-button-border-radius, 4px);
        padding: 8px 18px;
        font-size: 1em;
        cursor: pointer;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
        transition: background 0.2s;
        box-shadow: var(--ha-button-box-shadow, none);
        min-width: 64px;
        min-height: 36px;
        font-weight: 500;
        letter-spacing: 0.0892857em;
        text-transform: uppercase;
      }
      .ha-btn:hover {
        background: var(--primary-color-dark, #0288d1);
      }
      .ha-btn.error {
        background: var(--error-color, #f44336);
        color: #fff;
      }
      .profile-card {
        padding: 4px;
        padding-right: 60px;
        display: flex;
        align-items: center;
        gap: 6px; /* Reduced from 12px to bring goal closer to spoken name */
        position: relative;
        flex-wrap: wrap;
        box-sizing: border-box;
        width: 100%;
        max-width: 100vw;
      }
      .profile-name-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-right: 6px;
        flex-shrink: 0;
      }
      .spoken-name {
        font-size: 1.2em;
        font-weight: bold;
        line-height: 1.1;
        margin-bottom: 0;
        word-break: break-word;
        text-align: left;
      }
      .default-label {
        color: var(--success-color, #4caf50);
        font-size: 0.9em;
        margin: 0;
        padding: 0;
        line-height: 1;
        text-align: left;
      }
      .profile-details-stack {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 16px;
        flex: 1;
        min-width: 0;
      }
      .profile-detail {
        color: var(--secondary-text-color, #888);
        font-size: 1em;
        line-height: 1.2;
        margin: 0;
        display: flex;
        align-items: center;
        word-break: break-word;
      }
      .settings-btn {
        margin-left: auto;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: flex-start;
        order: 99;
        flex-shrink: 0;
        position: absolute;
        top: 50%;
        right: 8px;
        transform: translateY(-50%);
      }
      .settings-btn svg {
        width: 26px;
        height: 26px;
        fill: var(--primary-text-color, #212121);
      }
      .modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.32);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--ct-modal-z, 1500);
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }
      /* Settings modal specifically positioned within content area */
      #settings-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: var(--ct-modal-z, 1500);
  font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }
    #goal-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: var(--ct-modal-z, 1500);
  font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
    }
    /* Match settings/goal modal centering for popup/help modal (goal help, activity multiplier, etc.) */
    #popup-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: var(--ct-modal-z, 1500);
  font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
    }
      #settings-modal .modal-content {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        padding: 24px;
        border-radius: var(--ha-card-border-radius, 12px);
        min-width: 350px;
        max-width: 95vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--ha-card-box-shadow, 0 8px 32px rgba(0,0,0,0.4));
        text-align: left;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }
      #goal-modal .modal-content {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        padding: 24px;
        border-radius: var(--ha-card-border-radius, 12px);
        min-width: 350px;
        max-width: 95vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--ha-card-box-shadow, 0 8px 32px rgba(0,0,0,0.4));
        text-align: left;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }
      #popup-modal .modal-content {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        padding: 24px;
        border-radius: var(--ha-card-border-radius, 12px);
        min-width: 350px;
        max-width: 95vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--ha-card-box-shadow, 0 8px 32px rgba(0,0,0,0.4));
        text-align: left;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }
      .modal-content {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        padding: 24px;
        border-radius: var(--ha-card-border-radius, 12px);
        min-width: 350px;
        max-width: 95vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.2));
        text-align: left;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }

      /* Responsive modal for small screens */
      @media (max-width: 480px) {
        .modal-content {
          min-width: 0;
          max-width: 92vw;
          max-height: 85vh;
          padding: 16px;
          margin: 8px;
        }
        .modal-header {
          font-size: 1.1em;
          margin-bottom: 16px;
        }
        .settings-grid {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .settings-label {
          font-size: 0.95em;
          margin-bottom: 4px;
        }
        .settings-input {
          padding: 8px;
          font-size: 16px; /* Prevents zoom on iOS */
        }
      }
      .modal-header {
        font-size: 1.25em;
        font-weight: 500;
        margin-bottom: 18px;
        color: var(--primary-text-color, #212121);
        border-bottom: 1px solid #eee;
        padding-bottom: 8px;
      }
      .settings-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 12px 18px;
        align-items: center;
        margin-bottom: 18px;
      }
      .settings-label {
        font-weight: 500;
        color: var(--primary-text-color, #212121);
      }
      .settings-input {
        width: 100%;
        font-size: 1em;
        padding: 6px 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background: var(--input-background-color, var(--card-background-color, #fff));
        color: var(--primary-text-color, #212121);
        box-sizing: border-box;
      }
      .settings-input:focus {
        outline: 2px solid var(--primary-color, #03a9f4);
        border-color: var(--primary-color, #03a9f4);
        background: var(--input-background-color, var(--card-background-color, #fff));
        color: var(--primary-text-color, #212121);
      }
      .settings-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }
      .goal-icon {
        font-size: 1.05em;
        margin-right: 8px;
        line-height: 1;
      }
      .goal-main {
        font-weight: 600;
        margin-right: 6px;
      }
      .goal-sub {
        color: var(--secondary-text-color, #666);
        font-size: 0.95em;
      }
      @media (max-width: 500px) {
        /* Stack goalMain and goalSub vertically on narrow screens */
        .profile-detail {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
        .goal-main {
          margin-right: 0;
        }
        .goal-sub {
          display: block;
          margin-top: 0;
        }
      }
      .settings-actions .ha-btn {
        margin-left: 0;
        min-width: 90px;
      }
      .settings-footer {
        margin-top: 12px;
        display: flex;
        justify-content: flex-end;
      }
      .goal-matrix {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-top: 12px;
        margin-bottom: 20px;
      }
      .goal-row {
        display: contents;
      }
      .goal-cell {
        background: var(--card-background-color, #fff);
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .goal-header {
        font-weight: 500;
        color: var(--primary-text-color, #212121);
        font-size: 1.1em;
        margin-bottom: 8px;
      }
      .goal-header.new-goal {
        font-weight: 700;
        color: var(--primary-color, #03a9f4);
        font-size: 1.22em;
      }
      .goal-header.current-goal {
        color: var(--primary-color, #03a9f4);
        font-weight: 600;
      }
      .goal-value {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
      }
      .goal-type {
        font-size: 0.9em;
        color: var(--secondary-text-color, #666);
      }
      .goal-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      /* Responsive goal inputs */
      @media (max-width: 768px) {
        .goal-matrix {
          grid-template-columns: 1fr;
        }
        .goal-inputs {
          grid-template-columns: 1fr !important;
          gap: 8px !important;
        }
      }
    `]);customElements.get("profile-card")||customElements.define("profile-card",T)});export{T as a,Q as b};
//# sourceMappingURL=chunk-2DESVE3Y.js.map
