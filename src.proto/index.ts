import * as fs from "fs";
import { exec } from "child_process";
import { Colors } from "./colorize";
import { chalk } from "./colorize";

abstract class Node {
  public identifier: string;
  public value: string;
  public enforced_type: string;
  constructor(id: string, val: string, type: string) {
    this.identifier = id;
    this.value = val;
    this.enforced_type = type;
  }
}

class VariableNode extends Node {
  public identifier: string;
  public value: string;
  public enforced_type: string;
  constructor(id: string, val: string, type: string) {
    super(id, val, type);
  }
}

export class Static {
  private path: string = "";
  private readonly fs: typeof fs = fs;
  private readonly cp = exec;
  private formatted_code: string[];
  private variable_declarations: string[] = [];
  private variable_node: VariableNode[] = [];
  private newCode: string = "";
  private newCodePath: string = "";
  private aggregatedErrors: string[] = [];

  constructor(fileName: string) {
    if (fileName.trim().length === 0) {
      this.reportConstructionError(
        "Ensure when instantiating instance '__filename' is passed as an argument"
      );
    } else {
      this.path = fileName;
    }
  }

  public enableVars(): void {
    this.validateFile();
    if (!this.formatted_code || this.formatted_code.length === 0) {
      this.reportFileReadError("Error reading file and parsing code");
    }
    this.removeComments();
    this.findVariableDeclarations();
    this.tokenizeVariableDeclarations();
    /*
    this.createCode();
    this.removeImports();
    this.writeNewCodeToFile();
    this.executeNewCode();
    */
  }

  private validateFile(): void {
    try {
      const data: string = this.fs.readFileSync(this.path, {
        encoding: "utf-8",
      });
      this.formatted_code = data.split("\n").filter((n) => n);
    } catch (err) {
      this.reportFileError(err["message"]);
    }
  }

  private removeComments(): void {
    const singleLineComment: RegExp = /\/\/.*$/;
    this.formatted_code = this.formatted_code.filter(
      (n) => !singleLineComment.test(n)
    );
    const multiLineCommentStart: RegExp = /\/\*.*$/;
    const multiLineCommentEnd: RegExp = /\*\//;
    const len: number = this.formatted_code.length;
    const new_formatted_code: string[] = [];
    for (let i: number = 0; i < len; i++) {
      if (multiLineCommentStart.test(this.formatted_code[i])) {
        let j: number = i;
        while (!multiLineCommentEnd.test(this.formatted_code[j])) {
          j++;
        }
        i = j + 1;
      }
      new_formatted_code.push(this.formatted_code[i]);
    }
    this.formatted_code = new_formatted_code;
  }

  private findVariableDeclarations(): void {
    const constKeyword: RegExp = /const/;
    const letKeyword: RegExp = /let/;
    const lengthOfCode: number = this.formatted_code.length;
    for (let i: number = 0; i < lengthOfCode; i++) {
      const currentLineOfCode: string = this.formatted_code[i];
      if (
        letKeyword.test(currentLineOfCode) ||
        constKeyword.test(currentLineOfCode)
      ) {
        this.variable_declarations.push(currentLineOfCode);
      }
    }
  }

