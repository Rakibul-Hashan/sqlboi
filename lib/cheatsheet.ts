// চিট শিটের তথ্য। পাতা (/cheatsheet) আর গ্লোবাল সার্চ দুটোই এখান থেকে পড়ে।
// বেশিরভাগ উদাহরণ বইয়ের `school` Database-এর টেবিল দিয়ে লেখা, যাতে সরাসরি চালিয়ে দেখা যায়।

export interface CheatItem {
  id: string;
  title: string;
  code: string;
  note?: string;
  level: string; // যে লেভেলে বিস্তারিত আছে
  lang?: "sql" | "bash";
}

export interface CheatCategory {
  id: string;
  label: string;
  color: string; // literal Tailwind class (রানটাইমে বানানো class Tailwind দেখতে পায় না)
  items: CheatItem[];
}

const makeCheatsheet = (english: boolean): CheatCategory[] => [
  {
    id: "ddl",
    label: english ? "Schema and DDL" : "টেবিল বানানো (DDL)",
    color: "bg-green-soft",
    items: [
      { id: "create-db", title: english ? "Create a database" : "Database বানানো", code: "CREATE DATABASE school CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;\nUSE school;", note: english ? "Use utf8mb4 for Unicode text, including Bangla." : "বাংলার জন্য utf8mb4 লাগবেই।", level: "level-1" },
      { id: "create-table", title: english ? "Create a table" : "টেবিল বানানো", code: "CREATE TABLE students (\n  id    INT AUTO_INCREMENT PRIMARY KEY,\n  name  VARCHAR(100) NOT NULL,\n  gpa   DECIMAL(3,2),\n  phone VARCHAR(15) UNIQUE\n);", level: "level-1" },
      { id: "alter", title: english ? "Alter a table" : "গঠন বদলানো", code: "ALTER TABLE students ADD email VARCHAR(100);\nALTER TABLE students MODIFY email VARCHAR(150);\nALTER TABLE students RENAME COLUMN email TO mail;\nALTER TABLE students DROP COLUMN mail;", level: "level-2" },
      { id: "copy-table", title: english ? "Copy a table" : "টেবিলের কপি", code: english ? "CREATE TABLE students_bak LIKE students;     -- Schema and keys\nINSERT INTO students_bak SELECT * FROM students;\nCREATE TABLE toppers AS SELECT * FROM students WHERE gpa >= 4.5;  -- Without keys" : "CREATE TABLE students_bak LIKE students;     -- গঠন + Key\nINSERT INTO students_bak SELECT * FROM students;\nCREATE TABLE toppers AS SELECT * FROM students WHERE gpa >= 4.5;  -- Key ছাড়া", note: english ? "LIKE copies keys and indexes. AS SELECT copies the result without those constraints." : "LIKE Key রাখে, AS SELECT রাখে না।", level: "level-4-1" },
      { id: "drop", title: english ? "Empty or drop a table" : "মুছে ফেলা", code: english ? "TRUNCATE TABLE logs;   -- Keeps the table structure\nDROP TABLE logs;       -- Removes the table itself\nDROP TABLE IF EXISTS logs;" : "TRUNCATE TABLE logs;   -- সব Row, গঠন থাকে\nDROP TABLE logs;       -- টেবিলটাই\nDROP TABLE IF EXISTS logs;", level: "level-2" },
      { id: "inspect", title: english ? "Inspect a table" : "গঠন দেখা", code: "SHOW TABLES;\nDESC students;\nSHOW CREATE TABLE students;", level: "level-1" },
    ],
  },
  {
    id: "dml",
    label: english ? "Writing data (DML)" : "ডেটা লেখা (DML)",
    color: "bg-yellow-soft",
    items: [
      { id: "insert", title: english ? "Insert multiple rows" : "ঢোকানো (একসাথে অনেক)", code: "INSERT INTO subjects (name) VALUES ('ইংরেজি'), ('ইতিহাস');", level: "level-2" },
      { id: "insert-select", title: english ? "Insert from another table" : "আরেক টেবিল থেকে ঢোকানো", code: "INSERT INTO honor_roll (student_id, gpa)\nSELECT id, gpa FROM students WHERE gpa >= 4.8;", level: "level-4-1" },
      { id: "upsert", title: english ? "Upsert with ON DUPLICATE KEY UPDATE" : "Upsert: থাকলে বদলাও, না থাকলে ঢোকাও", code: "INSERT INTO marks (student_id, subject_id, score)\nVALUES (1, 1, 99) AS new\nON DUPLICATE KEY UPDATE score = new.score;", note: english ? "The VALUES(score) form was deprecated in MySQL 8.0.20." : "পুরোনো VALUES(score) লেখা MySQL 8.0.20 থেকে বাতিলের পথে।", level: "level-4-1" },
      { id: "insert-ignore", title: english ? "Skip duplicate keys" : "ডুপ্লিকেট হলে চুপচাপ বাদ", code: "INSERT IGNORE INTO honor_roll (student_id, gpa) VALUES (2, 5.00);", note: english ? "INSERT IGNORE can also turn other errors into warnings." : "অন্য error-ও warning হয়ে যায়; সাবধানে।", level: "level-4-1" },
      { id: "update", title: english ? "Update rows" : "বদলানো", code: "UPDATE students SET gpa = 4.60 WHERE id = 1;", note: english ? "Preview affected rows with the same WHERE clause before updating." : "আগে একই WHERE দিয়ে SELECT চালাও।", level: "level-2" },
      { id: "update-join", title: english ? "Update using a join" : "অন্য টেবিল দেখে বদলানো", code: "UPDATE marks m\nJOIN students s ON s.id = m.student_id\nSET m.score = LEAST(m.score + 5, 100)\nWHERE s.city = 'ঢাকা' AND m.subject_id = 3;", level: "level-4-1" },
      { id: "delete", title: english ? "Delete rows" : "মোছা", code: "DELETE FROM marks WHERE score < 33;", level: "level-2" },
      { id: "delete-join", title: english ? "Delete using a join" : "অন্য টেবিল দেখে মোছা", code: "DELETE m FROM marks m\nJOIN students s ON s.id = m.student_id\nWHERE s.class = 10;", level: "level-4-1" },
    ],
  },
  {
    id: "query",
    label: english ? "Reading data (SELECT)" : "খোঁজা (SELECT)",
    color: "bg-blue-soft",
    items: [
      { id: "select", title: english ? "Complete SELECT syntax" : "পুরো কাঠামো", code: "SELECT name, gpa\nFROM students\nWHERE class = 9\nORDER BY gpa DESC\nLIMIT 3 OFFSET 0;", level: "level-3" },
      { id: "order", title: english ? "Written order and logical processing order" : "লেখার ক্রম বনাম চালানোর ক্রম", code: english ? "-- Written order:   SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT\n-- Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT" : "-- লেখা:   SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT\n-- চালানো: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT", note: english ? "WHERE cannot refer to an alias defined in SELECT." : "তাই WHERE-এ SELECT-এর Alias চলে না।", level: "level-8" },
      { id: "filters", title: english ? "Common filters" : "ছাঁকার শর্টকাট", code: "SELECT name FROM students\nWHERE name LIKE 'র%'\n  AND class IN (8, 9)\n  AND gpa BETWEEN 4.00 AND 5.00\n  AND phone IS NOT NULL;", level: "level-4" },
      { id: "distinct", title: english ? "Remove duplicate results" : "ডুপ্লিকেট বাদ", code: "SELECT DISTINCT city FROM students;", level: "level-3" },
      { id: "precedence", title: english ? "Combine AND and OR" : "AND/OR একসাথে", code: "SELECT name FROM students\nWHERE (city = 'ঢাকা' OR city = 'সিলেট') AND gpa > 4;", note: english ? "AND binds first. Use parentheses to make grouping explicit." : "AND আগে কাজ করে; বন্ধনী দাও।", level: "level-5" },
    ],
  },
  {
    id: "functions",
    label: "Function",
    color: "bg-purple-soft",
    items: [
      { id: "string-fn", title: english ? "String functions" : "লেখার Function", code: "SELECT CONCAT(name, ' (', class, ')') AS label,\n       CHAR_LENGTH(name) AS letters,\n       UPPER('sql'), SUBSTRING(name, 1, 2), REPLACE(city, 'ঢাকা', 'Dhaka')\nFROM students;", note: english ? "Use CHAR_LENGTH to count characters. LENGTH counts bytes." : "বাংলায় দৈর্ঘ্য CHAR_LENGTH, LENGTH না (বাইট গোনে)।", level: "level-6" },
      { id: "number-fn", title: english ? "Numeric functions" : "সংখ্যার Function", code: "SELECT ROUND(4.567, 2), CEIL(4.1), FLOOR(4.9), ABS(-3), MOD(10, 3);", level: "level-6" },
      { id: "date-fn", title: english ? "Date functions" : "তারিখের Function", code: "SELECT CURDATE(), NOW(),\n       DATEDIFF('2026-12-31', CURDATE()) AS days_left,\n       TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age,\n       DATE_FORMAT(birth_date, '%d/%m/%Y') AS dob,\n       birth_date + INTERVAL 1 MONTH AS next_month\nFROM students;", level: "level-6" },
      { id: "case", title: english ? "Conditional values with CASE" : "CASE: শর্তে মান", code: "SELECT name,\n  CASE WHEN gpa >= 4.5 THEN 'চমৎকার'\n       WHEN gpa >= 3.5 THEN 'ভালো'\n       ELSE 'চেষ্টা চলুক' END AS grade\nFROM students;", level: "level-6" },
      { id: "null-fn", title: english ? "Handle NULL" : "NULL সামলানো", code: "SELECT name, IFNULL(gpa, 0), COALESCE(phone, 'নেই') FROM students;", level: "level-6" },
    ],
  },
  {
    id: "aggregate",
    label: english ? "Aggregates and GROUP BY" : "Aggregate আর GROUP BY",
    color: "bg-orange-soft",
    items: [
      { id: "agg", title: english ? "Five common aggregates" : "পাঁচ হিসাব", code: "SELECT COUNT(*), COUNT(gpa), SUM(gpa), ROUND(AVG(gpa), 2), MIN(gpa), MAX(gpa)\nFROM students;", note: english ? "COUNT(*) counts every row. COUNT(column) skips NULL values." : "COUNT(*) সব Row, COUNT(col) NULL বাদে।", level: "level-7" },
      { id: "group", title: english ? "Group and filter results" : "দলে ভাগ + দল ছাঁকা", code: "SELECT class, COUNT(*) AS n, ROUND(AVG(gpa), 2) AS avg_gpa\nFROM students\nWHERE gpa IS NOT NULL\nGROUP BY class\nHAVING COUNT(*) >= 3;", level: "level-8" },
      { id: "group-concat", title: english ? "Combine group values into one string" : "দলের নামগুলো এক লাইনে", code: "SELECT class, GROUP_CONCAT(name ORDER BY gpa DESC SEPARATOR ', ')\nFROM students GROUP BY class;", level: "level-8" },
      { id: "rollup", title: english ? "Subtotals and grand total" : "উপমোট আর সর্বমোট", code: "SELECT IF(GROUPING(class), 'সব', class) AS class, COUNT(*)\nFROM students\nGROUP BY class WITH ROLLUP;", level: "level-4-4" },
      { id: "pivot", title: english ? "Pivot rows into columns" : "Pivot (Row থেকে Column)", code: "SELECT student_id,\n  SUM(CASE WHEN subject_id = 1 THEN score END) AS ganit,\n  SUM(CASE WHEN subject_id = 2 THEN score END) AS bangla\nFROM marks GROUP BY student_id;", level: "level-4-4" },
    ],
  },
  {
    id: "constraints",
    label: english ? "Constraints" : "Constraint (নিয়ম)",
    color: "bg-green-soft",
    items: [
      { id: "pk-fk", title: english ? "Primary and foreign keys" : "Primary আর Foreign Key", code: "CREATE TABLE marks (\n  student_id INT NOT NULL,\n  subject_id INT NOT NULL,\n  score      TINYINT NOT NULL,\n  PRIMARY KEY (student_id, subject_id),\n  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,\n  FOREIGN KEY (subject_id) REFERENCES subjects(id)\n);", level: "level-9" },
      { id: "check", title: "CHECK, DEFAULT, UNIQUE", code: "CREATE TABLE exams (\n  id    INT AUTO_INCREMENT PRIMARY KEY,\n  code  VARCHAR(10) NOT NULL UNIQUE,\n  total INT NOT NULL DEFAULT 100 CHECK (total BETWEEN 1 AND 100)\n);", note: english ? "MySQL has enforced CHECK constraints since version 8.0.16." : "CHECK MySQL 8.0.16 থেকে সত্যিই প্রয়োগ হয়।", level: "level-9" },
    ],
  },
  {
    id: "joins",
    label: "JOIN",
    color: "bg-blue-soft",
    items: [
      { id: "inner", title: english ? "INNER JOIN: matching rows" : "INNER JOIN: দুদিকে মিল", code: "SELECT s.name, sub.name AS subject, m.score\nFROM marks m\nJOIN students s   ON s.id = m.student_id\nJOIN subjects sub ON sub.id = m.subject_id;", level: "level-10" },
      { id: "left", title: english ? "LEFT JOIN: keep all left rows" : "LEFT JOIN: বাঁয়ের সবাই", code: "SELECT s.name, COUNT(m.student_id) AS exams\nFROM students s\nLEFT JOIN marks m ON m.student_id = s.id\nGROUP BY s.id, s.name;", note: english ? "Put right-side matching conditions in ON to retain unmatched left rows." : "ডানের শর্ত ON-এ দাও, WHERE-এ দিলে INNER হয়ে যায়।", level: "level-11" },
      { id: "anti", title: english ? "Anti join: rows without a match" : "Anti Join: মিল নেই যাদের", code: "SELECT s.name\nFROM students s\nLEFT JOIN marks m ON m.student_id = s.id\nWHERE m.student_id IS NULL;", level: "level-11" },
      { id: "self", title: english ? "Self join: two references to one table" : "Self Join: একই টেবিল দুবার", code: "SELECT t.name, h.name AS head\nFROM teachers t\nLEFT JOIN teachers h ON h.id = t.head_id;", level: "level-11" },
    ],
  },
  {
    id: "subquery",
    label: english ? "Subqueries and set operations" : "Subquery আর সেট",
    color: "bg-purple-soft",
    items: [
      { id: "scalar", title: english ? "Scalar subquery" : "একটা মানের Subquery", code: "SELECT name, gpa FROM students\nWHERE gpa > (SELECT AVG(gpa) FROM students);", level: "level-12" },
      { id: "correlated", title: english ? "Compare with a row’s own group" : "নিজের দলের সাথে তুলনা", code: "SELECT s.name, s.class, s.gpa FROM students s\nWHERE s.gpa > (SELECT AVG(s2.gpa) FROM students s2 WHERE s2.class = s.class);", level: "level-12" },
      { id: "exists", title: "EXISTS / NOT EXISTS", code: "SELECT name FROM subjects sub\nWHERE NOT EXISTS (SELECT 1 FROM marks m WHERE m.subject_id = sub.id);", note: english ? "NULL values can make NOT IN evaluate to UNKNOWN. Use NOT EXISTS to check for no match." : "NULL থাকলে NOT IN ফাঁকা দেয়; NOT EXISTS নিরাপদ।", level: "level-12" },
      { id: "division", title: english ? "Every item (relational division)" : "\"সবগুলো\" (Relational Division)", code: "SELECT s.name FROM students s\nWHERE NOT EXISTS (\n  SELECT 1 FROM subjects sub WHERE sub.teacher_id IS NOT NULL\n  AND NOT EXISTS (\n    SELECT 1 FROM marks m\n    WHERE m.student_id = s.id AND m.subject_id = sub.id));", level: "level-4-4" },
      { id: "max-agg", title: english ? "Maximum of group totals" : "Aggregate-এর সর্বোচ্চ", code: "SELECT subject_id, SUM(score) AS total FROM marks\nGROUP BY subject_id\nHAVING SUM(score) = (SELECT MAX(t) FROM (SELECT SUM(score) AS t FROM marks GROUP BY subject_id) x);", note: english ? "Calculate SUM in a subquery before taking MAX of the totals." : "MAX(SUM(...)) সরাসরি চলে না (ERROR 1111)।", level: "level-4-4" },
      { id: "union", title: "UNION / UNION ALL", code: "SELECT name FROM students WHERE city = 'ঢাকা'\nUNION\nSELECT name FROM teachers;", note: english ? "UNION removes duplicates. UNION ALL keeps them." : "UNION ডুপ্লিকেট বাদ দেয়, UNION ALL দেয় না (দ্রুত)।", level: "level-12" },
    ],
  },
  {
    id: "window",
    label: "Window Function",
    color: "bg-orange-soft",
    items: [
      { id: "rank", title: english ? "Three ranking functions" : "র‍্যাঙ্কিং তিন ভাই", code: english ? "SELECT name, gpa,\n  ROW_NUMBER() OVER (ORDER BY gpa DESC) AS rn,     -- 1,2,3,4\n  RANK()       OVER (ORDER BY gpa DESC) AS rnk,    -- 1,2,2,4\n  DENSE_RANK() OVER (ORDER BY gpa DESC) AS dense   -- 1,2,2,3\nFROM students WHERE gpa IS NOT NULL;" : "SELECT name, gpa,\n  ROW_NUMBER() OVER (ORDER BY gpa DESC) AS rn,     -- ১,২,৩,৪\n  RANK()       OVER (ORDER BY gpa DESC) AS rnk,    -- ১,২,২,৪\n  DENSE_RANK() OVER (ORDER BY gpa DESC) AS dense   -- ১,২,২,৩\nFROM students WHERE gpa IS NOT NULL;", level: "level-4-2" },
      { id: "partition", title: english ? "Calculate within each partition" : "দলের ভেতরে হিসাব", code: "SELECT name, class, gpa,\n  AVG(gpa) OVER (PARTITION BY class) AS class_avg,\n  RANK() OVER (PARTITION BY class ORDER BY gpa DESC) AS pos\nFROM students;", level: "level-4-2" },
      { id: "top-n", title: english ? "Top N per group" : "প্রতি দলের সেরা N", code: "SELECT * FROM (\n  SELECT class, name, gpa,\n    DENSE_RANK() OVER (PARTITION BY class ORDER BY gpa DESC) AS r\n  FROM students\n) t WHERE r <= 2;", note: english ? "Filter window function results in an outer query or CTE." : "WHERE-এ সরাসরি Window চলে না (ERROR 1054)।", level: "level-4-2" },
      { id: "running", title: english ? "Running total, previous value, and moving average" : "চলমান যোগফল, আগের মান, চলমান গড়", code: "SELECT month, amount,\n  SUM(amount) OVER (ORDER BY month) AS running,\n  amount - LAG(amount) OVER (ORDER BY month) AS change_amt,\n  AVG(amount) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS avg_3m\nFROM fees;", level: "level-4-2" },
    ],
  },
  {
    id: "cte",
    label: "CTE",
    color: "bg-yellow-soft",
    items: [
      { id: "cte-basic", title: english ? "Name a query step" : "নাম দেওয়া ধাপ", code: "WITH class_avg AS (\n  SELECT class, AVG(gpa) AS a FROM students GROUP BY class\n)\nSELECT s.name FROM students s\nJOIN class_avg c ON c.class = s.class\nWHERE s.gpa > c.a;", level: "level-4-3" },
      { id: "cte-series", title: english ? "Generate a series of numbers or dates" : "সংখ্যা বা তারিখের সারি", code: "WITH RECURSIVE days (d) AS (\n  SELECT DATE('2026-11-01')\n  UNION ALL\n  SELECT d + INTERVAL 1 DAY FROM days WHERE d < '2026-11-07'\n)\nSELECT d FROM days;", level: "level-4-3" },
      { id: "cte-tree", title: english ? "Traverse a hierarchy" : "পদের গাছ (Hierarchy)", code: "WITH RECURSIVE tree AS (\n  SELECT id, name, 1 AS depth, CAST(name AS CHAR(200)) AS path\n  FROM teachers WHERE head_id IS NULL\n  UNION ALL\n  SELECT t.id, t.name, tree.depth + 1, CONCAT(tree.path, ' → ', t.name)\n  FROM teachers t JOIN tree ON t.head_id = tree.id\n)\nSELECT * FROM tree;", note: english ? "The anchor query sets the column width. Use CAST to allow longer recursive results." : "Column-এর চওড়া ভিত্তি অংশ থেকে; CAST না দিলে ERROR 1406।", level: "level-4-3" },
    ],
  },
  {
    id: "speed",
    label: english ? "Indexes and query performance" : "Index আর গতি",
    color: "bg-green-soft",
    items: [
      { id: "index", title: english ? "Create and inspect an index" : "Index বানানো আর দেখা", code: "CREATE INDEX idx_city_gpa ON students (city, gpa);\nSHOW INDEX FROM students;\nDROP INDEX idx_city_gpa ON students;", note: english ? "An index on (city, gpa) supports leftmost-prefix lookups on city or on both columns." : "Composite Index বাঁ দিক থেকে কাজ করে: (city) বা (city, gpa)-র খোঁজে লাগে, শুধু gpa-তে না।", level: "level-16" },
      { id: "explain", title: english ? "Inspect a query plan" : "Query-র পরিকল্পনা", code: "EXPLAIN SELECT * FROM marks WHERE subject_id = 2;\nEXPLAIN ANALYZE SELECT * FROM marks WHERE subject_id = 2;", note: english ? "Access type ALL indicates a full table scan." : "type: ALL মানে পুরো টেবিল পড়ছে।", level: "level-16" },
    ],
  },
  {
    id: "programs",
    label: "View, Procedure, Trigger",
    color: "bg-blue-soft",
    items: [
      { id: "view", title: "View", code: "CREATE OR REPLACE VIEW top_students AS\nSELECT name, class, gpa FROM students WHERE gpa >= 4.5;\nSELECT * FROM top_students;", level: "level-17" },
      { id: "procedure", title: "Stored Procedure", code: "DELIMITER //\nCREATE PROCEDURE class_list(IN c TINYINT)\nBEGIN\n  SELECT name, gpa FROM students WHERE class = c ORDER BY gpa DESC;\nEND //\nDELIMITER ;\nCALL class_list(9);", level: "level-17" },
      { id: "trigger", title: "Trigger", code: "DELIMITER //\nCREATE TRIGGER marks_check BEFORE INSERT ON marks\nFOR EACH ROW\nBEGIN\n  IF NEW.score > 100 THEN\n    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'নম্বর ১০০-এর বেশি হতে পারে না';\n  END IF;\nEND //\nDELIMITER ;", level: "level-17" },
    ],
  },
  {
    id: "transactions",
    label: "Transaction",
    color: "bg-purple-soft",
    items: [
      { id: "tx", title: english ? "Commit related changes together" : "সব হবে, নয়তো কিছুই না", code: english ? "START TRANSACTION;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;   -- Use ROLLBACK if the operation fails" : "START TRANSACTION;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;   -- ভুল হলে ROLLBACK;", level: "level-18" },
      { id: "lock", title: english ? "Lock rows while reading" : "পড়ার সময় তালা", code: english ? "START TRANSACTION;\nSELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\n-- ... calculate ...\nCOMMIT;" : "START TRANSACTION;\nSELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\n-- ... হিসাব ...\nCOMMIT;", level: "level-18" },
      { id: "isolation", title: "Isolation Level", code: english ? "SELECT @@transaction_isolation;   -- MySQL defaults to REPEATABLE READ\nSET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;" : "SELECT @@transaction_isolation;   -- MySQL-এর ডিফল্ট REPEATABLE-READ\nSET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;", level: "level-18" },
    ],
  },
  {
    id: "security",
    label: english ? "Users and backups" : "User আর Backup",
    color: "bg-orange-soft",
    items: [
      { id: "user", title: english ? "Users and privileges" : "User আর অনুমতি", code: "CREATE USER 'report'@'localhost' IDENTIFIED BY 'শক্ত-পাসওয়ার্ড';\nGRANT SELECT ON school.* TO 'report'@'localhost';\nSHOW GRANTS FOR 'report'@'localhost';\nREVOKE SELECT ON school.* FROM 'report'@'localhost';", note: english ? "Grant only the privileges the account needs." : "যতটুকু দরকার, ঠিক ততটুকু অনুমতি।", level: "level-19" },
      { id: "backup", title: english ? "Back up and restore from the terminal" : "Backup আর Restore (Terminal)", code: "mysqldump -u root -p --single-transaction --routines --triggers school > school.sql\nmysql -u root -p school < school.sql", level: "level-19", lang: "bash" },
    ],
  },
];

