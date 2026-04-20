# Translation System Guide

## Overview

The Lost & Found Bureau website uses a centralized translation system built with React Context API. This system makes it easy to manage multilingual content and prepare for backend integration.

## How It Works

### 1. Language Context (`/src/app/context/LanguageContext.tsx`)

The `LanguageContext` provides:
- **Current language state** (ru, uz, en)
- **setLanguage function** to switch languages
- **t() function** to translate keys

### 2. Translation Structure

All translations are stored in a single object with this format:

```typescript
const translations = {
  translationKey: {
    ru: 'Русский текст',
    uz: 'O\'zbek matni',
    en: 'English text'
  }
}
```

### 3. Using Translations in Components

Import and use the translation hook in any component:

```typescript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('siteName')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

## Language Switcher

The language switcher is located in the header (top right corner):
- Clicking the globe icon opens a dropdown menu
- Users can select: Русский, O'zbek, or English
- The selection is stored in state and persists during the session

## Backend Integration Guide

### Option 1: Keep Frontend Translation Object

**Pros:**
- Faster page loads (no API calls for translations)
- Works offline
- Simple implementation

**Steps:**
1. Keep the current `LanguageContext.tsx` structure
2. Backend only needs to return data in one language
3. Frontend handles all UI translations

### Option 2: Load Translations from Backend

**Pros:**
- Centralized translation management
- Easy to update translations without deploying frontend
- Can add new languages dynamically

**Steps:**

1. **Create a backend API endpoint:**
```
GET /api/translations?lang=ru
```

Response:
```json
{
  "siteName": "Lost & Found — Бюро находок",
  "home": "Главная",
  "howItWorks": "Как это работает",
  ...
}
```

2. **Update LanguageContext to fetch from API:**
```typescript
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    // Fetch translations from backend
    fetch(`/api/translations?lang=${language}`)
      .then(res => res.json())
      .then(data => setTranslations(data));
  }, [language]);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
```

3. **Or use localStorage for caching:**
```typescript
// Load from localStorage first, then fetch updates
const cached = localStorage.getItem(`translations_${language}`);
if (cached) {
  setTranslations(JSON.parse(cached));
}

fetch(`/api/translations?lang=${language}`)
  .then(res => res.json())
  .then(data => {
    setTranslations(data);
    localStorage.setItem(`translations_${language}`, JSON.stringify(data));
  });
```

### Option 3: Hybrid Approach (Recommended)

**Best of both worlds:**

1. Keep default translations in frontend (fallback)
2. Load additional/updated translations from backend
3. Merge them together

```typescript
const defaultTranslations = { /* ... */ };

fetch(`/api/translations?lang=${language}`)
  .then(res => res.json())
  .then(apiTranslations => {
    const merged = { ...defaultTranslations, ...apiTranslations };
    setTranslations(merged);
  });
```

## Database Schema for Translations (Optional)

If you want to store translations in the database:

```sql
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  language VARCHAR(2) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(key, language)
);

CREATE INDEX idx_translations_key_lang ON translations(key, language);
```

Example data:
```sql
INSERT INTO translations (key, language, value) VALUES
('siteName', 'ru', 'Lost & Found — Бюро находок'),
('siteName', 'uz', 'Lost & Found — Topilmalar byurosi'),
('siteName', 'en', 'Lost & Found Bureau'),
('home', 'ru', 'Главная'),
('home', 'uz', 'Bosh sahifa'),
('home', 'en', 'Home');
```

## Translation Keys Reference

All translation keys are organized by page/section:

### Header
- `home`, `howItWorks`, `login`, `admin`, `siteName`

### Home Page
- `searchPlaceholder`, `iLost`, `iFound`, `latestListings`
- `step1Title`, `step1Desc`, `step1Details`
- `step2Title`, `step2Desc`, `step2Details`
- `step3Title`, `step3Desc`, `step3Details`
- `telegramBotTitle`, `telegramBotDesc`, `goToBot`, `sendListing`

### How It Works Page
- `howItWorksTitle`, `howItWorksSubtitle`
- `step1`, `step2`, `step3`
- `readyToStart`, `readyToStartDesc`

### Submit Listing Page
- `submitListingTitle`, `listingType`, `lost`, `found`
- `category`, `selectCategory`
- `documents`, `electronics`, `clothing`, `accessories`, `pets`, `other`
- `title`, `titlePlaceholder`, `description`, `descriptionPlaceholder`
- `location`, `locationPlaceholder`, `phone`, `phonePlaceholder`
- `uploadPhoto`, `submitButton`

### Login Page
- `loginTitle`, `loginSubtitle`
- `emailOrPhone`, `password`, `loginButton`
- `loginWithTelegram`, `loginWithGoogle`
- `forgotPassword`, `orContinueWith`

### Footer
- `footerAboutText`, `quickLinks`, `contacts`

### Admin Panel
- `dashboard`, `listings`, `users`, `settings`
- `totalListings`, `totalUsers`, `activeListings`, `resolvedCases`
- `recentListings`, `type`, `status`, `actions`
- `edit`, `delete`, `active`, `closed`

### Common
- `viewAll`, `contact`

## Adding New Translations

1. **Add to translations object in LanguageContext.tsx:**
```typescript
newKey: { 
  ru: 'Русский текст', 
  uz: 'O\'zbek matni', 
  en: 'English text' 
}
```

2. **Use in component:**
```typescript
{t('newKey')}
```

## Best Practices

1. **Always use translation keys** - Never hardcode text in components
2. **Use descriptive key names** - `loginButton` instead of `btn1`
3. **Group keys logically** - By page or component
4. **Provide fallbacks** - The `t()` function returns the key if translation is missing
5. **Keep keys consistent** - Use camelCase for all keys

## Testing Translations

To test if all text is properly translated:

1. Switch language using the globe icon in the header
2. Navigate through all pages
3. Check that all text changes language
4. If text doesn't change, it needs to be converted to use `t()`

## Current Default Language

The website loads in **Russian (ru)** by default. This is set in:
```typescript
const [language, setLanguage] = useState<Language>('ru');
```

To change the default, update this line to 'uz' or 'en'.

## Browser Language Detection (Future Enhancement)

To automatically detect user's browser language:

```typescript
const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.slice(0, 2);
  if (browserLang === 'ru' || browserLang === 'uz' || browserLang === 'en') {
    return browserLang as Language;
  }
  return 'ru'; // default fallback
};

const [language, setLanguage] = useState<Language>(getBrowserLanguage());
```

## Persistent Language Selection (Future Enhancement)

To remember user's language choice across sessions:

```typescript
const [language, setLanguage] = useState<Language>(() => {
  const saved = localStorage.getItem('preferredLanguage');
  return (saved as Language) || 'ru';
});

useEffect(() => {
  localStorage.setItem('preferredLanguage', language);
}, [language]);
```

## Summary

The translation system is **ready for backend integration** with minimal changes needed. The current implementation:
- ✅ Centralized translation management
- ✅ Easy to switch languages
- ✅ All UI text uses translation keys
- ✅ Clean separation of concerns
- ✅ Ready to fetch from API or database
- ✅ Fallback to default translations
- ✅ Type-safe with TypeScript

Choose the backend integration option that best fits your architecture and requirements.
