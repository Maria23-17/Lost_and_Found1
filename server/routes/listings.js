import transliteration from 'transliteration';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Публичные маршруты
router.get("/", async (req, res) => {
    try {
        const db = getDb();
        const rows = await db.all("SELECT * FROM listings WHERE status = 'active' ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Поиск объявлений (публичный)
router.get('/search', async (req, res) => {
    const { query } = req.query;
    
    console.log('🔍 Поиск:', query);
    
    if (!query || query.trim() === '') {
      return res.json([]);
    }
    
    try {
      const db = getDb();
      const searchTerm = `%${query}%`;
      
      // Конвертируем запрос в разные варианты
      // "телефон" -> "telefon", "телефон", "telefon"
      const latinQuery = transliteration.slugify(query, { lowercase: true, separator: '' });
      const cyrillicQuery = transliteration.transliterate(query);
      
      console.log('📝 Варианты поиска:', { latinQuery, cyrillicQuery });
      
      const listings = await db.all(
        `SELECT * FROM listings 
         WHERE status = 'active' 
         AND (
           title LIKE ? 
           OR description LIKE ? 
           OR category LIKE ? 
           OR location LIKE ?
           OR title LIKE ?
           OR description LIKE ?
           OR title LIKE ?
         )
         ORDER BY 
           CASE 
             WHEN title LIKE ? THEN 1
             WHEN title LIKE ? THEN 2
             WHEN title LIKE ? THEN 3
             ELSE 4
           END,
           created_at DESC
         LIMIT 30`,
        [
          searchTerm, searchTerm, searchTerm, searchTerm,           // оригинальный запрос
          `%${latinQuery}%`, `%${latinQuery}%`,                    // латиница
          `%${cyrillicQuery}%`,                                    // транслитерация
          searchTerm, `%${latinQuery}%`, `%${cyrillicQuery}%`      // для сортировки
        ]
      );
      
      console.log(`✅ Найдено: ${listings.length}`);
      res.json(listings);
    } catch (err) {
      console.error('❌ Ошибка поиска:', err);
      res.status(500).json({ error: err.message });
    }
});
router.get("/my-listings", authenticateToken, async (req, res) => {
    try {
        const db = getDb();
        const rows = await db.all(
            "SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const db = getDb();
        const row = await db.get(
            "SELECT l.*, u.name as user_name FROM listings l LEFT JOIN users u ON l.user_id = u.id WHERE l.id = ?",
            [id]
        );
        if (!row) {
            return res.status(404).json({ error: "Объявление не найдено" });
        }
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Защищённые маршруты
router.post("/", authenticateToken, upload.single("photo"), async (req, res) => {
    console.log("=== СОЗДАНИЕ ОБЪЯВЛЕНИЯ ===");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    
    const { title, type, description, category, location, phone } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.id;
    const status = 'pending';
    const db = getDb();

    const phoneRegex = /^[\d+\-\s\(\)]{10,}$/;
  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({ error: "Неверный формат телефона" });
  }

    try {
        const result = await db.run(
            "INSERT INTO listings (title, type, description, category, location, phone, image, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [title, type, description, category, location, phone, photoUrl, userId, status]
        );
        console.log("Insert result:", result);
        res.status(201).json({ message: "Объявление отправлено на модерацию!", id: result.lastID });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Не удалось сохранить запись: " + err.message });
    }
});


router.put("/:id/close", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const db = getDb();
    
    try {
        const result = await db.run(
            "UPDATE listings SET status = 'closed' WHERE id = ? AND user_id = ?",
            [id, userId]
        );
        if (result.changes === 0) {
            return res.status(404).json({ error: "Объявление не найдено" });
        }
        res.json({ message: "Объявление закрыто" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const db = getDb();
    
    try {
        const result = await db.run(
            "DELETE FROM listings WHERE id = ? AND user_id = ?",
            [id, userId]
        );
        if (result.changes === 0) {
            return res.status(404).json({ error: "Объявление не найдено" });
        }
        res.json({ message: "Объявление удалено" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/:id/status", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const db = getDb();
    
    try {
        const result = await db.run(
            "UPDATE listings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
            [status, id, userId]
        );
        if (result.changes === 0) {
            return res.status(404).json({ error: "Объявление не найдено" });
        }
        res.json({ message: "Статус обновлен" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при обновлении" });
    }
});

export default router;
