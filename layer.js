/* WDEA DEX layer – validated UI edits for the WORK app. No HTML/script from data is ever evaluated:
   only whitelisted properties (color, background, scale, translate, hidden, text) and new buttons whose
   only possible action is "click an existing element". */
(function(){'use strict';
 if(window.DEXLayer)return;
 var HEX=/^#[0-9a-fA-F]{6}$/,SEL=/^[A-Za-z0-9_#.\-\s>:()\[\]="'*,~+]{1,300}$/;
 function nz(t){return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}
 function labelOf(el){if(!el)return '';var t=el.getAttribute&&(el.getAttribute('aria-label')||el.getAttribute('title'))||el.innerText||el.value||el.alt||el.id||'';return String(t).replace(/\s+/g,' ').trim().slice(0,60)}
 function qs(doc,sel){if(!sel||!SEL.test(sel))return null;try{return doc.querySelector(sel)}catch(e){return null}}
 function visible(el){try{var r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;var cs=el.ownerDocument.defaultView.getComputedStyle(el);return cs.visibility!=='hidden'&&cs.display!=='none'}catch(e){return false}}
 function selFor(el){
  var doc=el.ownerDocument,parts=[],n=el,i=0;
  while(n&&n.nodeType===1&&n!==doc.body&&n!==doc.documentElement&&i<8){
   if(n.id&&/^[A-Za-z][\w-]*$/.test(n.id)){parts.unshift('#'+n.id);return parts.join(' > ')}
   var p=n.parentElement,tag=n.tagName.toLowerCase(),idx=1;
   if(p){var k=0;for(var c=p.firstElementChild;c;c=c.nextElementSibling){if(c.tagName===n.tagName){k++;if(c===n){idx=k;break}}}}
   parts.unshift(tag+':nth-of-type('+idx+')');n=p;i++}
  return 'body > '+parts.join(' > ')}
 function ownLabel(el){var t=el.tagName;if(/^(BUTTON|A|INPUT|SELECT|LABEL|H1|H2|H3|H4|SUMMARY|IMG)$/.test(t)||el.getAttribute('role')==='button')return labelOf(el);
  if(el.querySelector&&el.querySelector('button,a,input,select,[role="button"]'))return String(el.getAttribute('aria-label')||el.getAttribute('title')||'').slice(0,60);
  return labelOf(el)}
 function candidates(doc){
  var q='button,a,[role="button"],input[type="button"],input[type="submit"],select,label,h1,h2,h3,h4,nav,header,footer,img[alt],[class*="card"],[class*="btn"],[id]';
  var out=[],seen=[];var all=doc.querySelectorAll(q);
  for(var i=0;i<all.length&&out.length<500;i++){var el=all[i];if(el.hasAttribute('data-dexl-new')||(el.closest&&el.closest('#dexl-host')))continue;if(!visible(el))continue;var lb=ownLabel(el);if(!lb&&!el.id)continue;if(lb.length>60&&!el.id)continue;out.push({el:el,label:lb,sel:selFor(el)})}
  return out}
 function findByLabel(doc,label){
  var L=nz(label);if(!L)return null;var cs=candidates(doc),best=null,bs=0;
  for(var i=0;i<cs.length;i++){var t=nz(cs[i].label)+' '+nz(cs[i].el.id);var s=0;if(t===L)s=3;else if(t.indexOf(L)>=0)s=2;else if(L.indexOf(nz(cs[i].label))>=0&&nz(cs[i].label).length>2)s=1;if(s>bs){bs=s;best=cs[i].el}}
  return best}
 function resolve(doc,e){
  var el=qs(doc,e.sel);
  if(el&&e.label){var a=nz(labelOf(el)),b=nz(e.label);if(a&&b&&a.indexOf(b)<0&&b.indexOf(a)<0){var f=findByLabel(doc,e.label);if(f)el=f}}
  else if(!el&&e.label)el=findByLabel(doc,e.label);
  return el}
 function css(e){
  var p=e.props||{},r=[];
  if(p.color&&HEX.test(p.color))r.push('color:'+p.color+'!important');
  if(p.bg&&HEX.test(p.bg))r.push('background:'+p.bg+'!important','background-image:none!important');
  if(typeof p.scale==='number'&&p.scale>=0.3&&p.scale<=3)r.push('scale:'+p.scale+'!important');
  if(typeof p.tx==='number'||typeof p.ty==='number')r.push('translate:'+(Math.max(-400,Math.min(400,p.tx||0)))+'px '+(Math.max(-400,Math.min(400,p.ty||0)))+'px!important');
  if(p.hidden===true)r.push('display:none!important');
  return r.join(';')}
 function setText(el,t){
  if(!el.hasAttribute('data-dexl-orig'))el.setAttribute('data-dexl-orig',el.textContent);
  if(el.children.length===0){if(el.textContent!==t)el.textContent=t;return}
  for(var n=el.firstChild;n;n=n.nextSibling){if(n.nodeType===3&&n.nodeValue.trim()){if(n.nodeValue!==t)n.nodeValue=t;return}}}
 function clearAll(doc){
  var s=doc.getElementById('dexl-style');if(s)s.remove();
  var a=doc.querySelectorAll('[data-dexl]');for(var i=0;i<a.length;i++){var el=a[i];if(el.hasAttribute('data-dexl-orig')){el.textContent=el.getAttribute('data-dexl-orig');el.removeAttribute('data-dexl-orig')}el.removeAttribute('data-dexl')}
  var n=doc.querySelectorAll('[data-dexl-new]');for(i=0;i<n.length;i++)n[i].remove();
  var h=doc.getElementById('dexl-host');if(h)h.remove()}
 function notify(doc,msg){var d=doc.createElement('div');d.textContent=msg;d.setAttribute('style','position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#222;color:#fff;padding:8px 14px;border-radius:10px;font:14px sans-serif;z-index:2147483647');doc.body.appendChild(d);setTimeout(function(){d.remove()},2600)}
 function apply(doc,edits){
  if(!doc||!doc.body)return{applied:0,missing:[]};
  clearAll(doc);var rules=[],applied=0,missing=[];
  (edits||[]).forEach(function(e){
   if(!e||typeof e!=='object'||!/^[a-z0-9-]{3,40}$/.test(e.id||''))return;
   if(e.kind==='style'){var el=resolve(doc,e);if(!el){missing.push(e.label||e.id);return}
    el.setAttribute('data-dexl',e.id);var r=css(e);if(r)rules.push('[data-dexl="'+e.id+'"]{'+r+'}');
    if(e.props&&typeof e.props.text==='string')setText(el,e.props.text.slice(0,80));applied++}
   else if(e.kind==='new'){
    var par=e.parent?qs(doc,e.parent):null,b=doc.createElement('button');b.type='button';b.setAttribute('data-dexl-new',e.id);b.textContent=String(e.text||'').slice(0,40);
    var st='padding:10px 16px;border-radius:12px;border:0;font:600 15px system-ui,sans-serif;cursor:pointer;';
    st+='background:'+(HEX.test(e.bg||'')?e.bg:'#16a34a')+';color:'+(HEX.test(e.color||'')?e.color:'#ffffff')+';';
    if(!par){var host=doc.getElementById('dexl-host');if(!host){host=doc.createElement('div');host.id='dexl-host';host.setAttribute('style','position:fixed;right:12px;bottom:76px;display:flex;flex-direction:column;gap:8px;z-index:2147483000');doc.body.appendChild(host)}par=host}
    b.setAttribute('style',st);
    b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();var a=e.action;if(!a||a.type!=='click'){return}
     var t=resolve(doc,{sel:a.sel,label:a.label});if(t&&typeof t.click==='function'&&!t.hasAttribute('data-dexl-new'))t.click();else notify(doc,'A cél („'+(a.label||'?')+'”) most nem található ezen az oldalon.')});
    if(e.pos==='prepend'&&par.firstChild)par.insertBefore(b,par.firstChild);else par.appendChild(b);applied++}
  });
  if(rules.length){var s=doc.createElement('style');s.id='dexl-style';s.textContent=rules.join('\n');(doc.head||doc.documentElement).appendChild(s)}
  return{applied:applied,missing:missing}}
 function keep(doc,getEdits){
  var t=null,busy=false,mo=null;
  function run(){if(busy)return;busy=true;try{apply(doc,getEdits())}finally{if(mo)mo.takeRecords();busy=false}}
  try{mo=new MutationObserver(function(muts){for(var i=0;i<muts.length;i++){var m=muts[i];if(m.target&&m.target.closest&&(m.target.closest('[data-dexl-new]')||m.target.id==='dexl-host'||m.target.id==='dexl-style'))continue;clearTimeout(t);t=setTimeout(run,350);return}});mo.observe(doc.body,{childList:true,subtree:true})}catch(e){}
  run();return{rerun:run,stop:function(){try{mo&&mo.disconnect()}catch(e){}clearAll(doc)}}}
 function start(){
  try{if(window.parent!==window&&window.parent.DEX51_EDITOR)return}catch(e){}
  var edits=[];
  fetch('/api/network/dex/layer',{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(!j||!Array.isArray(j.edits))return;edits=j.edits;keep(document,function(){return edits})}).catch(function(){});}
 window.DEXLayer={apply:apply,clear:clearAll,keep:keep,resolve:resolve,candidates:candidates,labelOf:labelOf,selFor:selFor,findByLabel:findByLabel,nz:nz};
 if(window.DEX_LAYER_AUTO!==false){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start()}
})();
