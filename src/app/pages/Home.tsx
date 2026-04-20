import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Search, Upload, Bell, CheckCircle, FileText, Smartphone, Shirt, Watch, PawPrint, Package, Send } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Получаем данные с API
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

  // Фильтрация по типу и поисковый запрос
  const filteredListings = listings.filter(listing => {
    const matchesType = filter === 'all' || listing.type === filter;
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return <div className="text-center py-20">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6">Lost & Found</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
              {t(`slogan`)}
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-4 mb-6 md:mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 md:h-14 bg-white border-2"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg"
                onClick={() => navigate('/submit?type=lost')}
                style={{ backgroundColor: 'var(--orange)', color: 'white' }}
                className="hover:opacity-90 text-base md:text-lg px-6 md:px-8"
              >
                {t('iLost')}
              </Button>
              <Button 
                size="lg"
                onClick={() => navigate('/submit?type=found')}
                style={{ backgroundColor: 'var(--blue)', color: 'white' }}
                className="hover:opacity-90 text-base md:text-lg px-6 md:px-8"
              >
                {t('iFound')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{t('latestListings')}</h2>
          <Button variant="link" className="text-primary">
            {t('viewAll')} →
          </Button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? '' : 'hover:bg-accent'}
          >
            {t('showAll')}
          </Button>
          <Button
            variant={filter === 'lost' ? 'default' : 'outline'}
            onClick={() => setFilter('lost')}
            style={filter === 'lost' ? { backgroundColor: 'var(--orange)', color: 'white' } : {}}
            className={filter === 'lost' ? 'hover:opacity-90' : 'hover:bg-accent'}
          >
            {t('showLost')}
          </Button>
          <Button
            variant={filter === 'found' ? 'default' : 'outline'}
            onClick={() => setFilter('found')}
            style={filter === 'found' ? { backgroundColor: 'var(--blue)', color: 'white' } : {}}
            className={filter === 'found' ? 'hover:opacity-90' : 'hover:bg-accent'}
          >
            {t('showFound')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <ImageWithFallback
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                  listing.type === 'lost' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {listing.type === 'lost' ? t('lost') : t('found')}
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  {getCategoryIcon(listing.category)}
                  <span className="text-sm">{t(listing.category)}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                <p className="text-sm text-muted-foreground">{listing.location}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(listing.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long', year: 'numeric' , 
                  hour: '2-digit', minute: '2-digit'
                  })}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  {t('contact')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* ...остальные секции остаются без изменений */}
    </div>
  );
}