const { Type } = require("./index.js");
// import { Type } from "./index";

const type = new Type(__filename);

type.variable("number");
let myVar= 3; 

type.variable("object");
let dob = new Date();

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

dob = {};
myVar = "hello";
name = 1;

type.eof();