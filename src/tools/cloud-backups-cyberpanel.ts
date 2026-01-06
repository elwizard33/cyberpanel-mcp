/**
 * CyberPanel MCP Server - CyberPanel Native Cloud Backup Tools
 * 
 * Tools for managing CyberPanel's native cloud backup operations.
 * This is different from S3/DO/MINIO - it's CyberPanel's built-in backup to another CyberPanel server.
 * 
 * Controllers from cloudAPI/views.py:
 * - SubmitCloudBackup: Create cloud backup
 * - getCurrentCloudBackups: List backups for a domain
 * - fetchCloudBackupSettings: Get backup settings (nice, cpu, time)
 * - saveCloudBackupSettings: Save backup settings
 * - deleteCloudBackup: Delete a backup file
 * - SubmitCloudBackupRestore: Restore from backup
 * 
 * @module cyberpanel-mcp/tools/cloud-backups-cyberpanel
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register CyberPanel native cloud backup tools with the MCP server
 * 
 * @param server - The McpServer instance
 * @param client - The CyberPanelClient for API calls
 */
export function registerCloudBackupTools(server: McpServer, client: CyberPanelClient): void {
    
    // Submit Cloud Backup
    server.tool(
        'submit_cloud_backup',
        'Create a cloud backup of a website to another CyberPanel server. This operation runs in the background.',
        {
            domain: z.string().describe('Domain name to backup'),
            data: z.number().optional().default(1).describe('Include website data (1=yes, 0=no)'),
            emails: z.number().optional().default(1).describe('Include emails (1=yes, 0=no)'),
            databases: z.number().optional().default(1).describe('Include databases (1=yes, 0=no)'),
            ip: z.string().optional().describe('Destination server IP address'),
            port: z.string().optional().describe('Destination server port'),
            destinationDomain: z.string().optional().describe('Destination domain name on remote server')
        },
        async (params) => {
            const result = await client.call('SubmitCloudBackup', {
                domain: params.domain,
                data: params.data,
                emails: params.emails,
                databases: params.databases,
                ip: params.ip || '0',
                port: params.port || '0',
                destinationDomain: params.destinationDomain || 'None'
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Cloud backup started for ${params.domain}!\n` +
                              `Status path: ${result.tempStatusPath}\n` +
                              `Backup path: ${result.path}\n` +
                              `The backup is running in the background.`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error starting cloud backup: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // List Cloud Backups
    server.tool(
        'list_cloud_backups',
        'List all cloud backups for a specific domain.',
        {
            domainName: z.string().describe('Domain name to list backups for')
        },
        async (params) => {
            const result = await client.call('getCurrentCloudBackups', {
                domainName: params.domainName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Cloud backups for ${params.domainName}:\n${result.data || '[]'}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error listing cloud backups: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Get Cloud Backup Settings
    server.tool(
        'get_cloud_backup_settings',
        'Get cloud backup configuration settings (nice level, CPU limit, time).',
        {},
        async () => {
            const result = await client.call('fetchCloudBackupSettings', {});
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Cloud Backup Settings:\n` +
                              `Nice level: ${result.nice}\n` +
                              `CPU limit: ${result.cpu}\n` +
                              `Time: ${result.time}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error getting cloud backup settings: ${result.errorMessage || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Save Cloud Backup Settings
    server.tool(
        'save_cloud_backup_settings',
        'Save cloud backup configuration settings.',
        {
            nice: z.number().describe('Nice level for backup process (0-19, higher = lower priority)'),
            cpu: z.number().describe('CPU limit percentage for backup process'),
            time: z.string().describe('Scheduled backup time (HH:MM format)')
        },
        async (params) => {
            const result = await client.call('saveCloudBackupSettings', {
                nice: params.nice,
                cpu: params.cpu,
                time: params.time
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Cloud backup settings saved successfully!\n` +
                              `Nice: ${params.nice}\n` +
                              `CPU: ${params.cpu}%\n` +
                              `Time: ${params.time}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error saving cloud backup settings: ${result.errorMessage || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Delete Cloud Backup
    server.tool(
        'delete_cloud_backup',
        'Delete a cloud backup file for a specific domain.',
        {
            domainName: z.string().describe('Domain name the backup belongs to'),
            backupFile: z.string().describe('Backup filename to delete (e.g., backup-domain.com-01.01.2024_12-00-00.tar.gz)')
        },
        async (params) => {
            const result = await client.call('deleteCloudBackup', {
                domainName: params.domainName,
                backupFile: params.backupFile
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Cloud backup "${params.backupFile}" for ${params.domainName} deleted successfully!`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error deleting cloud backup: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Restore Cloud Backup
    server.tool(
        'restore_cloud_backup',
        'Restore a website from a cloud backup. This operation runs in the background.',
        {
            domain: z.string().describe('Destination domain to restore to'),
            backupFile: z.string().describe('Backup filename to restore from'),
            sourceDomain: z.string().optional().describe('Source domain (if different from destination)')
        },
        async (params) => {
            const result = await client.call('SubmitCloudBackupRestore', {
                domain: params.domain,
                backupFile: params.backupFile,
                sourceDomain: params.sourceDomain || 'None'
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Cloud backup restore started for ${params.domain}!\n` +
                              `Status path: ${result.tempStatusPath}\n` +
                              `The restore is running in the background.`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error starting cloud backup restore: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    console.error('Registered CyberPanel cloud backup tools: submit_cloud_backup, list_cloud_backups, get_cloud_backup_settings, save_cloud_backup_settings, delete_cloud_backup, restore_cloud_backup');
}
