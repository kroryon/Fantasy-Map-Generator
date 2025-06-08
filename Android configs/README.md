# config-icon.js

This script copies the main icon (`images/icons/icon_x512.png`) into all Android resource directories (`res/mipmap-*`). It also replaces any `ic_launcher_foreground.png` files found recursively under the `res` folder.

## Usage

1. Open PowerShell and navigate to the Android configs directory:
   ```powershell
   cd "Android configs"
   ```
2. Run the script with Node.js:
   ```powershell
   node config-icon.js
   ```
3. You will see console messages indicating the paths where icons were copied or replaced.

## Requirements

- Node.js installed (v10 or higher).
- The file `images/icons/icon_x512.png` must exist in the project root.
