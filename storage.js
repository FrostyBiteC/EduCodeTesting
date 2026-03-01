/**
 * LocalStorage implementation for file storage
 */

const STORAGE_KEY = 'webCodeEditorFiles';

class Storage {
    constructor() {
        this.files = this.loadFiles();
    }

    /**
     * Load files from localStorage
     * @returns {Array} Array of file objects
     */
    loadFiles() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading files from storage:', error);
            return [];
        }
    }

    /**
     * Save files to localStorage
     */
    saveFiles() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.files));
        } catch (error) {
            console.error('Error saving files to storage:', error);
        }
    }

    /**
     * Get all files
     * @returns {Array} Array of file objects
     */
    getAllFiles() {
        return [...this.files];
    }

    /**
     * Get a single file by name
     * @param {string} fileName - File name to search for
     * @returns {Object|null} File object or null if not found
     */
    getFile(fileName) {
        return this.files.find(file => file.name === fileName) || null;
    }

    /**
     * Add a new file
     * @param {Object} file - File object to add
     * @returns {boolean} True if file was added successfully
     */
    addFile(file) {
        if (this.getFile(file.name)) {
            return false; // File already exists
        }
        this.files.push(file);
        this.saveFiles();
        return true;
    }

    /**
     * Update an existing file
     * @param {string} fileName - File name to update
     * @param {Object} updates - Updates to apply
     * @returns {boolean} True if file was updated successfully
     */
    updateFile(fileName, updates) {
        const fileIndex = this.files.findIndex(file => file.name === fileName);
        if (fileIndex === -1) {
            return false;
        }
        this.files[fileIndex] = {
            ...this.files[fileIndex],
            ...updates
        };
        this.saveFiles();
        return true;
    }

    /**
     * Delete a file
     * @param {string} fileName - File name to delete
     * @returns {boolean} True if file was deleted successfully
     */
    deleteFile(fileName) {
        const fileIndex = this.files.findIndex(file => file.name === fileName);
        if (fileIndex === -1) {
            return false;
        }
        this.files.splice(fileIndex, 1);
        this.saveFiles();
        return true;
    }

    /**
     * Clear all files
     */
    clearAll() {
        this.files = [];
        this.saveFiles();
    }

    /**
     * Check if storage is empty
     * @returns {boolean} True if no files exist
     */
    isEmpty() {
        return this.files.length === 0;
    }
}

// Create a single instance of Storage
const storage = new Storage();