import { useState } from 'react'
import { User, Star, Award, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

export default function InstructorProfile({ instructor }) {
  const [expanded, setExpanded] = useState(false)

  if (!instructor) return null

  return (
    <div className="border rounded-lg p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4">Your Instructor</h3>
      
      <div className="flex items-start">
        <Avatar className="h-16 w-16">
          <AvatarImage src={instructor.profileImage} alt={instructor.fullName} />
          <AvatarFallback className="text-lg">
            {instructor.fullName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="ml-4 flex-1">
          <h4 className="font-medium text-lg">{instructor.fullName}</h4>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 mb-3 text-sm text-muted-foreground">
            {/* For demo purposes - replace with actual data */}
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>4.8 Instructor Rating</span>
            </div>
            
            <div className="flex items-center">
              <Award className="h-4 w-4 text-blue-500 mr-1" />
              <span>42 Courses</span>
            </div>
            
            <div className="flex items-center">
              <User className="h-4 w-4 text-green-500 mr-1" />
              <span>12,400+ Students</span>
            </div>
            
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 text-purple-500 mr-1" />
              <span>4,200+ Reviews</span>
            </div>
          </div>
          
          {instructor.bio && (
            <div className={`mt-2 text-sm relative ${!expanded && 'max-h-[80px] overflow-hidden'}`}>
              <p>{instructor.bio}</p>
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent"></div>
              )}
            </div>
          )}
          
          {instructor.bio && instructor.bio.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show More
                </>
              )}
            </Button>
          )}
          
          {instructor.socialLinks && (
            <div className="mt-4 flex flex-wrap gap-2">
              {instructor.socialLinks.website && (
                <a 
                  href={instructor.socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Website
                </a>
              )}
              {instructor.socialLinks.linkedin && (
                <a 
                  href={instructor.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {instructor.socialLinks.twitter && (
                <a 
                  href={instructor.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Twitter
                </a>
              )}
              {instructor.socialLinks.youtube && (
                <a 
                  href={instructor.socialLinks.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  YouTube
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}