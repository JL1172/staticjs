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

### [0.0.2] 2024-09-29

- Fixed bug #1: Multi-line and single line comment parsing and removal
- Improved performance in [src/index.ts]
- Changed the way parsing was fundamentally implemented. Now I make use of statements instead of method calls
- Changed the way aggregate errors are collected and displayed

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
//throws static typing error in terminal
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
