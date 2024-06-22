import fs from "fs";

const ACCESS_TOKEN = JSON.parse(fs.readFileSync("config.json")).accessToken;

let playlists = await getPlaylists();

console.log("My Playlists:");
for (let i = 0; i < playlists.length; i++) {
  console.log(`  ${i}: ${playlists[i].name}`);
}

let selectedPlaylist = await readString("\nSelect playlist to transfer: ");

let tracks = await getTracks(playlists, selectedPlaylist);
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
  let total = playlists[index].tracks.total;
  const LIMIT = 100;
  uri += `?limit=${LIMIT}`;
  let requestParameters = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  };
  let tracks = [];
  for (let i = 0; i < Math.ceil(total / LIMIT); i++) {
    tracks.push(
      ...(
        await fetch(`${uri}&offset=${i * LIMIT}`, requestParameters).then(
          (res) => res.json()
        )
      ).items
    );
  }
  return tracks;
}
