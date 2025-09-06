class Product {
    constructor(name, price, description) {
        this.name = name;
        this.price = price;
        this.description = description;
    }

    // Method to get product details
    getDetails() {
        return {
            name: this.name,
            price: this.price,
            description: this.description
        };
    }

    // Method to update product details
    updateDetails(newDetails) {
        if (newDetails.name) this.name = newDetails.name;
        if (newDetails.price) this.price = newDetails.price;
        if (newDetails.description) this.description = newDetails.description;
    }
}

module.exports = Product;