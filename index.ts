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
//* 2. need to figure out how to properly exit the npx node instance maybe pass a flag to main function ???
//? figure out no 2, any instance where there is method calling i am going to comment it out from the code
//* 3. also need to handle multiple calls, ok time to rethink my procedure
//* 4. need to fix when multiple files are generated
//* 5 bug with eof is that the type checkers are async

export class Type {
  //essentially dependency injection
  private readonly fs = fs;
  private readonly cp = cp;
  private path: string;
  private instance_name: string = "";
  private updated_code: string[] = [];
  private parsed_identifiers: string[] = [];
  // constructor
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

  public variable(valueType: string): void {
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
      this.parseUserCode(valueType);
      // this.eof();
      // let value = "";
      //! ommitting for now
      /*
      if (typeof value !== valueType) {
        throw new Error(
          `Static Typing Error: expected type [${valueType}], received [${typeof value}]`
        );
      }
        */
    } catch (err) {
      const line = (err as Error).stack?.split("\n")[2] || "";
      this.reportErr(chalk((err as Error).message + "", Colors.red), line);
    }
  }

  private parseUserCode(
    valueType: string
  ): void /*could return any composite or primitive type*/ {
    try {
      //read file that

      let data;
      if (this.updated_code.length === 0) {
        // data = await new Promise((resolve, reject) => {
        //   this.fs.readFile(this.path, { encoding: "utf-8" }, (err, data) => {
        //     if (err) {
        //       //if there is an error, just throw this pre written
        //       reject(
        //         "Trouble parsing path. Ensure instance of [Type Class] is instantiated with node's built in __filename variable passed as argument."
        //       );
        //     } else {
        //       resolve(data);
        //     }
        //   });
        // });
        data = this.fs.readFileSync(this.path, { encoding: "utf-8" });
      } else {
        data = this.updated_code.join("\n");
      }

      //split data received from readfile method and format it to remove white space
      const formattedData = String(data)
        .split("\n")
        .filter((n) => n && !/\/\//.test(n));

      //regex for instance
      const class_instantiation_pattern = /new Type/;
      //loop over to find line where class instance is instantiated to find name of instance
      if (!this.instance_name) {
        //this so it doesnt keep doing a lookup
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

      //find method declaration, will be dynamic which is why regexp object is used
      const method_declaration_pattern = new RegExp(
        this.instance_name + ".variable"
      );
      let identifier: string = "";
      let methodCall: string = "";
      //loop through formatted data to find line where the variable is being identified

      //this if statement ensures if the identifier has already been consmed then dont even bother parsing
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

      //this just removes ":" if used in typescript
      let colon_found: boolean = false;
      identifier = identifier
        .split(" ")
        .filter((n) => n !== "let" && n !== "const")[0]
        .split("")
        .map((n) => {
          if (n === ":") {
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
      //code is just updated
      this.updated_code.push(
        `if (typeof ${identifier} !== "${valueType}") {throw new Error("Static Typing Error: expected type [${valueType}], received [${typeof identifier}] for variable ${identifier}");}`
      );

      //! below will be eof method code
      //todo NEED TO ADD CHECK CLAUSE FOR THIS FILE. MAYBE INSTEAD OF DOING DATE NAME JUST NAMING IT STATICJSJSJS AND THEN SEEING BEFORE EACH WRITE IF IT EXISTS, IF IT DOES DONT EXECUTE ANYMORE. THIS IS ALL RECURSIVELY BEING CALLED
      //TODO TIMEOUT OPTION IS DANGEROUS BCAUSE IT DOESNT ALLOW WITH INTERFACING
      // const command = `npx ts-node ${newFilePath}`;
      // await new Promise((resolve, reject) => {
      //   exec(command, (error, stdout, stderr) => {
      //     if (error || stderr) {
      //       const formattedErrMessage = error.message
      //         .split("\n")
      //         .filter((n) => n)
      //         .slice(3)
      //         .join("\n");
      //       reject(formattedErrMessage);
      //     } else {
      //       resolve;
      //     }
      //   });
      // });
      // await fs.promises.unlink(newFilePath);
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
      // console.log(this.updated_code);
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
      const newFileName = "STATIC_TYPING_FILE.ts";
      const splitPath = this.path.split("/");
      splitPath[splitPath.length - 1] = newFileName;
      const newFilePath = splitPath.join("/");

      this.fs.writeFileSync(newFilePath, newFileToWrite, {
        encoding: "utf-8",
      });
      this.cp.exec(`npx ts-node ${newFilePath}`, (err, stdout, stderr) => {
        if (err) {
          throw new Error(err + "");
        }
      });
      // this.fs.unlinkSync(newFilePath);
    } catch (err) {
      const message = (err as Error).message || "";
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
