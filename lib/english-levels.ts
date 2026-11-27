import type { Level, ZoneId } from "./levels";

export const englishLevels: Record<string, { title: string; topics: string }> = {
  "level-0": { title: "Getting Started with Databases", topics: "Databases, DBMS, SQL, and how a web app saves form data" },
  "level-1": { title: "Tables and Data Types", topics: "Rows, columns, CREATE DATABASE, and CREATE TABLE" },
  "level-2": { title: "Changing Data and Table Structure", topics: "INSERT, UPDATE, DELETE, ALTER, TRUNCATE, and DROP" },
  "level-3": { title: "Reading Data with SELECT", topics: "SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, and aliases" },
  "level-4": { title: "Filtering Rows", topics: "LIKE, IN, BETWEEN, and NULL" },
  "level-5": { title: "AND, OR, NOT and Operator Precedence", topics: "Boolean logic, parentheses, NULL, and De Morgan’s laws" },
  "boss-1": { title: "Mini-Boss: The Stationery Shop", topics: "Build, query, and update a small shop database" },
  "level-6": { title: "Functions and CASE Expressions", topics: "String, numeric, and date functions, and conditional values" },
  "level-7": { title: "Aggregate Functions", topics: "COUNT, SUM, AVG, MIN, MAX, and how aggregates handle NULL" },
  "level-8": { title: "Grouping and Filtering Aggregates", topics: "GROUP BY, HAVING, and logical query processing order" },
  "level-9": { title: "Keys and Constraints", topics: "PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT, and CHECK" },
  "level-10": { title: "Joining Tables: INNER JOIN", topics: "Matching rows, aliases, one-to-many relationships, and aggregation" },
  "level-11": { title: "Outer Joins and Other Join Patterns", topics: "LEFT, RIGHT, and FULL joins, anti joins, cross joins, and self joins" },
  "level-12": { title: "Subqueries and Set Operations", topics: "Scalar and correlated subqueries, EXISTS, UNION, and CTEs" },
  "boss-2": { title: "Mini-Boss: The School Library", topics: "Design a library schema and write reports across multiple tables" },
  "level-13": { title: "Relational Model and Relational Algebra", topics: "Relations, tuples, attributes, keys, and basic algebra operations" },
  "level-14": { title: "ER Diagrams and Database Design", topics: "Entities, attributes, cardinality, weak entities, and junction tables" },
  "level-15": { title: "Normalization", topics: "Functional dependencies, anomalies, 1NF, 2NF, 3NF, and BCNF" },
  "level-16": { title: "Indexes and Query Performance", topics: "B-tree indexes, EXPLAIN, composite indexes, and covering indexes" },
  "level-17": { title: "Views, Routines, and Triggers", topics: "Views, stored procedures, stored functions, triggers, and DELIMITER" },
  "level-18": { title: "Transactions and Concurrency", topics: "ACID, COMMIT, ROLLBACK, isolation levels, locks, and deadlocks" },
  "level-19": { title: "Database Access, Backups, and Security", topics: "Users, roles, privileges, backups, restores, and prepared statements" },
  "level-4-1": { title: "Advanced Writes and Table Creation", topics: "INSERT ... SELECT, upserts, joined updates and deletes, and CREATE TABLE ... AS" },
  "level-4-2": { title: "Window Functions", topics: "OVER, PARTITION BY, ranking, running totals, LAG, LEAD, and NTILE" },
  "level-4-3": { title: "CTEs and Recursive Queries", topics: "WITH, named query steps, date series, and hierarchies" },
  "level-4-4": { title: "Advanced Query Patterns", topics: "Relational division, overlapping sets, pivots, rollups, and more" },
  "level-4-5": { title: "Advanced SQL Practice Arena", topics: "Four difficulty tiers across four practice databases" },
  "level-5-1": { title: "How to Turn a Question into SQL", topics: "Result grain, query patterns, staged testing, and edge cases" },
  "level-5-2": { title: "Problem 1: Course Registration", topics: "At least one CSE course, every Dr. Rahman course, and averages that include zero" },
  "level-5-3": { title: "Problem 2: Staff and Branches", topics: "Above-branch-average salaries, date filters, and supervisor names" },
  "level-5-4": { title: "Problem 3: Online Shop", topics: "Customers with no orders, category sales totals, and buyers of the most expensive products" },
  "level-5-5": { title: "Problem 4: Employees and Departments", topics: "Comparisons with company-wide salary statistics and filtering by department" },
  "level-20": { title: "Final Boss: Build a Database Project", topics: "Design, build, and test a small real-world database" },
  bonus: { title: "Revision and Exam Preparation", topics: "Study plan, query review, and quick reference" },
};

export const englishZones: Record<ZoneId, { label: string; name: string; topics: string }> = {
  "zone-1": { label: "Zone 1", name: "The Basics", topics: "Create tables, change records, and write your first queries." },
  "zone-2": { label: "Zone 2", name: "Queries", topics: "Functions, grouping, constraints, joins, and subqueries." },
  "zone-3": { label: "Zone 3", name: "Database Design and Operations", topics: "Model, normalize, index, and manage a database." },
  "zone-4": { label: "Zone 4", name: "Advanced SQL", topics: "Advanced writes, window functions, recursive CTEs, and query patterns." },
  "zone-5": { label: "Zone 5", name: "Worked Assignment Problems", topics: "Turn exam-style questions into queries and test them on sample data." },
  "zone-final": { label: "Final Zone", name: "Project and Revision", topics: "Build your own database and review the book." },
};

export function englishLevelLabel(level: Level): string {
  if (level.kind === "mini-boss") return "Boss";
  if (level.kind === "final-boss") return "Final";
  if (level.kind === "bonus") return "Bonus";
  return level.slug.slice("level-".length).replace("-", ".");
}
