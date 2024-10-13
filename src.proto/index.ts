import * as fs from "fs";
import { exec } from "child_process";
import { Colors } from "./colorize";
import { chalk } from "./colorize";

abstract class Node {
  public identifier: string;
  public value: string;
  public enforced_type: string;
  public custom_type: boolean;
  public custom_type_interface: string;
  public composite_type: boolean;
  constructor(
    id: string,
    val: string,
    type: string,
    custom_type: boolean = false,
    custom_type_interface: string = "",
    composite_type: boolean = false
  ) {
    this.identifier = id;
    this.value = val;
    this.enforced_type = type;
    this.custom_type = custom_type;
    this.custom_type_interface = custom_type_interface;
    this.composite_type = composite_type;
  }
}

class VariableNode extends Node {
  public identifier: string;
  public value: string;
  public enforced_type: string;
  public custom_type: boolean = false;
  constructor(
    id: string,
    val: string,
    type: string,
    custom_type: boolean = false
  ) {
    super(id, val, type, custom_type);
  }
}

export class Static {
  private path: string = "";
  private readonly fs: typeof fs = fs;
  private readonly cp = exec;
  private formatted_code: string[];
  private variable_declarations: string[] = [];
  private variable_node: VariableNode[] = [];
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
    this.validateCustomTypes();
    this.identifyPotentialCompositeTypes();
    this.validateCompositeTypes();
    this.tracePrimitiveTypedVariableReferences();
    this.traceCustomTypedVariableReferences();
    this.traceCompositeTypedVariableReferences();
    this.parsePrimitiveTypes();
    this.parseCustomTypes();
    this.parseCompositeTypes();

    // console.log(this.variable_node);
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
    const constKeyword: RegExp = /^\s*const\b/;
    const letKeyword: RegExp = /^\s*let\b/;
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

        identifier = this.tokenizeIdentifier(currentLineOfCode)
          .trim()
          .split("")
          .map((n) => {
            if (n === "=") {
              assignmentFound = true;
            }
            if (assignmentFound === false) {
              return n;
            }
          })
          .join("");

        if (!identifier) {
          this.reportStaticTypingError(
            "Internal Error On Tokenize Variable Declaration Method"
          );
        }

        const characterizedLineofCode: string[] = this.variable_declarations[i]
          .split("")
          .filter((n) => n);

        let startIndex: number = characterizedLineofCode.findIndex(
          (n) => n === "="
        );
        if (startIndex === -1) {
          this.reportStaticTypingError(
            "Internal Error On Tokenize Variable Declaration Method"
          );
        }
        startIndex++;

        const reversedLineOfCode: string[] = characterizedLineofCode
          .slice(startIndex)
          .reverse();

        const lenOfReversedLineOfCode: number = reversedLineOfCode.length;

        let semiColonFound: boolean = false;
        let secondToLastSemiColon: number = -1;
        for (let k: number = 0; k < lenOfReversedLineOfCode; k++) {
          const currentToken: string = reversedLineOfCode[k];
          if (currentToken === ";" && semiColonFound === false) {
            semiColonFound = true;
            continue;
          }
          if (semiColonFound === true && currentToken === ";") {
            secondToLastSemiColon = k;
            break;
          }
        }

        value = reversedLineOfCode
          .slice(secondToLastSemiColon)
          .reverse()
          .join("");

        if (!value) {
          this.reportStaticTypingError(
            "Internal Error On Tokenize Variable Declaration Method"
          );
        }

        enforced_type = reversedLineOfCode
          .reverse()
          .slice(reversedLineOfCode.length - secondToLastSemiColon)
          .join("")
          .replace(/s*;/g, "")
          .trim();

