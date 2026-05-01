import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { t } from './i18n.js';
import {
  getLanguageKeyboard,
  getMainMenuKeyboard,
  getCancelKeyboard,
  getSkipKeyboard,
  getListingTypeKeyboard,
  getCategoryKeyboard,
  getMyListingsActions,
  getStatusKeyboard,
  getPaginationKeyboard,
  getNotificationActions,
  getSettingsKeyboard,
  getSearchResultsKeyboard
} from './keyboards.js';

// ===================== CONFIG =====================
const BOT_TOKEN = process.env.BOT_TOKEN || '8205347181:AAE9QirHfP42pgJU5ibRUQKAhGq4GaKlhy0';
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// In-memory sessions (telegram_id -> { state, data, lang, user })
const sessions = new Map();

// ===================== HELPERS =====================
const api = axios.create({ baseURL: API_URL });

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { state: 'idle', data: {}, lang: 'ru' });
  }
  return sessions.get(chatId);
}

function setSession(chatId, updates) {
  const current = getSession(chatId);
  sessions.set(chatId, { ...current, ...updates });
}

function resetSession(chatId) {
  const s = getSession(chatId);
  sessions.set(chatId, { state: 'idle', data: {}, lang: s.lang, user: s.user });
}

async function downloadPhoto(fileId) {
  try {
    const fileLink = await bot.getFileLink(fileId);
    const response = await axios.get(fileLink, { responseType: 'stream' });
    const filename = `${Date.now()}.jpg`;
    const filepath = path.join(UPLOADS_DIR, filename);
    
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    return { filepath, filename };
  } catch (err) {
    console.error('Download photo error:', err.message);
    return null;
  }
}

async function sendListingCard(chatId, listing, lang, extra = {}) {
  const typeEmoji = listing.type === 'lost' ? '😞' : '🙂';
  const typeText = t('listing_type_' + listing.type, lang);
  const statusText = t('status_' + (listing.status || 'active'), lang);
  const categoryText = t('category_' + listing.category, lang);
  
  const text = `
${typeEmoji} <b>${listing.title}</b>
├ <b>${t('listing_type_lost', lang)}:</b> ${typeText}
├ <b>${t('category_documents', lang).split(' ')[0]}:</b> ${categoryText}
├ <b>${t('status_active', lang)}:</b> ${statusText}
├ <b>${t('location', lang)}:</b> ${listing.location}
├ <b>${t('phone_label', lang)}:</b> ${listing.phone}
└ <b>${t('enter_description', lang).split(':')[0]}:</b> ${listing.description}

📅 ${new Date(listing.created_at || listing.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US')}
  `;
  
  const imageUrl = listing.image ? (listing.image.startsWith('http') ? listing.image : `http://localhost:5000${listing.image}`) : null;
  
  if (imageUrl) {
    await bot.sendPhoto(chatId, imageUrl, { 
      caption: text, 
      parse_mode: 'HTML',
      ...extra
    });
  } else {
    await bot.sendMessage(chatId, text, { 
      parse_mode: 'HTML',
      ...extra
    });
  }
}

// ===================== AUTH FLOW =====================
async function startAuth(chatId, mode) {
  const s = getSession(chatId);
  if (mode === 'link') {
    setSession(chatId, { state: 'waiting_email_link', data: { ...s.data, link_mode: true } });
    await bot.sendMessage(chatId, t('enter_email', s.lang), getCancelKeyboard(s.lang));
  } else {
    setSession(chatId, { state: 'waiting_email_register', data: {} });
    await bot.sendMessage(chatId, t('enter_email', s.lang), getCancelKeyboard(s.lang));
  }
}

// ===================== LISTING CREATION FLOW =====================
async function startCreateListing(chatId) {
  const s = getSession(chatId);
  if (!s.user) {
    await bot.sendMessage(chatId, t('login_or_register', s.lang), getCancelKeyboard(s.lang));
    setSession(chatId, { state: 'auth_required', data: { next: 'create_listing' } });
    return;
  }
  setSession(chatId, { state: 'waiting_listing_type', data: {} });
  await bot.sendMessage(chatId, t('select_type', s.lang), getListingTypeKeyboard(s.lang));
}

// ===================== COMMAND HANDLERS =====================

// /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const s = getSession(chatId);
  
  if (s.user) {
    await bot.sendMessage(chatId, t('main_menu', s.lang), getMainMenuKeyboard(s.lang));
  } else {
    await bot.sendMessage(chatId, t('welcome', s.lang), getLanguageKeyboard());
  }
});

