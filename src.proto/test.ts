// const {Static} = require("../lib/index");
import {Static} from "./index";

new Static(__filename)   .enableVars();
/*ignore this as well
*/
let my_name = "jacob has a cool car;" + "[]"; "string"   ;

let         age=2; "number";
//sjdf
// asdfoihajsdofhasdfasldfkjnasdflkasjdfasdlfkj
/*

ads'flkjaldsfkj
asdflkjhsad;lfkjas
*/
//im going to ignore this as well
// const array = new Array(10).fill("hello");
"not a statement to be parsed";

var $CustomType = {customer_name: "string", customer_address: "string"};
var $CustomTypeTwo = {customer_name: "string", customer_address: "string"};

const min = 2; "number";

const date = new Date(); "Date";

const nothing = null; "null";

const und = undefined; "undefined";

const name = "jacob lang"; "string";

const array = ['jacob','lain','isaac']; "[string | number | $CustomType | [{string, number}] | $Custom_Type2 | Date]";

const obj = {name: "jacob", age: 23}; "{string | number}";

const map = new Map(); "Map<string, number>";

// const bigInt = 3242048203094832892333232323223; "BigInt"

// const promise = new Promise(resolve => resolve); "Promise"

const fun = (greeting) => console.log("hello " + greeting); "Function(string):void";

const reg = /[a-z]/; "RegExp";

const weakMap = new WeakMap(); "WeakMap<string, number>";

const weakSet = new WeakSet(); "WeakSet<number>";

const err = new Error("hello world"); "Error";

const set = new Set(); "Set<number>";

const customer = {customer_name: "alaina lang", customer_address: "1006 rd"}; "$CustomType"; 

const customer_tw0 = {customer_name: "jacob lang", customer_address: "10056 long island drive"}; "$CustomTypeTwo";


//ignored


