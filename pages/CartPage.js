class CartPage {
  constructor(page) {
    this.page = page;
    this.cartBadge = '.shopping_cart_badge';
    this.cartLink = '.shopping_cart_link';
    this.cartItems = '.cart_item';
    this.checkoutButton = '#checkout';
    this.continueShoppingButton = '#continue-shopping';
    this.removeButtons = '[id^="remove-"]';
  }

  async goto() {
    await this.page.click(this.cartLink);
  }

  async getCartCount() {
    const badge = await this.page.locator(this.cartBadge);
    if (await badge.isVisible()) {
      return await badge.textContent();
    }
    return '0';
  }

  async getCartItemsCount() {
    return await this.page.locator(this.cartItems).count();
  }

  async getCartItemNames() {
    return await this.page.locator('.inventory_item_name').allTextContents();
  }

  async removeItem(productName) {
    const itemName = productName.toLowerCase().replace(/\s+/g, '-');
    await this.page.click(`#remove-${itemName}`);
  }

  async continueShopping() {
    await this.page.click(this.continueShoppingButton);
  }

  async proceedToCheckout() {
    await this.page.click(this.checkoutButton);
  }
}

module.exports = CartPage;
