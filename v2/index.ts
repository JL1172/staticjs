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
  private variable_node: VariableNode[];

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
    this.parseFile();
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
              identifier = splitCode[i + 1].replace(/[:]/g, "");
              break;
            }
          }
          const valueOfVariable: string = "";
          const indexOfAssignmentOperator =
            splitCode.join("").split("").indexOf("=") + 1;

          let j: number = 0;
          // const indexOfAssignmentOperator: number = splitCode;
          //   this.variable_node.push(new VariableNode("", "", lastValue));
        }
      }
    }
  }

  private parseFile(): void {
    // console.log(this.formatted_code);
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
  private force_quit_for_dev_purposed_only(): void {
    process.exit(1);
  }
}
