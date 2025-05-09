const axios = require("axios");
const fs = require("fs");
const path = require("path");

const cache = new Map();

async function getUUID(username) {
  try {
    if (cache.has(username)) {
      const data = cache.get(username);

      if (data.last_save + 43200000 > Date.now()) {
        return data.id;
      }
    }

    const { data } = await axios.get(`https://mowojang.matdoes.dev/${username}`);

    if (data.errorMessage || data.id === undefined) {
      throw data.errorMessage ?? "Invalid username.";
    }

    cache.set(username, {
      last_save: Date.now(),
      id: data.id,
    });

    return data.id;
  } catch (error) {
    // eslint-disable-next-line no-throw-literal
    if (error.response.data === "Not found") throw "Invalid username.";
    console.log(error);
    throw error;
  }
}

async function getUsername(uuid) {
  try {
    const usernameCache= path.join(__dirname, '..', '..', 'database/usernamecache.json');
    let cache = JSON.parse(fs.readFileSync(usernameCache));

    const user = cache.find((data) => data.uuid === uuid);
    if (user !== undefined && user.last_save + 43200000 > Date.now()) {
      return user.username;
    }

    const { data } = await axios.get(`https://mowojang.matdoes.dev/${uuid}`);
    cache = cache.filter((data) => data.id !== uuid);
    cache.push({
      username: data.name,
      uuid: data.id,
      last_save: Date.now(),
    });

    fs.writeFileSync(usernameCache, JSON.stringify(cache));

    console.log(`Cached username for ${data.name} (${uuid})`);

    return data.name;
  } catch (error) {
    // eslint-disable-next-line no-throw-literal
    console.log(error);
  }
}

async function resolveUsernameOrUUID(username) {
  try {
    const { data } = await axios.get(`https://mowojang.matdoes.dev/${username}`);

    return {
      username: data.name,
      uuid: data.id,
    };
  } catch (error) {
    // eslint-disable-next-line no-throw-literal
    if (error.response.data === "Not found") throw "Invalid Username Or UUID.";
    console.log(error);
    throw error;
  }
}

module.exports = { 
  getUUID,
  getUsername, 
  resolveUsernameOrUUID 
};