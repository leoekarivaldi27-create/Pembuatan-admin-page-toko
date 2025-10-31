-- database.sql (versi aman)
CREATE DATABASE IF NOT EXISTS shopdb;
USE shopdb;

CREATE TABLE admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100),
  harga DECIMAL(10,2)
);

CREATE TABLE stok (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produk_id INT,
  jumlah INT,
  FOREIGN KEY (produk_id) REFERENCES produk(id)
);

CREATE TABLE pembelian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produk_id INT,
  jumlah INT,
  total DECIMAL(10,2),
  status ENUM('SUKSES','CANCEL') DEFAULT 'SUKSES',
  tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produk_id) REFERENCES produk(id)
);

INSERT INTO produk (nama, harga) VALUES
('Kopi Hitam', 15000),
('Teh Manis', 10000),
('Roti Bakar', 12000),
('Nasi Goreng', 20000),
('Mie Ayam', 18000),
('Es Jeruk', 8000),
('Ayam Goreng', 25000),
('Sate Ayam', 22000),
('Bakso', 15000),
('Soto Ayam', 17000);

INSERT INTO stok (produk_id, jumlah) VALUES
(1, 20),(2, 30),(3, 15),(4, 25),(5, 18),(6, 40),(7, 10),(8, 12),(9, 22),(10, 16);
