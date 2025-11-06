import { motion } from 'framer-motion'
import { Language } from '../../i18n/translations'

interface HeroSectionProps {
  language: Language
}

export default function HeroSection({ }: HeroSectionProps) {
  return (
    <section className='hero-section relative h-screen lg:pt-[76px] sm:pt-[64px] overflow-hidden' style={{ background: '#0d080e' }}>
      {/* Grid Background */}
      <div 
        className='absolute inset-0 z-0'
        style={{
          backgroundImage: `
            linear-gradient(#292929 1px, transparent 2px),
            linear-gradient(90deg, #292929 1px, transparent 2px)
          `,
          backgroundSize: '155px 155px'
        }}
      />
      
      {/* Hero Background Image */}
      <div 
        className='hero-bg absolute inset-0 z-1'
        style={{
          backgroundImage: 'url(/images/nexus/section1/section-1-bg-new.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat-y',
          opacity: 0.75
        }}
      />

      {/* Rotating Abstract Graphic */}
      <div className='abstract-graphic absolute right-0 bottom-0 z-1 overflow-hidden' 
        style={{
          transform: 'translateY(50%) translateX(50%)',
          width: '180vh',
          height: '180vh'
        }}
      >
        <img 
          src='/images/nexus/section1/rotating-data-layer.png' 
          alt='rotating-data-layer'
          className='w-full animate-spin-slow'
          style={{ animation: 'rotate 180s linear infinite' }}
        />
      </div>

      {/* Main Content */}
      <div className='container relative z-2' style={{ maxWidth: '1400px', padding: '0 30px', margin: '0 auto', height: '100%' }}>
        <div className='hero-container h-full flex flex-col justify-center items-center' style={{ maxWidth: '1400px' }}>
          <div className='row w-full' style={{ maxWidth: '100%' }}>
            <div className='w-full lg:w-8/12 w-full'>
              <div className='hero-content flex flex-col justify-between' style={{ height: '60vh' }}>
                <div>
                  <motion.h1 
                    className='hero-title block text-5xl font-light leading-tight mb-16 text-white'
                    style={{ fontSize: '52px', fontWeight: 300 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  >
                    Smart Data Paradigms<br/> for Intelligent Agents
                  </motion.h1>
                  
                  <motion.p 
                    className='hero-description block text-white'
                    style={{ fontSize: '26px', fontWeight: 300, lineHeight: 1.6 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                  >
                    A decentralized AI trading layer that provides pre-processed datasets, letting builders focus on creating AI agents, executing strategies, and profiting in a secure, modular ecosystem.
                  </motion.p>
                </div>
                
                {/* Social Icons */}
                <motion.div 
                  className='social-icons flex gap-6'
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  <a 
                    href='https://x.com/olaxbt' 
                    target='_blank' 
                    rel='noopener noreferrer'
                    className='social-icon w-8 flex items-center justify-center text-white text-xl transition-all hover:opacity-80'
                  >
                    <img src='/images/nexus/section1/Twitter.png' alt='Twitter' className='w-full h-full object-contain' />
                  </a>
                  <a 
                    href='https://t.me/OLAXBT_Community' 
                    target='_blank' 
                    rel='noopener noreferrer'
                    className='social-icon w-8 flex items-center justify-center text-white text-xl transition-all hover:opacity-80'
                  >
                    <img src='/images/nexus/section1/telegram.png' alt='Telegram' className='w-full h-full object-contain' />
                  </a>
                  <a 
                    href='https://github.com/olaxbt' 
                    target='_blank' 
                    rel='noopener noreferrer'
                    className='social-icon w-8 flex items-center justify-center text-white text-xl transition-all hover:opacity-80'
                  >
                    <img src='/images/nexus/section1/github.png' alt='GitHub' className='w-full h-full object-contain' />
                  </a>
                  <a 
                    href='https://www.youtube.com/@olaxbt' 
                    target='_blank' 
                    rel='noopener noreferrer'
                    className='social-icon w-8 flex items-center justify-center text-white text-xl transition-all hover:opacity-80'
                  >
                    <img src='/images/nexus/section1/youtube.png' alt='YouTube' className='w-full h-full object-contain' />
                  </a>
                  <a 
                    href='https://www.linkedin.com/company/olaxbt/' 
                    target='_blank' 
                    rel='noopener noreferrer'
                    className='social-icon w-8 flex items-center justify-center text-white text-xl transition-all hover:opacity-80'
                  >
                    <img src='/images/nexus/section1/linkedin.png' alt='LinkedIn' className='w-full h-full object-contain' />
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
