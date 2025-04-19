const axios = require('axios');
const config = require('../../../config.json'); 

function getServerId(serverName) {
    const serverId = config.pterodactyl.servers[serverName];
    if (!serverId) {
        throw new Error(`Server ID for '${serverName}' not found.`);
    }
    return serverId;
}

function createAxiosInstance(serverName) {
    const serverId = getServerId(serverName); 
    const { url, client_api_key: apiKey } = config.pterodactyl;

    return axios.create({
        baseURL: `${url}/api/client/servers/${serverId}`,
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

function handleAxiosError(error) {
    if (error.response) {
        console.error('Error:', error.response.data);
    } else {
        console.error('Error:', error.message);
    }
}

// Sends a console command to the server
async function sendConsoleCommand(serverName, command) {
    const axiosInstance = createAxiosInstance(serverName);

    try {
        const response = await axiosInstance.post('/command', { command });
        console.log(`Command sent successfully to ${serverName}:`, response.data);
    } catch (error) {
        handleAxiosError(error);
    }
}

// Gets the server's power state
async function getServerPowerState(serverName) {
    const axiosInstance = createAxiosInstance(serverName);

    try {
        const response = await axiosInstance.get('/resources');
        const powerState = response.data.attributes.current_state;
        console.log(`Server power state for ${serverName}:`, powerState);
        return powerState;
    } catch (error) {
        handleAxiosError(error);
    }
}

// Sends a power action (start, stop, restart, kill)
async function sendPowerAction(serverName, action) {
    const VALID_POWER_ACTIONS = ['start', 'stop', 'restart', 'kill'];
    if (!VALID_POWER_ACTIONS.includes(action)) {
        console.error(`Invalid power action: ${action}`);
        return;
    }

    const axiosInstance = createAxiosInstance(serverName);

    try {
        const response = await axiosInstance.post('/power', { signal: action });
        console.log(`Power action '${action}' sent successfully to ${serverName}:`, response.data);
    } catch (error) {
        handleAxiosError(error);
    }
}

module.exports = {
    sendConsoleCommand,
    getServerPowerState,
    sendPowerAction,
};