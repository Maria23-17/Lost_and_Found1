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
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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

app.use("/uploads", express.static("uploads"));

// ============= МИДЛВЭР АУТЕНТИФИКАЦИИ =============
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: "Требуется авторизация" });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || "supersecretkey", (err, user) => {
        if (err) return res.status(403).json({ error: "Недействительный токен" });
        req.user = user;
        next();
    });
};

// ============= СУЩЕСТВУЮЩИЕ МАРШРУТЫ =============
app.get("/api/listings", (req, res) => {
    connection.query("SELECT * FROM listings WHERE status = 'active' ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
        res.json(rows);
    });
});

app.post("/api/listings", upload.single("photo"), authenticateToken, (req, res) => {
    const { title, type, description, category, location, phone } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.id;
    const status = 'pending';

    const sql = "INSERT INTO listings (title, type, description, category, location, phone, image, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    connection.query(sql, [title, type, description, category, location, phone, photoUrl, userId, status], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Не удалось сохранить запись" });
        }
        res.status(201).json({ message: "Объявление отправлено на модерацию!", id: result.insertId });
    });
});

app.get("/api/search", (req, res) => {
    const { query } = req.query;
    const sql = "SELECT * FROM listings WHERE (title LIKE ? OR description LIKE ?) AND status = 'active'";
    const searchTerm = `%${query}%`;
    connection.query(sql, [searchTerm, searchTerm], (err, rows) => {
        if (err) return res.status(500).json({ error: "Ошибка поиска" });
        res.json(rows);
    });
});

app.post("/api/auth/register", async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (email, password, name, phone, role, is_verified) VALUES (?, ?, ?, ?, 'user', 0)";
        
        connection.query(sql, [email, hashedPassword, name, phone], (err, result) => {
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

    connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: "Пользователь не найден" });
        }

        const user = results[0];
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
    });
});

// ============= АДМИН МАРШРУТЫ (ТОЛЬКО ОДИН ДЛЯ ТЕСТА) =============
app.get("/api/admin/listings", authenticateToken, (req, res) => {
    // Проверка роли
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Доступ запрещен" });
    }
    
    connection.query("SELECT * FROM listings ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Ошибка" });
        }
        res.json({ data: rows });
    });
});

// Статистика для админки
app.get("/api/admin/stats", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
  }
  
  connection.query("SELECT COUNT(*) as count FROM listings", (err, totalResult) => {
      if (err) return res.status(500).json({ error: "Ошибка" });
      
      connection.query("SELECT COUNT(*) as count FROM listings WHERE status = 'active'", (err, activeResult) => {
          if (err) return res.status(500).json({ error: "Ошибка" });
          
          connection.query("SELECT COUNT(*) as count FROM listings WHERE status = 'pending'", (err, pendingResult) => {
              if (err) return res.status(500).json({ error: "Ошибка" });
              
              connection.query("SELECT COUNT(*) as count FROM listings WHERE status = 'closed'", (err, closedResult) => {
                  if (err) return res.status(500).json({ error: "Ошибка" });
                  
                  connection.query("SELECT COUNT(*) as count FROM users", (err, usersResult) => {
                      if (err) return res.status(500).json({ error: "Ошибка" });
                      
                      res.json({
                          totalListings: totalResult[0].count,
                          totalUsers: usersResult[0].count,
                          activeListings: activeResult[0].count,
                          resolvedCases: closedResult[0].count,
                          pendingListings: pendingResult[0].count,
                          bannedUsers: 0,
                          newUsersThisMonth: 0,
                          newListingsThisWeek: 0
                      });
                  });
              });
          });
      });
  });
});

// Обновить статус объявления
app.put("/api/admin/listings/:id", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
  }
  
  const { id } = req.params;
  const { status } = req.body;
  
  connection.query("UPDATE listings SET status = ? WHERE id = ?", [status, id], (err, result) => {
      if (err) {
          return res.status(500).json({ error: "Ошибка при обновлении" });
      }
      res.json({ message: "Статус обновлен" });
  });
});

