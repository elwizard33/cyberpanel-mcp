#!/usr/bin/env node
/**
 * CyberPanel MCP Server - Entry Point
 * 
 * This is the main entry point for the CyberPanel MCP Server.
 * It initializes the server with stdio transport for VS Code integration.
 * 
 * @module cyberpanel-mcp
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { CyberPanelClient } from './client/cyberpanel.js';
import { registerAllTools } from './tools/index.js';
import { registerAllResources } from './resources/index.js';
import { registerAllPrompts } from './prompts/index.js';

// Version constant for server identification
const SERVER_VERSION = '1.0.0';

/**
 * Main function to initialize and start the MCP server
 */
async function main(): Promise<void> {
  // Load configuration from environment
  const config = loadConfig();
  if (!config) {
    console.error('Failed to load configuration. Please set CYBERPANEL_URL, CYBERPANEL_USERNAME, and CYBERPANEL_PASSWORD environment variables.');
    process.exit(1);
  }

  // Create CyberPanel API client
  const client = new CyberPanelClient(config);

  // Verify connection to CyberPanel
  console.error('Verifying connection to CyberPanel...');
  const isConnected = await client.verifyConnection();
  if (!isConnected) {
    console.error('Failed to connect to CyberPanel. Please check your credentials and server URL.');
    process.exit(1);
  }
  console.error('Successfully connected to CyberPanel');

  // Create MCP server instance
  const server = new McpServer(
    {
      name: 'cyberpanel-mcp',
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
      instructions: 'CyberPanel MCP Server provides tools for managing CyberPanel web hosting control panel. Use the available tools to manage websites, databases, DNS, email, SSL certificates, FTP accounts, backups, and server configuration.',
    }
  );

  // Register all tools with the server
  registerAllTools(server, client);

  // Register all resources with the server
  registerAllResources(server, client);

  // Register all prompts with the server
  registerAllPrompts(server);

  // Create and connect stdio transport
  const transport = new StdioServerTransport();
  
  console.error('Starting CyberPanel MCP Server...');
  await server.connect(transport);
  console.error('CyberPanel MCP Server is running');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('Received SIGINT, shutting down...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('Received SIGTERM, shutting down...');
    await server.close();
    process.exit(0);
  });
}

// Run the main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
