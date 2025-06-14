const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { URL } = require('url');

let mainWindow;
let server;
let isPortableMode = false;

// Intenta cargar express de forma segura
let express;
try {
  express = require('express');
} catch (error) {
  console.log('Express no está disponible, se usará un servidor HTTP básico en su lugar');
}

function createWindow() {
  // Crear la ventana principal de la aplicación
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'images/icons/icon_x512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Necesario para cargar recursos locales
      allowRunningInsecureContent: true
    },
    show: false // No mostrar hasta que esté lista
  });

  if (express) {
    // Si express está disponible, usamos el servidor express
    createExpressServer();
  } else {
    // Si express no está disponible (versión portable), usamos un servidor HTTP básico
    createBasicServer();
  }

  // Configurar el menú
  createMenu();

  // Manejar links externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Manejar el evento de cerrar ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (server) {
      server.close();
    }
  });

  // Manejar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error al cargar:', errorCode, errorDescription);
  });

  // Abrir DevTools en modo desarrollo
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

function createExpressServer() {
  // Crear servidor Express local
  const expressApp = express();
  
  // Servir archivos estáticos desde el directorio actual
  expressApp.use(express.static(__dirname, {
    setHeaders: (res, path) => {
      // Configurar headers apropiados para diferentes tipos de archivo
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (path.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
      }
    }
  }));

  // Iniciar el servidor en un puerto disponible
  server = expressApp.listen(0, 'localhost', () => {
    const port = server.address().port;
    console.log(`Servidor Express iniciado en puerto ${port}`);
    
    // Cargar la aplicación
    mainWindow.loadURL(`http://localhost:${port}`);
    
    // Mostrar la ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      
      // Enfocar la ventana
      if (process.platform === 'darwin') {
        app.dock.show();
      }
    });
  });
}

function createBasicServer() {
  const urlModule = require('url');
  const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'application/jpeg',
      '.gif': 'image/gif',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.gz': 'application/gzip',
      '.map': 'application/octet-stream'
    };
    return types[ext] || 'application/octet-stream';
  };

  server = http.createServer((req, res) => {
    const pathname = urlModule.parse(req.url).pathname;
    const safePath = pathname === '/' ? 'index.html' : pathname;
    const filePath = path.join(__dirname, safePath);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(`Error loading file: ${filePath}`, err.message);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
      res.end(data);
    });
  });

  server.listen(0, 'localhost', () => {
    const port = server.address().port;
    console.log(`Servidor HTTP iniciado en puerto ${port}`);
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      console.log('Ventana mostrada');
    });
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('Error cargando página:', errorCode, errorDescription, validatedURL);
    });
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  server.on('error', (err) => {
    console.error('Error en el servidor:', err);
  });
}

// Función para manejar solicitudes POST
function handlePostRequest(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
    // Limitar el tamaño del cuerpo para evitar ataques de desbordamiento
    if (body.length > 1e6) {
      body = "";
      res.writeHead(413);
      res.end('Payload Too Large');
      req.connection.destroy();
    }
  });
  
  req.on('end', () => {
    try {
      console.log(`Procesando solicitud POST: ${req.url}`);
      const urlObj = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(urlObj.pathname);
      
      // Manejar distintos endpoints POST
      if (pathname === '/api/save') {
        // Simular guardado local para versión portable
        console.log('Simulando guardado local...');
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: "Archivo guardado localmente" }));
      } else if (pathname.startsWith('/api/')) {
        // Manejar otras API endpoints
        handleApiRequest(req, res, pathname, body);
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, message: "Endpoint no encontrado" }));
      }
    } catch (error) {
      console.error(`Error al procesar solicitud POST:`, error);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, message: error.message }));
    }
  });
}

// Función para manejar solicitudes API
function handleApiRequest(req, res, pathname, body = null) {
  console.log(`Manejando API request: ${pathname}`);
  
  // Implementar simulaciones de API específicas según sea necesario
  if (pathname === '/api/version') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ version: "2.1.0-portable" }));
  } else if (pathname === '/api/debug') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ 
      portable: true, 
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron
    }));
  } else {
    // Endpoint API no implementado
    res.writeHead(501);
    res.end(JSON.stringify({ success: false, message: "API no implementada en modo portable" }));
  }
}

function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nuevo Mapa',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.executeJavaScript('location.reload()');
          }
        },
        {
          label: 'Abrir Mapa...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Archivos de Mapa', extensions: ['map', 'gz'] },
                { name: 'Todos los archivos', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0];
              // Aquí podrías implementar la carga del archivo
              console.log('Archivo seleccionado:', filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar Recarga' },
        { role: 'toggleDevTools', label: 'Herramientas de Desarrollador' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla Completa' }
      ]
    },
    {
      label: 'Ventana',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Cerrar' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de Fantasy Map Generator',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de',
              message: 'Fantasy Map Generator',
              detail: 'Generador de mapas fantásticos de Azgaar\\nVersión de Escritorio\\n\\nCreado por Azgaar\\nPortado a Electron'
            });
          }
        },
        {
          label: 'GitHub',
          click: () => {
            shell.openExternal('https://github.com/Azgaar/Fantasy-Map-Generator');
          }
        }
      ]
    }
  ];

  // Ajustes específicos para macOS
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'Acerca de ' + app.getName() },
        { type: 'separator' },
        { role: 'services', label: 'Servicios' },
        { type: 'separator' },
        { role: 'hide', label: 'Ocultar ' + app.getName() },
        { role: 'hideothers', label: 'Ocultar Otros' },
        { role: 'unhide', label: 'Mostrar Todo' },
        { type: 'separator' },
        { role: 'quit', label: 'Salir de ' + app.getName() }
      ]
    });

    // Menú Ventana en macOS
    template[4].submenu = [
      { role: 'close', label: 'Cerrar' },
      { role: 'minimize', label: 'Minimizar' },
      { role: 'zoom', label: 'Zoom' },
      { type: 'separator' },
      { role: 'front', label: 'Traer Todo al Frente' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Este método será llamado cuando Electron haya terminado la inicialización
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // En macOS, re-crear una ventana cuando se hace clic en el icono del dock
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas están cerradas
app.on('window-all-closed', () => {
  // Cerrar el servidor si existe
  if (server) {
    try {
      server.close();
      console.log('Servidor HTTP cerrado correctamente.');
    } catch (error) {
      console.error('Error al cerrar el servidor:', error);
    }
  }
  
  // En macOS, es común que las aplicaciones permanezcan activas hasta que el usuario salga explícitamente
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Asegurarse de que el servidor se cierre al salir
app.on('will-quit', () => {
  if (server) {
    try {
      server.close();
      console.log('Servidor HTTP cerrado al salir.');
    } catch (error) {
      console.error('Error al cerrar el servidor durante el cierre:', error);
    }
  }
});

// Manejar el evento de segunda instancia (solo una instancia)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Alguien intentó ejecutar una segunda instancia, enfocar nuestra ventana
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
