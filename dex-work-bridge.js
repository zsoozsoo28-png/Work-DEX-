/* DEX ⇄ WORK offline bridge. Only performs explicit, visible UI actions and
   DEXLayer whitelisted styling/text changes; never evaluates user speech as code. */
(function(){'use strict';
 var CHANNEL='wdea-dex-work-v1', STORE='wdea-dex-local-edits-v1', channel=null, watcher=null;
 function fold(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9#]+/g,' ').trim()}
 function say(text,requestId){try{if(channel)channel.postMessage({type:'result',requestId:requestId,text:text})}catch(e){}}
 function edits(){try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch(e){return []}}
 function save(a){try{localStorage.setItem(STORE,JSON.stringify(a));return true}catch(e){return false}}
 function allLabels(){var L=window.DEXLayer;if(!L)return[];return L.candidates(document).map(function(x){return {el:x.el,label:String(x.label||'').trim(),norm:fold((x.label||'')+' '+(x.el.id||''))}}).filter(function(x){return x.label})}
 function closest(q){q=fold(q);if(!q)return null;var a=allLabels(),best=null,score=0;a.forEach(function(x){var n=x.norm,s=n===q?100:(n.indexOf(q)>=0?70:(q.indexOf(n)>=0&&n.length>2?45:0));if(s>score){score=s;best=x}});return score>=45?best:null}
 function persistApply(){var L=window.DEXLayer;if(!L)return{applied:0,missing:[]};if(!watcher)watcher=L.keep(document,edits);else watcher.rerun();return{applied:edits().length,missing:[]}}
 function textEdit(oldText,newText){var found=closest(oldText);if(!found)return 'Nem találtam ilyen feliratot a megnyitott WORK-oldalon: '+oldText+'.';var a=edits(),id='voice-'+Date.now().toString(36);a.push({id:id,kind:'style',label:found.label,sel:window.DEXLayer.selFor(found.el),props:{text:newText}});if(!save(a))return 'A telefon tárhelyére nem tudtam menteni a módosítást.';persistApply();return 'Átírtam helyben: „'+oldText+'” → „'+newText+'”. A módosítás ezen a telefonon, ebben a böngészőben marad meg.'}
 function colorEdit(label,color){var found=closest(label);if(!found)return 'Nem találtam ilyen feliratot a megnyitott WORK-oldalon: '+label+'.';var a=edits();a.push({id:'voice-'+Date.now().toString(36),kind:'style',label:found.label,sel:window.DEXLayer.selFor(found.el),props:{color:color}});if(!save(a))return 'A telefon tárhelyére nem tudtam menteni a módosítást.';persistApply();return 'Megváltoztattam a „'+found.label+'” színét, és helyben elmentettem.'}
 function search(q){var inputs=[].slice.call(document.querySelectorAll('input:not([type=password]),textarea,[contenteditable=true]')).filter(function(x){return x.offsetWidth>0&&x.offsetHeight>0});var s=inputs.find(function(x){return /keres|search/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')+' '+(x.id||''))});if(s){s.focus();s.value=q;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}));return 'Beírtam a keresőbe: „'+q+'”. Nézd meg a találatokat a WORK felületén.'}var f=closest(q);if(f){f.el.scrollIntoView({behavior:'smooth',block:'center'});f.el.style.outline='2px solid #36d5ff';setTimeout(function(){f.el.style.outline=''},4000);return 'A „'+q+'” kifejezéshez ezt a látható elemet találtam: „'+f.label+'”.'}return 'A megnyitott WORK-oldalon nem találtam ehhez keresőt vagy látható találatot: „'+q+'”. A vásárlási oldal nem része a most csomagolt WORK demónak.'}
 function click(q){var f=closest(q);if(!f)return 'Nem találtam ilyen menüpontot vagy gombot a WORK-ben: '+q+'.';if(!f.el.matches('button,a,[role=button],input[type=button],input[type=submit]'))return 'Megtaláltam ezt: „'+f.label+'”, de nem gomb vagy menüpont, ezért nem nyitottam meg.';f.el.click();return 'Megnyitottam: „'+f.label+'”.'}

 var RN={home:'Főoldal',explore:'Felfedezés',shopping:'Vásárlás',store:'Bemutatóbolt',cart:'Kosár',orders:'Rendelések',messages:'Üzenetek',notifications:'Értesítések',saved:'Mentettek',groups:'Közösségek',points:'Pontok',profile:'Profil',settings:'Beállítások',ai:'WDEA AI',help:'Segítség',support:'Ügyfélszolgálat',business:'Üzleti központ',studio:'Boltsablon-szerkesztő',video:'WDEA VIDEO',favorites:'Kedvencek',checkout:'Pénztár',categories:'Kategóriák',demos:'Demók'};
 function vis(x){return x.offsetWidth>0&&x.offsetHeight>0}
 function nav(r){if(!/^[a-z]+$/.test(r))return 'Nem találtam ilyen WORK-oldalt.';var els=[].slice.call(document.querySelectorAll('[data-route="'+r+'"]')),el=els.filter(vis)[0]||els[0];if(el)el.click();else{if(!RN[r])return 'Nem találtam ilyen WORK-oldalt: '+r+'.';location.hash='#'+r}
  try{var mm=document.querySelector('[data-mobile-menu-toggle][aria-expanded="true"]');if(mm)mm.click()}catch(e){}
  try{window.scrollTo(0,0)}catch(e){}return 'Megnyitottam: '+(RN[r]||r)+'.'}
 function scroller(){var se=document.scrollingElement||document.documentElement;if(se.scrollHeight>se.clientHeight+8)return null;var best=null,bh=0;[].slice.call(document.querySelectorAll('main,section,div')).forEach(function(e){var st=getComputedStyle(e);if((st.overflowY==='auto'||st.overflowY==='scroll')&&e.scrollHeight>e.clientHeight+8&&e.clientHeight>bh&&vis(e)){best=e;bh=e.clientHeight}});return best}
 function hscroll(d,k){var dir=d==='left'?-1:1,best=null,ba=0;if(dir<0&&menuOpen()){return menu('close')}[].slice.call(document.querySelectorAll('div,section,ul,main,nav')).forEach(function(e){if(e.scrollWidth<=e.clientWidth+8||!vis(e))return;var st=getComputedStyle(e);if(st.overflowX!=='auto'&&st.overflowX!=='scroll')return;var r=e.getBoundingClientRect(),w=Math.min(r.right,innerWidth)-Math.max(r.left,0),h=Math.min(r.bottom,innerHeight)-Math.max(r.top,0);if(w>0&&h>0&&w*h>ba){ba=w*h;best=e}});
  if(best){var mx=best.scrollWidth-best.clientWidth,to=Math.max(0,Math.min(mx,best.scrollLeft+dir*k*best.clientWidth));if((dir>0&&best.scrollLeft>=mx-2)||(dir<0&&best.scrollLeft<=1)){if(dir>0&&menuBtn()&&vis(menuBtn())&&!menuOpen())return menu('open');return 'Nem tudok tovább '+(dir>0?'jobbra':'balra')+' lapozni, ez a sor vége.'}best.scrollTo({left:to,behavior:'smooth'});return 'Lapoztam.'}
  var se=document.scrollingElement||document.documentElement,m2=se.scrollWidth-innerWidth;if(m2<=8){if(dir>0&&menuBtn()&&vis(menuBtn())&&!menuOpen())return menu('open');return 'Nem találtam itt oldalra lapozható sort ezen a WORK-oldalon.'}window.scrollBy({left:dir*k*innerWidth,behavior:'smooth'});return 'Lapoztam.'}
 function scrl(d,k){if(d==='left'||d==='right')return hscroll(d,k);var sc=scroller(),se=document.scrollingElement||document.documentElement,h=sc?sc.clientHeight:window.innerHeight,top=sc?sc.scrollTop:window.pageYOffset,max=(sc?sc.scrollHeight-sc.clientHeight:se.scrollHeight-window.innerHeight),to;
  if(d==='top')to=0;else if(d==='bottom')to=max;else to=Math.max(0,Math.min(max,top+(d==='up'?-1:1)*k*h));
  if(sc)sc.scrollTo({top:to,behavior:'smooth'});else window.scrollTo({top:to,behavior:'smooth'});
  if(d==='down'&&top>=max-2)return 'Nem tudok lejjebb görgetni, ez az oldal alja.';if(d==='up'&&top<=1)return 'Nem tudok feljebb görgetni, ez az oldal teteje.';return 'Görgettem.'}
 /* Oldalon belüli nevek (fül, szűrő, gomb, menüpont): „képek”, „videók”, „hirdetések”… – magyar ragokkal is, offline is */
 function stemEq(x,y){if(x===y)return true;var m=Math.min(x.length,y.length);if(m<4)return false;var k=0;while(k<m&&x.charCodeAt(k)===y.charCodeAt(k))k++;return k>=Math.max(4,m-2)}
 function pickEl(q,strict){q=fold(q).split(' ').filter(function(w){return w.length>1&&!/^(a|az|egy|es|meg|kerlek|legyszi|nyisd|mutasd|menj|ide|oda|rea|ra|kattints|nyomd|mehet)$/.test(w)});if(!q.length)return null;
  var els=[].slice.call(document.querySelectorAll('button,a[href],a[data-route],[role=button],[role=tab],[data-route],[data-filter],[data-tab],summary')),best=null,bs=0;
  els.forEach(function(e){if(!vis(e)||e.closest('#wdea-theme-editor,#wdea-ai-panel,[hidden]'))return;var lab=fold((e.getAttribute('aria-label')||'')+' '+(e.textContent||'')).trim();if(!lab||lab.length>60)return;var lw=lab.split(' ').filter(function(w){return w&&!/^[0-9]+$/.test(w)});if(!lw.length||lw.length>6)return;
   var ok=q.every(function(w){return lw.some(function(l){return stemEq(w,l)})});if(!ok)return;var sc=100-(lw.length-q.length)*8;if(lw.length===q.length&&q.every(function(w,i){return stemEq(w,lw[i])}))sc=100;if(q.every(function(w){return lw.indexOf(w)>=0}))sc+=3;if(e.matches('[role=tab],[data-feed-filter],[data-filter],[data-tab]'))sc+=1;var r=e.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)sc+=2;if(sc>bs){bs=sc;best=e}});
  return bs>=(strict?100:76)?best:null}
 function pickLabel(q,strict){var e=pickEl(q,strict);return e?(String(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40)):''}
 function pickClick(q){var e=pickEl(q,true)||pickEl(q);if(!e)return 'Nem találtam ilyen nevű fület, gombot vagy menüpontot ezen az oldalon.';try{e.scrollIntoView({block:'nearest'})}catch(x){}e.click();return 'Rákattintottam: '+String(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40)+'.'}
 /* Admin megnyitása a DEX-ből (GitHub Pages / szerver nélkül): a WORK saját Pontok-oldali admin-mezőjét tölti ki, tehát semmit nem kerül meg, ami a WORK-ben nincs már meg. */
 function adminOpen(){var tries=0;function step(){var f=document.getElementById('points-admin-login');if(!f&&location.hash!=='#admin'){location.hash='#admin'}
   setTimeout(function(){f=document.getElementById('points-admin-login');if(f){var i=f.querySelector('[name=code]');if(i){i.value='#x7k2';if(f.requestSubmit)f.requestSubmit();else f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))}}else if(tries++<8){step()}else{location.hash='#admin'}},550)}
  step();return 'Megnyitom az admint a WORK-ben.'}
 function menuBtn(){return document.querySelector('[data-mobile-menu-toggle]')}
 function menuOpen(){var b=menuBtn();return !!(b&&b.getAttribute('aria-expanded')==='true')}
 function menu(act){var b=menuBtn();if(!b||!vis(b))return 'A menü ezen a kijelzőméreten mindig látszik.';var o=menuOpen();if(act==='open'&&o)return 'A menü már nyitva van.';if(act==='close'&&!o)return 'A menü már be van zárva.';b.click();return o?'Becsuktam a menüt.':'Kihoztam a menüt.'}
 function openDex(){var c=document.getElementById('wdea-companion');if(c){c.click();return 'Megnyitottam a DEX csevegőt a WORK-ben.'}try{if(window.WDEA_WORK_AI&&window.WDEA_WORK_AI.open){window.WDEA_WORK_AI.open();return 'Megnyitottam a DEX csevegőt a WORK-ben.'}}catch(e){}return 'Nem találom a DEX-et ezen a WORK-oldalon.'}
 function voiceBtn(){var q=document.getElementById('wdea-quick-voice');if(!q)return 'Nem találom a hang gombját ezen az oldalon.';(q.querySelector('button')||q).click();return 'Megnyomtam a hang gombot.'}
 /* v55: csípve húzott görgetés a valódi térben (XR): a csípés helyén lévő görgethető részt görgeti, beágyazott oldalban is */
 function scrollAt(fx,fy,df){var W=window,D=document,x=fx*W.innerWidth,y=fy*W.innerHeight,dy=df*W.innerHeight,n=0;
  while(n++<3){var el=D.elementFromPoint(x,y);if(el&&el.tagName==='IFRAME'){try{var r=el.getBoundingClientRect(),cd=el.contentDocument;if(cd){x-=r.left;y-=r.top;D=cd;W=el.contentWindow;continue}}catch(e){}}
   while(el&&el!==D.body&&el!==D.documentElement){var cs=W.getComputedStyle(el);if(/(auto|scroll)/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+2){el.scrollBy(0,dy);return ''}el=el.parentElement}
   W.scrollBy(0,dy);return ''}return ''}
 var EG=null;
 function egPick(el){var W=innerWidth,H=innerHeight,best=null,n=0;while(el&&el!==document.body&&el!==document.documentElement&&n++<12){var r=el.getBoundingClientRect(),tg=el.tagName,cl=(el.className&&el.className.baseVal===undefined?String(el.className):'')+' '+(el.id||'');
   var okSize=r.width>=44&&r.height>=30&&r.width<W*.85&&r.height<H*.85;if(okSize){var cardish=/^(ARTICLE|LI|FIGURE|ASIDE|FORM)$/.test(tg)||/card|post|tile|item|panel|story|widget|box|block|product|chip|tab|btn/i.test(cl);if(cardish)return el;if(!best&&/^(SECTION|DIV|BUTTON|A|IMG|VIDEO)$/.test(tg))best=el}el=el.parentElement}return best}
 function egGrab(fx,fy){var el=document.elementFromPoint(Math.round(fx*innerWidth),Math.round(fy*innerHeight));var t=egPick(el);if(!t){EG=null;return 'Itt nincs mozgatható elem.'}
  var m=/translate\(([-0-9.]+)px,\s*([-0-9.]+)px\)/.exec(t.style.transform||'');EG={el:t,x0:m?+m[1]:0,y0:m?+m[2]:0,pos:t.style.position,z:t.style.zIndex};
  if(getComputedStyle(t).position==='static')t.style.position='relative';t.style.zIndex='9999';t.style.transition='none';t.style.outline='1.5px solid #8ce7ff';t.style.outlineOffset='2px';t.setAttribute('data-dex-move','1');return 'Megfogtam.'}
 function egDrag(dx,dy){if(!EG)return '';var x=EG.x0+dx*innerWidth,y=EG.y0+dy*innerHeight;EG.el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)';return ''}
 function egDrop(){if(EG){EG.el.style.outline='';EG.el.style.outlineOffset='';EG.el.style.zIndex='9999';EG=null}return ''}
 function egAll(){EG=null;[].forEach.call(document.querySelectorAll('[data-dex-move]'),function(e){e.style.transform='';e.style.outline='';e.style.zIndex='';e.style.position='';e.removeAttribute('data-dex-move')});return 'Visszaraktam az elemeket.'}
 function tap(fx,fy){hvClear();var x=Math.round(fx*innerWidth),y=Math.round(fy*innerHeight),el=document.elementFromPoint(x,y);if(!el)return 'Oda nem tudok kattintani.';var t=el.closest('button,a,[role=button],[data-route],[data-action],input,select,textarea,summary,label,[onclick]')||el;try{if(t.focus&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))t.focus()}catch(e){}t.click();return 'Rákattintottam.'}
 function run(raw,id){var t=String(raw||'').trim(),n=fold(t),m,c;
  if((m=/^@nav ([a-z]+)$/.exec(t)))return nav(m[1]);
  if((m=/^@scroll (up|down|top|bottom|left|right) ([0-9.]+)$/.exec(t)))return scrl(m[1],+m[2]||.6);
  if((m=/^@scrollby ([0-9.\-]+) ([0-9.\-]+) ([0-9.\-]+)$/.exec(t)))return scrollAt(+m[1],+m[2],+m[3]);
  if(t==='@back'){history.back();return 'Visszaléptem.'}
  if((m=/^@menu (open|close|toggle)$/.exec(t)))return menu(m[1]);
  if(t==='@admin')return adminOpen();
  if((m=/^@pick (.+)$/.exec(t)))return pickClick(m[1]);
  if(t==='@dex')return openDex();
  if(t==='@voice')return voiceBtn();
  if((m=/^@tap ([0-9.]+) ([0-9.]+)$/.exec(t)))return tap(+m[1],+m[2]);
  if((m=/^@grab ([0-9.\-]+) ([0-9.\-]+)$/.exec(t)))return egGrab(+m[1],+m[2]);
  if((m=/^@drag ([0-9.\-]+) ([0-9.\-]+)$/.exec(t)))return egDrag(+m[1],+m[2]);
  if(t==='@drop')return egDrop();
  if(t==='@dropall')return egAll();
  if((m=/^(?:ird at|ird at|nevezd at|csereld le)\s+(.+?)\s+(?:erre|helyette)\s+(.+)$/i.exec(n))){var orig=t.match(/^(?:írd át|ird at|nevezd át|nevezd at|cseréld le|csereld le)\s+(.+?)\s+(?:erre|helyette)\s+(.+)$/i);return textEdit(orig?orig[1]:m[1],orig?orig[2]:m[2])}
  if((m=/^(?:szinezd at|szinezd|valtoztasd meg)\s+(.+?)\s+(?:szinet\s+)?(kekre|kek|lilara|lila|rozsaszinre|rozsaszin|feherre|feher|zoldre|zold)$/i.exec(n))){c={kek:'#49c8ff',lilara:'#c285ff',lila:'#c285ff',rozsaszinre:'#ff72bd',rozsaszin:'#ff72bd',feherre:'#ffffff',feher:'#ffffff',zoldre:'#55e2a0',zold:'#55e2a0',kekre:'#49c8ff'}[m[2]];return colorEdit(m[1],c)}
  if((m=/^(?:keresd meg|keresd|kutass|talald meg)\s+(?:a\s+|az\s+)?(.+?)(?:\s+(?:oldalon|oldalt))?$/i.exec(n)))return search(m[1]);
  if((m=/^(?:nyisd meg|nyisd ki|valaszd ki|nyisd)\s+(?:a\s+|az\s+)?(.+)$/i.exec(n)))return click(m[1]);
  if(/^visszavonas|vond vissza a modositasokat|helyi modositasok torlese$/.test(n)){if(!save([]))return 'Nem sikerült törölni a helyi módosításokat.';if(watcher){watcher.stop();watcher=null}return 'Eltávolítottam a DEX által mentett helyi felületi módosításokat.'}
  return 'A WORK megnyílt. Helyi parancsok: „keresd meg …”, „nyisd meg …”, „írd át … erre …”, „színezd át … kékre”, „vond vissza a módosításokat”.'}
 var HV=null;
 function hvClear(){if(HV){HV.style.outline=HV.getAttribute('data-dex-ho')||'';HV.style.boxShadow=HV.getAttribute('data-dex-hs')||'';HV.style.transform=HV.getAttribute('data-dex-ht')||'';HV.style.zIndex=HV.getAttribute('data-dex-hz')||'';['data-dex-ho','data-dex-hs','data-dex-ht','data-dex-hz','data-dex-hover'].forEach(function(a){HV.removeAttribute(a)});HV=null}}
 window.__dexHover=function(fx,fy){try{if(!(fx>=0&&fy>=0&&fx<=1&&fy<=1)){hvClear();return ''}var el=document.elementFromPoint(Math.round(fx*innerWidth),Math.round(fy*innerHeight)),t=el&&el.closest('button,a,[role=button],[data-route],[data-action],input,select,textarea,summary,label,[onclick]');
  if(t){var cd=t.closest('article,li,[class*=card],[class*=tile],[class*=item],[class*=product]');if(cd&&cd!==document.body){var rc=cd.getBoundingClientRect();if(rc.width*rc.height<innerWidth*innerHeight*.45&&rc.width>20)t=cd}}if(t===HV)return '';hvClear();if(!t)return '';HV=t;t.setAttribute('data-dex-ho',t.style.outline||'');t.setAttribute('data-dex-hs',t.style.boxShadow||'');t.setAttribute('data-dex-ht',t.style.transform||'');t.setAttribute('data-dex-hz',t.style.zIndex||'');t.setAttribute('data-dex-hover','1');t.style.outline='1.5px solid #ffffff';t.style.outlineOffset='1px';t.style.boxShadow='0 0 6px rgba(255,255,255,.35)';t.style.transform=(t.getAttribute('data-dex-ht')||'')+' scale(1.035)';if(!t.style.transition)t.style.transition='transform .12s';if(getComputedStyle(t).position!=='static')t.style.zIndex='5';return ''}catch(e){return ''}};
 function onMessage(e){var d=e.data||{};if(d.type==='command'&&typeof d.text==='string'){var answer;try{answer=run(d.text,d.requestId)}catch(err){answer='Nem sikerült végrehajtani a WORK-parancsot.'}say(answer,d.requestId)}else if(d.type==='reset'){try{localStorage.removeItem(STORE)}catch(e){}if(watcher){watcher.stop();watcher=null}}}
 try{channel=new BroadcastChannel(CHANNEL);channel.addEventListener('message',onMessage)}catch(e){}
 if(window.parent!==window){window.addEventListener('message',function(e){if(e.source!==window.parent||!e.data||e.data.channel!==CHANNEL)return;onMessage({data:e.data})});try{window.parent.postMessage({channel:CHANNEL,type:'ready'},location.origin)}catch(e){}}
 try{var ao=+localStorage.getItem('wdea_admin_open')||0;if(ao&&Date.now()-ao<120000){localStorage.removeItem('wdea_admin_open');setTimeout(adminOpen,1500)}}catch(e){}
 window.DEX_WORK_BRIDGE={has:pickLabel,run:run,nav:nav,scroll:scrl,edits:edits,reset:function(){save([]);if(watcher){watcher.stop();watcher=null}},apply:persistApply};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',persistApply,{once:true});else setTimeout(persistApply,0);
})();
