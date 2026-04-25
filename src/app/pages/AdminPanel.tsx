import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { LayoutDashboard, FileText, Users, Settings, Trash2, Package, UserCheck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Listing {
  id: number;
  type: 'lost' | 'found';
  category: string;
  title: string;
  status: 'active' | 'closed' | 'pending';
  date: string;
  created_at?: string;
  user_name?: string;
  description?: string;
  image?: string;
  location?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  listings_count: number;
  created_at: string;
}

interface Report {
  id: number;
  listing_id: number;
  listing_title: string;
  reporter_name: string;
  reporter_email: string;
  reason: string;
  status: string;
  created_at: string;
}

export function AdminPanel() {
  const { t } = useLanguage();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalUsers: 0,
    activeListings: 0,
    resolvedCases: 0,
    pendingListings: 0
  });

  const openImageViewer = (imageUrl: string) => {
    setSelectedImage(`http://localhost:5000${imageUrl}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadStats();
    loadListings();
  }, []);

  useEffect(() => {
    if (activeMenu === 'users') {
      loadUsers();
    }
    if (activeMenu === 'reports') {
      loadReports();
    }
  }, [activeMenu]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/listings?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setListings(data.data || []);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const listing = listings.find(l => l.id === id);
      const response = await fetch(`http://localhost:5000/api/admin/listings/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...listing, status: newStatus })
      });
      if (response.ok) {
        loadListings();
        loadStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteListing = async (id: number) => {
    if (!confirm(t('confirmDelete') || 'Удалить объявление?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadListings();
      loadStats();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const updateUserRole = async (id: number, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const user = users.find(u => u.id === id);
      await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...user, role: newRole })
      });
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const banUser = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    const actionText = newStatus === 'banned' ? t('ban') : t('unban');
    if (!confirm(`${actionText} ${t('user')}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/users/${id}/ban`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      loadUsers();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const updateReportStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/reports/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      loadReports();
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'listings', label: t('listings'), icon: <FileText className="w-5 h-5" /> },
    { id: 'users', label: t('users'), icon: <Users className="w-5 h-5" /> },
    { id: 'reports', label: t('reports'), icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="text-2xl">🔍</div>
            <span className="font-semibold">{t('adminPanel')}</span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMenu === item.id
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
        {/* Dashboard */}
        {activeMenu === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">{t('dashboard')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalListings')}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalListings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('activeListings')}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeListings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('resolvedCases')}</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.resolvedCases}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('recentListings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>{t('photo')}</TableHead>
                      <TableHead>{t('type')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead>{t('title')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center">{t('loading')}</TableCell></TableRow>
                    ) : listings.slice(0, 5).map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">#{listing.id}</TableCell>
                        <TableCell>
                          {listing.image ? (
                            <img 
                              src={`http://localhost:5000${listing.image}`} 
                              alt={listing.title}
                              className="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80"
                              onClick={() => openImageViewer(listing.image)}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-lg">
                              {listing.type === 'lost' ? '🔍' : '📦'}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            listing.type === 'lost' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {listing.type === 'lost' ? t('lost') : t('found')}
                          </span>
                        </TableCell>
                        <TableCell>{listing.category}</TableCell>
                        <TableCell>
                          <p className="font-medium">{listing.title}</p>
                          <p className="text-xs text-gray-500">{listing.location}</p>
                        </TableCell>
                        <TableCell>
                          <select
                            value={listing.status}
                            onChange={(e) => updateStatus(listing.id, e.target.value)}
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              listing.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                              listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            <option value="pending">{t('pending')}</option>
                            <option value="active">{t('active')}</option>
                            <option value="closed">{t('closed')}</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {listing.status === 'pending' && (
                              <button onClick={() => updateStatus(listing.id, 'active')} className="text-green-600 hover:text-green-800" title={t('approve')}>
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => deleteListing(listing.id)} className="text-red-600 hover:text-red-800" title={t('delete')}>
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* Listings */}
        {activeMenu === 'listings' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">{t('allListings')}</h1>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>{t('photo')}</TableHead>
                      <TableHead>{t('type')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead>{t('title')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('author')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="text-center">{t('loading')}</TableCell></TableRow>
                    ) : listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">#{listing.id}</TableCell>
                        <TableCell>
                          {listing.image ? (
                            <img 
                              src={`http://localhost:5000${listing.image}`} 
                              alt={listing.title}
                              className="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80"
                              onClick={() => openImageViewer(listing.image)}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-lg">
                              {listing.type === 'lost' ? '🔍' : '📦'}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            listing.type === 'lost' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {listing.type === 'lost' ? t('lost') : t('found')}
                          </span>
                        </TableCell>
                        <TableCell>{listing.category}</TableCell>
                        <TableCell>
                          <p className="font-medium">{listing.title}</p>
                          <p className="text-xs text-gray-500">{listing.location}</p>
                        </TableCell>
                        <TableCell>
                          <select
                            value={listing.status}
                            onChange={(e) => updateStatus(listing.id, e.target.value)}
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              listing.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                              listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            <option value="pending">{t('pending')}</option>
                            <option value="active">{t('active')}</option>
                            <option value="closed">{t('closed')}</option>
                          </select>
                        </TableCell>
                        <TableCell>{listing.user_name || `User #${listing.user_id}`}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button onClick={() => deleteListing(listing.id)} className="text-red-600 hover:text-red-800" title={t('delete')}>
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* Users */}
        {activeMenu === 'users' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">{t('users')}</h1>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>{t('phone')}</TableHead>
                      <TableHead>{t('role')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('listingsCount')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingUsers ? (
                      <TableRow><TableCell colSpan={8} className="text-center">{t('loading')}</TableCell></TableRow>
                    ) : users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">#{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="px-2 py-1 rounded text-sm border border-gray-300"
                          >
                            <option value="user">{t('user')}</option>
                            <option value="moderator">{t('moderator')}</option>
                            <option value="admin">{t('admin')}</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'banned' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.status === 'banned' ? t('banned') : t('activeStatus')}
                          </span>
                        </TableCell>
                        <TableCell>{user.listings_count || 0}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => banUser(user.id, user.status)}
                            className={`px-2 py-1 rounded text-xs ${
                              user.status === 'banned' 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {user.status === 'banned' ? t('unban') : t('ban')}
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports */}
        {activeMenu === 'reports' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">{t('reports')}</h1>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>{t('listing')}</TableHead>
                      <TableHead>{t('reportedBy')}</TableHead>
                      <TableHead>{t('reason')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingReports ? (
                      <TableRow><TableCell colSpan={7} className="text-center">{t('loading')}</TableCell></TableRow>
                    ) : reports.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center">{t('noReports')}</TableCell></TableRow>
                    ) : (
                      reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">#{report.id}</TableCell>
                          <TableCell>
                            <button 
                              onClick={() => {
                                setActiveMenu('listings');
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              {report.listing_title}
                            </button>
                          </TableCell>
                          <TableCell>{report.reporter_name || report.reporter_email}</TableCell>
                          <TableCell className="max-w-xs">{report.reason}</TableCell>
                          <TableCell>
                            <select
                              value={report.status}
                              onChange={(e) => updateReportStatus(report.id, e.target.value)}
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                report.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                report.status === 'reviewed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                'bg-green-100 text-green-800 border-green-200'
                              }`}
                            >
                              <option value="pending">{t('pendingReport')}</option>
                              <option value="reviewed">{t('reviewed')}</option>
                              <option value="resolved">{t('resolved')}</option>
                            </select>
                          </TableCell>
                          <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <button 
                              onClick={() => {
                                if (confirm(t('confirmDelete'))) {
                                  deleteListing(report.listing_id);
                                }
                              }}
                              className="text-red-600 hover:text-red-800"
                              title={t('delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings */}
        {activeMenu === 'settings' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">{t('settings')}</h1>
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">{t('settingsInDevelopment')}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Модальное окно для фото */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
            <img 
              src={selectedImage} 
              alt="Просмотр"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}