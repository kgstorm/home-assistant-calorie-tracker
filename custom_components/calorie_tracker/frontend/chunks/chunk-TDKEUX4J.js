import{a as B,b as _,d as q,e as H,f as Q,g as j,h as X}from"./chunk-EMR7U3YA.js";import{a as A,b as R,c as U,d as L,g as y}from"./chunk-5HHMTMB7.js";var O,Y,W,V=L(()=>{O={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Y=F=>(...g)=>({_$litDirective$:F,values:g}),W=class{constructor(g){}get _$AU(){return this._$AM._$AU}_$AT(g,t,i){this._$Ct=g,this._$AM=t,this._$Ci=i}_$AS(g,t){return this.update(g,t)}update(g,t){return this.render(...t)}}});var E,J,Z=L(()=>{Q();V();E=class extends W{constructor(g){if(super(g),this.et=H,g.type!==O.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(g){if(g===H||g==null)return this.ft=void 0,this.et=g;if(g===q)return g;if(typeof g!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(g===this.et)return this.ft;this.et=g;let t=[g];return t.raw=t,this.ft={_$litType$:this.constructor.resultType,strings:t,values:[]}}};E.directiveName="unsafeHTML",E.resultType=1;J=Y(E)});var K=L(()=>{Z()});var z,tt=L(()=>{X();K();z=class extends j{constructor(){super();y(this,"_openSettings",async t=>{var i,e,s,o,n,p,h,a,r,d,c,u,m,b,w,k,x,I,$,S,P,G,C,M,D,N,l,f,v;t.stopPropagation(),this.showSettings=!0,this.dispatchEvent(new CustomEvent("profile-modal-open",{bubbles:!0,composed:!0})),this.spokenNameInput=((e=(i=this.profile)==null?void 0:i.attributes)==null?void 0:e.spoken_name)||"",this.startingWeightInput=((n=(o=(s=this.profile)==null?void 0:s.attributes)==null?void 0:o.starting_weight)==null?void 0:n.toString())||"",this.goalWeightInput=((a=(h=(p=this.profile)==null?void 0:p.attributes)==null?void 0:h.goal_weight)==null?void 0:a.toString())||"",this.selectedProfileId=((r=this.profile)==null?void 0:r.entity_id)||((c=(d=this.allProfiles[0])==null?void 0:d.entity_id)!=null?c:""),this.weightUnitInput=((m=(u=this.profile)==null?void 0:u.attributes)==null?void 0:m.weight_unit)||"lbs",this.birthYearInput=((k=(w=(b=this.profile)==null?void 0:b.attributes)==null?void 0:w.birth_year)==null?void 0:k.toString())||"",this.sexInput=((I=(x=this.profile)==null?void 0:x.attributes)==null?void 0:I.sex)||"",this.heightUnitInput=((S=($=this.profile)==null?void 0:$.attributes)==null?void 0:S.height_unit)||"cm",this._setHeightInputsFromValue((G=(P=this.profile)==null?void 0:P.attributes)==null?void 0:G.height,this.heightUnitInput),this.activityMultiplierInput=((D=(M=(C=this.profile)==null?void 0:C.attributes)==null?void 0:M.activity_multiplier)==null?void 0:D.toString())||"",this.trackMacrosInput=!!((l=(N=this.profile)==null?void 0:N.attributes)!=null&&l.track_macros),this.weekStartDayInput=((v=(f=this.profile)==null?void 0:f.attributes)==null?void 0:v.week_start_day)||"sunday",await this._loadImageAnalyzersAndPreference(),await this.updateComplete,this._positionModalInContentArea()});y(this,"_closeSettings",()=>{this.showSettings=!1,this.dispatchEvent(new CustomEvent("profile-modal-close",{bubbles:!0,composed:!0})),this._cleanupModalPositioning("#settings-modal")});y(this,"_onPreferredAnalyzerChange",t=>{let i=t.target.value;i===""?this.preferredImageAnalyzer=null:this.preferredImageAnalyzer=this.imageAnalyzers.find(e=>e.config_entry===i)||null});y(this,"_openGoalPopup",async()=>{var t,i;try{let e=this.selectedProfileId||((t=this.profile)==null?void 0:t.entity_id);if(!e||!((i=this.hass)!=null&&i.connection)){this._showSnackbar("Unable to load goals data",!0);return}let s=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_goals",entity_id:e});this.goals=(s==null?void 0:s.goals)||[],this.goals=this.goals.map(o=>R(A({},o),{original_start_date:o.start_date})),this.displayGoals=[...this.goals].sort((o,n)=>new Date(n.start_date)-new Date(o.start_date)),this.requestUpdate()}catch(e){console.error("Failed to fetch goals:",e),this._showSnackbar("Failed to load goals data",!0);return}this.showGoalPopup=!0,this.dispatchEvent(new CustomEvent("profile-modal-open",{bubbles:!0,composed:!0})),await this.updateComplete});y(this,"_closeGoalPopup",()=>{this.showGoalPopup=!1,this.dispatchEvent(new CustomEvent("profile-modal-close",{bubbles:!0,composed:!0})),this.displayGoals=null,this.goals=[]});y(this,"_addGoalRow",()=>{let t=new Date().toISOString().split("T")[0],i={goal_type:"fixed_intake",goal_value:2e3,start_date:t,original_start_date:t,is_new:!0};Array.isArray(this.goals)||(this.goals=[]),Array.isArray(this.displayGoals)||(this.displayGoals=[]),this.goals.unshift(i),this.displayGoals.unshift(i),this.requestUpdate()});y(this,"_editGoal",t=>{let i=this.displayGoals[t],e=prompt(this._t("goal_type_prompt","Goal Type:"),i.goal_type),s=prompt(this._t("goal_value_prompt","Goal Value:"),i.goal_value),o=prompt(this._t("start_date_prompt","Start Date (YYYY-MM-DD):"),i.start_date);e&&s&&o&&(this._updateGoalField(t,"goal_type",e,i.original_start_date),this._updateGoalField(t,"goal_value",this._validateNumericInput(s)||s,i.original_start_date),this._updateGoalField(t,"start_date",o,i.original_start_date))});y(this,"_updateGoalField",(t,i,e,s=void 0)=>{if(t>=0&&t<this.displayGoals.length&&this.displayGoals[t]){let o=this.displayGoals[t],n=s||o.original_start_date,p=this.goals.findIndex(h=>h.original_start_date===n);if(p>=0){if(i==="goal_value"){let h=this._validateNumericInput(e,0);if(h!==null)e=h;else{console.warn("Invalid goal value entered:",e,"for goal at index",t),this._showSnackbar(this._tf("invalid_goal_value_snackbar",'Invalid goal value: "{value}". Please enter a number greater than 0.',{value:e}),!0);return}}this.displayGoals[t]=R(A({},this.displayGoals[t]),{[i]:e}),this.goals[p]=R(A({},this.goals[p]),{[i]:e}),i==="start_date"&&(this.displayGoals[t].original_start_date=e,this.goals[p].original_start_date=e)}else console.error("Could not find goal to update with original_start_date:",n);this.requestUpdate()}});y(this,"_deleteGoal",async t=>{var i,e;if(confirm("Are you sure you want to delete this goal?")){let s=this.displayGoals[t];if(!s)return;let o=s.original_start_date||s.start_date,n=this.displayGoals.length;this.displayGoals=this.displayGoals.filter(h=>h.original_start_date!==o);let p=this.goals.length;this.goals=this.goals.filter(h=>h.original_start_date!==o),this.requestUpdate();try{let h=this.selectedProfileId||((i=this.profile)==null?void 0:i.entity_id);if(!h||!((e=this.hass)!=null&&e.connection))return;let a=this.goals.map(u=>{var m=u,{original_start_date:d}=m,c=U(m,["original_start_date"]);return c}),r=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/save_goals",entity_id:h,goals:a});this.dispatchEvent(new CustomEvent("goals-updated",{detail:{action:"delete"},bubbles:!0,composed:!0}))}catch(h){console.error("Failed to delete goal:",h),this._showSnackbar("Failed to delete goal",!0)}}});this.isDefault=!1,this.showSettings=!1,this.spokenNameInput="",this.calorieGoalInput=0,this.startingWeightInput="",this.goalWeightInput="",this.showPopup=!1,this.popupTitle="",this.popupMessage="",this.popupType="",this.allProfiles=[],this.selectedProfileId="",this.linkedDevices=[],this.showRemoveLinkedConfirm=!1,this.deviceToRemove=null,this.weightUnitInput="lbs",this.birthYearInput="",this.sexInput="",this.heightInput="",this.heightUnitInput="cm",this.heightFeetInput="",this.heightInchesInput="",this.bodyFatPctInput="",this.goalType="Not Set",this.dailyGoal=null,this.showGoalPopup=!1,this.translations={},this._translationsRequestedLang=null,this.goals=[],this.trackMacrosInput=!1,this.weekStartDayInput="sunday"}_t(t,i){var s;let e=(s=this.translations)==null?void 0:s[t];return typeof e=="string"&&e.length>0?e:i}_tf(t,i,e={}){return this._t(t,i).replace(/\{(\w+)\}/g,(o,n)=>Object.prototype.hasOwnProperty.call(e,n)?String(e[n]):`{${n}}`)}async _loadTranslationsForLanguage(t){var i;if((i=this.hass)!=null&&i.connection)try{let e=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_translations",language:t,namespace:"frontend.profile"});this.translations=(e==null?void 0:e.translations)||{},this.requestUpdate()}catch(e){this.translations=this.translations||{}}}_validateNumericInput(t,i=null,e=null){if(!t||typeof t=="string"&&t.trim()==="")return null;if(typeof t=="number")return isNaN(t)||i!==null&&t<i||e!==null&&t>e?null:t;let s=String(t).trim();s=s.replace(",","."),s=s.replace(/[^\d.-]/g,"");let o=parseFloat(s);return isNaN(o)||i!==null&&o<i||e!==null&&o>e?null:o}_getTodayGoalDisplay(t){var a,r,d,c;let i=(r=(a=this.profile)==null?void 0:a.attributes)==null?void 0:r.goal_type,e=(c=(d=this.profile)==null?void 0:d.attributes)==null?void 0:c.goal_value,s={main:this._t("not_set","Not set"),sub:""};if(!i||i==="Not Set"||e===void 0||e===null)return s;let o=Number(e);if(isNaN(o))return s;let h=["variable_cut","variable_bulk"].includes(i)?(Math.round(o*100)/100).toString():Math.round(o).toString();switch(i){case"fixed_intake":s.main=this._tf("goal_fixed_intake","Goal: {value} Cal/day",{value:h});break;case"fixed_net_calories":s.main=this._tf("goal_fixed_net","Goal: {value} Cal/day (net)",{value:h});break;case"fixed_deficit":s.main=this._tf("goal_fixed_deficit","Goal: {value} Cal Daily Deficit",{value:h});break;case"fixed_surplus":s.main=this._tf("goal_fixed_surplus","Goal: {value} Cal Daily Surplus",{value:h});break;case"variable_cut":s.main=this._tf("goal_variable_cut","Goal: Lose {value}% / wk",{value:h});break;case"variable_bulk":s.main=this._tf("goal_variable_bulk","Goal: Gain {value}% / wk",{value:h});break;default:s.main=this._tf("goal_generic","Goal: {value}",{value:h}),s.sub=i}return s}render(){var b,w,k,x,I,$,S,P,G,C,M,D,N;let t=((w=(b=this.profile)==null?void 0:b.attributes)==null?void 0:w.spoken_name)||"",i=((x=(k=this.hass)==null?void 0:k.user)==null?void 0:x.name)||(($=(I=this.hass)==null?void 0:I.user)==null?void 0:$.id)||"this Home Assistant account",e=(S=this.dailyGoal)!=null?S:null,s=this.goalType||"Not Set",o=((G=(P=this.profile)==null?void 0:P.attributes)==null?void 0:G.weight_unit)||"lbs",n=(C=this.goalValue)!=null?C:null,p=this.currentWeight,h=Array.isArray(this.linkedDevices)?this.linkedDevices:this.linkedDevices&&typeof this.linkedDevices=="object"?Object.values(this.linkedDevices).flat():[],a={notSet:this._t("not_set","Not set"),settings:this._t("settings","Settings"),profile:this._t("profile","Profile"),select:this._t("select","Select"),setDefaultProfile:this._t("set_default_profile","Set as Default Profile"),spokenName:this._t("spoken_name","Spoken Name"),currentGoal:this._t("current_goal","Current Goal"),edit:this._t("edit","Edit"),startingWeight:this._t("starting_weight","Starting Weight"),startingWeightPlaceholder:this._t("starting_weight_placeholder","e.g. 150.5"),goalWeight:this._t("goal_weight","Goal Weight"),goalWeightPlaceholder:this._t("goal_weight_placeholder","e.g. 140.0"),weightUnits:this._t("weight_units","Weight Units"),trackMacros:this._t("track_macros","Track macros"),trackMacrosHelp:this._t("track_macros_help","Enable per-food macronutrient tracking (carbs/protein/fat/alcohol)"),weekStartsOn:this._t("week_starts_on","Week starts on"),sunday:this._t("sunday","Sunday"),monday:this._t("monday","Monday"),baselineBurnMetrics:this._t("baseline_burn_metrics","Baseline Calorie Burn Metrics"),birthYear:this._t("birth_year","Birth Year"),sex:this._t("sex","Sex"),male:this._t("male","Male"),female:this._t("female","Female"),heightUnits:this._t("height_units","Height Units"),imperial:this._t("imperial","Imperial"),metric:this._t("metric","Metric"),height:this._t("height","Height"),heightCmPlaceholder:this._t("height_cm_placeholder","Height in cm"),activityMultiplier:this._t("activity_multiplier","Activity Multiplier"),activityMultiplierPlaceholder:this._t("activity_multiplier_placeholder","e.g. 1.2"),activityMultiplierHelpHtml:this._t("activity_multiplier_help_html","Your amount of calories you burn is highly dependent on how active you are.<br>This multiplier is used to estimate the calories burned from your daily routine.<br><br><b>NOTE</b> - Do not double count workouts. If you plan to manually log workouts, do not include them in this estimate.<br><ul style='margin:8px 0 8px 18px;padding:0;'><li><b>1.1</b>: Use 1.1 if you plan to manually log all exercise (e.g. calories burned from a daily step counter).</li><li><b>1.2</b>: Low activity (desk work, &lt;5,000 steps/day)</li><li><b>1.275</b>: Light activity (5,000-7,500 steps/day)</li><li><b>1.35</b>: Moderate activity (7,500-10,000 steps/day)</li><li><b>1.425</b>: High activity (10,000-12,500 steps/day)</li><li><b>1.5</b>: Very active (15,000 steps/day))</li></ul>Choose a value that best matches your typical day. This helps improve the accuracy of your weight gain/loss predictions."),photoAnalysis:this._t("photo_analysis","Photo Analysis"),preferredImageAnalyzer:this._t("preferred_image_analyzer","Preferred Image Analyzer"),selectEachTime:this._t("select_each_time","Select each time"),unknownModel:this._t("unknown_model","Unknown model"),preferredAnalyzerHelp:this._t("preferred_analyzer_help","When set, this analyzer will be automatically used when you click the camera button for food or body fat analysis."),linkedComponents:this._t("linked_components","Linked Components:"),none:this._t("none","None"),unlink:this._t("unlink","Unlink"),save:this._t("save","Save"),close:this._t("close","Close"),goals:this._t("goals","Goals"),delete:this._t("delete","Delete"),goalType:this._t("goal_type","Goal Type"),goalValue:this._t("goal_value","Goal Value"),startDate:this._t("start_date","Start Date"),addGoal:this._t("add_goal","+ Add Goal"),goalHelpTitle:this._t("goal_help_title","Goal Help"),goalHelpHtml:this._t("goal_help_html","Set your goal type and daily target.<br><br><b>Fixed Intake</b>: Enter the daily calorie target. Only food calories count toward your goal.<br><br><b>Fixed Net Calories</b>: Enter the daily net calorie target. Food minus exercise calories count toward your goal.<br><br><b>Fixed Deficit</b>: Enter the daily calorie deficit below your BMR + activity level. Your daily goal will be BMR + activity - deficit value.<br><br><b>Fixed Surplus</b>: Enter the daily calorie surplus above your BMR + activity level. Your daily goal will be BMR + activity + surplus value.<br><br><b>Lose a fixed percent of body weight per week (Cutting)</b>:<br>\u2022 Enter your target weight loss percentage per week.<br>\u2022 Studies show that 0.5-1.0% per week is the sweet spot.<br>\u2022 Daily goal will then be calculated to meet your weekly weight loss goal.<br>\u2022 Recommend goal of 0.5-1.0% body weight per week<br>\u2022 Choosing more than 1.0% body weight per week will put you at high risk of losing lean body mass, which is counter productive<br>\u2022 Ensure you are eating enough protein and strength training to avoid muscle atrophy while cutting<br><br><b>Gain a fixed percent of body weight per week (Bulking)</b>:<br>\u2022 Enter your target weight gain percentage per week.<br>\u2022 Studies show that 0.25-0.5% body weight gain per week is the sweet spot.<br>\u2022 Daily goal will then be calculated to meet your weekly weight gain goal.<br>\u2022 Recommend goal of 0.25-0.5% body weight per week<br>\u2022 Choosing more than 0.5% body weight per week will put you at risk of gaining excess fat"),cancel:this._t("cancel","Cancel"),confirmUnlink:this._t("confirm_unlink","Confirm unlink"),from:this._t("from","from"),confirm:this._t("confirm","Confirm"),restartNow:this._t("restart_now","Restart Now"),profileFallback:this._t("profile_fallback","profile"),goalMainFixedIntake:this._t("goal_fixed_intake","Goal: {value} Cal/day"),goalMainFixedNet:this._t("goal_fixed_net","Goal: {value} Cal/day (net)"),goalMainFixedDeficit:this._t("goal_fixed_deficit","Goal: {value} Cal Daily Deficit"),goalMainFixedSurplus:this._t("goal_fixed_surplus","Goal: {value} Cal Daily Surplus"),goalMainVariableCut:this._t("goal_variable_cut_with_delta","Goal: Lose {percent}% ({perWeek}{unit}) / wk"),goalMainVariableBulk:this._t("goal_variable_bulk_with_delta","Goal: Gain {percent}% ({perWeek}{unit}) / wk"),goalSubNet:this._t("goal_sub_net","({dailyGoal} net Cal/day)"),goalGeneric:this._t("goal_generic","Goal: {value}")},r="",d="";if((s==="fixed_intake"||s==="fixed_net_calories")&&e!==null)r=s==="fixed_net_calories"?this._tf("goal_fixed_net",a.goalMainFixedNet,{value:e}):this._tf("goal_fixed_intake",a.goalMainFixedIntake,{value:e}),d="";else if((s==="fixed_deficit"||s==="fixed_surplus")&&e!==null)r=s==="fixed_deficit"?this._tf("goal_fixed_deficit",a.goalMainFixedDeficit,{value:n}):this._tf("goal_fixed_surplus",a.goalMainFixedSurplus,{value:n}),d=this._tf("goal_sub_net",a.goalSubNet,{dailyGoal:e});else if(s==="variable_cut"&&e!==null)if(p!==null&&!isNaN(p)){let l=this._percentToWeightPerWeek(n,p,o);r=this._tf("goal_variable_cut_with_delta",a.goalMainVariableCut,{percent:n,perWeek:l,unit:o}),d=this._tf("goal_sub_net",a.goalSubNet,{dailyGoal:e})}else r=this._tf("goal_variable_cut","Goal: Lose {value}% / wk",{value:n}),d="";else if(s==="variable_bulk"&&e!==null)if(p!==null&&!isNaN(p)){let l=this._percentToWeightPerWeek(n,p,o);r=this._tf("goal_variable_bulk_with_delta",a.goalMainVariableBulk,{percent:n,perWeek:l,unit:o}),d=this._tf("goal_sub_net",a.goalSubNet,{dailyGoal:e})}else r=this._tf("goal_variable_bulk","Goal: Gain {value}% / wk",{value:n}),d="";else!s||s==="Not Set"?(r=a.notSet,d=""):e!==null?(r=this._tf("goal_generic",a.goalGeneric,{value:e}),d=`${s}`):(r=this._tf("goal_generic",a.goalGeneric,{value:s}),d="");let c=this.showSettings||this.showGoalPopup||this.showRemoveLinkedConfirm||this.showPopup,{main:u,sub:m}=this._getTodayGoalDisplay(o);return _`
      <div class="profile-card" style=${c?"z-index:10050;":""}>
        <div class="profile-name-col">
          <span class="spoken-name">${t}</span>
        </div>
        <div class="profile-details-stack">
          <span class="profile-detail">
            <span class="goal-main">${r}</span>
            ${d?_`<span class="goal-sub">${d}</span>`:""}
          </span>
        </div>
        <button class="settings-btn" @click=${this._openSettings} title=${a.settings}>
          <svg viewBox="0 0 24 24">
            <path class="primary-path" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"></path>
          </svg>
        </button>
        ${this.showSettings?_`
          <div id="settings-modal" class="modal" @click=${this._closeSettings}>
            <div class="modal-content" @click=${l=>l.stopPropagation()}>
              <div class="modal-header">${a.settings}</div>
              <div class="settings-profile-row" style="display: flex; align-items: center; gap: 18px;">
                <div class="settings-label">${a.profile}</div>
                <select class="settings-input" @change=${l=>this._pendingProfileId=l.target.value}>
                  ${this.allProfiles.map(l=>{var f;return _`<option value=${l.entity_id} ?selected=${l.entity_id===(this.selectedProfileId||((f=this.profile)==null?void 0:f.entity_id))}>${l.spoken_name||l.entity_id}</option>`})}
                </select>
              </div>
              <div class="settings-profile-actions" style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;">
                <button class="ha-btn" @click=${this._selectProfileFromDropdown}>${a.select}</button>
                <button class="ha-btn" @click=${this._setDefault}>${a.setDefaultProfile}</button>
              </div>
              <div style="height: 18px;"></div>
              <div class="settings-grid" style="margin-top: 0;">
                <div class="settings-label">${a.spokenName}</div>
                <input class="settings-input" .value=${this.spokenNameInput} @input=${l=>this.spokenNameInput=l.target.value} />
                <div class="settings-label">${a.currentGoal}</div>
                <div style="display: flex; align-items: center;">
                  <span>${u} ${m}</span>
                  <button class="ha-btn" @click=${this._openGoalPopup} style="margin-left: auto;">${a.edit}</button>
                </div>
                <div class="settings-label">${a.startingWeight}</div>
                <input class="settings-input" type="text" placeholder=${a.startingWeightPlaceholder} .value=${this.startingWeightInput} @input=${l=>this.startingWeightInput=l.target.value} />
                <div class="settings-label">${a.goalWeight}</div>
                <input class="settings-input" type="text" placeholder=${a.goalWeightPlaceholder} .value=${this.goalWeightInput} @input=${l=>this.goalWeightInput=l.target.value} />
                <div class="settings-label">${a.weightUnits}</div>
                <div style="display:flex;gap:16px;align-items:center;">
                  <label><input type="radio" name="weight-unit" value="lbs" .checked=${this.weightUnitInput==="lbs"} @change=${l=>this.weightUnitInput=l.target.value} /> lbs</label>
                  <label><input type="radio" name="weight-unit" value="kg" .checked=${this.weightUnitInput==="kg"} @change=${l=>this.weightUnitInput=l.target.value} /> kg</label>
                </div>
                <div class="settings-label">${a.trackMacros}</div>
                <div>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.95em;">
                    <input type="checkbox" .checked=${this.trackMacrosInput} @change=${l=>this.trackMacrosInput=l.target.checked} />
                    <span style="font-size:0.95em;color:var(--secondary-text-color, #666);">${a.trackMacrosHelp}</span>
                  </label>
                </div>
                <div class="settings-label">${a.weekStartsOn}</div>
                <div style="display:flex;gap:16px;align-items:center;">
                  <label><input type="radio" name="week-start-day" value="sunday" .checked=${this.weekStartDayInput==="sunday"} @change=${l=>this.weekStartDayInput=l.target.value} /> ${a.sunday}</label>
                  <label><input type="radio" name="week-start-day" value="monday" .checked=${this.weekStartDayInput==="monday"} @change=${l=>this.weekStartDayInput=l.target.value} /> ${a.monday}</label>
                </div>
              </div>
              <div style="width: 100%; margin: 16px 0 8px 0; border-top: 1px solid var(--divider-color, #e0e0e0); padding-top: 16px;">
                <div style="font-weight: 500; margin-bottom: 12px; font-size: 1.1em;">${a.baselineBurnMetrics}</div>
                <div class="settings-grid" style="margin-bottom: 0;">
                  <div class="settings-label">${a.birthYear}</div>
                  <input class="settings-input" type="number" min="1900" max="2025" .value=${this.birthYearInput||""} @input=${l=>this.birthYearInput=l.target.value} />
                  <div class="settings-label">${a.sex}</div>
                  <div style="display:flex;gap:16px;align-items:center;">
                    <label><input type="radio" name="sex" value="male" .checked=${this.sexInput==="male"} @change=${l=>this.sexInput=l.target.value} /> ${a.male}</label>
                    <label><input type="radio" name="sex" value="female" .checked=${this.sexInput==="female"} @change=${l=>this.sexInput=l.target.value} /> ${a.female}</label>
                  </div>
                  <div class="settings-label">${a.heightUnits}</div>
                  <div style="display:flex;gap:16px;align-items:center;">
                    <label><input type="radio" name="height-unit" value="in" .checked=${this.heightUnitInput==="in"} @change=${l=>this.heightUnitInput=l.target.value} /> ${a.imperial}</label>
                    <label><input type="radio" name="height-unit" value="cm" .checked=${this.heightUnitInput==="cm"} @change=${l=>this.heightUnitInput=l.target.value} /> ${a.metric}</label>
                  </div>
                  <div class="settings-label">${a.height}</div>
                  ${this.heightUnitInput==="in"?_`<div style="display:flex;gap:8px;align-items:center;">
                    <input class="settings-input" type="number" min="3" max="8" .value=${this.heightFeetInput||""} @input=${l=>this.heightFeetInput=l.target.value} placeholder="ft" style="width: 60px;" />
                    <span>ft</span>
                    <input class="settings-input" type="number" min="0" max="11" .value=${this.heightInchesInput||""} @input=${l=>this.heightInchesInput=l.target.value} placeholder="in" style="width: 60px;" />
                    <span>in</span>
                  </div>`:_`<input class="settings-input" type="number" min="100" max="250" .value=${this.heightInput||""} @input=${l=>this.heightInput=l.target.value} placeholder=${a.heightCmPlaceholder} />`}
                  <div class="settings-label">${a.activityMultiplier}
                    <button @click=${()=>this._showPopup(a.activityMultiplier,a.activityMultiplierHelpHtml,"info")} style="background:none;border:none;padding:0;margin:0;cursor:pointer;">
                      <svg width="24" height="24" viewBox="0 0 24 24" style="vertical-align:middle;">
                        <path class="primary-path" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" fill="var(--primary-color, #03a9f4)" />
                      </svg>
                    </button>
                  </div>
                  <input class="settings-input" type="text" placeholder=${a.activityMultiplierPlaceholder} .value=${this.activityMultiplierInput||""} @input=${l=>this.activityMultiplierInput=l.target.value} />
                </div>
              </div>
              <div style="width: 100%; margin: 16px 0 8px 0; border-top: 1px solid var(--divider-color, #e0e0e0); padding-top: 16px;">
                <div style="font-weight: 500; margin-bottom: 12px; font-size: 1.1em;">${a.photoAnalysis}</div>
                <div class="settings-grid" style="margin-bottom: 0;">
                  <div class="settings-label">${a.preferredImageAnalyzer}</div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <select class="settings-input" @change=${this._onPreferredAnalyzerChange}>
                      <option value="" .selected=${!this.preferredImageAnalyzer}>${a.selectEachTime}</option>
                      ${(this.imageAnalyzers||[]).map(l=>{var f;return _`<option value=${l.config_entry} .selected=${((f=this.preferredImageAnalyzer)==null?void 0:f.config_entry)===l.config_entry}>${l.name} (${l.model||a.unknownModel})</option>`})}
                    </select>
                    <div style="font-size: 0.85em; color: var(--secondary-text-color, #666); line-height: 1.3;">${a.preferredAnalyzerHelp}</div>
                  </div>
                </div>
              </div>
              <div style="width: 100%; margin: 8px 0 0 0;">
                <div style="font-weight: 500; margin-bottom: 2px;">${a.linkedComponents}</div>
                ${h.length?_`<ul style="list-style: none; padding: 0 0 0 18px; margin: 0;">${h.map((l,f)=>_`<li style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;"><span style="font-size: 0.97em;">${l&&l.linked_domain?l.linked_domain==="peloton"?_`<b>${l.title}</b>`:_`<b>${l.linked_domain}</b>: ${l.title||l.user_id}`:_`<b>?</b> ${JSON.stringify(l)}`}</span><button title=${a.unlink} style="background: none; border: none; cursor: pointer; color: var(--error-color, #f44336); padding: 2px; font-size: 0.97em; text-decoration: underline;" @click=${()=>this._confirmRemoveLinkedDevice(f)}>${a.unlink}</button></li>`)}</ul>`:_`<div style="color: var(--secondary-text-color, #888);">${a.none}</div>`}
              </div>
              <div class="settings-actions" style="display: flex; gap: 12px; margin-top: 12px;">
                <button class="ha-btn" @click=${this._saveSettings}>${a.save}</button>
                <button class="ha-btn" @click=${this._closeSettings}>${a.close}</button>
              </div>
            </div>
          </div>
        `:""}
        ${this.showGoalPopup?_`
          <div id="goal-modal" class="modal" @click=${this._closeGoalPopup}>
            <div class="modal-content" @click=${l=>l.stopPropagation()}>
              <div class="modal-header">
                ${a.goals}
                <button @click=${()=>this._showPopup(a.goalHelpTitle,a.goalHelpHtml,"info")} style="background:none;border:none;padding:0;margin:0;cursor:pointer;margin-left:8px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" style="vertical-align:middle;">
                    <path class="primary-path" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" fill="var(--primary-color, #03a9f4)"/>
                  </svg>
                </button>
              </div>
              <div class="goal-matrix">
    ${(this.displayGoals||[]).map((l,f)=>_`
                  <div class="goal-row">
                    <div class="goal-cell" data-index="${f}" data-original-start="${l.original_start_date}" data-is-new="${l.is_new?"1":"0"}">
                      <div class="goal-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div class="goal-header ${l!=null&&l.is_new?"new-goal":f===0?"current-goal":""}">${this._getGoalLabel(l,f)}</div>
                        <button class="ha-btn error" @click=${()=>this._deleteGoal(f)} style="padding: 4px 8px; font-size: 0.9em;">${a.delete}</button>
                      </div>
                      <div class="goal-inputs" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                        <div>
                          <label style="display: block; font-size: 0.9em; margin-bottom: 4px; color: var(--primary-text-color, #212121);">${a.goalType}</label>
                          <select class="settings-input" .value=${l.goal_type} @change=${v=>this._updateGoalField(f,"goal_type",v.target.value)} style="font-size: 0.9em; padding: 6px;">
                            <option value="fixed_intake">${this._t("goal_type_fixed_intake","Fixed Intake")}</option>
                            <option value="fixed_net_calories">${this._t("goal_type_fixed_net","Fixed Net Calories")}</option>
                            <option value="fixed_deficit">${this._t("goal_type_fixed_deficit","Fixed Deficit")}</option>
                            <option value="fixed_surplus">${this._t("goal_type_fixed_surplus","Fixed Surplus")}</option>
                            <option value="variable_cut">${this._t("goal_type_variable_cut","Lose fixed percent of weight per week")}</option>
                            <option value="variable_bulk">${this._t("goal_type_variable_bulk","Gain a fixed percent of weight per week")}</option>
                          </select>
                        </div>
                        <div>
                          <label style="display: block; font-size: 0.9em; margin-bottom: 4px; color: var(--primary-text-color, #212121);">${a.goalValue}</label>
                          <input class="settings-input" type="text" inputmode="decimal" .value=${this._formatGoalValueForInput(l)} @input=${v=>this._updateGoalField(f,"goal_value",v.target.value)} style="font-size: 0.9em; padding: 6px;" />
                        </div>
                        <div>
                          <label style="display: block; font-size: 0.9em; margin-bottom: 4px; color: var(--primary-text-color, #212121);">${a.startDate}</label>
                          <input class="settings-input" type="date" .value=${l.start_date} @change=${v=>this._updateGoalField(f,"start_date",v.target.value)} style="font-size: 0.9em; padding: 6px;" />
                        </div>
                      </div>
                    </div>
                  </div>
                `)}
              </div>
              <div class="modal-actions">
                <button class="ha-btn" @click=${this._addGoalRow} style="background: var(--success-color, #4caf50); color: white;">${a.addGoal}</button>
                <button class="ha-btn" @click=${this._saveGoals}>${a.save}</button>
                <button class="ha-btn" @click=${this._closeGoalPopup}>${a.cancel}</button>
              </div>
            </div>
          </div>
        `:""}
        ${this.showRemoveLinkedConfirm&&this.deviceToRemove?_`
          <div id="remove-linked-modal" class="modal" @click=${this._cancelRemoveLinkedDevice}>
            <div class="modal-content" @click=${l=>l.stopPropagation()}>
              <div class="modal-header">
                ${a.confirmUnlink}
                <b>${this.deviceToRemove.title||this.deviceToRemove.user_id||"?"}</b>
                ${a.from}
                <b>${((D=(M=this.profile)==null?void 0:M.attributes)==null?void 0:D.spoken_name)||((N=this.profile)==null?void 0:N.entity_id)||a.profileFallback}</b>
              </div>
              <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="ha-btn error" @click=${this._doRemoveLinkedDevice}>${a.confirm}</button>
                <button class="ha-btn" @click=${this._cancelRemoveLinkedDevice}>${a.cancel}</button>
              </div>
            </div>
          </div>
        `:""}
        ${this.showPopup?_`
          <div id="popup-modal" class="modal" @click=${this._closePopup}>
            <div class="modal-content" @click=${l=>l.stopPropagation()}>
              <div class="modal-header">${this.popupTitle}</div>
              <div class="modal-message" style="margin-bottom: 16px;">
                ${J(this.popupMessage)}
              </div>
              <div class="modal-actions" style="display: flex; gap: 12px, justify-content: flex-end;">
                ${this.popupType==="restart"?_`<button class="ha-btn" @click=${this._restartHass}>${a.restartNow}</button>`:""}
                <button class="ha-btn" @click=${this._closePopup}>${a.close}</button>
              </div>
            </div>
          </div>
        `:""}
      </div>
    `}_profileDropdownOptions(){var o;let t=this.selectedProfileId||((o=this.profile)==null?void 0:o.entity_id),i=this.allProfiles.find(n=>n.entity_id===t),e=this.allProfiles.filter(n=>n.entity_id!==t),s=[];i&&s.push(_`<option value=${i.entity_id}>${i.spoken_name||i.entity_id}</option>`);for(let n of e)s.push(_`<option value=${n.entity_id}>${n.spoken_name||n.entity_id}</option>`);return s}updated(t){var i,e,s,o,n,p,h,a,r,d,c,u,m,b,w,k,x,I,$,S,P,G,C,M,D,N,l,f,v;if(t.has("hass")){let T=((e=(i=this.hass)==null?void 0:i.locale)==null?void 0:e.language)||((s=this.hass)==null?void 0:s.language)||"en";this._translationsRequestedLang!==T&&(this._translationsRequestedLang=T,this._loadTranslationsForLanguage(T))}if(t.has("profile")){let T=(o=this.profile)==null?void 0:o.entity_id;this.selectedProfileId=T||"",this.spokenNameInput=((p=(n=this.profile)==null?void 0:n.attributes)==null?void 0:p.spoken_name)||"",this.startingWeightInput=((r=(a=(h=this.profile)==null?void 0:h.attributes)==null?void 0:a.starting_weight)==null?void 0:r.toString())||"",this.goalWeightInput=((u=(c=(d=this.profile)==null?void 0:d.attributes)==null?void 0:c.goal_weight)==null?void 0:u.toString())||"",this.weightUnitInput=((b=(m=this.profile)==null?void 0:m.attributes)==null?void 0:b.weight_unit)||"lbs",this.birthYearInput=((x=(k=(w=this.profile)==null?void 0:w.attributes)==null?void 0:k.birth_year)==null?void 0:x.toString())||"",this.sexInput=(($=(I=this.profile)==null?void 0:I.attributes)==null?void 0:$.sex)||"",this.heightUnitInput=((P=(S=this.profile)==null?void 0:S.attributes)==null?void 0:P.height_unit)||"cm",this._setHeightInputsFromValue((C=(G=this.profile)==null?void 0:G.attributes)==null?void 0:C.height,this.heightUnitInput),this.activityMultiplierInput=((N=(D=(M=this.profile)==null?void 0:M.attributes)==null?void 0:D.activity_multiplier)==null?void 0:N.toString())||"",this.weekStartDayInput=((f=(l=this.profile)==null?void 0:l.attributes)==null?void 0:f.week_start_day)||"sunday",this._checkIsDefault()}if(t.has("allProfiles")&&this.allProfiles.length>0&&(!this.selectedProfileId||!this.allProfiles.some(T=>T.entity_id===this.selectedProfileId))&&(this.selectedProfileId=((v=this.profile)==null?void 0:v.entity_id)||this.allProfiles[0].entity_id),t.has("linkedDevices")){if(Array.isArray(this.linkedDevices))return;this.linkedDevices&&typeof this.linkedDevices=="object"&&(this.linkedDevices=Object.values(this.linkedDevices).flat(),this.requestUpdate())}}connectedCallback(){super.connectedCallback(),this._checkIsDefault(),this._handleResize=this._handleResize.bind(this),window.addEventListener("resize",this._handleResize)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",this._handleResize)}_handleResize(){this.showSettings&&this._positionModalInContentArea()}_positionModalInContentArea(t="#settings-modal"){var i;try{let e=(i=this.renderRoot)==null?void 0:i.querySelector(t);if(!e)return;let s=this._findContentContainer();if(!s)return;let o=s.getBoundingClientRect();e.style.position="fixed",e.style.left=`${o.left}px`,e.style.right=`${window.innerWidth-o.right}px`,e.style.top=`${o.top}px`,e.style.bottom=`${window.innerHeight-o.bottom}px`,e.style.alignItems="flex-start",e.style.paddingTop="0",e.style.background="transparent"}catch(e){console.warn("Failed to position modal in content area:",e)}}_cleanupModalPositioning(t="#settings-modal"){var i;try{let e=(i=this.renderRoot)==null?void 0:i.querySelector(t);e&&(e.style.position="",e.style.left="",e.style.right="",e.style.top="",e.style.bottom="",e.style.alignItems="",e.style.paddingTop="",e.style.background="")}catch(e){}}_findContentContainer(){let t=this;for(;t;){let i=t.getRootNode&&t.getRootNode();if(i&&i.host){t=i.host;continue}if(t=t.parentNode,!t)break;if(t.querySelector){let e=t.querySelector(".content");if(e)return e}}return document.querySelector(".content")}_selectProfileFromDropdown(){var s,o,n,p,h,a;let t=(s=this.renderRoot)==null?void 0:s.querySelector('.settings-input[type="select"], select.settings-input'),i=t?t.value:this._pendingProfileId||this.selectedProfileId||((o=this.profile)==null?void 0:o.entity_id);this.selectedProfileId=i;let e=null;this.hass&&this.hass.states&&(e=this.hass.states[i]),e&&(this.profile=e,this.spokenNameInput=e.attributes.spoken_name||"",this.startingWeightInput=((n=e.attributes.starting_weight)==null?void 0:n.toString())||"",this.goalWeightInput=((p=e.attributes.goal_weight)==null?void 0:p.toString())||"",this.weightUnitInput=e.attributes.weight_unit||"lbs",this.birthYearInput=((h=e.attributes.birth_year)==null?void 0:h.toString())||"",this.sexInput=e.attributes.sex||"",this.heightUnitInput=e.attributes.height_unit||"cm",this._setHeightInputsFromValue(e.attributes.height,this.heightUnitInput),this.activityMultiplierInput=((a=e.attributes.activity_multiplier)==null?void 0:a.toString())||""),this.dispatchEvent(new CustomEvent("profile-selected",{detail:{entityId:i},bubbles:!0,composed:!0})),this.showSettings=!1}async _saveSettings(){var s,o,n,p;this.showSettings=!1;let t=this.selectedProfileId||((s=this.profile)==null?void 0:s.entity_id);if(!t||!((o=this.hass)!=null&&o.connection))return;let e=(((p=(n=this.profile)==null?void 0:n.attributes)==null?void 0:p.spoken_name)||"")!==this.spokenNameInput;try{let h=this._validateNumericInput(this.startingWeightInput,0),a=this._validateNumericInput(this.goalWeightInput,0);if(this.startingWeightInput&&h===null){this.showPopup=!0,this.popupType="error",this.popupTitle=this._t("invalid_starting_weight_title","Invalid Starting Weight"),this.popupMessage=this._t("invalid_starting_weight_message","Please enter a valid starting weight (must be a positive number).");return}if(this.goalWeightInput&&a===null){this.showPopup=!0,this.popupType="error",this.popupTitle=this._t("invalid_goal_weight_title","Invalid Goal Weight"),this.popupMessage=this._t("invalid_goal_weight_message","Please enter a valid goal weight (must be a positive number).");return}let r={type:"calorie_tracker/update_profile",entity_id:t,spoken_name:this.spokenNameInput,weight_unit:this.weightUnitInput,track_macros:!!this.trackMacrosInput,week_start_day:this.weekStartDayInput};h!==null&&(r.starting_weight=h),a!==null&&(r.goal_weight=a),this.birthYearInput&&this.birthYearInput.toString().trim()&&(r.birth_year=Number(this.birthYearInput)),this.sexInput&&this.sexInput.toString().trim()&&(r.sex=this.sexInput);let d=this._getHeightInStorageUnit();if(d>0&&(r.height=d,r.height_unit=this.heightUnitInput),this.activityMultiplierInput&&this.activityMultiplierInput.toString().trim()){let u=this._validateNumericInput(this.activityMultiplierInput,1,2);if(u===null){this.showPopup=!0,this.popupType="error",this.popupTitle=this._t("invalid_activity_multiplier_title","Invalid Activity Multiplier"),this.popupMessage=this._t("invalid_activity_multiplier_message","Please enter a valid activity multiplier (must be between 1.0 and 2.0).");return}r.activity_multiplier=u}let c=await this.hass.connection.sendMessagePromise(r);await this._savePreferredAnalyzer(),this.dispatchEvent(new CustomEvent("profiles-updated",{detail:c.all_profiles,bubbles:!0,composed:!0})),e&&this._showPopup(this._t("restart_required_title","Restart Required"),this._t("restart_required_message","Restart Home Assistant for changes to take effect."),"restart")}catch(h){console.error("Failed to update profile:",h),this._showPopup(this._t("error_title","Error"),this._t("update_profile_failed_message","Failed to update profile."),"info")}}async _setDefault(){var p,h,a,r,d,c;let t=this._pendingProfileId||this.selectedProfileId||((p=this.profile)==null?void 0:p.entity_id);this.selectedProfileId=t,this.dispatchEvent(new CustomEvent("profile-selected",{detail:{entityId:t},bubbles:!0,composed:!0}));let i=t,e=(a=(h=this.hass)==null?void 0:h.user)==null?void 0:a.id,s=((d=(r=this.hass)==null?void 0:r.user)==null?void 0:d.name)||this._t("user_fallback","this user"),o=this.allProfiles.find(u=>u.entity_id===i),n=(o==null?void 0:o.spoken_name)||"";if(!(!i||!e||!((c=this.hass)!=null&&c.connection)))try{let u=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/update_profile",entity_id:i,username:e});this.dispatchEvent(new CustomEvent("profiles-updated",{detail:u.all_profiles,bubbles:!0,composed:!0})),this._showPopup(this._t("default_profile_set_title","Default Profile Set"),this._tf("default_profile_set_message_html",`Default profile set to <b>{spokenName}</b> for HA user <b>{userName}</b>.<br>When using a voice assistant from <b>{userName}</b>'s companion app, <b>{spokenName}</b> will be the default name used when logging items (meaning you do not have to specify the user in the command. Simply "Log a cup of milk").<br><b>{spokenName}</b> will also be the default profile loaded on the Calorie Tracker side panel when logged in as <b>{userName}</b>.<br><br>NOTE: A calorie tracker spoken name must still be used when logging via voice assistants not associated with a Home Assistant user, such as a Home Assistant Voice Preview Edition device.`,{spokenName:n,userName:s}),"info"),this.isDefault=!0}catch(u){console.error("Failed to set default profile:",u),this._showPopup(this._t("error_title","Error"),this._t("set_default_profile_failed_message","Failed to set default profile."),"info")}}async _showPopup(t,i,e="info"){this.popupTitle=t,this.popupMessage=i,this.popupType=e,this.showPopup=!0,this.dispatchEvent(new CustomEvent("profile-modal-open",{bubbles:!0,composed:!0})),await this.updateComplete}_closePopup(){this.showPopup=!1,this.dispatchEvent(new CustomEvent("profile-modal-close",{bubbles:!0,composed:!0}))}async _restartHass(){if(this.showPopup=!1,this.hass)try{await this.hass.callService("homeassistant","restart")}catch(t){await this._showPopup(this._t("error_title","Error"),this._t("restart_failed_message","Failed to restart Home Assistant."),"info")}}async _checkIsDefault(){var i,e,s,o;let t=(e=(i=this.hass)==null?void 0:i.user)==null?void 0:e.id;if(!t||!((s=this.hass)!=null&&s.connection)){this.isDefault=!1;return}try{let n=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_user_profile",user_id:t}),p=(o=this.profile)==null?void 0:o.entity_id;this.isDefault=!!(n!=null&&n.default_profile)&&p&&n.default_profile.entity_id===p}catch(n){this.isDefault=!1}}async _confirmRemoveLinkedDevice(t){let i=Array.isArray(this.linkedDevices)?this.linkedDevices:this.linkedDevices&&typeof this.linkedDevices=="object"?Object.values(this.linkedDevices).flat():[];this.deviceToRemove=i[t],this.showRemoveLinkedConfirm=!0,this.dispatchEvent(new CustomEvent("profile-modal-open",{bubbles:!0,composed:!0})),await this.updateComplete,this._positionModalInContentArea("#remove-linked-modal")}_cancelRemoveLinkedDevice(){this.showRemoveLinkedConfirm=!1,this.deviceToRemove=null,this.dispatchEvent(new CustomEvent("profile-modal-close",{bubbles:!0,composed:!0})),this._cleanupModalPositioning("#remove-linked-modal")}async _doRemoveLinkedDevice(){var e,s;if(!((e=this.hass)!=null&&e.connection)||!this.deviceToRemove)return;let{linked_domain:t,linked_component_entry_id:i}=this.deviceToRemove;try{await this.hass.connection.sendMessagePromise({type:"calorie_tracker/unlink_linked_component",calorie_tracker_entity_id:this.profile.entity_id,linked_domain:t,linked_component_entry_id:i}),this.showRemoveLinkedConfirm=!1,this.deviceToRemove=null,this._cleanupModalPositioning("#remove-linked-modal");try{let o=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_linked_components",entity_id:this.profile.entity_id}),n=(s=o==null?void 0:o.linked_components)!=null?s:{};console.log("Refreshed linked devices:",n),this.linkedDevices=n,await this.updateComplete,this._showSnackbar("Device unlinked")}catch(o){console.error("Failed to refresh linked devices:",o),this._showSnackbar("Failed to refresh linked devices",!0)}this.dispatchEvent(new CustomEvent("refresh-profile",{bubbles:!0,composed:!0}))}catch(o){console.error("Failed to unlink device:",o),this._showSnackbar("Failed to unlink device",!0)}}_getDisplayHeight(t,i){if(!t)return"";if(i==="in"){let e=Math.floor(t/12),s=t%12;return`${e}'${s.toString().padStart(2,"0")}"`}return`${t} cm`}_percentToWeightPerWeek(t,i,e){if(t==null||i==null||isNaN(t)||isNaN(i))return null;let s=Number(t)/100,o=Math.abs(i*s);return this._formatWeightValue(o,e)}_formatWeightValue(t,i){return t==null||isNaN(t)?"":`${Math.round(t*10)/10}`}_setHeightInputsFromValue(t,i){i==="in"&&t?(this.heightFeetInput=Math.floor(t/12).toString(),this.heightInchesInput=(t%12).toString(),this.heightInput=""):i==="cm"&&t?(this.heightInput=t.toString(),this.heightFeetInput="",this.heightInchesInput=""):(this.heightInput="",this.heightFeetInput="",this.heightInchesInput="")}_getHeightInStorageUnit(){if(this.heightUnitInput==="in"){let t=parseInt(this.heightFeetInput)||0,i=parseInt(this.heightInchesInput)||0;return t*12+i}else return parseInt(this.heightInput)||0}async _loadImageAnalyzersAndPreference(){var t,i,e,s;try{let o=this.hass||(window==null?void 0:window.hass),n=(e=(i=(t=o==null?void 0:o.connection)==null?void 0:t.options)==null?void 0:i.auth)==null?void 0:e.accessToken,h=await(await fetch("/api/calorie_tracker/fetch_analyzers",{headers:{Authorization:`Bearer ${n}`}})).json();this.imageAnalyzers=h.analyzers||[];let a=this.selectedProfileId||((s=this.profile)==null?void 0:s.entity_id),r=await this._resolveConfigEntryIdForEntity(a);if(r){let c=await(await fetch("/api/calorie_tracker/get_preferred_analyzer",{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({config_entry_id:r})})).json();this.preferredImageAnalyzer=c.preferred_analyzer}}catch(o){console.warn("Failed to load image analyzers:",o),this.imageAnalyzers=[],this.preferredImageAnalyzer=null}}async _resolveConfigEntryIdForEntity(t){var i,e,s;try{let o=this.hass||(window==null?void 0:window.hass);if(!(o!=null&&o.connection)||!t)return null;if(((i=this.defaultProfile)==null?void 0:i.entity_id)===t&&((e=this.defaultProfile)!=null&&e.config_entry_id))return this.defaultProfile.config_entry_id;let n=await o.connection.sendMessagePromise({type:"calorie_tracker/get_daily_data",entity_id:t});return(s=n==null?void 0:n.config_entry_id)!=null?s:null}catch(o){return console.warn("Failed to resolve config_entry_id for entity:",t,o),null}}async _savePreferredAnalyzer(){var t,i,e,s;try{let o=this.hass||(window==null?void 0:window.hass),n=(e=(i=(t=o==null?void 0:o.connection)==null?void 0:t.options)==null?void 0:i.auth)==null?void 0:e.accessToken,p=this.selectedProfileId||((s=this.profile)==null?void 0:s.entity_id),h=await this._resolveConfigEntryIdForEntity(p);if(!h)return console.error("No config_entry_id available in profile card defaultProfile"),!1;let a=await fetch("/api/calorie_tracker/set_preferred_analyzer",{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({config_entry_id:h,analyzer_data:this.preferredImageAnalyzer||null})});if(!a.ok){let d=await a.text();return console.error("Profile card HTTP Error:",a.status,d),!1}let r=await a.json();return r.success===!0?!0:(console.error("Profile card API returned success=false:",r),!1)}catch(o){return console.error("Profile card exception in _savePreferredAnalyzer:",o),!1}}_showSnackbar(t,i=!1){this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:t},bubbles:!0,composed:!0}))}_getSortedGoals(){return[...this.goals].sort((t,i)=>new Date(i.start_date)-new Date(t.start_date))}_getGoalLabel(t,i){return t!=null&&t.is_new?this._t("goal_label_new","New Goal"):i===0?this._t("goal_label_current","Current Goal"):this._tf("goal_label_previous","Previous Goal {index}",{index:i})}async _saveGoals(){var t,i;try{let e=this.selectedProfileId||((t=this.profile)==null?void 0:t.entity_id);if(!e||!((i=this.hass)!=null&&i.connection))return;let s=this._collectGoalsFromUI();if(s.length===0){this._showPopup(this._t("invalid_goal_title","Invalid Goal"),this._t("no_goals_to_save_message","No goals to save."),"info");return}this.goals=s.map(a=>A({},a));let o=new Date,n="";for(let a=0;a<this.goals.length;a++){let r=this.goals[a],d=a+1;if(!r.start_date){n=this._tf("goal_validation_start_date_required","Goal {index}: Start date is required.",{index:d});break}let c=new Date(r.start_date);if(isNaN(c.getTime())){n=this._tf("goal_validation_invalid_start_date","Goal {index}: Invalid start date.",{index:d});break}c.setHours(0,0,0,0);let u=new Date(o);if(u.setHours(0,0,0,0),c>u){n=this._tf("goal_validation_start_date_future","Goal {index}: Start date cannot be in the future.",{index:d});break}let m=this._validateNumericInput(r.goal_value);if(m===null){n=this._tf("goal_validation_invalid_number",'Goal {index}: Goal value "{value}" is not a valid number.',{index:d,value:r.goal_value});break}if(r.goal_type==="variable_cut"||r.goal_type==="variable_bulk"?r.goal_value=Math.round(m*100)/100:r.goal_value=Math.round(m),r.goal_type==="variable_cut"||r.goal_type==="variable_bulk"){if(m<0||m>2){n=this._tf("goal_validation_percent_range","Goal {index}: Percent goal value must be between 0 and 2 (e.g. 0.75 for 0.75%).",{index:d});break}}else if(r.goal_type==="fixed_intake"||r.goal_type==="fixed_net_calories"){if(m<500||m>5e3){n=this._tf("goal_validation_fixed_range","Goal {index}: Fixed goal value must be between 500 and 5000.",{index:d});break}}else if((r.goal_type==="fixed_deficit"||r.goal_type==="fixed_surplus")&&(m<0||m>3e3)){n=this._tf("goal_validation_deficit_surplus_range","Goal {index}: Deficit/surplus value must be between 0 and 3000.",{index:d});break}}if(n){this._showPopup(this._t("invalid_goal_title","Invalid Goal"),n,"info");return}let h=[...this.goals].sort((a,r)=>new Date(r.start_date)-new Date(a.start_date)).map(c=>{var u=c,{original_start_date:a,is_new:r}=u,d=U(u,["original_start_date","is_new"]);return d});await this.hass.connection.sendMessagePromise({type:"calorie_tracker/save_goals",entity_id:e,goals:h}),this._closeGoalPopup(),this.dispatchEvent(new CustomEvent("goals-updated",{detail:{action:"save"},bubbles:!0,composed:!0}))}catch(e){console.error("Failed to save goals:",e)}}_collectGoalsFromUI(){var t;try{let i=(t=this.renderRoot)==null?void 0:t.querySelector("#goal-modal");if(!i)return[];let e=Array.from(i.querySelectorAll(".goal-cell")),s=[];for(let o of e){let n=o.querySelector("select"),p=o.querySelector('input[type="text"]'),h=o.querySelector('input[type="date"]');if(!n||!p||!h)continue;let a=o.getAttribute("data-original-start")||h.value,r=o.getAttribute("data-is-new")==="1";s.push({goal_type:n.value,goal_value:p.value,start_date:h.value,original_start_date:a,is_new:r})}return s}catch(i){return console.warn("Failed to collect goals from UI:",i),Array.isArray(this.displayGoals)?[...this.displayGoals]:[]}}_formatGoalDisplay(t){var s,o;let i=((o=(s=this.profile)==null?void 0:s.attributes)==null?void 0:o.weight_unit)||"lbs",e=this.currentWeight;return t.goal_type==="fixed_intake"||t.goal_type==="fixed_net_calories"?`${t.goal_value} kcal/day${t.goal_type==="fixed_net_calories"?" (net)":""}`:t.goal_type==="variable_cut"&&e?`${this._percentToWeightPerWeek(t.goal_value,e,i)} ${i}/wk (lose)`:t.goal_type==="variable_bulk"&&e?`${this._percentToWeightPerWeek(t.goal_value,e,i)} ${i}/wk (gain)`:`${t.goal_value} (${t.goal_type})`}_formatGoalValueForInput(t){if(!t)return"";let{goal_type:i,goal_value:e}=t;if(e==null||e==="")return"";let s=Number(e);return isNaN(s)?"":i==="variable_cut"||i==="variable_bulk"?(Math.round(s*100)/100).toString():Math.round(s).toString()}};y(z,"properties",{hass:{attribute:!1},profile:{attribute:!1},translations:{attribute:!1},isDefault:{type:Boolean},showSettings:{type:Boolean},spokenNameInput:{type:String},calorieGoalInput:{type:Number},startingWeightInput:{type:String},goalWeightInput:{type:String},showPopup:{type:Boolean},popupTitle:{type:String},popupMessage:{type:String},popupType:{type:String},allProfiles:{attribute:!1},selectedProfileId:{type:String},defaultProfile:{attribute:!1},linkedDevices:{attribute:!1},showRemoveLinkedConfirm:{type:Boolean},deviceToRemove:{attribute:!1},weightUnitInput:{type:String},birthYearInput:{type:String},sexInput:{type:String},heightInput:{type:String},heightUnitInput:{type:String},heightFeetInput:{type:String},heightInchesInput:{type:String},preferredImageAnalyzer:{attribute:!1},imageAnalyzers:{attribute:!1},goalType:{type:String},dailyGoal:{type:Number},currentWeight:{type:Number},showGoalPopup:{type:Boolean},goals:{type:Array},trackMacrosInput:{type:Boolean},weekStartDayInput:{type:String}}),y(z,"styles",[B`
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
    `]);customElements.get("profile-card")||customElements.define("profile-card",z)});export{z as a,tt as b};
//# sourceMappingURL=chunk-TDKEUX4J.js.map
