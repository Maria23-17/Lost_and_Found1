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

  const handleMenuClose = () => {
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <span className="text-white text-xl">🔍</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              {t('siteName')}
            </span>
          </Link>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/how-it-works" 
              className={`text-gray-600 hover:text-orange-500 transition-colors relative group ${isActive('/how-it-works') ? 'text-orange-500' : ''}`}
            >
              {t('howItWorks')}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${isActive('/how-it-works') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link 
              to="/" 
              className={`text-gray-600 hover:text-orange-500 transition-colors relative group ${isActive('/') ? 'text-orange-500' : ''}`}
            >
              {t('home')}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            
            <Link to="/submit">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                {t('submitListingTitle')}
              </Button>
            </Link>

            {/* Профиль */}
            {user ? (
              <div className="flex items-center gap-4 border-l pl-6 ml-2">
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                      <Settings className="h-4 w-4" />
                      {t('adminPanel')}
                    </Button>
                  </Link>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={handleMenuClose} />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            to="/my-listings"
                            onClick={handleMenuClose}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{t('myListings')}</span>
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 pt-2 pb-2">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setLogoutDialogOpen(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">{t('logoutfromaccount')}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-orange-500 transition-colors">{t('login')}</Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Правая панель */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm h-10 w-10 hover:bg-gray-50 transition-colors">
                  <Globe className="h-5 w-5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md border-gray-100 rounded-xl shadow-lg">
                {['ru', 'uz', 'en'].map((lang) => (
                  <DropdownMenuItem key={lang} onClick={() => setLanguage(lang as any)} className="cursor-pointer hover:bg-orange-50 transition-colors">
                    <span className="flex items-center justify-between w-full">
                      <span>{lang === 'ru' ? 'Русский' : lang === 'uz' ? "O'zbek" : 'English'}</span>
                      {language === lang && <Check className="h-4 w-4 ml-2 text-orange-500" />}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm h-10 w-10">
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
              </SheetTrigger>
              <SheetContent className="bg-white/95 backdrop-blur-md">
                <nav className="flex flex-col gap-4 mt-8">
                  {user && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 uppercase">{user.role}</p>
                      </div>
                    </div>
                  )}

                  <Link to="/" onClick={() => setOpen(false)} className={`text-lg ${isActive('/') ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}>
                    {t('home')}
                  </Link>
                  <Link to="/how-it-works" onClick={() => setOpen(false)} className={`text-lg ${isActive('/how-it-works') ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}>
                    {t('howItWorks')}
                  </Link>
                  
                  {user && (
                    <Link to="/my-listings" onClick={() => setOpen(false)} className="text-lg text-gray-700">
                      📋 {t('myListings')}
                    </Link>
                  )}
                  
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="text-lg text-amber-600 font-bold">
                      Панель управления
                    </Link>
                  )}

                  <Link to="/submit" onClick={() => setOpen(false)}>
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-full rounded-full py-2">
                      {t('submitListingTitle')}
                    </Button>
                  </Link>

                  <div className="h-px bg-gray-200 my-2" />

                  {!user ? (
                    <>
                      <Link to="/login" onClick={() => setOpen(false)} className="text-lg text-gray-700">{t('login')}</Link>
                      <Link to="/register" onClick={() => setOpen(false)} className="text-lg text-gray-700">{t('register')}</Link>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        setOpen(false);
                        setLogoutDialogOpen(true);
                      }} 
                      className="flex items-center gap-2 text-lg text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      {t('logout')}
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('logoutfromaccount')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('areYouSureToLogOut')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={performLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 rounded-full hover:shadow-md transition-all"
            >
              {t('logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}