-- MySQL বই: মিনি বস ১ (করিম চাচার দোকান)।
DROP DATABASE IF EXISTS shop;
CREATE DATABASE shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shop;
CREATE TABLE products (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100),
  category  VARCHAR(50),
  price     DECIMAL(8,2),
  stock     INT,
  expiry    DATE
);
INSERT INTO products (name, category, price, stock, expiry) VALUES
  ('মিনিকেট চাল (৫ কেজি)', 'চাল-ডাল', 420.00, 25, NULL),
  ('মসুর ডাল (১ কেজি)', 'চাল-ডাল', 135.00, 40, NULL),
  ('সয়াবিন তেল (১ লি.)', 'তেল', 175.00, 0, '2027-03-01'),
  ('সরিষার তেল (৫০০ মি.লি.)', 'তেল', 160.00, 12, '2027-01-15'),
  ('গুঁড়া দুধ (৫০০ গ্রাম)', 'দুধ', 380.00, 8, '2026-12-20'),
  ('তরল দুধ (১ লি.)', 'দুধ', 95.00, 30, '2026-11-20'),
  ('চিনি (১ কেজি)', 'মুদি', 130.00, 50, NULL),
  ('লবণ (১ কেজি)', 'মুদি', 42.00, 60, NULL),
  ('চা পাতা (৪০০ গ্রাম)', 'পানীয়', 210.00, 5, '2027-06-30'),
  ('বিস্কুট', 'নাস্তা', 25.00, 100, '2026-12-05'),
  ('চানাচুর', 'নাস্তা', 60.00, 0, '2026-11-30');
