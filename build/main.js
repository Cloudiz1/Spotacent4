"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
// import ytdl from "@distube/ytdl-core"
// import fs from "fs"
// ytdl("https://www.youtube.com/watch?v=NY__VTIUsiU").pipe(fs.createWriteStream("video.mp4"));
var app = (0, express_1.default)();
const port = 6931;
const clientId = "8a36e722ad044b35ae604882bc3f5bcf";
const redirectUri = `http://127.0.0.1:${port}/callback`;
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto_1.default.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}
async function hash(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    return crypto_1.default.subtle.digest('SHA-256', data);
}
function base64encode(input) {
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
    const scope = "playlist-read-private";
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
            // const playlistsRes = await fetch("https://api.spotify.com/v1/me/playlists", {
            //     headers: { Authorization: `Bearer ${accessToken}` },
            // });
            // const playlists = await playlistsRes.json();
            res.send("Authentication complete. You can close this tab.");
            server.close();
            return accessToken;
        }
    });
    const server = app.listen(port, () => {
        console.log("waiting for spotify redirect");
    });
}
function getPlaylists() {
    verify()
        .then((accessToken) => {
        console.log(accessToken);
    });
}
getPlaylists();
