/* DEX / WDEA WORK – magyar, offline kulcsszó- és szófordulat-szótár.
   Determinisztikus navigációs szótár; nem tanított nyelvi modell. */
(function (root) {
  'use strict';
  function norm(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('hu').replace(/[’'`]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  }
  var actions = [
    'nyisd meg','nyissuk meg','nyiss meg','mutasd meg','tedd elem','rakd elem','hozd elem','vidd el','menjunk','menj a','lepj a','ugorj a','nyisd','mutasd','menj','lepj','ugorj','valts','navigalj','keresd meg','keress ra','keresek','hol talalom','hol van','gorgess','gorgess le','gorgess fel','lapozz','mozdits','mozgasd','told','huzd','nagyits','nagyitsal','nagyitsd','nagyobb','kozelits','zoomolj','kicsinyits','kicsinyitsel','tavolits','kisebb','hangosits','halkits','nemits','hang be','hang ki','integess','intsd','legyints','kezmozdulat'
  ];
  function resolveAction(utterance) {
    var text=norm(utterance);
    if(!text||/\bne (?:nyisd|nyiss|mutasd|menj|lepj|ugorj|hozd|gorgess|lapozz|mozdits|mozgasd|told|huzd)\b/.test(text))return null;
    var search=text.match(/(?:hol (?:talalom|van|talalhato)|keresd meg|keress(?: ra)?|mutasd meg hol (?:van|talalom))\s+(?:a |az )?(.+)/);
    if(search){var query=search[1].replace(/\b(kerlek|nekem|workben|webshopban|webshopon belul)\b/g,' ').trim();if(query.length>1)return {action:'search',query:query};}
    var vertical=/\b(gorg\w*|gorget\w*|lapoz\w*|menj\w*|indulj\w*|lepj\w*|ugorj\w*|huzd\w*|csusz\w*|gordit\w*|lejjebb|lejebb|lentebb|alabb|feljebb|foljebb|felfele|felfelebb|fentebb|felul|lefele|lefelebb|lefelebb|alul)\b/.test(text);
    if(vertical&&/\b(lejjebb|lejebb|lefele|lefelebb|lefelebb|le|lentebb|alabb|alul|lefele iranyba|kovetkezo oldal|tovabb le)\b/.test(text))return {action:'scroll',direction:'down'};
    if(vertical&&/\b(feljebb|foljebb|foljebb|felfele|felfelebb|fel|fentebb|felul|fel iranyba|elozo oldal|tovabb fel)\b/.test(text))return {action:'scroll',direction:'up'};
    if(/\b(menj\w*|lapoz\w*|gorg\w*|gorget\w*|csussz\w*|mozdits\w*|mozgasd\w*|told\w*|huzd\w*)\b/.test(text)&&/\b(jobbra|jobbrafele|jobb oldalra|jobb fele|jobbra at)\b/.test(text))return {action:'scroll',direction:'right'};
    if(/\b(menj\w*|lapoz\w*|gorg\w*|gorget\w*|csussz\w*|mozdits\w*|mozgasd\w*|told\w*|huzd\w*)\b/.test(text)&&/\b(balra|balrafele|bal oldalra|bal fele|balra at)\b/.test(text))return {action:'scroll',direction:'left'};
    if(/\b(nagyits\w*|nagyit\w*|nagyobb\w*|kozelits\w*|zoomolj\w*|zoom\s*in|hozd kozelebb|tedd kozelebb|kozelebb)\b/.test(text)&&!/\b(ne |neki |nem )/.test(text))return {action:'zoom',direction:'in'};
    if(/\b(kicsinyits\w*|kicsit kisebb|kisebb\w*|tavolits\w*|zoomolj ki|zoom out|vidd tavolabb|tedd tavolabb|tavolabb)\b/.test(text))return {action:'zoom',direction:'out'};
    if(/\b(hangosit\w*|hangosits\w*|hang fel|hangero fel|szolj hangosabban)\b/.test(text))return {action:'sound',direction:'up'};
    if(/\b(halkit\w*|halkits\w*|nemits\w*|hang ki|hangero le|csendesits\w*)\b/.test(text))return {action:'sound',direction:'down'};
    if(/\b(lapoz\w*|kovetkezo oldal|tovabb)\b/.test(text)&&!vertical)return {action:'scroll',direction:'right'};
    if(/\b(elozo oldal|vissza egyet|lapozz vissza)\b/.test(text))return {action:'scroll',direction:'left'};
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
  var motionWords = [
    {action:'fel',aliases:['görgess fel','görgess feljebb','menj fel','menj feljebb','lapozz fel','lapozz felfelé','fentebb','fölfele','mozdítsd fel','told fel','húzd fel']},
    {action:'le',aliases:['görgess le','görgess lejjebb','menj le','menj lejjebb','lapozz le','lapozz lefelé','lentebb','alább','mozdítsd le','told le','húzd le']},
    {action:'jobbra',aliases:['lapozz jobbra','görgess jobbra','menj jobbra','mozdítsd jobbra','told jobbra','húzd jobbra','következő oldal','lapozz','tovább']},
    {action:'balra',aliases:['lapozz balra','görgess balra','menj balra','mozdítsd balra','told balra','húzd balra','előző oldal','lapozz vissza']},
    {action:'nagyítás',aliases:['nagyíts','nagyítsál','nagyítsd','nagyítson','nagyítót','nagyobb','közelíts','zoomolj','hozd közelebb']},
    {action:'kicsinyítés',aliases:['kicsinyíts','kicsinyítsél','kicsinyítsd','kicsit kisebb','távolíts','zoomolj ki','vidd távolabb']},
    {action:'hang fel',aliases:['hangosíts','hangosítsál','hangosítsd','hang fel','hangerő fel']},
    {action:'hang le',aliases:['halkíts','halkítsál','halkítsd','némíts','némítsd','hang ki','hangerő le']},
    {action:'kézmozdulat',aliases:['ints','integess','intsd a kezed','legyints','legyints fel','legyints le','kézzel lapozz','mozdítsd a kezed']}
  ];
  root.WDEA_HU_VOICE = {normalize:norm, resolve:resolve, resolveAction:resolveAction, actions:actions.slice(), entries:entries.slice(), motionWords:motionWords};
})(window);
