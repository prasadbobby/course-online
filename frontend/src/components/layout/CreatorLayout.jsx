import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import {
  Layers,
  BarChart2,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home,
  BookOpen,
  Video,
  MessageSquare,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ModeToggle } from '../common/ModeToggle'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import AuthContext from '../../context/AuthContext'

export default function CreatorLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { user, setUser } = useContext(AuthContext)

  useEffect(() => {
    // Redirect if not logged in or not a creator
    if (!user) {
      router.push('/auth/login?redirect=/creator/dashboard')
      return
    }
    
    if (user.role !== 'creator') {
      router.push('/')
    }
  }, [user, router])

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    
    // Update context
    setUser(null)
    
    // Redirect to home
    router.push('/')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/creator/dashboard',
      icon: BarChart2,
    },
    {
      title: 'Courses',
      href: '/creator/courses',
      icon: BookOpen,
    },
    {
      title: 'Students',
      href: '/creator/students',
      icon: Users,
    },
    {
      title: 'Earnings',
      href: '/creator/earnings',
      icon: DollarSign,
    },
    {
      title: 'Media Library',
      href: '/creator/media',
      icon: Video,
    },
    {
      title: 'Discussions',
      href: '/creator/discussions',
      icon: MessageSquare,
    },
    {
      title: 'Settings',
      href: '/creator/settings',
      icon: Settings,
    },
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background z-10">
        <div className="flex h-16 items-center px-4 md:px-6">
          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="grid gap-4 py-4">
                <div className="px-6 pt-4 pb-6 border-b">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Image src="/logo.svg" alt="Course Platform" width={150} height={40} />
                  </Link>
                </div>
                <div className="px-6 py-2">
                  <div className="flex items-center space-x-3 mb-6">
                    <Avatar>
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">Creator</p>
                    </div>
                  </div>
                  <nav className="grid gap-2">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Home className="mr-2 h-4 w-4" />
                        Go to Main Site
                      </Button>
                    </Link>
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant={router.pathname === item.href ? "secondary" : "ghost"}
                          className="w-full justify-start"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </Button>
                      </Link>
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start mt-4 text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <Link href="/" className="md:hidden flex items-center space-x-2">
                <Image src="/logo.svg" alt="Course Platform" width={120} height={30} />
              </Link>
              <div className="hidden md:flex">
                <Link href="/creator/dashboard" className="flex items-center space-x-2">
                  <Layers className="h-6 w-6 text-primary" />
                  <span className="font-medium">Creator Dashboard</span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex">
                <Button variant="ghost" className="text-sm" asChild>
                  <Link href="/">Back to Site</Link>
                </Button>
              </div>
              <ModeToggle />
              <Avatar className="hidden md:flex">
                <AvatarImage src={user.profileImage} alt={user.fullName} />
                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r bg-background">
          <div className="p-6">
            <nav className="grid gap-2">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={router.pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start mt-4 text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// Custom layout without the regular navbar and footer
CreatorLayout.getLayout = (page) => page