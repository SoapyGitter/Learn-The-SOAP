/**
 * CURRICULUM SCHEMA
 * ─────────────────────────────────────────────────────────────
 * Each subject has:
 *   id        — unique slug
 *   label     — display name
 *   icon      — lucide icon name
 *   color     — tailwind accent class prefix
 *   levels[]  — ordered array of level objects
 *
 * Each level has:
 *   id              — unique level id (e.g. "math-l1")
 *   title           — display title
 *   requiredToPass  — number of challenges to complete to unlock next level
 *   challenges[]    — array of challenge objects
 *
 * Challenge types:
 *   "math"    — free-text numeric answer
 *   "history" — multiple choice (options[], correctIndex)
 *   "code"    — code execution (language, starterCode, expectedOutput, testCases[])
 *   "algo"    — same as code but tagged differently
 * ─────────────────────────────────────────────────────────────
 */

export const SUBJECTS = [
  // ═══════════════════════════════════════════
  //  MATH  (150 challenges required per level)
  // ═══════════════════════════════════════════
  {
    id: 'math',
    label: 'Mathematics',
    icon: 'Calculator',
    accentColor: '#818cf8', // indigo
    accentClass: 'indigo',
    requiredToUnlock: 150,
    levels: [
      {
        id: 'math-l1',
        title: 'Foundations',
        description: 'Arithmetic, fractions, and basic algebra.',
        requiredToPass: 150,
        theory: {
          title: 'The Language of Numbers',
          sections: [
            {
              heading: 'Why Mathematics?',
              content: `Mathematics is the universal language of logic and pattern. Every discipline—physics, finance, computer science, music—uses math as its backbone. Before you can solve complex problems, you need to internalize the rules that govern how numbers interact. This level covers the foundational arithmetic rules that everything else builds on.`,
            },
            {
              heading: 'Order of Operations (PEMDAS / BODMAS)',
              content: `When an expression has multiple operations, the order you perform them changes the result entirely. The agreed-upon order is:\n\n1. **Parentheses** (innermost first)\n2. **Exponents** (powers and roots)\n3. **Multiplication & Division** (left to right)\n4. **Addition & Subtraction** (left to right)\n\nExample: 3 + 4 × 2 = 3 + 8 = 11, NOT 14. Multiplication runs before addition. A common mistake is treating the expression left-to-right without applying precedence.`,
            },
            {
              heading: 'Fractions',
              content: `A fraction represents a part of a whole: numerator/denominator. Key rules:\n\n• **Adding fractions**: find a common denominator first. 1/3 + 1/4 = 4/12 + 3/12 = 7/12.\n• **Multiplying fractions**: straight across. 2/3 × 3/4 = 6/12 = 1/2.\n• **Dividing fractions**: multiply by the reciprocal. 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6.\n• Always simplify by dividing numerator and denominator by their GCD.`,
            },
            {
              heading: 'Basic Algebra',
              content: `Algebra introduces variables — placeholders for unknown values. An equation is a balance: whatever you do to one side, you must do to the other.\n\nSolving 2x − 7 = 13:\n1. Add 7 to both sides: 2x = 20\n2. Divide both sides by 2: x = 10\n\nThe golden rule: isolate the variable by applying inverse operations. Subtraction undoes addition; division undoes multiplication.`,
            },
            {
              heading: 'What to Expect in These Challenges',
              content: `You'll work through 150 problems covering arithmetic precision, fraction manipulation, and single-variable equations. Each problem is short — 30 seconds to 2 minutes each. The goal is pattern recognition through repetition. Speed and accuracy compound: getting these fundamentals automatic frees up mental bandwidth for harder problems later.`,
            },
          ],
          keyPoints: [
            'Always apply PEMDAS/BODMAS — never evaluate left-to-right blindly.',
            'Fractions require a common denominator before adding or subtracting.',
            'An equation is a balance — any operation on one side must mirror the other.',
            'Simplify fractions by dividing numerator and denominator by their GCD.',
            'Algebra is just arithmetic with an unknown — isolate the variable step by step.',
          ],
        },
        challenges: [
          {
            id: 'math-l1-001',
            type: 'math',
            title: 'Order of Operations',
            prompt: 'Evaluate: 3 + 4 × 2 − (8 ÷ 4)',
            hint: 'Remember PEMDAS/BODMAS — multiplication before addition.',
            answer: '9',
            difficulty: 'easy',
            tags: ['arithmetic', 'order-of-operations'],
          },
          {
            id: 'math-l1-002',
            type: 'math',
            title: 'Fraction Addition',
            prompt: 'Simplify: 2/3 + 5/6',
            hint: 'Find the least common denominator first.',
            answer: '3/2',
            answerAliases: ['1.5', '1 1/2'],
            difficulty: 'easy',
            tags: ['fractions'],
          },
          {
            id: 'math-l1-003',
            type: 'math',
            title: 'Basic Algebra',
            prompt: 'Solve for x: 2x − 7 = 13',
            hint: 'Isolate x by adding 7 to both sides, then divide.',
            answer: '10',
            difficulty: 'easy',
            tags: ['algebra', 'linear-equations'],
          },
          // ── Add more math challenges here (target: 150 per level) ──
        ],
      },
      {
        id: 'math-l2',
        title: 'Intermediate Algebra',
        description: 'Quadratics, polynomials, and inequalities.',
        requiredToPass: 150,
        theory: {
          title: 'Beyond Linear: Quadratics & Polynomials',
          sections: [
            {
              heading: 'The Quadratic Equation',
              content: `A quadratic has the form ax² + bx + c = 0. Unlike linear equations that produce one solution, quadratics can produce two, one, or zero real solutions.\n\nThe Quadratic Formula solves any quadratic:\n  x = (−b ± √(b²−4ac)) / 2a\n\nThe **discriminant** (b²−4ac) tells you how many roots exist:\n• > 0: two real roots\n• = 0: one repeated root\n• < 0: no real roots (complex only)`,
            },
            {
              heading: 'Factoring Polynomials',
              content: `Factoring is finding what multiplies together to give the polynomial.\n\nFor x² + bx + c: find two numbers that multiply to c and add to b.\nExample: x² + 5x + 6 = (x + 2)(x + 3) because 2×3=6 and 2+3=5.\n\nThe FOIL method (First, Outer, Inner, Last) expands binomial products:\n(x+3)(x−2) = x² − 2x + 3x − 6 = x² + x − 6`,
            },
            {
              heading: 'Inequalities',
              content: `Inequalities follow the same rules as equations with one critical exception: **multiplying or dividing both sides by a negative number flips the inequality sign.**\n\n−2x > 6  →  x < −3  (sign flipped when dividing by −2)\n\nSolution sets are often expressed as intervals: x ∈ (−∞, −3)`,
            },
          ],
          keyPoints: [
            'Quadratic formula: x = (−b ± √(b²−4ac)) / 2a — memorize it.',
            'Discriminant < 0 means no real solutions exist.',
            'Flipping inequality signs when multiplying/dividing by negatives is the most common mistake.',
            'Always verify factored form by expanding back out.',
          ],
        },
        challenges: [
          {
            id: 'math-l2-001',
            type: 'math',
            title: 'Quadratic Formula',
            prompt: 'Find the positive root of: x² − 5x + 6 = 0',
            hint: 'Factor or use the quadratic formula.',
            answer: '3',
            difficulty: 'medium',
            tags: ['quadratics'],
          },
          {
            id: 'math-l2-002',
            type: 'math',
            title: 'Polynomial Expansion',
            prompt: 'Expand and simplify: (x + 3)(x − 2)',
            hint: 'Use FOIL or the distributive property.',
            answer: 'x^2+x-6',
            answerAliases: ['x²+x-6', 'x^2 + x - 6'],
            difficulty: 'medium',
            tags: ['polynomials'],
          },
          {
            id: 'math-l2-003',
            type: 'math',
            title: 'Inequality Solving',
            prompt: 'Solve: 3x + 4 > 10. Give the smallest integer solution.',
            hint: 'Isolate x, then find the smallest integer satisfying the inequality.',
            answer: '3',
            difficulty: 'medium',
            tags: ['inequalities'],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════
  //  PROGRAMMING  (15 challenges required/level)
  // ════════════════════════════════════════════
  {
    id: 'programming',
    label: 'Programming',
    icon: 'Code2',
    accentColor: '#00ff87',
    accentClass: 'emerald',
    requiredToUnlock: 15,
    levels: [
      {
        id: 'prog-l1',
        title: 'JavaScript Basics',
        description: 'Variables, loops, functions, and arrays.',
        requiredToPass: 15,
        theory: {
          title: 'Thinking Like a Programmer',
          sections: [
            {
              heading: 'What is a Program?',
              content: `A program is a precise sequence of instructions that a computer executes. Unlike human language, code has zero tolerance for ambiguity — every comma, bracket, and keyword matters.\n\nJavaScript runs in every web browser and on servers (via Node.js). It is the most widely deployed programming language in the world, making it the ideal starting point.`,
            },
            {
              heading: 'Variables and Data Types',
              content: `Variables are named containers for values. In modern JavaScript (ES6+):\n\n• **const** — a value that won't be reassigned (prefer this by default)\n• **let** — a value that may change\n• **var** — legacy, function-scoped (avoid in new code)\n\nCore types: number, string, boolean, null, undefined, object, array.\n\nType coercion (implicit conversion) is a major source of bugs. Use === (strict equality) not == to compare values.`,
            },
            {
              heading: 'Functions',
              content: `Functions are reusable blocks of logic. They take inputs (parameters) and return an output.\n\n\`\`\`js\nfunction add(a, b) { return a + b; }\nconst add = (a, b) => a + b;  // arrow function\n\`\`\`\n\nA function that calls itself is **recursive** — it needs a base case to stop. Functions are first-class values in JavaScript: you can pass them as arguments, return them, and store them in variables.`,
            },
            {
              heading: 'Arrays and Loops',
              content: `Arrays hold ordered lists. Access elements by zero-based index: arr[0] is the first element.\n\nKey array methods:\n• arr.push(x) / arr.pop() — add/remove from end\n• arr.map(fn) — transform every element\n• arr.filter(fn) — keep elements that pass a test\n• arr.reduce(fn, init) — fold into a single value\n\nLoops: for, while, for...of (iterates values), for...in (iterates keys).`,
            },
          ],
          keyPoints: [
            'Use const by default, let when you need to reassign — never var.',
            'Always use === for comparison, never ==.',
            'Functions are first-class: they can be stored, passed, and returned.',
            'Array indices start at 0, not 1.',
            'Every recursive function needs a base case to avoid infinite recursion.',
          ],
        },
        challenges: [
          {
            id: 'prog-l1-001',
            type: 'code',
            language: 'javascript',
            title: 'Hello World',
            prompt: 'Write a function `greet(name)` that returns `"Hello, <name>!"`. Then call it with `"World"` and print the result.',
            hint: 'Use template literals: `Hello, ${name}!`',
            starterCode: `// Write your greet function below
function greet(name) {
  // your code here
}

console.log(greet("World"));`,
            expectedOutput: 'Hello, World!',
            testCases: [
              { input: 'greet("World")', expected: 'Hello, World!' },
              { input: 'greet("Alice")', expected: 'Hello, Alice!' },
            ],
            difficulty: 'easy',
            tags: ['functions', 'strings'],
          },
          {
            id: 'prog-l1-002',
            type: 'code',
            language: 'javascript',
            title: 'Sum of Array',
            prompt: 'Write a function `sumArray(arr)` that returns the sum of all numbers in an array. Print the result for `[1, 2, 3, 4, 5]`.',
            hint: 'You can use a for loop or Array.reduce().',
            starterCode: `function sumArray(arr) {
  // your code here
}

console.log(sumArray([1, 2, 3, 4, 5]));`,
            expectedOutput: '15',
            testCases: [
              { input: 'sumArray([1,2,3,4,5])', expected: '15' },
              { input: 'sumArray([10, -3, 7])', expected: '14' },
            ],
            difficulty: 'easy',
            tags: ['arrays', 'loops'],
          },
          {
            id: 'prog-l1-003',
            type: 'code',
            language: 'javascript',
            title: 'FizzBuzz',
            prompt: 'Print numbers 1–15. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz".',
            hint: 'Check divisibility by 15 first, then 3, then 5.',
            starterCode: `// FizzBuzz 1 to 15
for (let i = 1; i <= 15; i++) {
  // your code here
}`,
            expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
            testCases: [],
            difficulty: 'easy',
            tags: ['loops', 'conditionals'],
          },
          // ── Add more code challenges here (target: 15 per level) ──
        ],
      },
      {
        id: 'prog-l2',
        title: 'Intermediate JS',
        description: 'Closures, async, DOM patterns, and OOP.',
        requiredToPass: 15,
        theory: {
          title: 'Closures, Scope, and the Asynchronous Mind',
          sections: [
            {
              heading: 'Scope and Closures',
              content: `Scope defines which variables are accessible where. JavaScript has **lexical scope** — a function can see variables from the scope where it was *defined*, not where it's called.\n\nA **closure** occurs when an inner function retains access to its outer function's variables after the outer function has returned. This enables patterns like factories, memoization, and encapsulation.`,
            },
            {
              heading: 'The Event Loop',
              content: `JavaScript is single-threaded but non-blocking through an **event loop**. When async work (timers, fetch, file I/O) completes, its callback is pushed to the call stack only when the stack is empty.\n\nThis means: setTimeout(() => {}, 0) does NOT run immediately — it runs after the current synchronous code finishes.\n\nPromises and async/await are syntactic wrappers around this callback model that make async code look synchronous.`,
            },
            {
              heading: 'Common Higher-Order Patterns',
              content: `Higher-order functions take or return other functions:\n\n• **debounce(fn, ms)** — delays fn until ms milliseconds after the last call. Used for search inputs.\n• **throttle(fn, ms)** — ensures fn runs at most once per ms window.\n• **memoize(fn)** — caches previous results to avoid recomputation.\n\nThese patterns exist in every serious JavaScript codebase.`,
            },
          ],
          keyPoints: [
            'Closures capture the *environment*, not a snapshot of values.',
            'The event loop: synchronous code always runs before any async callbacks.',
            'async/await is syntactic sugar — it still returns a Promise under the hood.',
            'Debounce delays execution; throttle limits frequency. They solve different problems.',
          ],
        },
        challenges: [
          {
            id: 'prog-l2-001',
            type: 'code',
            language: 'javascript',
            title: 'Counter Closure',
            prompt: 'Create a `makeCounter()` function that returns a closure. Each call to the returned function increments and returns a count starting from 0. Print the first 3 results.',
            hint: 'The inner function closes over a `count` variable in the outer scope.',
            starterCode: `function makeCounter() {
  // your code here
}

const counter = makeCounter();
console.log(counter());
console.log(counter());
console.log(counter());`,
            expectedOutput: '1\n2\n3',
            testCases: [],
            difficulty: 'medium',
            tags: ['closures', 'functions'],
          },
          {
            id: 'prog-l2-002',
            type: 'code',
            language: 'javascript',
            title: 'Flatten Array',
            prompt: 'Write `flattenArray(arr)` that flattens one level of nesting. Print the result for `[[1,2],[3,[4,5]],[6]]`.',
            hint: 'Use Array.flat() or concat with spread.',
            starterCode: `function flattenArray(arr) {
  // your code here
}

console.log(JSON.stringify(flattenArray([[1,2],[3,[4,5]],[6]])));`,
            expectedOutput: '[1,2,3,[4,5],6]',
            testCases: [],
            difficulty: 'medium',
            tags: ['arrays'],
          },
          {
            id: 'prog-l2-003',
            type: 'code',
            language: 'javascript',
            title: 'Debounce Function',
            prompt: 'Implement a `debounce(fn, delay)` function. For testing, use a synchronous mock — call the debounced fn 3 times rapidly, then call it after "delay" ms. Print "called" once.',
            hint: 'Use clearTimeout/setTimeout. For the test, just verify the concept with a direct call.',
            starterCode: `function debounce(fn, delay) {
  // your code here
}

// Quick functional test
let callCount = 0;
const track = debounce(() => { callCount++; console.log("called"); }, 0);
track();
track();
track();
// In a real browser, only the last call fires after 'delay' ms.
// For this test, we'll call it one more time after a tick:
setTimeout(() => {
  if (callCount === 0) console.log("called"); // fires once
}, 10);`,
            expectedOutput: 'called',
            testCases: [],
            difficulty: 'hard',
            tags: ['closures', 'timing'],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════
  //  ALGORITHMS  (15 challenges required/level)
  // ════════════════════════════════════════════
  {
    id: 'algorithms',
    label: 'Algorithms',
    icon: 'GitBranch',
    accentColor: '#f59e0b',
    accentClass: 'amber',
    requiredToUnlock: 15,
    levels: [
      {
        id: 'algo-l1',
        title: 'Searching & Sorting',
        description: 'Binary search, bubble sort, and complexity basics.',
        requiredToPass: 15,
        theory: {
          title: 'How Computers Find and Order Things',
          sections: [
            {
              heading: 'Big-O Notation',
              content: `Big-O describes how an algorithm's runtime *grows* as input size (n) grows. It ignores constants and focuses on the dominant term:\n\n• O(1) — constant. Doesn't matter how big n is.\n• O(log n) — logarithmic. Halves the problem each step (binary search).\n• O(n) — linear. Must touch every element once.\n• O(n log n) — linearithmic. Merge sort, quicksort (average).\n• O(n²) — quadratic. Nested loops over the same data (bubble sort).\n\nWhen designing algorithms, always ask: "What is the worst case?"`,
            },
            {
              heading: 'Binary Search',
              content: `Binary search works on a **sorted** array. Instead of checking every element, it checks the midpoint and discards half the remaining search space.\n\nAlgorithm:\n1. Set low=0, high=arr.length-1\n2. While low <= high: mid = Math.floor((low+high)/2)\n3. If arr[mid] === target: found!\n4. If arr[mid] < target: low = mid+1 (target is in right half)\n5. If arr[mid] > target: high = mid-1 (target is in left half)\n\nTime complexity: O(log n). For 1 million elements, binary search needs at most 20 comparisons. Linear search needs 1 million.`,
            },
            {
              heading: 'Sorting Algorithms',
              content: `**Bubble Sort** (O(n²)): repeatedly swap adjacent elements if out of order. Simple to understand, terrible in practice.\n\n**Merge Sort** (O(n log n)): divide array in half recursively, sort each half, then merge. Stable and predictable.\n\n**Quick Sort** (O(n log n) average): pick a pivot, partition elements less/greater than pivot, recurse. Fast in practice, O(n²) worst case.\n\nFor most real work: use the built-in Array.sort() which uses TimSort (a hybrid).`,
            },
            {
              heading: 'The Hash Map',
              content: `A hash map (object / Map in JavaScript) gives O(1) average lookup by storing values at computed indices. This is the key to solving many "find pair" problems efficiently.\n\nTwo Sum pattern: instead of O(n²) nested loops, iterate once and store each value in a map. For each element, check if (target - element) already exists in the map. O(n) total.`,
            },
          ],
          keyPoints: [
            'Binary search requires a sorted array — applying it to unsorted data produces wrong answers.',
            'Big-O measures growth rate, not absolute speed.',
            'Hash maps trade memory for time — O(1) lookup at the cost of extra space.',
            'Bubble sort is for learning, not production. Use the built-in sort for real code.',
            'When you see a nested loop over the same array, ask if a hash map can flatten it to O(n).',
          ],
        },
        challenges: [
          {
            id: 'algo-l1-001',
            type: 'algo',
            language: 'javascript',
            title: 'Binary Search',
            prompt: 'Implement `binarySearch(sortedArr, target)`. Return the index or -1 if not found. Print the index of `7` in `[1, 3, 5, 7, 9, 11]`.',
            hint: 'Track low, mid, high pointers. Halve the search space each iteration.',
            starterCode: `function binarySearch(arr, target) {
  // your code here
}

console.log(binarySearch([1, 3, 5, 7, 9, 11], 7));`,
            expectedOutput: '3',
            testCases: [
              { input: 'binarySearch([1,3,5,7,9,11], 7)', expected: '3' },
              { input: 'binarySearch([1,3,5,7,9,11], 4)', expected: '-1' },
            ],
            difficulty: 'easy',
            tags: ['searching', 'divide-and-conquer'],
          },
          {
            id: 'algo-l1-002',
            type: 'algo',
            language: 'javascript',
            title: 'Bubble Sort',
            prompt: 'Implement `bubbleSort(arr)` that sorts an array in ascending order in-place. Print the sorted `[64, 34, 25, 12, 22, 11, 90]`.',
            hint: 'Swap adjacent elements if they are in the wrong order. Repeat until no swaps needed.',
            starterCode: `function bubbleSort(arr) {
  // your code here
  return arr;
}

console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]).join(','));`,
            expectedOutput: '11,12,22,25,34,64,90',
            testCases: [],
            difficulty: 'easy',
            tags: ['sorting'],
          },
          {
            id: 'algo-l1-003',
            type: 'algo',
            language: 'javascript',
            title: 'Two Sum',
            prompt: 'Given an array of integers `nums` and a target, return the indices of two numbers that add up to target. Print the answer for `nums=[2,7,11,15], target=9`.',
            hint: 'Use a hash map to store seen values and their indices for O(n) time.',
            starterCode: `function twoSum(nums, target) {
  // your code here
}

console.log(twoSum([2, 7, 11, 15], 9).join(','));`,
            expectedOutput: '0,1',
            testCases: [],
            difficulty: 'easy',
            tags: ['hash-map', 'arrays'],
          },
          // ── Add more algo challenges here (target: 15 per level) ──
        ],
      },
      {
        id: 'algo-l2',
        title: 'Dynamic Programming',
        description: 'Memoization, tabulation, and classic DP problems.',
        requiredToPass: 15,
        theory: {
          title: 'Breaking Hard Problems into Solved Sub-Problems',
          sections: [
            {
              heading: 'What is Dynamic Programming?',
              content: `Dynamic Programming (DP) solves problems by breaking them into overlapping sub-problems and storing solutions to avoid recomputation. It applies when a problem has:\n\n1. **Optimal substructure** — the optimal solution is built from optimal sub-solutions.\n2. **Overlapping sub-problems** — the same sub-problem appears multiple times.\n\nThe classic example: Fibonacci. fib(5) = fib(4) + fib(3). fib(3) is computed inside both fib(4) and fib(3). Without caching, this is O(2ⁿ). With caching, it's O(n).`,
            },
            {
              heading: 'Memoization (Top-Down)',
              content: `Start with recursion, add a cache (memo). Before computing, check if the answer is already cached:\n\n\`\`\`js\nfunction fib(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  memo[n] = fib(n-1, memo) + fib(n-2, memo);\n  return memo[n];\n}\n\`\`\`\n\nThis is "lazy" — it only computes sub-problems that are actually needed.`,
            },
            {
              heading: 'Tabulation (Bottom-Up)',
              content: `Build a table iteratively from the smallest sub-problem up. No recursion, no stack overflow risk:\n\n\`\`\`js\nfunction fib(n) {\n  const dp = [0, 1];\n  for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];\n  return dp[n];\n}\n\`\`\`\n\nTabulation is generally faster (no function call overhead) and uses predictable memory.`,
            },
            {
              heading: 'Classic DP Problems',
              content: `• **Coin Change**: minimum coins to make amount N. dp[amount] = min over all coins of dp[amount - coin] + 1.\n• **Longest Common Subsequence**: dp[i][j] = longest common subsequence of s1[0..i] and s2[0..j].\n• **0/1 Knapsack**: maximum value fitting weight W. dp[i][w] = max of (include item i) vs (exclude item i).\n\nRecognizing which template to apply is 80% of solving DP problems.`,
            },
          ],
          keyPoints: [
            'DP = recursion + cache. If you can write the recursion, adding memoization is trivial.',
            'Always identify the state: what parameters uniquely describe a sub-problem?',
            'Bottom-up (tabulation) avoids recursion depth limits and is faster in practice.',
            'Draw the recursion tree first — you will see the overlapping sub-problems immediately.',
            'Most DP problems require O(n) or O(n²) space — think about whether you can reduce it.',
          ],
        },
        challenges: [
          {
            id: 'algo-l2-001',
            type: 'algo',
            language: 'javascript',
            title: 'Fibonacci (Memoized)',
            prompt: 'Write `fib(n)` using memoization. Print `fib(10)`.',
            hint: 'Cache results in an object/Map to avoid recomputing subproblems.',
            starterCode: `function fib(n, memo = {}) {
  // your code here
}

console.log(fib(10));`,
            expectedOutput: '55',
            testCases: [],
            difficulty: 'easy',
            tags: ['dynamic-programming', 'recursion'],
          },
          {
            id: 'algo-l2-002',
            type: 'algo',
            language: 'javascript',
            title: 'Coin Change',
            prompt: 'Given coins `[1, 5, 6, 9]` and amount `11`, find the minimum number of coins needed. Print the result.',
            hint: 'Bottom-up DP: build a table dp[0..amount], dp[0] = 0.',
            starterCode: `function coinChange(coins, amount) {
  // your code here
}

console.log(coinChange([1, 5, 6, 9], 11));`,
            expectedOutput: '2',
            testCases: [],
            difficulty: 'medium',
            tags: ['dynamic-programming'],
          },
          {
            id: 'algo-l2-003',
            type: 'algo',
            language: 'javascript',
            title: 'Longest Common Subsequence',
            prompt: 'Return the length of the LCS of `"abcde"` and `"ace"`. Print the result.',
            hint: 'Build a 2D DP table. If chars match, dp[i][j] = dp[i-1][j-1] + 1.',
            starterCode: `function lcs(s1, s2) {
  // your code here
}

console.log(lcs("abcde", "ace"));`,
            expectedOutput: '3',
            testCases: [],
            difficulty: 'medium',
            tags: ['dynamic-programming', 'strings'],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════
  //  HISTORY  (25 quiz questions required/level)
  // ════════════════════════════════════════════
  {
    id: 'history',
    label: 'World History',
    icon: 'BookOpen',
    accentColor: '#e879f9',
    accentClass: 'fuchsia',
    requiredToUnlock: 25,
    levels: [
      {
        id: 'hist-l1',
        title: 'Ancient Civilizations',
        description: 'Mesopotamia, Egypt, Greece, and Rome.',
        requiredToPass: 25,
        theory: {
          title: 'The Foundations of Civilization',
          sections: [
            {
              heading: 'Why Study Ancient History?',
              content: `The civilizations of the ancient world invented writing, codified law, developed mathematics, built empires, and asked the fundamental questions of philosophy that still shape us. Every modern institution — democracy, legal systems, scientific inquiry, organized religion — traces directly to decisions made in Mesopotamia, Egypt, Greece, and Rome. Understanding them means understanding the infrastructure of the present.`,
            },
            {
              heading: 'Mesopotamia: The Cradle',
              content: `Between the Tigris and Euphrates rivers (modern Iraq), the Sumerians (~3500 BCE) developed the first known writing system (cuneiform), large-scale agriculture, and city-states. The Babylonians later codified the first major legal system: the **Code of Hammurabi** (~1754 BCE), featuring 282 laws inscribed on a stone stele. Its principle of proportional justice ("an eye for an eye") was revolutionary.`,
            },
            {
              heading: 'Greece: Democracy and Philosophy',
              content: `Athens (~508 BCE) invented direct democracy under Cleisthenes. The classical period (~480–323 BCE) produced Socrates, Plato, and Aristotle — whose frameworks for ethics, politics, and science dominated Western thought for 2,000 years.\n\nKey distinction: Socrates wrote nothing. We know his ideas through Plato's Dialogues. Aristotle was Plato's student and Alexander the Great's tutor.`,
            },
            {
              heading: 'Rome: Law, Engineering, Empire',
              content: `Rome transitioned from a Republic (~509 BCE) to an Empire (~27 BCE). At its peak, the Roman Empire controlled ~5 million km² and ~70 million people.\n\nRoman contributions: a unified legal code (basis of most European legal systems), Latin (ancestor of French, Spanish, Italian, Portuguese), engineering (aqueducts, roads, concrete), and the transmission of Greek culture westward.\n\nThe Western Roman Empire fell in **476 CE** when the Germanic chieftain Odoacer deposed Romulus Augustulus.`,
            },
          ],
          keyPoints: [
            'Mesopotamia gave us writing, agriculture at scale, and the first codified laws.',
            'Code of Hammurabi (~1754 BCE): one of history\'s earliest written legal codes.',
            'Greek democracy was direct, not representative — citizens voted on laws themselves.',
            'Socrates never wrote anything; his philosophy is known only through Plato.',
            'Rome fell (Western Empire) in 476 CE — the Eastern Empire (Byzantine) lasted until 1453 CE.',
          ],
        },
        challenges: [
          {
            id: 'hist-l1-001',
            type: 'history',
            title: 'Code of Hammurabi',
            prompt: 'The Code of Hammurabi is one of the oldest known legal codes. Which ancient civilization produced it?',
            options: ['Ancient Egypt', 'Mesopotamia (Babylon)', 'Ancient Greece', 'Indus Valley'],
            correctIndex: 1,
            explanation: 'Hammurabi was the sixth king of the First Babylonian dynasty. His famous code (~1754 BCE) is among the first written law codes in history.',
            difficulty: 'easy',
            tags: ['mesopotamia', 'law', 'babylon'],
          },
          {
            id: 'hist-l1-002',
            type: 'history',
            title: 'Fall of Rome',
            prompt: 'In which year is the Western Roman Empire traditionally said to have fallen?',
            options: ['410 CE', '455 CE', '476 CE', '527 CE'],
            correctIndex: 2,
            explanation: '476 CE — when the Germanic chieftain Odoacer deposed Romulus Augustulus, the last Western Roman emperor.',
            difficulty: 'easy',
            tags: ['rome', 'decline'],
          },
          {
            id: 'hist-l1-003',
            type: 'history',
            title: 'Greek Philosophy',
            prompt: 'Which philosopher is known for the Socratic method — a form of dialogue to stimulate critical thinking?',
            options: ['Plato', 'Aristotle', 'Socrates', 'Pythagoras'],
            correctIndex: 2,
            explanation: 'Socrates developed the elenctic method (now called the Socratic method), using probing questions to reveal contradictions in opponents\' arguments.',
            difficulty: 'easy',
            tags: ['greece', 'philosophy'],
          },
          // ── Add more history challenges here (target: 25 per level) ──
        ],
      },
      {
        id: 'hist-l2',
        title: 'Medieval to Renaissance',
        description: 'Feudalism, Black Death, exploration, and reform.',
        requiredToPass: 25,
        theory: {
          title: 'Collapse, Plague, and Rebirth',
          sections: [
            {
              heading: 'The Medieval World',
              content: `After Rome's fall, Europe fragmented into competing kingdoms. **Feudalism** organized society as a pyramid: kings granted land (fiefs) to nobles (lords) in exchange for military service; lords leased land to peasants (serfs) who worked it in exchange for protection.\n\nThe Catholic Church was the dominant institution — it ran hospitals, universities, and wielded political power exceeding many kings.`,
            },
            {
              heading: 'The Black Death (1347–1351)',
              content: `Bubonic plague arrived in Europe via Silk Road traders in 1347. In four years, it killed an estimated **30–50% of Europe's population** (~25 million people). This catastrophic death toll had cascading effects:\n\n• Labor shortage empowered surviving peasants to demand better wages\n• Weakened feudal obligations\n• Sparked widespread questioning of Church authority (why did God allow this?)\n• Indirectly accelerated social changes that enabled the Renaissance`,
            },
            {
              heading: 'The Magna Carta and Rule of Law',
              content: `In 1215, rebellious English barons forced **King John** to sign the Magna Carta at Runnymede. Its key principle: the king is not above the law. Clause 39 guaranteed that no free man could be imprisoned without lawful judgment of his peers — a proto-due-process right.\n\nThis document became the foundation of English constitutional law and influenced the US Constitution and Bill of Rights 575 years later.`,
            },
            {
              heading: 'Renaissance and the Printing Press',
              content: `The Renaissance ("rebirth") began in 14th-century Italy as scholars rediscovered classical Greek and Roman texts. It spread north partly because of **Johannes Gutenberg's printing press** (~1440).\n\nBefore Gutenberg, a book took months to copy by hand. The press could produce hundreds of identical copies quickly, democratizing information. Martin Luther's 95 Theses (1517) spread across Europe in weeks — the Reformation was partly a consequence of mass printing.`,
            },
          ],
          keyPoints: [
            'Feudalism: land in exchange for military service — a pyramid from kings to serfs.',
            'The Black Death killed 30–50% of Europe, inadvertently accelerating social reform.',
            'Magna Carta (1215): the king must operate within the law — foundation of constitutional government.',
            'Gutenberg\'s press (~1440) made mass literacy possible and directly enabled the Reformation.',
            'The Renaissance began in Italy; the printing press spread it north.',
          ],
        },
        challenges: [
          {
            id: 'hist-l2-001',
            type: 'history',
            title: 'The Black Death',
            prompt: 'What percentage of Europe\'s population is estimated to have died during the Black Death (1347–1351)?',
            options: ['10–15%', '20–25%', '30–50%', '60–70%'],
            correctIndex: 2,
            explanation: 'Estimates range from 30% to 50% of Europe\'s population — roughly 25–30 million people — died during this catastrophic plague.',
            difficulty: 'medium',
            tags: ['medieval', 'plague', 'europe'],
          },
          {
            id: 'hist-l2-002',
            type: 'history',
            title: 'The Printing Press',
            prompt: 'Johannes Gutenberg\'s printing press (~1440) directly accelerated which major movement?',
            options: ['The Crusades', 'The Renaissance & Reformation', 'The Industrial Revolution', 'The Age of Exploration'],
            correctIndex: 1,
            explanation: 'Gutenberg\'s movable type press enabled mass production of books, supercharging the spread of Renaissance ideas and Luther\'s Reformation tracts.',
            difficulty: 'medium',
            tags: ['renaissance', 'technology', 'reformation'],
          },
          {
            id: 'hist-l2-003',
            type: 'history',
            title: 'Magna Carta',
            prompt: 'The Magna Carta (1215) was a foundational document limiting royal power. Which king was forced to sign it?',
            options: ['Richard I', 'Henry II', 'John I', 'Edward I'],
            correctIndex: 2,
            explanation: 'King John of England signed the Magna Carta at Runnymede in 1215 under pressure from rebellious barons, establishing that the king was subject to the rule of law.',
            difficulty: 'easy',
            tags: ['england', 'law', 'medieval'],
          },
        ],
      },
    ],
  },
]

/**
 * Helper: flatten all challenges across all levels for a subject
 */
export function getAllChallenges(subjectId) {
  const subject = SUBJECTS.find(s => s.id === subjectId)
  if (!subject) return []
  return subject.levels.flatMap(level =>
    level.challenges.map(ch => ({ ...ch, levelId: level.id }))
  )
}

/**
 * Helper: get subject config by id
 */
export function getSubject(subjectId) {
  return SUBJECTS.find(s => s.id === subjectId) ?? null
}

/**
 * Helper: get a specific level
 */
export function getLevel(subjectId, levelId) {
  const subject = getSubject(subjectId)
  return subject?.levels.find(l => l.id === levelId) ?? null
}
