import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL);

/**
 * Normalizes theory_notes to be 100% compliant with AlanMath canonical standard:
 * 1. Clean author typos like \!¡ before closing math delimiter -> ¡
 *    e.g., ¡x_0 = 2\!¡ -> ¡x_0 = 2¡
 * 2. Remove opening Spanish ¡ in exclamatory text phrases/sentences
 *    e.g. ¡No sumes lo que está dentro de las raíces! -> No sumes lo que está dentro de las raíces!
 *    e.g. ¡Cuidado con el cero! -> Cuidado con el cero!
 * 3. Never touch valid math delimiters ¡...¡ or ¡¡...¡¡ or $...$ / $$...$$.
 */
export function cleanTheoryNotes(content: string): string {
  if (!content) return content;

  let res = content;

  // 1. Clean author typos like \!¡ before closing math delimiter -> ¡
  res = res.replace(/\\!¡/g, '¡');
  // Also clean \!: -> :
  res = res.replace(/\\!:/g, ':');

  // 2. Remove opening Spanish ¡ in exclamatory text phrases/sentences
  // Matches ¡ followed by text ending with ! that is NOT followed by ¡
  res = res.replace(/¡([A-Za-zÁÉÍÓÚáéíóúñÑ¿][^¡\n]*?!(?!¡))/g, '$1');

  return res;
}

async function run() {
  const isExecute = process.argv.includes('--execute');
  console.log(`=== RUNNING THEORY NOTES CLEANUP (${isExecute ? 'EXECUTE MODE' : 'DRY RUN MODE'}) ===`);

  const rows = await client`SELECT id, title, theory_notes FROM quizzes WHERE theory_notes IS NOT NULL AND length(theory_notes) > 0 ORDER BY id ASC`;
  console.log(`Auditing ${rows.length} quizzes with theory_notes...\n`);

  let modifiedCount = 0;
  const updates: Array<{ id: number; title: string; changes: string[] }> = [];

  for (const row of rows) {
    const original = row.theory_notes;
    const cleaned = cleanTheoryNotes(original);

    if (cleaned !== original) {
      modifiedCount++;
      const changes: string[] = [];
      if (/\\!¡/.test(original)) changes.push('Removed \\!¡ typo');
      if (original.includes('¡') && (cleaned.match(/¡/g) || []).length < (original.match(/¡/g) || []).length) {
        changes.push('Removed Spanish opening ¡ in text');
      }

      updates.push({ id: row.id, title: row.title, changes });

      if (isExecute) {
        await client`UPDATE quizzes SET theory_notes = ${cleaned} WHERE id = ${row.id}`;
      }
    }
  }

  console.log(`Total quizzes checked: ${rows.length}`);
  console.log(`Total quizzes to modify: ${modifiedCount}\n`);

  console.log('List of updated quizzes:');
  for (const u of updates) {
    console.log(` - Quiz ${u.id} (${u.title}): ${u.changes.join(', ')}`);
  }

  if (isExecute) {
    console.log('\n✅ All updates successfully executed in the database!');
  } else {
    console.log('\nℹ️ This was a dry run. Run with --execute to commit changes to database.');
  }

  await client.end();
}

run().catch((err) => {
  console.error('Error running cleanup:', err);
  process.exit(1);
});
