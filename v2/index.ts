import * as fs from "fs";
import { exec } from "child_process";
import { Colors } from "../lib/colorize";
import { chalk } from "../lib/colorize";

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

  constructor(fileName: string) {
    if (fileName.trim().length === 0) {
      this.reportConstructionError(
        "Ensure when instantiating instance '__filename' is passed as an argument"
      );
    } else {
      this.path = fileName;
    }
  }

  public enable(): void {
    this.validateFile();
    if (!this.formatted_code || this.formatted_code.length === 0) {
      this.reportFileReadError("Error reading file and parsing code");
    }
    this.removeComments();
    this.findVariableDeclarations();
    this.parseVariableDeclarations();
    this.createCode();
    this.removeImports();
    this.writeNewCodeToFile();
    this.executeNewCode();
    // this.parseFile();
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
    const codeToParse: string[] = this.formatted_code.join("\n").split("");
    const lengthOfCode: number = codeToParse.length;
    const updated_code: string[] = [];

    for (let i: number = 0; i < lengthOfCode; i++) {
      const currentLineOfCode = codeToParse[i];
      switch (currentLineOfCode) {
        case "/":
          if (codeToParse[i + 1] === "/") {
            let j = i;
            while (codeToParse[j] !== "\n") {
              j++;
            }
            i = j;
          } else if (codeToParse[i + 1] === "*") {
            let j = i;
            while (codeToParse[j] !== "*" || codeToParse[j + 1] !== "/") {
              j++;
            }
            i = j;
          }
          break;
        default:
          updated_code.push(codeToParse[i]);
      }
    }
    this.formatted_code = updated_code
      .join("")
      .split("\n")
      .filter((n) => n);
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

  private parseVariableDeclarations(): void {
    const lengthOfVariableDeclarationArr: number =
      this.variable_declarations.length;
    if (lengthOfVariableDeclarationArr !== 0) {
      for (let i: number = 0; i < lengthOfVariableDeclarationArr; i++) {
        const splitCode: string[] = this.variable_declarations[i]
          .split(" ")
          .filter((n) => n);
        let lastValue: string = splitCode[splitCode.length - 1].replace(
          /["';]/g,
          ""
        );
        let secondToLastValue = splitCode[splitCode.length - 2].split("");
        if (!lastValue) {
          let idx: number = 1;
          while (splitCode[splitCode.length - idx] === ";") {
            idx++;
          }
          lastValue = splitCode[splitCode.length - idx].replace(/["';]/g, "");
          secondToLastValue = splitCode[splitCode.length - (idx + 1)].split("");
        }
        if (secondToLastValue[secondToLastValue.length - 1] === ";") {
          switch (lastValue) {
            case "string":
              break;
            case "number":
              break;
            case "bigint":
              break;
            case "object":
              break;
            case "function":
              break;
            case "boolean":
              break;
            case "undefined":
              break;
            case "null":
              break;
            default:
              //todo eventually add custom typing
              this.reportStaticTypingError(
                "Error parsing statement following variable declaration, ensure statement is valid composite or primitive type" +
                  "\n" +
                  "Recieved: [" +
                  lastValue +
                  "]" +
                  "\n" +
                  "If this message does not apply, ensure that semi colon follows variable declaration, the correct format is the following: " +
                  "\n" +
                  chalk('const identifier = "name"; "string";', Colors.bgCyan)
              );
          }

          let identifier: string = "";
          const constKeyword: RegExp = /const/;
          const letKeyword: RegExp = /let/;
          for (let i: number = 0; i < splitCode.length; i++) {
            const currentToken = splitCode[i];
            if (
              constKeyword.test(currentToken) ||
              letKeyword.test(currentToken)
            ) {
              identifier = splitCode[i + 1];
              break;
            }
          }
          let assignmentFound: boolean = false;
          identifier = identifier
            .split("")
            .map((n) => {
              if (n === "=" || n === ":") {
                assignmentFound = true;
              }
              if (n !== "=" && assignmentFound === false) {
                return n;
              }
            })
            .join("");

          let valueOfVariable: string[] | string = [];
          const characterCode: string[] = splitCode.join("").split("");
          const indexOfAssignmentOperator = characterCode.indexOf("=") + 1;
          valueOfVariable = characterCode.slice(indexOfAssignmentOperator);
          valueOfVariable.reverse();
          //   this.force_quit_for_dev_purposed_only();
          let h = -1;
          let k = -1;
          let index = 0;
          while (h === -1 || k === -1) {
            if (valueOfVariable[index] === ";") {
              if (h === -1) {
                h = index;
              } else if (h !== -1 && k === -1) {
                k = index;
              }
            }
            index++;
          }
          valueOfVariable = valueOfVariable.slice(k).reverse().join("");
          this.variable_node.push(
            new VariableNode(identifier, valueOfVariable, lastValue)
          );
        }
      }
    }
  }
  //got to figure out how to evaluate types

  private createCode(): void {
    let i: number = 0;
    while (i < this.variable_declarations.length - 1) {
      const currentNode = this.variable_node[i];
      const currentIfStatement =
        "if (typeof " +
        currentNode.identifier +
        " !== " + "\"" +
        currentNode.enforced_type + "\"" +
        ") " +
        "{ " +
        "const type = " +
        "typeof " +
        currentNode.identifier +
        "; " +
        'console.log("Static Typing Error: Expected Type: [' +
        currentNode.enforced_type +
        '] Recieved Type: [" + type + "] For Identifier ' + currentNode.identifier +
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
    const methodCall: RegExp = /\s*new\s+Static\s*\(\s*__filename\s*\)\s*\.\s*enable\s*\(\s*\)\s*/; 
    this.newCode = this.formatted_code.filter(n => !importRegex.test(n) && !methodCall.test(n)).join("\n");
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
      this.cp("node " + this.newCodePath, (error, stdout, stderr) => {
        if (error) {
          this.fs.unlinkSync(this.newCodePath);
          console.log("stderr: ", stderr);
          console.log(error);
        } else {
          console.log("stdout: ", stdout);
          this.fs.unlinkSync(this.newCodePath);
        }
      });
  }
  private parseFile(): void {
    console.log(this.variable_node);
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
