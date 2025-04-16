import { useEffect } from 'react'
import { completeLesson } from '../../api/lessons'
import DOMPurify from 'dompurify'

export function LessonContent({ content, lessonId }) {
  useEffect(() => {
    // Track when user reaches the bottom of the content
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // User has scrolled to the bottom of the content
            handleLessonComplete()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.9 } // 90% visible
    )
    
    const contentBottom = document.getElementById('content-bottom')
    if (contentBottom) {
      observer.observe(contentBottom)
    }
    
    return () => {
      if (contentBottom) {
        observer.unobserve(contentBottom)
      }
    }
  }, [lessonId, content])

  const handleLessonComplete = async () => {
    try {
      await completeLesson(lessonId)
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error)
    }
  }

  // If content is not provided or empty
  if (!content || content.trim() === '') {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <p>No content available for this lesson.</p>
      </div>
    )
  }

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(content)

  return (
    <div className="mb-6">
      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      <div id="content-bottom" className="h-10"></div>
    </div>
  )
}