/**
 * Backup Management Prompts
 * @module cyberpanel-mcp/prompts/backup
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerBackupPrompts(server: McpServer): void {

  server.registerPrompt(
    'backup-create',
    {
      title: 'Create Backup',
      description: 'Create a full website backup',
      argsSchema: {
        domain: z.string().describe('Domain to backup'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Create backup for ${domain}:

1. create_backup - domain: ${domain}
2. get_backup_status - Monitor progress
3. list_backups - Verify completion

Report backup file location and size.`
        }
      }]
    })
  );

  server.registerPrompt(
    'backup-restore',
    {
      title: 'Restore Backup',
      description: 'Restore a website from backup',
      argsSchema: {
        domain: z.string().describe('Domain to restore'),
        backupFile: z.string().optional().describe('Specific backup file'),
      }
    },
    async ({ domain, backupFile }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Restore ${domain}${backupFile ? ' from ' + backupFile : ''}:

1. list_backups - domain: ${domain}
2. ${backupFile ? `restore_backup - file: ${backupFile}` : 'Select latest backup'}
3. Verify website accessible

⚠️ This will overwrite current data. Confirm before proceeding.`
        }
      }]
    })
  );

  server.registerPrompt(
    'backup-schedule',
    {
      title: 'Schedule Backups',
      description: 'Configure automated backup schedule',
      argsSchema: {
        domain: z.string().describe('Domain for backups'),
        frequency: z.enum(['daily', 'weekly', 'monthly']).describe('Backup frequency'),
        retention: z.number().optional().default(7).describe('Days to keep backups'),
      }
    },
    async ({ domain, frequency, retention }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Schedule ${frequency} backups for ${domain}:

1. Configure backup destination
2. Set schedule: ${frequency}
3. Retention: ${retention} days
4. list_backups - Show existing

Note: Use cloud backup tools for offsite storage:
- s3_create_backup - AWS S3
- do_create_backup - DigitalOcean Spaces
- minio_create_backup - MinIO`
        }
      }]
    })
  );

  server.registerPrompt(
    'backup-cloud-sync',
    {
      title: 'Cloud Backup Sync',
      description: 'Sync backups to cloud storage',
      argsSchema: {
        domain: z.string().describe('Domain to backup'),
        provider: z.enum(['s3', 'digitalocean', 'minio']).describe('Cloud provider'),
      }
    },
    async ({ domain, provider }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Sync ${domain} backup to ${provider}:

${provider === 's3' ? `1. s3_create_backup - domain: ${domain}
2. s3_list_backups - Verify upload` :
provider === 'digitalocean' ? `1. do_create_backup - domain: ${domain}
2. do_list_backups - Verify upload` :
`1. minio_create_backup - domain: ${domain}
2. minio_list_backups - Verify upload`}

Report upload status and storage location.`
        }
      }]
    })
  );
}
