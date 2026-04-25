import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Listing {
  id: number;
  title: string;
  type: 'lost' | 'found';
  category: string;
  description: string;
  status: 'pending' | 'active' | 'closed';
  location: string;
  phone: string;
  image: string;
  user_id: number;
  user_name?: string;
  user_email?: string;
  created_at: string;
}

export function ModeratorPanel() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    checkAccess();
    loadPendingListings();
  }, []);

  const checkAccess = () => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
      navigate('/');
    }
  };

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const loadPendingListings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/listings?status=pending&limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setListings(data.data || []);
      setStats({
        pending: data.data?.length || 0,
        approved: 0,
        rejected: 0
      });
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveListing = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const listing = listings.find(l => l.id === id);
      
      const response = await fetch(`http://localhost:5000/api/admin/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...listing,
          status: 'active'
        })
      });
      
      if (response.ok) {
        alert('✅ Объявление одобрено! Оно появится на сайте.');
        loadPendingListings();
        setStats(prev => ({ ...prev, approved: prev.approved + 1, pending: prev.pending - 1 }));
      } else {
        alert('Ошибка при одобрении');
      }
    } catch (error) {
      console.error('Error approving listing:', error);
      alert('Ошибка при одобрении');
    }
  };

  const rejectListing = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление? Это действие нельзя отменить.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('❌ Объявление удалено');
        loadPendingListings();
        setStats(prev => ({ ...prev, rejected: prev.rejected + 1, pending: prev.pending - 1 }));
      } else {
        alert('Ошибка при удалении');
      }
    } catch (error) {
      console.error('Error rejecting listing:', error);
      alert('Ошибка при удалении');
    }
  };

  const viewDetails = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const getTypeBadge = (type: string) => {
    return type === 'lost' 
      ? <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Потеряно</span>
      : <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Найдено</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Панель модератора</h1>
            <p className="text-gray-600 mt-1">Проверка и модерация объявлений</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={loadPendingListings}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 flex gap-2 items-center"
            >
              🔄 Обновить
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">На модерации</p>
                <p className="text-3xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <span className="text-4xl">⏳</span>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Одобрено сегодня</p>
                <p className="text-3xl font-bold text-green-800">{stats.approved}</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Отклонено сегодня</p>
                <p className="text-3xl font-bold text-red-800">{stats.rejected}</p>
              </div>
              <span className="text-4xl">❌</span>
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>⚠️</span>
              Объявления на модерацию
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Загрузка объявлений...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">✅</span>
                <h3 className="text-xl font-semibold mb-2">Нет объявлений на модерацию</h3>
                <p className="text-gray-500">Все объявления проверены</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Тип</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Название</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Категория</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Автор</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Дата</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {listings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono">#{listing.id}</td>
                        <td className="px-4 py-3">{getTypeBadge(listing.type)}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{listing.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{listing.category}</td>
                        <td className="px-4 py-3 text-sm">
                          {listing.user_name || `User #${listing.user_id}`}
                        </td>
                        <td className="px-4 py-3 text-sm">{formatDate(listing.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => viewDetails(listing)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Просмотр"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => approveListing(listing.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Одобрить"
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => rejectListing(listing.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Отклонить"
                            >
                              ❌
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal for viewing details */}
        {selectedListing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedListing(null)}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Детали объявления #{selectedListing.id}</h2>
                <button onClick={() => setSelectedListing(null)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  {getTypeBadge(selectedListing.type)}
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{selectedListing.category}</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">На модерации</span>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedListing.title}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedListing.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Местоположение</p>
                    <p className="font-medium">📍 {selectedListing.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Контактный телефон</p>
                    <p className="font-medium">📞 {selectedListing.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Автор</p>
                    <p className="font-medium">{selectedListing.user_name || `User #${selectedListing.user_id}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Дата создания</p>
                    <p className="font-medium">📅 {formatDate(selectedListing.created_at)}</p>
                  </div>
                </div>
                
                {selectedListing.image && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Фото</p>
                    <img 
                      src={`http://localhost:5000${selectedListing.image}`} 
                      alt={selectedListing.title}
                      className="max-w-full max-h-64 object-contain rounded-lg border"
                    />
                  </div>
                )}
                
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      approveListing(selectedListing.id);
                      setSelectedListing(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex gap-2 items-center justify-center"
                  >
                    ✅ Одобрить
                  </button>
                  <button
                    onClick={() => {
                      rejectListing(selectedListing.id);
                      setSelectedListing(null);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex gap-2 items-center justify-center"
                  >
                    ❌ Отклонить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}