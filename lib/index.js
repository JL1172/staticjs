"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Static = void 0;
const fs = require("fs");
const child_process_1 = require("child_process");
const colorize_1 = require("./colorize");
const colorize_2 = require("./colorize");
class Node {
    constructor(id, val, type) {
        this.identifier = id;
        this.value = val;
        this.enforced_type = type;
    }
}
class VariableNode extends Node {
    constructor(id, val, type) {
        super(id, val, type);
    }
}
class Static {
    constructor(fileName) {
        this.path = "";
        this.fs = fs;
        this.cp = child_process_1.exec;
        this.variable_declarations = [];
        this.variable_node = [];
        this.newCode = "";
        this.newCodePath = "";
        this.aggregatedErrors = [];
        if (fileName.trim().length === 0) {
            this.reportConstructionError("Ensure when instantiating instance '__filename' is passed as an argument");
        }
        else {
            this.path = fileName;
        }
    }
    enableVars() {
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
    }
    validateFile() {
        try {
            const data = this.fs.readFileSync(this.path, {
                encoding: "utf-8",
            });
            this.formatted_code = data.split("\n").filter((n) => n);
        }
        catch (err) {
            this.reportFileError(err["message"]);
        }
    }
    removeComments() {
        const singleLineComment = /\/\/.*$/;
        this.formatted_code = this.formatted_code.filter(n => !singleLineComment.test(n));
        const multiLineCommentStart = /\/\*.*$/;
        const multiLineCommentEnd = /\*\//;
        const len = this.formatted_code.length;
        const new_formatted_code = [];
        for (let i = 0; i < len; i++) {
            if (multiLineCommentStart.test(this.formatted_code[i])) {
                let j = i;
                while (!multiLineCommentEnd.test(this.formatted_code[j])) {
                    j++;
                }
                i = j + 1;
            }
            new_formatted_code.push(this.formatted_code[i]);
        }
        this.formatted_code = new_formatted_code;
    }
    findVariableDeclarations() {
        const constKeyword = /const/;
        const letKeyword = /let/;
        const lengthOfCode = this.formatted_code.length;
        for (let i = 0; i < lengthOfCode; i++) {
            const currentLineOfCode = this.formatted_code[i];
            if (letKeyword.test(currentLineOfCode) ||
                constKeyword.test(currentLineOfCode)) {
                this.variable_declarations.push(currentLineOfCode);
            }
        }
    }
    parseVariableDeclarations() {
        const lengthOfVariableDeclarationArr = this.variable_declarations.length;
        if (lengthOfVariableDeclarationArr !== 0) {
            for (let i = 0; i < lengthOfVariableDeclarationArr; i++) {
                const splitCode = this.variable_declarations[i]
                    .split(" ")
                    .filter((n) => n);
                let lastValue = splitCode[splitCode.length - 1].replace(/["';]/g, "");
                let secondToLastValue = splitCode[splitCode.length - 2].split("");
                if (!lastValue) {
                    let idx = 1;
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
                            this.reportStaticTypingError("Error parsing statement following variable declaration, ensure statement is valid composite or primitive type" +
                                "\n" +
                                "Recieved: [" +
                                lastValue +
                                "]" +
                                "\n" +
                                "If this message does not apply, ensure that semi colon follows variable declaration, the correct format is the following: " +
                                "\n" +
                                (0, colorize_2.chalk)('const identifier = "name"; "string";', colorize_1.Colors.bgCyan));
                    }
                    let identifier = "";
                    const constKeyword = /const/;
                    const letKeyword = /let/;
                    for (let i = 0; i < splitCode.length; i++) {
                        const currentToken = splitCode[i];
                        if (constKeyword.test(currentToken) ||
                            letKeyword.test(currentToken)) {
                            identifier = splitCode[i + 1];
                            break;
                        }
                    }
                    let assignmentFound = false;
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
                    let valueOfVariable = [];
                    const characterCode = splitCode.join("").split("");
                    const indexOfAssignmentOperator = characterCode.indexOf("=") + 1;
                    valueOfVariable = characterCode.slice(indexOfAssignmentOperator);
                    valueOfVariable.reverse();
                    let h = -1;
                    let k = -1;
                    let index = 0;
                    while (h === -1 || k === -1) {
                        if (valueOfVariable[index] === ";") {
                            if (h === -1) {
                                h = index;
                            }
                            else if (h !== -1 && k === -1) {
                                k = index;
                            }
                        }
                        index++;
                    }
                    valueOfVariable = valueOfVariable.slice(k).reverse().join("");
                    this.variable_node.push(new VariableNode(identifier, valueOfVariable, lastValue));
                }
            }
        }
    }
    createCode() {
        let i = 0;
        while (i < this.variable_declarations.length - 1) {
            const currentNode = this.variable_node[i];
            const currentIfStatement = "if (typeof " +
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
    removeImports() {
        const importRegex = /const\s+{\s*Static\s*}\s*/;
        const methodCall = /\s*new\s+Static\s*\(\s*__filename\s*\)\s*\.\s*enableVars\s*\(\s*\)\s*/;
        this.newCode = this.formatted_code
            .filter((n) => !importRegex.test(n) && !methodCall.test(n))
            .join("\n");
    }
    writeNewCodeToFile() {
        try {
            const splitpath = this.path.split("/");
            splitpath[splitpath.length - 1] = new Date().toISOString() + ".js";
            const newFilePath = splitpath.join("/");
            this.newCodePath = newFilePath;
            this.fs.writeFileSync(newFilePath, this.newCode, { encoding: "utf-8" });
        }
        catch (err) {
            this.reportWriteFileError("Error Writing Code To File");
        }
    }
    executeNewCode() {
        const unexposed = process.argv.at(-1) !== "--verbose" && process.argv.at(-1) !== "--v";
        this.cp("node " + this.newCodePath, (error, stdout, stderr) => {
            if (error) {
                if (unexposed) {
                    this.fs.unlinkSync(this.newCodePath);
                }
                this.reportExecuteCodeError((error || stderr) + "");
            }
            else {
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
    reportAggregateErrors() {
        if (this.aggregatedErrors.length !== 0) {
            const code = 1;
            const errType = "Staticjs Typing Error";
            const error_messages = this.aggregatedErrors.join("\n") + "\n";
            const heading = (0, colorize_2.chalk)(`${errType.toUpperCase()}`, colorize_1.Colors.bgRed) + "\n";
            const body = (0, colorize_2.chalk)(error_messages, colorize_1.Colors.red);
            const ending = (0, colorize_2.chalk)(`Process exiting with code: ${code}`, colorize_1.Colors.cyan) + "\n";
            console.error(heading);
            console.error(body);
            console.error(ending);
        }
    }
    reportExecuteCodeError(message, errType = "ExecuteCodeError") {
        const messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    }
    reportWriteFileError(message, errType = "WriteFileError") {
        const messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    }
    reportStaticTypingError(message, errType = "StaticTypingError") {
        const messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    }
    reportFileReadError(message, errType = "FileReadError") {
        const messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    }
    reportFileError(message, errType = "FileError") {
        const messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    }
    reportConstructionError(message, errType = "ConstructionError") {
        const messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    }
    reportCreateCodeError(message, errType = "CreateCodeError") {
        const messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    }
    force_quit_for_dev_purposed_only() {
        process.exit(1);
    }
}
exports.Static = Static;
//# sourceMappingURL=index.js.map