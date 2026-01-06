/**
 * CyberPanel MCP Server - Container and Docker Tools
 * 
 * Provides MCP tools for managing containerization features including
 * Docker installation, website resource limits, and webserver switching.
 * 
 * @module cyberpanel-mcp/tools/containers
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register all container and Docker tools with the MCP server
 */
export function registerContainerTools(server: McpServer, client: CyberPanelClient): void {
  
  // Get Docker/Container Status
  server.tool(
    'get_container_status',
    'Get Docker/containerization installation status on the server. Returns whether Docker is installed and ready.',
    {},
    async () => {
      const result = await client.call('getContainerizationStatus', {});
      if (result.status === 1) {
        const installed = result.notInstalled === 0;
        return {
          content: [{
            type: 'text' as const,
            text: `Docker Status: ${installed ? 'Installed' : 'Not Installed'}\n\n${JSON.stringify(result, null, 2)}`
          }]
        };
      }
      return {
        content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }],
        isError: true
      };
    }
  );

  // Install Container/Docker
  server.tool(
    'install_container',
    'Install Docker and container support on the CyberPanel server. This is an asynchronous operation that starts the installation process.',
    {},
    async () => {
      const result = await client.call('submitContainerInstall', {});
      if (result.status === 1) {
        return {
          content: [{
            type: 'text' as const,
            text: 'Docker/Container installation started successfully. The installation will run in the background.'
          }]
        };
      }
      return {
        content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }],
        isError: true
      };
    }
  );

  // Switch Webserver (LiteSpeed/OpenLiteSpeed)
  server.tool(
    'switch_webserver',
    'Check LiteSpeed/OpenLiteSpeed webserver switch status. Returns installation progress and status.',
    {},
    async () => {
      const result = await client.call('switchTOLSWSStatus', {});
      if (result.status === 1) {
        const statusText = result.abort === 1
          ? (result.installed === 1 ? 'LiteSpeed installed successfully' : 'Installation aborted')
          : 'Installation in progress';
        return {
          content: [{
            type: 'text' as const,
            text: `Webserver Switch Status: ${statusText}\n\nDetails:\n${JSON.stringify(result, null, 2)}`
          }]
        };
      }
      return {
        content: [{ type: 'text' as const, text: `Error: ${result.error_message || result.requestStatus || 'Unknown error'}` }],
        isError: true
      };
    }
  );

  // Fetch Website Container Limits
  server.tool(
    'get_website_limits',
    'Get resource limits (CPU, memory, IO, network) for a containerized website.',
    {
      domain: z.string().describe('The domain name of the website')
    },
    async ({ domain }) => {
      const result = await client.call('fetchWebsiteLimits', { domain });
      if (result.status === 1) {
        return {
          content: [{
            type: 'text' as const,
            text: `Resource Limits for ${domain}:\n` +
              `- CPU: ${result.cpuPers}%\n` +
              `- Memory: ${result.memory} MB\n` +
              `- IO: ${result.IO}%\n` +
              `- IOPS: ${result.IOPS}\n` +
              `- Network: ${result.networkSpeed}\n` +
              `- Enforced: ${result.enforce === 1 ? 'Yes' : 'No'}`
          }]
        };
      }
      return {
        content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }],
        isError: true
      };
    }
  );

  // Save Website Container Limits
  server.tool(
    'set_website_limits',
    'Set resource limits (CPU, memory, IO, network) for a containerized website. Requires Docker/containerization to be installed.',
    {
      domain: z.string().describe('The domain name of the website'),
      cpuPers: z.number().int().min(1).max(100).describe('CPU percentage limit (1-100)'),
      memory: z.number().int().positive().describe('Memory limit in MB'),
      IO: z.number().int().min(1).max(100).describe('IO percentage limit (1-100)'),
      IOPS: z.number().int().positive().describe('IOPS limit'),
      networkSpeed: z.string().describe('Network speed limit (e.g., "1")'),
      networkHandle: z.string().describe('Network handle unit (e.g., "mbit")'),
      enforce: z.boolean().optional().describe('Whether to enforce the limits')
    },
    async ({ domain, cpuPers, memory, IO, IOPS, networkSpeed, networkHandle, enforce }) => {
      const result = await client.call('saveWebsiteLimits', {
        domain,
        cpuPers,
        memory,
        IO,
        IOPS,
        networkSpeed,
        networkHandle,
        enforce: enforce ?? true
      });
      if (result.status === 1) {
        return {
          content: [{
            type: 'text' as const,
            text: `Resource limits updated for ${domain}:\n` +
              `- CPU: ${cpuPers}%\n` +
              `- Memory: ${memory} MB\n` +
              `- IO: ${IO}%\n` +
              `- IOPS: ${IOPS}\n` +
              `- Network: ${networkSpeed}${networkHandle}\n` +
              `- Enforced: ${enforce ? 'Yes' : 'No'}`
          }]
        };
      }
      return {
        content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }],
        isError: true
      };
    }
  );

  // Get Website Resource Usage
  server.tool(
    'get_website_usage',
    'Get current resource usage (CPU, memory, or IO) for a containerized website.',
    {
      domain: z.string().describe('The domain name of the website'),
      type: z.enum(['cpu', 'memory', 'io']).optional().describe('Type of usage data to retrieve (cpu, memory, or io). Defaults to cpu.')
    },
    async ({ domain, type }) => {
      const params: Record<string, string> = { domain };
      if (type && type !== 'cpu') {
        params.type = type;
      }
      
      const result = await client.call('getUsageData', params);
      if (result.status === 1) {
        let usageText = `Resource Usage for ${domain}:\n`;
        
        if (result.cpu !== undefined) {
          usageText += `- CPU: ${result.cpu}%`;
        }
        if (result.memory !== undefined) {
          usageText += `- Memory: ${result.memory} MB`;
        }
        if (result.readRate !== undefined || result.writeRate !== undefined) {
          usageText += `- Read Rate: ${result.readRate || 0} MB/s\n`;
          usageText += `- Write Rate: ${result.writeRate || 0} MB/s`;
        }
        
        return {
          content: [{ type: 'text' as const, text: usageText }]
        };
      }
      return {
        content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }],
        isError: true
      };
    }
  );
}
