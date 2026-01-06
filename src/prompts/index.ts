/**
 * CyberPanel MCP Server - Prompts Module
 * 
 * Provides MCP Prompts for common operation templates.
 * Prompts are reusable templates that guide AI assistants through
 * complex multi-step operations.
 * 
 * Organized by domain:
 * - Website: Creation, configuration, troubleshooting
 * - Database: Setup, migration, optimization
 * - Email: Domain setup, accounts, deliverability
 * - Backup: Creation, restoration, disaster recovery
 * - SSL: Certificate management, troubleshooting
 * - WordPress: Deployment, staging, security
 * - Security: Firewall, ModSecurity, SSH hardening
 * - DNS: Zone management, records, migration
 * - FTP: Account management, troubleshooting
 * - Server: Health checks, optimization, monitoring
 * - Docker: Container deployment, management
 * 
 * @module cyberpanel-mcp/prompts
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Import domain-specific prompt modules
import { registerWebsitePrompts } from './website.js';
import { registerDatabasePrompts } from './database.js';
import { registerEmailPrompts } from './email.js';
import { registerBackupPrompts } from './backup.js';
import { registerSSLPrompts } from './ssl.js';
import { registerWordPressPrompts } from './wordpress.js';
import { registerSecurityPrompts } from './security.js';
import { registerDNSPrompts } from './dns.js';
import { registerFTPPrompts } from './ftp.js';
import { registerServerPrompts } from './server.js';
import { registerDockerPrompts } from './docker.js';

/**
 * Register all CyberPanel prompts with the MCP server
 * 
 * @param server - The McpServer instance
 */
export function registerAllPrompts(server: McpServer): void {
  console.error('Registering CyberPanel prompts... - index.ts:45');

  // Register all domain-specific prompts
  registerWebsitePrompts(server);
  registerDatabasePrompts(server);
  registerEmailPrompts(server);
  registerBackupPrompts(server);
  registerSSLPrompts(server);
  registerWordPressPrompts(server);
  registerSecurityPrompts(server);
  registerDNSPrompts(server);
  registerFTPPrompts(server);
  registerServerPrompts(server);
  registerDockerPrompts(server);

  console.error('CyberPanel prompts registration complete - index.ts:60');
}
