/* const WebSocket = require('ws');
const axios = require('axios');
const config = require('../../../config.json');

// Replace with your Pterodactyl panel URL and server ID
const panelUrl = 'https://admin.allthemodiumcraft.com';
const serverId = '18d45ed9-28b8-40a8-9a8a-7e064cd23ffa';

let ws;
let token;
let consoleOutput = [];
let serverStats = {};
let isConnecting = false;

async function initializeWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('WebSocket connection already established.');
    return;
  }

  if (isConnecting) {
    console.log('WebSocket connection is already being established.');
    return;
  }

  isConnecting = true;

  try {
    // Fetch the WebSocket token
    const response = await axios.get(`${panelUrl}/api/client/servers/${serverId}/websocket`, {
      headers: {
        'Authorization': `Bearer ${config.api.pterodactyl_client_api_key}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    token = response.data.data.token;
    const socketUrl = `${response.data.data.socket}?token=${token}`;

    ws = new WebSocket(socketUrl);

    ws.on('open', () => {
      console.log('WebSocket connection established.');
      authenticateWebSocket();
      isConnecting = false;
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      handleWebSocketMessage(message);
    });

    ws.on('close', (code, reason) => {
      console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
      isConnecting = false;
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      isConnecting = false;
    });
  } catch (error) {
    console.error('Error fetching WebSocket token:', error.response ? error.response.data : error.message);
    isConnecting = false;
  }
}

function authenticateWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      event: 'auth',
      args: [token]
    }));
  } else {
    console.error('WebSocket is not open. ReadyState:', ws ? ws.readyState : 'undefined');
  }
}

function handleWebSocketMessage(message) {
  switch (message.event) {
    case 'auth success':
      console.log('WebSocket authentication successful.');
      break;
    case 'token expiring':
      console.log('WebSocket token expiring. Fetching new token...');
      initializeWebSocket();
      break;
    case 'token expired':
      console.log('WebSocket token expired. Fetching new token...');
      initializeWebSocket();
      break;
    case 'console output':
      const formattedMessage = formatConsoleOutput(message.args[0]);
      consoleOutput.push(formattedMessage);
      if (consoleOutput.length > 10) {
        consoleOutput.shift(); // Keep only the last 10 lines
      }
      console.log('Console output:', formattedMessage);
      break;
    case 'stats':
      serverStats = JSON.parse(message.args[0]);
      break;
    default:
      // Uncomment the following line if you want to log other messages
      // console.log('Received message:', message);
      break;
  }
}

function formatConsoleOutput(output) {
  // Remove ANSI escape codes
  output = output.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  // Remove everything after the first } and before the :
  output = output.replace(/}\s*.*?:/, '}');
  // Remove leading and trailing whitespace
  return output.trim();
}

// Function to send console commands
function sendConsoleCommand(command) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      event: 'send command',
      args: [command]
    }));
  } else {
    console.error('WebSocket is not open. ReadyState:', ws ? ws.readyState : 'undefined');
  }
}

// Function to get the last 10 lines of console output
function getLastConsoleOutput() {
  return consoleOutput.join('\n');
}

// Function to get the server stats
function getServerStats() {
  return serverStats;
}

// Initialize WebSocket connection
initializeWebSocket();

module.exports = {
  sendConsoleCommand,
  getLastConsoleOutput,
  getServerStats,
  initializeWebSocket
};
*/