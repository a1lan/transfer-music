import fs from 'fs'

const ACCESS_TOKEN = JSON.parse(fs.readFileSync("config.json")).accessToken;

let playlists = await getPlaylists();
console.log(playlists);

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
  )
    .then((res) => res.json());
  return playlists;
}
