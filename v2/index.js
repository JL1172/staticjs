"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Static = void 0;
var fs = require("fs");
var child_process_1 = require("child_process");
var colorize_1 = require("../lib/colorize");
var colorize_2 = require("../lib/colorize");
var Node = /** @class */ (function () {
    function Node(id, val, type) {
        this.identifier = id;
        this.value = val;
        this.enforced_type = type;
    }
    return Node;
}());
var VariableNode = /** @class */ (function (_super) {
    __extends(VariableNode, _super);
    function VariableNode(id, val, type) {
        return _super.call(this, id, val, type) || this;
    }
    return VariableNode;
}(Node));
var Static = /** @class */ (function () {
    function Static(fileName) {
        this.path = "";
        this.fs = fs;
        this.cp = child_process_1.exec;
        this.variable_declarations = [];
        this.variable_node = [];
        this.newCode = "";
        this.newCodePath = "";
        if (fileName.trim().length === 0) {
            this.reportConstructionError("Ensure when instantiating instance '__filename' is passed as an argument");
        }
        else {
            this.path = fileName;
        }
    }
    Static.prototype.enable = function () {
        this.validateFile();
        if (!this.formatted_code || this.formatted_code.length === 0) {
            this.reportFileReadError("Error reading file and parsing code");
        }
        this.removeComments();
        this.findVariableDeclarations();
        this.parseVariableDeclarations();
        this.createCode();
        this.removeImports();
        console.log(this.formatted_code);
        this.force_quit_for_dev_purposed_only();
        this.writeNewCodeToFile();
        this.executeNewCode();
        // this.parseFile();
    };
    Static.prototype.validateFile = function () {
        try {
            var data = this.fs.readFileSync(this.path, {
                encoding: "utf-8",
            });
            this.formatted_code = data.split("\n").filter(function (n) { return n; });
        }
        catch (err) {
            this.reportFileError(err["message"]);
        }
    };
    Static.prototype.removeComments = function () {
        var codeToParse = this.formatted_code.join("\n").split("");
        var lengthOfCode = codeToParse.length;
        var updated_code = [];
        for (var i = 0; i < lengthOfCode; i++) {
            var currentLineOfCode = codeToParse[i];
            switch (currentLineOfCode) {
                case "/":
                    if (codeToParse[i + 1] === "/") {
                        var j = i;
                        while (codeToParse[j] !== "\n") {
                            j++;
                        }
                        i = j;
                    }
                    else if (codeToParse[i + 1] === "*") {
                        var j = i;
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
            .filter(function (n) { return n; });
    };
    Static.prototype.findVariableDeclarations = function () {
        var constKeyword = /const/;
        var letKeyword = /let/;
        var lengthOfCode = this.formatted_code.length;
        for (var i = 0; i < lengthOfCode; i++) {
            var currentLineOfCode = this.formatted_code[i];
            if (letKeyword.test(currentLineOfCode) ||
                constKeyword.test(currentLineOfCode)) {
                this.variable_declarations.push(currentLineOfCode);
            }
        }
    };
    Static.prototype.parseVariableDeclarations = function () {
        var lengthOfVariableDeclarationArr = this.variable_declarations.length;
        if (lengthOfVariableDeclarationArr !== 0) {
            var _loop_1 = function (i) {
                var splitCode = this_1.variable_declarations[i]
                    .split(" ")
                    .filter(function (n) { return n; });
                var lastValue = splitCode[splitCode.length - 1].replace(/["';]/g, "");
                var secondToLastValue = splitCode[splitCode.length - 2].split("");
                if (!lastValue) {
                    var idx = 1;
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
                            this_1.reportStaticTypingError("Error parsing statement following variable declaration, ensure statement is valid composite or primitive type" +
                                "\n" +
                                "Recieved: [" +
                                lastValue +
                                "]" +
                                "\n" +
                                "If this message does not apply, ensure that semi colon follows variable declaration, the correct format is the following: " +
                                "\n" +
                                (0, colorize_2.chalk)('const identifier = "name"; "string";', colorize_1.Colors.bgCyan));
                    }
                    var identifier = "";
                    var constKeyword = /const/;
                    var letKeyword = /let/;
                    for (var i_1 = 0; i_1 < splitCode.length; i_1++) {
                        var currentToken = splitCode[i_1];
                        if (constKeyword.test(currentToken) ||
                            letKeyword.test(currentToken)) {
                            identifier = splitCode[i_1 + 1];
                            break;
                        }
                    }
                    var assignmentFound_1 = false;
                    identifier = identifier
                        .split("")
                        .map(function (n) {
                        if (n === "=" || n === ":") {
                            assignmentFound_1 = true;
                        }
                        if (n !== "=" && assignmentFound_1 === false) {
                            return n;
                        }
                    })
                        .join("");
                    var valueOfVariable = [];
                    var characterCode = splitCode.join("").split("");
                    var indexOfAssignmentOperator = characterCode.indexOf("=") + 1;
                    valueOfVariable = characterCode.slice(indexOfAssignmentOperator);
                    valueOfVariable.reverse();
                    //   this.force_quit_for_dev_purposed_only();
                    var h = -1;
                    var k = -1;
                    var index = 0;
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
                    this_1.variable_node.push(new VariableNode(identifier, valueOfVariable, lastValue));
                }
            };
            var this_1 = this;
            for (var i = 0; i < lengthOfVariableDeclarationArr; i++) {
                _loop_1(i);
            }
        }
    };
    //got to figure out how to evaluate types
    Static.prototype.createCode = function () {
        var i = 0;
        while (i < this.variable_declarations.length - 1) {
            var currentNode = this.variable_node[i];
            var currentIfStatement = "if (typeof " +
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
                '] Recieved Type: [ " + type + " ]' +
                '");' +
                "}";
            this.formatted_code.push(currentIfStatement);
            i++;
        }
        this.newCode = this.formatted_code.join("\n");
        if (!this.newCode) {
            this.reportCreateCodeError("Internal Error");
        }
    };
    Static.prototype.removeImports = function () {
        var importRegex = /const\s+{\s*Static\s*}\s*/;
        var methodCall = /\s*new\s+Static\s*\(\s*__filename\s*\)\s*\.\s*enable\s*\(\s*\)\s*/;
        this.formatted_code = this.formatted_code.filter(function (n) { return !importRegex.test(n) && !methodCall.test(n); });
    };
    Static.prototype.writeNewCodeToFile = function () {
        try {
            var splitpath = this.path.split("/");
            splitpath[splitpath.length - 1] = new Date().toISOString() + ".js";
            var newFilePath = splitpath.join("/");
            this.newCodePath = newFilePath;
            this.fs.writeFileSync(newFilePath, this.newCode, { encoding: "utf-8" });
        }
        catch (err) {
            this.reportWriteFileError("Error Writing Code To File");
        }
    };
    Static.prototype.executeNewCode = function () {
        var _this = this;
        try {
            console.log(this.newCode);
            this.cp("node " + this.newCodePath, function (error, stdout, stderr) {
                if (error) {
                    _this.fs.unlinkSync(_this.newCodePath);
                    throw new Error(error + "");
                }
                else {
                    console.log("stdout: ", stdout);
                    console.log("stderr: ", stderr);
                    _this.fs.unlinkSync(_this.newCodePath);
                }
            });
        }
        catch (err) {
            console.log("erorror");
            console.log(err);
        }
    };
    Static.prototype.parseFile = function () {
        console.log(this.variable_node);
    };
    Static.prototype.reportWriteFileError = function (message, errType) {
        if (errType === void 0) { errType = "WriteFileError"; }
        var messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    };
    Static.prototype.reportStaticTypingError = function (message, errType) {
        if (errType === void 0) { errType = "StaticTypingError"; }
        var messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    };
    Static.prototype.reportFileReadError = function (message, errType) {
        if (errType === void 0) { errType = "FileReadError"; }
        var messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    };
    Static.prototype.reportFileError = function (message, errType) {
        if (errType === void 0) { errType = "FileError"; }
        var messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    };
    Static.prototype.reportConstructionError = function (message, errType) {
        if (errType === void 0) { errType = "ConstructionError"; }
        var messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    };
    Static.prototype.reportCreateCodeError = function (message, errType) {
        if (errType === void 0) { errType = "CreateCodeError"; }
        var messageToPresent = (0, colorize_2.chalk)("[ErrorType]: ", colorize_1.Colors.bgRed) +
            (0, colorize_2.chalk)(errType, colorize_1.Colors.bgRed) +
            "\n" +
            (0, colorize_2.chalk)(message, colorize_1.Colors.red);
        console.error(messageToPresent);
        console.trace();
        process.exit(1);
    };
    Static.prototype.force_quit_for_dev_purposed_only = function () {
        process.exit(1);
    };
    return Static;
}());
exports.Static = Static;
