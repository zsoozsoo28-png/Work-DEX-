/* Local voice-to-WORK command router. */
(function(){'use strict';var NAME='wdea-dex-work-v1',bc=null,pending={},seq=0;
 try{bc=new BroadcastChannel(NAME);bc.onmessage=function(e){var d=e.data||{};if(d.type==='result'&&pending[d.requestId]){var p=pending[d.requestId];delete pending[d.requestId];clearTimeout(p.timer);p.resolve(d.text)}}}catch(e){}
 function folded(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
 function wkFrames(){return [].slice.call(document.querySelectorAll('#dyVR .wk iframe')).filter(function(x){return x.contentWindow})}
 function send(text){var id='cmd-'+Date.now()+'-'+(++seq);return new Promise(function(resolve){var fr=wkFrames();if(fr.length){pending[id]={resolve:resolve,timer:setTimeout(function(){delete pending[id];resolve('A WORK nem válaszolt. Nyisd meg egyszer külön fülön is, hogy betöltődjön.')},5000)};fr.forEach(function(iframe){try{iframe.contentWindow.postMessage({channel:NAME,type:'command',requestId:id,text:text},location.origin)}catch(e){}});return}
  if(bc){pending[id]={resolve:resolve,timer:setTimeout(function(){delete pending[id];resolve('Nem találok megnyitott WORK-fület. Nyisd meg Chrome-ban a WORK oldalt, majd próbáld újra.')},5000)};bc.postMessage({type:'command',requestId:id,text:text});return}resolve('Ezen a böngészőn a helyi WORK-kapcsolat nem érhető el.')})}
 window.DEX_ADMIN_SEND=send;
 /* Megvárja, míg a VR-ablak WORK-ja (mindkét szem) betöltött és a híd él. */
 function whenReady(cb,tries){tries=tries||0;var fr=wkFrames();var ok=fr.length&&fr.every(function(x){try{return !!(x.contentWindow.DEX_WORK_BRIDGE)}catch(e){return false}});if(ok||tries>40){cb(!!ok);return}setTimeout(function(){whenReady(cb,tries+1)},250)}
 var ROUTES=[ /* [útvonal, regex, egyértelmű?] – egyértelmű: VR-ben a WORK elrejtve is megnyitja */
  ['cart',/\bkosar\w*/,1],['orders',/\brendeles\w*/,1],['shopping',/\bvasarlas\w*|\buzletek\b|\buzletet\b|\bshopping\b|\bweb ?shop\w*|\bshop\w*|\bwebaruhaz\w*|\bvasarolni\b|\bvasaroljunk\b/,1],['store',/\btermek\w*|\bbemutato ?bolt\w*|\bbolt(?:ot|ba|ban|ok)?\b|\baruhaz\w*/,1],
  ['messages',/\buzenet\w*|\bcset\w*|\bchat\w*|\bcsat\w*/,1],['messages',/\bcseveges\w*|\bbeszelgetes\w*/,0],['notifications',/\bertesites\w*/,1],['home',/\bfo ?oldal\w*|\bkezdolap\w*|\bhome\b|\bfolap\w*/,1],['explore',/\bfelfedezes\w*|\bfelfedez\w*/,1],
  ['profile',/\bprofil\w*/,1],['settings',/\bbeallitas\w*/,0],['help',/\bsegitseg\w*|\badomany\w*|\bsegely\w*/,0],['points',/\bpont(?:ok|jaim|jaimat)?\b|\begyenleg\w*/,0],['groups',/\bkozosseg\w*/,1],['saved',/\bmentett\w*|\bkedvenc\w*/,1],['support',/\bugyfelszolgalat\w*/,1],['business',/\buzleti kozpont\w*/,1],['studio',/\bsablon\w*|\bstudio\b/,1],['video',/\bvideo\w*/,1]];
 var RL={home:'Főoldal',explore:'Felfedezés',shopping:'Vásárlás',store:'Bemutatóbolt',cart:'Kosár',orders:'Rendelések',messages:'Üzenetek',notifications:'Értesítések',saved:'Mentettek',groups:'Közösségek',points:'Pontok',profile:'Profil',settings:'Beállítások',help:'Segítség',support:'Ügyfélszolgálat',business:'Üzleti központ',studio:'Boltsablon-szerkesztő',video:'WDEA VIDEO'};
 var OPENV=/(nyis|nyit|kinyit|mutas|mutat|tedd|tegy|rakd|rakj|rakja|hozd|hozz|hozza|jelenit|jelenj|menj|menjunk|lepj|lepjunk|ugorj|ugorjunk|vigy|nezz|nezd|nezzuk|megnez|keru?em|kerek|mehet|valts|kapcsold|indits|lassam|latni|szeretn|akarom|akarok|dobd|elem\b|ele\b|elo\b|kell|kene|keresem)/;
 var WKW=/\b(?:work|vork|vurk|wurk|verk|woerk|word)\w{0,5}\b/;
 function busy(){var V=window.DEX_VR;if(!V)return false;try{var G=V.game&&V.game(),U=V.ugame&&V.ugame();return !!((V.menuState&&V.menuState())||(G&&!G.done&&!G.paused)||(U&&U.state!=='over'&&!U.paused)||(V.ride&&V.ride())||(V.mag&&V.mag()))}catch(e){return false}}
 function wkHas(q,strict){var fr=wkFrames();for(var i=0;i<fr.length;i++){try{var B=fr[i].contentWindow.DEX_WORK_BRIDGE;if(B&&B.has){var l=B.has(q,strict);if(l)return l}}catch(e){}}return ''}
 function wkVisible(){var w=document.querySelector('#dyVR .wk');return !!(window.DEX_VR&&window.DEX_VR.active()&&w&&!w.hidden)}
 /* Természetes beszéd → WORK-parancs. Visszaad: {nav:route} | {scroll:[irány,mennyiség]} | null */
 function parseWork(f,hasWork,vr){
  var vis=wkVisible(),ctx=hasWork||vis;
  if(vr&&busy()&&!hasWork)return null;
  /* görgetés */
  var SV=/(gorg\w*|gorget\w*|gordit\w*|csusz\w*|lapoz\w*|uli?ts\w*|menj\w*|ugorj\w*|lepj\w*|huzd\w*|vigy\w*|mozdit\w*|mozgasd|told\w*|gorbits\w*)/,DN=/\b(le|lejjebb|lefele|lefelebb|lentebb|alabb|lejebb|lennebb|lefele iranyba|lefelebb)\b/,UP=/\b(fel|feljebb|folfele|felfele|felfelebb|fentebb|fennebb|foljebb|follebb|fojebb|fel iranyba)\b|\bf[eo]ljebb\b/;
  var small=/\b(kicsit|picit|kicsivel|keveset|aprot|egy kicsit)\b/.test(f),big=/\b(sokat|nagyot|nagyon|jo sokat|oldalnyit|egesz oldalt)\b/.test(f);
  var amt=small?.25:(big?1.2:.6);
  if(ctx&&(vr||hasWork)){
   if(/\b(tetejere|tetejet|elejere|elejet|legfelejere|legtetejere|legelejere|legfelulre|felulre|oldal eleje|oldal teteje|oldal tetejere|oldal elejere)\b/.test(f)&&(SV.test(f)||/\bmenj|ugorj|vigyel/.test(f)||f.split(' ').length<=4))return {scroll:['top',1]};
   if(/\b(aljara|aljat|vegere|vegeig|legaljara|legvegere|legalulra|alulra|oldal vege|oldal alja|oldal aljara|oldal vegere)\b/.test(f)&&(SV.test(f)||f.split(' ').length<=4))return {scroll:['bottom',1]};
   var oneWord=f.split(' ').filter(function(x){return x&&x!=='work'&&x!=='egy'&&x!=='kicsit'&&x!=='meg'&&x!=='picit'}).length<=2;
   if((SV.test(f)||oneWord)&&!/\b(jatek\w*|szokereso|utos)\b/.test(f)){
    if(UP.test(f)&&!DN.test(f))return {scroll:['up',amt]};
    if(DN.test(f)&&!UP.test(f))return {scroll:['down',amt]};
   }
  }
  /* rövid, mindennapi görgető / lapozó szavak */
  if(ctx&&(vr||hasWork)&&!/\b(jatek\w*|szokereso|utos|dino\w*|szalag\w*|csillag\w*|zene|dal|szam)\b/.test(f)){
   var PRE='^(?:(?:na|akkor|most|mar|kerlek|legyszi|meg|hat|ja|jo|igen|aha|ok|oke|rendben) )*',POST='(?: (?:kerlek|legyszi|egy kicsit|kicsit|picit|egy picit|most|mar|megint))*$';
   var DWN=new RegExp(PRE+'(?:gorg\\w*|gorget\\w*|gordit\\w* le|menj\\w* le|ugorj\\w* le|lepj\\w* le|mozdit\\w* le|mozgasd le|told\\w* le|huzd\\w* le|tovabb lefele|nezzuk tovabb|mutass tobbet|mutass meg|mutass meg tobbet|mutasd tovabb|tobbet|meg tobbet|lenn|lent|lefele nezz|nezzuk lejjebb|hadd lassam tovabb|mi van lejjebb|mi van lentebb|lapoz\\w* lefele|lapoz\\w* le)'+POST),
       UPW=new RegExp(PRE+'(?:gorg\\w* vissza|gorgesd\\w* vissza|gorg\\w* visszafele|gorgesd\\w* visszafele|visszafele gorg\\w*|vissza fel|vissza felfele|vissza a tetejere|nezzuk feljebb|mi van feljebb|mi van fentebb|menj\\w* fel|ugorj\\w* fel|lepj\\w* fel|mozdit\\w* fel|told\\w* fel|huzd\\w* fel|lapoz\\w* felfele|lapoz\\w* fel|nezz feljebb|nezz fel)'+POST),
       NXT=new RegExp(PRE+'(?:lapoz\\w*|lapoz\\w* tovabb|tovabb lapoz\\w*|kovetkez\\w*|a kovetkez\\w*|kovetkezo oldal|a kovetkezo oldal|mutasd a kovetkezot|mutasd a kovetkezo oldalt|tovabb jobbra|jobbra tovabb|jobbra mutass|mutass jobbra)'+POST),
       PRV=new RegExp(PRE+'(?:lapoz\\w* vissza|vissza lapoz\\w*|elozo|az elozo|elozo oldal|az elozo oldal|mutasd az elozot|mutasd az elozo oldalt|balra vissza|vissza balra|balra mutass|mutass balra)'+POST);
   if(DWN.test(f))return {scroll:['down',amt]};
   if(UPW.test(f))return {scroll:['up',amt]};
   if(NXT.test(f))return {scroll:['right',.7]};
   if(PRV.test(f))return {scroll:['left',.7]};if(/\b(lapoz\w*|kovetkez\w*|tovabb)\b/.test(f))return {scroll:['right',.7]};if(/\b(gorg\w*|gorget\w*)\b/.test(f))return {scroll:['down',amt]}}
  var RT=/\b(jobbra|jobbrafele|jobb oldalra)\b/,LT=/\b(balra|balrafele|bal oldalra)\b/,MV=/\b(told|tolj|mozdit\w*|mozgasd|vidd|tedd|huzd|csusztasd|nagyobb\w*|kisebb\w*|kozepre)\b/;
  if(ctx&&(vr||hasWork)&&!MV.test(f)&&!/\b(jatek\w*|szokereso|utos|csillag\w*)\b/.test(f)){
   var hz=/(gorg\w*|gordit\w*|lapoz\w*|csusz\w*)/.test(f)||f.split(' ').filter(function(x){return x&&x!=='work'&&x!=='egy'&&x!=='kicsit'&&x!=='meg'&&x!=='picit'}).length<=1;
   if(hz&&RT.test(f)&&!LT.test(f))return {scroll:['right',small?.35:(big?1:.7)]};
   if(hz&&LT.test(f)&&!RT.test(f))return {scroll:['left',small?.35:(big?1:.7)]}}
  /* oldal-/menüváltás */
  var nW=f.split(' ').length,shortDest=vr&&nW<=3;
  if(!OPENV.test(f)&&!shortDest)return null;
  for(var i=0;i<ROUTES.length;i++){var R=ROUTES[i];if(!R[1].test(f))continue;
   if(R[0]==='messages'&&!hasWork&&/\bcseveges\w*|\bbeszelgetes\w*|\bcset\w*|\bchat\w*|\bcsat\w*/.test(f)&&!/\buzenet\w*/.test(f))return null; /* „chat” = a kettőnk közti DEX-csevegés; a WORK üzenetei: „work chat” / „üzenetek” */ /* „csevegés” = a DEX saját csevegése, ha nem mondja: WORK */
   if(hasWork||vis||(vr&&R[2]))return {nav:R[0]};
   return null}
  return null}
 var Dx=window.DEX40;if(!Dx||typeof Dx.handle!=='function'||Dx.__workbridge)return;var old=Dx.handle;
 Dx.handle=function(raw){var s=String(raw||'').trim(),f=folded(s),vr=!!(window.DEX_VR&&window.DEX_VR.active());
  var WKR=/\b(?:work|vork|vurk|wurk|verk|woerk|word)\w{0,5}\b/,SHOWV=/(mutas|mutat|tedd|tegy|rakd|rakj|hozd|hozz|nyis|nyit|kinyit|jelenit|jelenj|kapcsold|indits|lassam|latni|szeretn|akar|kerek|kerem|nezzuk|nezd|elem\b|ele\b|elo\b|ide\b|vigy|menj|lepj|ugorj|toltsd|mehet|kell|kene)/;
  var BAREW=/^(?:(?:a|az|na|akkor|most|mar|megint|ujra|kerlek|legyszi) )*(?:work|vork|vurk|wurk|verk|woerk|word)\w{0,5}(?: (?:kerlek|legyszi|ide|elem|ele|fel|be|megint|ujra|mar|most))*$/;
  var isShow=(WKR.test(f)&&SHOWV.test(f)&&!/\b(told|tolj|mozdit\w*|mozgasd|vidd|csusztasd|nagyobb\w*|kisebb\w*|kozepre|alaphelyzet\w*)\b/.test(f))||BAREW.test(f);
  var isHide=/\b(?:work|vork|vurk|wurk|verk|woerk|word)\w{0,5}\b.{0,20}\b(el|le|zar|rejtsd|tuntesd)\b/.test(f)&&!/\b(kapcsold|nyisd|mutasd|tedd elem)\b/.test(f)&&!/\b(told|tolj|mozdit\w*|mozgasd|vidd|csusztasd)\b/.test(f);
  var isZoomIn=/\b(nagyit\w*|nagyitot|nagyobb\w*|kozelit\w*|zoomol\w*)\b/.test(f),isZoomOut=/\b(kicsinyit\w*|kisebb\w*|tavolit\w*|zoomolj ki)\b/.test(f);
  var isWorkCmd=/^(keresd meg|keresd|kutass|talald meg|nyisd meg|nyisd ki|valaszd ki|ird at|nevezd at|csereld le|szinezd at|szinezd|valtoztasd meg|visszavonas|vond vissza a modositasokat|helyi modositasok torlese)\b/.test(f);
  /* Védelem: a meglévő DEX-parancsok (pl. „nyisd meg…”, „keresd…”) VR-en kívül ugyanúgy működnek tovább; csak VR-ben, vagy ha a parancs kimondja a „WORK” szót, megy a WORK felé. */
  var hasW=WKR.test(f),wv=wkVisible();
  if(vr&&wv&&!busy()&&(isZoomIn||isZoomOut)&&window.DEX_VR&&window.DEX_VR.wkCmd){var zr=window.DEX_VR.wkCmd('work '+(isZoomOut?'kisebb':'nagyobb'));if(zr!==null)return zr}
  if(vr&&f.length<60&&window.DEX_VR&&window.DEX_VR.spaceCmd){var spc=window.DEX_VR.spaceCmd(f);if(spc)return spc}
  if(vr&&f.length<60&&window.DEX_VR&&window.DEX_VR.shotCmd){var sh=window.DEX_VR.shotCmd(f);if(sh)return sh}
  if(vr&&wv&&f.length<60&&window.DEX_VR&&window.DEX_VR.wkCmd&&/\b(rogzit\w*|mentsd el|mentsd|maradjon igy|igy maradjon|tartsd igy|igy jo|igy marad)\b/.test(f)){var rg=window.DEX_VR.wkCmd(f);if(rg!==null)return rg}
  /* A WORK-ablak mérete/helye hangra: „szélesítsd ki a workot / vörköt”, „nagyobbra a webshopot”, „told balra a workot”… (előbb, mint az „elém tedd” és az elemméretezés) */
  if(vr&&f.length<120&&window.DEX_VR&&window.DEX_VR.wkCmd&&!busy()&&/(szeles|keskeny|szuk|magasabb|alacsonyabb|tagabb|tagit|kitolt|toltsd ki|nagyit|kicsinyit|nagyobb|kisebb|teljes|bovit|maximum|kozepre|alaphelyzet|told|tolj|mozdit|mozgas|vidd|huzd|csusztasd|kiterj|hosszabb|rovidebb|laposabb|noveld|zsugor|apro|eredeti|visszaall)/.test(f)&&(hasW||/\b(webshop\w*|shopot|shop)\b/.test(f)||(wv&&(/\b(ablak\w*|kijelzo\w*|felulet\w*)\b/.test(f)||/^(?:(?:egy )?kicsit |meg |kerlek )*(szelesebb|keskenyebb|magasabb|alacsonyabb|tagabb|szukebb)\b/.test(f))))){var rb=window.DEX_VR.wkCmd(f);if(rb!==null)return rb}
  function withWork(fn){if(window.DEX_VR){var w0=document.querySelector('#dyVR .wk');if(!w0||w0.hidden){window.DEX_VR.work(true);whenReady(function(ok){if(ok)fn();else if(window.DEX_UI)window.DEX_UI.reply('A WORK oldal nem töltődött be, ezért nem tudom megnyitni.')});return}}fn()}
  function fl(t){try{window.DEX_VR&&window.DEX_VR.stripFlash&&window.DEX_VR.stripFlash(t)}catch(e){}}
  if(/hangszor\w*/.test(f)&&/\b(at|atkapcsol\w*|atvalt\w*|atteszem|atrakni|atrak\w*)\b/.test(f)&&!/\b(be|ki)\b/.test(f))return 'A hangkimenetet (hangszóró, fülhallgató, Bluetooth) a telefon rendszere választja, ezt a böngészőből nem tudom átváltani. Húzd le a telefon értesítési sávját, és ott válaszd ki, hová menjen a hang. A felolvasást ki- és bekapcsolni tudom: mondd, hogy kapcsold ki vagy be a hangszórót.';
  if(vr&&(wv||hasW)&&!busy()){
   if(/\b(kattints\w*|koppints\w*|erintsd|erintsed|erintse|tapints\w*|nyomd meg|nyomd|nyomj ra|bokd meg)\b.{0,30}\b(dex\w*|robot\w*|asszisztens\w*)\b/.test(f)||(hasW&&/\b(dex\w*|robot\w*)\b.{0,14}\b(csevego\w*|cset\w*|chat\w*)\b/.test(f)&&OPENV.test(f))){fl('dex');withWork(function(){send('@dex').then(function(t){if(/^Nem/.test(t)&&window.DEX_UI)window.DEX_UI.reply(t)})});return 'Rákattintok a DEX-re a WORK-ben.'}
   if(/\bgomb\w*/.test(f)&&/\b(kapcsold|nyomd|nyomjuk|nyomj|indits\w*|erintsd|erintsed|kattints\w*|koppints\w*)\b/.test(f)&&!/\bhangszor\w*|\bmikrofon\w*/.test(f)){fl('gomb');withWork(function(){send('@voice').then(function(t){if(/^Nem/.test(t)&&window.DEX_UI)window.DEX_UI.reply(t)})});return 'Megnyomom a hang gombot a WORK-ben.'}
   if(/\bmenu\w*/.test(f)&&(hasW||/\b(oldalso|oldalsot|workben|workban)\b/.test(f))&&!/\bjatek\w*|szokereso|utos\b/.test(f)){var mo=/\b(zard|csukd|rejtsd|tuntesd|vissza|el|be zar\w*|bezar\w*)\b/.test(f)&&!/\b(hozd|nyisd|mutasd|jojjon|elo)\b/.test(f);fl('menu');withWork(function(){send('@menu '+(mo?'close':'open')).then(function(t){if(/^Nem/.test(t)&&window.DEX_UI)window.DEX_UI.reply(t)})});return mo?'Becsukom a WORK menüjét.':'Kihozom a WORK menüjét.'}
  }
  /* Ami pontosan ott áll az aktuális oldalon (pl. a „Képek” fül), az előbbre való, mint az azonos nevű másik oldal */
  if(vr&&wv&&!busy()&&f.length>2&&f.length<40&&f.split(' ').length<=3&&!isShow&&!isHide&&!isWorkCmd&&!/\b(jatek\w*|gesztus\w*|szalag\w*|kilep\w*|allj|stop|folytas\w*|szunet|segits\w*|hangero\w*|halk\w*|hangos\w*|kamera|mikrofon\w*|dex|robot|vr|gomb\w*|menu\w*|szokereso|utos|dino\w*|rogzit\w*|alaphelyzet|vissza|kesz|igen|nem)\b/.test(f)){var hit0=wkHas(f,true);if(hit0){fl('pick');send('@pick '+f).then(function(t){if(/^Nem/.test(t)&&window.DEX_UI)window.DEX_UI.reply(t)});return 'Rákattintok: '+hit0+'.'}}
  if(f.length<90&&(vr||hasW)){var P=parseWork(f,hasW,vr);
   if(P&&P.nav){var rn=P.nav;try{window.DEX_VR&&window.DEX_VR.stripFlash&&window.DEX_VR.stripFlash(rn)}catch(e){}var doIt=function(){send('@nav '+rn).then(function(t){if(/^Nem/.test(t)&&window.DEX_UI)window.DEX_UI.reply(t)})};
     if(vr&&window.DEX_VR){var w0=document.querySelector('#dyVR .wk');if(!w0||w0.hidden){window.DEX_VR.work(true);whenReady(function(ok){if(ok)doIt();else if(window.DEX_UI)window.DEX_UI.reply('A WORK oldal nem töltődött be, ezért nem tudom megnyitni.')})}else doIt()}else doIt();
     return 'Megnyitom a WORK-ben: '+(RL[rn]||rn)+'.'}
   if(P&&P.scroll){try{window.DEX_VR&&window.DEX_VR.stripFlash&&window.DEX_VR.stripFlash(P.scroll[0])}catch(e){}send('@scroll '+P.scroll[0]+' '+P.scroll[1]).then(function(t){if(/^Nem/.test(t)&&window.DEX_UI)window.DEX_UI.reply(t)});return ''}}
  /* Ha az oldalon van ilyen nevű fül/gomb/menüpont („képek”, „videók”…), arra kattint – a DEX saját parancsait nem veszi el */
  if(vr&&wv&&!busy()&&f.length>2&&f.length<50&&f.split(' ').length<=4&&!isShow&&!isHide&&!isWorkCmd&&!/\b(jatek\w*|gesztus\w*|szalag\w*|kilep\w*|allj|stop|folytas\w*|szunet|segits\w*|hangero\w*|halk\w*|hangos\w*|kamera|mikrofon\w*|dex|robot|vr|gomb\w*|menu\w*|szokereso|utos|dino\w*|rogzit\w*|alaphelyzet|vissza|kesz|igen|nem)\b/.test(f)){var hit=wkHas(f);if(hit){fl('pick');send('@pick '+f).then(function(t){if(/^Nem/.test(t)&&window.DEX_UI)window.DEX_UI.reply(t)});return 'Rákattintok: '+hit+'.'}}
  if(!vr&&!(isWorkCmd&&/\bwork\b/.test(f)))return old.apply(this,arguments);
  if(isShow&&window.DEX_VR){var w1=document.querySelector('#dyVR .wk');if(vr&&w1&&!w1.hidden&&BAREW.test(f))return 'A WORK már ott van előtted. Mondd, hogy mit nyissak meg benne: főoldal, webshop, üzenetek, kosár…';if(navigator.onLine===false||location.protocol==='file:'){window.DEX_VR.work(true);return 'Kitettem a WORK-öt a VR-nézetbe. Az offline példány csak a már letöltött fájlokkal indul.'}window.DEX_VR.work(true);return 'Kitettem a WORK-öt a VR-nézetbe.'}
  if(isHide&&window.DEX_VR){window.DEX_VR.work(false);return 'Elrejtettem a WORK-öt.'}
  if(isWorkCmd){if(vr){var w=document.querySelector('#dyVR .wk');if(w&&w.hidden)window.DEX_VR.work(true)}send(s).then(function(t){if(window.DEX_UI)window.DEX_UI.reply(t)});return 'Megpróbálom végrehajtani a WORK-ben.'}
  return old.apply(this,arguments)};Dx.__workbridge=1;
})();
