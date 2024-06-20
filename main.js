import { promises as fs } from "fs";

// load config file
let config;
await fs.readFile("config.json").then((res) => {
  config = JSON.parse(res);
});
