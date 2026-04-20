import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router";
import { Send, Mail, Phone } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">🔍</div>
              <span className="font-semibold">
                {t("siteName")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footerAboutText")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:text-primary"
                >
                  {t("howItWorks")}
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/submit"
                  className="hover:text-primary"
                >
                  {t("submitListingTitle")}
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-primary"
                >
                  {t("login")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">
              {t("contacts")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <a
                  href="https://t.me/LostFoundAgentBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  @LostFoundAgentBot
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@lostandfound.uz</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+998870015982</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            © 2026 Lost & Found Bureau. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}