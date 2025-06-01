import * as fs from "node:fs";
import { commandDescription } from "./command";

export const PLAYLIST_PATH = "data/playlists.json";
export const SONGS_DIR = "data/songs/";
export const COMMANDS_DATA_PATH = "data/definedCommands.json"

// const data = fs.readFileSync(COMMANDS_DATA_PATH);
// export const DEFINED_COMMANDS = JSON.parse(data.toString()).commands;

const data = fs.readFileSync(COMMANDS_DATA_PATH);
const definedCommands = JSON.parse(data.toString()).commands;

export let DEFINED_COMMANDS = new Map();
definedCommands.forEach((command: commandDescription) => {
    DEFINED_COMMANDS.set(command.name, { description: command.description, syntax: command.syntax });
});