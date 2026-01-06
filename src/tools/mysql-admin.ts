/**
 * CyberPanel MCP Server - MySQL Administration Tools
 * 
 * Advanced MySQL administration tools for server-level operations.
 * Different from website database management - these are admin-level operations.
 * 
 * @module cyberpanel-mcp/tools/mysql-admin
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

export function registerMySQLAdminTools(server: McpServer, client: CyberPanelClient): void {
    
    server.tool(
        'get_mysql_status',
        'Get MySQL server status information including uptime, queries, connections, etc.',
        {},
        async () => {
            const result = await client.call('showStatus', {});
            if (result.status === 1) {
                return { content: [{ type: 'text' as const, text: `MySQL Server Status:\n${JSON.stringify(result, null, 2)}` }] };
            }
            return { content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }], isError: true };
        }
    );

    server.tool(
        'get_mysql_config',
        'Get server RAM information and current MySQL configuration file content.',
        {},
        async () => {
            const result = await client.call('fetchRam', {});
            if (result.status === 1) {
                return { content: [{ type: 'text' as const, text: `Server RAM: ${result.ramInGB} GB\n\nMySQL Configuration:\n${result.conf}` }] };
            }
            return { content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }], isError: true };
        }
    );

    server.tool(
        'apply_mysql_changes',
        'Apply MySQL configuration changes. Warning: This modifies the MySQL config file.',
        { suggestedContent: z.string().describe('The new MySQL configuration content to apply') },
        async (params) => {
            const result = await client.call('applyMySQLChanges', { suggestedContent: params.suggestedContent });
            if (result.status === 1) {
                return { content: [{ type: 'text' as const, text: `MySQL configuration applied successfully!` }] };
            }
            return { content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }], isError: true };
        }
    );

    // Note: restart_mysql is already registered in server-status.ts

    server.tool(
        'list_all_mysql_databases',
        'List all MySQL databases on the server (admin-level view).',
        {},
        async () => {
            const result = await client.call('fetchDatabasesMYSQL', {});
            if (result.status === 1) {
                return { content: [{ type: 'text' as const, text: `MySQL Databases:\n${result.databases || '[]'}` }] };
            }
            return { content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }], isError: true };
        }
    );

    server.tool(
        'list_mysql_tables',
        'List all tables in a MySQL database with detailed information.',
        { databaseName: z.string().describe('Name of the database') },
        async (params) => {
            const result = await client.call('fetchTables', { databaseName: params.databaseName });
            if (result.status === 1) {
                return { content: [{ type: 'text' as const, text: `Tables in "${params.databaseName}":\n${result.tables || '[]'}` }] };
            }
            return { content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }], isError: true };
        }
    );

    server.tool(
        'delete_mysql_table',
        'Delete a table from a MySQL database. Warning: This is irreversible!',
        { databaseName: z.string().describe('Name of the database'), tableName: z.string().describe('Name of the table to delete') },
        async (params) => {
            const result = await client.call('deleteTable', { databaseName: params.databaseName, tableName: params.tableName });
            if (result.status === 1) {
                return { content: [{ type: 'text' as const, text: `Table "${params.tableName}" deleted successfully!` }] };
            }
            return { content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }], isError: true };
        }
    );

    server.tool(
        'get_mysql_table_data',
        'Get data from a MySQL table with pagination.',
        {
            databaseName: z.string().describe('Name of the database'),
            tableName: z.string().describe('Name of the table'),
            currentPage: z.number().default(1).describe('Page number'),
            recordsToShow: z.number().default(10).describe('Records per page')
        },
        async (params) => {
            const result = await client.call('fetchTableData', {
                databaseName: params.databaseName,
                tableName: params.tableName,
                currentPage: params.currentPage,
                recordsToShow: params.recordsToShow
            });
            if (result.status === 1) {
                return { content: [{ type: 'text' as const, text: `Data from ${params.databaseName}.${params.tableName}:\n${result.completeData}` }] };
            }
            return { content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }], isError: true };
        }
    );

    server.tool(
        'get_mysql_table_structure',
        'Get the column structure of a MySQL table.',
        { databaseName: z.string().describe('Name of the database'), tableName: z.string().describe('Name of the table') },
        async (params) => {
            const result = await client.call('fetchStructure', { databaseName: params.databaseName, tableName: params.tableName });
            if (result.status === 1) {
                return { content: [{ type: 'text' as const, text: `Structure of ${params.databaseName}.${params.tableName}:\n${result.columns || '[]'}` }] };
            }
            return { content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }], isError: true };
        }
    );

    console.error('Registered MySQL admin tools: get_mysql_status, get_mysql_config, apply_mysql_changes, list_all_mysql_databases, list_mysql_tables, delete_mysql_table, get_mysql_table_data, get_mysql_table_structure - mysql-admin.ts:132');
}
