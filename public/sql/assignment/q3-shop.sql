-- প্রবলেম ৩: অনলাইন শপ (লেভেল ৫.৪)
-- customer (cust_id, cname, city)
-- product (prod_id, pname, category, price)
-- orders (order_id, cust_id, prod_id, quantity, order_date)
-- সব নাম কাল্পনিক। যে কেসগুলো ইচ্ছা করে রাখা:
--   * Farzana আর Gias কখনো অর্ডার দেননি
--   * দুটো পণ্যের দাম সমান এবং সর্বোচ্চ (৯৫,০০০)
--   * Ayesha দুটো দামি পণ্যই কিনেছেন (ডুপ্লিকেটের ফাঁদ)
--   * Dipu আর Bashir দামি পণ্য কিনেছেন ২০২৪ আর ২০২৬ সালে
--   * Appliances-এর ২০২৫-এর মোট ঠিক ৫০,০০০ ("exceeds" মানে বেশি, সমান না)
--   * Clothing ২০২৫-এ ৫০,০০০ পার হয়নি, কিন্তু সব বছর মিলিয়ে পার হয়
--   * 2025-12-31 আর 2026-01-02-এর অর্ডার (বছরের সীমানা)

DROP DATABASE IF EXISTS asg_shop;
CREATE DATABASE asg_shop CHARACTER SET utf8mb4;
USE asg_shop;

CREATE TABLE customer (
  cust_id INT PRIMARY KEY,
  cname   VARCHAR(50) NOT NULL,
  city    VARCHAR(50) NOT NULL
);

CREATE TABLE product (
  prod_id  INT PRIMARY KEY,
  pname    VARCHAR(80) NOT NULL,
  category VARCHAR(30) NOT NULL,
  price    DECIMAL(10,2) NOT NULL
);

CREATE TABLE orders (
  order_id   INT PRIMARY KEY,
  cust_id    INT NOT NULL,
  prod_id    INT NOT NULL,
  quantity   INT NOT NULL,
  order_date DATE NOT NULL,
  FOREIGN KEY (cust_id) REFERENCES customer(cust_id),
  FOREIGN KEY (prod_id) REFERENCES product(prod_id)
);

INSERT INTO customer VALUES
  (1, 'Ayesha',  'Dhaka'),
  (2, 'Bashir',  'Chattogram'),
  (3, 'Chandni', 'Dhaka'),
  (4, 'Dipu',    'Sylhet'),
  (5, 'Emon',    'Khulna'),
  (6, 'Farzana', 'Rajshahi'),
  (7, 'Gias',    'Dhaka');

INSERT INTO product VALUES
  (1,  'Laptop Pro 14',    'Electronics', 95000),
  (2,  'Gaming Laptop X',  'Electronics', 95000),
  (3,  'Smartphone A5',    'Electronics', 28000),
  (4,  'Wireless Earbuds', 'Electronics',  3500),
  (5,  'Office Chair',     'Furniture',   12000),
  (6,  'Study Table',      'Furniture',    9500),
  (7,  'Bookshelf',        'Furniture',    7000),
  (8,  'Cotton Panjabi',   'Clothing',     2500),
  (9,  'Winter Jacket',    'Clothing',     4500),
  (10, 'Microwave Oven',   'Appliances',  12500),
  (11, 'Smart Watch',      'Electronics', 15000);

INSERT INTO orders VALUES
  (1,  1, 1,  1, '2025-01-15'),
  (2,  2, 3,  2, '2025-02-10'),
  (3,  3, 5,  2, '2025-03-05'),
  (4,  1, 8,  4, '2025-04-12'),
  (5,  4, 6,  3, '2025-05-20'),
  (6,  5, 9,  3, '2025-06-18'),
  (7,  2, 7,  2, '2025-08-08'),
  (8,  3, 4,  2, '2025-09-30'),
  (9,  4, 10, 4, '2025-11-11'),
  (10, 5, 8,  6, '2025-12-31'),
  (11, 4, 2,  1, '2024-12-28'),
  (12, 3, 6,  2, '2026-01-02'),
  (13, 2, 1,  1, '2026-02-14'),
  (14, 1, 2,  1, '2025-07-07'),
  (15, 5, 9,  4, '2024-11-20');
