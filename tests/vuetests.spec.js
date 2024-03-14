const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/');
});

test('search test', async ({ page }) => {
    let mainInput = page.locator('.main-input');
    await mainInput.fill('TESLA');
    await mainInput.press('Enter');
    await expect(page.getByText('Symbol: TSLA')).toBeVisible();
});

test('watchlist test', async ({ page }) => {
    let mainInput = page.locator('.main-input');
    await mainInput.fill('TESLA');
    await mainInput.press('Enter');
    let addToWatchList = page.locator('.watchlist-button');
    await addToWatchList.click();
    await expect(page.getByText('TSLA -')).toBeVisible();
});

test('remove from watchlist test', async ({ page }) => {
    let mainInput = page.locator('.main-input');
    await mainInput.fill('TESLA');
    await mainInput.press('Enter');
    let addToWatchList = page.locator('.watchlist-button');
    await addToWatchList.click();
    let removeFromWatchlist = page.locator('.watchlist-remove-button');
    await removeFromWatchlist.click();
    await expect(page.getByText('TSLA -')).toBeHidden();
});