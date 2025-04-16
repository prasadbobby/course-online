import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { getCourseContent } from '../../../api/courses'
import AuthContext from '../../../context/AuthContext'
import { Button } from '../../../components/ui/button'
import { Progress } from '../../../components/ui/progress'
import { Separator } from '../../../components/ui/separator'
import { VideoPlayer } from '../../../components/learn/VideoPlayer'
import { LessonContent } from '../../../components/learn/LessonContent'
import { CourseSidebar } from '../../../components/learn/CourseSidebar'
import { QuizComponent } from '../../../components/learn/QuizComponent'
import { AssignmentComponent } from '../../../components/learn/AssignmentComponent'
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '../../../components/ui/sheet'
import { toast } from 'react-hot-toast'

export default function CourseLearningPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useContext(AuthContext)
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [enrollment, setEnrollment] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!user && !loading) {
      router.push(`/auth/login?redirect=/learn/courses/${id}`)
    }
  }, [user, id, router, loading])

  useEffect(() => {
    const loadCourseContent = async () => {
      if (!id || !user) return

      setLoading(true)
      try {
        const data = await getCourseContent(id)
        setCourse(data.course)
        setModules(data.modules)
        setEnrollment(data.enrollment)
        
        // Set current lesson
        const lessonId = router.query.lessonId
        if (lessonId) {
          // Find the lesson in modules
          for (const module of data.modules) {
            const lesson = module.lessons.find(l => l._id === lessonId)
            if (lesson) {
              setCurrentLesson(lesson)
              break
            }
          }
        } else if (data.enrollment.lastAccessedLesson) {
            // Get the last accessed lesson
            for (const module of data.modules) {
              const lesson = module.lessons.find(l => l._id === data.enrollment.lastAccessedLesson)
              if (lesson) {
                setCurrentLesson(lesson)
                break
              }
            }
          } else {
            // Default to first lesson
            const firstModule = data.modules[0]
            if (firstModule && firstModule.lessons.length > 0) {
              setCurrentLesson(firstModule.lessons[0])
            }
          }
          
          setLoading(false)
        } catch (error) {
          console.error('Error loading course content:', error)
          toast.error('Failed to load course content')
          setLoading(false)
        }
      }
  
      loadCourseContent()
    }, [id, user, router.query.lessonId, router])
  
    const handleLessonChange = (lesson) => {
      setCurrentLesson(lesson)
      
      // Update URL without full page reload
      router.push(
        `/learn/courses/${id}?lessonId=${lesson._id}`,
        undefined,
        { shallow: true }
      )
      
      // Close mobile sidebar
      setSidebarOpen(false)
    }
  
    const handlePrevious = () => {
      // Find current module and lesson index
      let currentModuleIndex = -1
      let currentLessonIndex = -1
      
      for (let i = 0; i < modules.length; i++) {
        const lessonIndex = modules[i].lessons.findIndex(l => l._id === currentLesson._id)
        if (lessonIndex !== -1) {
          currentModuleIndex = i
          currentLessonIndex = lessonIndex
          break
        }
      }
      
      if (currentModuleIndex === -1 || currentLessonIndex === -1) return
      
      // If not first lesson in module, go to previous lesson
      if (currentLessonIndex > 0) {
        handleLessonChange(modules[currentModuleIndex].lessons[currentLessonIndex - 1])
      } 
      // If first lesson but not first module, go to last lesson of previous module
      else if (currentModuleIndex > 0) {
        const prevModule = modules[currentModuleIndex - 1]
        handleLessonChange(prevModule.lessons[prevModule.lessons.length - 1])
      }
    }
  
    const handleNext = () => {
      // Find current module and lesson index
      let currentModuleIndex = -1
      let currentLessonIndex = -1
      
      for (let i = 0; i < modules.length; i++) {
        const lessonIndex = modules[i].lessons.findIndex(l => l._id === currentLesson._id)
        if (lessonIndex !== -1) {
          currentModuleIndex = i
          currentLessonIndex = lessonIndex
          break
        }
      }
      
      if (currentModuleIndex === -1 || currentLessonIndex === -1) return
      
      // If not last lesson in module, go to next lesson
      if (currentLessonIndex < modules[currentModuleIndex].lessons.length - 1) {
        handleLessonChange(modules[currentModuleIndex].lessons[currentLessonIndex + 1])
      } 
      // If last lesson but not last module, go to first lesson of next module
      else if (currentModuleIndex < modules.length - 1) {
        handleLessonChange(modules[currentModuleIndex + 1].lessons[0])
      }
    }
  
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading course content...</p>
          </div>
        </div>
      )
    }
  
    if (!course || !currentLesson) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md p-6">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Course Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The course or lesson you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push('/learn')}>Go to My Courses</Button>
          </div>
        </div>
      )
    }
  
    return (
      <>
        <Head>
          <title>{currentLesson.title} | {course.title}</title>
        </Head>
        
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-80 h-full border-r overflow-y-auto">
            <CourseSidebar
              course={course}
              modules={modules}
              currentLesson={currentLesson}
              completedLessons={enrollment.completedLessons}
              onSelectLesson={handleLessonChange}
            />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b bg-background">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden mr-2">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-80">
                    <CourseSidebar
                      course={course}
                      modules={modules}
                      currentLesson={currentLesson}
                      completedLessons={enrollment.completedLessons}
                      onSelectLesson={handleLessonChange}
                    />
                  </SheetContent>
                </Sheet>
                
                <h1 className="text-lg font-medium truncate">{course.title}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">{Math.round(enrollment.progress)}%</span>
                  <Progress value={enrollment.progress} className="w-24" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/learn')}
                >
                  Exit Course
                </Button>
              </div>
            </header>
            
            {/* Lesson Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-6">{currentLesson.title}</h2>
                
                {currentLesson.type === 'video' && (
                  <VideoPlayer 
                    videoUrl={currentLesson.content.videoUrl} 
                    lessonId={currentLesson._id}
                  />
                )}
                
                {currentLesson.type === 'text' && (
                  <LessonContent
                    content={currentLesson.content.htmlContent}
                    lessonId={currentLesson._id}
                  />
                )}
                
                {currentLesson.type === 'quiz' && (
                  <QuizComponent
                    quiz={currentLesson.content.questions}
                    lessonId={currentLesson._id}
                  />
                )}
                
                {currentLesson.type === 'assignment' && (
                  <AssignmentComponent
                    assignment={currentLesson.content}
                    lessonId={currentLesson._id}
                  />
                )}
                
                {enrollment.completedLessons.includes(currentLesson._id) && (
                  <div className="mt-6 flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-700 dark:text-green-400">
                      You've completed this lesson
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation Footer */}
            <div className="p-4 border-t bg-background">
              <div className="flex justify-between max-w-4xl mx-auto">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="space-x-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                
                <Button
                  onClick={handleNext}
                  className="space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
  
  // Custom layout without navbar and footer
  CourseLearningPage.getLayout = (page) => page