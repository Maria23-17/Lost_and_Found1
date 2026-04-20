import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Globe, Menu, Check, User, LogOut, Settings } from 'lucide-react';
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
// ДОБАВИЛ ИМПОРТЫ ДЛЯ ДИАЛОГА
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

  // Достаем данные пользователя
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const isActive = (path: string) => location.pathname === path;

  // Функция самого выхода
  const performLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    setOpen(false);
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
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>

                {/* --- ТВОЙ НОВЫЙ БЛОК ПОДТВЕРЖДЕНИЯ --- */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-muted-foreground hover:text-destructive transition-colors">
                      <LogOut className="h-5 w-5" />
                    </button>
                  </AlertDialogTrigger>
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
                {/* ------------------------------------ */}

              </div>
            ) : (
              <>
                <Link to="/login" className={`hover:text-primary transition-colors ${isActive('/login') ? 'text-primary' : 'text-foreground'}`}>{t('login')}</Link>
                <Link to="/register" className={`hover:text-primary transition-colors ${isActive('/register') ? 'text-primary' : 'text-foreground'}`}>{t('register')}</Link>
              </>
            )}
          </nav>

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
                    /* В мобильном меню можно оставить просто клик для скорости или тоже обернуть в AlertDialog */
                    <button onClick={performLogout} className="flex items-center gap-2 text-lg text-destructive">
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
    </header>
  );
}