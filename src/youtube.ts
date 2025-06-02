import ytdl from "@distube/ytdl-core"
import yts from "yt-search"
import fs from "fs"

import { clear } from "./commands/index"

import { PLAYLIST_PATH, SONGS_DIR, Playlist, Track} from "./types";


function getPlaylists(): Playlist[] {
    const playlistsStr = fs.readFileSync(PLAYLIST_PATH, "utf-8");
    const playlists: Playlist[] = JSON.parse(playlistsStr).playlists;
    return playlists
}

function trackToPathName(track: Track): string {
    let trackName = track.name + " by " + track.artists.join(" and ");
    const specialCharacterPrefix = ";&#";
    ["\\", "/", "*", "?", "\"", "<", ">", "|", ":"].forEach((substr: string, i: number) => {
        trackName = trackName.replaceAll(substr, specialCharacterPrefix + i.toString());
    });

    return trackName;
}

// TODO: lowkey needs more error handling, but it does work
// TODO: lowkey this function is going to make me go fucking insane
export async function installSongs() {
    const fileExtension = ".wav";
    const playlists: Playlist[] = getPlaylists();

    const tracks = fs.readdirSync(SONGS_DIR);
    let InstalledTracks = new Set(tracks);

    for (const playlist of playlists) {
        for (const track of playlist.tracks) {
            const trackName = trackToPathName(track);
            const ytQuery = track.name + " " + track.artists[0];

            if (!InstalledTracks.has(trackName + fileExtension) && !InstalledTracks.has(trackName + ".tmp")) { // handle incorrectly installed songs at the end, the extra case is to not download the same song twice because they are queried before it has a chance to become a .wav
                let res;
                try {
                    // stops rate limiting LOL
                    const sleep = (waitTimeInMs: number) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
                    await sleep(2000);
                    res = await yts(ytQuery);
                } catch (err) {
                    console.log(err);
                    return;
                }
                
                if (res === undefined) {
                    console.log("a");
                    continue;
                }

                const videos = res.videos.slice(0, 3);

                let mostViewed = videos[0];
                let mostViewedCount: number = videos[0].views;

                videos.forEach((v) => {
                    if (v.views > mostViewedCount) {
                        mostViewedCount = v.views;
                        mostViewed = v;
                    }
                })

                const fileStream = fs.createWriteStream(SONGS_DIR + trackName + ".tmp");
                const video = ytdl(mostViewed.url, {filter: "audioonly"});
                video.pipe(fileStream); 

                fileStream.on("finish", () => {
                    InstalledTracks.add(trackName);
                    fs.rename(SONGS_DIR + trackName + ".tmp", SONGS_DIR + trackName + fileExtension, (err) => {
                        if (err) console.log(err);
                    });
                    console.log("Downloaded " + track.name);
                })
            }
        }
    }
}