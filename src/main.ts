import express from "express";
import crypto from "crypto";
// import ytdl from "@distube/ytdl-core"
// import fs from "fs"

// ytdl("https://www.youtube.com/watch?v=NY__VTIUsiU").pipe(fs.createWriteStream("video.mp4"));

var app = express();
const port = 6931;

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

    const scope = "playlist-read-private";
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("redirect_uri", `http://127.0.0.1:${port}/callback`);

    // authUrl.search = new URLSearchParams(params).toString();
    const open = (await import('open')).default;
    await open(authUrl.toString());
    console.log("Generated Auth URL:", authUrl.toString());
    
    app.get("/callback", async (req, res) => {
        const code = req.query.code;
    })
}

verify();