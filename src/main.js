import fs from "fs";
import SpotifyWebApi from "spotify-web-api-node";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const config = JSON.parse(fs.readFileSync("config.json"));

const spotifyApi = new SpotifyWebApi(config.spotify_creds);

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials(config.google_creds);

const youtubeAPI = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

const spotifyPlaylists = await getSpotifyPlaylists();

console.log("My Spotify Playlists:");
for (let i = 0; i < spotifyPlaylists.length; i++) {
  console.log(`  ${i}: ${spotifyPlaylists[i].name}`);
}

let selectedPlaylist = await readString("\nSelect playlist to transfer: ");

let tracks = await getSpotifyTracks(spotifyPlaylists, selectedPlaylist);
console.log("\nTracks:");
for (let i = 0; i < tracks.length; i++) {
  console.log(`  ${i}: ${tracks[i].track?.name || "N/a"}`);
}

// ------------ FUNCTIONS ------------

async function readString(str = "") {
  return new Promise((resolve) => {
    process.stdout.write(str);
    process.stdin.on("data", (data) => {
      process.stdin.pause(); // End stdin listening
      resolve(data.toString().trim());
    });
  });
}

async function getYoutubePlaylists() {
  let res = await youtubeAPI.playlists.list({
    part: "snippet",
    mine: true,
  });
  return res.data.items;
}

async function getSpotifyPlaylists() {
  return await spotifyApi.getUserPlaylists().then((data) => data.body.items);
}

async function getSpotifyTracks(spotifyPlaylists, index) {
  const PLAYLIST_ID = spotifyPlaylists[index].id;
  const TOTAL = spotifyPlaylists[index].tracks.total;
  const LIMIT = 100;
  let tracks = [];

  for (let i = 0; i < Math.ceil(TOTAL / LIMIT); i++) {
    const options = {
      offset: i * LIMIT,
      limit: LIMIT,
    };
    tracks.push(
      ...(await spotifyApi
        .getPlaylistTracks(PLAYLIST_ID, options)
        .then((data) => data.body.items))
    );
  }

  return tracks;
}
