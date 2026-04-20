import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Upload, Bell, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 text-foreground">{t('howItWorksTitle')}</h1>
          <p className="text-xl text-center mb-16 text-foreground/80">
            {t('howItWorksSubtitle')}
          </p>

          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center">
                  <Upload className="w-16 h-16" style={{ color: 'var(--orange)' }} />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-4 py-1 bg-orange-500 text-white rounded-full text-sm font-medium mb-4">
                  {t('step1')}
                </div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">{t('step1Title')}</h2>
                <p className="text-lg mb-4 text-foreground/90">
                  {t('step1Desc')}
                </p>
                <p className="text-foreground/80">
                  {t('step1Details')}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="w-16 h-16" style={{ color: 'var(--blue)' }} />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-4 py-1 bg-blue-500 text-white rounded-full text-sm font-medium mb-4">
                  {t('step2')}
                </div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">{t('step2Title')}</h2>
                <p className="text-lg mb-4 text-foreground/90">
                  {t('step2Desc')}
                </p>
                <p className="text-foreground/80">
                  {t('step2Details')}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-4 py-1 bg-green-600 text-white rounded-full text-sm font-medium mb-4">
                  {t('step3')}
                </div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">{t('step3Title')}</h2>
                <p className="text-lg mb-4 text-foreground/90">
                  {t('step3Desc')}
                </p>
                <p className="text-foreground/80">
                  {t('step3Details')}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">{t('readyToStart')}</h3>
            <p className="text-foreground/80 mb-6">
              {t('readyToStartDesc')}
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/submit')}
              style={{ backgroundColor: 'var(--orange)', color: 'white' }}
              className="hover:opacity-90"
            >
              {t('submitListingTitle')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}