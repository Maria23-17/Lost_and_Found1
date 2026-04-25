import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Globe, Menu, Check, User, LogOut, Settings, FileText, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from './ui/sheet';
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
} from "./ui/alert-dialog";
import { useState } from 'react';

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const isActive = (path: string) => location.pathname === path;

  const performLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    setUserMenuOpen(false);
    setLogoutDialogOpen(false);
  };

  // Закрываем меню при клике вне
  const handleMenuClose = () => {
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl">🔍</div>
            <span className="text-lg md:text-xl font-semibold text-foreground">
              {t('siteName')}
            </span>
          </Link>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/how-it-works" 
              className={`hover:text-primary transition-colors ${isActive('/how-it-works') ? 'text-primary' : 'text-foreground'}`}
            >
              {t('howItWorks')}
            </Link>
            <Link 
              to="/" 
              className={`hover:text-primary transition-colors ${isActive('/') ? 'text-primary' : 'text-foreground'}`}
            >
              {t('home')}
            </Link>
            
            <Link to="/submit">
              <Button style={{ backgroundColor: 'var(--orange)', color: 'white' }} className="hover:opacity-90">
                {t('submitListingTitle')}
              </Button>
            </Link>

            {/* ДИНАМИЧЕСКИЙ БЛОК: Кнопки или Профиль */}
            {user ? (
              <div className="flex items-center gap-4 border-l pl-6 ml-2">
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                      <Settings className="h-4 w-4" />
                      Админ
                    </Button>
                  </Link>
                )}
                
                {/* ИКОНКА ПРОФИЛЯ - ДИЗАЙН КАК БЫЛ */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>

                  {/* КРАСИВОЕ ВЫПАДАЮЩЕЕ МЕНЮ */}
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={handleMenuClose}
                      />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
                        {/* Информация о пользователе */}
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Пункты меню */}
                        <div className="py-2">
                          <Link
                            to="/my-listings"
                            onClick={handleMenuClose}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">Мои объявления</span>
                          </Link>
                        </div>

                        {/* Кнопка выхода */}
                        <div className="border-t pt-2 pb-2">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setLogoutDialogOpen(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">Выйти из аккаунта</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className={`hover:text-primary transition-colors ${isActive('/login') ? 'text-primary' : 'text-foreground'}`}>{t('login')}</Link>
                <Link to="/register" className={`hover:text-primary transition-colors ${isActive('/register') ? 'text-primary' : 'text-foreground'}`}>{t('register')}</Link>
              </>
            )}
          </nav>

          {/* Правая панель */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-md border border-input bg-background h-10 w-10">
                  <Globe className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {['ru', 'uz', 'en'].map((lang) => (
                  <DropdownMenuItem key={lang} onClick={() => setLanguage(lang as any)}>
                    <span className="flex items-center justify-between w-full uppercase">
                      <span>{lang === 'ru' ? 'Русский' : lang === 'uz' ? "O'zbek" : 'English'}</span>
                      {language === lang && <Check className="h-4 w-4 ml-2" />}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button className="inline-flex items-center justify-center rounded-md border border-input bg-background h-10 w-10">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-8">
                  {user && (
                    <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg mb-4">
                      <User className="h-6 w-6" />
                      <div>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">{user.role}</p>
                      </div>
                    </div>
                  )}

                  <Link to="/" onClick={() => setOpen(false)} className={`text-lg ${isActive('/') ? 'text-primary' : ''}`}>{t('home')}</Link>
                  <Link to="/how-it-works" onClick={() => setOpen(false)} className={`text-lg ${isActive('/how-it-works') ? 'text-primary' : ''}`}>{t('howItWorks')}</Link>
                  
                  {user && (
                    <Link to="/my-listings" onClick={() => setOpen(false)} className="text-lg">
                      📋 Мои объявления
                    </Link>
                  )}
                  
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="text-lg text-amber-600 font-bold">Панель управления</Link>
                  )}

                  <Link to="/submit" onClick={() => setOpen(false)}>
                    <Button style={{ backgroundColor: 'var(--orange)', color: 'white' }} className="w-full">
                      {t('submitListingTitle')}
                    </Button>
                  </Link>

                  <div className="h-px bg-border my-2" />

                  {!user ? (
                    <>
                      <Link to="/login" onClick={() => setOpen(false)} className="text-lg">{t('login')}</Link>
                      <Link to="/register" onClick={() => setOpen(false)} className="text-lg">{t('register')}</Link>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        setOpen(false);
                        setLogoutDialogOpen(true);
                      }} 
                      className="flex items-center gap-2 text-lg text-destructive"
                    >
                      <LogOut className="h-5 w-5" />
                      Выйти
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Диалог подтверждения выхода */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Выход из системы</AlertDialogTitle>
            <AlertDialogDescription>
              Вы точно хотите выйти? Чтобы снова подавать объявления, вам придется войти в аккаунт.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={performLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}