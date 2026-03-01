/**
 * Monaco Editor initialization and configuration
 */

class Editor {
    constructor() {
        this.editor = null;
        this.isReady = false;
        this.initialized = false;
        this.currentFile = null;
        this.themes = ['vs-light', 'vs-dark', 'hc-black', 'hc-light'];
        this.currentTheme = 'vs-light';
        this.openTabs = new Map();
        this.consoleOutput = [];
        
        this.initializeMonaco();
        this.initializeLanguageServices();
    }

    /**
     * Initialize Monaco Editor
     */
    initializeMonaco() {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
        
        require(['vs/editor/editor.main'], () => {
            this.initialized = true;
            this.createEditor();
            this.initializeLanguageFeatures();
        });
    }

    /**
     * Initialize language services
     */
    initializeLanguageServices() {
        // Configure TypeScript/JavaScript language service
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
        
        // Configure HTML/CSS language service
        monaco.languages.html.htmlDefaults.setEagerModelSync(true);
        monaco.languages.css.cssDefaults.setEagerModelSync(true);
    }

    /**
     * Initialize language features
     */
    initializeLanguageFeatures() {
        // Enable intellisense and language features
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            strict: true,
            jsx: monaco.languages.typescript.JsxEmit.Preserve,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs
        });

        // Configure HTML language features
        monaco.languages.html.htmlDefaults.setOptions({
            format: {
                wrapLineLength: 120,
                unformatted: 'code,kbd,pre,samp'
            },
            suggest: {
                html5: true
            }
        });

        // Configure CSS language features
        monaco.languages.css.cssDefaults.setOptions({
            validate: true,
            lint: {
                compatibleVendorPrefixes: 'ignore',
                vendorPrefix: 'warning',
                duplicateProperties: 'warning',
                emptyRules: 'warning',
                importStatement: 'ignore',
                boxModel: 'warning',
                universalSelector: 'warning',
                zeroUnits: 'warning',
                fontFaceProperties: 'warning',
                hexColorLength: 'error',
                argumentsInColorFunctions: 'error',
                unknownProperties: 'warning',
                ieHacks: 'warning',
                unknownVendorSpecificProperties: 'ignore',
                propertyIgnoredDueToDisplay: 'warning',
                important: 'warning',
                float: 'warning',
                idSelector: 'warning'
            }
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
            theme: this.currentTheme,
            automaticLayout: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastColumn: 0,
            readOnly: false,
            cursorBlinking: 'smooth',
            fontLigatures: false,
            letterSpacing: 0,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 5,
            wordWrap: 'on',
            suggest: {
                showKeywords: true,
                showSnippets: true,
                showFields: true,
                showFunctions: true,
                showVariables: true,
                insertMode: 'insert'
            },
            quickSuggestions: {
                other: true,
                comments: false,
                strings: true
            },
            parameterHints: {
                enabled: true
            },
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: 'on'
        });

        // Add event listeners
        this.editor.onDidChangeModelContent(() => {
            if (this.currentFile) {
                ui.updateFileNameDisplay(this.currentFile.name, true);
            }
        });

        // Add breakpoint support
        this.editor.onDidChangeBreakpoints(() => {
            this.updateBreakpoints();
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
     * Toggle theme
     */
    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.currentTheme = this.themes[nextIndex];
        monaco.editor.setTheme(this.currentTheme);
        ui.showNotification(`Theme changed to ${this.currentTheme}`);
    }

    /**
     * Undo last action
     */
    undo() {
        if (!this.isReady) {
            return;
        }
        this.editor.getAction('undo').run();
    }

    /**
     * Redo last action
     */
    redo() {
        if (!this.isReady) {
            return;
        }
        this.editor.getAction('redo').run();
    }

    /**
     * Open file in tab
     * @param {Object} file - File object to open
     */
    openFileInTab(file) {
        if (!file) {
            return;
        }
        
        this.openTabs.set(file.name, file);
        ui.updateTabs();
        this.loadFile(file);
    }

    /**
     * Close tab
     * @param {string} fileName - File name to close
     */
    closeTab(fileName) {
        this.openTabs.delete(fileName);
        ui.updateTabs();
        
        // If closing current file, open first available file
        if (this.currentFile && this.currentFile.name === fileName) {
            if (this.openTabs.size > 0) {
                const firstFile = Array.from(this.openTabs.values())[0];
                this.loadFile(firstFile);
            } else {
                this.clear();
            }
        }
    }

    /**
     * Get open tabs
     * @returns {Array} Array of open file objects
     */
    getOpenTabs() {
        return Array.from(this.openTabs.values());
    }

    /**
     * Update breakpoints
     */
    updateBreakpoints() {
        const breakpoints = monaco.debug.getBreakpoints();
        console.log('Breakpoints updated:', breakpoints);
    }

    /**
     * Evaluate JavaScript code
     * @param {string} code - Code to evaluate
     */
    evaluateJavaScript(code) {
        try {
            const result = eval(code);
            this.addConsoleLog(result, 'log');
        } catch (error) {
            this.addConsoleLog(error.message, 'error');
        }
    }

    /**
     * Add log to console
     * @param {string} message - Message to log
     * @param {string} type - Log type (log, error, warning, info)
     */
    addConsoleLog(message, type = 'log') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            id: Date.now(),
            timestamp: timestamp,
            message: message,
            type: type
        };
        
        this.consoleOutput.push(logEntry);
        ui.updateConsole();
    }

    /**
     * Clear console
     */
    clearConsole() {
        this.consoleOutput = [];
        ui.updateConsole();
    }

    /**
     * Get console output
     * @returns {Array} Array of console log entries
     */
    getConsoleOutput() {
        return [...this.consoleOutput];
    }

    /**
     * Live preview HTML content
     */
    livePreview() {
        const content = this.getContent();
        const previewFrame = document.getElementById('previewFrame');
        
        if (this.getCurrentLanguage() === 'html') {
            previewFrame.srcdoc = content;
        } else if (this.getCurrentLanguage() === 'javascript') {
            previewFrame.srcdoc = `
                <html>
                    <body>
                        <script>
                            ${content}
                        </script>
                    </body>
                </html>
            `;
        } else if (this.getCurrentLanguage() === 'css') {
            previewFrame.srcdoc = `
                <html>
                    <head>
                        <style>${content}</style>
                    </head>
                    <body>
                        <h1>CSS Preview</h1>
                        <p>This is a preview of your CSS styles.</p>
                    </body>
                </html>
            `;
        } else {
            previewFrame.srcdoc = `
                <html>
                    <body>
                        <h1>Preview Not Available</h1>
                        <p>Preview is only available for HTML, JavaScript, and CSS files.</p>
                    </body>
                </html>
            `;
        }
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