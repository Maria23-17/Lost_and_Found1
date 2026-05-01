// src/app/components/UserMenu.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, FileText, LogOut, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';

export function UserMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  if (!user) return null;

  // Получаем первую букву имени для аватара
  const getInitial = () => {
    return user.name ? user.name.charAt(0).toUpperCase() : '?';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          {/* Это и есть иконка профиля */}
          <Avatar>
            <AvatarFallback>
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline-block">
            {user.name}
          </span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Пункт "Мой профиль" */}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Мой профиль</span>
          </Link>
        </DropdownMenuItem>
        
        {/* Пункт "Мои объявления" - ЭТО ТО, ЧТО НАМ НУЖНО */}
        <DropdownMenuItem asChild>
          <Link to="/my-listings" className="cursor-pointer flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Мои объявления</span>
          </Link>
        </DropdownMenuItem>
        
        {/* Если админ - показываем админку */}
        {user.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Админ панель</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}