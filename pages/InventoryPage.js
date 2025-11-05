class InventoryPage {
  constructor(page) {
    this.page = page;
    this.title = '.title';
    this.inventoryItems = '.inventory_item';
    this.addToCartButtons = '[id^="add-to-cart-"]';
    this.removeButtons = '[id^="remove-"]';
    this.cartBadge = '.shopping_cart_badge';
    this.productNames = '.inventory_item_name';
    this.productPrices = '.inventory_item_price';
  }

  async isLoaded() {
    await this.page.waitForSelector(this.title);
    return await this.page.locator(this.title).isVisible();
  }

  async getTitle() {
    return await this.page.locator(this.title).textContent();
  }

  async getProductCount() {
    return await this.page.locator(this.inventoryItems).count();
  }

  async addToCartByName(productName) {
    // Cari produk berdasarkan nama, lalu klik button add to cart
    const productCard = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName });
    
    const addButton = productCard.locator('button[id^="add-to-cart"]');
    await addButton.click();
  }

  async addToCartByIndex(index) {
    const buttons = await this.page.locator(this.addToCartButtons).all();
    
    if (index >= buttons.length) {
      const availableCount = buttons.length;
      throw new Error(`Cannot add product at index ${index}. Only ${availableCount} "Add to cart" buttons available.`);
    }
    
    await buttons[index].click();
  }

  async removeFromCartByName(productName) {
    const productCard = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName });
    
    const removeButton = productCard.locator('button[id^="remove"]');
    await removeButton.click();
  }

  async getCartBadgeCount() {
    const badge = await this.page.locator(this.cartBadge);
    if (await badge.isVisible()) {
      return await badge.textContent();
    }
    return '0';
  }

  async getAllProductNames() {
    return await this.page.locator(this.productNames).allTextContents();
  }

  async getProductPrice(productName) {
    const productCard = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName });
    
    const priceText = await productCard.locator('.inventory_item_price').textContent();
    return priceText;
  }

  async isProductAdded(productName) {
    const productCard = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName });
    
    const removeButton = productCard.locator('button[id^="remove"]');
    return await removeButton.isVisible();
  }
}

module.exports = InventoryPage;