import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const BOT_TOKEN = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const UPLOADS_DIR = './uploads';

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не указан');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const api = axios.create({ baseURL: API_URL });

// Сессии
const sessions = new Map();
const SESSIONS_FILE = './sessions.json';

// Загрузка сессий из файла
function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      const saved = JSON.parse(data);
      for (const [key, value] of Object.entries(saved)) {
        sessions.set(key, value);
      }
      console.log('✅ Загружено сессий из файла:', sessions.size);
    }
  } catch (err) {
    console.error('Ошибка загрузки сессий:', err);
  }
}

// Сохранение сессий в файл
function saveSessions() {
  try {
    const obj = {};
    for (const [key, value] of sessions.entries()) {
      obj[key] = value;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error('Ошибка сохранения сессий:', err);
  }
}

function getSession(chatId) {
  const id = chatId.toString();
  if (!sessions.has(id)) {
    sessions.set(id, { state: 'idle', data: {}, lang: 'ru', user: null });
  }
  return sessions.get(id);
}

function setSession(chatId, updates) {
  const id = chatId.toString();
  const current = getSession(id);
  sessions.set(id, { ...current, ...updates });
  saveSessions();
}

// Проверка токена
async function checkAndRefreshToken(chatId) {
  const s = getSession(chatId);
  
  if (!s.user || !s.user.token) {
    return false;
  }
  
  try {
    await api.get('/auth/me', {
      headers: { 'Authorization': `Bearer ${s.user.token}` }
    });
    return true;
  } catch (err) {
    if (err.response?.status === 401) {
      console.log('❌ Токен недействителен для', chatId);
      setSession(chatId, { user: null, state: 'idle', data: {} });
      await bot.sendMessage(chatId, '❌ Сессия истекла. Пожалуйста, войдите заново: /start');
      return false;
    }
    return false;
  }
}

// Клавиатуры
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      ['📋 Мои объявления', '➕ Создать объявление'],
      ['🔍 Поиск', '👤 Профиль']
    ],
    resize_keyboard: true
  }
};

const cancelKeyboard = {
  reply_markup: {
    keyboard: [['❌ Отмена']],
    resize_keyboard: true
  }
};

const skipKeyboard = {
  reply_markup: {
    keyboard: [['⏭️ Пропустить', '❌ Отмена']],
    resize_keyboard: true
  }
};

const typeKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🔍 Потеряно', callback_data: 'type_lost' }],
      [{ text: '📦 Найдено', callback_data: 'type_found' }]
    ]
  }
};

const categoryKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '📄 Документы', callback_data: 'cat_documents' }],
      [{ text: '📱 Электроника', callback_data: 'cat_electronics' }],
      [{ text: '👕 Одежда', callback_data: 'cat_clothing' }],
      [{ text: '⌚ Аксессуары', callback_data: 'cat_accessories' }],
      [{ text: '🐾 Животные', callback_data: 'cat_pets' }],
      [{ text: '📦 Другое', callback_data: 'cat_other' }],
      [{ text: '❌ Отмена', callback_data: 'cancel_create' }]
    ]
  }
};

// Функции
async function sendListingCard(chatId, listing) {
  const statusText = {
    active: '🟢 Активно',
    pending: '🟡 На модерации',
    closed: '⚫ Закрыто'
  }[listing.status] || listing.status;
  
  const text = `
${listing.type === 'lost' ? '🔍' : '📦'} *${listing.title}*
├ *Тип:* ${listing.type === 'lost' ? 'Потеряно' : 'Найдено'}
├ *Категория:* ${listing.category}
├ *Статус:* ${statusText}
├ *Место:* ${listing.location}
├ *Телефон:* ${listing.phone || 'Не указан'}
└ *Описание:* ${listing.description}

📅 ${new Date(listing.created_at).toLocaleDateString()}
  `;
  
  let imageUrl = null;
  
  if (listing.image && listing.image !== 'null' && listing.image !== 'undefined' && listing.image !== '') {
    if (listing.image.startsWith('http')) {
      imageUrl = listing.image;
    } 
    else if (listing.image.startsWith('/uploads')) {
      imageUrl = `http://localhost:5000${listing.image}`;
    }
    else {
      imageUrl = `http://localhost:5000/uploads/${listing.image}`;
    }
  }
  
  try {
    if (imageUrl) {
      await bot.sendPhoto(chatId, imageUrl, { caption: text, parse_mode: 'Markdown' });
    } else {
      await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    }
  } catch (err) {
    console.error('Send photo error:', err.message);
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  }
}

