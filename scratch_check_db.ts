import { db } from "./server/db.js";
import { questions, answers } from "./shared/schema.js";
import { eq, like } from "drizzle-orm";

async function checkQuestion() {
  try {
    console.log("Searching for question...");
    const matchedQuestions = await db.select()
      .from(questions)
      .where(like(questions.content, "%La Potencia (P) se define como:%"));

    if (matchedQuestions.length === 0) {
      console.log("Question not found.");
      return;
    }

    for (const q of matchedQuestions) {
      console.log(`\n--- Question ID: ${q.id} ---`);
      console.log(`Content: ${q.content}`);

      const qAnswers = await db.select()
        .from(answers)
        .where(eq(answers.questionId, q.id));

      console.log(`Number of answers: ${qAnswers.length}`);
      qAnswers.forEach((a, i) => {
        console.log(`${i + 1}. [ID: ${a.id}] [Correct: ${a.isCorrect}] ${a.content}`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

checkQuestion();
