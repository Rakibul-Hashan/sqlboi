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
