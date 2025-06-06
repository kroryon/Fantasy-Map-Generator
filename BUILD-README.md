# Fantasy Map Generator - Desktop & Mobile

Azgaar's Fantasy Map Generator converted to desktop and mobile applications.

## 🎯 Quick Start

### Prerequisites
- **Node.js 16+** (Download from: https://nodejs.org/)
- **PowerShell** (for Windows users)
- **For Android**: Android Studio with SDK + Java JDK 8+

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/Fantasy-Map-Generator-Ck3.git
cd Fantasy-Map-Generator-Ck3

# Install dependencies
npm install
```

## 🚀 Building Applications

### 🖥️ Desktop Applications

#### Windows Executable (.exe)
```bash
npm run build-win
```
**Output:** `dist/fantasy-map-generator-win32-x64/fantasy-map-generator.exe`

#### Linux Application
```bash
npm run build-linux
```
**Output:** `dist/fantasy-map-generator-linux-x64/fantasy-map-generator`

#### Build Both Desktop Versions
```bash
npm run build-desktop
```

### 📱 Android APK

#### 🎯 Complete Android Setup (First Time Only)

##### Step 1: Install Android Studio
1. **Download** Android Studio from: https://developer.android.com/studio
2. **Install** with default settings (accept all SDK licenses)
3. **Open** Android Studio and complete setup wizard
4. **Install Android SDK**: 
   - Go to `File` → `Settings` → `Appearance & Behavior` → `System Settings` → `Android SDK`
   - Install at least **API level 30** (Android 11) or higher
   - Install **Android SDK Build-Tools** (latest version)
   - Install **Android SDK Platform-Tools**

##### Step 2: Install Java JDK
1. **Download** Java JDK 8+ from: https://adoptium.net/
2. **Install** with default settings
3. **Note the installation path** (e.g., `C:\Program Files\Eclipse Adoptium\jdk-11.0.xx.x-hotspot`)

##### Step 3: Configure Environment Variables (Windows)
```powershell
# Open PowerShell as Administrator and run:
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-11.0.xx.x-hotspot", "User")

# Add Android tools to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$androidPath = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\build-tools"
[Environment]::SetEnvironmentVariable("PATH", "$currentPath;$androidPath", "User")

# ⚠️ IMPORTANT: Restart PowerShell completely after setting variables
```

##### Step 4: Verify Environment Setup
```powershell
# Check ANDROID_HOME
echo $env:ANDROID_HOME
# ✅ Should show: C:\Users\YourUsername\AppData\Local\Android\Sdk

# Check Java
java -version
# ✅ Should show Java version 8 or higher

# Check Android SDK platforms
ls "$env:ANDROID_HOME\platforms"
# ✅ Should list platforms like: android-30, android-31, android-32, etc.

# Check Android build tools
ls "$env:ANDROID_HOME\build-tools"
# ✅ Should list versions like: 30.0.3, 31.0.0, 32.0.0, etc.
```

##### Step 5: Configure local.properties (Critical for Android Builds)

⚠️ **REQUIRED**: Android builds will fail without proper `local.properties` configuration!

###### When to Create local.properties
```powershell
# Create local.properties AFTER adding Android platform
# This file is automatically created in: android/local.properties
```

###### ⏰ Timing is Important
1. **First run**: `npx cap add android` (creates `android/` folder)
2. **Then create**: `android/local.properties` file 
3. **Then run**: Android build commands

###### 📝 Create local.properties File
```powershell
# Navigate to android folder and create local.properties
cd android
```

**Create `android/local.properties` with this exact content:**
```properties
## This file must *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
# For customization when using a Version Control System, please read the
# header note.
sdk.dir=C:/Users/YOUR_USERNAME/AppData/Local/Android/Sdk
```

###### 🎯 Replace YOUR_USERNAME
```powershell
# Find your actual username
echo $env:USERNAME
# Use the result to replace YOUR_USERNAME in the path above
```

###### ✅ Example local.properties Content
For user `adryl`, the file should contain:
```properties
## This file must *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
# For customization when using a Version Control System, please read the
# header note.
sdk.dir=C:/Users/adryl/AppData/Local/Android/Sdk
```

###### 🚨 Common Errors Without local.properties
- `❌ SDK location not found`
- `❌ Could not determine the dependencies of task ':app:compileDebugJavaWithJavac'`
- `❌ Android SDK not found`
- `❌ Gradle build failed`

###### 🔧 Alternative: Automatic Creation
```powershell
# Automatically create local.properties with correct path
echo "sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > android/local.properties
```

#### 🔨 Build Android APK - Complete Step-by-Step Process

⚠️ **IMPORTANT**: Follow these steps in exact order to avoid build errors!

##### 📋 Step-by-Step Android Build Process

###### Step 1: Create WWW Directory and Copy Files
```powershell
# Create the www directory that Capacitor needs
npm run copy-www
```
- **What this does**: Creates `www/` folder and copies all web assets
- **Critical**: Capacitor requires a `www/` directory with `index.html`
- **Fixes error**: "Could not find the web assets directory: .\www"

###### Step 2: Add Android Platform (First Time Only)
```powershell
# Add Android platform to the project
npx cap add android
```
- **What this does**: Creates the `android/` folder with Android project structure
- **When to run**: Only the first time or if `android/` folder doesn't exist
- **Skip if**: `android/` folder already exists

###### Step 3: Sync Web Assets with Android
```powershell
# Sync web files to Android project
npx cap sync android
```
- **What this does**: Copies `www/` files to Android project assets
- **Always run**: This command should be run before every build
- **Updates**: Android app with latest web changes

###### Step 4: Build the APK

**🐛 Debug Version (for testing - automatically signed)**
```powershell
# Build debug APK
npm run build-android
```
- **Output**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Signed**: ✅ Automatically signed with debug keystore
- **Installable**: ✅ Ready to install on any Android device/emulator
- **Use for**: Testing, BlueStacks, development

**🚀 Release Version (for distribution - automatically signed)**
```powershell
# Build release APK  
npm run build-android-release
```
- **Output**: `android/app/build/outputs/apk/release/app-release.apk`
- **Signed**: ✅ Automatically signed with auto-generated keystore
- **Installable**: ✅ Ready to install on any Android device
- **Use for**: Distribution, sharing, production (not Play Store)

##### 🚀 Complete Build Command Sequence (Copy & Paste)
```powershell
# Complete Android build process (run all commands in sequence)
npm run copy-www
npx cap add android
echo "sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > android/local.properties
npx cap sync android
npm run build-android
```

##### ⚡ Quick Rebuild (After Making Changes)
```powershell
# Quick rebuild after making code changes (local.properties already exists)
npm run copy-www
npx cap sync android
npm run build-android
```

##### 🔧 First Time Setup (Complete Process)
```powershell
# First time setup including local.properties creation
npm run copy-www                    # Create www directory
npx cap add android                 # Add Android platform  
cd android                          # Navigate to android folder
echo "## This file must *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
# For customization when using a Version Control System, please read the
# header note.
sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > local.properties
cd ..                              # Return to project root
npx cap sync android               # Sync web assets
npm run build-android              # Build APK
```

#### 🔐 Android APK Auto-Signing Configuration

Este proyecto está configurado para **auto-firmar automáticamente** tanto las APKs de debug como de release, eliminando los errores de APKs sin firmar.

##### ✅ Configuración de Auto-Firma Implementada

###### 🔧 Keystore de Debug Automático
```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
}
```

###### 🚀 Keystore de Release Auto-Firmado
```gradle
signingConfigs {
    release {
        // Usa el mismo keystore de debug para auto-firmar release
        // Para producción en Play Store, deberías usar tu propio keystore
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
}
```

###### 📋 Configuración de BuildTypes
```gradle
buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release  // ← Auto-firma habilitada
    }
}
```

##### 🔑 Generación Automática del Keystore

El keystore de debug se genera automáticamente si no existe:

```powershell
# El proyecto está configurado para auto-generar el keystore
# Ubicación: android/app/debug.keystore
# Si no existe, se crea automáticamente durante el primer build
```

##### ⚙️ Proceso Completo de Auto-Firma

###### Paso 1: Verificar Keystore Existe
```powershell
# El build verifica si existe android/app/debug.keystore
# Si no existe, lo genera automáticamente
```

###### Paso 2: Configuración Automática
```powershell
# Durante el build:
# 1. Gradle lee la configuración signingConfigs del build.gradle
# 2. Aplica la firma automáticamente a debug y release
# 3. Genera APKs firmadas e instalables
```

###### Paso 3: Resultado Final
- ✅ **APK Debug**: `android/app/build/outputs/apk/debug/app-debug.apk` (Firmada)
- ✅ **APK Release**: `android/app/build/outputs/apk/release/app-release.apk` (Firmada)

##### 🆚 Diferencias Debug vs Release

| Aspecto | Debug APK | Release APK |
|---------|-----------|-------------|
| **Firmado** | ✅ Automático | ✅ Automático |
| **Instalable** | ✅ Sí | ✅ Sí |
| **Depuración** | ✅ Habilitada | ❌ Deshabilitada |
| **Tamaño** | Más grande | Optimizada |
| **Uso** | Testing, desarrollo | Distribución |
| **Minificación** | ❌ No | ✅ Opcional (actualmente deshabilitada) |

##### 🚨 Importante para Distribución

###### ⚠️ Para Testing y Distribución Personal
- ✅ **La configuración actual es perfecta**
- ✅ Las APKs están firmadas e instalables
- ✅ Funciona en cualquier dispositivo Android
- ✅ No requiere configuración adicional

###### 🏪 Para Google Play Store (Producción)
```gradle
// Para Play Store necesitas crear tu propio keystore:
keytool -genkey -v -keystore release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias release-key

