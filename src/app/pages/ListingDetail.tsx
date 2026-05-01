import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Phone, Eye, AlertTriangle, MapPin, Calendar, User, Clock, CheckCircle, XCircle, Smartphone, Shirt, Watch, PawPrint, Package, Car, Briefcase, Clover, HelpCircle, X } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface ListingDetail {
  id: number;
  title: string;
  type: 'lost' | 'found';
  category: string;
  description: string;
  location: string;
  phone: string;
  image: string;
  date: string;
  created_at: string;
  user_name?: string;
  status: string;
}

const getCategoryIcon = (category: string) => {
  const iconClass = "w-5 h-5";
  switch (category?.toLowerCase()) {
    case 'pets':
      return <PawPrint className={iconClass} />;
    case 'documents':
      return <Briefcase className={iconClass} />;
    case 'electronics':
      return <Smartphone className={iconClass} />;
    case 'clothing':
      return <Shirt className={iconClass} />;
    case 'accessories':
      return <Watch className={iconClass} />;
    case 'transport':
      return <Car className={iconClass} />;
    default:
      return <Package className={iconClass} />;
  }
};

const getReportReasons = (t: (key: string) => string) => [
  t('reportSpam') || 'Спам или реклама',
  t('reportFraud') || 'Мошенничество',
  t('reportFake') || 'Фальшивое объявление',
  t('reportWrongCategory') || 'Неверная категория',
  t('reportDuplicate') || 'Дубликат объявления',
  t('reportInsult') || 'Оскорбления или грубость',
  t('reportOther') || 'Другое'
];

export function ListingDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReasonText, setCustomReasonText] = useState('');

  const reportReasons = getReportReasons(t);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (language === 'en') {
      return date.toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    }
    
    if (language === 'uz') {
      const ruDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      return ruDate
        .replace('января', 'Yanvar')
        .replace('февраля', 'Fevral')
        .replace('марта', 'Mart')
        .replace('апреля', 'Aprel')
        .replace('мая', 'May')
        .replace('июня', 'Iyun')
        .replace('июля', 'Iyul')
        .replace('августа', 'Avgust')
        .replace('сентября', 'Sentabr')
        .replace('октября', 'Oktabr')
        .replace('ноября', 'Noyabr')
        .replace('декабря', 'Dekabr');
    }
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/listings/${id}`);
      const data = await response.json();
      setListing(data);
    } catch (error) {
      console.error('Ошибка при загрузке объявления:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    let reason = selectedReason;
    if (reason === (t('reportOther') || 'Другое') && customReasonText.trim()) {
      reason = customReasonText.trim();
    }

    if (!reason || reason === (t('reportOther') || 'Другое')) {
      alert(t('selectReason') || 'Пожалуйста, выберите причину');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/listings/${id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reason })
      });
      if (response.ok) {
        alert(t('reportSuccess') || '📢 Жалоба отправлена');
        setShowReportDialog(false);
        setSelectedReason('');
        setCustomReasonText('');
      }
    } catch (error) {
      console.error(error);
      alert(t('reportError') || '❌ Ошибка');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t('listingNotFound') || 'Объявление не найдено'}</p>
          <Button onClick={() => navigate('/')} className="mt-4">{t('backToHome') || 'Вернуться'}</Button>
        </div>
      </div>
    );
  }

  const isLost = listing.type === 'lost';
  const isActive = listing.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Кнопка назад */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('back') || 'Назад'}
        </button>

        {/* Основная карточка */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Hero секция с фото */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex items-center justify-center p-8 min-h-[450px]">
              {listing.image ? (
                <img
                  src={`http://localhost:5000${listing.image}`}
                  alt={listing.title}
                  className="max-w-full max-h-[400px] object-contain rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => setSelectedImage(`http://localhost:5000${listing.image}`)}
                />
              ) : (
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                    {isLost ? '🔍' : '📦'}
                  </div>
                  <p className="text-gray-400">{t('noPhoto') || 'Фото отсутствует'}</p>
                </div>
              )}
            </div>

            {/* Бейдж статуса */}
            <div className="absolute top-4 right-4">
              <div className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg ${isLost ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                {isLost ? t('lost') : t('found')}
              </div>
            </div>

            {/* Бейдж активности */}
            <div className="absolute bottom-4 left-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-md ${isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                {isActive ? `✓ ${t('active')}` : `✗ ${t('closed')}`}
              </div>
            </div>
          </div>

          {/* Контент */}
          <div className="p-6 md:p-8">
            {/* Заголовок и категория */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  {getCategoryIcon(listing.category)}
                  {t(listing.category)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.location}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{listing.title}</h1>
            </div>

            {/* Описание */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">📝 {t('description') || 'Описание'}</h2>
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </div>
            </div>

            {/* Информационная сетка */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Место */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('location') || 'Место'}</p>
                  <p className="text-sm font-medium text-gray-700">{listing.location}</p>
                </div>
              </div>

              {/* Дата */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('date') || 'Дата'}</p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(listing.date || listing.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Контакты */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">📞 {t('contacts') || 'Контакты'}</h2>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
                {!showPhone ? (
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      if (!token) {
                        alert(t('loginToSeeContacts') || '🔒 Войдите в аккаунт, чтобы увидеть контакты');
                        navigate('/login');
                        return;
                      }
                      setShowPhone(true);
                    }}
                    className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    {t('showPhone') || 'Показать номер телефона'}
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-6 h-6 text-green-600" />
                      <span className="text-xl font-bold text-gray-800">{listing.phone || t('phoneNotSpecified') || 'Не указан'}</span>
                    </div>
                    <button
                      onClick={() => setShowPhone(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3 text-center">
                  ⚠️ {t('safetyWarning') || 'Будьте осторожны при сделке. Не переводите предоплату.'}
                </p>
              </div>
            </div>

            {/* Кнопка жалобы */}
            <div className="pt-4 border-t border-gray-100">
              {!showReportDialog ? (
                <button
                  onClick={() => setShowReportDialog(true)}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {t('report') || 'Пожаловаться'}
                </button>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-gray-700">{t('reportReason') || 'Причина жалобы'}</span>
                    <button
                      onClick={() => {
                        setShowReportDialog(false);
                        setSelectedReason('');
                        setCustomReasonText('');
                      }}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                  >
                    <option value="">{t('selectReason') || 'Выберите причину'}</option>
                    {reportReasons.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>

                  {selectedReason === (t('reportOther') || 'Другое') && (
                    <textarea
                      value={customReasonText}
                      onChange={(e) => setCustomReasonText(e.target.value)}
                      placeholder={t('writeReason') || 'Напишите причину...'}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mt-3 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none"
                      rows={2}
                    />
                  )}

                  <div className="flex gap-3 justify-end mt-4">
                    <button
                      onClick={() => {
                        setShowReportDialog(false);
                        setSelectedReason('');
                        setCustomReasonText('');
                      }}
                      className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                    >
                      {t('cancel') || 'Отмена'}
                    </button>
                    <button
                      onClick={submitReport}
                      className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm"
                    >
                      {t('send') || 'Отправить'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для фото */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl">✕</button>
            <img src={selectedImage} alt="Просмотр" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}