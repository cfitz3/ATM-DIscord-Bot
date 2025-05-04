# ATM Discord Bot

ATM Discord Bot is a private, feature-rich bot designed to enhance the AllTheModiumCraft (and partner) Discord servers with economy, moderation, and server management features. Below is a list of all available commands and their descriptions.

---

## **Features**
- **Economy System**: Earn XP and credits, view leaderboards, and manage your profile.
- **Shop System**: Purchase cosmetics and other items from the server shop.
- **Moderation Tools**: Admin commands to manage server settings and assist with moderation.
- **Developer Utilities**: Tools for recalculating levels and debugging.
- **Utility Commands**: Pterodactyl integration for economy system and administration.
- **Automatic Crash Analysis**: Making use of Perplexity's Sonar-Pro LLM and Uptime Kuma, automatically fetch latest crash report and provide a human-friendly readout via Discord webhook

---

## **Commands**

### **Economy Commands**
| Command       | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| `/balance`    | Check your wallet balance.
| `/profile`    | View your profile, including your XP, level, rank, and wallet balance.      |
| `/leaderboard`| Displays the top users by their XP and rank.                                |
| `/shop`       | View the items available in the server shop.                                |
| `/rank`       | View your current level and XP, or check another user's rank.               |}
| `/vote`       | Displays a list of vote sites to earn credits by voting for our servers.    |
| `/equip`      | Equip any purchased/earned cosmetic items on your profile                   |

---

### **Admin Commands**
| Command         | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `/addshopitem`  | Add an item to the server shop. Allows customization of name, price, type,  |
| and effects. 	                                                                                |
| `/viewsettings` | View the current guild-specific settings for the server.                    |
| `/modmenu`      | Sends a help embed for linking Discord accounts on Hypixel.                 |
| `/clearshop`    | Clears all items from the server shop.                                      |
| `/editshopitem` | Edit an existing item in the server shop. Allows updating name, price, type,| 
|  and effects.                                                                                 |

---

### **Developer Commands**
| Command         | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `/recalc`       | Recalculate user levels based on their XP. Ensures levels are accurate and fixes negative levels. |
| `/debug`        | Provides debugging information about the bot's current state.              |

---

### **Utility Commands**
| Command         | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `/help`         | Displays a list of available commands and their descriptions.              |
| `/ping`         | Check the bot's latency and API response time.                             |
| `/info`         | Provides information about the bot, including its version and uptime.      |

---

