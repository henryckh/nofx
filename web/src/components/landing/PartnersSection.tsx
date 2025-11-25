import { motion } from 'framer-motion'
import { useState } from 'react'
import { Language } from '../../i18n/translations'

interface PartnersSectionProps {
  language: Language
}

const partnerLogos = [
  '1 Zypher network l.png',
  '2 DeAgent AI 1.png',
  '3 Velvet logo 1.png',
  '4 SynaptAI 2.png',
  '5 Yooldo 1.png',
  '6 Gopher icon 1.png',
  '9 TradeTideAI logo 1.png',
  '10 Birdeye logo 1.png',
  '11 rootdata 1.png',
  '12 Mantra logo 1.png',
  '13 Xtrade logo 1.png',
  '14 Chiliz logo 1.png',
  '15 Delta Analytics 1.png',
  '16 hotcoin logo 1.png',
  '17 Bitconomy logo 1.png',
  '18 Masa.png',
  '19 allora logo.png',
  '20 Polyhedra.png',
  '22 UxLink Logo.png',
  '24 Nesa Chain 2.png',
  '25 NERO CHAIN white 1 2.png',
  '26 aveai logo 2.png',
  '27 Titanchain 2.png',
  '28 Tradoor Logo 2.png',
  '30 zklink logo.png',
  '31 Sentism_Logo_Text 1_without S 2.png',
  '32 zeni logo 2.png'
]

export default function PartnersSection({ language: _language }: PartnersSectionProps) {
  function CarouselRow({ logos, speed = 40, reverse = false }: { logos: string[]; speed?: number; reverse?: boolean }) {
    const [paused, setPaused] = useState(false)

    return (
      <div
        className='partner-carousel overflow-hidden w-full'
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className='partner-track flex items-center gap-4'
          style={{
            animation: `partner-scroll ${speed}s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
            animationDirection: reverse ? 'reverse' as const : 'normal' as const
          }}
        >
          {[...logos, ...logos].map((logo, idx) => (
            <motion.div
              key={`${logo}-${idx}`}
              className='partner-logo-item relative rounded-3xl p-4 my-2'
              style={{
                background: '#05022133',
                minWidth: '200px'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className='absolute inset-0 rounded-3xl pointer-events-none'
                style={{
                  padding: '1px',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(231,129,253,0.2) 50%)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  zIndex: 1
                }}
              />
              <img 
                src={`/images/nexus/logos/${logo}`} 
                alt={logo.replace('.png', '')} 
                className='w-full h-auto relative z-2'
              />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className='section6 relative py-24' style={{ padding: '200px 0', paddingBottom: '200px', background: '#0d080e' }}>
      <div className='container' style={{ maxWidth: '1400px', padding: '0 30px', margin: '0 auto' }}>
        <div className='hybrid-section'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
            <motion.div
              className='header-section'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className='section-label text-2xl mb-4 uppercase' style={{ fontSize: '23px' }}>
                KEY CONTRIBUTOR & PARTNERS
              </div>
              <div className='main-title text-5xl font-medium leading-tight text-white' style={{ fontSize: '48px', fontWeight: 500, lineHeight: 1.3 }}>
                Fueling Data <br />Prosperity Together
              </div>
            </motion.div>
          </div>

          {/* Partner Logos Carousel */}
          <div className='space-y-6'>
            <CarouselRow logos={partnerLogos.slice(0, Math.ceil(partnerLogos.length / 3))} speed={20} />
            <CarouselRow logos={partnerLogos.slice(Math.ceil(partnerLogos.length / 3))} speed={20} reverse />
            <CarouselRow logos={partnerLogos.slice(Math.ceil(partnerLogos.length / 3))} speed={20} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes partner-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (max-width: 767.98px) {
          .main-title {
            font-size: 32px !important;
          }
          .section-label {
            font-size: 20px !important;
          }
          .partner-carousel .partner-track {
            gap: 12px;
          }
        }
      `}</style>
    </section>
  )
}