// Luego modificar build.gradle:
release {
    storeFile file('release-key.keystore')
    storePassword 'tu-password-seguro'
    keyAlias 'release-key'
    keyPassword 'tu-key-password-seguro'
}
```

##### 📝 Lo Que Está Configurado Automáticamente

La configuración actual elimina estos problemas comunes:
- ❌ ~~"APK not signed" errors~~
- ❌ ~~"Installation failed" due to unsigned APK~~
- ❌ ~~Manual keystore creation required~~
- ❌ ~~Complex signing setup~~

Y proporciona estas ventajas:
- ✅ **Builds funcionan inmediatamente** sin configuración adicional
- ✅ **APKs siempre firmadas** y listas para instalar
- ✅ **Proceso simplificado** para desarrolladores
- ✅ **Compatible con cualquier dispositivo** Android
- ✅ **No requiere Android Studio** para firmar APKs

##### 🔧 Comandos de Build con Auto-Firma

```powershell
# Debug APK (auto-firmada)
npm run build-android
# ✅ Resultado: android/app/build/outputs/apk/debug/app-debug.apk (FIRMADA)

# Release APK (auto-firmada)  
npm run build-android-release
# ✅ Resultado: android/app/build/outputs/apk/release/app-release.apk (FIRMADA)

# Verificar que la APK está firmada
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
# ✅ Debería mostrar: "jar verified"
```

##### 🎯 Verificación de Firmado

```powershell
# Verificar que el keystore existe
ls android/app/debug.keystore
# ✅ Debería mostrar el archivo

# Verificar información del keystore
keytool -list -v -keystore android/app/debug.keystore -storepass android
# ✅ Debería mostrar información del certificado
```

Este sistema de auto-firma garantiza que **todas las APKs generadas estén firmadas e instalables** sin requerir configuración manual compleja del desarrollador.

##### 🏭 Creación de Keystore Personalizado para Producción

Si planeas distribuir en Google Play Store o quieres tu propio keystore de release:

###### Paso 1: Generar Keystore Personalizado
```powershell
# Navegar a la carpeta android/app
cd android/app

# Generar nuevo keystore para producción
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-release-alias

# Te pedirá:
# - Password del keystore (recuérdalo!)
# - Password del alias (recuérdalo!)
# - Información personal (nombre, organización, etc.)
```

###### Paso 2: Modificar build.gradle para Keystore Personalizado
```gradle
// En android/app/build.gradle, reemplazar la sección signingConfigs:
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        storeFile file('my-release-key.keystore')
        storePassword 'TU_KEYSTORE_PASSWORD'
        keyAlias 'my-release-alias'
        keyPassword 'TU_ALIAS_PASSWORD'
    }
}
```

###### Paso 3: Variables de Entorno Seguras (Recomendado)
```powershell
# Crear archivo gradle.properties en android/app/ (NO commitear al git)
echo "MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-release-alias
MYAPP_RELEASE_STORE_PASSWORD=TU_KEYSTORE_PASSWORD
MYAPP_RELEASE_KEY_PASSWORD=TU_ALIAS_PASSWORD" > android/app/gradle.properties
```

```gradle
// Usar variables en build.gradle (más seguro):
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
```

###### Paso 4: Añadir a .gitignore
```bash
# Añadir a .gitignore para NO commitear claves privadas:
android/app/my-release-key.keystore
android/app/gradle.properties
*.keystore
```

###### Paso 5: Build con Keystore Personalizado
```powershell
# Build release con tu keystore personalizado
npm run build-android-release
# ✅ Resultado: APK firmada con TU keystore personal
```

###### ⚠️ Seguridad del Keystore
- **NUNCA** commitees keystores o passwords al git
- **GUARDA** una copia de seguridad del keystore en lugar seguro
- **RECUERDA** los passwords (no se pueden recuperar)
- **USA** el mismo keystore para todas las actualizaciones de la app

###### 🔄 Proceso Completo de Keystore Personalizado
```powershell
# 1. Generar keystore
cd android/app
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-release-alias

