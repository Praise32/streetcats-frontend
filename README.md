# 🐱 StreetCats Frontend

Un'applicazione web per segnalare e visualizzare avvistamenti di gatti randagi. Costruita con Angular 20, permette agli utenti di registrarsi, pubblicare avvistamenti con foto e posizione su mappa, e interagire tramite commenti.

## ✨ Funzionalità

- **Autenticazione**: Login e registrazione utenti
- **Avvistamenti**: Crea, modifica ed elimina segnalazioni di gatti
- **Foto Multiple**: Carica fino a 5 foto per avvistamento con anteprima
- **Geolocalizzazione**: Mappa interattiva con Leaflet per selezionare la posizione
- **Commenti**: Sistema di commenti con editor ricco (Quill)
- **Notifiche Toast**: Feedback visivo per tutte le azioni
- **Dialog di Conferma**: Conferma per azioni distruttive e creative
- **Responsive Design**: Ottimizzato per desktop e mobile

## 🛠 Tecnologie

- **Framework**: Angular 20 con Standalone Components
- **Mappe**: Leaflet
- **Editor Testo**: ngx-quill
- **Notifiche**: ngx-toastr
- **Markdown**: ngx-markdown
- **Testing E2E**: Playwright
- **Styling**: SCSS

## 🚀 Avvio Rapido

### Prerequisiti

- Node.js 20+
- npm 10+

### Installazione

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
ng serve
```

L'applicazione sarà disponibile su `http://localhost:4200`

## 📦 Build

```bash
# Build di produzione
ng build

# I file compilati saranno in dist/streetcats-frontend
```

## 🧪 Testing

### Unit Tests

```bash
ng test
```

### E2E Tests con Playwright

```bash
# Esegui tutti i test E2E
npx playwright test

# Esegui con UI
npx playwright test --ui

# Report HTML
npx playwright show-report
```

## 📁 Struttura Progetto

```
src/app/
├── components/
│   ├── auth/           # Login e Registrazione
│   ├── cats/           # Lista, Dettaglio, Form
│   └── header/         # Navigazione
├── guards/             # Route guards
├── interceptors/       # HTTP interceptors
├── interfaces/         # TypeScript interfaces
├── services/           # API services
└── shared/             # Componenti riutilizzabili
    └── confirm-dialog/ # Dialog di conferma
```

## 🔧 Configurazione

L'applicazione si connette a un backend API. Configura l'URL del backend nei servizi se necessario.

## 📄 Licenza

MIT
