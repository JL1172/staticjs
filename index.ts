import * as fs from "fs";
import { chalk, Colors } from "./lib/colorize";
import * as cp from "child_process";

//! all errors are self contained to avoid weird error and bug propagation
//! making mvp with a lot of direct manual stuff. want to eventually make the flow more "flowy" but for now, I want to make it just work.
//todos
//* 1. need to add support for multiline method calls like
/*
  instance.
  variable();
*/

export class Type {
  private readonly fs = fs;
  private readonly cp = cp;
  private path: string;
  private instance_name: string = "";
  private updated_code: string[] = [];
  private parsed_identifiers: string[] = [];
  private fileNameToUnsync: string;
  private errorsToPresent: string[] = [];
  private method_call_count: number = 0;
  constructor(fileName: string) {
    if (!fileName) {
      this.reportErr(
        chalk(
          "Instance of [Type Class] must be instantiated with node's built in __filename variable passed as argument.",
          Colors.bgRed
        ),
        ""
      );
    }
    this.path = fileName;
    try {
      const data = this.fs.readFileSync(this.path, { encoding: "utf-8" });
      const dataToParse = data.split("\n");
      let instanceName: string;
      for (let i = 0; i < dataToParse.length; i++) {
        if (/new Type/.test(dataToParse[i])) {
          instanceName = dataToParse[i];
        }
      }
      let colon_found: boolean = false;
      // instanceName = instanceName
      //   .split(" ")
      //   .filter((n) => n !== "let" && n !== "const")[0]
      //   .split("")
      //   .map((n) => {
      //     if (n === ":" || n === "=") {
      //       colon_found = true;
      //     } else {
      //       if (!colon_found) {
      //         return n;
      //       }
      //     }
      //   })
      //   .join("");
      instanceName = "type";
      const method_declaration_pattern = new RegExp(instanceName + ".variable");
      for (let i = 0; i < dataToParse.length; i++) {
        if (method_declaration_pattern.test(dataToParse[i])) {
          this.method_call_count++;
        }
      }
    } catch (err) {
      this.reportErr(chalk(err + "", Colors.red), "");
      // this.reportErr(
      //   chalk("Error constructing class. Ensure file exists.", Colors.red),
      //   ""
      // );
    }
  }

  public async func(
    nameOfFunction: string,
    functionReturnTypes: string[]
  ): Promise<void> {
    try {
    } catch (err) {}
  }

  public variable(valueType: string): void {
    console.clear();
    try {
      switch (valueType) {
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
          throw new Error(
            `Static Typing Error: Expected input for [valueType] argument should be one of the following: \n[string, number, bigint, object, function, boolean, undefined, null]\n actual type: [${valueType}]`
          );
      }
      this.parseUserCode(valueType);
    } catch (err) {
      const line = (err as Error).stack?.split("\n")[2] || "";
      this.reportErr(chalk((err as Error).message + "", Colors.red), line);
    }
  }

