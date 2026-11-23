-- প্রবলেম ৪: Emp আর Dept (লেভেল ৫.৫)
-- Emp (empno, ename, job, hiredate, mgr, sal, deptno)
-- Dept (deptno, dname, loc)
-- পরিচিত EMP/DEPT ছকের আদলে, তবে সংখ্যা নিজেদের। যে কেসগুলো ইচ্ছা করে রাখা:
--   * সবার গড় বেতন ঠিক 4000, আর SCOTT-এর বেতনও ঠিক 4000
--   * সর্বনিম্ন বেতন (1500) দুজনের: SMITH আর JAMES
--   * 40 নম্বর বিভাগে দুজন আছেন; 50 নম্বর বিভাগে কেউ নেই
--   * KING-এর কোনো mgr নেই (NULL)

DROP DATABASE IF EXISTS asg_emp;
CREATE DATABASE asg_emp CHARACTER SET utf8mb4;
USE asg_emp;

CREATE TABLE Dept (
  deptno INT PRIMARY KEY,
  dname  VARCHAR(30) NOT NULL,
  loc    VARCHAR(30) NOT NULL
);

CREATE TABLE Emp (
  empno    INT PRIMARY KEY,
  ename    VARCHAR(30) NOT NULL,
  job      VARCHAR(20) NOT NULL,
  hiredate DATE NOT NULL,
  mgr      INT NULL,
  sal      DECIMAL(10,2) NOT NULL,
  deptno   INT NOT NULL,
  FOREIGN KEY (mgr)    REFERENCES Emp(empno),
  FOREIGN KEY (deptno) REFERENCES Dept(deptno)
);

INSERT INTO Dept VALUES
  (10, 'ACCOUNTING', 'Dhaka'),
  (20, 'RESEARCH',   'Chattogram'),
  (30, 'SALES',      'Sylhet'),
  (40, 'OPERATIONS', 'Khulna'),
  (50, 'MARKETING',  'Rajshahi');

INSERT INTO Emp VALUES
  (7839, 'KING',   'PRESIDENT', '2015-11-17', NULL, 9000, 10),
  (7566, 'JONES',  'MANAGER',   '2016-04-02', 7839, 5500, 20),
  (7698, 'BLAKE',  'MANAGER',   '2016-05-01', 7839, 5200, 30),
  (7782, 'CLARK',  'MANAGER',   '2016-06-09', 7839, 5000, 10),
  (7788, 'SCOTT',  'ANALYST',   '2019-12-09', 7566, 4000, 20),
  (7499, 'ALLEN',  'SALESMAN',  '2017-02-20', 7698, 3000, 30),
  (7934, 'MILLER', 'CLERK',     '2018-01-23', 7782, 2000, 10),
  (7369, 'SMITH',  'CLERK',     '2020-12-17', 7788, 1500, 20),
  (7900, 'JAMES',  'CLERK',     '2021-12-03', 7698, 1500, 30),
  (7950, 'RAHIM',  'OPERATOR',  '2022-03-01', 7839, 3800, 40),
  (7951, 'KARIM',  'OPERATOR',  '2023-06-15', 7950, 3500, 40);
