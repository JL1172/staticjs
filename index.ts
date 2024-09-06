export interface TypeOptions {
  func: (
    nameOfFunction: string,
    functionReturnTypes: string[]
  ) => Promise<void>;
  variable: (value: any, valueType: string) => void;
  reportErr: (message: string, line: string) => void;
}

export class Type implements TypeOptions {
  public async func(
    nameOfFunction: string,
    functionReturnTypes: string[]
  ): Promise<void> {
    try {
    } catch (err) {}
  }
  public variable(value: any, valueType: string): void {
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
            `Static Typing Error: Expected input for valueType argument should be one of the following: \n[string, number, bigint, object, function, boolean, undefined, null]\n actual type: [${valueType}]`
          );
      }
      if (typeof value !== valueType) {
        throw new Error(
          `Static Typing Error: expected type [${valueType}], received [${typeof value}]`
        );
      }
    } catch (err) {
      const line = (err as Error).stack?.split("\n")[2] || "";
      this.reportErr((err as Error).message + "", line);
    }
  }
  public reportErr(message: string, line: string): void {
    console.error(`${message}\nLINE: [${line}]`);
    process.exit(1);
  }
}
