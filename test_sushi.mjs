import fs from 'fs';
const html = fs.readFileSync('test_sushi_raw.html', 'utf-8');

const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  const content = match[1];
  if (content.includes('player') || content.includes('video') || content.includes('http') || content.includes('ajax')) {
    console.log('--- SCRIPT START ---');
    console.log(content.substring(0, 500));
    console.log('--- SCRIPT END ---');
  }
}

// Check for any meta or data attributes
const divs = html.match(/<[^>]+data-[^>]+>/gi) || [];
for (let d of divs) {
    if (d.includes('player') || d.includes('video') || d.includes('http') || d.includes('url') || d.includes('id')) {
        console.log("DIV:", d);
    }
}
