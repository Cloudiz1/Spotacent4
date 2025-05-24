import ytdl from "@distube/ytdl-core"
import yts from "yt-search"
import fs from "fs"

import { PLAYLIST_PATH, INSTALLED_SONGS_PATH, Playlist } from "./types";

// ytdl("https://www.youtube.com/watch?v=NY__VTIUsiU").pipe(fs.createWriteStream("video.mp4"));

function getPlaylists(): Playlist[] {
    const playlistsStr = fs.readFileSync(PLAYLIST_PATH, "utf-8");
    const playlists: Playlist[] = JSON.parse(playlistsStr).playlists;
    return playlists
}

async function installSongs() {
    const playlists: Playlist[] = getPlaylists();

    let currentlyInstalledTracks = new Set();
    if (fs.existsSync(INSTALLED_SONGS_PATH)) {
        const data = fs.readFileSync(INSTALLED_SONGS_PATH, 'utf-8');
        currentlyInstalledTracks = new Set(data.split('\n'));
    }

    let newTrackNamesSet: Set<string> = new Set(); 
    for (const playlist of playlists) {
        for (const track of playlist.tracks) {
            const trackName = track.name + " by " + track.artists.join(" and ");
            const ytQuery = track.name + track.artists[0];

            if (!currentlyInstalledTracks.has(trackName)) {
                const res = await yts(ytQuery);
                const videos = res.videos.slice(0, 3);

                let mostViewed = videos[0];
                let mostViewedCount: number = videos[0].views;

                videos.forEach((v) => {
                    if (v.views > mostViewedCount) {
                        mostViewedCount = v.views;
                        mostViewed = v;
                    }
                    
                    // console.log( `${ v.views } | ${ v.title } (${ v.timestamp }) | ${ v.author.name }` );
                })

                console.log(mostViewed);
            }


            newTrackNamesSet.add(trackName);
        }
    }

    fs.writeFileSync(INSTALLED_SONGS_PATH, [...newTrackNamesSet].join('\n'));
}

export function test() {
    installSongs();
}