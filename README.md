# System Neurofeedback
This application modifies the brightness of a computer screen based on the user's brainwaves.

## Installation
1. Install [Node.js](https://nodejs.org/en/download/)
2. Clone this repository    
3. Run `npm install --force` in the root directory of the repository

## Usage
Run `npm start` in the root directory of the repository

### Connecting a Device
To connect a device, click on the brain icon in the system tray and select the Connect to Device option from the list.

Beware that you might get stuck with your brightness very low! To force the application to close, use the `Ctrl + q` shortcut.

## Development
### Improvements
- Fix bandpower visualization and show on demand
- Document plugin controls and adding a new one
- Properly handle cancelled BLE request
- Baseline your features with the first 5s + allow Reset Baseline
- Integrate with Spotify for volume control
    - Add login with spotify option 
    - Use refresh token…
- Integrate Brainflow robustly
- Test Linux
- Create multiple windows for different screens in a multi-monitor setup

### Issues
- Every once in a while, the brightness stops responding...

## Extensions
### robot.js
This feature has been commented out in the `commoners.config.ts` file.
- [rebuild.js](./rebuild.js) is used to build the correct version of robot.js for Electron