// Удалить объявление
app.delete("/api/admin/listings/:id", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
  }
  
  const { id } = req.params;
  
  connection.query("DELETE FROM listings WHERE id = ?", [id], (err, result) => {
      if (err) {
          return res.status(500).json({ error: "Ошибка при удалении" });
      }
      res.json({ message: "Объявление удалено" });
  });
});

// Получить всех пользователей
app.get("/api/admin/users", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
  }
  
  connection.query(`
      SELECT u.*, COUNT(l.id) as listings_count
      FROM users u
      LEFT JOIN listings l ON u.id = l.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
  `, (err, rows) => {
      if (err) {
          return res.status(500).json({ error: "Ошибка" });
      }
      res.json({ data: rows });
  });
});

// Обновить роль пользователя
app.put("/api/admin/users/:id", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
  }
  
  const { id } = req.params;
  const { role, status } = req.body;
  
  connection.query("UPDATE users SET role = ?, status = ? WHERE id = ?", [role, status || 'active', id], (err, result) => {
      if (err) {
          return res.status(500).json({ error: "Ошибка при обновлении" });
      }
      res.json({ message: "Пользователь обновлен" });
  });
});

// Получить всех пользователей для админки
app.get("/api/admin/users", authenticateToken, (req, res) => {
  // Проверяем что это админ
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
  }
  
  const sql = `
      SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.phone, 
          u.role, 
          u.status,
          u.is_verified,
          u.created_at,
          COUNT(l.id) as listings_count
      FROM users u
      LEFT JOIN listings l ON u.id = l.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
  `;
  
  connection.query(sql, (err, rows) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Ошибка при получении пользователей" });
      }
      res.json({ data: rows });
  });
});

// Обновить данные пользователя (роль, статус)
app.put("/api/admin/users/:id", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
  }
  
  const { id } = req.params;
  const { name, email, phone, role, status } = req.body;
  
  const sql = "UPDATE users SET name = ?, email = ?, phone = ?, role = ?, status = ? WHERE id = ?";
  
  connection.query(sql, [name, email, phone, role, status, id], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Ошибка при обновлении" });
      }
      res.json({ message: "Пользователь обновлен" });
  });
});

// Заблокировать/разблокировать пользователя
// ============= УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (ДОБАВИТЬ ЭТО) =============

// 1. Получить всех пользователей
app.get("/api/admin/users", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
  }
  
  const sql = `
      SELECT u.*, COUNT(l.id) as listings_count
      FROM users u
      LEFT JOIN listings l ON u.id = l.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
  `;
  
  connection.query(sql, (err, rows) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Ошибка при получении пользователей" });
      }
      res.json({ data: rows });
  });
});

// 2. Обновить пользователя
app.put("/api/admin/users/:id", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
  }
  
  const { id } = req.params;
  const { role, status } = req.body;
  
  connection.query("UPDATE users SET role = ?, status = ? WHERE id = ?", [role, status, id], (err, result) => {
      if (err) {
          return res.status(500).json({ error: "Ошибка при обновлении" });
      }
      res.json({ message: "Пользователь обновлен" });
  });
});

// 3. Заблокировать/разблокировать пользователя
app.patch("/api/admin/users/:id/ban", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
  }
  
  const { id } = req.params;
  const { status } = req.body;
  
  connection.query("UPDATE users SET status = ? WHERE id = ?", [status, id], (err, result) => {
      if (err) {
          return res.status(500).json({ error: "Ошибка при обновлении статуса" });
      }
      res.json({ message: status === 'banned' ? "Пользователь заблокирован" : "Пользователь разблокирован" });
  });
});

// ============= МАРШРУТЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ =============

// 1. Получить мои объявления (для страницы "Мои объявления")

