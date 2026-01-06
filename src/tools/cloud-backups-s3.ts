/**
 * CyberPanel MCP Server - AWS S3 Cloud Backup Tools
 * 
 * Tools for managing AWS S3 backup operations including backup plans, execution, and restore.
 * 
 * Controllers from cloudAPI/views.py:
 * - connectAccount: Connect AWS account with credentials
 * - fetchBuckets: List S3 buckets
 * - createPlan: Create backup plan
 * - fetchBackupPlans: List backup plans
 * - deletePlan: Delete backup plan
 * - fetchWebsitesInPlan: Get websites in a plan
 * - deleteDomainFromPlan: Remove domain from plan
 * - savePlanChanges: Update plan settings
 * - fetchBackupLogs: Get backup logs
 * - forceRunAWSBackup: Force run backup
 * - getCurrentS3Backups: List S3 backups
 * - deleteS3Backup: Delete S3 backup
 * - SubmitS3BackupRestore: Restore from S3 backup
 * 
 * @module cyberpanel-mcp/tools/cloud-backups-s3
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register AWS S3 backup tools with the MCP server
 * 
 * @param server - The McpServer instance
 * @param client - The CyberPanelClient for API calls
 */
export function registerS3BackupTools(server: McpServer, client: CyberPanelClient): void {
    
    // Connect AWS S3 Account
    server.tool(
        'connect_aws_s3',
        'Connect AWS S3 account for cloud backups. Requires AWS credentials in INI format.',
        {
            credData: z.string().describe('AWS credentials in INI format:\n[default]\naws_access_key_id = YOUR_ACCESS_KEY\naws_secret_access_key = YOUR_SECRET_KEY\nregion = us-east-1')
        },
        async (params) => {
            const result = await client.call('connectAccount', {
                credData: params.credData
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: 'AWS S3 account connected successfully!'
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error connecting AWS account: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // List S3 Buckets
    server.tool(
        'list_s3_buckets',
        'List all S3 buckets in the connected AWS account. Requires AWS credentials to be configured first.',
        {},
        async () => {
            const result = await client.call('fetchBuckets', {});
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `S3 Buckets:\n${result.data || '[]'}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error listing buckets: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Create S3 Backup Plan
    server.tool(
        'create_s3_backup_plan',
        'Create a new S3 backup plan for websites. Specify which data to backup and the schedule.',
        {
            planName: z.string().describe('Name for the backup plan (no spaces)'),
            bucketName: z.string().describe('S3 bucket name to store backups'),
            frequency: z.enum(['Daily', 'Weekly', 'Monthly']).describe('Backup frequency'),
            retention: z.number().describe('Number of backups to retain'),
            websitesInPlan: z.array(z.string()).describe('List of domain names to include in backup'),
            data: z.boolean().optional().default(true).describe('Backup website data/files'),
            databases: z.boolean().optional().default(true).describe('Backup databases'),
            emails: z.boolean().optional().default(false).describe('Backup email accounts')
        },
        async (params) => {
            const result = await client.call('createPlan', {
                planName: params.planName,
                bucketName: params.bucketName,
                frequency: params.frequency,
                retenion: params.retention, // Note: API typo
                websitesInPlan: params.websitesInPlan,
                data: params.data ? 1 : 0,
                databases: params.databases ? 1 : 0,
                emails: params.emails ? 1 : 0
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Backup plan "${params.planName}" created successfully!\n` +
                              `Bucket: ${params.bucketName}\n` +
                              `Frequency: ${params.frequency}\n` +
                              `Retention: ${params.retention} backups\n` +
                              `Websites: ${params.websitesInPlan.join(', ')}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error creating backup plan: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // List S3 Backup Plans
    server.tool(
        'list_s3_backup_plans',
        'List all S3 backup plans configured for the server.',
        {},
        async () => {
            const result = await client.call('fetchBackupPlans', {});
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `S3 Backup Plans:\n${result.data || '[]'}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error listing backup plans: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Delete S3 Backup Plan
    server.tool(
        'delete_s3_backup_plan',
        'Delete an S3 backup plan. This does not delete existing backups in S3.',
        {
            planName: z.string().describe('Name of the backup plan to delete')
        },
        async (params) => {
            const result = await client.call('deletePlan', {
                planName: params.planName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Backup plan "${params.planName}" deleted successfully!`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error deleting backup plan: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Force Run S3 Backup
    server.tool(
        'run_s3_backup',
        'Force run a backup immediately for a specific backup plan.',
        {
            planName: z.string().describe('Name of the backup plan to run')
        },
        async (params) => {
            const result = await client.call('forceRunAWSBackup', {
                planName: params.planName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Backup started for plan "${params.planName}"!\n` +
                              `The backup is running in the background.`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error running backup: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // List S3 Backups for Domain
    server.tool(
        'list_s3_backups',
        'List all S3 backups for a specific domain in a backup plan.',
        {
            planName: z.string().describe('Name of the backup plan'),
            domainName: z.string().describe('Domain name to list backups for')
        },
        async (params) => {
            const result = await client.call('getCurrentS3Backups', {
                planName: params.planName,
                domainName: params.domainName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `S3 Backups for ${params.domainName}:\n${result.data || '[]'}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error listing S3 backups: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Delete S3 Backup
    server.tool(
        'delete_s3_backup',
        'Delete a specific backup file from S3.',
        {
            planName: z.string().describe('Name of the backup plan'),
            backupFile: z.string().describe('Full path/key of the backup file to delete')
        },
        async (params) => {
            const result = await client.call('deleteS3Backup', {
                planName: params.planName,
                backupFile: params.backupFile
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `S3 backup file deleted successfully!`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error deleting S3 backup: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Update S3 Backup Plan
    server.tool(
        'update_s3_backup_plan',
        'Update settings for an existing S3 backup plan.',
        {
            planName: z.string().describe('Name of the backup plan to update'),
            websitesInPlan: z.string().optional().describe('Comma-separated list of websites to include'),
            frequency: z.enum(['daily', 'weekly']).optional().describe('Backup frequency'),
            retention: z.number().optional().describe('Number of backups to retain'),
            data: z.boolean().optional().describe('Whether to backup website data'),
            databases: z.boolean().optional().describe('Whether to backup databases'),
            emails: z.boolean().optional().describe('Whether to backup emails')
        },
        async (params) => {
            const result = await client.call('savePlanChanges', {
                planName: params.planName,
                websitesInPlan: params.websitesInPlan || '',
                frequency: params.frequency,
                retenion: params.retention,
                data: params.data ? 1 : 0,
                databases: params.databases ? 1 : 0,
                emails: params.emails ? 1 : 0
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `S3 backup plan "${params.planName}" updated successfully!`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error updating plan: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Remove Domain from S3 Backup Plan
    server.tool(
        'remove_domain_from_s3_plan',
        'Remove a domain/website from an S3 backup plan.',
        {
            planName: z.string().describe('Name of the backup plan'),
            domainName: z.string().describe('Domain name to remove from the plan')
        },
        async (params) => {
            const result = await client.call('deleteDomainFromPlan', {
                planName: params.planName,
                domainName: params.domainName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Domain "${params.domainName}" removed from plan "${params.planName}" successfully!`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error removing domain from plan: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Restore S3 Backup
    server.tool(
        'restore_s3_backup',
        'Restore a website from an S3 backup. This operation runs in the background.',
        {
            planName: z.string().describe('Name of the backup plan'),
            domain: z.string().describe('Domain name to restore to'),
            backupFile: z.string().describe('Full path/key of the backup file to restore')
        },
        async (params) => {
            const result = await client.call('SubmitS3BackupRestore', {
                planName: params.planName,
                domain: params.domain,
                backupFile: params.backupFile
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `S3 backup restore started!\n` +
                              `Domain: ${params.domain}\n` +
                              `Status path: ${result.tempStatusPath}\n` +
                              `The restore is running in the background.`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error starting restore: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Get Websites in Plan
    server.tool(
        'get_s3_plan_websites',
        'Get the list of websites included in a backup plan.',
        {
            planName: z.string().describe('Name of the backup plan')
        },
        async (params) => {
            const result = await client.call('fetchWebsitesInPlan', {
                planName: params.planName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Websites in plan "${params.planName}":\n${result.data || '[]'}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error getting websites: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Get Backup Logs
    server.tool(
        'get_s3_backup_logs',
        'Get backup logs for a specific plan.',
        {
            planName: z.string().describe('Name of the backup plan')
        },
        async (params) => {
            const result = await client.call('fetchBackupLogs', {
                planName: params.planName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Backup logs for "${params.planName}":\n${result.data || '[]'}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error getting backup logs: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    console.error('Registered AWS S3 backup tools: connect_aws_s3, list_s3_buckets, create_s3_backup_plan, list_s3_backup_plans, delete_s3_backup_plan, update_s3_backup_plan, remove_domain_from_s3_plan, run_s3_backup, list_s3_backups, delete_s3_backup, restore_s3_backup, get_s3_plan_websites, get_s3_backup_logs');
}
