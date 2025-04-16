import { Card, CardContent } from '../ui/card'

export default function CourseSkeleton() {
  return (
    <Card className="overflow-hidden h-96 animate-pulse">
      <div className="w-full h-40 bg-gray-300 dark:bg-gray-700"></div>
      <CardContent className="p-5">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        
        <div className="flex items-center mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28 mr-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
        </div>
        
        <div className="flex mb-8">
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16 mr-4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20 mr-4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 mr-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </CardContent>
    </Card>
  )
}