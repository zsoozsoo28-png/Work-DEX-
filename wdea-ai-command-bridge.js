(()=>{'use strict';
  // Keep this allowlist aligned with the actual WORK page IDs. Never write an
  // arbitrary route supplied by speech recognition or generated assistant text.
  const targets=[
    ['partner',['partner','partnerek','partneren','partnerseite']],
    ['points',['ponttárca','ponttarc','pontok','pénzügy','penzugy','egyenleg','coin','punkte','points','portafoglio punti','punti']],
    ['studio',['stúdió','studio','szerkesztő','szerkeszto','editor']],
    ['video',['videó','video','videók','videos']],
    ['shopping',['webshop','bolt','üzlet','uzlet','vásárlás','vasarlas','termékek','termekek','shop','shopping','store','negozio']],
    ['admin',['admin','vezérlőpult','vezerlopult','control','verwaltung']],
    ['messages',['üzenetek','uzenetek','üzenet','uzenet','messages','nachrichten','messaggi']],
    ['notifications',['értesítések','ertesitesek','notifications','benachrichtigungen','notifiche']],
    ['profile',['profil','profile','profilo']],
    ['settings',['beállítások','beallitasok','settings','einstellungen','impostazioni']],
    ['explore',['felfedezés','felfedezes','keresés','kereses','explore','discover','entdecken','esplora','search','suche','cerca']],
    ['help',['segítség','segitseg','help','hilfe','aiuto']],
    ['home',['főoldal','fooldal','kezdőlap','kezdolap','home','start','startseite','inizio']]
  ];
  const validRoutes=new Set(targets.map(([route])=>route));
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
  const openIntent=/(?:\bnyisd\b|\bnyissuk\b|\bmutasd\b|\bjelenitsd\b|\bmenj\b|\blepj\b|\bugorj\b|\bnavigalj\b|\bvalts\b|\bhozd\b|\bopen\b|\bshow\b|\bgo\s+to\b|\boffne\b|\bgehe\s+zu\b|\bzeige\b|\bapri\b|\bmostra\b|\bvai\s+a\b)/i;
  const correction=/(?:\bhanem\b|\binkabb\b|\bmegse\b|\binstead\b|\brather\b|\bsondern\b|\bstattdessen\b|\binvece\b|\bpiuttosto\b)/ig;
  const negation=/(?:\bne\s+(?:nyisd|mutasd|menj|le[p]?j|ugorj|hozd)\b|\bne\s+open\b|\bdon['’]?t\s+(?:open|show|go)\b|\bdo\s+not\s+(?:open|show|go)\b|\bnicht\s+(?:offnen|zeigen|gehen)\b|\bnon\s+(?:aprire|mostrare|andare)\b)/i;
  let busy=false;
  function findRoute(input){
    let text=normalize(input).trim();
    if(!text||!openIntent.test(text))return null;
    // A spoken correction supersedes the earlier clause. Keep the destination
    // after "instead", or the positive command after a negated command.
    let wasNegated=negation.test(text);
    let cut=-1;correction.lastIndex=0;for(let m;(m=correction.exec(text));)cut=m.index+m[0].length;
    if(cut>=0){const corrected=text.slice(cut).trim();if(openIntent.test(corrected)){text=corrected;wasNegated=negation.test(text)}}
    if(wasNegated){
      const negativeCommand=negation.exec(text);
      const lastPositiveOpen=[...text.matchAll(new RegExp(openIntent.source,'ig'))].at(-1);
      if(!lastPositiveOpen||!negativeCommand||lastPositiveOpen.index<negativeCommand.index+negativeCommand[0].length)return null;
      text=text.slice(lastPositiveOpen.index);
    }
    if(negation.test(text))return null;
    const match=targets.flatMap(([route,words])=>words.map(word=>({route,word})))
      .sort((a,b)=>b.word.length-a.word.length)
      .find(({word})=>text.includes(normalize(word)));
    return match&&validRoutes.has(match.route)?match.route:null;
  }
  function navigate(route){
    if(busy||!validRoutes.has(String(route)))return false;
    busy=true;
    const robot=document.getElementById('wdea-companion'),panel=document.getElementById('wdea-ai-panel');
    if(robot){robot.classList.add('wdea-walk-away');robot.setAttribute('aria-busy','true')}
    if(panel)panel.classList.add('wdea-fold-away');
    setTimeout(()=>{try{window.WDEA_WORK_AI?.close?.();location.hash='#'+route}
      finally{if(robot){robot.classList.remove('wdea-walk-away');robot.removeAttribute('aria-busy')}if(panel)panel.classList.remove('wdea-fold-away');busy=false}},350);
    return true;
  }
  document.addEventListener('wdea-ai-command',e=>{const route=findRoute(e.detail?.text);if(route)navigate(route)});
  document.addEventListener('click',e=>{if(e.target.closest('[data-wdea-control-open]'))navigate('admin')});
  window.WDEA_AI_NAVIGATE=navigate;window.WDEA_AI_FIND_ROUTE=findRoute;
})();
