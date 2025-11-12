import { motion } from 'framer-motion'
import { Language } from '../../i18n/translations'
import { useState } from 'react'

interface FeaturesSectionProps {
  language: Language
}

const features = [
  {
    icon: '/images/nexus/section2/Atomic-small-icon.png',
    title: 'Atomic',
    subtitle: 'Production Ready',
    description: 'Preprocessed, normalized, verifiable',
    hoverDescription: 'Patented Refinement Engine',
    hoverImage: '/images/nexus/section2/rollover.png'
  },
  {
    icon: '/images/nexus/section2/Velocity-small-icon.png',
    title: 'Velocity',
    subtitle: 'Speed to Signal',
    description: 'Faster retrieval and cleaner signals',
    hoverDescription: '25% Quicker Fetch',
    hoverImage: '/images/nexus/section2/rollover.png'
  },
  {
    icon: '/images/nexus/section2/Trust-small-icon.png',
    title: 'Trust',
    subtitle: 'Security and Auditability',
    description: 'Built for research and execution',
    hoverDescription: '70-80% Effort Reduction',
    hoverImage: '/images/nexus/section2/rollover.png'
  },
  {
    icon: '/images/nexus/section2/Quant-small-icon.png',
    title: 'Quant',
    subtitle: 'Advanced Quant Tools',
    description: 'ZK proofs, anchored audits',
    hoverDescription: 'Reliability Uplift',
    hoverImage: '/images/nexus/section2/rollover.png'
  }
]

