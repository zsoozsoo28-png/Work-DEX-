/* A WORK kijelzője változatlan. Ez a fájl semmit nem jelenít meg: figyeli a DEX parancsait (ugyanazon a szerveren),
   a WORK meglévő, engedélyezőlistás útvonalkezelőjén (wdea-ai-command) hajtja végre, majd visszajelez a DEX-nek, mi történt. */
(function(){'use strict';
 if(window.WDEA_DEX_LINK||typeof BroadcastChannel==='undefined'||!/^https?:$/.test(location.protocol))return;
 var ch=new BroadcastChannel('wdea-dex');window.WDEA_DEX_LINK=true;
 ch.onmessage=function(e){var d=e.data||{};
  if(d.type==='ping'){ch.postMessage({type:'pong'});return}
  if(d.type!=='cmd'||typeof d.text!=='string')return;
  var text=d.text.slice(0,500),id=d.id,route=null;
  try{if(typeof window.WDEA_AI_FIND_ROUTE==='function')route=window.WDEA_AI_FIND_ROUTE(text)}catch(x){route=null}
  document.dispatchEvent(new CustomEvent('wdea-ai-command',{detail:{text:text}}));
  if(id==null)return;
  if(!route){ch.postMessage({type:'ack',id:id,handled:false});return}
  setTimeout(function(){ch.postMessage({type:'ack',id:id,handled:true,ok:location.hash==='#'+route,route:route})},800)};
 ch.postMessage({type:'hello'});
})();
