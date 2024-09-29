export enum Colors {
  reset = "\x1b[0m",
  bold = "\x1b[1m",
  underline = "\x1b[4m",
  black = "\x1b[30m",
  red = "\x1b[31m",
  green = "\x1b[32m",
  yellow = "\x1b[33m",
  blue = "\x1b[34m",
  magenta = "\x1b[35m",
  cyan = "\x1b[36m",
  white = "\x1b[37m",
  bgBlack = "\x1b[40m",
  bgRed = "\x1b[41m",
  bgGreen = "\x1b[42m",
  bgYellow = "\x1b[43m",
  bgBlue = "\x1b[44m",
  bgMagenta = "\x1b[45m",
  bgCyan = "\x1b[46m",
  bgWhite = "\x1b[47m",
}

export function chalk(text: string, color: Colors) {
  return `${color}${text}${Colors["reset"]}`;
}

// Example usage
// console.log(colorize("Hello in red!", Colors.red));