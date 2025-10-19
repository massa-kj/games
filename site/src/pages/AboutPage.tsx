import { useTranslation } from 'react-i18next';

function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text mb-8">
        {t('site.nav.about')}
      </h1>

      <div className="space-y-8">
        {/* About this project */}
        <section className="bg-surface rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-text mb-4">
            {t('site.about.aboutSite.title')}
          </h2>
          <p className="text-text-light leading-relaxed mb-4">
            {t('site.about.aboutSite.description1')}
          </p>
          <p className="text-text-light leading-relaxed">
            {t('site.about.aboutSite.description2')}
          </p>
        </section>

        {/* Target Age */}
        <section className="bg-surface rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-text mb-4">
            {t('site.about.targetAge.title')}
          </h2>
          <p className="text-text-light leading-relaxed">
            {t('site.about.targetAge.description')}
          </p>
        </section>

        {/* Features */}
        <section className="bg-surface rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-text mb-4">
            {t('site.about.features.title')}
          </h2>
          <ul className="text-text-light space-y-2">
            <li>• {t('site.about.features.item1')}</li>
            <li>• {t('site.about.features.item2')}</li>
            <li>• {t('site.about.features.item3')}</li>
            <li>• {t('site.about.features.item4')}</li>
            <li>• {t('site.about.features.item5')}</li>
          </ul>
        </section>

        {/* Technical Information */}
        <section className="bg-surface rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-text mb-4">
            {t('site.about.techInfo.title')}
          </h2>
          <p className="text-text-light leading-relaxed mb-4">
            {t('site.about.techInfo.description')}
          </p>
          <ul className="text-text-light space-y-1">
            <li>• React + TypeScript</li>
            <li>• Vite</li>
            <li>• Tailwind CSS</li>
            <li>• i18next</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
