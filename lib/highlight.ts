// ছোট, নির্ভরতাহীন SQL হাইলাইটার। বিল্ডের সময় সার্ভারে চলে, তাই ব্রাউজারে
// কোনো বাড়তি JS যায় না।

export type TokenType = "kw" | "fn" | "str" | "num" | "com" | "plain";
export interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = new Set(
  `ADD ALL ALTER AND AS ASC AUTO_INCREMENT BEFORE AFTER BEGIN BETWEEN BY CALL CASCADE CASE CHECK COLUMN COMMIT
  CONSTRAINT CREATE CROSS DATABASE DATABASES DECLARE DEFAULT DELETE DELIMITER DESC DESCRIBE DETERMINISTIC DISTINCT
  DROP EACH ELSE ELSEIF END ENGINE EXISTS EXPLAIN FOR FOREIGN FROM FULL FUNCTION GRANT GROUP HAVING IF IN INDEX
  INNER INSERT INTO IS JOIN KEY LEFT LIKE LIMIT MODIFY NEW NOT NULL OFFSET OLD ON OR ORDER OUT INOUT PRIMARY
  PROCEDURE REFERENCES RENAME REPLACE RETURN RETURNS REVOKE RIGHT ROLLBACK SAVEPOINT SELECT SET SHOW START TABLE
  TABLES THEN TO TRANSACTION TRIGGER TRUNCATE UNION UNIQUE UPDATE USE USER USING VALUES VIEW WHEN WHERE WITH
  INT INTEGER TINYINT SMALLINT BIGINT DECIMAL FLOAT DOUBLE VARCHAR CHAR TEXT DATE DATETIME TIMESTAMP TIME YEAR
  BOOLEAN BOOL ENUM JSON UNSIGNED CHARACTER COLLATE IDENTIFIED PRIVILEGES ISOLATION LEVEL READ COMMITTED
  UNCOMMITTED REPEATABLE SERIALIZABLE SESSION GLOBAL WORK TRUE FALSE ROW ROWS LOCK SHARE MODE NO ACTION
  RESTRICT CHANGE FIRST CURRENT_TIMESTAMP INVOKER DEFINER SQL SECURITY READS MODIFIES DATA CONTAINS SIGNAL
  SQLSTATE MESSAGE_TEXT WHILE DO LOOP LEAVE REPEAT UNTIL ANY SOME RECURSIVE OVER PARTITION ESCAPE INTERVAL
  DAY MONTH WEEK HOUR MINUTE SECOND REFERENCES IGNORE DUPLICATE STORED VIRTUAL GENERATED ALWAYS TEMPORARY`
    .split(/\s+/)
    .filter(Boolean)
);

const TOKEN_RE =
  /(--[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.|'')*'|"(?:[^"\\]|\\.)*"|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()|([A-Za-z_][A-Za-z0-9_]*)/g;

export function tokenizeSQL(code: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ type: "plain", value: code.slice(last, idx) });
    const [full, com, str, num, fn, word] = m;
    if (com) out.push({ type: "com", value: full });
    else if (str) out.push({ type: str.startsWith("`") ? "plain" : "str", value: full });
    else if (num) out.push({ type: "num", value: full });
    else if (fn) out.push({ type: KEYWORDS.has(fn.toUpperCase()) ? "kw" : "fn", value: full });
    else if (word) out.push({ type: KEYWORDS.has(word.toUpperCase()) ? "kw" : "plain", value: full });
    last = idx + full.length;
  }
  if (last < code.length) out.push({ type: "plain", value: code.slice(last) });
  return out;
}
