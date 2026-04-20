import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { LayoutDashboard, FileText, Users, Settings, Edit, Trash2, Package, UserCheck, CheckCircle, Clock } from 'lucide-react';

interface Listing {
  id: number;
  type: 'lost' | 'found';
  category: string;
  title: string;
  status: 'active' | 'closed';
  date: string;
}

const mockAdminListings: Listing[] = [
  { id: 1, type: 'lost', category: 'Документы', title: 'Паспорт на имя Иванов А.И.', status: 'active', date: '2026-02-18' },
  { id: 2, type: 'found', category: 'Электроника', title: 'iPhone 13 Pro в синем чехле', status: 'active', date: '2026-02-17' },
  { id: 3, type: 'lost', category: 'Аксессуары', title: 'Золотое кольцо с камнем', status: 'closed', date: '2026-02-16' },
  { id: 4, type: 'found', category: 'Животные', title: 'Черная кошка с белыми лапками', status: 'active', date: '2026-02-15' },
  { id: 5, type: 'lost', category: 'Одежда', title: 'Кожаная куртка черного цвета', status: 'active', date: '2026-02-14' },
];

export function AdminPanel() {
  const { t } = useLanguage();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'listings', label: t('listings'), icon: <FileText className="w-5 h-5" /> },
    { id: 'users', label: t('users'), icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="text-2xl">🔍</div>
            <span className="font-semibold">{t('admin')}</span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-foreground'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {activeMenu === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">{t('dashboard')}</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalListings')}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">248</div>
                  <p className="text-xs text-muted-foreground">+12% с прошлого месяца</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,429</div>
                  <p className="text-xs text-muted-foreground">+8% с прошлого месяца</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('activeListings')}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">187</div>
                  <p className="text-xs text-muted-foreground">75% от всех объявлений</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('resolvedCases')}</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">61</div>
                  <p className="text-xs text-muted-foreground">+23% с прошлого месяца</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Listings Table */}
            <Card>
              <CardHeader>
                <CardTitle>{t('recentListings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>{t('type')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead>{t('title')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAdminListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">#{listing.id}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            listing.type === 'lost' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {listing.type === 'lost' ? t('lost') : t('found')}
                          </span>
                        </TableCell>
                        <TableCell>{listing.category}</TableCell>
                        <TableCell>{listing.title}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            listing.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {t(listing.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeMenu === 'listings' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">{t('listings')}</h1>
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Здесь будет полный список объявлений</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeMenu === 'users' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">{t('users')}</h1>
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Здесь будет список пользователей</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeMenu === 'settings' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">{t('settings')}</h1>
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Здесь будут настройки системы</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}