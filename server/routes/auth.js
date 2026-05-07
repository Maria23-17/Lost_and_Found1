import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';

const router = express.Router();

// Регистрация
router.post("/register", async (req, res) => {
    try {
      const { email, password, name, phone, telegram_id, language } = req.body;
      
      const phoneRegex = /^[\d+\-\s\(\)]{10,}$/;
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Неверный формат телефона" });
    }
      // Проверка обязательных полей
      if (!email) {
        return res.status(400).json({ error: "Email обязателен" });
      }
      if (!password) {
        return res.status(400).json({ error: "Пароль обязателен" });
      }
      if (!name) {
        return res.status(400).json({ error: "Имя обязательно" });
      }
      
      console.log('📝 Регистрация пользователя:', { email, name, phone, telegram_id, language });
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const db = getDb();
      
      await db.run(
        "INSERT INTO users (email, password, name, phone, telegram_id, language, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, 'user', 0)",
        [email, hashedPassword, name, phone || null, telegram_id || null, language || 'ru']
      );
      
      console.log('✅ Пользователь создан');
      res.status(201).json({ message: "Пользователь создан!" });
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: "Такой email уже зарегистрирован" });
      }
      console.error('❌ Ошибка регистрации:', err.message);
      res.status(500).json({ error: "Ошибка БД: " + err.message });
    }
  });

// Логин
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = getDb();

  try {
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    
    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: "Неверный пароль" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        phone: user.phone,
        role: user.role || 'user',
        is_verified: user.is_verified
      }
    });
  } catch (err) {
    console.error('❌ Ошибка логина:', err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Обновление телефона (для привязки)
router.patch("/users/update-phone", async (req, res) => {
  const { telegram_id, phone } = req.body;
  const db = getDb();
  
  try {
    await db.run(
      "UPDATE users SET phone = ? WHERE telegram_id = ?",
      [phone, telegram_id]
    );
    res.json({ success: true, message: "Телефон обновлён" });
  } catch (err) {
    console.error('❌ Ошибка обновления телефона:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Привязка Telegram к существующему аккаунту
router.post("/telegram-link", async (req, res) => {
  const { telegram_id, email, password, language } = req.body;
  const db = getDb();
  
  try {
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: "Неверный пароль" });
    }
    
    await db.run(
      "UPDATE users SET telegram_id = ?, language = ? WHERE id = ?",
      [telegram_id, language || 'ru', user.id]
    );
    
    res.json({ success: true, message: "Telegram привязан" });
  } catch (err) {
    console.error('❌ Ошибка привязки:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Получение информации о текущем пользователе
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    const db = getDb();
    const user = await db.get(
      "SELECT id, name, email, phone, role FROM users WHERE id = ?",
      [decoded.id]
    );
    
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Недействительный токен" });
  }
});

export default router;