import * as fs from "fs";
import { exec } from "child_process";
import { Colors } from "./colorize";
import { chalk } from "./colorize";

//this is a comment 

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

class Stack {
  private stack: string[] = [];
  public push(value: string): void {
    this.stack.push(value);
  }
  public pop(): string | void {
    if (this.stack.length > 0) {
      return this.stack.pop();
    }
  }
  public size(): number {
    return this.stack.length;
  }
}

class StaticJsError extends Error {
  public message: string = "";
  public errortagType: string = "";
  constructor(name:string, message: string) {
    super(name);
    this.message = message;
    this.reportError(this.message, name);
  }
  private reportError(message: string, name: string): void {
    const messageToPresent =
    chalk("[" + StaticJsError.name + "] " + name, Colors.bgRed) +
    "\n" +
    chalk(message, Colors.red);
  console.error(messageToPresent);
  console.trace();
  process.exit(1);
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
      throw new StaticJsError("ConstructionError",
        "Ensure when instantiating instance '__filename' is passed as an argument"
      );
    } else {
      this.path = fileName;
    }
  }

  public enableVars(): void {
    this.validateFile();
    if (!this.formatted_code || this.formatted_code.length === 0) {
      throw new StaticJsError("FileReadError","Error reading file and parsing code");
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
    //after this, static type analysis has been performed
    
  }

  private validateFile(): void {
    try {
      const data: string = this.fs.readFileSync(this.path, {
        encoding: "utf-8",
      });
      this.formatted_code = data.split("\n").filter((n) => n);
    } catch (err) {
      throw new StaticJsError("FileReadError", err["message"]);
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
          throw new StaticJsError("Invalid Token Detected",
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
          throw new StaticJsError("Invalid Token Detected",
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
          throw new StaticJsError("Invalid Token Detected",
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
          throw new StaticJsError("CustomTypeReferenceError",
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

  private validateCustomType(custom_type: string): boolean {
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
    const customTypeIdentifierNames: string[] = interfaces.map(n => {
      const id: string = n.split(" ")[1];
      return id;
    })
   
    return customTypeIdentifierNames.includes(custom_type);
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

  private tracePrimitiveTypedVariableReferences(): void {
    //! need to go through each variable first filter all non composite and custom types and then look at each variable separately. all interctions with variable will be traced and added to the variable node array
  } 
  private traceCustomTypedVariableReferences(): void {
    //! need to go through each variable first filter all custom types and then look at each variable separately. all interctions with variable will be traced and added to the variable node array
  }
  private traceCompositeTypedVariableReferences(): void {
    //! need to go through each variable first filter all composite types and then look at each variable separately. all interctions with variable will be traced and added to the variable node array
  }
  private parsePrimitiveTypes(): void {
    //! i will go through each variable node that has a primitive type enforced and will look at each interaction that i traced and then will validate no illegal interaction occurs
  }
  private parseCustomTypes(): void {
    //! i will go through each variable node that has a customn type enforced and will look at each interaction that i traced and then will validate no illegal interaction occurs
  }
  private parseCompositeTypes(): void {
    //! i will go through each variable node that has a composite type enforced and will look at each interaction that i traced and then will validate no illegal interaction occurs
  }

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
        type RegexObject = {
          pattern: RegExp;
          matched: boolean;
          literal?: string;
          textRepresentation: string;
        };
        const mapRegex: RegexObject = {
          pattern: /\bMap<[^>]*>/,
          matched: false,
          textRepresentation: "map",
        };

        const setRegex: RegexObject = {
          pattern: /\bSet<[^>]*>/,
          matched: false,
          textRepresentation: "set",
        };

        const functionRegex: RegexObject = {
          pattern: /\s*Function\s*\([^)]*\)\s*:\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*/,
          matched: false,
          textRepresentation: "function",
        };

        const weakMapRegex: RegexObject = {
          pattern: /\s*WeakMap<[^>]*>/,
          matched: false,
          textRepresentation: "weakmap",
        };

        const weakSetRegex: RegexObject = {
          pattern: /\s*WeakSet<[^>]*>/,
          matched: false,
          textRepresentation: "weakset",
        };

        const arrayRegex: RegexObject = {
          pattern: /\[[^\]]*\]/,
          matched: false,
          textRepresentation: "",
        };

        const objRegex: RegexObject = {
          pattern: /\{[^}]*\}/,
          matched: false,
          textRepresentation: "",
        };

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
            currRegex.literal = type;
            break;
          }
          lastType = type;
        }

        if (valid === false) {
          const isCustomType: boolean = lastType.split("")[0] === "$";
          if (!isCustomType) {
            throw new StaticJsError("CompositeTypeConstructionError",
              "Unknown type: " + lastType
            );
          } else {
            if (!this.validateCustomType(lastType)) {
              throw new StaticJsError("CompositeTypeConstructionError",
                "Unknown type: " + lastType
              );
            }
          }
        }

        const stack = new Stack();
        const matching_symbol: Record<string, string> = {
          "}": "{",
          "]": "[",
          ")": "(",
        };
        const openingRegex: RegExp = /^[[({]+$/;

        const currentCompositeTypeToEvaluate: RegexObject = regexArr.filter(
          (n) => n.matched === true
        )[0];

        const characterizedCurrentlyEvaluatedCompositeType: string[] =
          currentCompositeTypeToEvaluate?.literal
            ?.split("")
            .slice(
              currentCompositeTypeToEvaluate.textRepresentation.length
            ) || [""];

        const lenOfCharacterizedCurrentlyEvaluatedCompositeTypeStr: number =
          characterizedCurrentlyEvaluatedCompositeType.length;

        //? may have messed something here in this regex
        const typeRegex = /^[a-zA-Z_0-9$][a-zA-Z0-9_0-9$]*$/;

        let typesToEvalute: string[] = [];
        let currentPotentialType: string = "";

        for (
          let j: number = 0;
          j < lenOfCharacterizedCurrentlyEvaluatedCompositeTypeStr;
          j++
        ) {
          const currChar: string =
            characterizedCurrentlyEvaluatedCompositeType[j];
          if (openingRegex.test(currChar)) {
            stack.push(currChar);
          } else {
            const matchingChar = matching_symbol?.[currChar];
            if (matchingChar) {
              const poppedValue: string | void = stack.pop();
              if (poppedValue !== matchingChar) {
                throw new StaticJsError("CompositeTypeConstructionError",
                  "Error Parsing Composite Type, Incorrect Termination Of '" +
                    matchingChar +
                    "' In Type Definition"
                );
              }
            }
          }
          if (typeRegex.test(currChar)) {
            currentPotentialType += currChar;
          } else {
            typesToEvalute.push(currentPotentialType);
            currentPotentialType = "";
          }
        }
        if (stack.size() !== 0) {
          throw new StaticJsError("CompositeTypeConstructionError",
            "Error Parsing Composite Type, Incorrect Termination Of Either '[{(' In Type Definition"
          );
        }
        typesToEvalute = typesToEvalute.filter((n) => n);
        const lenOfTypesToEvaluate: number = typesToEvalute.length;
        for (let h: number = 0; h < lenOfTypesToEvaluate; h++) {
          const currentType: string = typesToEvalute[h];
          if (this.isPotentialCompositeType(currentType) === true) {
            this.isCompositeType(currentType);
          } //else it is i a primitive type
        }
    }
  }

  //got to figure out how to evaluate types
  private tokenizeIdentifier(lineOfCode: string[]): string {
    const letKeyword: RegExp = /let/;
    const constKeyword: RegExp = /const/;
    const len: number = lineOfCode.length;
    for (let i: number = 0; i < len; i++) {
      if (letKeyword.test(lineOfCode[i]) || constKeyword.test(lineOfCode[i])) {
        return lineOfCode[i + 1];
      }
    }
    return "";
  }

  
  private force_quit_for_dev_purposed_only(): void {
    process.exit(1);
  }
}
