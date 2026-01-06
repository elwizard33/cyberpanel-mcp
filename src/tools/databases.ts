/**
 * CyberPanel MCP Server - Database Management Tools
 * 
 * Tools for managing MySQL/MariaDB databases in CyberPanel.
 * 
 * Controllers from cloudAPI/views.py:
 * - fetchDatabases: List databases for a website
 * - submitDBCreation: Create new database
 * - submitDatabaseDeletion: Delete database
 * 
 * Note: Database names are prefixed with website username (e.g., username_dbname)
 * 
 * @module cyberpanel-mcp/tools/databases
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register database management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerDatabaseTools(server: McpServer, client: CyberPanelClient): void {
  
  /**
   * List databases for a website
   * Controller: fetchDatabases
   * Required params: databaseWebsite
   */
  server.tool(
    'list_databases',
    'List all MySQL/MariaDB databases for a website',
    {
      databaseWebsite: z.string().describe('Domain name of the website to list databases for'),
    },
    async ({ databaseWebsite }) => {
      const result = await client.call('fetchDatabases', { databaseWebsite });
      
      if (result.status === 0) {
        return {
          content: [{ 
            type: 'text' as const, 
            text: `Error listing databases: ${result.error_message || 'Unknown error'}` 
          }],
          isError: true,
        };
      }
      
      // Format databases for display
      const databases = result.data || [];
      let dbText = '';
      if (Array.isArray(databases) && databases.length > 0) {
        dbText = databases.map((db: any, i: number) => 
          `${i + 1}. ${db.dbName || db.name || 'N/A'}${db.dbUser ? ` (User: ${db.dbUser})` : ''}`
        ).join('\n');
      } else {
        dbText = 'No databases found';
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Databases for ${databaseWebsite}:\n\n${dbText}` 
        }],
      };
    }
  );

  /**
   * Create a new database
   * Controller: submitDBCreation
   * Required params: databaseWebsite, dbName, dbUsername, dbPassword, webUserName
   * 
   * Note: CyberPanel prefixes database and user names with the website username
   * e.g., if webUserName is "john" and dbName is "mydb", final name is "john_mydb"
   */
  server.tool(
    'create_database',
    'Create a new MySQL/MariaDB database for a website',
    {
      databaseWebsite: z.string().describe('Domain name of the website'),
      dbName: z.string().describe('Database name (will be prefixed with website username)'),
      dbUsername: z.string().describe('Database username (will be prefixed with website username)'),
      dbPassword: z.string().describe('Database password'),
      webUserName: z.string().describe('Website username for prefixing database/user names'),
    },
    async (params) => {
      const result = await client.call('submitDBCreation', {
        databaseWebsite: params.databaseWebsite,
        dbName: params.dbName,
        dbUsername: params.dbUsername,
        dbPassword: params.dbPassword,
        webUserName: params.webUserName,
      });
      
      if (result.status === 0) {
        return {
          content: [{ 
            type: 'text' as const, 
            text: `Error creating database: ${result.error_message || 'Unknown error'}` 
          }],
          isError: true,
        };
      }
      
      // Include the final database/user names in response (they're prefixed)
      const dbName = result.dbName || `${params.webUserName}_${params.dbName}`;
      const dbUsername = result.dbUsername || `${params.webUserName}_${params.dbUsername}`;
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Database created successfully.\n\nDatabase Name: ${dbName}\nDatabase User: ${dbUsername}\n\n${JSON.stringify(result, null, 2)}` 
        }],
      };
    }
  );

  /**
   * Delete a database
   * Controller: submitDatabaseDeletion
   * Required params: dbName (full name including prefix)
   */
  server.tool(
    'delete_database',
    'Delete a MySQL/MariaDB database',
    {
      dbName: z.string().describe('Full database name to delete (including prefix, e.g., username_dbname)'),
    },
    async ({ dbName }) => {
      const result = await client.call('submitDatabaseDeletion', { dbName });
      
      if (result.status === 0) {
        return {
          content: [{ 
            type: 'text' as const, 
            text: `Error deleting database: ${result.error_message || 'Unknown error'}` 
          }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Database ${dbName} deleted successfully.` 
        }],
      };
    }
  );

  /**
   * Change database user password
   * Controller: changePassword
   * Required params: dbUserName, dbPassword
   */
  server.tool(
    'change_database_password',
    'Change the password for a database user',
    {
      dbUserName: z.string().describe('Database username (full name including prefix, e.g., username_dbuser)'),
      dbPassword: z.string().describe('New password for the database user'),
    },
    async (params) => {
      const result = await client.call('changePassword', {
        dbUserName: params.dbUserName,
        dbPassword: params.dbPassword,
      });
      
      if (result.status === 0 || result.changePasswordStatus === 0) {
        return {
          content: [{ 
            type: 'text' as const, 
            text: `Error changing database password: ${result.error_message || 'Unknown error'}` 
          }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Password changed successfully for database user ${params.dbUserName}.` 
        }],
      };
    }
  );

  console.error('Registered database management tools: list_databases, create_database, delete_database, change_database_password');
}
