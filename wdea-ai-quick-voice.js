(()=>{'use strict';
const companion=document.getElementById('wdea-companion');
if(!companion||document.getElementById('wdea-quick-voice'))return;
const panel=document.getElementById('wdea-ai-panel');
const quick=document.createElement('button');quick.id='wdea-quick-voice';quick.type='button';quick.setAttribute('aria-label','Gyors hangbeszélgetés indítása');quick.setAttribute('aria-pressed','false');quick.innerHTML='<span class="wdea-wave-icon" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="wdea-quick-label">Hang</span>';
document.body.append(quick);
const toast=document.createElement('div');toast.id='wdea-quick-status';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast);
let active=false,rec=null,showTimer=null,recognitionSupported=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
function status(msg){toast.textContent=msg;toast.classList.add('visible');clearTimeout(showTimer);showTimer=setTimeout(()=>toast.classList.remove('visible'),2900)}
function animate(state){companion.dataset.state=state;companion.classList.remove('wdea-react-wave','wdea-react-joy','wdea-react-listen');void companion.offsetWidth;companion.classList.add(state==='speaking'?'wdea-react-wave':state==='thinking'?'wdea-react-joy':state==='listening'?'wdea-react-listen':'wdea-react-wave')}
function stop(){clearTimeout(resumeT);paused=false;if(rec){const r=rec;rec=null;try{r.onend=null;r.abort()}catch(e){}}active=false;quick.classList.remove('active');quick.setAttribute('aria-pressed','false');quick.setAttribute('aria-label','Gyors hangbeszélgetés indítása');animate('idle');status('Mikrofon kikapcsolva')}
/* Folyamatos beszélgetés: egyszer megnyomod, utána addig megy, amíg újra meg nem nyomod. Amíg a WORK AI beszél, a mikrofon szünetel (nem hallja magát), utána magától visszakapcsol; beszéd közben a gombra koppintva félbeszakíthatod. */
let paused=false,resumeT=null,lastSpoken='',lastIdleAt=0,voiceBusy=false;
function nzw(t){return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function isEcho(msg){if(Date.now()-lastIdleAt>7000||!lastSpoken)return false;const set={};nzw(lastSpoken).split(' ').forEach(w=>set[w]=1);const ws=nzw(msg).split(' ').filter(w=>w.length>1);if(!ws.length)return true;return ws.filter(w=>set[w]).length/ws.length>=.6}
function speakingNow(){return voiceBusy||!!(window.speechSynthesis&&window.speechSynthesis.speaking)}
function pauseRec(){paused=true;clearTimeout(resumeT);if(rec){const r=rec;rec=null;try{r.onend=null;r.onresult=null;r.abort()}catch(e){}}if(active)animate('speaking')}
function scheduleResume(ms){clearTimeout(resumeT);resumeT=setTimeout(()=>{if(!active||speakingNow()){return}paused=false;listen();if(active&&rec)animate('listening')},ms)}
function wrapSpeak(){const o=window.wdeaSpeakCustom;if(typeof o==='function'&&!o.__qv){const w=function(t){lastSpoken=String(t||'');return o.apply(this,arguments)};w.__qv=1;window.wdeaSpeakCustom=w}}
document.addEventListener('wdea-voice-state',e=>{const s=e.detail&&e.detail.state;if(s==='speaking'){voiceBusy=true;if(active)pauseRec()}else{voiceBusy=false;lastIdleAt=Date.now();if(active)scheduleResume(1300)}});
wrapSpeak();
function listen(){if(!active||rec||paused||speakingNow())return;const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return;
 try{const r=new R();rec=r;r.lang='hu-HU';r.interimResults=false;r.continuous=false;
  r.onresult=e=>{const message=e.results[0][0].transcript;if(isEcho(message))return;status('Hallottam: '+message);animate('thinking');window.WDEA_WORK_AI?.send?.(message)};
  r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){status('Mikrofon: '+e.error);rec=null;active=false;quick.classList.remove('active');quick.setAttribute('aria-pressed','false');animate('idle')}};
  r.onend=()=>{if(rec===r)rec=null;if(active&&!paused&&!speakingNow())setTimeout(listen,250)};
  r.start()}catch(e){rec=null}}
function start(){if(!recognitionSupported){status('A böngésző nem támogatja a mikrofont ebben a módban.');return}wrapSpeak();active=true;paused=false;quick.classList.add('active');quick.setAttribute('aria-pressed','true');quick.setAttribute('aria-label','Folyamatos beszélgetés leállítása');animate('listening');status('Hallgatlak… Beszélj nyugodtan, szünetnél válaszolok. Újra megnyomva kikapcsol.');listen()}
function interrupt(){try{window.wdeaStopSpeak&&window.wdeaStopSpeak()}catch(e){}try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}voiceBusy=false;lastIdleAt=Date.now();paused=false;clearTimeout(resumeT);listen();animate('listening');status('Hallgatlak…')}
quick.addEventListener('click',()=>{if(active&&(speakingNow()||paused)){interrupt();return}active?stop():start()});
// A panel mikrofonja is kapcsoló: ismételt érintésre leállítja a felismerést.
const mic=document.getElementById('wdea-mic');if(mic){mic.addEventListener('click',e=>{if(active){e.stopImmediatePropagation();stop()}else{setTimeout(()=>{if(!active&&companion.dataset.state==='thinking'){animate('listening')}},120)}},true)}
// Tartós felolvasás-kapcsoló; a korábbi panel újrarajzolásakor sem felejtődik el.
const body=document.getElementById('wdea-body');if(body){body.addEventListener('change',e=>{if(e.target.id==='wdea-speak'){try{localStorage.setItem('wdea_speak_enabled',e.target.checked?'1':'0')}catch(_){}}});const sync=()=>{const c=document.getElementById('wdea-speak');if(c){try{c.checked=localStorage.getItem('wdea_speak_enabled')==='1'}catch(_){}}};new MutationObserver(sync).observe(body,{childList:true});sync()}
// Érintésre / üzenetre reagáló, mozgó karakter; az eredeti húzhatóság megmarad.
companion.addEventListener('pointerdown',()=>{if(!active)animate('thinking')});
document.addEventListener('wdea-ai-command',()=>animate('thinking'));
const originalSay=window.WDEA_WORK_AI?.say;if(originalSay){window.WDEA_WORK_AI.say=function(t){animate('speaking');originalSay(t)}}
const originalSend=window.WDEA_WORK_AI?.send;if(originalSend){window.WDEA_WORK_AI.send=function(t){animate('thinking');return originalSend(t)}}
const originalHide=window.WDEA_WORK_AI?.hide;if(originalHide){window.WDEA_WORK_AI.hide=function(){if(active)stop();return originalHide()}}
window.WDEA_QUICK_VOICE={start,stop,isActive:()=>active};
})();