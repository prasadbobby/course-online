import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  Clock,
  Users,
  Award,
  BarChart3,
  CheckCircle,
  Star,
  ShoppingCart,
  BookOpen,
  PlayCircle,
  FileText,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import { fetchCourseBySlug, enrollInCourse } from '../../api/courses'
import AuthContext from '../../context/AuthContext'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '../../components/ui/dialog'
import ReactPlayer from 'react-player/lazy'
import toast from 'react-hot-toast'
import CourseReviews from '../../components/courses/CourseReviews'
import InstructorProfile from '../../components/courses/InstructorProfile'

export default function CoursePage() {
  const router = useRouter()
  const { slug } = router.query
  const { user } = useContext(AuthContext)
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [previewLessons, setPreviewLessons] = useState([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    const loadCourse = async () => {
      if (!slug) return

      setLoading(true)
      try {
        const data = await fetchCourseBySlug(slug)
        setCourse(data.course)
        setModules(data.modules)
        setPreviewLessons(data.previewLessons)
        setIsEnrolled(data.isEnrolled)
        setLoading(false)
      } catch (error) {
        console.error('Error loading course:', error)
        setLoading(false)
      }
    }

    loadCourse()
  }, [slug])

  const handleEnroll = async () => {
    if (!user) {
      // Redirect to login
      router.push(`/auth/login?redirect=/courses/${slug}`)
      return
    }

    setEnrolling(true)
    try {
      const result = await enrollInCourse(course._id)
      
      if (result.checkoutUrl) {
        // Redirect to payment
        window.location.href = result.checkoutUrl
      } else {
        // Free course, show success
        toast.success('Successfully enrolled in course!')
        setIsEnrolled(true)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to enroll in course')
    } finally {
      setEnrolling(false)
    }
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 w-3/4 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 w-1/2 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 w-full rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 w-full rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 w-3/4 rounded"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-72 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-60 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
        <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or may have been removed.</p>
        <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
      </div>
    )
  }

  // Calculate discount percentage
  const discountPercentage = course.discountPrice && course.price > 0
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0
  
  // Check if discount is valid
  const isDiscountValid = course.discountPrice && course.discountValidUntil && new Date(course.discountValidUntil) > new Date()
  
  // Calculate price to display
  const displayPrice = isDiscountValid ? course.discountPrice : course.price
  const isFree = displayPrice === 0

  return (
    <>
      <Head>
        <title>{course.title} | Course Platform</title>
        <meta name="description" content={course.description.substring(0, 160)} />
      </Head>

      <div className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              
              <div className="flex flex-wrap gap-4 items-center text-sm">
                <div className="flex items-center">
                  <Star className="text-yellow-500 h-5 w-5 mr-1" />
                  <span className="font-medium">{course.rating.average.toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">({course.rating.count} ratings)</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="text-blue-500 h-5 w-5 mr-1" />
                  <span>{course.enrolledStudents} students</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="text-green-500 h-5 w-5 mr-1" />
                  <span>{formatDuration(course.totalDuration)}</span>
                </div>
                
                <div className="flex items-center">
                  <BarChart3 className="text-purple-500 h-5 w-5 mr-1" />
                  <span className="capitalize">{course.level} level</span>
                </div>
                
                <div className="flex items-center">
                  <BookOpen className="text-orange-500 h-5 w-5 mr-1" />
                  <span>{course.totalLessons} lessons</span>
                </div>
              </div>
              
              {/* Course Image for Mobile */}
              <div className="lg:hidden rounded-lg overflow-hidden relative aspect-video">
                <Image
                  src={course.thumbnail || '/placeholder-course.jpg'}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 py-4">
                <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold mb-2">About This Course</h3>
                    <p>{course.description}</p>
                    
                    {course.whatYouWillLearn?.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">What You'll Learn</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {course.whatYouWillLearn.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {course.requirements?.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Requirements</h3>
                        <ul className="list-disc list-inside space-y-2">
                          {course.requirements.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <InstructorProfile instructor={course.creator} />
                </TabsContent>
                
                <TabsContent value="curriculum" className="py-4">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">Course Content</h3>
                    <p className="text-muted-foreground">
                      {modules.length} modules • {course.totalLessons} lessons • {formatDuration(course.totalDuration)} total duration
                    </p>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {modules.map((module, index) => (
                      <AccordionItem key={module._id} value={`module-${index}`}>
                        <AccordionTrigger>
                          <div className="text-left">
                            <span className="font-medium">{module.title}</span>
                            <div className="text-sm text-muted-foreground">
                              {previewLessons.filter(l => l.moduleId === module._id).length} lessons
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {previewLessons
                              .filter(lesson => lesson.moduleId === module._id)
                              .map((lesson, lessonIndex) => (
                                <li key={lesson._id} className="border-b pb-2 last:border-0">
                                  <div className="flex items-start">
                                    {lesson.type === 'video' ? (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary"
                                            onClick={() => setSelectedVideo(lesson.content.videoUrl)}
                                          >
                                            <PlayCircle className="h-5 w-5 mr-2" />
                                            <span>{lesson.title}</span>
                                            {lesson.isPreview && (
                                              <Badge variant="outline" className="ml-2 text-xs">Preview</Badge>
                                            )}
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl">
                                          <div className="aspect-video">
                                            <ReactPlayer
                                              url={selectedVideo}
                                              width="100%"
                                              height="100%"
                                              controls
                                            />
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    ) : lesson.type === 'text' ? (
                                      <div className="flex items-center text-sm">
                                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                                        <span>{lesson.title}</span>
                                        {lesson.isPreview && (
                                          <Badge variant="outline" className="ml-2 text-xs">Preview</Badge>
                                        )}
                                      </div>
                                    ) : lesson.type === 'quiz' ? (
                                      <div className="flex items-center text-sm">
                                        <Award className="h-5 w-5 mr-2 text-yellow-500" />
                                        <span>{lesson.title}</span>
                                        {lesson.isPreview && (
                                          <Badge variant="outline" className="ml-2 text-xs">Preview</Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-sm">
                                        <MessageSquare className="h-5 w-5 mr-2 text-purple-500" />
                                        <span>{lesson.title}</span>
                                        {lesson.isPreview && (
                                          <Badge variant="outline" className="ml-2 text-xs">Preview</Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  
                  {!isEnrolled && (
                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground mb-4">Enroll now to access all lessons and course materials</p>
                      <Button onClick={handleEnroll} disabled={enrolling}>
                        {enrolling ? 'Processing...' : 'Enroll in Course'}
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="reviews" className="py-4">
                  <CourseReviews courseId={course._id} />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Image for Desktop */}
              <div className="hidden lg:block rounded-lg overflow-hidden relative aspect-video">
                <Image
                  src={course.thumbnail || '/placeholder-course.jpg'}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Pricing Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-baseline mb-4">
                      <h3 className="text-3xl font-bold">
                        {isFree ? (
                          'Free'
                        ) : (
                          <>₹{displayPrice.toLocaleString()}</>
                        )}
                      </h3>
                      
                      {isDiscountValid && (
                        <>
                          <span className="text-xl text-muted-foreground line-through ml-2">
                            ₹{course.price.toLocaleString()}
                          </span>
                          <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {discountPercentage}% off
                          </Badge>
                        </>
                      )}
                    </div>
                    
                    {isDiscountValid && (
                      <p className="text-sm text-muted-foreground mb-4">
                        <span className="text-red-500 font-medium">Sale ends</span> in {new Date(course.discountValidUntil).toLocaleDateString()}
                      </p>
                    )}
                    
                    {isEnrolled ? (
                      <Button
                        className="w-full mb-4"
                        onClick={() => router.push(`/learn/courses/${course._id}`)}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Button>
                    ) : (
                      <Button
                        className="w-full mb-4"
                        onClick={handleEnroll}
                        disabled={enrolling}
                      >
                        {enrolling ? (
                          'Processing...'
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {isFree ? 'Enroll for Free' : 'Buy Now'}
                          </>
                        )}
                      </Button>
                    )}
                    
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Full lifetime access
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Access on mobile and desktop
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Certificate of completion
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              {/* Share and Categories */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Course Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{course.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total lessons:</span>
                      <span className="font-medium">{course.totalLessons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{formatDuration(course.totalDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last updated:</span>
                      <span className="font-medium">{new Date(course.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}