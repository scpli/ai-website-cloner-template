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

  // Find all wire:snapshot attributes
  const snapshotRegex = /wire:snapshot="([^"]+)"/g;
  let match;
  let snapshots = [];

  while ((match = snapshotRegex.exec(html)) !== null) {
    try {
      const decoded = match[1].replace(/&quot;/g, '"').replace(/\\&amp;/g, '&').replace(/&#039;/g, "'");
      const parsed = JSON.parse(decoded);
      if (parsed.memo?.name === 'visa-application') {
        console.log('Found visa-application snapshot!');
        console.log('Full data JSON length:', JSON.stringify(parsed.data).length);

        // Save the full data
        fs.writeFileSync(
          path.join(OUTPUT_DIR, 'visa-application-full-data.json'),
          JSON.stringify(parsed.data, null, 2)
        );
        console.log('Saved to visa-application-full-data.json');

        // Now let's explore key fields
        const data = parsed.data;

        // Print schemes_list
        if (data.schemes_list) {
          console.log('\n=== schemes_list ===');
          console.log(JSON.stringify(data.schemes_list, null, 2).substring(0, 10000));
        }

        // Print questions_list
        if (data.questions_list) {
          console.log('\n=== questions_list ===');
          console.log(JSON.stringify(data.questions_list, null, 2).substring(0, 10000));
        }

        // Print matching_tool
        if (data.matching_tool) {
          console.log('\n=== matching_tool ===');
          console.log(JSON.stringify(data.matching_tool, null, 2).substring(0, 10000));
        }

        // Print suitable_schemes
        if (data.suitable_schemes) {
          console.log('\n=== suitable_schemes ===');
          console.log(JSON.stringify(data.suitable_schemes, null, 2));
        }
      }
    } catch(e) {
      // Skip parse errors
    }
  }

  // Also look for any wire:entangle or initial component state in script tags
  // that might contain the filter rules as initial data
  const allScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  while ((scriptMatch = allScriptRegex.exec(html)) !== null) {
    const content = scriptMatch[1];
    // Look for Livewire initial state / script with component data
    if (content.includes('Livewire') && content.includes('schemes')) {
      console.log('\n=== Livewire script with schemes ===');
      console.log(content.substring(0, 5000));
    }
  }

  // Now let's also look for any __livewire or similar script that bootstraps components
  const livewireScriptRegex = /<script[^>]*src="[^"]*livewire[^"]*"[^>]*><\/script>/gi;
  let lsMatch;
  while ((lsMatch = livewireScriptRegex.exec(html)) !== null) {
    console.log('\nLivewire script:', lsMatch[0].substring(0, 200));
  }

  // Check for any inline JSON with filter rules (sometimes encoded as HTML entities)
  const entityEncodedJSON = html.match(/&quot;schemes?&quot;.*?&quot;/g);
  if (entityEncodedJSON) {
    console.log('\n=== Entity-encoded scheme references ===');
    entityEncodedJSON.forEach((e, i) => {
      if (i < 20) console.log(i + ':', e.substring(0, 200));
    });
  }

  // Look for data attributes with scheme info
  const schemeDataAttrs = html.match(/data-[^=]*="[^"]*scheme[^"]*"/gi);
  if (schemeDataAttrs) {
    console.log('\n=== Data attributes with scheme ===');
    schemeDataAttrs.forEach((e, i) => {
      if (i < 20) console.log(i + ':', e.substring(0, 200));
    });
  }

  // Search for the actual matching/filter logic
  // In Laravel Livewire, the matching rules are often in the Blade template as conditionals
  // Look for HTML elements that have scheme-specific data
  const schemeElements = html.match(/<[^>]*scheme[^>]*>/gi);
  if (schemeElements) {
    console.log('\n=== Elements with scheme in attributes ===');
    schemeElements.forEach((e, i) => {
      if (i < 30) console.log(i + ':', e.substring(0, 300));
    });
  }

  // Look for any x-data, x-bind, x-show, x-if that reference scheme conditions
  const alpineSchemeRefs = html.match(/(x-(?:data|bind|show|if|class|style))="[^"]*scheme[^"]*"/gi);
  if (alpineSchemeRefs) {
    console.log('\n=== Alpine directives referencing schemes ===');
    alpineSchemeRefs.forEach((e, i) => {
      if (i < 30) console.log(i + ':', e.substring(0, 300));
    });
  }

  // Look for any wire:click that triggers search/update with scheme data
  const wireSchemeRefs = html.match(/wire:[^=]+="[^"]*(?:scheme|match|filter)[^"]*"/gi);
  if (wireSchemeRefs) {
    console.log('\n=== Wire directives referencing schemes ===');
    wireSchemeRefs.forEach((e, i) => {
      if (i < 30) console.log(i + ':', e.substring(0, 300));
    });
  }
}

main().catch(console.error);
