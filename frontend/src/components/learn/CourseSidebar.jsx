import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, ChevronDown, ChevronUp, Play, FileText, Award, MessageSquare, Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Separator } from '../ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { cn } from '../../lib/utils'

export function CourseSidebar({ course, modules, currentLesson, completedLessons, onSelectLesson }) {
  const [expandedModules, setExpandedModules] = useState({})

  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0)
  const completedCount = completedLessons.length
  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }))
  }

  const getLessonIcon = (lesson) => {
    switch (lesson.type) {
      case 'video':
        return <Play className="h-4 w-4 text-blue-500 flex-shrink-0" />
      case 'text':
        return <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
      case 'quiz':
        return <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
      case 'assignment':
        return <MessageSquare className="h-4 w-4 text-purple-500 flex-shrink-0" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Link href={`/courses/${course.slug}`} className="block group">
          <div className="relative h-32 rounded-md overflow-hidden mb-4">
            <Image
              src={course.thumbnail || '/placeholder-course.jpg'}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h2 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {course.title}
          </h2>
        </Link>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Star className="h-3 w-3 text-yellow-500 mr-1" />
            <span>{course.rating.average.toFixed(1)}</span>
          </div>
          <Separator orientation="vertical" className="mx-2 h-4" />
          <span>{course.enrolledStudents} students</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Your progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
          <div className="text-xs text-muted-foreground">
            {completedCount} of {totalLessons} lessons completed
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold mb-3">Course Content</h3>
          
          <div className="space-y-2">
            {modules.map((module) => (
              <div key={module._id} className="border rounded-md overflow-hidden">
                <div
                  className="p-3 bg-muted/50 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleModule(module._id)}
                >
                  <h4 className="font-medium text-sm">{module.title}</h4>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    {expandedModules[module._id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {expandedModules[module._id] && (
                  <ul className="divide-y">
                    {module.lessons.map((lesson) => {
                      const isActive = currentLesson?._id === lesson._id
                      const isCompleted = completedLessons.includes(lesson._id)
                      
                      return (
                        <li key={lesson._id}>
                          <button
                            className={cn(
                              "w-full px-3 py-2 text-sm flex items-start hover:bg-accent/50",
                              isActive && "bg-accent"
                            )}
                            onClick={() => onSelectLesson(lesson)}
                          >
                            <div className="flex items-center">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              ) : (
                                getLessonIcon(lesson)
                              )}
                            </div>
                            <span className="ml-2 text-left">{lesson.title}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}