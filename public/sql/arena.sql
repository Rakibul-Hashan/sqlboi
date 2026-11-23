-- প্র্যাকটিস অ্যারেনা (লেভেল ৪.৫)
-- চারটা ছোট জগৎ এক Database-এ: জিম, রেস্তোরাঁ, বইয়ের দোকান, ক্রিকেট লিগ।
-- সব নাম আর সংখ্যা কাল্পনিক।

DROP DATABASE IF EXISTS arena;
CREATE DATABASE arena CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE arena;

-- ১. জিম ------------------------------------------------------------
CREATE TABLE trainer (
  id        INT PRIMARY KEY,
  name      VARCHAR(50) NOT NULL,
  specialty VARCHAR(50) NOT NULL
);
CREATE TABLE program (
  id         INT PRIMARY KEY,
  title      VARCHAR(80) NOT NULL,
  trainer_id INT NOT NULL,
  fee        DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (trainer_id) REFERENCES trainer(id)
);
CREATE TABLE member (
  id   INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL
);
CREATE TABLE enrolled (
  member_id  INT NOT NULL,
  program_id INT NOT NULL,
  PRIMARY KEY (member_id, program_id),
  FOREIGN KEY (member_id)  REFERENCES member(id),
  FOREIGN KEY (program_id) REFERENCES program(id)
);
INSERT INTO trainer VALUES (1, 'রিয়াজ', 'ওজন'), (2, 'তাহমিনা', 'যোগব্যায়াম'), (3, 'সজীব', 'কার্ডিও');
INSERT INTO program VALUES
  (1, 'শক্তি ১০১', 1, 2500), (2, 'পাওয়ারলিফট', 1, 3500), (3, 'সকালের যোগ', 2, 2000),
  (4, 'ধ্যান', 2, 1500), (5, 'HIIT', 3, 3000);
INSERT INTO member VALUES
  (1, 'আনিকা', 'ঢাকা'), (2, 'বাপ্পী', 'চট্টগ্রাম'), (3, 'শিহাব', 'ঢাকা'),
  (4, 'রুবাইয়া', 'সিলেট'), (5, 'তুষার', 'ঢাকা'), (6, 'নাফিসা', 'খুলনা');
INSERT INTO enrolled VALUES
  (1, 1), (1, 2), (1, 3), (2, 1), (3, 1), (3, 2), (3, 5), (4, 3), (4, 4), (5, 5);

-- ২. রেস্তোরাঁ চেইন ------------------------------------------------------
CREATE TABLE outlet (
  id   INT PRIMARY KEY,
  area VARCHAR(50) NOT NULL
);
CREATE TABLE employee (
  id         INT PRIMARY KEY,
  name       VARCHAR(50) NOT NULL,
  outlet_id  INT NOT NULL,
  manager_id INT NULL,
  salary     DECIMAL(10,2) NOT NULL,
  join_date  DATE NOT NULL,
  FOREIGN KEY (outlet_id)  REFERENCES outlet(id),
  FOREIGN KEY (manager_id) REFERENCES employee(id)
);
INSERT INTO outlet VALUES (1, 'গুলশান'), (2, 'ধানমন্ডি'), (3, 'উত্তরা'), (4, 'মিরপুর'), (5, 'বনানী');
INSERT INTO employee VALUES
  (1,  'করিম',  1, NULL, 90000, '2019-03-01'),
  (2,  'সুমি',  2, 1,    55000, '2020-06-15'),
  (3,  'জামিল', 5, 1,    60000, '2021-01-10'),
  (4,  'পলাশ',  2, 2,    28000, '2023-02-01'),
  (5,  'নীলা',  2, 2,    32000, '2022-11-20'),
  (6,  'রনি',   5, 3,    30000, '2024-04-05'),
  (7,  'মিতু',  5, 3,    26000, '2023-08-12'),
  (8,  'শাওন',  1, 1,    40000, '2022-01-05'),
  (9,  'ঝুমা',  3, 1,    45000, '2025-02-01'),
  (10, 'আসিফ',  2, 2,    30000, '2025-01-15');

