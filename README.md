

# Produktivitetskommissionens slutbetänkande som podcast

Ett projekt för att konvertera produktivitetskommissionen slutbetänkande till podcast för att tillgängliggöra dess innehåll till en bredare publik.

## Bakgrund

Det produceras mycket bra information från svenska myndigheter men mycket når aldrig en bredare publik. Jag ville därför göra ett experiment och se om det var möjligt att 

## Arbetet

För att gå från publicerad PDF \<insert local link\> till publicerad podcast \<insert link\> så har jag gått igenom ett antal steg.

Nedan presenterar jag stegen jag gått igenom och vad jag lärt mig på vägen.

### PDF till MD 

Mitt första försök var att importera hela PDF filen till en tjänst för text to speech (TTS). Detta funkade inte alls då tjänsten jag använde inte klarade av att läsa filen korrekt.   
Så jag hittade en annan onlinetjänst, [pdf2md.morethan.io](http://pdf2md.morethan.io), som gjorde jobbet på ett okej sätt, \<inser link to MD file\>.

### Dela upp kapitel 

För att göra texten lite mer överblickbar så skapade jag ett javascript som gjorde det jobbet genom att läsa md-rubriker. Noterade senare att konverteringen hade vissa problem då vissa top-rubriker hade blivit underrubriker, jag noterade detta då jag inte fick ut alla kapitel. Men efter lite manuell handpåläggning så.

### Anpassa texten

Vid det här laget så testade jag att konvertera ett kortare kapitel till ljud, men det blev snabbt tydligt att texten inte var skriven för att läsas högt och definitivt inte av en AI. Till exempel så innehöll texten gott om referenser, förkortningar, markdown-syntax, och siffror. För att adressera det här så skapade jag ett nytt javascript med hjälp av Cursor för att plocka bort och byta ut delar som var problematiska.  
Detta blev ett iterativt arbete där jag bad Cursor lägga till något, scrolla igenom texten, hitta ytterligare problem, bad cursor lägga till funktionalitet i städ-scriptet. Detta funkade okej men var lite långsamt så för att skynda på processen så bad jag Cursor (Claude LLM) att själv analysera texten och föreslå förbättringar i städ-scriptet. Nu gick det lite snabbare, testade även att be ChatGTP om förslag.  
Efter ett tag så var städ-scriptet ganska bra men jag tänkte att jag ville generalisera processen så då bad jag Cursor att skapa en prompt som jag skulle kunna använda med en LLM för att göra samma jobb som städ-scriptet gjorde men utan att vara så anpassat till den specifika texten. Jag fick en prompt som jag testade att applicera både med Chat GTP och Claude. Dock var resultatet inte vad jag båda modellerna plockade bort mer än ja ville och jag upplevde inte att texten blev bättre snarare sämre. **Detta är ett intressant sidospår som jag tror är framtiden**, men för att komma vidare så fortsatte jag med städ-scriptet.  
Jag gjorde en första konvertering och upptäckte att till exempel 1990-talet fick ett underligt uttal så jag gjorde en iteration då jag konverterade till att explicit skriva ut hela nittonhundranittiotalet som text vilket fick önskat resultat.

### Produktion av ljud

För att få texten inläst av en AI med TTS stöd så fick jag leta mer än jag hade förväntat mig. Det finns gott om modeller som klarar kortare engelsk texter, men nu hade jag en lång text på svenska som jag vill ha uppläst med en behaglig röst.  
Efter en del sökande så hittade jag [elevenlabs.io](http://elevenlabs.io) som kunde göra jobbet, nersidan tjänsten var inte helt gratis men överkomlig. Om man tänker sig att en myndighet skulle göra det här så handlar det om inga pengar.  Hittade även [narrationbox.com](https://app.narrationbox.com) som såg lovande ut men som jag inte fick att funka). 

### Bilder och episod beskrivningar

Bilderna jag genererade med ChatGTP, använde en grund prompt för att få stilen enhetlig. De flesta bilderna blev ganska generiska. Blev dock nöjd när ChatGTP till sista episoden om hälso och sjukvård plockade upp temat och gav sångerskan sjuksköterske kläder.  
\<insert image\>   
För att beskriva episoderna så bad jag Cursor att gå igenom alla kapitlen och generera en episodbeskrivningar för alla kapitlen på \~100 ord vardera.

## Slutsats

Det går bra att konvertera ett slutbetänkande till podcast, och resultatet blev högst funktionellt med tillgång till grundtext så skulle arbetet gå enklare.