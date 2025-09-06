# EcoFinds - Sustainable Second-Hand Marketplace

## 🌍 The Challenge

**EcoFinds – Empowering Sustainable Consumption through a Second-Hand Marketplace**

The challenge is to design and build a foundational platform that encourages sustainable consumption by enabling people to buy and sell pre-owned goods. This project focuses on extending the lifecycle of products, reducing waste, and providing an accessible alternative to purchasing new items.

---

## 🌟 Overall Vision

EcoFinds aims to become a vibrant and trusted platform that revolutionizes second-hand shopping. The platform seeks to:

* Foster a **culture of sustainability**.
* Extend product lifecycles.
* Reduce **unnecessary waste**.
* Create a **community-driven marketplace** for conscious buyers and sellers.

---

## 🎯 Mission

Our mission for the hackathon is to deliver a **user-friendly and engaging prototype** (desktop & mobile) that connects buyers and sellers. The application should:

* Provide intuitive design.
* Offer essential features for listing and browsing products.
* Build trust among users.
* Promote **circular economy practices**.

---

## 📌 Problem Statement

Develop a foundational version of EcoFinds focusing on **core functionalities**:

* User authentication & registration.
* Product listing creation & management.
* Product browsing with filtering & search.
* Basic user dashboard and cart functionality.

### Key Features (Problem Statement 1)

1. **User Authentication**: Simple, secure registration and login (email + password).
2. **Profile Creation**: Users can set a username.
3. **User Dashboard**: Edit all profile fields.
4. **Product Listing Creation**: Add listings with title, description, category, price, and image placeholder.
5. **Product Management (CRUD)**: View, edit, and delete own listings.
6. **Product Browsing**: Feed view with title, price, and image placeholder.
7. **Category Filtering**: Filter products by predefined categories.
8. **Keyword Search**: Search by product title keywords.
9. **Product Detail View**: Display full product details.
10. **Cart**: Add items to cart and view them.
11. **Previous Purchases**: Display list of purchased products.

---

## 🖼️ Wireframes (Conceptual)

### 🔑 Login/Sign Up Screen

* App logo
* Email input
* Password input
* Login button
* Sign-up link/button

### 🛍️ Product Listing Feed Screen

* Header (App logo/title)
* Search bar
* Category filter options (buttons/dropdown)
* Product list (image, title, price)
* **+ Add New Product** button

### ➕ Add New Product Screen

* Back button
* Title: *Add New Product*
* Fields: Title, Category (dropdown), Description, Price
* Add Image (placeholder)
* Submit Listing button

### 📂 My Listings Screen

* Header (App logo/title)
* * Add new product button
* List of user’s products (image, title, price, Edit/Delete)

### 📝 Product Detail Screen

* Back button
* Large product image placeholder
* Product title, price, category, description

### 👤 User Dashboard

* Header (App logo/title)
* User profile image
* Editable profile fields

### 🛒 Cart Screen

* Header (App logo/title)
* Cards of added products with basic info

### 📦 Previous Purchases Screen

* List view of all previously purchased products

---

## 🛠️ Tech Stack

* **Frontend**: React.js / Next.js, Tailwind CSS
* **Backend**: Node.js, Express.js
* **Database**: PostgreSQL (Prisma ORM)
* **Authentication**: JWT (JSON Web Tokens)
* **Hosting**: Vercel (Frontend), Render/Heroku (Backend)

---

## 👨‍💻 Team Details

**Team Leader:** Jay Lakhani
📧 Email: [23ce062@charusat.edu.in](mailto:23ce062@charusat.edu.in) | 📱 Phone: 6356382734
Reviewer: Aman Patel (ampa)

**Team Members:**

* Rudra Dudhat — [23ce028@charusat.edu.in](mailto:23ce028@charusat.edu.in) | 9978652299
* Nishit Desai — [23ce021@charusat.edu.in](mailto:23ce021@charusat.edu.in) | 6352098559
* Prince Diyora — [23ce024@charusat.edu.in](mailto:23ce024@charusat.edu.in) | 9265919172

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
 git clone https://github.com/your-username/ecofinds.git
 cd ecofinds
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file and add:

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Run Migrations

```bash
npx prisma migrate dev
```

### 5. Start Development Server

```bash
npm run dev
```

---

## 📌 Future Enhancements

* Secure image upload (Cloudinary / AWS S3).
* Advanced filtering & sorting.
* Payment gateway integration.
* Chat between buyers & sellers.
* Push notifications for new listings.

---

## 📜 License

This project is licensed under the MIT License.

