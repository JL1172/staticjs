const { Type } = require("./index.js");
// import { Type } from "./index";

const type = new Type(__filename);

type.variable("number");
let myVar= 1; 

type.variable("string");
const name = "jacob"; 

myVar = 2;
function hello() {
  console.log("hello world");
  myVar = 10;
}
// }
myVar = "heeflkajds";

myVar = new RegExp("hello world");

myVar = "hello world";

type.eof();