import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Send, Mail, UserPlus } from "lucide-react";
import { registerUser } from "../../api/auth";

export function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // ИСПРАВЛЕНО: Ключи теперь называются name и email (как на бэкенде)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация почты
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Введите корректный email");
      return;
    }

    // Валидация пароля
    if (formData.password.length < 6) {
      alert("Пароль должен быть длиннее 5 символов");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }

    try {
      // Отправляем данные (теперь ключи совпадут с деструктуризацией на сервере)
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert("Регистрация прошла успешно!");
      navigate("/login");
    } catch (error: any) {
      alert(error.message || "Ошибка при регистрации");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📝</div>
            <h1 className="text-3xl font-bold mb-2">Создать аккаунт</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Поле Имя - ID должен быть "name" */}
            <div className="space-y-2">
              <Label htmlFor="name">Полное имя</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Поле Email - ID должен быть "email" */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Поле Пароль */}
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Подтверждение пароля */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2 bg-blue-600 text-white">
              <UserPlus className="w-5 h-5 mr-2" />
              Зарегистрироваться
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}