-- টেবিল জোড়া (লেভেল ১০ আর ১১): ছোট্ট একটা অনলাইন দোকান
-- customers, orders, products, employees, sizes
-- সব নাম কাল্পনিক। যে কেসগুলো ইচ্ছা করে রাখা:
--   * Nabila আর Tanvir এখনো কোনো অর্ডার দেননি
--   * অর্ডার 106-এর customer_id = 9, এমন কোনো কাস্টমার নেই
--     (পুরোনো সিস্টেম থেকে ইমপোর্ট করা ডেটা; তাই এই Column-এ FOREIGN KEY রাখা হয়নি)
--   * Smart Watch একবারও বিক্রি হয়নি
--   * Lipi এখনো কোনো অর্ডার প্রসেস করেননি
--   * Mitu সবার ওপরে, তাঁর কোনো manager নেই (NULL)
--   * products ৫টা, sizes ৪টা: CROSS JOIN-এ ৫ × ৪ = ২০

DROP DATABASE IF EXISTS join_shop;
CREATE DATABASE join_shop CHARACTER SET utf8mb4;
USE join_shop;

CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  name        VARCHAR(50) NOT NULL,
  city        VARCHAR(50) NOT NULL
);

CREATE TABLE employees (
  employee_id INT PRIMARY KEY,
  name        VARCHAR(50) NOT NULL,
  role        VARCHAR(50) NOT NULL,
  manager_id  INT NULL,
  FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

CREATE TABLE products (
  product_id   INT PRIMARY KEY,
  product_name VARCHAR(50) NOT NULL,
  category     VARCHAR(30) NOT NULL,
  price        DECIMAL(10,2) NOT NULL
);

CREATE TABLE orders (
  order_id    INT PRIMARY KEY,
  customer_id INT NOT NULL,          -- ইচ্ছা করে FOREIGN KEY নেই (ওপরে দেখো)
  product_id  INT NOT NULL,
  employee_id INT NOT NULL,
  order_date  DATE NOT NULL,
  quantity    INT NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (product_id)  REFERENCES products(product_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE sizes (
  size_code  VARCHAR(3) PRIMARY KEY,
  size_name  VARCHAR(20) NOT NULL,
  sort_order INT NOT NULL
);

INSERT INTO customers VALUES
  (1, 'Rahim',   'Dhaka'),
  (2, 'Karim',   'Chattogram'),
  (3, 'Sumaiya', 'Dhaka'),
  (4, 'Nabila',  'Sylhet'),
  (5, 'Tanvir',  'Khulna');

-- manager আগে ঢোকাতে হবে, নাহলে FOREIGN KEY আটকাবে
INSERT INTO employees VALUES
  (1, 'Mitu',   'Store Manager',     NULL),
  (2, 'Shakil', 'Sales Executive',   1),
  (3, 'Rony',   'Sales Executive',   1),
  (4, 'Lipi',   'Support Executive', 2);

INSERT INTO products VALUES
  (1, 'T-shirt',     'Clothing',     450),
  (2, 'Hoodie',      'Clothing',    1200),
  (3, 'Jacket',      'Clothing',    2500),
  (4, 'Headphone',   'Electronics', 1800),
  (5, 'Smart Watch', 'Electronics', 3500);

INSERT INTO orders VALUES
  (101, 1, 1, 2, '2026-01-05', 2,  900),
  (102, 1, 4, 3, '2026-01-12', 1, 1800),
  (103, 2, 2, 2, '2026-02-03', 1, 1200),
  (104, 3, 3, 3, '2026-02-20', 1, 2500),
  (105, 3, 1, 2, '2026-03-08', 3, 1350),
  (106, 9, 2, 3, '2026-03-15', 1, 1200),
  (107, 2, 4, 2, '2026-04-01', 1, 1800);

INSERT INTO sizes VALUES
  ('S',  'Small',       1),
  ('M',  'Medium',      2),
  ('L',  'Large',       3),
  ('XL', 'Extra Large', 4);
