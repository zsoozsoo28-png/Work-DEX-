/* DEX51Q – VR mód (telefon a VR-szemüvegben): fekvő, kétszemes nézet; a hátsó kamera élő képe mindkét szemnek, rajta a DEX feje,
   az állapota, a beszélgetés szövege és kérésre a WORK. Hangvezérlés: „VR mód” / „VR vége”. Csak szobában, helyben állva vagy ülve! */
(function(){'use strict';
 var Dx=window.DEX40;if(!Dx||typeof Dx.handle!=='function'||Dx.__vr)return;
 var $=function(i){return document.getElementById(i)};
 function fold(s){return Array.from(String(s||'')).map(function(c){var b=c.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return b.length?b.charAt(0):c}).join('')}
 var ENTER=/\b(vr|v r|v-r|vi ?-?ar|vi er|ve er|we are|virtualis (valosag|mod|szemuveg)|vr szemuveg)\b/,EXIT=/\b(vr|v r|vi ?-?ar|virtualis)\b.*\b(vege|ki|kikapcs\w*|leall\w*|bezar\w*|kilep\w*)\b|\b(kilep\w*|lepj ki|lepek ki|zard be|vissza)\b.*\b(vr|v r|vi ?-?ar|virtualis)\b|^(kilepek|vege)$/;
 var WORKV=/\bwork\w*\b.*\b(vr|itt|ide|mutasd|nyisd|jelenj\w*|vasarlo\w*|vevo\w*|rendel\w*|uzlet\w*|shop\w*)\b|\b(mutasd|nyisd|hozd|tedd|rakd|nyisd meg)\b.*\b(work\w*|vasarlo\w*|vevo\w*|rendel\w*|uzlet\w*|shop\w*)\b/;
 var st=null,root=null,eyes=[],poll=null,timers=[],startedMic=false,workOn=false,warned=0;
 var SS=document.createElement('style');SS.textContent=
  '#dyVR{position:fixed;z-index:2147483200;background:transparent;display:none;overflow:hidden;top:0;left:0;width:100vw;height:100vh}#dyVR.on{display:flex}'+
  '#dyVR.rot{width:100vh;height:100vw;transform-origin:0 0;transform:translateX(100vw) rotate(90deg)}'+
  '#dyVR.rot .hud{zoom:var(--rz,1)}'+
  '#dyVR .eye{position:relative;flex:1 1 50%;width:50%;height:100%;overflow:hidden;background:transparent}'+
  '#dyVR.nocam .eye{background:radial-gradient(120% 90% at 50% 10%,#1b2a85 0%,#0d1440 45%,#050b22 100%)}#dyVR.nocam video{display:none}#dyVR video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000}'+
  '#dyVR .hud{position:absolute;inset:0;pointer-events:none;transform:translateX(var(--ipd,0px))}'+
  '#dyVR .hd,#dyVR .stt,#dyVR .vm,#dyVR .foot{display:none!important}'+
  '#dyVR .hd{position:absolute;left:50%;bottom:6%;width:min(24vh,26%);aspect-ratio:830/990;transform:translateX(-50%);background:var(--vrhead,none) center/contain no-repeat;filter:drop-shadow(0 0 14px #4f9bffcc);animation:vrfl 4s ease-in-out infinite}'+
  '@keyframes vrfl{50%{transform:translateX(-50%) translateY(-1.6vh)}}'+
  '#dyVR .stt{position:absolute;left:50%;bottom:calc(6% + min(24vh,26%)*1.19 + 4px);transform:translateX(-50%);font:600 3.4vh system-ui,sans-serif;color:#bfeaff;text-shadow:0 0 8px #000,0 1px 3px #000;letter-spacing:.06em;white-space:nowrap}'+
  '#dyVR .vm{position:absolute;left:8%;right:8%;top:7%;font:500 4.2vh/1.3 system-ui,sans-serif;color:#fff;text-align:center;text-shadow:0 0 10px #000,0 1px 4px #000;white-space:pre-wrap}'+
  '#dyVR .vm .me{color:#9fe1ff;font-size:3.4vh}'+
  '#dyVR .warn{position:absolute;left:6%;right:6%;top:42%;transform:translateY(-50%);padding:1.6vh 2vh;border-radius:2vh;background:#000000b0;border:1px solid #ffd27a88;color:#ffe7b3;font:600 3.6vh/1.3 system-ui,sans-serif;text-align:center}'+
  '#dyVR .foot{position:absolute;left:0;right:0;bottom:1.2%;text-align:center;white-space:nowrap;overflow:hidden;font:600 2vh system-ui,sans-serif;color:#ffd27acc;text-shadow:0 1px 3px #000}'+
  '#dyVR .wk iframe{transition:opacity .18s,filter .18s}#dyVR .wk{transition:background .18s}#dyVR .wk.hov{background:#050e1f5c}#dyVR .wk.hov iframe{opacity:.46;filter:contrast(1.14) brightness(.94)}#dyVR .wk{pointer-events:auto;touch-action:none;position:absolute;right:5%;top:13%;width:42%;height:74%;border:1px solid #8ce7ff77;border-radius:2vh;overflow:hidden;background:#06142a2e;box-shadow:0 0 18px #49c8ff66,inset 0 0 14px #49c8ff22}#dyVR .wk iframe{width:300%;height:300%;border:0;transform:scale(.3334);transform-origin:0 0;pointer-events:none;background:transparent;opacity:.97}'+
  '#dyVR .sk{position:absolute;left:5%;top:16%;display:none;gap:2.4vh;align-items:flex-start;padding:1.2vh 1.5vh;border-radius:1.5vh;background:#04123d62;border:1px solid #5fe3ff55;box-shadow:0 0 14px #3d7bff40;backdrop-filter:blur(1.5px);transform-origin:0 0;transform:scale(var(--skz,1))}#dyVR .sk.on{display:flex}'+
  '#dyVR .sk table{border-collapse:separate;border-spacing:.5vh}#dyVR .sk td{width:4.7vh;height:4.7vh;text-align:center;font:700 3.5vh/4.7vh system-ui,sans-serif;color:#eaf6ff;text-shadow:0 1px 5px #000,0 0 8px #001;border-radius:.7vh;background:#06162b35}#dyVR .sk td.f{background:#2fd5ff66;color:#fff;box-shadow:0 0 10px #2fd5ff;text-decoration:line-through;text-decoration-thickness:.5vh}#dyVR .sk td.h{outline:.5vh solid #ffd27a;animation:skh 1s infinite}@keyframes skh{50%{outline-color:transparent}}'+
  '#dyVR .sk .wl{font:600 2.9vh/1.3 system-ui,sans-serif;color:#cfeaff;text-shadow:0 0 6px #000;min-width:14vh}#dyVR .sk .wl b{display:block;color:#ffd27a;font-size:2.6vh;letter-spacing:.08em;margin-bottom:.6vh}#dyVR .sk .wl i{display:block;font-style:normal}#dyVR .sk .wl i.d{color:#7fe8ff;text-decoration:line-through}#dyVR .sk .tm{margin-top:1vh;color:#9bb7d8;font-size:2.4vh}#dyVR .sk.p{opacity:.5}'+
  '#dyVR.g .vm{font-size:2.5vh;top:2.5%;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#dyVR.g .vm .me{font-size:2.2vh}#dyVR.g .hd{width:min(11vh,12%)}#dyVR.g .stt{bottom:calc(6% + 14vh);font-size:2.6vh}#dyVR.g .warn{display:none}'+
  '#dyVR .gm{position:absolute;left:7%;top:19%;max-width:48%;display:none;z-index:6;padding:1.2vh 1.8vh;border-radius:1.6vh;background:#02082044;font:600 5.6vh/1.5 system-ui,sans-serif;color:#eaf6ff;text-shadow:0 0 8px #000,0 1px 4px #000,0 0 16px #001}#dyVR .gm.on{display:block}'+
  '#dyVR .gm b{display:block;color:#ffd27a;font-size:3.4vh;letter-spacing:.1em;margin-bottom:.8vh}#dyVR .gm i{display:block;font-style:normal;opacity:.78;white-space:nowrap}#dyVR .gm i.s{color:#7fe8ff;opacity:1}#dyVR .gm i.s::before{content:"\\25B8 "}#dyVR .gm i em{font-style:normal;color:#ffd27a;margin-right:1vh}#dyVR .gm u{display:block;text-decoration:none;font-size:3vh;color:#bfeaff;opacity:.9}#dyVR .gm s{display:block;text-decoration:none;font-size:2.8vh;color:#bcd2ee;margin-top:.8vh;white-space:normal}'+
  '#dyVR .ride-scene{position:absolute;inset:0;width:100%;height:100%;display:none;pointer-events:none;opacity:.96}#dyVR.ride-on .ride-scene{display:block}'+
  '#dyVR .ride-hud{position:absolute;left:50%;top:8%;transform:translateX(-50%);display:none;min-width:22%;text-align:center;color:#d8f8ff;font:600 2.2vh/1.4 system-ui,sans-serif;text-shadow:0 1px 5px #00152c,0 0 12px #07baff;pointer-events:none}#dyVR.ride-on .ride-hud{display:block}#dyVR .ride-hud b{display:block;font-size:1.5vh;letter-spacing:.2em;opacity:.78}#dyVR .ride-hud span{display:block;min-height:1.4em}#dyVR.zoomed .ride-scene{transform:scale(1.09)}#dyVR.zoomed .ride-hud{top:5%;font-size:2.5vh}'+
  '#dyVR .ug{position:absolute;inset:0;display:none;pointer-events:none;overflow:hidden}#dyVR .ug.on{display:block}#dyVR .ug.hurt{box-shadow:inset 0 0 12vh #ff2a2a}'+
  '#dyVR .ug .bar{position:absolute;top:2.5%;left:0;right:0;text-align:center;font:700 3.6vh system-ui,sans-serif;color:#fff;letter-spacing:.06em;text-shadow:0 0 8px #000,0 1px 3px #000;z-index:300}'+
  '#dyVR .ug .big{position:absolute;left:0;right:0;top:34%;text-align:center;font:800 12vh system-ui,sans-serif;color:#ffe08a;text-shadow:0 0 14px #000,0 2px 6px #000;z-index:300}'+
  '#dyVR .fg{position:absolute;transform:translateX(-50%);aspect-ratio:.62;transform-origin:50% 100%;filter:drop-shadow(0 .6vh .5vh #0008)}#dyVR .fg *{position:absolute;box-sizing:border-box}'+
  '#dyVR .fg .hd2{left:20%;top:3%;width:60%;height:27%;background:var(--sk);border:.35vh solid #0006;box-shadow:inset -.5vh -.5vh 0 #0003,inset .5vh .5vh 0 #fff3}'+
  '#dyVR .fg .hr{left:18%;top:0;width:64%;height:10%;background:var(--hr);border:.3vh solid #0005;z-index:2}'+
  '#dyVR .fg .e{top:36%;width:15%;height:20%;background:#111}#dyVR .fg .e.l{left:20%}#dyVR .fg .e.r{right:20%}#dyVR .fg .m{left:30%;top:68%;width:40%;height:12%;background:#7a1f1f}#dyVR .fg.f1 .m{height:22%;border-radius:0 0 1vh 1vh}#dyVR .fg.f2 .m{left:38%;width:24%;height:26%;background:#c0392b}'+
  '#dyVR .fg .bd{left:20%;top:31%;width:60%;height:36%;background:var(--sh);border:.35vh solid #0006;box-shadow:inset -.6vh -.6vh 0 #0003,inset .6vh .6vh 0 #fff2;color:#fff;font:800 3vh/1 system-ui,sans-serif;text-align:center;padding-top:25%}'+
  '#dyVR .fg .ar{top:32%;width:17%;height:33%;background:var(--sk);border:.3vh solid #0006;transform-origin:50% 0;animation:ugarm .55s ease-in-out infinite alternate}#dyVR .fg .ar.l{left:1%}#dyVR .fg .ar.r{right:1%;animation-direction:alternate-reverse}'+
  '#dyVR .fg .lg{top:67%;width:28%;height:33%;background:var(--pn);border:.3vh solid #0006;transform-origin:50% 0;animation:ugarm .55s ease-in-out infinite alternate-reverse}#dyVR .fg .lg.l{left:22%}#dyVR .fg .lg.r{right:22%;animation-direction:alternate}'+
  '@keyframes ugarm{from{transform:rotate(28deg)}to{transform:rotate(-28deg)}}@keyframes ugbob{50%{margin-bottom:1.2%}}#dyVR .fg.walk{animation:ugbob .55s ease-in-out infinite}'+
  '#dyVR .fg.t-h .hr{background:#9aa5b1;height:16%;top:-2%;left:14%;width:72%}#dyVR .fg.t-h.nohelm .hr{background:var(--hr);height:10%;top:0;left:18%;width:64%}'+
  '#dyVR .fg.t-b .hd2{background:#2b2b2b}#dyVR .fg.t-b .e{background:#ff4040}#dyVR .fg.t-b .hr{background:#ff9f1c;height:12%;width:14%;left:43%;top:-6%;animation:ugspark .25s infinite alternate}@keyframes ugspark{to{background:#ffee58}}'+
  '#dyVR .fg.t-g{filter:drop-shadow(0 0 1.4vh #ffd34d)}#dyVR .fg.t-f .bd{border-radius:1vh}'+
  '#dyVR .fg.reach{filter:drop-shadow(0 0 1.6vh #7fe8ff)}#dyVR .fg.reach.t-b{filter:drop-shadow(0 0 1.6vh #ff4040)}#dyVR .fg.reach::after{content:"ÜSS!";left:-20%;right:-20%;top:-26%;z-index:9;text-align:center;color:#ffe08a;font:800 3.4vh system-ui,sans-serif;text-shadow:0 0 6px #000,0 1px 3px #000}#dyVR .fg.reach.t-b::after{content:"NE!";color:#ff7777}'+
  '#dyVR .fg.down{transition:transform .35s cubic-bezier(.4,0,1,1),opacity .5s .7s;transform:translateX(-50%) rotate(-92deg) translateY(12%);opacity:0;filter:none}#dyVR .fg.down::after{display:none}'+
  '#dyVR .fg.boom{transition:transform .3s,opacity .4s .2s;transform:translateX(-50%) scale(1.5);opacity:0;filter:drop-shadow(0 0 3vh #ff9f1c)}'+
  '#dyVR .ug .pop{position:absolute;transform:translateX(-50%);font:800 5vh system-ui,sans-serif;color:#fff27a;text-shadow:0 0 6px #000,0 2px 4px #000;animation:ugpop .9s ease-out forwards;z-index:250}#dyVR .ug .pop.bad{color:#ff6b6b}#dyVR .ug .pop.gold{color:#ffd34d}@keyframes ugpop{from{margin-bottom:0;opacity:1;font-size:3vh}to{margin-bottom:9%;opacity:0;font-size:6vh}}'+
  '#dyVR.u .sk{display:none!important}'+
  '#dyVR.m .sk{display:none!important}'+
  '#dyVR .dn-scene{position:absolute;inset:0;width:100%;height:100%;display:none;pointer-events:none}#dyVR.dn-on .dn-scene{display:block}'+
  '#dyVR .mg{position:absolute;inset:0;display:none;pointer-events:none;overflow:hidden}#dyVR .mg.on{display:block}#dyVR .mg .ml{position:absolute;top:10%;bottom:6%;width:22%;border-left:1px dashed #8ce7ff22;border-right:1px dashed #8ce7ff22}'+
  '#dyVR .mg .mdx{position:absolute;bottom:7%;width:15vh;height:15vh;transform:translateX(-50%);transition:left .16s ease-out}#dyVR .mg .mdx b{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 38% 32%,#1a3a66,#04101f 70%);border:.5vh solid #38b6ff;box-shadow:0 0 3vh #1e90ffaa,inset 0 0 2vh #0a3a7a}'+
  '#dyVR .mg .mdx .e1,#dyVR .mg .mdx .e2{position:absolute;top:36%;width:20%;height:12%;border:.8vh solid #5be6ff;border-bottom:0;border-radius:50% 50% 0 0;box-shadow:0 0 1.5vh #5be6ff}#dyVR .mg .mdx .e1{left:22%}#dyVR .mg .mdx .e2{right:22%}#dyVR .mg .mdx em{position:absolute;left:50%;bottom:14%;transform:translateX(-50%);font:700 3vh system-ui,sans-serif;color:#5be6ff;font-style:normal;text-shadow:0 0 1vh #5be6ff}'+
  '#dyVR .mg .mdx.sh::after{content:"";position:absolute;inset:-35%;border-radius:50%;border:.6vh solid #9be8ffcc;background:radial-gradient(circle,#9be8ff14,#7a6bff44);box-shadow:0 0 4vh #7ab8ff}#dyVR .mg .mdx.gl b{box-shadow:0 0 6vh #7dffe8,inset 0 0 3vh #7dffe8}#dyVR .mg .mdx.hu b{border-color:#ff4a5a;box-shadow:0 0 5vh #ff2a2a}'+
  '#dyVR .mg .mo{position:absolute;width:7vh;height:7vh;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#b57bff 45%,#2e7bff);box-shadow:0 0 3vh #a98bff}#dyVR .mg .mc{position:absolute;width:5vh;height:7vh;background:linear-gradient(160deg,#c9f6ff,#4aa3ff 60%,#7b4aff);clip-path:polygon(50% 0,100% 35%,80% 100%,20% 100%,0 35%);box-shadow:0 0 3vh #5bd7ff}'+
  '#dyVR .mg .mgb{position:absolute;left:50%;top:3.5%;transform:translateX(-50%);padding:.6vh 1.6vh;border-radius:1.2vh;background:#02082044;font:600 2.6vh system-ui,sans-serif;color:#eaf6ff;text-shadow:0 0 6px #000;white-space:nowrap}#dyVR .mg .mgb b{color:#ffd27a}#dyVR .mg .mbig{position:absolute;left:0;right:0;top:30%;text-align:center;font:800 11vh system-ui,sans-serif;color:#fff;text-shadow:0 0 3vh #38b6ff,0 0 1vh #000;opacity:.9}'+
  '#dyVR .cs{position:absolute;left:3%;right:3%;bottom:3%;display:none;z-index:6;padding:.9vh 1.2vh;border-radius:1.4vh;background:#02082033;font:600 2.3vh/1.3 system-ui,sans-serif;color:#eaf6ff;text-shadow:0 0 8px #000,0 1px 3px #000;text-align:center;pointer-events:none}#dyVR .cs.on{display:block}'+
  '#dyVR .cs h6{margin:0 0 .6vh;font:700 2.1vh/1.2 system-ui,sans-serif;letter-spacing:.08em;color:#ffd27a}#dyVR .cs h6 em{font-style:normal;color:#7fe8ff}#dyVR .cs .r{display:flex;flex-wrap:wrap;gap:.5vh .8vh;justify-content:center}'+
  '#dyVR .cs .c{display:inline-block;padding:.35vh 1vh;border-radius:1vh;border:1px solid #8ce7ff55;background:#06223d55;white-space:nowrap}#dyVR .cs .c b{color:#7fe8ff;font-weight:700}#dyVR .cs .c small{font-size:1.9vh;opacity:.82;margin-left:.5vh}#dyVR .cs .c.f{background:#ffd27acc;color:#02101f;text-shadow:none;border-color:#ffd27a}#dyVR .cs .c.f b{color:#02101f}'+
  '#dyVR .cm{position:absolute;left:8%;right:8%;bottom:7%;visibility:hidden;opacity:0;transition:opacity .45s,visibility .45s;text-align:center;font:500 3.8vh/1.3 system-ui,sans-serif;color:#fff;text-shadow:0 0 10px #000,0 1px 4px #000;white-space:pre-wrap;z-index:5;background:#02082026;border-radius:1.6vh;padding:.8vh 1.4vh}#dyVR .cm.on{visibility:visible;opacity:1}#dyVR .cm span{display:block}#dyVR .cm .me{color:#9fe1ff;font-size:.8em}#dyVR.g .cm{font-size:3vh}'+
  '#dyVR .gaze{position:absolute;left:50%;top:50%;width:1.2vh;height:1.2vh;margin:-.6vh;border-radius:50%;background:#5fe3ffaa}';
 document.head.appendChild(SS);
 function setHead(){try{var im=document.querySelector('img.robot');if(im&&im.src)document.documentElement.style.setProperty('--vrhead','url("'+im.src+'")')}catch(e){}}
 function mk(){
  root=document.createElement('div');root.id='dyVR';root.setAttribute('role','dialog');root.setAttribute('aria-label','VR mód');
  eyes=[0,1].map(function(i){var e=document.createElement('div');e.className='eye';
   e.innerHTML='<video autoplay playsinline muted></video><div class="hud"><div class="vm"></div><div class="stt"></div><div class="hd"></div><div class="wk" hidden></div><div class="sk"></div><canvas class="ride-scene" aria-hidden="true"></canvas><div class="ride-hud"><b>CSILLAGVASÚT</b><span></span></div><div class="ug"></div><div class="gm"></div><canvas class="dn-scene" aria-hidden="true"></canvas><div class="mg"></div><div class="cs"></div><div class="cm"></div><div class="warn" hidden></div><div class="foot">Csak zárt térben! · Kilépés: „VR vége” vagy 3 koppintás</div></div>';
   root.appendChild(e);return e});
  document.body.appendChild(root);
  var taps=[];
  eyes.forEach(function(e){var w=e.querySelector('.wk');if(!w)return;var d0=null;
   w.addEventListener('pointerdown',function(ev){d0={x:ev.clientX,y:ev.clientY,t:Date.now()}});
   w.addEventListener('pointerup',function(ev){if(!d0)return;var dx=ev.clientX-d0.x,dy=ev.clientY-d0.y,dt=Date.now()-d0.t,m=Math.sqrt(dx*dx+dy*dy);d0=null;
    if(m<14&&dt<700){var r=w.getBoundingClientRect();if(r.width>0&&r.height>0)wkPost('@tap '+Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)).toFixed(4)+' '+Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height)).toFixed(4));return}
    if(m>=40){var h=Math.abs(dx)>Math.abs(dy);gesDo(h?(dx>0?'right':'left'):(dy>0?'down':'up'))}});
   w.addEventListener('pointercancel',function(){d0=null})});
  root.addEventListener('click',function(ev){if(ev&&ev.target&&ev.target.closest&&ev.target.closest('.wk'))return;var n=Date.now();taps=taps.filter(function(t){return n-t<1200});taps.push(n);if(taps.length>=3){taps=[];leave()}});
 }
 function layout(){if(!root)return;var por=window.innerHeight>window.innerWidth&&!(screen.orientation&&/landscape/.test(screen.orientation.type||'')&&window.innerWidth>window.innerHeight);root.classList.toggle('rot',por);camLoad();camApply();root.style.setProperty('--rz',por?(window.innerWidth/window.innerHeight).toFixed(4):1)}
 function hud(fn){eyes.forEach(function(e,i){fn(e.querySelector('.hud'),i)})}
 function ipd(){var v=+(localStorage.getItem('dex51_vr_ipd')||0)||0;eyes.forEach(function(e,i){e.querySelector('.hud').style.setProperty('--ipd',((i?-1:1)*(5+v))+'px')})}
 var fc=0;
 var chatOn=false,chatSig='';
 function chatRender(force){if(!root)return;var ms=[].slice.call(document.querySelectorAll('#inlineMessages .msg')).filter(function(m){return !m.classList.contains('system')}).slice(-2),
  sig=chatOn?ms.map(function(m){return (m.classList.contains('me')?'u:':'a:')+m.textContent}).join('|'):'off';
  if(!force&&sig===chatSig)return;chatSig=sig;
  hud(function(x){var e=x.querySelector('.cm');if(!e)return;e.classList.toggle('on',chatOn&&ms.length>0);e.innerHTML='';if(!chatOn)return;ms.forEach(function(m){var sp=document.createElement('span');if(m.classList.contains('me'))sp.className='me';var tx=m.textContent.trim();sp.textContent=tx.length>120?tx.slice(0,117)+'…':tx;e.appendChild(sp)})})}
 function chatSet(on){chatOn=!!on;chatRender(true)}
 function feed(){try{camApply()}catch(e){}if(G&&!G.paused&&!G.done&&(++fc%3===0))skRender();if(chatOn)chatRender();trackHand(Date.now())}
 function workCands(){return /\/dex\/[^\/]*$/.test(location.pathname)?['../work/index.html']:['./work/index.html','./work.html']}
 var workSel=null;
 function workUrl(){return new URL(workSel||workCands()[0],location.href).href}
 var workChk=null;
 function probeWork(list,k,done){if(k>=list.length){done(null,true);return}var u=new URL(list[k],location.href).href,ac=window.AbortController?new AbortController():null;
  fetch(u,{cache:'no-store',signal:ac?ac.signal:undefined}).then(function(r){try{ac&&ac.abort()}catch(e){}if(r.status===404||r.status===410)probeWork(list,k+1,done);else done(list[k],false)}).catch(function(){done(list[k],false)})}
 function setWork(on){
  if(on&&workChk!==true){
   probeWork(workCands(),0,function(sel,missing){if(missing){workChk=false;workOn=false;setWork2(false);try{if(window.DEX_UI)window.DEX_UI.reply('A WORK oldal nincs a tárhelyen: a work/index.html (vagy a work.html) hiányzik a DEX mellől. Töltsd fel ugyanoda, ahol a DEX van, vagy használd a PC-s szervert.')}catch(e){}}else{workChk=true;workSel=sel;setWork2(true)}});return}
  setWork2(on)}
 function setWork2(on){workOn=!!on;hud(function(x){var w=x.querySelector('.wk');w.hidden=!workOn;if(workOn){w.style.right=er()+'%';w.style.top=et()+'%';w.style.width=WKB.w+'%';w.style.height=WKB.h+'%'}if(workOn&&!w.firstChild){var f=document.createElement('iframe');f.src=workUrl();f.setAttribute('loading','eager');f.onload=function(){try{var d=f.contentDocument;if(d){var st=d.createElement('style');st.textContent='html,body{background:transparent!important}.app,.app-shell{background:transparent!important}';d.head.appendChild(st)}}catch(e){}};w.appendChild(f)}else if(!workOn){w.innerHTML=''}})}
 function setWorkRoute(route){setWork(true);var tries=0;function apply(){var frames=root?root.querySelectorAll('.wk iframe'):[];if(frames.length){try{frames.forEach(function(f){f.contentWindow.location.hash='#'+route})}catch(e){}return}if(tries++<24)setTimeout(apply,250)}setTimeout(apply,180)}
 function sendWorkCommand(text){setWork(true);var tries=0;function send(){var frames=root?root.querySelectorAll('.wk iframe'):[];if(frames.length){frames.forEach(function(f){try{f.contentWindow.postMessage({channel:'wdea-dex-command-v1',text:String(text||'')},location.origin)}catch(e){}});return}if(tries++<24)setTimeout(send,250)}setTimeout(send,220)}
 function warn(t,ms){hud(function(x){var w=x.querySelector('.warn');w.textContent=t;w.hidden=false});timers.push(setTimeout(function(){hud(function(x){x.querySelector('.warn').hidden=true})},ms||6000))}
 async function enter(gesture){
  if(root&&root.classList.contains('on'))return 'A VR mód már be van kapcsolva.';
  var stream=null,nocam='';
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)nocam='A kamera csak biztonságos (https) címen vagy telepített alkalmazásként érhető el, ezért kamerakép nélkül indítottam.';
  else{try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false})}
   catch(e){nocam='A kamerát nem tudom megnyitni ('+(e&&e.name==='NotAllowedError'?'nincs engedélyezve a böngészőben':e&&e.message||'hiba')+'), ezért kamerakép nélkül indítottam.'}}
  st=stream;if(!root)mk();setHead();root.classList.toggle('nocam',!stream);
  eyes.forEach(function(e){var v=e.querySelector('video');if(stream){v.srcObject=stream;v.play&&v.play().catch(function(){})}});
  root.classList.add('on');layout();ipd();feed();poll=setInterval(feed,100);window.addEventListener('resize',layout);
  try{if(gesture&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen()}catch(e){}
  try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch(e){}
  layout();
  if(window.DEX_LISTEN&&!window.DEX_LISTEN.on()){try{window.DEX_LISTEN.start();startedMic=true}catch(e){}}
  // No visual status or transcript is shown in headset mode.
  if(nocam){try{console.warn('DEX VR camera:',nocam)}catch(e){}timers.push(setTimeout(function(){if(window.DEX_UI&&window.DEX_UI.reply)window.DEX_UI.reply(nocam)},1500))}
  return 'VR mód bekapcsolva. A kamera képét látod mindkét szemmel, én itt vagyok előtted, és folyamatosan hallgatlak. Csak szobában, helyben állva vagy ülve használd, sétálni nem szabad. Kilépés: mondd, hogy VR vége.'}
 function voiceFullscreen(exit){
  if(exit){if(document.fullscreenElement&&document.exitFullscreen){try{Promise.resolve(document.exitFullscreen()).catch(function(){})}catch(e){}return 'Kiléptem a teljes képernyős nézetből.'}return 'Most nem teljes képernyőn vagyok.'}
  if(document.fullscreenElement)return 'Már teljes képernyőn vagyok.';
  var el=document.documentElement;if(!el||!el.requestFullscreen)return 'A böngésző nem engedélyezi a teljes képernyős módot ezen az oldalon.';
  try{var p=el.requestFullscreen({navigationUI:'hide'});if(p&&p.catch)p.catch(function(){try{window.DEX_UI&&window.DEX_UI.reply('A böngésző nem engedte a hangból indított teljes képernyőt. Koppints egyszer az oldalra, majd mondd újra.')}catch(e){}});return 'Teljes képernyőre váltok.'}catch(e){return 'A teljes képernyő indításához koppints egyszer az oldalra, majd mondd újra.'}
 }
 function leave(){
  if(!root||!root.classList.contains('on'))return 'A VR mód nincs bekapcsolva.';
  G=null;uStop();rideStop();mgStop();dnStop();mgSaid=false;introSaid=false;M=null;chatOn=false;chatRender(true);gmRender();skRender();root.classList.remove('on');clearInterval(poll);poll=null;timers.forEach(clearTimeout);timers=[];window.removeEventListener('resize',layout);
  try{if(st)st.getTracks().forEach(function(t){t.stop()})}catch(e){}st=null;eyes.forEach(function(e){var v=e.querySelector('video');v.srcObject=null});setWork(false);
  try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen()}catch(e){}try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(e){}
  if(startedMic&&window.DEX_LISTEN&&window.DEX_LISTEN.on())window.DEX_LISTEN.stop();startedMic=false;
  return 'Kiléptem a VR módból.'}

 /* ---- SZÓKERESŐ: betűrács a kameraképen, hangvezérléssel ---- */
 var WORDS='HOLD NAP CSILLAG VIZ FELHO ERDO TENGER HEGY VIRAG SZEL NYAR TAVASZ ROBOT AUTO VONAT HAJO REPULO KONYV ASZTAL AJTO ABLAK VAROS UTCA KUTYA MACSKA MADAR KENYER SAJT ALMA KORTE SZILVA KAVE CUKOR ZENE FILM JATEK BARAT CSALAD ISKOLA MUNKA SZIV FEJ SZEM ORR PARK LAMPA TEJ'.split(' ');
 var LET='AAAEEEOIKLMNRSTZGBDHUVYPCJFXW'.split(''),N=8,DIRS=[[0,1],[1,0],[1,1],[-1,1]];
 var G=null;
 function rnd(n){return Math.floor(Math.random()*n)}
 function newGame(){
  var pool=WORDS.filter(function(w){return w.length<=N}).sort(function(){return Math.random()-.5}),words=[],grid=[],i,j,tries=0;
  for(i=0;i<N;i++){grid.push([]);for(j=0;j<N;j++)grid[i].push('')}
  var cells={};
  for(var k=0;k<pool.length&&words.length<6;k++){var w=pool[k],ok=false;
   for(var t=0;t<80&&!ok;t++){var d=DIRS[rnd(DIRS.length)],r=rnd(N),c=rnd(N),er=r+d[0]*(w.length-1),ec=c+d[1]*(w.length-1);if(er<0||er>=N||ec<0||ec>=N)continue;
    var fit=true;for(var q=0;q<w.length;q++){var cur=grid[r+d[0]*q][c+d[1]*q];if(cur&&cur!==w[q]){fit=false;break}}
    if(!fit)continue;var cl=[];for(q=0;q<w.length;q++){grid[r+d[0]*q][c+d[1]*q]=w[q];cl.push([r+d[0]*q,c+d[1]*q])}cells[w]=cl;ok=true}
   if(ok)words.push(w)}
  for(i=0;i<N;i++)for(j=0;j<N;j++)if(!grid[i][j])grid[i][j]=LET[rnd(LET.length)];
  G={grid:grid,words:words,cells:cells,found:{},hint:null,paused:false,t0:Date.now(),zoom:1,tp:0,done:false};
  return G}
 function skHTML(){
  if(!G)return '';var f={};Object.keys(G.found).forEach(function(w){G.cells[w].forEach(function(c){f[c[0]+','+c[1]]=1})});
  var h=G.hint?G.hint.join(','):'',rows=G.grid.map(function(row,i){return '<tr>'+row.map(function(ch,j){var k=i+','+j;return '<td class="'+(f[k]?'f':'')+(h===k?' h':'')+'">'+ch+'</td>'}).join('')+'</tr>'}).join('');
  var sec=Math.floor(((G.done?G.tEnd:Date.now())-G.t0-G.tp)/1000),tm=Math.floor(sec/60)+':'+('0'+sec%60).slice(-2);
  return '<table>'+rows+'</table><div class="wl"><b>KERESD</b>'+G.words.map(function(w){return '<i class="'+(G.found[w]?'d':'')+'">'+w+'</i>'}).join('')+'<div class="tm">'+Object.keys(G.found).length+'/'+G.words.length+' · '+tm+(G.paused?' · szünet':'')+'</div></div>'}
 function skRender(){if(!root)return;root.classList.toggle('g',!!G);root.classList.toggle('m',!!(typeof M!=='undefined'&&M));hud(function(x){var e=x.querySelector('.sk');if(!e)return;e.classList.toggle('on',!!G);e.classList.toggle('p',!!(G&&G.paused));e.style.setProperty('--skz',G?G.zoom:1);e.innerHTML=skHTML()})}
