import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('docs/research/visa-application-full-data.json', 'utf8'));

// Check questions_list for scheme-related data
const ql = data.questions_list[0];

for (const [num, qArr] of Object.entries(ql)) {
  if (num === 's' || !Array.isArray(qArr) || qArr.length === 0) continue;
  const q = qArr[0];
  if (!q || typeof q !== 'object') continue;

  // Check if there's a "scheme" or "exclude" field in the question
  const keys = Object.keys(q);
  const schemeKeys = keys.filter(k => k.includes('scheme') || k.includes('exclude') || k.includes('suitable'));

  if (schemeKeys.length > 0) {
    console.log(`Q${num} has scheme-related keys:`, schemeKeys);
    for (const k of schemeKeys) {
      console.log(`  ${k}:`, JSON.stringify(q[k]).substring(0, 300));
    }
    console.log();
  }
}

// Also check answers_list for scheme data
console.log('=== answers_list ===');
const al = data.answers_list;
if (Array.isArray(al) && al.length > 0) {
  console.log('answers_list[0] keys:', Object.keys(al[0]));
  // Check if answers have scheme associations
  for (const [answerId, answerArr] of Object.entries(al[0])) {
    if (answerId === 's') continue;
    if (Array.isArray(answerArr) && answerArr.length > 0) {
      const answer = answerArr[0];
      if (answer && typeof answer === 'object') {
        const aKeys = Object.keys(answer);
        const schemeKeys = aKeys.filter(k => k.includes('scheme') || k.includes('suitable') || k.includes('exclude'));
        if (schemeKeys.length > 0) {
          console.log(`Answer ${answerId} has scheme keys:`, schemeKeys);
        }
        // Print full answer if it has interesting keys
        console.log(`Answer ${answerId}:`, JSON.stringify(answer).substring(0, 300));
      }
    }
  }
}
