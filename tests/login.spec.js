const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const testData = require('../fixtures/testData.json');

test.describe('SauceDemo Login Tests', () => {
  let loginPage;
  let inventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
  });

  test('TC001 - Login dengan kredensial valid', async ({ page }) => {
    const user = testData.validUsers[0];
    await loginPage.login(user.username, user.password);
    
    await expect(page).toHaveURL(/.*inventory.html/);
    expect(await inventoryPage.isLoaded()).toBeTruthy();
    expect(await inventoryPage.getTitle()).toBe('Products');
  });

  test('TC002 - Login dengan user yang di-lock', async ({ page }) => {
    const user = testData.invalidUsers[0];
    await loginPage.login(user.username, user.password);
    
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('locked out');
  });

  test('TC003 - Login dengan kredensial invalid', async ({ page }) => {
    const user = testData.invalidUsers[1];
    await loginPage.login(user.username, user.password);
    
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('do not match');
  });

  test('TC004 - Login tanpa username', async ({ page }) => {
    await loginPage.login('', 'secret_sauce');
    
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Username is required');
  });

  test('TC005 - Login tanpa password', async ({ page }) => {
    await loginPage.login('standard_user', '');
    
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Password is required');
  });
});