// /menu
bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  const s = getSession(chatId);
  await bot.sendMessage(chatId, t('main_menu', s.lang), getMainMenuKeyboard(s.lang));
});

// /language
bot.onText(/\/language/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, t('welcome', 'ru'), getLanguageKeyboard());
});

// ===================== CALLBACK QUERY HANDLERS =====================
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const s = getSession(chatId);
  
  try {
    // Language selection
    if (data.startsWith('lang_')) {
      const lang = data.split('_')[1];
      setSession(chatId, { lang });
      await bot.answerCallbackQuery(query.id, t('language_set', lang));
      await bot.deleteMessage(chatId, query.message.message_id);
      
      if (!s.user) {
        await bot.sendMessage(chatId, t('login_or_register', lang));
        await startAuth(chatId, 'link');
      } else {
        await bot.sendMessage(chatId, t('main_menu', lang), getMainMenuKeyboard(lang));
      }
      return;
    }
    
    // Settings -> Language
    if (data === 'settings_lang') {
      await bot.editMessageText(t('welcome', s.lang), {
        chat_id: chatId,
        message_id: query.message.message_id,
        ...getLanguageKeyboard()
      });
      return;
    }
    
    // Main menu
    if (data === 'main_menu') {
      resetSession(chatId);
      await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
      await bot.sendMessage(chatId, t('main_menu', s.lang), getMainMenuKeyboard(s.lang));
      return;
    }
    
    // Logout
    if (data === 'logout') {
      sessions.set(chatId, { state: 'idle', data: {}, lang: s.lang });
      await bot.answerCallbackQuery(query.id, 'Logged out');
      await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
      await bot.sendMessage(chatId, t('welcome', s.lang), getLanguageKeyboard());
      return;
    }
    
    // Listing type selection
    if (data.startsWith('type_')) {
      const type = data.split('_')[1];
      setSession(chatId, { 
        state: 'waiting_category', 
        data: { ...s.data, type } 
      });
      await bot.answerCallbackQuery(query.id);
      await bot.editMessageText(t('select_category', s.lang), {
        chat_id: chatId,
        message_id: query.message.message_id,
        ...getCategoryKeyboard(s.lang)
      });
      return;
    }
    
    // Category selection
    if (data.startsWith('cat_')) {
      const category = data.split('_')[1];
      setSession(chatId, { 
        state: 'waiting_title', 
        data: { ...s.data, category } 
      });
      await bot.answerCallbackQuery(query.id);
      await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
      await bot.sendMessage(chatId, t('enter_title', s.lang), getCancelKeyboard(s.lang));
      return;
    }
    
    // Cancel creation
    if (data === 'cancel_create') {
      resetSession(chatId);
      await bot.answerCallbackQuery(query.id, t('cancel', s.lang));
      await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
      await bot.sendMessage(chatId, t('main_menu', s.lang), getMainMenuKeyboard(s.lang));
      return;
    }
    
    // My listings pagination
    if (data.startsWith('mylist_page_')) {
      const page = parseInt(data.split('_')[2]);
      await bot.answerCallbackQuery(query.id);
      await showMyListings(chatId, page);
      return;
    }
    
    // Search results pagination
    if (data.startsWith('search_page_')) {
      const page = parseInt(data.split('_')[2]);
      await bot.answerCallbackQuery(query.id);
      await showSearchResults(chatId, page);
      return;
    }
    
    // View listing details from my listings
    if (data.startsWith('listing_')) {
      const listingId = data.split('_')[1];
      await bot.answerCallbackQuery(query.id);
      await showListingDetail(chatId, listingId, true);
      return;
    }
    
    // Status change
    if (data.startsWith('status_') && !data.startsWith('status_active') && !data.startsWith('status_resolved') && !data.startsWith('status_closed') && !data.startsWith('setstatus_')) {
      const listingId = data.split('_')[1];
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, t('change_status', s.lang), getStatusKeyboard(listingId, s.lang));
      return;
    }
    
    // Set status
    if (data.startsWith('setstatus_')) {
      const parts = data.split('_');
      const listingId = parts[1];
      const newStatus = parts[2];
      try {
        await api.patch(`/listings/${listingId}/status`, { status: newStatus }, {
          headers: { 'Authorization': `Bearer ${s.user.token}` }
        });
        await bot.answerCallbackQuery(query.id, t('success', s.lang));
        await bot.sendMessage(chatId, `✅ ${t('status_' + newStatus, s.lang)}`, getMainMenuKeyboard(s.lang));
      } catch (err) {
        await bot.answerCallbackQuery(query.id, t('error', s.lang));
      }
      return;
    }
    
    // Delete listing
    if (data.startsWith('delete_')) {
      const listingId = data.split('_')[1];
      try {
        await api.delete(`/listings/${listingId}`, {
          headers: { 'Authorization': `Bearer ${s.user.token}` }
        });
        await bot.answerCallbackQuery(query.id, t('listing_deleted', s.lang));
        await bot.sendMessage(chatId, t('listing_deleted', s.lang), getMainMenuKeyboard(s.lang));
      } catch (err) {
        await bot.answerCallbackQuery(query.id, t('error', s.lang));
      }
      return;
    }
    
    // View comments
    if (data.startsWith('comments_')) {
      const listingId = data.split('_')[1];
      await bot.answerCallbackQuery(query.id);
      await showComments(chatId, listingId);
      return;
    }
    
    // Add comment
    if (data.startsWith('addcomment_')) {
      const listingId = data.split('_')[1];
      setSession(chatId, { state: 'waiting_comment', data: { ...s.data, comment_listing_id: listingId } });
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, t('enter_comment', s.lang), getCancelKeyboard(s.lang));
      return;
    }
    
    // Read notification
    if (data.startsWith('readnotif_')) {
      const notifId = data.split('_')[1];
      try {
        await api.patch(`/notifications/${notifId}/read`, {}, {
          headers: { 'Authorization': `Bearer ${s.user.token}` }
        });
        await bot.answerCallbackQuery(query.id, '✅');
      } catch (err) {
        await bot.answerCallbackQuery(query.id, t('error', s.lang));
      }
      return;
    }
    
    // Read all notifications
    if (data === 'readall_notif') {
      try {
        await api.patch('/notifications/read-all', {}, {
          headers: { 'Authorization': `Bearer ${s.user.token}` }
        });
        await bot.answerCallbackQuery(query.id, '✅');
      } catch (err) {
        await bot.answerCallbackQuery(query.id, t('error', s.lang));
      }
      return;
    }
    
    // Noop
    if (data === 'noop') {
      await bot.answerCallbackQuery(query.id);
      return;
    }
    
  } catch (err) {
    console.error('Callback query error:', err);
    await bot.answerCallbackQuery(query.id, t('error', s.lang));
  }
});

