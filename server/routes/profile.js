import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const db = getDb();
        const user = await db.get(
            "SELECT id, name, email, phone, role, is_verified, created_at FROM users WHERE id = ?",
            [req.user.id]
        );
        if (!user) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

router.put("/", authenticateToken, async (req, res) => {
    const { name, email, phone } = req.body;
    const userId = req.user.id;
    const db = getDb();
    
    try {
        await db.run(
            "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
            [name, email, phone, userId]
        );
        
        const user = await db.get(
            "SELECT id, name, email, phone, role, is_verified, created_at FROM users WHERE id = ?",
            [userId]
        );
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при обновлении" });
    }
});

export default router;
