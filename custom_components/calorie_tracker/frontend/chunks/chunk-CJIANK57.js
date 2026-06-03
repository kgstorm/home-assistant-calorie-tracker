import{a as at,b as d,g as st,h as dt}from"./chunk-EMR7U3YA.js";import{a as _,b,c as it,e as lt,g as y}from"./chunk-5HHMTMB7.js";var _t=lt(()=>{dt();function ht(f){let w=t=>String(t).padStart(2,"0");return`${f.getFullYear()}-${w(f.getMonth()+1)}-${w(f.getDate())}T${w(f.getHours())}:${w(f.getMinutes())}:${w(f.getSeconds())}`}function ct(f){if(!f)return"";let w=new Date(f),t=String(w.getHours()).padStart(2,"0"),e=String(w.getMinutes()).padStart(2,"0");return`${t}:${e}`}function pt(f){let[w,t,e]=f.split("-").map(Number);return new Date(w,t-1,e)}function z(f=new Date){let w=f.getFullYear(),t=String(f.getMonth()+1).padStart(2,"0"),e=String(f.getDate()).padStart(2,"0");return`${w}-${t}-${e}`}function ut(f){let w=f?pt(f):new Date;return`${w.getDate().toString().padStart(2,"0")} ${w.toLocaleString(void 0,{month:"short"})} ${w.getFullYear()}`}var mt=(f=24)=>d`
  <svg width="${f}" height="${f}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <!-- Single angled caliper arm -->
      <path d="M6 18 L16.5 7"/>
      <!-- Fixed jaw near the tip -->
      <path d="M16.5 7 L19 8.5"/>
      <!-- Secondary small jaw -->
      <path d="M14.5 9 L16.2 10.2"/>
      <!-- Measurement ticks along the arm -->
      <path d="M9 15 L7.8 14"/>
      <path d="M11 13 L9.8 12"/>
      <!-- Hinge/pin at the tip -->
      <circle cx="16.5" cy="7" r="1.2"/>
    </g>
  </svg>
`,C=class extends st{constructor(){super();y(this,"_openAddEntry",()=>{this._closeAllModals(),this._addEntryType="food";let t=new Date,e=String(t.getHours()).padStart(2,"0"),i=String(t.getMinutes()).padStart(2,"0");this._addData={food_item:"",calories:0,exercise_type:"",duration_minutes:"",calories_burned:0,time:`${e}:${i}`},this._addError="",this._showAddPopup=!0});y(this,"_closeAddEntry",()=>{this._showAddPopup=!1,this._addError=""});y(this,"_onAddTypeChange",t=>{this._addEntryType=t.target.value,this._addError=""});y(this,"_onAddInputChange",(t,e)=>{let i=t.target.value;if(["p","c","f","a"].includes(e)&&(i=this._sanitizeDecimal(i),i!==t.target.value&&(t.target.value=i)),e==="duration_minutes"){let a=String(i).replace(/[^0-9:]/g,"");a!==i&&(t.target.value=a,i=a)}this._addData=b(_({},this._addData),{[e]:i}),this._addError=""});y(this,"_onAddTimeInput",t=>{this._addData=b(_({},this._addData),{time:t.target.value}),this._addError=""});y(this,"_saveAddEntry",()=>{if(this._addEntryType==="food"){if(!this._addData.food_item||!this._addData.calories){this._addError=this._t("add_food_validation_message","Please enter food item and calories.");return}if(!this._validateMacroCalories(this._addData.calories,this._addData.p,this._addData.c,this._addData.f,this._addData.a,s=>{this._addError=s}))return}else if(!this._addData.exercise_type||!this._addData.calories_burned){this._addError=this._t("add_exercise_validation_message","Please enter exercise type and calories burned.");return}let t=this.selectedDate;t||(t=z());let e=this._addData.time||"12:00",i=`${t}T${e}:00`;this._addError||(this.dispatchEvent(new CustomEvent("add-daily-entry",{detail:{entry_type:this._addEntryType,entry:this._addEntryType==="food"?_(_(_(_({food_item:this._addData.food_item,calories:Number(this._addData.calories),timestamp:i},this._isValidNumberStr(this._addData.p)?{p:Number(this._addData.p)}:{}),this._isValidNumberStr(this._addData.c)?{c:Number(this._addData.c)}:{}),this._isValidNumberStr(this._addData.f)?{f:Number(this._addData.f)}:{}),this._isValidNumberStr(this._addData.a)?{a:Number(this._addData.a)}:{}):b(_({exercise_type:this._addData.exercise_type},this._addData.duration_minutes?(()=>{let a=this._parseDurationToMinutes(this._addData.duration_minutes);return a===void 0&&(this._addError=this._t("duration_validation_message","Duration must be minutes (e.g. 45) or HH:MM or HH:MM:SS")),a!==void 0?{duration_minutes:Number(a)}:{}})():{}),{calories_burned:Number(this._addData.calories_burned),timestamp:i})},bubbles:!0,composed:!0})),this._closeAddEntry())});y(this,"_openPhotoAnalysis",async()=>{var e,i,a;this._closeAllModals();try{let s=this.hass||(window==null?void 0:window.hass),n=(a=(i=(e=s==null?void 0:s.connection)==null?void 0:e.options)==null?void 0:i.auth)==null?void 0:a.accessToken,o=await(await fetch("/api/calorie_tracker/fetch_analyzers",{headers:{Authorization:`Bearer ${n}`}})).json();this.imageAnalyzers=o.analyzers||[]}catch(s){alert("Failed to fetch image analyzers");return}if(!this.imageAnalyzers||this.imageAnalyzers.length===0){this._openMissingLLMModal("analyzers");return}this._photoDescription="";let t=await this._getPreferredAnalyzer();if(t){let s=this._findMatchingAnalyzer(t);if(s){this._selectedAnalyzer=s,this._showAnalysisTypeSelect=!0,this._photoFile=null,this._photoError="";return}this._showAnalyzerSelect=!0,this._selectedAnalyzer=null,this._photoFile=null,this._photoError="";return}if(this.imageAnalyzers.length===1){this._selectedAnalyzer=this.imageAnalyzers[0],this._showAnalysisTypeSelect=!0,this._photoFile=null,this._photoError="";return}this._showAnalyzerSelect=!0,this._selectedAnalyzer=null,this._photoFile=null,this._photoError=""});y(this,"_closeAnalyzerSelect",()=>{this._showAnalyzerSelect=!1});y(this,"_closeAnalysisTypeSelect",()=>{this._showAnalysisTypeSelect=!1});y(this,"_openProfileSettings",()=>{this._closeAnalyzerSelect(),this.dispatchEvent(new CustomEvent("open-profile-settings",{bubbles:!0,composed:!0}))});y(this,"_openCameraPicker",()=>{var e;let t=(e=this.shadowRoot)==null?void 0:e.getElementById("photo-camera-input");t&&(t.value="",t.click())});y(this,"_openGalleryPicker",()=>{var e;let t=(e=this.shadowRoot)==null?void 0:e.getElementById("photo-gallery-input");t&&(t.value="",t.click())});y(this,"_onPhotoFileChange",async t=>{let e=t.target,i=e!=null&&e.files&&e.files[0]?e.files[0]:null;await this._handlePhotoSelection(i),e&&(e.value="")});y(this,"_restartCamera",()=>{this._stopCameraStream(),this._cameraError="",this._cameraActive=!1,this._cameraStarting=!1,this._showPhotoUpload&&this._startCameraStream(!0)});y(this,"_capturePhotoFromCamera",async()=>{var o;if(this._useSystemCapture){this._openCameraPicker();return}if((!this._cameraActive||!this._cameraStream)&&(await this._startCameraStream(!0),!this._cameraActive||!this._cameraStream)){this._cameraStarting||(this._cameraError="Camera is not ready yet. Allow access or use the gallery option.");return}let t=(o=this.renderRoot)==null?void 0:o.getElementById("camera-preview");if(!t){this._cameraError="Camera preview is unavailable. Use the gallery option instead.";return}(!t.videoWidth||!t.videoHeight)&&await new Promise(c=>{let r=()=>{t.removeEventListener("loadeddata",r),c()};t.addEventListener("loadeddata",r,{once:!0}),setTimeout(c,500)});let e=t.videoWidth||1280,i=t.videoHeight||720,a=document.createElement("canvas");a.width=e,a.height=i;let s=a.getContext("2d");if(!s){this._cameraError="Unable to capture a photo. Try again or use the gallery option.";return}s.drawImage(t,0,0,e,i);let n=await new Promise(c=>a.toBlob(c,"image/jpeg",.92));if(!n){this._cameraError="Unable to capture a photo. Try again or use the gallery option.";return}let l=new File([n],`camera-capture-${Date.now()}.jpg`,{type:n.type||"image/jpeg"});this._cameraError="",await this._handlePhotoSelection(l)});y(this,"_closePhotoReview",()=>{this._showPhotoReview=!1,this._photoReviewItems=null,this._photoReviewRaw=null,this._photoReviewAnalyzer=null});y(this,"_closePhotoUpload",()=>{this._showPhotoUpload=!1,this._photoFile=null,this._photoError="",this._photoLoading=!1,this._cameraStarting=!1,this._cameraActive=!1,this._cameraError="",this._stopCameraStream(),this._useSystemCapture=!1,this._systemCaptureReason=null});y(this,"_closeMissingLLMModal",()=>{this._showMissingLLMModal=!1,this._missingLLMModalType=null});y(this,"_openChatAssist",async()=>{if(this._logToServer("debug","Chat assist opened."),this._closeAllModals(),this._chatHistory=[],this._chatInput="",this._conversationId=null,await this._fetchPipelinesAndAgents(),!this._conversationAgents||this._conversationAgents.length===0){this._openMissingLLMModal("agents");return}this._showChatAssist=!0});y(this,"_fetchPipelinesAndAgents",async()=>{var t;try{let e=this.hass||(window==null?void 0:window.hass);if(e!=null&&e.connection){let i=await e.connection.sendMessagePromise({type:"assist_pipeline/pipeline/list"});this._assistPipelines=i.pipelines||[];let a=i.preferred_pipeline;a&&(this._selectedPipeline=this._assistPipelines.find(r=>r.id===a)),!this._selectedPipeline&&this._assistPipelines.length>0&&(this._selectedPipeline=this._assistPipelines[0]);let n=(await e.connection.sendMessagePromise({type:"conversation/agent/list"})).agents||[];this._conversationAgents=n.filter(r=>!(r.id==="conversation.home_assistant"||r.id==="homeassistant"||r.id==="home_assistant"));let l=[],o=new Set;for(let r of this._conversationAgents)o.has(r.id)||(o.add(r.id),l.push(r));this._conversationAgents=l;let c=(t=this._selectedPipeline)==null?void 0:t.conversation_engine;this._selectedAgent=this._conversationAgents.find(r=>r.id===c)||this._conversationAgents[0]||null}else this._assistPipelines=[],this._selectedPipeline=null,this._conversationAgents=[],this._selectedAgent=null}catch(e){this._assistPipelines=[],this._selectedPipeline=null,this._conversationAgents=[],this._selectedAgent=null}this.requestUpdate()});y(this,"_closeChatAssist",()=>{this._showChatAssist=!1});y(this,"_onChatInputFocus",t=>{this._isCompactDevice()&&setTimeout(()=>{this.requestUpdate()},100)});y(this,"_onAgentChange",t=>{let e=t.target.value;this._selectedAgent=this._conversationAgents.find(i=>i.id===e)||null});y(this,"_processChatCommand",async t=>{var a,s,n,l,o,c,r,g,p;let e=this.shadowRoot.querySelector("#chat-text-input"),i=typeof t=="string"?t.trim():(this._chatInput||(e?e.value:"")).trim();if(!i){this._chatHistory=[...this._chatHistory,{role:"assistant",text:this._t("please_enter_command","Please enter a command.")}];return}typeof t!="string"&&(this._chatHistory=[...this._chatHistory,{role:"user",text:i}]),this._chatInput="",e&&(e.value="");try{let h=this.hass||(window==null?void 0:window.hass);if(!(h!=null&&h.connection))throw new Error("Home Assistant connection not available");let m=this.profile?{spoken_name:((a=this.profile.attributes)==null?void 0:a.spoken_name)||"default",entity_id:this.profile.entity_id,daily_goal:((s=this.profile.attributes)==null?void 0:s.daily_goal)||2e3,calories_today:((n=this.profile.attributes)==null?void 0:n.calories_today)||0,weight_unit:((l=this.profile.attributes)==null?void 0:l.weight_unit)||"lbs"}:null,u=this.selectedDate||z(),x=i;m&&(x=`Context: You are a calorie tracking assistant. Log nutritional data, physical activity, and health metrics. The person is ${m.spoken_name}, selected date is ${u}. When logging entries, use this person (${m.spoken_name}) and this date (${u}) unless the user explicitly specifies otherwise.

User request: ${i}`);let A={type:"conversation/process",text:x,conversation_id:this._conversationId,language:h.language||"en"};(o=this._selectedAgent)!=null&&o.id&&(A.agent_id=this._selectedAgent.id);let v=await h.connection.sendMessagePromise(A);v.conversation_id&&(this._conversationId=v.conversation_id);let $=this._t("command_processed_successfully","Command processed successfully");if((g=(r=(c=v.response)==null?void 0:c.speech)==null?void 0:r.plain)!=null&&g.speech)$=v.response.speech.plain.speech;else if((p=v.response)!=null&&p.text)$=v.response.text;else if(typeof v.response=="string")$=v.response;else if(v.response&&typeof v.response=="object")if(v.response.profile){let k=v.response.profile,P=k.daily_goal-k.calories_today;$=this._tf("logged_successfully_with_remaining","Logged successfully for {spokenName}. You have {remaining} calories remaining today.",{spokenName:k.spoken_name,remaining:P})}else $=JSON.stringify(v.response);this._chatHistory=[...this._chatHistory,{role:"assistant",text:$}],this.dispatchEvent(new CustomEvent("refresh-daily-data",{bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("refresh-summary",{bubbles:!0,composed:!0}))}catch(h){this._chatHistory=[...this._chatHistory,{role:"assistant",text:this._tf("failed_to_process_command","Failed to process command: {message}",{message:h.message})}]}});y(this,"_editWeight",async()=>{var n,l,o,c,r,g;let t=(n=this.log)==null?void 0:n.weight,e=(o=(l=this.profile)==null?void 0:l.attributes)==null?void 0:o.current_weight,i=(c=t!=null?t:e)!=null?c:null,a=((g=(r=this.profile)==null?void 0:r.attributes)==null?void 0:g.weight_unit)||"lbs",s=prompt(this._tf("enter_weight_prompt","Enter weight in {unit} (current: {current}):",{unit:a,current:i?`${i} ${a}`:this._t("not_set","not set")}),i||"");if(s!==null&&s.trim()!==""){let p=parseFloat(s.trim());if(!isNaN(p)&&p>0)try{await this.hass.callService("calorie_tracker","log_weight",{spoken_name:this.profile.attributes.spoken_name,weight:p,timestamp:this.selectedDate||new Date().toISOString().split("T")[0]}),this.dispatchEvent(new CustomEvent("refresh-daily-data",{bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("refresh-summary",{bubbles:!0,composed:!0}))}catch(h){alert(this._tf("error_saving_weight","Error saving weight: {message}",{message:h.message}))}else alert(this._t("valid_weight_required_message","Please enter a valid weight greater than 0."))}});y(this,"_editBodyFat",async()=>{var s,n,l,o;let t=(s=this.log)==null?void 0:s.body_fat_pct,e=(l=(n=this.profile)==null?void 0:n.attributes)==null?void 0:l.body_fat_percentage,i=(o=t!=null?t:e)!=null?o:null,a=prompt(this._tf("enter_body_fat_prompt","Enter body fat percentage (current: {current}):",{current:i?`${i.toFixed(1)}%`:this._t("not_set","not set")}),i||"");if(a!==null&&a.trim()!==""){let c=parseFloat(a.trim());if(!isNaN(c)&&c>=1&&c<=50)try{await this.hass.callService("calorie_tracker","log_body_fat",{spoken_name:this.profile.attributes.spoken_name,body_fat_pct:c,timestamp:this.selectedDate||new Date().toISOString().split("T")[0]}),this.dispatchEvent(new CustomEvent("refresh-daily-data",{bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("refresh-summary",{bubbles:!0,composed:!0}))}catch(r){alert(this._tf("error_saving_body_fat","Error saving body fat: {message}",{message:r.message}))}else alert(this._t("valid_body_fat_required_message","Please enter a valid body fat percentage between 1 and 50."))}});this._initializeState(),this._showMetrics=window.matchMedia("(min-width: 600px)").matches,this._mediaQuery=window.matchMedia("(min-width: 600px)"),this._userToggledMetrics=!1,this._mediaQueryListener=t=>{this._userToggledMetrics||(this._showMetrics=t.matches,this.requestUpdate())},this._keyboardVisible=!1,this._keyboardHeight=0}_initializeState(){this.translations={},this._translationsRequestedLang="",this._editIndex=-1,this._editData=null,this._showEditPopup=!1,this._addEntryType="food",this._addData={},this._addError="",this._showAddPopup=!1,this.imageAnalyzers=[],this._showAnalyzerSelect=!1,this._showPhotoUpload=!1,this._selectedAnalyzer=null,this._photoFile=null,this._photoError="",this._photoLoading=!1,this._photoDetectedItems=null,this._showPhotoReview=!1,this._photoReviewItems=null,this._photoReviewRaw=null,this._photoReviewAnalyzer=null,this._rememberAnalyzerChoice=!1,this._cameraStarting=!1,this._cameraActive=!1,this._cameraError="",this._cameraStream=null,this._useSystemCapture=!1,this._systemCaptureReason=null,this._showChatAssist=!1,this._assistPipelines=[],this._selectedPipeline=null,this._conversationAgents=[],this._selectedAgent=null,this._chatHistory=[],this._chatInput="",this._conversationId=null,this._showMissingLLMModal=!1,this._missingLLMModalType=null,this._editError=""}connectedCallback(){super.connectedCallback(),this._mediaQuery.addEventListener("change",this._mediaQueryListener),this._showMetrics=this._mediaQuery.matches,this._handleResize=this._handleResize.bind(this),window.addEventListener("resize",this._handleResize),this._setupKeyboardDetection(),this._onOpenPhotoAnalysis=t=>{var e;try{let i=(e=t==null?void 0:t.detail)==null?void 0:e.modal;this._openPhotoAnalysis().then(()=>{i&&setTimeout(()=>{try{i==="food_camera"&&typeof this._selectAnalysisType=="function"?this._selectAnalysisType("food"):i==="bodyfat_camera"&&typeof this._selectAnalysisType=="function"&&this._selectAnalysisType("bodyfat")}catch(a){}},200)}).catch(()=>{})}catch(i){}},this.addEventListener("open-photo-analysis",this._onOpenPhotoAnalysis),this._onOpenChatAssist=t=>{try{typeof this._openChatAssist=="function"&&this._openChatAssist()}catch(e){}},this.addEventListener("open-chat-assist",this._onOpenChatAssist)}disconnectedCallback(){super.disconnectedCallback(),this._mediaQuery.removeEventListener("change",this._mediaQueryListener),window.removeEventListener("resize",this._handleResize),this._modalPositionInterval&&(clearInterval(this._modalPositionInterval),this._modalPositionInterval=null),this._cleanupKeyboardDetection(),this._stopCameraStream(),this.removeEventListener("open-photo-analysis",this._onOpenPhotoAnalysis),this._onOpenChatAssist&&(this.removeEventListener("open-chat-assist",this._onOpenChatAssist),this._onOpenChatAssist=null)}_handleResize(){(this._showEditPopup||this._showAddPopup||this._showAnalyzerSelect||this._showAnalysisTypeSelect||this._showPhotoUpload||this._showPhotoReview||this._showMissingLLMModal||this._showChatAssist)&&this._positionModalsInContentArea()}_positionModalsInContentArea(){var t,e,i,a,s,n,l;try{let o=(t=this.renderRoot)==null?void 0:t.querySelectorAll(".modal");if(!(o!=null&&o.length))return;let c=(i=(e=this.contentBounds)==null?void 0:e.left)!=null?i:0,r=(s=(a=this.contentBounds)==null?void 0:a.width)!=null?s:window.innerWidth,g=(l=(n=this.contentBounds)==null?void 0:n.top)!=null?l:0;o.forEach(p=>{if(p.offsetParent===null)return;p.style.setProperty("background","rgba(0,0,0,0.5)","important"),p.style.setProperty("position","fixed","important"),p.style.setProperty("top","0px","important"),p.style.setProperty("bottom","0px","important"),p.style.setProperty("left","0px","important"),p.style.setProperty("right","0px","important"),p.style.setProperty("z-index","9999","important"),p.style.setProperty("display","flex","important");let h=p.classList.contains("photo-modal");p.style.setProperty("align-items",h?"flex-start":"center","important"),p.style.setProperty("justify-content","center","important"),p.style.setProperty("box-sizing","border-box","important");let m=g>0?g:0;h&&(m+=60),m>0?p.style.setProperty("padding-top",`${m}px`,"important"):p.style.setProperty("padding-top","0px","important");let u=p.querySelector(".modal-content");if(u&&r<window.innerWidth){let v=Math.min(r-32,400),$=c+(r-v)/2;u.style.position="absolute",u.style.left=`${$}px`,u.style.width=`${v}px`,u.style.right="",u.style.marginLeft="0",u.style.marginRight="0",u.style.maxWidth="400px"}else u&&(u.style.position="",u.style.left="",u.style.width="",u.style.right="",u.style.marginLeft="",u.style.marginRight="",u.style.maxWidth="")})}catch(o){console.warn("Failed to position modals:",o)}}_cleanupModalPositioning(){var t;try{let e=(t=this.renderRoot)==null?void 0:t.querySelectorAll(".modal");if(!(e!=null&&e.length))return;e.forEach(i=>{i.style.position="",i.style.left="",i.style.right="",i.style.top="",i.style.bottom="",i.style.alignItems="",i.style.justifyContent="",i.style.paddingTop="",i.style.transform="",i.style.zIndex="",i.style.background="";let a=i.querySelector(".modal-content");a&&(a.style.marginLeft="",a.style.marginRight="",a.style.maxWidth="")})}catch(e){}}_findContentContainer(){let t=this;for(;t;){let e=t.getRootNode&&t.getRootNode();if(e&&e.host){t=e.host;continue}if(t=t.parentNode,!t)break;if(t.querySelector){let i=t.querySelector(".content");if(i)return i}}return document.querySelector(".content")}_t(t,e){var a;let i=(a=this.translations)==null?void 0:a[t];return typeof i=="string"&&i.length>0?i:e}_tf(t,e,i={}){return this._t(t,e).replace(/\{(\w+)\}/g,(s,n)=>Object.prototype.hasOwnProperty.call(i,n)?String(i[n]):`{${n}}`)}async _loadTranslationsForLanguage(t){var e;if((e=this.hass)!=null&&e.connection)try{let i=await this.hass.connection.sendMessagePromise({type:"calorie_tracker/get_translations",language:t,namespace:"frontend.daily_data"});this.translations=(i==null?void 0:i.translations)||{},this._translationsRequestedLang=t}catch(i){this.translations={},this._translationsRequestedLang=t}}updated(t){var s,n,l;super.updated(t);let e=((n=(s=this.hass)==null?void 0:s.locale)==null?void 0:n.language)||((l=this.hass)==null?void 0:l.language)||"en";e&&this._translationsRequestedLang!==e&&this._loadTranslationsForLanguage(e),["_showEditPopup","_showAddPopup","_showAnalyzerSelect","_showAnalysisTypeSelect","_showPhotoUpload","_showPhotoReview","_showMissingLLMModal","_showChatAssist"].some(o=>t.has(o))&&requestAnimationFrame(()=>{this._positionModalsInContentArea()}),t.has("_showPhotoUpload")&&(this._showPhotoUpload&&!this._useSystemCapture?(this._cameraError="",this._startCameraStream()):this._stopCameraStream())}_logToServer(t,e){try{let i=this.hass||(window==null?void 0:window.hass);i!=null&&i.callService?i.callService("system_log","write",{level:t,message:`Calorie Tracker Frontend: ${e}`}):console.warn("Cannot log to server, hass.callService not available.")}catch(i){console.error("Failed to send log to server:",i)}}_sanitizeDecimal(t){if(t==null)return"";let e=String(t).trim();e.includes(",")&&((e.match(/,/g)||[]).length===1?e=e.replace(",","."):e=e.replace(/,/g,"")),e=e.replace(/[^0-9.]/g,"");let i=e.indexOf(".");return i!==-1&&(e=e.slice(0,i+1)+e.slice(i+1).replace(/\./g,"")),/^0\d/.test(e)&&(e=e.replace(/^0+/,"0")),e}_parseDurationToMinutes(t){if(t==null)return;let e=String(t).trim();if(e==="")return;if(/^\d+(?:\.\d+)?$/.test(e)){let a=Number(e);return Number.isNaN(a)?void 0:Math.round(a)}let i=e.split(":").map(a=>a.trim());if(i.length===2||i.length===3){let a=i.map(s=>s===""?0:Number(s));if(a.every(s=>!Number.isNaN(s)&&s>=0)){let s=(a.length===3,a[0]),n=(a.length===3,a[1]),l=a.length===3?a[2]:0;return Math.round(s*60+n+l/60)}}}_isValidNumberStr(t){return t!=null&&t!==""&&!isNaN(Number(t))}_validateMacroCalories(t,e,i,a,s,n,l=!1){var u,x;if(!((x=(u=this.profile)==null?void 0:u.attributes)!=null&&x.track_macros)||!t||isNaN(Number(t)))return!0;let o=Number(t),c=this._isValidNumberStr(e)?Number(e)*4:0,r=this._isValidNumberStr(i)?Number(i)*4:0,g=this._isValidNumberStr(a)?Number(a)*9:0,p=this._isValidNumberStr(s)?Number(s)*7:0,h=c+r+g+p;if(h===0)return!0;let m=Math.max(o*.1,20);if(h>o+m){let A=`Calories from macros (${Math.round(h)}) exceed total calories (${o})`;return l?n&&n(A):n(A),!1}return!0}_closeAllModals(){this._stopCameraStream(),this._showEditPopup=!1,this._showAddPopup=!1,this._showAnalyzerSelect=!1,this._showAnalysisTypeSelect=!1,this._showPhotoUpload=!1,this._showPhotoReview=!1,this._showChatAssist=!1,this._showMissingLLMModal=!1,this._useSystemCapture=!1,this._systemCaptureReason=null}_toggleMetrics(){this._userToggledMetrics=!0,this._showMetrics=!this._showMetrics}_setupKeyboardDetection(){window.visualViewport&&(this._onViewportResize=()=>{let t=window.visualViewport,e=window.innerHeight,i=t.height,a=e-i,s=this._keyboardVisible;this._keyboardVisible=a>150,this._keyboardHeight=this._keyboardVisible?a:0,s!==this._keyboardVisible&&this.requestUpdate()},window.visualViewport.addEventListener("resize",this._onViewportResize),window.visualViewport.addEventListener("scroll",this._onViewportResize))}_cleanupKeyboardDetection(){window.visualViewport&&this._onViewportResize&&(window.visualViewport.removeEventListener("resize",this._onViewportResize),window.visualViewport.removeEventListener("scroll",this._onViewportResize),this._onViewportResize=null)}_isCompactDevice(){return window.innerWidth<=430}render(){var n,l,o,c;let t=(l=(n=this.log)==null?void 0:n.food_entries)!=null?l:[],e=(c=(o=this.log)==null?void 0:o.exercise_entries)!=null?c:[],i=ut(this.selectedDate),a=e.length>0,s=t.length>0;return d`
      <div class="daily-data-card">
        ${this._renderHeader(i)}
        ${this._renderContent(a,s,e,t)}
        ${this._renderModals()}
      </div>
    `}_renderHeader(t){return d`
      <div class="header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
        <div class="header-text">
          <span>${t}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          ${this._renderActionButtons()}
        </div>
      </div>
    `}_renderActionButtons(){return d`
      <button class="ha-btn add-entry-btn" title=${this._t("add_manual_entry","Add Manual Entry")} @click=${this._openAddEntry}>
        <svg width="22" height="22" viewBox="0 0 24 24" style="vertical-align:middle;fill:#fff;">
          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
        </svg>
      </button>
      <button class="ha-btn add-entry-btn" title=${this._t("assist","Assist")} @click=${this._openChatAssist}>
        <svg width="22" height="22" viewBox="0 0 24 24" style="vertical-align:middle;fill:#fff;">
          <g>
            <path class="primary-path" d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9M10,16V19.08L13.08,16H20V4H4V16H10M17,11H15V9H17V11M13,11H11V9H13V11M9,11H7V9H9V11Z"></path>
          </g>
        </svg>
      </button>
      <button class="ha-btn add-entry-btn" title=${this._t("photo_analysis_food_or_bodyfat","Photo Analysis (Food or Body Fat)")} @click=${this._openPhotoAnalysis}>
        <svg width="22" height="22" viewBox="0 0 16 16" style="vertical-align:middle;fill:#fff;">
          <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
          <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
        </svg>
      </button>
    `}_renderContent(t,e,i,a){return d`
      ${this._renderMeasurementsSection()}
      ${t?this._renderExerciseSection(i):""}
      ${e?this._renderFoodSection(a):""}
      ${!t&&!e?d`<div class="no-items" style="margin-top: 16px;">${this._t("no_entries_today","No food or exercise entries logged for today.")}</div>`:""}
    `}_renderExerciseSection(t){let e=t.reduce((i,a)=>i+(Number(a.calories_burned)||0),0);return d`
      <div class="table-header" style="margin-top:8px; display: flex; align-items: center; justify-content: space-between;">
        <span>${this._t("exercise","Exercise")}</span>
        <span style="font-size: 0.98em; color: var(--secondary-text-color, #666); font-weight: 500;">${this._tf("exercise_total_calories","-{value} Cal",{value:e})}</span>
      </div>
      <ul class="item-list">
        ${t.map((i,a)=>this._renderEntry(i,a,"exercise"))}
      </ul>
    `}_renderMeasurementsSection(){var T,I,F,R,N,H,B,V,U,j,O,q,W,Z,Y,K,Q,G,J,X,tt,et;let t=(I=(T=this.profile)==null?void 0:T.attributes)!=null?I:{},e=t.weight_unit||"lbs",i=(F=this.log)==null?void 0:F.weight,a=t.current_weight,s=(R=i!=null?i:a)!=null?R:null,n=(N=this.log)==null?void 0:N.body_fat_pct,l=t.body_fat_percentage,o=(H=n!=null?n:l)!=null?H:null,c=(B=this.log)==null?void 0:B.bmr_and_neat,r=(U=(V=this.profile)==null?void 0:V.attributes)==null?void 0:U.bmr_and_neat,g=(j=c!=null?c:r)!=null?j:null,p=(q=(O=this.log)==null?void 0:O.macros)!=null?q:null,h=!!((Z=(W=this.profile)==null?void 0:W.attributes)!=null&&Z.track_macros),m=p?Number((K=(Y=p.p)!=null?Y:p.protein)!=null?K:0):0,u=p?Number((G=(Q=p.c)!=null?Q:p.carbs)!=null?G:0):0,x=p?Number((X=(J=p.f)!=null?J:p.fat)!=null?X:0):0,A=p?Number((et=(tt=p.a)!=null?tt:p.alcohol)!=null?et:0):0,v=m*4,$=u*4,k=x*9,P=A*7,S=v+$+k+P,E=S>0?Math.round(v/S*100):0,D=S>0?Math.round($/S*100):0,M=S>0?Math.round(k/S*100):0,gt=S>0?Math.round(P/S*100):0,ot=h,L=this._t("not_set","Not set"),rt=d`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;">
        <path class="primary-path" d="M7.41,8.58L12,13.17l4.59-4.59L18,10l-6,6-6-6z"/>
      </svg>
    `,nt=d`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;">
        <path class="primary-path" d="M7.41,15.41L12,10.83l4.59,4.58L18,14l-6-6-6,6z"/>
      </svg>
    `;return d`
      ${ot?d`
        <style>
          .macro-line .fat-grams {
            display: inline;
          }
          .macro-line .fat-percent {
            display: none;
          }
          .macro-line .protein-percent,
          .macro-line .carbs-percent {
            display: inline;
          }

          @media (max-width: 450px) {
            .macro-line .fat-grams {
              display: inline;
            }
            .macro-line .fat-percent {
              display: none;
            }
            .macro-line .protein-percent,
            .macro-line .carbs-percent {
              display: none;
            }
          }
        </style>
        <div class="macro-line" style="margin-top:8px; font-size:0.98em; color: var(--secondary-text-color, #666);">
          ${this._t("protein","Protein")}: ${m}g<span class="protein-percent">${E>0?` (${E}%)`:""}</span>&nbsp;&nbsp;&nbsp;${this._t("carbs","Carbs")}: ${u}g<span class="carbs-percent">${D>0?` (${D}%)`:""}</span>&nbsp;&nbsp;&nbsp;${this._t("fat","Fat")}: <span class="fat-grams">${x}g${M>0?` (${M}%)`:""}</span><span class="fat-percent">${M>0?`${M}%`:"0%"}</span>
        </div>
      `:""}

      <div class="table-header" style="margin-top:8px; display:flex; align-items:center; gap:0; justify-content:flex-start; border-bottom:1px solid var(--divider-color, #eee);">
        <span class="metrics-title" style="display: flex; align-items: center; gap: 6px;">
          ${this._t("body_metrics","Body metrics")}
          <button
            class="metrics-toggle-btn"
            @click=${()=>this._toggleMetrics()}
            title=${this._t("show_hide_body_metrics","Show/hide body metrics")}
            aria-label=${this._t("show_hide_body_metrics","Show/hide body metrics")}
            style="margin-left: 6px; color: inherit; vertical-align: middle; padding: 0 2px;"
          >
            ${this._showMetrics?nt:rt}
          </button>
        </span>
      </div>
      <div ?hidden=${!this._showMetrics}>
        <ul class="item-list measurements-list">
          <li class="item measurement-item">
            <span class="measurement-label">${this._t("weight","Weight")}</span>
            <span class="measurement-value">
              ${s?`${s} ${e}`:L}
            </span>
            <button class="edit-btn" title=${this._t("edit_weight","Edit Weight")} @click=${this._editWeight}>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.06,6.18L3,17.25V21H6.75L17.81,9.93L14.06,6.18Z" fill="#FFD700"/>
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87L20.71,7.04Z" fill="#FF6B6B"/>
              </svg>
            </button>
          </li>
          <li class="item measurement-item">
            <span class="measurement-label">${this._t("body_fat","Body Fat")}</span>
            <span class="measurement-value">
              ${o?`${o.toFixed(1)}%`:L}
            </span>
            <button class="edit-btn" title=${this._t("edit_body_fat","Edit Body Fat")} @click=${this._editBodyFat}>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.06,6.18L3,17.25V21H6.75L17.81,9.93L14.06,6.18Z" fill="#FFD700"/>
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87L20.71,7.04Z" fill="#FF6B6B"/>
              </svg>
            </button>
          </li>
          ${g?d`
            <li class="item measurement-item calculation-item">
              <span class="measurement-label baseline-burn-label">
                <span class="short-label">${this._t("baseline_calorie_burn","Baseline Calorie Burn")}</span>
                <span class="long-label">${this._t("baseline_calorie_burn_excluding_workouts","Baseline Calorie Burn (excluding workouts)")}</span>
              </span>
              <span class="measurement-value">${this._tf("calories_value","{value} Cal",{value:Math.round(g)})}</span>
              <span></span>
            </li>
          `:""}
        </ul>
      </div>
    `}_renderFoodSection(t){let e=t.reduce((i,a)=>i+(Number(a.calories)||0),0);return d`
      <div class="table-header" style="margin-top:16px; display: flex; align-items: center; justify-content: space-between;">
        <span>${this._t("food_log","Food Log")}</span>
        <span style="font-size: 0.98em; color: var(--secondary-text-color, #666); font-weight: 500;">${this._tf("calories_value","{value} Cal",{value:e})}</span>
      </div>
      <ul class="item-list">
        ${t.map((i,a)=>this._renderEntry(i,a,"food"))}
      </ul>
    `}_renderEntry(t,e,i){var s,n,l,o;let a=ct(t.timestamp);return i==="exercise"?d`
        <li class="item">
          <span class="item-time">${a}</span>
          <span class="item-name">${(s=t.exercise_type)!=null?s:this._t("exercise","Exercise")}</span>
          <span class="item-calories">${this._tf("exercise_total_calories","-{value} Cal",{value:(n=t.calories_burned)!=null?n:0})}</span>
          <button class="edit-btn" title=${this._t("edit","Edit")} @click=${()=>this._openEdit(e,b(_({},t),{type:"exercise"}))}>
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.06,6.18L3,17.25V21H6.75L17.81,9.93L14.06,6.18Z" fill="#FFD700"/>
              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87L20.71,7.04Z" fill="#FF6B6B"/>
            </svg>
          </button>
        </li>
      `:d`
        <li class="item">
          <span class="item-time">${a}</span>
          <span class="item-name">${(l=t.food_item)!=null?l:this._t("unknown","Unknown")}</span>
          <span class="item-calories">${this._tf("calories_value","{value} Cal",{value:(o=t.calories)!=null?o:0})}</span>
          <button class="edit-btn" title=${this._t("edit","Edit")} @click=${()=>this._openEdit(e,b(_({},t),{type:"food"}))}>
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.06,6.18L3,17.25V21H6.75L17.81,9.93L14.06,6.18Z" fill="#FFD700"/>
              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87L20.71,7.04Z" fill="#FF6B6B"/>
            </svg>
          </button>
        </li>
      `}_renderModals(){return d`
      ${this._showEditPopup?this._renderEditPopup():""}
      ${this._showAddPopup?this._renderAddPopup():""}
      ${this._showAnalyzerSelect?this._renderAnalyzerSelectModal():""}
      ${this._showAnalysisTypeSelect?this._renderAnalysisTypeSelectModal():""}
      ${this._showPhotoUpload?this._renderPhotoUploadModal():""}
      ${this._showPhotoReview?this._renderPhotoReviewModal():""}
      ${this._renderPhotoProcessingModal()}
      ${this._showChatAssist?this._renderChatAssistModal():""}
      ${this._showMissingLLMModal?this._renderMissingLLMModal():""}
    `}_openEdit(t,e){var a,s,n,l,o;let i="";if(e.timestamp){let c=new Date(e.timestamp),r=String(c.getHours()).padStart(2,"0"),g=String(c.getMinutes()).padStart(2,"0");i=`${r}:${g}`}e.type==="exercise"?this._editData=b(_({},e),{exercise_type:(a=e.exercise_type)!=null?a:"",duration_minutes:(s=e.duration_minutes)!=null?s:"",calories_burned:(n=e.calories_burned)!=null?n:0,time:i}):this._editData=_(_(_(_(b(_({},e),{food_item:(l=e.food_item)!=null?l:"",calories:(o=e.calories)!=null?o:0,time:i}),e.p!==void 0?{p:String(e.p)}:{}),e.c!==void 0?{c:String(e.c)}:{}),e.f!==void 0?{f:String(e.f)}:{}),e.a!==void 0?{a:String(e.a)}:{}),this._editIndex=t,this._showEditPopup=!0,this._editError=""}_closeEdit(){this._showEditPopup=!1,this._editIndex=-1,this._editData=null,this._editError=""}_onEditInput(t,e){let i=t.target.value;if(["p","c","f","a"].includes(e)&&(i=this._sanitizeDecimal(i),i!==t.target.value&&(t.target.value=i)),e==="duration_minutes"){let a=String(i).replace(/[^0-9:]/g,"");a!==i&&(t.target.value=a,i=a)}this._editData=b(_({},this._editData),{[e]:i}),this._editError=""}_onEditTimeInput(t){let e=t.target.value;this._editData=b(_({},this._editData),{time:e})}_saveEdit(){if(this._editData.type==="food"&&!this._validateMacroCalories(this._editData.calories,this._editData.p,this._editData.c,this._editData.f,this._editData.a,o=>{this._editError=o}))return;let t=this._editData.timestamp;if(this._editData.time&&this._editData.timestamp){let l=new Date(this._editData.timestamp),[o,c]=this._editData.time.split(":");l.setHours(Number(o)),l.setMinutes(Number(c)),l.setSeconds(0,0),t=ht(l)}let n=this._editData,{time:e,type:i}=n,a=it(n,["time","type"]),s;if(i==="exercise"){let l=this._parseDurationToMinutes(this._editData.duration_minutes);if(this._editData.duration_minutes&&l===void 0){this._editError=this._t("duration_validation_message","Duration must be minutes (e.g. 45) or HH:MM or HH:MM:SS");return}s={entry_id:this._editData.id,entry_type:"exercise",entry:b(_(b(_({},a),{timestamp:t}),l!==void 0?{duration_minutes:Number(l)}:{}),{calories_burned:Number(this._editData.calories_burned)})}}else s={entry_id:this._editData.id,entry_type:"food",entry:_(_(_(_(b(_({},a),{timestamp:t,calories:Number(this._editData.calories)}),this._isValidNumberStr(this._editData.p)?{p:Number(this._editData.p)}:{}),this._isValidNumberStr(this._editData.c)?{c:Number(this._editData.c)}:{}),this._isValidNumberStr(this._editData.f)?{f:Number(this._editData.f)}:{}),this._isValidNumberStr(this._editData.a)?{a:Number(this._editData.a)}:{})};this.dispatchEvent(new CustomEvent("edit-daily-entry",{detail:s,bubbles:!0,composed:!0})),this._closeEdit()}_renderEditPopup(){var e,i,a,s,n,l;let t=this._editData.type==="exercise";return d`
      <div class="modal" @click=${this._closeEdit}>
        <div class="modal-content" @click=${o=>o.stopPropagation()}>
          <div class="modal-header">${this._t("edit_entry","Edit Entry")}</div>
          ${this._editError?d`<div role="alert" style="color:#f44336;font-size:0.9em;margin:0 0 10px 0;line-height:1.3;">${this._editError}</div>`:""}
          <div class="edit-grid">
            <div class="edit-label">${this._t("time","Time")}</div>
            <input
              class="edit-input"
              type="time"
              .value=${this._editData.time}
              @input=${o=>this._onEditTimeInput(o)}
            />
            ${t?d`
              <div class="edit-label">${this._t("exercise","Exercise")}</div>
              <input
                class="edit-input"
                type="text"
                .value=${this._editData.exercise_type}
                data-edit-field="exercise_type"
                @input=${o=>this._onEditInput(o,"exercise_type")}
              />
              <div class="edit-label">${this._t("duration","Duration")}</div>
              <input
                class="edit-input"
                type="text"
                placeholder=${this._t("duration_placeholder_edit","In minutes or HH:MM:SS (Optional)")}
                .value=${this._editData.duration_minutes||""}
                data-edit-field="duration_minutes"
                @input=${o=>this._onEditInput(o,"duration_minutes")}
              />
              <div class="edit-label">${this._t("calories_burned","Calories Burned")}</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._editData.calories_burned}
                data-edit-field="calories_burned"
                @input=${o=>this._onEditInput(o,"calories_burned")}
              />
            `:d`
              <div class="edit-label">${this._t("item","Item")}</div>
              <input
                class="edit-input"
                type="text"
                .value=${this._editData.food_item}
                data-edit-field="food_item"
                @input=${o=>this._onEditInput(o,"food_item")}
              />
              <div class="edit-label">${this._t("calories","Calories")}</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._editData.calories}
                data-edit-field="calories"
                @input=${o=>this._onEditInput(o,"calories")}
              />
              ${(i=(e=this.profile)==null?void 0:e.attributes)!=null&&i.track_macros?d`
                <div class="edit-label">${this._t("protein_grams","Protein (g)")} <small style="opacity:0.7">${this._t("optional","optional")}</small></div>
                <input
                  class="edit-input"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  .value=${(a=this._editData.p)!=null?a:""}
                  @input=${o=>this._onEditInput(o,"p")}
                />
                <div class="edit-label">${this._t("carbs_grams","Carbs (g)")} <small style="opacity:0.7">${this._t("optional","optional")}</small></div>
                <input
                  class="edit-input"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  .value=${(s=this._editData.c)!=null?s:""}
                  @input=${o=>this._onEditInput(o,"c")}
                />
                <div class="edit-label">${this._t("fat_grams","Fat (g)")} <small style="opacity:0.7">${this._t("optional","optional")}</small></div>
                <input
                  class="edit-input"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  .value=${(n=this._editData.f)!=null?n:""}
                  @input=${o=>this._onEditInput(o,"f")}
                />
                <div class="edit-label">${this._t("alcohol_grams","Alcohol (g)")} <small style="opacity:0.7">${this._t("optional","optional")}</small></div>
                <input
                  class="edit-input"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  .value=${(l=this._editData.a)!=null?l:""}
                  @input=${o=>this._onEditInput(o,"a")}
                />
              `:""}
            `}
          </div>
          <div class="edit-actions">
            <button class="ha-btn" @click=${this._saveEdit}>${this._t("save","Save")}</button>
            <button class="ha-btn" @click=${this._closeEdit}>${this._t("cancel","Cancel")}</button>
            <button class="ha-btn error" @click=${this._deleteEdit}>${this._t("delete","Delete")}</button>
          </div>
        </div>
      </div>
    `}_deleteEdit(){this.dispatchEvent(new CustomEvent("delete-daily-entry",{detail:{entry_id:this._editData.id,entry_type:this._editData.type},bubbles:!0,composed:!0})),this._closeEdit()}_renderAddPopup(){return d`
      <div class="modal" @click=${this._closeAddEntry}>
        <div class="modal-content" @click=${t=>t.stopPropagation()}>
          <div class="modal-header">${this._t("add_entry","Add Entry")}</div>
          <div style="margin-bottom: 16px;">
            <label>
              <input type="radio" name="add-type" value="food"
                .checked=${this._addEntryType==="food"}
                @change=${this._onAddTypeChange}
              /> ${this._t("food","Food")}
            </label>
            <label style="margin-left: 18px;">
              <input type="radio" name="add-type" value="exercise"
                .checked=${this._addEntryType==="exercise"}
                @change=${this._onAddTypeChange}
              /> ${this._t("exercise","Exercise")}
            </label>
          </div>
          <div class="edit-grid">
            <div class="edit-label">${this._t("time","Time")}</div>
            <input
              class="edit-input"
              type="time"
              .value=${this._addData.time}
              @input=${this._onAddTimeInput}
            />
            ${this._addEntryType==="food"?d`
              <div class="edit-label">${this._t("item","Item")}</div>
              <input
                class="edit-input"
                type="text"
                data-edit-field="food_item"
                .value=${this._addData.food_item}
                @input=${t=>this._onAddInputChange(t,"food_item")}
              />
              <div class="edit-label">${this._t("calories","Calories")}</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                data-edit-field="calories"
                .value=${this._addData.calories}
                @input=${t=>this._onAddInputChange(t,"calories")}
              />
              <div class="edit-label">${this._t("protein_grams","Protein (g)")} <small style="opacity:0.7">${this._t("optional","optional")}</small></div>
              <input
                class="edit-input"
                type="text"
                inputmode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                data-edit-field="p"
                .value=${this._addData.p||""}
                @input=${t=>this._onAddInputChange(t,"p")}
              />
              <div class="edit-label">${this._t("carbs_grams","Carbs (g)")} <small style="opacity:0.7">${this._t("optional","optional")}</small></div>
              <input
                class="edit-input"
                type="text"
                inputmode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                data-edit-field="c"
                .value=${this._addData.c||""}
                @input=${t=>this._onAddInputChange(t,"c")}
              />
              <div class="edit-label">${this._t("fat_grams","Fat (g)")} <small style="opacity:0.7">${this._t("optional","optional")}</small></div>
              <input
                class="edit-input"
                type="text"
                inputmode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                data-edit-field="f"
                .value=${this._addData.f||""}
                @input=${t=>this._onAddInputChange(t,"f")}
              />
              <div class="edit-label">${this._t("alcohol_grams","Alcohol (g)")} <small style="opacity:0.7">${this._t("optional","optional")}</small></div>
              <input
                class="edit-input"
                type="text"
                inputmode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                data-edit-field="a"
                .value=${this._addData.a||""}
                @input=${t=>this._onAddInputChange(t,"a")}
              />
            `:d`
              <div class="edit-label">${this._t("exercise","Exercise")}</div>
              <input
                class="edit-input"
                type="text"
                .value=${this._addData.exercise_type}
                @input=${t=>this._onAddInputChange(t,"exercise_type")}
              />
              <div class="edit-label">${this._t("duration","Duration")}</div>
              <input
                class="edit-input"
                type="text"
                placeholder=${this._t("duration_placeholder_add","In minutes, HH:MM, or HH:MM:SS (Optional)")}
                .value=${this._addData.duration_minutes||""}
                @input=${t=>this._onAddInputChange(t,"duration_minutes")}
              />
              <div class="edit-label">${this._t("calories_burned","Calories Burned")}</div>
              <input
                class="edit-input"
                type="number"
                min="0"
                .value=${this._addData.calories_burned}
                @input=${t=>this._onAddInputChange(t,"calories_burned")}
              />
            `}
          </div>
          ${this._addError?d`
            <div style="color: #f44336; font-size: 0.95em; margin-bottom: 8px;">
              ${this._addError}
            </div>
          `:""}
          <div class="edit-actions">
            <button class="ha-btn" @click=${this._saveAddEntry}>${this._t("save","Save")}</button>
            <button class="ha-btn" @click=${this._closeAddEntry}>${this._t("cancel","Cancel")}</button>
          </div>
        </div>
      </div>
    `}async _getPreferredAnalyzer(){var t,e,i;try{let a=this.hass||(window==null?void 0:window.hass),s=(i=(e=(t=a==null?void 0:a.connection)==null?void 0:t.options)==null?void 0:e.auth)==null?void 0:i.accessToken,n=this._getConfigEntryId();return n?(await(await fetch("/api/calorie_tracker/get_preferred_analyzer",{method:"POST",headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"},body:JSON.stringify({config_entry_id:n})})).json()).preferred_analyzer:null}catch(a){return this._logToServer("debug",`Failed to get preferred analyzer: ${a}`),null}}async _setPreferredAnalyzer(t){var e,i,a;try{let s=this.hass||(window==null?void 0:window.hass),n=(a=(i=(e=s==null?void 0:s.connection)==null?void 0:e.options)==null?void 0:i.auth)==null?void 0:a.accessToken,l=this._getConfigEntryId();if(!l)return console.error("No config_entry_id available in daily-data card"),!1;let o=await fetch("/api/calorie_tracker/set_preferred_analyzer",{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({config_entry_id:l,analyzer_data:t})});if(!o.ok){let r=await o.text();return console.error("HTTP Error:",o.status,r),this._logToServer("debug",`HTTP Error ${o.status}: ${r}`),!1}let c=await o.json();return c.success===!0?!0:(console.error("API returned success=false:",c),!1)}catch(s){return console.error("Exception in _setPreferredAnalyzer:",s),this._logToServer("debug",`Failed to set preferred analyzer: ${s}`),!1}}_getConfigEntryId(){var e;return((e=this.log)==null?void 0:e.config_entry_id)||null}_findMatchingAnalyzer(t){return!t||!Array.isArray(this.imageAnalyzers)?null:this.imageAnalyzers.find(e=>e.config_entry!==t.config_entry?!1:t.ai_task_entity_id&&e.ai_task_entity_id?e.ai_task_entity_id===t.ai_task_entity_id:e.name===t.name)||null}_isAnalyzerAvailable(t){return!!this._findMatchingAnalyzer(t)}_getSystemCapturePreference(){var a;let t=navigator.userAgent||"",e=/iPad|iPhone|iPod/.test(t),i=t.includes("Macintosh")&&navigator.maxTouchPoints&&navigator.maxTouchPoints>1;if(e)return{useSystemCapture:!0,reason:"ios"};if(i)return{useSystemCapture:!0,reason:"mac_touch"};if(!((a=navigator==null?void 0:navigator.mediaDevices)!=null&&a.getUserMedia)){let s=window.isSecureContext;return console.warn(`Calorie Tracker: Camera API unavailable. Secure Context: ${s}. User Agent: ${navigator.userAgent}`),{useSystemCapture:!0,reason:"no_getusermedia"}}return{useSystemCapture:!1,reason:null}}_renderAnalyzerSelectModal(){return d`
      <div class="modal" @click=${this._closeAnalyzerSelect}>
        <div class="modal-content" @click=${t=>t.stopPropagation()}>
          <div class="modal-header">${this._t("select_image_analyzer","Select Image Analyzer")}</div>
          <div style="margin-bottom: 18px;">
            ${this.imageAnalyzers.map(t=>{var e;return d`
              <div style="margin-bottom: 8px;">
                <button class="ha-btn" style="width:100%;text-align:left;padding:12px;" @click=${()=>this._selectAnalyzer(t)}>
                  <div style="line-height:1.3;">
                    <div style="font-weight:500;">${t.name}</div>
                    <div style="font-size:0.85em;opacity:0.8;font-weight:normal;">${this._tf("analyzer_title_model","Title: {title}; Model: {model}",{title:t.title,model:(e=t.model)!=null?e:this._t("unknown","Unknown")})}</div>
                  </div>
                </button>
              </div>
            `})}
          </div>
          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.95em;">
              <input type="checkbox" .checked=${this._rememberAnalyzerChoice} @change=${t=>this._rememberAnalyzerChoice=t.target.checked} />
              ${this._t("remember_analyzer_choice","Remember my choice for next time")}
            </label>
          </div>
          <div class="edit-actions">
            <button class="ha-btn" @click=${this._closeAnalyzerSelect}>${this._t("cancel","Cancel")}</button>
          </div>
        </div>
      </div>
    `}_selectAnalyzer(t){this._selectedAnalyzer=t,this._showAnalyzerSelect=!1,this._showAnalysisTypeSelect=!0,this._photoFile=null,this._photoError="",this._rememberAnalyzerChoice&&this._setPreferredAnalyzer(t).then(e=>{e?this._logToServer("debug",`Saved preferred analyzer: ${t.name}`):this._logToServer("warning",`Failed to save preferred analyzer: ${t.name}`)})}_renderAnalysisTypeSelectModal(){return d`
      <div class="modal" @click=${this._closeAnalysisTypeSelect}>
        <div class="modal-content" @click=${t=>t.stopPropagation()}>
          <div class="modal-header">${this._t("choose_analysis_type","Choose Analysis Type")}</div>
          <div style="margin: 20px 0;">
            <button class="ha-btn analysis-type-btn" @click=${()=>this._selectAnalysisType("food")}>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 26px; line-height: 1;">🍽️</div>
                <div style="text-align: left;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${this._t("analyze_food","Analyze Food")}</div>
                  <div style="font-size: 0.9em; opacity: 0.8;">${this._t("analyze_food_description","Estimate food calories from an image")}</div>
                </div>
              </div>
            </button>

            <button class="ha-btn analysis-type-btn" @click=${()=>this._selectAnalysisType("bodyfat")}>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px; line-height: 1;">📏</div>
                <div style="text-align: left;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${this._t("analyze_body_fat","Analyze Body Fat")}</div>
                  <div style="font-size: 0.9em; opacity: 0.8;">${this._t("analyze_body_fat_description","Upload an image of your torso")}</div>
                </div>
              </div>
            </button>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--divider-color, #e0e0e0);">
            <button class="ha-btn" @click=${this._closeAnalysisTypeSelect}>${this._t("cancel","Cancel")}</button>
          </div>
        </div>
      </div>
    `}_selectAnalysisType(t){this._selectedAnalysisType=t,this._showAnalysisTypeSelect=!1,this._cameraStarting=!1,this._cameraActive=!1,this._cameraError="";let{useSystemCapture:e,reason:i}=this._getSystemCapturePreference();this._logToServer("debug",`Camera preference: useSystemCapture=${e}, reason=${i}, UA=${navigator.userAgent}`),this._useSystemCapture=e,this._systemCaptureReason=i,this._showPhotoUpload=!0}_renderPhotoUploadModal(){var c,r,g,p,h,m;let e=this._selectedAnalysisType==="bodyfat"?this._t("upload_body_fat_photo","Upload Body Fat Photo"):this._t("upload_food_photo","Upload Food Photo"),i=this._selectedAnalysisType==="food",a=this._useSystemCapture,s=/Android/.test(navigator.userAgent||""),n=!a&&!!this._cameraError,l=!a&&this._cameraActive,o=this._systemCaptureReason==="no_getusermedia"||this._systemCaptureReason==="no_media_devices";return d`
      <div class="modal photo-modal" @click=${()=>this._closePhotoUpload()}>
        <div class="modal-content photo-modal-content" @click=${u=>u.stopPropagation()}>
          <div class="photo-modal-shell">
            <div class="modal-header" style="margin-bottom:0;">${e}</div>
            <div class="photo-modal-scroll">
            ${l?"":d`
              <div style="font-size:1.08em;font-weight:bold;margin-bottom:8px;">
                ${this._t("note","NOTE:")}
                <div style="margin-left:18px;font-size:1em;font-weight:bold;">
                  ${this._t("photo_analysis_note_html","For paid models, standard rates apply.<br>Selected model must support image inputs.")}
                </div>
              </div>
            `}
            <div style="font-size:0.98em;margin-bottom:8px;">
              <div>${this._t("analyzer","Analyzer")}: <b>${(r=(c=this._selectedAnalyzer)==null?void 0:c.name)!=null?r:""}</b></div>
              <div style="font-size:0.9em;opacity:0.8;">${this._tf("analyzer_title_model","Title: {title}; Model: {model}",{title:(p=(g=this._selectedAnalyzer)==null?void 0:g.title)!=null?p:"",model:(m=(h=this._selectedAnalyzer)==null?void 0:h.model)!=null?m:this._t("unknown","Unknown")})}</div>
            </div>
            ${i?d`
              <div style="margin-bottom:10px;">
                <label style="font-size:0.98em;font-weight:500;display:block;margin-bottom:4px;">${this._t("optional_text_description","OPTIONAL: text description")}</label>
                <textarea class="edit-input" rows="3" style="font-size:1.05em;min-width:0;width:100%;resize:vertical;" placeholder=${this._t("photo_description_placeholder","e.g. mashed potatoes with gravy under the steak, butter on broccoli")} .value=${this._photoDescription||""} @input=${u=>{this._photoDescription=u.target.value}}></textarea>
              </div>
            `:""}

            ${o?d`
              <div style="margin-bottom:12px; padding:12px; background:var(--warning-color, #ffa000); color:black; border-radius:8px; font-size:0.95em; line-height:1.4;">
                <b>⚠️ Camera Preview Unavailable</b><br>
                Your connection appears to be insecure (HTTP). The Live Camera Preview requires a secure HTTPS connection.
                <div style="margin-top:4px; opacity:0.9; font-size:0.9em;">Please use the buttons below to take a photo or upload a file.</div>
              </div>
            `:""}

            <!--
              ALWAYS render the video container to prevent DOM thrashing.
              We hide it via CSS if system capture is active.
            -->
            <div style="display: ${a?"none":"block"};">
              <div class="photo-preview-frame">
                <video id="camera-preview" playsinline autoplay muted style="display:${this._cameraActive?"block":"none"}; width:100%; height:100%; object-fit:cover;"></video>
                ${this._cameraStarting?d`
                  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);">
                    <svg width="44" height="44" viewBox="0 0 24 24" style="animation: spin 1.5s linear infinite;">
                      <circle cx="12" cy="12" r="10" stroke="var(--primary-color, #03a9f4)" stroke-width="2" fill="none" stroke-dasharray="62.83" stroke-dashoffset="15.71"></circle>
                    </svg>
                  </div>
                `:""}
                ${!this._cameraStarting&&!this._cameraActive?d`
                  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--secondary-text-color, #ccc);text-align:center;padding:24px;">
                    ${this._cameraError?"Camera unavailable. Use the buttons below.":"Preparing camera..."}
                  </div>
                `:""}
              </div>
            </div>

            ${o?d`
              <!-- Warning already shown above -->
            `:""}

            <!-- Explicitly split inputs for maximum compatibility -->
            <input type="file" accept="image/*" capture="environment" @change=${this._onPhotoFileChange}
              style="display:none;" id="photo-camera-input" />
            <input type="file" accept="image/*" @change=${this._onPhotoFileChange}
              style="display:none;" id="photo-gallery-input" />

            ${this._photoFile?d`<div style="margin-top:4px;font-size:0.95em;">${this._tf("selected_file","Selected: {name}",{name:this._photoFile.name})}</div>`:""}
            ${this._cameraError?d`<div class="photo-modal-error" style="margin-top:8px;">${this._cameraError}</div>`:""}
            ${this._photoError?d`<div class="photo-modal-error" style="margin-top:8px;">${this._photoError}</div>`:""}
            </div>

            <div class="photo-modal-footer ${l?"overlay":""}">
              <div class=${`photo-modal-actions${l?" compact":""}`}>
                <!--
                  Primary Action:
                  If Live Preview is active: Capture from video.
                  If System Capture (or preview failed): Trigger Native Camera Input.
                -->
                ${!a&&this._cameraActive?d`
                  <button type="button" class="ha-btn" @click=${this._capturePhotoFromCamera}>
                    ${this._t("take_photo","Take Photo")}
                  </button>
                `:s?"":d`
                  <button type="button" class="ha-btn" @click=${this._openCameraPicker}>
                    ${this._t("take_photo","Take Photo")}
                  </button>
                `}

                <button type="button" class="ha-btn" @click=${this._openGalleryPicker}>
                  ${this._t("upload_file","Upload File")}
                </button>

                ${n?d`
                  <button type="button" class="ha-btn" style="background:var(--warning-color, #ffa000);color:#000;" @click=${this._restartCamera}>
                    ${this._t("retry_preview","Retry Preview")}
                  </button>
                `:""}
              </div>
            </div>
            <button class="photo-overlay-cancel" type="button" @click=${()=>this._closePhotoUpload()} aria-label=${this._t("close","Close")}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `}async _startCameraStream(t=!1){var e,i;if(this._showPhotoUpload){if(!((e=navigator.mediaDevices)!=null&&e.getUserMedia)){this._cameraError="Camera capture is not supported in this browser. Use the gallery option instead.",this._cameraActive=!1;return}if(this._cameraStream&&!t){this._cameraActive||await this._attachCameraStream(this._cameraStream),this._cameraActive=!0;return}if(!this._cameraStarting){this._cameraStarting=!0,this._cameraActive=!1,this._cameraError="";try{let{stream:a,usedFallback:s}=await this._acquireCameraStream();this._cameraStream=a,this._cameraActive=!0,s&&this._logToServer("debug","Camera fallback constraints were used"),await this._attachCameraStream(a)}catch(a){this._cameraActive=!1,this._cameraError=await this._handleCameraFailure(a),this._logToServer("warning",`Camera access failed: ${(i=a==null?void 0:a.name)!=null?i:a}`),this._stopCameraStream(),!this._useSystemCapture&&this._shouldFallbackToSystem(a)&&(this._useSystemCapture=!0,this._systemCaptureReason="fallback_error",this._cameraError="Unable to start the live preview on this device. Using the system camera instead.")}finally{this._cameraStarting=!1}}}}async _acquireCameraStream(){let t=[{video:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080}},audio:!1},{video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:!1},{video:{facingMode:{ideal:"environment"}},audio:!1},{video:{facingMode:"environment"},audio:!1},{video:{facingMode:{ideal:"user"}},audio:!1},{video:{facingMode:"user"},audio:!1},{video:!0,audio:!1}],e=null;for(let i=0;i<t.length;i+=1){let a=t[i];try{return{stream:await navigator.mediaDevices.getUserMedia(a),usedFallback:i>0}}catch(s){if(e=s,!this._shouldRetryCamera(s))throw s}}throw e!=null?e:new Error("Unable to access camera")}_shouldRetryCamera(t){return t!=null&&t.name?t.name==="NotFoundError"||t.name==="OverconstrainedError":!1}_shouldFallbackToSystem(t){return t!=null&&t.name?t.name==="NotFoundError"||t.name==="OverconstrainedError"||t.name==="NotAllowedError"||t.name==="SecurityError":!1}async _handleCameraFailure(t){var i;let e=this._mapCameraError(t);if(!t||!(t.name==="NotFoundError"||t.name==="OverconstrainedError")||!((i=navigator.mediaDevices)!=null&&i.enumerateDevices))return e;try{let s=(await navigator.mediaDevices.enumerateDevices()).filter(l=>l.kind==="videoinput");if(s.length===0)return"This device reported no available cameras. If you are using an older iOS device or a remote browser session, switch to a device with a camera or choose the gallery option.";if(s.every(l=>!l.label))return"Safari has not granted camera permission yet. In iOS Settings \u2192 Safari \u2192 Camera, set access to \u201CAllow\u201D, then reload Home Assistant and try again."}catch(a){this._logToServer("debug",`Camera enumerateDevices failed: ${a}`)}return e}async _attachCameraStream(t){var i;await this.updateComplete;let e=(i=this.renderRoot)==null?void 0:i.getElementById("camera-preview");if(e)try{e.srcObject=t,await e.play().catch(()=>{})}catch(a){this._cameraError=this._mapCameraError(a),this._cameraActive=!1}}_stopCameraStream(){var e;if(this._cameraStream){try{this._cameraStream.getTracks().forEach(i=>i.stop())}catch(i){console.warn("Failed to stop camera stream",i)}this._cameraStream=null}let t=(e=this.renderRoot)==null?void 0:e.getElementById("camera-preview");if(t&&t.srcObject)try{t.srcObject=null}catch(i){console.warn("Failed to clear camera preview",i)}this._cameraActive=!1,this._cameraStarting=!1}_mapCameraError(t){if(!t)return"Unable to access the camera. Please try again or use the gallery option.";switch(t.name){case"NotAllowedError":case"SecurityError":return"Camera access is blocked. Allow permission or use the gallery option.";case"NotFoundError":case"OverconstrainedError":return"Unable to open the camera. Confirm browser permissions and try again, or use the gallery option.";case"NotReadableError":case"TrackStartError":return"Camera is already in use by another application. Close it or use the gallery option.";default:return t.message||"Unable to access the camera. Please try again or use the gallery option."}}async _handlePhotoSelection(t){var e;if(!t){this._photoFile=null,this._photoError="";return}if(!((e=t.type)!=null&&e.startsWith("image/"))){this._photoError="Please select an image file.",this._photoFile=null;return}this._photoFile=t,this._photoError="",this._photoLoading=!0,this._stopCameraStream(),this._showPhotoUpload=!1,await new Promise(i=>setTimeout(i,10)),this._submitPhotoAnalysis().catch(i=>{this._photoLoading=!1,this._photoError=(i==null?void 0:i.message)||"Failed to analyze photo",this._showPhotoUpload=!0})}async _submitPhotoAnalysis(){var e,i,a,s,n,l;if(!this._photoFile||!this._selectedAnalyzer){this._photoError="Please select an analyzer and a photo",this._photoLoading=!1;return}let t=this._findMatchingAnalyzer(this._selectedAnalyzer)||this._selectedAnalyzer;if(t&&t!==this._selectedAnalyzer&&(this._selectedAnalyzer=t),!(t!=null&&t.config_entry)||!(t!=null&&t.ai_task_entity_id)){this._photoLoading=!1,this._photoError="Selected analyzer is no longer available. Please pick another analyzer.",this._photoFile=null,this._showAnalyzerSelect=!0;return}this._photoError="";try{let o=this._selectedAnalysisType==="bodyfat",c=o?"/api/calorie_tracker/analyze_body_fat":"/api/calorie_tracker/upload_photo",r=new FormData;r.append("config_entry",t.config_entry),r.append("ai_task_entity_id",t.ai_task_entity_id),r.append("image",this._photoFile),r.append("model",(e=t.model)!=null?e:""),!o&&this._photoDescription&&r.append("description",this._photoDescription),!o&&((a=(i=this.profile)==null?void 0:i.attributes)!=null&&a.track_macros)&&r.append("estimate_macros","1");let g=this.hass||(window==null?void 0:window.hass);if(!(g!=null&&g.connection))throw new Error("Home Assistant connection not available");let p=(n=(s=g.connection.options)==null?void 0:s.auth)==null?void 0:n.accessToken;if(!p)throw new Error("Authentication token not available");let h=await fetch(c,{method:"POST",headers:{Authorization:`Bearer ${p}`},body:r});if(!h.ok){let u=await h.json().catch(()=>({}));throw new Error(u.error||`HTTP ${h.status}`)}let m=await h.json();this._photoLoading=!1,o?m!=null&&m.success&&(m!=null&&m.body_fat_data)?(this._showPhotoUpload=!1,this._photoReviewItems=[m.body_fat_data],this._photoReviewRaw=m.raw_result,this._photoReviewAnalyzer=t.name,this._showPhotoReview=!0,this._selectedAnalyzer=null,this._photoFile=null,this._photoError=""):(this._photoError=this._deriveAnalyzerError(m,"Could not analyze body fat from photo"),this._showPhotoUpload=!0):m!=null&&m.success&&((l=m==null?void 0:m.food_items)==null?void 0:l.length)>0?(this._showPhotoUpload=!1,this._photoReviewItems=m.food_items.map(u=>{var x,A,v,$;return b(_({},u),{p:(x=u.p)!=null?x:u.protein,f:(A=u.f)!=null?A:u.fat,c:(v=u.c)!=null?v:u.carbs,a:($=u.a)!=null?$:u.alcohol,selected:!0})}),this._photoReviewRaw=m.raw_result,this._photoReviewAnalyzer=t.name,this._showPhotoReview=!0,this._selectedAnalyzer=null,this._photoFile=null,this._photoError=""):(this._photoError=this._deriveAnalyzerError(m,"Could not analyze photo"),this._showPhotoUpload=!0)}catch(o){this._photoLoading=!1,this._photoError=(o==null?void 0:o.message)||"Failed to analyze photo",this._showPhotoUpload=!0}}_deriveAnalyzerError(t,e){if(!t)return e;let i=typeof t.raw_result=="string"?t.raw_result.trim():"";return i||(typeof t.error=="string"?t.error.trim():"")||e}_renderPhotoReviewModal(){var i,a;if(!this._showPhotoReview||!this._photoReviewItems)return"";let t=((i=this._photoReviewItems[0])==null?void 0:i.measurement_type)==="body_fat",e=t?this._t("review_body_fat_analysis","Review Body Fat Analysis"):this._t("review_detected_food_items","Review Detected Food Items");return d`
      <div class="modal" @click=${()=>this._closePhotoReview()}>
        <div class="modal-content" @click=${s=>s.stopPropagation()}>
          <div class="modal-header">${e}</div>
          <div style="margin-bottom:12px;font-size:0.98em;">
            ${this._t("analyzer","Analyzer")}: <b>${(a=this._photoReviewAnalyzer)!=null?a:""}</b>
          </div>
          <form @submit=${s=>{s.preventDefault(),this._confirmPhotoReview()}}>
            <div style="max-height:260px;overflow-y:auto;">
              ${t?this._renderBodyFatReview():this._renderFoodItemsReview()}
            </div>
            <div class="edit-actions" style="margin-top:18px;">
              <button class="ha-btn" type="submit">${t?this._t("save_body_fat","Save Body Fat"):this._t("add_selected","Add Selected")}</button>
              <button class="ha-btn" type="button" @click=${this._closePhotoReview}>${this._t("cancel","Cancel")}</button>
            </div>
          </form>
        </div>
      </div>
    `}_renderFoodItemsReview(){var e,i;let t=!!((i=(e=this.profile)==null?void 0:e.attributes)!=null&&i.track_macros);return d`
      ${this._photoReviewItems.map((a,s)=>{var n,l,o,c;return d`
        <div style="padding:6px 0;border-bottom:1px solid var(--divider-color,#ddd);">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:${t?"6px":"0"};">
            <input type="checkbox" .checked=${a.selected} @change=${r=>this._togglePhotoReviewItem(s,r)} />
            <input data-edit-field="photo_item_${s}_food_item" class="edit-input" style="flex:2;" type="text" .value=${a.food_item} @input=${r=>this._editPhotoReviewItem(s,"food_item",r)} placeholder=${this._t("food_item","Food item")} />
            <input data-edit-field="photo_item_${s}_calories" class="edit-input" style="width:80px;" type="number" min="0" .value=${a.calories} @input=${r=>this._editPhotoReviewItem(s,"calories",r)} placeholder=${this._t("calories","Calories")} />
          </div>
          ${t?d`
            <div style="display:flex;flex-wrap:wrap;gap:6px;font-size:0.72em;align-items:center;">
              <label>${this._t("protein","Protein")}:
                <span style="position:relative;display:inline-flex;align-items:center;">
                  <input data-edit-field="photo_item_${s}_p" class="edit-input" style="width:46px;padding-right:12px;" type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" .value=${(n=a.p)!=null?n:""} @input=${r=>this._editPhotoReviewItem(s,"p",r)} />
                  ${a.p!==void 0&&a.p!==""&&Number(a.p)!==0?d`<span style="position:absolute;right:4px;pointer-events:none;opacity:0.6;">g</span>`:""}
                </span>
              </label>
              <label>${this._t("fat","Fat")}:
                <span style="position:relative;display:inline-flex;align-items:center;">
                  <input data-edit-field="photo_item_${s}_f" class="edit-input" style="width:46px;padding-right:12px;" type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" .value=${(l=a.f)!=null?l:""} @input=${r=>this._editPhotoReviewItem(s,"f",r)} />
                  ${a.f!==void 0&&a.f!==""&&Number(a.f)!==0?d`<span style="position:absolute;right:4px;pointer-events:none;opacity:0.6;">g</span>`:""}
                </span>
              </label>
              <label>${this._t("carbs","Carbs")}:
                <span style="position:relative;display:inline-flex;align-items:center;">
                  <input data-edit-field="photo_item_${s}_c" class="edit-input" style="width:46px;padding-right:12px;" type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" .value=${(o=a.c)!=null?o:""} @input=${r=>this._editPhotoReviewItem(s,"c",r)} />
                  ${a.c!==void 0&&a.c!==""&&Number(a.c)!==0?d`<span style="position:absolute;right:4px;pointer-events:none;opacity:0.6;">g</span>`:""}
                </span>
              </label>
              <label>${this._t("alcohol","Alcohol")}:
                <span style="position:relative;display:inline-flex;align-items:center;">
                  <input data-edit-field="photo_item_${s}_a" class="edit-input" style="width:46px;padding-right:12px;" type="text" inputmode="decimal" pattern="[0-9]*[.]?[0-9]*" .value=${(c=a.a)!=null?c:""} @input=${r=>this._editPhotoReviewItem(s,"a",r)} />
                  ${a.a!==void 0&&a.a!==""&&Number(a.a)!==0?d`<span style="position:absolute;right:4px;pointer-events:none;opacity:0.6;">g</span>`:""}
                </span>
              </label>
            </div>
          `:""}
        </div>
      `})}
    `}_renderBodyFatReview(){let t=this._photoReviewItems[0];return d`
      <div style="background:var(--secondary-background-color, #f5f5f5);padding:16px;border-radius:8px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <div style="font-size:32px; line-height: 0; color: currentColor;">${mt(32)}</div>
          <span style="font-size:1.1em;font-weight:bold;">${this._t("body_fat_analysis_result","Body Fat Analysis Result")}</span>
        </div>
        <div style="margin-bottom:8px;">
          <label style="display:block;font-weight:bold;margin-bottom:4px;">${this._t("body_fat_percentage","Body Fat Percentage")}:</label>
          <input class="edit-input" type="number" min="3" max="50" step="0.1" .value=${t.percentage}
                 @input=${e=>this._editPhotoReviewItem(0,"percentage",e)}
                 style="width:100px;" /> %
        </div>
        <div style="font-size:0.9em;opacity:0.7;margin-top:8px;">
          ${this._t("review_adjust_body_fat","Review and adjust the detected body fat percentage if needed, then save.")}
        </div>
      </div>
    `}_togglePhotoReviewItem(t,e){let i=[...this._photoReviewItems];i[t]=b(_({},i[t]),{selected:e.target.checked}),this._photoReviewItems=i}_editPhotoReviewItem(t,e,i){let a=[...this._photoReviewItems],s=["calories","p","f","c","a","percentage"],n=i.target.value;if(["p","c","f","c","a","percentage"].includes(e)&&e!=="calories"){let l=this._sanitizeDecimal(n);l!==n&&(i.target.value=l),a[t]=b(_({},a[t]),{[e]:l})}else s.includes(e)?a[t]=b(_({},a[t]),{[e]:n===""?void 0:Number(n)}):a[t]=b(_({},a[t]),{[e]:n});this._photoReviewItems=a}_confirmPhotoReview(){var e;if(!this._photoReviewItems||this._photoReviewItems.length===0){this._closePhotoReview();return}if(((e=this._photoReviewItems[0])==null?void 0:e.measurement_type)==="body_fat"){let i=this._photoReviewItems[0];if(!i.percentage||i.percentage<3||i.percentage>50){alert(this._t("body_fat_percentage_validation_message","Please enter a valid body fat percentage (3-50%)"));return}let a=this.selectedDate;a||(a=z());let s=new Date,n=String(s.getHours()).padStart(2,"0"),l=String(s.getMinutes()).padStart(2,"0"),o=`${a}T${n}:${l}:00`;this.dispatchEvent(new CustomEvent("add-daily-entry",{detail:{entry_type:"body_fat",entry:{body_fat_percentage:Number(i.percentage),timestamp:o}},bubbles:!0,composed:!0}))}else{let i=this._photoReviewItems.filter(r=>r.selected&&r.food_item&&r.calories!==void 0);if(i.length===0){this._closePhotoReview();return}let a=[];for(let r of i){let g=[];this._validateMacroCalories(r.calories,r.p,r.c,r.f,r.a,h=>g.push(h),!0)||a.push({item:r,warn:g[0]})}if(a.length>0){alert(this._tf("photo_review_macro_validation_message","One or more food items have calories from macros exceeding total calories. First issue: {issue}",{issue:a[0].warn}));return}let s=this.selectedDate;s||(s=z());let n=new Date,l=String(n.getHours()).padStart(2,"0"),o=String(n.getMinutes()).padStart(2,"0"),c=`${s}T${l}:${o}:00`;i.forEach((r,g)=>{this.dispatchEvent(new CustomEvent("add-daily-entry",{detail:{entry_type:"food",entry:_(_(_(_({food_item:r.food_item,calories:Number(r.calories),timestamp:c,analyzer:this._photoReviewAnalyzer,raw_result:this._photoReviewRaw},this._isValidNumberStr(r.p)?{p:Number(r.p)}:{}),this._isValidNumberStr(r.f)?{f:Number(r.f)}:{}),this._isValidNumberStr(r.c)?{c:Number(r.c)}:{}),this._isValidNumberStr(r.a)?{a:Number(r.a)}:{})},bubbles:!0,composed:!0}))})}this._closePhotoReview()}_renderPhotoProcessingModal(){return this._photoLoading?d`
      <div class="modal processing" style="background: rgba(0,0,0,0.28);">
        <div class="modal-content" style="text-align:center;">
          <div class="modal-header">${this._t("analyzing_photo","Analyzing Photo...")}</div>
          <div style="margin:24px 0;">
            <svg width="48" height="48" viewBox="0 0 24 24" style="animation: spin 2s linear infinite;">
              <circle cx="12" cy="12" r="10" stroke="var(--primary-color, #03a9f4)" stroke-width="2" fill="none" stroke-dasharray="62.83" stroke-dashoffset="15.71">
                <animate attributeName="stroke-dashoffset" dur="2s" values="62.83;0;62.83" repeatCount="indefinite"/>
              </circle>
            </svg>
            <style>
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </div>
          <div style="font-size:1em;">${this._selectedAnalysisType==="bodyfat"?this._t("analyzing_body_fat_photo_message","Please wait while we analyze your body fat photo."):this._t("analyzing_food_photo_message","Please wait while we analyze your food photo.")}</div>
        </div>
      </div>
    `:""}_openMissingLLMModal(t){this._closeAllModals(),this._missingLLMModalType=t,this._showMissingLLMModal=!0}_renderMissingLLMModal(){if(!this._showMissingLLMModal)return"";let t=this._missingLLMModalType==="analyzers",e=t?this._t("no_image_analyzer_found","No Image Analyzer Found"):this._t("no_conversation_agent_found","No Conversation Agent Found"),i=[{name:"Anthropic Claude",url:"https://www.home-assistant.io/integrations/anthropic"},{name:"Azure AI Tasks",url:"https://github.com/loryanstrant/HA-Azure-AI-tasks"},{name:"Google Generative AI Conversation",url:"https://www.home-assistant.io/integrations/google_generative_ai_conversation"},{name:"OpenAI Conversation",url:"https://www.home-assistant.io/integrations/openai_conversation"},{name:"Ollama",url:"https://www.home-assistant.io/integrations/ollama"}],a=[{name:"Anthropic Claude",url:"https://www.home-assistant.io/integrations/anthropic"},{name:"Azure OpenAI Conversation",url:"https://github.com/joselcaguilar/azure-openai-ha"},{name:"Google Generative AI Conversation",url:"https://www.home-assistant.io/integrations/google_generative_ai_conversation"},{name:"OpenAI Conversation",url:"https://www.home-assistant.io/integrations/openai_conversation"},{name:"Ollama",url:"https://www.home-assistant.io/integrations/ollama"}];return d`
      <div class="modal" @click=${this._closeMissingLLMModal}>
        <div class="modal-content" @click=${s=>s.stopPropagation()} style="max-width: 480px;">
          <div class="modal-header">${e}</div>
          <div style="margin-bottom: 16px; line-height: 1.5;">
            ${t?d`${this._t("missing_analyzer_help","To analyze photos, you need an AI Task service from one of the supported integrations below. AI Task requires Home Assistant 2025.7 or later.")}`:d`${this._t("missing_agent_help","To use the chat assistant, you need a conversation agent integration. Here are a few options:")}`}
          </div>
          <ul style="margin: 0 0 20px 20px; padding: 0; line-height: 1.6;">
            ${(t?i:a).map(s=>d`
              <li style="margin-bottom: 8px;">
                <a
                  href="${s.url}"
                  target="_blank"
                  style="
                    color: var(--primary-color, #03a9f4);
                    text-decoration: none;
                    font-weight: 500;
                  "
                  @mouseover=${n=>n.target.style.textDecoration="underline"}
                  @mouseout=${n=>n.target.style.textDecoration="none"}
                >
                  ${s.name}
                </a>
              </li>
            `)}
          </ul>
          <div style="font-size: 0.9em; color: var(--secondary-text-color, #666); margin-bottom: 16px; line-height: 1.4;">
            ${t?d`${this._t("missing_analyzer_note_html",'Note: For paid services, standard API rates apply.<br><br>If you would like another image analyzer supported, <a href="https://github.com/kgstorm/home-assistant-calorie-tracker/issues" target="_blank" style="color: var(--primary-color, #03a9f4); text-decoration: none;">submit an issue here</a>.')}`:d`${this._t("missing_agent_note","Note: For paid services, standard API rates apply.")}`}
          </div>
          <div class="edit-actions">
            <button class="ha-btn" @click=${this._closeMissingLLMModal}>${this._t("close","Close")}</button>
          </div>
        </div>
      </div>
    `}_renderChatAssistModal(){var g,p;if(!this._showChatAssist)return"";let t=!1;if(this.hass&&this.hass.themes&&this.hass.selectedTheme){let h=this.hass.selectedTheme;t=((g=h==null?void 0:h.theme)==null?void 0:g.toLowerCase().includes("dark"))||(h==null?void 0:h.dark)===!0}else window.matchMedia&&(t=window.matchMedia("(prefers-color-scheme: dark)").matches);let e="var(--card-background-color)",i="var(--primary-text-color)",a="var(--divider-color)",s=t?"var(--ha-card-background, #23272e)":"var(--ha-card-background, #fafbfc)",n=this._isCompactDevice(),l=this._keyboardVisible,o=this._keyboardHeight||0,c="min(600px, 80vh)",r="400px";if(n&&l){let x=(((p=window.visualViewport)==null?void 0:p.height)||window.innerHeight)-60-40;c=`${Math.max(250,x)}px`,r="250px"}return d`
      <div class="modal chat-assist" @click=${this._closeChatAssist}>
        <div
          class="modal-content"
          @click=${h=>h.stopPropagation()}
          style="
            min-width:340px;
            max-width:90vw;
            max-height:${c};
            height:auto;
            min-height:${r};
            display:flex;
            flex-direction:column;
          "
        >
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <button
              @click=${this._closeChatAssist}
              style="background:none;border:none;cursor:pointer;padding:4px;line-height:0;color:${i};"
              title=${this._t("close","Close")}
              tabindex="0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" style="fill:currentColor;">
                <path class="primary-path" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
              </svg>
            </button>
            <span style="font-size:1.15em;font-weight:500;margin-right:8px;">${this._t("agent","Agent")}</span>
            <select class="edit-input" style="flex:1;min-width:0;background:${e};color:${i};border:1px solid ${a};" @change=${this._onAgentChange}>
              ${this._conversationAgents.length>0?this._conversationAgents.map(h=>{var m;return d`
                <option value=${h.id} .selected=${h.id===((m=this._selectedAgent)==null?void 0:m.id)}>
                  ${h.name}
                </option>
              `}):d`
                <option disabled>${this._t("no_conversation_agents_available","No conversation agents available")}</option>
              `}
            </select>
          </div>
          <div style="flex:1;overflow-y:auto;margin-bottom:12px;border:1px solid ${a};padding:8px 6px 8px 6px;background:${s};">
            ${this._chatHistory.length===0?d`<div style="color:${t?"#aaa":"#888"};text-align:center;">${this._t("no_conversation_yet","No conversation yet.")}</div>`:this._chatHistory.map(h=>d`
                  <div style="margin-bottom:8px;">
                    <div style="font-weight:bold;color:${t?"#90caf9":"#1976d2"};">${h.role==="user"?this._t("you","You"):this._t("assistant_label","Assistant")}:</div>
                    <div style="white-space:pre-line;">${h.text}</div>
                  </div>
                `)}
          </div>
          <div style="margin-bottom:12px;">
            <div style="display:flex;gap:8px;align-items:flex-end;">
              <textarea
                class="edit-input"
                placeholder=${this._t("type_command_here","Type command here...")}
                rows="3"
                style="flex:1;resize:vertical;background:${e};color:${i};border:1px solid ${a};"
                id="chat-text-input"
                .value=${this._chatInput}
                @input=${h=>this._onChatInput(h)}
                @focus=${this._onChatInputFocus}
                @keydown=${h=>{h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),this._processChatCommand())}}
              ></textarea>
              <button
                title=${this._t("send_message","Send Message")}
                @click=${this._processChatCommand}
                style="
                  align-items: center;
                  background: var(--primary-color, #03a9f4);
                  border: none;
                  border-radius: 8px;
                  color: rgb(255, 255, 255);
                  cursor: pointer;
                  display: flex;
                  font-family: var(--mdc-typography-font-family, 'Roboto', 'Noto', sans-serif);
                  font-size: 24px;
                  font-weight: 400;
                  height: 32px;
                  justify-content: center;
                  line-height: normal;
                  margin-bottom: 0;
                  padding: 0;
                  pointer-events: auto;
                  text-align: center;
                  transition: background 0.2s;
                  user-select: none;
                  vertical-align: middle;
                  width: 32px;
                  -webkit-font-smoothing: antialiased;
                  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                "
                @mouseover=${h=>h.target.style.background="var(--primary-color-dark, #0288d1)"}
                @mouseout=${h=>h.target.style.background="var(--primary-color, #03a9f4)"}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" style="fill: rgb(255, 255, 255); vertical-align: middle;">
                  <path class="primary-path" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `}_onChatInput(t){let e=t.target.value;this._chatInput=e,e.endsWith(`
`)&&(this._processChatCommand(),t.target.value="",this._chatInput="")}};y(C,"properties",{hass:{attribute:!1},profile:{attribute:!1},log:{attribute:!1},translations:{attribute:!1},selectedDate:{type:String},contentBounds:{attribute:!1},_editIndex:{type:Number,state:!0},_editData:{attribute:!1,state:!0},_showEditPopup:{type:Boolean,state:!0},_editError:{type:String,state:!0},_addEntryType:{type:String,state:!0},_showAddPopup:{type:Boolean,state:!0},_addData:{attribute:!1,state:!0},_addError:{type:String,state:!0},imageAnalyzers:{attribute:!1},_showAnalyzerSelect:{type:Boolean,state:!0},_showAnalysisTypeSelect:{type:Boolean,state:!0},_selectedAnalysisType:{type:String,state:!0},_showPhotoUpload:{type:Boolean,state:!0},_showPhotoReview:{type:Boolean,state:!0},_photoLoading:{type:Boolean,state:!0},_photoError:{type:String,state:!0},_cameraStarting:{type:Boolean,state:!0},_cameraActive:{type:Boolean,state:!0},_cameraError:{type:String,state:!0},_useSystemCapture:{type:Boolean,state:!0},_systemCaptureReason:{type:String,state:!0},_showChatAssist:{type:Boolean,state:!0},_chatHistory:{attribute:!1,state:!0},_chatInput:{attribute:!1,state:!0},_showMissingLLMModal:{type:Boolean,state:!0},_missingLLMModalType:{type:String,state:!0},_showMetrics:{type:Boolean,state:!0},_keyboardVisible:{type:Boolean,state:!0},_keyboardHeight:{type:Number,state:!0},_translationsRequestedLang:{type:String,state:!0}}),y(C,"styles",[at`
      .ha-btn {
        margin-left: 0;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: var(--ha-button-border-radius, 4px);
        padding: 4px 10px;
        font-size: 0.95em;
        cursor: pointer;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
        transition: background 0.2s;
        box-shadow: var(--ha-button-box-shadow, none);
        min-width: 32px;
        min-height: 28px;
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
      .daily-data-card {
        background: var(--card-background-color, #fff);
        border-radius: 8px;
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.05));
        padding: 6px 0;
        margin: 0;
        width: 100%;
        box-sizing: border-box;
        max-width: 420px; /* Add a max-width for desktop */
        margin-left: auto;
        margin-right: auto;
        position: relative;
  /* Removed z-index to prevent stacking context that could trap internal fixed modals */
      }
      .header {
        font-size: 16px;
        font-weight: bold;
        color: var(--primary-text-color, #333);
        padding: 0 16px 8px 16px;
      }
      .header-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      @media (min-width: 370px) {
        .header-text {
          flex-direction: row;
          align-items: center;
          gap: 4px;
        }
      }
      .baseline-burn-label .long-label { display: none; }
      .baseline-burn-label .short-label { display: inline; }
      @media (min-width: 420px) {
        .baseline-burn-label .long-label { display: inline; }
        .baseline-burn-label .short-label { display: none; }
      }
      .item-list {
        list-style: none;
        margin: 0;
        padding: 0 16px;
      }
      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--divider-color, #eee);
        padding: 6px 0;
        font-size: 14px;
        color: var(--primary-text-color, #333);
      }
      .item:last-child {
        border-bottom: none;
      }
      .item-time {
        color: var(--secondary-text-color, #888);
        font-size: 13px;
        min-width: 48px;
        text-align: left;
        margin-right: 8px;
        flex-shrink: 0;
      }
      .item-name {
        font-weight: 500;
        flex: 1;
        margin-right: 8px;
        color: var(--primary-text-color, #333);
      }
      .item-calories {
        color: var(--secondary-text-color, #666);
        font-size: 13px;
        min-width: 60px;
        text-align: right;
        margin-right: 8px;
        flex-shrink: 0;
      }
      .edit-btn {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        cursor: pointer;
        font-size: 14px;
        padding: 1px 4px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .edit-btn:hover {
        background: var(--primary-color-light, #e3f2fd);
      }
      .measurements-list .edit-btn {
        height: 22px;
        min-height: 22px;
      }
      .no-items {
        color: var(--secondary-text-color, #888);
        font-size: 14px;
        text-align: center;
        padding: 12px 0;
      }
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        font-weight: 600;
        color: var(--secondary-text-color, #666);
        padding: 0 16px 4px 16px;
        border-bottom: 1px solid var(--divider-color, #eee);
      }
      .table-header span {
        flex-shrink: 0;
      }
      .table-header .header-time {
        min-width: 48px;
        text-align: left;
        margin-right: 8px;
      }
      .table-header .header-name {
        flex: 1;
        margin-right: 8px;
        text-align: left;
      }
      .table-header .header-calories {
        min-width: 60px;
        text-align: right;
      }
      /* Popup styles */
      .modal {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 0;
        z-index: var(--ct-modal-z, 1500);
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
      }
      .modal.chat-assist {
        z-index: calc(var(--ct-modal-z, 1500) + 50);
      }
      .modal-content {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        padding: 24px;
        border-radius: var(--ha-card-border-radius, 12px);
        min-width: 320px;
        max-width: 400px !important;
        box-shadow: var(--ha-card-box-shadow, 0 8px 32px rgba(0,0,0,0.4));
        text-align: left;
        width: 100%;
      }
      .modal.photo-modal {
        padding: 60px 16px 16px 16px;
        align-items: flex-start;
      }
      .photo-modal-content {
        max-width: min(480px, 100vw);
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-bottom: 24px;
      }
      .photo-modal-shell {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 0;
      }
      .photo-modal-scroll {
        overflow-y: auto;
        flex: 1;
        padding-right: 4px;
      }
      .photo-preview-frame {
        position: relative;
        background: #000;
        border-radius: 8px;
        overflow: hidden;
        min-height: 500px;
        max-height: 80vh;
        aspect-ratio: 2 / 3;
      }
      .photo-preview-frame video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .photo-modal-footer {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
      }
      .photo-modal-footer.overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
        padding: 16px;
        z-index: 10;
        margin: 0;
        border-radius: 0 0 12px 12px;
      }
      .photo-modal-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 4px;
      }
      .photo-modal-actions .ha-btn {
        flex: 1;
        min-width: 140px;
        min-height: 44px;
        font-size: 1.05em;
      }

      .photo-modal-actions.compact {
        flex-wrap: nowrap;
        gap: 6px;
      }

      .photo-modal-actions.compact .ha-btn {
        min-width: 0;
        min-height: 36px;
        font-size: 0.9em;
        padding: 6px 8px;
      }
      .photo-modal-note {
        font-size: 0.95em;
        color: var(--secondary-text-color, #666);
        margin-bottom: 4px;
      }
      .photo-modal-error {
        color: #f44336;
        font-size: 0.95em;
      }
      .photo-overlay-cancel {
        position: absolute;
        top: -8px;
        right: 0;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color, #333);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 2;
      }
      .photo-overlay-cancel:hover,
      .photo-overlay-cancel:focus-visible {
        background: var(--divider-color, #e0e0e0);
      }
      @media (max-width: 640px) {
        .modal.photo-modal {
          padding: 50px;
        }
        .photo-modal-content {
          border-radius: 12px;
          min-height: auto;
          max-height: 85vh;
          padding: 16px;
        }
        .photo-modal-scroll {
          max-height: none;
        }
        .photo-modal-actions .ha-btn {
          flex-basis: 100%;
        }

        .photo-modal-actions.compact .ha-btn {
          flex-basis: auto;
        }
        .photo-preview-frame {
          min-height: 350px;
          max-height: 58vh;
        }
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
      .edit-actions button {
        min-width: 90px;
      }
      .analysis-type-btn {
        width: 100%;
        text-align: left;
        padding: 16px;
        margin-bottom: 12px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        border: 2px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .analysis-type-btn:hover {
        border-color: var(--primary-color, #03a9f4);
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }
      .add-btn {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        cursor: pointer;
        font-size: 22px;
        padding: 2px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .add-btn:hover {
        background: var(--primary-color-light, #e3f2fd);
      }
      .ha-btn.add-entry-btn {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: 8px;
        width: 32px;
        height: 32px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-family: var(--mdc-typography-font-family, "Roboto", "Noto", sans-serif);
        transition: background 0.2s;
        min-width: 28px;
        min-height: 18px;
        font-weight: 500;
        letter-spacing: 0.0892857em;
        text-transform: uppercase;
      }
      .ha-btn.add-entry-btn:hover {
        background: var(--primary-color-light, #e3f2fd);
        color: var(--primary-color, #03a9f4);
      }

      /* Analysis Type Selection Modal */

      .ha-btn.secondary {
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color, #212121);
      }

      .ha-btn.secondary:hover {
        background: var(--divider-color, #e0e0e0);
      }

      /* Responsive modal for small screens */
      @media (max-width: 480px) {
        .analysis-modal-content {
          min-width: 0;
          max-width: 92vw;
          max-height: 85vh;
          padding: 16px;
          margin: 8px;
        }
        .analysis-modal-header {
          font-size: 1.1em;
          margin-bottom: 16px;
        }
      }

      /* Measurements section styles */
      .measurements-list .measurement-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 8px;
        align-items: center;
        padding: 2px 0;
        border-bottom: none;
        font-size: 12px;
      }
      .measurement-label {
        font-weight: normal;
        color: var(--primary-text-color, #333);
      }
      .measurement-value {
        color: var(--secondary-text-color, #666);
        font-size: 12px;
        text-align: right;
        min-width: 80px;
      }
      .macro-line {
        padding: 0 16px;
      }
      .calculation-item {
        grid-template-columns: 1fr auto auto !important;
      }
      .calculation-item .edit-btn {
        display: none;
      }

      .metrics-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        color: var(--secondary-text-color, #666);
        padding: 0 16px 4px 16px;
        border-bottom: 1px solid var(--divider-color, #eee)
      }
      .metrics-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--secondary-text-color, #666);
      }
      .metrics-toggle-btn {
        background: none;
        border: none;
        font-size: 14px;
        cursor: pointer;
        padding: 2px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .metrics-toggle-btn:hover {
        background: var(--primary-color-light, #e3f2fd);
      }

      /* Mobile-specific styles for chat modal */
      @media (max-width: 640px) {
        .modal.chat-assist {
          align-items: flex-start;
          padding-top: 20px;
        }
        .modal.chat-assist .modal-content {
          max-height: 70vh;
          min-height: 300px;
          height: auto;
          width: 90vw;
          margin: 0 auto;
        }
      }

      /* Compact devices (iPhone 12 mini and similar) */
      @media (max-width: 430px) {
        .modal.chat-assist {
          padding-top: 10px;
        }
        .modal.chat-assist .modal-content {
          width: 95vw;
          padding: 16px;
        }
      }

      /* Additional support for very small mobile screens */
      @media (max-height: 600px) {
        .modal.chat-assist .modal-content {
          max-height: 85vh;
          min-height: 250px;
        }
      }
    `]);customElements.get("daily-data-card")||customElements.define("daily-data-card",C)});export{_t as a};
//# sourceMappingURL=chunk-CJIANK57.js.map
