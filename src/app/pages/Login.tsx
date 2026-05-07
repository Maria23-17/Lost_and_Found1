import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Send, Mail, Loader2 } from "lucide-react";
import { loginUser } from "../../api/auth";

export function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginUser({ 
        email: formData.emailOrPhone, 
        password: formData.password 
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Вход выполнен:", data);

      if (data.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }
      
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при входе");
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
            <h1 className="text-3xl font-bold mb-2">{t("loginTitle")}</h1>
            <p className="text-muted-foreground">{t("loginSubtitle")}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 border border-red-200 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">{t("emailOrPhone")}</Label>
              <Input
                id="emailOrPhone"
                type="text"
                placeholder={t('enter') + ' ' + t('emailOrPhone').toLowerCase()}
                value={formData.emailOrPhone}
                onChange={(e) =>
                  setFormData({ ...formData, emailOrPhone: e.target.value })
                }
                required
                disabled={loading}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('enter') + ' ' + t('password').toLowerCase()}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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
              style={{
                backgroundColor: "var(--blue)",
                color: "white",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loading...") || "Загрузка..."}
                </>
              ) : (
                t("loginButton")
              )}
            </Button>

            <div className="flex justify-between items-center">
              <div className="text-left">
                <span className="text-sm text-gray-600">
                  {t("noAссount")}{" "}
                </span>
                <Link to="/register" className="text-sm text-blue-600 hover:underline font-medium">
                  {t("registerLink")}
                </Link>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  {t("forgotPassword")}
                </button>
              </div>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-muted-foreground">
                {t("asWellAs")}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-[#0088cc] text-white hover:bg-[#0077b3] border-0"
              onClick={() => window.open("https://t.me/LostFoundAgentBot", "_blank")}
            >
              <Send className="w-5 h-5 mr-2" />
              {t("ourTelegramBot")}
            </Button>

          </div>        
        </div>
      </div>
    </div>
  );
}