import { InputCommand, COMMANDS_DATA_PATH, DEFINED_COMMANDS, CommandDescription } from "./types";
import fs from "node:fs";

import * as commands from "./commands/index"

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

export class Console {
    // private definedCommands: Array<DefinedCommand>;
    // private definedCommandNames: Set<string>;

    constructor() {
        this.getInput();
    }

    getInput() {
        readline.question("> ", (res: string) => {
            this.processInput(res);
            this.getInput();
        });
    }

    processInput(input: string): void {
        const commandInput = input.trim().split(" ");
        const name = commandInput.shift();
        
        if (!name) return; // empty

        let command: InputCommand = {name: name, args: commandInput};

        if (!this.doesCommandExist(command)) {
            console.log("Command not found");
            return;
        }

        this.run(command);
    }

    doesCommandExist(command: InputCommand): boolean {
        const expectedCommand = DEFINED_COMMANDS.find(
            (definedCommand: CommandDescription) => definedCommand.name === command.name
        );

        if (expectedCommand === undefined) return false;

        return true;
    }

    run(command: InputCommand) {
        switch(command.name) {
            case "exit": commands.exit(command); // allegedly done
            case "get": commands.get(command);
            case "help": commands.help(command);
            case "pause": commands.pause(command);
            case "play": commands.play(command);
            case "resume": commands.resume(command);
            case "set": commands.set(command);
            case "stop": commands.stop(command);
        }
    }
}