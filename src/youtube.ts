import ytdl from "@distube/ytdl-core"
import yts from "yt-search"
import fs from "fs"

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

async function installSongs() {
    const fileExtension = ".wav";
    const playlists: Playlist[] = getPlaylists();

    const tracks = fs.readdirSync(SONGS_DIR);
    let InstalledTracks = new Set(tracks);

    for (const playlist of playlists) {
        for (const track of playlist.tracks) {
            const trackName = trackToPathName(track);
            const ytQuery = track.name + track.artists[0];

            if (!InstalledTracks.has(trackName + fileExtension)) {
                const res = await yts(ytQuery);
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

export function test() {
    installSongs();
}