app.get("/api/my-listings", authenticateToken, (req, res) => {
    console.log("User ID:", req.user.id); // Для отладки
    connection.query(
      "SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Ошибка сервера" });
        }
        res.json(rows);
      }
    );
  });
  
  // Закрыть объявление
  app.put("/api/listings/:id/close", authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log("Closing listing:", { id, userId }); // Для отладки
    
    connection.query(
      "UPDATE listings SET status = 'closed' WHERE id = ? AND user_id = ?",
      [id, userId],
      (err, result) => {
        if (err) {
          console.error("SQL Error:", err);
          return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Объявление не найдено" });
        }
        res.json({ message: "Объявление закрыто" });
      }
    );
  });
  
  // Удалить объявление
  app.delete("/api/listings/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log("Deleting listing:", { id, userId }); // Для отладки
    
    connection.query(
      "DELETE FROM listings WHERE id = ? AND user_id = ?",
      [id, userId],
      (err, result) => {
        if (err) {
          console.error("SQL Error:", err);
          return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Объявление не найдено" });
        }
        res.json({ message: "Объявление удалено" });
      }
    );
  });
  
  // 2. Получить профиль пользователя
  app.get("/api/users/profile", authenticateToken, (req, res) => {
    connection.query(
      "SELECT id, name, email, phone, role, is_verified, created_at FROM users WHERE id = ?",
      [req.user.id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: "Ошибка сервера" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ error: "Пользователь не найден" });
        }
        res.json(rows[0]);
      }
    );
  });
  
  // 3. Обновить профиль пользователя
  app.put("/api/users/profile", authenticateToken, (req, res) => {
    const { name, email, phone } = req.body;
    const userId = req.user.id;
    
    connection.query(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name, email, phone, userId],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Ошибка при обновлении" });
        }
        
        // Получаем обновленного пользователя
        connection.query(
          "SELECT id, name, email, phone, role, is_verified, created_at FROM users WHERE id = ?",
          [userId],
          (err, rows) => {
            if (err) {
              return res.status(500).json({ error: "Ошибка" });
            }
            res.json({ user: rows[0] });
          }
        );
      }
    );
  });
  

  // Добавьте в server.js
app.put("/api/listings/:id/status", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    connection.query(
      "UPDATE listings SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
      [status, id, userId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Ошибка при обновлении" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Объявление не найдено" });
        }
        res.json({ message: "Статус обновлен" });
      }
    );
  });


  // Пожаловаться на объявление
app.post("/api/listings/:id/report", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    connection.query(
      "INSERT INTO reports (listing_id, user_id, reason) VALUES (?, ?, ?)",
      [id, req.user.id, reason],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Ошибка при отправке жалобы" });
        }
        res.json({ message: "Жалоба отправлена" });
      }
    );
  });

// ============= ЖАЛОБЫ =============

// 1. Отправить жалобу
app.post("/api/listings/:id/report", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    connection.query(
      "INSERT INTO reports (listing_id, user_id, reason, status, created_at) VALUES (?, ?, ?, 'pending', NOW())",
      [id, userId, reason || 'Пользователь пожаловался на объявление'],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Ошибка при отправке жалобы" });
        }
        res.json({ message: "Жалоба отправлена" });
      }
    );
  });
  
  // 2. Получить все жалобы (для админа)
  app.get("/api/admin/reports", authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
    }
    
    const sql = `
      SELECT r.*, 
             l.title as listing_title, 
             l.user_id as listing_owner_id,
             u.name as reporter_name,
             u.email as reporter_email
      FROM reports r
      LEFT JOIN listings l ON r.listing_id = l.id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `;
    
    connection.query(sql, (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Ошибка при получении жалоб" });
      }
      res.json(rows);
    });
  });
  
  // 3. Обновить статус жалобы
  app.put("/api/admin/reports/:id", authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Доступ запрещен" });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    connection.query(
      "UPDATE reports SET status = ? WHERE id = ?",
      [status, id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Ошибка при обновлении" });
        }
        res.json({ message: "Статус жалобы обновлен" });
      }
    );
  });

  // Получить одно объявление по ID
app.get("/api/listings/:id", (req, res) => {
  const { id } = req.params;
  
  connection.query(
    "SELECT * FROM listings WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Ошибка сервера" });
      }
      if (rows.length === 0) {
        return res.status(404).json({ error: "Объявление не найдено" });
      }
      res.json(rows[0]);
    }
  );
});
  
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});

