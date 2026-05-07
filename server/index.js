import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db.js';

import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';
import reportsRoutes from './routes/reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, '../uploads')));

// Подключение к БД
await initDB();

// Маршруты
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users/profile", profileRoutes);
app.use("/api", reportsRoutes);

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});