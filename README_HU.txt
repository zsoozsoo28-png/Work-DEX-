WDEA DEX + WORK — TELJES TELEFONOS / BÖNGÉSZŐS CSOMAG
Verzió: v55.7

Ez a mappa a DEX és a WORK teljes, együtt használható statikus webes csomagja. A telefonos és Windowsos böngésző ugyanazt az alkalmazást futtatja; külön Windows-program nincs benne.

INDÍTÁS TELEFONON
1. A fájlokat a GitHub Pages-re vagy más HTTPS tárhelyre töltsd fel, a mappa teljes tartalmával.
2. Nyisd meg az index.html-t a közzétett HTTPS címen, engedélyezd a kamerát és a mikrofont.
3. Egyszer töltsd be internetkapcsolattal, hogy az offline gyorsítótár frissüljön.
4. Ezután a DEX/WORK helyi, már gyorsítótárazott részei internet nélkül is megnyithatók.

INDÍTÁS WINDOWS-ON
- Ugyanez a mappa használható naprakész Chrome vagy Edge böngészőben.
- A kamera és mikrofon engedélyezéséhez HTTPS cím vagy localhost szükséges; a file:// megnyitás nem megfelelő.
- Egyszerű helyi próbához, ha Python telepítve van: nyiss PowerShellt ebben a mappában, futtasd: py -m http.server 8080, majd nyisd meg: http://localhost:8080/ .
- A Windowsos példányban is ugyanaz a teljes index.html, WORK oldal, hangmotor-adapter, kézkövető modul, képek és offline gyorsítótár szerepel.

BESZÉLGETÉS
- Koppints egyszer a mikrofonra a hangos beszélgetés indításához. A mikrofon a DEX válasza alatt is beszélgetési módban marad; a böngésző hangfelismerése a válasz hangját igyekszik kiszűrni.
- Normál mondatokban beszélhetsz; a rövid szünet után a DEX feldolgozza a mondatot, válaszol, majd folytatja a figyelést.
- A beszélgetés lezárása: mondd „beszélgetés vége” vagy „hang vége”, illetve tartsd nyomva a mikrofont kb. 1 másodpercig.
- Ha a DEX beszéde közben azonnal le akarod állítani, mondd: „állj” vagy „stop”. Az „állj, stop” együtt is működik. Ez csak a felolvasást szakítja meg; a beszélgetési mód aktív marad. A mikrofon rövid koppintása ugyanezt teszi.
- Játék indítása a profilmenüből: VR mód → Játékok → válaszd ki a játékot. A kiválasztott játék közvetlenül elindul a VR-nézetben. A játékok mesterséges csipogó effektjei ki vannak kapcsolva. A DEX beszéde, a képi visszajelzés, a kézvezérlés és a játékmechanika marad.
- A hangfelismerés és a beszédhang elérhetősége böngésző-, operációsrendszer- és hangcsomag-függő. Offline a helyi parancsok működnek; a szabad, általános kérdésekhez külön konfigurált AI-szolgáltatás/modell szükséges.

DEX-ARC
- A beszéd közbeni SVG-szájvonalat 20 egységgel feljebb helyeztük a DEX fejnézetében, hogy a szemek alatti arcpanelen maradjon.
- A „Figyelek / Hallgatlak / Beszélek” állapotjelzés és a száj animációja külön elem.

FONTOS KORLÁT
A telefonos VR változat fej/telefon irányfordulást tud követni. Nem méri pontosan a telefon helyváltoztatását, nem készít valódi térbeli 3D horgonyt, és a bútorok mögötti fizikai takarást sem érzékeli.
