-- CSE2238 অ্যাসাইনমেন্টের চারটা Database একসাথে (লেভেল ৫.২–৫.৫)
-- চালালে চারটা আলাদা Database তৈরি হয়: asg_course, asg_staff, asg_shop, asg_emp
-- mysql -u root -p < all-assignment.sql

-- প্রবলেম ১: কোর্স রেজিস্ট্রেশন (লেভেল ৫.২)
-- student (student_id, name, dept)
-- course (course_code, title, instructor, offered_by)
-- registered (student_id, course_code, semester)
-- সব নাম কাল্পনিক। ডেটা ইচ্ছা করে এমনভাবে সাজানো যাতে প্রতিটা ফাঁদ ধরা পড়ে:
--   * Imran CSE-র ছাত্র, কিন্তু CSE-র কোনো কোর্স নেয়নি
--   * Tanvir EEE-র ছাত্র, কিন্তু CSE-র কোর্স নিয়েছে
--   * Dr. Rahman একটা MAT কোর্সও পড়ান; PHY101 পড়ান অন্য একজন "Dr. Mizanur Rahman"
--   * Mim একই কোর্স দুই সেমিস্টারে নিয়েছে (রিটেক)
--   * Farhana আর Labiba কোনো কোর্সই নেয়নি

DROP DATABASE IF EXISTS asg_course;
CREATE DATABASE asg_course CHARACTER SET utf8mb4;
USE asg_course;

CREATE TABLE student (
  student_id INT PRIMARY KEY,
  name       VARCHAR(50) NOT NULL,
  dept       VARCHAR(10) NOT NULL
);

CREATE TABLE course (
  course_code VARCHAR(10) PRIMARY KEY,
  title       VARCHAR(80) NOT NULL,
  instructor  VARCHAR(50) NOT NULL,
  offered_by  VARCHAR(10) NOT NULL
);

CREATE TABLE registered (
  student_id  INT NOT NULL,
  course_code VARCHAR(10) NOT NULL,
  semester    VARCHAR(15) NOT NULL,
  PRIMARY KEY (student_id, course_code, semester),
  FOREIGN KEY (student_id)  REFERENCES student(student_id),
  FOREIGN KEY (course_code) REFERENCES course(course_code)
);

INSERT INTO student VALUES
  (1, 'Rafi',    'CSE'),
  (2, 'Nusrat',  'CSE'),
  (3, 'Tanvir',  'EEE'),
  (4, 'Mim',     'CSE'),
  (5, 'Arif',    'BBA'),
  (6, 'Sadia',   'EEE'),
  (7, 'Jubayer', 'CSE'),
  (8, 'Imran',   'CSE'),
  (9, 'Farhana', 'BBA'),
  (10, 'Labiba', 'EEE');

INSERT INTO course VALUES
  ('CSE101', 'Structured Programming',     'Dr. Rahman',         'CSE'),
  ('CSE205', 'Data Structures',            'Dr. Rahman',         'CSE'),
  ('CSE238', 'Database Management System', 'Dr. Rahman',         'CSE'),
  ('CSE311', 'Computer Networks',          'Ms. Akter',          'CSE'),
  ('MAT101', 'Calculus',                   'Dr. Rahman',         'MAT'),
  ('EEE101', 'Basic Electrical Circuits',  'Dr. Hossain',        'EEE'),
  ('PHY101', 'Physics I',                  'Dr. Mizanur Rahman', 'PHY'),
  ('BBA101', 'Principles of Management',   'Ms. Karim',          'BBA');

