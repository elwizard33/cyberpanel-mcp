/**
 * CyberPanel MCP Server - SSL Management Tools
 * 
 * Tools for managing SSL certificates in CyberPanel using Let's Encrypt.
 * 
 * Controllers from cloudAPI/views.py:
 * - issueSSL (line 200): Issue SSL for website domain
 * - serverSSL (line 282): Issue SSL for hostname or mail server
 * 
 * Note: SSL issuance requires valid DNS pointing to the server.
 * Let's Encrypt is used for certificate generation.
 * 
 * @module cyberpanel-mcp/tools/ssl
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register SSL management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerSslTools(server: McpServer, client: CyberPanelClient): void {
  
  // Issue SSL certificate for a website domain
  server.tool(
    'issue_ssl',
    'Issue Let\'s Encrypt SSL certificate for a website domain. Requires DNS to be pointing to the server.',
    {
      virtualHost: z.string().describe('Domain name to issue SSL certificate for (e.g., example.com)'),
    },
    async ({ virtualHost }) => {
      const result = await client.call('issueSSL', { virtualHost });
      
      if (result.status === 0 || result.SSL === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error issuing SSL for ${virtualHost}: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `SSL certificate issued successfully for ${virtualHost}.\n\nThe website is now secured with Let's Encrypt SSL.` }],
      };
    }
  );

  // Issue SSL for hostname
  server.tool(
    'issue_hostname_ssl',
    'Issue Let\'s Encrypt SSL certificate for the server hostname. Requires DNS to be pointing to the server.',
    {
      virtualHost: z.string().describe('Hostname to issue SSL certificate for'),
    },
    async ({ virtualHost }) => {
      const result = await client.call('serverSSL', { 
        virtualHost,
        type: 'hostname',
      });
      
      if (result.status === 0 || result.SSL === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error issuing hostname SSL for ${virtualHost}: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Hostname SSL certificate issued successfully for ${virtualHost}.\n\nThe server hostname is now secured with Let's Encrypt SSL.` }],
      };
    }
  );

  // Issue SSL for mail server
  server.tool(
    'issue_mail_ssl',
    'Issue Let\'s Encrypt SSL certificate for the mail server. Requires DNS to be pointing to the server.',
    {
      virtualHost: z.string().describe('Domain to issue mail server SSL certificate for'),
    },
    async ({ virtualHost }) => {
      const result = await client.call('serverSSL', { 
        virtualHost,
        type: 'mail',
      });
      
      if (result.status === 0 || result.SSL === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error issuing mail SSL for ${virtualHost}: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Mail server SSL certificate issued successfully for ${virtualHost}.\n\nThe mail server is now secured with Let's Encrypt SSL.` }],
      };
    }
  );
}