// ===================== TEXT MESSAGE HANDLERS =====================
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const s = getSession(chatId);
  
  // Ignore commands
  if (text && text.startsWith('/')) return;
  
  try {
    // === CANCEL ===
    if (text === t('cancel', s.lang)) {
      resetSession(chatId);
      await bot.sendMessage(chatId, t('main_menu', s.lang), getMainMenuKeyboard(s.lang));
      return;
    }
    
    // === MAIN MENU BUTTONS ===
    if (text === t('create_listing', s.lang)) {
      await startCreateListing(chatId);
      return;
    }
    
    if (text === t('my_listings', s.lang)) {
      if (!s.user) {
        await bot.sendMessage(chatId, t('login_or_register', s.lang));
        await startAuth(chatId, 'link');
        return;
      }
      await showMyListings(chatId, 0);
      return;
    }
    
    if (text === t('find_listings', s.lang)) {
      setSession(chatId, { state: 'waiting_search', data: {} });
      await bot.sendMessage(chatId, t('search_prompt', s.lang), getCancelKeyboard(s.lang));
      return;
    }
    
    if (text === t('notifications', s.lang)) {
      if (!s.user) {
        await bot.sendMessage(chatId, t('login_or_register', s.lang));
        await startAuth(chatId, 'link');
        return;
      }
      await showNotifications(chatId);
      return;
    }
    
    if (text === t('profile', s.lang)) {
      if (!s.user) {
        await bot.sendMessage(chatId, t('login_or_register', s.lang));
        await startAuth(chatId, 'link');
        return;
      }
      await showProfile(chatId);
      return;
    }
    
    if (text === t('settings', s.lang)) {
      await bot.sendMessage(chatId, t('settings', s.lang), getSettingsKeyboard(s.lang));
      return;
    }
    
    // === AUTH STATES ===
    if (s.state === 'waiting_email_register' || s.state === 'waiting_email_link') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        await bot.sendMessage(chatId, t('invalid_email', s.lang), getCancelKeyboard(s.lang));
        return;
      }
      
      if (s.state === 'waiting_email_link') {
        // Check if user exists
        try {
          const { data: users } = await api.get(`/search?query=${encodeURIComponent(text)}`); // not ideal, let's try login first
          // Actually, we should try to find by email - but API doesn't have direct email lookup
          // For simplicity, proceed to password
          setSession(chatId, { state: 'waiting_password_link', data: { ...s.data, email: text } });
          await bot.sendMessage(chatId, t('enter_password_for_link', s.lang), getCancelKeyboard(s.lang));
        } catch (err) {
          setSession(chatId, { state: 'waiting_name_register', data: { ...s.data, email: text, new_account: true } });
          await bot.sendMessage(chatId, t('enter_name', s.lang), getCancelKeyboard(s.lang));
        }
      } else {
        setSession(chatId, { state: 'waiting_password_register', data: { ...s.data, email: text } });
        await bot.sendMessage(chatId, t('enter_password', s.lang), getCancelKeyboard(s.lang));
      }
      return;
    }
    
    if (s.state === 'waiting_password_register') {
      if (text.length < 6) {
        await bot.sendMessage(chatId, t('password_short', s.lang), getCancelKeyboard(s.lang));
        return;
      }
      setSession(chatId, { state: 'waiting_name_register', data: { ...s.data, password: text } });
      await bot.sendMessage(chatId, t('enter_name', s.lang), getCancelKeyboard(s.lang));
      return;
    }
    
    if (s.state === 'waiting_name_register') {
      const { email, password, new_account } = s.data;
      const name = text;
      
      if (new_account || !email) {
        // New registration
        try {
          await api.post('/auth/register', {
            email: s.data.email,
            password: s.data.password,
            name,
            telegram_id: msg.from.id,
            language: s.lang
          });
          
          // Auto login
          const { data: loginData } = await api.post('/auth/login', {
            email: s.data.email,
            password: s.data.password
          });
          
          setSession(chatId, { user: { ...loginData.user, token: loginData.token } });
          await bot.sendMessage(chatId, `${t('registration_success', s.lang)}${name}!`, getMainMenuKeyboard(s.lang));
        } catch (err) {
          const errorMsg = err.response?.data?.error || t('error', s.lang);
          await bot.sendMessage(chatId, errorMsg, getMainMenuKeyboard(s.lang));
        }
      } else {
        // Link mode - name provided but we need to check if account exists
        setSession(chatId, { state: 'waiting_password_link', data: { ...s.data, name } });
        await bot.sendMessage(chatId, t('enter_password_for_link', s.lang), getCancelKeyboard(s.lang));
      }
      return;
    }
    
    if (s.state === 'waiting_password_link') {
      const { email, name } = s.data;
      try {
        // Try login first
        const { data: loginData } = await api.post('/auth/login', {
          email,
          password: text
        });
        
        // Link telegram
        await api.post('/auth/telegram-link', {
          telegram_id: msg.from.id,
          email,
          password: text,
          language: s.lang
        });
        
        setSession(chatId, { user: { ...loginData.user, token: loginData.token } });
        await bot.sendMessage(chatId, `${t('login_success', s.lang)}${loginData.user.name}!`, getMainMenuKeyboard(s.lang));
      } catch (err) {
        // If login fails, maybe create new account
        if (err.response?.status === 401) {
          await bot.sendMessage(chatId, t('wrong_password', s.lang), getCancelKeyboard(s.lang));
        } else {
          await bot.sendMessage(chatId, t('error', s.lang), getMainMenuKeyboard(s.lang));
        }
      }
      return;
    }
    
    // === LISTING CREATION STATES ===
    if (s.state === 'waiting_title') {
      setSession(chatId, { state: 'waiting_description', data: { ...s.data, title: text } });
      await bot.sendMessage(chatId, t('enter_description', s.lang), getCancelKeyboard(s.lang));
      return;
    }
    
    if (s.state === 'waiting_description') {
      setSession(chatId, { state: 'waiting_location', data: { ...s.data, description: text } });
      await bot.sendMessage(chatId, t('enter_location', s.lang), getCancelKeyboard(s.lang));
      return;
    }
    
    if (s.state === 'waiting_location') {
      setSession(chatId, { state: 'waiting_phone', data: { ...s.data, location: text } });
      await bot.sendMessage(chatId, t('enter_phone', s.lang), getCancelKeyboard(s.lang));
      return;
    }
    
    if (s.state === 'waiting_phone') {
      setSession(chatId, { state: 'waiting_photo', data: { ...s.data, phone: text } });
      await bot.sendMessage(chatId, t('send_photo', s.lang), getSkipKeyboard(s.lang));
      return;
    }
    
    if (s.state === 'waiting_photo') {
      if (text === t('skip', s.lang)) {
        await submitListing(chatId, null);
      }
      return;
    }
    
    // === COMMENT STATE ===
    if (s.state === 'waiting_comment') {
      const listingId = s.data.comment_listing_id;
      try {
        await api.post(`/listings/${listingId}/comments`, { text }, {
          headers: { 'Authorization': `Bearer ${s.user.token}` }
        });
        await bot.sendMessage(chatId, t('comment_added', s.lang), getMainMenuKeyboard(s.lang));
        resetSession(chatId);
      } catch (err) {
        await bot.sendMessage(chatId, t('error', s.lang), getMainMenuKeyboard(s.lang));
      }
      return;
    }
    
    // === SEARCH STATE ===
    if (s.state === 'waiting_search') {
      setSession(chatId, { state: 'search_results', data: { query: text } });
      await showSearchResults(chatId, 0);
      return;
    }
    
    // Default
    if (s.state === 'idle') {
      await bot.sendMessage(chatId, t('main_menu', s.lang), getMainMenuKeyboard(s.lang));
    }
    
  } catch (err) {
    console.error('Message handler error:', err);
    await bot.sendMessage(chatId, t('error', s.lang));
  }
});

