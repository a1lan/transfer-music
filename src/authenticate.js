import { configDotenv } from "dotenv";
import express from "express";
import fs from "fs";
import SpotifyWebApi from "spotify-web-api-node";

configDotenv();
const app = express();
const port = 3000;

const AUTH_REQUIRED = 2;
let authed = new Set();
let config = {};

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

app.use(express.static("../data"));

// Redirect the user to the Spotify authorisation page
app.get("/spotify", (req, res) => {
  const scopes = ["playlist-read-private"];
  const spotifyAuthURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(spotifyAuthURL);
});

app.get("/youtube", (req, res) => {
  tokenReceived("google", res);
});

// Handle the callback from Spotify
app.get("/callback", (req, res) => {
  const code = req.query.code || null;

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);

      config["spotify_creds"] = spotifyApi.getCredentials();
      tokenReceived("spotify", res);
    })
    .catch((err) => {
      console.error("Error getting Spotify Tokens:", err);
    });
});

app.get('/api/token-status', (req, res) => {
  res.json({
      authedSet: [...authed]
  });
});

function tokenReceived(provider, res) {
  if (provider === "spotify" || provider === "google") {
    authed.add(provider);
  }

  if (authed.size === AUTH_REQUIRED) {
    server.close();
    const configJSON = JSON.stringify(config, null, 2);
    fs.writeFileSync("config.json", configJSON);
  }
  res.redirect(`http://localhost:${port}`);
}

let server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
