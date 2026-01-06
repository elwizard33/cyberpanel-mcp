/**
 * CyberPanel MCP Server - MINIO Cloud Backup Tools
 * 
 * Tools for managing MINIO (self-hosted S3-compatible) backup operations.
 * 
 * Controllers from cloudAPI/views.py:
 * - addMINIONode: Add MINIO node (endpoint, access key, secret key)
 * - fetchMINIONodes: List MINIO nodes
 * - deleteMINIONode: Delete MINIO node
 * - createPlanMINIO: Create backup plan
 * - fetchBackupPlansMINIO: List backup plans
 * - deletePlanMINIO: Delete backup plan
 * - savePlanChangesMINIO: Update plan settings
 * - forceRunAWSBackupMINIO: Force run backup
 * - fetchWebsitesInPlanMINIO: Get websites in a plan
 * - fetchBackupLogsMINIO: Get backup logs
 * - deleteDomainFromPlanMINIO: Remove domain from plan
 * 
 * @module cyberpanel-mcp/tools/cloud-backups-minio
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register MINIO backup tools with the MCP server
 * 
 * @param server - The McpServer instance
 * @param client - The CyberPanelClient for API calls
 */
export function registerMINIOBackupTools(server: McpServer, client: CyberPanelClient): void {
    
    // Add MINIO Node
    server.tool(
        'add_minio_node',
        'Add a MINIO node (self-hosted S3-compatible storage endpoint) for cloud backups.',
        {
            endPoint: z.string().describe('MINIO endpoint URL (e.g., https://minio.example.com:9000)'),
            accessKey: z.string().describe('MINIO access key'),
            secretKey: z.string().describe('MINIO secret key')
        },
        async (params) => {
            const result = await client.call('addMINIONode', {
                endPoint: params.endPoint,
                accessKey: params.accessKey,
                secretKey: params.secretKey
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `MINIO node added successfully!\n` +
                              `Endpoint: ${params.endPoint}\n` +
                              `Access Key: ${params.accessKey}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error adding MINIO node: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // List MINIO Nodes
    server.tool(
        'list_minio_nodes',
        'List all configured MINIO nodes.',
        {},
        async () => {
            const result = await client.call('fetchMINIONodes', {});
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `MINIO Nodes:\n${result.data || '[]'}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error listing MINIO nodes: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Delete MINIO Node
    server.tool(
        'delete_minio_node',
        'Delete a MINIO node configuration.',
        {
            accessKey: z.string().describe('Access key of the MINIO node to delete')
        },
        async (params) => {
            const result = await client.call('deleteMINIONode', {
                accessKey: params.accessKey
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `MINIO node "${params.accessKey}" deleted successfully!`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error deleting MINIO node: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Create MINIO Backup Plan
    server.tool(
        'create_minio_backup_plan',
        'Create a new MINIO backup plan for websites.',
        {
            planName: z.string().describe('Name for the backup plan (no spaces)'),
            minioNode: z.string().describe('Access key of the MINIO node to use'),
            frequency: z.enum(['daily', 'weekly']).describe('Backup frequency'),
            retention: z.number().describe('Number of backups to retain'),
            websitesInPlan: z.array(z.string()).describe('Array of website domains to backup')
        },
        async (params) => {
            const result = await client.call('createPlanMINIO', {
                planName: params.planName,
                minioNode: params.minioNode,
                frequency: params.frequency,
                retenion: params.retention, // Note: CyberPanel API uses "retenion" (typo)
                websitesInPlan: params.websitesInPlan
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `MINIO backup plan "${params.planName}" created successfully!\n` +
                              `MINIO Node: ${params.minioNode}\n` +
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

    // List MINIO Backup Plans
    server.tool(
        'list_minio_backup_plans',
        'List all MINIO backup plans.',
        {},
        async () => {
            const result = await client.call('fetchBackupPlansMINIO', {});
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `MINIO Backup Plans:\n${result.data || '[]'}`
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

    // Delete MINIO Backup Plan
    server.tool(
        'delete_minio_backup_plan',
        'Delete a MINIO backup plan.',
        {
            planName: z.string().describe('Name of the backup plan to delete')
        },
        async (params) => {
            const result = await client.call('deletePlanMINIO', {
                planName: params.planName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `MINIO backup plan "${params.planName}" deleted successfully!`
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

    // Force Run MINIO Backup
    server.tool(
        'run_minio_backup',
        'Force run a MINIO backup immediately. This operation runs in the background.',
        {
            planName: z.string().describe('Name of the backup plan to run')
        },
        async (params) => {
            const result = await client.call('forceRunAWSBackupMINIO', {
                planName: params.planName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `MINIO backup "${params.planName}" started successfully!\n` +
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

    // Update MINIO Backup Plan
    server.tool(
        'update_minio_backup_plan',
        'Update settings for an existing MINIO backup plan.',
        {
            planName: z.string().describe('Name of the backup plan to update'),
            minioNode: z.string().optional().describe('New MINIO node access key'),
            frequency: z.enum(['daily', 'weekly']).optional().describe('New backup frequency'),
            retention: z.number().optional().describe('New retention count')
        },
        async (params) => {
            const result = await client.call('savePlanChangesMINIO', {
                planName: params.planName,
                minioNode: params.minioNode,
                frequency: params.frequency,
                retention: params.retention
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `MINIO backup plan "${params.planName}" updated successfully!`
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

    // Remove Domain from MINIO Backup Plan
    server.tool(
        'remove_domain_from_minio_plan',
        'Remove a domain/website from a MINIO backup plan.',
        {
            planName: z.string().describe('Name of the backup plan'),
            domainName: z.string().describe('Domain name to remove from the plan')
        },
        async (params) => {
            const result = await client.call('deleteDomainFromPlanMINIO', {
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

    // Get Websites in MINIO Plan
    server.tool(
        'get_minio_plan_websites',
        'Get the list of websites included in a MINIO backup plan.',
        {
            planName: z.string().describe('Name of the backup plan')
        },
        async (params) => {
            const result = await client.call('fetchWebsitesInPlanMINIO', {
                planName: params.planName
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Websites in MINIO plan "${params.planName}":\n${result.data || '[]'}`
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

    // Get MINIO Backup Logs
    server.tool(
        'get_minio_backup_logs',
        'Get backup logs for a MINIO backup plan.',
        {
            planName: z.string().describe('Name of the backup plan'),
            page: z.number().default(1).describe('Page number for pagination'),
            recordsToShow: z.number().default(10).describe('Number of records per page')
        },
        async (params) => {
            const result = await client.call('fetchBackupLogsMINIO', {
                planName: params.planName,
                page: params.page,
                recordsToShow: params.recordsToShow
            }) as { status: number; error_message?: string; data?: { data?: unknown[]; pagination?: object } };
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Backup logs for MINIO plan "${params.planName}":\n` +
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

    console.error('Registered MINIO backup tools: add_minio_node, list_minio_nodes, delete_minio_node, create_minio_backup_plan, list_minio_backup_plans, delete_minio_backup_plan, run_minio_backup, update_minio_backup_plan, remove_domain_from_minio_plan, get_minio_plan_websites, get_minio_backup_logs');
}
