import { t, Language } from '../../i18n/translations'

interface FooterSectionProps {
  language: Language
}

export default function FooterSection({ language }: FooterSectionProps) {
  return (
    <footer className='footer' style={{ background: '#000000', paddingTop: '100px', paddingBottom: '20px' }}>
      <div className='max-w-[1200px] mx-auto px-6 pt-6 pb-2'>
        {/* Brand */}
        <div className='flex items-center gap-3 mb-8'>
          <img src='/images/nexus/NEXUS-white-logo.webp' alt='Nexus Logo' className='h-12' />
        </div>

        {/* Multi-link columns */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-8'>
          <div>
            <h3
              className='text-sm font-semibold mb-3'
              style={{ color: '#EAECEF' }}
            >
              {t('links', language)}
            </h3>
            <ul className='space-y-2 text-sm' style={{ color: '#848E9C' }}>
              <li>
                <a
                  className='hover:text-[#E781FD]'
                  href='https://olaxbt.xyz/'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  OLAXBT Agent
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#E781FD]'
                  href='https://olaxbt-docs.gitbook.io/'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Whitepaper
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#E781FD]'
                  href='#'
                >
                  Announcement
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className='text-sm font-semibold mb-3'
              style={{ color: '#EAECEF' }}
            >
              {t('resources', language)}
            </h3>
            <ul className='space-y-2 text-sm' style={{ color: '#848E9C' }}>
              <li>
                <a
                  className='hover:text-[#E781FD]'
                  href='https://x.com/olaxbt'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  X (Twitter)
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#E781FD]'
                  href='https://t.me/OLAXBT_Community'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#E781FD]'
                  href='https://github.com/olaxbt'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div className='footer-social'>
            <div className='social-icons flex gap-4'>
              <a href='https://x.com/olaxbt' target='_blank' rel='noopener noreferrer' className='social-icon w-8' title='X (Twitter)'>
                <img src='/images/nexus/footer/Twitter-icon.png' alt='Twitter' className='w-full' />
              </a>
              <a href='https://t.me/OLAXBT_Community' target='_blank' rel='noopener noreferrer' className='social-icon w-8' title='Telegram'>
                <img src='/images/nexus/footer/telegram.png' alt='Telegram' className='w-full' />
              </a>
              <a href='https://github.com/olaxbt' target='_blank' rel='noopener noreferrer' className='social-icon w-8' title='GitHub'>
                <img src='/images/nexus/footer/github.png' alt='GitHub' className='w-full' />
              </a>
              <a href='https://www.youtube.com/@olaxbt' target='_blank' rel='noopener noreferrer' className='social-icon w-8' title='YouTube'>
                <img src='/images/nexus/footer/youtube-icon.png' alt='YouTube' className='w-full' />
              </a>
              <a href='https://www.linkedin.com/company/olaxbt/' target='_blank' rel='noopener noreferrer' className='social-icon w-8' title='LinkedIn'>
                <img src='/images/nexus/footer/linkedin.png' alt='LinkedIn' className='w-full' />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom note (kept subtle) */}
        <div
          className='pt-6 mt-8 text-left italic'
          style={{ color: '#727272', fontStyle: 'italic' }}
        >
          OLAXBT © 2025. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
