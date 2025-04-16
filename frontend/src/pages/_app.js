import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/router'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AuthContext from '../context/AuthContext'
import { getUserFromLocalStorage } from '../utils/auth'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = getUserFromLocalStorage()
    if (storedUser) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  // Check if the page is auth related
  const isAuthPage = router.pathname.includes('/auth')
  
  // Check if page should use a different layout
  const getLayout = Component.getLayout || ((page) => (
    <>
      {!isAuthPage && <Navbar />}
      <main className="min-h-screen pt-16">{page}</main>
      {!isAuthPage && <Footer />}
    </>
  ))

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthContext.Provider value={{ user, setUser, loading }}>
        {getLayout(<Component {...pageProps} />)}
        <Toaster position="top-right" />
      </AuthContext.Provider>
    </ThemeProvider>
  )
}