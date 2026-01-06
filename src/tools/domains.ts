/**
 * CyberPanel MCP Server - Child Domain Management Tools
 * 
 * Tools for managing child domains (subdomains and addon domains) attached to parent websites.
 * 
 * Controllers from cloudAPI/views.py:
 * - fetchDomains: List child domains for a website
 * - submitDomainCreation: Create a new child domain
 * - submitDomainDeletion: Delete a child domain
 * 
 * @module cyberpanel-mcp/tools/domains
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register child domain management tools with the MCP server
 * 
 * @param server - The McpServer instance
 * @param client - The CyberPanelClient for API calls
 */
export function registerDomainTools(server: McpServer, client: CyberPanelClient): void {
    
    // List Child Domains Tool
    server.tool(
        'list_child_domains',
        'List child/addon domains attached to a parent website. Child domains are subdomains or additional domains hosted under a main website.',
        {
            masterDomain: z.string().describe('The parent website domain name (e.g., example.com)'),
            alias: z.number().optional().default(0).describe('Filter by alias type: 0 = child domains, 1 = aliases only')
        },
        async (params) => {
            const result = await client.call('fetchDomains', {
                masterDomain: params.masterDomain,
                alias: params.alias ?? 0
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Child domains for ${params.masterDomain}:\n${JSON.stringify(result.data, null, 2)}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error listing child domains: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Create Child Domain Tool
    server.tool(
        'create_child_domain',
        'Create a new child domain (subdomain or addon domain) under a parent website. The child domain will share resources with the parent.',
        {
            masterDomain: z.string().describe('The parent website domain name (e.g., example.com)'),
            domainName: z.string().describe('The new child domain name (e.g., blog.example.com or addon.com)'),
            phpSelection: z.string().optional().default('inherit').describe('PHP version to use (e.g., PHP 8.2 or inherit from parent)'),
            path: z.string().optional().describe('Document root path relative to parent (e.g., /blog or /addon)'),
            alias: z.number().optional().default(0).describe('Create as alias: 0 = child domain, 1 = domain alias')
        },
        async (params) => {
            const apiParams: Record<string, unknown> = {
                masterDomain: params.masterDomain,
                domainName: params.domainName,
                alias: params.alias ?? 0
            };
            
            // Only include phpSelection and path if not creating an alias
            if ((params.alias ?? 0) === 0) {
                apiParams.phpSelection = params.phpSelection || 'inherit';
                apiParams.path = params.path || `/${params.domainName.split('.')[0]}`;
            }
            
            const result = await client.call('submitDomainCreation', apiParams);
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Successfully created child domain: ${params.domainName}\n` +
                              `Parent: ${params.masterDomain}\n` +
                              `Type: ${(params.alias ?? 0) === 1 ? 'Alias' : 'Child Domain'}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error creating child domain: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Delete Child Domain Tool
    server.tool(
        'delete_child_domain',
        'Delete a child domain from the server. WARNING: This will remove all files and configurations for the child domain.',
        {
            websiteName: z.string().describe('The child domain name to delete (e.g., blog.example.com)'),
            deleteDocRoot: z.boolean().optional().default(false).describe('Also delete the document root folder and all files')
        },
        async (params) => {
            const result = await client.call('submitDomainDeletion', {
                websiteName: params.websiteName,
                DeleteDocRoot: params.deleteDocRoot ? 1 : 0
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Successfully deleted child domain: ${params.websiteName}\n` +
                              `Document root ${params.deleteDocRoot ? 'was' : 'was not'} deleted`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error deleting child domain: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    console.error('Registered child domain management tools: list_child_domains, create_child_domain, delete_child_domain');
}
