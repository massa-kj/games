import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@core/ui';
import { useSettings } from '@core/hooks';

function Header() {
  const { t } = useTranslation();
  const { settings } = useSettings();

  return (
    <header className="bg-bg-secondary shadow-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-decoration-none">
            <h1 className="text-3xl font-bold text-text hover:text-primary transition-colors">
              {t('site.title')}
            </h1>
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/settings">
              <Button variant="secondary" size="sm">
                {t('site.nav.settings')}
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="sm">
                {t('site.nav.about')}
              </Button>
            </Link>
          </nav>
        </div>

        <p className="text-text-light mt-2 text-center">
          {t('site.subtitle')}
        </p>
      </div>
    </header>
  );
}

export default Header;
