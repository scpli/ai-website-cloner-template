import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('docs/research/visa-application-full-data.json', 'utf8'));

// Extract questions_list data
const ql = data.questions_list[0];

for (const [num, q] of Object.entries(ql)) {
  if (num === 's' || !q || typeof q !== 'object' || Array.isArray(q)) continue;

  const qd = {};

  // Extract title
  if (q.title && typeof q.title === 'object' && !Array.isArray(q.title)) {
    qd.title = q.title['zh-HK'];
  }

  // Extract options
  if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
    qd.options = q.options['zh-HK'];
  }

  // Extract next
  if (q.next && typeof q.next === 'object' && !Array.isArray(q.next)) {
    qd.next = q.next;
  }

  console.log(`Q${num}:`, JSON.stringify(qd, null, 2));
  console.log();
}
