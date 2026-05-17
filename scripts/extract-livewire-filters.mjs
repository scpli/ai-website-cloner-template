import https from 'https';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://www.hkengage.gov.hk/zh-HK/how-to-apply-for-a-visa';
const OUTPUT_DIR = path.resolve('docs/research');

function fetchPage() {
  return new Promise((resolve, reject) => {
    https.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-HK,zh-TW;q=0.9,zh;q=0.8,en;q=0.7',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching page...');
  const html = await fetchPage();

  // Save raw HTML for reference
  fs.writeFileSync(path.join(OUTPUT_DIR, 'livewire-fetch.html'), html);
  console.log('Saved raw HTML to livewire-fetch.html');

  // Find all wire:snapshot attributes
  const snapshotRegex = /wire:snapshot="([^"]+)"/g;
  let match;
  let snapshots = [];

  while ((match = snapshotRegex.exec(html)) !== null) {
    try {
      const decoded = match[1].replace(/&quot;/g, '"').replace(/\\&amp;/g, '&').replace(/&#039;/g, "'");
      const parsed = JSON.parse(decoded);
      snapshots.push({
        name: parsed.memo?.name || 'unknown',
        wireId: parsed.memo?.id || 'unknown',
        data: parsed.data,
      });
    } catch(e) {
      console.log('Parse error for snapshot:', match[1].substring(0, 200));
      console.log('Error:', e.message);
    }
  }

  console.log(`Found ${snapshots.length} Livewire snapshots`);

  // For each snapshot, dump the full data
  for (const snap of snapshots) {
    console.log(`\n=== Snapshot: ${snap.name} (wire:id: ${snap.wireId}) ===`);
    console.log('Data keys:', Object.keys(snap.data));
    console.log('Full data:', JSON.stringify(snap.data, null, 2).substring(0, 5000));
  }

  // Also look for inline scripts that might contain filter/scheme data
  // Search for patterns like "filters", "schemes", "conditions", "matching"
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  let interestingScripts = [];

  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const content = scriptMatch[1];
    if (content.includes('scheme') || content.includes('filter') || content.includes('match') ||
        content.includes('condition') || content.includes('suitable') || content.includes('visa')) {
      interestingScripts.push({
        preview: content.substring(0, 200),
        full: content,
      });
    }
  }

  console.log(`\n=== Found ${interestingScripts.length} interesting scripts ===`);
  for (let i = 0; i < interestingScripts.length; i++) {
    console.log(`\n--- Script ${i + 1} ---`);
    console.log(interestingScripts[i].preview);
    console.log('...');
    console.log('FULL CONTENT:');
    console.log(interestingScripts[i].full);
  }

  // Also search for any data attributes or JSON embedded in the page
  const dataPattern = /data-[^=]+="([^"]*(?:schemes|filters|conditions)[^"]*)"/gi;
  let dataMatch;
  while ((dataMatch = dataPattern.exec(html)) !== null) {
    console.log('\nData attribute found:', dataMatch[0].substring(0, 500));
  }

  // Search for any PHP/Blade variables that might encode the filter rules
  // Look for JSON encoded in script tags
  const jsonInScript = /<script[^>]*>\s*(?:const|let|var)\s+\w+\s*=\s*({[\s\S]*?});?\s*<\/script>/gi;
  let jsonMatch;
  while ((jsonMatch = jsonInScript.exec(html)) !== null) {
    if (jsonMatch[1].includes('scheme') || jsonMatch[1].includes('filter')) {
      console.log('\nJSON in script found:', jsonMatch[1].substring(0, 2000));
    }
  }

  // Look for the component's Blade template which might have the matching logic
  // Search for patterns like @if, @foreach with scheme-related conditions
  const bladeConditions = html.match(/@if.*scheme.*@endif/g);
  if (bladeConditions) {
    console.log('\nBlade conditions found:', bladeConditions.length);
    bladeConditions.forEach((c, i) => console.log(`Condition ${i}: ${c.substring(0, 300)}`));
  }

  // Save everything
  const result = {
    snapshots: snapshots.map(s => ({...s, dataStr: JSON.stringify(s.data, null, 2)})),
    interestingScripts: interestingScripts.map(s => s.full),
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'livewire-snapshots.json'), JSON.stringify(result, null, 2));
  console.log('\nSaved full snapshot data to livewire-snapshots.json');
}

main().catch(console.error);
