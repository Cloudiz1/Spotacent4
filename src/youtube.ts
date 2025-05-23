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

    const data = fs.readFileSync(INSTALLED_SONGS_PATH, 'utf-8');
    const currentlyInstalledTracks = new Set(data.split('\n'));

    let newTrackNamesSet: Set<string> = new Set(); 
    for (const playlist of playlists) {
        for (const track of playlist.tracks) {
            const trackName = track.name + " by " + track.artists.join(" and ");
            const ytQuery = track.name + track.artists.join(" ");

            if (!currentlyInstalledTracks.has(trackName)) {
                const res = await yts(ytQuery);
                const videos = res.videos.slice(0, 5);
                videos.forEach((v) => {
                    console.log( `${ v.views } | ${ v.title } (${ v.timestamp }) | ${ v.author.name }` );
                })
            }

            newTrackNamesSet.add(trackName);
        }
    }

    fs.writeFileSync(INSTALLED_SONGS_PATH, [...newTrackNamesSet].join('\n'));
}

export function test() {
    installSongs();
}