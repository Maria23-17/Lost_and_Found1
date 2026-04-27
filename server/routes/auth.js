import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const db = getDb();
        
        await db.run(
            "INSERT INTO users (email, password, name, phone, role, is_verified) VALUES (?, ?, ?, ?, 'user', 0)",
            [email, hashedPassword, name, phone]
        );
        
        res.status(201).json({ message: "Пользователь создан!" });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: "Такой email уже зарегистрирован" });
        }
        res.status(500).json({ error: "Ошибка БД" });
    }
});

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
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

export default router;