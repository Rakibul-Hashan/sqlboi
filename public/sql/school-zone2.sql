-- MySQL বই: জোন ২-এর খাতা (লেভেল ৯–১২)। পুরোনো school Database মুছে নতুন করে বানায়।
DROP DATABASE IF EXISTS school;
CREATE DATABASE school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school;

CREATE TABLE teachers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(15) UNIQUE,
  salary     DECIMAL(10,2) NOT NULL CHECK (salary > 0),
  head_id    INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (head_id) REFERENCES teachers(id)
);

CREATE TABLE subjects (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50) NOT NULL UNIQUE,
  teacher_id INT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

CREATE TABLE students (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  roll       INT NOT NULL,
  class      TINYINT NOT NULL CHECK (class BETWEEN 6 AND 10),
  section    CHAR(1) NOT NULL DEFAULT 'A',
  city       VARCHAR(50),
  gpa        DECIMAL(3,2) CHECK (gpa BETWEEN 0 AND 5),
  birth_date DATE,
  phone      VARCHAR(15) UNIQUE,
  UNIQUE (class, section, roll)
);

CREATE TABLE marks (
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  score      TINYINT UNSIGNED NOT NULL CHECK (score <= 100),
  PRIMARY KEY (student_id, subject_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

INSERT INTO teachers (name, phone, salary, head_id) VALUES
  ('হাসান স্যার', '01700000101', 45000.00, NULL),
  ('রুমানা ম্যাডাম', '01700000102', 38000.00, 1),
  ('কামাল স্যার', '01700000103', 36000.00, 1),
  ('শারমিন ম্যাডাম', '01700000104', 30000.00, 2);

INSERT INTO subjects (name, teacher_id) VALUES
  ('গণিত', 1), ('বাংলা', 2), ('বিজ্ঞান', 3), ('ইংরেজি', NULL);

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

INSERT INTO marks (student_id, subject_id, score) VALUES
  (1, 1, 85), (1, 2, 78), (1, 3, 90),
  (2, 1, 98), (2, 2, 92), (2, 3, 95),
  (3, 1, 70), (3, 2, 75), (3, 3, 68),
  (4, 1, 88), (4, 2, 80), (4, 3, 82),
  (5, 1, 55), (5, 2, 62), (5, 3, 48),
  (6, 1, 92), (6, 2, 88), (6, 3, 94),
  (7, 1, 65), (7, 2, 72), (7, 3, 70),
  (9, 1, 80), (9, 2, 76), (9, 3, 79),
  (10, 1, 95), (10, 2, 97);