# 2. Crear gradle.properties con passwords
echo "MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-release-alias  
MYAPP_RELEASE_STORE_PASSWORD=tu_password_aqui
MYAPP_RELEASE_KEY_PASSWORD=tu_key_password_aqui" > gradle.properties

# 3. Modificar build.gradle para usar variables
# (Ver código arriba)

# 4. Añadir archivos a .gitignore
echo "android/app/my-release-key.keystore
android/app/gradle.properties" >> ../../.gitignore

# 5. Build con keystore personalizado
cd ../..
npm run build-android-release

# ✅ APK firmada con keystore personalizado lista para Play Store
```

### 🚨 Troubleshooting Android Build Issues

#### ❌ "SDK location not found" Error
**Problem**: Android build fails with SDK location error
**Solution**: 
```powershell
# Check if local.properties exists
ls android/local.properties

# If missing, create it:
echo "sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > android/local.properties

# Verify ANDROID_HOME is set correctly
echo $env:ANDROID_HOME
```

#### ❌ "Could not find the web assets directory: .\www" Error  
**Problem**: Capacitor can't find www directory
**Solution**:
```powershell
# Create www directory and copy files
npm run copy-www
```

#### ❌ "android platform has not been added" Error
**Problem**: Android platform not initialized
**Solution**:
```powershell
# Add Android platform
npx cap add android
```

#### ❌ "Could not determine the dependencies of task" Error
**Problem**: Usually missing local.properties or wrong Android SDK path
**Solution**:
```powershell
# Verify Android SDK path exists
ls "C:/Users/$env:USERNAME/AppData/Local/Android/Sdk"

# Re-create local.properties with correct path
echo "sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > android/local.properties

# Clean and rebuild
cd android
.\gradlew.bat clean
cd ..
npm run build-android
```

#### ✅ Verify local.properties is Correct
```powershell
# Check content of local.properties
cat android/local.properties

# Should show something like:
# sdk.dir=C:/Users/YourUsername/AppData/Local/Android/Sdk
```

## 📱 Mobile Compatibility Features

### ✅ Enhanced Mobile Support
This version includes **improved mobile compatibility** specifically designed to work with:
- **BlueStacks** and other Android emulators
- **Real Android devices** 
- **Touch-enabled Windows devices**
- **Mobile browsers**
- **Small screens and varying resolutions**

### 🎯 Solved Issues
- **Fixed click/touch responsiveness** in BlueStacks
- **Eliminated invasive event handlers** that blocked user interactions
- **Improved menu closing** on mobile devices
- **Better touch target detection** for small screens
- **Enhanced emulator compatibility**
- **🆕 Comprehensive scroll system** for all menus and panels
- **🆕 Smart menu sizing** that adapts to screen dimensions
- **🆕 Fixed Options menu overflow** on mobile devices
- **🆕 Consistent scroll behavior** across all UI elements

### 🔧 Mobile-Specific Files
The following files handle mobile compatibility and are automatically included in both web and Android builds:
- **`mobile-compatibility-v2.js`** - 🆕 Revolutionary custom dialog minimization system
- **`azgaar-touch-enhancements.js`** - Safe touch enhancements (cleaned version)
- **`mobile-dialog-scroll-fix.js`** - Scroll fixes for dialogs and popups
- **`universal-scroll-fix.js`** - Comprehensive scroll system for all UI elements
- **`mobile-options-fix.css`** - CSS fixes for mobile menu scrolling and sizing

### 🆕 Revolutionary Dialog Minimization System
This version includes a **completely new dialog minimization system** designed specifically for Android devices:

#### ✅ Custom Minimization Features
- **🎯 Complete jQuery UI Bypass** - No longer relies on broken jQuery UI minimize functions
- **📱 Android WebView Optimized** - Built specifically for Capacitor Android apps
- **🖱️ Touch-Friendly Controls** - 44px minimum button sizes for easy tapping
- **📊 Visual Minimized State** - Clear visual indicators when dialogs are minimized
- **🗂️ Minimized Dialog Tabs** - Elegant bottom-screen tabs for restored access
- **⚡ Instant Restore** - One-tap restoration from minimized state
- **🔄 Smart State Management** - Tracks dialog states independently of jQuery UI

#### 🚫 Problems Solved
- **❌ jQuery UI minimize buttons broken on Android** → ✅ Custom minimize system works perfectly
- **❌ Minimized dialogs completely inaccessible** → ✅ Minimized tabs provide easy access
- **❌ Touch events not recognized properly** → ✅ Native touch event handling
- **❌ No visual feedback for minimized state** → ✅ Clear orange visual indicators
- **❌ Conflicting with jQuery UI internals** → ✅ Independent minimization system

### 📱 Enhanced Scroll System
This version includes a **comprehensive scroll system** specifically designed for mobile devices:

#### ✅ Scroll Features
- **Automatic scroll detection** for all menus and panels
- **Smart height limits** to prevent menus from exceeding screen size
- **Touch-friendly scrollbars** with proper styling
- **Android WebView optimization** for Capacitor builds
- **Responsive design** that adapts to different screen sizes

#### 🎯 Fixed Menu Issues
- **Options menu scrolling** - Long menus now scroll properly instead of being cut off
- **Tab content scrolling** - All tab contents are scrollable when needed
- **Dropdown sizing** - Dropdowns maintain reasonable sizes on mobile
- **Consistent behavior** - All menus maintain the same size and scroll behavior

#### 🔧 Technical Implementation
The new minimization system works by:
1. **Detecting jQuery UI dialogs** automatically with MutationObserver
2. **Replacing broken minimize buttons** with custom touch-friendly buttons  
3. **Creating minimized tabs container** at bottom of screen when dialogs are minimized
4. **Storing original dialog states** to enable perfect restoration
5. **Bypassing jQuery UI completely** for minimize/maximize operations
6. **Using native DOM manipulation** for reliable cross-platform compatibility

#### 🎯 How the New System Works
```javascript
// Old broken approach (jQuery UI dependent):
❌ $('.ui-dialog').dialog('minimize') // Broken on Android WebView

