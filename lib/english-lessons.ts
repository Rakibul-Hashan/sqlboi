import type { DbName } from "./sql-engine";

type Section = { heading: string; text: string };
type Lesson = {
  sections: Section[];
  sql?: string;
  database?: DbName;
  practice: string;
};

export const englishLessons: Record<string, Lesson> = {
  "level-0": {
    sections: [
      { heading: "What is a database?", text: "Picture a school keeping a list of students, courses, and enrollments. A database stores those records so the school can find, link, and update them reliably. A database management system (DBMS) is the software that manages the records. MySQL is a DBMS, and SQL is the language you use to ask it for data or make changes." },
      { heading: "Follow one form submission", text: "When you submit a student’s name, your browser sends it to the web server. The server validates it and passes it as a parameter to an INSERT statement. MySQL stores a row, and the server reports the result to the browser. Use XAMPP and phpMyAdmin for the walkthrough in the full lesson. XAMPP commonly bundles MariaDB, so use MySQL for exercises that rely on MySQL-specific behavior." },
    ],
    sql: "CREATE DATABASE school CHARACTER SET utf8mb4;\nUSE school;\nCREATE TABLE students (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100) NOT NULL\n);",
    practice: "Name the database, table, and two columns in the example. After saving one new student, what does one row represent?",
  },
  "level-1": {
    sections: [
      { heading: "Decide what one row represents", text: "In a students table, one row represents one student. Columns describe that student. Use a primary key, such as an ID, to identify each row even if two students share a name." },
      { heading: "Choose types by how the data is used", text: "Use INT for whole numbers, DECIMAL for exact amounts such as prices, VARCHAR for text, and DATE for calendar dates. Store a phone number as text so leading zeros and a plus sign survive. CREATE DATABASE creates the container. CREATE TABLE defines its columns and rules." },
    ],
    sql: "CREATE TABLE students (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  phone VARCHAR(30),\n  enrolled_on DATE,\n  fee DECIMAL(10, 2)\n);",
    practice: "Design a courses table with an ID, title, number of seats, and fee. Explain each data type.",
  },
  "level-2": {
    sections: [
      { heading: "Write or remove rows", text: "INSERT adds rows. Give it an explicit column list so each value has a clear destination. UPDATE changes matching rows and DELETE removes them. Preview the same WHERE condition with SELECT first. Without a WHERE clause, a plain UPDATE or DELETE affects all rows." },
      { heading: "Change the table itself", text: "ALTER TABLE changes the schema, for example by adding a column. TRUNCATE TABLE empties a table while keeping its definition. DROP TABLE removes the table definition and its data. In MySQL, these table-definition operations usually cause an implicit commit." },
    ],
    sql: "INSERT INTO students (name) VALUES ('Mim');\n\nSELECT * FROM students WHERE id = 1;\nUPDATE students SET name = 'Mim Akter' WHERE id = 1;",
    practice: "Write a SELECT to preview rows whose phone number is missing. Then write an UPDATE for a single student by ID.",
  },
  "level-3": {
    sections: [
      { heading: "Pick the rows and columns", text: "FROM picks the source table. WHERE keeps rows that pass a condition. SELECT picks the columns and expressions to return. AS gives a result column a readable label." },
      { heading: "Control the output", text: "ORDER BY sorts the result. Add a unique tie-breaker if the order matters, especially before LIMIT. DISTINCT removes duplicate combinations across all selected columns. If you select department and name together, DISTINCT applies to the pair." },
    ],
    sql: "SELECT id, name AS student_name, fee\nFROM students\nWHERE fee >= 500\nORDER BY fee DESC, id ASC\nLIMIT 5;",
    practice: "Return the three lowest non-missing fees, with student IDs to break ties.",
  },
  "level-4": {
    sections: [
      { heading: "Match text, lists, and ranges", text: "LIKE searches a pattern. A percent sign matches zero or more characters, and an underscore matches exactly one. IN checks membership in a list. BETWEEN includes both endpoints. For timestamps in a month, use an inclusive start and an exclusive start of the next month to cover every time on the final day." },
      { heading: "Look for missing values", text: "NULL represents a missing or unknown value. Use IS NULL or IS NOT NULL to test it. A comparison such as fee = NULL produces UNKNOWN, and WHERE keeps only TRUE rows." },
    ],
    sql: "SELECT id, name\nFROM students\nWHERE name LIKE 'M%'\n  AND fee BETWEEN 500 AND 1000\n  AND phone IS NULL;",
    practice: "Write a filter for student names that start with A or M and have a known phone number.",
  },
  "level-5": {
    sections: [
      { heading: "Read parentheses first", text: "AND means both conditions must hold. OR means at least one must hold. In ordinary Boolean expressions, MySQL evaluates NOT before AND, and AND before OR. A OR B AND C means A OR (B AND C). If C should also apply to the A group, write (A OR B) AND C." },
      { heading: "SQL has a third truth value", text: "When a comparison involves NULL, the result is usually UNKNOWN. NOT UNKNOWN is still UNKNOWN. WHERE keeps TRUE rows and filters out both FALSE and UNKNOWN. Under De Morgan’s laws, NOT (A OR B) becomes NOT A AND NOT B, while NOT (A AND B) becomes NOT A OR NOT B." },
    ],
    sql: "SELECT student_id, name, dept\nFROM student\nWHERE (dept = 'CSE' OR dept = 'EEE')\n  AND name LIKE 'M%';",
    database: "q1-course",
    practice: "Remove the parentheses and rerun the query. Which additional students appear, and which part of the condition admitted them?",
  },
  "boss-1": {
    sections: [
      { heading: "Set up the stationery shop", text: "Create a products table with one row per product. Use an ID as the key, a name and category for labeling, a DECIMAL price, and an integer stock count. Insert sample rows from at least two categories." },
      { heading: "Work through three rounds", text: "First build and seed the table. Next use WHERE, IN, LIKE, and ORDER BY to answer questions about stock and prices. Finally change or remove a specific row. Run the filter as a SELECT first to verify that it identifies your intended product." },
    ],
    sql: "SELECT id, name, price\nFROM products\nWHERE category IN ('Pens', 'Notebooks')\n  AND stock > 0\nORDER BY price, id;",
    practice: "Write a report of the five cheapest in-stock products. Then restock exactly one product using its ID.",
  },
  "level-6": {
    sections: [
      { heading: "Transform each row", text: "Functions can clean text, compute a value, or extract part of a date. TRIM removes surrounding spaces, CHAR_LENGTH counts characters, ROUND rounds a number, and YEAR extracts a year. Give an expression an alias so the result is easy to read." },
      { heading: "Give each row a label with CASE", text: "CASE checks WHEN conditions in the order you write them and returns the first matching result. Put narrower rules first if conditions overlap. ELSE covers rows that match none of the rules." },
    ],
    sql: "SELECT TRIM(name) AS clean_name,\n       ROUND(fee, 0) AS rounded_fee,\n       YEAR(enrolled_on) AS enrollment_year,\n       CASE WHEN fee IS NULL THEN 'Unknown'\n            WHEN fee >= 1000 THEN 'High'\n            ELSE 'Standard' END AS fee_band\nFROM students;",
    practice: "Add a separate band for a fee of zero. Where does that WHEN clause belong?",
  },
  "level-7": {
    sections: [
      { heading: "Turn many rows into one result", text: "COUNT(*) counts rows. COUNT(column) counts the rows where that column has a value. COUNT(DISTINCT column) counts different non-NULL values. SUM, AVG, MIN, and MAX work over the non-NULL values in their input." },
      { heading: "Decide what missing means", text: "An average over 100, 200, and NULL is 150 because only two values are known. If the business rule treats the missing value as zero, AVG(COALESCE(fee, 0)) gives 100. If there are no input rows, COUNT returns zero while AVG and SUM return NULL." },
    ],
    sql: "SELECT COUNT(*) AS students,\n       COUNT(fee) AS known_fees,\n       AVG(fee) AS average_known_fee,\n       SUM(fee) AS total_known_fees\nFROM students;",
    practice: "Predict each result for fees of 0, 100, and NULL. Explain why zero counts as a known fee.",
  },
  "level-8": {
    sections: [
      { heading: "Build one result row per group", text: "GROUP BY dept puts students from the same department into a group. An aggregate such as COUNT(*) then summarizes each group. Select grouping columns and aggregates unless you know why a different selected column is functionally dependent on the group key." },
      { heading: "Decide when the filter applies", text: "WHERE filters individual rows before grouping. HAVING filters groups after aggregation. A practical reading order is FROM and JOIN, WHERE, GROUP BY, HAVING, SELECT, then ORDER BY and LIMIT. It is a logical model for reasoning about results. The optimizer can choose a different physical plan." },
    ],
    sql: "SELECT dept, COUNT(*) AS students\nFROM student\nWHERE name IS NOT NULL\nGROUP BY dept\nHAVING COUNT(*) >= 2\nORDER BY students DESC, dept;",
    database: "q1-course",
    practice: "Change the query to count only students whose names start with M, then keep departments with at least two matching rows.",
  },
  "level-9": {
    sections: [
      { heading: "Let the database enforce rules", text: "PRIMARY KEY identifies a row and requires a unique, non-NULL value. UNIQUE prevents repeated non-NULL values in a key. NOT NULL requires a value, DEFAULT supplies a value when one is omitted, and CHECK validates a rule such as fee >= 0. Use NOT NULL with CHECK if missing values are also invalid." },
      { heading: "Keep relationships valid", text: "A foreign key requires a non-NULL reference to point to an existing parent key. When a parent is deleted, the relationship can restrict the deletion, cascade it, or set a nullable reference to NULL, depending on how the foreign key is defined." },
    ],
    sql: "CREATE TABLE student_emails (\n  address VARCHAR(255) PRIMARY KEY,\n  student_id INT NOT NULL,\n  FOREIGN KEY (student_id) REFERENCES students(id)\n);",
    practice: "Explain what happens if you insert an email with a student ID that does not exist.",
  },
  "level-10": {
    sections: [
      { heading: "Match related rows", text: "INNER JOIN returns pairs that satisfy the ON condition. Join a parent key to the related foreign key, then qualify column names with aliases such as s.name. A join combines related columns. UNION combines compatible result rows from separate queries." },
      { heading: "Check how many rows a match creates", text: "A student registered in three courses produces three rows when joined to registrations. That is correct at the registration level. If the output should contain one row per student, group after the join or start with students and use EXISTS to test for a match." },
    ],
    sql: "SELECT s.student_id, s.name, r.course_code\nFROM student AS s\nJOIN registered AS r ON r.student_id = s.student_id\nORDER BY s.student_id, r.course_code;",
    database: "q1-course",
    practice: "Add course titles by joining course. Then produce one row per registered student with a count of distinct courses.",
  },
  "level-11": {
    sections: [
      { heading: "Keep rows even when there is no match", text: "LEFT JOIN keeps every row from the left table and fills missing right-side columns with NULL. RIGHT JOIN does the reverse. To keep unmatched rows while restricting which right-side rows can match, put that restriction in ON. A right-side equality condition in WHERE would remove the NULL-extended rows." },
      { heading: "Choose a join for the question", text: "Use NOT EXISTS to find rows with no match. CROSS JOIN pairs every left row with every right row. A self join uses two aliases for the same table, for example to pair an employee with their manager. For a full outer join in MySQL, combine a left join with just the unmatched rows from the other side using UNION ALL." },
    ],
    sql: "SELECT s.student_id, s.name, COUNT(r.course_code) AS registrations\nFROM student AS s\nLEFT JOIN registered AS r ON r.student_id = s.student_id\nGROUP BY s.student_id, s.name\nORDER BY s.student_id;",
    database: "q1-course",
    practice: "Find students with zero registrations. Why would COUNT(*) give the wrong result after the LEFT JOIN?",
  },
  "level-12": {
    sections: [
      { heading: "Use one query inside another", text: "A scalar subquery supplies one value, such as an average. IN can check a list of results. A derived table is a subquery in FROM. A correlated subquery refers to a value from the outer row, for example an employee’s department. EXISTS checks whether a subquery finds any row." },
      { heading: "Combine result sets", text: "UNION and UNION ALL stack result sets with the same number of columns in compatible positions. UNION removes duplicates and UNION ALL preserves them. For missing-match queries, prefer NOT EXISTS when an inner value could be NULL. A NULL in a NOT IN list can turn a would-be match into UNKNOWN." },
    ],
    sql: "SELECT s.name\nFROM student AS s\nWHERE NOT EXISTS (\n  SELECT 1 FROM registered AS r\n  WHERE r.student_id = s.student_id\n);",
    database: "q1-course",
    practice: "Change the query to find students with at least one registration. Compare the result with a join when a student has several registrations.",
  },
  "boss-2": {
    sections: [
      { heading: "Model a school library", text: "Use books, members, and loans. Each loan links a book and a member and records the dates needed for circulation reports. A NULL return date can represent an active loan. Use keys and constraints to keep the links valid." },
      { heading: "Write reports at the right level", text: "A report about active loans starts with loans and joins members or books for readable names. A report about all books starts with books and LEFT JOINs loans to retain books that were never borrowed. Group at the member or book level depending on what each output row represents." },
    ],
    practice: "Write one query for members with at least two active loans and another for books that have never been borrowed.",
  },
  "level-13": {
    sections: [
      { heading: "Translate the formal terms", text: "In the relational model, a relation resembles a table, a tuple is a row, and an attribute is a column. A superkey uniquely identifies a tuple. A candidate key is a minimal superkey: removing any attribute breaks uniqueness. The primary key is the candidate key selected as the main identifier." },
      { heading: "Read relational algebra as operations", text: "Selection keeps rows, projection picks attributes, and join matches related tuples. The Cartesian product pairs every tuple with every tuple on the other side. Union and difference combine or compare compatible relations. SQL SELECT often needs DISTINCT to match relational algebra’s set-based projection." },
    ],
    sql: "SELECT DISTINCT dept\nFROM student\nWHERE name LIKE 'M%';",
    database: "q1-course",
    practice: "Identify the selection and projection in the query. Give an example of a superkey that is not a candidate key.",
  },
  "level-14": {
    sections: [
      { heading: "Draw entities and relationships", text: "An entity is a thing you track, such as a student or course. An attribute describes it. Ask how many courses a student can take and how many students a course can have. These answers identify the relationship’s cardinality. Also ask whether participating is optional on each side." },
      { heading: "Turn the drawing into tables", text: "For one-to-many, put the foreign key on the many side. For one-to-one, use a unique foreign key on the appropriate side. For many-to-many, create a junction table with both foreign keys. A weak entity depends on its owner for identification, for example a line number that is unique only within an invoice." },
    ],
    practice: "Draw Student, Course, and Registration. Mark the cardinalities and explain how the key would change if retakes were allowed.",
  },
  "level-15": {
    sections: [
      { heading: "Find what determines what", text: "A functional dependency X → Y means that two rows with the same X must have the same Y. In a registration table, student_id determines student_name. Repeating the name on every registration can cause conflicting edits, block you from adding a student before they register, or erase the name when the last registration is deleted." },
      { heading: "Split tables without losing the facts", text: "1NF avoids repeating groups and stores a single value per field. In 2NF, non-key attributes depend on the whole of each candidate key. 3NF removes problematic indirect dependencies through non-key attributes. BCNF requires the determinant of every nontrivial functional dependency to be a superkey. Keep keys that let you reconstruct the facts with joins." },
    ],
    practice: "Split (student_id, course_code, student_name, course_title, grade), assuming one grade per student and course. Identify the key in each new table.",
  },
  "level-16": {
    sections: [
      { heading: "See how MySQL finds rows", text: "EXPLAIN shows the plan MySQL chooses, including which index it expects to use and an estimate of rows examined. A B-tree index can speed equality and range searches. Its cost includes storage and extra work on writes. Compare plans on representative data." },
      { heading: "Order composite index columns deliberately", text: "An index on (dept, fee) can support a lookup by dept or by dept followed by a fee range. A fee-only lookup generally cannot use the same leftmost-prefix lookup. A covering index contains every column a query needs, so the engine may answer from the index without fetching full table rows." },
    ],
    sql: "CREATE INDEX idx_students_fee ON students (fee);\nEXPLAIN SELECT fee FROM students WHERE fee >= 1000;",
    practice: "Compare EXPLAIN before and after adding the index. Why might MySQL still scan a tiny table?",
  },
  "level-17": {
    sections: [
      { heading: "Pick the right reusable database object", text: "A view gives a SELECT a name. A stored procedure runs a named operation via CALL. A stored function returns one value and can appear in expressions. A trigger runs automatically for INSERT, UPDATE, or DELETE events on its table." },
      { heading: "Read routine and trigger syntax", text: "The mysql client uses DELIMITER to decide when to send a full statement containing internal semicolons. DELIMITER is a client command. In a trigger, NEW refers to the inserted or updated row and OLD refers to the previous or deleted row, where those versions exist." },
    ],
    sql: "CREATE VIEW students_with_fees AS\nSELECT id, name, fee\nFROM students\nWHERE fee IS NOT NULL;\n\nSELECT * FROM students_with_fees;",
    practice: "Choose a view, procedure, function, or trigger for each task: reusable report, named batch update, tax calculation, and automatic change log.",
  },
  "level-18": {
    sections: [
      { heading: "Keep related changes together", text: "A transaction lets you commit related changes together or roll them back. ACID stands for atomicity, consistency, isolation, and durability. A savepoint lets you roll back part of a transaction. In application code, handle errors explicitly and roll back if the complete operation fails." },
      { heading: "Reason about two sessions", text: "Isolation levels affect which changes concurrent transactions can see. SELECT ... FOR UPDATE can lock selected rows during a transaction. A deadlock can occur when two transactions wait for each other’s locks. Keep transactions short, acquire locks in a consistent order, and be ready to retry a transaction the server rolls back." },
    ],
    sql: "START TRANSACTION;\nSELECT stock FROM products WHERE id = 1 FOR UPDATE;\nUPDATE products SET stock = stock - 1\nWHERE id = 1 AND stock > 0;\nCOMMIT;",
    practice: "Explain how the application can detect an out-of-stock product from the update. What should it do if a second required change fails?",
  },
  "level-19": {
    sections: [
      { heading: "Give each account only what it needs", text: "Use a separate account for your application and grant only the operations it needs. A reporting account might need SELECT on specific views. Roles group privileges you can assign to accounts. Keep administration and routine application queries under separate accounts." },
      { heading: "Back up data and bind parameters", text: "Create backups and test restoration in a separate database. In application code, use prepared statements with bound parameters. They keep user-entered values separate from SQL syntax. If an application lets a user pick a sort column, map the choice to a fixed list of allowed identifiers." },
    ],
    sql: "GRANT SELECT ON school.students_with_fees TO 'reporter'@'localhost';",
    practice: "List the privileges needed by a read-only reporting account. Explain how you would verify that a backup can be restored.",
  },
  "level-4-1": {
    sections: [
      { heading: "Write from a query result", text: "INSERT ... SELECT copies a query’s result into a target table. Compare the column list and order on both sides. CREATE TABLE ... AS SELECT makes a new table from a result. Define or verify keys and indexes separately because the new table does not automatically inherit the original schema." },
      { heading: "Handle duplicates and joined writes", text: "An upsert uses ON DUPLICATE KEY UPDATE to update a row when a unique key conflicts. INSERT IGNORE can downgrade more than duplicate-key errors to warnings, and REPLACE can delete and insert a conflicting row. With UPDATE ... JOIN and DELETE ... JOIN, preview the matching rows and keep the join condition precise. If MySQL rejects a self-referential write with error 1093, use a supported join pattern or stage the target IDs separately." },
    ],
    sql: "INSERT INTO fee_archive (student_id, fee)\nSELECT id, fee\nFROM students\nWHERE fee IS NOT NULL;",
    practice: "Preview the rows that will be copied. What should the archive do if the same student appears on a second run?",
  },
  "level-4-2": {
    sections: [
      { heading: "Calculate across rows while keeping each row", text: "GROUP BY collapses a group. A window function with OVER adds a value to each row. PARTITION BY restarts the calculation for each group. ORDER BY inside OVER controls the calculation’s sequence, and the outer ORDER BY controls display order." },
      { heading: "Choose how to handle ties and neighbors", text: "ROW_NUMBER gives each row a unique position. RANK shares a position among ties and skips the following positions. DENSE_RANK shares a position without gaps. LAG and LEAD read neighboring rows, and NTILE divides ordered rows into buckets. Use an explicit ROWS frame for a row-by-row running total, and a CTE or subquery to filter by the window result." },
    ],
    sql: "WITH ranked AS (\n  SELECT ename, deptno, sal,\n         DENSE_RANK() OVER (PARTITION BY deptno ORDER BY sal DESC) AS pos\n  FROM Emp\n)\nSELECT ename, deptno, sal FROM ranked WHERE pos <= 2\nORDER BY deptno, sal DESC, ename;",
    database: "q4-emp",
    practice: "Replace DENSE_RANK with ROW_NUMBER. When could the two queries return different numbers of rows?",
  },
  "level-4-3": {
    sections: [
      { heading: "Name intermediate query steps", text: "A common table expression (CTE) starts with WITH and names a result you can use in the same statement. Give each step one job. For example, first compute sales by category, then filter those totals in the final SELECT." },
      { heading: "Build recursive results one step at a time", text: "A recursive CTE has an anchor query and a recursive step combined with UNION ALL in typical examples. The anchor produces the starting rows. Each iteration produces the next rows until the recursive step returns none. For a hierarchy, guard against cycles or bound the traversal. For a date series, define the last date explicitly." },
    ],
    sql: "WITH RECURSIVE days AS (\n  SELECT CAST('2025-01-01' AS DATE) AS day\n  UNION ALL\n  SELECT day + INTERVAL 1 DAY FROM days\n  WHERE day < '2025-01-07'\n)\nSELECT day FROM days ORDER BY day;",
    practice: "Trace the anchor and the first two iterations. How would you keep every generated day even when there are no sales that day?",
  },
  "level-4-4": {
    sections: [
      { heading: "Translate the wording into a query shape", text: "For overlap, test whether a key appears in both sets. For no match, use NOT EXISTS. For “every required item,” use relational division: there must be no required item that the candidate is missing. If the required set is empty, that condition is true for every candidate, so check what the question expects." },
      { heading: "Handle comparisons and reshape the output", text: "Compare with a group or global benchmark using a subquery, CTE, or window function. Use conditional aggregates to pivot fixed categories into columns. WITH ROLLUP adds subtotal and grand-total rows for grouping columns. To find gaps and islands, arrange rows in order and mark the point where each new run starts." },
    ],
    sql: "SELECT deptno,\n       COUNT(CASE WHEN sal >= 4000 THEN 1 END) AS at_least_4000,\n       COUNT(CASE WHEN sal < 4000 THEN 1 END) AS below_4000\nFROM Emp\nGROUP BY deptno\nORDER BY deptno;",
    database: "q4-emp",
    practice: "Explain why SUM(CASE ... ELSE 0 END) works for this count, but COUNT(CASE ... ELSE 0 END) would overcount.",
  },
  "level-4-5": {
    sections: [
      { heading: "Work through the practice arena", text: "The four rounds move from straightforward filters and counts to multi-step queries. Before writing SQL, sketch what one output row represents and identify the source table with those rows." },
      { heading: "Test the result before moving on", text: "Go from the raw rows to filters, joins, and aggregates one step at a time. Check duplicates, ties, NULLs, and missing matches. On harder questions, name each intermediate result with a CTE so you can inspect it on its own." },
    ],
    practice: "Pick one question from each difficulty tier. For each answer, record an edge case and the result you expect.",
  },
  "level-5-1": {
    sections: [
      { heading: "Write one sentence about the result", text: "Start with what one output row should represent: one student, one department, or one category this year. This is the result grain. Choose a starting table at that grain, then identify which tables supply the remaining facts." },
      { heading: "Translate key words and test in stages", text: "“At least one” suggests EXISTS. “None” suggests NOT EXISTS. “Every” suggests relational division. “Per category” signals grouping, and a condition on a total belongs in HAVING. Build the joins and row filters first, then summarize, filter, and sort. Test rows at the boundary and cases with missing or repeated values." },
    ],
    practice: "For “customers whose 2025 spending exceeded 50,000,” identify the result grain, date filter, grouping key, and clause for the spending threshold.",
  },
  "level-5-2": {
    sections: [
      { heading: "At least one course versus every course", text: "A student taking a CSE course can be in another department. Filter course.offered_by and match registrations to the student. For every course taught by Dr. Rahman, look for students for whom no matching course is missing. Match the exact instructor name so a similar name does not expand the required set." },
      { heading: "Include students with no registrations in the average", text: "Produce one count per student using a LEFT JOIN from student to registered. COUNT(r.course_code) ignores NULL and counts each registration, including retakes. Use COUNT(DISTINCT r.course_code) if the question asks for distinct courses. Average the per-student counts after the grouping step." },
    ],
    sql: "SELECT AVG(course_count) AS average_courses\nFROM (\n  SELECT s.student_id, COUNT(r.course_code) AS course_count\n  FROM student AS s\n  LEFT JOIN registered AS r ON r.student_id = s.student_id\n  GROUP BY s.student_id\n) AS per_student;",
    database: "q1-course",
    practice: "Show the counts before averaging. Find an unregistered student and check that their count is zero.",
  },
  "level-5-3": {
    sections: [
      { heading: "Compare people against their own branch", text: "Calculate AVG(salary) per branch, then join that result to Staff by branch_id and filter salary > branch_average. A view can save the resulting list. For the date exercise, restrict the rows to branch IDs 101 and 104 and translate the prompt’s date boundary explicitly." },
      { heading: "Look up supervisors in the Staff table", text: "Use two aliases for Staff: one for employees and one for supervisors. Match supervisor.staff_id to staff.supervisor_id. A LEFT JOIN keeps people at the top of the reporting structure, who have no supervisor." },
    ],
    sql: "SELECT s.sname AS staff_name, m.sname AS supervisor_name\nFROM Staff AS s\nLEFT JOIN Staff AS m ON m.staff_id = s.supervisor_id\nORDER BY s.staff_id;",
    database: "q2-staff",
    practice: "Replace LEFT JOIN with INNER JOIN and find the employee who disappears. Which value on their row explains it?",
  },
  "level-5-4": {
    sections: [
      { heading: "Find buyers and non-buyers", text: "For customers who never ordered, subtract customer IDs seen in orders from all customer IDs, or use NOT EXISTS in SQL. For buyers of the most expensive products, compare product.price to MAX(price) across the product table so ties count. Return distinct customers if the output is one row per customer." },
      { heading: "Sum sales during the right period", text: "Join orders to products. Filter order_date from the start of 2025 up to, but excluding, the start of 2026. Compute quantity × price for each row, then sum by category. Use HAVING to keep categories whose total strictly exceeds 50,000." },
    ],
    sql: "SELECT p.category, SUM(o.quantity * p.price) AS sales\nFROM orders AS o\nJOIN product AS p ON p.prod_id = o.prod_id\nWHERE o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'\nGROUP BY p.category\nHAVING SUM(o.quantity * p.price) > 50000;",
    database: "q3-shop",
    practice: "Change > to >= and rerun the query. Which category appears, and why was it excluded before?",
  },
  "level-5-5": {
    sections: [
      { heading: "Compute the salary benchmark once", text: "The highest, lowest, and average salaries are company-wide values in this exercise. Aggregate all Emp rows, then compare each employee’s salary to those three values. Equality includes all employees tied at a boundary." },
      { heading: "Filter where the membership is stored", text: "For employees in departments 10 or 40, filter Emp.deptno with IN (10, 40). Join Dept on deptno if the output also needs the department name or location." },
    ],
    sql: "WITH stats AS (\n  SELECT MIN(sal) AS low, MAX(sal) AS high, AVG(sal) AS mean\n  FROM Emp\n)\nSELECT e.empno, e.ename, e.sal\nFROM Emp AS e CROSS JOIN stats\nWHERE e.sal IN (stats.low, stats.high, stats.mean)\nORDER BY e.sal, e.empno;",
    database: "q4-emp",
    practice: "Check that everyone tied for the minimum appears. Rewrite the query to list employees in departments 10 and 40 with their department names.",
  },
  "level-20": {
    sections: [
      { heading: "Start with a real workflow", text: "For a coaching center, track students, teachers, courses, enrollments, and payments. Write what staff need to do and ask, such as enrolling a student, recording an installment, or listing outstanding balances. Use those requirements to choose entities, keys, and relationships." },
      { heading: "Build, seed, query, and verify", text: "Draw the ER diagram, create the schema with constraints, and add representative sample rows. Write reports that answer your original questions. Test duplicate enrollments, a course with no students, partial payments, and edits that should fail. Use transactions for changes that need to succeed together." },
    ],
    practice: "Sketch the coaching-center schema and write a report showing amount due per enrollment, including enrollments that have no payment yet.",
  },
  bonus: {
    sections: [
      { heading: "Practice retrieval", text: "Write a small query from memory, run it, and review the result. Start with SELECT and WHERE, then add grouping, joins, subqueries, and window functions. Revisit the patterns you missed the next day." },
      { heading: "Use the reference after trying the problem", text: "Identify the output grain first, then choose a clause or query pattern. Compare your answer with the cheat sheet and glossary. Test a NULL, a duplicate, and a tie where relevant. Review whether the question wants at least one, all, or no matching rows." },
    ],
    practice: "Pick a practice problem and solve it from a blank editor. Explain each clause aloud and predict the output before running it.",
  },
};
