/* DEX / WDEA WORK – magyar, offline kulcsszó- és szófordulat-szótár.
   Determinisztikus navigációs szótár; nem tanított nyelvi modell. */
(function (root) {
  'use strict';
  function norm(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('hu').replace(/[’'`]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  }
  var actions = [
    'nyisd meg','nyissuk meg','nyiss meg','mutasd meg','tedd elem','rakd elem','hozd elem','vidd el','menjunk','menj a','lepj a','ugorj a','nyisd','mutasd','menj','lepj','ugorj','valts','navigalj','keresd meg','keress ra','keresek','hol talalom','hol van','gorgess','gorgess le','gorgess fel','lapozz','mozdits','mozgasd','told','huzd'
  ];
  function resolveAction(utterance) {
    var text=norm(utterance);
    if(!text||/\bne (?:nyisd|nyiss|mutasd|menj|lepj|ugorj|hozd|gorgess|lapozz|mozdits|mozgasd|told|huzd)\b/.test(text))return null;
    var search=text.match(/(?:hol (?:talalom|van|talalhato)|keresd meg|keress(?: ra)?|mutasd meg hol (?:van|talalom))\s+(?:a |az )?(.+)/);
    if(search){var query=search[1].replace(/\b(kerlek|nekem|workben|webshopban|webshopon belul)\b/g,' ').trim();if(query.length>1)return {action:'search',query:query};}
    var vertical=/\b(gorgess|gorget|gorgetes|lapozz|menj|lejjebb|feljebb|felfele|lefele|lefelebb|felfelebb|menjunk)\b/.test(text);
    if(vertical&&/\b(lejjebb|lefele|lefelebb|le|lentebb|lefele iranyba|kovetkezo oldal)\b/.test(text))return {action:'scroll',direction:'down'};
    if(vertical&&/\b(feljebb|felfele|felfelebb|fel|fentebb|fel iranyba|elozo oldal)\b/.test(text))return {action:'scroll',direction:'up'};
    if(/\b(menj|lapozz|gorgess|gorget|csussz)\b/.test(text)&&/\b(jobbra|jobb oldalra|jobbrafele)\b/.test(text))return {action:'scroll',direction:'right'};
    if(/\b(menj|lapozz|gorgess|gorget|csussz)\b/.test(text)&&/\b(balra|bal oldalra|balrafele)\b/.test(text))return {action:'scroll',direction:'left'};
    return null;
  }
  var entries = [
    {route:'profile', label:'Profil', aliases:['profil','profilom','profilomat','profilokra','profilba','sajat profil','felhasznaloi profil','felhasznalo profil','szemelyes adatok','fiokom','avatar','profilkep','profil kep','beallitasokon belul a profil','beallitasok kozott a profil']},
    {unsupported:'emailCampaign', label:'E-mail kampány', aliases:['email kampany','e mail kampany','email kampanyok','hirkampany','hirlevel kampany','hirlevelt kuldj','emailt kuldj','levelezesi kampany']},
    {route:'orders', label:'Rendeléseim', aliases:['vasarlasaim','korabbi vasarlas','korabbi vasarlasok','rendeles','rendeleseim','rendelesek','megrendeles','megrendeleseim','megrendelesek','megrendelt termekek','csomagom','order','orders']},
    {route:'checkout', label:'Pénztár', aliases:['penztar','fizetes','fizetesi oldal','fizetni','megrendelem']},
    {route:'cart', label:'Kosár', aliases:['kosar','kosaram','bevasarlokocsi','shopping cart','cart']},
    {route:'studio', label:'Boltsablon-szerkesztő', aliases:['boltsablon szerkeszto','webshop szerkeszto','webshop kinezet','webshop dizajn','bolt szerkeszto','sablon szerkeszto','sablonszerkeszto','sablon','studio','studioba','weboldal szerkeszto','szerkeszd a boltot']},
    {route:'store', label:'Bemutatóbolt', aliases:['bemutatobolt','bemutato bolt','sajat bolt','bolt oldala','webshop oldala','termekoldal']},
    {route:'shopping', label:'Vásárlás', aliases:['webshop','web shop','webshopot','webshopon','online bolt','vasarlas','vasarlasokat','vasarolni','vasaroljunk','termekek','termekeket','bolt','uzlet','shop','shopping']},
    {route:'business', label:'Üzleti központ', aliases:['uzleti kozpont','vallalkozas','vallalkozasom','ceges oldalam','uzlet kozpont','business']},
    {route:'aiSettings', label:'AI-beállítások', aliases:['ai beallitas','ai beallitasok','hangfelismeres beallitas','hang beallitas','dex beallitas']},
    {route:'settings', label:'Beállítások', aliases:['beallitas','beallitasok','beallitasokon','beallitasokhoz','profilbeallitas','fiokbeallitas','settings','preferenciak']},
    {route:'video', label:'Videók', aliases:['video','videok','videot']},
    {route:'messages', label:'Üzenetek', aliases:['cseveges','cset','chat','beszelgetes','uzenet','uzenetek']},
    {route:'help', label:'Segítség', aliases:['segitseg','sugo','help']},
    {route:'home', label:'Főoldal', aliases:['fooldal','kezdolap','haza','home']}
  ];
  function resolve(utterance) {
    var text = norm(utterance);
    if (!text || /\bne (?:nyisd|nyiss|mutasd|menj|lepj|ugorj|hozd)\b/.test(text)) return null;
    var explicit = actions.some(function (word) { return text.indexOf(norm(word)) >= 0; });
    var shortDestination = text.split(' ').length <= 5;
    if (!explicit && !shortDestination) return null;
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (entry.aliases.some(function (alias) { return text.indexOf(norm(alias)) >= 0; })) {
        return {route:entry.route || null, unsupported:entry.unsupported || null, label:entry.label};
      }
    }
    return null;
  }
  root.WDEA_HU_VOICE = {normalize:norm, resolve:resolve, resolveAction:resolveAction, actions:actions.slice(), entries:entries.slice()};
})(window);
