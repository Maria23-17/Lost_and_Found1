// src/api/auth.js

/**
 * Функция для авторизации пользователя
 * @param {Object} credentials - Объект с email и password
 */
export const loginUser = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // credentials должен содержать { email: "...", password: "..." }
        body: JSON.stringify(credentials),
      });
   
      const data = await response.json();
  
      if (!response.ok) {
        // Пробрасываем ошибку из бэкенда (например, "Неверный пароль")
        throw new Error(data.error || 'Ошибка при входе');
      }
  
      return data; // Возвращает { token, user }
    } catch (error) {
      console.error('Login API Error:', error);
      throw error;
    }
  };
  
  /**
   * Функция для регистрации нового пользователя
   */
  export const registerUser = async (userData) => {
    try {
      // Добавьте http://localhost:5000 перед путем
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }
  
      return data;
    } catch (error) {
      console.error('Register API Error:', error);
      throw error;
    }
  };