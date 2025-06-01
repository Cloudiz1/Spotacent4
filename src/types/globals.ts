import * as fs from "node:fs";

export const PLAYLIST_PATH = "data/playlists.json";
export const SONGS_DIR = "data/songs/";
export const COMMANDS_DATA_PATH = "data/definedCommands.json"

const data = fs.readFileSync(COMMANDS_DATA_PATH);
export const DEFINED_COMMANDS = JSON.parse(data.toString()).commands;