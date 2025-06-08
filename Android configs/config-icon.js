const fs = require('fs');
const path = require('path');

// Path to the Azgaar icon (512x512) in project
const iconSrc = path.resolve(__dirname, '..', 'images', 'icons', 'icon_x512.png');
const densities = ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi'];
const resBase = path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

if (!fs.existsSync(iconSrc)) {
  console.error(`Azgaar icon not found at ${iconSrc}`);
  process.exit(1);
}

densities.forEach(density => {
  const dir = path.join(resBase, `mipmap-${density}`);
  if (!fs.existsSync(dir)) return;
  ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'].forEach(name => {
    const dest = path.join(dir, name);
    fs.copyFileSync(iconSrc, dest);
    console.log(`Copied icon to ${dest}`);
  });
});

// Also update adaptive icon foreground in anydpi-v26
const anydpiDir = path.join(resBase, 'mipmap-anydpi-v26');
if (fs.existsSync(anydpiDir)) {
  const dest = path.join(anydpiDir, 'ic_launcher_foreground.png');
  fs.copyFileSync(iconSrc, dest);
  console.log(`Copied adaptive foreground to ${dest}`);
}

// Recursively replace any ic_launcher_foreground.png under res
const walkSync = (dir, callback) => {
  fs.readdirSync(dir).forEach(name => {
    const fullPath = path.join(dir, name);
    if (fs.statSync(fullPath).isDirectory()) {
      walkSync(fullPath, callback);
    } else if (name === 'ic_launcher_foreground.png') {
      callback(fullPath);
    }
  });
};
walkSync(resBase, filePath => {
  fs.copyFileSync(iconSrc, filePath);
  console.log(`Replaced foreground icon at ${filePath}`);
});
