# EduCodeTesting

## Web Code Editor

A modern web-based code editor with support for HTML, CSS, JavaScript, and TypeScript, featuring live preview, syntax highlighting, and a built-in console.

## Features

### Code Editor
- Monaco Editor for rich code editing experience
- Syntax highlighting for multiple languages
- Auto-formatting support
- Theme switching (light, dark, high contrast)
- Word wrap and minimap toggles

### Preview System
**WebContainer Core Integration** (for complex applications):
- Full Node.js environment in the browser
- Supports npm packages and dependencies
- Runs full-stack web applications
- Automatic port forwarding and proxy
- Console output for debugging

**Blob URL Method** (for simple files, fallback):
- Creates proper Blob URLs with complete HTML structure
- Handles HTML files directly
- Wraps CSS files in style tags with preview content
- Wraps JavaScript files in script tags
- Error handling for blob creation
- Cleanup of Blob URLs to prevent memory leaks

### File Management
- Create, open, and save files
- Tab-based interface
- File type detection by extension

### Development Tools
- JavaScript console for debugging
- Evaluate JavaScript code directly
- Breakpoint support

## Usage

1. Open the editor in a web browser
2. Create or open files
3. Write your code
4. Click "Live Preview" to see the result
5. Use the console to debug and evaluate code

## Technologies

- Monaco Editor - Code editing
- HTML5, CSS3, JavaScript (ES2020)
- WebContainer Core - Full Node.js environment in browser
- Blob URL technology for secure previews