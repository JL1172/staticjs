import * as fs from "fs";

function main(): void { 
    try {
    const todoList: string[] = [];
    const path: string
     = process.argv[process.argv.length - 1];
    const data: string[]
     = fs.readFileSync(path, {encoding: 'utf-8'}).split("\n").filter(n => n);
    
    const dataLen: number = data.length;
    for (let i: number = 0; i < dataLen; i++) {
        const currLineOfCode: string = data[i];
        if (/\s*\/\/[!?]?\s?.*/.test(currLineOfCode)) {
            todoList.push(currLineOfCode);
        }
    }
    
    const codeToWriteToFile: string = todoList.join("\n");
    const fileName: string = process.cwd() + '/src.proto/docs/todo.md';
    fs.writeFileSync(fileName, codeToWriteToFile);
    } catch (err) {
        console.log(err);
    }
}

main();