  private parseUserCode(valueType: string): void {
    try {
      let data;
      if (this.updated_code.length === 0) {
        data = this.fs.readFileSync(this.path, { encoding: "utf-8" });
      } else {
        data = this.updated_code;
      }
      //! look at diff if error
      let formattedData: string[];
      if (Array.isArray(data)) {
        formattedData = data.filter((n) => n && !/\/\//.test(n));
      } else {
        formattedData = String(data)
          .split("\n")
          .filter((n) => n && !/\/\//.test(n));
      }
      //! look at diff if error
      const class_instantiation_pattern = /new Type/;
      if (!this.instance_name) {
        for (let i: number = 0; i < formattedData.length; i++) {
          if (class_instantiation_pattern.test(formattedData[i])) {
            this.fetchInstanceName(formattedData[i]);
            break;
          }
        }
      }

      if (!this.instance_name) {
        throw new Error(
          "Ensure instance of [Type Class] is instantiated with node's built in __filename variable passed as argument."
        );
      }

      const method_declaration_pattern = new RegExp(
        this.instance_name + ".variable"
      );
      let identifier: string = "";
      let methodCall: string = "";

      for (let i: number = 0; i < formattedData.length; i++) {
        if (
          method_declaration_pattern.test(formattedData[i]) &&
          !this.parsed_identifiers.includes(formattedData[i + 1])
        ) {
          identifier = formattedData[i + 1];
          methodCall = formattedData[i];
          this.parsed_identifiers.push(identifier);
          break;
        }
      }
      const isValidVariableDeclaration: boolean =
        this.validateVariableDeclaration(identifier);
      if (isValidVariableDeclaration === false || !identifier || !methodCall) {
        throw new Error(
          "Ensure variable is immediately following this method declaration to properly apply static typing. Example: \n" +
            "\n" +
            chalk(
              'instance.variable("number")\n' + "const myVar = 2;",
              Colors.white
            ) +
            "\n"
        );
      }
      let colon_found: boolean = false;
      identifier = identifier
        .split(" ")
        .filter((n) => n !== "let" && n !== "const")[0]
        .split("")
        .map((n) => {
          if (n === ":" || n === "=") {
            colon_found = true;
          } else {
            if (!colon_found) {
              return n;
            }
          }
        })
        .join("");

      if (this.updated_code.length === 0) {
        this.updated_code = formattedData;
      }

      this.updated_code.push(
        `if (typeof ${identifier} !== "${valueType}") {throw new Error("Static Typing Error: expected type [${valueType}], received [${typeof identifier}] for variable [${chalk(
          chalk(identifier, Colors.white),
          Colors.bgRed
        )}${chalk("]", Colors.red)}")}`
      );
    } catch (err) {
      const code = err["code"];
      if (code && code === "ENOENT") {
        this.reportErr(
          chalk(
            "Trouble parsing path. Ensure instance of [Type Class] is instantiated with node's built in __filename variable passed as argument.",
            Colors.red
          ),
          ""
        );
      }
      const message = (err as Error).message || err;
      this.reportErr(
        chalk(message + "", Colors.red),
        (err as Error).stack?.split("\n").at(-2) || ""
      );
    }
  }
  public eof(): void {
    try {
      const method_declaration_pattern = new RegExp(
        this.instance_name + ".variable"
      );
      for (let i = 0; i < this.updated_code.length; i++) {
        if (method_declaration_pattern.test(this.updated_code[i])) {
          this.updated_code[i] = "";
        }
      }
      let newFileToWrite = "";
      for (let i = 0; i < this.updated_code.length; i++) {
        newFileToWrite += this.updated_code[i] + "\n";
      }
      //todo will need to my file type dynamic
      const newFileName = "STATIC_TYPING_FILE.js";
      const splitPath = this.path.split("/");
      splitPath[splitPath.length - 1] = newFileName;
      const newFilePath = splitPath.join("/");
      this.fileNameToUnsync = newFilePath;
      this.fs.writeFileSync(newFilePath, newFileToWrite, {
        encoding: "utf-8",
      });

      this.cp.exec(`node ${newFilePath}`, (err) => {
        // console.log("executing again");
        if (err) {
          // console.log("error error");
          //! all the recursion neeeds to be called in here
          //! new code
          if (this.method_call_count === 0) {
            //! new code
            this.fs.unlink(this.fileNameToUnsync, (err) => {
              if (err) {
                const msg = err.message;
                this.reportErr(
                  chalk(msg + "", Colors.red),
                  (err as Error).stack?.split("\n").at(-2) || ""
                );
              } else {
                this.reportErr(
                  chalk(this.errorsToPresent.join("\n"), Colors.red),
                  ""
                );
              }
            });
          } else {
            const message = (err as Error).message.split("\n")[5] || "";

            this.errorsToPresent.push(chalk(message + "", Colors.red));
            const errorLineToMatch = err.message.split("\n")[2];
            //recursion

            // console.log(this.updated_code);
            for (let i = 0; i < this.updated_code.length; i++) {
              if (errorLineToMatch === this.updated_code[i]) {
                this.updated_code[i] = "";
              }
            }
            // console.log(this.updated_code);
            this.method_call_count--;
            if (this.method_call_count === 0) {
              this.fs.unlinkSync(this.fileNameToUnsync);
              this.reportErr(
                chalk(this.errorsToPresent.join("\n"), Colors.red),
                ""
              );
            }
            // console.log("executing end");
            this.eof();
          }
          //or reporting

          //! all the recursion neeeds to be called in here
        } else {
          // this.fs.unlink(this.fileNameToUnsync, (err) => {
          //   if (err) {
          //   }
          // });
          if (this.method_call_count !== 0) {
            this.eof();
          } else {
            this.fs.unlink(this.fileNameToUnsync, (err) => {
              if (err) {
              }
            });
          }
        }
      });
    } catch (err) {
      const code = err["code"];
      if (!code) {
        const message = (err as Error).message || "";
        this.reportErr(
          chalk(message + "", Colors.red),
          (err as Error).stack?.split("\n").at(-2) || ""
        );
      }
    }
  }

  private validateVariableDeclaration(line_of_code: string): boolean {
    const tokenized_code = line_of_code.split(" ");
    const letKeyword = /let/;
    const constKeyword = /const/;
    for (let i: number = 0; i < tokenized_code.length; i++) {
      const currentToken = tokenized_code[i];
      if (letKeyword.test(currentToken) || constKeyword.test(currentToken)) {
        return true;
      }
    }
    return false;
  }
  private fetchInstanceName(line_of_code: string): void {
    try {
      const tokenized_code = line_of_code.split(" ");
      let i: number = 0;
      let len: number = tokenized_code.length;
      let constKeyword = /const/;
      let letKeyword = /let/;
      while (i < len) {
        const currentToken = tokenized_code[i];
        if (constKeyword.test(currentToken) || letKeyword.test(currentToken)) {
          this.instance_name = tokenized_code[i + 1];
          break;
        }
        i++;
      }
    } catch (err) {
      this.reportErr(chalk("Internal Error", Colors.red), "");
    } finally {
    }
  }

  private reportErr(message: string, line: string): void {
    console.error(`${message}\n${chalk("LINE: " + line + "]", Colors.cyan)}`);
    console.trace();
    process.exit(1);
  }
  private force_exit_for_dev_purposes_only(): void {
    process.exit(1);
  }
}