// Команды
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let s = getSession(chatId);
  
  if (s.user && s.user.token) {
    const isValid = await checkAndRefreshToken(chatId);
    if (isValid) {
      await bot.sendMessage(chatId, '🏠 Главное меню', mainKeyboard);
    } else {
      await bot.sendMessage(chatId, '🌍 Выберите язык:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }],
            [{ text: "🇺🇿 O'zbek", callback_data: 'lang_uz' }],
            [{ text: '🇬🇧 English', callback_data: 'lang_en' }]
          ]
        }
      });
    }
  } else {
    await bot.sendMessage(chatId, '🌍 Выберите язык:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }],
          [{ text: "🇺🇿 O'zbek", callback_data: 'lang_uz' }],
          [{ text: '🇬🇧 English', callback_data: 'lang_en' }]
        ]
      }
    });
  }
});

bot.onText(/\/menu/, async (msg) => {
  await bot.sendMessage(msg.chat.id, '🏠 Главное меню', mainKeyboard);
});

// Callbacks
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const s = getSession(chatId);
  
  if (data.startsWith('lang_')) {
    const lang = data.split('_')[1];
    setSession(chatId, { lang });
    await bot.answerCallbackQuery(query.id);
    await bot.deleteMessage(chatId, query.message.message_id);
    
    await bot.sendMessage(chatId, '🔐 Выберите действие:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔑 Войти', callback_data: 'auth_login' }],
          [{ text: '📝 Регистрация', callback_data: 'auth_register' }]
        ]
      }
    });
    return;
  }
  
  if (data === 'auth_login') {
    await bot.deleteMessage(chatId, query.message.message_id);
    setSession(chatId, { state: 'waiting_email_login', data: {} });
    await bot.sendMessage(chatId, '🔑 Введите email:', cancelKeyboard);
    return;
  }
  
  if (data === 'auth_register') {
    await bot.deleteMessage(chatId, query.message.message_id);
    setSession(chatId, { state: 'waiting_email_register', data: {} });
    await bot.sendMessage(chatId, '📝 Введите email:', cancelKeyboard);
    return;
  }
  
  if (data === 'type_lost') {
    setSession(chatId, { state: 'waiting_category', data: { type: 'lost' } });
    await bot.editMessageText('📂 Выберите категорию:', {
      chat_id: chatId,
      message_id: query.message.message_id,
      ...categoryKeyboard
    });
    return;
  }
  
  if (data === 'type_found') {
    setSession(chatId, { state: 'waiting_category', data: { type: 'found' } });
    await bot.editMessageText('📂 Выберите категорию:', {
      chat_id: chatId,
      message_id: query.message.message_id,
      ...categoryKeyboard
    });
    return;
  }
  
  if (data.startsWith('cat_')) {
    const category = data.split('_')[1];
    setSession(chatId, { state: 'waiting_title', data: { ...s.data, category } });
    await bot.editMessageText('📝 Введите название:', {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'cancel_create' }]] }
    });
    return;
  }
  
  if (data === 'cancel_create') {
    setSession(chatId, { state: 'idle', data: {} });
    await bot.editMessageText('🏠 Главное меню', {
      chat_id: chatId,
      message_id: query.message.message_id,
      ...mainKeyboard
    });
    return;
  }
  
  if (data === 'logout') {
    await bot.editMessageText('❓ Вы действительно хотите выйти из аккаунта?', {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Да, выйти', callback_data: 'confirm_logout' },
            { text: '❌ Нет, остаться', callback_data: 'cancel_logout' }
          ]
        ]
      }
    });
    return;
  }

  if (data === 'confirm_logout') {
    setSession(chatId, { user: null, state: 'idle', data: {} });
    await bot.editMessageText('✅ Вы вышли из аккаунта.\n\n🌍 Выберите язык для продолжения:', {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }],
          [{ text: "🇺🇿 O'zbek", callback_data: 'lang_uz' }],
          [{ text: '🇬🇧 English', callback_data: 'lang_en' }]
        ]
      }
    });
    return;
  }

  if (data === 'cancel_logout') {
    await bot.editMessageText('🔐 Выход отменён', {
      chat_id: chatId,
      message_id: query.message.message_id
    });
    return;
  }
  
  await bot.answerCallbackQuery(query.id);
});

