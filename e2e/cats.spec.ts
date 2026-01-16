import { test, expect } from '@playwright/test';

test.describe('Streetcats E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
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
        await page.goto('/auth/login');
        await page.fill('input[type="text"]', 'wrong@email.com');
        await page.fill('input[type="password"]', 'wrongpasssdas');
        await page.waitForSelector('button[type="submit"]:not([disabled])');
        await page.click('button[type="submit"]');
        await expect(page.locator('.toast-error, .alert-danger')).toBeVisible({ timeout: 5000 });
    });

    test('5. Registrazione con email già usata mostra errore', async ({ page }) => {
        await page.goto('/auth/register');
        await page.fill('input#name', 'Test');
        await page.fill('input#email', 'test@email.com');
        await page.fill('input#phone', '1234567890');
        await page.fill('input#password', 'password');
        await page.waitForSelector('button[type="submit"]:not([disabled])');
        await page.click('button[type="submit"]');
        await expect(page.locator('.toast-error, .alert-danger')).toBeVisible({ timeout: 5000 });
    });

    test('6. Form nuovo avvistamento richiede titolo', async ({ page }) => {
        await page.goto('/auth/login');
        await page.fill('input[type="text"]', 'Mariano');
        await page.fill('input[type="password"]', '123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/cats');

        await page.goto('/cats/new');
        await page.waitForSelector('input#address', { timeout: 10000 });

        await page.fill('input#address', 'Via Roma');
        await page.fill('input#city', 'Napoli');
        await page.fill('input#cap', '80100');

        await page.click('input#title');
        await page.click('input#address');

        await expect(page.locator('.error-message')).toContainText('Il titolo è obbligatorio.');
        await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('7. Aggiunta commento richiede login', async ({ page }) => {
        await page.context().clearCookies();
        await page.goto('/cats');
        await expect(page.locator('.cat-card')).not.toHaveCount(0);
        await page.locator('.cat-card a:has-text("Dettagli")').first().click();
        await expect(page).toHaveURL(/\/cats\/\d+/, { timeout: 10000 });
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
        await expect(page.locator('.cat-image-multi, .cat-image')).toBeVisible();
    });

    test('10. Ricerca indirizzo nella form', async ({ page }) => {
        await page.goto('/auth/login');
        await page.fill('input[type="text"]', 'Mariano');
        await page.fill('input[type="password"]', '123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/cats');

        await page.goto('/cats/new');
        await page.waitForSelector('input#address', { timeout: 10000 });
        await page.fill('input#address', 'Via Toledo');
        await page.fill('input#city', 'Napoli');
        await page.fill('input#cap', '80134');
        await expect(page.locator('input#address')).toHaveValue('Via Toledo');
    });

    test('11. Un utente autenticato può creare un nuovo avvistamento', async ({ page }) => {
        await page.goto('/auth/login');
        await page.fill('input[type="text"]', 'Mariano');
        await page.fill('input[type="password"]', '123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/cats');

        await page.goto('/cats/new');
        await page.waitForSelector('input#title', { timeout: 10000 });

        const titolo = 'Test Playwright ' + Date.now();
        await page.fill('input#title', titolo);
        await page.locator('.ql-editor').first().fill('Gatto avvistato vicino al parco.');
        await page.fill('input#address', 'Via Test');
        await page.fill('input#city', 'Napoli');
        await page.fill('input#cap', '80100');

        await page.waitForSelector('button[type="submit"]:not([disabled])');
        await page.click('button[type="submit"]');

        // Gestisce il confirmation dialog
        await page.waitForSelector('app-confirm-dialog dialog.dialog', { timeout: 5000 });
        await page.click('app-confirm-dialog .btn-confirm');

        await expect(page).toHaveURL(/\/cats\/\d+/, { timeout: 15000 });
        await expect(page.getByRole('heading', { level: 2 })).toContainText(titolo);
    });

    test('12. Un utente autenticato può aggiungere un commento', async ({ page }) => {
        await page.goto('/auth/login');
        await page.fill('input[type="text"]', 'Mariano');
        await page.fill('input[type="password"]', '123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/cats');

        await page.locator('.cat-card a:has-text("Dettagli")').first().click();
        await expect(page).toHaveURL(/\/cats\/\d+/, { timeout: 10000 });

        const commentText = 'Commento test ' + Date.now();
        await page.locator('.ql-editor').first().fill(commentText);
        await page.click('button:has-text("Aggiungi Commento")');

        // Gestisce il confirmation dialog
        await page.waitForSelector('app-confirm-dialog dialog.dialog', { timeout: 5000 });
        await page.click('app-confirm-dialog .btn-confirm');

        await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
    });
});