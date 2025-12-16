# Studio Reservering - Online Zetten

## Gratis Hosting Opties

### Optie 1: GitHub Pages (Aanbevolen - Simpelst)

1. **Maak een GitHub account** op https://github.com
2. **Maak een nieuwe repository**:
   - Klik op "New repository"
   - Naam: `studio-reservering`
   - Maak hem **Public**
   - Klik "Create repository"

3. **Upload het bestand**:
   - Klik op "uploading an existing file"
   - Sleep `index.html` naar de browser
   - Klik "Commit changes"

4. **Activeer GitHub Pages**:
   - Ga naar Settings → Pages
   - Under "Source", selecteer "main" branch
   - Klik "Save"
   - Na 1-2 minuten is je website live op: `https://JOUW-USERNAME.github.io/studio-reservering/`

**Voordelen**: Gratis, makkelijk, geen limiet, HTTPS automatisch

---

### Optie 2: Netlify (Ook Heel Makkelijk)

1. Ga naar https://www.netlify.com
2. Klik "Sign up" (kan met GitHub)
3. Sleep het `index.html` bestand naar Netlify Drop
4. Je website is direct live!

**Voordelen**: Nog makkelijker, automatische HTTPS, gratis custom domain

---

### Optie 3: Vercel

1. Ga naar https://vercel.com
2. Sign up (kan met GitHub)
3. Upload `index.html`
4. Deploy!

**Voordelen**: Supersnel, gratis, professioneel

---

## Delen met Broer en Ouders

### Methode 1: Via URL (Na online zetten)
1. Zet de website online (zie boven)
2. Deel de URL met je broer en ouders
3. Iedereen gebruikt dezelfde URL
4. Wachtwoord: **7860**

### Methode 2: Via Bestanden (Zonder hosting)
1. Stuur het `index.html` bestand via WhatsApp/email
2. Zij openen het bestand in hun browser
3. Gebruik Export/Import functie om gegevens te synchroniseren:
   - Jij: Klik "Exporteer gegevens" → deel het JSON bestand
   - Zij: Klik "Importeer gegevens" → plak de inhoud → Importeren

---

## Hoe het Werkt

### Wachtwoord
- **Wachtwoord**: 7860
- Sessie blijft actief zolang browser open is
- Bij sluiten browser moet je opnieuw inloggen

### Checklist Systeem
1. **Maak een reservering** → Verschijnt in "Huidige Reserveringen" (blauwe rand)
2. **Laatste dag passeert** → Verhuist naar "Gepaseerde Reserveringen" (rode rand)
3. **Klik "Opruim checklist"** → Vul alle items in (WC, Badkamer, Bed, Keuken, Vuilbakje)
4. **Na bevestigen** → Reservering verdwijnt uit overzicht

### Kleuren
- **Blauw**: Huidige/toekomstige reserveringen
- **Rood**: Gepaseerde reserveringen die opruiming vereisen
- **Groen**: Voltooide reserveringen (verdwijnen automatisch)

### Data Synchronisatie
Als iedereen de ZELFDE gehoste website gebruikt (Optie 1, 2 of 3):
- Geen export/import nodig!
- Alle data wordt opgeslagen in de browser van elke gebruiker
- Gebruik Export/Import om data tussen browsers te delen

---

## Technische Details

### Data Opslag
- Opgeslagen in browser (localStorage)
- Blijft behouden na browser sluiten
- Verwijder browser data = verlies reserveringen
- **Tip**: Exporteer regelmatig als backup!

### Beveiliging
- Wachtwoord zit in de code (simpele bescherming)
- Voor meer beveiliging: gebruik backend (complexer)
- Huidig systeem is prima voor familie gebruik

### Browser Compatibiliteit
- Werkt op Chrome, Firefox, Safari, Edge
- Werkt op telefoon, tablet, computer
- Geen installatie nodig

---

## Troubleshooting

**Q: Ik zie andermans reserveringen niet**
A: Export/import de gegevens of gebruik dezelfde gehoste website

**Q: Mijn reserveringen zijn weg**
A: Browser data gewist. Importeer een backup of vraag anderen om export

**Q: Wachtwoord werkt niet**
A: Zorg dat je 7860 invult (geen spaties)

**Q: Website niet bereikbaar**
A: Check of GitHub Pages/Netlify goed geconfigureerd is

---

## Aanbevolen Setup voor Beste Ervaring

1. **Zet online met GitHub Pages** (gratis, stabiel)
2. **Deel URL met iedereen**: https://jouw-username.github.io/studio-reservering/
3. **Iedereen gebruikt dezelfde URL**
4. **Exporteer 1x per week** als backup
5. **Importeer elkaars data** als iemand nieuwe reservering maakt

---

## Support

Voor vragen of problemen, check:
- GitHub repository: alle code is zichtbaar
- Bestand werkt 100% lokaal (geen internet nodig voor functionaliteit)
- Export/Import functie zorgt voor backup en sync
