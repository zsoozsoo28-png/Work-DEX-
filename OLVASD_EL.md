# WDEA – egy mappa, mindennel

```
WDEA/
├─ START_WDEA_WINDOWS.bat   ← ezt indítod Windowson (Mac/Linux: START_WDEA.sh)
├─ RENDSZER/
│   ├─ dex/      DEX asszisztens + az egyetlen admin felület
│   ├─ drive/    DRIVE – autókereskedés / járműrendszer
│   ├─ work/     WORK – a közösségi oldal (V6.5.30)
│   └─ network/  a szerver programja (nem kell hozzányúlni)
└─ ADATOK/       az első indításkor jön létre: itt vannak az adataid
```

## Indítás
1. Python 3.9+ kell (python.org, telepítéskor: „Add Python to PATH”).
2. Dupla katt: `START_WDEA_WINDOWS.bat`. Első alkalommal admin e-mailt és legalább 12 karakteres jelszót kér.
3. A fekete ablak kiírja a címeket. Hagyd nyitva.
   - DEX: https://localhost:8443/dex/index.html
   - DRIVE: https://localhost:8443/drive/index.html
   - WORK: https://localhost:8443/work/index.html
   - Ha csak https://localhost:8443/ címet nyitod meg, a DEX nyílik.
4. A böngésző figyelmeztet (saját tanúsítvány): „Speciális” → „Tovább”.
5. Admin: DEX → a DEX felirat 8 koppintása → Admin belépés.

## A WORK és a DEX
A WORK (`RENDSZER/work`) ugyanazon a szerveren fut, a kijelzője és a saját robotja változatlan. A DEX kívülről irányítja: ha a DEX-nek (a /dex/ címen) azt mondod, hogy „nyisd meg a videókat”, a már nyitott WORK-ablak átvált arra az oldalra. Ehhez a két oldalt ugyanazon a szerver-címen kell megnyitni (két lap vagy ablak).
A WORK saját külön szerverét és admin felületét ebbe a csomagba nem tettem bele.

## Admin felület (a DEX-ben, egyetlen)
Főoldal · Indítás · DRIVE · Felhasználók · Jelentések · Zárak · Frissítés · Beállítások.
- **Zárak:** az e-mail kód alapból KI van kapcsolva.
- **Frissítés:** új DEX index.html feltöltése piszkozatként, teszt, élesítés, visszaállítás.
- **Rendszerbemutató:** kis gomb a DEX főképernyőn, koppintásra felolvassa a bemutatót; oldalra húzva eltűnik, a bal szélről visszahúzva előjön.

## Ami nincs tesztelve
Valódi e-mail küldés, valódi telefon, valódi mikrofon/ElevenLabs, élő AI-modell; az Android projekt nincs lefordítva; a WORK modulok még nincsenek rákötve a kiadási kapura. A felületen azok a mérések, amiket a szerver nem naplóz (országok, eszköztípusok), szürkén, „nincs mérve” jelzéssel látszanak, kitalált számot nem mutat.

