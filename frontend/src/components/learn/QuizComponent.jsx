import { useState } from 'react'
import { submitQuiz } from '../../api/lessons'
import { Button } from '../ui/button'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { Card, CardContent } from '../ui/card'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function QuizComponent({ quiz, lessonId }) {
  const [answers, setAnswers] = useState([])
  const [results, setResults] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleAnswerChange = (questionIndex, selectedOption) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = selectedOption
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.length !== quiz.length) {
      toast.error('Please answer all questions')
      return
    }
    
    if (answers.some(answer => answer === undefined)) {
      toast.error('Please answer all questions')
      return
    }
    
    setSubmitting(true)
    
    try {
      const response = await submitQuiz(lessonId, { answers })
      setResults(response)
      
      if (response.isPassed) {
        toast.success(`Quiz completed! You scored ${response.percentage.toFixed(0)}%`)
      } else {
        toast.error(`You scored ${response.percentage.toFixed(0)}%. Try again to pass.`)
      }
    } catch (error) {
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setAnswers([])
    setResults(null)
  }

  return (
    <div className="space-y-6 mb-6">
      {results ? (
        <div className="space-y-6">
          <Card className={`${
            results.isPassed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start">
                {results.isPassed ? (
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {results.isPassed ? 'Quiz Passed!' : 'Quiz Failed'}
                  </h3>
                  <p>
                    You scored {results.score} out of {quiz.length} questions correctly ({results.percentage.toFixed(0)}%)
                  </p>
                  {!results.isPassed && (
                    <p className="mt-2 text-sm">You need to score at least 70% to pass this quiz.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            {quiz.map((question, index) => {
              const userAnswer = results.results[index].userAnswer
              const isCorrect = results.results[index].isCorrect
              
              return (
                <Card key={index} className={`${
                  isCorrect ? 'border-green-200' : 'border-red-200'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium mb-4">Question {index + 1}: {question.question}</h4>
                        <RadioGroup disabled value={userAnswer.toString()}>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2 mb-2">
                              <RadioGroupItem
                                value={optionIndex.toString()}
                                id={`q${index}-option${optionIndex}`}
                              />
                              <Label htmlFor={`q${index}-option${optionIndex}`}>
                                {option}
                              </Label>
                              {optionIndex === question.correctOption && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                              )}
                              {optionIndex === userAnswer && !isCorrect && (
                                <XCircle className="h-4 w-4 text-red-500 ml-2" />
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {!results.isPassed && (
            <Button onClick={handleRetry}>Try Again</Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {quiz.map((question, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-4">Question {index + 1}: {question.question}</h4>
                <RadioGroup
                  value={answers[index]?.toString()}
                  onValueChange={(value) => handleAnswerChange(index, Number(value))}
                >
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem
                        value={optionIndex.toString()}
                        id={`q${index}-option${optionIndex}`}
                      />
                      <Label htmlFor={`q${index}-option${optionIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
          
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </div>
      )}
    </div>
  )
}