import * as fs from "fs";
import { chalk, Colors } from "./lib/colorize";

//! all errors are self contained to avoid weird error and bug propagation

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
      const value = await this.findLastInstanceOfVariable();

      // let value = "";
      if (typeof value !== valueType) {
        throw new Error(
          `Static Typing Error: expected type [${valueType}], received [${typeof value}]`
        );
      }
    } catch (err) {
      const line = (err as Error).stack?.split("\n")[2]|| "";
      this.reportErr(chalk((err as Error).message + "", Colors.red), line);
    }
  }

  private async findLastInstanceOfVariable(): Promise<any> /*could return any composite or primitive type*/ {
    try {
      //read file
      const data = await new Promise((resolve, reject) => {
        this.fs.readFile(this.path, { encoding: "utf-8" }, (err, data) => {
          if (err) {
            reject(
              "Trouble parsing path. Ensure instance of [Type Class] is instantiated with node's built in __filename variable passed as argument."
            );
          } else {
            resolve(data);
          }
        });
      });

      //split data
      const formattedData = String(data)
        .split("\n")
        .filter((n) => n);
      const class_instantiation_pattern = /new Type/;
      //loop over to find name of instance
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

      

      return data;
    } catch (err) {
      const message = (err as Error).message || err;
      this.reportErr(
        chalk(message + "", Colors.red),
        (err as Error).stack?.split("\n").at(-2) || ""
      );
    }
  }

  private fetchInstanceName(line_of_code: string): void {
    try {
      const tokenized_code = line_of_code.split(" ");
      let i: number = 0;
      let len: number = tokenized_code.length;
      let constKeyword = /const/;
      while (i < len) {
        const currentToken = tokenized_code[i];
        if (constKeyword.test(currentToken)) {
          this.instance_name = tokenized_code[i + 1];
          break;
        }
        i++;
      }
    } catch (err) {
      throw new Error("Internal Error");
    }
  }

  private reportErr(message: string, line: string): void {
    console.error(`${message}\n${chalk("LINE: " + line + "]", Colors.cyan)}`);
    process.exit(1);
  }
  private force_exit_for_dev_purposes_only(): void {
    process.exit(1);
  }
}
