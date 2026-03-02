/**
 * WebContainer Core integration for full-stack web environment
 */

class WebContainerManager {
    constructor() {
        this.webContainer = null;
        this.isRunning = false;
        this.projectFiles = new Map();
        this.servers = new Map();
        this.consoleOutput = [];
        this.webContainerUrl = 'http://localhost:3131';
    }

    /**
     * Initialize WebContainer
     */
    async initialize() {
        try {
            if (!window.WebContainer) {
                throw new Error('WebContainer is not available');
            }

            console.log('Initializing WebContainer...');
            this.webContainer = await window.WebContainer.boot();
            console.log('WebContainer initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize WebContainer:', error);
            ui.logToConsole(`❌ Failed to initialize WebContainer: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Synchronize files with WebContainer
     */
    async syncFiles() {
        try {
            const files = storage.getAllFiles();
            const fileSystem = {};

            // Build file system structure for WebContainer
            files.forEach(file => {
                const paths = file.name.split('/');
                let current = fileSystem;
                
                paths.forEach((part, index) => {
                    if (index === paths.length - 1) {
                        // Last part is the file
                        current[part] = {
                            file: {
                                contents: file.content
                            }
                        };
                    } else {
                        // Create directory if doesn't exist
                        if (!current[part]) {
                            current[part] = {
                                directory: {}
                            };
                        }
                        current = current[part].directory;
                    }
                });
            });

            // Check if we have a package.json file
            const hasPackageJson = files.some(file => file.name === 'package.json');

            // Create minimal package.json if none exists (for demo purposes)
            if (!hasPackageJson) {
                fileSystem['package.json'] = {
                    file: {
                        contents: JSON.stringify({
                            name: 'webcontainer-app',
                            version: '1.0.0',
                            description: 'Web application running in WebContainer',
                            main: 'index.js',
                            scripts: {
                                'start': 'node index.js',
                                'dev': 'node index.js'
                            },
                            dependencies: {}
                        }, null, 2)
                    }
                };
            }

            // Mount file system
            await this.webContainer.mount(fileSystem);
            console.log('File system synchronized');
            ui.logToConsole('✅ File system synchronized with WebContainer', 'info');
            return true;
        } catch (error) {
            console.error('Failed to sync files:', error);
            ui.logToConsole(`❌ Failed to sync files: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Run npm install
     */
    async runNpmInstall() {
        try {
            ui.logToConsole('📦 Running npm install...', 'info');
            
            const installProcess = await this.webContainer.spawn('npm', ['install']);
            let output = '';

            installProcess.output.pipeTo(new WritableStream({
                write(data) {
                    output += data;
                    ui.logToConsole(data, 'info');
                }
            }));

            const exitCode = await installProcess.exit;
            
            if (exitCode === 0) {
                ui.logToConsole('✅ npm install completed successfully', 'success');
                return true;
            } else {
                ui.logToConsole(`❌ npm install failed with exit code ${exitCode}`, 'error');
                return false;
            }
        } catch (error) {
            console.error('Failed to run npm install:', error);
            ui.logToConsole(`❌ npm install failed: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Run npm start
     */
    async runNpmStart() {
        try {
            ui.logToConsole('🚀 Starting application...', 'info');
            
            const startProcess = await this.webContainer.spawn('npm', ['start']);
            this.isRunning = true;

            startProcess.output.pipeTo(new WritableStream({
                write(data) {
                    ui.logToConsole(data, 'info');
                    
                    // Check for server start messages
                    if (data.includes('Listening on') || data.includes('Server started') || data.includes('http://')) {
                        const portMatch = data.match(/(\d+)/);
                        if (portMatch) {
                            const port = parseInt(portMatch[0]);
                            ui.logToConsole(`🌐 Application running on http://localhost:${port}`, 'success');
                            this.openPreview(port);
                        }
                    }
                }
            }));

            startProcess.exit.then(exitCode => {
                this.isRunning = false;
                ui.logToConsole(`⚠️  Application stopped with exit code ${exitCode}`, 'warning');
            });

