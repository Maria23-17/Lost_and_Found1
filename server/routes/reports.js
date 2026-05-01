import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post("/listings/:id/report", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const db = getDb();
    
    try {
        await db.run(
            "INSERT INTO reports (listing_id, user_id, reason, status, created_at) VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)",
            [id, userId, reason || 'Пользователь пожаловался на объявление']
        );
        res.json({ message: "Жалоба отправлена" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при отправке жалобы" });
    }
});

export default router;