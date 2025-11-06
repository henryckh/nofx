import { motion } from 'framer-motion'
import { t, Language } from '../../i18n/translations'

interface UseCasesSectionProps {
  language: Language
}

const useCases = [
  {
    title: 'Cross-Chain DeFi Arbitrage Engine',
    description: 'Scans multiple chains for arbitrage gaps and executes fast trades across protocols to capture profit.',
    bgImage: '/images/nexus/section5/Cross-chain---use-case.png',
    bgClass: 'bg2'
  },
  {
    title: 'Whale Signal Replication',
    description: 'Tracks large wallet actions and automatically mirrors top-performing trades for users.',
    bgImage: '/images/nexus/section5/whale-signal---use-case.png',
    bgClass: 'bg3'
  },
  {
    title: 'Fan Token Market Intelligence & Trading Automation',
    description: 'Automates trading of football fan tokens using live club news, match outcomes, and sentiment data.',
    bgImage: '/images/nexus/section5/Fans-token---use-case.png',
    bgClass: 'bg5'
  },
  {
    title: 'Predictive Macro Event Positioning',
    description: 'Monitors global and protocol events, adjusting positions early to profit from anticipated volatility.',
    bgImage: '/images/nexus/section5/Predictive---use-case.png',
    bgClass: 'bg4'
  },
  {
    title: 'Adaptive Lending and Risk Automation',
    description: 'Manages loans and risk by auto-updating credit evaluations and reallocating capital instantly.',
    bgImage: '/images/nexus/section5/adaptive-lending---use-case.png',
    bgClass: 'bg1'
  },
  {
    title: 'Multi-Strategy Quantitative Rotator',
    description: 'AI agent shifts between trading strategies using real-time data, always seeking the best returns.',
    bgImage: '/images/nexus/section5/Multi-Strategy---use-case.png',
    bgClass: 'bg6'
  }
]

export default function UseCasesSection({ language }: UseCasesSectionProps) {
  return (
    <section className='section5 relative py-24' style={{ background: '#0d080e' }}>
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
                USE CASES
              </div>
              <div className='main-title text-5xl font-medium leading-tight text-white' style={{ fontSize: '48px', fontWeight: 500, lineHeight: 1.3 }}>
                Building the Intelligent <br />Intelligent Economy Together
              </div>
            </motion.div>
            <motion.div
              className='flex flex-col justify-end items-start'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <span className='text-xl leading-relaxed' style={{ fontSize: '20px', lineHeight: 1.35, color: '#CACFFF' }}>
                Leverage curated insights from diverse sources to identify high-potential opportunities with confidence. Developers use standardized signals to build AI agents and optimize DeFi strategies in a secure ecosystem.
              </span>
            </motion.div>
          </div>

          {/* Use Cases Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                className='card relative rounded-3xl p-10 flex flex-col justify-start gap-5 cursor-pointer overflow-hidden'
                style={{
                  background: '#05022133',
                  minHeight: '160px',
                  lineHeight: 1.3
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
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
                
                <div className='relative z-2'>
                  <span className='title block text-xl mb-2' style={{ fontSize: '20px', color: '#CACFFF', fontWeight: 400 }}>
                    {useCase.title}
                  </span>
                  <span className='description block text-sm' style={{ fontSize: '15px', color: '#fff', width: '70%' }}>
                    {useCase.description}
                  </span>
                </div>

                {/* Background Image */}
                <div 
                  className={`bg absolute top-0 right-0 z-0 transition-transform duration-300 ${useCase.bgClass}`}
                  style={{
                    width: useCase.bgClass === 'bg2' ? '80%' : useCase.bgClass === 'bg1' ? '40%' : '37%',
                    top: useCase.bgClass === 'bg2' ? '-55%' : useCase.bgClass === 'bg1' ? '35%' : '15%',
                    right: useCase.bgClass === 'bg2' ? '-35%' : useCase.bgClass === 'bg1' ? '-5%' : '0%'
                  }}
                >
                  <img src={useCase.bgImage} alt={useCase.title} className='w-full' />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .card:hover .bg {
          transform: scale(1.1);
          transform-origin: center;
        }
        @media (max-width: 767.98px) {
          .card {
            padding: 30px 20px !important;
            height: auto !important;
            min-height: auto !important;
          }
          .main-title {
            font-size: 32px !important;
          }
          .section-label {
            font-size: 20px !important;
          }
        }
      `}</style>
    </section>
  )
}

