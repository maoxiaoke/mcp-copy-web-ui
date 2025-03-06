# mcp-copy-web-ui

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

## How to Use

### NPX

```json
{
  "mcpServers": {
    "mediaProcessor": {
      "command": "npx",
      "args": [
        "-y",
        "create-mcp-server@latest"
      ]
    }
  }
}
```