// New custom approach (jQuery UI independent):  
✅ CustomDialogMinimizer.minimizeDialog(dialog) // Works everywhere
✅ Creates visual tab for easy restoration
✅ Stores complete dialog state for perfect restoration
✅ 44px touch-friendly minimize/restore buttons
```

### 📋 Mobile Testing
```bash
# Test in local browser (mobile simulation)
npm run electron
# Then open DevTools > Toggle Device Toolbar (Ctrl+Shift+M)

# Test Android APK in emulator
npm run build-android
# Install APK in BlueStacks or Android emulator

# Test on real Android device
npm run build-android
# Transfer APK to device and install

# 🆕 Test new dialog minimization system specifically
# 1. Open any dialog (Options, Units, etc.)
# 2. Click the minimize button (− symbol)
# 3. Verify dialog minimizes and tab appears at bottom
# 4. Click the tab to restore dialog
# 5. Verify dialog restores perfectly to original state
# 6. Test with multiple dialogs minimized simultaneously

# Test scroll functionality specifically
# 1. Open Options menu
# 2. Verify menu doesn't exceed screen height
# 3. Test scrolling in long menus (Options tab)
# 4. Verify dropdowns are reasonably sized
# 5. Test all tabs for scroll behavior
```

## 🔧 Development Commands

### Run Desktop Version (Development)
```bash
npm run electron
```

### Open Android Project in Android Studio
```bash
npm run open-android
```

### Test Individual Components
```bash
# Test WWW folder creation and file copying
npm run test-scripts

# Create WWW folder only
npm run copy-www

# Clean all build files
npm run clean

# Clean and rebuild desktop versions
npm run clean-build
```

## 📁 Project Structure
```
Fantasy-Map-Generator-Ck3/
├── 📂 Source Files (committed to git)
│   ├── components/              # UI components
│   ├── modules/                 # Core functionality  
│   ├── styles/                  # CSS styles
│   ├── images/                  # Assets and icons
│   ├── charges/                 # Heraldic symbols
│   ├── heightmaps/              # Terrain data
│   ├── libs/                    # Third-party libraries
│   ├── utils/                   # Utility functions
│   ├── config/                  # Configuration files
│   ├── mobile-compatibility-v2.js # 🆕 Revolutionary dialog minimization system
│   ├── azgaar-touch-enhancements.js # 📱 Safe touch improvements
│   ├── mobile-dialog-scroll-fix.js # 📱 Dialog scroll fixes
│   ├── universal-scroll-fix.js  # 📱 Universal scroll system
│   ├── mobile-options-fix.css   # 📱 Mobile menu CSS fixes
│   ├── capacitor.config.ts      # Mobile app configuration
│   ├── electron-main.js         # Desktop app entry point
│   ├── package.json            # Dependencies and scripts
│   ├── .gitignore              # Git ignore rules
│   └── BUILD-README.md         # This file
│
├── 📂 Generated Files (NOT committed to git)
│   ├── android/                 # Generated Android project
│   ├── www/                     # Generated web assets for mobile
│   ├── dist/                    # Generated desktop builds
│   └── node_modules/            # NPM dependencies
```

## 🛠️ Technologies Used
- **Electron** - Desktop applications
- **Capacitor** - Mobile applications
- **Express** - Local server for Electron
- **Gradle** - Android build system
- **electron-packager** - Desktop app packaging

## 📦 Complete Command Reference

### 🏗️ Build Commands

#### Desktop Applications
```bash
npm run build-win               # 🪟 Build Windows .exe
npm run build-linux             # 🐧 Build Linux binary  
npm run build-desktop           # 🖥️ Build both desktop versions
```

#### Android Applications  
```bash
npm run build-android           # 🐛 Build debug APK (testing)
npm run build-android-release   # 🚀 Build release APK (distribution)
```

### 🔧 Development Commands
```bash
npm run electron                # 🖥️ Run desktop app in development
npm run electron-dev            # 🖥️ Run desktop app with dev flag  
npm run open-android            # 📱 Open Android project in Android Studio
```

### 🛠️ Utility Commands
```bash
npm run copy-www                # 📋 Copy web files to www/ folder
npm run create-www              # 📁 Create www/ directory
npm run copy-files              # 📂 Copy all files to www/
npm run ensure-android          # ✅ Add Android platform if missing
npm run prepare-android         # 🔄 Prepare Android build (copy + sync)
npm run test-scripts            # 🧪 Test file copying process
npm run clean                   # 🧹 Remove all build folders
npm run clean-build             # 🔄 Clean and rebuild desktop
```

### 📊 Output Locations

#### Desktop Builds
- **Windows**: `dist/fantasy-map-generator-win32-x64/fantasy-map-generator.exe`
- **Linux**: `dist/fantasy-map-generator-linux-x64/fantasy-map-generator`

#### Android Builds  
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

#### Generated Folders (Git Ignored)
- **`android/`** - Generated Android project
- **`www/`** - Generated web assets for mobile
- **`dist/`** - Generated desktop builds
- **`node_modules/`** - NPM dependencies

## 🚨 Troubleshooting

### Desktop Build Issues

#### Electron not found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### Permission errors (Windows)
```bash
# Run PowerShell as Administrator
# Or give execution permissions:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Build fails
```bash
# Clean and rebuild
npm run clean-build
```

### Android Build Issues

#### 🔧 Common Problems and Solutions

##### ❌ "Could not find the web assets directory: .\www" Error
```powershell
# SOLUTION: Create www directory first
npm run copy-www
npx cap sync android
npm run build-android
```
**Why this happens**: Capacitor requires a `www/` directory with web assets before building
**Prevention**: Always run `npm run copy-www` before Android builds

##### ❌ "android platform has not been added" Error
```powershell
# SOLUTION: Add Android platform
npx cap add android
npx cap sync android
npm run build-android
```
**Why this happens**: Android platform hasn't been initialized in the project
**Prevention**: Run `npx cap add android` once per project setup
```bash
# 1. Check environment variables are set
echo $env:ANDROID_HOME
echo $env:JAVA_HOME

# 2. If empty or incorrect, set them (adjust paths to your installation)
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-11.0.xx.x-hotspot", "User")

# 3. ⚠️ CRITICAL: Restart PowerShell completely and try again
```

