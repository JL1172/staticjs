## Preface

First we have a class named *statc*, this is the entry point

Here we have a the first functionality in the constructor code block that ensures *filename* is passed as an argument.

My design philosophy is screw DRY and just write clean code. DRY principles can obfuscate the crap out of code and can make stupid s*** stupider. Take error handling for example. Usually i would make one error method that errors would be reported to, as I have always done, which is fine in some circumstances, but stack tracing sucks with one uniform, amorphous error method. I want one type of methoerrorsd to be called for one type of error that would happen in the program flow, so if parts of the program break or fail, I am not trying to sort through the layers of abstraction i "geniously" crafted in order to conform to the questionable DRY principles.

Moral of the story, DRY is fine, for semi-complicated code. But, trying to conform to it can waste time and can make maintainability difficult, so for this application of staticjs, errors that are reported are done in a separate way so each error has a tag and if something internal breaks I at least know what functionality is broken and where to start. 

## Chapter one enable

This is the main entry for the enablement of static typing in javascript 

## Chapter two validateFile()

This just calls the readFileSync method in the fs module. If anything goes wrong a reportFileError is called. 

Then there is an if statement that checks to see that the field instance *formatted_code* exists and has a length more than 0

## Chapter three removeComments()

this is a cool method tbh, pretty fun to write.

1. loop through code that is joined and then split by every character
2. do switch statement to match is there is a `/` character. If there is execute code that checks to see if the next char is `/`, if it is initialize variable `j` to `i`. Then execute while the current char at that index is not equal to a newline or `\n` increment. After the while loop is aborted, assign i to j.
3. If the next char is `*` not `/`, then same thing, except while current char is not equal to `*` or the next one `/` then increment, then once the loop is aborted, jump out and assign i to j
4. then after this all current code to parse at that index to updated_code local variable
5. after loop is finished, set formatted_code field instance to updated_code.join("").split("\n").filter(n => n). (filter removes white space)

## Chapter four findVariableDeclarations()

This initializes two regexp /const/ and /let/. Then loops through the code and tests each chunk with the regexp and pushed the current line to the *variable_declarations* field instance

## Chapter five parseVariableDeclarations()

> [!IMPORTANT]
> this was the most involved method so ill try to describe it the best i can

First, I evaluated if variable_declarations array has a falsy length, if it doesnt I loop through the `variable_declaration` field instance which is an `array`. 

For each iteration the following happens

1. a variable `splitCode` is assigned to the value of the current line of code where `let` or `const` is found, then splits with the delimiter `" "` and then filters white space

2. then another variable `lastValue` is assigned to `splitCode` value at the last index with all `";'` replaced with empty string. So if somnething like `"string;"` is found, it would return `string`

3. then another variable `secondToLastValue` is assigned to the second to last value that is then split by `""`;

4. if last value doesnt exist, because of white space. The following happens, but first let me visually show whats happening.

```
let         age=2; "number";
// is saved as:
[let         age=2; "number";]

// then split code is assigned to:
[ 'let', 'age=2;', '"number";' ] 
last value = number
secondtolastvalue = ["a","g","e","=","2"]

then if last value is falsy because of whitespace between the statement and the semicolon, the last value will be nothing because remember "; and ' are all removed, so the while loop does lookups from the end of the array until a character other than ";" is found.

Once the while loop aborts, last value is then set the the lastvalue the idx variable was set to and replaces those values. then while that is updated so is second to last value
//
```

5. if second to last value variable at the last index is equal to `;` which signals something like this occurred. `let value = "jacob"; "string"; 
This essentially ensures that a statement exists or something exists past ending semi colon, because there a second ending semi colon one value in from the end

6. if it is found (semicolon) then switch statement is executed to evaluate what type is being enforced. If there is a last value, and there is the second in from the end semicolon and there is no match from the switch statement then a static typing error is thrown

7. after a statement is parsed and it is correct, the `identifier` variable needs to be found, this is done by looking up `const` and `let` keywords in the splitCode and then assigning the next value to the `identifier` variable

8. Then the identifier needs to be sanitized per-se. First split the identifier, then map over each char, if `=` or `:` are found set `assignmentFound` variable to true, then the next if statement evaluates if `n !== "="` and that the `assignmentFound` variable is false, then return n, else it returns nothing. Then it joins the identifier. 

9. Then value needs to be found, first splitCode is joined split, to make an array of characters. 
then indexofassignmentoperator is set to the indexofassignmentoperator + 1 to find starting point of the value the variable is set to. to find the ennd the `valueofvariable` variable, which is a slice of the array starting after `=` then it is reversed.

then i initialize `h = -1` and `k=-1` with `index = 0`;

while (h === -1 and k === -1) { just to eval if its assigned to something
    if the valueofthevariable at the index, traversing from front to back is equal to `;` then set h to index
    else if h is assigned to something, and k is not set k to index, which marks the second to last semicolon, no matter what increment index
}

valueofvariable = valueofvariable.slice(k).reverse().join("") 
then push `new VariableNode(indentifier,valueOfVariable,lastValue)` to variable_node