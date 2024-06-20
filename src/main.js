import { fail } from "assert";
import fs from "fs";

const ACCESS_TOKEN = JSON.parse(fs.readFileSync("config.json")).accessToken;

let playlists = await getPlaylists();

console.log("My Playlists:");
for (let i = 0; i < playlists.length; i++) {
  console.log(`  ${i}: ${playlists[i].name}`);
}

let tracks = await getTracks(playlists, 8);
console.log("\nTracks:");
for (let i = 0; i < tracks.length; i++) {
  console.log(`  ${i}: ${tracks[i].track.name}`);
}

// ------------ FUNCTIONS ------------

async function getPlaylists() {
  let requestParameters = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  };
  let playlists = await fetch(
    "https://api.spotify.com/v1/me/playlists",
    requestParameters
  ).then((res) => res.json());
  return playlists.items;
}

async function getTracks(playlists, index) {
  let uri = playlists[index].tracks.href;
  uri += "?limit=100";
  let requestParameters = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  };
  let tracks = await fetch(uri, requestParameters).then((res) => res.json());
  return tracks.items;
}
