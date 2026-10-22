(()=>{'use strict';
const companion=document.getElementById('wdea-companion');
if(!companion||document.getElementById('wdea-quick-voice'))return;
const quick=document.createElement('button');quick.id='wdea-quick-voice';quick.type='button';quick.setAttribute('aria-label','DEX beszélgetés indítása');quick.setAttribute('aria-pressed','false');quick.innerHTML='<span class="wdea-wave-icon" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="wdea-quick-label">Beszélgetés</span>';document.body.append(quick);
const toast=document.createElement('div');toast.id='wdea-quick-status';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast);
let active=false,rec=null,showTimer=0,restartTimer=0,holdTimer=0,longStop=false;
const recognitionSupported=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
function status(msg){toast.textContent=msg;toast.classList.add('visible');clearTimeout(showTimer);showTimer=setTimeout(()=>toast.classList.remove('visible'),2500)}
function animate(state){companion.dataset.state=state;companion.classList.remove('wdea-react-wave','wdea-react-joy','wdea-react-listen');void companion.offsetWidth;companion.classList.add(state==='speaking'?'wdea-react-wave':state==='thinking'?'wdea-react-joy':'wdea-react-listen')}
function nzw(t){return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
let lastSpoken='',speechAt=0,voiceBusy=false;
function speakingNow(){return voiceBusy||!!(window.speechSynthesis&&window.speechSynthesis.speaking)||!!(window.wdeaIsSpeaking&&window.wdeaIsSpeaking())}
function isEcho(msg){if(!lastSpoken||Date.now()-speechAt>18000)return false;const words=nzw(msg).split(' ').filter(w=>w.length>1);if(!words.length)return true;const spoken=new Set(nzw(lastSpoken).split(' '));return words.filter(w=>spoken.has(w)).length/words.length>=.55}
function stop(){active=false;clearTimeout(restartTimer);clearTimeout(holdTimer);if(rec){const r=rec;rec=null;try{r.onend=null;r.abort()}catch(e){}}quick.classList.remove('active');quick.setAttribute('aria-pressed','false');quick.setAttribute('aria-label','DEX beszélgetés indítása');animate('idle');status('A beszélgetést lezártam.')}
function endPhrase(t){return /^(dex )?(beszelgetes vege|hang vege|allj le|mikrofon vege|fejezzuk be|kesz vagyunk)$/.test(nzw(t))}
function listen(){if(!active||rec||document.hidden)return;const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){status('A böngésző nem támogatja a beszédfelismerést.');return}
 try{const r=new R();rec=r;r.lang='hu-HU';r.interimResults=false;r.continuous=true;
  r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){const row=e.results[i];if(!row.isFinal)continue;const message=String(row[0]?.transcript||'').trim();if(!message)continue;if(endPhrase(message)){stop();return}if(speakingNow()&&isEcho(message))continue;if(isEcho(message))continue;animate('thinking');const ai=window.WDEA_WORK_AI;if(ai&&typeof ai.send==='function')ai.send(message);else status('A hangfelismerés működik, de a beszélgetési modul nem érhető el.')}};
  r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){status('A mikrofonengedélyt add meg a böngészőben.');stop()}else if(e.error!=='no-speech'&&e.error!=='aborted')status('A hangfelismerés megszakadt; újra próbálom.')};
  r.onend=()=>{if(rec===r)rec=null;if(active&&!document.hidden)restartTimer=setTimeout(listen,350)};
  r.start()}catch(e){rec=null;if(active)restartTimer=setTimeout(listen,650)}}
function start(){if(!recognitionSupported){status('A böngésző nem támogatja a beszédfelismerést.');return}active=true;quick.classList.add('active');quick.setAttribute('aria-pressed','true');quick.setAttribute('aria-label','DEX beszélgetés aktív; leállítás: tartsd nyomva vagy mondd: beszélgetés vége');animate('listening');status('Hallgatlak. Beszélj természetesen; a válasz után folytatom. Leállítás: „beszélgetés vége”.');listen()}
function interrupt(){try{window.wdeaStopSpeak&&window.wdeaStopSpeak()}catch(e){}try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}voiceBusy=false;animate('listening');status('Rendben, közbeszólhatsz. Hallgatlak.')}
quick.addEventListener('pointerdown',()=>{longStop=false;if(active)holdTimer=setTimeout(()=>{longStop=true;stop()},850)});
['pointerup','pointercancel','pointerleave'].forEach(n=>quick.addEventListener(n,()=>clearTimeout(holdTimer)));
quick.addEventListener('click',()=>{if(longStop){longStop=false;return}if(!active){start();return}if(speakingNow()){interrupt();return}status('A beszélgetés aktív. Mondd: „beszélgetés vége”, vagy tartsd nyomva a gombot a lezáráshoz.')});
document.addEventListener('wdea-voice-state',e=>{const s=e.detail&&e.detail.state;if(s==='speaking'){voiceBusy=true;speechAt=Date.now();if(active)animate('speaking')}else{voiceBusy=false;speechAt=Date.now();if(active)animate('listening')}});
function wrapSpeak(){const o=window.wdeaSpeakCustom;if(typeof o==='function'&&!o.__qv){const w=function(t){lastSpoken=String(t||'');speechAt=Date.now();return o.apply(this,arguments)};w.__qv=1;window.wdeaSpeakCustom=w}}
wrapSpeak();
const originalSay=window.WDEA_WORK_AI?.say;if(originalSay)window.WDEA_WORK_AI.say=function(t){lastSpoken=String(t||'');speechAt=Date.now();animate('speaking');return originalSay.apply(this,arguments)};
const originalSend=window.WDEA_WORK_AI?.send;if(originalSend)window.WDEA_WORK_AI.send=function(t){animate('thinking');return originalSend.apply(this,arguments)};
const originalHide=window.WDEA_WORK_AI?.hide;if(originalHide)window.WDEA_WORK_AI.hide=function(){if(active)stop();return originalHide.apply(this,arguments)};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&rec){const r=rec;rec=null;try{r.onend=null;r.abort()}catch(e){}}else if(!document.hidden&&active)listen()});
window.WDEA_QUICK_VOICE={start,stop,isActive:()=>active};
})();
