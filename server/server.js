import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mysql from 'mysql2';
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: "uploads/", // Папка должна существовать!
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Имя файла = время + расширение
  }
});
const upload = multer({ storage: storage });

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
  
  connection.connect(err => {
    if (err) {
      console.error("Connection error:", err.message);
      return;
    }
  
    console.log("Connected to MySQL!");
  });

  
  
  // 2. Делаем папку доступной для браузера (чтобы фото открывались по ссылке)
  app.use("/uploads", express.static("uploads"));
 

app.get("/api/listings", (req, res) => {
  connection.query("SELECT * FROM listings", (err, rows) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Ошибка сервера" });
      }
      res.json(rows);
  });
});

app.post("/api/listings", upload.single("photo"), (req, res) => {
  
//   if (!title || !contact_info) {
//     return res.status(400).json({ error: "Название и контакты обязательны" });
// }

const { title, type, description, category, location, phone, user_id} = req.body;
const photoUrl = req.file ? `/uploads/${req.file.filename}` : null; // Путь к фото

  const sql = "INSERT INTO listings (title, type, description, category, location, phone,image, user_id) VALUES (?, ? ,?, ?, ?, ?,?,?)";
  
    connection.query(sql, [title, type, description, category, location, phone, photoUrl, user_id], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Не удалось сохранить запись" });
      }
      res.status(201).json({ message: "Объявление добавлено!", id: result.insertId });
  });
}); 

app.get("/api/search", (req, res) => {
  const { query } = req.query; // получаем текст из строки поиска
  const sql = "SELECT * FROM listings WHERE title LIKE ? OR description LIKE ?";
  const searchTerm = `%${query}%`;

  connection.query(sql, [searchTerm, searchTerm], (err, rows) => {
      if (err) return res.status(500).json({ error: "Ошибка поиска" });
      res.json(rows);
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
      const { email, password, name } = req.body;

      // 1. Шифруем пароль (чтобы в базе не лежал чистый текст)
      const hashedPassword = await bcrypt.hash(password, 10);

      // 2. Сохраняем в базу
      const sql = "INSERT INTO users (email, password, name) VALUES (?, ?, ?)";
      connection.query(sql, [email, hashedPassword, name], (err, result) => {
          if (err) {
              if (err.code === 'ER_DUP_ENTRY') {
                  return res.status(400).json({ error: "Такой email уже зарегистрирован" });
              }
              return res.status(500).json({ error: "Ошибка БД" });
          }
          res.status(201).json({ message: "Пользователь создан!" });
      });
  } catch (e) {
      res.status(500).json({ error: "Ошибка на сервере" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  // 1. Ищем пользователя по email
  connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err || results.length === 0) {
          return res.status(401).json({ error: "Пользователь не найден" });
      }

      const user = results[0];

      // 2. Сравниваем введенный пароль с хешем в базе
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ error: "Неверный пароль" });
      }

      // 3. Создаем JWT токен (используем секрет из твоего .env)
      const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET || "supersecretkey", 
          { expiresIn: "24h" }
      );

      // 4. Отправляем ответ фронтенду
      res.json({
          token,
          user: { id: user.id, email: user.email, name: user.name }
      });
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});