## Okos, emlékező DEX (saját gépen futó modell)
A DEX agya egy a számítógépen futó modell lehet (Ollama), a szerveren át: a telefon is ezt használja, kulcs és internet nélkül.
1. Telepítsd az Ollamát a számítógépre (ollama.com), majd egy parancssorban: `ollama pull qwen2.5:7b-instruct`
2. Indítsd a WDEA-t, nyisd meg a DEX-et a szerverről (https://…:8443/dex/), lépj be adminként (8 koppintás a DEX feliraton).
3. Beállítások → OKOS MÓD → bekapcsolás → Szolgáltató: „Saját gép (Ollama, a szerveren át)” → Mentés.
A DEX ezután természetesen beszélget, emlékszik az utolsó ~8 körre, és megjegyzi, amit magadról mondasz (a Jegyzeteid mellett). Másik Ollama-cím: a `WDEA_LLM_URL` környezeti változó (alap: http://127.0.0.1:11434).
Korlátok: a magyar minőség a modelltől és a gép erejétől függ; lassabb gépen a válasz másodpercekig is tarthat. Az emlékek jelenleg az adott eszközön tárolódnak, a telefon és a gép között még nem szinkronizálódnak.

## Kép és kamera a DEX-ben
A chat sávban a 🖼 gomb: „Kép feltöltése" vagy „Kamera". Képet be is lehet illeszteni (Ctrl+V) a beírómezőbe. A kép a chatben megjelenik, és ugyanazon az egy csatornán megy a látó modellhez (`/api/network/dex/llm`). Amíg nincs látó modell beállítva (Ollama: pl. llava vagy qwen2.5vl; Beállítások → Okos mód → Saját gép), a DEX ezt szóban jelzi. A sablon-másolás képről és a kamerás hibafelismerés ugyanerre a csatornára épül majd.

## Kinézet és gép (admin → „Kinézet” fül)
- Kinézet-választó: Eredeti (alap), Ruhás, Saját kép. A választás a szerveren is elmentődik.
- Látó modell: itt adod meg, melyik Ollama-modell nézze a képeket (alap: llava).
- Közös memória: a megjegyzett tények és a beszélgetés a szerveren is mentődnek, így a telefon és a gép ugyanazt tudja.
- Távoli elérés: ingyenes Cloudflare-alagút egy gombbal. Előtte egyszer telepíteni kell: `winget install Cloudflare.cloudflared`. Nyilvános elérés előtt kapcsold be az e-mail zárat.

## Részletes képnézés (zoom, összehasonlítás, másolás)
- Több kép is csatolható (🖼 gomb, legfeljebb 3). Két képnél az 1. a MINTA, a 2. az EREDMÉNY: a DEX részletről részletre megmondja, miben tér el.
- Ha a kérésedben ilyen szó van (részletesen, nagyítsd, hiba, különbség, nézd meg…), két menetben dolgozik: előbb áttekinti, kijelöli a fontos részeket, majd azokat az eredeti felbontású képből kivágva, nagyítva újra megnézi. A nagyított részleteket a chatben is megmutatja.
- Kép nélkül is mondhatod: „nagyítsd rá”, „nézd meg közelebbről” – az utolsó képpel dolgozik (30 percig).
- „Csináld meg úgy, ahogy a képen van”: részletes kinézet-tervet készít (színek, betű, elemek), és elmenti. Ebből a tervből automatikus oldalépítés még nincs, az a következő lépés.
- Mindez csak akkor működik, ha az Ollama fut és a látó modell (pl. llava) le van töltve.

## Újdonságok a v17-ben
- **Asztali nézet**: nagy képernyőn (900 px szélesség fölött) a DEX kitölti az egész ablakot, nagyobb alakkal, középre igazított beíró sávval és chat-lappal. Telefonon semmi nem változott.
- **Visszajelzés a WORK-ből**: ha a DEX parancsára a WORK végrehajt valamit, a DEX ki is mondja („Rendben, megnyitottam…"), nem „nem értem". A WORK kinézete érintetlen.
- **Folyamatos mikrofon**: egyszer megnyomod, bekapcsolva marad, annyit beszélsz, amennyit akarsz; ha megállsz, a DEX az egészet egy üzenetként érti meg és válaszol. Közben, amíg a DEX beszél, a mikrofon szünetel. Másodszor megnyomva kikapcsol.
- **Hosszabb, többtagú mondatok**: „szia, a téma legyen lila és mutasd a parancsokat" – részekre bontva mindet végrehajtja.
- **Telefonos nézet rendezve**: a két menü (DEX és WDEA) egymás mellett, egyenes sorokban áll az alak alatt, nem ferdén, összevissza. A régi oldalról behúzható panel továbbra is működik.
- **Nyugodt DEX (v19)**: a kézmozdulatok, a szív, a forgás és az ezekhez tartozó gombok le vannak véve; a DEX áll, pislog, és beszéd közben mozog a szája. Telefonon a két menü rendezetten, egymás mellett áll az alak alatt, a lebegő dobozok nélkül.

## Újdonságok a v21-ben (a koncepcióképek szerint)
- **Tiszta főoldal**: csak a DEX, alatta a „Figyelek” állapot (Hallgatlak / Beszélek is), a beszélgetés és a beíró sáv. A két oldalsó menü láthatatlan, de oldalról húzva még előjön; az Admin → Kinézet és gép → „Főoldal · oldalmenük” kapcsolóval vissza lehet tenni a háttérbe.
- **Profil-gomb** jobb felül: Profil, CONTROL / ADMIN (Csak neked), Beállítások, Kijelentkezés. Ugyanide visz a nyolc koppintás a DEX feliraton is: belépés után a DEX CONTROL menü nyílik.
- **DEX CONTROL**: Tulajdonos jelvény, nagy menüsorok (Rendszer, Felhasználók, Modulok, DRIVE, Biztonság, Naplók, Frissítés, Kinézet és gép, Beállítások). Almenüből a nyíl a menübe visz vissza, onnan ki.
- Chat buborékok DEX- és felhasználó-avatarral.

## v22
- A régi két oldalmenü végleg eltűnt a főoldalról (húzásra sem jön elő). Minden funkciója a **CONTROL / ADMIN** menüben van: „RENDSZEREK” (WORK, DRIVE, STUDIO) és „DEX FUNKCIÓK” (Beszélgetés, Segítség, Feladatok, Információk, Mindig veled, Beállítások, Memória, Jegyzetek, Téma, Hang, Visszavonás, Alaphelyzet).
- A **Bemutató** gomb a profil-gomb mellett van, fent jobbra.

## v23
- A **Bemutató** a profil-ablakban van (a profil-gombra koppintva az első sor), fent nem lebeg külön gomb.
- A DEX felirat és a profil-ikon doboz nélkül, lágyan lebeg (felhőszerű, lassú mozgás). A beállított „kevesebb mozgás” esetén áll.

## v24
- Új DEX-fej (átlátszó háttérrel, a pislogás és a beszéd közbeni D-fény az új szemekhez igazítva).
- Egységes, mozdulatlan háttér: nincs város, gyűrű, aura, csillag, lebegő kártya. A „téma” parancsok (pl. „legyen a téma lila”) továbbra is átszínezik.

## v25
- Az előlapról lekerült a kép-gomb a beíró sávból. A „+” lapon már csak: Fénykép készítése, Videó felvétele, Fájl választása, Bezár. A DEX szeme (kép feltöltése, kamera) a CONTROL / ADMIN → DEX FUNKCIÓK alatt érhető el.
- Az üzenetek lebegnek: nincs doboz és fejléc, a buborékok közvetlenül a háttéren úsznak (a „Bezárás” kis gomb jobb felül).

## v26 – chat üzenetek
- Az üzenetek doboz nélkül, lebegő szövegként jönnek, egymásra nem csúsznak, és nem érnek a DEX feje fölé (a chat magassága a fej és a beíró sáv közé igazodik).
- A DEX üzenetei elé a DEX-fej képe kerül kis avatarként; a te üzeneteid jobbra, avatar nélkül.
- Beíró sáv: a hullám helyén hangszóró (felolvasás be/ki) és csetjel (beszélgetés nyit/zár); a mikrofon marad.

## v27 – gyorsabb, megszakítható okos mód
- A szerver betöltve tartja az Ollama modellt (előmelegítés + 4 percenként frissítés): ez volt a lassúság és a „megszakadt” hibák oka. A várakozási idő 290 mp-re nőtt; rövidebb előzmény és válasz (gyorsabb).
- Ha új üzenetet küldesz, a futó kérés megszakad, és a késői válasz sosem érvényesül (nem állít át utólag semmit).
- Közbeszólás: a DEX beszéd közben is hallgat; a saját hangját (visszhang) eldobja, de „állj / várj / stop” vagy bármi új mondat elhallgattatja. Kikapcsolható: DEX_LISTEN.barge(false).
- „Mondd még egyszer”, „mit mondtál”, „folytasd” megismétli az utolsó választ; az okos mód tudja, ha közbevágtak.
- A nevét egybe mondja: „Dex”, nem betűzve.
- Zöldre állt felület: mondd „alaphelyzet” vagy „állíts vissza mindent”.

## v28 – WORK mód, mikrofon visszhang nélkül, folyamatos beszélgetés
- „WORK mód” / „beszéljünk a WORK-ről”: onnantól minden parancs a WORK oldalra vonatkozik (a „chat” ott a WORK Üzenetek eleme, nem a DEX-é). „DEX mód”: vissza. Egyszeri: „a workben a kosár legyen zöld” / „a dexben a háttér legyen zöld”. Adminként lépj be hozzá. A WORK megjelenéséhez a szerkesztő előnézete és jóváhagyása nélkül nem nyúl. Az okos mód (Ollama) a szerkesztőben is működik.
- DEX mikrofon: beszéd közben kikapcsol, a beszéd vége után 1,5 mp-et vár, és a lecsengő visszhangot eldobja – nem hallja magát. Félbeszakítás: mikrofon gombra vagy a DEX fejére koppintva (elhallgat, és azonnal hallgat). Fejhallgatóval: „fejhallgató mód be” (közbeszólás hangosan is).
- WORK középső „Hang” gomb: folyamatos beszélgetés (egyszer megnyomod); a WORK AI beszéde alatt kikapcsol, utána visszakapcsol; beszéd közben a gombra koppintva félbeszakítod; csendben megnyomva kikapcsol. Kinézete változatlan.

## v29 – VR mód (telefon a VR-szemüvegben)
- Indítás: profil-menü → „VR mód”, vagy hangon: „VR mód”. Kilépés: „VR vége”, vagy háromszor koppintasz a képernyőn.
- Fekvő, kétszemes kép: a hátsó kamera élő képe mindkét szemnek (ugyanaz a kép, nem valódi 3D), rajta a DEX feje, az állapota („Hallgatlak/Beszélek”) és a beszélgetés szövege; a mikrofon folyamatosan hallgat. Álló telefonon magától elforgatja a képet.
- „Mutasd a WORK-öt”: a WORK felület kis ablakban megjelenik a látómező jobb oldalán; „WORK el”: eltűnik.
- Kamera csak biztonságos (https) címen működik; az első indításkor engedélyezd a kamerát.
- FIGYELEM: csak zárt térben, helyben állva vagy ülve használd. Sétálni, közlekedni tilos (késés, beszűkült látás).

## v30 – Szókereső a VR módban
- Hangon: „indíts egy szókeresőt” (ha a VR nincs bekapcsolva, azt is elindítja). 8×8-as áttetsző betűrács a kameraképen mindkét szemnek, jobbra a keresendő szavak (előre olvasva: vízszintes, függőleges, átlós).
- „Megvan, HOLD” (vagy csak a szót kimondva): a betűk kifénylenek és áthúzódnak, a szó a listában is áthúzva. Mind meg: gratulál és kimondja az időt.
- „tipp” (kezdőbetű villog), „szünet” / „folytasd”, „nagyítsd” / „kisebb”, „következő játék”, „szókereső vége”. A VR-ből kilépve a játék is megszűnik.
- Sétálás, közlekedés közben ne használd!

## v31 – Offline működés, rövid VR-parancsok
- Elég annyit mondani: „VR” (bekapcsol), „VR vége” (kikapcsol). Szókeresőnél elég kimondani a szót (pl. „HOLD”), és áthúzza; kisebb kiejtési eltérést is elfogad.
- Telefon offline: a DEX az első megnyitás után eltárolja magát (service worker), hálózat nélkül is elindul. A beépített parancsok, VR, szókereső, jegyzetek, beállítások offline is mennek. Fent a „offline” jelzés látszik.
- Offline beszédfelismerés: ha a telefonon van letöltött magyar hangcsomag, azt használja (Android: Beállítások → Google → Hangalapú → Offline beszédfelismerés → Magyar).
- FONTOS: a service worker csak megbízható https címen vagy localhoston települ. Az önaláírt LAN-tanúsítvány (https://192.168…:8443) NEM elég – ahhoz egy megbízható https alagút (pl. cloudflared) kell. Egyszer nyisd meg így, utána offline is megy.
- Offline NEM megy: Ollama okos mód (a PC kell), WORK, admin, ElevenLabs hang, szerver-szinkron. Ezek helyett a beépített parancsok és a böngésző saját hangja működik.
- WORK szerkesztés offline: amit a szerkesztő már egyszer megnyitott hálózattal, az oldal pillanatképét eltárolja; offline azon dolgozhatsz, a „közzététel” sorba kerül, és hálózat esetén magától megtörténik (ha közben más módosított, nem ír felül, szól).
- Kamera nélküli VR: ha nincs kamera (vagy file:// megnyitás), sötét háttéren mutatja a két szemet.
- DEX_TELEFON_OFFLINE mappa: önálló, szerver nélküli DEX-másolat (https/localhost-ról tedd fel).

## v32 – Egyesített csomag (a te DEX_WORK_OFFLINE_V1 változatod beépítve)
- VR-ben a képen nincs DEX-fej, állapotsor, beszélgetés-szöveg és lábléc: csak a kamera, a (kicsi, áttetsző) WORK-ablak és a szókereső. A „VR” és „VR vége” rövid parancs megy.
- WORK a VR-ben: „mutasd / tedd elém a WORK-öt”, „WORK el”. A VR-ablak a WORK-öt a szerveren a /work/index.html címen nyitja (a DEX a /dex/ alatt van), a GitHub-es offline mappában a ./work/index.html címen.
- WORK-parancsok VR-ben: „keresd meg …”, „nyisd meg …”, „írd át … erre …”, „színezd át … kékre”, „vond vissza a módosításokat”. Ezek csak VR-ben (vagy kimondott „WORK” esetén) mennek a WORK felé; VR-en kívül a régi DEX-parancsok változatlanok.
- A WORK kinézete változatlan; a hozzáadott híd (dex/dex-work-bridge.js) csak parancsot fogad.
- Kamera nélkül a DEX hangosan jelzi, hogy kamerakép nélkül indult (a képen nincs felirat).
- DEX_TELEFON_OFFLINE: kész, GitHub Pages-re feltölthető offline csomag (README_VR_HU.txt a lépésekkel). Kamera csak https/localhost címen.

## v33 – Játékmenü, csevegés VR-ben, Ütős blokkok, „állj / stop”
- Játékmenü (VR-ben): „játékok” / „játék” → áttetsző felirat a szem előtt, mindkét szemben. Választás: a játék neve vagy száma („egy”, „ütős blokkok”). „lejjebb” / „följebb” lapoz, ha sok a játék. „vissza” bezárja. Ha játék közben mondod, hogy „vissza” (vagy „játékok”), a játék szünetel, a menü első sora a „Folytatás”; „folytasd” visz vissza a játékba, de másik játékot is választhatsz.
- Csevegés VR-ben: „mutasd a csevegéseket” / „tegyél elém egy kijelzőt” → az utolsó két üzenet áttetszően megjelenik alul, és beszélgetés közben frissül. „csevegés vissza” / „csevegés el” elrejti.
- Ütős blokkok: vicces blokk-figurák sétálnak feléd. Üss feléjük a kezeddel a kamera előtt (a kamera látja a mozdulatot), vagy mondd: „üss” – a legközelebbi, elérhető figura elesik. Három életed van: ha egy figura hozzád ér, vesztesz egyet. Sapkás figura két ütést bír, a piros bomba (TNT) NEM ütendő (elvesz egy életet), az arany figura plusz életet ad. Minden 8. leütésnél szintet lépsz, gyorsulnak. „állj” szünet, „folytasd” folytat, „még egyszer” újra, „szabályok” elmondja a lényeget, „ütős blokkok vége” kilép. A rekord a telefonon marad.
- A játék elején Dex egyszer röviden elmondja a szabályt (újrakezdésnél nem), és közben is megállítható.
- „állj” / „stop” / „elég” / „hallgass”: ha Dex beszél, ezekre egyből elhallgat (a mikrofon beszéd közben csak erre figyel, minden mást eldob, így a saját hangját nem veszi át). Csak a TELJES, önálló szó állít meg: a „stop gombot írj oda” nem. „folytasd” onnan folytatja a megszakított beszédet, ahol abbahagyta.
- Játékban, ha Dex nem beszél, az „állj” szünetet tart.

## v34 – javítások
- VR-ben, ha a WORK oldal nincs a tárhelyen (404), a DEX nem tesz ki üres hibaablakot, hanem szól, hogy a work/index.html hiányzik.
- Beszédfelismerés: ha a telefon halmozva ismétli a mondatot („tedd ide / tedd ide a / tedd ide a work…”), most egyetlen mondatként küldi el.

## v35 – WORK az adminból, mappa nélküli GitHub-csomag
- CONTROL / ADMIN: két új gomb a „WORK szerkesztő” mellett: „WORK megjelenítése” (a WORK előnézete a DEX-en belül, fent „← Vissza a DEX-hez”) és „Átlépés a WORK-be” (átvisz a WORK oldalra; a böngésző „vissza” gombjával jössz vissza a DEX-hez).
- GitHub-csomag (WDEA_GITHUB_FELTOLTES.zip): mappa nélküli, lapos szerkezet, telefonról is egyszerre feltölthető. A DEX az index.html, a WORK a work.html. Fontos: az index.html a DEX, a work.html a WORK, ne cseréld össze őket.
- A DEX a WORK-öt a work/index.html (mappás) vagy a work.html (lapos) címen keresi; a PC-s szerveren a /work/index.html-t.
- Szókereső: amíg a „játék” szó keresendő a rácson, a „megvan, játék” szót jelent, nem a menüt nyitja. A menüt a „játékok” nyitja.

== v36: WORK vezérlése hanggal a VR-ben ==
Mondhatod (VR-ben, kimondott „WORK" nélkül is, ha a WORK ki van téve):
 • „nyisd meg a vásárlásokat / üzleteket" · „mutasd a termékeket" (bemutatóbolt) · „nyisd meg a kosarat" · „nyisd meg a rendeléseket"
   – ezeknél, ha a WORK még nincs kint, magától kiteszi és megnyitja.
 • „nyisd fel a csetet / üzenetablakot / üzeneteket" – ha a WORK látszik, a WORK Üzenetek oldalát nyitja;
   ha a WORK nincs kint, a DEX saját csevegését teszi ki. „WORK üzenetek"-nél mindig a WORK-ét.
 • „csevegés" szóra (pl. „mutasd a csevegéseket") mindig a DEX saját csevegése jön.
 • További WORK-oldalak (WORK látszik, vagy kimondod, hogy „WORK"): főoldal, felfedezés, értesítések, profil, beállítások, segítség, pontok, közösségek, mentettek, ügyfélszolgálat.
 • Görgetés (a WORK látszik): „görgess lejjebb / feljebb", „kicsit lejjebb", „sokat lejjebb", „lejjebb", „csússz feljebb",
   „görgess az aljára / a tetejére". Mindkét szemen egyszerre.
 • A játék-menü és a játékok elsőbbséget élveznek: megnyitott menüben a „lejjebb" a menüt lapozza.

== v37 ==
Beépítve a feltöltött csomagod változásai (Csillagvasút, wdea-hu-voice.js, WORK-kézlapozás, WORK-szótár) – védőkorlátokkal, hogy a menü, a játékok és a csevegés ne akadjanak össze velük.
Új: gesztusvezérlés (alapból KI; „gesztus mód”), irányító szalag, WORK-ablak mozgatása/méretezése, vízszintes lapozás, szigorúbb ütésfelismerés az Ütős blokkokban.

== v38: DEX Dínóüldözés ==
Új VR-játék: „játékok” → „DEX Dínóüldözés” vagy „dínóüldözés”. Kézkövetés (MediaPipe, első indításkor internet kell a modellhez, utána a telefon eltárolja), kézhez kötött pisztoly, lövés csippentéssel vagy „lőj”-jel, kéz nélkül nincs pisztoly és nincs lövés.
Parancsok: indítsuk el · segíts · mutasd, merre van · következő dínó · állj · folytasd · lépj ki.
Korlát: valódi bútor mögé nem bújik a dínó; a kézfelismerést valódi kamerán a telefonodon kell kipróbálni.

ÚJ (v39): WORK EGYSÉGES FELÜLET + VR-PARANCSOK
 • WORK: egységes betűskála, csak a szöveg nő nagyobb betűnél (kártya/kép nem torzul), szűk helyen a kép a felirat fölé kerül, közös visszafogott színalap. Funkciók változatlanok.
 • VR-ben: „work”, „webshop”, „shop”, „főoldalt tegyél elém”, „csetet tegyél elém”, „üzeneteket/kosarat/profilt/rendeléseket mutasd” – a WORK akkor is előjön, ha nem volt kint. Félrehallásra is (pl. „vörköt tedd elém”).
 • „kattints a DEX-re” – a WORK-ön belüli DEX-csevegő kinyílik. „menüt hozd ki/csukd be a workben”.
 • Kézmozdulat (gesztusmód alapból BE): fel/le = görgetés, balra/jobbra = lapozás, ha nincs mit lapozni, kijön a WORK menüje. Érintés a VR-ablakon átmegy a WORK-be. Ha zavar a véletlen görgetés: „gesztus ki”.
 • „kapcsold be a gombot” = hang gomb. „kapcsold ki a hangszórót” = felolvasás ki. „tedd át a hangszórót”: a böngésző nem tudja átváltani a hangkimenetet, a telefon értesítési sávjában kell választani.
 • Valódi telefonon kell kipróbálni: kézgesztusok, érintés a VR-ablakon, a WORK VR-ablak megjelenése (a képek külső forrásból jönnek, offline csak a képfelirat látszik).

== v40: kézkövetés, csipesz, hangos ablakméret ==
Lásd DEX_TELEFON_OFFLINE/GITHUB_LEPESEK.txt (v40 rész). A kézmodell az mp mappában van (RENDSZER/dex/mp és DEX_TELEFON_OFFLINE/mp).


## v41
- GitHub: 8 koppintás a DEX címén = admin (zár nélkül), hang: "Zsolt nyolcvannyolc admin"
- Profil menü: WORK
- "chat" = DEX csevegés, "work chat" = WORK üzenetek
- "kézkövetés" / "kézkövetés állapot" / "kézkövetés újra"


## v42
- Kéz a kép előtt: kivágott kéz a WORK fölött, rövid csipesz = kattintás (hang: "kéz a kép előtt be/ki")


## v43
- Kamera forgatás, screenshot parancs, csík nélküli kéz, hologram WORK


## v44
- Átlátszó ablak a kéz fölött, kitolás mélységgel, térbe tétel, elemenkénti mozgatás


## v45
- Térbe tétel szóváltozatok, verzió-parancs, elem-mozgatás szavak


## v46
- 360 fokos térbe tétel (forgáskövetés), sötétebb átlátszó ablak

## v47
- A v46.1 hangparancs-bővítések átvéve és javítva: a "görgess jobbra/balra" és a "lapozz balra" jó irányba megy, a "teljes képernyő", "töltsd ki" és "maximum" kitölti a WORK-ablakot, a sima "alaphelyzet" visszaállítja.
- Térbe tétel: az ablak helyét a telefon tájolásából számolom, ezért bólintásra már nem csúszik oldalra.
- Új parancsok: "tér kalibrálás" és "tér állapot". A "melyik verzió" válasza: v47.

## v48
- Megnyitás/bezárás animáció, rámutatás-kiemelés ("kiemelés ki/be").
- Szél-, sarok- és tetőfogás méretezéshez; két kézzel sarokfogás; kétujjas nyitás zárt WORK mellett.
- Döntés kézzel (két kéz, az egyik közelebb) és hangra ("döntsd balra", "ablak egyenesen").
- "szálak be/ki" szálas kéz-effektus; "nyiss egy második ablakot" / "második ablak bezár"; "xr próba". A "melyik verzió" válasza: v48.

## v49
- Valódi, körbejárható tér (WebXR AR): "tedd le" / "kiemel" / "hagyd ott" / "marad" … után egy koppintás indítja; az ablak a szobában marad, körbejárható. Kattintás nézéssel + koppintással; hang: "hozd ide", "közelebb", "távolabb", "tér vége".
- A kézi döntés iránya megfordítva. A gomb-kiemelés kapcsolója: "rámutatás ki/be". A "melyik verzió" válasza: v49.

## v50
- Quest-stílus: fehér körvonalas kéz ("körvonal ki/be"), fehér keretes kiemelés, dokksáv az ablak alatt a WORK oldalaival ("dokk ki/be"), valódi térben ívelt nagy ablak + dokksáv. A "melyik verzió" válasza: v50.

## v51
- Profil-menü: "XR tér" (valódi tér) külön pont a "VR mód" alatt; hangra "XR", "XR tér", "VR tér", "tér", "valódi tér". A "VR" szó a sima VR-t nyitja. A "melyik verzió" válasza: v52 (lásd lent).

## v52
- XR tér szemüvegben: fekvő telefonnál a hosszanti tengely mentén két szemre bontva, egyenes képpel; kisebb alapablak. A "melyik verzió" válasza: v52.

## v53
- Kézkövetés a valódi térben (XR), külön a VR-étől: mutatás + kiemelés, csipesz = kattintás, csipesszel fogva viszed, két kézzel nagyítod, dokk ikonra csípés = oldalváltás. "kézkövetés ki/be". A "melyik verzió" válasza: v53.

## v54
- Valódi tér: távolabbi, nagyobb kijelző; kék fénysugár a kinyújtott mutatóujjból; kattintás csípéssel, koppintással vagy hangra ("kattints", "koppints", "menj rá"); "fogd meg" / "engedd el" (elem), "fogd meg az ablakot"; a kéz a kijelző előtt látszik; "sugár ki/be". A "melyik verzió" válasza: v54.

## WORK – nyelvek (2026-10-21)
- A WORK teljes felülete négy nyelven (HU/DE/EN/IT), a felugró üzenetekkel együtt; a nyelvváltás azonnali. Telefonon a hírfolyam egy oszlopos.

## WORK – Üzenetek, hívás, új főoldal (2026-10-21)
- **Üzenetek gomb** a fejlécben (💬, a ☰ és az S mellett), piros szám = olvasatlan. Messenger-szerű: beszélgetéslista, elérhetők sora, buborékos chat, ✓/✓✓ olvasottság.
- **Hívás:** hang- és videóhívás (📞 / 🎥) böngészőből böngészőbe (WebRTC). Bejövő hívásnál teljes képernyős csengetés Felvesz / Elutasít gombbal.
- **Bejövő üzenet:** felül felugró buborék hanggal; koppintásra megnyílik a beszélgetés.
- **Hangra (Hang gomb, és VR-ben a DEX-nek is):** „üzenetek”, „nyisd meg az üzenetet” / „nézd meg” (új üzenetnél), „vedd fel”, „ne vedd fel”, „tedd le”, „hívd fel Dórát”, „írj Tamásnak”, nyitott beszélgetésben „írd meg neki, hogy …”, „próbahívás”.
- **Szerver:** a WDEA szerver (START_WDEA) intézi – `RENDSZER/network/chatapi.py`, adat: `ADATOK/network.sqlite3`. Első megnyitáskor a WORK a neved kéri, utána a böngésző megjegyzi. Szerver nélkül (pl. GitHub Pages) demó mód: helyi minta-ismerősök.
- **Mások eléréséhez:** a gépnek bekapcsolva kell lennie, a START ablak nyitva. Otthoni hálózaton: https://<gép-IP>:8443/work/index.html; interneten át: az alagút (admin → Indítás). Hívás nagyon szigorú mobilhálózaton (NAT) előfordulhat, hogy nem jön létre – ilyenkor TURN szerver kellene, ez még nincs.
- **Főoldal:** új fejrész (köszöntés, gyorsgombok: Üzenetek, Hívás, AI, Videók, Pontok; elérhető ismerősök), a Vissza gomb és a nagy cím csak a főoldalról tűnt el. Színek, logó, robot, Hang gomb, oldalmenü maradt.
- **DEX:** beszéd közben a szája világít (nem az álla közepén lévő D-jel).
- **Rendrakás (minden oldal, telefonon és széles nézetben/VR-ben is):** oldalanként egy Vissza gomb (a főoldalon és a videóoldalon nincs, ott saját visszalépés van); a „WDEA WORK · MUNKATERÜLET” felirat eltűnt; a fejlécben egy Üzenetek gomb, nincs „Helyi mód” és dupla adomány/pont felirat; a kosárgomb csak a fejlécben; profilban egy Szerkesztés és egy Beállítások; a segítség-oldalakon nincs második logó és profilkép; az oldalmenü csoportosítva (Felfedezés · Vásárlás · Vállalkozás · Fiók), ismétlődő pont nélkül; „Új kampány” alatt nem jelenik meg „undefined”.
- **DEX VR:** a DEX mindig a csomagban lévő `work.html`-t nyitja meg. Ha a tárhelyen maradt egy régi `work/` mappa, azt már nem tölti be helyette – érdemes törölni.

## v55 – Valódi tér (XR) kezelése, mint a Questben
- **A kezed natúr:** nincs fehér körvonal, pont, csík vagy árnyalat; a kijelző előtt a valódi kezed látszik.
- **Sugár:** csak kinyújtott mutatóujjnál, vékony fehér vonal végig a kijelzőig, a végén kis célpont. Csípés közben csak a célpont látszik. „sugár ki/be”.
- **Érintés:** előrebököd a mutatóujjad a kijelző felé = kattintás. Rövid csípés is kattint, hangra „kattints”. „bökés ki/be”.
- **Görgetés:** csípd meg a tartalmat, és húzd fel/le – az oldal követi az ujjad.
- **Fogantyú:** a kijelző alatt egy vékony csík. Rámutatva kivilágosodik; csípd meg és vidd (a kezedet közelebb hozva közelebb jön, eltolva távolabb megy), engedd el – ott marad, és feléd fordul.
- **Méret:** a kijelző sarkát csípve húzd kifelé/befelé, vagy két kézzel húzd szét.
- **Kijelző:** kerekített sarkok, tömör háttér, élesebb kép; a videóoldal is látszik rajta.
- **Hang:** XR-ben a mikrofon magától bekapcsol, és a WORK rögtön megjelenik.
- A „melyik verzió” válasza: v55.

## Gyerekjáték: DEX és a Csillagtündérek (VR)
- Indítás VR-ben: „csillagtündérek” (vagy „gyerekjáték”), illetve a játékmenüből („játékok”). 4–9 éveseknek.
- 1. Portál: kinyílik egy varázskapu, kiszöknek a csillagtündérek. Érintsd meg őket az ujjaddal, csípd meg, nézz rájuk kb. 1 mp-ig, vagy mondd: „kapd el”.
- 2. Kristályeső: kapd el a hulló kristályokat; a szürke kő csak „álmos kő”. Mozgásfeladatok: „emeld fel a kezed”, „hajolj le” – bónuszcsillag.
- 3. Bújócska: a kis triceratops elbújt a szobában; kövesd a világító lábnyomokat, DEX súg: hideg… langyos… meleg! Ha megtalálod, integet.
- A végén csillagjutalom; „igen” = új kör, „vége” = kilépés. Hang: „segíts”, „mi a feladat”, „hol van”, „szünet”, „folytasd”.
- A figurák a te képeidből vannak kivágva; DEX szárnya és karja mozog, pislog, beszéd közben világít a szája.

## Közbeszólás (fejhallgató mód)
- Fejhallgatóval/fülessel közbeszólhatsz, amíg DEX beszél – ő elhallgat és meghallgat, mint egy beszélgetésben.
- Bekapcsolás: „fejhallgató”, „füles”, „fülhallgató” (a „be” nem kötelező). Kikapcsolás (hangszórónál, hogy ne hallja magát): „hangszóró”.

## DEX betanítás (offline tudástár, Zsolt beszédmódja)
- Megérti a töltelékszavakat: na, szóval, figyelj, izé, hát akkor, légyszi, léci, inkább… – ezeket kihagyja.
- Menet közbeni javítás: „kapcsold be a fejhallgatót, vagyis inkább a hangszórót” → a hangszóró számít.
- Több kérés egy mondatban: „…és utána…”, „…és aztán…”, „…majd…” – mindegyik lefut.
- Tudástár az egész WORK-ről és rendszerről (internet nélkül is): kérdezd meg, „hogy kell üzenetet küldeni”, „hol tudok boltot hozzáadni”, „hogy kell a szerverről indítani”, „mi az a fejhallgató mód”…
- Válasz után: „vigyél oda” – megnyitja az adott WORK-oldalt (VR-ben a VR-ben lévő WORK-öt).
- Ha nem biztos, visszakérdez: „Erre gondolsz? Mondd: igen.”
- Az okos mód (helyi LLM) is megkapja ezt a tudástárat és a beszédmód-leírást.

## XR: gombok kipakolása a térbe (mint a Questben)
- Csípd meg a kijelzőn egy gombot (pl. a menü vagy a Vissza gombot), és tartsd kb. 1 mp-ig – vagy húzd magad felé –, és kijön a térbe. Vidd, ahová szeretnéd, engedd el: ott marad.
- A kint lebegő gomb ugyanúgy működik: érintsd meg (előrebökés), csípd meg röviden, vagy nézz rá és mondd: „kattints”.
- A kijelzőn a helye halványan, szaggatott kerettel látszik. Visszatenni: told vissza a kijelzőre, vagy mondd.
- Hangra: „vedd ki a menü gombot”, „hozd ide a vissza gombot” (eléd teszi), „tedd vissza a menüt”, „tegyél vissza mindent”, „mik a kipakolt gombok”.
- A helyüket megjegyzi: legközelebb az XR-térben ugyanott lesznek (a kijelzőhöz képest).

## VR (telefon a szemüvegben): gombok kipakolása körben, 360°-ban
- Csípd meg a WORK-ben a gombot, és tartsd kb. 1 mp-ig: kijön, viheted, ahová akarod; elengedve ott marad. Csípve megnyomod; visszahúzva a WORK-re visszakerül.
- Hangra: „vedd ki a menü gombot”, „tedd balra / jobbra / mögém / fölém / alulra a menüt”, „hozd ide a vissza gombot”, „tedd vissza a menüt”, „tegyél vissza mindent”.
- Ha a látómezőn kívülre teszed (pl. mögéd), a térbe tétel magától bekapcsol: fordulj oda, és ott találod. (A telefon csak a fordulást érzékeli, a lépést nem.)
- A helyüket megjegyzi, legközelebb a VR-ben ugyanott lesznek.

## Bemutató
- A „▶ Bemutató” szövegében „WDEA Stúdió” szerepel, és a hang betűzve mondja: „Vé-Dé-E-Á Stúdió” (korábban „DEA”-nak olvasta).

## DEX természetesebb beszéde
- Rövid szavakat is ért és mond: „szia”, „mizu?”, „jó”, „oké”, „aha”, „köszi”, „várj” (elhallgat), „hé”, „mi?”, „miért?”, „na és?”, „ügyes vagy”, „fáradt vagyok”, „jó éjt”…
- Nem mindig ugyanazt mondja: több változatból választ, és nem ismétli egymás után ugyanazt.
- Emlékszik az előző válaszára: a „mi?” / „hogy?” után röviden megismétli, a „miért?”-re visszautal.
- A meglévő parancsok változatlanok; a rövid válasz csak ott jön, ahol eddig nem volt válasz.

## DEX World (12 világos játék)
- Indítás a DEX-ben: „dex world” / „játékvilág”, vagy közvetlenül a world.html. Internet nélkül is fut (saját 3D-motor).
- 12 világ: Főváros, Földi Város, Lebegő Szigetek, Űrport, Hegyvidék, Sivatag, Jégvilág, Víz Alatti Világ, Versenypálya, Erdő Világ, Űr Világ (kis gravitáció), Közösség.
- Minden világban 8 Coin és 3 gyémánt; ha megvan, kinyílik a kapu, és jön a következő világ. A haladás megmarad.
- DEX veled repül, segít („segíts” / „hol van”: megmondja, merre, és fénycsíkkal mutatja), beszél a DEX hangján. A figurákkal beszélgetni lehet (✋).
- Irányítás: bal oldali kör = mozgás, jobb oldal húzása = kamera, UGRÁS gomb. Hangra: „ugorj”, „előre”, „balra”, „következő világ”, „harmadik világ”, „menü”, „zárd be a játékot”.
- A játékpénz nem valódi, nem kapcsolódik a WORK egyenleghez.

## DEX World – szemüveges mód kézzel, a te képeiddel
- 🥽 gomb vagy „VR” szó: két szemre bontott kép, fejjel nézel körül, saját szemmel vagy a világban.
- Kézzel: 👉 mutatóujj = mész (a kezed balra/jobbra = fordulsz), ✊ ököl = állj, 🤏 csípés = ugrás (repülő járműben emelkedés), 🖐 nyitott tenyér = DEX segít, 👋 integetés = beszélgetés / beszállás. Közben beszélhetsz DEX-szel.
- Kilépés: „VR vége” vagy a ✕ VR gomb. A DEX VR-ből a játékmenüből indítva magától szemüveges módban indul.
- Járművek minden világban (autó, motor, drón, helikopter, repülő, űrhajó, hoverboard, tengeralattjáró): ✋ / „szállj be”, „szállj ki”; a repülők az UGRÁS gombbal vagy csípéssel emelkednek.
- A figurák a küldött 8 irányú rajzokból (játékos), a szép DEX robot, a járókelők, fák, házak, vár, járművek, sziklák, felhők a nagy atlaszból vannak kivágva. 👤 gomb: rajzolt / 3D figurák.
- VR játékmenü: 1. DEX World, 2. Szókereső, 3. Csillagtündérek, utána a többi. „egyes törlés”, „kettes törlés”… kiveszi a menüből, „játékok visszaállítása” visszahozza.

## Fizetési motor (WORK → saját szerver → bank / szolgáltató)
- A WORK **Pénztár** 4 lépésből áll: adatok → fizetési mód → ellenőrzés → fizetés. A fizetés gomb a saját WDEA szerver `/api/pay/create` végpontját hívja, a szerver pedig a szolgáltatóhoz fordul:
  - **Stripe** (bankkártya): Checkout Session, webhook: `/api/pay/webhook/stripe` (aláírás-ellenőrzéssel);
  - **PayPal**: Orders v2;
  - **Barion**: Payment/Start, callback: `/api/pay/callback/barion`;
  - **SimplePay (OTP)**: v2, HMAC-SHA384, IPN: `/api/pay/ipn/simplepay`;
  - **banki átutalás**: IBAN, közlemény, EPC QR-adat;
  - **utánvét** (díjjal).
- Visszatérés a fizetés után: `/api/pay/return` → `work/index.html#cart?pay=AZONOSÍTÓ&t=TOKEN`, ahol a vevő látja a rendelése állapotát.
- **Pontfeltöltés** ugyanezen a motoron fut (pontár: admin, 100 pont = ? EUR).
- **Admin → 💳 Fizetési módok és kulcsok**:
  - módonként be/ki, teszt (sandbox) vagy éles, a kulcsmezők, súgó és „Kapcsolat tesztelése”;
  - pénznem, pontár és a szerver nyilvános címe.
  - A titkos kulcsok **csak a szerveren** vannak (`payments_config.json` az adatmappában); az admin maszkolva látja őket (••••1234), és a böngészőbe nem kerülnek.
- **Admin → 🧾 Rendelések:** Fizetve / Feladva / Törölve / Visszatérítve.
- Ha valami nem működhet (GitHub Pages, ahol nincs szerver; hiányzó kulcs; kikapcsolt mód), a WORK kiírja, **miért**.
- Bemutatótermék éles módban nem rendelhető, teszt módban kipróbálható.
- **Élesítés:**
  1. Írd be a szolgáltatótól kapott kulcsokat, és teszt módban próbáld ki.
  2. Állítsd a módot „éles”-re.
  3. Kell egy nyilvános HTTPS-cím (domain és valódi tanúsítvány), hogy a szolgáltató webhookjai elérjék a szervert.

## WORK szerkesztése DEX-szel, hangra (admin módban)
- Admin belépés után bal alul megjelenik a sáv: ✎ szerkesztő mód (koppintással kijelölsz) · ↶ visszavonás · ⟲ minden vissza · ? súgó.
- Ezt mondhatod:
  - „tedd 20 pixellel balra a képet”, „15 pixellel feljebb”;
  - „legyen 10 pixellel szűkebb / szélesebb / magasabb / alacsonyabb”, „20 százalékkal nagyobb”;
  - „vedd ki onnan azt a képet”;
  - „tegyél helyette egy másikat” (véletlen kép), „cseréld le a gyertya képére” (a megnevezett kép), „tölts fel saját képet helyette”;
  - „a második képet jelöld ki”, „következő kép”, „a Vásárlás gombot tedd 10 pixellel jobbra”;
  - „kapcsold vissza” / „vond vissza” (az utolsó lépés), „állíts vissza mindent”, „szerkesztő mód be/ki”.
- Egy mondatban több művelet is mehet („…balra **és** 10 pixellel szűkebb”), és a szóval kimondott számot is érti („huszonöt”).
- Admin nélkül nem szerkeszt, megmondja, miért.
- A módosítások ezen az eszközön (böngészőben) maradnak meg, oldalváltás után is.
- Gombok, menüpontok hangra (mindenkinek): „nyisd meg a Felfedezés menüpontot”, „nyomd meg a … gombot”, vagy csak a gomb neve.

## DEX offline súgó (minden folyamat, lépésről lépésre)
- 93 folyamat, 368 lépés, gyakori hibák javítással (fizetés, kosár, átutalás, pontok, üzenet, hívás, videó, élő, ajándék, bolt, Studio, admin és fizetési kulcsok (Stripe, PayPal, Barion, SimplePay), szerkesztés, VR, XR, játékok, szerver, GitHub, telefonos telepítés, mikrofon, kamera, iPhone…).
- „hogyan fizetek?”, „vezess végig a pontfeltöltésen” → lépésenként vezet; közben: „kész”, „vissza”, „ismételd”, „nem megy”, „elég”, „vigyél oda”.
- Tünetre konkrét javítás („szürke a fizetési mód”, „nem hallasz”, „nem jelenik meg a kép”), és az elakadt vagy ideges embert megnyugtatja, majd rákérdez.
- Magyar szótövezés és rokon szavak: a fizetek, fizetéshez, fizetni és a vásárol, megvesz alakokat is érti, az összetett szavakat is (pontfeltöltésen).
- A WORK saját DEX-csevegője is ezt használja: ahol eddig azt írta, hogy „nem tudja”, ott most segít.
- Forrás: `build50/help/` (guides.py, lexicon.py, talk.py, engine.js) → `dexhelp.js`; bővíteni ott lehet.

## WDEA Studio+ – Shopify-téma generátor (Boltsablon-szerkesztő)
- Új sáv a szerkesztőben: **🔗 Bolt behúzása linkről · 🪄 Profi elrendezés · ⬇ Shopify téma (ZIP)**.
- **Valódi Shopify OS 2.0 téma**, kb. 53 fájl. Benne van:
  - layout, fejléc- és lábléccsoport, kiemelt kép, kollekciólista, kiemelt termékek gyors kosárba tétellel, bizalmi ikonok, értékelések, kép + szöveg, szöveges blokk, hírlevél, videó, térköz;
  - termék-, kollekció-, kosár-, kereső-, blog-, cikk-, 404- és jelszóoldal, ajándékkártya, ügyfélfiók-oldalak;
  - magyar, német és angol nyelv.
- A szerkesztő szövegei, színei, betűi (méret, vastagság, sorköz, igazítás), kerekítései és szakaszsorrendje átkerül a témába. A téma a bolt **saját termékeit** mutatja.
- **Feltöltés:** Shopify → Webáruház → Témák → Téma hozzáadása → ZIP-fájl feltöltése.
- **Letöltés** csak előfizetőnek vagy adminnak (szerver: `/api/studio/entitlement`). Másnak kiírja, miért nem.
- **Bolt behúzása:**
  - csak tulajdonosi megerősítéssel;
  - a szerver húzza be a bolt nyilvános adatait (`/products.json`, `/collections.json`, `/meta.json`, főoldal: név, leírás, színek, borítókép);
  - védelem: csak https, belső hálózati címet nem kér le, méret- és időkorlát.
  - Szerver nélkül (GitHub) a böngésző a legtöbb boltnál ezt nem engedi, ezt ki is írja.
- **Hangvezérlés** (a WORK-ben, a Boltsablon oldalon): „a főcím legyen …”, „a márkanév legyen …”, „a gomb színe legyen zöld”, „betűméret nagyobb”, „profi elrendezés”, „töltsd le a sablont”, „húzd be a saját boltomat: …”.
- Forrás: `work38/theme_base/` (a téma alapfájljai), `work38/studio_plus.js`, `work38/prep.py`, ellenőrzés: `work38/theme_lint.py`.

## Megjelenés (v57)
- Új elegáns WDEA logó egyetlen SVG-ben (krómos betűk, kék fénylő jel, „WORLD · WORK · COMMUNITY”), minden oldalon.
- Középső Hang gomb: fénylő gyűrű, üveges közép, hanghullám.
- Főoldali csempék: saját színű fény és vonalas ikon.
- A robot megmarad: elrejtés után egyetlen ❮ fül hozza vissza.
- A Hang gomb nem takar: a lapok és ablakok alja feljebb görgethető.

## Hívásnapló az Üzenetekben (demóban is)
- „📞 Próbáltad hívni – nem elérhető”, „🎥 Videóhívás · 0:42”, „Nem fogadott hívás”, „Elutasított hívás”. Élesben a másik fél is megkapja a nem fogadott hívás üzenetét.

## DEX e-kereskedelmi tudás
- Webáruház indítása, dropshipping, termékoldal és konverzió, árazás és árrés, hirdetés (Meta, TikTok, Google, ROAS, CPA), kosárelhagyás, SEO, visszaküldés és vélemények, Shopify-téma feltöltése, a szerkesztő minden mezője. Mind lépésenként, offline.

## Képgenerálás (WORK, Boltsablon, DEX)
- **Bárhol hangra:** „készíts egy képet, amin egy rózsa van”. Megnyílik a képgeneráló; a képet letöltheted, kérhetsz másik változatot, és Boltsablon oldalon betehető borítóképnek vagy a kép + szöveg szakaszba. A `#imagine?p=…` cím is megnyitja; a DEX ide irányít.
- **Boltsablon → 🎨 Képek generálása:** a szövegekből borítóképet és kategóriaképeket készít. Ezek az előnézetben is látszanak, és bekerülnek a Shopify ZIP-be (`assets/wdea-hero.jpg`, `wdea-cat-N.jpg`, `wdea-story.jpg`); a téma használja őket.
- **Ki készíti a képet (ebben a sorrendben):**
  1. a saját szerver (`/api/studio/genimage`) az adminban választott szolgáltatóval. Lehetőségek: Pollinations (ingyenes, kulcs nélkül, ez az alap), OpenAI (gpt-image-1), Stability AI, saját gépi Stable Diffusion (AUTOMATIC1111/Forge, `--api`), vagy kikapcsolva;
  2. szerver nélkül a Pollinations közvetlenül;
  3. internet nélkül a beépített WDEA rajzoló (stilizált kép).
  
  Mindig kiírja, melyik készítette.
- **Admin → 🎨 Képgenerálás:** itt választod a szolgáltatót, és itt adod meg a kulcsokat. A kulcsok csak a szerveren vannak (`imagegen_config.json`), az admin maszkolva látja őket. Van „Próbakép generálása” gomb is.
- A magyar leírást a rendszer angol kulcsszavakra fordítja, és minőségi stílust tesz mellé (termékfotó, borítókép).

## Termékfotó-stúdió (saját termék fotójából)
- Megnyitás: a képgenerálóban „📸 Saját termék fotójából”, Boltsablonban „📸 Termékfotó”, vagy hangra: „készíts termékfotót”, „fotózd le a termékemet”.
- Fényképezd le a terméket (lehetőleg egyszínű háttér előtt). A WDEA **helyben, internet nélkül** kivágja; a „háttér-érzékenység” csúszkával finomíthatsz.
- Választható hátterek: Stúdió, Márvány, Fa asztal, Természet, Luxus, Strand, Pasztell. Több változat készül egyszerre, talpárnyékkal, fényes felületen tükröződéssel, a háttér fényéhez hangolva.
- A háttér online MI-vel készül, ha van internet; ha nincs, a beépített rajzolóval. A kivágás és az összeillesztés mindig a telefonon fut.
- Minden kép letölthető vagy menthető (telefonon a megosztás menüvel a galériába). Boltsablonban a „Mentés” a sablon kép + szöveg szakaszába is beteszi.

## Munka közben csendes mód
- Szerkesztéskor, gépeléskor, ablakokban, a Boltsablon-, admin- és pénztároldalon a Hang gomb kicsi lesz, és a jobb alsó sarokba megy; a robot és a ❮ fül háttérbe húzódik. Ha bezárod az ablakot, minden visszajön.

## Önálló DEX
- A DEX magja (beszéd, súgó, vezérlés, szerkesztés, játékok, termékfotó-kivágás, beépített rajzoló) a telefonon fut, külső szolgáltató nélkül.
- Az online MI (Pollinations, OpenAI, Stability) csak választható kiegészítő. A teljesen önálló, saját gépi működéshez: okos mód = Ollama, képek = saját gépi Stable Diffusion; mindkettő internet nélkül fut a gépeden.

## Oldal generálása képből (weboldal-képernyőképből a saját bolt)
- **Megnyitás:**
  - a WORK DEX-ében a „Kép” fülön tölts fel egy képet → „🏗 Oldal generálása ebből a képből”;
  - vagy hangra: „generáld le az oldalt a képből”.
  
  1–2 kép tehető be.
- **Helyben, internet nélkül:** cellarácson végignézi a képet, és felismeri a promó sávot, a nagy képet, a kategóriák rácsát, a termékrácsot és a láblécet. Kiveszi a színeket (háttér, szöveg, kiemelés), és kivágja a borítóképet meg a kategóriaképeket. Mindezt beteszi a Boltsablon-szerkesztőbe a felismert sorrendben.
- **Szövegfelismerés (Tesseract, magyar + angol):** kiolvassa a márkanevet, a promó szöveget, a címkét, a főcímet, az alcímet, a gombot, a kategóriákat és a termékeket árral. Az első használathoz egyszer internet kell, utána a telefon tárolja, és offline is megy.
- **Legjobb minőség, saját gépen:** a WDEA szerver a gépen futó látó modellel (Ollama, alap: `qwen2.5vl:7b`, az adminban átállítható) teljesen megérti a képet: feliratok, színek, betűtípus. A végpont: `/api/studio/vision`. Telepítés: `ollama pull qwen2.5vl:7b`.
- Az eredményt kiírja (felépített szakaszok, színek, képek, feliratok, forrás). Utána hanggal finomíthatsz, és letöltheted Shopify témaként.

## 2026-10-23 este – A) hibák, megértés, üzenetek, C) Shopify-sablongenerálás, D) egységes admin
- **DEX arca:** feljebb van és középen, nem lóg bele a „Figyelek” feliratba és a válaszokba (nyitott beszélgetésnél összébb húzódik). A száj beszéd közben nyílik és csukódik.
- **WORK hibák:**
  - a sztorisoron át is görgethető le-fel az oldal;
  - a modulsáv munka közben nem lapoz magától;
  - a logó alatt csak „WORK” áll;
  - a videóoldalon egy teljes képernyő gomb maradt, és nincs csík a Hang gomb mögött;
  - automatikus válasz csak a WDEA csapat chatjében van.
- **DEX megértés** (offline, `dex57sense.js`):
  - érti a dadogást, a töltelékszavakat és az egy szavas kéréseket;
  - javítja az elírásokat, és emlékszik, miről volt szó („ez a gomb”, „csináld újra”);
  - tud számolni, megmondja az időt és a dátumot, ismeri a fővárosokat;
  - ha nem érti, őszintén visszakérdez egy tippel („igen” → végrehajtja).
- **Telefonos okos agy** (`dex57brain.js`):
  - mondd: „okos agy letöltése”;
  - egyszer letölti a modellt (WebGPU, friss Chrome kell), utána internet nélkül is válaszol;
  - „okos agy állapota”, „okos agy törlése”.
- **Hang- és videóüzenet** az Üzenetekben:
  - 🎤 és 🎥 (a videó legfeljebb 15 másodperc);
  - nem fogadott hívás után felajánlja;
  - szerveres módban csak a két fél hallgathatja meg (`/api/chat/media`).
- **Shopify-sablongenerálás** (a régi szerkesztő helyett, `gen57.js`):
  - képből egytermékes boltot készít, az oldalak egyenként választhatók;
  - linkről (alul) átveszi a felépítést, a szöveg és a kép új lesz;
  - minden képhez: 🗑 törlés, ↶ visszavonás, ⬆ saját kép, ⟳ újragenerálás;
  - 🎲 Teszt: csak megnézni lehet;
  - ZIP-letöltés vagy feltöltés a Shopify boltba (nem élesíti);
  - előfizetőnek és adminnak benne van, másnak egyszeri díjas (a díjat a szerver szabja meg).
- **Admin központ** (WORK admin tetején, `admin57.js`): fizetés és kulcsok, rendelések, képgenerálás, Shopify-kapcsolat és sablondíj, valamint szerver/felhasználók (DEX CONTROL, `#control`).

## 2026-10-23 késő este – E) rész + DEX World új grafika
- **Áthelyezés hangra (WORK, admin mód):**
  - „tedd a kosár gombot a keresés alá / fölé / mellé”;
  - ha a kérés elrontana valamit (kilógna, rálógna egy gombra, a vásárlás gomb túl lejjebb kerülne), előtte szól: „Ezt nem ajánlom, mert…, így is megcsináljam?”;
  - „igen” → megcsinálja, „vond vissza” → visszaállítja.
- **Mély memória** (`dex57plus.js`):
  - „jegyezd meg, hogy …”, „fontos: soha …” (szabály), „mire emlékszel?”, „felejtsd el, hogy …”;
  - „memória mentése” → DEX_MEMORIA.zip, „memória betöltése”;
  - „memória feltöltése a GitHubra”: privát tároló kell, a kulcs csak a telefonon marad;
  - a szabályoknak ellentmondó kérésnél szól, és rákérdez.
- **„Tanítsd meg DEX-et”:** „ha azt mondom X, azt értem Y” – a saját szavaidat ezután mindenhol érti.
- **Tippek:** alapból kikapcsolva. „tippek be / ki”, egyszeri kérés: „adj tippet”.
- **E-kereskedelmi számolók:** „profit, ha 30-ért adom, 12 a beszerzés, 4 a szállítás, 8 a hirdetés” → profit, árrés, CPA-plafon, megtérülési ROAS (WORK-ben is).
- **Szövegíró:** „írj termékleírást / hirdetést / címeket a …-hoz”. Meggyőző szerkezettel (PAS, AIDA), a „kulcs = lehetőség” szemlélettel.
- **„Hé DEX” ébresztőszó:** „ébresztőszó be”, alapból kikapcsolva. Csak nyitott DEX-oldalon működik.
- **Okos agy a WORK csevegőjében is**, ha le van töltve.
- **DEX World:** mind a 12 világ megkapta a saját új grafikáit a 09–11-es átlátszó csomagból:
  - a gyűjthető Coin és gyémánt a világ saját energiagömbje és kristálya;
  - a talajon lámpás, zászló, jelző, láda, energiaoszlop, pajzs és kristálycsoport;
  - a kezdőhelynél ellenőrző pont, a portálnál díszkapu;
  - az égen lebegő platformok és csillagok.
- **DEX World – mi nincs még benne:** a csomag többi része referencia, kicsi vagy nem átlátszó, ezért az nem került be. Ide tartoznak a karakter- és DEX-mozgásképek, valamint a 07-es csempék.

## 2026-10-23 23:00 – DEX World: járás hangra, növények, burkolatok
- **Járás hangra:**
  - „menj” (menjél, menjünk, sétálj, indulj, gyerünk, menj előre) → nyugodt, közepes séta, ami addig tart, amíg nem mondod: „állj”;
  - „gyorsan” → gyorsabb séta;
  - „gyorsabban”, „futás”, „fuss”, „fussál”, „rohanj”, „szaladj” → futás;
  - „lassabban” → lassabb séta;
  - „állj”, „stop”, „állj meg”, „várj” → megáll.
- **Ugrás minden alakban:** ugrás, ugorj, ugorjál, ugorjon, ugorjunk, ugrani, hopp, fel.
- **Új csomag (216 PNG):**
  - minden világban 6 saját, lengő növény (világonként 30 darab elszórva);
  - a kezdőhelyen kőlap-burkolat;
  - a portálnál energialap-burkolat.

## 2026-10-24 00:05 – HANG: megbízhatóan, telefonon is (`dex57voice.js`, DEX, WORK, DEX World)
- A böngésző felolvasójának Android/Chrome-hibái ellen:
  - kis késleltetés a „cancel” után;
  - a beszéd megtartása, amíg szól;
  - ébren tartás 15 másodperc után;
  - magyar hang kiválasztása;
  - hangfeloldás az első érintéskor.
- **„hangteszt”** (vagy „hallasz?”, „nincs hangod”): kimond egy próbamondatot, és megmondja, mi a baj (nincs magyar hang a telefonon, ki van kapcsolva a felolvasás, koppintani kell).
- Ha a felolvasás véletlenül kikapcsolva maradt, magától visszakapcsol. Ha te kapcsolod ki („kapcsold ki a hangot”), ki is marad.

## 2026-10-24 00:30 – Admin védelem + mozgatható szerkesztősáv
- **Belépés előtt semmi admin nem látszik:** a szerkesztősáv (✎ ↶ ⟲ ?), az Admin központ és az admin-letöltés csak sikeres admin belépés után érhető el. A belépőkódos oldalon semmi. Ha a belépés lejár, eltűnnek.
- **Mozgatható szerkesztősáv:** a bal szélén lévő ⠿ fogantyúnál fogd meg, és húzd oda, ahol nem zavar. A helyét megjegyzi.
- **A szerkesztősáv az admin felület fölött van**, így ott is használható.
- **Admin GitHubról is:** a DEX-ben vagy a WORK-ben mondd: „admin Zsolt 88”, vagy írd be a kódot az admin oldalon.

## 2026-10-24 hajnal – értesítések, emberibb hang, burkolatok, láncjavítások
- **Értesítések:** ha a WORK a háttérben van, a telefon értesítést dob új üzenetről és bejövő hívásról. Koppintásra megnyílik a beszélgetés. Az engedélyt az Üzenetek első megnyitásakor kéri.
- **Emberibb magyar hang (Piper):** tedd a Pipert és egy magyar hangot a `RENDSZER/piper` mappába (leírás ott). A szerver magától használja, a DEX, a WORK és a DEX World azon beszél. Ha nincs, marad a telefon hangja. Hangra: „emberi hang be / ki”, „hangteszt”.
- **DEX World:** a házak falai és az utak a világ saját burkolatát kapták.
- **Javítva:**
  - „chat” = a kettőtök DEX-csevegője, „work chat” = WORK üzenetek;
  - VR-ben a régi, bevált parancsok érvényesülnek;
  - a hívásnapló hibája megszűnt;
  - a sablongenerálás a széles, asztali képernyőképeket is felismeri.
- **Próbalánc (teljes, az elejétől):** 70 próbafájl. Egy próba (teach57 T10, VR-ben két WORK-ablak) egyszer időzítési okból elbukott, külön újrafuttatva 19/19. Ezért a lánc újra fut az elejétől.

## 2026-10-24 – Admin zárolás + húzható szerkesztősáv, VR WORK-oldalváltás javítás
- **Admin belépés előtt:** csak az „Admin felület” cím, a belépőkód, a Belépés gomb és a „⛔ Tilos a belépés” magyarázat látszik. A Fizetési módok, a Képgenerálás, a Szabályzatok, az Admin központ és a szerkesztősáv csak sikeres belépés után, az admin belsejében érhető el.
- **Szerkesztősáv (✎ ↶ ⟲ ?):** hosszan (kb. fél mp) nyomva bárhol megfogható és odébb húzható (a ⠿ fogantyúval azonnal). A helyét megjegyzi. Rövid koppintásra a gombok ugyanúgy működnek.
- **VR:** „nyisd meg a work kosarat” közvetlenül a WORK megnyitása után is a kért oldalt nyitja (megvárja a betöltést).
- **DEX arca – száj a D betű helyén:** beszéd közben a száj ott mozog, ahol a D betű van (a D-t ilyenkor a száj váltja). Nyugalomban a D látszik, a két szem között nincs vonal. A „Figyelek / Beszélek” felirat mindig az arc alatt van.
