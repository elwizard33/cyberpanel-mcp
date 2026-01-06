/**
 * CyberPanel MCP Server - DigitalOcean Spaces Cloud Backup Tools
 * 
 * Tools for managing DigitalOcean Spaces backup operations including backup plans, execution, and restore.
 * 
 * Controllers from cloudAPI/views.py:
 * - connectAccountDO: Connect DigitalOcean account with credentials
 * - fetchBucketsDO: List DO Spaces buckets
 * - createPlanDO: Create backup plan
 * - fetchBackupPlansDO: List backup plans
 * - deletePlanDO: Delete backup plan
 * - fetchWebsitesInPlanDO: Get websites in a plan
 * - deleteDomainFromPlanDO: Remove domain from plan
 * - savePlanChangesDO: Update plan settings
 * - fetchBackupLogsDO: Get backup logs
 * - forceRunAWSBackupDO: Force run backup
 * 
 * @module cyberpanel-mcp/tools/cloud-backups-do
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register DigitalOcean Spaces backup tools with the MCP server
 * 
 * @param server - The McpServer instance
 * @param client - The CyberPanelClient for API calls
 */
export function registerDOBackupTools(server: McpServer, client: CyberPanelClient): void {
    
    // Connect DigitalOcean Spaces Account
    server.tool(
        'connect_do_spaces',
        'Connect DigitalOcean Spaces account for cloud backups. Requires DO Spaces credentials in INI format.',
        {
            credData: z.string().describe('DigitalOcean Spaces credentials in INI format:\n[default]\naws_access_key_id = YOUR_SPACES_ACCESS_KEY\naws_secret_access_key = YOUR_SPACES_SECRET_KEY')
        },
        async (params) => {
            const result = await client.call('connectAccountDO', {
                credData: params.credData
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: 'DigitalOcean Spaces account connected successfully!'
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error connecting DO Spaces account: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // List DO Spaces Buckets
    server.tool(
        'list_do_spaces',
        'List all Spaces (buckets) in the connected DigitalOcean account. Requires credentials to be configured first.',
        {
            doRegion: z.string().describe('DigitalOcean region (e.g., nyc3, sfo2, sgp1, fra1, ams3)')
        },
        async (params) => {
            const result = await client.call('fetchBucketsDO', {
                doRegion: params.doRegion
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `DO Spaces in region ${params.doRegion}:\n${result.data || '[]'}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error listing Spaces: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Create DO Spaces Backup Plan
    server.tool(
        'create_do_backup_plan',
        'Create a new DigitalOcean Spaces backup plan for websites. Specify which data to backup and the schedule.',
        {
            planName: z.string().describe('Name for the backup plan (no spaces)'),
            bucketName: z.string().describe('DO Spaces bucket name to store backups'),
            region: z.string().describe('DigitalOcean region (e.g., nyc3, sfo2, sgp1)'),
            frequency: z.enum(['daily', 'weekly']).describe('Backup frequency'),
            retention: z.number().describe('Number of backups to retain'),
            type: z.enum(['do', 'DO']).default('do').describe('Backup type identifier'),
            websitesInPlan: z.array(z.string()).describe('Array of website domains to backup')
        },
        async (params) => {
            const result = await client.call('createPlanDO', {
                planName: params.planName,
                bucketName: params.bucketName,
                region: params.region,
                frequency: params.frequency,
                retenion: params.retention, // Note: CyberPanel API uses "retenion" (typo)
                type: params.type,
                websitesInPlan: params.websitesInPlan
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `DO Spaces backup plan "${params.planName}" created successfully!\n` +
                              `Bucket: ${params.bucketName}\n` +
                              `Region: ${params.region}\n` +
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

    // List DO Spaces Backup Plans
    server.tool(
        'list_do_backup_plans',
        'List all DigitalOcean Spaces backup plans.',
        {
            type: z.enum(['do', 'DO']).default('do').describe('Backup type identifier')
        },
        async (params) => {
            const result = await client.call('fetchBackupPlansDO', {
                type: params.type
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `DO Spaces Backup Plans:\n${result.data || '[]'}`
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

    // Delete DO Spaces Backup Plan
    server.tool(
        'delete_do_backup_plan',
        'Delete a DigitalOcean Spaces backup plan.',
        {
            planName: z.string().describe('Name of the backup plan to delete')
        },
        async (params) => {
            const result = await client.call('deletePlanDO', {
                planName: params.planName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `DO Spaces backup plan "${params.planName}" deleted successfully!`
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

    // Force Run DO Spaces Backup
    server.tool(
        'run_do_backup',
        'Force run a DigitalOcean Spaces backup immediately. This operation runs in the background.',
        {
            planName: z.string().describe('Name of the backup plan to run')
        },
        async (params) => {
            const result = await client.call('forceRunAWSBackupDO', {
                planName: params.planName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `DO Spaces backup "${params.planName}" started successfully!\n` +
                              `The backup is running in the background.`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error starting backup: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Update DO Spaces Backup Plan
    server.tool(
        'update_do_backup_plan',
        'Update settings for an existing DigitalOcean Spaces backup plan.',
        {
            planName: z.string().describe('Name of the backup plan to update'),
            bucketName: z.string().optional().describe('New bucket name'),
            region: z.string().optional().describe('New DigitalOcean region'),
            frequency: z.enum(['daily', 'weekly']).optional().describe('New backup frequency'),
            retention: z.number().optional().describe('New retention count')
        },
        async (params) => {
            const result = await client.call('savePlanChangesDO', {
                planName: params.planName,
                bucketName: params.bucketName,
                region: params.region,
                frequency: params.frequency,
                retention: params.retention
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `DO Spaces backup plan "${params.planName}" updated successfully!`
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

    // Remove Domain from DO Spaces Backup Plan
    server.tool(
        'remove_domain_from_do_plan',
        'Remove a domain/website from a DigitalOcean Spaces backup plan.',
        {
            planName: z.string().describe('Name of the backup plan'),
            domainName: z.string().describe('Domain name to remove from the plan')
        },
        async (params) => {
            const result = await client.call('deleteDomainFromPlanDO', {
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

    // Get Websites in DO Spaces Plan
    server.tool(
        'get_do_plan_websites',
        'Get the list of websites included in a DigitalOcean Spaces backup plan.',
        {
            planName: z.string().describe('Name of the backup plan')
        },
        async (params) => {
            const result = await client.call('fetchWebsitesInPlanDO', {
                planName: params.planName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Websites in DO Spaces plan "${params.planName}":\n${result.data || '[]'}`
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

    // Get DO Spaces Backup Logs
    server.tool(
        'get_do_backup_logs',
        'Get backup logs for a DigitalOcean Spaces backup plan.',
        {
            planName: z.string().describe('Name of the backup plan'),
            page: z.number().default(1).describe('Page number for pagination'),
            recordsToShow: z.number().default(10).describe('Number of records per page')
        },
        async (params) => {
            const result = await client.call('fetchBackupLogsDO', {
                planName: params.planName,
                page: params.page,
                recordsToShow: params.recordsToShow
            }) as { status: number; error_message?: string; data?: { data?: unknown[]; pagination?: object } };
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Backup logs for DO Spaces plan "${params.planName}":\n` +
                              `Data: ${JSON.stringify(result.data?.data || [], null, 2)}\n` +
                              `Pagination: ${JSON.stringify(result.data?.pagination || {})}`
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

    console.error('Registered DigitalOcean Spaces backup tools: connect_do_spaces, list_do_spaces, create_do_backup_plan, list_do_backup_plans, delete_do_backup_plan, run_do_backup, update_do_backup_plan, remove_domain_from_do_plan, get_do_plan_websites, get_do_backup_logs');
}