/** ছোট ছোট কৌশল: যা জানলে কাজ দ্রুত হয় */
const makeTricks = (english: boolean): { title: string; code?: string; text: string; level: string }[] => [
  { title: english ? "Show results vertically" : "উল্লম্ব ফলাফল", code: "SELECT * FROM students WHERE id = 1\\G", text: english ? "Use `\\G` instead of `;` in the mysql client to show every column on its own line." : "চওড়া Row টার্মিনালে না ভেঙে প্রতিটা Column আলাদা লাইনে দেখায়। `;`-এর বদলে `\\G`।", level: "level-3" },
  { title: english ? "Cancel an unfinished statement" : "অর্ধেক লেখা বাতিল", code: "SELECT * FROM stu \\c", text: english ? "Enter `\\c` in the mysql client to clear the current statement." : "ভুল লিখে ফেললে Enter না চেপে শেষে `\\c`: পুরো লেখাটা বাতিল।", level: "level-1" },
  { title: english ? "Run SQL from a file" : "ফাইল থেকে চালানো", code: "SOURCE school-zone2.sql;", text: english ? "Run a .sql file from inside the mysql client." : "mysql-এর ভেতর থেকেই পুরো .sql ফাইল চালাও।", level: "level-1" },
  { title: english ? "Check warnings" : "Warning দেখো", code: "SHOW WARNINGS;", text: english ? "Use this after `INSERT IGNORE` or a conversion to see warnings from the previous statement." : "`INSERT IGNORE`, Type বদলানো বা ভাগে শূন্যের পরে কী চুপচাপ ঘটল, এখানে লেখা থাকে।", level: "level-4-1" },
  { title: english ? "SELECT before UPDATE" : "UPDATE-এর আগে SELECT", code: english ? "SELECT * FROM marks WHERE score < 33;   -- Preview affected rows\nUPDATE marks SET score = 33 WHERE score < 33;" : "SELECT * FROM marks WHERE score < 33;   -- আগে দেখো\nUPDATE marks SET score = 33 WHERE score < 33;", text: english ? "Run `SELECT` with the same `WHERE` clause to see which rows will change." : "একই `WHERE` দিয়ে আগে দেখে নাও কোন Row বদলাবে।", level: "level-2" },
  { title: english ? "Safe update mode" : "Safe Update মোড", code: "SET SQL_SAFE_UPDATES = 1;", text: english ? "This mode can reject an `UPDATE` or `DELETE` without a key condition or a limit." : "Key ছাড়া `WHERE`-হীন `UPDATE`/`DELETE` আটকে দেয়। শেখার সময় চালু রাখো।", level: "level-2" },
  { title: english ? "Count affected rows" : "কয়টা Row বদলাল", code: "SELECT ROW_COUNT();", text: english ? "See how many rows the last write affected. An upsert ordinarily reports 1 for an insert and 2 for an update that changes a row." : "শেষ `UPDATE`/`DELETE`/`INSERT` কয়টা Row ছুঁয়েছে। Upsert-এ ১ মানে নতুন, ২ মানে বদলানো।", level: "level-4-1" },
  { title: english ? "Get the last AUTO_INCREMENT ID" : "শেষ AUTO_INCREMENT", code: "SELECT LAST_INSERT_ID();", text: english ? "Retrieve the generated ID to use as a foreign key in another insert." : "এইমাত্র ঢোকানো Row-এর `id`, পরের টেবিলে Foreign Key হিসেবে বসাতে।", level: "level-9" },
  { title: english ? "Count true conditions" : "MySQL-এ তুলনাই সংখ্যা", code: "SELECT SUM(score >= 80) AS high FROM marks;", text: english ? "In MySQL, `score >= 80` returns 1 or 0 for known scores, so `SUM` can count matches." : "MySQL-এ `score >= 80` নিজেই ১ বা ০; তাই `SUM` দিয়ে সরাসরি গোনা যায়। (অন্য Database-এ `CASE` লাগে।)", level: "level-4-4" },
  { title: english ? "Find the second-highest distinct value" : "দ্বিতীয় সর্বোচ্চ, এক লাইনে", code: "SELECT DISTINCT gpa FROM students ORDER BY gpa DESC LIMIT 1 OFFSET 1;", text: english ? "`DISTINCT` handles ties at the highest value before the offset is applied." : "`DISTINCT` না দিলে দুজনের সর্বোচ্চ সমান হলে আবার সর্বোচ্চই আসে।", level: "bonus" },
];

/** সাইটের কিবোর্ড শর্টকাট */
const makeShortcuts = (english: boolean): { keys: string[]; text: string }[] => [
  { keys: ["Ctrl", "K"], text: english ? "Open search (⌘ K on Mac)" : "সার্চ খোলো (Mac-এ ⌘ K)" },
  { keys: ["/"], text: english ? "Open search" : "সার্চ খোলো" },
  { keys: ["["], text: english ? "Previous chapter" : "আগের লেভেল" },
  { keys: ["]"], text: english ? "Next chapter" : "পরের লেভেল" },
  { keys: ["Esc"], text: english ? "Close search or contents" : "সার্চ বা মেনু বন্ধ" },
];

export const cheatsheet = makeCheatsheet(false);
export const tricks = makeTricks(false);
export const siteShortcuts = makeShortcuts(false);
export const englishCheatsheet = makeCheatsheet(true);
export const englishTricks = makeTricks(true);
export const englishShortcuts = makeShortcuts(true);