##### ❌ "android platform has not been added" Error
```bash
# This is automatically handled, but if it persists:
npx cap add android
npx cap sync android
npm run build-android
```

##### 🔐 APK Signing Issues

###### ❌ "APK not signed" or "Installation failed" Error
```powershell
# SOLUTION: El proyecto ya está configurado para auto-firma
# Pero si persiste el problema:

# 1. Verificar que debug.keystore existe
ls android/app/debug.keystore

# 2. Si no existe, regenerar keystore
cd android/app
keytool -genkey -v -keystore debug.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias androiddebugkey -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"

# 3. Rebuild APK
cd ../..
npm run build-android
```

###### ❌ "Failed to read key from keystore" Error
```powershell
# SOLUTION: Keystore corrupto o passwords incorrectos
# Regenerar keystore:
cd android/app
Remove-Item debug.keystore -ErrorAction Ignore
keytool -genkey -v -keystore debug.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias androiddebugkey -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
cd ../..
npm run build-android
```

###### ❌ "Certificate fingerprint mismatch" Error en dispositivo
```powershell
# SOLUTION: Dispositivo tiene una versión con diferente firma
# Desinstalar la app existente primero:
adb uninstall com.azgaar.fantasymapgenerator
# Luego instalar la nueva:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

###### ✅ Verificar Firma de APK
```powershell
# Para verificar que la APK está correctamente firmada:
jarsigner -verify -verbose -certs android/app/build/outputs/apk/debug/app-debug.apk
# Debería mostrar: "jar verified."

# Para release APK:
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
# Debería mostrar: "jar verified."
```

###### 📋 Información del Keystore
```powershell
# Ver información del keystore debug:
keytool -list -v -keystore android/app/debug.keystore -storepass android

# Verificar alias y passwords:
# Alias: androiddebugkey
# Store password: android  
# Key password: android
```

##### ❌ Gradle wrapper permission errors
```bash
# Fix gradlew.bat permissions (Windows)
cd android
icacls gradlew.bat /grant:r %USERNAME%:F

# Try building directly in Android folder
gradlew.bat assembleDebug
```

##### ❌ Java version issues
```bash
# Check Java version
java -version

# Should show version 8 or higher
# If wrong version or not found:
# 1. Download correct Java from: https://adoptium.net/
# 2. Set JAVA_HOME correctly
# 3. Restart PowerShell
```

##### ❌ Build cache/corruption issues
```bash
# Nuclear option - clean everything and rebuild
npm run clean
Remove-Item -Recurse -Force android/ -ErrorAction Ignore
Remove-Item -Recurse -Force www/ -ErrorAction Ignore
npm run build-android
```

##### ❌ "Unable to find a valid app" or Capacitor errors
```bash
# Force regenerate Android platform
npx cap add android --force
npx cap sync android
npm run build-android
```

##### ❌ Gradle daemon issues
```bash
# Stop all Gradle processes and try again
cd android
gradlew.bat --stop
gradlew.bat assembleDebug
```

#### 📋 Verify Successful Build
After a successful build, you should see:
```
✅ BUILD SUCCESSFUL in [time]
✅ APK location: android/app/build/outputs/apk/debug/app-debug.apk
✅ File size: ~50-100MB (depending on assets)
```

#### 🎯 Quick Environment Check Script
```powershell
# Run this to verify your setup:
Write-Host "=== Android Build Environment Check ===" -ForegroundColor Green

Write-Host "`nJava Version:" -ForegroundColor Yellow
java -version

Write-Host "`nEnvironment Variables:" -ForegroundColor Yellow
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "JAVA_HOME: $env:JAVA_HOME"

Write-Host "`nAndroid SDK Check:" -ForegroundColor Yellow
if (Test-Path "$env:ANDROID_HOME\platforms") {
    Write-Host "✅ Platforms:" -ForegroundColor Green
    ls "$env:ANDROID_HOME\platforms" | Select-Object Name
} else {
    Write-Host "❌ Android platforms not found!" -ForegroundColor Red
}

if (Test-Path "$env:ANDROID_HOME\build-tools") {
    Write-Host "✅ Build tools:" -ForegroundColor Green
    ls "$env:ANDROID_HOME\build-tools" | Select-Object Name
} else {
    Write-Host "❌ Android build-tools not found!" -ForegroundColor Red
}

Write-Host "`nProject Status:" -ForegroundColor Yellow
if (Test-Path "android") {
    Write-Host "✅ Android platform exists" -ForegroundColor Green
} else {
    Write-Host "⚠️ Android platform needs to be added" -ForegroundColor Yellow
}

if (Test-Path "package.json") {
    Write-Host "✅ In correct project directory" -ForegroundColor Green
} else {
    Write-Host "❌ Not in project root directory!" -ForegroundColor Red
}
```

## 📱 Installing APK on Android Devices

### 🎮 BlueStacks Installation (Verified Working ✅)
**BlueStacks is the easiest way to test your APK on PC:**

1. **Download BlueStacks** from: https://www.bluestacks.com/
2. **Install and start** BlueStacks (use latest version)
3. **Locate your APK**: Navigate to `android/app/build/outputs/apk/debug/app-debug.apk`
4. **Install methods** (choose one):
   - **Drag & Drop**: Simply drag the APK file into BlueStacks window
   - **File Manager**: Open BlueStacks file manager, navigate to APK, and click install
   - **From PC**: Use "Install APK" option in BlueStacks interface

5. **✅ Touch events now work perfectly!** The app will open and be fully functional with mouse/touch input

### 📱 Real Android Device Installation

#### Method 1: Direct Install (Easiest)
1. **Enable Developer Options**:
   - Go to `Settings` → `About Phone`
   - Tap `Build Number` **7 times** rapidly
   - Go back to `Settings` → `Developer Options` (now visible)
   - Enable `USB Debugging`

2. **Enable Unknown Sources**:
   - Go to `Settings` → `Security` (or `Apps & notifications`)
   - Enable `Install unknown apps` for your file manager
   - Or enable `Unknown sources` (older Android versions)

3. **Install APK**:
   - Copy `app-debug.apk` or `app-release.apk` to your device (via USB, cloud, email, etc.)
   - Open the APK file with your file manager
   - Tap `Install` when prompted
   - Allow installation from unknown sources if asked

#### Method 2: ADB Install (Advanced)
```bash
# 1. Connect device via USB (with USB Debugging enabled)
adb devices
# Should show your device

