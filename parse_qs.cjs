const fs = require('fs');
const txt = fs.readFileSync('questions_utf8.txt', 'utf8');
const lines = txt.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('preserve') && !l.startsWith('space') && !l.startsWith('-----') && !l.startsWith('Riddle:') && l !== '/');
let qs = [];
let cur = '';
for (const l of lines) {
    cur += (cur ? ' ' : '') + l;
    let sepIndex = cur.indexOf('â€”');
    if (sepIndex === -1) sepIndex = cur.indexOf('—');
    if (sepIndex === -1) sepIndex = cur.indexOf('-');
    
    if (sepIndex !== -1) {
        let q = cur.substring(0, sepIndex);
        let a = cur.substring(sepIndex + 1);
        // remove the first char of a if it was '—' (since length of â€” might be 1 or 3 depending on encoding)
        // just replace any dashes at start
        a = a.replace(/^[—\-\s]+/, '').replace(/[()]/g, '').trim();
        if (a && q) {
            qs.push({
                id: 'general-' + (qs.length+1),
                roundId: 'general',
                number: qs.length + 1,
                question: q.trim(),
                answer: a.trim(),
                type: 'text',
                points: 10
            });
            cur = '';
        }
    }
}
while (qs.length < 50) {
    qs.push({
        id: 'general-' + (qs.length+1),
        roundId: 'general',
        number: qs.length+1,
        question: 'Extra Question ' + (qs.length+1),
        answer: 'N/A',
        type: 'text',
        points: 10
    });
}
fs.writeFileSync('src/data/generalQuestions.ts', 'import { Question } from "../types";\n\nexport const generalQuestions: Question[] = ' + JSON.stringify(qs.slice(0, 50), null, 2) + ';\n');
