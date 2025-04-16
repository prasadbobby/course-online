import { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player/lazy'
import { updateLessonProgress, completeLesson } from '../../api/lessons'
import { toast } from 'react-hot-toast'

export function VideoPlayer({ videoUrl, lessonId }) {
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useRef(null)
  const progressTracker = useRef(null)

  useEffect(() => {
    // Reset state when lesson changes
    setPlaying(true)
    setProgress(0)
    setDuration(0)
  }, [lessonId])

  useEffect(() => {
    // Setup progress tracking interval
    progressTracker.current = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime()
        if (currentTime > 0) {
          updateProgress(currentTime)
        }
      }
    }, 30000) // Update every 30 seconds

    return () => {
      if (progressTracker.current) {
        clearInterval(progressTracker.current)
      }
    }
  }, [lessonId])

  const updateProgress = async (currentTime) => {
    try {
      await updateLessonProgress(lessonId, { currentTime })
    } catch (error) {
      console.error('Failed to update lesson progress:', error)
    }
  }

  const handleProgress = ({ played, playedSeconds }) => {
    setProgress(playedSeconds)
    
    // If video is 90% complete, mark lesson as complete
    if (duration > 0 && playedSeconds > duration * 0.9) {
      handleLessonComplete()
    }
  }

  const handleDuration = (duration) => {
    setDuration(duration)
  }

  const handleLessonComplete = async () => {
    try {
      await completeLesson(lessonId)
      // No need to show toast for automatic completion
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error)
    }
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={playing}
        controls={true}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleLessonComplete}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
    </div>
  )
}