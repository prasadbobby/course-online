import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Filter, Search, X } from 'lucide-react'
import { fetchCourses, fetchCategories } from '../../api/courses'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '../../components/ui/sheet'
import { Slider } from '../../components/ui/slider'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import CourseCard from '../../components/courses/CourseCard'
import CourseSkeleton from '../../components/courses/CourseSkeleton'

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    level: '',
    priceRange: [0, 10000],
    sort: 'popular'
  })

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories()
        setCategories(cats)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      try {
        // Get query params from URL
        const { category, level, search, sort } = router.query
        
        // Update active filters based on URL params
        const newFilters = { ...activeFilters }
        if (category) newFilters.category = category
        if (level) newFilters.level = level
        if (search) {
          setSearchTerm(search)
          newFilters.search = search
        }
        if (sort) newFilters.sort = sort
        
        setActiveFilters(newFilters)

        // Fetch courses with filters
        const coursesData = await fetchCourses(newFilters)
        setCourses(coursesData)
      } catch (error) {
        console.error('Error loading courses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [router.query])

  const handleSearch = (e) => {
    e.preventDefault()
    
    // Update URL with search term
    const query = { ...router.query, search: searchTerm }
    if (!searchTerm) delete query.search
    
    router.push({
      pathname: router.pathname,
      query
    })
  }

  const handleFilterChange = (key, value) => {
    // Update URL with new filter
    const query = { ...router.query, [key]: value }
    if (!value) delete query[key]
    
    router.push({
      pathname: router.pathname,
      query
    })
  }

  const clearFilters = () => {
    router.push({
      pathname: router.pathname
    })
  }

  return (
    <>
      <Head>
        <title>Courses | Learn New Skills Online</title>
        <meta name="description" content="Browse our collection of online courses" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Courses</h1>
          <p className="text-muted-foreground">Discover courses to take your skills to the next level</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile Filter Button */}
          <div className="md:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                  <div>
                    <Label className="text-base">Category</Label>
                    <Select
                      value={activeFilters.category}
                      onValueChange={(value) => handleFilterChange('category', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-base">Level</Label>
                    <Select
                      value={activeFilters.level}
                      onValueChange={(value) => handleFilterChange('level', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-base">Price Range</Label>
                    <div className="mt-4 px-2">
                      <Slider
                        defaultValue={activeFilters.priceRange}
                        max={10000}
                        step={100}
                        onValueChange={(value) => {
                          setActiveFilters((prev) => ({
                            ...prev,
                            priceRange: value
                          }))
                        }}
                        onValueCommit={(value) => {
                          handleFilterChange('minPrice', value[0])
                          handleFilterChange('maxPrice', value[1])
                        }}
                      />
                      <div className="flex justify-between mt-2 text-sm">
                        <span>₹{activeFilters.priceRange[0]}</span>
                        <span>₹{activeFilters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <SheetClose asChild>
                      <Button variant="outline" onClick={clearFilters} className="w-full">
                        Clear Filters
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 space-y-6">
            <div>
              <h3 className="font-medium text-lg mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={activeFilters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Level</Label>
                  <Select
                    value={activeFilters.level}
                    onValueChange={(value) => handleFilterChange('level', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Price Range</Label>
                  <div className="mt-4 px-2">
                    <Slider
                      defaultValue={activeFilters.priceRange}
                      max={10000}
                      step={100}
                      onValueChange={(value) => {
                        setActiveFilters((prev) => ({
                          ...prev,
                          priceRange: value
                        }))
                      }}
                      onValueCommit={(value) => {
                        handleFilterChange('minPrice', value[0])
                        handleFilterChange('maxPrice', value[1])
                      }}
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>₹{activeFilters.priceRange[0]}</span>
                      <span>₹{activeFilters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" onClick={clearFilters} className="w-full mt-4">
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
              
              <Select
                value={activeFilters.sort}
                onValueChange={(value) => handleFilterChange('sort', value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Active Filters */}
            {(activeFilters.category || activeFilters.level || router.query.search) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {activeFilters.category && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    {categories.find(c => c.slug === activeFilters.category)?.name || activeFilters.category}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {activeFilters.level && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    {activeFilters.level.charAt(0).toUpperCase() + activeFilters.level.slice(1)}
                    <button
                      onClick={() => handleFilterChange('level', '')}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {router.query.search && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    Search: {router.query.search}
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
            
            {/* Course Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <CourseSkeleton key={i} />
                ))}
              </div>
            ) : courses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-6">Try changing your filters or search term</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}