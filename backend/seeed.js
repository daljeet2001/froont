import mongoose from "mongoose";
import dotenv from "dotenv";
import Questions from "./models/Questions.js"
dotenv.config();

const JavascriptQuestions = [
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

// const reactQuestions = [
//   {
//     title: "Build a Counter Component",
//     slug: "counter-component",
//     description: "Create a React component that displays a number and has + / - buttons to increase or decrease the count.",
//     category: "react",
//     difficulty: "easy",
//     starterCode: `

//  function App() {
//   // your code here
//   return (
//     <div>
//       <h2>Count: 0</h2>
//       <button>+</button>
//       <button>-</button>
//     </div>
//   );
// }`,
//     assets: { type: "image", url: "" },
//     examples: [
//       { input: "Click + twice", output: "Count: 2", explannation: "State updates on button clicks." },
//       { input: "Click - once from 0", output: "Count: -1", explannation: "Count decreases correctly." }
//     ],
//     testCases: [
//       { input: "click + three times", expectedOutput: "Count: 3" },
//       { input: "click - once at start", expectedOutput: "Count: -1" }
//     ]
//   },
//   {
//     title: "Toggle Text Component",
//     slug: "toggle-text",
//     description: "Build a React component with a button that toggles between showing and hiding text.",
//     category: "react",
//     difficulty: "easy",
//     starterCode: `

//  function App() {
//   // your code here
//   return (
//     <div>
//       <button>Toggle</button>
//       {/* conditionally render text */}
//     </div>
//   );
// }`,
//     assets: { type: "image", url: "" },
//     examples: [
//       { input: "Initial render", output: "Text hidden", explannation: "Text is not shown at start." },
//       { input: "Click button once", output: "Hello World", explannation: "Text appears." }
//     ],
//     testCases: [
//       { input: "click toggle once", expectedOutput: "Hello World" },
//       { input: "click toggle twice", expectedOutput: "Text hidden" }
//     ]
//   },
//   {
//     title: "Form Input Handler",
//     slug: "form-input-handler",
//     description: "Create a React form with an input field that shows the entered value in real-time below the input.",
//     category: "react",
//     difficulty: "medium",
//     starterCode: `

//  function App() {
//   // your code here
//   return (
//     <div>
//       <input placeholder="Type something" />
//       <p>Output: </p>
//     </div>
//   );
// }`,
//     assets: { type: "image", url: "" },
//     examples: [
//       { input: "Type 'React'", output: "Output: React", explannation: "Input value is displayed below." }
//     ],
//     testCases: [
//       { input: "hello", expectedOutput: "Output: hello" },
//       { input: "world", expectedOutput: "Output: world" }
//     ]
//   },
//   {
//     title: "Todo List Component",
//     slug: "todo-list",
//     description: "Build a simple Todo List where users can add tasks and see them displayed in a list.",
//     category: "react",
//     difficulty: "medium",
//     starterCode: `

//  function App() {
//   // your code here
//   return (
//     <div>
//       <input placeholder="Add todo" />
//       <button>Add</button>
//       <ul></ul>
//     </div>
//   );
// }`,
//     assets: { type: "image", url: "" },
//     examples: [
//       { input: "Add 'Learn React'", output: "<ul><li>Learn React</li></ul>", explannation: "Todo gets added to list." }
//     ],
//     testCases: [
//       { input: "Add 'Task 1'", expectedOutput: ["Task 1"] },
//       { input: "Add 'Task 1' and 'Task 2'", expectedOutput: ["Task 1", "Task 2"] }
//     ]
//   },
//   {
//     title: "Conditional Rendering",
//     slug: "conditional-rendering",
//     description: "Create a component that shows 'Logged In' if isLoggedIn is true, otherwise 'Please Log In'.",
//     category: "react",
//     difficulty: "easy",
//     starterCode: `

//  function App({ isLoggedIn }) {
//   // your code here
//   return (
//     <div>
//       {/* render text based on isLoggedIn */}
//     </div>
//   );
// }`,
//     assets: { type: "image", url: "" },
//     examples: [
//       { input: "isLoggedIn=true", output: "Logged In", explannation: "Shows correct status." },
//       { input: "isLoggedIn=false", output: "Please Log In", explannation: "Default message." }
//     ],
//     testCases: [
//       { input: { isLoggedIn: true }, expectedOutput: "Logged In" },
//       { input: { isLoggedIn: false }, expectedOutput: "Please Log In" }
//     ]
//   }
// ];


// const htmlQuestions = [
//   {
//     title: "Basic HTML Page Structure",
//     slug: "basic-html-structure",
//     description: "Write the basic structure of an HTML5 page.",
//     category: "HTML",
//     difficulty: "easy",
//     starterCode: `<!DOCTYPE html>
// <html>
//   <head>
//     <title>My Page</title>
//   </head>
//   <body>
//     <!-- your code here -->
//   </body>
// </html>`,
//     examples: [
//       { input: "Open in browser", output: "Empty page with title 'My Page'", explannation: "Shows correct structure" }
//     ],
//     testCases: [
//       { input: "doctype", expectedOutput: true },
//       { input: "html/head/body tags", expectedOutput: true }
//     ]
//   },
//   {
//     title: "Create a Link",
//     slug: "create-a-link",
//     description: "Write HTML to create a hyperlink to https://google.com with text 'Google'.",
//     category: "HTML",
//     difficulty: "easy",
//     starterCode: `<a href="">Link</a>`,
//     examples: [
//       { input: "Click link", output: "Opens Google.com", explannation: "Correct href used." }
//     ],
//     testCases: [
//       { input: "<a>", expectedOutput: true }
//     ]
//   }
// ];

// const cssQuestions = [
//   {
//     title: "Change Text Color",
//     slug: "change-text-color",
//     description: "Write CSS to make all paragraph text red.",
//     category: "CSS",
//     difficulty: "easy",
//     starterCode: `.test {
//   /* your code here */
// }`,
//     examples: [
//       { input: "<p>Hello</p>", output: "Red text", explannation: "Paragraph styled correctly." }
//     ],
//     testCases: [
//       { input: "p { color: red; }", expectedOutput: true }
//     ]
//   },
//   {
//     title: "Center a Div",
//     slug: "center-a-div",
//     description: "Center a div horizontally and vertically using Flexbox.",
//     category: "CSS",
//     difficulty: "medium",
//     starterCode: `.test {
//   display: flex;
//   /* your code here */
// }`,
//     examples: [
//       { input: "<div class='container'><div class='box'></div></div>", output: "Box centered", explannation: "Uses flexbox centering." }
//     ],
//     testCases: [
//       { input: "justify-content: center;", expectedOutput: true },
//       { input: "align-items: center;", expectedOutput: true }
//     ]
//   }
// ];

const MONGODB_URI=process.env.MONGODB_URI
async function seedDB() 
{ try 
  { 
    await mongoose.connect(MONGODB_URI, 
      { useNewUrlParser: true, useUnifiedTopology: true });
       console.log("✅ MongoDB connected"); 
      //  await Questions.deleteMany({}); console.log("🗑 Cleared old questions"); 
       await Questions.insertMany(JavascriptQuestions); 
       console.log("🌱 Seed data inserted"); process.exit(); 
      } 
       catch (err) { s
        console.error("❌ Seeding error:", err);
         process.exit(1); 
        } 
      } 
      seedDB();