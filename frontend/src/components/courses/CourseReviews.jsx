import { useState, useEffect, useContext } from 'react'
import { Star, ThumbsUp, Flag, User } from 'lucide-react'
import { getCourseReviews, addCourseReview } from '../../api/courses'
import AuthContext from '../../context/AuthContext'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { toast } from 'react-hot-toast'

export default function CourseReviews({ courseId }) {
  const [reviews, setReviews] = useState([])
  const [userReview, setUserReview] = useState(null)
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useContext(AuthContext)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getCourseReviews(courseId)
        setReviews(data.reviews)
        
        // Check if user has already reviewed
        if (user) {
          const existingReview = data.reviews.find(review => review.userId._id === user.id)
          if (existingReview) {
            setUserReview(existingReview)
            setNewReview({
              rating: existingReview.rating,
              comment: existingReview.comment
            })
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setLoading(false)
      }
    }

    if (courseId) {
      fetchReviews()
    }
  }, [courseId, user])

  const handleRatingClick = (value) => {
    setNewReview(prev => ({ ...prev, rating: value }))
  }

  const handleCommentChange = (e) => {
    setNewReview(prev => ({ ...prev, comment: e.target.value }))
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to submit a review')
      return
    }
    
    if (newReview.rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    setSubmitting(true)
    
    try {
      const response = await addCourseReview(courseId, newReview.rating, newReview.comment)
      
      if (userReview) {
        // Update existing review in the list
        setReviews(reviews.map(review => 
          review._id === userReview._id ? response.review : review
        ))
      } else {
        // Add new review to list
        setReviews([response.review, ...reviews])
      }
      
      setUserReview(response.review)
      toast.success(userReview ? 'Review updated successfully' : 'Review added successfully')
      setSubmitting(false)
    } catch (error) {
      toast.error(error.message || 'Failed to submit review')
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Student Reviews</h3>
      
      {/* Add/Edit Review Form */}
      {user && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-8">
          <h4 className="font-medium mb-4">{userReview ? 'Update Your Review' : 'Add a Review'}</h4>
          
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRatingClick(value)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        value <= newReview.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {newReview.rating > 0 ? `${newReview.rating} out of 5` : 'Select a rating'}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <Textarea
                placeholder="Write your review here... (optional)"
                value={newReview.comment}
                onChange={handleCommentChange}
                rows={4}
              />
            </div>
            
            <Button type="submit" disabled={submitting || newReview.rating === 0}>
              {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </form>
        </div>
      )}
      
      {/* Review List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="ml-4 flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b pb-6 last:border-0">
              <div className="flex items-start">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.userId.profileImage} alt={review.userId.fullName} />
                  <AvatarFallback>
                    {review.userId.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{review.userId.fullName}</h5>
                    <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center mt-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {review.comment && <p className="text-sm mt-2">{review.comment}</p>}
                  
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-8">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium mb-2">No Reviews Yet</h4>
          <p className="text-muted-foreground mb-4">
            This course doesn't have any reviews yet. Be the first to review it!
          </p>
          {!user && (
            <Button asChild>
              <a href="/auth/login">Login to Leave a Review</a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}