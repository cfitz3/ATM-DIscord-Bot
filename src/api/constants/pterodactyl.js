const axios = require('axios');
const config = require('../../../config.json');

// Replace with your Pterodactyl panel URL and server ID
const panelUrl = 'https://admin.allthemodiumcraft.com';
const serverId = '34c283b6-a7bd-4187-9b93-585c3d44323e';

// Function to send a console command to the server
async function sendConsoleCommand(command) {
  try {
    const response = await axios.post(
      `${panelUrl}/api/client/servers/${serverId}/command`,
      { command },
      {
        headers: {
          'Authorization': `Bearer ${config.api.pterodactyl_client_api_key}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Command sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending console command:', error.response ? error.response.data : error.message);
  }
}

// Function to get the server's power state
async function getServerPowerState() {
  try {
    const response = await axios.get(`${panelUrl}/api/client/servers/${serverId}/resources`, {
      headers: {
        'Authorization': `Bearer ${config.api.pterodactyl_client_api_key}`,
        'Accept': 'application/json',
      },
    });
    const powerState = response.data.attributes.current_state;
    console.log('Server power state:', powerState);
    return powerState;
  } catch (error) {
    console.error('Error fetching server power state:', error.response ? error.response.data : error.message);
  }
}

// Function to send a power action (start, stop, restart, kill)
async function sendPowerAction(action) {
  try {
    const response = await axios.post(
      `${panelUrl}/api/client/servers/${serverId}/power`,
      { signal: action },
      {
        headers: {
          'Authorization': `Bearer ${config.api.pterodactyl_client_api_key}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`Power action '${action}' sent successfully:`, response.data);
  } catch (error) {
    console.error(`Error sending power action '${action}':`, error.response ? error.response.data : error.message);
  }
}

// Function to get the server's console output (last 10 lines)
async function getConsoleOutput() {
  try {
    const response = await axios.get(`${panelUrl}/api/client/servers/${serverId}/resources`, {
      headers: {
        'Authorization': `Bearer ${config.api.pterodactyl_client_api_key}`,
        'Accept': 'application/json',
      },
    });
    const consoleOutput = response.data.attributes.logs;
    console.log('Console output:', consoleOutput);
    return consoleOutput;
  } catch (error) {
    console.error('Error fetching console output:', error.response ? error.response.data : error.message);
  }
}

module.exports = {
  sendConsoleCommand,
  getServerPowerState,
  sendPowerAction,
  getConsoleOutput,
};