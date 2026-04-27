import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get("/listings", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const rows = await db.all("SELECT * FROM listings ORDER BY created_at DESC");
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: "Ошибка" });
    }
});

router.get("/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const totalListings = await db.get("SELECT COUNT(*) as count FROM listings");
        const activeListings = await db.get("SELECT COUNT(*) as count FROM listings WHERE status = 'active'");
        const pendingListings = await db.get("SELECT COUNT(*) as count FROM listings WHERE status = 'pending'");
        const closedListings = await db.get("SELECT COUNT(*) as count FROM listings WHERE status = 'closed'");
        const totalUsers = await db.get("SELECT COUNT(*) as count FROM users");
        
        res.json({
            totalListings: totalListings.count,
            totalUsers: totalUsers.count,
            activeListings: activeListings.count,
            resolvedCases: closedListings.count,
            pendingListings: pendingListings.count,
            bannedUsers: 0,
            newUsersThisMonth: 0,
            newListingsThisWeek: 0
        });
    } catch (err) {
        res.status(500).json({ error: "Ошибка" });
    }
});

router.put("/listings/:id", authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = getDb();
    
    try {
        await db.run("UPDATE listings SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: "Статус обновлен" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при обновлении" });
    }
});

router.delete("/listings/:id", authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const db = getDb();
    
    try {
        await db.run("DELETE FROM listings WHERE id = ?", [id]);
        res.json({ message: "Объявление удалено" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при удалении" });
    }
});

router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const rows = await db.all(`
            SELECT u.*, COUNT(l.id) as listings_count
            FROM users u
            LEFT JOIN listings l ON u.id = l.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: "Ошибка" });
    }
});

router.put("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { role, status } = req.body;
    const db = getDb();
    
    try {
        await db.run("UPDATE users SET role = ?, status = ? WHERE id = ?", [role, status || 'active', id]);
        res.json({ message: "Пользователь обновлен" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при обновлении" });
    }
});

router.patch("/users/:id/ban", authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = getDb();
    
    try {
        await db.run("UPDATE users SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: status === 'banned' ? "Пользователь заблокирован" : "Пользователь разблокирован" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при обновлении статуса" });
    }
});

router.get("/reports", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const rows = await db.all(`
            SELECT r.*, 
                   l.title as listing_title, 
                   u.name as reporter_name,
                   u.email as reporter_email
            FROM reports r
            LEFT JOIN listings l ON r.listing_id = l.id
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Ошибка при получении жалоб" });
    }
});

router.put("/reports/:id", authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = getDb();
    
    try {
        await db.run("UPDATE reports SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: "Статус жалобы обновлен" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при обновлении" });
    }
});

export default router;