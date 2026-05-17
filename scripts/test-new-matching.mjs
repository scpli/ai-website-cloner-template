// Test the NEW matching logic (qualification-based)

function getMatchingSchemes(region, answers) {
  const result = [];
  const a = (id) => answers[id] || "";

  const hasHighIncome = a("4") === "yes";
  const hasEligibleDegree = a("2") === "yes" && a("2b") === "yes";
  if (hasHighIncome || hasEligibleDegree) result.push(1);

  const hasJobOffer = a("5") === "yes";
  const isNonMainland = region === "taiwan_macao" || region === "other_country";
  if (hasJobOffer && isNonMainland) result.push(2);

  if (region === "mainland" && hasJobOffer) result.push(3);

  const isHKGraduate = a("2a") === "yes";
  if (isHKGraduate) result.push(4);

  const isTopTalent = a("6") === "yes";
  if (isTopTalent) result.push(5);

  const inTech = a("5a") === "yes";
  if (hasJobOffer && inTech) result.push(6);

  const isSecondGen = a("1a") === "yes";
  if (isSecondGen) result.push(7);

  return result.length > 0 ? result : [1, 2, 3, 4, 5, 6, 7];
}

function test(name, region, answers, expected) {
  const result = getMatchingSchemes(region, answers);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log((pass ? "PASS" : "FAIL") + ": " + name);
  if (!pass) {
    console.log("  Expected: " + expected.join(", "));
    console.log("  Got:      " + result.join(", "));
  }
}

// User's actual answers: mainland, Q2=yes, Q3=no, Q4=yes, Q5=no, Q6=yes, Q7=yes
// Q2a=no, Q2b=yes, Q3a=yes, Q3b=yes, Q5a=yes
// Original site shows: Schemes 1 and 5
test(
  "User: mainland, degree, high income, no job, top talent, wants business",
  "mainland",
  { "2": "yes", "3": "no", "4": "yes", "5": "no", "6": "yes", "7": "yes",
    "2a": "no", "2b": "yes", "3a": "yes", "3b": "yes", "5a": "yes" },
  [1, 5]
);

// Test 2: Mainland, no degree, low income, no job
test(
  "Mainland - no degree, low income, no job, not tech, not top talent",
  "mainland",
  { "2": "no", "4": "no", "5": "no", "5a": "no", "6": "no", "7": "no" },
  [1, 2, 3, 4, 5, 6, 7]  // Fallback - doesn't match any specific scheme
);

// Test 3: Mainland, has degree, HK graduate
test(
  "Mainland - has degree, HK graduate, has job offer",
  "mainland",
  { "2": "yes", "2a": "yes", "2b": "yes", "3": "yes", "4": "no", "5": "yes", "5a": "no", "6": "no", "7": "no" },
  [1, 3, 4]
);

// Test 4: Taiwan/Macao, no degree, has job
test(
  "Taiwan/Macao - no degree, has job offer, in tech",
  "taiwan_macao",
  { "2": "no", "4": "no", "5": "yes", "5a": "yes", "6": "no", "7": "no" },
  [2, 6]
);

// Test 5: Other country, 2nd gen
test(
  "Other country - IS 2nd gen HK PR",
  "other_country",
  { "1a": "yes", "2": "no", "4": "no", "5": "no", "5a": "no", "6": "no", "7": "no" },
  [7]
);
