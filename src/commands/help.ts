import { inputCommand, DEFINED_COMMANDS } from "../types/index"

function printHelp(commandName: string): void {
    const currentCommandInfo = DEFINED_COMMANDS.get(commandName);
    let printedSyntax: string = "";
    if (currentCommandInfo.syntax !== undefined) printedSyntax = "\n syntax: " + currentCommandInfo.syntax.join("; "); 
    console.log(`${commandName}: ${currentCommandInfo.description} ${printedSyntax}`);
}

export function help(command: inputCommand): void {
    if (command.args.length == 0) { // help
        for (const commandName of DEFINED_COMMANDS.keys()) {
            printHelp(commandName);
            console.log("");
        }
        
        return;
    }

    if (command.args[0] == "settings") { // help settings
        // TODO: when settings are implemented this command should list all settings and their allowed values.
        // TODO: help <settingName> should also be valid syntax.
    } else { // help <commandName>
        const lookupCommand: string = command.args[0];
        if (!DEFINED_COMMANDS.has(lookupCommand)) {
            console.log("Could not find command: " + lookupCommand);
            return;
        }

        printHelp(lookupCommand);
    }
}