// ===================== PHOTO HANDLER =====================
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const s = getSession(chatId);
  
  if (s.state === 'waiting_photo') {
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const photoInfo = await downloadPhoto(fileId);
    if (photoInfo) {
      await submitListing(chatId, photoInfo.filepath);
    } else {
      await bot.sendMessage(chatId, t('error', s.lang), getMainMenuKeyboard(s.lang));
    }
  }
});

// ===================== API FUNCTIONS =====================

async function submitListing(chatId, photoPath) {
  const s = getSession(chatId);
  const { type, category, title, description, location, phone } = s.data;
  
  try {
    let response;
    
    if (photoPath) {
      const form = new FormData();
      form.append('title', title);
      form.append('type', type);
      form.append('description', description);
      form.append('category', category);
      form.append('location', location);
      form.append('phone', phone);
      form.append('user_id', s.user.id);
      form.append('photo', fs.createReadStream(photoPath));
      
      response = await api.post('/listings', form, {
        headers: { 
          ...form.getHeaders(),
          'Authorization': `Bearer ${s.user.token}` 
        }
      });
      
      // Clean up temp file
      fs.unlinkSync(photoPath);
    } else {
      response = await api.post('/listings', {
        title, type, description, category, location, phone, user_id: s.user.id
      }, {
        headers: { 'Authorization': `Bearer ${s.user.token}` }
      });
    }
    
    resetSession(chatId);
    await bot.sendMessage(chatId, t('listing_created', s.lang), getMainMenuKeyboard(s.lang));
  } catch (err) {
    console.error('Submit listing error:', err.response?.data || err.message);
    await bot.sendMessage(chatId, t('error', s.lang), getMainMenuKeyboard(s.lang));
  }
}