function startGame(){mgStop();dnStop();uStop();newGame();skRender();return 'Szókereső. Keresd meg a rácsban a jobb oldali szavakat (vízszintesen, függőlegesen vagy átlósan, előre olvasva). Ha megvan, mondd: „megvan, HOLD”. Segítség: „tipp”, szünet: „szünet”, nagyítás: „nagyítsd”, új játék: „következő játék”, vége: „szókereső vége”.'}
function lev(a,b){var d=[],i,j;for(i=0;i<=a.length;i++)d[i]=[i];for(j=0;j<=b.length;j++)d[0][j]=j;for(i=1;i<=a.length;i++)for(j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
 function scan(f){var tk=f.split(' ').map(function(t){return t.replace(/[^a-z]/g,'')}).filter(Boolean),un=G.words.filter(function(w){return !G.found[w]}),c=[];
  tk.forEach(function(t,i){c.push(t);if(i+1<tk.length)c.push(t+tk[i+1])});
  for(var i=0;i<c.length;i++)for(var j=0;j<un.length;j++){var w=fz(un[j]),t=c[i];if(t===w||(w.length>=5&&t.length>=4&&lev(t,w)<=1)||(w.length>=4&&t.length>w.length&&t.indexOf(w)===0))return un[j]}
  return null}
 function fz(w){return fold(w).replace(/[^a-z]/g,'')}
 function tryWord(raw){var w=fz(raw);if(!w)return null;var hit=G.words.filter(function(x){return fz(x)===w})[0];
  if(!hit){var near=G.words.filter(function(x){return !G.found[x]&&(fz(x).indexOf(w)===0||w.indexOf(fz(x))===0)&&Math.abs(fz(x).length-w.length)<=1})[0];if(near)hit=near}
  if(!hit)return null;if(G.found[hit])return 'A(z) '+hit+' már megvan.';G.found[hit]=1;G.hint=null;
  if(Object.keys(G.found).length===G.words.length){G.done=true;G.tEnd=Date.now();skRender();var s=Math.floor((G.tEnd-G.t0-G.tp)/1000);return 'Megvan: '+hit+'. Mind megtaláltad '+Math.floor(s/60)+' perc '+s%60+' másodperc alatt! Ügyes vagy. Mondd: következő játék.'}
  skRender();var left=G.words.length-Object.keys(G.found).length;return 'Megvan: '+hit+'! Még '+left+' szó van hátra.'}
 function gameCmd(f,raw){
  if(!G)return null;
  if(/\bszokereso\b.*\b(vege|ki|leall\w*|bezar\w*)\b|\b(vege|kilep\w*|hagyjuk)\b.*\b(szokereso|jatek\w*)\b/.test(f)){G=null;skRender();return 'Kiléptem a szókeresőből.'}
  if(/\b(kovetkezo|uj|masik)\b.*\b(jatek|szokereso)\b|\bujra\b.*\bjatek\b/.test(f)){return startGame()}
  if(/\b(szunet|megallj|pihenj)\b/.test(f)){if(!G.paused){G.paused=true;G.pa=Date.now();skRender()}return 'Szünet. Ha folytatjuk, mondd: folytasd.'}
  if(/\b(folytasd|folytassuk|mehet|tovabb)\b/.test(f)&&G.paused){G.paused=false;G.tp+=Date.now()-G.pa;skRender();return 'Folytatjuk.'}
  if(G.paused)return null;
  if(/\b(nagyits\w*|nagyitot|nagyobb\w*|kozelits\w*|zoomol\w*)\b/.test(f)){G.zoom=Math.min(1.7,Math.round((G.zoom+.2)*10)/10);skRender();return 'Nagyítottam.'}
  if(/\b(kicsinyit\w*|kicsinyitot|kisebb\w*|tavolits\w*|zoomolj ki)\b/.test(f)){G.zoom=Math.max(.6,Math.round((G.zoom-.2)*10)/10);skRender();return 'Kicsinyítettem.'}
  if(/\b(tipp\w*|segits\w*|segitsegre|nem talalom)\b/.test(f)){var un=G.words.filter(function(w){return !G.found[w]});if(!un.length)return null;var w=un[rnd(un.length)],c=G.cells[w][0];G.hint=c;skRender();setTimeout(function(){if(G&&G.hint&&G.hint[0]===c[0]&&G.hint[1]===c[1]){G.hint=null;skRender()}},6000);return 'Tipp: a(z) '+w+' kezdőbetűje be van jelölve a rácsban.'}
  var m=/^(?:megvan|megtalaltam|ez az|itt van|talaltam)\W+(.+)$/.exec(f)||/^(?:megvan|megtalaltam)\s+(.+)$/.exec(f);
  var cand=m?m[1]:(f.split(' ').length<=2?f:null);
  if(cand){var r=tryWord(cand);if(r)return r;if(m){var sw=scan(cand);if(sw){var r2=tryWord(sw);if(r2)return r2}return 'Ilyen szót nem találok a listában: '+cand.toUpperCase()+'. Nézd meg a jobb oldali szavakat.'}}
  var sw2=scan(f);if(sw2){var r3=tryWord(sw2);if(r3)return r3}
  return null}

 /* ---- ÜTŐS BLOKKOK: blokk-figurák jönnek feléd; ütsd le őket (kézmozdulat a kamera előtt, vagy hangon: „üss”) ---- */
 var U=null,UT=null,prevFrame=null,cvs=null,introSaid=false,UBEST=+(localStorage.getItem('dex51_utos_best')||0)||0;
 var UTY={n:{hp:1,sp:1,pts:1},h:{hp:2,sp:.9,pts:2},f:{hp:1,sp:1.7,pts:2},g:{hp:1,sp:1.25,pts:5},b:{hp:1,sp:.85,pts:0,bomb:true}};
 var SKIN=['#9bd37a','#8fc7e8','#f5b6d4','#ffd9a8','#c7a6ff','#ffb27a'],SHIRT=['#e0523f','#f0a020','#8e44ad','#ec5aa0','#d6d63a','#ff7a3d'],PANT=['#2b2b6b','#6b2b2b','#2b6b4a','#f0d020','#e0523f'],HAIR=['#111','#e8c040','#ff6a00','#7b3fe4','#00b3a4'];
 var POPW=['BUMM!','PUFF!','AJJ!','BÚÚ!','HOPP!','ZUHANT!','PÁ!'];
 function rr(a){return a[rnd(a.length)]}
 function figHTML(t){return '<i class="hr"></i><div class="hd2"><b class="e l"></b><b class="e r"></b><b class="m"></b></div><div class="bd">'+(t==='b'?'TNT':'')+'</div><div class="ar l"></div><div class="ar r"></div><div class="lg l"></div><div class="lg r"></div>'}
 function uBeep(f,d,v){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;window.__dexAC=window.__dexAC||new A();var c=window.__dexAC,o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=f;g.gain.value=v||.05;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);o.stop(c.currentTime+d)}catch(e){}}
 function uVib(n){try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}}
 function uBar(){if(!U)return;var h='';for(var i=0;i<Math.max(3,U.lives);i++)h+=i<U.lives?'♥':'♡';var t=h+'  PONT '+U.score+'  SZINT '+U.lvl+(U.combo>=3?'  KOMBÓ x'+U.combo:'');
  var c='';if(U.state==='ready')c=U.cd>0?String(Math.ceil(U.cd)):'ÜSS!';if(U.state==='over')c='VÉGE';if(U.paused)c='SZÜNET';
  hud(function(x){var u=x.querySelector('.ug');if(!u)return;var b=u.querySelector('.bar'),k=u.querySelector('.big');if(b)b.textContent=t;if(k)k.textContent=c})}
 function uPop(fig,txt,cls){hud(function(x,i){var u=x.querySelector('.ug');if(!u||!fig.el[i])return;var p=document.createElement('div');p.className='pop '+(cls||'');p.textContent=txt;p.style.left=fig.x*100+'%';p.style.bottom=(fig.hpct+fig.b)+'%';u.appendChild(p);setTimeout(function(){try{p.remove()}catch(e){}},900)})}
 function uPlace(f){var z=f.z;f.hpct=14+58*z;f.b=4+(1-z)*34;hud(function(x,i){var e=f.el[i];if(!e)return;e.style.left=f.x*100+'%';e.style.bottom=f.b+'%';e.style.height=f.hpct+'%';e.style.zIndex=Math.round(z*100);e.classList.toggle('reach',!f.down&&z>=.5)})}
 function uSpawn(type,x,z){if(!U)return null;var d=UTY[type]||UTY.n,f={type:type,x:x==null?.14+Math.random()*.72:x,z:z==null?.15:z,hp:d.hp,sp:d.sp,down:false,t0:Date.now(),el:[],last:0,face:rnd(3)};
  var sk=type==='g'?'#ffd34d':rr(SKIN),sh=type==='g'?'#ffb300':type==='b'?'#d32f2f':rr(SHIRT),pn=type==='g'?'#e69a00':rr(PANT),hr=type==='g'?'#fff2a8':rr(HAIR);
  hud(function(xx,i){var u=xx.querySelector('.ug');if(!u)return;var e=document.createElement('div');e.className='fg walk t-'+type+' f'+f.face;e.style.cssText='--sk:'+sk+';--sh:'+sh+';--pn:'+pn+';--hr:'+hr;e.innerHTML=figHTML(type);u.appendChild(e);f.el[i]=e});
  U.figs.push(f);uPlace(f);return f}
 function uKill(f){f.el.forEach(function(e){try{e&&e.remove()}catch(x){}});}
 function uHit(f){if(!U||!f||f.down||U.state!=='play'||U.paused)return false;var d=UTY[f.type]||UTY.n;f.last=Date.now();
  if(d.bomb){f.down=true;U.lives--;U.combo=0;uPop(f,'BUMM! −♥','bad');f.el.forEach(function(e){e&&e.classList.add('boom')});uBeep(90,.35,.08);uVib([60,40,60]);setTimeout(function(){uKill(f)},700);uBar();if(U.lives<=0)uOver();return true}
  f.hp--;
  if(f.hp>0){f.z=Math.max(.15,f.z-.18);f.el.forEach(function(e){e&&e.classList.add('nohelm')});uPop(f,'KLONK!','');uBeep(300,.12);uVib(25);uPlace(f);return true}
  f.down=true;U.ko++;U.combo++;var mult=1+Math.floor(U.combo/5);U.score+=d.pts*mult;U.lvl=1+Math.floor(U.ko/8);
  if(f.type==='g'){U.lives=Math.min(5,U.lives+1);uPop(f,'+♥ ARANY!','gold')}else uPop(f,rr(POPW),'');
  f.el.forEach(function(e){e&&(e.classList.remove('walk'),e.classList.add('down'))});uBeep(520,.15);uVib(30);setTimeout(function(){uKill(f)},1300);uBar();return true}
 function uNearest(){if(!U)return null;var b=null;U.figs.forEach(function(f){if(!f.down&&f.z>=.5&&(!b||f.z>b.z))b=f});return b}
 function uOver(){U.state='over';if(U.score>UBEST){UBEST=U.score;try{localStorage.setItem('dex51_utos_best',String(UBEST))}catch(e){}}uBar();
  var t='Vége a játéknak! '+U.ko+' figurát ütöttél le, '+U.score+' pontot szereztél'+(U.score>=UBEST&&U.score>0?', ez új rekord!':'. A rekordod: '+UBEST+'.')+' Mondd: még egyszer, vagy: játékok.';
  setTimeout(function(){if(U&&U.state==='over'&&window.DEX_UI)window.DEX_UI.reply(t)},900)}
 function e2v(xf,yf){var v=eyes[0]&&eyes[0].querySelector('video');if(!v||!v.videoWidth)return null;var ew=eyes[0].clientWidth||1,eh=eyes[0].clientHeight||1,va=camAsp(v),ea=ew/eh,vx,vy;
  if(va>ea){var dw=eh*va;vx=(xf*ew+(dw-ew)/2)/dw;vy=yf}else{var dh=ew/va;vy=(yf*eh+(dh-eh)/2)/dh;vx=xf}var q=camInv(Math.max(0,Math.min(1,vx)),Math.max(0,Math.min(1,vy)));return [Math.max(0,Math.min(1,q[0])),Math.max(0,Math.min(1,q[1]))]}
 function motionGrid(){var v=eyes[0]&&eyes[0].querySelector('video');if(!v||!v.videoWidth||v.readyState<2)return null;
  if(!cvs){cvs=document.createElement('canvas');cvs.width=64;cvs.height=36}var cx=cvs.getContext('2d',{willReadFrequently:true});
  try{cx.setTransform(1,0,0,1,0,0);cx.save();cx.translate(32,18);cx.rotate(CAM.r*Math.PI/2);if(CAM.m)cx.scale(-1,1);if(CAM.r%2)cx.drawImage(v,-18,-32,36,64);else cx.drawImage(v,-32,-18,64,36);cx.restore();var im=cx.getImageData(0,0,64,36).data}catch(e){return null}var g=new Uint8Array(2304),i;for(i=0;i<2304;i++)g[i]=(im[i*4]*3+im[i*4+1]*6+im[i*4+2])/10;
  if(!prevFrame){prevFrame=g;return null}var d=new Uint8Array(2304),n=0,sx=0,sy=0;for(i=0;i<2304;i++){if(Math.abs(g[i]-prevFrame[i])>26){d[i]=1;n++;sx+=i%64;sy+=Math.floor(i/64)}}prevFrame=g;return {d:d,frac:n/2304,x:n?sx/n/63:.5,y:n?sy/n/35:.5}}

 /* ---- Gesztusvezérlés (kézmozdulat → lapozás), irányító szalag, WORK-ablak mozgatása ---- */
 var GES={on:true,samples:[],last:0,lock:0,seen:0};
 var WKB0={r:5,t:13,w:42,h:74},WKB={r:5,t:13,w:42,h:74};
 try{var wsv=JSON.parse(localStorage.getItem('dex_wkb')||'null');if(wsv&&[wsv.r,wsv.t,wsv.w,wsv.h].every(function(n){return typeof n==='number'&&isFinite(n)})&&wsv.w>=24&&wsv.w<=96&&wsv.h>=40&&wsv.h<=94)WKB={r:wsv.r,t:wsv.t,w:wsv.w,h:wsv.h}}catch(e){}
 function wkSave(){try{localStorage.setItem('dex_wkb',JSON.stringify({r:WKB.r,t:WKB.t,w:WKB.w,h:WKB.h}))}catch(e){}}
 var CS={on:false,page:0,fl:{}},CSP=[
  {t:'WORK oldalak',c:[['vásárlások','a WORK Vásárlás oldala','shopping'],['termékek','bemutatóbolt','store'],['kosár','kosár oldal','cart'],['rendelések','rendeléseid','orders'],['üzenetek','WORK üzenetek','messages'],['főoldal','kezdőlap','home'],['értesítések','értesítések','notifications'],['profil','profil oldal','profile'],['beállítások','beállítások','settings'],['segítség','súgó oldal','help']]},
  {t:'Görgetés és lapozás',c:[['görgess lejjebb / menj le','le · lentebb · lefelé','down'],['görgess feljebb / menj fel','fel · fentebb · fölfelé','up'],['kicsit lejjebb','kis lépés','down'],['sokat lejjebb','nagy lépés','down'],['lapozz jobbra / tovább','következő · jobbra','right'],['lapozz balra / vissza','előző · balra','left'],['az aljára','oldal vége','bottom'],['a tetejére','oldal teteje','top']]},
  {t:'WORK-ablak',c:[['WORK nagyobb','nagyíts · nagyítsál · közelíts','big'],['WORK kisebb','kicsinyíts · távolíts','small'],['told a WORK-öt balra / jobbra / fel / le','mozgat','move'],['szélesítsd ki a WORK-öt','szélesebb','big'],['✋ csípd meg és húzd','kézzel mozgatás','move'],['✋✋ két kézzel csípj, tágítsd','kézzel nagyítás','big'],['✋ rövid csipesz = katt','kattintás az ujjad alatt','tap'],['✋ csipesz + kéz közelebb/távolabb','kitolás, behúzás','big'],['tedd le a térbe','ablak a térben marad','move'],['elem mozgatás be / ki','kártyák külön','move'],['kéz a kép előtt ki / be','kézkivágás','hf'],['WORK középre','középre','mid'],['WORK alaphelyzet','visszaállít','reset'],['WORK el','elrejt','hide']]},
  {t:'DEX és játékok',c:[['játékok','játékmenü','games'],['mutasd a csevegéseket','DEX-csevegés','chat'],['csevegés vissza','csevegés el','chatoff'],['gesztus mód ki / be','kézvezérlés','ges'],['szalag tovább','következő lap','next'],['szalag el','szalag rejt','hide2'],['VR vége','kilépés','exit']]}];
 function csRender(){hud(function(x){var e=x.querySelector('.cs');if(!e)return;e.classList.toggle('on',CS.on);if(!CS.on){e.innerHTML='';return}
  var P=CSP[CS.page%CSP.length],h='<h6>IRÁNYÍTÓ SZALAG · '+P.t+' · '+(CS.page%CSP.length+1)+'/'+CSP.length+' · kéz: <em>'+(GES.on?('BE'+(HD.mode==='mp'?' · pontos':(HD.loading?' · töltődik':' · mozgás'))):'KI')+'</em></h6>';
  h+='<div class="r"><span class="c'+(CS.fl.up?' f':'')+'"><b>✋ ▲</b><small>fel = feljebb</small></span><span class="c'+(CS.fl.down?' f':'')+'"><b>✋ ▼</b><small>le = lejjebb</small></span><span class="c'+(CS.fl.left?' f':'')+'"><b>✋ ◀</b><small>balra lapoz</small></span><span class="c'+(CS.fl.right?' f':'')+'"><b>✋ ▶</b><small>jobbra lapoz</small></span></div><div class="r" style="margin-top:.5vh">';
  P.c.forEach(function(c){h+='<span class="c'+(CS.fl[c[2]]?' f':'')+'"><b>„'+c[0]+'”</b><small>'+c[1]+'</small></span>'});
  e.innerHTML=h+'</div>'})}
 function csSet(on){CS.on=!!on;csRender();return CS.on}
 function csFlash(k){if(!k)return;CS.fl[k]=1;if(CS.on)csRender();setTimeout(function(){delete CS.fl[k];if(CS.on)csRender()},900)}
 var SP={on:0,dx:0,dy:0,yaw:0,pitch:0,sg:1,ev:0,t:0};
 function er(){return WKB.r+SP.dx}
 function et(){return WKB.t+SP.dy}
 function wkApply(){hud(function(x){var w=x.querySelector('.wk');if(!w)return;w.style.right=er()+'%';w.style.top=et()+'%';w.style.width=WKB.w+'%';w.style.height=WKB.h+'%'})}
 function wkPost(text){var fr=root?[].slice.call(root.querySelectorAll('.wk iframe')):[];fr.forEach(function(f){try{f.contentWindow.postMessage({channel:'wdea-dex-work-v1',type:'command',requestId:'g-'+Date.now(),text:text},location.origin)}catch(e){}});return fr.length}
 function gesDo(dir){if(MG&&MG.state!=='over'){mgGesture(dir);return}csFlash(dir);var k={up:'@scroll up .6',down:'@scroll down .6',left:'@scroll left .7',right:'@scroll right .7'}[dir];wkPost(k)}

 /* ---- Kézzel fogás: csipesz = megfogja a WORK-ablakot és viszi; két kézzel csípve tágítva nagyít ---- */
 var GRIP={m:0,lock:0,lost:0,moved:0,ts:0,tx:0,ty:0};
 function handsList(now){
  var o=window.__handsLm;if(typeof o==='function'){var L=o()||[];return L.map(function(l){return l.x!==undefined?l:dnHandFromLm(l)}).filter(Boolean)}
  var o1=window.__handLm;if(typeof o1==='function'){var l1=o1();return l1?[l1.x!==undefined?l1:dnHandFromLm(l1)].filter(Boolean):[]}
  if(HD.mode==='mp'&&HD.eng&&HD.resAll&&now-HD.resT<350)return HD.resAll.map(dnHandFromMP).filter(Boolean);return []}
 function gripGlow(on){hud(function(x){var w=x.querySelector('.wk');if(w)w.style.borderColor=on?'#ffe27a':'';if(w)w.style.boxShadow=on?'0 0 3vh #ffe27a99':''})}
 function gripTap(fx,fy){if(fx<0||fx>1||fy<0||fy>1)return false;wkPost('@tap '+fx.toFixed(4)+' '+fy.toFixed(4));csFlash('tap');
  hud(function(x){var r=document.createElement('i');r.style.cssText='position:absolute;left:'+((100-er()-WKB.w)+fx*WKB.w)+'%;top:'+(et()+fy*WKB.h)+'%;width:6vh;height:6vh;margin:-3vh 0 0 -3vh;border-radius:50%;border:.5vh solid #ffe27a;box-shadow:0 0 2vh #ffe27a;pointer-events:none;z-index:7;transition:transform .45s,opacity .45s;transform:scale(.3);opacity:1';x.appendChild(r);setTimeout(function(){r.style.transform='scale(1.5)';r.style.opacity='0'},20);setTimeout(function(){try{r.remove()}catch(e){}},520)});TAPN++;return true}
 var TAPN=0;
 function gripEnd(now){if(GRIP.m){if(GRIP.eg){wkPost('@drop');GRIP.eg=0}var tap=GRIP.m===1&&!GRIP.moved&&workOn&&now-GRIP.ts<1100&&GRIP.rel;GRIP.m=0;GRIP.rel=0;wkBoxFit();wkSave();GRIP.lock=now+(tap?350:800);gripGlow(false);
  if(tap){var fx=(GRIP.tx*100-(100-er()-WKB.w))/WKB.w,fy=(GRIP.ty*100-et())/WKB.h;gripTap(fx,fy)}}}
 function gripTrack(now,HS){
  var pin=HS.filter(function(h){return h.pinchR<(GRIP.m?.5:.32)}).map(function(h){return {x:h.px/h.ew,y:h.py/h.eh,ew:h.ew,eh:h.eh,sz:h.size}});
  if(!pin.length){if(GRIP.m){if(!GRIP.lost)GRIP.lost=now;if(now-GRIP.lost>(GRIP.m===1&&!GRIP.moved?150:250)){GRIP.lost=0;GRIP.rel=1;gripEnd(now)}}return GRIP.m||now<GRIP.lock}
  GRIP.lost=0;
  if(pin.length>=2){pin.sort(function(a,b){return a.x-b.x});var A=pin[0],B=pin[pin.length-1];
   var d=Math.sqrt(Math.pow((A.x-B.x)*A.ew,2)+Math.pow((A.y-B.y)*A.eh,2)),mx=(A.x+B.x)/2,my=(A.y+B.y)/2;
   if(GRIP.m!==2){GRIP.m=2;GRIP.d0=d;GRIP.w0=WKB.w;GRIP.h0=WKB.h;GRIP.cx0=100-WKB.r-WKB.w/2;GRIP.cy0=WKB.t+WKB.h/2;GRIP.mx0=mx;GRIP.my0=my;setWork(true);gripGlow(true);csFlash('big')}
   else if(GRIP.d0>8){var k=Math.max(.45,Math.min(3,d/GRIP.d0));WKB.w=GRIP.w0*k;WKB.h=GRIP.h0*k;var cx=GRIP.cx0+(mx-GRIP.mx0)*100,cy=GRIP.cy0+(my-GRIP.my0)*100;WKB.r=100-cx-WKB.w/2;WKB.t=cy-WKB.h/2;wkBoxFit();wkApply()}
   return true}
  var P=pin[0];
  if(GRIP.m===2){return true}  /* az egyik kéz elengedte: a másik elengedéséig nem történik semmi, nincs ugrás */
  if(GRIP.m!==1){var L=100-er()-WKB.w,R=100-er(),px=P.x*100,py=P.y*100,ET=et();
   if(workOn&&now>=GRIP.lock&&px>L-6&&px<R+6&&py>ET-6&&py<ET+WKB.h+6){GRIP.el=ELEM.on&&px>L+WKB.w*.07&&px<R-WKB.w*.07&&py>ET+WKB.h*.07&&py<ET+WKB.h-WKB.h*.04?1:0;GRIP.eg=0;GRIP.s0=P.sz||0;GRIP.sm=P.sz||0;GRIP.w0=WKB.w;GRIP.h0=WKB.h;GRIP.dep=0;GRIP.m=1;GRIP.px0=P.x;GRIP.py0=P.y;GRIP.r0=WKB.r;GRIP.t0=WKB.t;GRIP.moved=0;GRIP.ts=now;GRIP.tx=P.x;GRIP.ty=P.y;GRIP.rel=0;GRIP.ew=P.ew;GRIP.eh=P.eh;gripGlow(true)}
   return GRIP.m===1||now<GRIP.lock}
  if(P.sz&&GRIP.s0){GRIP.sm=GRIP.sm*.6+P.sz*.4;if(!GRIP.dep&&Math.abs(GRIP.sm/GRIP.s0-1)>.16){GRIP.dep=1;GRIP.moved=1;GRIP.s0=GRIP.sm;GRIP.px0=P.x;GRIP.py0=P.y;GRIP.r0=WKB.r;GRIP.t0=WKB.t;gripGlow(true);csFlash('big')}}
  if(!GRIP.moved){if(Math.sqrt(Math.pow((P.x-GRIP.px0)*P.ew,2)+Math.pow((P.y-GRIP.py0)*P.eh,2))<.045*P.ew)return true;GRIP.moved=1;gripGlow(true);csFlash('move');
   if(GRIP.el){var gx=(GRIP.tx*100-(100-er()-WKB.w))/WKB.w,gy=(GRIP.ty*100-et())/WKB.h;wkPost('@grab '+gx.toFixed(4)+' '+gy.toFixed(4));GRIP.eg=1}}
  if(GRIP.eg){wkPost('@drag '+(((P.x-GRIP.tx)*100)/WKB.w).toFixed(4)+' '+(((P.y-GRIP.ty)*100)/WKB.h).toFixed(4));return true}
  if(GRIP.dep&&GRIP.s0){var kk=Math.max(.45,Math.min(3,1+(GRIP.sm/GRIP.s0-1)*1.4));WKB.w=GRIP.w0*kk;WKB.h=GRIP.h0*kk;var cx2=100-GRIP.r0-GRIP.w0/2-(P.x-GRIP.px0)*100,cy2=GRIP.t0+GRIP.h0/2+(P.y-GRIP.py0)*100;WKB.r=100-cx2-WKB.w/2;WKB.t=cy2-WKB.h/2;wkBoxFit();wkApply();return true}
  WKB.r=GRIP.r0-(P.x-GRIP.px0)*100;WKB.t=GRIP.t0+(P.y-GRIP.py0)*100;wkBoxFit();wkApply();return true}
 var ELEM={on:false};
 function spFov(){var e=eyes[0],ew=(e&&e.clientWidth)||1,eh=(e&&e.clientHeight)||1,v=e&&e.querySelector('video');if(!v||!v.videoWidth)return {h:45,v:45*eh/ew};
  var rw=CAM.r%2?v.videoHeight:v.videoWidth,rh=CAM.r%2?v.videoWidth:v.videoHeight,sc=Math.max(ew/rw,eh/rh),dpp=66/Math.max(v.videoWidth,v.videoHeight)/sc;return {h:Math.max(15,ew*dpp),v:Math.max(12,eh*dpp)}}
 function spOnMotion(e){if(!SP.on)return;var r=e.rotationRate;if(!r)return;SP.n=(SP.n||0)+1;var iv=(e.interval||16);if(iv>2)iv=iv/1000;var f=iv>0&&iv<1?iv:.016,yr,pr;
  var a=e.accelerationIncludingGravity;
  if(a&&typeof a.x==='number'&&typeof a.y==='number'&&typeof a.z==='number'){var m=Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z)||1,u=[a.x/m,a.y/m,a.z/m];
   if(SP.up){for(var k=0;k<3;k++)SP.up[k]=SP.up[k]*.9+u[k]*.1}else SP.up=u;var U=SP.up,ul=Math.sqrt(U[0]*U[0]+U[1]*U[1]+U[2]*U[2])||1;U=[U[0]/ul,U[1]/ul,U[2]/ul];
   var wx=r.beta||0,wy=r.gamma||0,wz=r.alpha||0;yr=wx*U[0]+wy*U[1]+wz*U[2];pr=wx*U[1]-wy*U[0]}
  else{yr=r.beta||0;pr=r.gamma||0}
  SP.yaw+=yr*f*SP.sg;SP.pitch+=pr*f*SP.sg;SP.pitch=Math.max(-85,Math.min(85,SP.pitch));
  var fv=spFov(),P=360/fv.h*100,x=-(SP.yaw/fv.h*100);x=((x%P)+P)%P;if(x>P/2)x-=P;
  SP.dx=x;SP.dy=Math.max(-300,Math.min(300,SP.pitch/fv.v*100));var n=Date.now();if(n-SP.t>25){SP.t=n;wkApply()}}
 function spSet(on,flip){if(flip)SP.sg=-SP.sg;SP.on=on?1:0;SP.up=null;SP.yaw=0;SP.pitch=0;SP.dx=0;SP.dy=0;if(on&&!SP.ev){SP.ev=1;try{window.addEventListener('devicemotion',spOnMotion)}catch(e){}
   try{if(window.DeviceMotionEvent&&DeviceMotionEvent.requestPermission)DeviceMotionEvent.requestPermission().catch(function(){})}catch(e){}}
  SP.n=0;if(on)setTimeout(function(){if(SP.on&&!SP.n){try{window.DEX_UI&&window.DEX_UI.reply('Nem érkezik giroszkóp-adat a telefonról, ezért a térbe tétel nem tud működni. Ellenőrizd a böngésző beállításaiban a mozgás- és tájolásérzékelőket (Webhelybeállítások → Mozgás- vagy fényérzékelők), és hogy az oldal https címről fut.')}catch(e){}}},3500);wkApply()}

