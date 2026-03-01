/**
 * File CRUD operations
 */

class FileManager {
    constructor() {
        this.currentFile = null;
    }

    /**
     * Create a new file
     * @param {string} fileName - File name
     * @param {string} content - Initial content (optional)
     * @param {string} language - File language (optional)
     * @returns {Object} Created file object
     */
    createFile(fileName, content = '', language = 'plaintext') {
        const file = {
            name: fileName,
            content: content,
            language: language,
            lastModified: new Date().toISOString()
        };

        const success = storage.addFile(file);
        if (success) {
            this.currentFile = file;
            return file;
        }

        return null;
    }

    /**
     * Open a file
     * @param {string} fileName - File name to open
     * @returns {Object|null} File object or null if not found
     */
    openFile(fileName) {
        const file = storage.getFile(fileName);
        if (file) {
            this.currentFile = file;
            return file;
        }
        return null;
    }

    /**
     * Save the current file
     * @param {string} content - New content to save
     * @returns {boolean} True if save was successful
     */
    saveCurrentFile(content) {
        if (!this.currentFile) {
            return false;
        }

        const success = storage.updateFile(this.currentFile.name, {
            content: content,
            lastModified: new Date().toISOString()
        });

        if (success) {
            this.currentFile.content = content;
            this.currentFile.lastModified = new Date().toISOString();
        }

        return success;
    }

    /**
     * Save a file by name
     * @param {string} fileName - File name to save
     * @param {string} content - New content to save
     * @returns {boolean} True if save was successful
     */
    saveFile(fileName, content) {
        const success = storage.updateFile(fileName, {
            content: content,
            lastModified: new Date().toISOString()
        });

        if (success && this.currentFile && this.currentFile.name === fileName) {
            this.currentFile.content = content;
            this.currentFile.lastModified = new Date().toISOString();
        }

        return success;
    }

    /**
     * Delete a file
     * @param {string} fileName - File name to delete
     * @returns {boolean} True if deletion was successful
     */
    deleteFile(fileName) {
        const success = storage.deleteFile(fileName);
        if (success && this.currentFile && this.currentFile.name === fileName) {
            this.currentFile = null;
        }
        return success;
    }

    /**
     * Get all files
     * @returns {Array} Array of file objects
     */
    getAllFiles() {
        return storage.getAllFiles();
    }

    /**
     * Get current file
     * @returns {Object|null} Current file object or null
     */
    getCurrentFile() {
        return this.currentFile;
    }

    /**
     * Get file language based on extension
     * @param {string} fileName - File name
     * @returns {string} Language identifier
     */
    getLanguageFromFileName(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'json': 'json',
            'html': 'html',
            'css': 'css',
            'ts': 'typescript',
            'cpp': 'cpp',
            'c': 'c',
            'java': 'java',
            'py': 'python',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'sql': 'sql',
            'xml': 'xml',
            'md': 'markdown',
            'sh': 'shell',
            'bat': 'batch',
            'ps1': 'powershell'
        };

        return languageMap[ext] || 'plaintext';
    }

    /**
     * Validate file name
     * @param {string} fileName - File name to validate
     * @returns {Object} Validation result with isValid and message
     */
    validateFileName(fileName) {
        if (!fileName || fileName.trim() === '') {
            return { isValid: false, message: 'File name cannot be empty' };
        }

        if (fileName.length > 100) {
            return { isValid: false, message: 'File name cannot exceed 100 characters' };
        }

        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(fileName)) {
            return { isValid: false, message: 'File name contains invalid characters' };
        }

        return { isValid: true, message: 'File name is valid' };
    }
}

// Create a single instance of FileManager
const fileManager = new FileManager();