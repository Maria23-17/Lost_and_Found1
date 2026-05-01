// server/bot/keyboards.js
// Telegram Bot Keyboards

import { t, categories } from './i18n.js';

export const getLanguageKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
        { text: "🇺🇿 O'zbek", callback_data: 'lang_uz' },
        { text: '🇬🇧 English', callback_data: 'lang_en' }
      ]
    ]
  }
});

export const getMainMenuKeyboard = (lang) => ({
  reply_markup: {
    keyboard: [
      [t('my_listings', lang), t('create_listing', lang)],
      [t('find_listings', lang), t('notifications', lang)],
      [t('profile', lang), t('settings', lang)]
    ],
    resize_keyboard: true
  }
});

export const getAuthKeyboard = (lang) => ({
  reply_markup: {
    keyboard: [
      [t('login', lang) || '🔑 ' + t('enter_email', lang).split(':')[0]],
      [t('register', lang) || '📝 ' + t('enter_name', lang).split(':')[0]]
    ],
    resize_keyboard: true
  }
});

export const getCancelKeyboard = (lang) => ({
  reply_markup: {
    keyboard: [[t('cancel', lang)]],
    resize_keyboard: true
  }
});

export const getSkipKeyboard = (lang) => ({
  reply_markup: {
    keyboard: [[t('skip', lang), t('cancel', lang)]],
    resize_keyboard: true
  }
});

export const getYesNoKeyboard = (lang) => ({
  reply_markup: {
    keyboard: [[t('yes', lang), t('no', lang)], [t('cancel', lang)]],
    resize_keyboard: true
  }
});

export const getListingTypeKeyboard = (lang) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '😞 ' + t('listing_type_lost', lang), callback_data: 'type_lost' },
        { text: '🙂 ' + t('listing_type_found', lang), callback_data: 'type_found' }
      ]
    ]
  }
});

export const getCategoryKeyboard = (lang) => {
  const buttons = categories.map(cat => ({
    text: `${cat.icon} ${t('category_' + cat.key, lang)}`,
    callback_data: `cat_${cat.key}`
  }));
  
  // Split into rows of 2
  const rows = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }
  
  rows.push([{ text: t('cancel', lang), callback_data: 'cancel_create' }]);
  
  return {
    reply_markup: {
      inline_keyboard: rows
    }
  };
};

export const getMyListingsActions = (listingId, lang) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: t('change_status', lang), callback_data: `status_${listingId}` },
        { text: t('delete_listing', lang), callback_data: `delete_${listingId}` }
      ],
      [
        { text: t('view_comments', lang), callback_data: `comments_${listingId}` },
        { text: t('add_comment', lang), callback_data: `addcomment_${listingId}` }
      ]
    ]
  }
});

export const getStatusKeyboard = (listingId, lang) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '✅ ' + t('status_active', lang), callback_data: `setstatus_${listingId}_active` },
        { text: '🎉 ' + t('status_resolved', lang), callback_data: `setstatus_${listingId}_resolved` }
      ],
      [
        { text: '🔒 ' + t('status_closed', lang), callback_data: `setstatus_${listingId}_closed` },
        { text: t('back', lang), callback_data: `listing_${listingId}` }
      ]
    ]
  }
});

export const getListingInline = (listingId, isOwner, lang) => {
  const buttons = [];
  if (isOwner) {
    buttons.push([
      { text: t('change_status', lang), callback_data: `status_${listingId}` },
      { text: t('delete_listing', lang), callback_data: `delete_${listingId}` }
    ]);
  } else {
    buttons.push([
      { text: t('view_comments', lang), callback_data: `comments_${listingId}` },
      { text: t('add_comment', lang), callback_data: `addcomment_${listingId}` }
    ]);
  }
  buttons.push([{ text: t('back', lang), callback_data: 'back_search' }]);
  return { reply_markup: { inline_keyboard: buttons } };
};

export const getPaginationKeyboard = (items, page, perPage, prefix, lang) => {
  const totalPages = Math.ceil(items.length / perPage);
  const buttons = [];
  
  if (totalPages > 1) {
    const navRow = [];
    if (page > 0) {
      navRow.push({ text: t('prev', lang), callback_data: `${prefix}_page_${page - 1}` });
    }
    navRow.push({ text: `${t('page_of', lang)} ${page + 1}/${totalPages}`, callback_data: 'noop' });
    if (page < totalPages - 1) {
      navRow.push({ text: t('next', lang), callback_data: `${prefix}_page_${page + 1}` });
    }
    buttons.push(navRow);
  }
  
  buttons.push([{ text: t('back', lang), callback_data: 'main_menu' }]);
  
  return {
    reply_markup: {
      inline_keyboard: buttons
    }
  };
};

export const getNotificationActions = (notifId, lang) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: t('mark_read', lang), callback_data: `readnotif_${notifId}` }
      ],
      [
        { text: t('mark_all_read', lang), callback_data: 'readall_notif' }
      ]
    ]
  }
});

export const getSettingsKeyboard = (lang) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🌐 ' + t('change_language', lang), callback_data: 'settings_lang' }
      ],
      [
        { text: '🚪 ' + t('logout', lang), callback_data: 'logout' }
      ],
      [
        { text: t('back', lang), callback_data: 'main_menu' }
      ]
    ]
  }
});

export const getSearchResultsKeyboard = (listingId, lang) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: t('view_comments', lang), callback_data: `comments_${listingId}` },
        { text: t('add_comment', lang), callback_data: `addcomment_${listingId}` }
      ],
      [
        { text: t('contact_author', lang), callback_data: `contact_${listingId}` }
      ]
    ]
  }
});
