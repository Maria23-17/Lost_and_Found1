import React from "react";
import { createBrowserRouter, Outlet } from 'react-router-dom'; // Рекомендую использовать react-router-dom
import { Home } from './pages/Home';
import { SubmitListing } from './pages/SubmitListing';
import { HowItWorks } from './pages/HowItWorks';
import { Login } from './pages/Login';
import { Register } from './pages/Register'; 
import { AdminPanel } from './pages/AdminPanel';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CatMascot } from './components/CatMascot';
import { ProtectedRoute } from './components/ProtectedRoute'; 
import { MyListings } from './pages/MyListings';  
import { ListingDetail } from './pages/ListingDetail';
import { Profile } from './pages/Profile';    


function RootLayout() {
  return (
    <div 
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1658579126739-03385cb1749b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGJsdWUlMjBncmFkaWVudCUyMGJhY2tncm91bmQlMjBwYXR0ZXJufGVufDF8fHx8MTc3MTUxOTk5MXww&ixlib=rb-4.1.0&q=80&w=1080)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Твой маскот всегда на месте */}
      <CatMascot />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // 1. Публичные роуты
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'how-it-works',
        element: <HowItWorks />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,  
      },
      {
        path: 'listing/:id',
        element: <ListingDetail />,
      },

      // 2. Роуты только для авторизованных пользователей
      {
        element: <ProtectedRoute />, 
        children: [
          {
            path: 'submit',
            element: <SubmitListing />,
          },

          {
            path: 'profile',
            element: <Profile />,
          },
          {
            path: 'my-listings',
            element: <MyListings />,
          },
          
        ],
      },

      // 3. Роуты ТОЛЬКО для АДМИНА
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          {
            path: 'admin',
            element: <AdminPanel />,
          },
        ],
      },

      // 4. Ошибка 404
      {
        path: '*',
        element: (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white/30 backdrop-blur-md">
            <h1 className="text-6xl mb-4">🐱</h1>
            <h1 className="text-3xl font-bold">404 - Страница не найдена</h1>
            <p className="mt-2 text-muted-foreground">Кот искал, но не нашел...</p>
          </div>
        ),
      },
    ],
  },
]);