  private tokenizeVariableDeclarations(): void {
    //need to tokenize variable declaration
    //1. need to get the identifier
    //2. need to tokenize the value
    //3. need to tokenize the type

    let identifier: string = "";
    let value: string = "";
    let enforced_type: string = "";

    
    const lengthOfVariableDeclarationArr: number =
    this.variable_declarations.length;
    if (lengthOfVariableDeclarationArr !== 0) {
      for (let i: number = 0; i < lengthOfVariableDeclarationArr; i++) {
        
        let assignmentFound: boolean = false;

        const currentLineOfCode: string[] = this.variable_declarations[i]
        .split(" ")
        .filter((n) => n);
        
        identifier = this.tokenizeIdentifier(currentLineOfCode).trim().split("").map(n => {
          if (n === "=") {
            assignmentFound = true;
          }
          if (assignmentFound === false) {
            return n;
          }
        }).join("");

        if (!identifier) {
          this.reportStaticTypingError(
            "Internal Error On Tokenize Variable Declaration Method"
          );
        }

        const characterizedLineofCode: string[] = this.variable_declarations[i].split("").filter(n => n);
        
        let startIndex: number = characterizedLineofCode.findIndex(n => n === "=");
        if (startIndex === -1) {
          this.reportStaticTypingError(
            "Internal Error On Tokenize Variable Declaration Method"
          );
        }
        startIndex++;

        const reversedLineOfCode: string[] = characterizedLineofCode.slice(startIndex).reverse();
        
        const lenOfReversedLineOfCode: number = reversedLineOfCode.length;

        let semiColonFound: boolean = false;
        let secondToLastSemiColon: number = -1;
        for (let k: number = 0; k < lenOfReversedLineOfCode; k++) {
            const currentToken: string = reversedLineOfCode[k];
            if (currentToken === ";") {
              semiColonFound = true;
            }
            if (semiColonFound === true && currentToken === ";") {
              secondToLastSemiColon = k;
            }
        }

        value = reversedLineOfCode.slice(secondToLastSemiColon).reverse().join("");

        console.log(value);

        if (!value) {
          this.reportStaticTypingError(
            "Internal Error On Tokenize Variable Declaration Method"
          );
        }
        

        console.log(chalk("new line", Colors.cyan));
        // console.log(currentLineOfCode);
      }
    }
  }
  //got to figure out how to evaluate types
  private tokenizeIdentifier(lineOfCode: string[]): string {
    const letKeyword: RegExp = /let/;
    const constKeyword: RegExp = /const/;
    // console.log(lineOfCode);
    const len: number = lineOfCode.length;
    for (let i: number = 0; i < len; i++) {
      if (letKeyword.test(lineOfCode[i]) || constKeyword.test(lineOfCode[i])) {
        return lineOfCode[i + 1];
      }
    }
    return "";
  }
  private createCode(): void {
    let i: number = 0;
    while (i < this.variable_declarations.length - 1) {
      const currentNode = this.variable_node[i];
      const currentIfStatement =
        "if (typeof " +
        currentNode.identifier +
        " !== " +
        '"' +
        currentNode.enforced_type +
        '"' +
        ") " +
        "{ " +
        "const type = " +
        "typeof " +
        currentNode.identifier +
        "; " +
        'console.log("Static Typing Error: Expected Type: [' +
        currentNode.enforced_type +
        '] Recieved Type: [" + type + "] For Identifier [' +
        currentNode.identifier +
        "]" +
        '");' +
        "}";
      this.formatted_code.push(currentIfStatement);
      i++;
    }
    this.newCode = this.formatted_code.join("\n");
    if (!this.newCode) {
      this.reportCreateCodeError("Internal Error");
    }
  }
  private removeImports(): void {
    const importRegex: RegExp = /const\s+{\s*Static\s*}\s*/;
    const methodCall: RegExp =
      /\s*new\s+Static\s*\(\s*__filename\s*\)\s*\.\s*enableVars\s*\(\s*\)\s*/;
    this.newCode = this.formatted_code
      .filter((n) => !importRegex.test(n) && !methodCall.test(n))
      .join("\n");
  }
  private writeNewCodeToFile(): void {
    try {
      const splitpath: string[] = this.path.split("/");
      splitpath[splitpath.length - 1] = new Date().toISOString() + ".js";
      const newFilePath = splitpath.join("/");
      this.newCodePath = newFilePath;
      this.fs.writeFileSync(newFilePath, this.newCode, { encoding: "utf-8" });
    } catch (err) {
      this.reportWriteFileError("Error Writing Code To File");
    }
  }
  private executeNewCode(): void {
    const unexposed: boolean =
      process.argv.at(-1) !== "--verbose" && process.argv.at(-1) !== "--v";
    this.cp("node " + this.newCodePath, (error, stdout, stderr) => {
      if (error) {
        if (unexposed) {
          this.fs.unlinkSync(this.newCodePath);
        }
        this.reportExecuteCodeError((error || stderr) + "");
      } else {
        this.aggregatedErrors = stdout
          .split("\n")
          .filter((n) => n.trim().length && n);
        if (unexposed) {
          this.fs.unlinkSync(this.newCodePath);
        }
        this.reportAggregateErrors();
      }
    });
  }
  private reportAggregateErrors(): void {
    if (this.aggregatedErrors.length !== 0) {
      const code: number = 1;
      const errType: string = "Staticjs Typing Error";
      const error_messages: string = this.aggregatedErrors.join("\n") + "\n";

      const heading: string =
        chalk(`${errType.toUpperCase()}`, Colors.bgRed) + "\n";
      const body: string = chalk(error_messages, Colors.red);
      const ending: string =
        chalk(`Process exiting with code: ${code}`, Colors.cyan) + "\n";

      console.error(heading);
      console.error(body);
      console.error(ending);
    }
  }
  private reportExecuteCodeError(
    message: string,
    errType: string = "ExecuteCodeError"
  ): void {
    const messageToPresent =
      chalk("[ErrorType]: ", Colors.bgRed) +
      chalk(errType, Colors.bgRed) +
      "\n" +
      chalk(message, Colors.red);
    console.error(messageToPresent);
    console.trace();
    process.exit(1);
  }
  private reportWriteFileError(
    message: string,
    errType: string = "WriteFileError"
  ): void {
    const messageToPresent =
      chalk("[ErrorType]: ", Colors.bgRed) +
      chalk(errType, Colors.bgRed) +
      "\n" +
      chalk(message, Colors.red);
    console.error(messageToPresent);
    console.trace();
    process.exit(1);
  }
  private reportStaticTypingError(
    message: string,
    errType: string = "StaticTypingError"
  ): void {
    const messageToPresent =
      chalk("[ErrorType]: ", Colors.bgRed) +
      chalk(errType, Colors.bgRed) +
      "\n" +
      chalk(message, Colors.red);
    console.error(messageToPresent);
    console.trace();
    process.exit(1);
  }
  private reportFileReadError(
    message: string,
    errType: string = "FileReadError"
  ): void {
    const messageToPresent =
      chalk("[ErrorType]: ", Colors.bgRed) +
      chalk(errType, Colors.bgRed) +
      "\n" +
      chalk(message, Colors.red);
    console.error(messageToPresent);
    console.trace();
    process.exit(1);
  }
  private reportFileError(
    message: string,
    errType: string = "FileError"
  ): void {
    const messageToPresent =
      chalk("[ErrorType]: ", Colors.bgRed) +
      chalk(errType, Colors.bgRed) +
      "\n" +
      chalk(message, Colors.red);
    console.error(messageToPresent);
    console.trace();
    process.exit(1);
  }
  private reportConstructionError(
    message: string,
    errType: string = "ConstructionError"
  ): void {
    const messageToPresent =
      chalk("[ErrorType]: ", Colors.bgRed) +
      chalk(errType, Colors.bgRed) +
      "\n" +
      chalk(message, Colors.red);
    console.error(messageToPresent);
    console.trace();
    process.exit(1);
  }
  private reportCreateCodeError(
    message: string,
    errType: string = "CreateCodeError"
  ): void {
    const messageToPresent =
      chalk("[ErrorType]: ", Colors.bgRed) +
      chalk(errType, Colors.bgRed) +
      "\n" +
      chalk(message, Colors.red);
    console.error(messageToPresent);
    console.trace();
    process.exit(1);
  }
  private force_quit_for_dev_purposed_only(): void {
    process.exit(1);
  }
}