export default function FeaturesSection({ }: FeaturesSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className='section2 relative py-24' style={{ background: '#070412', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className='container' style={{ maxWidth: '1400px', padding: '0 30px', margin: '0 auto' }}>
        {/* Header Section */}
        <div className='header-section mb-16'>
          <motion.div
            className='section-label text-2xl mb-4 uppercase'
            style={{ fontSize: '23px' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            CORE ATTRIBUTES
          </motion.div>
          <motion.div
            className='main-title text-5xl font-medium leading-tight text-white'
            style={{ fontSize: '48px', fontWeight: 500, lineHeight: 1.3 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Empowering Decentralized AI <br />for <span className='title-highlight' style={{
              background: 'linear-gradient(90deg, #78D2FF, #E781FD)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Crypto Finance</span>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className='features-section'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className='feature-box relative rounded-3xl p-10 flex flex-col justify-start items-start gap-2 cursor-pointer overflow-hidden'
                style={{
                  background: '#050221CC',
                  height: '380px',
                  paddingTop: '100px'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + index * 0.2 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Border Gradient */}
                <div 
                  className='absolute inset-0 rounded-3xl pointer-events-none'
                  style={{
                    padding: '1px',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(231,129,253,0.2) 100%)',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    zIndex: 1
                  }}
                />
                
                <div className='relative z-2 w-full'>
                  <div className='feature-icon mb-4' style={{ width: '122px' }}>
                    <img src={feature.icon} alt={feature.title} width={33} />
                  </div>
                  <h3 className='feature-title text-4xl font-normal mb-2 text-white' style={{ fontSize: '35px', fontWeight: 400 }}>
                    {feature.title}
                  </h3>
                  <div className='feature-subtitle text-2xl mb-4' style={{ fontSize: '22px', color: '#D5D5FD' }}>
                    {feature.subtitle}
                  </div>
                  <div className='feature-description text-lg relative' style={{ fontSize: '17px', color: '#D5D5FD', lineHeight: 1.5, minHeight: '50px', width: '100%' }}>
                    <span 
                      className='txt-01 absolute inset-0 transition-all duration-500'
                      style={{
                        opacity: hoveredIndex === index ? 0 : 1,
                        marginTop: hoveredIndex === index ? '10px' : '0'
                      }}
                    >
                      {feature.description}
                    </span>
                    <span 
                      className='txt-02 absolute inset-0 transition-all duration-500'
                      style={{
                        opacity: hoveredIndex === index ? 1 : 0,
                        marginTop: hoveredIndex === index ? '0' : '10px'
                      }}
                    >
                      {feature.hoverDescription}
                    </span>
                  </div>
                </div>

                {/* Hover Label */}
                <div 
                  className='hover-label absolute top-0 right-0 pointer-events-none transition-all duration-500'
                  style={{
                    transform: hoveredIndex === index 
                      ? 'translateY(-45%) translateX(45%)' 
                      : 'translateY(-70%) translateX(70%)',
                    width: '200%',
                    zIndex: 1,
                    opacity: hoveredIndex === index ? 0.5 : 0
                  }}
                >
                  <img src={feature.hoverImage} alt='hover' className='w-full' />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hybrid Section */}
        <div className='hybrid-section mt-24'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
            <motion.div
              className='header-section'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className='section-label text-2xl mb-4 uppercase' style={{ fontSize: '23px' }}>
                Hybrid techniques
              </div>
              <div className='main-title text-5xl font-medium leading-tight text-white' style={{ fontSize: '48px', fontWeight: 500, lineHeight: 1.3 }}>
                From Multi-Source <br />Chaos to Trading Clarity
              </div>
            </motion.div>
            <motion.div
              className='flex flex-col justify-end items-start'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <span className='text-xl leading-relaxed text-white' style={{ fontSize: '20px', lineHeight: 1.35 }}>
                Powered by patented data processing framework, the central data layer ingests multi-source crypto data into pre-processed factors, freeing builders from data collection to focus on AI agents and strategies.
              </span>
            </motion.div>
          </div>

          {/* Movement Visualization */}
          <div className='movement relative'>
            <img 
              src='/images/nexus/section3/line.png' 
              alt='movement' 
              className='w-full'
              style={{ height: '120%', opacity: 0 }}
            />
            <video 
              className='center-image absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20'
              width='45%'
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
            >
              <source src='/images/nexus/section2/Made with FlexClip AI-2025-10-30T171602.webm' type='video/webm' />
            </video>
            
            {/* Line Images Container */}
            <div className='line-image-container absolute inset-0 z-2'>
            <svg 
              width='41.7%' 
              viewBox='0 0 804 132' 
              fill='none' 
              xmlns='http://www.w3.org/2000/svg'
              className='absolute'
              style={{ top: '26.3%', left: '2.3%' }}
            >
              <path 
                d='M0 130.75H95.0314C106.077 130.75 115.031 121.796 115.031 110.75V20.75C115.031 9.7043 123.986 0.75 135.031 0.75H330.352C341.397 0.75 350.352 9.70431 350.352 20.75V110.75C350.352 121.796 359.306 130.75 370.352 130.75H526.705C537.751 130.75 546.705 121.796 546.705 110.75V20.75C546.705 9.7043 555.659 0.75 566.705 0.75H782.56C793.606 0.75 802.56 9.70431 802.56 20.75V130.75' 
                stroke='url(#paint0_linear_5335_355)' 
                strokeOpacity='0.5' 
                strokeWidth='1.5'
              />
              <g>
                <g filter='url(#neonGlow)'>
                  <line 
                    x1='-12' 
                    y1='0' 
                    x2='12' 
                    y2='0' 
                    stroke='#FF69B499' 
                    strokeWidth='4'
                  />
                  <line 
                    x1='0' 
                    y1='-1' 
                    x2='0' 
                    y2='1' 
                    stroke='#FF69B4' 
                    strokeWidth='4'
                  />
                </g>
                <animateTransform
                  attributeName='transform'
                  type='scale'
                  values='1;1.3;1'
                  dur='2s'
                  repeatCount='indefinite'
                />
                <animateMotion 
                  dur='4s' 
                  repeatCount='indefinite' 
                  path='M0 130.75H95.0314C106.077 130.75 115.031 121.796 115.031 110.75V20.75C115.031 9.7043 123.986 0.75 135.031 0.75H330.352C341.397 0.75 350.352 9.70431 350.352 20.75V110.75C350.352 121.796 359.306 130.75 370.352 130.75H526.705C537.751 130.75 546.705 121.796 546.705 110.75V20.75C546.705 9.7043 555.659 0.75 566.705 0.75H782.56C793.606 0.75 802.56 9.70431 802.56 20.75V130.75'
                  rotate='auto'
                  calcMode='spline'
                  keySplines='0.5 0 0.5 1; 0.5 0 0.5 1'
                  keyTimes='0; 0.5; 1'
                />
              </g>
              <defs>
                <linearGradient id='paint0_linear_5335_355' x1='0' y1='65.75' x2='287.5' y2='65.75' gradientUnits='userSpaceOnUse'>
                  <stop stopColor='#5F7099' stopOpacity='0' />
                  <stop offset='1' stopColor='#9EBAFF' />
                </linearGradient>
                <filter id='neonGlow' x='-100%' y='-100%' width='300%' height='300%'>
                  <feGaussianBlur in='SourceAlpha' stdDeviation='6' result='blur1'/>
                  <feOffset in='blur1' dx='0' dy='0'/>
                  <feFlood floodColor='#FF1493' floodOpacity='0.8' result='flood1'/>
                  <feComposite in='flood1' in2='blur1' operator='in' result='comp1'/>
                  <feComposite in='comp1' in2='SourceGraphic' operator='arithmetic' k2='1' k3='0.5' result='glow1'/>
                  <feGaussianBlur in='SourceAlpha' stdDeviation='3' result='blur2'/>
                  <feOffset in='blur2' dx='0' dy='0'/>
                  <feFlood floodColor='#FF69B4' floodOpacity='1' result='flood2'/>
                  <feComposite in='flood2' in2='blur2' operator='in' result='comp2'/>
                  <feComposite in='comp2' in2='SourceGraphic' operator='arithmetic' k2='1' k3='0.7' result='glow2'/>
                  <feGaussianBlur in='SourceAlpha' stdDeviation='1' result='blur3'/>
                  <feOffset in='blur3' dx='0' dy='0'/>
                  <feFlood floodColor='#FFB6C1' floodOpacity='1' result='flood3'/>
                  <feComposite in='flood3' in2='blur3' operator='in' result='comp3'/>
                  <feComposite in='comp3' in2='SourceGraphic' operator='arithmetic' k2='1' k3='0.9' result='glow3'/>
                  <feMerge>
                    <feMergeNode in='glow1'/>
                    <feMergeNode in='glow2'/>
                    <feMergeNode in='glow3'/>
                    <feMergeNode in='SourceGraphic'/>
                  </feMerge>
                </filter>
              </defs>
            </svg>
              <img src='/images/nexus/section3/line02.svg' alt='line' className='absolute' style={{ width: '9.6%', top: '4%', left: '57%' }} />
              <img src='/images/nexus/section3/line03.svg' alt='line' className='absolute' style={{ width: '46.3%', left: '-6.5%', top: '52%' }} />
              <img src='/images/nexus/section3/line04.svg' alt='line' className='absolute' style={{ width: '46.3%', top: '57%', left: '61.8%' }} />
              <img src='/images/nexus/section3/line05.svg' alt='line' className='absolute' style={{ width: '9.6%', left: '37.3%', top: '74%' }} />
              <img src='/images/nexus/section3/line06.svg' alt='line' className='absolute' style={{ width: '40.3%', top: '76.5%', left: '57%' }} />
            </div>
            
            {/* Text Container */}
            <div className='text-container absolute inset-0 z-2'>
              <span className='absolute text-lg font-light' style={{ top: '20%', left: '20%', color: '#CAD9FF', fontSize: '18px' }}>
                Decentralized Oracle Feeds
              </span>
              <span className='absolute text-lg font-light' style={{ top: '21%', left: '67%', color: '#CAD9FF', fontSize: '18px' }}>
                DeFi Protocol TVL Flows & Yields
              </span>
              <span className='absolute text-lg font-light' style={{ left: '10%', top: '45%', color: '#CAD9FF', fontSize: '18px' }}>
                Consumer Finance Data
              </span>
              <span className='absolute text-lg font-light' style={{ top: '49%', left: '78%', color: '#CAD9FF', fontSize: '18px' }}>
                Fans & Sports Data
              </span>
              <span className='absolute text-lg font-light' style={{ left: '26%', top: '85%', color: '#CAD9FF', fontSize: '18px' }}>
                Social Media & News Data
              </span>
              <span className='absolute text-lg font-light' style={{ top: '100%', left: '57%', color: '#CAD9FF', fontSize: '18px' }}>
                Financial Trading Data
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767.98px) {
          .feature-box {
            height: auto !important;
            padding: 30px !important;
            margin-top: 1rem !important;
          }
          .main-title {
            font-size: 32px !important;
          }
          .section-label {
            font-size: 20px !important;
          }
          .text-container span {
            font-size: 12px !important;
          }
          .text-container span.text-01 {
            top: 10% !important;
            left: 5% !important;
          }
          .text-container span.text-02 {
            top: 10% !important;
            left: 70% !important;
          }
          .text-container span.text-03 {
            left: 0% !important;
            top: 40% !important;
            width: 30% !important;
          }
          .text-container span.text-04 {
            top: 45% !important;
            left: 72% !important;
          }
          .text-container span.text-05 {
            left: 5% !important;
            top: 80% !important;
          }
        }
      `}</style>
    </section>
  )
}