# 2. Install APK directly
adb install android/app/build/outputs/apk/debug/app-debug.apk
# For release version:
adb install android/app/build/outputs/apk/release/app-release.apk
```

#### Method 3: Wireless Install
1. **Upload APK** to cloud storage (Google Drive, Dropbox, etc.)
2. **Download on device** using browser
3. **Open downloaded APK** from notifications or file manager
4. **Install** as described in Method 1

### 🛠️ Other Android Emulators

#### Nox Player
1. Download from: https://www.bignox.com/
2. Install and start Nox
3. Drag APK into emulator window or use APK installer

#### MEmu Play
1. Download from: https://www.memuplay.com/
2. Install and start MEmu
3. Use "Install APK" button or drag & drop APK

#### LDPlayer
1. Download from: https://www.ldplayer.net/
2. Install and start LDPlayer
3. Drag APK into emulator or use APK installer

### 🔍 Troubleshooting Installation

#### ❌ "App not installed" Error
- **Solution 1**: Uninstall any previous version first
- **Solution 2**: Clear storage space (APK needs ~100MB free space)
- **Solution 3**: Enable "Install unknown apps" for your file manager

#### ❌ "Parse error" or "Invalid APK"
- **Solution**: APK file may be corrupted during transfer
  - Re-download/re-copy the APK file
  - Try building APK again: `npm run build-android`

#### ❌ "Installation blocked"
- **Solution**: Enable installation from unknown sources
  - Check `Settings` → `Security` → `Unknown sources`
  - Or `Settings` → `Apps` → `Special access` → `Install unknown apps`

#### ❌ App crashes on startup
- **Solution**: Device may not meet requirements
  - Ensure Android 6.0+ (API 23+)
  - Ensure at least 2GB RAM available
  - Check device storage (need ~200MB free)

### 📊 Installation Verification

After successful installation, you should see:
- ✅ **App icon** in device app drawer
- ✅ **App opens** without crashing
- ✅ **Touch/mouse input** works correctly
- ✅ **UI renders** properly on device screen
- ✅ **All features** functional (map generation, saving, etc.)

### 🎯 Recommended Testing Workflow

1. **Build APK**: `npm run build-android`
2. **Test in BlueStacks** first (easiest debugging)
3. **Test on real device** for final verification
4. **Test key features**:
   - Map generation
   - Touch/pan/zoom controls  
   - Menu interactions
   - File save/load
   - Settings changes

This ensures your APK works across different Android environments before distribution.

## 🔄 Complete Build Workflow

### 🆕 First Time Setup (New Developer)
```powershell
# 1. Clone the repository
git clone <repository-url>
cd Fantasy-Map-Generator-Ck3

# 2. Install Node.js dependencies
npm install

# 3. Test desktop version works
npm run electron

# 4. For Android: Complete Android Setup (see Android section above)
#    - Install Android Studio + SDK
#    - Install Java JDK 8+
#    - Set ANDROID_HOME and JAVA_HOME environment variables
#    - Restart PowerShell

# 5. Prepare Android build environment
npm run copy-www
npx cap add android

# 6. Test Android build (after Android setup)
npx cap sync android
npm run build-android
```

### 🚀 Production Build Process
```powershell
# 1. Clean any previous builds
npm run clean

# 2. Build desktop applications
npm run build-desktop
# ✅ Outputs:
#    - dist/fantasy-map-generator-win32-x64/fantasy-map-generator.exe
#    - dist/fantasy-map-generator-linux-x64/fantasy-map-generator

# 3. Prepare Android build environment
npm run copy-www
npx cap sync android

# 4. Build Android APKs
npm run build-android           # Debug version for testing
npm run build-android-release   # Release version for distribution
# ✅ Outputs:
#    - android/app/build/outputs/apk/debug/app-debug.apk
#    - android/app/build/outputs/apk/release/app-release.apk

# 5. All builds complete! 🎉
```

### 🧪 Testing Workflow
```powershell
# Test desktop version
npm run electron
# ✅ Should open app window on desktop

# Test Android in BlueStacks (complete process)
npm run copy-www
npx cap sync android
npm run build-android
# Then drag app-debug.apk into BlueStacks
# ✅ Should install and run with working touch events

# Test Android on real device  
# Transfer app-debug.apk to device and install
# ✅ Should work on Android 6.0+ devices
```

### 🔧 Development Workflow
```powershell
# Make code changes to source files
# Then test changes:

# For desktop changes:
npm run electron                # Quick test in development

# For mobile changes:
npm run copy-www                # Copy updated files
npx cap sync android            # Sync to Android project
npm run build-android           # Build new APK
# Install in BlueStacks/device to test

# Before committing:
npm run build-desktop           # Verify desktop builds work
npm run copy-www && npx cap sync android && npm run build-android  # Verify Android builds work
# ✅ All builds should succeed before git push
```

### 🚨 Troubleshooting Workflow
```powershell
# If any build fails:

# 1. Clean everything
npm run clean

# 2. Check environment (for Android issues)
echo $env:ANDROID_HOME
echo $env:JAVA_HOME
java -version

# 3. Reinstall dependencies  
Remove-Item -Recurse -Force node_modules -ErrorAction Ignore
npm install

# 4. Recreate www directory and Android platform
npm run copy-www
npx cap add android

# 5. Try building again
npm run build-desktop
npx cap sync android
npm run build-android

