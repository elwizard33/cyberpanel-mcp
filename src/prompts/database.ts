/**
 * Database Management Prompts
 * @module cyberpanel-mcp/prompts/database
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerDatabasePrompts(server: McpServer): void {

  server.registerPrompt(
    'database-setup',
    {
      title: 'Database Setup',
      description: 'Create database with user and permissions',
      argsSchema: {
        domain: z.string().describe('Website domain'),
        dbName: z.string().describe('Database name'),
      }
    },
    async ({ domain, dbName }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Create database for ${domain}:

1. create_database - name: ${dbName}, website: ${domain}
2. create_database_user - Generate secure password
3. list_databases - Verify creation

Return database credentials.`
        }
      }]
    })
  );

  server.registerPrompt(
    'database-backup',
    {
      title: 'Database Backup',
      description: 'Backup and optionally restore a database',
      argsSchema: {
        domain: z.string().describe('Website domain'),
        action: z.enum(['backup', 'restore', 'list']).describe('Action to perform'),
      }
    },
    async ({ domain, action }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Database ${action} for ${domain}:

${action === 'backup' ? `1. list_databases - Find databases for ${domain}
2. Use mysqldump via phpmyadmin_sso or backup tool` :
action === 'restore' ? `1. list_databases - Check target exists
2. Import SQL file via phpMyAdmin` :
`1. list_databases - Show all databases
2. list_database_users - Show users`}

Report results.`
        }
      }]
    })
  );

  server.registerPrompt(
    'database-optimize',
    {
      title: 'Database Optimize',
      description: 'Analyze and optimize database performance',
      argsSchema: {
        domain: z.string().describe('Website domain'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Optimize databases for ${domain}:

1. list_databases - Get database list
2. phpmyadmin_sso - Access phpMyAdmin
3. Run OPTIMIZE TABLE on large tables
4. Check slow query logs

Provide optimization recommendations.`
        }
      }]
    })
  );
}
