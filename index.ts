import * as fs from "fs";
import { chalk, Colors } from "./lib/colorize";
import { exec } from "child_process";

//! all errors are self contained to avoid weird error and bug propagation
//todos
//* 1. need to add support for multiline method calls like
/*
  instance.
  variable();
*/

export class Type {
  private readonly fs = fs;
  private path: string;
  private instance_name: string = "";

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
  }

  public async func(
    nameOfFunction: string,
    functionReturnTypes: string[]
  ): Promise<void> {
    try {
    } catch (err) {}
  }

  public async variable(valueType: string): Promise<void> {
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
      //if let keyword is found the variable is evaluated at its last instance to evaulate that it adhered to its type passed
      const value = await this.parseUserCode(valueType);

      // let value = "";
      if (typeof value !== valueType) {
        throw new Error(
          `Static Typing Error: expected type [${valueType}], received [${typeof value}]`
        );
      }
    } catch (err) {
      const line = (err as Error).stack?.split("\n")[2] || "";
      this.reportErr(chalk((err as Error).message + "", Colors.red), line);
    }
  }

  private async parseUserCode(
    valueType: string
  ): Promise<any> /*could return any composite or primitive type*/ {
    try {
      //read file that
      const data = await new Promise((resolve, reject) => {
        this.fs.readFile(this.path, { encoding: "utf-8" }, (err, data) => {
          if (err) {
            //if there is an error, just throw this pre written
            reject(
              "Trouble parsing path. Ensure instance of [Type Class] is instantiated with node's built in __filename variable passed as argument."
            );
          } else {
            resolve(data);
          }
        });
      });

      //split data received from readfile method and format it to remove white space
      const formattedData = String(data)
        .split("\n")
        .filter((n) => n);
      //regex for instance
      const class_instantiation_pattern = /new Type/;
      //loop over to find line where class instance is instantiated to find name of instance
      for (let i: number = 0; i < formattedData.length; i++) {
        if (class_instantiation_pattern.test(formattedData[i])) {
          this.fetchInstanceName(formattedData[i]);
          break;
        }
      }

      if (!this.instance_name) {
        throw new Error(
          "Ensure instance of [Type Class] is instantiated with node's built in __filename variable passed as argument."
        );
      }

      //find method declaration, will be dynamic which is why regexp object is used
      const method_declaration_pattern = new RegExp(
        this.instance_name + ".variable"
      );
      let identifier: string = "";
      let methodCall: string = "";
      //loop through formatted data to find line where the variable is being identified
      for (let i: number = 0; i < formattedData.length; i++) {
        if (method_declaration_pattern.test(formattedData[i])) {
          identifier = formattedData[i + 1];
          methodCall = formattedData[i];
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

      //this just removes ":" if used in typescript
      identifier = identifier
        .split(" ")
        .filter((n) => n !== "let" && n !== "const")[0]
        .split("")
        .filter((n) => n !== ":")
        .join("");

      formattedData.push(
        `if (typeof ${identifier} !== "${valueType}") {throw new Error("Static Typing Error: expected type [${valueType}], received [${typeof identifier}] for variable ${identifier}");}`
      );
      // formattedData.push(`process.exit(0)`);

      let newFileToWrite = "";
      for (let i = 0; i < formattedData.length; i++) {
        newFileToWrite += formattedData[i] + "\n";
      }

      const newFileName = new Date().toISOString() + ".ts";
      const splitPath = this.path.split("/");
      splitPath[splitPath.length - 1] = newFileName;
      const newFilePath = splitPath.join("/");

      await fs.promises.writeFile(newFilePath, newFileToWrite, {
        encoding: "utf-8",
      });
      //todo NEED TO ADD CHECK CLAUSE FOR THIS FILE. MAYBE INSTEAD OF DOING DATE NAME JUST NAMING IT STATICJSJSJS AND THEN SEEING BEFORE EACH WRITE IF IT EXISTS, IF IT DOES DONT EXECUTE ANYMORE. THIS IS ALL RECURSIVELY BEING CALLED
      //TODO TIMEOUT OPTION IS DANGEROUS BCAUSE IT DOESNT ALLOW WITH INTERFACING
      const command = `npx ts-node ${newFilePath}`;
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error || stderr) {
            const formattedErrMessage = error.message
              .split("\n")
              .filter((n) => n)
              .slice(3)
              .join("\n");
            reject(formattedErrMessage);
          } else {
            resolve;
          }
        });
      });
      await fs.promises.unlink(newFilePath);
    } catch (err) {
      const message = (err as Error).message || err;
      this.reportErr(
        chalk(message + "", Colors.red),
        (err as Error).stack?.split("\n").at(-2) || ""
      );
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
          //this can be assigned to field instance because this instance of this class will only have one instance name associated w it per instance
          this.instance_name = tokenized_code[i + 1];
          break;
        }
        i++;
      }
    } catch (err) {
      this.reportErr(chalk("Internal Error", Colors.red), "");
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
