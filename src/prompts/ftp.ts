/**
 * FTP Management Prompts
 * @module cyberpanel-mcp/prompts/ftp
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerFTPPrompts(server: McpServer): void {

  server.registerPrompt(
    'ftp-account-setup',
    {
      title: 'Create FTP Account',
      description: 'Set up FTP access for file management',
      argsSchema: {
        domain: z.string().describe('Website domain'),
        username: z.string().describe('FTP username'),
      }
    },
    async ({ domain, username }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Create FTP account for ${domain}:

1. create_ftp_account:
   - domain: ${domain}
   - username: ${username}
   - password: [generate strong password]
   - path: /home/${domain}/public_html (or specific subfolder)

2. get_ftp_accounts - Verify creation

Connection details:
- Host: ${domain} or server IP
- Port: 21 (FTP) or 22 (SFTP)
- Username: ${username}@${domain}

Security: Recommend SFTP over FTP.`
        }
      }]
    })
  );

  server.registerPrompt(
    'ftp-restricted-access',
    {
      title: 'FTP with Restricted Access',
      description: 'Create FTP account limited to specific directory',
      argsSchema: {
        domain: z.string().describe('Website domain'),
        folder: z.string().describe('Restricted folder path'),
      }
    },
    async ({ domain, folder }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Create restricted FTP for ${domain}:

1. create_ftp_account:
   - domain: ${domain}
   - username: restricted_user
   - path: /home/${domain}/public_html/${folder}

2. User can only access ${folder}

Use cases:
- Developer access to wp-content
- Client access to uploads folder
- Vendor access to specific directory

Verify user cannot navigate above restricted path.`
        }
      }]
    })
  );

  server.registerPrompt(
    'ftp-troubleshoot',
    {
      title: 'Troubleshoot FTP',
      description: 'Diagnose FTP connection issues',
      argsSchema: {
        domain: z.string().describe('Domain with FTP issue'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Troubleshoot FTP for ${domain}:

1. Check account exists:
   get_ftp_accounts - domain: ${domain}

2. Check firewall:
   get_firewall_rules
   - Port 21 (FTP control)
   - Ports 30000-50000 (passive FTP)

3. Check service:
   manage_services - service: pure-ftpd, action: status

4. Common issues:
   - Wrong password → reset with change_ftp_password
   - Connection refused → check firewall
   - Passive mode → verify port range open
   - Permission denied → check folder permissions

5. If SFTP preferred:
   - Uses port 22 (SSH)
   - More secure than FTP`
        }
      }]
    })
  );
}
