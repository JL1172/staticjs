export declare enum Colors {
    reset = "\u001B[0m",
    bold = "\u001B[1m",
    underline = "\u001B[4m",
    black = "\u001B[30m",
    red = "\u001B[31m",
    green = "\u001B[32m",
    yellow = "\u001B[33m",
    blue = "\u001B[34m",
    magenta = "\u001B[35m",
    cyan = "\u001B[36m",
    white = "\u001B[37m",
    bgBlack = "\u001B[40m",
    bgRed = "\u001B[41m",
    bgGreen = "\u001B[42m",
    bgYellow = "\u001B[43m",
    bgBlue = "\u001B[44m",
    bgMagenta = "\u001B[45m",
    bgCyan = "\u001B[46m",
    bgWhite = "\u001B[47m"
}
export declare function chalk(text: string, color: Colors): string;
//# sourceMappingURL=colorize.d.ts.map