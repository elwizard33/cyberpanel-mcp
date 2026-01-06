/**
 * Server Management Prompts
 * @module cyberpanel-mcp/prompts/server
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerServerPrompts(server: McpServer): void {

  server.registerPrompt(
    'server-health-check',
    {
      title: 'Server Health Check',
      description: 'Comprehensive server status review',
      argsSchema: {}
    },
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Server health check:

1. System Resources:
   - get_system_status - CPU, memory, disk
   - Check if any resource >80%

2. Services:
   - manage_services - status all
   - Verify critical services running

3. Websites:
   - list_websites - Check all sites
   - Any SSL expiring soon?

4. Databases:
   - get_databases - Check status
   - Review database sizes

5. Email:
   - Check mail queue
   - Any bounced emails?

6. Security:
   - get_firewall_status
   - Recent login attempts

Report summary with any issues found.`
        }
      }]
    })
  );

  server.registerPrompt(
    'server-optimize',
    {
      title: 'Optimize Server',
      description: 'Performance tuning recommendations',
      argsSchema: {
        focus: z.enum(['web', 'database', 'all']).describe('Optimization focus'),
      }
    },
    async ({ focus }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Server optimization - ${focus}:

${focus === 'web' || focus === 'all' ? `Web Server:
- Enable LiteSpeed Cache
- Configure OPcache
- Enable Gzip compression
- Optimize PHP workers` : ''}

${focus === 'database' || focus === 'all' ? `Database:
- Tune MySQL buffer sizes
- Enable query cache
- Optimize tables
- Review slow queries` : ''}

${focus === 'all' ? `System:
- Review swap usage
- Clean temp files
- Update software
- Review cron jobs` : ''}

Use tuning tools if available.
Test performance after each change.`
        }
      }]
    })
  );

  server.registerPrompt(
    'service-restart',
    {
      title: 'Restart Services',
      description: 'Safely restart server services',
      argsSchema: {
        service: z.enum(['litespeed', 'mysql', 'email', 'dns', 'all']).describe('Service to restart'),
      }
    },
    async ({ service }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Restart ${service} service:

${service === 'litespeed' ? `Web Server:
manage_services - service: lsws, action: restart
Check websites accessible after restart.` : ''}

${service === 'mysql' ? `Database:
manage_services - service: mysql, action: restart
Warning: Active connections will be dropped.
Check applications reconnect properly.` : ''}

${service === 'email' ? `Email:
manage_services - service: postfix, action: restart
manage_services - service: dovecot, action: restart
Check mail delivery resumes.` : ''}

${service === 'dns' ? `DNS:
manage_services - service: named, action: restart
DNS resolution may be briefly interrupted.` : ''}

${service === 'all' ? `All services:
Restart in order: DNS → Database → Web → Email
Allow 30 seconds between each.
Verify each service before proceeding.` : ''}

Monitor logs after restart.`
        }
      }]
    })
  );

  server.registerPrompt(
    'disk-cleanup',
    {
      title: 'Disk Space Cleanup',
      description: 'Free up disk space',
      argsSchema: {}
    },
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Disk cleanup procedure:

1. Check current usage:
   get_system_status - disk info

2. Safe to clean:
   - /tmp files older than 7 days
   - Log files (rotate/compress)
   - Old backups
   - Package cache

3. Check large directories:
   - /home (user data)
   - /var/log (logs)
   - /backup (backups)

4. Database cleanup:
   - Remove unused databases
   - Optimize existing tables

5. Website cleanup:
   - Remove staging sites
   - Clear cache directories

Report space recovered.`
        }
      }]
    })
  );

  server.registerPrompt(
    'monitor-setup',
    {
      title: 'Set Up Monitoring',
      description: 'Configure server monitoring and alerts',
      argsSchema: {
        email: z.string().describe('Alert email address'),
      }
    },
    async ({ email }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Set up monitoring (alerts to ${email}):

1. Resource monitoring:
   - CPU > 90% for 5 minutes
   - Memory > 85%
   - Disk > 90%

2. Service monitoring:
   - Web server down
   - Database down
   - Mail server down

3. Security monitoring:
   - Failed SSH attempts
   - Firewall blocks
   - SSL expiring in 14 days

4. Configure in CyberPanel:
   - Email alerts
   - Check intervals

5. Test alert delivery

External monitoring recommended for uptime.`
        }
      }]
    })
  );
}