# 6. If Android still fails, complete regeneration
Remove-Item -Recurse -Force android -ErrorAction Ignore
Remove-Item -Recurse -Force www -ErrorAction Ignore
npm run copy-www
npx cap add android
npx cap sync android
npm run build-android
```

### 📋 Pre-Release Checklist

Before distributing your builds:

#### ✅ Desktop Checklist
- [ ] `npm run build-desktop` completes without errors
- [ ] Windows .exe runs and opens properly  
- [ ] Linux binary runs and opens properly
- [ ] All core features work (map generation, save/load, etc.)

#### ✅ Android Checklist  
- [ ] `npm run build-android` completes without errors
- [ ] APK installs successfully in BlueStacks
- [ ] APK installs successfully on real Android device
- [ ] Touch/mouse events work correctly
- [ ] UI renders properly on mobile screen
- [ ] **🆕 Dialog minimization works perfectly** - Click minimize button (−) and verify dialog minimizes
- [ ] **🆕 Dialog restoration works** - Click minimized tab at bottom and verify dialog restores completely
- [ ] **🆕 Multiple minimized dialogs work** - Minimize several dialogs and verify all tabs appear
- [ ] **🆕 Minimized state is visually clear** - Minimized tabs are obvious and easy to click
- [ ] **Menu scrolling works** - Options menu and other long menus scroll properly
- [ ] **Menu sizing is correct** - Menus don't exceed screen boundaries
- [ ] **Dropdowns are reasonably sized** - Select elements aren't oversized
- [ ] All features work (especially touch-based interactions)
- [ ] App doesn't crash on startup or during use

#### ✅ Mobile Compatibility Verification
- [ ] Touch events work in BlueStacks (**critical fix**)
- [ ] Menu closing works on mobile
- [ ] **Menu scrolling works properly** - No menus exceed screen height
- [ ] **Options menu scroll** - Long Options tab content is scrollable
- [ ] **Consistent menu sizes** - All menus maintain proper dimensions
- [ ] Drag/pan/zoom gestures work
- [ ] No invasive event handler conflicts
- [ ] Performance is acceptable on mobile devices

#### ✅ File Integrity
- [ ] All builds are reasonable size (~50-100MB for Android)
- [ ] No missing assets or broken images
- [ ] All scripts and modules load correctly

### 📤 Distribution

#### Desktop Distribution
1. **Windows**: Share the entire `dist/fantasy-map-generator-win32-x64/` folder
   - Users run `fantasy-map-generator.exe`
   - Include all files in the folder (dependencies included)

2. **Linux**: Share the entire `dist/fantasy-map-generator-linux-x64/` folder  
   - Users run `./fantasy-map-generator`
   - Make sure executable has proper permissions

#### Android Distribution
1. **Testing/Beta**: Share `app-debug.apk`
   - Easier to install (signed with debug key)
   - Perfect for testing and feedback

2. **Production/Release**: Share `app-release.apk`
   - Signed with release key
   - For final distribution

3. **Installation**: Provide installation instructions (see "Installing APK" section)

### 🔄 Continuous Updates

When you make changes:

1. **Source Code**: Commit only source files, never build outputs
2. **Testing**: Test both desktop and mobile after changes
3. **Versioning**: Update version in `package.json` for releases
4. **Building**: Generate fresh builds for each release
5. **Documentation**: Update this README if build process changes

This ensures a consistent, reliable build process for all developers and users.

## 📋 System Requirements

### Development Machine
- **OS**: Windows 10/11, macOS 10.14+, or Linux
- **Node.js**: Version 16 or higher
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB free space (more for Android SDK)

### For Desktop Builds
- **Windows**: Windows 7 or higher
- **Linux**: Most modern distributions

### For Android Development
- **Android Studio**: Latest version
- **Java JDK**: Version 8 or higher
- **Android SDK**: API level 23 or higher
- **Additional Storage**: 3GB+ for Android SDK

### Target Devices

#### Desktop Requirements
- **Windows**: Windows 7 or higher
- **Linux**: Most modern distributions

#### Mobile/Android Requirements ✅
- **Android**: API level 23+ (Android 6.0+), 2GB RAM
- **BlueStacks**: Any recent version (touch events verified working)
- **Other Emulators**: Nox, MEmu, LDPlayer (should work with new compatibility layer)
- **Real Devices**: Any Android phone/tablet with 2GB+ RAM

#### Enhanced Compatibility Features
- ✅ **Touch event handling** for emulators
- ✅ **Menu closing improvements** for mobile
- ✅ **Better click detection** in virtual environments
- ✅ **Optimized for BlueStacks** and similar emulators

## 🔐 Security Notes

### APK Signing (for Production)
```bash
# For Play Store distribution, you need to sign the APK
# This requires setting up signing keys in Android Studio
# Debug APKs are automatically signed with debug keys (not for production)
```

### Environment Variables
- Never commit `.env` files or API keys
- Android local.properties file is automatically git-ignored
- Keep ANDROID_HOME and JAVA_HOME paths correct for your system

## 📞 Support & Contributing

### Getting Help
If you encounter issues:
1. Check this troubleshooting section
2. Ensure all prerequisites are installed correctly
3. Try cleaning and rebuilding: `npm run clean-build`
4. Check environment variables are set correctly
5. Open an issue with error details and system info

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Make changes (avoid committing dist/, android/, www/ folders)
4. Test builds: `npm run build-desktop` and `npm run build-android`
5. Commit changes: `git commit -m 'Add some AmazingFeature'`
6. Push to branch: `git push origin feature/AmazingFeature`
7. Open a Pull Request

### Important: What NOT to Commit
The `.gitignore` file excludes these generated folders:
- `android/` - Generated by Capacitor
- `www/` - Generated web assets
- `dist/` - Generated desktop builds
- `node_modules/` - NPM dependencies

Only commit source files and configuration!

## 📄 License
This project maintains the same license as the original Azgaar's Fantasy Map Generator.

## 🙏 Credits
- **Original Fantasy Map Generator** by [Azgaar](https://github.com/Azgaar/Fantasy-Map-Generator)
- **Desktop & Mobile conversion** - Community contribution
- **Mobile Compatibility Improvements** - Enhanced touch and emulator support
- **Electron** - Desktop app framework
- **Capacitor** - Mobile app framework

## 📱 Mobile Compatibility Details

### What Was Fixed
The original Fantasy Map Generator had issues running on mobile devices and emulators like BlueStacks. This version includes:

#### ❌ Previous Issues
- Touch events were overridden aggressively
- Click events didn't work in BlueStacks
- Menu closing was problematic on mobile
- Global event listener modifications caused conflicts

#### ✅ Current Solutions
- **Safe Event Handling**: Removed invasive `addEventListener` overrides
- **Emulator Detection**: Better detection of BlueStacks and similar environments
- **Touch Improvements**: Passive touch listeners that don't interfere with clicks
- **Menu Fixes**: Improved mobile-friendly menu closing
- **Performance**: Optimized for mobile devices with reduced animations

### Technical Implementation

#### Files Modified
1. **`mobile-compatibility.js`**
   - Enhanced device detection (including BlueStacks)
   - Safe touch event improvements
   - Mobile viewport optimizations
   - Performance improvements for mobile

2. **`azgaar-touch-enhancements.js`**
   - Removed dangerous global `addEventListener` override
   - Simplified to essential functionality only
   - Safe menu closing without event conflicts
   - Touch-friendly UI improvements

#### How It Works
```javascript
// Before (problematic):
EventTarget.prototype.addEventListener = function() { /* invasive override */ }

