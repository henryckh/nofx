import { motion } from 'framer-motion'
import { Language } from '../../i18n/translations'

interface StatsSectionProps {
  language: Language
}

const stats = [
  { number: '300＋', label: 'Data Source' },
  { number: '6TB', label: 'Data Size' },
  { number: '95k', label: 'Members' }
]

export default function StatsSection({ }: StatsSectionProps) {
  return (
    <section 
      className='section4 relative py-48 -mt-48 z-3'
      style={{ padding: '200px 0', marginTop: '-200px' }}
    >
      <div 
        className='absolute inset-0 z-0'
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, #0d080e 100%)'
        }}
      />
      
      <div className='container relative z-4' style={{ maxWidth: '1400px', padding: '0 30px', margin: '0 auto' }}>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 justify-center'>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className='stat-item text-center z-4'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 + index * 0.2 }}
            >
              <span 
                className='stat-number block text-9xl font-bold leading-none mb-4'
                style={{
                  fontSize: '96px',
                  fontWeight: 700,
                  lineHeight: 1,
                  background: 'linear-gradient(90deg, #FF9EC7, #9D59F7)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {stat.number}
              </span>
              <span 
                className='stat-label block text-3xl'
                style={{
                  fontSize: '32px',
                  letterSpacing: '0.5px',
                  color: '#fff'
                }}
              >
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 767.98px) {
          .section4 {
            padding: 50px 0 !important;
            margin-top: -50px !important;
          }
          .stat-number {
            font-size: 64px !important;
          }
          .stat-label {
            font-size: 24px !important;
          }
        }
      `}</style>
    </section>
  )
}

