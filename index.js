"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = void 0;
var fs = require("fs");
var colorize_1 = require("./lib/colorize");
var cp = require("child_process");
//! all errors are self contained to avoid weird error and bug propagation
//! making mvp with a lot of direct manual stuff. want to eventually make the flow more "flowy" but for now, I want to make it just work.
//todos
//* 1. need to add support for multiline method calls like
/*
  instance.
  variable();
*/
var Type = /** @class */ (function () {
    function Type(fileName) {
        this.fs = fs;
        this.cp = cp;
        this.instance_name = "";
        this.updated_code = [];
        this.parsed_identifiers = [];
        this.errorsToPresent = [];
        this.method_call_count = 0;
        if (!fileName) {
            this.reportErr((0, colorize_1.chalk)("Instance of [Type Class] must be instantiated with node's built in __filename variable passed as argument.", colorize_1.Colors.bgRed), "");
        }
        this.path = fileName;
        try {
            var data = this.fs.readFileSync(this.path, { encoding: "utf-8" });
            var dataToParse = data.split("\n");
            var instanceName = "";
            for (var i = 0; i < dataToParse.length; i++) {
                if (/new Type(__filename)/.test(dataToParse[i])) {
                    instanceName = dataToParse[i];
                }
            }
            var colon_found_1 = false;
            if (!instanceName) {
                for (var i = 0; i < dataToParse.length; i++) {
                    if (/new Type(__filename)/.test(dataToParse[i])) {
                        instanceName = dataToParse[i];
                    }
                }
            }
            // if (!instanceName) {
            //   throw new Error("Error instantiating class");
            // }
            instanceName = instanceName
                .split(" ")
                .filter(function (n) { return n !== "let" && n !== "const"; })[0]
                .split("")
                .map(function (n) {
                if (n === ":" || n === "=") {
                    colon_found_1 = true;
                }
                else {
                    if (!colon_found_1) {
                        return n;
                    }
                }
            })
                .join("");
            // instanceName = "type";
            var method_declaration_pattern = new RegExp(instanceName + ".variable");
            for (var i = 0; i < dataToParse.length; i++) {
                if (method_declaration_pattern.test(dataToParse[i])) {
                    this.method_call_count++;
                }
            }
        }
        catch (err) {
            this.reportErr((0, colorize_1.chalk)(err + "", colorize_1.Colors.red), "");
        }
    }
    Type.prototype.func = function (nameOfFunction, functionReturnTypes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                }
                catch (err) { }
                return [2 /*return*/];
            });
        });
    };
    Type.prototype.variable = function (valueType) {
        var _a;
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
                    throw new Error("Static Typing Error: Expected input for [valueType] argument should be one of the following: \n[string, number, bigint, object, function, boolean, undefined, null]\n actual type: [".concat(valueType, "]"));
            }
            this.parseUserCode(valueType);
        }
        catch (err) {
            var line = ((_a = err.stack) === null || _a === void 0 ? void 0 : _a.split("\n")[2]) || "";
            this.reportErr((0, colorize_1.chalk)(err.message + "", colorize_1.Colors.red), line);
        }
    };
    Type.prototype.parseUserCode = function (valueType) {
        var _a;
        try {
            var data = void 0;
            if (this.updated_code.length === 0) {
                data = this.fs.readFileSync(this.path, { encoding: "utf-8" });
            }
            else {
                data = this.updated_code;
            }
            //! look at diff if error
            var formattedData = void 0;
            if (Array.isArray(data)) {
                formattedData = data.filter(function (n) { return n && !/\/\//.test(n); });
            }
            else {
                formattedData = String(data)
                    .split("\n")
                    .filter(function (n) { return n && !/\/\//.test(n); });
            }
            //! look at diff if error
            var class_instantiation_pattern = /new Type/;
            if (!this.instance_name) {
                for (var i = 0; i < formattedData.length; i++) {
                    if (class_instantiation_pattern.test(formattedData[i])) {
                        this.fetchInstanceName(formattedData[i]);
                        break;
                    }
                }
            }
            if (!this.instance_name) {
                throw new Error("Ensure instance of [Type Class] is instantiated with node's built in __filename variable passed as argument.");
            }
            var method_declaration_pattern = new RegExp(this.instance_name + ".variable");
            var identifier = "";
            var methodCall = "";
            for (var i = 0; i < formattedData.length; i++) {
                if (method_declaration_pattern.test(formattedData[i]) &&
                    !this.parsed_identifiers.includes(formattedData[i + 1])) {
                    identifier = formattedData[i + 1];
                    methodCall = formattedData[i];
                    this.parsed_identifiers.push(identifier);
                    break;
                }
            }
            var isValidVariableDeclaration = this.validateVariableDeclaration(identifier);
            if (isValidVariableDeclaration === false || !identifier || !methodCall) {
                throw new Error("Ensure variable is immediately following this method declaration to properly apply static typing. Example: \n" +
                    "\n" +
                    (0, colorize_1.chalk)('instance.variable("number")\n' + "const myVar = 2;", colorize_1.Colors.white) +
                    "\n");
            }
            var colon_found_2 = false;
            identifier = identifier
                .split(" ")
                .filter(function (n) { return n !== "let" && n !== "const"; })[0]
                .split("")
                .map(function (n) {
                if (n === ":" || n === "=") {
                    colon_found_2 = true;
                }
                else {
                    if (!colon_found_2) {
                        return n;
                    }
                }
            })
                .join("");
            if (this.updated_code.length === 0) {
                this.updated_code = formattedData;
            }
            this.updated_code.push("if (typeof ".concat(identifier, " !== \"").concat(valueType, "\") {throw new Error(\"Static Typing Error: expected type [").concat(valueType, "], received [").concat(typeof identifier, "] for variable [").concat((0, colorize_1.chalk)((0, colorize_1.chalk)(identifier, colorize_1.Colors.white), colorize_1.Colors.bgRed)).concat((0, colorize_1.chalk)("]", colorize_1.Colors.red), "\")}"));
        }
        catch (err) {
            var code = err["code"];
            if (code && code === "ENOENT") {
                this.reportErr((0, colorize_1.chalk)("Trouble parsing path. Ensure instance of [Type Class] is instantiated with node's built in __filename variable passed as argument.", colorize_1.Colors.red), "");
            }
            var message = err.message || err;
            this.reportErr((0, colorize_1.chalk)(message + "", colorize_1.Colors.red), ((_a = err.stack) === null || _a === void 0 ? void 0 : _a.split("\n").at(-2)) || "");
        }
    };
    Type.prototype.eof = function () {
        var _this = this;
        var _a;
        try {
            var method_declaration_pattern = new RegExp(this.instance_name + ".variable");
            for (var i = 0; i < this.updated_code.length; i++) {
                if (method_declaration_pattern.test(this.updated_code[i])) {
                    this.updated_code[i] = "";
                }
            }
            var newFileToWrite = "";
            for (var i = 0; i < this.updated_code.length; i++) {
                newFileToWrite += this.updated_code[i] + "\n";
            }
            //todo will need to my file type dynamic
            var newFileName = "STATIC_TYPING_FILE.js";
            var splitPath = this.path.split("/");
            splitPath[splitPath.length - 1] = newFileName;
            var newFilePath = splitPath.join("/");
            this.fileNameToUnsync = newFilePath;
            this.fs.writeFileSync(newFilePath, newFileToWrite, {
                encoding: "utf-8",
            });
            this.cp.exec("node ".concat(newFilePath), function (err) {
                if (err) {
                    var message = (err === null || err === void 0 ? void 0 : err.message.split("\n")[5]) || "";
                    _this.errorsToPresent.push((0, colorize_1.chalk)(message + "", colorize_1.Colors.red));
                    var errorLineToMatch = (err === null || err === void 0 ? void 0 : err.message.split("\n")[2]) || "";
                    for (var i = 0; i < _this.updated_code.length; i++) {
                        if (errorLineToMatch === _this.updated_code[i]) {
                            _this.updated_code[i] = "";
                        }
                    }
                    _this.method_call_count--;
                    if (_this.method_call_count === 0) {
                        _this.fs.unlinkSync(_this.fileNameToUnsync);
                        _this.reportErr((0, colorize_1.chalk)(_this.errorsToPresent.join("\n"), colorize_1.Colors.red), "");
                    }
                    _this.eof();
                }
                else {
                    if (_this.method_call_count !== 0) {
                        _this.eof();
                    }
                    else {
                        _this.fs.unlinkSync(_this.fileNameToUnsync);
                    }
                }
            });
        }
        catch (err) {
            var code = err["code"];
            if (!code) {
                var message = err.message || "";
                this.reportErr((0, colorize_1.chalk)(message + "", colorize_1.Colors.red), ((_a = err.stack) === null || _a === void 0 ? void 0 : _a.split("\n").at(-2)) || "");
            }
        }
    };
    Type.prototype.validateVariableDeclaration = function (line_of_code) {
        var tokenized_code = line_of_code.split(" ");
        var letKeyword = /let/;
        var constKeyword = /const/;
        for (var i = 0; i < tokenized_code.length; i++) {
            var currentToken = tokenized_code[i];
            if (letKeyword.test(currentToken) || constKeyword.test(currentToken)) {
                return true;
            }
        }
        return false;
    };
    Type.prototype.fetchInstanceName = function (line_of_code) {
        try {
            var tokenized_code = line_of_code.split(" ");
            var i = 0;
            var len = tokenized_code.length;
            var constKeyword = /const/;
            var letKeyword = /let/;
            while (i < len) {
                var currentToken = tokenized_code[i];
                if (constKeyword.test(currentToken) || letKeyword.test(currentToken)) {
                    this.instance_name = tokenized_code[i + 1];
                    break;
                }
                i++;
            }
        }
        catch (err) {
            this.reportErr((0, colorize_1.chalk)("Internal Error", colorize_1.Colors.red), "");
        }
        finally {
        }
    };
    Type.prototype.reportErr = function (message, line) {
        console.clear();
        console.error((0, colorize_1.chalk)("\n\u2591\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2591\u2588\u2588\u2588\u2588\u2588\u2557\u2591\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557\u2591\u2588\u2588\u2588\u2588\u2588\u2557\u2591\u2591\u2591\u2591\u2591\u2591\u2588\u2588\u2557\u2591\u2588\u2588\u2588\u2588\u2588\u2588\u2557\n\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2591\u2591\u2591\u2591\u2591\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\n\u255A\u2588\u2588\u2588\u2588\u2588\u2557\u2591\u2591\u2591\u2591\u2588\u2588\u2551\u2591\u2591\u2591\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2591\u2591\u2591\u2588\u2588\u2551\u2591\u2591\u2591\u2588\u2588\u2551\u2588\u2588\u2551\u2591\u2591\u255A\u2550\u255D\u2591\u2591\u2591\u2591\u2591\u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2557\u2591\n\u2591\u255A\u2550\u2550\u2550\u2588\u2588\u2557\u2591\u2591\u2591\u2588\u2588\u2551\u2591\u2591\u2591\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2591\u2591\u2591\u2588\u2588\u2551\u2591\u2591\u2591\u2588\u2588\u2551\u2588\u2588\u2551\u2591\u2591\u2588\u2588\u2557\u2588\u2588\u2557\u2591\u2591\u2588\u2588\u2551\u2591\u255A\u2550\u2550\u2550\u2588\u2588\u2557\n\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2591\u2591\u2591\u2588\u2588\u2551\u2591\u2591\u2591\u2588\u2588\u2551\u2591\u2591\u2588\u2588\u2551\u2591\u2591\u2591\u2588\u2588\u2551\u2591\u2591\u2591\u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u255A\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\n\u255A\u2550\u2550\u2550\u2550\u2550\u255D\u2591\u2591\u2591\u2591\u255A\u2550\u255D\u2591\u2591\u2591\u255A\u2550\u255D\u2591\u2591\u255A\u2550\u255D\u2591\u2591\u2591\u255A\u2550\u255D\u2591\u2591\u2591\u255A\u2550\u255D\u2591\u255A\u2550\u2550\u2550\u2550\u255D\u2591\u2591\u255A\u2550\u2550\u2550\u2550\u255D\u2591\u255A\u2550\u2550\u2550\u2550\u2550\u255D\u2591", colorize_1.Colors.blue));
        console.error("".concat(message, "\n").concat((0, colorize_1.chalk)("LINE: " + line + "]", colorize_1.Colors.cyan)));
        console.trace();
        process.exit(1);
    };
    Type.prototype.force_exit_for_dev_purposes_only = function () {
        process.exit(1);
    };
    return Type;
}());
exports.Type = Type;
