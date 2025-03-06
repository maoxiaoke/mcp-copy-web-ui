# mcp-copy-web-ui MCP Server

This is an MCP server that helps download and analyze websites for UI/UX inspiration. It captures the complete HTML content of a website, including all CSS, images, and other resources, making them available for analysis by Claude.

## Features

- Downloads complete webpage content
- Inlines all CSS styles
- Converts images to base64 data URIs
- Resolves and inlines all external resources
- Makes the complete webpage available for AI analysis

## Tools

### get_web_inspiration
Downloads and analyzes a website for UI/UX inspiration. Takes a URL as input and returns the complete HTML with all resources inlined.

Example usage in Claude:
```
I'd like to get inspiration from example.com's design
```

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-copy-web-ui": {
      "command": "/path/to/mcp-copy-web-ui/build/index.js"
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser. 