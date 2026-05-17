// Test the matching logic with sample answers - aligned with original site

// Decision tree from original site
const decisionTree = {
  "1": { mainland: "2", taiwan_macao: "2", other_country: "1a" },
  "1a": { yes: "2", no: "2" },
  "2": { yes: "2a", no: "4" },
  "2a": { yes: "2b", no: "2b" },
  "2b": { yes: "3", no: "3" },
  "3": { yes: "4", no: "3a" },
  "3a": { yes: "3b", no: "3b" },
  "3b": { yes: "4", no: "4" },
  "4": { yes: "5", no: "5" },
  "5": { yes: "5a", no: "5a" },
  "5a": { yes: "6", no: "6" },
  "6": { yes: "7", no: "7" },
};

function getNextQuestionId(currentId, answer) {
  const transitions = decisionTree[currentId];
  if (!transitions) return null;
  return transitions[answer] || null;
}

function getReachedQuestions(region, answers) {
  const reached = new Set();
  reached.add("1");
  let currentId = decisionTree["1"][region] || null;
  while (currentId) {
    reached.add(currentId);
    const answer = answers[currentId];
    if (answer === undefined) break;
    currentId = getNextQuestionId(currentId, answer);
  }
  return reached;
}

function checkCondition(reached, answers, conditions) {
  for (const [key, expectedValue] of Object.entries(conditions)) {
    if (key === "1") {
      const allowedRegions = expectedValue.split(",");
      if (!allowedRegions.includes(conditions._region)) return false;
      continue;
    }
    if (!reached.has(key)) continue;
    if (answers[key] !== expectedValue) return false;
  }
  return true;
}

function getMatchingSchemes(region, answers) {
  const matched = [];
  const reached = getReachedQuestions(region, answers);
  const ctx = (conds) => {
    const c = { ...conds, _region: region };
    return checkCondition(reached, answers, c);
  };

  // Scheme 1
  if (
    ctx({ "2": "no", "3": "yes", "2b": "no", "3a": "no" }) ||
    ctx({ "4": "no" }) ||
    ctx({ "2": "no", "3": "no", "2a": "yes", "2b": "no" }) ||
    ctx({ "2": "no", "3": "yes", "2a": "yes", "2b": "no", "3a": "yes", "3b": "no" })
  ) {
    matched.push(1);
  }

  // Scheme 2
  if (
    ctx({ "1": "mainland", "2": "no", "5": "no" }) ||
    ctx({ "1": "mainland", "7": "no" })
  ) {
    matched.push(2);
  }

  // Scheme 3
  if (ctx({ "1": "taiwan_macao,other_country", "2": "no", "5": "no" })) {
    matched.push(3);
  }

  // Scheme 4
  if (
    ctx({ "2": "no", "3": "no", "2a": "no" }) ||
    ctx({ "2": "no", "3": "yes", "5": "no", "2a": "no" })
  ) {
    matched.push(4);
  }

  // Scheme 5
  if (ctx({ "6": "no" })) {
    matched.push(5);
  }

  // Scheme 6
  if (ctx({ "2": "no", "5": "no", "5a": "no" })) {
    matched.push(6);
  }

  // Scheme 7
  if (ctx({ "1": "mainland,taiwan_macao", "2": "no", "1a": "no" })) {
    matched.push(7);
  }

  return matched.length > 0 ? matched : [1, 2, 3, 4, 5, 6, 7];
}

function testScenario(name, region, userAnswers) {
  const answers = { "1": region, ...userAnswers };
  const reached = getReachedQuestions(region, userAnswers);

  console.log("=== " + name + " ===");
  console.log("Region: " + region);
  console.log("Reached questions: " + [...reached].sort().join(", "));
  console.log("Answers: " + JSON.stringify(answers));
  console.log("Matched schemes: " + getMatchingSchemes(region, userAnswers).join(", "));
  console.log();
}

// Test 1: Mainland, no degree
testScenario(
  "Mainland - no degree, low income, no job, not tech, not top talent, no business",
  "mainland",
  { "2": "no", "4": "no", "5": "no", "5a": "no", "6": "no", "7": "no" }
);

// Test 2: Mainland, has degree
testScenario(
  "Mainland - has degree, HK grad, eligible uni, fresh grad, high income, has job, in tech, is top talent, wants business",
  "mainland",
  { "2": "yes", "2a": "yes", "2b": "yes", "3": "yes", "4": "yes", "5": "yes", "5a": "yes", "6": "yes", "7": "yes" }
);

// Test 3: Taiwan/Macao, no degree
testScenario(
  "Taiwan/Macao - no degree, low income, has job, not tech, not top talent, no business",
  "taiwan_macao",
  { "2": "no", "4": "no", "5": "yes", "5a": "no", "6": "no", "7": "no" }
);

// Test 4: Other country, not 2nd gen, no degree
testScenario(
  "Other country - NOT 2nd gen, no degree, low income, no job, not tech, not top talent, no business",
  "other_country",
  { "1a": "no", "2": "no", "4": "no", "5": "no", "5a": "no", "6": "no", "7": "no" }
);

// Test 5: Other country, IS 2nd gen
testScenario(
  "Other country - IS 2nd gen, no degree, low income, no job, not tech, not top talent, no business",
  "other_country",
  { "1a": "yes", "2": "no", "4": "no", "5": "no", "5a": "no", "6": "no", "7": "no" }
);

// Test 6: Mainland, no degree, HIGH income
testScenario(
  "Mainland - no degree, HIGH income, no job, not tech, not top talent, no business",
  "mainland",
  { "2": "no", "4": "yes", "5": "no", "5a": "no", "6": "no", "7": "no" }
);

// Test 7: Mainland, no degree, no job, IN TECH
testScenario(
  "Mainland - no degree, low income, no job, IN TECH, not top talent, no business",
  "mainland",
  { "2": "no", "4": "no", "5": "no", "5a": "yes", "6": "no", "7": "no" }
);

// Test 8: Taiwan/Macao, no degree, no job
testScenario(
  "Taiwan/Macao - no degree, low income, NO job, not tech, not top talent, no business",
  "taiwan_macao",
  { "2": "no", "4": "no", "5": "no", "5a": "no", "6": "no", "7": "no" }
);
