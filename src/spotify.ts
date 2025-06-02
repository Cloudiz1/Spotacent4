import express from "express";
import crypto from "crypto";
import fs from "node:fs";

import {Playlist, PLAYLIST_PATH} from "./types"

import * as dotenv from 'dotenv';
dotenv.config();

var app = express();
const port = 6931;

if (!process.env.CLIENT_ID) {
    throw Error("CLIENT_ID is not defined in .env");
}

const clientId: string = process.env.CLIENT_ID;
const redirectUri: string = `http://127.0.0.1:${port}/callback`;

function generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function hash(codeVerifier: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    return crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

async function verify() {
    const codeVerifier = generateRandomString(128);
    const hashed = await hash(codeVerifier);
    const codeChallenge = base64encode(hashed);
    // console.log(codeChallenger);

    const scope = "playlist-read-private playlist-read-collaborative";
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("redirect_uri", redirectUri);

    // authUrl.search = new URLSearchParams(params).toString();
    const open = (await import('open')).default;
    await open(authUrl.toString());

    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            console.log(`Please authorize in your web browser. If the auth page does not appear, navigate here: ${authUrl.toString()}`);
        })
    
        app.get("/callback", async (req, res) => {
            const code = req.query.code;
            const url = "https://accounts.spotify.com/api/token";
    
            if (typeof code === "string" && code != undefined) {
                const tokenRes = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: clientId,
                        grant_type: "authorization_code",
                        code: code,
                        redirect_uri: redirectUri,
                        code_verifier: codeVerifier,
                    }),
                });
    
                const tokenJson = await tokenRes.json();
                const accessToken = tokenJson.access_token;
    
                if (!accessToken) {
                    res.send("Failed to authenticate");
                    return;
                }
    
                res.send("Authentication complete. You can close this tab.");
                server.close();
    
                resolve(accessToken);
            } else {
                reject("Could not find code.");
                res.send("Authorization failed.");
                server.close();
            }
        });
    })
}

async function getPlaylists() {
    const playlistArray = [];
    const accessToken = await verify();
    const playlistRes = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const playlists = await playlistRes.json();
    for (const playlist of playlists.items) {
        let playlistObj: Playlist = {name: playlist.name, tracks: []}

        const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const tracks = await tracksRes.json();

        for (let track of tracks.items) {
            let artists = [];
            
            for (const artist of track.track.artists) {
                artists.push(artist.name);
            }

            playlistObj.tracks.push({name: track.track.name, artists: artists, duration: track.track.duration_ms});
        }

        playlistArray.push(playlistObj);
    }

    return playlistArray;
}

export async function updatePlaylists() {
    const playlists = await getPlaylists();
    fs.writeFileSync(PLAYLIST_PATH, JSON.stringify({playlists}, null, "\t"));
}

// updatePlaylists();