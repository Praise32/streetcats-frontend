import { test, expect } from '@playwright/test';

test.describe('Streetcats E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:4200/');
    });

    test('1. Visualizza lista avvistamenti', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Tutti gli Avvistamenti/i })).toBeVisible();
        await expect(page.locator('.cat-card')).not.toHaveCount(0);
    });

    test('2. Naviga al dettaglio di un gatto', async ({ page }) => {
        await expect(page.locator('.cat-card')).not.toHaveCount(0);
        await page.locator('.cat-card a:has-text("Dettagli")').first().click();
        await expect(page).toHaveURL(/\/cats\/\d+/, { timeout: 10000 });
        await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    });

    test('3. Mostra la mappa', async ({ page }) => {
        await expect(page.locator('app-map')).toBeVisible();
    });

    test('4. Login fallisce con credenziali errate', async ({ page }) => {
        await page.goto('http://localhost:4200/auth/login');
        await page.fill('input[type="text"]', 'wrong@email.com');
        await page.fill('input[type="password"]', 'wrongpasssdas');
        await page.waitForSelector('button[type="submit"]:not([disabled])')
        await page.click('button[type="submit"]');
        await expect(page.locator('.alert-danger')).toBeVisible();
    });

    test('5. Registrazione con email già usata mostra errore', async ({ page }) => {
        await page.goto('http://localhost:4200/auth/register');
        await page.fill('input#name', 'Test');
        await page.fill('input#email', 'test@email.com');
        await page.fill('input#phone', '1234567890');
        await page.fill('input#password', 'password');
        await page.waitForSelector('button[type="submit"]:not([disabled])');
        await page.click('button[type="submit"]');
        await expect(page.locator('.alert-danger')).toBeVisible();
    });

    test('6. Form nuovo avvistamento richiede titolo', async ({ page }) => {
        // Esegui login
        await page.goto('http://localhost:4200/auth/login');
        await page.fill('input[type="text"]', 'Mariano'); // usa una mail valida
        await page.fill('input[type="password"]', '123'); // usa la password corretta
        await page.click('button[type="submit"]');
        await page.waitForURL('**/cats');

        await page.goto('http://localhost:4200/cats/new');
        await page.waitForSelector('input#address', { timeout: 10000 });

        // Compila tutti i campi obbligatori tranne il titolo
        await page.fill('input#address', 'Via Roma');
        await page.fill('input#city', 'Napoli');
        await page.fill('input#cap', '80100');

        // Tocca il campo titolo e poi un altro campo per attivare la validazione
        await page.click('input#title');
        await page.click('input#address');

        // Verifica che venga mostrato il messaggio di errore sotto il campo titolo
        await expect(page.locator('.error-message')).toContainText('Il titolo è obbligatorio.');

        // Il bottone deve restare disabilitato
        await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('7. Aggiunta commento richiede login', async ({ page }) => {
        await page.context().clearCookies();
        await page.goto('http://localhost:4200/cats');
        await expect(page.locator('.cat-card')).not.toHaveCount(0);
        // Naviga al dettaglio del primo gatto
        await page.locator('.cat-card a:has-text("Dettagli")').first().click();
        await expect(page).toHaveURL(/\/cats\/\d+/, { timeout: 10000 });
        // Ora verifica il messaggio di login
        await expect(page.locator('.alert-info')).toContainText('Effettua il login');
    });

    test('8. Naviga tra le pagine della lista', async ({ page }) => {
        await expect(page.locator('button:has-text("Successiva")')).toBeVisible();
        await page.click('button:has-text("Successiva")');
        await expect(page.locator('.cat-card')).not.toHaveCount(0);
    });

    test('9. Visualizza dettaglio con foto', async ({ page }) => {
        await expect(page.locator('.cat-card')).not.toHaveCount(0);
        await page.locator('.cat-card a:has-text("Dettagli")').first().click();
        await expect(page).toHaveURL(/\/cats\/\d+/, { timeout: 10000 });
        await expect(page.locator('.cat-image-multi')).toBeVisible();
    });

    test('10. Ricerca indirizzo nella form', async ({ page }) => {
        // Esegui login
        await page.goto('http://localhost:4200/auth/login');
        await page.fill('input[type="text"]', 'Mariano'); // usa una mail valida
        await page.fill('input[type="password"]', '123'); // usa la password corretta
        await page.click('button[type="submit"]');
        await page.waitForURL('**/cats');


        await page.goto('http://localhost:4200/cats/new');
        await page.waitForSelector('input#address', { timeout: 10000 });
        await page.fill('input#address', 'Via Toledo');
        await page.fill('input#city', 'Napoli');
        await page.fill('input#cap', '80134');
        await expect(page.locator('input#address')).toHaveValue('Via Toledo');
    });

    test('11. Un utente autenticato può creare un nuovo avvistamento', async ({ page }) => {
        // Login
        await page.goto('http://localhost:4200/auth/login');
        await page.fill('input[type="text"]', 'Mariano'); // usa una mail valida
        await page.fill('input[type="password"]', '123'); // usa la password corretta
        await page.click('button[type="submit"]');
        await page.waitForURL('**/cats');

        // Vai al form nuovo avvistamento
        await page.goto('http://localhost:4200/cats/new');
        await page.waitForSelector('input#title', { timeout: 10000 });

        // Compila tutti i campi obbligatori
        const titolo = 'Test Playwright ' + Date.now();
        await page.fill('input#title', titolo);
        // Descrizione con Quill
        await page.locator('.ql-editor').first().fill('Gatto avvistato vicino al parco.');
        await page.fill('input#address', 'Via Test');
        await page.fill('input#city', 'Napoli');
        await page.fill('input#cap', '80100');

        // Simula la selezione della posizione sulla mappa se necessario (opzionale)
        // await page.click('app-map'); // oppure simula le coordinate

        // Invia il form
        await page.waitForSelector('button[type="submit"]:not([disabled])');
        await page.click('button[type="submit"]');

        // Verifica di essere stato reindirizzato al dettaglio del nuovo avvistamento
        await expect(page).toHaveURL(/\/cats\/\d+/, { timeout: 10000 });
        await expect(page.getByRole('heading', { level: 2 })).toContainText(titolo);
    });
});