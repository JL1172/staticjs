# This is a broad overview of v2

## Bugs 

First lets get to some bugs I am currently working out. 

* **Comment Parsing**
* I am running into issues with parsing comments. 
* in order to replicate this issue, a string that has the following value `"hell/////////o"` will throw an execution error in the `execute code` method because of the way comments are parsed

* **Typing**
* the parser will not know difference between some composite types because they all evaluate to objects, primitive type parsing is accurate. 
* custom types are not supported yet. Need to evaluate method to introduce them
* functions are not typed yet, neither are local variables not globally scoped

* Ideas for solutions
* parse this.formatted_code field instance which is split with `\n` as a delimitter. At each line, split and parse comments that way. 


