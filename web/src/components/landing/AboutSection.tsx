import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Language } from '../../i18n/translations'

interface AboutSectionProps {
  language: Language
}

const dataFactors = [
  {
    icon: '/images/nexus/section3/icon-1.png',
    title: 'Macto & Market Factors',
    description: 'Global economic indicators and asset correlations/volatility analyzed via Granger causality and GARCH models.'
  },
  {
    icon: '/images/nexus/section3/icon-2.png',
    title: 'On-Chain Metrics',
    description: 'Blockchain-native metrics with anomaly detection using isolation forests.'
  },
  {
    icon: '/images/nexus/section3/icon-6.png',
    title: 'Technical & Token Indicators',
    description: 'Price-based signals and qualitative token fundamentals refined with Kalman filters and survival analysis.'
  },
  {
    icon: '/images/nexus/section3/icon-4.png',
    title: 'Sentiment & Behavioral Data',
    description: 'Aggregated social/KOL signals and quant strategy cues derived via projection, motif extraction, and multi-agent simulations.'
  },
  {
    icon: '/images/nexus/section3/icon-7.png',
    title: 'Portfolio Optimization Data',
    description: 'Global economic indicators and asset correlations/volatility analyzed via Granger causality and GARCH models.'
  }
]

export default function AboutSection({ }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSticky(entry.intersectionRatio >= 0.8)
        })
      },
      { threshold: 0.8 }
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={sectionRef}
      className='section3 relative min-h-screen overflow-visible z-2'
      style={{ background: '#0d080e' }}
    >
      <div className='container flex flex-col justify-center items-center gap-24 relative z-2' style={{ padding: '150px 0', paddingBottom: '200px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className='row w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start'>
          {/* Left: Sticky Title */}
          <motion.div
            className={`lg:sticky lg:top-[20vh] z-10 h-fit ${isSticky ? 'sticky-active' : ''}`}
            style={{
              background: 'rgba(13, 8, 14, 0.9)',
              padding: '20px',
              borderRadius: '10px'
            }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className='main-title text-5xl font-medium leading-tight text-white z-2' style={{ fontSize: '48px', fontWeight: 500, lineHeight: 1.3 }}>
              Turning Multi-Source <br />Data into Agent-Ready Factors
            </div>
          </motion.div>

          {/* Right: Scrollable Content */}
          <div className='relative'>
            <div className='scroll-viewport' style={{ height: 'auto' }}>
              <div className='content-container flex flex-col gap-5'>
                {dataFactors.map((factor, index) => (
                  <motion.div
                    key={index}
                    className='content-block flex flex-col items-start gap-2 relative w-full p-14'
                    style={{
                      maxWidth: '800px',
                      background: 'transparent'
                    }}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.2 }}
                  >
                    {/* Border Gradient */}
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
                    
                    <div className='relative z-2 w-full'>
                      <div className='feature-icon mb-4' style={{ width: '122px' }}>
                        <img src={factor.icon} alt={factor.title} style={{ width: '40%' }} />
                      </div>
                      <span className='feature-title text-xl mb-2 block' style={{ fontSize: '22px', color: '#CACFFF' }}>
                        {factor.title}
                      </span>
                      <span className='feature-description text-sm block' style={{ fontSize: '15px', color: '#fff' }}>
                        {factor.description}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className='dummy-spacer' style={{ height: '0px' }} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767.98px) {
          .section3 .col-lg-6:first-child {
            position: static !important;
          }
          .content-block {
            padding: 30px 20px !important;
          }
        }
      `}</style>
    </section>
  )
}
