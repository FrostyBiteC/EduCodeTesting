/**
 * UI interactions and DOM manipulation
 */

class UI {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.renderFileList();
        this.initializeTabs();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.fileExplorer = document.querySelector('.file-explorer');
        this.fileList = document.getElementById('fileList');
        this.newFileBtn = document.getElementById('newFileBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        this.fileNameDisplay = document.getElementById('fileName');
        this.tabsContainer = document.getElementById('tabsContainer');
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        this.formatBtn = document.getElementById('formatBtn');
        this.previewBtn = document.getElementById('previewBtn');
        this.themeBtn = document.getElementById('themeBtn');
        this.importBtn = document.getElementById('importBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.previewPanel = document.getElementById('previewPanel');
        this.closePreviewBtn = document.getElementById('closePreviewBtn');
        this.consolePanel = document.getElementById('consolePanel');
        this.clearConsoleBtn = document.getElementById('clearConsoleBtn');
        this.closeConsoleBtn = document.getElementById('closeConsoleBtn');
        this.consoleOutput = document.getElementById('consoleOutput');
        this.consoleInput = document.getElementById('consoleInput');
        this.hamburgerBtn = document.getElementById('hamburgerBtn');
        
        // WebContainer controls
        this.webcontainerStartBtn = document.getElementById('webcontainerStartBtn');
        this.webcontainerStopBtn = document.getElementById('webcontainerStopBtn');
        this.webcontainerRestartBtn = document.getElementById('webcontainerRestartBtn');
        this.npmInstallBtn = document.getElementById('npmInstallBtn');
    }

    /**
     * Bind event listeners
     */
    /**
     * Bind event listeners
     */
    bindEvents() {
        this.newFileBtn.addEventListener('click', () => this.createNewFile());
        this.saveBtn.addEventListener('click', () => this.saveCurrentFile());
        this.deleteBtn.addEventListener('click', () => this.deleteCurrentFile());
        this.undoBtn.addEventListener('click', () => editor.undo());
        this.redoBtn.addEventListener('click', () => editor.redo());
        this.formatBtn.addEventListener('click', () => editor.formatDocument());
        this.previewBtn.addEventListener('click', () => this.togglePreview());
        this.themeBtn.addEventListener('click', () => editor.toggleTheme());
        this.importBtn.addEventListener('click', () => this.importFile());
        this.exportBtn.addEventListener('click', () => this.exportFile());
        this.closePreviewBtn.addEventListener('click', () => this.togglePreview());
        this.clearConsoleBtn.addEventListener('click', () => editor.clearConsole());
        this.closeConsoleBtn.addEventListener('click', () => this.toggleConsole());
        this.consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const code = this.consoleInput.value.trim();
                if (code) {
                    editor.evaluateJavaScript(code);
                    this.consoleInput.value = '';
                }
            }
        });

        // Mobile events
        this.hamburgerBtn.addEventListener('click', () => this.toggleFileExplorer());

        // WebContainer events
        this.webcontainerStartBtn.addEventListener('click', () => this.startWebContainer());
        this.webcontainerStopBtn.addEventListener('click', () => this.stopWebContainer());
        this.webcontainerRestartBtn.addEventListener('click', () => this.restartWebContainer());
        this.npmInstallBtn.addEventListener('click', () => this.runNpmInstall());

        // Handle window resize for responsive behavior
        window.addEventListener('resize', () => this.handleWindowResize());
    }

    /**
     * Create a new file
     */
    createNewFile() {
        const fileName = prompt('Enter file name:');
        if (!fileName) {
            return;
        }

        const validation = fileManager.validateFileName(fileName);
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }

        const language = fileManager.getLanguageFromFileName(fileName);
        const file = fileManager.createFile(fileName, '', language);
        
        if (file) {
            this.renderFileList();
            this.updateFileNameDisplay(file.name);
            editor.openFileInTab(file);
            this.highlightActiveFile(file.name);
        } else {
            alert('File already exists!');
        }
    }

    /**
     * Log to console
     */
    logToConsole(message, type = 'info') {
        const logElement = document.createElement('div');
        logElement.className = `console-log console-log-${type}`;
        logElement.textContent = message;
        this.consoleOutput.appendChild(logElement);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    /**
     * Start WebContainer
     */
    async startWebContainer() {
        try {
            this.logToConsole('Initializing WebContainer...', 'info');
            
            // Check if WebContainer is available
            if (!WebContainerManager.isWebContainerAvailable()) {
                this.logToConsole('WebContainer is not available in this browser', 'error');
                return;
            }

            // Initialize WebContainer
            const initialized = await webContainerManager.initialize();
            if (!initialized) {
                return;
            }

            // Sync files
            const synced = await webContainerManager.syncFiles();
            if (!synced) {
                return;
            }

            // Check if project is complex
            if (WebContainerManager.isComplexProject()) {
                this.logToConsole('Detected complex project - installing dependencies...', 'info');
                const installSuccess = await webContainerManager.runNpmInstall();
                if (!installSuccess) {
                    return;
                }

                // Start application
                const startSuccess = await webContainerManager.runNpmStart();
                if (!startSuccess) {
                    return;
                }
            } else {
                this.logToConsole('Simple project detected - using Blob Method for preview', 'info');
                this.logToConsole('Create a package.json file to use WebContainer features', 'info');
            }

            this.updateWebContainerUI();
        } catch (error) {
            this.logToConsole(`Error starting WebContainer: ${error.message}`, 'error');
            console.error('WebContainer startup error:', error);
        }
    }

    /**
     * Stop WebContainer
     */
    async stopWebContainer() {
        try {
            await webContainerManager.stop();
            this.updateWebContainerUI();
        } catch (error) {
            this.logToConsole(`Error stopping WebContainer: ${error.message}`, 'error');
            console.error('WebContainer stop error:', error);
        }
    }

    /**
     * Restart WebContainer
     */
    async restartWebContainer() {
        try {
            await webContainerManager.restart();
            this.updateWebContainerUI();
        } catch (error) {
            this.logToConsole(`Error restarting WebContainer: ${error.message}`, 'error');
            console.error('WebContainer restart error:', error);
        }
    }

    /**
     * Run npm install
     */
    async runNpmInstall() {
        try {
            // Initialize WebContainer if not already initialized
            if (!webContainerManager.webContainer) {
                await webContainerManager.initialize();
            }

            // Sync files before installing
            await webContainerManager.syncFiles();
            
            await webContainerManager.runNpmInstall();
        } catch (error) {
            this.logToConsole(`Error running npm install: ${error.message}`, 'error');
            console.error('npm install error:', error);
        }
    }

    /**
     * Update WebContainer UI state
     */
    updateWebContainerUI() {
        const isRunning = webContainerManager.isRunning;
        
        this.webcontainerStartBtn.disabled = isRunning;
        this.webcontainerStopBtn.disabled = !isRunning;
        this.webcontainerRestartBtn.disabled = !webContainerManager.webContainer;
        this.npmInstallBtn.disabled = !webContainerManager.webContainer;

        // Add visual feedback
        if (isRunning) {
            this.webcontainerStartBtn.classList.add('btn-disabled');
            this.webcontainerStopBtn.classList.remove('btn-disabled');
            this.webcontainerStopBtn.classList.add('btn-active');
        } else {
            this.webcontainerStartBtn.classList.remove('btn-disabled');
            this.webcontainerStopBtn.classList.remove('btn-active');
            this.webcontainerStopBtn.classList.add('btn-disabled');
        }
    }

    /**
     * Open WebContainer preview
     */
    openWebContainerPreview() {
        try {
            const previewFrame = document.getElementById('previewFrame');
            previewFrame.src = 'http://localhost:3131';
            this.previewPanel.classList.remove('hidden');
            this.logToConsole('Preview window opened for WebContainer application', 'success');
        } catch (error) {
            this.logToConsole(`Error opening preview: ${error.message}`, 'error');
            console.error('Preview error:', error);
        }
    }

    /**
     * Save current file
     */
    saveCurrentFile() {
        const currentFile = fileManager.getCurrentFile();
        if (!currentFile) {
            alert('No file open');
            return;
        }

        const content = editor.getContent();
        const success = fileManager.saveCurrentFile(content);
        
        if (success) {
            this.updateFileNameDisplay(currentFile.name, false);
            this.renderFileList();
        } else {
            alert('Failed to save file');
        }
    }

    /**
     * Delete current file
     */
    deleteCurrentFile() {
        const currentFile = fileManager.getCurrentFile();
        if (!currentFile) {
            alert('No file open');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${currentFile.name}?`)) {
            return;
        }

        const success = fileManager.deleteFile(currentFile.name);
        if (success) {
            this.renderFileList();
            this.updateFileNameDisplay('No file open');
            editor.clear();
        } else {
            alert('Failed to delete file');
        }
    }

    /**
     * Render the file list
     */
    renderFileList() {
        const files = fileManager.getAllFiles();
        this.fileList.innerHTML = '';

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.fileName = file.name;

            fileItem.innerHTML = `
                <div class="file-name">${this.escapeHtml(file.name)}</div>
                <div class="delete-file" data-file-name="${file.name}">×</div>
            `;

            fileItem.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-file')) {
                    e.stopPropagation();
                    this.deleteFile(file.name);
                } else {
                    this.openFile(file.name);
                }
            });

            this.fileList.appendChild(fileItem);
        });

        this.highlightActiveFile();
    }

    /**
     * Open a file
     * @param {string} fileName - File name to open
     */
    openFile(fileName) {
        const file = fileManager.openFile(fileName);
        if (file) {
            editor.openFileInTab(file);
            this.updateFileNameDisplay(file.name);
            this.highlightActiveFile(file.name);
        }
    }

    /**
     * Delete a file
     * @param {string} fileName - File name to delete
     */
    deleteFile(fileName) {
        if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
            return;
        }

        const success = fileManager.deleteFile(fileName);
        if (success) {
            this.renderFileList();
            if (fileManager.getCurrentFile() === null) {
                this.updateFileNameDisplay('No file open');
                editor.clear();
            }
        } else {
            alert('Failed to delete file');
        }
    }

    /**
     * Update the file name display
     * @param {string} fileName - File name to display
     * @param {boolean} isDirty - Whether the file has unsaved changes
     */
    updateFileNameDisplay(fileName, isDirty = false) {
        this.fileNameDisplay.textContent = fileName;
        if (isDirty) {
            this.fileNameDisplay.textContent += ' *';
        }
    }

    /**
     * Highlight the active file in the file list
     * @param {string} fileName - File name to highlight
     */
    highlightActiveFile(fileName = null) {
        const activeFileName = fileName || (fileManager.getCurrentFile()?.name || null);
        
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.toggle('active', item.dataset.fileName === activeFileName);
        });
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning)
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107'};
        `;

        document.body.appendChild(notification);

        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&',
            '<': '<',
            '>': '>',
            '"': '"',
            "'": '&#039;'
        };
        return text.replace(/[&<>"]/g, m => map[m]);
    }

    /**
     * Show an alert dialog
     * @param {string} message - Alert message
     */
    alert(message) {
        window.alert(message);
    }

    /**
     * Show a confirm dialog
     * @param {string} message - Confirm message
     * @returns {boolean} True if user confirmed, false otherwise
     */
    /**
     * Initialize tabs
     */
    initializeTabs() {
        this.updateTabs();
    }

    /**
     * Update tabs
     */
    updateTabs() {
        const tabs = editor.getOpenTabs();
        this.tabsContainer.innerHTML = '';
        
        tabs.forEach(file => {
            const tab = document.createElement('div');
            tab.className = `tab ${fileManager.getCurrentFile()?.name === file.name ? 'active' : ''}`;
            tab.dataset.fileName = file.name;
            
            tab.innerHTML = `
                <span class="tab-name">${this.escapeHtml(file.name)}</span>
                <span class="tab-close">×</span>
            `;
            
            tab.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-close')) {
                    e.stopPropagation();
                    editor.closeTab(file.name);
                } else {
                    this.openFile(file.name);
                }
            });
            
            this.tabsContainer.appendChild(tab);
        });
    }

    /**
     * Toggle preview panel
     */
    togglePreview() {
        this.previewPanel.classList.toggle('hidden');
        if (!this.previewPanel.classList.contains('hidden')) {
            editor.livePreview();
            // Close file explorer if open on mobile
            if (this.fileExplorer.classList.contains('visible')) {
                this.fileExplorer.classList.remove('visible');
            }
        }
    }

    /**
     * Toggle console panel
     */
    toggleConsole() {
        this.consolePanel.classList.toggle('hidden');
        // Close file explorer if open on mobile
        if (!this.consolePanel.classList.contains('hidden') && this.fileExplorer.classList.contains('visible')) {
            this.fileExplorer.classList.remove('visible');
        }
    }

    /**
     * Update console
     */
    updateConsole() {
        const logs = editor.getConsoleOutput();
        this.consoleOutput.innerHTML = '';
        
        logs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = `console-log ${log.type}`;
            logElement.textContent = `[${log.timestamp}] ${log.message}`;
            this.consoleOutput.appendChild(logElement);
        });
        
        // Scroll to bottom
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    /**
     * Import file
     */
    importFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*.*';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const content = event.target.result;
                const language = fileManager.getLanguageFromFileName(file.name);
                
                const existingFile = fileManager.getFile(file.name);
                if (existingFile) {
                    if (!confirm(`File ${file.name} already exists. Do you want to replace it?`)) {
                        return;
                    }
                    fileManager.saveFile(file.name, content);
                } else {
                    fileManager.createFile(file.name, content, language);
                }
                
                this.renderFileList();
                this.openFile(file.name);
                this.showNotification(`File imported: ${file.name}`);
            };
            
            reader.readAsText(file);
        });
        
        input.click();
    }

    /**
     * Export file
     */
    exportFile() {
        const currentFile = fileManager.getCurrentFile();
        if (!currentFile) {
            alert('No file open');
            return;
        }
        
        const content = editor.getContent();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFile.name;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification(`File exported: ${currentFile.name}`);
    }

    /**
     * Toggle file explorer visibility
     */
    toggleFileExplorer() {
        this.fileExplorer.classList.toggle('visible');
        
        // Close other panels if open
        if (this.previewPanel && !this.previewPanel.classList.contains('hidden')) {
            this.togglePreview();
        }
        if (this.consolePanel && !this.consolePanel.classList.contains('hidden')) {
            this.toggleConsole();
        }
    }

    /**
     * Handle window resize for responsive behavior
     */
    handleWindowResize() {
        const width = window.innerWidth;
        
        // Auto-hide file explorer on small screens when resizing
        if (width > 768 && this.fileExplorer.classList.contains('visible')) {
            this.fileExplorer.classList.remove('visible');
        }
        
        // Adjust UI elements based on screen size
        if (width <= 480) {
            // Mobile-specific adjustments
            this.adjustForMobile();
        } else if (width <= 768) {
            // Tablet-specific adjustments
            this.adjustForTablet();
        } else {
            // Desktop-specific adjustments
            this.adjustForDesktop();
        }
    }

    /**
     * Adjust UI for mobile screens
     */
    adjustForMobile() {
        // Ensure panels are properly positioned
        if (this.previewPanel) {
            this.previewPanel.style.width = '100%';
        }
        if (this.consolePanel) {
            this.consolePanel.style.width = '100%';
        }
    }

    /**
     * Adjust UI for tablet screens
     */
    adjustForTablet() {
        // Ensure panels are properly positioned
        if (this.previewPanel) {
            this.previewPanel.style.width = '100%';
        }
        if (this.consolePanel) {
            this.consolePanel.style.width = '100%';
        }
    }

    /**
     * Adjust UI for desktop screens
     */
    adjustForDesktop() {
        // Restore default panel widths
        if (this.previewPanel) {
            this.previewPanel.style.width = '400px';
        }
        if (this.consolePanel) {
            this.consolePanel.style.width = '400px';
        }
    }

    confirm(message) {
        return window.confirm(message);
    }
}

// Create a single instance of UI
const ui = new UI();