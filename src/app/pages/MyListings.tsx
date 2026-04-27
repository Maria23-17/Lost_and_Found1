// src/app/pages/MyListings.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Check, Trash2, Loader2, PawPrint, Briefcase, Car, Smartphone, Clover, HelpCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

interface MyListing {
  id: number;
  title: string;
  type: 'lost' | 'found';
  category: string;
  description: string;
  status: 'active' | 'pending' | 'closed';
  created_at: string;
  image: string;
  location: string;
  phone: string;
}

// Функция для иконки категории (как в Home)
const getCategoryIcon = (category: string) => {
  const iconClass = "w-5 h-5";
  switch(category?.toLowerCase()) {
    case 'pets':
    case 'животные':
      return <PawPrint className={iconClass} />;
    case 'documents':
    case 'документы':
      return <Briefcase className={iconClass} />;
    case 'electronics':
    case 'электроника':
      return <Smartphone className={iconClass} />;
    case 'clothing':
    case 'одежда':
      return <Briefcase className={iconClass} />;
    case 'accessories':
    case 'аксессуары':
      return <Clover className={iconClass} />;
    case 'transport':
    case 'транспорт':
      return <Car className={iconClass} />;
    default:
      return <HelpCircle className={iconClass} />;
  }
};

export function MyListings() {
  const { t } = useLanguage();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    loadMyListings();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadMyListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/listings/my-listings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Если сервер возвращает { data: [...] }
      if (data && Array.isArray(data.data)) {
        setListings(data.data);
      } 
      // Если сервер возвращает просто массив
      else if (Array.isArray(data)) {
        setListings(data);
      } 
      // Если сервер возвращает что-то другое
      else {
        console.error('Неожиданный формат данных:', data);
        setListings([]);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };
  
  const markAsResolved = async (id: number) => {
    setActionId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/listings/${id}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        showMessage('✅ Отлично! Объявление закрыто', 'success');
        loadMyListings();
      } else {
        showMessage('❌ Ошибка при закрытии', 'error');
      }
    } catch (error) {
      showMessage('❌ Ошибка при закрытии', 'error');
    } finally {
      setActionId(null);
    }
  };

  const deleteListing = async (id: number) => {
    setActionId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        showMessage('🗑️ Объявление удалено', 'success');
        loadMyListings();
      } else {
        showMessage('❌ Ошибка при удалении', 'error');
      }
    } catch (error) {
      showMessage('❌ Ошибка при удалении', 'error');
    } finally {
      setActionId(null);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">{t('loading') || 'Загрузка...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-4">
        <div className="max-w-4xl mx-auto">
          {/* Уведомление */}
          {message && (
            <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
              message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">{t('myListings') || 'Мои объявления'}</h1>
              <p className="text-gray-500 text-sm">{t('manageListings') || 'Управляйте своими объявлениями'}</p>
            </div>
            <Link to="/submit">
              <Button style={{ backgroundColor: 'var(--orange)', color: 'white' }} className="hover:opacity-90">
                + {t('createListing') || 'Создать объявление'}
              </Button>
            </Link>
          </div>

          {listings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 mb-4">{t('noListings') || 'У вас пока нет объявлений'}</p>
                <Link to="/submit">
                  <Button style={{ backgroundColor: 'var(--orange)', color: 'white' }} className="hover:opacity-90">
                    {t('createListing') || 'Создать объявление'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => {
                const isActive = listing.status === 'active';
                const isPending = listing.status === 'pending';
                const isClosed = listing.status === 'closed';
                const isLost = listing.type === 'lost';
                
                return (
                  <div 
                    key={listing.id} 
                    className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden ${
                      isLost ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-blue-500'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex gap-4">
                        {/* Фото с иконкой типа */}
                        <div className="relative">
                          <div className={`w-24 h-24 rounded-xl flex items-center justify-center text-3xl overflow-hidden ${
                            isLost ? 'bg-orange-50' : 'bg-blue-50'
                          }`}>
                            {listing.image ? (
                              <img 
                                src={`http://localhost:5000${listing.image}`} 
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              isLost ? '🔍' : '📦'
                            )}
                          </div>
                          {/* Бейдж типа */}
                          <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                            isLost ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                          }`}>
                            {isLost ? t('lost') : t('found')}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              {/* Категория и локация - переводится как в Home.tsx */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                  {getCategoryIcon(listing.category)}
                                  <span>{t(listing.category)}</span>
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{listing.location}</span>
                              </div>
                              
                              {/* Заголовок */}
                              <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                              
                              {/* Описание */}
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.description}</p>
                              
                              {/* Дата и статус */}
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>📅 {new Date(listing.created_at).toLocaleDateString()}</span>
                                {isActive && <span className="text-green-600">✓ {t('active')}</span>}
                                {isPending && <span className="text-yellow-600">⏳ {t('pending')}</span>}
                                {isClosed && <span className="text-gray-500">✓ {t('closed')}</span>}
                              </div>
                            </div>
                            
                            {/* Кнопки действий */}
                            <div className="flex flex-col gap-2">
                              {isActive && (
                                <button
                                  onClick={() => markAsResolved(listing.id)}
                                  disabled={actionId === listing.id}
                                  className="px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
                                  style={{ backgroundColor: 'var(--orange)', color: 'white' }}
                                >
                                  {actionId === listing.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                  {t('foundButton') || 'Найдено'}
                                </button>
                              )}
                              
                              <AlertDialog open={deleteId === listing.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                                <AlertDialogTrigger asChild>
                                  <button
                                    onClick={() => setDeleteId(listing.id)}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1 whitespace-nowrap"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    {t('delete') || 'Удалить'}
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t('confirmDeleteTitle') || 'Удалить объявление?'}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t('confirmDeleteDesc') || 'Вы уверены? Это действие нельзя отменить.'}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancel') || 'Отмена'}</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteListing(listing.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {t('delete') || 'Удалить'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          {/* Подсказка по статусу */}
                          {isPending && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                              ⏳ {t('pendingMessage') || 'Объявление на модерации. После проверки оно появится на сайте.'}
                            </div>
                          )}
                          {isClosed && (
                            <div className="mt-3 p-2 bg-green-50 rounded-lg text-sm text-green-700">
                              ✅ {t('closedMessage') || 'Проблема решена! Объявление закрыто.'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}