// server/bot/i18n.js
// Мультиязычность для Telegram бота (ru, uz, en)

const translations = {
  // ===== COMMON =====
  welcome: {
    ru: 'Добро пожаловать в Lost & Found! \nВыберите язык / Tilni tanlang / Choose language:',
    uz: 'Lost & Found ga xush kelibsiz! \nTilni tanlang / Выберите язык / Choose language:',
    en: 'Welcome to Lost & Found! \nChoose language / Tilni tanlang / Выберите язык:'
  },
  language_set: {
    ru: 'Язык установлен: Русский',
    uz: 'Til o\'rnatildi: O\'zbek',
    en: 'Language set: English'
  },
  main_menu: {
    ru: 'Главное меню',
    uz: 'Asosiy menu',
    en: 'Main menu'
  },
  back: {
    ru: 'Назад',
    uz: 'Orqaga',
    en: 'Back'
  },
  cancel: {
    ru: 'Отмена',
    uz: 'Bekor qilish',
    en: 'Cancel'
  },
  login: {
    ru: 'Войти',
    uz: 'Kirish',
    en: 'Login'
  },
  register: {
    ru: 'Регистрация',
    uz: 'Ro\'yhatdan o\'tish',
    en: 'Register'
  },
  yes: {
    ru: 'Да',
    uz: 'Ha',
    en: 'Yes'
  },
  no: {
    ru: 'Нет',
    uz: 'Yo\'q',
    en: 'No'
  },
  error: {
    ru: 'Произошла ошибка. Попробуйте позже.',
    uz: 'Xatolik yuz berdi. Keyinroq urinib ko\'ring.',
    en: 'An error occurred. Please try again later.'
  },
  not_found: {
    ru: 'Ничего не найдено',
    uz: 'Hech narsa topilmadi',
    en: 'Nothing found'
  },
  success: {
    ru: 'Успешно!',
    uz: 'Muvaffaqiyatli!',
    en: 'Success!'
  },
  
  // ===== AUTH =====
  login_or_register: {
    ru: 'Для продолжения необходимо войти или зарегистрироваться.',
    uz: 'Davom etish uchun tizimga kiring yoki ro\'yhatdan o\'ting.',
    en: 'Please login or register to continue.'
  },
  enter_email: {
    ru: 'Введите ваш email:',
    uz: 'Email manzilingizni kiriting:',
    en: 'Enter your email:'
  },
  enter_password: {
    ru: 'Введите пароль (минимум 6 символов):',
    uz: 'Parolni kiriting (kamida 6 ta belgi):',
    en: 'Enter password (minimum 6 characters):'
  },
  enter_name: {
    ru: 'Введите ваше имя:',
    uz: 'Ismingizni kiriting:',
    en: 'Enter your name:'
  },
  enter_phone: {
    ru: 'Введите номер телефона:',
    uz: 'Telefon raqamingizni kiriting:',
    en: 'Enter phone number:'
  },
  invalid_email: {
    ru: 'Некорректный email. Попробуйте снова:',
    uz: 'Noto\'g\'ri email. Qayta urinib ko\'ring:',
    en: 'Invalid email. Try again:'
  },
  password_short: {
    ru: 'Пароль слишком короткий. Минимум 6 символов:',
    uz: 'Parol juda qisqa. Kamida 6 ta belgi:',
    en: 'Password too short. Minimum 6 characters:'
  },
  registration_success: {
    ru: 'Регистрация прошла успешно! Добро пожаловать, ',
    uz: 'Ro\'yhatdan o\'tish muvaffaqiyatli tugadi! Xush kelibsiz, ',
    en: 'Registration successful! Welcome, '
  },
  login_success: {
    ru: 'Вход выполнен! Добро пожаловать, ',
    uz: 'Tizimga kirdingiz! Xush kelibsiz, ',
    en: 'Login successful! Welcome, '
  },
  already_registered: {
    ru: 'Вы уже зарегистрированы! Добро пожаловать, ',
    uz: 'Siz allaqachon ro\'yhatdan o\'tgansiz! Xush kelibsiz, ',
    en: 'You are already registered! Welcome, '
  },
  wrong_password: {
    ru: 'Неверный пароль. Попробуйте снова:',
    uz: 'Noto\'g\'ri parol. Qayta urinib ko\'ring:',
    en: 'Wrong password. Try again:'
  },
  user_not_found: {
    ru: 'Пользователь не найден. Зарегистрируйтесь:',
    uz: 'Foydalanuvchi topilmadi. Ro\'yhatdan o\'ting:',
    en: 'User not found. Please register:'
  },
  enter_password_for_link: {
    ru: 'Введите пароль от существующего аккаунта для привязки:',
    uz: 'Mavjud hisobni ulash uchun parolni kiriting:',
    en: 'Enter password for your existing account to link:'
  },
  
  // ===== MENU BUTTONS =====
  my_listings: {
    ru: '📋 Мои объявления',
    uz: '📋 Mening e\'lonlarim',
    en: '📋 My Listings'
  },
  create_listing: {
    ru: '➕ Создать объявление',
    uz: '➕ E\'lon yaratish',
    en: '➕ Create Listing'
  },
  find_listings: {
    ru: '🔍 Найти объявления',
    uz: '🔍 E\'lonlarni qidirish',
    en: '🔍 Find Listings'
  },
  notifications: {
    ru: '🔔 Уведомления',
    uz: '🔔 Xabarnomalar',
    en: '🔔 Notifications'
  },
  profile: {
    ru: '👤 Профиль',
    uz: '👤 Profil',
    en: '👤 Profile'
  },
  settings: {
    ru: '⚙️ Настройки',
    uz: '⚙️ Sozlamalar',
    en: '⚙️ Settings'
  },
  logout: {
    ru: '🚪 Выйти',
    uz: '🚪 Chiqish',
    en: '🚪 Logout'
  },
  
  // ===== LISTINGS =====
  select_type: {
    ru: 'Выберите тип объявления:',
    uz: 'E\'lon turini tanlang:',
    en: 'Select listing type:'
  },
  select_category: {
    ru: 'Выберите категорию:',
    uz: 'Kategoriyani tanlang:',
    en: 'Select category:'
  },
  enter_title: {
    ru: 'Введите название вещи:',
    uz: 'Narsa nomini kiriting:',
    en: 'Enter item title:'
  },
  enter_description: {
    ru: 'Введите описание (цвет, особые приметы и т.д.):',
    uz: 'Tavsifni kiriting (rang, alomatlar va h.k.):',
    en: 'Enter description (color, distinguishing features, etc.):'
  },
  enter_location: {
    ru: 'Введите место, где потеряли/нашли:',
    uz: 'Yo\'qotilgan/topilgan joyni kiriting:',
    en: 'Enter location where lost/found:'
  },
  send_photo: {
    ru: 'Отправьте фото (или нажмите "Пропустить"):',
    uz: 'Rasm yuboring (yoki "O\'tkazib yuborish" ni bosing):',
    en: 'Send a photo (or press "Skip"):'
  },
  location: {
    ru: 'Место',
    uz: 'Joy',
    en: 'Location'
  },
  skip: {
    ru: 'Пропустить',
    uz: 'O\'tkazib yuborish',
    en: 'Skip'
  },
  listing_created: {
    ru: 'Объявление успешно создано!',
    uz: 'E\'lon muvaffaqiyatli yaratildi!',
    en: 'Listing successfully created!'
  },
  listing_type_lost: {
    ru: 'Потеряно',
    uz: 'Yo\'qolgan',
    en: 'Lost'
  },
  listing_type_found: {
    ru: 'Найдено',
    uz: 'Topilgan',
    en: 'Found'
  },
  category_documents: {
    ru: 'Документы',
    uz: 'Hujjatlar',
    en: 'Documents'
  },
  category_electronics: {
    ru: 'Электроника',
    uz: 'Elektronika',
    en: 'Electronics'
  },
  category_clothing: {
    ru: 'Одежда',
    uz: 'Kiyim',
    en: 'Clothing'
  },
  category_accessories: {
    ru: 'Аксессуары',
    uz: 'Aksessuarlar',
    en: 'Accessories'
  },
  category_pets: {
    ru: 'Животные',
    uz: 'Hayvonlar',
    en: 'Pets'
  },
  category_other: {
    ru: 'Другое',
    uz: 'Boshqa',
    en: 'Other'
  },
  last_listings: {
    ru: 'Последние объявления:',
    uz: 'Oxirgi e\'lonlar:',
    en: 'Latest listings:'
  },
  no_listings: {
    ru: 'У вас пока нет объявлений.',
    uz: 'Sizda hali e\'lonlar yo\'q.',
    en: 'You have no listings yet.'
  },
  status_active: {
    ru: 'Активно',
    uz: 'Faol',
    en: 'Active'
  },
  status_resolved: {
    ru: 'Решено',
    uz: 'Hal qilingan',
    en: 'Resolved'
  },
  status_closed: {
    ru: 'Закрыто',
    uz: 'Yopilgan',
    en: 'Closed'
  },
  change_status: {
    ru: 'Изменить статус',
    uz: 'Holatni o\'zgartirish',
    en: 'Change status'
  },
  delete_listing: {
    ru: 'Удалить',
    uz: 'O\'chirish',
    en: 'Delete'
  },
  view_comments: {
    ru: 'Комментарии',
    uz: 'Izohlar',
    en: 'Comments'
  },
  add_comment: {
    ru: 'Добавить комментарий',
    uz: 'Izoh qoldirish',
    en: 'Add comment'
  },
  enter_comment: {
    ru: 'Введите ваш комментарий:',
    uz: 'Izohingizni kiriting:',
    en: 'Enter your comment:'
  },
  comment_added: {
    ru: 'Комментарий добавлен!',
    uz: 'Izoh qo\'shildi!',
    en: 'Comment added!'
  },
  no_comments: {
    ru: 'Комментариев пока нет.',
    uz: 'Hali izohlar yo\'q.',
    en: 'No comments yet.'
  },
  contact_author: {
    ru: 'Связаться',
    uz: 'Bog\'lanish',
    en: 'Contact'
  },
  listing_deleted: {
    ru: 'Объявление удалено.',
    uz: 'E\'lon o\'chirildi.',
    en: 'Listing deleted.'
  },
  
  // ===== NOTIFICATIONS =====
  no_notifications: {
    ru: 'У вас нет новых уведомлений.',
    uz: 'Sizda yangi xabarnomalar yo\'q.',
    en: 'You have no new notifications.'
  },
  mark_read: {
    ru: 'Отметить прочитанным',
    uz: 'O\'qilgan deb belgilash',
    en: 'Mark as read'
  },
  mark_all_read: {
    ru: 'Отметить все прочитанными',
    uz: 'Barchasini o\'qilgan deb belgilash',
    en: 'Mark all as read'
  },
  new_notification: {
    ru: 'Новое уведомление',
    uz: 'Yangi xabarnoma',
    en: 'New notification'
  },
  
  // ===== PROFILE =====
  profile_info: {
    ru: 'Ваш профиль',
    uz: 'Sizning profilingiz',
    en: 'Your profile'
  },
  name_label: {
    ru: 'Имя',
    uz: 'Ism',
    en: 'Name'
  },
  email_label: {
    ru: 'Email',
    uz: 'Email',
    en: 'Email'
  },
  phone_label: {
    ru: 'Телефон',
    uz: 'Telefon',
    en: 'Phone'
  },
  role_label: {
    ru: 'Роль',
    uz: 'Rol',
    en: 'Role'
  },
  
  // ===== SEARCH =====
  search_prompt: {
    ru: 'Введите запрос для поиска (название, описание или место):',
    uz: 'Qidirish uchun so\'rov kiriting (nomi, tavsif yoki joy):',
    en: 'Enter search query (title, description or location):'
  },
  search_results: {
    ru: 'Результаты поиска:',
    uz: 'Qidiruv natijalari:',
    en: 'Search results:'
  },
  
  // ===== SETTINGS =====
  change_language: {
    ru: 'Сменить язык',
    uz: 'Tilni o\'zgartirish',
    en: 'Change language'
  },
  language_changed: {
    ru: 'Язык изменен!',
    uz: 'Til o\'zgartirildi!',
    en: 'Language changed!'
  },
  
  // ===== PAGINATION =====
  prev: {
    ru: '◀️ Назад',
    uz: '◀️ Orqaga',
    en: '◀️ Previous'
  },
  next: {
    ru: 'Вперед ▶️',
    uz: 'Oldinga ▶️',
    en: 'Next ▶️'
  },
  page_of: {
    ru: 'Стр',
    uz: 'Sah',
    en: 'Pg'
  }
};

export const t = (key, lang = 'ru') => {
  if (!translations[key]) {
    console.warn(`Missing translation key: ${key}`);
    return key;
  }
  return translations[key][lang] || translations[key]['ru'] || key;
};

export const categories = [
  { key: 'documents', icon: '📄' },
  { key: 'electronics', icon: '📱' },
  { key: 'clothing', icon: '👕' },
  { key: 'accessories', icon: '⌚' },
  { key: 'pets', icon: '🐕' },
  { key: 'other', icon: '📦' }
];

export default translations;
