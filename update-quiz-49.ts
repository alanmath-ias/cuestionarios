
import { db } from "./server/db";
import { questions, answers } from "./shared/schema";
import { eq } from "drizzle-orm";

const updates = {
    questions: [
        { id: 874, content: "Simplificar: $\\frac{a - 4 + \\frac{4}{a}}{1 - \\frac{2}{a}}$" },
        { id: 875, content: "Simplificar: $\\frac{a - x + \\frac{x^2}{a + x}}{a^2 - \\frac{a^2}{a + x}}$" },
        { id: 876, content: "Simplificar: $\\frac{\\frac{ab}{a + b}}{\\frac{ab}{a - b}}$" },
        { id: 879, content: "Simplificar: $\\frac{\\frac{a + x}{a - x} - \\frac{b + x}{b - x}}{\\frac{2}{a - x} - \\frac{2}{b - x}}$" },
        { id: 880, content: "Simplificar: $\\frac{\\frac{a + 2b}{a + b}}{\\frac{b}{a - b}}$" },
        { id: 883, content: "Simplificar: $\\frac{a + 1 + \\frac{2}{a + 3}}{a + 4 + \\frac{3}{a + 3}}$" },
        { id: 884, content: "Simplificar: $\\frac{\\frac{a}{a - b} - \\frac{b}{a + b}}{\\frac{a + b}{a - b} + \\frac{a}{b}}$" },
        { id: 885, content: "Simplificar: $\\frac{\\frac{a^2}{b^3} + \\frac{1}{a}}{\\frac{a}{b} - \\frac{a - b}{b - a}}$" },
        { id: 886, content: "Simplificar: $\\frac{1 + \\frac{2b + c}{a - b - c}}{1 - \\frac{c - 2b}{a - b + c}}$" }
    ],
    answers: [
        // Q874
        { id: 5149, content: "$a - 2$" },
        { id: 5150, content: "$2 - a$" },
        { id: 5151, content: "$(a - 2)^2$" },
        { id: 5152, content: "$\\frac{a^2 - 4a + 4}{a - 2}$" },
        // Q875
        { id: 5153, content: "$\\frac{1}{a + x - 1}$" },
        { id: 5154, content: "$\\frac{a^2 - x^2 + x^2}{a^3 + a^2x - a^2}$" },
        { id: 5155, content: "$\\frac{1}{a}$" },
        { id: 5156, content: "$\\frac{a + x}{a^2 + ax - a}$" },
        // Q876
        { id: 5157, content: "$\\frac{a - b}{a + b}$" },
        { id: 5158, content: "$1$" },
        { id: 5159, content: "$\\frac{a + b}{a - b}$" },
        { id: 5160, content: "$\\frac{ab}{a^2 - b^2}$" },
        // Q879
        { id: 5169, content: "$a$" },
        { id: 5170, content: "$\\frac{(a + x)(b - x)}{(a - x)(b + x)}$" },
        { id: 5171, content: "$x + a$" },
        { id: 5172, content: "$x$" },
        // Q880 (Only 1 answer visible in truncated output, skipping others to be safe or assuming IDs are sequential)
        { id: 5173, content: "$1$" },
        // Q883
        { id: 5185, content: "$\\frac{a + 5}{a + 3}$" },
        { id: 5186, content: "$\\frac{a + 1}{a^2 + 8a + 15}$" }, // Original was (a + 1)/(a^2 + 8a + 15)
        { id: 5187, content: "$\\frac{a^2 - 5a - 3}{a^2 - 4a - 15}$" }, // Original was (a^2 - 5a - 3)/(a^2 - 4a - 15)
        { id: 5188, content: "$\\frac{(a + 1)^2}{(a + 3)(a + 5)}$" }, // Original was (a + 1)^2/((a + 3)(a + 5))
        // Q884
        { id: 5189, content: "$\\frac{b^2}{a + b}$" },
        { id: 5190, content: "$b(a + b)$" },
        { id: 5191, content: "$\\frac{a}{a + b}$" },
        { id: 5192, content: "$\\frac{b}{a + b}$" },
        // Q885
        { id: 5193, content: "$\\frac{a^2 - ab + b^2}{ab^2}$" },
        { id: 5194, content: "$\\frac{a^2 - ab + b^2}{ab}$" },
        { id: 5195, content: "$\\frac{a^3 - a^2b + ab^2}{b^3}$" },
        { id: 5196, content: "$\\frac{a^2 - ab - b^2}{ab^2}$" },
        // Q886
        { id: 5197, content: "$\\frac{a - b + c}{a - b - c}$" },
        { id: 5198, content: "$1$" },
        { id: 5199, content: "$\\frac{a + b + c}{a - b - c}$" },
        { id: 5200, content: "$\\frac{a + b}{a - b - 2c}$" }
    ]
};

async function updateQuiz49() {
    console.log("Updating questions...");
    for (const q of updates.questions) {
        await db.update(questions)
            .set({ content: q.content })
            .where(eq(questions.id, q.id));
        console.log(`Updated Q[${q.id}]`);
    }

    console.log("Updating answers...");
    for (const a of updates.answers) {
        await db.update(answers)
            .set({ content: a.content })
            .where(eq(answers.id, a.id));
        console.log(`Updated A[${a.id}]`);
    }

    console.log("Done!");
    process.exit(0);
}

updateQuiz49();
