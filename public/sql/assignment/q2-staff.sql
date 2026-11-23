-- প্রবলেম ২: স্টাফ আর ব্রাঞ্চ (লেভেল ৫.৩)
-- Staff (staff_id, sname, designation, join_date, supervisor_id, salary, branch_id)
-- Branch (branch_id, bname, city)
-- সব নাম কাল্পনিক। যে কেসগুলো ইচ্ছা করে রাখা:
--   * Kamal (MD)-এর কোনো supervisor নেই (NULL)
--   * Sohel ঠিক 2020-01-01-এ, Mahmud 2019-12-31-এ যোগ দিয়েছেন (সীমানার পরীক্ষা)
--   * Sumaiya আর Tareq-এর বেতন সমান (সাজানোয় টাই)
--   * Polash-এর বেতন ঠিক তাঁর ব্রাঞ্চের গড়ের সমান, কিন্তু পুরো কোম্পানির গড়ের চেয়ে বেশি
--   * 105 নম্বর ব্রাঞ্চে কোনো স্টাফ নেই

DROP DATABASE IF EXISTS asg_staff;
CREATE DATABASE asg_staff CHARACTER SET utf8mb4;
USE asg_staff;

CREATE TABLE Branch (
  branch_id INT PRIMARY KEY,
  bname     VARCHAR(50) NOT NULL,
  city      VARCHAR(50) NOT NULL
);

CREATE TABLE Staff (
  staff_id      INT PRIMARY KEY,
  sname         VARCHAR(50) NOT NULL,
  designation   VARCHAR(50) NOT NULL,
  join_date     DATE NOT NULL,
  supervisor_id INT NULL,
  salary        DECIMAL(10,2) NOT NULL,
  branch_id     INT NOT NULL,
  FOREIGN KEY (supervisor_id) REFERENCES Staff(staff_id),
  FOREIGN KEY (branch_id)     REFERENCES Branch(branch_id)
);

INSERT INTO Branch VALUES
  (101, 'Gulshan',    'Dhaka'),
  (102, 'Agrabad',    'Chattogram'),
  (103, 'Zindabazar', 'Sylhet'),
  (104, 'Dhanmondi',  'Dhaka'),
  (105, 'Sonadanga',  'Khulna');

-- supervisor আগে ঢোকাতে হবে, নাহলে FOREIGN KEY আটকাবে
INSERT INTO Staff VALUES
  (1,  'Kamal Hossain',   'Managing Director', '2015-03-01', NULL, 150000, 101),
  (2,  'Rina Akter',      'Branch Manager',    '2017-06-15', 1,     90000, 101),
  (3,  'Sohel Rana',      'Officer',           '2020-01-01', 2,     45000, 101),
  (4,  'Tania Islam',     'Officer',           '2021-08-10', 2,     52000, 101),
  (5,  'Arman Kabir',     'Assistant',         '2022-02-20', 4,     30000, 101),
  (6,  'Jamal Uddin',     'Branch Manager',    '2016-09-01', 1,     85000, 102),
  (7,  'Shirin Sultana',  'Officer',           '2019-11-11', 6,     50000, 102),
  (8,  'Rakib Hasan',     'Assistant',         '2023-04-01', 7,     28000, 102),
  (9,  'Nadia Chowdhury', 'Branch Manager',    '2018-01-20', 1,     80000, 103),
  (10, 'Faisal Ahmed',    'Officer',           '2020-05-05', 9,     48000, 103),
  (11, 'Mahmud Hasan',    'Branch Manager',    '2019-12-31', 1,     88000, 104),
  (12, 'Sumaiya Rahman',  'Officer',           '2021-03-15', 11,    55000, 104),
  (13, 'Tareq Aziz',      'Officer',           '2024-07-01', 11,    55000, 104),
  (14, 'Lima Khatun',     'Assistant',         '2025-01-10', 12,    32000, 104),
  (15, 'Polash Sarkar',   'Officer',           '2022-09-09', 9,     64000, 103);
