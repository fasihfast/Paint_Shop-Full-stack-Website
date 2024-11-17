import mysql from 'mysql2';
import { config } from 'dotenv';

// console.log('DB_USER:', process.env.DB_USER); // Debugging line
// console.log('DB_PASS:', process.env.DB_PW); // Debugging line
// console.log('DB_NAME:', process.env.DB_NAME); // Debugging line

 const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "abc123",
    database: "International_Paint_House",
    multipleStatements: true,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

console.log('Connected to mysql database');

// db.on("Connected",()=>{
//     console.log('Connected to mysql database');
// })

// db.on("Disconnected",()=>{
//     console.log('Disconnected from mysql database');
// })

// db.on("Error",(err)=>{
//     console.log("An Error has Occured while connecting to Mysql database",err);
// })

const create_table_query=`
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number1 VARCHAR(15),
    phone_number2 VARCHAR(15),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) CHECK (province IN ('Sindh', 'Balochistan', 'Punjab', 'Khyber Pakhtunkhwa', 'Kashmir')) NOT NULL,
    country VARCHAR(100) NOT NULL,
    gmaplink VARCHAR(255)
);

-- Admins Table
CREATE TABLE IF NOT EXISTS Admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Categories Table
CREATE TABLE IF NOT EXISTS Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,  
    category_name VARCHAR(100) NOT NULL,        
    description TEXT,                           
    parent_category_id INT NULL,
    admin_id INT NULL,
    FOREIGN KEY (parent_category_id) REFERENCES Categories(category_id) ON DELETE SET NULL, -- Self-referencing foreign key,
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id) ON DELETE SET NULL -- Foreign key referencing Admins table
);



-- Brands Table
CREATE TABLE IF NOT EXISTS Brands (
    brand_id  INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL,
    description TEXT,
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id) ON DELETE SET NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
    status BOOLEAN NOT NULL DEFAULT TRUE,
    category_id INT,
    brand_id INT,
    admin_id INT,
    image_url VARCHAR(255),
    image BLOB,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES Brands(brand_id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id) ON DELETE SET NULL
);

-- Product Variants Table
CREATE TABLE IF NOT EXISTS ProductVariants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
    admin_id INT,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id) ON DELETE SET NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    order_status VARCHAR(50) DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')) NOT NULL,
    admin_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS OrderItems (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES ProductVariants(variant_id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_method VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed')) NOT NULL,
    admin_id INT,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id) ON DELETE SET NULL
);
--
-- Shopping Cart Table
CREATE TABLE IF NOT EXISTS ShoppingCart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id) ON DELETE SET NULL
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS CartItems (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    product_id INT,
    variant_id INT,
    quantity INT NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (cart_id) REFERENCES ShoppingCart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES ProductVariants(variant_id) ON DELETE CASCADE
);
`;


db.query(create_table_query,(err,result)=>{

    if(err){
        console.error("Error has occured while running the query: ", err.message);
    }else{
        console.log("Table created successfully : ",result);
    }

});

export {db};