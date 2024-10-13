# Description of this.isCompositeType method

1. First, the parameter receives a string with a supposed type. It will be whatever was marked as a potential composite type

2. then it'll use a switch case statement to route what needs to be done in order to evaluate said type.

3. the switch case first looks for absolute literals to match, such as Date, Error, RegExp and assigns the local variable `valid` to true and then breaks out of the evaluation chain.

4. if the type is not caught by any of those explicit literals, the following happens: 
   1. an array is initialized with custom objects with a pattern regex, a matched key, and a text representation.
   2. then we loop over that array testing each pattern against the type.
   3. if a match is found `valid` is set to true, matched is set to true (important for later, and literal is set to the actual literal of the type)
   4. for error handling `last type` is set to whatever the current type evaluated is.
   5. after this, if `valid` is false, an error is thrown
   6. then if the `valid` is true, them the following happens: 
      1. a stack data structure is initialized.
         - this is to keep track of opening and closing curly braces, square brackets, and parenthesis, for the more complex to parse composite types like arrays and objects that could have an indefinite amount of layers and depth.
      2. then a current composite type to evaluate -- i.e whatever broke out of the above loop, which did an initial lazy evaluation of the type on whether or not it met the sufficient criterion of a composite type -- is queued.
      3. then that literal of the object found above is split and is sliced to just evaluate the types that are arbitrarily nested.
      4. then a loop is initiated looping through the types where each iteration does the following:
         1. queues a curr char to evaluate.
         2. tests that current char with the opening parenthesis or curly braces or square braces regex to keep track of what i mentioned above with the stack data structure. 
         3. then if the regex matches a char, that curr char is pushed onto the stack.
         4. if there is not a match, a potentially undefined variable is initialized. it does a look up in the matching_symbol object which matches a punctuation's opening form (`{,[,(`)
         5. if it is not undefined and is truthy then the following happens:
            1. if the popped value of the stack is not equal to the matching char, then an error is thrown 
         6. then the type regex tests curr char variable and if it evaluates to true then the curr char is appended to the `currentPotentialType` variable if not it pushed the type to evaluate an array and resets that `currentPotentialType` variable to an empty string.
      5. after the loop, the types filters out falsey values and is left with just primitive, composite, or custom types in their rawest form to just evaluate.