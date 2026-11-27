// প্রতিটা লেভেলের "এক নজরে" সারাংশ। একই লেখা লেভেলের শেষে আর রিভিশন পেজে দেখায়।
// `ব্যাকটিক` দিয়ে ঘেরা অংশ কোড হিসেবে দেখাবে।

export interface Summary {
  /** মূল কথা, ৩–৬টা */
  points: string[];
  /** মুখস্থ রাখার মতো ছোট্ট সিনট্যাক্স */
  syntax?: string;
  /** সবচেয়ে সাধারণ ফাঁদ */
  traps?: string[];
}

export const summaries: Record<string, Summary> = {
  "level-0": {
    points: [
      "Database মানে গোছানো তথ্যের খাতা; DBMS (যেমন MySQL) সেটা চালায়, আর প্রশ্ন করার ভাষা SQL।",
      "খাতা বা Excel-এর তুলনায় Database দ্রুত খোঁজে, একসাথে অনেককে সামলায় আর নিয়ম দিয়ে ভুল আটকায়।",
      "ওয়েবসাইটে প্রবাহ: Browser → Server (PHP) → MySQL → Server → Browser।",
      "উপমা: Server = ডেস্ক, Database = খাতা, Table = ছক, Row = লাইন, Column = ঘর।",
    ],
    syntax: "CREATE DATABASE school CHARACTER SET utf8mb4;\nINSERT INTO students (name) VALUES ('রাফি');\nSELECT name FROM students;",
    traps: ["বাংলা `???` দেখালে Database আর সংযোগ দুই জায়গাতেই `utf8mb4` লাগবে।", "ইউজারের লেখা সরাসরি SQL-এ জোড়া দিলে SQL Injection-এর ফাঁক থাকে।"],
  },
  "level-1": {
    points: [
      "Table-এর আড়াআড়ি লাইন Row (Record/Tuple), খাড়া ঘর Column (Field/Attribute)।",
      "প্রতিটা Column-এর একটা Data Type: `INT`, `DECIMAL(p,s)`, `VARCHAR(n)`, `DATE`, `DATETIME`, `BOOLEAN`।",
      "টাকার জন্য সবসময় `DECIMAL`, কখনো `FLOAT` না; ফোন নম্বর `VARCHAR`।",
      "নাম রাখো ছোট হাতে snake_case-এ, স্পেস ছাড়া।",
    ],
    syntax: "CREATE TABLE t (\n  id   INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100),\n  gpa  DECIMAL(3,2)\n);\nDESCRIBE t;",
    traps: ["শেষ Column-এর পরে বাড়তি কমা দিলে syntax error।", "`DECIMAL(3,2)`-এ সর্বোচ্চ 9.99।"],
  },
  "level-2": {
    points: [
      "`INSERT` দিয়ে এক বা একসাথে অনেক Row ঢোকাও; লেখা আর তারিখ উদ্ধৃতিতে।",
      "`UPDATE ... SET ... WHERE` বদলায়, `DELETE FROM ... WHERE` মোছে।",
      "`ALTER` গঠন বদলায়; `TRUNCATE` সব খালি করে কাউন্টার রিসেট করে; `DROP` পুরোটাই মোছে।",
      "DDL = গঠন (CREATE, ALTER, DROP, TRUNCATE), DML = ডেটা (SELECT, INSERT, UPDATE, DELETE)।",
    ],
    syntax: "UPDATE students SET gpa = 3.90 WHERE id = 8;\nDELETE FROM students WHERE roll = 99;\nALTER TABLE students ADD email VARCHAR(255);",
    traps: ["`WHERE` ছাড়া `UPDATE`/`DELETE` সব Row-এ চলে। আগে একই `WHERE` দিয়ে `SELECT` চালাও।", "তারিখ সবসময় `'YYYY-MM-DD'`।"],
  },
  "level-3": {
    points: [
      "`SELECT` কলাম `FROM` টেবিল `WHERE` শর্ত `ORDER BY` কলাম `LIMIT` সংখ্যা: এই ক্রমেই লিখতে হয়।",
      "`ORDER BY ... DESC` বড় থেকে ছোট; `ORDER BY` না দিলে ক্রমের কোনো নিশ্চয়তা নেই।",
      "পেজ p, প্রতি পেজে n টা হলে `LIMIT n OFFSET (p-1)*n`।",
      "`DISTINCT` ডুপ্লিকেট Row বাদ দেয়; `AS` দিয়ে Alias।",
    ],
    syntax: "SELECT name, gpa * 20 AS percent\nFROM students\nWHERE class = 8\nORDER BY gpa DESC\nLIMIT 3;",
    traps: ["`WHERE`-এ Alias চলে না (লেভেল ৮-এর Execution Order)।", "লেখার মান উদ্ধৃতি ছাড়া দিলে MySQL সেটাকে Column ভাবে।"],
  },
  "level-4": {
    points: [
      "`LIKE`-এ `%` = যেকোনো কিছু, `_` = ঠিক একটা অক্ষর।",
      "`IN (...)` মানে তালিকার যেকোনোটা; `BETWEEN a AND b`-এ দুই প্রান্তই ভেতরে।",
      "`NULL` মানে জানা নেই: খুঁজতে `IS NULL` / `IS NOT NULL`; বদলাতে `IFNULL` বা `COALESCE`।",
    ],
    syntax: "WHERE name LIKE 'ফ%'\n  AND city IN ('ঢাকা', 'সিলেট')\n  AND gpa BETWEEN 3.5 AND 4.5\n  AND phone IS NOT NULL",
    traps: ["`= NULL` কখনো সত্যি হয় না।", "`NOT IN`-এর তালিকায় একটা `NULL` থাকলে কোনো Row আসে না।", "`DATETIME`-এ `BETWEEN` শেষ দিনের সময় বাদ দেয়; `>= শুরু AND < পরের দিন` লেখো।"],
  },
  "level-5": {
    points: [
      "`AND` দুটোই সত্যি, `OR` যেকোনোটা, `NOT` উল্টায়।",
      "অগ্রাধিকার: বন্ধনী → তুলনা → `NOT` → `AND` → `OR`।",
      "Three-Valued Logic: সত্য, মিথ্যা, NULL। মিথ্যা AND যাই হোক = মিথ্যা; সত্য OR যাই হোক = সত্য।",
      "De Morgan: `NOT (A OR B)` = `NOT A AND NOT B`।",
    ],
    syntax: "WHERE (city = 'ঢাকা' OR city = 'চট্টগ্রাম')\n  AND gpa >= 4.50",
    traps: ["`AND` আর `OR` একসাথে থাকলে সবসময় বন্ধনী দাও।", "\"ঢাকা আর সিলেটের ছাত্ররা\" SQL-এ `OR` (বা `IN`), `AND` না।"],
  },
  "boss-1": {
    points: [
      "শূন্য থেকে টেবিল ডিজাইন: টাকা `DECIMAL`, মেয়াদহীন জিনিসে তারিখ `NULL`।",
      "স্টক বাড়াতে `SET stock = stock + 20`, যাতে আগের মান যাই থাকুক যোগ হয়।",
      "মোছার আগে একই শর্তে `SELECT` চালিয়ে দেখে নাও।",
      "`IN` দিয়ে লিখলে `AND`/`OR`-এর অগ্রাধিকারের ফাঁদ এড়ানো যায়।",
    ],
  },
  "level-6": {
    points: [
      "লেখা: `CONCAT`, `CONCAT_WS`, `CHAR_LENGTH`, `UPPER`/`LOWER`, `TRIM`, `REPLACE`, `LEFT`/`RIGHT`, `SUBSTRING` (গোনা শুরু ১ থেকে)।",
      "সংখ্যা: `ROUND`, `CEIL` (ছাদ), `FLOOR` (মেঝে), `TRUNCATE`, `MOD`, `ABS`।",
      "তারিখ: `CURDATE`, `NOW`, `DATEDIFF`, `TIMESTAMPDIFF(YEAR, জন্ম, CURDATE())`, `DATE_ADD`, `DATE_FORMAT`।",
      "`CASE WHEN ... THEN ... ELSE ... END` প্রথম সত্যি শর্তেই থামে; দুই বিকল্পে `IF(শর্ত, ক, খ)`।",
    ],
    syntax: "SELECT CONCAT(name, ' (', class, ')') AS card,\n       TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age,\n       CASE WHEN gpa = 5 THEN 'A+' WHEN gpa >= 4 THEN 'A' ELSE 'B' END AS grade\nFROM students;",
    traps: ["বাংলার দৈর্ঘ্য `CHAR_LENGTH` দিয়ে; `LENGTH` বাইট গোনে।", "`CONCAT`-এর একটা অংশ `NULL` হলে পুরোটাই `NULL`।", "লেখা জোড়ায় `+` না; `'5' + 3` = 8।"],
  },
  "level-7": {
    points: [
      "`COUNT`, `SUM`, `AVG`, `MIN`, `MAX` অনেক Row থেকে একটা উত্তর দেয়।",
      "`COUNT(*)` সব Row গোনে; `COUNT(col)` শুধু যেখানে মান `NULL` না।",
      "`COUNT(*)` ছাড়া সব Aggregate `NULL` উপেক্ষা করে, তাই `AVG` শুধু যাদের মান আছে তাদের গড়।",
      "MySQL-এ `SUM(শর্ত)` দিয়ে শর্তসাপেক্ষে গোনা যায়।",
    ],
    syntax: "SELECT COUNT(*), COUNT(phone), ROUND(AVG(gpa), 2),\n       SUM(gpa >= 4.00) AS a_or_more\nFROM students;",
    traps: ["Aggregate-এর পাশে সাধারণ Column (`SELECT name, MAX(gpa)`) MySQL 8-এ error 1140।", "খালি সেটে `SUM` দেয় `NULL`; `IFNULL(SUM(x), 0)`।", "`WHERE`-এ Aggregate চলে না।"],
  },
  "level-8": {
    points: [
      "`GROUP BY` Row-গুলোকে দলে ভাগ করে, প্রতিটা দলের জন্য Aggregate।",
      "`WHERE` দল বানানোর আগে Row ছাঁকে; `HAVING` পরে দল ছাঁকে।",
      "Execution Order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT।",
      "`GROUP_CONCAT` দলের মানগুলো এক লাইনে জোড়ে।",
    ],
    syntax: "SELECT class, COUNT(*) AS n, ROUND(AVG(gpa), 2) AS avg_gpa\nFROM students\nWHERE city <> 'ঢাকা'\nGROUP BY class\nHAVING AVG(gpa) > 4.00\nORDER BY class;",
    traps: ["`SELECT`-এ শুধু দল-বানানো Column আর Aggregate (নয়তো error 1055)।", "MySQL 8-এ `GROUP BY` নিজে থেকে সাজায় না।", "যে শর্ত `WHERE`-এ বসে, সেটা `HAVING`-এ দিয়ো না।"],
  },
  "level-9": {
    points: [
      "Constraint হলো Database-এর দরজায় পাহারা: `NOT NULL`, `DEFAULT`, `UNIQUE`, `CHECK`, `PRIMARY KEY`, `FOREIGN KEY`।",
      "Primary Key = `NOT NULL` + `UNIQUE`, টেবিলে একটাই; Composite Key একাধিক Column মিলে।",
      "Foreign Key এতিম Row আটকায় (Referential Integrity)। `ON DELETE`: `RESTRICT` (ডিফল্ট), `CASCADE`, `SET NULL`।",
      "Constraint-এর নাম দিলে error মেসেজ পড়া সহজ।",
    ],
    syntax: "CREATE TABLE marks (\n  student_id INT NOT NULL,\n  subject_id INT NOT NULL,\n  score TINYINT UNSIGNED NOT NULL CHECK (score <= 100),\n  PRIMARY KEY (student_id, subject_id),\n  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE\n);",
    traps: ["MySQL 8.0.16-এর আগে `CHECK` চুপচাপ উপেক্ষা হতো।", "`UNIQUE` Column-এ একাধিক `NULL` থাকতে পারে।", "Parent টেবিল আগে, Child পরে বানাও; Type দুই পাশে হুবহু মেলাও।"],
  },
  "level-10": {
    points: [
      "একটা তথ্য এক জায়গায়: কাস্টমার, অর্ডার, পণ্য, কর্মী আলাদা টেবিলে, id দিয়ে একে অন্যকে চেনে।",
      "আগে প্রশ্ন: বেশি Column (পাশাপাশি) লাগবে, নাকি বেশি Row (ওপরে-নিচে)? Column হলে JOIN, Row হলে UNION।",
      "সম্পর্ক না চাইলে JOIN লাগে না: \"সব কাস্টমার আর সব অর্ডার\" = দুটো আলাদা SELECT।",
      "`INNER JOIN` শুধু দুই পাশে মিল থাকা Row রাখে; অর্ডারহীন কাস্টমার আর কাস্টমারহীন অর্ডার বাদ।",
      "`SELECT *` না, দরকারি Column; টেবিলের Alias (`customers c`) Query ছোট আর পরিষ্কার রাখে।",
    ],
    syntax: "SELECT c.name, o.order_id, o.order_date, o.amount\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id;",
    traps: ["`ON` ভুলে গেলে Cartesian Product (৫ × ৭ = ৩৫ লাইন)।", "ভুল Column দিয়ে `ON` দিলে error ছাড়াই ভুল উত্তর।", "দুই টেবিলে একই নামের Column হলে alias বাধ্যতামূলক (`ambiguous`)।"],
  },
  "level-11": {
    points: [
      "`LEFT JOIN` বাঁয়ের সবাইকে রাখে, মিল না থাকলে ডানে `NULL`; বাঁয়ে বসে \"রিপোর্টের প্রতি Row যা\" সেই টেবিল।",
      "`RIGHT JOIN` উল্টো; টেবিল উল্টে `LEFT JOIN` লেখাই প্রচলিত।",
      "`FULL JOIN` দুই পাশের সবাই; MySQL-এ নেই: `LEFT JOIN ... UNION ALL ...` উল্টো `LEFT JOIN ... IS NULL`।",
      "Anti Join (যা মেলে না): `LEFT JOIN ... WHERE ডান.key IS NULL`; দুই পাশের জন্য দুটোকে `UNION ALL`।",
      "`CROSS JOIN` সব জোড়া (৫ × ৪ = ২০); অনেক টেবিলে মূল টেবিল দিয়ে শুরু, প্রতিটা নতুন টেবিলে একটা `JOIN`।",
    ],
    syntax: "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL;",
    traps: ["ডান টেবিলের শর্ত `WHERE`-এ দিলে `LEFT JOIN` চুপচাপ `INNER JOIN` হয়ে যায়; শর্ত `ON`-এ দাও।", "`LEFT JOIN`-এর পর `COUNT(*)` মিলহীন Row-ও গোনে; ডানের Column গোনো।", "শিকলে `LEFT JOIN`-এর পরের জোড়া সাধারণ `JOIN` হলে বাঁচানো Row আবার হারায়।"],
  },
  "level-12": {
    points: [
      "Subquery তিন রকম: একটা মান দেয় (Scalar), একটা তালিকা দেয় (`IN`), একটা টেবিল দেয় (Derived Table, Alias বাধ্যতামূলক)।",
      "Correlated Subquery বাইরের Row-এর Column ব্যবহার করে, তাই প্রতিটা Row-এর জন্য চলে।",
      "`EXISTS` / `NOT EXISTS` শুধু দেখে অন্তত একটা Row আছে কি না।",
      "`UNION` ডুপ্লিকেট বাদ দেয়, `UNION ALL` রাখে আর দ্রুত; `WITH` (CTE) লম্বা Subquery-কে নাম দেয়।",
    ],
    syntax: "SELECT name FROM students s\nWHERE gpa > (SELECT AVG(gpa) FROM students x WHERE x.class = s.class);",
    traps: ["Subquery-র তালিকায় `NULL` আসতে পারলে `NOT IN` না, `NOT EXISTS`।", "`=`-এর পাশের Subquery একাধিক Row দিলে error।"],
  },
  "boss-2": {
    points: [
      "`ENUM` দিয়ে নির্দিষ্ট কয়েকটা মানে সীমা বাঁধা যায়।",
      "\"এখন কয় কপি আছে\": `LEFT JOIN`-এর `ON`-এ `returned_on IS NULL`।",
      "JOIN-এর পর গুনতে `COUNT(DISTINCT ...)`; \"সবচেয়ে বেশি\" সমান হলে সবাইকে আনতে `HAVING COUNT(*) = (SELECT MAX ...)`।",
      "অবস্থাভিত্তিক স্ট্যাটাস: কয়েকটা `EXISTS` + `CASE`, কড়া অবস্থা ওপরে।",
    ],
  },
  "level-13": {
    points: [
      "Relation = টেবিল, Tuple = Row, Attribute = Column, Degree = Column সংখ্যা, Cardinality = Row সংখ্যা।",
      "Super Key ⊇ Candidate Key (ন্যূনতম) → Primary Key (বেছে নেওয়া) + Alternate Key (বাকিরা)।",
      "Entity Integrity: PK কখনো NULL না; Referential Integrity: FK হয় NULL নয়তো Parent-এ আছে।",
      "Relational Algebra: σ = `WHERE`, π = `SELECT DISTINCT`, ⋈ = `JOIN`, × = `CROSS JOIN`, ∪ ∩ − = `UNION`/`INTERSECT`/`EXCEPT`, ρ = `AS`।",
    ],
    syntax: "π name (σ city = 'ঢাকা' (students))\n= SELECT DISTINCT name FROM students WHERE city = 'ঢাকা';",
    traps: ["Selection (σ) মানে `WHERE`, `SELECT` না!", "`NATURAL JOIN` একই নামের সব Column মেলায় (`id`, `name`): বিপজ্জনক।"],
  },
  "level-14": {
    points: [
      "ER Diagram: Entity (আয়তক্ষেত্র), Attribute (ডিম্বাকৃতি), Relationship (রম্বস)।",
      "Attribute: Simple, Composite, Multi-valued (দুই দাগ), Derived (ড্যাশ), Key (নিচে দাগ)।",
      "Cardinality ১:১, ১:N, M:N; Participation Total (দুই রেখা) বা Partial।",
      "Mapping: ১:N → N দিকে FK; M:N → Junction টেবিল; Multi-valued → আলাদা টেবিল; Weak → Owner PK + Partial Key।",
    ],
    traps: ["Cardinality ঠিক করতে দুই দিক থেকেই প্রশ্ন করো।", "Relationship-এর Attribute (যেমন `score`) Junction টেবিলে যায়।", "`phone1, phone2` Column না, আলাদা টেবিল।"],
  },
  "level-15": {
    points: [
      "খারাপ ডিজাইনের তিন অসুখ: Insertion, Update, Deletion Anomaly।",
      "Functional Dependency X → Y: X জানলে Y একটাই।",
      "1NF: Atomic মান · 2NF: Partial Dependency নেই · 3NF: Transitive Dependency নেই · BCNF: প্রতিটা Determinant Super Key।",
      "আগে Normalize, মেপে দেখে প্রয়োজনে Denormalize।",
    ],
    traps: ["একক-Column Key-এর 1NF টেবিল নিজে থেকেই 2NF।", "ডেটা দেখে FD প্রমাণ হয় না; FD আসে বাস্তবের নিয়ম থেকে।", "BCNF-এ ভাঙলে কখনো Dependency Preservation হারায়।"],
  },
  "level-16": {
    points: [
      "Index বইয়ের নির্ঘণ্ট: Full Table Scan ছাড়াই খোঁজে (InnoDB-তে B+Tree)।",
      "`EXPLAIN`-এ `type: ALL` মানে পুরো টেবিল; `ref`/`range`/`const` ভালো। `EXPLAIN ANALYZE` সত্যিকারের সময় দেখায়।",
      "Composite Index-এ Leftmost Prefix: `(a, b)` কাজ করে `a` বা `a, b` দিয়ে, শুধু `b` দিয়ে না।",
      "Covering Index-এ মূল টেবিলে যেতেই হয় না (`Using index`)।",
    ],
    syntax: "CREATE INDEX idx_pay_student ON payments (student_id);\nEXPLAIN SELECT * FROM payments WHERE student_id = 42;",
    traps: ["Column-এ Function (`YEAR(paid_at) = 2025`) দিলে Index বাদ; পরিসরে লেখো।", "`LIKE '%x'` Index ব্যবহার করতে পারে না।", "প্রতিটা Index লেখাকে ধীর করে।"],
  },
  "level-17": {
    points: [
      "View: নাম দেওয়া `SELECT`, ডেটা রাখে না; সরলতা আর নিরাপত্তার জন্য।",
      "Function একটা মান ফেরত দেয় (`SELECT`-এ ব্যবহার); Procedure `CALL` দিয়ে কাজ করে, `IN`/`OUT` প্যারামিটার নেয়।",
      "`SIGNAL SQLSTATE '45000'` দিয়ে নিজের error।",
      "Trigger `BEFORE`/`AFTER` `INSERT`/`UPDATE`/`DELETE`-এ নিজে চলে; `OLD` আর `NEW` দিয়ে আগের-পরের Row।",
    ],
    syntax: "DELIMITER //\nCREATE PROCEDURE p(IN x INT)\nBEGIN\n  SELECT x;\nEND //\nDELIMITER ;",
    traps: ["`DELIMITER` ভুলে গেলে শরীরের প্রথম `;`-এ কমান্ড কেটে যায়।", "MySQL 8-এ Function-এ `DETERMINISTIC` (বা `READS SQL DATA`) না দিলে error 1418।", "Trigger থেকে একই টেবিলে `UPDATE` চলে না।"],
  },
  "level-18": {
    points: [
      "Transaction: `START TRANSACTION` ... `COMMIT` বা `ROLLBACK`; `SAVEPOINT` দিয়ে আংশিক ফেরা।",
      "ACID: Atomicity, Consistency, Isolation, Durability।",
      "Isolation Level: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ (InnoDB-র ডিফল্ট), SERIALIZABLE।",
      "`SELECT ... FOR UPDATE` Row Lock করে; Deadlock হলে InnoDB একটাকে বাতিল করে (error 1213)।",
    ],
    syntax: "START TRANSACTION;\n  UPDATE accounts SET balance = balance - 1000 WHERE id = 1;\n  UPDATE accounts SET balance = balance + 1000 WHERE id = 2;\nCOMMIT;",
    traps: ["Transaction-এর ভেতরে error হলে MySQL পুরোটা বাতিল করে না; নিজে `ROLLBACK` করো।", "DDL (`CREATE`, `ALTER`, `TRUNCATE`) মাঝপথে Implicit Commit ঘটায়।", "Deadlock এড়াতে সবসময় একই ক্রমে Lock নাও।"],
  },
  "level-19": {
    points: [
      "অ্যাপের জন্য আলাদা User; `root` দিয়ে কখনো না। User = নাম + Host।",
      "`GRANT`/`REVOKE`, Role দিয়ে দলগত অনুমতি; Least Privilege।",
      "View দিয়ে সংবেদনশীল Column লুকাও।",
      "`mysqldump --single-transaction --routines --triggers` দিয়ে Backup, `mysql < file` দিয়ে Restore।",
      "SQL Injection-এর সমাধান Prepared Statement (`?` + `bind_param`)।",
    ],
    syntax: "CREATE USER 'app'@'localhost' IDENTIFIED BY '...';\nGRANT SELECT, INSERT ON school.students TO 'app'@'localhost';",
    traps: ["`SHOW_ROUTINE` অনুমতি ছাড়া `mysqldump` চুপচাপ Procedure বাদ দেয়।", "পাসওয়ার্ড কোডে বা Git-এ রেখো না।", "`addslashes` দিয়ে Injection ঠেকানো যায় না।"],
  },
  "level-4-1": {
    points: [
      "`INSERT INTO ... SELECT` দিয়ে এক টেবিলের ডেটা আরেক টেবিলে কপি।",
      "Upsert: `INSERT ... ON DUPLICATE KEY UPDATE`; `INSERT IGNORE` ডুপ্লিকেট চুপচাপ বাদ দেয়; `REPLACE` পুরোনোটা মুছে নতুন ঢোকায়।",
      "MySQL-এ `UPDATE ... JOIN` আর `DELETE t FROM t JOIN ...` দিয়ে অন্য টেবিল দেখে বদলানো বা মোছা যায়।",
      "`CREATE TABLE ... AS SELECT` ডেটাসহ নতুন টেবিল, `CREATE TABLE ... LIKE` শুধু গঠন।",
    ],
    syntax: "INSERT INTO scores (student_id, total)\nSELECT student_id, SUM(score) FROM marks GROUP BY student_id\nON DUPLICATE KEY UPDATE total = VALUES(total);",
    traps: ["`REPLACE` আসলে DELETE + INSERT: নতুন `AUTO_INCREMENT` আর `ON DELETE CASCADE` চালু হতে পারে।", "`INSERT IGNORE` শুধু ডুপ্লিকেট না, অন্য সমস্যাও warning বানিয়ে চেপে যায়।", "`CREATE TABLE ... AS` Primary Key, Index বা Foreign Key কপি করে না।"],
  },
  "level-4-2": {
    points: [
      "Window Function Row না মিশিয়েই দলের হিসাব দেয়: `ফাংশন() OVER (PARTITION BY ... ORDER BY ...)`।",
      "`ROW_NUMBER` ১,২,৩; `RANK` সমানে একই নম্বর আর পরে ফাঁক (১,১,৩); `DENSE_RANK` ফাঁক ছাড়া (১,১,২)।",
      "`SUM(x) OVER (ORDER BY ...)` চলমান যোগফল; `LAG`/`LEAD` আগের/পরের Row-এর মান।",
      "Top-N per group: Window-কে Subquery বা CTE-তে রেখে বাইরে `WHERE rn <= N`।",
    ],
    syntax: "SELECT class, name, gpa,\n       RANK() OVER (PARTITION BY class ORDER BY gpa DESC) AS pos\nFROM students;",
    traps: ["Window Function `WHERE`-এ সরাসরি চলে না (Execution Order-এ SELECT পরে)।", "MySQL 8.0 / MariaDB 10.2-এর আগে Window Function নেই।"],
  },
  "level-4-3": {
    points: [
      "CTE (`WITH নাম AS (...)`) লম্বা Query-কে ধাপে ধাপে, ওপর থেকে নিচে পড়ার মতো বানায়।",
      "এক `WITH`-এ কমা দিয়ে একাধিক CTE, পরেরটা আগেরটা ব্যবহার করতে পারে।",
      "Recursive CTE: ভিত্তি অংশ `UNION ALL` পুনরাবৃত্ত অংশ; থামার শর্ত লাগবেই।",
      "কাজে লাগে: সংখ্যা বা তারিখের সারি বানানো, ফাঁক খোঁজা, পদ/মেনুর গাছ (Hierarchy)।",
    ],
    syntax: "WITH RECURSIVE n (x) AS (\n  SELECT 1\n  UNION ALL\n  SELECT x + 1 FROM n WHERE x < 10\n)\nSELECT x FROM n;",
    traps: ["থামার শর্ত না দিলে MySQL `cte_max_recursion_depth` (ডিফল্ট ১০০০) ছুঁয়ে error দেয়।", "Recursive অংশে Aggregate, Window Function, `GROUP BY`, `ORDER BY` আর `DISTINCT` চলে না।"],
  },
  "level-4-4": {
    points: [
      "\"অন্তত একটা\" → `EXISTS`/`IN`; \"কোনোটাই না\" → `NOT EXISTS`/Anti Join; \"সবগুলো\" → Relational Division।",
      "Division দুইভাবে: দুইবার `NOT EXISTS` (\"এমন কোনো কোর্স নেই যেটা সে নেয়নি\"), বা `COUNT(DISTINCT)` মিলিয়ে।",
      "\"কিছু না করাদেরও গড়ে গোনো\" → মূল টেবিল থেকে `LEFT JOIN` + `COUNT(ডান.col)`।",
      "\"নিজের দলের গড়ের চেয়ে বেশি\" → Correlated Subquery বা Window `AVG() OVER (PARTITION BY ...)`।",
      "Pivot: `SUM(CASE WHEN ... THEN ... END)`; মোট লাইন: `WITH ROLLUP`।",
    ],
    syntax: "SELECT s.name FROM student s\nWHERE NOT EXISTS (\n  SELECT 1 FROM course c WHERE c.teacher = 'X'\n  AND NOT EXISTS (\n    SELECT 1 FROM enroll e\n    WHERE e.sid = s.id AND e.cid = c.id));",
    traps: ["\"সবগুলো\"-র প্রশ্নে খালি সেট (X কোনো কোর্স পড়ান না) হলে দুইবার-`NOT EXISTS` সবাইকে ফেরত দেয়; প্রশ্নটা যাচাই করো।", "`AVG(count)` লিখলে শূন্য-ওয়ালারা বাদ পড়ে।", "`WITH ROLLUP`-এর মোট লাইনে দলের Column `NULL` দেখায়; `GROUPING()` দিয়ে চেনো।"],
  },
  "level-4-5": {
    points: [
      "প্রশ্ন পড়ে আগে ঠিক করো ধরনটা: ছাঁকা, গোনা, তুলনা, \"অন্তত একটা\", \"কোনোটাই না\", নাকি \"সবগুলো\"।",
      "টেবিলের সম্পর্ক (কোন Column কোনটার সাথে মেলে) কাগজে এঁকে নাও।",
      "জটিল Query ছোট ধাপে বানাও: আগে `FROM ... JOIN`, তারপর `WHERE`, তারপর `GROUP BY`, শেষে Subquery।",
      "প্রতিটা উত্তর নমুনা ডেটায় হাতে মিলিয়ে দেখো, বিশেষ করে `NULL`, শূন্য আর সমান মানের কোণগুলো।",
    ],
  },
  "level-5-1": {
    points: [
      "Syntax জানা আর প্রশ্নের উত্তর লেখা আলাদা দক্ষতা; দ্বিতীয়টার জন্য পদ্ধতি লাগে।",
      "ভাবো চলার ক্রমে: `FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`; লেখা শুরু `FROM` থেকে, `SELECT *` দিয়ে।",
      "ছয় ধাপ: নিজের ভাষায় (প্রতি Row-তে কী?) → শব্দ দাগাও → হাতে উত্তর → ছোট ধাপে বানাও, প্রতিটা চালাও → মেলাও → নিজের Query ভাঙো।",
      "বড় প্রশ্নের ভেতরের ছোট প্রশ্ন (সর্বোচ্চ কত? প্রতি দলের গড় কত?) আলাদা লিখে চালাও, তারপর Subquery বা CTE হিসেবে জোড়ো।",
      "প্রতিটা শর্তের পাশে লেখো সেটা কোন টেবিলের কোন Column-এর, আর Row-এর (`WHERE`) নাকি দলের (`HAVING`)।",
    ],
    syntax: "-- স্তরে স্তরে, প্রতিটায় চালাও\nSELECT * FROM a JOIN b ON ...;       -- ১\n... WHERE <Row-এর শর্ত>;             -- ২\n... GROUP BY <গ্রেইন>;                -- ৩\n... HAVING <দলের শর্ত>;               -- ৪\nSELECT <আসল Column> ... ORDER BY ...; -- ৫",
    traps: ["Query চললেই সঠিক না: বাড়তি বা হারানো নাম কোনো error দেয় না; হাতের উত্তরের সাথে মেলাও।", "চেকলিস্ট: ডুপ্লিকেট, খালি দল, `NULL`, টাই, সীমানা (`>` বনাম `>=`), `WHERE` বনাম `HAVING`, `AND`/`OR` বন্ধনী।"],
  },
  "level-5-2": {
    points: [
      "\"course offered by CSE\" মানে `course.offered_by`, `student.dept` না; শর্ত কোন টেবিলের, আগে ঠিক করো।",
      "\"অন্তত একটা\": `JOIN` + `DISTINCT`, বা `EXISTS` (ডুপ্লিকেটের সুযোগই নেই)।",
      "\"every course taught by\": Relational Division; দুইবার `NOT EXISTS`, বা `COUNT(DISTINCT)` = ভাজকের সংখ্যা।",
      "\"must still be counted\": `FROM student LEFT JOIN registered`, `COUNT(r.course_code)`, তারপর বাইরে `AVG`।",
    ],
    syntax: "SELECT AVG(n) FROM (\n  SELECT s.student_id, COUNT(r.course_code) AS n\n  FROM student s\n  LEFT JOIN registered r ON r.student_id = s.student_id\n  GROUP BY s.student_id) t;",
    traps: ["রিটেক থাকলে `COUNT(*)` দিয়ে Division ভুল; `COUNT(DISTINCT r.course_code)`।", "`LIKE '%Rahman%'` অন্য Rahman-কেও ধরে।", "`registered` থেকে শুরু করলে বা `COUNT(*)` দিলে শূন্যরা গড় থেকে হারায়।"],
  },
  "level-5-3": {
    points: [
      "\"his or her own branch\" = Correlated Subquery: `WHERE s2.branch_id = s.branch_id`; বা ব্রাঞ্চের গড়ের Derived Table-এর সাথে JOIN।",
      "View: `CREATE [OR REPLACE] VIEW নাম AS SELECT ...`; পরে সাধারণ টেবিলের মতো `SELECT`।",
      "\"101 or 104 and after ...\" → `IN (101, 104) AND join_date > '2020-01-01'`; `SELECT`-এ না থাকা Column দিয়েও `ORDER BY` চলে।",
      "supervisor-এর নাম: একই টেবিল দুই alias-এ (Self Join); \"each\" চাইলে `LEFT JOIN`, নাহলে শীর্ষ জন হারান।",
    ],
    syntax: "SELECT s.sname, sup.sname AS supervisor\nFROM Staff s\nLEFT JOIN Staff sup ON sup.staff_id = s.supervisor_id;",
    traps: ["Subquery-তে ব্রাঞ্চ না মেলালে পুরো কোম্পানির গড় আসে।", "`a = 101 OR a = 104 AND d > ...`: `AND` আগে খাটে; `IN` বা বন্ধনী।", "দুই টেবিলে একই নামের Column হলে সামনে alias (`ambiguous`)।"],
  },
  "level-5-4": {
    points: [
      "Algebra-তে \"কখনো না\" = বিয়োগ: `π cust_id, cname (customer ⋈ (π cust_id (customer) − π cust_id (orders)))`।",
      "বিয়োগের দুই পাশে একই Column (Union Compatibility); তাই আগে শুধু আইডিতে বিয়োগ, তারপর ⋈ করে নাম।",
      "বছর প্রতি অর্ডারের শর্ত (`WHERE`), \"total exceeds\" দলের শর্ত (`HAVING SUM(price * quantity) > 50000`)।",
      "\"সবচেয়ে দামি\" = `price = (SELECT MAX(price) FROM product)`, সাথে `IN`, কারণ সমান সর্বোচ্চ একাধিক হতে পারে।",
    ],
    syntax: "WHERE o.order_date >= '2025-01-01'\n  AND o.order_date <  '2026-01-01'\nGROUP BY p.category\nHAVING SUM(p.price * o.quantity) > 50000",
    traps: ["`ORDER BY price DESC LIMIT 1` সমান দামের একটা পণ্য আর তার ক্রেতাকে ফেলে দেয়।", "বছরের শর্ত ভুললে সব বছরের যোগ আসে।", "এক উপ-প্রশ্নের শর্ত (২০২৫) পরেরটায় টেনে আনা।"],
  },
  "level-5-5": {
    points: [
      "\"equal to the maximum, minimum or average\" → তিনটা Scalar Subquery, `OR` দিয়ে, বা `sal IN ((SELECT MAX..), (SELECT MIN..), (SELECT AVG..))`।",
      "সর্বোচ্চ/সর্বনিম্নে টাই থাকলে `=` সবাইকে রাখে; `LIMIT 1` রাখে না।",
      "গড় সাধারণত কারো বেতনের সমান হয় না; তখন গড়ের অংশ থেকে কেউ না আসাই সঠিক।",
      "\"10 or 40\" → `e.deptno IN (10, 40)`; দুই টেবিলেই `deptno`, তাই `e.` বা `USING (deptno)`।",
    ],
    syntax: "WHERE e.sal = (SELECT MAX(sal) FROM Emp)\n   OR e.sal = (SELECT MIN(sal) FROM Emp)\n   OR e.sal = (SELECT AVG(sal) FROM Emp)",
    traps: ["`WHERE sal = MAX(sal)` → ERROR 1111।", "`OR`-এর জায়গায় `AND` → খালি উত্তর।", "JOIN-এর শর্ত বাদ দিলে Cartesian Product।"],
  },
  "level-20": {
    points: [
      "১০ ধাপ: চাহিদা → ER → Normalization → টেবিল → Constraint → নমুনা ডেটা → ১০টা Query → View/Procedure/Trigger → Index → নিরাপত্তা আর Backup।",
      "Derived মান (বকেয়া, সিট বাকি) জমিয়ে না রেখে View-এ হিসাব।",
      "অন্য Row গোনা নিয়ম (সিট সীমা) `CHECK`-এ হয় না; Procedure + `FOR UPDATE`।",
      "নিয়মের একমাত্র দরজা Procedure রাখতে টেবিলে সরাসরি `INSERT` অনুমতি না দিয়ে শুধু `EXECUTE`।",
    ],
  },
  bonus: {
    points: [
      "সংজ্ঞা + নিজের উদাহরণ + কেন: ভাইভার সেরা উত্তরের ধরন।",
      "দ্বিতীয় সর্বোচ্চ: `MAX(...) WHERE x < (SELECT MAX ...)` বা `DISTINCT ... LIMIT 1 OFFSET 1`।",
      "ডুপ্লিকেট মোছা: Self Join দিয়ে `DELETE d1 FROM t d1 JOIN t d2 ON ... AND d1.id > d2.id`।",
      "ইন্টারভিউতে প্রশ্ন স্পষ্ট করো, জোরে ভাবো, ধাপে ধাপে বানাও, আর Index ও Transaction-এর কথা তোলো।",
    ],
  },
};
