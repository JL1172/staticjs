const { Type } = require("./index.js");
// import { Type } from "./index";

const type = new Type(__filename);

type.variable("number");
let myVar= 3; 

type.variable("string");
let name = "jacob"; 

myVar = 2;
function hello() {
  console.log("hello world");
  myVar = 10;
}
// }

name = "yes";
myVar = "heeflkajds";

myVar = new RegExp("hello world");

myVar = "hello";
name = 2323

type.eof();