// Step 1: Create a JavaScript object
const user = {
  name: "Alice",
  age: 25,
  isStudent: false,
  hobbies: ["reading", "gaming", "traveling"]
};

// Step 2: Convert JavaScript object to JSON string
const jsonString = JSON.stringify(user);
console.log("JSON String:");
console.log(jsonString);

// Step 3: Imagine this string was sent over the internet...
// Now, let's convert the JSON string back to a JavaScript object
const parsedObject = JSON.parse(jsonString);

// Step 4: Access data from the parsed JSON object
console.log("\nParsed Object:");
console.log("Name:", parsedObject.name);
console.log("Age:", parsedObject.age);
console.log("Is Student:", parsedObject.isStudent);
console.log("First Hobby:", parsedObject.hobbies[0]);
