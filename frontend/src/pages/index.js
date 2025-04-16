import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, BookOpen, Users, Star, Award } from 'lucide-react'
import { fetchFeaturedCourses, fetchCategories } from '../api/courses'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import CourseCard from '../components/courses/CourseCard'
import Features from '../components/home/Features'
import Testimonials from '../components/home/Testimonials'
import Instructors from '../components/home/Instructors'
import HeroBanner from '../components/home/HeroBanner'

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const courses = await fetchFeaturedCourses()
        const cats = await fetchCategories()
        setFeaturedCourses(courses)
        setCategories(cats)
        setLoading(false)
      } catch (error) {
        console.error('Error loading home data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <>
      <Head>
        <title>Course Platform - Learn New Skills Online</title>
        <meta name="description" content="Online platform for learning new skills with high-quality courses" />
      </Head>

      <HeroBanner />

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link href={`/courses?category=${category.slug}`} key={category.slug}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <category.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.courseCount} courses</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Courses</h2>
            <Link href="/courses">
              <Button variant="ghost" className="group">
                View all courses
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden h-96 animate-pulse">
                  <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
                  <CardContent className="p-5">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-28 mt-8"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))
            )}
          </div>
        </div>
      </section>

      <Features />

      <Testimonials />

      <Instructors />

      {/* CTA Banner */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Start Learning Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of students and expand your skills with our expert-led courses.
          </p>
          <Link href="/courses">
            <Button size="lg" variant="secondary" className="font-semibold">
              Browse All Courses
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}