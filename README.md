# Jobbahub Frontend

Dit is de officiële frontend voor **Jobbahub**, een platform dat studenten helpt bij het kiezen van de juiste keuzemodules. De applicatie biedt een gepersonaliseerd dashboard, een AI-gestuurde vragenlijst en een overzicht van beschikbare modules.

Deze frontend is ontwikkeld als schoolproject en is bedoeld om samen te werken met de Jobbahub Backend.

## 🛠 Tech Stack

Dit project maakt gebruik van moderne webtechnologieën voor een snelle en responsieve gebruikerservaring:

*   **Framework:** [React 19](https://react.dev/)
*   **Build Tool:** [Vite 7](https://vitejs.dev/)
*   **Taal:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Routing:** React Router Dom 7
*   **Linting:** ESLint 9

## 📋 Vereisten

Om dit project lokaal te draaien heb je de volgende software nodig:

*   **Node.js:** Versie 20 of hoger (aanbevolen LTS).
*   **Package Manager:** NPM (wordt standaard meegeleverd met Node.js).
*   **Backend:** Een draaiende instantie van de Jobbahub Backend is vereist voor volledige functionaliteit.

## 🚀 Installatie & Lokaal Draaien

Volg deze stappen om het project op je eigen machine te starten:

1.  **Clone de repository** (indien van toepassing):
    ```bash
    git clone <repository-url>
    cd jobbahub-frontend
    ```

2.  **Installeer dependencies:**
    Gebruik NPM om alle benodigde pakketten te installeren.
    ```bash
    npm install
    ```

3.  **Configureer Environment Variables:**
    Maak een nieuw bestand genaamd `.env` aan in de root van het project (naast `package.json`).
    Vul de juiste backend URL in (zie kopje [Environment Variables](#-environment-variables)).

4.  **Start de Development Server:**
    ```bash
    npm run dev
    ```
    De applicatie is nu bereikbaar via de link in je terminal (meestal `http://localhost:5173`).

## 🔑 Environment Variables

Dit project gebruikt `.env` bestanden voor configuratie. Zorg dat de volgende variabelen zijn ingesteld in je `.env` bestand:

| Variabele | Beschrijving | Voorbeeld |
| :--- | :--- | :--- |
| `VITE_BACKEND_URI` | **(Verplicht)** De base URL van de draaiende backend API. | `http://localhost:5000` |

## 🔌 Backend Integratie

De frontend communiceert met de backend via een REST API.

*   **API Service:** Alle netwerkverzoeken worden afgehandeld in `src/services/apiService.ts`.
*   **Authenticatie:** Login tokens worden opgeslagen in `localStorage` en automatisch meegestuurd als `Authorization: Bearer <token>` header bij beveiligde requests.
*   **Belangrijke Endpoints:**
    *   `/api/auth/*`: Inloggen en gebruikersbeheer.
    *   `/api/modules`: Ophalen van keuzemodules.
    *   `/api/ai/recommend`: Versturen van vragenlijst voor AI-advies.

## 📂 Projectstructuur

Een kort overzicht van de belangrijkste mappen in `src/`:

*   `components/`: Herbruikbare UI-componenten (bijv. knoppen, kaarten, grafieken).
*   `pages/`: Volledige pagina's die gekoppeld zijn aan routes (bijv. `Dashboard`, `Login`, `Modules`).
*   `services/`: Logica voor communicatie met externe API's (bijv. `apiService.ts`).
*   `context/`: React Context providers voor globale state (bijv. `AuthContext`, `LanguageContext`).
*   `locales/`: Vertalingen voor meertaligheid (NL/EN).
*   `types/`: TypeScript interfaces en type definities.

## 📜 Beschikbare Scripts

In `package.json` vind je de volgende commando's die je via `npm run <script>` kunt uitvoeren:

*   `dev`: Start de lokale ontwikkelserver met Hot Module Replacement (HMR).
*   `build`: Bouwt de applicatie voor productie (geoptimaliseerde bestanden in `dist/`).
*   `preview`: Start een lokale server om de productie-build te testen.
*   `lint`: Controleert de code op stijl- en syntaxfouten met ESLint.

## 💡 Development Notes

*   **Code Style:** We gebruiken ESLint om de codekwaliteit te bewaken. Draai regelmatig `npm run lint` om fouten te voorkomen.
*   **Taal:** De code (variabelen, comments) is grotendeels in het Engels geschreven, maar de content van de applicatie ondersteunt Nederlands en Engels.

## ❓ Troubleshooting

**Ik kan niet inloggen / krijg netwerkfouten:**
*   Controleer of de backend draait en bereikbaar is.
*   Controleer of `VITE_BACKEND_URI` in je `.env` bestand correct is ingesteld en overeenkomt met de poort van je backend (bijv. 5000 of 3000).
*   Herstart de frontend dev server na het wijzigen van `.env`.

**TypeScript errors:**
*   Probeer de server opnieuw te starten. Soms ziet de IDE nieuwe types pas na een herstart.

**Build fail:**
*   Verwijder `node_modules` en `package-lock.json` en draai `npm install` opnieuw om verse dependencies binnen te halen.
