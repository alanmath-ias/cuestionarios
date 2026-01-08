
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";
import { questions, answers } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), ".envproduction");
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .envproduction:", result.error);
    process.exit(1);
}

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing in .envproduction!");
    process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

async function fixDelimiters(text: string | null): Promise<string | null> {
    if (!text) return null;
    let fixed = text;

    // 1. Fix block math: ¡¡...!! -> ¡¡...¡¡
    fixed = fixed.replace(/¡¡([\s\S]*?)!!/g, '¡¡$1¡¡');

    // 2. Fix inline math: ¡...! -> ¡...¡
    fixed = fixed.replace(/¡([^¡]+?)!/g, '¡$1¡');

    // 3. Wrap standalone numbers (heuristic from previous step)
    // Matches a number that is NOT inside ¡...¡
    fixed = fixed.replace(/(?<=^|[\s,;:])(\d+)(?=[\s,;:]|$)(?!\.)/g, '¡$1¡');

    // 4. Merge adjacent math expressions
    // Example: ¡287¡ - ¡212¡ = ¡75¡ -> ¡287 - 212 = 75¡
    // We look for: ¡...¡ [operator/space] ¡...¡
    // Operators: +, -, *, /, =, <, >, \times, \div, \pm
    // We loop until no more merges are found

    let changed = true;
    while (changed) {
        changed = false;
        // Regex to match: ¡A¡ space/op ¡B¡
        // We capture A, the separator (space/op), and B
        // Separator can be whitespace and/or operators
        const mergeRegex = /¡([^¡]+?)¡\s*([+\-*/=<>.,]|\\[a-zA-Z]+|y|o)?\s*¡([^¡]+?)¡/g;

        // Wait, "y" or "o" might be text, not math. "¡5¡ y ¡6¡" -> "¡5 y 6¡" is probably wrong if it's a list.
        // But "¡x¡ = ¡5¡" -> "¡x = 5¡" is correct.
        // Let's stick to strict math operators for now: +, -, *, /, =, <, >, \times, \div
        // And also allow simple spaces if it looks like part of an equation? No, "¡5¡ ¡6¡" might be two separate things.
        // But "¡287¡ - ¡212¡" definitely needs merging.

        const strictMergeRegex = /¡([^¡]+?)¡\s*([+\-*/=<>:]|\\times|\\div)\s*¡([^¡]+?)¡/g;

        const newFixed = fixed.replace(strictMergeRegex, (match, p1, sep, p2) => {
            changed = true;
            return `¡${p1} ${sep} ${p2}¡`;
        });

        if (newFixed !== fixed) {
            fixed = newFixed;
            changed = true;
        } else {
            changed = false;
        }
    }

    // 5. Wrap unwrapped complex expressions
    // Example: (-5) - (-21)
    // Regex: Look for patterns starting with ( or - or digit, containing operators, ending with ) or digit
    // This is very complex to get right with regex.
    // Let's target the specific case mentioned: (-5) - (-21)
    // Pattern: (number) op (number)
    fixed = fixed.replace(/(?<=^|\s)(\(-?\d+\)\s*[+\-*/]\s*\(-?\d+\))(?=\s|$|[.,;])/g, '¡$1¡');

    // Also: -5 + ¡21¡ = ¡16¡ -> ¡-5 + 21 = 16¡
    // This requires merging unwrapped text with wrapped text.
    // Maybe we can wrap the unwrapped parts first?
    // Wrap "-5" -> "¡-5¡"
    // Regex for negative numbers: (?<=^|\s)-?\d+(?=[\s,;:]|$)
    fixed = fixed.replace(/(?<=^|[\s,;:])(-\d+)(?=[\s,;:]|$)(?!\.)/g, '¡$1¡');

    // Now run the merge loop again to catch "¡-5¡ + ¡21¡"
    changed = true;
    while (changed) {
        changed = false;
        const strictMergeRegex = /¡([^¡]+?)¡\s*([+\-*/=<>:]|\\times|\\div)\s*¡([^¡]+?)¡/g;
        const newFixed = fixed.replace(strictMergeRegex, (match, p1, sep, p2) => {
            changed = true;
            return `¡${p1} ${sep} ${p2}¡`;
        });

        if (newFixed !== fixed) {
            fixed = newFixed;
            changed = true;
        } else {
            changed = false;
        }
    }

    return fixed;
}

async function main() {
    console.log("Starting advanced delimiter fix...");

    // Fix Questions
    const allQuestions = await db.select().from(questions);
    console.log(`Checking ${allQuestions.length} questions...`);

    let qCount = 0;
    for (const q of allQuestions) {
        const updates: any = {};
        let needsUpdate = false;

        const fields = ['content', 'hint1', 'hint2', 'hint3', 'explanation'];
        for (const field of fields) {
            const original = (q as any)[field];
            const fixed = await fixDelimiters(original);
            if (original !== fixed) {
                updates[field] = fixed;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            await db.update(questions).set(updates).where(eq(questions.id, q.id));
            qCount++;
            if (qCount % 100 === 0) console.log(`Updated ${qCount} questions...`);
        }
    }
    console.log(`Finished updating ${qCount} questions.`);

    // Fix Answers
    const allAnswers = await db.select().from(answers);
    console.log(`Checking ${allAnswers.length} answers...`);

    let aCount = 0;
    for (const a of allAnswers) {
        const updates: any = {};
        let needsUpdate = false;

        const fields = ['content', 'explanation'];
        for (const field of fields) {
            const original = (a as any)[field];
            const fixed = await fixDelimiters(original);
            if (original !== fixed) {
                updates[field] = fixed;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            await db.update(answers).set(updates).where(eq(answers.id, a.id));
            aCount++;
            if (aCount % 100 === 0) console.log(`Updated ${aCount} answers...`);
        }
    }
    console.log(`Finished updating ${aCount} answers.`);

    console.log("Done!");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
