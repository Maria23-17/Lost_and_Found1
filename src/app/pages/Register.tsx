import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { registerUser } from "../../api/auth";

export function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      navigate("/login", { state: { message: "Регистрация успешна! Войдите в аккаунт." } });
    } catch (err: any) {
      setError(err.message || "Ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold mb-2">{t("registerTitle") || "Регистрация"}</h1>
            <p className="text-muted-foreground">{t("registerSubtitle") || "Создайте аккаунт"}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 border border-red-200 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Поле Имя - ID должен быть "name" */}
            <div className="space-y-2">
              <Label htmlFor="name">{t("name") || "Имя"}</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email") || "Email"}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
  <Label htmlFor="phone">{t("phone") || "Телефон"}</Label>
  <Input
    id="phone"
    type="tel"
    placeholder="+7 (999) 123-45-67"
    value={formData.phone}
    onChange={(e) => {
      const value = e.target.value;
      // Разрешаем только цифры, +, -, пробелы, скобки
      if (/^[\d+\-\s\(\)]*$/.test(value)) {
        setFormData({ ...formData, phone: value });
      }
    }}
    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
  />
</div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password") || "Пароль"}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword") || "Подтвердите пароль"}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={loading}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
              style={{ backgroundColor: "var(--blue)", color: "white" }}
            >
              {loading ? "Загрузка..." : (t("registerButton") || "Зарегистрироваться")}
            </Button>
          </form>

          <div className="text-center mt-4">
  <span className="text-sm text-gray-600">
    {t("haveAccount")}{" "}
  </span>
  <Link to="/login" className="text-sm text-blue-600 hover:underline font-medium">
    {t("loginLink")}
  </Link>
</div>
          
        </div>
      </div>
    </div>
  );
}