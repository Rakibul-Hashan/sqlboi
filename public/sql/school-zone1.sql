-- MySQL বই: জোন ১-এর খাতা (লেভেল ১–৮)। পুরোনো school Database মুছে নতুন করে বানায়।
DROP DATABASE IF EXISTS school;
CREATE DATABASE school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school;
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), roll INT, class TINYINT, section CHAR(1),
  city VARCHAR(50), gpa DECIMAL(3,2), birth_date DATE, phone VARCHAR(15));
INSERT INTO students (name, roll, class, section, city, gpa, birth_date, phone) VALUES
('রাফি', 1, 8, 'A', 'ঢাকা', 4.50, '2011-03-14', '01711000001'),
  ('নুসরাত', 2, 8, 'A', 'চট্টগ্রাম', 5.00, '2011-07-02', '01811000002'),
  ('তানভীর', 3, 8, 'B', 'ঢাকা', 3.75, '2010-12-25', NULL),
  ('মীম', 4, 9, 'A', 'সিলেট', 4.25, '2010-05-19', '01911000004'),
  ('আরিফ', 5, 9, 'B', 'রাজশাহী', 2.90, '2009-11-30', NULL),
  ('সাদিয়া', 6, 9, 'A', 'ঢাকা', 4.80, '2010-01-08', '01611000006'),
  ('জুবায়ের', 7, 10, 'A', 'খুলনা', 3.50, '2009-08-21', '01511000007'),
  ('ফারিহা', 8, 10, 'B', 'চট্টগ্রাম', NULL, '2009-04-11', '01311000008'),
  ('ইমরান', 9, 10, 'A', 'ঢাকা', 4.00, '2008-10-03', NULL),
  ('লামিয়া', 10, 8, 'B', 'বরিশাল', 4.95, '2011-02-27', '01711000010');
