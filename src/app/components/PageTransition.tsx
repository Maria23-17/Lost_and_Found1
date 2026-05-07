import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransition() {
  const location = useLocation();

  useEffect(() => {
    // Плавный скролл вверх при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Добавляем класс анимации к main
    const main = document.querySelector('main');
    if (main) {
      main.classList.add('page-transition');
      const timer = setTimeout(() => {
        main.classList.remove('page-transition');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return null;
}