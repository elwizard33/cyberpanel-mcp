/**
 * CyberPanel MCP Server - Resources Module
 * 
 * Provides MCP Resources for static/semi-static data that doesn't change frequently.
 * Resources are read-only and can be cached by MCP clients.
 * 
 * Resources provided:
 * - cyberpanel://php/versions - Available PHP versions
 * - cyberpanel://packages - Hosting packages  
 * - cyberpanel://server/info - Server information
 * 
 * @module cyberpanel-mcp/resources
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Available PHP versions in CyberPanel
 */
const PHP_VERSIONS = [
  { version: 'PHP 7.4', shortVersion: '74', status: 'supported' },
  { version: 'PHP 8.0', shortVersion: '80', status: 'supported' },
  { version: 'PHP 8.1', shortVersion: '81', status: 'active' },
  { version: 'PHP 8.2', shortVersion: '82', status: 'active' },
  { version: 'PHP 8.3', shortVersion: '83', status: 'active' },
];

/**
 * Register all CyberPanel resources with the MCP server
 * 
 * @param server - The McpServer instance
 * @param client - The CyberPanelClient for API calls
 */
export function registerAllResources(server: McpServer, client: CyberPanelClient): void {
  console.error('Registering CyberPanel resources...');

  // PHP Versions Resource - Static data
  server.registerResource(
    'php-versions',
    'cyberpanel://php/versions',
    {
      description: 'Available PHP versions supported by CyberPanel',
      mimeType: 'application/json'
    },
    async () => {
      return {
        contents: [
          {
            uri: 'cyberpanel://php/versions',
            mimeType: 'application/json',
            text: JSON.stringify({
              versions: PHP_VERSIONS,
              default: 'PHP 8.1',
              note: 'PHP versions available for website configuration'
            }, null, 2)
          }
        ]
      };
    }
  );

  // Packages Resource - Fetched from CyberPanel
  server.registerResource(
    'packages',
    'cyberpanel://packages',
    {
      description: 'Hosting packages configured in CyberPanel',
      mimeType: 'application/json'
    },
    async () => {
      try {
        const result = await client.call('fetchPackages', {});
        
        if (result.status === 1) {
          // Parse packages if they're a JSON string
          let packages = result.data;
          if (typeof packages === 'string') {
            try {
              packages = JSON.parse(packages);
            } catch {
              // Leave as-is
            }
          }
          
          return {
            contents: [
              {
                uri: 'cyberpanel://packages',
                mimeType: 'application/json',
                text: JSON.stringify({
                  status: 'success',
                  packages: packages,
                  fetchedAt: new Date().toISOString()
                }, null, 2)
              }
            ]
          };
        }
        
        return {
          contents: [
            {
              uri: 'cyberpanel://packages',
              mimeType: 'application/json',
              text: JSON.stringify({
                status: 'error',
                error: result.error_message || 'Failed to fetch packages'
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: 'cyberpanel://packages',
              mimeType: 'application/json',
              text: JSON.stringify({
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
              }, null, 2)
            }
          ]
        };
      }
    }
  );

  // Server Info Resource - Fetched from CyberPanel
  server.registerResource(
    'server-info',
    'cyberpanel://server/info',
    {
      description: 'CyberPanel server information including web server type',
      mimeType: 'application/json'
    },
    async () => {
      try {
        const result = await client.call('obtainServer', {});
        
        return {
          contents: [
            {
              uri: 'cyberpanel://server/info',
              mimeType: 'application/json',
              text: JSON.stringify({
                status: result.status === 1 ? 'success' : 'error',
                webServer: result.serverType || result.webServer || 'unknown',
                details: result,
                fetchedAt: new Date().toISOString()
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: 'cyberpanel://server/info',
              mimeType: 'application/json',
              text: JSON.stringify({
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
              }, null, 2)
            }
          ]
        };
      }
    }
  );

  console.error('CyberPanel resources registration complete');
}
