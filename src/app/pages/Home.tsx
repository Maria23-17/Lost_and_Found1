import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Search, FileText, Smartphone, Shirt, Watch, PawPrint, Package, Eye, Filter, X } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: t('allCategories'), icon: '📋' },
    { value: 'documents', label: t('documents'), icon: '📄' },
    { value: 'electronics', label: t('electronics'), icon: '📱' },
    { value: 'clothing', label: t('clothing'), icon: '👕' },
    { value: 'accessories', label: t('accessories'), icon: '⌚' },
    { value: 'pets', label: t('pets'), icon: '🐾' },
    { value: 'other', label: t('other'), icon: '📦' },
  ];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/listings');
        const data = await response.json();
        setListings(data);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      documents: <FileText className="w-5 h-5" />,
      electronics: <Smartphone className="w-5 h-5" />,
      clothing: <Shirt className="w-5 h-5" />,
      accessories: <Watch className="w-5 h-5" />,
      pets: <PawPrint className="w-5 h-5" />,
      other: <Package className="w-5 h-5" />,
    };
    return icons[category] || icons.other;
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      documents: '📄',
      electronics: '📱',
      clothing: '👕',
      accessories: '⌚',
      pets: '🐾',
      other: '📦',
    };
    return emojis[category] || '📦';
  };

  const filteredListings = listings.filter(listing => {
    if (filter !== 'all' && listing.type !== filter) return false;
    if (categoryFilter !== 'all' && listing.category !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      return listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const activeFiltersCount = (filter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0);

  if (loading) {
    return <div className="text-center py-20">{t('loading') || 'Загрузка...'}</div>;
  }

  return (
    <div className="min-h-screen">
      <section className="bg-white py-12 md:py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Lost & Found
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-8">
              {t('slogan')}
            </p>
            
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white border-gray-200 rounded-xl focus:border-orange-300"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`gap-2 rounded-xl transition-all ${showFilters ? 'border-orange-500 text-orange-500' : 'border-gray-200'}`}
              >
                <Filter className="w-4 h-4" />
                {t('filters')}
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="flex flex-wrap gap-6 items-end">
                  <div className="text-left">
                    <div className="text-xs text-gray-500 mb-2">{t('listingType')}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                          filter === 'all' 
                            ? 'bg-gray-800 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {t('all')}
                      </button>
                      <button
                        onClick={() => setFilter('lost')}
                        className={`px-4 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                          filter === 'lost' 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        🔍 {t('lost')}
                      </button>
                      <button
                        onClick={() => setFilter('found')}
                        className={`px-4 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                          filter === 'found' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        📦 {t('found')}
                      </button>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-xs text-gray-500 mb-2">{t('category')}</div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-300"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => {
                        setFilter('all');
                        setCategoryFilter('all');
                      }}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                      {t('resetAll')}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center flex-wrap mt-6">
              <Button 
                onClick={() => navigate('/submit?type=lost')}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-5 text-base font-medium shadow-md transition-all"
              >
                🔍 {t('iLost')}
              </Button>
              <Button 
                onClick={() => navigate('/submit?type=found')}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 py-5 text-base font-medium shadow-md transition-all"
              >
                📦 {t('iFound')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{t('latestListings')}</h2>
            <p className="text-sm text-gray-400 mt-1">
              {t('found')}: {filteredListings.length} {t('listings')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card 
              key={listing.id} 
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100"
              onClick={() => navigate(`/listing/${listing.id}`)}
            >
              <div className="relative h-48 bg-gray-100">
                <ImageWithFallback
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium shadow-md ${
                  listing.type === 'lost' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {listing.type === 'lost' ? `🔍 ${t('lost')}` : `📦 ${t('found')}`}
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <span>{getCategoryEmoji(listing.category)}</span>
                  <span>{t(listing.category)}</span>
                </div>
                <h3 className="font-semibold text-base mb-2 line-clamp-1">{listing.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">📍 {listing.location}</p>
                <p className="text-xs text-gray-400 mt-2">
                  📅 {listing.created_at ? new Date(listing.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : t('dateNotSpecified')}
                </p>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <Button 
                  variant="outline" 
                  className="w-full gap-2 rounded-full border-gray-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  {t('details')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">{t('nothingFound')}</p>
            <p className="text-sm text-gray-400 mt-2">{t('tryDifferentSearch')}</p>
          </div>
        )}
      </section>
    </div>
  );
}