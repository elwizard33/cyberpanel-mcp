/**
 * CyberPanel MCP Server - Tool Registration Aggregator
 * 
 * This module aggregates all tool registration functions and provides
 * a single entry point for registering all CyberPanel tools with the MCP server.
 * 
 * Tool modules are organized by domain:
 * - websites: Website/domain management (createWebsite, deleteWebsite, listWebsites, etc.)
 * - databases: MySQL/MariaDB database management
 * - dns: DNS zone and record management
 * - email: Email accounts and domains
 * - ssl: SSL certificate management
 * - ftp: FTP account management
 * - backup: Backup operations
 * - packages: Hosting package management
 * - users: User/admin management
 * - firewall: Firewall rules management
 * - docker: Docker container management
 * - server: Server status and configuration
 * 
 * @module cyberpanel-mcp/tools
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

// Tool module imports - uncomment as modules are implemented
import { registerWebsiteTools } from './websites.js';
import { registerDatabaseTools } from './databases.js';
import { registerDnsTools } from './dns.js';
import { registerEmailTools } from './email.js';
import { registerSslTools } from './ssl.js';
import { registerFtpTools } from './ftp.js';
import { registerBackupTools } from './backups.js';
import { registerPackageTools } from './packages.js';
import { registerUserTools } from './users.js';
import { registerFirewallTools } from './firewall.js';
import { registerPhpTools } from './php.js';
import { registerWordPressTools } from './wordpress.js';
import { registerDomainTools } from './domains.js';
import { registerSshTools } from './ssh.js';
import { registerS3BackupTools } from './cloud-backups-s3.js';
import { registerDOBackupTools } from './cloud-backups-do.js';
import { registerMINIOBackupTools } from './cloud-backups-minio.js';
import { registerCloudBackupTools } from './cloud-backups-cyberpanel.js';
import { registerMySQLAdminTools } from './mysql-admin.js';
import { registerClusterTools } from './cluster.js';
import { registerContainerTools } from './containers.js';
import { registerN8NTools } from './n8n.js';
import { registerLogTools } from './logs.js';
import { registerApplicationTools } from './applications.js';
import { registerTuningTools } from './tuning.js';
import { registerACLTools } from './acl.js';
import { registerSystemTools } from './system.js';
// import { registerDockerTools } from './docker.js';
import { registerServerStatusTools } from './server-status.js';

/**
 * Register all CyberPanel tools with the MCP server
 * 
 * This function calls each domain-specific registration function to register
 * all available tools with the server. Tools are registered with Zod schemas
 * for input validation and provide access to CyberPanel CloudAPI functionality.
 * 
 * @param server - The McpServer instance to register tools with
 * @param client - The CyberPanelClient for API calls
 * 
 * @example
 * ```typescript
 * const server = new McpServer({ name: 'cyberpanel-mcp', version: '1.0.0' });
 * const client = new CyberPanelClient(config);
 * registerAllTools(server, client);
 * ```
 */
export function registerAllTools(server: McpServer, client: CyberPanelClient): void {
  // Log registration start
  console.error('Registering CyberPanel tools...');

  // Register tool modules - uncomment as modules are implemented
  registerWebsiteTools(server, client);
  registerDatabaseTools(server, client);
  registerDnsTools(server, client);
  registerEmailTools(server, client);
  registerSslTools(server, client);
  registerFtpTools(server, client);
  registerBackupTools(server, client);
  registerPackageTools(server, client);
  registerUserTools(server, client);
  registerFirewallTools(server, client);
  registerPhpTools(server, client);
  registerWordPressTools(server, client);
  registerDomainTools(server, client);
  registerSshTools(server, client);
  registerS3BackupTools(server, client);
  registerDOBackupTools(server, client);
  registerMINIOBackupTools(server, client);
  registerCloudBackupTools(server, client);
  registerClusterTools(server, client);
  registerContainerTools(server, client);
  registerN8NTools(server, client);
  registerLogTools(server, client);
  registerApplicationTools(server, client);
  registerTuningTools(server, client);
  registerACLTools(server, client);
  registerSystemTools(server, client);
  // registerDockerTools(server, client);
  registerServerStatusTools(server, client);
  registerMySQLAdminTools(server, client);

  console.error('CyberPanel tools registration complete');
}

/**
 * Type definition for tool registration functions
 * 
 * Each domain module should export a function matching this signature.
 * This ensures consistent registration patterns across all tool modules.
 */
export type ToolRegistrationFn = (server: McpServer, client: CyberPanelClient) => void;
