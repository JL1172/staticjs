import * as fs from "fs";
import { exec } from "child_process";
import { Colors } from "../lib/colorize";
import { chalk } from "../lib/colorize";

export class Static {
  private path: string = "";
  private readonly fs: typeof fs = fs;
  private readonly cp = exec;
  private formatted_code: string[];

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
    this.removeComments();
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
    this.formatted_code = updated_code.join("").split("\n").filter(n => n);
  }
  private parseFile(): void {
    console.log(this.formatted_code);
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