INSERT INTO registered VALUES
  (1, 'CSE101', 'Spring-2025'), (1, 'MAT101', 'Spring-2025'), (1, 'CSE205', 'Fall-2025'),
  (1, 'CSE238', 'Spring-2026'), (1, 'CSE311', 'Spring-2026'),
  (2, 'CSE101', 'Spring-2025'), (2, 'CSE205', 'Fall-2025'),   (2, 'CSE238', 'Spring-2026'),
  (3, 'EEE101', 'Spring-2025'), (3, 'CSE101', 'Fall-2025'),
  (4, 'CSE101', 'Spring-2025'), (4, 'CSE101', 'Fall-2025'),   (4, 'CSE205', 'Fall-2025'),
  (4, 'CSE238', 'Spring-2026'),
  (5, 'BBA101', 'Spring-2025'), (5, 'MAT101', 'Fall-2025'),
  (6, 'EEE101', 'Spring-2025'), (6, 'PHY101', 'Fall-2025'),   (6, 'CSE311', 'Spring-2026'),
  (7, 'CSE101', 'Spring-2025'), (7, 'CSE205', 'Spring-2025'), (7, 'CSE238', 'Fall-2025'),
  (7, 'MAT101', 'Fall-2025'),   (7, 'PHY101', 'Spring-2026'),
  (8, 'BBA101', 'Fall-2025');


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


-- প্রবলেম ৪: Emp আর Dept (লেভেল ৫.৫)
-- Emp (empno, ename, job, hiredate, mgr, sal, deptno)
-- Dept (deptno, dname, loc)
-- পরিচিত EMP/DEPT ছকের আদলে, তবে সংখ্যা নিজেদের। যে কেসগুলো ইচ্ছা করে রাখা:
--   * সবার গড় বেতন ঠিক 4000, আর SCOTT-এর বেতনও ঠিক 4000
--   * সর্বনিম্ন বেতন (1500) দুজনের: SMITH আর JAMES
--   * 40 নম্বর বিভাগে দুজন আছেন; 50 নম্বর বিভাগে কেউ নেই
--   * KING-এর কোনো mgr নেই (NULL)

DROP DATABASE IF EXISTS asg_emp;
CREATE DATABASE asg_emp CHARACTER SET utf8mb4;
USE asg_emp;

CREATE TABLE Dept (
  deptno INT PRIMARY KEY,
  dname  VARCHAR(30) NOT NULL,
  loc    VARCHAR(30) NOT NULL
);

CREATE TABLE Emp (
  empno    INT PRIMARY KEY,
  ename    VARCHAR(30) NOT NULL,
  job      VARCHAR(20) NOT NULL,
  hiredate DATE NOT NULL,
  mgr      INT NULL,
  sal      DECIMAL(10,2) NOT NULL,
  deptno   INT NOT NULL,
  FOREIGN KEY (mgr)    REFERENCES Emp(empno),
  FOREIGN KEY (deptno) REFERENCES Dept(deptno)
);

INSERT INTO Dept VALUES
  (10, 'ACCOUNTING', 'Dhaka'),
  (20, 'RESEARCH',   'Chattogram'),
  (30, 'SALES',      'Sylhet'),
  (40, 'OPERATIONS', 'Khulna'),
  (50, 'MARKETING',  'Rajshahi');

INSERT INTO Emp VALUES
  (7839, 'KING',   'PRESIDENT', '2015-11-17', NULL, 9000, 10),
  (7566, 'JONES',  'MANAGER',   '2016-04-02', 7839, 5500, 20),
  (7698, 'BLAKE',  'MANAGER',   '2016-05-01', 7839, 5200, 30),
  (7782, 'CLARK',  'MANAGER',   '2016-06-09', 7839, 5000, 10),
  (7788, 'SCOTT',  'ANALYST',   '2019-12-09', 7566, 4000, 20),
  (7499, 'ALLEN',  'SALESMAN',  '2017-02-20', 7698, 3000, 30),
  (7934, 'MILLER', 'CLERK',     '2018-01-23', 7782, 2000, 10),
  (7369, 'SMITH',  'CLERK',     '2020-12-17', 7788, 1500, 20),
  (7900, 'JAMES',  'CLERK',     '2021-12-03', 7698, 1500, 30),
  (7950, 'RAHIM',  'OPERATOR',  '2022-03-01', 7839, 3800, 40),
  (7951, 'KARIM',  'OPERATOR',  '2023-06-15', 7950, 3500, 40);


