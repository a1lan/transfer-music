import express from "express";
import dotenv from "dotenv";
import querystring from "querystring";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Spotify credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Route to display the authorization link
app.get("/", (req, res) => {
  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: "playlist-read-private",
      redirect_uri: REDIRECT_URI,
    });

  res.send(`<a href="${authUrl}">Authorize Spotify</a>`);
});

// Callback route to handle the response from Spotify
app.get("/callback", (req, res) => {
  const code = req.query.code || null;

  if (code) {
    res.send("Authorisation Complete");
    server.close();
    getAccessToken(code).then((token) => {
      const config = {
        accessToken: token,
      };
      const configJSON = JSON.stringify(config, null, 2);
      fs.writeFileSync("config.json", configJSON);
    });
  } else {
    res.send("Authorisation Failed");
  }
});

let server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

async function getAccessToken(code) {
  let authParameters = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
  };

  const accessToken = await fetch(
    "https://accounts.spotify.com/api/token",
    authParameters
  )
    .then((res) => res.json())
    .then((data) => {
      return data.access_token;
    });

  return accessToken;
}