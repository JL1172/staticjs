export declare class Static {
    private path;
    private readonly fs;
    private readonly cp;
    private formatted_code;
    private variable_declarations;
    private variable_node;
    private newCode;
    private newCodePath;
    private aggregatedErrors;
    constructor(fileName: string);
    enableVars(): void;
    private validateFile;
    private removeComments;
    private findVariableDeclarations;
    private parseVariableDeclarations;
    private createCode;
    private removeImports;
    private writeNewCodeToFile;
    private executeNewCode;
    private reportAggregateErrors;
    private reportExecuteCodeError;
    private reportWriteFileError;
    private reportStaticTypingError;
    private reportFileReadError;
    private reportFileError;
    private reportConstructionError;
    private reportCreateCodeError;
    private force_quit_for_dev_purposed_only;
}
//# sourceMappingURL=index.d.ts.map