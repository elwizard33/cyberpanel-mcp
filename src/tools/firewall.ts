/**
 * CyberPanel MCP Server - Firewall Management Tools
 * 
 * Tools for managing firewall rules in CyberPanel.
 * Uses FirewallD or CSF depending on server configuration.
 * 
 * Controllers from cloudAPI/views.py:
 * - getCurrentRules (line 274): List all firewall rules
 * - addRule (line 276): Add a new firewall rule
 * - deleteRule (line 278): Delete an existing rule
 * 
 * Note: Rules apply server-wide. Requires admin permissions.
 * 
 * @module cyberpanel-mcp/tools/firewall
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register firewall management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerFirewallTools(server: McpServer, client: CyberPanelClient): void {
  
  // List all firewall rules
  server.tool(
    'list_firewall_rules',
    'List all firewall rules configured on the server',
    {},
    async () => {
      const result = await client.call('getCurrentRules', {});
      
      if (result.status === 0 || result.fetchStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error listing firewall rules: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      // Parse the rules data if it's a JSON string
      let rules = result.data;
      if (typeof rules === 'string') {
        try {
          rules = JSON.parse(rules);
        } catch {
          // Leave as-is if parsing fails
        }
      }
      
      // Format rules for display
      let rulesText = '';
      if (Array.isArray(rules) && rules.length > 0) {
        rulesText = rules.map((r: any, i: number) => 
          `${i + 1}. ${r.proto || 'N/A'}:${r.port || 'N/A'} from ${r.ipAddress || 'any'} (${r.action || 'allow'})`
        ).join('\n');
      } else {
        rulesText = 'No firewall rules found';
      }
      
      return {
        content: [{ type: 'text' as const, text: `Firewall Rules:\n\n${rulesText}` }],
      };
    }
  );

  // Add a firewall rule
  server.tool(
    'add_firewall_rule',
    'Add a new firewall rule to allow traffic on a specific port',
    {
      ruleName: z.string().describe('Name/description of the rule (e.g., "HTTP Server")'),
      ruleProtocol: z.enum(['tcp', 'udp']).describe('Protocol: tcp or udp'),
      rulePort: z.string().describe('Port number (e.g., "80", "443", "8080")'),
      ruleIP: z.string().default('0.0.0.0/0').describe('Source IP or CIDR (default: 0.0.0.0/0 for all)'),
    },
    async (params) => {
      const result = await client.call('addRule', {
        ruleName: params.ruleName,
        ruleProtocol: params.ruleProtocol,
        rulePort: params.rulePort,
        ruleIP: params.ruleIP,
      });
      
      if (result.status === 0 || result.add_status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error adding firewall rule: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Firewall rule "${params.ruleName}" added successfully.\n\nPort: ${params.rulePort}/${params.ruleProtocol}\nSource: ${params.ruleIP}` 
        }],
      };
    }
  );

  // Delete a firewall rule
  server.tool(
    'delete_firewall_rule',
    'Delete an existing firewall rule',
    {
      id: z.number().describe('Rule ID from list_firewall_rules'),
      proto: z.enum(['tcp', 'udp']).describe('Protocol of the rule'),
      port: z.string().describe('Port number of the rule'),
      ruleIP: z.string().describe('Source IP/CIDR of the rule'),
    },
    async (params) => {
      const result = await client.call('deleteRule', {
        id: params.id,
        proto: params.proto,
        port: params.port,
        ruleIP: params.ruleIP,
      });
      
      if (result.status === 0 || result.delete_status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error deleting firewall rule: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Firewall rule ${params.id} deleted successfully.` }],
      };
    }
  );
}
