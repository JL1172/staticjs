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
var colorize_1 = require("../lib/colorize");
//! all errors are self contained to avoid weird error and bug propagation
var Type = /** @class */ (function () {
    function Type(fileName) {
        this.fs = fs;
        this.instance_name = "";
        this.var = "";
        if (!fileName) {
            this.reportErr((0, colorize_1.chalk)("Instance of [Type Class] must be instantiated with node's built in __filename variable passed as argument.", colorize_1.Colors.bgRed), "");
        }
        this.path = fileName;
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
        return __awaiter(this, void 0, void 0, function () {
            var value, err_1, line;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
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
                        return [4 /*yield*/, this.findLastInstanceOfVariable()];
                    case 1:
                        value = _b.sent();
                        // let value = "";
                        if (typeof value !== valueType) {
                            throw new Error("Static Typing Error: expected type [".concat(valueType, "], received [").concat(typeof value, "]"));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _b.sent();
                        line = ((_a = err_1.stack) === null || _a === void 0 ? void 0 : _a.split("\n")[2]) || "";
                        this.reportErr((0, colorize_1.chalk)(err_1.message + "", colorize_1.Colors.red), line);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Type.prototype.findLastInstanceOfVariable = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var data, formattedData, class_instantiation_pattern, i, method_declaration_pattern, i, var_name_pattern, i, err_2, message;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.fs.readFile(_this.path, { encoding: "utf-8" }, function (err, data) {
                                    if (err) {
                                        reject("Trouble parsing path. Ensure instance of [Type Class] is instantiated with node's built in __filename variable passed as argument.");
                                    }
                                    else {
                                        resolve(data);
                                    }
                                });
                            })];
                    case 1:
                        data = _b.sent();
                        formattedData = String(data)
                            .split("\n")
                            .filter(function (n) { return n; });
                        class_instantiation_pattern = /new Type/;
                        //loop over to find name of instance
                        for (i = 0; i < formattedData.length; i++) {
                            if (class_instantiation_pattern.test(formattedData[i])) {
                                this.fetchInstanceName(formattedData[i]);
                                break;
                            }
                        }
                        if (!this.instance_name) {
                            throw new Error("Ensure instance of [Type Class] is instantiated with node's built in __filename variable passed as argument.");
                        }
                        method_declaration_pattern = /type.variable/;
                        for (i = 0; i < formattedData.length; i++) {
                            if (method_declaration_pattern.test(formattedData[i])) {
                                this.var = formattedData[i + 1];
                                break;
                            }
                        }
                        if (!this.var) {
                            throw new Error("Ensure variable is immediately following this method declaration to properly apply static typing. Example: \n" +
                                "\n" +
                                (0, colorize_1.chalk)('instance.variable("number")\n' + "const myVar = 2;", colorize_1.Colors.white) +
                                "\n");
                        }
                        var_name_pattern = new RegExp(this.var);
                        for (i = 0; i < formattedData.length; i++) {
                            if (var_name_pattern.test(formattedData[i])) {
                                this.var = formattedData[i];
                            }
                        }
                        console.log(this.var);
                        return [2 /*return*/, data];
                    case 2:
                        err_2 = _b.sent();
                        message = err_2.message || err_2;
                        this.reportErr((0, colorize_1.chalk)(message + "", colorize_1.Colors.red), ((_a = err_2.stack) === null || _a === void 0 ? void 0 : _a.split("\n").at(-2)) || "");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
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
    };
    Type.prototype.reportErr = function (message, line) {
        console.error("".concat(message, "\n").concat((0, colorize_1.chalk)("LINE: " + line + "]", colorize_1.Colors.cyan)));
        process.exit(1);
    };
    Type.prototype.force_exit_for_dev_purposes_only = function () {
        process.exit(1);
    };
    return Type;
}());
exports.Type = Type;