        this.variable_node.push(
          new VariableNode(identifier, value, enforced_type)
        );
      }
    }
  }

  private validateCustomTypes(): void {
    this.variable_node = this.variable_node.map((n) => {
      if (n.enforced_type.split("")[1] === "$") {
        n.custom_type = true;
      }
      return n;
    });
    const interfaces: string[] = [];
    const lenOfFormattedCode: number = this.formatted_code.length;

    for (let i: number = 0; i < lenOfFormattedCode; i++) {
      const curentLineOfCode: string[] = this.formatted_code[i].split(" ");
      const lenOfCurrentLineOfCode: number = curentLineOfCode.length;
      for (let j: number = 0; j < lenOfCurrentLineOfCode; j++) {
        if (/^s*var\b/.test(curentLineOfCode[j])) {
          interfaces.push(curentLineOfCode.join(" "));
          continue;
        }
      }
    }

    const variableNodeListLength: number = this.variable_node.length;

    for (let i: number = 0; i < variableNodeListLength; i++) {
      const currentNode: VariableNode = this.variable_node[i];

      if (currentNode.custom_type === true) {
        let matched: boolean = false;

        for (let j: number = 0; j < interfaces.length; j++) {
          const currentInterface: string[] = interfaces[j].split(" ");
          let operatorFound: boolean = false;
          let id: string = currentInterface[1]
            .split("")
            .map((n) => {
              if (n === "=") {
                operatorFound = true;
              }
              if (operatorFound === false) {
                return n;
              }
            })
            .join("")
            .trim();

          if (currentNode.enforced_type.replace(/["']/g, "") === id) {
            matched = true;
            currentNode.custom_type_interface = currentInterface.join(" ");
            break;
          }
        }
        if (matched === false) {
          this.reportStaticTypingError(
            "Error finding reference to custom type: [" +
              currentNode.enforced_type +
              "]"
          );
        }
      } else {
        continue;
      }
    }
  }

  private identifyPotentialCompositeTypes(): void {
    //! big int and promises will need to be supported later

    const lenOfVariableNodes: number = this.variable_node.length;
    for (let i: number = 0; i < lenOfVariableNodes; i++) {
      const currentNode: VariableNode = this.variable_node[i];
      if (
        currentNode.custom_type === false &&
        !currentNode.custom_type_interface &&
        this.isPotentialCompositeType(
          currentNode.enforced_type.replace(/["']/g, "")
        ) === true
      ) {
        currentNode.composite_type = true;
      }
    }
  }

  private validateCompositeTypes(): void {
    const lenOfVariableNodes: number = this.variable_node.length;
    for (let i: number = 0; i < lenOfVariableNodes; i++) {
      const currentNode: VariableNode = this.variable_node[i];
      if (currentNode.composite_type === true) {
        this.isCompositeType(currentNode.enforced_type);
      }
    }
  }

  private tracePrimitiveTypedVariableReferences(): void {}
  private traceCustomTypedVariableReferences(): void {}
  private traceCompositeTypedVariableReferences(): void {}
  private parsePrimitiveTypes(): void {}
  private parseCustomTypes(): void {}
  private parseCompositeTypes(): void {}

  private isPotentialCompositeType(type: string): boolean {
    return (
      type !== "string" &&
      type !== "number" &&
      type !== "boolean" &&
      type !== "null" &&
      type !== "undefined" &&
      type !== "BigInt"
    );
  }
  //! maps and sets only support primitive and composite types inhabiting their structure. may change later
  private isCompositeType(type: string): void {
    type = type.replace(/["']/g, "");
    let valid: boolean = false;
    let lastType: string = "";
    switch (type) {
      case "Date":
        valid = true;
        break;
      case "Error":
        valid = true;
        break;
      case "RegExp":
        valid = true;
        break;
      default:
        type RegexObject = { pattern: RegExp; matched: boolean };
        const mapRegex: RegexObject = {
          pattern: /\bMap<[^>]*>/,
          matched: false,
        };
        
        const setRegex: RegexObject = {
          pattern: /\bSet<[^>]*>/,
          matched: false,
        };

        const functionRegex: RegexObject = {
          pattern:
            /\s*Function\s*\([^)]*\)\s*:\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*/,
          matched: false,
        };

        const weakMapRegex: RegexObject = {
          pattern: /\s*WeakMap<[^>]*>/,
          matched: false,
        };

        const weakSetRegex: RegexObject = {
          pattern: /\s*WeakSet<[^>]*>/,
          matched: false,
        };

        const arrayRegex: RegexObject = {
          pattern: /\[[^\]]*\]/,
          matched: false,
        };

        const objRegex: RegexObject = { pattern: /\{[^}]*\}/, matched: false };

        const regexArr: RegexObject[] = [
          mapRegex,
          setRegex,
          functionRegex,
          weakMapRegex,
          weakSetRegex,
          arrayRegex,
          objRegex,
        ];

        const regexArrLen: number = regexArr.length;
        for (let i: number = 0; i < regexArrLen; i++) {
          const currRegex: RegexObject = regexArr[i];
          if (currRegex.pattern.test(type)) {
            valid = true;
            currRegex.matched = true;
            break;
          }
          lastType = type;
        }
        
        if (valid === false) {
          this.reportCompositeTypeConstructionError("Unknown type: " + lastType);
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

  private reportCompositeTypeConstructionError(
    message: string,
    errType: string = "CompositeTypeConstructionError"
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
