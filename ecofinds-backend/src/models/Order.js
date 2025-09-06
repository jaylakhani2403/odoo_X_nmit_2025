class Order {
    constructor(userId, productIds, totalAmount) {
        this.userId = userId;
        this.productIds = productIds;
        this.totalAmount = totalAmount;
    }

    // Method to calculate total amount based on product prices
    calculateTotal(products) {
        this.totalAmount = this.productIds.reduce((total, productId) => {
            const product = products.find(p => p.id === productId);
            return total + (product ? product.price : 0);
        }, 0);
    }

    // Method to display order details
    displayOrder() {
        return {
            userId: this.userId,
            productIds: this.productIds,
            totalAmount: this.totalAmount
        };
    }
}

module.exports = Order;