import { readFileSync, writeFileSync } from 'fs';
const data = JSON.parse(readFileSync('docs/research/visa-application-full-data.json', 'utf8'));

// Extract the full scheme data with clean filters
const schemeData = data.schemes_list[0];

// Clean extraction helper
function cleanField(f) {
  if (typeof f === 'string') return f !== '' ? f : null;
  if (Array.isArray(f) && f.length > 0) {
    if (Array.isArray(f[0]) && f[0].length > 0) return f[0];
    return null;
  }
  return null;
}

function cleanCondition(cond) {
  const result = {};
  for (const [k, v] of Object.entries(cond)) {
    if (k === 's') continue;
    const clean = cleanField(v);
    if (clean !== null) result[k] = clean;
  }
  return result;
}

function cleanGroup(group) {
  if (!group || typeof group !== 'object' || Array.isArray(group)) return null;
  const result = {};
  for (const [k, v] of Object.entries(group)) {
    if (k === 's') continue;
    const clean = cleanField(v);
    if (clean !== null) result[k] = clean;
  }
  return Object.keys(result).length > 0 ? result : null;
}

// Process all 7 schemes
for (let num = 1; num <= 7; num++) {
  const s = schemeData[String(num)];
  if (!s || !Array.isArray(s) || s.length === 0) continue;
  const item = s[0];

  // Get title
  let title = 'N/A';
  if (item.title && Array.isArray(item.title)) {
    const t0 = item.title[0];
    if (t0 && t0['zh-HK'] && Array.isArray(t0['zh-HK']) && Array.isArray(t0['zh-HK'][0])) {
      title = t0['zh-HK'][0][0];
    }
  }

  console.log(`=== Scheme ${num}: ${title} ===`);

  // Extract filter groups
  if (item.filter && Array.isArray(item.filter)) {
    // item.filter is [[[group1], {s:'arr'}], [group2, ...], ...]
    // Actually: [[[cond1, {s:'arr'}], [cond2, {s:'arr'}], ...], {s:'arr'}]
    const filterData = item.filter;
    if (Array.isArray(filterData) && filterData.length > 0) {
      const groups = filterData[0]; // First element is the groups array
      if (Array.isArray(groups)) {
        for (let gi = 0; gi < groups.length; gi++) {
          const cond = groups[gi];
          if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
            console.log(`  Group ${gi + 1}:`, JSON.stringify(cleanCondition(cond)));
          } else if (Array.isArray(cond)) {
            // cond might be [{condition obj}, {s:'arr'}]
            const obj = cond[0];
            if (obj && typeof obj === 'object') {
              console.log(`  Group ${gi + 1}:`, JSON.stringify(cleanCondition(obj)));
            }
          }
        }
      }
    }
  }
  console.log();
}