/* ---- Kéz a kép előtt: a kamerakép kéz-alakú kivágása a WORK-ablak FÖLÉ rajzolva (Tony Stark) ---- */
 var HF={on:false,raf:0,last:0,cv:[],hs:[],n:0,t:0};
 try{if(localStorage.getItem('dex_hf2')==='1')HF.on=true}catch(e){}
 var BONES=[[0,1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16],[17,18,19,20]];
 function hfDraw(){HF.raf=0;var now=Date.now(),HS=HF.hs;
  if(!HF.on||!root||!HS.length||now-HF.t>450||!workOn){hud(function(x){var c=x&&x.querySelector('.hfront');if(c)c.style.display='none'});return}
  eyes.forEach(function(e,i){var x=e.querySelector('.hud'),v=e.querySelector('video'),c=x.querySelector('.hfront');
   var ew=e.clientWidth||1,eh=e.clientHeight||1;
   if(!c){c=document.createElement('canvas');c.className='hfront';c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:5;opacity:1;filter:drop-shadow(0 .4vh 1vh #0009)';x.appendChild(c)}
   c.style.display='block';if(c.width!==ew||c.height!==eh){c.width=ew;c.height=eh}
   var g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,ew,eh);if(!v||!v.videoWidth)return;
   g.globalCompositeOperation='source-over';g.fillStyle='#fff';g.strokeStyle='#fff';g.lineCap='round';g.lineJoin='round';
   g.filter='blur('+Math.max(1.5,HS[0].size*.035)+'px)';HS.forEach(function(h){var P=h.P;if(!P)return;var w=h.size*.34;g.lineWidth=w;
    BONES.forEach(function(b,bi){g.lineWidth=bi===0?w*.95:w*(bi===2?1:.9);g.beginPath();g.moveTo(P[b[0]][0],P[b[0]][1]);for(var k=1;k<b.length;k++)g.lineTo(P[b[k]][0],P[b[k]][1]);g.stroke()});
    g.beginPath();[0,1,5,9,13,17].forEach(function(k,j){j?g.lineTo(P[k][0],P[k][1]):g.moveTo(P[k][0],P[k][1])});g.closePath();g.fill();g.lineWidth=w*1.1;g.stroke()});g.filter='none';
   g.globalCompositeOperation='source-in';
   var vw=v.videoWidth,vh=v.videoHeight,odd=CAM.r%2===1,bw=odd?eh:ew,bh=odd?ew:eh,sc=Math.max(bw/vw,bh/vh);g.save();g.translate(ew/2,eh/2);g.rotate(CAM.r*Math.PI/2);if(CAM.m)g.scale(-1,1);g.drawImage(v,-vw*sc/2,-vh*sc/2,vw*sc,vh*sc);g.restore();
   g.globalCompositeOperation='source-over'});
  HF.n++;HF.raf=requestAnimationFrame(hfDraw)}
 function hudVis(){var c=root&&root.querySelectorAll('.hfront');return c?[].filter.call(c,function(q){return q.style.display==='block'}).length:0}
 function hfFeed(HS){HF.hs=(HS||[]).filter(function(h){return h&&h.P});if(HF.hs.length){HF.t=Date.now();if(!HF.raf&&HF.on)HF.raf=requestAnimationFrame(hfDraw)}}
 var HOV=0;
 function hovCheck(HS){var on=0;if(workOn&&HS&&HS.length){var L=100-er()-WKB.w,R=100-er(),T=et(),B=T+WKB.h;HS.forEach(function(h){[[h.tx,h.ty],[h.x,h.y]].forEach(function(p){var px=p[0]/h.ew*100,py=p[1]/h.eh*100;if(px>L&&px<R&&py>T&&py<B)on=1})})}
  if(on!==HOV){HOV=on;hud(function(x){var w=x&&x.querySelector('.wk');if(w)w.classList.toggle('hov',!!on)})}}
 function hfSet(on){HF.on=!!on;try{localStorage.setItem('dex_hf2',on?'1':'0')}catch(e){}if(on){if(HF.hs.length&&!HF.raf)HF.raf=requestAnimationFrame(hfDraw)}else hud(function(x){var c=x&&x.querySelector('.hfront');if(c)c.style.display='none'});return on}
 /* Látható visszajelzés: pont a kezeden (cián = nyitott, sárga = csipesz). Ha a pont megjelenik, a rendszer lát. */
 function handDots(HS){
  hud(function(x){if(!x)return;var c=x.querySelector('.hdots');
   if(!HS||!HS.length){if(c)c.style.display='none';return}
   if(!c){c=document.createElement('div');c.className='hdots';c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:6';x.appendChild(c)}
   c.style.display='block';while(c.children.length<2){var d=document.createElement('i');d.style.cssText='position:absolute;width:4.2vh;height:4.2vh;margin:-2.1vh 0 0 -2.1vh;border-radius:50%;border:.5vh solid #8ce7ff;background:#8ce7ff33;box-shadow:0 0 2vh #8ce7ffaa;transition:background .08s';c.appendChild(d)}
   for(var i=0;i<2;i++){var d2=c.children[i],h=HS[i];if(!h){d2.style.display='none';continue}d2.style.display='block';var pin=h.pinchR<.5;d2.style.left=((pin?h.px:h.tx)/h.ew*100)+'%';d2.style.top=((pin?h.py:h.ty)/h.eh*100)+'%';d2.style.borderColor=pin?'#ffe27a':'#8ce7ff';d2.style.background=pin?'#ffe27acc':'#8ce7ff33'}})}
 function handStatus(){
  var er={net:'a ./mp/ mappa (kézmodell) nem tölthető be – a GitHubra az mp mappát is fel kell tölteni az index.html mellé',init:'a böngésző nem tudta elindítani a modellt (a WebAssembly SIMD hiányzik vagy kevés a memória)',ctor:'a kézmodell nem indult el',timeout:'a modell betöltése túl sokáig tartott'};
  if(!GES.on)return 'A kézvezérlés most ki van kapcsolva. Mondd: kézkövetés be.';
  if(HD.err)return 'A pontos kézkövetés nem működik: '+(er[HD.err]||HD.err)+'. Addig csak egyszerű mozgásérzékelés megy, csipesz nincs. Mondd: kézkövetés újra, ha próbáljam újra.';
  if(HD.loading||!HD.eng)return 'A kézmodell még töltődik (az első indításnál pár másodperc, ~12 MB). Ha sokáig tart, mondd: kézkövetés újra.';
  var ago=HD.seenT?Math.round((Date.now()-HD.seenT)/1000):-1;
  if(!HD.seen)return 'A kézmodell betöltött és fut ('+(HD.frames||0)+' képkockát dolgozott fel), de még egyszer sem láttam kezet. Tartsd a kezed a kép közepére, 20–40 cm-re, nyitott tenyérrel, jó fényben, és ne takarja a kamerát semmi.';
  return 'A kézkövetés működik, utoljára '+(ago<=1?'épp most':ago+' másodperce')+' láttam kezet. A csipesz: érintsd össze a hüvelyk- és mutatóujjad a WORK-ablak fölött; ilyenkor a pont sárga lesz.'}
 function handForce(again){
  GES.on=true;GES.samples=[];if(!workOn&&window.DEX_VR)try{setWork(true)}catch(e){}
  if(again||HD.err){HD.err='';HD.eng=null;HD.loading=false;HD.mode='';HD.seen=0;HD.frames=0;HD.busy=false;window.Hands=undefined}
  try{dnLoadMP()}catch(e){}CS.on=true;csRender();
  setTimeout(function(){try{window.DEX_UI&&window.DEX_UI.reply(handStatus())}catch(e){}},4500);
  return (HD.eng?'A kézkövetés be van kapcsolva.':'Elindítom a kézkövetést, töltöm a kézmodellt.')+' Ha a kezed látom, egy pont jelenik meg rajta: cián, ha nyitott, sárga, ha csipeszben van. Pár másodperc múlva elmondom, hogyan megy.'}
 function trackHand(now){
  var mgOn=!!(MG&&MG.state==='play'&&!MG.paused);if((!mgOn&&(!GES.on||!workOn))||U||G||M||RIDE||DN||now<GES.lock){if(GRIP.m)gripEnd(now);if(GES.dots){GES.dots=0;handDots(null);hfFeed([]);hovCheck([])}return}
  /* 1) pontos kézkövetés (MediaPipe, a kéz 21 pontja) – ez az elsődleges; közben a modell betöltődik */
  if(!mgOn&&(HD.mode==='mp'||typeof window.__handLm==='function'||typeof window.__handsLm==='function')){var hh=dnHand();
   var HS=handsList(now);GES.dots=1;handDots(HS);hfFeed(HS);hovCheck(HS);var gr0=gripTrack(now,HS);if(gr0){GES.samples=[];return}
   if(typeof window.__handsLm==='function'&&HS.length)hh=HS[0];
   if(!hh){if(GES.samples.length&&now-GES.samples[GES.samples.length-1].t>280)GES.samples=[];return}
   GES.hand=now;GES.samples.push({x:hh.x,y:hh.y,t:now,sz:hh.size});GES.samples=GES.samples.filter(function(p){return now-p.t<900});
   if(now-GES.last<900||GES.samples.length<3)return;
   var a0=GES.samples[0],b0=GES.samples[GES.samples.length-1],ddx=b0.x-a0.x,ddy=b0.y-a0.y,sp=b0.t-a0.t,aax=Math.abs(ddx),aay=Math.abs(ddy),hs=Math.max(8,b0.sz||a0.sz||40); /* képpontban, a tenyér méretéhez mérve: a kijelző kivágása nem torzít */
   if(sp<110||sp>820||Math.max(aax,aay)<2*hs||Math.max(aax,aay)<1.5*Math.min(aax,aay))return;
   GES.last=now;GES.samples=[];GES.seen++;gesDo(aax>aay?(ddx>0?'right':'left'):(ddy>0?'down':'up'));return}
  if(!mgOn&&GES.on&&HD.mode===''&&!HD.eng&&!HD.loading&&!HD.err&&workOn&&now-(GES.mpTry||0)>5000){GES.mpTry=now;try{dnLoadMP()}catch(e){}}
  /* 2) tartalék: képkülönbség (amíg a kézmodell nem töltődött be, vagy ha nem érhető el) */
  var gr=typeof window.__gesGrid==='function'?window.__gesGrid():motionGrid();if(!gr){return}
  if(gr.frac>.2){GES.samples=[];GES.lock=now+600;return}               /* fejmozgás / kameraremegés: minden a képen mozog → nem kéz */
  if(gr.frac<.006||gr.x<.05||gr.x>.95||gr.y<.06||gr.y>.94){if(GES.samples.length&&now-GES.samples[GES.samples.length-1].t>350)GES.samples=[];return}
  GES.samples.push({x:gr.x,y:gr.y,t:now});GES.samples=GES.samples.filter(function(p){return now-p.t<900});
  if(now-GES.last<1000||GES.samples.length<4)return;
  var a=GES.samples[0],b=GES.samples[GES.samples.length-1],dx=b.x-a.x,dy=b.y-a.y,span=b.t-a.t,ax=Math.abs(dx),ay=Math.abs(dy);
  if(span<180||span>850||Math.max(ax,ay)<.11||Math.max(ax,ay)<1.6*Math.min(ax,ay))return;
  GES.last=now;GES.samples=[];GES.seen++;
  gesDo(ax>ay?(dx>0?'right':'left'):(dy>0?'down':'up'))}
 var WKW=/\b(?:work|vork|vurk|wurk|verk|woerk|word)\w{0,5}\b|\bwebshop\w*|\bwebaruhaz\w*|\bshopot\b|\bshopp?\b/;
 function wkBoxFit(){WKB.w=Math.max(24,Math.min(96,WKB.w));WKB.h=Math.max(40,Math.min(94,WKB.h));WKB.r=Math.max(0,Math.min(100-WKB.w,WKB.r));WKB.t=Math.max(0,Math.min(100-WKB.h,WKB.t))}
 function wkBoxDone(fl,msg){wkBoxFit();setWork(true);wkApply();wkSave();csFlash(fl);return msg}
 function wkBoxCmd(f){
  /* a WORK-ablak mérete/helye. Mondhatod névvel (work, vörköt, webshop) vagy, ha a WORK kint van, „az ablakot”. */
  if(workOn&&/\b(rogzit\w*|mentsd el|mentsd|maradjon igy|igy maradjon|tartsd igy|igy jo|igy marad)\b/.test(f)){wkBoxFit();wkSave();csFlash('move');return 'Rögzítettem a WORK-ablak helyét és méretét. Így marad, akkor is, ha elengeded, vagy újraindítod a DEX-et. Az „alaphelyzet” visszaállítja.'}
  if(!(WKW.test(f)||(workOn&&(/\b(ablak\w*|kijelzo\w*|felulet\w*)\b/.test(f)||/^(?:(?:egy )?kicsit |meg |kerlek )*(szelesebb|keskenyebb|magasabb|alacsonyabb|tagabb|szukebb)\b/.test(f)||/\b(nagyit\w*|nagyitot|nagyobb\w*|kozelit\w*|zoomol\w*|kicsinyit\w*|kisebb\w*|tavolit\w*)\b/.test(f)||/\b(told\w*|tolj\w*|mozdit\w*|mozgasd|vidd|huzd\w*|csusztasd)\b.*\b(balra|jobbra|feljebb|lejjebb|fel|le)\b/.test(f)))))return null;
  var mv=/\b(told\w*|tolj\w*|mozdit\w*|mozgasd|mozgass\w*|vidd|vigyed|tedd|rakd|rakjad|huzd\w*|csusztasd|lepj)\b/.test(f);
  if(/\b(alaphelyzet\w*|eredeti\w*|visszaall\w*|normal meret|normalis meret)\b/.test(f)){WKB={r:WKB0.r,t:WKB0.t,w:WKB0.w,h:WKB0.h};return wkBoxDone('reset','Visszaállítottam a WORK-ablak helyét és méretét.')}
  if(/\b(kozepre|kozepen|kozepere|kozepet|kozeprol|kozepebe)\b/.test(f)){WKB.r=Math.round((100-WKB.w)/2);WKB.t=Math.round((100-WKB.h)/2);return wkBoxDone('mid','A WORK-ablak középen van.')}
  if(/\b(teljes\w*|egesz kepernyo\w*|kepernyo(?:t|re)? kitolt\w*|kitolt\w*|toltsd ki|kitoltse|maximum\w*|maxra|legnagyobb\w*|full\b)/.test(f)){WKB.w=96;WKB.h=94;WKB.r=2;WKB.t=3;return wkBoxDone('big','A WORK-ablak most kitölti a képet.')}
  var dir=/\b(balra|bal)\b/.test(f)?'l':/\b(jobbra|jobb)\b/.test(f)?'r':/\b(feljebb|fel|folfele|felfele|fentebb|fennebb|foljebb)\b/.test(f)?'u':/\b(lejjebb|le|lefele|lentebb)\b/.test(f)?'d':'';
  var grow=/\b(nagyobb\w*|nagyit\w*|nagyitot|megnagyit\w*|kozelit\w*|zoomol\w*|noveld|novel\w*|megnoveld|bovits\w*|bovebb\w*|tagit\w*|tagabb\w*)\b/.test(f),
      shrink=/\b(kisebb\w*|kicsinyit\w*|kicsit\w*kisebb|tavolit\w*|zoomolj ki|csokkent\w*|szukit\w*|megszukit\w*|apro\w*|zsugorit\w*)\b/.test(f)&&!/\b(szelesebb\w*|keskenyebb)\b/.test(f),
      wide=/\b(szeles\w*|kiszeles\w*|szelesit\w*|szelesre|oldalra nyujt\w*|tagulj\w*|kiterj\w*|kihuz\w*)\b/.test(f),
      narrow=/\b(keskeny\w*|szukebb\w*|osszebb|osszehuz\w*|keskenyit\w*|keskenyre)\b/.test(f),
      tall=/\b(magasabb\w*|magasit\w*|hosszabb\w*|magasra|nyujtsd fel|fuggolegesen nagyobb\w*)\b/.test(f),
      low=/\b(alacsonyabb\w*|alacsonyit\w*|laposabb\w*|laposit\w*|alacsonyra|rovidebb\w*)\b/.test(f);
  if(wide&&!narrow){WKB.w+=12;WKB.r-=6;return wkBoxDone('big','Szélesebb lett a WORK-ablak.')}
  if(narrow){WKB.w-=12;WKB.r+=6;return wkBoxDone('small','Keskenyebb lett a WORK-ablak.')}
  if(tall&&!low){WKB.h+=8;WKB.t-=4;return wkBoxDone('big','Magasabb lett a WORK-ablak.')}
  if(low){WKB.h-=8;WKB.t+=4;return wkBoxDone('small','Alacsonyabb lett a WORK-ablak.')}
  if(grow&&!shrink){WKB.w+=10;WKB.h+=6;WKB.r-=5;WKB.t-=3;return wkBoxDone('big','Nagyobb lett a WORK-ablak.')}
  if(shrink){WKB.w-=10;WKB.h-=6;WKB.r+=5;WKB.t+=3;return wkBoxDone('small','Kisebb lett a WORK-ablak.')}
  if(dir&&(mv||/\b(odebb|arrebb|arrabb)\b/.test(f))){
   if(dir==='l'){WKB.r+=8}else if(dir==='r'){WKB.r-=8}else if(dir==='u'){WKB.t-=6}else{WKB.t+=6}
   return wkBoxDone('move',{l:'Balra',r:'Jobbra',u:'Feljebb',d:'Lejjebb'}[dir]+' toltam a WORK-ablakot.')}
  return null}
 /* ---- Fénykép a nézetről: kamerakép + WORK-ablak + kéz, letöltésként mentve ---- */
 function shotWorkImg(cb){var fr=root&&root.querySelector('.wk iframe');if(!fr||!workOn){cb(null);return}
  try{var doc=fr.contentDocument,W=fr.offsetWidth||1,Hh=fr.offsetHeight||1,css='';
   [].forEach.call(doc.styleSheets,function(ss){try{[].forEach.call(ss.cssRules,function(r){css+=r.cssText+'\n'})}catch(e){}});
   var sy=(fr.contentWindow.pageYOffset||0),imgs=[].slice.call(doc.images),map=new Map();
   imgs.forEach(function(im){try{if(!im.complete||!im.naturalWidth)return;var c=document.createElement('canvas');c.width=Math.min(im.naturalWidth,420);c.height=Math.round(c.width*im.naturalHeight/im.naturalWidth);c.getContext('2d').drawImage(im,0,0,c.width,c.height);map.set(im,c.toDataURL('image/jpeg',.7))}catch(e){}});
   var cl=doc.documentElement.cloneNode(true);[].forEach.call(cl.querySelectorAll('script,iframe,video,audio,link,noscript'),function(n){n.remove()});
   var oi=[].slice.call(doc.querySelectorAll('img')),ci=[].slice.call(cl.querySelectorAll('img'));oi.forEach(function(im,i){var u=map.get(im);if(ci[i]){if(u){ci[i].setAttribute('src',u);ci[i].removeAttribute('srcset')}else ci[i].removeAttribute('src')}});
   var st=document.createElement('style');st.textContent=css+'html,body{margin:0}';var hd=cl.querySelector('head')||cl;hd.appendChild(st);
   var bd=cl.querySelector('body');if(bd){bd.style.transform='translateY('+(-sy)+'px)'}
   cl.style.width=W+'px';cl.style.height=Hh+'px';cl.style.overflow='hidden';
   var xml=new XMLSerializer().serializeToString(cl);
   var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+Hh+'"><foreignObject x="0" y="0" width="'+W+'" height="'+Hh+'">'+xml+'</foreignObject></svg>';
   var im=new Image();im.onload=function(){cb(im)};im.onerror=function(){cb(null)};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);setTimeout(function(){if(!im.complete)cb(null)},7000)}catch(e){cb(null)}}
 function shotMake(cb){var e=eyes[0];if(!e){cb(null);return}var ew=e.clientWidth||0,eh=e.clientHeight||0,v=e.querySelector('video');if(!ew||!eh){cb(null);return}
  var c=document.createElement('canvas');c.width=ew;c.height=eh;var g=c.getContext('2d');g.fillStyle='#050b22';g.fillRect(0,0,ew,eh);
  if(v&&v.videoWidth&&!root.classList.contains('nocam')){var odd=CAM.r%2===1,bw=odd?eh:ew,bh=odd?ew:eh,sc=Math.max(bw/v.videoWidth,bh/v.videoHeight);g.save();g.translate(ew/2,eh/2);g.rotate(CAM.r*Math.PI/2);if(CAM.m)g.scale(-1,1);try{g.drawImage(v,-v.videoWidth*sc/2,-v.videoHeight*sc/2,v.videoWidth*sc,v.videoHeight*sc)}catch(x){}g.restore()}
  var hc=null,hf=e.querySelector('.hfront');if(hf&&hf.style.display!=='none'){hc=document.createElement('canvas');hc.width=ew;hc.height=eh;hc.getContext('2d').drawImage(hf,0,0)}
  var bx=(100-er()-WKB.w)/100*ew,by=et()/100*eh,bww=WKB.w/100*ew,bhh=WKB.h/100*eh,wasWork=workOn;
  shotWorkImg(function(wi){if(wi&&wasWork){g.save();g.beginPath();if(g.roundRect)g.roundRect(bx,by,bww,bhh,eh*.02);else g.rect(bx,by,bww,bhh);g.clip();g.fillStyle='rgba(6,20,42,.18)';g.fillRect(bx,by,bww,bhh);g.globalAlpha=.97;g.drawImage(wi,bx,by,bww,bhh);g.restore();g.strokeStyle='rgba(140,231,255,.55)';g.lineWidth=2;g.strokeRect(bx,by,bww,bhh)}
   if(hc)g.drawImage(hc,0,0);cb(c,!!wi)})}
 function shotFlash(){hud(function(x){var f=document.createElement('div');f.style.cssText='position:absolute;inset:0;background:#fff;opacity:.85;pointer-events:none;z-index:9;transition:opacity .5s';x.appendChild(f);setTimeout(function(){f.style.opacity='0'},40);setTimeout(function(){try{f.remove()}catch(e){}},600)})}
 function shotSave(){shotFlash();shotMake(function(c,hasWork){if(!c){try{window.DEX_UI&&window.DEX_UI.reply('Nem sikerült képet készíteni, nincs kamerakép.')}catch(e){}return}
  c.toBlob(function(b){if(!b)return;var a=document.createElement('a'),n=new Date(),p=function(x){return (x<10?'0':'')+x};a.download='WDEA_VR_'+n.getFullYear()+p(n.getMonth()+1)+p(n.getDate())+'_'+p(n.getHours())+p(n.getMinutes())+p(n.getSeconds())+'.png';a.href=URL.createObjectURL(b);document.body.appendChild(a);a.click();SHOT.n++;SHOT.last=b.size;SHOT.work=!!hasWork;setTimeout(function(){try{a.remove();URL.revokeObjectURL(a.href)}catch(e){}},3000);
   try{window.DEX_UI&&window.DEX_UI.reply('Lefényképeztem, és mentettem a Letöltések közé'+(hasWork?'':' (a WORK-ablak tartalma nélkül, mert azt nem tudtam lerajzolni)')+'.')}catch(e){}},'image/png')})}
 var SHOT={n:0,last:0,work:false};
 function shotCmd(f){if(/\b(screenshot\w*|skrinsot\w*|szkrinsot\w*|kepernyokep\w*|kepernyofoto\w*|fenykepezd\w*|fotozd\w*|fotozz\w*|keszits\w* (egy )?(kepet|fotot|screenshotot)|kepet? rolam|mentsd el a kepet)\b/.test(f)&&f.split(' ').length<=7&&!/\b(fenykepezz|fotozz)\b/.test(f)){setTimeout(shotSave,200);return 'Fényképezek. A kép pár másodperc múlva mentődik a Letöltések közé.'}return null}
 function spaceCmd(f){
  var n=f.split(' ').length;
  var place=/^(?:(?:tedd|tegyed|tegyel|rakd|rakjad|engedd|hagyd|helyezd)(?: (?:le|oda|ott|itt|ide|el|ezt|a terbe|a terben|az asztalra|az ablakot|a workot|a vorkot))*|(?:marad(?:j|jon)|lebegj|lebegjen) (?:ott|itt|a terben)|(?:ott|itt) marad|(?:tedd|tegyed|rakd) (?:le )?(?:a )?(?:terbe|terben|asztalra|levegobe|levegoben)|terbe tedd|terben hagyd|(?:rogzitsd|rogzitse|rogzits) (?:a )?(?:terben|terbe))$/;
  var inSpace=/\b(terben|terbe|asztalra|levegoben|levegobe|terrogzit\w*)\b/.test(f);
  if(n<=7&&place.test(f)&&!/\b(ki|vedd fel)\b/.test(f)&&(workOn||inSpace)){if(!workOn)try{setWork(true)}catch(e){}spSet(true,false);return 'Letettem a térbe: a WORK-ablak ott marad, ahol hagytad, akkor is, ha elfordítod a fejed. Ha ellenkező irányba megy, mondd: tér fordítva. Felvétel: vedd fel az ablakot.'}
  if(/\b(ter|terrogzit\w*|terben|terre?gzit\w*)\b/.test(f)&&/\b(fordit\w*|fordva)\b/.test(f)&&n<=5){spSet(true,true);return 'Megfordítottam a tér irányát.'}
  if(/\b(vedd fel|vedd le|szedd le|oldd fel|terrogzites ki|terrogzit\w* ki|terben ki|ne maradjon (a )?terben)\b/.test(f)&&/\b(ablak\w*|work\w*|vork\w*|terrogzit\w*|ter)\b/.test(f)&&n<=6){spSet(false,false);return 'Felvettem: az ablak újra a nézeteddel együtt mozog.'}
  return null}
 function verCmd(f){if(/\b(verzio\w*|melyik verzio\w*|milyen verzio\w*)\b/.test(f)&&f.split(' ').length<=5)return 'A VR-rész verziója: '+VRVER+'.';return null}
 var VRVER='v46.1';
 function stripCmd(f){
  var spr=spaceCmd(f)||verCmd(f);if(spr)return spr
  /* elemenkénti mozgatás */
  if(/\b(elemenkent|elem\w*|kartya\w*|gomb\w*)/.test(f)&&(/\b(mozg\w*|huz\w*|kulon\w*|nyujt\w*|fogd\w*)/.test(f)||/\b(alaphelyzet\w*|visszarak\w*)\b/.test(f))&&f.split(' ').length<=7){
   if(/\b(alaphelyzet\w*|visszarak\w*|vissza)\b/.test(f)){wkPost('@dropall');return 'Visszaraktam az elemeket a helyükre.'}
   if(/\b(ki|kikapcs\w*|ablak)\b/.test(f)&&!/\bbe\b/.test(f)){ELEM.on=false;return 'Elem-mozgatás ki: a csipesz újra az egész ablakot viszi.'}
   ELEM.on=true;return 'Elem-mozgatás be: csípd meg és húzd az ablakban azt a kártyát vagy elemet, amit mozgatni akarsz. Az ablak szélét megfogva az egész ablakot viszed. Rövid koppintás továbbra is kattint. Kikapcsolás: elem mozgatás ki.'}
  /* fénykép a nézetről */
  var shr=shotCmd(f);if(shr)return shr
  /* kamerakép forgatása / tükrözése */
  if(/\b(kamer\w*|kepet|kameraker\w*|kep)\b/.test(f)&&f.split(' ').length<=7){
   if(/\b(alaphelyzet\w*|alapra|visszaall\w*|reset\w*|eredeti\w*)\b/.test(f)&&/\bkamer\w*/.test(f)){try{localStorage.removeItem('dex_cam_'+camMode())}catch(e){}camLoad();camApply();return 'Visszaállítottam a kamerakép alapállását. '+camSay()}
   if(/\b(tukroz\w*|tukor\w*)\b/.test(f)&&/\bkamer\w*/.test(f)){camSet(CAM.r,!CAM.m);return camSay()}
   if(/\b(forgas\w*|fordit\w*|elforgat\w*|elfordit\w*|forditsd\w*|forgat\w*)\b/.test(f)&&/\bkamer\w*/.test(f)){var ccw=/\b(balra|vissza|ellenkezo\w*)\b/.test(f);camSet(CAM.r+(ccw?3:1),CAM.m);return camSay()}}
  /* kéz a kép előtt: be / ki */
  if(/\b(kez\w*)\b/.test(f)&&/\b(kep elott|kep fole|elotte|elol|elore|eloterbe|elohuz\w*|kivag\w*|kiemel\w*|tony stark|jarvis)\b/.test(f)&&f.split(' ').length<=8&&!/\b(kezkovet\w*)\b/.test(f)){
   if(/\b(ki|kikapcs\w*|vege|nem kell|el)\b/.test(f)&&!/\b(be|kapcsold be|inditsd)\b/.test(f)){hfSet(false);return 'Kikapcsoltam a kéz kiemelését.'}
   hfSet(true);GES.on=true;if(!workOn)try{setWork(true)}catch(e){}try{dnLoadMP()}catch(e){}return 'Bekapcsoltam: a kezed kivágva a WORK-ablak előtt lebeg. Koppints a hüvelyk- és mutatóujjaddal (rövid csipesz) a WORK-ablak fölött, és rákattintok arra, ami az ujjad alatt van. Ha tartod és húzod, viszed az ablakot.'}
  /* kézkövetés: be / ki / újra / állapot */
  if(/\b(kezkovet\w*|kezfelismer\w*|kez ?teszt\w*|kezet figyel\w*|kezet kovess\w*|kovesd a kezem\w*)\b/.test(f)&&f.split(' ').length<=7){
   if(/\b(ki|kikapcs\w*|leall\w*|vege|nem kell)\b/.test(f)&&!/\b(be|inditsd|ujra)\b/.test(f)){GES.on=false;GES.samples=[];handDots(null);return 'Kikapcsoltam a kézkövetést.'}
   if(/\b(allapot\w*|miert|mi a helyzet|mukodik|hogy all|hogyan megy|mi van vele)\b/.test(f)&&!/\b(be|inditsd|ujra)\b/.test(f))return handStatus();
   return handForce(/\b(ujra\w*|inditsd ujra|frissit\w*|ujrainditas)\b/.test(f))}
  /* gesztus / kézvezérlés */
  if(/\b(gesztus\w*|gombos|gombos mod|kezvezerl\w*|kez mod|kezmozdulat\w*|kezzel iranyit\w*|kezes mod)\b/.test(f)&&f.split(' ').length<=6){
   var off=/\b(ki|kikapcs\w*|vege|leall\w*|nem kell|megse|tiltsd)\b/.test(f);
   GES.on=!off;GES.samples=[];GES.last=Date.now();if(!off)CS.on=true;csRender();csFlash('ges');
   return off?'Kikapcsoltam a gesztusvezérlést.':'Gesztusvezérlés bekapcsolva. Mozdítsd a kezed a kamera előtt: fel, le, balra, jobbra – ahogy a WORK-et lapozza. A WORK-ablakot két ujjal megcsípve elmozgathatod, két kézzel csípve és széthúzva nagyíthatod. A szalagon látod a parancsokat.'}
  /* irányító szalag */
  if(/\b(iranyito\w*|szalag\w*|kezelopult|vezerlopult|parancsok|sugo)\b/.test(f)&&!/\bwork\w*\b/.test(f)){
   if(/\b(tovabb|kovetkezo\w*|masik|lapozz)\b/.test(f)&&CS.on){CS.page=(CS.page+1)%CSP.length;csRender();csFlash('next');return 'Következő lap: '+CSP[CS.page].t+'.'}
   if(/\b(elozo\w*)\b/.test(f)&&CS.on){CS.page=(CS.page+CSP.length-1)%CSP.length;csRender();return 'Előző lap: '+CSP[CS.page].t+'.'}
   if(/\b(el|ki|vissza|rejts\w*|tuntes\w*|zar\w*|bezar\w*|vege)\b/.test(f)&&!/\b(mutas\w*|tedd|tegy\w*|rakd|hozd|nyis\w*|kinyit\w*)\b/.test(f)){csSet(false);return 'Elrejtettem az irányító szalagot.'}
   CS.page=0;csSet(true);return 'Kitettem az irányító szalagot. Lapozás: „szalag tovább”, elrejtés: „szalag el”.'}
  return null}
 function regionMotion(gr,x0,y0,x1,y1){var a=e2v(x0,y0),b=e2v(x1,y1);if(!a||!b)return 0;var gx0=Math.floor(Math.min(a[0],b[0])*64),gx1=Math.ceil(Math.max(a[0],b[0])*64),gy0=Math.floor(Math.min(a[1],b[1])*36),gy1=Math.ceil(Math.max(a[1],b[1])*36),c=0,t=0,x,y;
  for(y=Math.max(0,gy0);y<Math.min(36,gy1);y++)for(x=Math.max(0,gx0);x<Math.min(64,gx1);x++){t++;c+=gr.d[y*64+x]}return t?c/t:0}
 function uStep(dt){if(!U)return;var now=Date.now();
  if(U.paused)return;
  if(U.state==='intro'){var sp=false;try{sp=!!(window.DEX_SPEAKING&&window.DEX_SPEAKING())}catch(e){}if(sp)U.heard=true;
   if((U.heard&&!sp)||(!U.heard&&now-U.t0>6500)||!U.say){U.state='ready';U.cd=3;uBar()}return}
  if(U.state==='ready'){U.cd-=dt;if(U.cd<=-.7){U.state='play';U.sp=0;uBar()}else uBar();return}
  if(U.state!=='play')return;
  U.sp-=dt;if(U.sp<=0){var r=Math.random(),ty='n';if(U.lvl>=2&&r<.18)ty='h';if(U.lvl>=2&&r>=.18&&r<.34)ty='f';if(U.lvl>=2&&r>=.34&&r<.44)ty='b';if(r>.94)ty='g';if(U.lvl===1&&U.ko>=3&&r<.2)ty='h';uSpawn(ty);U.sp=Math.max(.8,2.5-.17*U.lvl)*(.75+Math.random()*.5)}
  var base=.17+.012*U.lvl;
  U.figs.slice().forEach(function(f){if(f.down)return;f.z+=dt*base*f.sp;uPlace(f);
   if(f.z>=1){f.down=true;var d=UTY[f.type];setTimeout(function(){uKill(f)},50);U.figs.splice(U.figs.indexOf(f),1);
    if(!d.bomb&&f.type!=='g'){U.lives--;U.combo=0;uBeep(110,.3,.08);uVib([80,40,80]);hud(function(x){var u=x.querySelector('.ug');if(u){u.classList.add('hurt');setTimeout(function(){u.classList.remove('hurt')},350)}});uBar();if(U.lives<=0)uOver()}}});
  U.figs=U.figs.filter(function(f){return !f.down||now-f.last<1500});
  /* kézmozdulat a kamera előtt */
  if(now-(U.lm||0)>90){U.lm=now;var gr=typeof window.__uGrid==='function'?window.__uGrid():motionGrid(),ew=eyes[0]?eyes[0].clientWidth||1:1,eh=eyes[0]?eyes[0].clientHeight||1:1;
   U.figs.forEach(function(f){if(f.down||f.z<.5||now-f.last<450)return;var ok=false;
    if(typeof window.__uMotion==='function')ok=!!window.__uMotion(f);
    else if(gr&&gr.frac<.22){var H=(14+58*f.z)/100,W=H*.62*eh/ew,y1=1-f.b/100,y0=y1-H,rm=regionMotion(gr,f.x-W/2,y0,f.x+W/2,y1),rest=Math.max(0,gr.frac-rm*H*W)/Math.max(.2,1-H*W);ok=rm>=.22&&rm>=2.4*rest;f.mc=ok?(f.mc||0)+1:0;ok=ok&&f.mc>=2;if(ok){f.mc=0;ok=(now-(U.lh||0)>320);if(ok)U.lh=now}}else{U.figs.forEach(function(q){q.mc=0})}
    if(ok)uHit(f)})}}
 function uTick(){var n=Date.now(),dt=Math.min(.25,(n-(U?U.lt:n))/1000);if(U){U.lt=n;uStep(dt)}}
 function uStop(){if(UT){clearInterval(UT);UT=null}if(U){U.figs.forEach(uKill);U=null}hud(function(x){var u=x.querySelector('.ug');if(u){u.classList.remove('on');u.innerHTML='<div class="bar"></div><div class="big"></div>'}});prevFrame=null;if(root)root.classList.remove('u')}
 function uStart(){G=null;skRender();mgStop();dnStop();uStop();root.classList.add('u');
  hud(function(x){var u=x.querySelector('.ug');if(u){u.innerHTML='<div class="bar"></div><div class="big"></div>';u.classList.add('on')}});
  var say=!introSaid;introSaid=true;
  U={id:'utos',state:'intro',figs:[],lives:3,score:0,ko:0,lvl:1,combo:0,paused:false,t0:Date.now(),lt:Date.now(),heard:false,say:say,cd:3,sp:0};
  UT=setInterval(uTick,40);uBar();
  return say?'Ütős blokkok! Kis blokk-figurák jönnek feléd. Üss feléjük a kezeddel, vagy mondd: üss, és elesnek. Ne engedd, hogy hozzád érjenek: három életed van. A piros bombát ne üsd meg, az arany figura plusz élet. Ha meg akarsz állítani, mondd: állj.':'Ütős blokkok, készülj!'}
 function uCmd(f){
  if(!U)return null;
  if(/\b(vege|kilep\w*|hagyjuk|kiszall\w*)\b.*\b(jatek\w*|utos|blokk\w*)\b|\b(utos|blokk\w*)\b.*\b(vege|ki|kilep\w*)\b/.test(f)&&!/\b(vr)\b/.test(f)){uStop();return 'Kiléptem az Ütős blokkokból.'}
  if(/\b(szabaly\w*|hogyan kell|mi a lenyeg|magyarazd\w*|mondd el)\b/.test(f))return 'Ütős blokkok: blokk-figurák jönnek feléd, üss feléjük a kezeddel vagy mondd: üss. Három életed van, a piros bombát ne üsd meg, az arany figura plusz élet. Szünet: állj.';
  if(/\b(meg egyszer|ujra|uj jatek|kovetkezo jatek|ujrakezd\w*)\b/.test(f)&&(U.state==='over'||/\bjatek\b/.test(f)))return uStart();
  if(/^(allj|stop|szunet|varj|megallj|pihenj|pillanat)$/.test(f)&&(U.state==='play'||U.state==='ready')){if(!U.paused){U.paused=true;U.pa=Date.now();uBar()}return 'Szünet. Ha folytatjuk, mondd: folytasd.'}
  if(/\b(folytasd|folytassuk|mehet|tovabb)\b/.test(f)&&U.paused){U.paused=false;U.mp=false;U.lt=Date.now();uBar();return 'Folytatjuk.'}
  if(U.paused)return null;
  if(/\b(uss|utes\w*|utom|ut|bumm|bum|bam|nyomd|nyomas|csap\w*|pofozd|kapd|rajta|ki vele)\b/.test(f)&&f.split(' ').length<=4){if(U.state==='play'){var t=uNearest();if(t)uHit(t)}return ''}
  if(U.state==='play'&&!/\b(vr|work\w*|jatek\w*|menu|cseveges\w*|chat|kijelzo\w*|kepernyo\w*|vege|ki|kilep\w*)\b/.test(f))return '';
  return null}

 /* ---- CSILLAGVASÚT: áttetsző, kameraképre rajzolt, hanggal irányítható mini-játék ---- */
 var RIDE=null,RIDE_FRAME=0;
 function rideStatus(msg){hud(function(x){var e=x.querySelector('.ride-hud span');if(e)e.textContent=msg||''})}
 function rideDraw(ts){if(!RIDE)return;RIDE_FRAME=requestAnimationFrame(rideDraw);var dpr=Math.min(2,window.devicePixelRatio||1);
  eyes.forEach(function(eye,idx){var c=eye.querySelector('.ride-scene');if(!c)return;var w=eye.clientWidth,h=eye.clientHeight;if(!w||!h)return;
   var W=Math.round(w*dpr),H=Math.round(h*dpr);if(c.width!==W||c.height!==H){c.width=W;c.height=H}var q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,0,0);q.clearRect(0,0,w,h);
   var cx=w*.5+(idx?1:-1)*w*.007, horizon=h*.39, t=ts*.001, lane=RIDE.lane, pulse=(Math.sin(t*2)+1)/2;
   // A restrained translucent dusk tint preserves the real camera image.
   var shade=q.createLinearGradient(0,0,0,h);shade.addColorStop(0,'rgba(2,9,35,.12)');shade.addColorStop(.48,'rgba(5,9,38,.02)');shade.addColorStop(1,'rgba(2,8,30,.18)');q.fillStyle=shade;q.fillRect(0,0,w,h);
   for(var i=0;i<34;i++){var sx=((i*173.7+idx*13)%w),sy=((i*89.3+t*(8+i%4))%(h*.75));q.globalAlpha=.22+.5*((i%5)/5);q.fillStyle=i%4===0?'#fa83ff':'#75eaff';q.beginPath();q.arc(sx,sy, .7+(i%3)*.45,0,Math.PI*2);q.fill()}q.globalAlpha=1;
   // Perspective rails, luminous but narrow so they frame rather than cover the camera.
   for(var side=-1;side<=1;side+=2){q.beginPath();q.moveTo(cx+side*w*.045,horizon);q.bezierCurveTo(cx+side*w*.08,h*.58,cx+side*w*(.25+lane*.06),h*.78,cx+side*w*(.39+lane*.035),h*1.04);q.lineWidth=3;q.strokeStyle=side<0?'rgba(74,218,255,.8)':'rgba(246,95,232,.8)';q.shadowBlur=12;q.shadowColor=q.strokeStyle;q.stroke();q.shadowBlur=0;
    q.beginPath();q.moveTo(cx+side*w*.052,horizon);q.bezierCurveTo(cx+side*w*.09,h*.59,cx+side*w*(.27+lane*.06),h*.79,cx+side*w*(.405+lane*.035),h*1.04);q.lineWidth=1;q.strokeStyle='rgba(224,247,255,.6)';q.stroke();
   }
   // Cross ties move toward the viewer to create a simple ride sensation.
   for(var k=0;k<11;k++){var z=((k/11+(t*.22)%1)%1),y=horizon+Math.pow(z,1.75)*h*.64,spread=.045+z*.39;q.globalAlpha=.12+z*.48;q.beginPath();q.moveTo(cx-spread*w,y);q.lineTo(cx+spread*w,y);q.lineWidth=1+z*3;q.strokeStyle=k%2?'#60dfff':'#d888ff';q.stroke()}q.globalAlpha=1;
   // A floating star target appears on the selected lane.
   var starX=cx+lane*w*.19,starY=h*.57+Math.sin(t*1.4)*h*.018,rad=9+pulse*3;q.save();q.translate(starX,starY);q.rotate(t*.4);q.shadowColor='#8ceaff';q.shadowBlur=14;q.fillStyle='rgba(129,236,255,.86)';q.beginPath();for(var z=0;z<10;z++){var rr=z%2?rad*.42:rad;q.lineTo(Math.cos(z*Math.PI/5)*rr,Math.sin(z*Math.PI/5)*rr)}q.closePath();q.fill();q.restore();
   if(RIDE.paused){q.fillStyle='rgba(4,9,30,.16)';q.fillRect(0,0,w,h)}
  });
 }
 function rideStart(){mgStop();dnStop();uStop();G=null;skRender();if(RIDE){rideStop();}RIDE={lane:0,score:0,paused:false,started:Date.now(),lastMove:Date.now()};root.classList.add('ride-on');hud(function(x){var c=x.querySelector('.ride-scene'),b=x.querySelector('.ride-hud span');if(c)c.style.display='block';if(b)b.textContent='Mondd: balra, jobbra, szünet vagy játék vége.'});rideStatus('Mondd: balra · jobbra · szünet · játék vége');cancelAnimationFrame(RIDE_FRAME);RIDE_FRAME=requestAnimationFrame(rideDraw);return 'Indul a Csillagvasút. A kamera képe látszik a pálya mögött. Mondd: balra vagy jobbra a sávváltáshoz, szünet a megálláshoz, játék vége a kilépéshez.'}
 function rideStop(){if(!RIDE)return null;RIDE=null;cancelAnimationFrame(RIDE_FRAME);RIDE_FRAME=0;if(root)root.classList.remove('ride-on','zoomed');hud(function(x){var e=x.querySelector('.ride-hud span');if(e)e.textContent=''});return 'Kiléptem a Csillagvasútból.'}
 function rideCommand(f){if(!RIDE)return null;
  if(/\b(jatek vege|csillagvasut vege|kilep\w*|hagyjuk|allj|allj meg)\b/.test(f))return rideStop();
  if(/\b(teljes kepernyo|teljes kijelzo|full ?screen)\b/.test(f)||(/\b(nagyit\w*|nagyitot|nagyobb\w*|nagyitas|kozelit\w*|zoomol\w*)\b/.test(f)&&!workOn)){root.classList.add('zoomed');return voiceFullscreen(false)}
  if(/\b(kicsinyit\w*|normal meret|eredeti meret)\b/.test(f)){root.classList.remove('zoomed');return 'Visszaállítottam az eredeti méretet.'}
  if(/\b(szu net|szunet|pause|pihenj)\b/.test(f)){RIDE.paused=!RIDE.paused;rideStatus(RIDE.paused?'Szünet':'Folytatódik · mondd: balra vagy jobbra');return RIDE.paused?'Szüneteltettem a Csillagvasutat.':'Folytatódik a Csillagvasút.'}
  if(RIDE.paused&&/\b(folytasd|mehet|indulj|tovabb)\b/.test(f)){RIDE.paused=false;rideStatus('Folytatódik · mondd: balra vagy jobbra');return 'Folytatom.'}
  if(/\b(balra|bal sav|bal oldali sav)\b/.test(f)){RIDE.lane=Math.max(-1,RIDE.lane-1);RIDE.score+=10;rideStatus('Balra váltottál · '+RIDE.score+' pont');return 'Balra váltottam.'}
  if(/\b(jobbra|jobb sav|jobb oldali sav)\b/.test(f)){RIDE.lane=Math.min(1,RIDE.lane+1);RIDE.score+=10;rideStatus('Jobbra váltottál · '+RIDE.score+' pont');return 'Jobbra váltottam.'}
  if(/\b(hogyan|mit mondjak|parancsok|segitseg|szabaly\w*)\b/.test(f))return 'Csillagvasút: mondd, hogy balra vagy jobbra a sávváltáshoz, szünet a megállításhoz, folytasd az induláshoz, játék vége a kilépéshez.';
  return '';
 }

 /* ---- JÁTÉKMENÜ: áttetsző felirat a szem előtt; hangon választható, lapozható ---- */
 var M=null,GAMES=[{id:'szokereso',name:'Szókereső',say:'szókereső',start:function(){return startGame()}},{id:'utos',name:'Ütős blokkok',say:'ütős blokkok',start:function(){return uStart()}},{id:'csillagvasut',name:'Csillagvasút',say:'csillagvasút',start:function(){return rideStart()}}],VIS=4;
 var NUMW={egy:1,egyes:1,elso:1,ketto:2,kettes:2,masodik:2,harom:3,hármas:3,harmas:3,harmadik:3,negy:4,negyes:4,negyedik:4,ot:5,otos:5,otodik:5,hat:6,hatos:6,het:7,hetes:7,nyolc:8,nyolcas:8,kilenc:9,tiz:10};
 /* ---- DEX ŐRZŐJE: DEX előtted lebeg, te védesz kéz- vagy hangmozdulattal ---- */
 var MG=null,MGT=null,MGBEST=+(localStorage.getItem('dex51_mag_best')||0)||0,mgSaid=false,MGX=[24,50,76];
 function mgSpr(){var h='',i;if(!MG)return '';
  h+='<i class="ml" style="left:'+(MGX[0]-11)+'%"></i><i class="ml" style="left:'+(MGX[1]-11)+'%"></i><i class="ml" style="left:'+(MGX[2]-11)+'%"></i>';
  MG.en.forEach(function(e){if(e.dead)return;var y=12+66*e.z,sc=.35+.65*Math.min(1,e.z);h+='<div class="'+(e.t==='o'?'mo':'mc')+'" style="left:'+MGX[e.lane+1]+'%;top:'+y.toFixed(1)+'%;transform:translate(-50%,-50%) scale('+sc.toFixed(2)+')"></div>'});
  h+='<div class="mdx'+(MG.sh>0?' sh':'')+(MG.gl>0?' gl':'')+(MG.hurt>0?' hu':'')+'" style="left:'+MGX[MG.lane+1]+'%"><b></b><span class="e1"></span><span class="e2"></span><em>D</em></div>';
  var hearts='';for(i=0;i<3;i++)hearts+=i<MG.lives?'♥':'♡';
  var c='';if(MG.state==='ready')c=MG.cd>0?String(Math.ceil(MG.cd)):'INDUL!';if(MG.state==='over')c='VÉGE';if(MG.paused)c='SZÜNET';
  h+='<div class="mgb"><b>DEX ŐRZŐJE</b> '+hearts+' · pont '+MG.score+' · szint '+MG.lvl+(MGBEST?' · legjobb '+MGBEST:'')+(MG.shcd>0&&MG.sh<=0?' · pajzs töltődik':' · pajzs kész')+'</div><div class="mbig">'+c+'</div>';
  return h}
 function mgRender(){hud(function(x){var e=x.querySelector('.mg');if(!e)return;if(!MG){e.classList.remove('on');e.innerHTML='';return}e.classList.add('on');e.innerHTML=mgSpr()})}
 function mgStop(){if(MGT){clearInterval(MGT);MGT=null}MG=null;mgRender();if(root)root.classList.remove('mgm')}
 function mgSpawn(t,lane){if(!MG)return null;var e={t:t||'c',lane:lane===undefined?Math.floor(Math.random()*3)-1:lane,z:0,res:false,dead:false};MG.en.push(e);return e}
 function mgOver(){MG.state='over';if(MG.score>MGBEST){MGBEST=MG.score;try{localStorage.setItem('dex51_mag_best',String(MGBEST))}catch(e){}}
  uBeep(120,.4,.08);uVib([120,60,120]);mgRender();var t='Vége a játéknak. A pontszámod '+MG.score+(MG.score>=MGBEST&&MG.score>0?', ez a legjobb eredményed.':'.')+' Mondd: még egyszer, vagy: játék vége.';
  setTimeout(function(){if(MG&&MG.state==='over'&&window.DEX_UI)window.DEX_UI.reply(t)},700)}
 function mgStep(dt){if(!MG||MG.paused)return;
  if(MG.state==='intro'){var sp=false;try{sp=!!(window.DEX_SPEAKING&&window.DEX_SPEAKING())}catch(e){}if(sp)MG.heard=true;
   if((MG.heard&&!sp)||(!MG.heard&&Date.now()-MG.t0>6500)||!MG.say){MG.state='ready';MG.cd=3}mgRender();return}
  if(MG.state==='ready'){MG.cd-=dt;if(MG.cd<=-.7){MG.state='play';MG.sp=.4}mgRender();return}
  if(MG.state!=='play')return;
  MG.sh=Math.max(0,MG.sh-dt);MG.shcd=Math.max(0,MG.shcd-dt);MG.gl=Math.max(0,MG.gl-dt);MG.hurt=Math.max(0,MG.hurt-dt);
  MG.sp-=dt;if(MG.sp<=0){mgSpawn(Math.random()<.34?'o':'c');MG.sp=Math.max(.65,1.9-.12*MG.lvl)*(.75+Math.random()*.5)}
  var v=(.3+.025*MG.lvl)*MG.spd;
  MG.en.forEach(function(e){if(e.dead)return;e.z+=dt*v;
   if(!e.res&&e.z>=.9){e.res=true;var hit=e.lane===MG.lane;
    if(e.t==='o'){if(hit){MG.score+=10;MG.catch++;MG.gl=.7;uBeep(660,.15,.07);if(MG.catch%5===0){MG.lvl++;uBeep(880,.25,.07)}}}
    else if(hit){if(MG.sh>0){MG.score+=5;uBeep(520,.1,.06)}else{MG.lives--;MG.hurt=.5;uBeep(140,.3,.08);uVib([80,40,80]);if(MG.lives<=0){mgOver();return}}}}
   if(e.z>=1.08)e.dead=true});
  MG.en=MG.en.filter(function(e){return !e.dead});mgRender()}
 function mgTick(){var n=Date.now(),dt=Math.min(.25,(n-(MG?MG.lt:n))/1000);if(MG){MG.lt=n;mgStep(dt)}}
 function mgStart(){if(M)menuClose(false);G=null;skRender();uStop();if(RIDE)rideStop();dnStop();mgStop();root.classList.add('mgm');
  var say=!mgSaid;mgSaid=true;
  MG={state:'intro',lane:0,en:[],lives:3,score:0,catch:0,lvl:1,sh:0,shcd:0,gl:0,hurt:0,spd:1,paused:false,t0:Date.now(),lt:Date.now(),heard:false,say:say,cd:3,sp:0};
  MGT=setInterval(mgTick,40);mgRender();
  return say?'DEX őrzője. DEX lebeg előtted, és neked kell megvédened. Mondd: balra vagy jobbra, vagy legyintsd a kezed oldalra, hogy DEX kitérjen. Mondd: pajzs, vagy legyintsd felfelé, hogy pajzsot húzzon. Kapd el a fénygömböket, kerüld az üstökösöket. Szünet: állj.':'DEX őrzője indul. Balra, jobbra, pajzs.'}
 function mgMove(d){if(!MG||MG.paused||MG.state==='over')return false;MG.lane=Math.max(-1,Math.min(1,d===0?0:MG.lane+d));mgRender();return true}
 function mgShield(){if(!MG||MG.paused||MG.state==='over')return 'Most nincs játék.';if(MG.shcd>0)return 'A pajzs még töltődik.';MG.sh=1.6;MG.shcd=3.2;uBeep(440,.12,.05);mgRender();return 'Pajzs!'}
 function mgGesture(dir){csFlash(dir);if(dir==='left')mgMove(-1);else if(dir==='right')mgMove(1);else if(dir==='up')mgShield()}
 function mgCmd(f){if(!MG)return null;
  if(/\b(jatek vege|kilep\w*|kiszallok|hagyjuk|dex orzoje vege|orzo vege)\b/.test(f)){mgStop();return 'Kiléptem a DEX őrzőjéből.'}
  if(/\b(meg egyszer|ujra|ujrakezd\w*)\b/.test(f)&&MG.state==='over')return mgStart();
  if(/^(allj|stop|szunet|varj|megallj|pihenj|pillanat)$/.test(f)&&(MG.state==='play'||MG.state==='ready')){MG.paused=true;mgRender();return 'Szünet. Ha folytatjuk, mondd: folytasd.'}
  if(MG.paused&&/\b(folytasd|mehet|indulj|tovabb)\b/.test(f)){MG.paused=false;MG.lt=Date.now();mgRender();return 'Megy tovább.'}
  if(MG.paused||MG.state==='over'||MG.state==='intro')return null;
  if(/^(balra|bal|balra ki|balra uss)$|\bdex balra\b|\bbalra (ter|menj|mozdulj|ugorj)\b/.test(f)){mgMove(-1);csFlash('left');return ''}
  if(/^(jobbra|jobb|jobbra ki)$|\bdex jobbra\b|\bjobbra (ter|menj|mozdulj|ugorj)\b/.test(f)){mgMove(1);csFlash('right');return ''}
  if(/^(kozepre|kozepre menj|kozep)$/.test(f)){mgMove(0);return ''}
  if(/\b(pajzs\w*|vedj\w*|vedelem|vedd\w*)\b/.test(f)){var r=mgShield();csFlash('up');return r==='Pajzs!'?'':r}
  if(/\b(gyorsabb\w*|gyorsits\w*)\b/.test(f)){MG.spd=Math.min(2,MG.spd+.2);return 'Gyorsabb.'}
  if(/\b(lassabb\w*|lassits\w*)\b/.test(f)){MG.spd=Math.max(.5,MG.spd-.2);return 'Lassabb.'}
  if(/\b(dex kapd el|kapd el)\b/.test(f)){return ''}
  if(MG.state==='play'&&!/\b(vr|work\w*|jatek\w*|menu|cseveges\w*|cset\w*|chat|kijelzo\w*|kepernyo\w*|vege|ki|kilep\w*|szalag\w*|gesztus\w*|iranyito\w*|parancsok|szokereso|utos|csillag\w*)\b/.test(f))return '';
  return null}
 GAMES.push({id:'dino',name:'DEX Dínóüldözés',say:'dino uldozes',start:function(){return dnStart()}});
 GAMES.push({id:'mag',name:'DEX őrzője',say:'dex orzoje',start:function(){return mgStart()}});
 /* ---- DEX DÍNÓÜLDÖZÉS: kézkövetés + kézhez kötött játékpisztoly + dínók a kamerakép előtt ---- */
 var DN=null,DNF=0,DNBEST=+(localStorage.getItem('dex51_dino_best')||0)||0,dnSaid=false;
 var HD={eng:null,loading:false,err:'',busy:false,lastSend:0,res:null,resT:0,mode:'',skin:null,hist:[],pinchOn:false,lastArea:0,lastAreaT:0};
 var MPLOCAL='./mp/',MPCDN='https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/',MPBASE=MPLOCAL; /* előbb a csomagban lévő ./mp/ mappa (GitHub Pages / offline), csak ha az hiányzik, a CDN */
 /* ---- Kamera forgatása / tükrözése (ha a telefon fektetve van, a kép oldalra fordul) ---- */
 var CAM={r:0,m:0,key:''};
 function camMode(){return root&&root.classList.contains('rot')?'rot':'land'}
 function camLoad(){var md=camMode(),d=md==='rot'?{r:3,m:0}:{r:0,m:0},u=null;try{u=JSON.parse(localStorage.getItem('dex_cam_'+md)||'null')}catch(e){}
  if(u&&typeof u.r==='number'&&u.r>=0&&u.r<4)d={r:u.r|0,m:u.m?1:0};CAM.r=d.r;CAM.m=d.m;CAM.key=''}
 function camSave(){try{localStorage.setItem('dex_cam_'+camMode(),JSON.stringify({r:CAM.r,m:CAM.m}))}catch(e){}}
 function camApply(){if(!eyes.length||!eyes[0])return;var ew=eyes[0].clientWidth||0,eh=eyes[0].clientHeight||0,k=ew+'x'+eh+'|'+CAM.r+CAM.m;if(k===CAM.key)return;CAM.key=k;
  eyes.forEach(function(e){var v=e.querySelector('video');if(!v)return;var st=v.style,odd=CAM.r%2===1;
   if(!CAM.r&&!CAM.m){st.cssText='';return}
   st.transform='rotate('+(CAM.r*90)+'deg)'+(CAM.m?' scaleX(-1)':'');
   if(odd&&ew&&eh){st.right='auto';st.bottom='auto';st.left=((ew-eh)/2)+'px';st.top=((eh-ew)/2)+'px';st.width=eh+'px';st.height=ew+'px'}else{st.left='0';st.top='0';st.right='';st.bottom='';st.width='100%';st.height='100%'}})}
 function camRot(vx,vy){if(CAM.m)vx=1-vx;switch(CAM.r){case 1:return [1-vy,vx];case 2:return [1-vx,1-vy];case 3:return [vy,1-vx]}return [vx,vy]}
 function camInv(x,y){var a;switch(CAM.r){case 1:a=[y,1-x];break;case 2:a=[1-x,1-y];break;case 3:a=[1-y,x];break;default:a=[x,y]}return CAM.m?[1-a[0],a[1]]:a}
 function camAsp(v){return CAM.r%2?v.videoHeight/v.videoWidth:v.videoWidth/v.videoHeight}
 function r2e(rx,ry){var v=eyes[0]&&eyes[0].querySelector('video');if(!v||!v.videoWidth)return null;var ew=eyes[0].clientWidth||1,eh=eyes[0].clientHeight||1,va=camAsp(v),ea=ew/eh;
  if(va>ea){var dw=eh*va;return [(rx*dw-(dw-ew)/2)/ew,ry]}var dh=ew/va;return [rx,(ry*dh-(dh-eh)/2)/eh]}
 function v2e(vx,vy){var r=camRot(vx,vy);return r2e(r[0],r[1])}
 /* a forgatott/tükrözött kép: MediaPipe és a mozgásfigyelő ezt kapja, így a kéz a szem szerint áll */
 function camSrc(v,w,h){if(!CAM.r&&!CAM.m)return v;var c=CAM.cv||(CAM.cv=document.createElement('canvas')),odd=CAM.r%2===1,sc=Math.min(1,640/Math.max(v.videoWidth,v.videoHeight)),bw=Math.round(v.videoWidth*sc),bh=Math.round(v.videoHeight*sc),rw=odd?bh:bw,rh=odd?bw:bh;
  if(c.width!==rw||c.height!==rh){c.width=rw;c.height=rh}var g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.translate(rw/2,rh/2);g.rotate(CAM.r*Math.PI/2);if(CAM.m)g.scale(-1,1);g.drawImage(v,-bw/2,-bh/2,bw,bh);g.setTransform(1,0,0,1,0,0);return c}
 function camSet(r,m,save){CAM.r=((r%4)+4)%4;CAM.m=m?1:0;CAM.key='';camApply();if(save!==false)camSave();CAM.hint=0}
 function camSay(){var n=CAM.r*90;return 'A kamerakép most '+n+' fokkal elforgatva'+(CAM.m?' és tükrözve':'')+'. Ha még mindig oldalra megy a kezed, mondd újra: forgasd el a kamerát. Tükrözés: tükrözd a kamerát. Alapra: kamera alaphelyzet.'}
 function dnHandFromMP(lm){return dnHandFromLm(lm,true)}
 function dnHandFromLm(lm,mp){ /* 21 MediaPipe-pont (videó-normalizált) → kéz a szem pixelkoordinátáiban */
  if(!lm||lm.length<21)return null;var ew=eyes[0]?eyes[0].clientWidth||1:1,eh=eyes[0]?eyes[0].clientHeight||1:1,P=[],i,q;
  for(i=0;i<21;i++){q=mp?r2e(lm[i].x,lm[i].y):v2e(lm[i].x,lm[i].y);if(!q)return null;P.push([q[0]*ew,q[1]*eh])}
  function d(a,b){return Math.sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1]))}
  var pa=[0,5,9,13,17],cx=0,cy=0;pa.forEach(function(k){cx+=P[k][0];cy+=P[k][1]});cx/=5;cy/=5;
  var size=d(P[0],P[9]);if(size<8)return null;
  var dx=P[8][0]-P[5][0],dy=P[8][1]-P[5][1],dl=Math.sqrt(dx*dx+dy*dy)||1;dx/=dl;dy/=dl;
  var pr=d(P[4],P[8])/size;
  return {x:cx,y:cy,tx:P[8][0],ty:P[8][1],px:(P[4][0]+P[8][0])/2,py:(P[4][1]+P[8][1])/2,dx:dx,dy:dy,size:size,pinchR:pr,src:'mp',ew:ew,eh:eh,P:P}}
 function dnLoadMP(){if(window.__noMP||HD.eng||HD.loading||HD.err)return;HD.loading=true;var triedCdn=false;
  function boot(base){MPBASE=base;var s=document.createElement('script');s.src=base+'hands.js';s.crossOrigin='anonymous';
   s.onload=function(){try{var H=new window.Hands({locateFile:function(f){return MPBASE+f}});H.setOptions({maxNumHands:2,modelComplexity:0,minDetectionConfidence:.6,minTrackingConfidence:.5});HD.nh=2;
    H.onResults(function(r){HD.res=(r&&r.multiHandLandmarks&&r.multiHandLandmarks[0])||null;HD.resAll=(r&&r.multiHandLandmarks)||[];HD.resT=Date.now();HD.frames=(HD.frames||0)+1;if(HD.res){HD.seenT=HD.resT;HD.seen=(HD.seen||0)+1}HD.busy=false});
    Promise.resolve(H.initialize()).then(function(){HD.eng=H;HD.loading=false;HD.mode='mp'}).catch(function(e){fail('init')})}catch(e){fail('ctor')}};
   s.onerror=function(){try{s.remove()}catch(e){}fail('net')};document.head.appendChild(s)}
  function fail(why){if(!triedCdn&&MPBASE===MPLOCAL){triedCdn=true;window.Hands=undefined;boot(MPCDN);return}HD.err=why;HD.loading=false;dnSkinFallback()}
  boot(MPLOCAL);
  setTimeout(function(){if(HD.loading){HD.err='timeout';HD.loading=false;dnSkinFallback()}},30000)}
 function dnSkinFallback(){HD.mode='skin';if(DN&&DN.state==='check'&&!DN.fbSaid){DN.fbSaid=true;try{window.DEX_UI&&window.DEX_UI.reply('A pontos kézkövető modul nem töltődött be, ezért egyszerűbb, színalapú kézfelismerést használok. Tartsd a kezed jól megvilágítva a kamera előtt, lőni hanggal tudsz: mondd, hogy lőj.')}catch(e){}}}
 /* egyszerű, modell nélküli kézkereső (bőrszín alapú): tartalék, ha a MediaPipe nem érhető el */
 function dnSkinScan(img,w,h){var m=new Uint8Array(w*h),n=0,i,r,g,b,Y,cb,cr;
  for(i=0;i<w*h;i++){r=img[i*4];g=img[i*4+1];b=img[i*4+2];cb=128-.168736*r-.331264*g+.5*b;cr=128+.5*r-.418688*g-.081312*b;
   if(cb>77&&cb<127&&cr>135&&cr<173&&r>60&&r>b){m[i]=1;n++}}
  if(n<w*h*.02||n>w*h*.55)return null;
  var seen=new Uint8Array(w*h),best=null,st=[],k,j;
  for(i=0;i<w*h;i++){if(!m[i]||seen[i])continue;var comp=[],top=i;st=[i];seen[i]=1;
   while(st.length){k=st.pop();comp.push(k);var x=k%w,y=(k/w)|0;
    if(x>0&&m[k-1]&&!seen[k-1]){seen[k-1]=1;st.push(k-1)}if(x<w-1&&m[k+1]&&!seen[k+1]){seen[k+1]=1;st.push(k+1)}
    if(y>0&&m[k-w]&&!seen[k-w]){seen[k-w]=1;st.push(k-w)}if(y<h-1&&m[k+w]&&!seen[k+w]){seen[k+w]=1;st.push(k+w)}}
   if(!best||comp.length>best.length)best=comp}
  if(!best||best.length<w*h*.02)return null;
  var sx=0,sy=0,tx=0,ty=1e9,bx=0,by=0;best.forEach(function(k){var x=k%w,y=(k/w)|0;sx+=x;sy+=y;if(y<ty){ty=y;tx=x}if(y>by){by=y}});
  var cx=sx/best.length,cy=sy/best.length,area=best.length/(w*h);
  return {cx:cx/w,cy:cy/h,tx:tx/w,ty:ty/h,by:by/h,area:area}}
 function dnSkinHand(){var v=eyes[0]&&eyes[0].querySelector('video');if(!v||!v.videoWidth||v.readyState<2)return null;
  if(!HD.skin){HD.skin=document.createElement('canvas');HD.skin.width=64;HD.skin.height=36}var c=HD.skin.getContext('2d',{willReadFrequently:true});
  try{c.setTransform(1,0,0,1,0,0);c.save();c.translate(32,18);c.rotate(CAM.r*Math.PI/2);if(CAM.m)c.scale(-1,1);if(CAM.r%2)c.drawImage(v,-18,-32,36,64);else c.drawImage(v,-32,-18,64,36);c.restore();var im=c.getImageData(0,0,64,36).data}catch(e){return null}
  var sc=dnSkinScan(im,64,36);if(!sc||sc.cy<.3)return null;
  var a=v2e(sc.cx,sc.cy),t=v2e(sc.tx,sc.ty);if(!a||!t)return null;var ew=eyes[0].clientWidth,eh=eyes[0].clientHeight,now=Date.now();
  var dx=t[0]*ew-a[0]*ew,dy=t[1]*eh-a[1]*eh,dl=Math.sqrt(dx*dx+dy*dy)||1;
  var push=HD.lastArea&&now-HD.lastAreaT<350&&sc.area>HD.lastArea*1.35&&sc.area>.06;if(!HD.lastAreaT||now-HD.lastAreaT>350){HD.lastArea=sc.area;HD.lastAreaT=now}
  return {x:a[0]*ew,y:a[1]*eh,tx:t[0]*ew,ty:t[1]*eh,dx:dx/dl,dy:dy/dl,size:Math.sqrt(sc.area)*eh*1.2,pinchR:push?0:9,src:'skin',ew:ew,eh:eh}}
 function dnHand(){ /* aktuális kéz (vagy null): tesztfelülírás, MediaPipe, vagy tartalék */
  var o=window.__handLm;if(typeof o==='function'){var l=o();return l?(l.x!==undefined?l:dnHandFromLm(l)):null}
  var now=Date.now();
  if(HD.mode==='mp'&&HD.eng){var v=eyes[0]&&eyes[0].querySelector('video');var wantN=DN?1:2;if(HD.nh!==wantN){HD.nh=wantN;try{HD.eng.setOptions({maxNumHands:wantN})}catch(e){}}
   if(!HD.busy&&v&&v.videoWidth&&v.readyState>=2&&now-HD.lastSend>45){HD.busy=true;HD.lastSend=now;Promise.resolve(HD.eng.send({image:camSrc(v)})).catch(function(){HD.busy=false})}
   if(now-HD.resT>350||!HD.res)return null;return dnHandFromMP(HD.res)}
  if(HD.mode==='skin'){if(now-HD.lastSend<90)return HD.last||null;HD.lastSend=now;HD.last=dnSkinHand();return HD.last}
  return null}
 function dnSay(t,force){if(!t)return;var n=Date.now();if(!force&&n-(DN&&DN.lastSay||0)<3800)return;if(DN)DN.lastSay=n;try{window.DEX_UI&&window.DEX_UI.reply(t)}catch(e){}}
 function dnSpawn(kind){if(!DN)return null;var side=Math.random()<.5?-1:1,L=DN.lvl;
  var d={kind:kind===undefined?(DN.n%3):kind,x:side>0?.78:.22,fx:side>0?.78:.22,y:.8,sc:.9+.08*Math.min(5,L),st:'hidden',t:0,wait:.8+Math.random()*1.0,life:26,hp:L>=4?2:1,hit:0,vx:0,dir:side};DN.dino=d;return d}
 function dnStop(){if(DNF){cancelAnimationFrame(DNF);DNF=0}DN=null;if(root)root.classList.remove('dn-on');hud(function(x){var c=x.querySelector('.dn-scene');if(c){var q=c.getContext('2d');q.clearRect(0,0,c.width,c.height)}})}
 function dnStart(){if(M)menuClose(false);G=null;skRender();uStop();if(RIDE)rideStop();mgStop();dnStop();
  /* A látvány kamera nélkül is induljon el. A kamera kizárólag a kézkövetéshez és a lövéshez kell. */
  root.classList.add('dn-on');var noCam=root.classList.contains('nocam'),say=!dnSaid;dnSaid=true;
  DN={state:'check',t:0,hand:0,gone:0,score:0,lvl:1,n:0,hits:0,paused:false,fx:[],shots:[],dino:null,cool:0,aim:null,gun:null,prac:{x:.62,y:.4,r:0},lt:Date.now(),lastSay:0,fbSaid:false,pinchOn:false,combo:0};
  if(typeof window.__handLm!=='function'&&!HD.mode){dnLoadMP()}
  DNF=requestAnimationFrame(dnLoop);
  return noCam?'A dínókaland elindult. A kamera még nem érhető el, ezért most a kézvezérlés nem működik. A játék látványát ettől függetlenül látod.':(say?'DEX dínóüldözés. Először ellenőrizzük a kameráját és a kezed: emeld fel a kezed a kamera elé. Ha felismertelek, megjelenik a játékpisztoly a kezedben. Lőni úgy tudsz, hogy összeérinted a hüvelyk- és mutatóujjad, vagy azt mondod: lőj. Ha a kezed eltűnik, a pisztoly is eltűnik.':'Dínóüldözés. Emeld fel a kezed a kamera elé.')}
 function dnExit(){var s=DN?DN.score:0;dnStop();return s?'Kiléptem a dínóüldözésből. A pontszámod: '+s+'.':'Kiléptem a dínóüldözésből.'}
 function dnFire(src){if(!DN||DN.paused||DN.state==='over'||DN.state==='check')return false;
  if(!DN.gun)return false;                         /* kéz nélkül nincs lövés */
  if(DN.cool>0)return false;DN.cool=.45;var g=DN.gun,a=DN.aim||{x:g.x,y:g.y};
  DN.shots.push({x0:g.mx,y0:g.my,x1:a.x,y1:a.y,t:0,done:false});uBeep(780,.08,.06);return true}
 function dnHit(d,x,y){d.hp--;DN.fx.push({k:'burst',x:x,y:y,t:0});uBeep(990,.18,.08);uVib([40]);
  if(d.hp<=0){d.st='hit';d.t=0;DN.hits++;DN.combo++;DN.score+=100+Math.min(5,DN.combo)*20;if(DN.score>DNBEST){DNBEST=DN.score;try{localStorage.setItem('dex51_dino_best',String(DNBEST))}catch(e){}}
   dnSay(['Szép találat! Kereshetjük a következőt.','Ez az! A dínó elszaladt.','Remek lövés!'][DN.hits%3],true)}else{d.st='stun';d.t=0;dnSay('Eltaláltad, de még nem adja fel!',true)}}
 function dnHitTest(d,x,y,ew,eh){var s=d.sc*eh*.5,cx=d.x*ew,cy=d.y*eh-s*.5;return Math.pow((x-cx)/(s*.8),2)+Math.pow((y-cy)/(s*.6),2)<=1}
 function dnDir(d){var p=d.x;return p<.38?'balra':(p>.62?'jobbra':'középen')}
 function dnHint(){if(!DN||!DN.dino)return 'Most nincs dínó, mindjárt jön egy.';var d=DN.dino;if(d.st==='hidden')return 'A dínó elbújt, de a '+dnDir(d)+' oldalon mozdult valami.';return 'A dínót '+dnDir(d)+' látom. '+(DN.gun?'Célozz rá, és lőj!':'Emeld fel a kezed, és célozz rá!')}
 function dnStep(dt){if(!DN||DN.paused){if(DN)DN.lt=Date.now();return}var ew=eyes[0]?eyes[0].clientWidth||1:1,eh=eyes[0]?eyes[0].clientHeight||1:1,now=Date.now();
  var H=dnHand();
  if(H){DN.hand+=dt;DN.gone=0}else{DN.gone+=dt;if(DN.gone>.12){DN.hand=0;DN.gun=null;DN.aim=null;DN.pinchOn=false}}
  if(H&&DN.hand>=0){ /* a pisztoly csak felismert kézhez kötött; a helyzetet simítjuk */
   var sm=DN.gun?.55:0,len=H.size*1.05,mx=H.x+H.dx*len,my=H.y+H.dy*len,ax=H.tx+H.dx*H.size*.8,ay=H.ty+H.dy*H.size*.8;
   if(DN.gun){H.x=DN.gun.x*sm+H.x*(1-sm);H.y=DN.gun.y*sm+H.y*(1-sm);mx=DN.gun.mx*sm+mx*(1-sm);my=DN.gun.my*sm+my*(1-sm);ax=DN.aim.x*sm+ax*(1-sm);ay=DN.aim.y*sm+ay*(1-sm)}
   if(DN.state!=='check'||DN.hand>=.5){DN.gun={x:H.x,y:H.y,mx:mx,my:my,ang:Math.atan2(H.dy,H.dx),size:H.size,src:H.src};DN.aim={x:Math.max(0,Math.min(ew,ax)),y:Math.max(0,Math.min(eh,ay))}}
   /* lövés: hüvelyk-mutatóujj összeérintése */
   var pr=H.pinchR;if(!DN.pinchOn&&pr<.32){DN.pinchOn=true;dnFire('pinch')}else if(DN.pinchOn&&pr>.5)DN.pinchOn=false}
  DN.cool=Math.max(0,DN.cool-dt);DN.t+=dt;
  if(DN.state==='check'){if(DN.hand>=.5){DN.state='try';DN.t=0;dnSay('Megvan a kezed! Itt a pisztolyod. Célozz a fénylő körre, és lőj: érintsd össze a hüvelyk- és mutatóujjad, vagy mondd, hogy lőj.',true)}
   else if(DN.t>7&&!DN.fbSaid&&DN.t<7.2){dnSay('Emeld fel a kezed jól látható helyen a kamera elé.',true)}}
  else if(DN.state==='try'){DN.prac.r=(DN.prac.r+dt*2)%6.28;if(DN.t>25&&!DN.gun){DN.state='check';DN.t=0;DN.hand=0}}
  else if(DN.state==='play'){var d=DN.dino;if(!d){dnSpawn();d=DN.dino}
   d.t+=dt;d.life-=dt;
   if(d.st==='hidden'){if(d.t>=d.wait){d.st='peek';d.t=0;dnSay(['A '+dnDir(d)+' oldalon mozdult valami!','Nézz '+dnDir(d)+', ott látom a dínót!'][DN.n%2])}}
   else if(d.st==='peek'){d.fy=1;if(d.t>1.1){d.st='up';d.t=0}}
   else if(d.st==='up'){d.x+=d.dir*dt*(.02+.012*DN.lvl)*Math.sin(d.t*2.4);d.x=Math.max(.15,Math.min(.85,d.x));if(d.t>4.5+Math.random()*.0){d.st='hide';d.t=0}}
   else if(d.st==='hide'){if(d.t>.7){d.st='hidden';d.t=0;d.wait=1.2+Math.random()*1.2;d.x=Math.max(.16,Math.min(.84,.2+Math.random()*.6));d.dir=Math.random()<.5?-1:1;if(d.life<=0){DN.combo=0;DN.n++;dnSpawn();dnSay('Elszaladt. Jöhet a következő!',true)}}}
   else if(d.st==='stun'){if(d.t>.6){d.st='up';d.t=0}}
   else if(d.st==='hit'){if(d.t>1.1){DN.n++;if(DN.hits%3===0){DN.lvl++}dnSpawn()}}}
  /* lövedékek */
  DN.shots.forEach(function(s){s.t+=dt/.16;if(s.t>=1&&!s.done){s.done=true;var d=DN.dino,ok=false;
   if(DN.state==='try'){var pr=DN.prac,px=pr.x*ew,py=pr.y*eh,rr=eh*.09;if(Math.pow(s.x1-px,2)+Math.pow(s.y1-py,2)<=rr*rr*2.4){ok=true;DN.fx.push({k:'burst',x:px,y:py,t:0});DN.state='play';DN.t=0;DN.n=0;DN.score=0;DN.combo=0;dnSpawn();dnSay('Szép lövés! Indul a vadászat. Keresd a dínót!',true)}}
   else if(d&&(d.st==='up'||d.st==='peek'||d.st==='stun')&&dnHitTest(d,s.x1,s.y1,ew,eh)){ok=true;dnHit(d,s.x1,s.y1)}
   if(!ok){DN.fx.push({k:'spark',x:s.x1,y:s.y1,t:0});if(DN.state==='play'){DN.combo=0;if(d&&d.st!=='hidden'&&Math.random()<.5)dnSay('Majdnem! Próbáld újra.')}}}});
  DN.shots=DN.shots.filter(function(s){return !s.done});
  DN.fx.forEach(function(f){f.t+=dt});DN.fx=DN.fx.filter(function(f){return f.t<.7})}
 /* ---- rajzolás ---- */
 function dnDino(q,d,ew,eh,t,par){var s=d.sc*eh*.5,x=d.x*ew+par,y=d.y*eh,al=1,sh=0,bob=Math.sin(t*6)*s*.03,pal=[['#3dbb5a','#1d7a3a','#ffd84a'],['#e8863a','#a4521b','#fff0a0'],['#9a6bd8','#5a3a9a','#ffe27a']][d.kind%3];
  if(d.st==='hidden')return;
  if(d.st==='peek'){var k=Math.min(1,d.t/.5);y+=s*(1-.35*k)*1.0;al=.55+.3*k}
  if(d.st==='hide'){var k2=Math.min(1,d.t/.7);y+=s*.9*k2;al=1-.6*k2}
  var rot=0;if(d.st==='hit'){var k3=Math.min(1,d.t/1.0);rot=k3*6.28*1.5;y-=s*.2*Math.sin(k3*3.14);var scl=1-k3*.9;q.save();q.translate(x,y-s*.5);q.scale(scl,scl);q.rotate(rot);q.translate(-x,-(y-s*.5));al=1-k3*.5}
  else if(d.st==='stun'){sh=Math.sin(t*50)*s*.03}
  q.save();q.globalAlpha=al;q.translate(x+sh,y+bob);
  q.fillStyle=pal[1];q.beginPath();q.moveTo(s*.55,-s*.55);q.quadraticCurveTo(s*1.25,-s*.45,s*1.15,-s*.1);q.quadraticCurveTo(s*.85,-s*.35,s*.5,-s*.25);q.closePath();q.fill();  /* farok */
  q.fillStyle=pal[0];q.beginPath();q.ellipse(0,-s*.45,s*.62,s*.42,0,0,6.283);q.fill();                                                               /* test */
  q.fillStyle=pal[2];q.beginPath();q.ellipse(-s*.02,-s*.33,s*.4,s*.24,0,0,6.283);q.fill();                                                               /* has */
  q.fillStyle=pal[1];[[-.28,-.08],[.22,-.08]].forEach(function(p){q.beginPath();q.ellipse(s*p[0],-s*p[1]-s*.04+Math.sin(t*6+p[0]*9)*s*.02,s*.14,s*.22,0,0,6.283);q.fill()});   /* lábak */
  q.fillStyle=pal[0];q.beginPath();q.ellipse(-s*.55,-s*.82,s*.34,s*.27,-.1,0,6.283);q.fill();                                                           /* fej */
  q.beginPath();q.ellipse(-s*.76,-s*.74,s*.2,s*.13,.1,0,6.283);q.fill();
  q.fillStyle='#fff';for(var i=0;i<4;i++){q.beginPath();q.moveTo(-s*(.9-i*.07),-s*.68);q.lineTo(-s*(.87-i*.07),-s*.6);q.lineTo(-s*(.84-i*.07),-s*.68);q.fill()}   /* fogak */
  q.fillStyle='#fff';q.beginPath();q.arc(-s*.52,-s*.88,s*.075,0,6.283);q.fill();q.fillStyle='#111';q.beginPath();q.arc(-s*.54,-s*.88,s*.04,0,6.283);q.fill();   /* szem */
  q.fillStyle=pal[1];for(var j=0;j<5;j++){q.beginPath();q.moveTo(-s*.35+j*s*.2,-s*.84+Math.abs(j-2)*s*.04);q.lineTo(-s*.28+j*s*.2,-s*(1.0-Math.abs(j-2)*.03));q.lineTo(-s*.21+j*s*.2,-s*.84+Math.abs(j-2)*s*.04);q.fill()}   /* taréj */
  q.restore();if(d.st==='hit')q.restore()}
 function dnGun(q,g,t){q.save();q.translate(g.x,g.y);q.rotate(g.ang+1.5708);var u=Math.max(26,g.size*.9);
  q.shadowColor='#37c8ff';q.shadowBlur=u*.35;
  q.fillStyle='#1f5fe0';q.beginPath();if(q.roundRect)q.roundRect(-u*.38,-u*1.15,u*.76,u*1.5,u*.18);else q.rect(-u*.38,-u*1.15,u*.76,u*1.5);q.fill();   /* test */
  q.shadowBlur=0;q.fillStyle='#ffc928';q.fillRect(-u*.38,-u*.6,u*.76,u*.2);q.fillRect(-u*.12,-u*1.1,u*.24,u*.55);                                                 /* sárga sáv */
  q.fillStyle='#143f9d';q.beginPath();if(q.roundRect)q.roundRect(-u*.2,-u*1.5,u*.4,u*.5,u*.1);else q.rect(-u*.2,-u*1.5,u*.4,u*.5);q.fill();                          /* cső */
  var gl=.6+.4*Math.sin(t*8);q.fillStyle='rgba(120,240,255,'+gl.toFixed(2)+')';q.shadowColor='#7af0ff';q.shadowBlur=u*.5;q.beginPath();q.arc(0,-u*1.52,u*.2,0,6.283);q.fill();q.shadowBlur=0;
  q.fillStyle='#ffc928';q.beginPath();q.arc(u*.08,-u*.15,u*.12,0,6.283);q.fill();q.restore()}
 function dnLeaf(q,x,y,sz,rot,al){q.save();q.translate(x,y);q.rotate(rot);q.globalAlpha=al;q.fillStyle='#2f9a4a';for(var i=-3;i<=3;i++){q.beginPath();q.ellipse(i*sz*.12,-Math.abs(i)*sz*.08-sz*.4,sz*.1,sz*.55,i*.28,0,6.283);q.fill()}q.restore()}
 function dnScene(q,w,h,idx,t){q.clearRect(0,0,w,h);var par=(idx?1:-1)*w*.004;
  /* halvány dzsungel: levelek a sarkokban + pára */
  dnLeaf(q,w*.03,h*1.0,h*.55,.5,.2);dnLeaf(q,w*.97,h*1.0,h*.55,-.5,.2);dnLeaf(q,w*.0,h*.1,h*.4,2.3,.14);dnLeaf(q,w*1.0,h*.08,h*.4,-2.3,.14);
  var gr=q.createLinearGradient(0,h*.7,0,h);gr.addColorStop(0,'rgba(180,255,210,0)');gr.addColorStop(1,'rgba(180,255,210,.10)');q.fillStyle=gr;q.fillRect(0,h*.7,w,h*.3);
  if(!DN)return;
  /* Dex, a lebegő segítő a bal szélen */
  var by=h*.2+Math.sin(t*2)*h*.012,bx=w*.065+par;q.save();q.shadowColor='#37c8ff';q.shadowBlur=h*.03;q.fillStyle='#0a1a38';q.strokeStyle='#38b6ff';q.lineWidth=h*.006;q.beginPath();q.arc(bx,by,h*.055,0,6.283);q.fill();q.stroke();q.shadowBlur=0;q.strokeStyle='#5be6ff';q.lineWidth=h*.007;q.beginPath();q.arc(bx-h*.02,by-h*.005,h*.011,3.14,6.283);q.stroke();q.beginPath();q.arc(bx+h*.02,by-h*.005,h*.011,3.14,6.283);q.stroke();q.restore();
  if(DN.dino&&DN.state==='play')dnDino(q,DN.dino,w,h,t,par);
  /* Nagy, azonnal látható bemutató jelenet: kameraengedély nélkül se maradjon üres a játék. */
  if(DN.state==='check'){
   var demo=[{kind:0,x:.69,y:.82,sc:.92,st:'up',t:t},{kind:1,x:.48,y:.87,sc:.66,st:'up',t:t+1.4},{kind:2,x:.84,y:.9,sc:.58,st:'up',t:t+2.2}];
   demo.forEach(function(d){dnDino(q,d,w,h,t,par)});
   q.save();q.textAlign='center';q.shadowColor='#00152a';q.shadowBlur=10;q.fillStyle='rgba(3,16,35,.78)';
   var bw=Math.min(w*.66,540),bh=Math.max(76,h*.16),bx=w*.52+par,by=h*.13;
   if(q.roundRect){q.beginPath();q.roundRect(bx-bw/2,by,bw,bh,Math.min(22,bh*.2));q.fill()}else q.fillRect(bx-bw/2,by,bw,bh);
   q.fillStyle='#dff8ff';q.font='700 '+Math.max(18,Math.round(h*.036))+'px system-ui,sans-serif';q.fillText('DEX  ·  DÍNÓKALAND',bx,by+bh*.39);
   q.fillStyle='#c2d5e8';q.font='600 '+Math.max(13,Math.round(h*.022))+'px system-ui,sans-serif';q.fillText('T-REX  ·  DER TYRANNOSAURUS',bx,by+bh*.72);
   q.restore();
  }
  if(DN.state==='try'){var px=DN.prac.x*w+par,py=DN.prac.y*h,rr=h*.09,pu=1+.1*Math.sin(t*5);q.save();q.strokeStyle='rgba(255,230,120,.95)';q.lineWidth=h*.012;q.shadowColor='#ffd84a';q.shadowBlur=h*.04;q.beginPath();q.arc(px,py,rr*pu,0,6.283);q.stroke();q.beginPath();q.arc(px,py,rr*.5*pu,0,6.283);q.stroke();q.restore()}
  if(DN.state==='check'){q.save();q.font='600 '+Math.round(h*.06)+'px system-ui,sans-serif';q.textAlign='center';q.fillStyle='rgba(255,255,255,.88)';q.shadowColor='#000';q.shadowBlur=6;q.fillText('✋ Emeld fel a kezed',w*.5+par,h*.9);q.restore()}
  /* lövedékek, hatások */
  DN.shots.forEach(function(s){var k=Math.min(1,s.t),x=s.x0+(s.x1-s.x0)*k+par,y=s.y0+(s.y1-s.y0)*k;q.save();q.strokeStyle='rgba(140,240,255,.8)';q.lineWidth=h*.012;q.beginPath();q.moveTo(s.x0+(s.x1-s.x0)*Math.max(0,k-.35)+par,s.y0+(s.y1-s.y0)*Math.max(0,k-.35));q.lineTo(x,y);q.stroke();q.fillStyle='#e8ffff';q.shadowColor='#37c8ff';q.shadowBlur=h*.05;q.beginPath();q.arc(x,y,h*.03,0,6.283);q.fill();q.restore()});
  DN.fx.forEach(function(f){var k=f.t/.7,x=f.x+par,y=f.y;q.save();q.globalAlpha=1-k;if(f.k==='burst'){q.strokeStyle='#bff6ff';q.fillStyle='#ffe27a';q.lineWidth=h*.01;for(var i=0;i<14;i++){var a=i*.4488,r0=h*.04+k*h*.1,r1=r0+h*.05;q.beginPath();q.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0);q.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);q.stroke()}for(var j=0;j<5;j++){var b=j*1.2566+k;q.beginPath();q.arc(x+Math.cos(b)*h*.16*k,y+Math.sin(b)*h*.16*k,h*.012,0,6.283);q.fill()}}
   else{q.fillStyle='#8cecff';q.beginPath();q.arc(x,y,h*.02*(1+k*2),0,6.283);q.fill()}q.restore()});
  /* célzás + pisztoly: CSAK ha a kéz látszik */
  if(DN.gun&&DN.aim&&(DN.state==='try'||DN.state==='play')){var a=DN.aim;q.save();q.strokeStyle='rgba(255,255,255,.9)';q.lineWidth=h*.007;q.shadowColor='#37c8ff';q.shadowBlur=h*.02;q.beginPath();q.arc(a.x+par,a.y,h*.035,0,6.283);q.stroke();q.beginPath();q.moveTo(a.x+par-h*.05,a.y);q.lineTo(a.x+par-h*.015,a.y);q.moveTo(a.x+par+h*.015,a.y);q.lineTo(a.x+par+h*.05,a.y);q.moveTo(a.x+par,a.y-h*.05);q.lineTo(a.x+par,a.y-h*.015);q.moveTo(a.x+par,a.y+h*.015);q.lineTo(a.x+par,a.y+h*.05);q.stroke();q.restore()}
  if(DN.gun&&(DN.state==='try'||DN.state==='play')){var gg=DN.gun;dnGun(q,{x:gg.x+par,y:gg.y,ang:gg.ang,size:gg.size},t)}
  if(DN.paused){q.save();q.font='700 '+Math.round(h*.1)+'px system-ui,sans-serif';q.textAlign='center';q.fillStyle='rgba(255,255,255,.85)';q.shadowColor='#37c8ff';q.shadowBlur=18;q.fillText('SZÜNET',w*.5,h*.5);q.restore()}}
 function dnLoop(ts){if(!DN)return;DNF=requestAnimationFrame(dnLoop);var n=Date.now(),dt=Math.min(.25,(n-DN.lt)/1000);DN.lt=n;dnStep(dt);
  var dpr=Math.min(2,window.devicePixelRatio||1);eyes.forEach(function(eye,idx){var c=eye.querySelector('.dn-scene');if(!c)return;var w=eye.clientWidth,h=eye.clientHeight;if(!w||!h)return;var W=Math.round(w*dpr),H=Math.round(h*dpr);if(c.width!==W||c.height!==H){c.width=W;c.height=H}var q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,0,0);dnScene(q,w,h,idx,ts*.001)})}
 function dnCmd(f){if(!DN)return null;
  if(/\b(lepj ki|kilep\w*|jatek vege|kiszallok|hagyjuk|dino vege)\b/.test(f))return dnExit();
  if(/\b(meg egyszer|ujra|ujrakezd\w*)\b/.test(f)&&DN.state==='over')return dnStart();
  if(/\b(inditsuk el|inditsd el|kezdjuk el|kezdjuk|indulj|indits)\b/.test(f)&&DN.state==='check'){DN.hand=Math.max(DN.hand,.5);return 'Rendben, várom a kezed a kamera előtt.'}
  if(/^(allj|stop|szunet|varj|megallj|pihenj|pillanat)$/.test(f)){DN.paused=true;return 'Szünet. Ha folytatjuk, mondd: folytasd.'}
  if(DN.paused&&/\b(folytasd|mehet|tovabb)\b/.test(f)){DN.paused=false;DN.lt=Date.now();return 'Megy tovább.'}
  if(/\b(segits\w*|segitseg|sugj\w*)\b/.test(f)&&!/\bwork\b/.test(f))return DN.state==='check'?'Emeld fel a kezed a kamera elé, és tartsd jól látható helyen.':dnHint();
  if(/\b(mutasd.{0,12}(merre|hol)|merre van|hol van)\b/.test(f))return dnHint();
  if(/\b(kovetkezo dino\w*|masik dino\w*|uj dino\w*|kovetkezo)\b/.test(f)){if(DN.state==='play'){DN.n++;dnSpawn();return 'Jön a következő dínó.'}return 'Előbb a kézellenőrzés.'}
  if(/^(loj|lojj|lojj ra|tuz|tuzelj|loj ra|lo)$|\b(loj|lojj)\b/.test(f)&&f.split(' ').length<=3){if(!DN.gun)return 'Emeld fel a kezed, és úgy lőj: kéz nélkül nem tudok lőni.';var ok=dnFire('voice');return ok?'':'Egy pillanat, a fegyver még tölt.'}
  return null}
 function items(){var a=[];if(G&&!G.done)a.push({id:'resume',name:'Folytatás – Szókereső'});if(U&&U.state!=='over')a.push({id:'resumeU',name:'Folytatás – Ütős blokkok'});GAMES.forEach(function(g){a.push(g)});return a}
 function gmRender(){hud(function(x){var e=x.querySelector('.gm');if(!e)return;if(!M){e.classList.remove('on');e.innerHTML='';return}
  var it=items(),top=Math.max(0,Math.min(M.top,Math.max(0,it.length-VIS))),h='<b>JÁTÉKOK</b>';
  if(top>0)h+='<u>▲ följebb ('+top+')</u>';
  it.slice(top,top+VIS).forEach(function(g,k){var n=top+k;h+='<i class="'+(n===M.sel?'s':'')+'"><em>'+(n+1)+'</em>'+g.name.replace(/[<>&]/g,'')+'</i>'});
  if(top+VIS<it.length)h+='<u>▼ lejjebb ('+(it.length-top-VIS)+')</u>';
  h+='<s>Mondd a játék nevét vagy a számát · lejjebb · följebb · vissza</s>';e.innerHTML=h;e.classList.add('on')})}
 function menuOpen(){var it=items();M={sel:0,top:0};if(G&&!G.paused){G.paused=true;G.pa=Date.now();G.mp=true}if(U&&!U.paused&&U.state!=='over'){U.paused=true;U.pa=Date.now();U.mp=true}if(RIDE&&!RIDE.paused){RIDE.paused=true;RIDE.mp=true}if(MG&&!MG.paused&&MG.state!=='over'){MG.paused=true;MG.mp=true;mgRender()}if(DN&&!DN.paused){DN.paused=true;DN.mp=true}gmRender();skRender();
  return it.length?('Játékok: '+it.map(function(g,i){return (i+1)+', '+(g.say||g.name)}).join('; ')+'. Mondd a nevét vagy a számát.'+(G?' A „folytasd” visszavisz a játékba.':'')):'Még nincs játék.'}
 function menuClose(resume){M=null;gmRender();if(resume&&G&&G.paused&&G.mp){G.paused=false;G.mp=false;G.tp+=Date.now()-G.pa}if(resume&&U&&U.paused&&U.mp){U.paused=false;U.mp=false;U.lt=Date.now();uBar()}if(resume&&RIDE&&RIDE.paused&&RIDE.mp){RIDE.paused=false;RIDE.mp=false}if(resume&&DN&&DN.paused&&DN.mp){DN.paused=false;DN.mp=false;DN.lt=Date.now()}if(resume&&MG&&MG.paused&&MG.mp){MG.paused=false;MG.mp=false;MG.lt=Date.now();mgRender()}skRender()}
 function menuPick(i){var it=items(),g=it[i];if(!g)return null;
  if(g.id==='resume'||g.id==='resumeU'){menuClose(true);return 'Visszamentünk a játékba.'}
  menuClose(false);if(G&&G.mp){G.mp=false}G=null;uStop();if(RIDE)rideStop();mgStop();dnStop();return g.start()}
 function menuCmd(f){
  var vr=!!(root&&root.classList.contains('on'));if(!vr)return null;
  var open=!!M,inGame=!!(G&&!G.done)||!!(U&&U.state!=='over')||!!RIDE||!!(MG&&MG.state!=='over')||!!DN;
  var wantOpen=/\b(jatek|jatekok|jatekokat|jatekmappa|jatekmenu|jatek menu|jatek lista)\b/.test(f)&&!/\b(vege|ki|kilep\w*|hagyjuk|uj|kovetkezo|masik|ujra)\b/.test(f)
   &&!(G&&!G.paused&&!G.done&&/\bjatek\b/.test(f)&&!/\bjatekok\w*\b/.test(f)&&G.words.some(function(w){return fz(w)==='jatek'&&!G.found[w]}));
  if(!open){
   if(wantOpen)return menuOpen();
   if(inGame&&/^(vissza|menu|fomenu|lepj vissza|lepjunk vissza|kilepek)$/.test(f))return menuOpen();
   return null}
  /* nyitott menü */
  if(/\b(lejjebb|lefele|lapozz|gorgess\w*|tovabb|kovetkezo oldal)\b/.test(f)||/^le$/.test(f)){var n=items().length;M.sel=Math.min(n-1,M.sel+1);if(M.sel>=M.top+VIS)M.top=M.sel-VIS+1;gmRender();return 'Lejjebb léptem.'}
  if(/\b(f[eo]ljebb|f[eo]lfele|elozo oldal)\b/.test(f)||/^f[eo]l$/.test(f)){M.sel=Math.max(0,M.sel-1);if(M.sel<M.top)M.top=M.sel;gmRender();return 'Feljebb léptem.'}
  if(/\b(folytasd|folytassuk|vissza a jatekba|vissza a jatekhoz)\b/.test(f)&&inGame){menuClose(true);return 'Folytatjuk a játékot.'}
  if(/^(ez|ezt|ezt valasztom|valasztom|inditsd|indits|mehet|ok|oke|rendben)$/.test(f))return menuPick(M.sel);
  if(/\b(vissza|bezar\w*|eltuntet\w*|eleg|jatek el|menu el|jatekok el|kilep\w*)\b/.test(f)&&!/\bvr\b/.test(f)){menuClose(true);return inGame?'Visszamentünk a játékba.':'Bezártam a játékmenüt.'}
  var it=items(),w=f.split(' ').filter(Boolean);
  if(w.length<=4){
   for(var i=0;i<it.length;i++){var nm=fold(it[i].name).replace(/[^a-z ]/g,'');if(it[i].id==='resume')continue;if(f.indexOf(fold(it[i].say||it[i].name))>=0||f.indexOf(nm)>=0)return menuPick(i)}
   for(var k=0;k<w.length;k++){var v=/^\d+$/.test(w[k])?+w[k]:NUMW[w[k]];if(v&&v<=it.length)return menuPick(v-1)}}
  return null}
 var h0=Dx.handle;
 Dx.handle=function(raw){
  var f=fold(raw),self=this,args=arguments,vr=!!(root&&root.classList.contains('on'));
  if(/teljes kepernyo|teljes kijelzo|full ?screen/.test(f)||(/(nagyit\w*|nagyitot|nagyitas|nagyobb\w*|kozelit\w*|zoomol\w*)/.test(f)&&!(G&&!G.done)&&!workOn)){if(vr&&RIDE)root.classList.add('zoomed');return voiceFullscreen(/\b(ki|ablakos|kilep\w*|vege|kicsinyit\w*|normal meret)\b/.test(f))}
  if(vr&&f.length<120&&!(RIDE&&/\b(balra|jobbra)\b/.test(f)&&!/\b(gesztus\w*|szalag\w*)\b/.test(f))){var sc=stripCmd(f);if(sc!==null)return sc;var wb=wkBoxCmd(f);if(wb!==null)return wb}
  if(vr&&RIDE){var rideReply=rideCommand(f);if(rideReply!==null)return rideReply}
  if(vr&&MG){var mgr=mgCmd(f);if(mgr!==null)return mgr}
  if(vr&&DN){var dnr=dnCmd(f);if(dnr!==null)return dnr}
  if(vr&&/\b(dino ?uldoz\w*|dinos? jatek\w*|dino vadasz\w*)\b/.test(f)&&!/\b(vege|ki|kilep\w*)\b/.test(f)&&!(DN))return dnStart();
  if(!vr&&/\b(dino ?uldoz\w*|dinos? jatek\w*)\b/.test(f)&&!/\b(vege|ki)\b/.test(f)){enter(false).then(function(t){var g=dnStart();if(window.DEX_UI)window.DEX_UI.reply(g)});return 'Megnyitom a VR módot, és indítom a dínóüldözést…'}
  if(vr&&/\b(dex orzoje|dex orzo\w*|lebego mag\w*|mag orzoje)\b/.test(f)&&!/\b(vege|ki|kilep\w*)\b/.test(f))return mgStart();
  if(vr&&/\b(csillagvasut|csillag vasut|hullamvasut)\b/.test(f)&&!/\b(vege|ki|kilep\w*)\b/.test(f))return rideStart();
  if(f.length<240){
   var busyHU=!!(M||(G&&!G.done)||(U&&U.state!=='over')||(MG&&MG.state!=='over')||DN);if(vr&&!busyHU&&window.WDEA_HU_VOICE){var act=window.WDEA_HU_VOICE.resolveAction(raw);if(act&&(workOn||/\bwork\b/.test(f))){sendWorkCommand(raw);return act.action==='search'?'Megkeresem a WORK-ben: '+act.query+'.':'Görgetem a WORK felületét '+({up:'feljebb',down:'lejjebb',left:'balra',right:'jobbra'}[act.direction]||'')+'.'}var nav=window.WDEA_HU_VOICE.resolve(raw);if(nav&&!(/\b(cseveges\w*|cset\w*|csat\w*|chat\w*|beszelgetes\w*|kijelzo\w*|kepernyo\w*)\b/.test(f)&&!/\bwork\w*\b/.test(f)&&!/\buzenet\w*/.test(f))&&!(nav.route==='messages'&&!workOn&&!/\bwork\b/.test(f))&&(workOn||/\b(nyis\w*|nyit\w*|mutas\w*|tedd|tegy\w*|rakd|hozd|menj\w*|lepj\w*|ugorj|vidd|valts\w*|navigalj|jelenits\w*|kinyit\w*)\b/.test(f))){if(nav.unsupported)return 'Az e-mail kampányküldés még nincs benne a WORK-ben. A jelenlegi kampányoldal hirdetési piszkozatot készít, e-mailt nem küld.';if(nav.route){setWorkRoute(nav.route);return 'Megnyitom a WORK-ben: '+nav.label+'.'}}}
   if(vr&&!/\bwork\w*\b/.test(f)){
    var CH=/\b(cseveges\w*|cset\w*|chat\w*|uzenet\w*|uzenetablak\w*|beszelgetes\w*|kijelzo\w*|kepernyo\w*)\b/;
    if(/\b(cseveges\w*|cset\w*|chat\w*|csat\w*|beszelgetes\w*)\b/.test(f)&&f.split(' ').length<=2&&!/\b(vissza|el|le|zar\w*|tuntesd|rejtsd|bezar\w*|ki)\b/.test(f)){chatSet(true);return 'Kitettem a kettőnk közti csevegést. Ha a WORK üzeneteit kéred, mondd: work chat. Elrejtés: csevegés vissza.'}
    if(CH.test(f)&&/\b(vissza|el|le|zar\w*|tuntesd|rejtsd|eltuntet\w*|bezar\w*|ki)\b/.test(f)&&!/\b(mutasd|tedd|rakd|hozd|jelenj\w*|elem|nyis\w*|nyit\w*|kinyit\w*)\b/.test(f)){chatSet(false);return 'Elrejtettem a csevegést.'}
    if(CH.test(f)&&/\b(mutas\w*|tedd|tegy\w*|rakd|rakj\w*|hozd|hozz\w*|jelenj\w*|lathassam|lassam|nyis\w*|nyit\w*|kinyit\w*)\b/.test(f)){chatSet(true);return chatOn&&document.querySelectorAll('#inlineMessages .msg').length?'Kitettem a csevegést. Ha beszélgetünk, itt látod. Elrejtés: csevegés vissza.':'Kitettem a csevegést. Még nincs benne üzenet, amint beszélgetünk, megjelenik. Elrejtés: csevegés vissza.'}}
   if(vr){var mc=menuCmd(f);if(mc!==null)return mc}
   if(vr&&U){var uc=uCmd(f);if(uc!==null)return uc}
   if(vr&&G){var gc=gameCmd(f,raw);if(gc!==null)return gc}
   if(vr&&/\b(szokereso|szo kereso|betu racs)\w*\b/.test(f)&&!/\b(vege|ki)\b/.test(f))return startGame();
   if(vr&&/\b(utos blokk\w*|utos jatek\w*|blokk utes\w*|blokkutes\w*)\b/.test(f)&&!/\b(vege|ki|kilep\w*)\b/.test(f))return uStart();
   if(!vr&&/\b(utos blokk\w*|utos jatek\w*|blokk utes\w*)\b/.test(f)&&!/\b(vege|ki)\b/.test(f)){enter(false).then(function(t){var g=uStart();if(window.DEX_UI)window.DEX_UI.reply(g)});return 'Megnyitom a VR módot, és indítom az Ütős blokkokat…'}
   if(!vr&&/\b(szokereso|szo kereso)\w*\b/.test(f)&&!/\b(vege|ki)\b/.test(f)){enter(false).then(function(t){var g=startGame();if(window.DEX_UI)window.DEX_UI.reply(g)});return 'Megnyitom a VR módot, és indítom a szókeresőt…'}
   if(vr&&EXIT.test(f))return leave();
   if(!vr&&/^(jatek|jatekok|jatekmappa|jatek menu|jatekmenu)$/.test(f)){enter(false).then(function(t){var g=menuOpen();if(window.DEX_UI)window.DEX_UI.reply(g)});return 'Megnyitom a VR módot és a játékokat…'}
   if(vr&&WORKV.test(f)){setWork(true);return 'Kitettem a WORK felületet a látómeződ jobb oldalára. Ha el akarod tüntetni, mondd: WORK el.'}
   if(vr&&/\bwork\w*\b.*\b(el|le|zar\w*|tuntesd|rejtsd)\b/.test(f)){setWork(false);return 'Elrejtettem a WORK felületet.'}
   if(!vr&&ENTER.test(f)&&!EXIT.test(f)){enter(false).then(function(t){if(window.DEX_UI)window.DEX_UI.reply(t)});return 'Megnyitom a kamerát a VR módhoz…'}}
  return h0.apply(self,args)};
 /* offline jelzés */
 var of=document.createElement('div');of.id='dyOff';of.textContent='OFFLINE · helyi mód';of.style.cssText='position:fixed;top:8px;left:10px;z-index:30;display:none;padding:4px 10px;border-radius:999px;border:1px solid #ffd27a88;background:#2a1a06cc;color:#ffe7b3;font:600 11px system-ui,sans-serif;letter-spacing:.05em';document.body.appendChild(of);
 function netChip(){var off=navigator.onLine===false;of.style.display=off?'block':'none';return off}
 window.addEventListener('offline',function(){netChip();try{if(window.DEX_UI)window.DEX_UI.reply('Offline módban vagyok. A helyi parancsok, a jegyzetek, a VR és a szókereső működnek; az okos mód és a WORK a számítógépre vár.')}catch(e){}});
 window.addEventListener('online',function(){netChip()});netChip();
 Dx.__vr=1;window.DEX_VR={fov:function(){return spFov()},spaceCmd:spaceCmd,ver:function(){return VRVER},space:function(){return {on:SP.on,dx:SP.dx,dy:SP.dy,sg:SP.sg}},elem:function(){return ELEM.on},spMotion:spOnMotion,shotCmd:shotCmd,shot:function(){return new Promise(function(res){shotMake(function(c,w){res(c?{w:c.width,h:c.height,work:!!w,url:c.toDataURL('image/png')}:null)})})},shotInfo:function(){return SHOT},cam:function(){return {r:CAM.r,m:CAM.m,mode:camMode()}},camSet:function(r,m){camSet(r,m,false)},wkCmd:function(f){return wkBoxCmd(f)},handFront:function(){return {on:HF.on,frames:HF.n,vis:hudVis(),taps:TAPN}},handFrontSet:hfSet,handInfo:function(){return {mode:HD.mode,err:HD.err,loading:HD.loading,base:MPBASE,swipes:GES.seen,grip:GRIP.m,hands:(handsList(Date.now())||[]).map(function(h){return [Math.round(h.px/h.ew*100),Math.round(h.py/h.eh*100),+h.pinchR.toFixed(2)]})}},game:function(){return G},startGame:startGame,enter:function(g){return enter(!!g).then(function(t){if(window.DEX_UI)window.DEX_UI.reply(t);return t})},leave:leave,uStart:uStart,uCells:function(f){var ew=eyes[0]?eyes[0].clientWidth||1:1,eh=eyes[0]?eyes[0].clientHeight||1:1,H=(14+58*f.z)/100,W=H*.62*eh/ew,y1=1-f.b/100,y0=y1-H,a=e2v(f.x-W/2,y0),b=e2v(f.x+W/2,y1),o=[],x,y;if(!a||!b)return o;for(y=Math.max(0,Math.floor(Math.min(a[1],b[1])*36));y<Math.min(36,Math.ceil(Math.max(a[1],b[1])*36));y++)for(x=Math.max(0,Math.floor(Math.min(a[0],b[0])*64));x<Math.min(64,Math.ceil(Math.max(a[0],b[0])*64));x++)o.push(y*64+x);return o},uStop:uStop,ugame:function(){return U},uSpawn:uSpawn,uStep:uStep,uHit:uHit,holds:function(){return !!(M||(G&&G.paused)||(U&&U.paused))},quiet:function(t){var f=fold(t);return !!(U&&U.state==='play'&&!U.paused&&f.split(' ').length<=4&&/\b(uss|utes\w*|utom|ut|bumm|bum|bam|nyomd|nyomas|csap\w*|pofozd|kapd|rajta)\b/.test(f))},chat:chatSet,chatState:function(){return chatOn},menu:function(){return menuOpen()},menuState:function(){return M},addGame:function(id,name,start,say){GAMES.push({id:id,name:name,say:say||name,start:start})},active:function(){return !!(root&&root.classList.contains('on'))},work:setWork,mag:function(){return !!(MG&&MG.state!=='over')},mgState:function(){return MG},mgStep:mgStep,mgSpawn:mgSpawn,gesture:function(on){if(on===undefined)return GES.on;GES.on=!!on;GES.samples=[];csRender();return GES.on},gestureState:function(){return {on:GES.on,seen:GES.seen}},strip:function(on){return on===undefined?CS.on:csSet(on)},stripState:function(){return {on:CS.on,page:CS.page}},stripFlash:csFlash,wkBox:function(){return {r:WKB.r,t:WKB.t,w:WKB.w,h:WKB.h}},ride:function(){return !!RIDE},dino:function(){return !!DN},dnState:function(){return DN},dnStep:dnStep,dnFire:dnFire,dnSpawn:dnSpawn,dnHandFromLm:dnHandFromLm,workOn:function(){return !!workOn}};
})();
