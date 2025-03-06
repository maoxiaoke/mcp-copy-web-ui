#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { downloadCompleteHTML } from './replicate.js';

// Create MCP server instance
const server = new Server(
  {
    name: "mcp-copy-web-ui",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);


const text = ""

// Handler that lists available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_web_inspiration",
        description: "Download and analyze a website for UI/UX inspiration",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL of the website to analyze"
            }
          },
          required: ["url"]
        }
      }
    ]
  };
});

// Handler for the get_web_inspiration tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "get_web_inspiration": {
      const url = String(request.params.arguments?.url);
      if (!url) {
        throw new Error("URL is required");
      }

      try {
        console.error(`[Info] Downloading website: ${url}`);
        const html = await downloadCompleteHTML(url);
        
        // Minify HTML by removing newlines, extra spaces and tabs
        const minifiedHtml = html
          .replace(/[\r\n\t]+/g, '') // Remove newlines, tabs
          .replace(/\s{2,}/g, ' ')   // Replace multiple spaces with single space
          .trim();                   // Remove leading/trailing whitespace

        // Escape HTML special characters
        const escapedHtml = minifiedHtml
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

        return {
          content: [
            {
              type: "text",
              text: `Successfully downloaded website content. Here's the complete HTML with all resources inlined: ${escapedHtml}`
            }
          ]
        };
      } catch (error: any) {
        console.error('[Error] Failed to download website:', error);
        throw new Error(`Failed to download website: ${error.message}`);
      }
    }

    default:
      throw new Error("Unknown tool");
  }
});

// Start the server using stdio transport
async function main() {
  console.error('[Setup] Initializing web inspiration MCP server...');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Setup] Server started successfully');
}

main().catch((error) => {
  console.error("[Error] Server error:", error);
  process.exit(1);
});

