const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const CartPage = require('../pages/CartPage');
const testData = require('../fixtures/testData.json');

test.describe('Add to Cart Tests', () => {
  let loginPage;
  let inventoryPage;
  let cartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    
    // Login terlebih dahulu
    await loginPage.goto();
    const user = testData.validUsers[0];
    await loginPage.login(user.username, user.password);
    await page.waitForURL(/.*inventory.html/);
  });

  test('TC006 - Add single product to cart', async ({ page }) => {
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    
    const badgeCount = await inventoryPage.getCartBadgeCount();
    expect(badgeCount).toBe('1');
    
    const isAdded = await inventoryPage.isProductAdded('Sauce Labs Backpack');
    expect(isAdded).toBeTruthy();
  });

  test('TC007 - Add multiple products to cart', async ({ page }) => {
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await inventoryPage.addToCartByName('Sauce Labs Bike Light');
    await inventoryPage.addToCartByName('Sauce Labs Bolt T-Shirt');
    
    const badgeCount = await inventoryPage.getCartBadgeCount();
    expect(badgeCount).toBe('3');
  });

  test('TC008 - Remove product from inventory page', async ({ page }) => {
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    let badgeCount = await inventoryPage.getCartBadgeCount();
    expect(badgeCount).toBe('1');
    
    await inventoryPage.removeFromCartByName('Sauce Labs Backpack');
    badgeCount = await inventoryPage.getCartBadgeCount();
    expect(badgeCount).toBe('0');
  });

  test('TC009 - Verify cart badge updates correctly', async ({ page }) => {
    // Awalnya tidak ada badge
    let badgeCount = await inventoryPage.getCartBadgeCount();
    expect(badgeCount).toBe('0');
    
    // Tambah 1 produk
    await inventoryPage.addToCartByIndex(0);
    badgeCount = await inventoryPage.getCartBadgeCount();
    expect(badgeCount).toBe('1');
    
    // Tambah 2 produk lagi
    await inventoryPage.addToCartByIndex(1);
    await inventoryPage.addToCartByIndex(2);
    badgeCount = await inventoryPage.getCartBadgeCount();
    expect(badgeCount).toBe('3');
  });

  test('TC010 - Verify cart page shows correct products', async ({ page }) => {
    const expectedProducts = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
    
    await inventoryPage.addToCartByName(expectedProducts[0]);
    await inventoryPage.addToCartByName(expectedProducts[1]);
    
    await cartPage.goto();
    
    const cartItems = await cartPage.getCartItemsCount();
    expect(cartItems).toBe(2);
    
    const cartItemNames = await cartPage.getCartItemNames();
    expect(cartItemNames).toContain(expectedProducts[0]);
    expect(cartItemNames).toContain(expectedProducts[1]);
  });

  test('TC011 - Remove product from cart page', async ({ page }) => {
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await inventoryPage.addToCartByName('Sauce Labs Bike Light');
    
    await cartPage.goto();
    
    let itemCount = await cartPage.getCartItemsCount();
    expect(itemCount).toBe(2);
    
    await cartPage.removeItem('Sauce Labs Backpack');
    
    itemCount = await cartPage.getCartItemsCount();
    expect(itemCount).toBe(1);
    
    let badgeCount = await cartPage.getCartCount();
    expect(badgeCount).toBe('1');
  });

  test('TC012 - Continue shopping from cart', async ({ page }) => {
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await cartPage.goto();
    
    await cartPage.continueShopping();
    
    await expect(page).toHaveURL(/.*inventory.html/);
    expect(await inventoryPage.isLoaded()).toBeTruthy();
  });

  test('TC013 - Add all products to cart', async ({ page }) => {
  // Ambil semua nama produk secara dinamis
  const productNames = await inventoryPage.getAllProductNames();
  
  // Add semua produk
  for (const productName of productNames) {
    await inventoryPage.addToCartByName(productName);
  }
  
  // Verifikasi badge count
  const badgeCount = await inventoryPage.getCartBadgeCount();
  expect(badgeCount).toBe(productNames.length.toString());
  
  // Verifikasi di cart page
  await cartPage.goto();
  const cartItems = await cartPage.getCartItemsCount();
  expect(cartItems).toBe(productNames.length);
  
  // Bonus: Verifikasi semua nama produk ada di cart
  const cartItemNames = await cartPage.getCartItemNames();
  expect(cartItemNames.sort()).toEqual(productNames.sort());
 });

  test('TC014 - Empty cart by removing all items', async ({ page }) => {
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await inventoryPage.addToCartByName('Sauce Labs Bike Light');
    
    await cartPage.goto();
    
    await cartPage.removeItem('Sauce Labs Backpack');
    await cartPage.removeItem('Sauce Labs Bike Light');
    
    const itemCount = await cartPage.getCartItemsCount();
    expect(itemCount).toBe(0);
    
    const badgeCount = await cartPage.getCartCount();
    expect(badgeCount).toBe('0');
  });

  test('TC015 - Verify checkout button is visible with items', async ({ page }) => {
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await cartPage.goto();
    
    const checkoutBtn = page.locator('#checkout');
    await expect(checkoutBtn).toBeVisible();
    await expect(checkoutBtn).toBeEnabled();
  });
});