            return true;
        } catch (error) {
            console.error('Failed to run npm start:', error);
            ui.logToConsole(`❌ Failed to start application: ${error.message}`, 'error');
            this.isRunning = false;
            return false;
        }
    }

    /**
     * Open preview for the running application
     */
    async openPreview(port) {
        try {
            // Expose port from WebContainer to browser
            const server = await this.webContainer.spawn('node', ['-e', `
                const http = require('http');
                const proxy = http.createServer((req, res) => {
                    const options = {
                        hostname: 'localhost',
                        port: ${port},
                        path: req.url,
                        method: req.method,
                        headers: req.headers
                    };

                    const proxyReq = http.request(options, (proxyRes) => {
                        res.writeHead(proxyRes.statusCode, proxyRes.headers);
                        proxyRes.pipe(res);
                    });

                    req.pipe(proxyReq);
                });

                proxy.listen(3131);
                console.log('Proxy server running on port 3131');
            `]);

            this.servers.set(port, server);
            ui.logToConsole(`📡 Proxy server created for port ${port}`, 'info');

            // Open preview
            setTimeout(() => {
                ui.openWebContainerPreview();
            }, 1000);
        } catch (error) {
            console.error('Failed to create preview proxy:', error);
            ui.logToConsole(`❌ Failed to create preview proxy: ${error.message}`, 'error');
        }
    }

    /**
     * Stop all running processes
     */
    async stop() {
        try {
            ui.logToConsole('⏹️ Stopping application...', 'info');
            
            // Kill all running servers
            for (const [port, server] of this.servers) {
                await server.kill();
                this.servers.delete(port);
            }

            // Stop all running processes
            const processes = await this.webContainer.spawn('pkill', ['-f', 'node']);
            await processes.exit;

            this.isRunning = false;
            ui.logToConsole('✅ Application stopped', 'success');
            return true;
        } catch (error) {
            console.error('Failed to stop:', error);
            ui.logToConsole(`❌ Failed to stop: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Restart the application
     */
    async restart() {
        ui.logToConsole('🔄 Restarting application...', 'info');
        await this.stop();
        await this.syncFiles();
        await this.runNpmInstall();
        await this.runNpmStart();
    }

    /**
     * Check if WebContainer is available
     */
    static isWebContainerAvailable() {
        return typeof window.WebContainer !== 'undefined';
    }

    /**
     * Check if project is complex (needs WebContainer)
     */
    static isComplexProject() {
        const files = storage.getAllFiles();
        return files.some(file => 
            file.name === 'package.json' || 
            file.name.endsWith('.json') && file.name.includes('package') ||
            files.some(f => f.name.endsWith('.js') && f.content.includes('require') || f.content.includes('import'))
        );
    }

    /**
     * Execute a command in WebContainer
     */
    async executeCommand(command, args = []) {
        try {
            const process = await this.webContainer.spawn(command, args);
            let output = '';

            process.output.pipeTo(new WritableStream({
                write(data) {
                    output += data;
                    ui.logToConsole(data, 'info');
                }
            }));

            const exitCode = await process.exit;
            
            if (exitCode === 0) {
                return { success: true, output };
            } else {
                return { success: false, output, exitCode };
            }
        } catch (error) {
            console.error('Failed to execute command:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get file from WebContainer
     */
    async getFile(filePath) {
        try {
            const content = await this.webContainer.fs.readFile(filePath, 'utf8');
            return content;
        } catch (error) {
            console.error('Failed to read file:', error);
            return null;
        }
    }

    /**
     * Write file to WebContainer
     */
    async writeFile(filePath, content) {
        try {
            const dirPath = filePath.split('/').slice(0, -1).join('/');
            if (dirPath) {
                try {
                    await this.webContainer.fs.mkdir(dirPath, { recursive: true });
                } catch (error) {
                    // Directory might already exist
                }
            }
            
            await this.webContainer.fs.writeFile(filePath, content);
            return true;
        } catch (error) {
            console.error('Failed to write file:', error);
            return false;
        }
    }

    /**
     * Delete file from WebContainer
     */
    async deleteFile(filePath) {
        try {
            await this.webContainer.fs.unlink(filePath);
            return true;
        } catch (error) {
            console.error('Failed to delete file:', error);
            return false;
        }
    }

    /**
     * List directory contents
     */
    async listDirectory(dirPath = '/') {
        try {
            const contents = await this.webContainer.fs.readdir(dirPath, { withFileTypes: true });
            return contents;
        } catch (error) {
            console.error('Failed to list directory:', error);
            return [];
        }
    }
}

// Initialize WebContainer Manager instance
const webContainerManager = new WebContainerManager();
