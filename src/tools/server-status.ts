/**
 * CyberPanel MCP Server - Server Status Tools
 * 
 * Tools for monitoring server resources and managing processes.
 * 
 * Controllers from cloudAPI/views.py:
 * - obtainServer (line 264): Get web server type (LSWS/OpenLiteSpeed)
 * - systemStatus (line 330): Get CPU, memory, processes details
 * - killProcess (line 332): Kill a running process
 * - restartMySQL (line 360): Restart MySQL/MariaDB service
 * 
 * Note: Server status shows live resource usage. Service management requires admin privileges.
 * 
 * @module cyberpanel-mcp/tools/server-status
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register server status tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerServerStatusTools(server: McpServer, client: CyberPanelClient): void {
  
  // Get server type
  server.tool(
    'get_server_type',
    'Get the web server type (LiteSpeed Enterprise or OpenLiteSpeed)',
    {},
    async () => {
      const result = await client.call('obtainServer', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error getting server type: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Web Server: ${result.serverStatus || 'Unknown'}` }],
      };
    }
  );

  // Get system status (CPU, memory, processes)
  server.tool(
    'get_system_status',
    'Get detailed system status including CPU usage, memory, swap, and running processes',
    {},
    async () => {
      const result = await client.call('systemStatus', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error getting system status: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      // Format the status output
      const statusText = `System Status:

CPU Information:
- Model: ${result.modelName || 'Unknown'}
- Cores: ${result.cores || 'Unknown'}
- Speed: ${result.cpuMHZ || 'Unknown'} MHz
- Load Average: ${result.cpuNow || 'N/A'} (now) | ${result.cpuOne || 'N/A'} (1m) | ${result.cpuFive || 'N/A'} (5m) | ${result.cpuFifteen || 'N/A'} (15m)
- IO Wait: ${result.ioWait || 'N/A'}
- Idle: ${result.idleTime || 'N/A'}

Memory:
- Total: ${result.totalMemory || 'N/A'}
- Used: ${result.usedMemory || 'N/A'}
- Free: ${result.freeMemory || 'N/A'}
- Buff/Cache: ${result.buffCache || 'N/A'}

Swap:
- Total: ${result.swapTotalMemory || 'N/A'}
- Used: ${result.swapUsedMemory || 'N/A'}
- Free: ${result.swapFreeMemory || 'N/A'}

Processes:
- Total: ${result.totalProcesses || 'N/A'}
- Running: ${result.runningProcesses || 'N/A'}
- Sleeping: ${result.sleepingProcesses || 'N/A'}
- Stopped: ${result.stoppedProcesses || 'N/A'}
- Zombie: ${result.zombieProcesses || 'N/A'}`;

      return {
        content: [{ type: 'text' as const, text: statusText }],
      };
    }
  );

  // Kill a process
  server.tool(
    'kill_process',
    'Kill a running process by its PID. Requires admin privileges.',
    {
      pid: z.number().describe('Process ID to kill'),
    },
    async ({ pid }) => {
      const result = await client.call('killProcess', { pid });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error killing process: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Process ${pid} killed successfully.` }],
      };
    }
  );

  // Restart MySQL
  server.tool(
    'restart_mysql',
    'Restart the MySQL/MariaDB database service. Requires admin privileges.',
    {},
    async () => {
      const result = await client.call('restartMySQL', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error restarting MySQL: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: 'MySQL/MariaDB service restarted successfully.' }],
      };
    }
  );
}
