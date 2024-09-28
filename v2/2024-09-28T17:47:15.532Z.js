const {Static} = require(".index");
new Static(__filename)   .enable();
let my_name = "jacob has a cool car;" + "[]"; "string"   ;
let         age=2; "number";
"not a statement to be parsed";
my_name = 23;
if (typeof my_name !== "string") { const type = typeof my_name; console.log("Static Typing Error: Expected Type: [string] Recieved Type: [ " + type + " ]");}
if (typeof age !== "number") { const type = typeof age; console.log("Static Typing Error: Expected Type: [number] Recieved Type: [ " + type + " ]");}