// After (safe):
// Passive listeners only, no interference with native events
document.addEventListener('touchstart', handler, { passive: true });
```

### Testing Results
- ✅ **BlueStacks**: Touch and click events work correctly
- ✅ **Real Android Devices**: Improved touch responsiveness  
- ✅ **Mobile Browsers**: Better mobile experience
- ✅ **Desktop**: No regression in desktop functionality

### For Developers
If you're working on further mobile improvements:

1. **Never override** `EventTarget.prototype.addEventListener`
2. **Use passive listeners** when possible: `{ passive: true }`
3. **Test in BlueStacks** to verify emulator compatibility
4. **Avoid preventDefault()** unless absolutely necessary
5. **Use device detection** to apply mobile-specific fixes only when needed

### Troubleshooting Mobile Issues
If you encounter mobile-related problems:

1. **Check DevTools Console** for JavaScript errors
2. **Test in BlueStacks** to reproduce emulator issues
3. **Verify touch events** aren't being prevented
4. **Check mobile-compatibility.js** is loading correctly
5. **Ensure files are copied** to www/ folder during build

This mobile compatibility layer ensures the Fantasy Map Generator works smoothly across all platforms while maintaining the original functionality.

## 🚀 Resumen Rápido - Compilación de Release

### ⚡ Comandos Esenciales para Compilar Release APK

```powershell
# 1. Setup inicial (solo primera vez)
npm install
npm run copy-www
npx cap add android
echo "sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > android/local.properties

# 2. Compilar APK Release (auto-firmada)
npm run copy-www
npx cap sync android
npm run build-android-release

# 🎯 Resultado: android/app/build/outputs/apk/release/app-release.apk
```

### 🔐 ¿Qué Se Configuró Automáticamente?

- ✅ **Auto-firma automática** para debug y release
- ✅ **Keystore de debug** se crea automáticamente
- ✅ **Release APK firmada** lista para instalar
- ✅ **Compatible con cualquier dispositivo** Android
- ✅ **No requiere configuración manual** de keystores

### 📝 Lo Que NUNCA Necesitas Hacer Manualmente

- ❌ ~~Crear keystores manualmente~~
- ❌ ~~Configurar signing configs~~
- ❌ ~~Firmar APKs con jarsigner~~
- ❌ ~~Instalar certificados~~
- ❌ ~~Manejar passwords complejos~~

### 🎯 Para Distribución en Play Store

Si quieres publicar en Google Play Store, sigue estos pasos adicionales:

```powershell
# 1. Crear keystore personalizado
cd android/app
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-release-alias

# 2. Modificar build.gradle para usar tu keystore
# (Ver sección "Creación de Keystore Personalizado" arriba)

# 3. Build con keystore personalizado
npm run build-android-release
```

### ✅ Verificación Final

```powershell
# Verificar que la APK está firmada correctamente
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
# ✅ Debería mostrar: "jar verified."

# Instalar en dispositivo/emulador
adb install android/app/build/outputs/apk/release/app-release.apk
# ✅ Debería instalar sin errores
```

### 🚨 Si Hay Problemas

```powershell
# Regenerar todo desde cero
npm run clean
Remove-Item -Recurse -Force android -ErrorAction Ignore
Remove-Item -Recurse -Force www -ErrorAction Ignore
npm run copy-www
npx cap add android
echo "sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > android/local.properties
npx cap sync android
npm run build-android-release
```

**¡Eso es todo!** Tu APK de release está lista para distribuir. 🎉
```bash
npm run build-android
```

### Step 4: Install on Android Device
1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging** and **Install Unknown Apps**
3. Transfer APK to device and install

## 📁 Project Structure
```
Fantasy-Map-Generator-Ck3/
├── android/                 # Generated Android project (git ignored)
├── www/                     # Generated web assets for mobile (git ignored)
├── dist/                    # Generated desktop builds (git ignored)
├── components/              # UI components
├── modules/                 # Core functionality  
├── styles/                  # CSS styles
├── images/                  # Assets and icons
├── capacitor.config.ts      # Mobile app configuration
├── electron-main.js         # Desktop app entry point
└── package.json            # Dependencies and scripts
```

## 🛠️ Technologies Used
- **Electron** - Desktop applications
- **Capacitor** - Mobile applications
- **Express** - Local server for Electron
- **Gradle** - Android build system

## 📋 Build Requirements

### For Windows (.exe)
- Windows OS
- Node.js 16+
- PowerShell

### For Linux Application
- Linux OS or WSL
- Node.js 16+

### For Android (.apk)
- Windows/Linux/macOS
- Android Studio with SDK
- Java JDK 8 or higher
- Android SDK Build Tools
- Node.js 16+

## 🚨 Troubleshooting

### Desktop Build Issues
```bash
# If Electron not found
npm install

# If permission errors (Windows)
# Run PowerShell as Administrator

# Clean and rebuild
npm run clean-build
```

### Android Build Issues

#### SDK not found
```bash
# Check if ANDROID_HOME is set
echo $env:ANDROID_HOME

# If empty, set it:
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")
```

#### Gradle errors
```bash
# Check Java version
java -version

# Should show Java 8 or higher
# If not installed, download from: https://adoptium.net/
```

#### Build fails after changes
```bash
# Clean everything and start fresh
npm run clean
npm run build-android
```

#### Gradlew permission errors
```bash
# In android folder:
cd android
icacls gradlew.bat /grant:r %USERNAME%:F
```

## 📦 Distribution

### Desktop Applications
- **Windows**: Distribute the `.exe` file from `dist/fantasy-map-generator-win32-x64/`
- **Linux**: Distribute the executable from `dist/fantasy-map-generator-linux-x64/`

### Android Application
- **Debug**: Use `app-debug.apk` for testing
- **Release**: Use `app-release.apk` for distribution (requires signing for Play Store)

## 🔄 Development Workflow

### First Time Setup
```bash
git clone <repository>
cd Fantasy-Map-Generator-Ck3
npm install
```

### Building for Distribution
```bash
# Clean previous builds
npm run clean

# Build desktop versions
npm run build-desktop

# Build Android (if needed)
npm run build-android
```

### Testing Builds
```bash
# Test desktop version
npm run electron

# Test Android in emulator
npm run open-android
# Then use Android Studio's emulator
```

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License
This project maintains the same license as the original Azgaar's Fantasy Map Generator.

## 🙏 Credits
- **Original Fantasy Map Generator** by [Azgaar](https://github.com/Azgaar/Fantasy-Map-Generator)
- **Desktop & Mobile conversion** - Community contribution

## 📞 Support
If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Try cleaning and rebuilding: `npm run clean-build`
4. Open an issue with error details and your system info