// Текстовые сообщения
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const s = getSession(chatId);
  
  if (!text || text.startsWith('/')) return;
  
  if (text === '❌ Отмена') {
    setSession(chatId, { state: 'idle', data: {} });
    await bot.sendMessage(chatId, '🏠 Главное меню', mainKeyboard);
    return;
  }
  
  if (text === '📋 Мои объявления') {
    if (!await checkAndRefreshToken(chatId)) return;
    
    try {
      const res = await api.get('/listings/my-listings', {
        headers: { 'Authorization': `Bearer ${s.user.token}` }
      });
      
      if (res.data.length === 0) {
        await bot.sendMessage(chatId, '📭 Нет объявлений', mainKeyboard);
      } else {
        for (const listing of res.data) {
          await sendListingCard(chatId, listing);
        }
      }
    } catch (err) {
      console.error('❌ Ошибка:', err.response?.data || err.message);
      await bot.sendMessage(chatId, '❌ Ошибка загрузки', mainKeyboard);
    }
    return;
  }
  
  if (text === '➕ Создать объявление') {
    if (!await checkAndRefreshToken(chatId)) return;
    
    setSession(chatId, { state: 'waiting_type', data: {} });
    await bot.sendMessage(chatId, '📝 Выберите тип:', typeKeyboard);
    return;
  }
  
  if (text === '🔍 Поиск') {
    setSession(chatId, { state: 'waiting_search', data: {} });
    await bot.sendMessage(chatId, '🔍 Введите запрос:', cancelKeyboard);
    return;
  }
  
  if (text === '👤 Профиль') {
    if (!await checkAndRefreshToken(chatId)) return;
    
    try {
      const res = await api.get('/auth/me', {
        headers: { 'Authorization': `Bearer ${s.user.token}` }
      });
      const user = res.data;
      
      await bot.sendMessage(chatId, 
        `👤 *Ваш профиль*\n\n` +
        `Имя: ${user.name}\n` +
        `Email: ${user.email}\n` +
        `Телефон: ${user.phone || 'Не указан'}\n` +
        `Роль: ${user.role === 'admin' ? 'Администратор' : 'Пользователь'}`,
        { 
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔓 Выйти из аккаунта', callback_data: 'logout' }]
            ]
          }
        }
      );
    } catch (err) {
      await bot.sendMessage(chatId, '❌ Ошибка загрузки профиля');
    }
    return;
  }
  
  if (s.state === 'waiting_email_login') {
    setSession(chatId, { state: 'waiting_password_login', data: { email: text } });
    await bot.sendMessage(chatId, '🔑 Введите пароль:', cancelKeyboard);
    return;
  }
  
  if (s.state === 'waiting_password_login') {
    console.log('📝 Попытка входа:', s.data.email);
    try {
      const res = await api.post('/auth/login', { email: s.data.email, password: text });
      console.log('✅ Вход успешен:', res.data.user);
      setSession(chatId, { 
        user: { 
          id: res.data.user.id, 
          name: res.data.user.name, 
          token: res.data.token 
        },
        state: 'idle' 
      });
      await bot.sendMessage(chatId, `✅ Добро пожаловать, ${res.data.user.name}!`, mainKeyboard);
    } catch (err) {
      console.error('❌ Ошибка входа:', err.response?.data || err.message);
      await bot.sendMessage(chatId, '❌ Неверный email или пароль', cancelKeyboard);
    }
    return;
  }
  
  if (s.state === 'waiting_email_register') {
    setSession(chatId, { state: 'waiting_password_register', data: { email: text } });
    await bot.sendMessage(chatId, '📝 Введите пароль (мин. 6 символов):', cancelKeyboard);
    return;
  }
  
  if (s.state === 'waiting_password_register') {
    if (text.length < 6) {
      await bot.sendMessage(chatId, '❌ Слишком короткий. Минимум 6 символов:', cancelKeyboard);
      return;
    }
    setSession(chatId, { state: 'waiting_name_register', data: { ...s.data, password: text } });
    await bot.sendMessage(chatId, '📝 Введите имя:', cancelKeyboard);
    return;
  }
  
  if (s.state === 'waiting_name_register') {
    setSession(chatId, { state: 'waiting_phone_register', data: { ...s.data, name: text } });
    await bot.sendMessage(chatId, '📞 Введите телефон:', cancelKeyboard);
    return;
  }
  
  if (s.state === 'waiting_phone_register') {
    const phone = text;
    
    const phoneRegex = /^[\d+\-\s\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      await bot.sendMessage(chatId, '❌ Введите корректный номер телефона (только цифры и знак +):', cancelKeyboard);
      return;
    }
    
    try {
      await api.post('/auth/register', {
        email: s.data.email,
        password: s.data.password,
        name: s.data.name,
        phone: phone,
        telegram_id: msg.from.id.toString()
      });
      
      const res = await api.post('/auth/login', { email: s.data.email, password: s.data.password });
      setSession(chatId, { user: { id: res.data.user.id, name: res.data.user.name, token: res.data.token } });
      await bot.sendMessage(chatId, `✅ Добро пожаловать, ${s.data.name}!`, mainKeyboard);
    } catch (err) {
      console.error('❌ Ошибка регистрации:', err.response?.data || err.message);
      await bot.sendMessage(chatId, `❌ Ошибка: ${err.response?.data?.error || 'Регистрация не удалась'}`, cancelKeyboard);
    }
    return;
  }
  
  if (s.state === 'waiting_title') {
    setSession(chatId, { state: 'waiting_description', data: { ...s.data, title: text } });
    await bot.sendMessage(chatId, '📝 Введите описание:', cancelKeyboard);
    return;
  }
  
  if (s.state === 'waiting_description') {
    setSession(chatId, { state: 'waiting_location', data: { ...s.data, description: text } });
    await bot.sendMessage(chatId, '📍 Введите место:', cancelKeyboard);
    return;
  }
  
  if (s.state === 'waiting_location') {
    setSession(chatId, { state: 'waiting_phone', data: { ...s.data, location: text } });
    await bot.sendMessage(chatId, '📞 Введите телефон:', cancelKeyboard);
    return;
  }
  
  if (s.state === 'waiting_phone') {
    setSession(chatId, { state: 'waiting_photo', data: { ...s.data, phone: text } });
    await bot.sendMessage(chatId, '🖼️ Отправьте фото или "Пропустить":', skipKeyboard);
    return;
  }
  
  if (text === '⏭️ Пропустить' && s.state === 'waiting_photo') {
    await createListing(chatId, null);
    return;
  }
  
  if (s.state === 'waiting_search') {
    const query = text;
    setSession(chatId, { state: 'idle', data: {} });
    
    try {
      console.log('🔍 Поиск:', query);
      const res = await api.get(`/listings/search?query=${(query)}`);
      
      if (!res.data || res.data.length === 0) {
        await bot.sendMessage(chatId, '🔍 Ничего не найдено', mainKeyboard);
      } else {
        await bot.sendMessage(chatId, `🔍 Результаты (${res.data.length}):`);
        for (const listing of res.data.slice(0, 10)) {
          await sendListingCard(chatId, listing);
        }
      }
    } catch (err) {
      console.error('❌ Ошибка поиска:', err.message);
      await bot.sendMessage(chatId, '❌ Ошибка поиска', mainKeyboard);
    }
    return;
  }
});

