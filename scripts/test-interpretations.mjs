// Simulate the Livewire matching logic
// Test with user's specific answers and see what each scheme's filter says

const userAnswers = {
  "1": "mainland",
  "2": "yes",
  "2a": "no",
  "2b": "yes",
  "3": "no",
  "3a": "yes",
  "3b": "yes",
  "4": "yes",
  "5": "no",
  "5a": "yes",
  "6": "yes",
  "7": "yes"
};

// Original site's filter data (from schemes_list)
// Each scheme has filter groups. Let me try BOTH interpretations.

const schemeFilters = {
  1: [
    { "1": [""], "2": "no", "3": "yes", "2b": "no", "3a": "no" },
    { "1": [""], "4": "no" },
    { "1": [""], "2": "no", "3": "no", "2a": "yes", "2b": "no" },
    { "1": [""], "2": "no", "3": "yes", "2a": "yes", "2b": "no", "3a": "yes", "3b": "no" },
  ],
  2: [
    { "1": ["mainland"], "2": "no", "5": "no" },
    { "1": ["mainland"], "7": "no" },
  ],
  3: [
    { "1": ["taiwan_macao", "other_country"], "2": "no", "5": "no" },
  ],
  4: [
    { "1": [""], "2": "no", "3": "no", "2a": "no" },
    { "1": [""], "2": "no", "3": "yes", "5": "no", "2a": "no" },
  ],
  5: [
    { "1": [""], "6": "no" },
  ],
  6: [
    { "1": [""], "2": "no", "5": "no", "5a": "no" },
  ],
  7: [
    { "1": ["mainland", "taiwan_macao"], "2": "no", "1a": "no" },
  ],
};

function matchField(filterVal, userVal) {
  // filterVal can be [""] (wildcard/any), ["mainland"], or "no"/"yes"
  if (Array.isArray(filterVal)) {
    // Region filter - [""] means any region, otherwise check if userVal is in the array
    if (filterVal.length === 1 && filterVal[0] === "") return true;
    return filterVal.includes(userVal);
  }
  if (filterVal === "") return true; // empty string = don't care
  return filterVal === userVal;
}

function matchesGroup(group, answers) {
  for (const [field, filterVal] of Object.entries(group)) {
    const userVal = answers[field];
    if (!matchField(filterVal, userVal)) return false;
  }
  return true;
}

// Interpretation 1: Inclusion - if ANY group matches, show the scheme
console.log("=== Inclusion Logic (match = show) ===");
for (let num = 1; num <= 7; num++) {
  const groups = schemeFilters[num];
  const shown = groups.some(g => matchesGroup(g, userAnswers));
  console.log(`Scheme ${num}: ${shown ? 'SHOWN' : 'HIDDEN'}`);
}

// Interpretation 2: Exclusion - if ANY group matches, hide the scheme
console.log("\n=== Exclusion Logic (match = hide) ===");
for (let num = 1; num <= 7; num++) {
  const groups = schemeFilters[num];
  const hidden = groups.some(g => matchesGroup(g, userAnswers));
  console.log(`Scheme ${num}: ${hidden ? 'HIDDEN' : 'SHOWN'}`);
}

// Interpretation 3: Negation - if user CONTRADICTS all groups, show the scheme
// (contradicts = user's answer is OPPOSITE of filter value)
function contradictsGroup(group, answers) {
  for (const [field, filterVal] of Object.entries(group)) {
    if (Array.isArray(filterVal)) {
      // Region - if filter specifies specific regions, and user is NOT in any
      if (filterVal.length === 1 && filterVal[0] === "") continue; // wildcard, no contradiction
      if (!filterVal.includes(answers[field])) return true; // contradiction
    } else if (filterVal !== "") {
      const userVal = answers[field];
      if (userVal !== filterVal) return true; // contradiction
    }
  }
  return false;
}

console.log("\n=== Negation Logic (all groups contradict = show) ===");
for (let num = 1; num <= 7; num++) {
  const groups = schemeFilters[num];
  const allContradict = groups.every(g => contradictsGroup(g, userAnswers));
  console.log(`Scheme ${num}: ${allContradict ? 'SHOWN' : 'HIDDEN'}`);
}

// Interpretation 4: At least one group is NOT contradicted
console.log("\n=== Partial Match (any group NOT contradicted = show) ===");
for (let num = 1; num <= 7; num++) {
  const groups = schemeFilters[num];
  const shown = groups.some(g => !contradictsGroup(g, userAnswers));
  console.log(`Scheme ${num}: ${shown ? 'SHOWN' : 'HIDDEN'}`);
}
