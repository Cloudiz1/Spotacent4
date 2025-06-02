import * as youtube from "../youtube"
import * as spotify from "../spotify"

import { programConsole } from "../main";

export async function sync() {    
    await spotify.updatePlaylists();
    await youtube.installSongs();

    programConsole.getInput();
}