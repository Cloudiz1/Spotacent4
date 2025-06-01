import { InputCommand } from "../types/index"

export function exit(command: InputCommand) {
    // maybe other closing stuff
    process.exit();
}