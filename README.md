

# Produktivitetskommissionens slutbetänkande som podcast

Ett projekt för att konvertera produktivitetskommissionens slutbetänkande till podcast för att tillgängliggöra dess innehåll till en bredare publik.

## Bakgrund

Det produceras mycket bra information från svenska myndigheter men mycket når aldrig en bredare publik. Jag ville därför göra ett experiment och se om det var möjligt att konvertera produktivitetskommissionens slutbetänkande till en podcast. 

## Arbetet

För att gå från publicerad PDF \<insert local link\> till publicerad podcast [open.spotify.com/show/5oxVTcO7qYI93l7AUtjIy1](https://open.spotify.com/show/5oxVTcO7qYI93l7AUtjIy1) så har jag gått igenom ett antal steg.

Nedan presenterar jag stegen jag gått igenom och vad jag lärt mig på vägen.

### PDF till MD 

Mitt första försök var att importera hela PDF-filen till en tjänst för text to speech (TTS). Detta fungerade inte alls då tjänsten jag använde inte klarade av att läsa filen korrekt.   
Så jag hittade en annan onlinetjänst, [pdf2md.morethan.io](https://pdf2md.morethan.io), som gjorde jobbet på ett okej sätt, [se konverterad fil](Fler%20möjligheter%20till%20ökat%20välstånd.md).

### Dela upp kapitel 

För att göra texten lite mer överblickbar så skapade jag ett JavaScript som gjorde det jobbet genom att läsa md-rubriker. Noterade senare att konverteringen hade vissa problem då vissa topprubriker hade blivit underrubriker, jag upptäckte detta då jag inte fick ut alla kapitel. Men efter lite manuell handpåläggning så fick jag ut alla kapitel.

### Anpassa texten

Vid det här laget testade jag att konvertera ett kortare kapitel till ljud. Det blev snabbt tydligt att texten inte var skriven för uppläsning och definitivt inte för AI (TTS). Texten innehöll många referenser, förkortningar, markdown-syntax och siffror som gjorde uppläsningen svårbegriplig. För att hantera detta skapade jag, med hjälp av Cursor (ett AI programerings verktyg), ett nytt JavaScript som tog bort och bytte ut den här typen av problematiska delar.  
Arbetet blev iterativt: jag bad Cursor lägga till något, scrollade igenom texten, hittade fler problem och bad Cursor lägga till mer funktionalitet i städscriptet. Det fungerade okej, men processen gick ganska långsamt. För att påskynda bad jag även Cursor att själv analysera texten och föreslå förbättringar i scriptet. Det gick lite snabbare, och jag testade även att be ChatGPT om förslag.  
Efter ett tag var scriptet rätt bra, men jag ville generalisera processen så jag bad Cursor skapa en prompt som jag skulle kunna använda med en LLM för att göra samma jobb som scriptet men utan att det var anpassat till den specifika texten. Prompten jag fick provade jag både med ChatGPT och Claude. Resultatet blev dock att båda modellerna tog bort för mycket, och texten blev snarare sämre än bättre. **Detta är ett intressant sidospår som jag ändå tror är framtiden** (se [Cleanup prompt.md](Cleanup%20prompt.md) för innehållet i prompten jag använde), men för att komma vidare fortsatte jag med städscriptet.  
I min första konvertering upptäckte jag bland annat att 1990-talet fick ett konstigt uttal i TTS. Därför gjorde jag en iteration till där jag konverterade sådana årtal till fulltext, till exempel "nittonhundranittiotalet", vilket gav önskat resultat.

### Produktion av ljud

För att få texten inläst av en AI med TTS-stöd så fick jag leta mer än jag hade förväntat mig. Det finns gott om modeller som klarar kortare engelska texter, men nu hade jag en lång text på svenska som jag ville ha uppläst med en behaglig röst.  
Efter en del sökande hittade jag [elevenlabs.io](http://elevenlabs.io) som kunde göra jobbet. Nackdelen var att tjänsten inte var helt gratis men överkomlig. Om man tänker sig att en myndighet skulle göra det här så handlar det om inga pengar. Hittade även [narrationbox.com](https://app.narrationbox.com) som såg lovande ut men som jag inte fick att fungera. 

### Bilder och episod beskrivningar

Episod och podcast bilderna genererade jag med ChatGPT, använde en grundprompt för att få stilen enhetlig. 
```
Create a retro 1950s cartoon style image, minimal vector art, Art Deco inspired, clean flat colors, geometric shapes, mid-century modern design, elegant silhouettes, UPA style animation, smooth lines, limited color palette (black, red, beige, brown, white), grainy paper texture background, vintage jazz club atmosphere, subtle lighting, slightly exaggerated character proportions, classy and stylish mood.
```
De flesta bilderna blev ganska generiska. Blev dock nöjd när ChatGPT till sista episoden om hälso- och sjukvård plockade upp temat och gav sångerskan sjuksköterskekläder.  
![Episodbild för hälso- och sjukvård](chapter-images/17-halso-och-sjukvard.png)   
För att beskriva episoderna så bad jag Cursor att gå igenom alla kapitlen och generera episodbeskrivningar för alla kapitlen på ~100 ord vardera.

## Slutsats

Det går bra att konvertera ett slutbetänkande till podcast, och resultatet blev högst funktionellt. Med tillgång till grundtexten från början skulle arbetet ha gått ännu enklare.