// Фото
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const s = getSession(chatId);
  
  if (s.state === 'waiting_photo') {
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const fileLink = await bot.getFileLink(fileId);
    const response = await axios.get(fileLink, { responseType: 'stream' });
    const filename = `${Date.now()}.jpg`;
    const filepath = path.join(UPLOADS_DIR, filename);
    
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    await createListing(chatId, filepath);
  }
});

async function createListing(chatId, photoPath) {
  const s = getSession(chatId);
  const { type, category, title, description, location, phone } = s.data;
  
  console.log('📝 Создание объявления:', { type, category, title });
  
  if (!s.user?.token) {
    await bot.sendMessage(chatId, '❌ Ошибка авторизации. Войдите заново: /start');
    return;
  }
  
  try {
    if (photoPath) {
      const form = new FormData();
      form.append('title', title);
      form.append('type', type);
      form.append('description', description);
      form.append('category', category);
      form.append('location', location);
      form.append('phone', phone);
      form.append('photo', fs.createReadStream(photoPath));
      
      await api.post('/listings', form, {
        headers: { ...form.getHeaders(), 'Authorization': `Bearer ${s.user.token}` }
      });
      fs.unlinkSync(photoPath);
    } else {
      await api.post('/listings', { title, type, description, category, location, phone }, {
        headers: { 'Authorization': `Bearer ${s.user.token}` }
      });
    }
    
    setSession(chatId, { state: 'idle', data: {} });
    await bot.sendMessage(chatId, '✅ Объявление создано!', mainKeyboard);
  } catch (err) {
    console.error('❌ Ошибка создания:', err.response?.data || err.message);
    await bot.sendMessage(chatId, '❌ Ошибка при создании объявления', mainKeyboard);
  }
}

// Загружаем сохранённые сессии перед запуском
loadSessions();

console.log('🤖 Бот запущен');