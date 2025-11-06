import { useState } from 'react'
import HeaderBar from '../components/landing/HeaderBar'
import HeroSection from '../components/landing/HeroSection'
import AboutSection from '../components/landing/AboutSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import StatsSection from '../components/landing/StatsSection'
import UseCasesSection from '../components/landing/UseCasesSection'
import PartnersSection from '../components/landing/PartnersSection'
import LoginModal from '../components/landing/LoginModal'
import FooterSection from '../components/landing/FooterSection'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user, logout } = useAuth()
  const { language, setLanguage } = useLanguage()
  const isLoggedIn = !!user
  
  console.log('LandingPage - user:', user, 'isLoggedIn:', isLoggedIn);
  return (
    <>
      <HeaderBar 
        onLoginClick={() => setShowLoginModal(true)} 
        isLoggedIn={isLoggedIn} 
        isHomePage={true}
        language={language}
        onLanguageChange={setLanguage}
        user={user}
        onLogout={logout}
        onPageChange={(page) => {
          console.log('LandingPage onPageChange called with:', page);
          if (page === 'competition') {
            window.location.href = '/competition';
          } else if (page === 'traders') {
            window.location.href = '/traders';
          } else if (page === 'trader') {
            window.location.href = '/dashboard';
          }
        }}
      />
      <div className='min-h-screen' style={{ background: '#0d080e', color: '#FFFFFF' }}>
      <HeroSection language={language} />
      <FeaturesSection language={language} />
      <AboutSection language={language} />
      <StatsSection language={language} />
      <UseCasesSection language={language} />
      <PartnersSection language={language} />

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} language={language} />}
      <FooterSection language={language} />
      </div>
    </>
  )
}
