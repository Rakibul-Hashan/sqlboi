-- MySQL বই: মিনি বস ২ (স্কুল লাইব্রেরি)।
DROP DATABASE IF EXISTS library;
CREATE DATABASE library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library;

CREATE TABLE books (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  title    VARCHAR(200) NOT NULL,
  author   VARCHAR(100) NOT NULL,
  category VARCHAR(50)  NOT NULL,
  copies   TINYINT UNSIGNED NOT NULL DEFAULT 1 CHECK (copies >= 1)
);

CREATE TABLE members (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  type      ENUM('ছাত্র', 'শিক্ষক') NOT NULL,
  phone     VARCHAR(15) UNIQUE,
  joined_on DATE NOT NULL
);

CREATE TABLE loans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  book_id     INT  NOT NULL,
  member_id   INT  NOT NULL,
  borrowed_on DATE NOT NULL,
  due_on      DATE NOT NULL,
  returned_on DATE NULL,
  CHECK (due_on > borrowed_on),
  CHECK (returned_on IS NULL OR returned_on >= borrowed_on),
  FOREIGN KEY (book_id)   REFERENCES books(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

INSERT INTO books (title, author, category, copies) VALUES
  ('পথের পাঁচালী', 'বিভূতিভূষণ বন্দ্যোপাধ্যায়', 'উপন্যাস', 3),
  ('গীতাঞ্জলি', 'রবীন্দ্রনাথ ঠাকুর', 'কবিতা', 2),
  ('অগ্নিবীণা', 'কাজী নজরুল ইসলাম', 'কবিতা', 2),
  ('দেবদাস', 'শরৎচন্দ্র চট্টোপাধ্যায়', 'উপন্যাস', 1),
  ('গোরা', 'রবীন্দ্রনাথ ঠাকুর', 'উপন্যাস', 1),
  ('শেষের কবিতা', 'রবীন্দ্রনাথ ঠাকুর', 'উপন্যাস', 2),
  ('বিষের বাঁশী', 'কাজী নজরুল ইসলাম', 'কবিতা', 1),
  ('আরণ্যক', 'বিভূতিভূষণ বন্দ্যোপাধ্যায়', 'উপন্যাস', 1);

INSERT INTO members (name, type, phone, joined_on) VALUES
  ('রাফি', 'ছাত্র', '01711000001', '2025-01-10'),
  ('নুসরাত', 'ছাত্র', '01811000002', '2025-01-12'),
  ('মীম', 'ছাত্র', '01911000004', '2025-03-01'),
  ('হাসান স্যার', 'শিক্ষক', '01700000101', '2024-08-20'),
  ('রুমানা ম্যাডাম', 'শিক্ষক', '01700000102', '2024-09-05'),
  ('তানভীর', 'ছাত্র', NULL, '2026-10-01');

INSERT INTO loans (book_id, member_id, borrowed_on, due_on, returned_on) VALUES
  (1, 1, '2026-09-01', '2026-09-15', '2026-09-14'),
  (2, 1, '2026-10-20', '2026-11-03', NULL),
  (4, 2, '2026-10-01', '2026-10-15', '2026-10-20'),
  (1, 2, '2026-11-01', '2026-11-15', NULL),
  (3, 3, '2026-11-05', '2026-11-19', NULL),
  (5, 4, '2026-08-10', '2026-09-10', '2026-09-01'),
  (6, 4, '2026-10-25', '2026-11-25', NULL),
  (1, 5, '2026-09-20', '2026-10-20', '2026-10-18'),
  (2, 5, '2026-11-02', '2026-12-02', NULL),
  (6, 1, '2026-07-01', '2026-07-15', '2026-07-20'),
  (4, 3, '2026-10-22', '2026-11-05', '2026-11-04');
