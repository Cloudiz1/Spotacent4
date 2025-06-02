// okay its not really a terminal but console is already a namespace cause js is really fucking lame

import { inputCommand, DEFINED_COMMANDS} from "./types";
import * as commands from "./commands/index"

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

export class Terminal {
    runningAsync: boolean;

    constructor() {
        this.runningAsync = false;

        console.log('Run "sync" to get started or "help" for a list of commands');
        this.getInput();
    }

    getInput() {
        readline.question("> ", (res: string) => {
            this.processInput(res);

            if (!this.runningAsync) {
                this.getInput();
            }
        });
    }

    processInput(input: string): void {
        const commandInput = input.trim().split(" ");
        const name = commandInput.shift();
        
        if (!name) return; // empty

        let command: inputCommand = {name: name, args: commandInput};

        if (!this.doesCommandExist(command)) {
            console.log("Could not find command: " + command.name);
            return;
        }

        this.run(command);
    }

    doesCommandExist(command: inputCommand): boolean {
        const expectedCommand = DEFINED_COMMANDS.get(command.name);
        if (expectedCommand === undefined) return false;

        return true;
    }

    run(command: inputCommand) {
        switch(command.name) {
            case "clear": { // done
                commands.clear();
                break;
            }

            case "exit": { // done
                commands.exit();
                break;
            }

            case "get": {
                commands.get(command);
                break;
            }
            
            case "help": { // done
                commands.help(command);
                break;
            }

            case "pause": {
                commands.pause(command);
                break;
            }
            case "play": {
                commands.play(command);
                break;
            }

            case "resume": {
                commands.resume(command);
                break;
            }

            case "set": {
                commands.set(command);
                break;
            }

            case "stop": {
                commands.stop(command);
                break;
            }

            case "sync": {
                commands.sync();
                this.runningAsync = true;
                break;
            }
        }
    }
}