async function showMyListings(chatId, page = 0) {
  const s = getSession(chatId);
  const perPage = 5;
  
  try {
    const { data: listings } = await api.get(`/listings?user_id=${s.user.id}`, {
      headers: { 'Authorization': `Bearer ${s.user.token}` }
    });
    
    if (listings.length === 0) {
      await bot.sendMessage(chatId, t('no_listings', s.lang), getMainMenuKeyboard(s.lang));
      return;
    }
    
    const totalPages = Math.ceil(listings.length / perPage);
    const start = page * perPage;
    const pageListings = listings.slice(start, start + perPage);
    
    for (const listing of pageListings) {
      await sendListingCard(chatId, listing, s.lang, getMyListingsActions(listing.id, s.lang));
    }
    
    if (totalPages > 1) {
      await bot.sendMessage(chatId, `${t('page_of', s.lang)} ${page + 1}/${totalPages}`, 
        getPaginationKeyboard(listings, page, perPage, 'mylist', s.lang));
    }
  } catch (err) {
    console.error('Show my listings error:', err.message);
    await bot.sendMessage(chatId, t('error', s.lang), getMainMenuKeyboard(s.lang));
  }
}

async function showSearchResults(chatId, page = 0) {
  const s = getSession(chatId);
  const perPage = 5;
  const query = s.data?.query || '';
  
  try {
    const { data: listings } = await api.get(`/search?query=${encodeURIComponent(query)}`);
    
    if (listings.length === 0) {
      await bot.sendMessage(chatId, t('not_found', s.lang), getMainMenuKeyboard(s.lang));
      return;
    }
    
    const totalPages = Math.ceil(listings.length / perPage);
    const start = page * perPage;
    const pageListings = listings.slice(start, start + perPage);
    
    await bot.sendMessage(chatId, `${t('search_results', s.lang)} (${listings.length}):`);
    
    for (const listing of pageListings) {
      const isOwner = s.user && listing.user_id === s.user.id;
      await sendListingCard(chatId, listing, s.lang, getSearchResultsKeyboard(listing.id, s.lang));
    }
    
    if (totalPages > 1) {
      await bot.sendMessage(chatId, `${t('page_of', s.lang)} ${page + 1}/${totalPages}`, 
        getPaginationKeyboard(listings, page, perPage, 'search', s.lang));
    }
  } catch (err) {
    console.error('Search error:', err.message);
    await bot.sendMessage(chatId, t('error', s.lang), getMainMenuKeyboard(s.lang));
  }
}

