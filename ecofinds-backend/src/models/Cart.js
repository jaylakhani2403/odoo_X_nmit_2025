class Cart {
    constructor(userId) {
        this.userId = userId;
        this.productIds = [];
    }

    addProduct(productId) {
        if (!this.productIds.includes(productId)) {
            this.productIds.push(productId);
        }
    }

    removeProduct(productId) {
        this.productIds = this.productIds.filter(id => id !== productId);
    }

    getProducts() {
        return this.productIds;
    }

    clearCart() {
        this.productIds = [];
    }
}

module.exports = Cart;