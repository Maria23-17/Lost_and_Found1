import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, Lock } from 'lucide-react'; // Добавили иконку Lock

export function SubmitListing() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');

  // --- ЛОГИКА ПРОВЕРКИ АВТОРИЗАЦИИ ---
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  // ----------------------------------

  const [formData, setFormData] = useState({
    type: typeFromUrl || 'lost',
    category: '',
    title: '',
    description: '',
    location: '',
    phone: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Если пользователя нет, возвращаем экран-заглушку
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm text-center border">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Вход не выполнен
          </h2>
          <p className="text-muted-foreground mb-8">
            Чтобы опубликовать объявление в системе «Lost and Found», пожалуйста, войдите в свой аккаунт или зарегистрируйтесь.
          </p>
          <div className="grid gap-3">
            <Button 
              onClick={() => navigate('/login')}
              style={{ backgroundColor: 'var(--orange)', color: 'white' }}
            >
              Войти в аккаунт
            </Button>
            <Button variant="outline" onClick={() => navigate('/register')}>
              Регистрация
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Вернуться на главную
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      alert("Пожалуйста, выберите категорию");
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('location', formData.location);
    data.append('phone', formData.phone);
    data.append('type', formData.type);
    data.append('user_id', user.id); // Передаем ID автора объявления

    if (selectedFile) {
      data.append('photo', selectedFile);
    }

    try {
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          // Если твой бэкенд требует токен для защиты маршрута:
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data,
      });

      if (response.ok) {
        alert('Успешно опубликовано!');
        navigate('/');
      } else {
        alert('Ошибка при публикации');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <div className="flex items-center gap-3 mb-8">
               <span className="p-2 bg-primary/10 rounded-lg text-primary text-xl">📝</span>
               <h1 className="text-3xl font-bold">{t('submitListingTitle')}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Тип объявления */}
              <div className="space-y-3">
                <Label>{t('listingType')}</Label>
                <RadioGroup 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lost" id="lost" />
                    <Label htmlFor="lost" className="cursor-pointer font-normal">{t('lost')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="found" id="found" />
                    <Label htmlFor="found" className="cursor-pointer font-normal">{t('found')}</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Категория */}
              <div className="space-y-3">
                <Label htmlFor="category">{t('category')}</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" className="bg-white">
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="documents">{t('documents')}</SelectItem>
                    <SelectItem value="electronics">{t('electronics')}</SelectItem>
                    <SelectItem value="clothing">{t('clothing')}</SelectItem>
                    <SelectItem value="accessories">{t('accessories')}</SelectItem>
                    <SelectItem value="pets">{t('pets')}</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Заголовок */}
              <div className="space-y-3">
                <Label htmlFor="title">{t('title')}</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder={t('titlePlaceholder')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Описание */}
              <div className="space-y-3">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              {/* Местоположение */}
              <div className="space-y-3">
                <Label htmlFor="location">{t('location')}</Label>
                <Input
                  id="location"
                  placeholder={t('locationPlaceholder')}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              {/* Телефон */}
              <div className="space-y-3">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              {/* Загрузка фото */}
              <div className="space-y-3">
                <Label htmlFor="photo">{t('uploadPhoto')}</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-gray-50 hover:bg-white hover:border-primary transition-all cursor-pointer group">
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="photo" className="cursor-pointer block">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    {selectedFile ? (
                      <p className="text-sm font-medium text-primary">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mb-1">Нажмите для загрузки фото</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG до 10MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg"
                className="w-full text-lg shadow-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--orange)', color: 'white' }}
              >
                {t('submitButton')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}