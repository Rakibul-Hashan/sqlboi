-- MySQL বই: ফাইনাল বস (আলোকিত কোচিং সেন্টার)।
DROP DATABASE IF EXISTS coaching;
CREATE DATABASE coaching CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coaching;

CREATE TABLE teachers (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL UNIQUE
);

CREATE TABLE courses (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  fee       DECIMAL(10,2) NOT NULL,
  capacity  TINYINT UNSIGNED NOT NULL,
  starts_on DATE NOT NULL,
  CONSTRAINT chk_course_fee CHECK (fee > 0),
  CONSTRAINT chk_course_capacity CHECK (capacity BETWEEN 1 AND 100)
);

CREATE TABLE course_teachers (
  course_id  INT NOT NULL,
  teacher_id INT NOT NULL,
  PRIMARY KEY (course_id, teacher_id),
  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

CREATE TABLE students (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  phone     VARCHAR(15) NOT NULL UNIQUE,
  school    VARCHAR(150),
  joined_on DATE NOT NULL
);

CREATE TABLE enrollments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  student_id  INT NOT NULL,
  course_id   INT NOT NULL,
  enrolled_on DATE NOT NULL,
  UNIQUE (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id)  REFERENCES courses(id)
);

CREATE TABLE payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  method        ENUM('নগদ', 'bKash', 'Nagad', 'ব্যাংক') NOT NULL,
  paid_on       DATE NOT NULL,
  CONSTRAINT chk_payment_amount CHECK (amount > 0),
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
);

INSERT INTO teachers (name, phone) VALUES
  ('জামিল স্যার', '01700000201'), ('ফারজানা ম্যাডাম', '01700000202'), ('তারেক স্যার', '01700000203');

INSERT INTO courses (name, fee, capacity, starts_on) VALUES
  ('SSC গণিত', 6000.00, 3, '2026-09-01'),
  ('SSC পদার্থবিজ্ঞান', 5000.00, 4, '2026-09-01'),
  ('ইংরেজি স্পোকেন', 4000.00, 5, '2026-10-01'),
  ('প্রোগ্রামিং পরিচিতি', 8000.00, 2, '2026-11-01');

INSERT INTO course_teachers VALUES (1, 1), (2, 1), (2, 3), (3, 2), (4, 3);

INSERT INTO students (name, phone, school, joined_on) VALUES
  ('রাফি', '01711000001', 'আইডিয়াল স্কুল', '2026-08-20'),
  ('নুসরাত', '01811000002', 'ভিকারুননিসা নূন স্কুল', '2026-08-22'),
  ('তানভীর', '01811000003', 'আইডিয়াল স্কুল', '2026-08-25'),
  ('মীম', '01911000004', 'সিলেট সরকারি পাইলট', '2026-09-10'),
  ('আরিফ', '01511000005', NULL, '2026-10-05');

INSERT INTO enrollments (student_id, course_id, enrolled_on) VALUES
  (1, 1, '2026-08-20'), (1, 2, '2026-08-20'),
  (2, 1, '2026-08-22'), (2, 4, '2026-10-25'),
  (3, 1, '2026-08-25'), (3, 3, '2026-09-28'),
  (4, 2, '2026-09-10'),
  (5, 3, '2026-10-05');

INSERT INTO payments (enrollment_id, amount, method, paid_on) VALUES
  (1, 3000.00, 'bKash', '2026-08-20'), (1, 3000.00, 'bKash', '2026-10-01'),
  (2, 2500.00, 'নগদ', '2026-08-20'),
  (3, 6000.00, 'ব্যাংক', '2026-08-22'),
  (4, 4000.00, 'Nagad', '2026-10-25'),
  (5, 2000.00, 'নগদ', '2026-08-25'),
  (6, 4000.00, 'bKash', '2026-09-28'),
  (7, 1000.00, 'bKash', '2026-09-10');

CREATE VIEW enrollment_dues AS
SELECT e.id AS enrollment_id, s.id AS student_id, s.name AS student, c.name AS course,
       c.fee, IFNULL(SUM(p.amount), 0) AS paid,
       c.fee - IFNULL(SUM(p.amount), 0) AS due
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN courses c  ON c.id = e.course_id
LEFT JOIN payments p ON p.enrollment_id = e.id
GROUP BY e.id, s.id, s.name, c.name, c.fee;

DELIMITER //
CREATE PROCEDURE enroll(IN p_student INT, IN p_course INT)
BEGIN
  DECLARE v_capacity INT;
  DECLARE v_taken INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
    SELECT capacity INTO v_capacity FROM courses WHERE id = p_course FOR UPDATE;
    IF v_capacity IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'এই কোর্স নেই';
    END IF;

    SELECT COUNT(*) INTO v_taken FROM enrollments WHERE course_id = p_course;
    IF v_taken >= v_capacity THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'কোর্সে আর সিট খালি নেই';
    END IF;

    INSERT INTO enrollments (student_id, course_id, enrolled_on)
    VALUES (p_student, p_course, CURDATE());
  COMMIT;
END //

CREATE TRIGGER trg_payments_no_overpay
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
  DECLARE v_due DECIMAL(10,2);
  SELECT due INTO v_due FROM enrollment_dues WHERE enrollment_id = NEW.enrollment_id;
  IF NEW.amount > v_due THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'পরিশোধ বকেয়ার চেয়ে বেশি হতে পারে না';
  END IF;
END //
DELIMITER ;

CREATE INDEX idx_payments_paid_on ON payments (paid_on);
