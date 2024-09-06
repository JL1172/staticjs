export interface TypeOptions {
  func: (
    nameOfFunction: string,
    functionReturnTypes: string[]
  ) => Promise<void>;
  variable: (varName: string, value: any, valueType: string) => void;
  reportErr: (message: string) => void;
}

export class Type implements TypeOptions {
  public async func(
    nameOfFunction: string,
    functionReturnTypes: string[]
  ): Promise<void> {
    try {
    } catch (err) {}
  }
  public variable(varName: string, value: any, valueType: string): void {
    try {
      switch (valueType) {
        case "string":break;
        case "number": break;
        case "bigint": break;
        case "object": break;
        case "function": break;
        case "boolean": break;
        case "undefined": break;
        case "null": break;
        default:
          throw new TypeError(
            `Static Error: Expected input for valueType argument should be one of the following: \n[string, number, bigint, object, function, boolean, undefined, null]\n actual type: [${valueType}]`
          );
      }
    } catch (err) {
      this.reportErr((err as TypeError).message + "");
    }
  }
  public reportErr(message: string): void {
    console.error(message);
    process.exit(1);
  }
}
