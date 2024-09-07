"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chalk = exports.Colors = void 0;
var Colors;
(function (Colors) {
    Colors["reset"] = "\u001B[0m";
    Colors["bold"] = "\u001B[1m";
    Colors["underline"] = "\u001B[4m";
    Colors["black"] = "\u001B[30m";
    Colors["red"] = "\u001B[31m";
    Colors["green"] = "\u001B[32m";
    Colors["yellow"] = "\u001B[33m";
    Colors["blue"] = "\u001B[34m";
    Colors["magenta"] = "\u001B[35m";
    Colors["cyan"] = "\u001B[36m";
    Colors["white"] = "\u001B[37m";
    Colors["bgBlack"] = "\u001B[40m";
    Colors["bgRed"] = "\u001B[41m";
    Colors["bgGreen"] = "\u001B[42m";
    Colors["bgYellow"] = "\u001B[43m";
    Colors["bgBlue"] = "\u001B[44m";
    Colors["bgMagenta"] = "\u001B[45m";
    Colors["bgCyan"] = "\u001B[46m";
    Colors["bgWhite"] = "\u001B[47m";
})(Colors || (exports.Colors = Colors = {}));
function chalk(text, color) {
    return "".concat(color).concat(text).concat(Colors["reset"]);
}
exports.chalk = chalk;
// Example usage
// console.log(colorize("Hello in red!", Colors.red));
