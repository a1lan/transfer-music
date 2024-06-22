import fs from "fs";
import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi(
  JSON.parse(fs.readFileSync("config.json")).spotify_creds
);

let spotifyPlaylists = await getSpotifyPlaylists();

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
