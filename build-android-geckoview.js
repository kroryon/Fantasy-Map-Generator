#!/usr/bin/env node

/**
 * Script de compilación automática para Fantasy Map Generator con GeckoView
 * Este script automatiza todo el proceso de compilación con GeckoView
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🦎 Fantasy Map Generator - Compilación con GeckoView');
console.log('====================================================');

// Función para ejecutar comandos
function runCommand(command, description) {
    console.log(`\n📋 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit', cwd: process.cwd() });
        console.log(`✅ ${description} completado`);
    } catch (error) {
        console.error(`❌ Error en: ${description}`);
        console.error(error.message);
        process.exit(1);
    }
}

// Verificar que estemos en el directorio correcto
if (!fs.existsSync('package.json') || !fs.existsSync('android')) {
    console.error('❌ Error: Este script debe ejecutarse desde la raíz del proyecto');
    process.exit(1);
}

// Pasos de compilación
const steps = [
    {
        command: 'npm run copy-www',
        description: 'Copiando archivos web a www/'
    },
    {
        command: 'npx cap sync android',
        description: 'Sincronizando con Capacitor Android'
    },
    {
        command: 'cd android && .\\gradlew assembleDebug',
        description: 'Compilando APK con GeckoView'
    }
];

console.log('\n🚀 Iniciando proceso de compilación...\n');

// Ejecutar cada paso
steps.forEach((step, index) => {
    console.log(`[${index + 1}/${steps.length}] ${step.description}`);
    runCommand(step.command, step.description);
});

// Verificar que el APK se creó
const apkPath = path.join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (fs.existsSync(apkPath)) {
    const stats = fs.statSync(apkPath);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log('\n🎉 ¡Compilación exitosa!');
    console.log('========================');
    console.log(`📱 APK generado: ${apkPath}`);
    console.log(`📊 Tamaño: ${fileSizeMB} MB`);
    console.log(`🕒 Modificado: ${stats.mtime.toLocaleString()}`);
    console.log('\n🔧 Características:');
    console.log('   ✓ Motor GeckoView (Firefox)');
    console.log('   ✓ Optimizado para móviles');
    console.log('   ✓ Dropdowns mejorados');
    console.log('   ✓ Scrolling nativo');
} else {
    console.error('❌ Error: No se pudo encontrar el APK generado');
    process.exit(1);
}
