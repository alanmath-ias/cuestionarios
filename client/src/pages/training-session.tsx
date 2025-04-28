{/*// En el componente TrainingSession
import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrainingSession() {
  // Usa useRoute para acceder al parámetro de la ruta
  const [match] = useRoute("/training/:categoryId");
  const categoryId = match?.categoryId;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchQuestions();
    }
  }, [categoryId]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/training/${categoryId}`);
      const data = await response.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => [...prev, answer]);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  if (loading) {
    return <Spinner />;
  }

  if (currentQuestionIndex >= questions.length) {
    const correctAnswers = answers.filter(
      (answer, index) => answer === questions[index].correct_answer
    ).length;
    return (
      <div>
        <h1>Training completed</h1>
        <p>
          Correct answers: {correctAnswers} / {questions.length}
        </p>
        <Button onClick={handleRestart}>Try again</Button>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];
  const options = [question.correct_answer, ...question.incorrect_answers].sort(
    () => Math.random() - 0.5
  );

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <h2>{question.question}</h2>
          <div>
            {options.map((option, index) => (
              <Button key={index} onClick={() => handleAnswer(option)}>
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}*/}
