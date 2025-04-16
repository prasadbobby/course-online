import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Users, 
  BookOpen, 
  Clock, 
  BarChart,
  Star,
  AlertTriangle
} from 'lucide-react'
import { getCreatorCourses } from '../../../api/creator'
import AuthContext from '../../../context/AuthContext'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import CreatorLayout from '../../../components/layout/CreatorLayout'
import CourseSkeleton from '../../../components/courses/CourseSkeleton'
import Image from 'next/image'

export default function CreatorCoursesPage() {
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in or not a creator
    if (user && user.role !== 'creator') {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    const loadCourses = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        const coursesData = await getCreatorCourses()
        setCourses(coursesData)
        setFilteredCourses(coursesData)
        setLoading(false)
      } catch (error) {
        console.error('Error loading courses:', error)
        setLoading(false)
      }
    }

    loadCourses()
  }, [user])

  useEffect(() => {
    // Filter courses based on search and status
    if (!courses) return
    
    let result = [...courses]
    
    if (searchTerm) {
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      if (statusFilter === 'draft') {
        result = result.filter(course => !course.isPublished)
      } else if (statusFilter === 'published') {
        result = result.filter(course => course.isPublished)
      } else if (statusFilter === 'approved') {
        result = result.filter(course => course.isPublished && course.isApproved)
      } else if (statusFilter === 'pending') {
        result = result.filter(course => course.isPublished && !course.isApproved)
      }
    }
    
    setFilteredCourses(result)
  }, [courses, searchTerm, statusFilter])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (course) => {
    if (!course.isPublished) {
      return <Badge variant="outline">Draft</Badge>
    }
    if (course.isPublished && !course.isApproved) {
      return <Badge variant="secondary">Pending Approval</Badge>
    }
    if (course.isPublished && course.isApproved) {
      return <Badge variant="success">Published</Badge>
    }
  }

  if (user && user.creatorStatus === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Approval Pending</h1>
          <p className="text-muted-foreground mb-6">
            Your creator account is pending approval from our team. You'll be able to create
            and publish courses once approved.
          </p>
          <Button onClick={() => router.push('/')}>Go to Homepage</Button>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>My Courses | Creator Dashboard</title>
      </Head>
      
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <Link href="/creator/courses/new">
            <Button className="mt-4 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold mb-1">{courses.length}</div>
              <p className="text-muted-foreground">Total Courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold mb-1">
                {courses.filter(c => c.isPublished && c.isApproved).length}
              </div>
              <p className="text-muted-foreground">Published Courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold mb-1">
                {courses.reduce((sum, course) => sum + course.enrolledStudents, 0)}
              </div>
              <p className="text-muted-foreground">Total Enrollments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold mb-1">
                {courses.filter(c => c.isPublished && !c.isApproved).length}
              </div>
              <p className="text-muted-foreground">Pending Approval</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Tabs defaultValue="grid">
              <TabsList className="mb-6">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid">
                {loading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <CourseSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredCourses.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <Card key={course._id} className="overflow-hidden">
                        <div className="relative h-40">
                          <Image
                            src={course.thumbnail || '/placeholder-course.jpg'}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(course)}
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{course.title}</h3>
                          
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{course.enrolledStudents} students</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              <span>{course.rating?.average.toFixed(1) || 'No ratings'}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between mt-4">
                            <Link href={`/creator/courses/${course._id}/edit`}>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            
                            <Link href={`/courses/${course.slug}`} target="_blank">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try changing your filters'
                        : "You haven't created any courses yet"}
                    </p>
                    <Link href="/creator/courses/new">
                      <Button>Create Your First Course</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="table">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                    ))}
                  </div>
                ) : filteredCourses.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCourses.map((course) => (
                          <TableRow key={course._id}>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell>{getStatusBadge(course)}</TableCell>
                            <TableCell>{course.enrolledStudents}</TableCell>
                            <TableCell>{course.rating?.average.toFixed(1) || 'N/A'}</TableCell>
                            <TableCell>{formatDate(course.updatedAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Link href={`/creator/courses/${course._id}/edit`}>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </Link>
                                
                                <Link href={`/courses/${course.slug}`} target="_blank">
                                  <Button size="sm" variant="ghost">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Preview
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try changing your filters'
                        : "You haven't created any courses yet"}
                    </p>
                    <Link href="/creator/courses/new">
                      <Button>Create Your First Course</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

CreatorCoursesPage.getLayout = (page) => (
  <CreatorLayout>{page}</CreatorLayout>
)