const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'tokoadminsecret', resave: false, saveUninitialized: true }));

// Koneksi ke database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shopdb'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Koneksi database berhasil');
});

// Pastikan ada admin default
db.query('SELECT * FROM admin WHERE username=?', ['admin'], (err, result) => {
  if (err) throw err;
  if (result.length === 0) {
    const hash = bcrypt.hashSync('1234', 10);
    db.query('INSERT INTO admin (username, password) VALUES (?,?)', ['admin', hash]);
    console.log('👤 Admin default dibuat (username: admin / password: 1234)');
  }
});

// Middleware untuk proteksi admin
function requireLogin(req, res, next) {
  if (!req.session.loggedIn) return res.redirect('/login');
  next();
}

// Halaman login
app.get('/login', (req, res) => res.render('login', { error: null }));

// Proses login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM admin WHERE username=?', [username], (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.render('login', { error: 'User tidak ditemukan' });
    const admin = results[0];
    if (bcrypt.compareSync(password, admin.password)) {
      req.session.loggedIn = true;
      req.session.username = admin.username;
      res.redirect('/admin');
    } else {
      res.render('login', { error: 'Password salah' });
    }
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Halaman utama toko
app.get('/', (req, res) => {
  db.query('SELECT * FROM produk', (err, produk) => {
    if (err) throw err;
    res.render('index', { produk });
  });
});

// Proses pembelian
app.post('/beli', (req, res) => {
  const { produk_id, jumlah } = req.body;
  db.query('SELECT * FROM produk WHERE id=?', [produk_id], (err, hasil) => {
    if (err) throw err;
    const total = hasil[0].harga * jumlah;
    db.query('INSERT INTO pembelian (produk_id, jumlah, total) VALUES (?,?,?)',
      [produk_id, jumlah, total], (err2) => {
        if (err2) throw err2;
        db.query('UPDATE stok SET jumlah = jumlah - ? WHERE produk_id = ?', [jumlah, produk_id]);
        res.redirect('/');
      });
  });
});

// Halaman admin (proteksi login)
app.get('/admin', requireLogin, (req, res) => {
  db.query('SELECT p.id, pr.nama, p.jumlah, p.total, p.status, p.tanggal FROM pembelian p JOIN produk pr ON p.produk_id=pr.id ORDER BY p.tanggal DESC', (err, pembelian) => {
    if (err) throw err;
    res.render('admin', { pembelian, username: req.session.username });
  });
});

// Cancel pembelian
app.post('/cancel/:id', requireLogin, (req, res) => {
  const id = req.params.id;
  db.query('UPDATE pembelian SET status="CANCEL" WHERE id=?', [id], (err) => {
    if (err) throw err;
    res.redirect('/admin');
  });
});

app.listen(3000, () => console.log('🚀 Server berjalan di http://localhost:3000'));
