# 🐱 StreetCats - Frontend

Frontend Angular per la piattaforma **StreetCats**, dedicata alla condivisione di avvistamenti di gatti randagi.

## 🛠️ Tecnologie Utilizzate

| Categoria | Tecnologia | Versione |
|-----------|------------|----------|
| **Framework** | Angular | 20.x |
| **Linguaggio** | TypeScript | 5.8.x |
| **Styling** | SCSS | - |
| **Mappe** | Leaflet | 1.9.x |
| **Rich Text Editor** | Quill + ngx-quill | 2.x / 28.x |
| **Markdown** | marked + ngx-markdown | 15.x / 20.x |
| **Notifiche** | ngx-toastr | 19.x |
| **Testing E2E** | Playwright | 1.53.x |

## 📦 Requisiti

- **Node.js** 20+
- **npm** 10+
- **Backend API** attivo su `http://localhost:5003`

## 🚀 Installazione

1. **Clona il repository:**
   ```bash
   git clone <repo-url>
   cd streetcats-frontend
   ```

2. **Installa le dipendenze:**
   ```bash
   npm install
   ```

3. **Avvia il server di sviluppo:**
   ```bash
   npm start
   # oppure
   ng serve
   ```

4. **Apri il browser:**
   ```
   http://localhost:4200
   ```

## 🏗️ Build di Produzione

```bash
npm run build
# oppure
ng build
```

I file compilati saranno in `dist/streetcats-frontend/browser`

## 🧪 Testing

### Test End-to-End (Playwright)

```bash
# Assicurati che backend e frontend siano attivi, poi:
npx playwright test

# Con interfaccia grafica
npx playwright test --ui

# Visualizza report
npx playwright show-report
```

**Nota:** I test E2E richiedono che il backend sia attivo su `http://localhost:5003`

### Test Unitari (Karma/Jasmine)

```bash
npm test
# oppure
ng test
```

## ✨ Funzionalità

### Pubbliche (senza login)
- 📋 Visualizzare lista avvistamenti con paginazione
- 🗺️ Esplorare la mappa interattiva con tutti i marker
- 🔍 Visualizzare dettaglio avvistamento (foto, descrizione, commenti)
- 📝 Leggere commenti degli altri utenti

### Autenticate (con login)
- ➕ Creare nuovo avvistamento con foto e posizione
- ✏️ Modificare i propri avvistamenti
- 🗑️ Eliminare i propri avvistamenti
- 💬 Aggiungere, modificare ed eliminare i propri commenti

## 📁 Struttura Progetto

```
src/
├── app/
│   ├── components/
│   │   ├── auth/               # Autenticazione
│   │   │   ├── login/          # Pagina login
│   │   │   └── register/       # Pagina registrazione
│   │   ├── cats/               # Gestione avvistamenti
│   │   │   ├── list/           # Lista con mappa
│   │   │   ├── detail/         # Dettaglio con commenti
│   │   │   └── form/           # Creazione/modifica
│   │   └── header/             # Navbar
│   ├── guards/                 # Route guards (authGuard)
│   ├── interceptors/           # HTTP interceptors (JWT)
│   ├── interfaces/             # TypeScript types
│   ├── services/               # API services
│   │   ├── auth.service.ts     # Autenticazione
│   │   ├── cat.service.ts      # CRUD avvistamenti
│   │   ├── comments.service.ts # CRUD commenti
│   │   └── revgeocoding.service.ts # Geocoding
│   └── shared/                 # Componenti condivisi
│       ├── confirm-dialog/     # Dialog conferma
│       └── map/                # Componente mappa
├── assets/                     # Immagini statiche
└── styles.scss                 # Stili globali
```

## 🎨 Palette Colori

| Colore | HEX | Uso |
|--------|-----|-----|
| 🟠 Primary | `#ff9800` | Bottoni, titoli, accenti |
| 🟠 Dark | `#e65100` | Hover, link attivi |
| ⬜ Background | `#f6f6f6` | Sfondo pagina |
| 🔴 Danger | `#d32f2f` | Errori, azioni distruttive |

## 🔧 Configurazione API

L'URL del backend è configurato nei servizi in `src/app/services/`. 
Di default punta a `http://localhost:5003`.

## 📝 Script Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm start` | Avvia server sviluppo |
| `npm run build` | Build produzione |
| `npm test` | Esegue test unitari |
| `npx playwright test` | Esegue test E2E |

## 👤 Autore

**Nome:** Mariano Sommella  
**Matricola:** N86004374  
**Corso:** Tecnologie Web - A.A. 2024/2025  
**Università:** Federico II di Napoli

---


## 📄 Licenza

MIT
