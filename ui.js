/**
 * UI interactions and DOM manipulation
 */

class UI {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.renderFileList();
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
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.newFileBtn.addEventListener('click', () => this.createNewFile());
        this.saveBtn.addEventListener('click', () => this.saveCurrentFile());
        this.deleteBtn.addEventListener('click', () => this.deleteCurrentFile());
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
            editor.loadFile(file);
            this.highlightActiveFile(file.name);
        } else {
            alert('File already exists!');
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
            this.updateFileNameDisplay(file.name);
            editor.loadFile(file);
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
    confirm(message) {
        return window.confirm(message);
    }
}

// Create a single instance of UI
const ui = new UI();