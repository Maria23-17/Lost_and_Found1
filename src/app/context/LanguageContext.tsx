
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ru' | 'uz' | 'en';

interface Translations {
  [key: string]: {
    ru: string;
    uz: string;
    en: string;
  };
}

const translations: Translations = {
  // Header
  home: { ru: 'Главная', uz: 'Bosh sahifa', en: 'Home' },
  howItWorks: { ru: 'Как это работает', uz: 'Qanday ishlaydi', en: 'How It Works' },
  login: { ru: 'Войти', uz: 'Kirish', en: 'Login' },
  register : { ru: 'Регистрация', uz: 'Ro\'yhatdan o\'tish', en: 'Register' },
  admin: { ru: 'Админ', uz: 'Admin', en: 'Admin' },
  
  // Home page
  siteName: { ru: 'Lost & Found — Бюро находок', uz: 'Lost & Found — Topilmalar byurosi', en: 'Lost & Found Bureau' },
  searchPlaceholder: { ru: 'Поиск потерянных вещей...', uz: 'Yo\'qolgan narsalarni qidirish...', en: 'Search lost items...' },
  slogan: { ru: 'Помогаем находить потерянное и возвращать найденное', uz: 'Yo\'qolganlarni topishga, topilganlarni qaytarishga yordam beramiz', en: 'Helping you find lost items and return found ones' },
  iLost: { ru: 'Я потерял', uz: 'Men yo\'qotdim', en: 'I Lost' },
  iFound: { ru: 'Я нашёл', uz: 'Men topdim', en: 'I Found' },
  latestListings: { ru: 'Последние объявления', uz: 'Oxirgi e\'lonlar', en: 'Latest Listings' },
  viewAll: { ru: 'Посмотреть все', uz: 'Hammasini ko\'rish', en: 'View All' },
  all: { ru: 'Все', uz: 'Hammasi', en: 'All' },
  showAll: { ru: 'Показать все', uz: 'Hammasini ko\'rsatish', en: 'Show All' },
  showLost: { ru: 'Потерянные', uz: 'Yo\'qolganlar', en: 'Lost' },
  showFound: { ru: 'Найденные', uz: 'Topilganlar', en: 'Found' },
  contact: { ru: 'Связаться', uz: 'Bog\'lanish', en: 'Contact' },
  howItWorksTitle: { ru: 'Как это работает', uz: 'Qanday ishlaydi', en: 'How It Works' },
  step1Title: { ru: 'Разместите объявление', uz: 'E\'lon joylashtiring', en: 'Post a Listing' },
  step1Desc: { ru: 'Опишите потерянную или найденную вещь', uz: 'Yo\'qolgan yoki topilgan narsani tasvirlab bering', en: 'Describe your lost or found item' },
  step1Details: { ru: 'Укажите категорию вещи, опишите её внешний вид, добавьте фотографию и место, где вы её потеряли или нашли. Чем подробнее описание, тем выше шанс найти владельца или вашу вещь.', uz: 'Narsa kategoriyasini ko\'rsating, tashqi ko\'rinishini tasvirlab bering, rasm va qayerda yo\'qotganingiz yoki topganingiz joyini qo\'shing. Tavsif qanchalik batafsil bo\'lsa, egasini yoki narsangizni topish imkoniyati shunchalik yuqori.', en: 'Specify the item category, describe its appearance, add a photo and the location where you lost or found it. The more detailed the description, the higher the chance of finding the owner or your item.' },
  step2Title: { ru: 'Получите уведомление', uz: 'Xabarnoma oling', en: 'Get Notified' },
  step2Desc: { ru: 'Мы найдём совпадения и уведомим вас', uz: 'Biz mos keladiganlarni topamiz va sizga xabar beramiz', en: 'We\'ll find matches and notify you' },
  step2Details: { ru: 'Наша система автоматически ищет совпадения между потерянными и найденными вещами. Если находится подходящее объявление, мы отправим вам уведомление на email или в Telegram.', uz: 'Bizning tizimimiz yo\'qolgan va topilgan narsalar o\'rtasida avtomatik ravishda mos keladiganlarni qidiradi. Agar mos e\'lon topilsa, sizga email yoki Telegram orqali xabarnoma yuboramiz.', en: 'Our system automatically searches for matches between lost and found items. If a suitable listing is found, we will send you a notification via email or Telegram.' },
  step3Title: { ru: 'Верните вещь владельцу', uz: 'Narsani egasiga qaytaring', en: 'Return the Item' },
  step3Desc: { ru: 'Свяжитесь и договоритесь о встрече', uz: 'Bog\'laning va uchrashuvni kelishing', en: 'Connect and arrange a meetup' },
  step3Details: { ru: 'Свяжитесь с человеком, который нашёл или потерял вещь. Договоритесь о встрече в безопасном общественном месте. Проверьте вещь и убедитесь, что это именно то, что вы искали.', uz: 'Narsani topgan yoki yo\'qotgan odam bilan bog\'laning. Xavfsiz jamoat joyida uchrashuvni kelishing. Narsani tekshiring va bu siz qidirayotgan narsa ekanligiga ishonch hosil qiling.', en: 'Contact the person who found or lost the item. Arrange a meeting in a safe public place. Check the item and make sure it\'s what you were looking for.' },
  telegramBotTitle: { ru: 'Используйте наш Telegram бот', uz: 'Telegram botimizdan foydalaning', en: 'Use Our Telegram Bot' },
  telegramBotDesc: { ru: 'Удобное управление объявлениями прямо из Telegram', uz: 'Telegram orqali qulay e\'lonlarni boshqarish', en: 'Manage listings conveniently from Telegram' },
  goToBot: { ru: 'Перейти в бот', uz: 'Botga o\'tish', en: 'Go to Bot' },
  sendListing: { ru: 'Отправить объявление', uz: 'E\'lon yuborish', en: 'Send Listing' },
  mapTitle: { ru: 'Места находок', uz: 'Topilmalar joylari', en: 'Found Locations' },
  howItWorksSubtitle: { ru: 'Всего три простых шага, чтобы найти потерянное или вернуть найденное', uz: 'Yo\'qolgan narsani topish yoki topilgan narsani qaytarish uchun atigi uchta oddiy qadam', en: 'Just three simple steps to find lost items or return found ones' },
  readyToStart: { ru: 'Готовы начать?', uz: 'Boshlashga tayyormisiz?', en: 'Ready to Start?' },
  readyToStartDesc: { ru: 'Разместите объявление прямо сейчас и увеличьте шансы найти потерянное', uz: 'Hoziroq e\'lon joylashtiring va yo\'qolgan narsani topish imkoniyatini oshiring', en: 'Post a listing right now and increase your chances of finding what\'s lost' },
  step1: { ru: 'Шаг 1', uz: '1-qadam', en: 'Step 1' },
  step2: { ru: 'Шаг 2', uz: '2-qadam', en: 'Step 2' },
  step3: { ru: 'Шаг 3', uz: '3-qadam', en: 'Step 3' },
  
  // Listing Detail page
back: { ru: 'Назад', uz: 'Orqaga', en: 'Back' },
description: { ru: 'Описание', uz: 'Tavsif', en: 'Description' },
location: { ru: 'Место', uz: 'Joy', en: 'Location' },
date: { ru: 'Дата', uz: 'Sana', en: 'Date' },
showPhone: { ru: 'Показать номер телефона', uz: 'Telefon raqamini ko\'rsatish', en: 'Show phone number' },
phoneNotSpecified: { ru: 'Телефон не указан', uz: 'Telefon ko\'rsatilmagan', en: 'Phone not specified' },
safetyWarning: { ru: 'Будьте осторожны при сделке. Не переводите предоплату.', uz: 'Bitimda ehtiyot bo\'ling. Oldindan to\'lov qilmang.', en: 'Be careful when making a deal. Do not prepay.' },
report: { ru: 'Пожаловаться', uz: 'Shikoyat qilish', en: 'Report' },
reportReason: { ru: 'Причина жалобы:', uz: 'Shikoyat sababi:', en: 'Reason for report:' },
selectReason: { ru: 'Выберите причину', uz: 'Sababni tanlang', en: 'Select a reason' },
reportSpam: { ru: 'Спам или реклама', uz: 'Spam yoki reklama', en: 'Spam or advertising' },
reportFraud: { ru: 'Мошенничество', uz: 'Firibgarlik', en: 'Fraud' },
reportFake: { ru: 'Фальшивое объявление', uz: 'Soxta e\'lon', en: 'Fake listing' },
reportWrongCategory: { ru: 'Неверная категория', uz: 'Noto\'g\'ri kategoriya', en: 'Wrong category' },
reportDuplicate: { ru: 'Дубликат объявления', uz: 'E\'lon dublikati', en: 'Duplicate listing' },
reportInsult: { ru: 'Оскорбления или грубость', uz: 'Haqorat yoki qo\'pollik', en: 'Insults or rudeness' },
reportOther: { ru: 'Другое', uz: 'Boshqa', en: 'Other' },
writeReason: { ru: 'Напишите причину жалобы...', uz: 'Shikoyat sababini yozing...', en: 'Write the reason for the report...' },
send: { ru: 'Отправить', uz: 'Yuborish', en: 'Send' },
listingNotFound: { ru: 'Объявление не найдено', uz: 'E\'lon topilmadi', en: 'Listing not found' },
backToHome: { ru: 'Вернуться на главную', uz: 'Bosh sahifaga qaytish', en: 'Back to home' },
reportSuccess: { ru: '📢 Жалоба отправлена! Администратор проверит объявление.', uz: '📢 Shikoyat yuborildi! Administrator e\'lonni tekshiradi.', en: '📢 Report sent! The administrator will check the listing.' },
reportError: { ru: '❌ Ошибка при отправке жалобы', uz: '❌ Shikoyat yuborishda xatolik', en: '❌ Error sending report' },
loginToSeeContacts: { ru: '🔒 Войдите в аккаунт, чтобы увидеть контакты', uz: '🔒 Kontaktlarni ko\'rish uchun hisobingizga kiring', en: '🔒 Log in to see contacts' },


  // Submit Listing page
  submitListingTitle: { ru: 'Разместить объявление', uz: 'E\'lon joylashtirish', en: 'Submit Listing' },
  listingType: { ru: 'Тип объявления', uz: 'E\'lon turi', en: 'Listing Type' },
  lost: { ru: 'Утеряно', uz: 'Yo\'qolgan', en: 'Lost' },
  found: { ru: 'Найдено', uz: 'Topilgan', en: 'Found' },
  category: { ru: 'Категория', uz: 'Kategoriya', en: 'Category' },
  selectCategory: { ru: 'Выберите категорию', uz: 'Kategoriyani tanlang', en: 'Select Category' },
  documents: { ru: 'Документы', uz: 'Hujjatlar', en: 'Documents' },
  electronics: { ru: 'Электроника', uz: 'Elektronika', en: 'Electronics' },
  clothing: { ru: 'Одежда', uz: 'Kiyim', en: 'Clothing' },
  accessories: { ru: 'Аксессуары', uz: 'Aksessuarlar', en: 'Accessories' },
  pets: { ru: 'Животные', uz: 'Hayvonlar', en: 'Pets' },
  other: { ru: 'Другое', uz: 'Boshqa', en: 'Other' },
  title: { ru: 'Название', uz: 'Nomi', en: 'Title' },
  titlePlaceholder: { ru: 'Краткое описание вещи', uz: 'Narsaning qisqacha tavsifi', en: 'Brief description of item' },
  descriptionPlaceholder: { ru: 'Подробное описание...', uz: 'Batafsil tavsif...', en: 'Detailed description...' },
  locationPlaceholder: { ru: 'Где потеряли/нашли', uz: 'Qayerda yo\'qotdingiz/topdingiz', en: 'Where lost/found' },
  phone: { ru: 'Телефон', uz: 'Telefon', en: 'Phone' },
  phonePlaceholder: { ru: '+998 XX XXX XX XX', uz: '+998 XX XXX XX XX', en: '+998 XX XXX XX XX' },
  uploadPhoto: { ru: 'Загрузить фото', uz: 'Rasm yuklash', en: 'Upload Photo' },
  submitButton: { ru: 'Разместить объявление', uz: 'E\'lon joylashtirish', en: 'Submit Listing' },
  
  // Login page
  loginTitle: { ru: 'Вход в систему', uz: 'Tizimga kirish', en: 'Login' },
  loginSubtitle: { ru: 'Войдите, чтобы управлять объявлениями', uz: 'E\'lonlarni boshqarish uchun kiring', en: 'Login to manage your listings' },
  emailOrPhone: { ru: 'Email или телефон', uz: 'Email yoki telefon', en: 'Email or Phone' },
  password: { ru: 'Пароль', uz: 'Parol', en: 'Password' },
  loginButton: { ru: 'Войти', uz: 'Kirish', en: 'Login' },
  loginWithTelegram: { ru: 'Войти через Telegram', uz: 'Telegram orqali kirish', en: 'Login with Telegram' },
  loginWithGoogle: { ru: 'Войти через Google', uz: 'Google orqali kirish', en: 'Login with Google' },
  forgotPassword: { ru: 'Забыли пароль?', uz: 'Parolni unutdingizmi?', en: 'Forgot password?' },
  orContinueWith: { ru: 'Или продолжить с помощью', uz: 'Yoki davom ettiring', en: 'Or continue with' },
  noAссount: { ru: 'Нет аккаунта?', uz: 'Hisobingiz yo\'qmi?', en: 'Don\'t have an account?' },
  registerLink : { ru: 'Регистрация', uz: 'Ro\'yhatdan o\'tish', en: 'Register' },

  // Register page 
  registerTitle: { ru: 'Создать аккаунт', uz: 'Hisob yaratish', en: 'Create Account' },
  registerSubtitle: { ru: 'Заполните данные для регистрации', uz: 'Ro\'yhatdan o\'tish uchun ma\'lumotlarni to\'ldiring', en: 'Fill in the details to register' },
  fullName: { ru: 'Полное имя', uz: 'To\'liq ism', en: 'Full Name' },
  emailOrPhone2: { ru: 'Email или телефон', uz: 'Email yoki telefon', en: 'Email or Phone' },
  password2: { ru: 'Пароль', uz: 'Parol', en: 'Password' },
  confirmPassword: { ru: 'Подтвердите пароль', uz: 'Parolni tasdiqlang', en: 'Confirm Password' },
  registerButton: { ru: 'Зарегистрироваться', uz: 'Ro\'yhatdan o\'tish', en: 'Register' },
  alreadyHaveAccount: { ru: 'Уже есть аккаунт?', uz: 'Hisobingiz bormi?', en: 'Already have an account?' },
  loginLink: { ru: ' Войти', uz: 'Kirish', en: ' Login' },
  orRegisterWith: { ru: 'Или зарегистрироваться с помощью', uz: 'Yoki yordamida ro\'yhatdan o\'tish', en: 'Or register with' },
  haveAccount: { ru: 'Уже есть аккаунт?', uz: 'Hisobingiz bormi?', en: 'Already have an account?' },
  name: { ru: 'Полное Имя', uz: 'To\'liq Ism', en: 'Full Name' },
  email: { ru: 'Email', uz: 'Email', en: 'Email' },

  footerAboutText: { ru: 'Сервис для поиска потерянных вещей и возврата найденного владельцам', uz: 'Yo\'qolgan narsalarni qidirish va topilgan narsalarni egalariga qaytarish xizmati', en: 'Service for finding lost items and returning found items to their owners' },
  quickLinks: { ru: 'Быстрые ссылки', uz: 'Tezkor havolalar', en: 'Quick Links' },
  contacts: { ru: 'Контакты', uz: 'Kontaktlar', en: 'Contacts' },
  
  // Admin panel
adminPanel: { ru: 'Админ панель', uz: 'Admin panel', en: 'Admin Panel' },
dashboard: { ru: 'Дашборд', uz: 'Dashboard', en: 'Dashboard' },
listings: { ru: 'Объявления', uz: 'E\'lonlar', en: 'Listings' },
users: { ru: 'Пользователи', uz: 'Foydalanuvchilar', en: 'Users' },
reports: { ru: 'Жалобы', uz: 'Shikoyatlar', en: 'Reports' },
settings: { ru: 'Настройки', uz: 'Sozlamalar', en: 'Settings' },
totalListings: { ru: 'Всего объявлений', uz: 'Jami e\'lonlar', en: 'Total Listings' },
totalUsers: { ru: 'Всего пользователей', uz: 'Jami foydalanuvchilar', en: 'Total Users' },
activeListings: { ru: 'Активные объявления', uz: 'Faol e\'lonlar', en: 'Active Listings' },
resolvedCases: { ru: 'Решено', uz: 'Hal qilingan', en: 'Resolved' },
recentListings: { ru: 'Недавние объявления', uz: 'So\'nggi e\'lonlar', en: 'Recent Listings' },
photo: { ru: 'Фото', uz: 'Rasm', en: 'Photo' },
type: { ru: 'Тип', uz: 'Tur', en: 'Type' },
status: { ru: 'Статус', uz: 'Holat', en: 'Status' },
actions: { ru: 'Действия', uz: 'Amallar', en: 'Actions' },
loading: { ru: 'Загрузка...', uz: 'Yuklanmoqda...', en: 'Loading...' },
pending: { ru: 'На модерации', uz: 'Moderatsiyada', en: 'Pending' },
active: { ru: 'Активно', uz: 'Faol', en: 'Active' },
closed: { ru: 'Закрыто', uz: 'Yopilgan', en: 'Closed' },
allListings: { ru: 'Все объявления', uz: 'Barcha e\'lonlar', en: 'All Listings' },
author: { ru: 'Автор', uz: 'Muallif', en: 'Author' },
role: { ru: 'Роль', uz: 'Rol', en: 'Role' },
user: { ru: 'Пользователь', uz: 'Foydalanuvchi', en: 'User' },
moderator: { ru: 'Модератор', uz: 'Moderator', en: 'Moderator' },
banned: { ru: 'Заблокирован', uz: 'Bloklangan', en: 'Banned' },
activeStatus: { ru: 'Активен', uz: 'Faol', en: 'Active' },
listingsCount: { ru: 'Объявлений', uz: 'E\'lonlar soni', en: 'Listings' },
unban: { ru: 'Разблокировать', uz: 'Blokdan chiqarish', en: 'Unban' },
ban: { ru: 'Заблокировать', uz: 'Bloklash', en: 'Ban' },
listing: { ru: 'Объявление', uz: 'E\'lon', en: 'Listing' },
reportedBy: { ru: 'Пожаловался', uz: 'Shikoyat qilgan', en: 'Reported by' },
reason: { ru: 'Причина', uz: 'Sabab', en: 'Reason' },
noReports: { ru: 'Нет жалоб', uz: 'Shikoyatlar yo\'q', en: 'No reports' },
pendingReport: { ru: 'На рассмотрении', uz: 'Ko\'rib chiqilmoqda', en: 'Pending' },
reviewed: { ru: 'Просмотрено', uz: 'Ko\'rilgan', en: 'Reviewed' },
resolved: { ru: 'Решено', uz: 'Hal qilingan', en: 'Resolved' },
confirmDelete: { ru: 'Удалить объявление?', uz: 'E\'lonni o\'chirish?', en: 'Delete listing?' },
settingsInDevelopment: { ru: 'Настройки в разработке', uz: 'Sozlamalar ishlab chiqilmoqda', en: 'Settings in development' },
approve: { ru: 'Одобрить', uz: 'Tasdiqlash', en: 'Approve' },
delete: { ru: 'Удалить', uz: 'O\'chirish', en: 'Delete' },
 
//MyListnings
// Добавьте эти ключи в объект translations
myListings: { ru: 'Мои объявления', uz: 'Mening e\'lonlarim', en: 'My Listings' },
manageListings: { ru: 'Управляйте своими объявлениями', uz: 'E\'lonlaringizni boshqaring', en: 'Manage your listings' },
createListing: { ru: 'Создать объявление', uz: 'E\'lon yaratish', en: 'Create Listing' },
noListings: { ru: 'У вас пока нет объявлений', uz: 'Sizda hali e\'lonlar yo\'q', en: 'You have no listings yet' },
foundButton: { ru: 'Найдено', uz: 'Topildi', en: 'Found' },
resolvedSuccess: { ru: '✅ Отлично! Объявление закрыто', uz: '✅ Ajoyib! E\'lon yopildi', en: '✅ Great! Listing closed' },
resolveError: { ru: '❌ Ошибка при закрытии', uz: '❌ Yopishda xatolik', en: '❌ Error closing' },
deleteSuccess: { ru: '🗑️ Объявление удалено', uz: '🗑️ E\'lon o\'chirildi', en: '🗑️ Listing deleted' },
deleteError: { ru: '❌ Ошибка при удалении', uz: '❌ O\'chirishda xatolik', en: '❌ Error deleting' },
confirmDeleteTitle: { ru: 'Удалить объявление?', uz: 'E\'lonni o\'chirish?', en: 'Delete listing?' },
confirmDeleteDesc: { ru: 'Вы уверены? Это действие нельзя отменить.', uz: 'Ishonchingiz komilmi? Bu amalni bekor qilib bo\'lmaydi.', en: 'Are you sure? This action cannot be undone.' },
cancel: { ru: 'Отмена', uz: 'Bekor qilish', en: 'Cancel' },
pendingMessage: { ru: '⏳ Объявление на модерации. После проверки оно появится на сайте.', uz: '⏳ E\'lon moderatsiyada. Tekshiruvdan so\'ng saytda paydo bo\'ladi.', en: '⏳ Listing is being moderated. It will appear on the site after review.' },
closedMessage: { ru: '✅ Проблема решена! Объявление закрыто.', uz: '✅ Muammo hal qilindi! E\'lon yopildi.', en: '✅ Problem solved! Listing closed.' },

// Common
  viewAll2: { ru: 'Смотреть все', uz: 'Hammasini ko\'rish', en: 'View All' },
  contact2: { ru: 'Связаться', uz: 'Bog\'lanish', en: 'Contact' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};