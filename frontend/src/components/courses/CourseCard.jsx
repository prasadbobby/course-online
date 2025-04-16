import Link from 'next/link'
import Image from 'next/image'
import { Star, Users, BookOpen, Clock, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

export default function CourseCard({ course }) {
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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
    <Link href={`/courses/${course.slug}`}>
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
        <div className="relative h-40">
          <Image
            src={course.thumbnail || '/placeholder-course.jpg'}
            alt={course.title}
            fill
            className="object-cover"
          />
          {isDiscountValid && (
            <Badge className="absolute top-2 right-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{course.title}</h3>
          
          <div className="flex items-center mb-2 text-sm">
            <div className="flex items-center">
              <Star className="text-yellow-500 h-4 w-4 mr-1" />
              <span className="font-medium">{course.rating.average.toFixed(1)}</span>
              <span className="text-muted-foreground ml-1">({course.rating.count})</span>
            </div>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="text-muted-foreground">{course.enrolledStudents} students</span>
          </div>
          
          <div className="flex flex-wrap gap-y-2 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center mr-4">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDuration(course.totalDuration)}</span>
            </div>
            
            <div className="flex items-center mr-4">
              <BookOpen className="h-3 w-3 mr-1" />
              <span>{course.totalLessons} lessons</span>
            </div>
            
            <div className="flex items-center">
              <BarChart3 className="h-3 w-3 mr-1" />
              <span className="capitalize">{course.level}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center">
              {course.creator.profileImage ? (
                <Image
                  src={course.creator.profileImage}
                  alt={course.creator.fullName}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium mr-2">
                  {course.creator.fullName.charAt(0)}
                </div>
              )}
              <span className="text-sm text-muted-foreground">{course.creator.fullName}</span>
            </div>
            
            <div className="font-bold">
              {isFree ? (
                <span className="text-green-600 dark:text-green-400">Free</span>
              ) : (
                <div className="flex flex-col items-end">
                  <span>₹{displayPrice.toLocaleString()}</span>
                  {isDiscountValid && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{course.price.toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}