-- ৩. অনলাইন বইয়ের দোকান ---------------------------------------------------
CREATE TABLE customer (
  id   INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL
);
CREATE TABLE book (
  id       INT PRIMARY KEY,
  title    VARCHAR(80) NOT NULL,
  category VARCHAR(30) NOT NULL,
  price    DECIMAL(8,2) NOT NULL
);
CREATE TABLE purchase (
  id           INT PRIMARY KEY,
  customer_id  INT NOT NULL,
  book_id      INT NOT NULL,
  qty          INT NOT NULL DEFAULT 1,
  purchased_on DATE NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(id),
  FOREIGN KEY (book_id)     REFERENCES book(id)
);
INSERT INTO customer VALUES
  (1, 'রাহাত', 'ঢাকা'), (2, 'ইশরাত', 'চট্টগ্রাম'), (3, 'মাহি', 'ঢাকা'),
  (4, 'সৌরভ', 'সিলেট'), (5, 'তানহা', 'চট্টগ্রাম');
INSERT INTO book VALUES
  (1, 'SQL শিখি', 'প্রোগ্রামিং', 450), (2, 'পাইথন সহজ', 'প্রোগ্রামিং', 520),
  (3, 'নদীর গল্প', 'উপন্যাস', 800), (4, 'রহস্যের খোঁজে', 'উপন্যাস', 350),
  (5, 'মহাকাশের গল্প', 'বিজ্ঞান', 600), (6, 'ডেটাবেস ডিজাইন', 'প্রোগ্রামিং', 800),
  (7, 'ছোটদের ছড়া', 'শিশু', 200);
INSERT INTO purchase VALUES
  (1,  1, 1, 1, '2025-01-10'), (2,  1, 6, 1, '2025-02-14'), (3,  2, 3, 2, '2025-01-20'),
  (4,  3, 2, 1, '2025-03-05'), (5,  3, 1, 2, '2025-03-18'), (6,  4, 4, 1, '2024-12-28'),
  (7,  2, 5, 1, '2025-02-02'), (8,  5, 4, 1, '2025-04-11'), (9,  1, 5, 1, '2025-04-25'),
  (10, 3, 6, 1, '2025-05-09');

-- ৪. ক্রিকেট লিগ --------------------------------------------------------
CREATE TABLE team (
  id   INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);
CREATE TABLE player (
  id      INT PRIMARY KEY,
  name    VARCHAR(50) NOT NULL,
  team_id INT NOT NULL,
  role    VARCHAR(20) NOT NULL,
  runs    INT NOT NULL DEFAULT 0,
  wickets INT NOT NULL DEFAULT 0,
  FOREIGN KEY (team_id) REFERENCES team(id)
);
CREATE TABLE innings (
  id        INT PRIMARY KEY,
  played_on DATE NOT NULL,
  team_id   INT NOT NULL,
  score     INT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES team(id)
);
INSERT INTO team VALUES (1, 'পদ্মা টাইগার্স'), (2, 'মেঘনা কিংস'), (3, 'যমুনা স্টারস'), (4, 'কর্ণফুলী রেঞ্জার্স');
INSERT INTO player VALUES
  (1, 'রাকিব', 1, 'ব্যাটার', 412, 2),  (2, 'নয়ন', 1, 'অলরাউন্ডার', 288, 14),
  (3, 'ফাহিম', 1, 'বোলার', 45, 21),    (4, 'রিফাত', 2, 'ব্যাটার', 512, 0),
  (5, 'জিসান', 2, 'বোলার', 60, 18),    (6, 'অপু', 2, 'অলরাউন্ডার', 250, 9),
  (7, 'মারুফ', 3, 'ব্যাটার', 388, 1),  (8, 'সিয়াম', 3, 'বোলার', 45, 25);
INSERT INTO innings VALUES
  (1, '2025-03-01', 1, 165), (2, '2025-03-01', 2, 171), (3, '2025-03-08', 1, 142),
  (4, '2025-03-08', 2, 199), (5, '2025-03-08', 3, 120), (6, '2025-03-15', 1, 188),
  (7, '2025-03-15', 2, 150), (8, '2025-03-15', 3, 177);
