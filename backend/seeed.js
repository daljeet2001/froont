import mongoose from "mongoose";
import dotenv from "dotenv";
import Questions from "./models/Questions.js"
dotenv.config();
const extraQuestions = [
  {
    title: "Find Maximum in Array",
    slug: "find-maximum-in-array",
    description: "Write a function that returns the maximum number from an array.",
    category: "Javascript",
    difficulty: "easy",
    starterCode: `function findMax(arr) {
  // your code here
}`,
    examples: [
      { input: "[1, 3, 2, 8, 5]", output: "8", explannation: "8 is the largest number." },
      { input: "[-5, -2, -10]", output: "-2", explannation: "All numbers negative, so -2 is max." }
    ],
    testCases: [
      { input: [1, 3, 2, 8, 5], expectedOutput: 8 },
      { input: [-5, -2, -10], expectedOutput: -2 },
      { input: [10], expectedOutput: 10 }
    ]
  },
  {
    title: "Fibonacci Sequence",
    slug: "fibonacci-sequence",
    description: "Return the nth Fibonacci number using recursion or iteration.",
    category: "Javascript",
    difficulty: "medium",
    starterCode: `function fibonacci(n) {
  // your code here
}`,
    examples: [
      { input: "5", output: "5", explannation: "Sequence: 0,1,1,2,3,5 → 5th index is 5." },
      { input: "7", output: "13", explannation: "Sequence: 0,1,1,2,3,5,8,13 → 7th index is 13." }
    ],
    testCases: [
      { input: 5, expectedOutput: 5 },
      { input: 7, expectedOutput: 13 },
      { input: 0, expectedOutput: 0 }
    ]
  },
  {
    title: "Flatten Nested Array",
    slug: "flatten-nested-array",
    description: "Write a function that flattens a nested array into a single array.",
    category: "Javascript",
    difficulty: "hard",
    starterCode: `function flattenArray(arr) {
  // your code here
}`,
    examples: [
      { input: "[1, [2, [3, 4], 5]]", output: "[1,2,3,4,5]", explannation: "Flatten nested arrays." },
      { input: "[[1], [2, 3], 4]", output: "[1,2,3,4]", explannation: "Multiple nesting handled." }
    ],
    testCases: [
      { input: [1, [2, [3, 4], 5]], expectedOutput: [1, 2, 3, 4, 5] },
      { input: [[1], [2, 3], 4], expectedOutput: [1, 2, 3, 4] }
    ]
  },
  {
    title: "Debounce Function",
    slug: "debounce-function",
    description: "Implement a debounce function that delays execution until after wait ms.",
    category: "Javascript",
    difficulty: "hard",
    starterCode: `function debounce(fn, delay) {
  // your code here
}`,
    examples: [
      { input: "debounce(log, 300)", output: "Executes only once after 300ms idle", explannation: "Useful for search input." }
    ],
    testCases: [
      { input: ["log", 300], expectedOutput: "debounced" }
    ]
  },
  {
    title: "Capitalize First Letter",
    slug: "capitalize-first-letter",
    description: "Capitalize the first letter of each word in a string.",
    category: "Javascript",
    difficulty: "easy",
    starterCode: `function capitalizeWords(str) {
  // your code here
}`,
    examples: [
      { input: `"hello world"`, output: `"Hello World"`, explannation: "Both words capitalized." }
    ],
    testCases: [
      { input: "hello world", expectedOutput: "Hello World" },
      { input: "javascript is fun", expectedOutput: "Javascript Is Fun" }
    ]
  },
  {
    title: "Remove Duplicates from Array",
    slug: "remove-duplicates",
    description: "Remove duplicate values from an array and return unique elements.",
    category: "Javascript",
    difficulty: "medium",
    starterCode: `function removeDuplicates(arr) {
  // your code here
}`,
    examples: [
      { input: "[1,1,2,3,3,4]", output: "[1,2,3,4]", explannation: "Duplicates removed." }
    ],
    testCases: [
      { input: [1, 1, 2, 3, 3, 4], expectedOutput: [1, 2, 3, 4] },
      { input: [5, 5, 5], expectedOutput: [5] }
    ]
  },
  {
    title: "Count Vowels",
    slug: "count-vowels",
    description: "Count the number of vowels in a string.",
    category: "Javascript",
    difficulty: "easy",
    starterCode: `function countVowels(str) {
  // your code here
}`,
    examples: [
      { input: `"hello"`, output: "2", explannation: "e,o are vowels." },
      { input: `"rhythm"`, output: "0", explannation: "No vowels here." }
    ],
    testCases: [
      { input: "hello", expectedOutput: 2 },
      { input: "rhythm", expectedOutput: 0 },
      { input: "AEIOU", expectedOutput: 5 }
    ]
  },
  {
    title: "Array Chunking",
    slug: "array-chunking",
    description: "Split an array into chunks of a given size.",
    category: "Javascript",
    difficulty: "medium",
    starterCode: `function chunkArray(arr, size) {
  // your code here
}`,
    examples: [
      { input: "[1,2,3,4,5], size=2", output: "[[1,2],[3,4],[5]]", explannation: "Groups of 2 elements." }
    ],
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2], expectedOutput: [[1, 2], [3, 4], [5]] },
      { input: [[1, 2, 3], 3], expectedOutput: [[1, 2, 3]] }
    ]
  },
  {
    title: "Deep Clone Object",
    slug: "deep-clone-object",
    description: "Write a function to deep clone a nested object.",
    category: "Javascript",
    difficulty: "hard",
    starterCode: `function deepClone(obj) {
  // your code here
}`,
    examples: [
      { input: `{a:1, b:{c:2}}`, output: `{a:1, b:{c:2}} (new reference)`, explannation: "Nested object must be copied." }
    ],
    testCases: [
      { input: { a: 1, b: { c: 2 } }, expectedOutput: { a: 1, b: { c: 2 } } }
    ]
  },
  {
    title: "Find Missing Number",
    slug: "find-missing-number",
    description: "Given an array containing n distinct numbers from 0 to n, find the missing one.",
    category: "Javascript",
    difficulty: "medium",
    starterCode: `function findMissingNumber(arr) {
  // your code here
}`,
    examples: [
      { input: "[3,0,1]", output: "2", explannation: "Numbers 0-3, missing 2." },
      { input: "[0,1]", output: "2", explannation: "Numbers 0-2, missing 2." }
    ],
    testCases: [
      { input: [3, 0, 1], expectedOutput: 2 },
      { input: [0, 1], expectedOutput: 2 },
      { input: [9, 6, 4, 2, 3, 5, 7, 0, 1], expectedOutput: 8 }
    ]
  }
];
const MONGODB_URI=process.env.MONGODB_URI
async function seedDB() 
{ try 
  { 
    await mongoose.connect(MONGODB_URI, 
      { useNewUrlParser: true, useUnifiedTopology: true });
       console.log("✅ MongoDB connected"); 
       await Questions.deleteMany({}); console.log("🗑 Cleared old questions"); 
       await Questions.insertMany(extraQuestions); 
       console.log("🌱 Seed data inserted"); process.exit(); 
      } 
       catch (err) { s
        console.error("❌ Seeding error:", err);
         process.exit(1); 
        } 
      } 
      seedDB();