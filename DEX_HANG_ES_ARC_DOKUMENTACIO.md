# WDEA DEX + WORK v55.6 — hang és karakter javítás

## Mit változtattunk

- A DEX SVG-száját 20 viewBox egységgel feljebb helyeztük. A szemek, a robot képe, a DEX felirat és az állapotjelzés azonosítói és kezelése változatlan maradtak.
- A DEX fő mikrofonja egy koppintás után folyamatos hallgatási módot tart fenn. Beszéd közben a beszédfelismerés él; a saját visszhangot szűri. A válasz végén automatikusan folytatja a hallgatást.
- A WORK beszélgetőpanel mikrofonja is folyamatos beszélgetési módot használ, és automatikusan újraindítja a böngésző felismerőjét, ha az a csend miatt lezárja a munkamenetet.
- A „beszélgetés vége” és „hang vége” hangparancs lezárja a figyelést. A mikrofon hosszú nyomása szintén lezár. Beszéd közben az „állj”, „stop” vagy „állj, stop” azonnal leállítja a felolvasást, miközben a beszélgetés aktív marad. A mikrofon rövid koppintása ugyanezt teszi.
- A profilmenüben a VR mód alatt külön, lenyitható Játékok lista van; egy játék megérintése szükség esetén megnyitja a VR-t, majd azonnal elindítja a kiválasztott játékot. A lista ugyanazokat a meglévő játékmotorokat használja.
- A szintetikus játékcsipogásokat kikapcsoltuk. A hangmotor, a DEX felolvasása, az animációk, a pontozás, a mozgás- és kézvezérlés megmaradt.
- Az offline gyorsítótár verziója frissült; a beszédmodul gyors hangfájlja is a gyorsítótár-listába került.

## Hangfolyamat

1. Felhasználó egyszer elindítja a hangbeszélgetést.
2. A böngésző hangfelismerője magyar nyelven figyel, és véglegesített mondatrészt továbbít a meglévő DEX/WORK parancs- vagy AI-motornak.
3. DEX válaszol az aktuális, konfigurált hangmotorral.
4. A mikrofon beszélgetési módja aktív marad; a beszéd közben érkező saját hangot visszhangszűrés dobja el.
5. Beszédparancs vagy hosszú nyomás zárja le a beszélgetést.

## Meglévő funkciók

A kód nem cseréli le a helyi DEX parancsértelmezőt, a WORK-hidat, a kézkövetést, a játékvezérlést, a VR navigációt, a beszédhang adaptert vagy a gyorsítótárazott helyi kézkövető fájlokat. A játék csipogásának letiltása minden `uBeep()` effektet elnémít, de nem távolítja el a pontozást, képi jelzést vagy a DEX beszédét.

## Korlátok

- A böngésző Web Speech API-ja automatikusan megszakadhat vagy megtagadhatja a mikrofont; ilyenkor a kód újrapróbálja, de az operációs rendszer mikrofonjelzőjének folyamatos megjelenését nem lehet weboldalról garantálni.
- A beszédfelismerés offline elérhetősége az eszköz és a telepített nyelvi csomag függvénye.
- A WORK beépített asszisztensének szabad nyelvi válaszminősége a beállított modell/szolgáltatás meglététől függ. A hangfolyam nem hoz létre önmagában új offline LLM-et.
- Windows és telefon ugyanazt a webes alkalmazást használja. Kamera/mikrofon csak HTTPS vagy localhost biztonságos környezetben várható.
