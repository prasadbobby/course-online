import { useState } from 'react'
import { submitAssignment } from '../../api/lessons'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { toast } from 'react-hot-toast'
import { FileUp, CheckCircle } from 'lucide-react'

export function AssignmentComponent({ assignment, lessonId }) {
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!submissionUrl) {
      toast.error('Please provide a submission URL')
      return
    }
    
    setSubmitting(true)
    
    try {
      await submitAssignment(lessonId, { submissionUrl, comments })
      toast.success('Assignment submitted successfully')
      setSubmitted(true)
    } catch (error) {
      toast.error(error.message || 'Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 mb-6">
      <div className="prose dark:prose-invert max-w-none">
        <h3>Assignment Instructions</h3>
        <p>{assignment.instructions}</p>
      </div>
      
      {submitted ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <h4 className="font-semibold text-lg">Assignment Submitted</h4>
              <p className="text-muted-foreground">
                Your submission has been recorded. Your instructor will review it.
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium">Your Submission</h5>
            <a 
              href={submissionUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline mt-1 block"
            >
              {submissionUrl}
            </a>
            
            {comments && (
              <div className="mt-4">
                <h5 className="font-medium">Your Comments</h5>
                <p className="mt-1">{comments}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submissionUrl">Submission URL</Label>
            <div className="flex">
              <Input
                id="submissionUrl"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/yourusername/project or other URL"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Please provide a link to your completed assignment. This could be a GitHub repository, 
              Google Drive file, CodePen, or any other accessible URL.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments or notes about your submission"
              rows={4}
            />
          </div>
          
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Submit Assignment
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}