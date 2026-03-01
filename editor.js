/**
 * Monaco Editor initialization and configuration
 */

class Editor {
    constructor() {
        this.editor = null;
        this.isReady = false;
        this.initialized = false;
        this.currentFile = null;
        
        this.initializeMonaco();
    }

    /**
     * Initialize Monaco Editor
     */
    initializeMonaco() {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
        
        require(['vs/editor/editor.main'], () => {
            this.initialized = true;
            this.createEditor();
        });
    }

    /**
     * Create the Monaco Editor instance
     */
    createEditor() {
        const container = document.getElementById('editor');
        
        this.editor = monaco.editor.create(container, {
            value: '',
            language: 'plaintext',
            theme: 'vs-light',
            automaticLayout: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastColumn: 0,
            readOnly: false,
            cursorBlinking: 'smooth',
            fontSize: 14,
            fontLigatures: false,
            letterSpacing: 0,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 5,
            wordWrap: 'on'
        });

        // Add event listeners
        this.editor.onDidChangeModelContent(() => {
            if (this.currentFile) {
                ui.updateFileNameDisplay(this.currentFile.name, true);
            }
        });

        this.isReady = true;
    }

    /**
     * Load a file into the editor
     * @param {Object} file - File object to load
     */
    loadFile(file) {
        if (!this.isReady || !file) {
            return;
        }

        this.currentFile = file;
        this.editor.setValue(file.content);
        this.setLanguage(file.language);
        ui.updateFileNameDisplay(file.name, false);
    }

    /**
     * Set the language for syntax highlighting
     * @param {string} language - Language identifier
     */
    setLanguage(language) {
        if (!this.isReady) {
            return;
        }

        const model = this.editor.getModel();
        if (model) {
            monaco.editor.setModelLanguage(model, language);
        }
    }

    /**
     * Get the current content of the editor
     * @returns {string} Editor content
     */
    getContent() {
        if (!this.isReady) {
            return '';
        }
        return this.editor.getValue();
    }

    /**
     * Clear the editor
     */
    clear() {
        if (!this.isReady) {
            return;
        }
        this.currentFile = null;
        this.editor.setValue('');
        this.setLanguage('plaintext');
    }

    /**
     * Set read-only mode
     * @param {boolean} readOnly - Whether to make editor read-only
     */
    setReadOnly(readOnly) {
        if (!this.isReady) {
            return;
        }
        this.editor.updateOptions({ readOnly: readOnly });
    }

    /**
     * Focus the editor
     */
    focus() {
        if (!this.isReady) {
            return;
        }
        this.editor.focus();
    }

    /**
     * Get editor instance for advanced operations
     * @returns {Object} Monaco Editor instance
     */
    getEditorInstance() {
        return this.editor;
    }

    /**
     * Get current language
     * @returns {string} Current language identifier
     */
    getCurrentLanguage() {
        if (!this.isReady) {
            return 'plaintext';
        }
        const model = this.editor.getModel();
        return model ? model.getLanguageId() : 'plaintext';
    }

    /**
     * Format the current document
     */
    formatDocument() {
        if (!this.isReady) {
            return;
        }
        
        this.editor.getAction('editor.action.formatDocument').run()
            .catch(error => {
                console.error('Error formatting document:', error);
            });
    }

    /**
     * Toggle word wrap
     */
    toggleWordWrap() {
        if (!this.isReady) {
            return;
        }
        
        const current = this.editor.getOption(monaco.editor.EditorOption.wordWrap);
        this.editor.updateOptions({
            wordWrap: current === 'on' ? 'off' : 'on'
        });
    }

    /**
     * Toggle minimap
     */
    toggleMinimap() {
        if (!this.isReady) {
            return;
        }
        
        const current = this.editor.getOption(monaco.editor.EditorOption.minimap).enabled;
        this.editor.updateOptions({
            minimap: { enabled: !current }
        });
    }

    /**
     * Search in editor
     */
    search() {
        if (!this.isReady) {
            return;
        }
        
        this.editor.getAction('actions.find').run();
    }

    /**
     * Replace in editor
     */
    replace() {
        if (!this.isReady) {
            return;
        }
        
        this.editor.getAction('editor.action.startFindReplaceAction').run();
    }

    /**
     * Toggle line numbers
     */
    toggleLineNumbers() {
        if (!this.isReady) {
            return;
        }
        
        const current = this.editor.getOption(monaco.editor.EditorOption.lineNumbers);
        this.editor.updateOptions({
            lineNumbers: current === 'on' ? 'off' : 'on'
        });
    }
}

// Create a single instance of Editor
const editor = new Editor();