async function showListingDetail(chatId, listingId, isOwner = false) {
  const s = getSession(chatId);
  try {
    const { data: listing } = await api.get(`/listings/${listingId}`);
    await sendListingCard(chatId, listing, s.lang, getMyListingsActions(listingId, s.lang));
  } catch (err) {
    await bot.sendMessage(chatId, t('error', s.lang), getMainMenuKeyboard(s.lang));
  }
}

async function showComments(chatId, listingId) {
  const s = getSession(chatId);
  try {
    const { data: comments } = await api.get(`/listings/${listingId}/comments`);
    
    if (comments.length === 0) {
      await bot.sendMessage(chatId, t('no_comments', s.lang), getMainMenuKeyboard(s.lang));
      return;
    }
    
    let text = `💬 ${t('view_comments', s.lang)}:\n\n`;
    comments.forEach((c, i) => {
      text += `${i + 1}. <b>${c.author_name || 'User'}</b>: ${c.text}\n`;
      text += `   <i>${new Date(c.created_at).toLocaleDateString()}</i>\n\n`;
    });
    
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...getMainMenuKeyboard(s.lang) });
  } catch (err) {
    await bot.sendMessage(chatId, t('error', s.lang), getMainMenuKeyboard(s.lang));
  }
}

async function showNotifications(chatId) {
  const s = getSession(chatId);
  try {
    const { data: notifications } = await api.get('/notifications', {
      headers: { 'Authorization': `Bearer ${s.user.token}` }
    });
    
    const unread = notifications.filter(n => !n.is_read);
    
    if (notifications.length === 0) {
      await bot.sendMessage(chatId, t('no_notifications', s.lang), getMainMenuKeyboard(s.lang));
      return;
    }
    
    await bot.sendMessage(chatId, `🔔 ${t('notifications', s.lang)} (${unread.length} ${t('new_notification', s.lang)}):`);
    
    for (const notif of notifications.slice(0, 10)) {
      const text = `${notif.is_read ? '✅' : '🔴'} <b>${notif.type}</b>\n${notif.message}\n<i>${new Date(notif.created_at).toLocaleDateString()}</i>`;
      await bot.sendMessage(chatId, text, { 
        parse_mode: 'HTML', 
        ...getNotificationActions(notif.id, s.lang) 
      });
    }
  } catch (err) {
    console.error('Notifications error:', err.message);
    await bot.sendMessage(chatId, t('error', s.lang), getMainMenuKeyboard(s.lang));
  }
}

async function showProfile(chatId) {
  const s = getSession(chatId);
  try {
    const { data: user } = await api.get('/auth/me', {
      headers: { 'Authorization': `Bearer ${s.user.token}` }
    });
    
    const text = `
👤 <b>${t('profile_info', s.lang)}</b>

${t('name_label', s.lang)}: ${user.name}
${t('email_label', s.lang)}: ${user.email}
${t('phone_label', s.lang)}: ${user.phone || '-'}
${t('role_label', s.lang)}: ${user.role}
    `;
    
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...getMainMenuKeyboard(s.lang) });
  } catch (err) {
    await bot.sendMessage(chatId, t('error', s.lang), getMainMenuKeyboard(s.lang));
  }
}

// ===================== START =====================
console.log('🤖 Telegram bot started!');
console.log('API URL:', API_URL);
