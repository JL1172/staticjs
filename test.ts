// const { Type } = require("./index.ts");
import { Type } from ".";

const type = new Type(__filename);

type.variable("number");

let myVar:  any = 1;

myVar = 2;
function hello() {
  console.log("hello world");
  myVar = 10;
}
// }
myVar = "heeflkajds";

myVar = new RegExp("hello world");

myVar = 1;
