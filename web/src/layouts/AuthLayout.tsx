import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import HeaderBar from '../components/landing/HeaderBar'

interface AuthLayoutProps {
  children?: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen" style={{ background: '#0B0E11' }}>
      {/* Simple Header with Logo and Language Selector */}
      <HeaderBar 
        isLoggedIn={false} 
        isHomePage={false}
        currentPage="register"
        language={language}
        onLanguageChange={() => {}}
        onPageChange={(page) => {
          console.log('RegisterPage onPageChange called with:', page);
          if (page === 'competition') {
            window.location.href = '/competition';
          }
        }}
      />

      {/* Content with top padding to avoid overlap with fixed header */}
      <div className="pt-16">{children || <Outlet />}</div>
    </div>
  )
}
