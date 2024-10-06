# StaticJs

This is an npm package designed to bring static typing to javascript at runtime utilizing just javascrip, yup just javascript.

A little bit about my motivation behind all of this is I really love programming language development. I have been writing my own interpreter for my own programming language _Argon_ for some time now. In addition to programming language development, I also really enjoy writing developer tools. I will make no claim that these are _top of the line_ _incredible_ pieces of technology that aim to be cutting edge in all aspects. I made these tools because I saw a problem in my life that I wanted to solve. Whether people use my tools or not, I simply love writing code and solving problems -- big or small -- so the end to me making tools has no apparent end. Which brings me to my motivation; I use typescript all the time, in backend development, scripting, etc, and when used like java, its fantastic. Amongst other issues, the problem with typescript is sometimes it is unecessary and adds an extra dependency to projects that adds additional bloat, also typescript does not type check at runtime, only at compile time. I thought, how fun of a challenge would it be to write a parser that does static typing analysis on javascript code that utilizes javascript so it doesn't need any extra language extensions or dependencies. Whether this goes far and becomes something or is just a proof of concept passion project, I have had so much fun working on it all and will continue building upon this little by little.

## Table of Contents

- [Versioning](#versioning)
- [Changelog](#changelog)
- [Technical Features](#technical-features)
- [Installation](#installation)
- [Usage](#usage)
- [Working Directory Structure](#working-directory-structure)
- [Contributing](#contributing)
- [License](#license)

## Versioning

I follow [Semantic Versioning](https://semver.org/) for versioning staticjs releases. The version number format is `MAJOR.MINOR.PATCH`:

- **MAJOR** version when you make incompatible API changes,
- **MINOR** version when you add functionality in a backwards-compatible manner, and
- **PATCH** version when you make backwards-compatible bug fixes.

### Current Version: 0.0.2

## Changelog

### [0.0.2] *Stable* 2024-09-29 

- Fixed bug #1: Multi-line and single line comment parsing and removal
- Improved performance in [src/index.ts]
- Changed the way parsing was fundamentally implemented. Now I make use of statements instead of method calls
- Changed the way aggregate errors are collected and displayed

### [0.0.3] *Unstable* 2024-10-05

- This version is a work in progress
- See [here](#most-recent-unstable-version-003) for more information

## Technical Features

- **Static Typing**: I make use of javascript statements following javascript code. For Example:

```
const {Static} = require("./random-path");
//necessary for enabling static typing for global variables (more support coming on version 1.0.0 still on 0.0.2)
new Static(__filename).enableVars();

let number = 2; "number";

number = new Date();
```

```
node yourfile
throws static typing error in terminal
```

- **Type Inference**: Not supported yet
- **Custom Type Definitions**: Not supported yet.
- **Compatibility**: Not supported yet.

## Installation

not supported yet, only on version 0.0.2.

## The future of Staticjs

Main version 1.0.0 will have full custom typing support, local variable support, block scoping support, field instance support, function return type support, parameter support, class support.

## Additional Comments

Note that the official code and version that represents this package are in *src*. Any prototypes I am completing will be done in *src.proto* and are apart of the untested, untried version that is unstable.

## Most Recent Unstable Version 0.0.3

- This version has a new tokenization and parsing algorithm that supports custom and composite types and changes the breadth of static typing; essentially, it is more "intelligent" then the previous versions.
- In comparison, to [0.0.2](#002-stable-2024-09-29), this does not generate code to perform static type analysis that is then executed in a child process in node. Hopefully this will increase performance
- My tokenization algorithm, that tokenizes any instance where a type is mentioned in the form of a statement proceeding a variable or function declaration, supports custom types and searches for and validates the reference to the custom type interface in the code and composite types. 
- **Custom Types**
  - custom types are described in javascript with the var keyword and PascalCase, where the identifier is preceeded by a `$`. The following snippet will show more detail:
  ```
  var $CustomType = {customer_name: "string", customer_address: "string"}
  ```
  - If you are familiar with *dtos* (Data transfer objects), these interfaces act as such
  - These CustomTypes can also be replaced by simply proceeding an object with `{customer_name: "string", customer_address: "string"}`
  - If a custom type is referenced, but the reference does not exist, an error will be thrown
- **Composite Types**
  - all composite (aka object) types other than *promises* and all primitive types such as *bigint* are supported, after the mvp is written for 0.0.3, and a stable version is released those two types will be supported. 
- **Static Type Analysis**
  - after validating there is a real reference to a preceeding, described custom type, validating the object or composite type is a real type, and the primitive type is a real primitive type, references will be found for each and every function and variable, and through parsing these references, if the static type constraint is breached in any way, a ***static typing error*** will be thrown.
  - this way, every area a variable or function is present in code -- that is, a variable or function that is proceeded by a type statement -- an analysis is done on every interaction it partakes in to ensure its relationship with its type is not infringed upon. 
  - Union types are supported as are recursively typed custom interfaces (multilayer object typing)
  - I will be working on the error handling system that is in place to provide more depth and detail on aggregated errors. This is so scaling is a graceful process and a facet that can be overlooked, such as error handling, does not fall behind as things become more complicated.



