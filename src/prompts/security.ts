/**
 * Security & Firewall Prompts
 * @module cyberpanel-mcp/prompts/security
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerSecurityPrompts(server: McpServer): void {

  server.registerPrompt(
    'firewall-setup',
    {
      title: 'Configure Firewall',
      description: 'Set up firewall rules for server security',
      argsSchema: {
        mode: z.enum(['basic', 'strict', 'custom']).describe('Security level'),
      }
    },
    async ({ mode }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Configure firewall - ${mode} mode:

1. get_firewall_status - Check current state
2. get_firewall_rules - List existing rules

${mode === 'basic' ? `Basic (web hosting):
- Allow: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Allow: 25, 587, 465 (Mail)
- Allow: 53 (DNS)` : ''}

${mode === 'strict' ? `Strict (high security):
- Allow: 22 (SSH) - specific IPs only
- Allow: 443 (HTTPS only)
- Block all other inbound` : ''}

${mode === 'custom' ? `Custom:
- Define rules based on requirements
- Use add_firewall_rule for each` : ''}

3. Apply rules with add_firewall_rule
4. Verify with get_firewall_rules`
        }
      }]
    })
  );

  server.registerPrompt(
    'security-audit',
    {
      title: 'Security Audit',
      description: 'Comprehensive server security check',
      argsSchema: {}
    },
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Security audit checklist:

1. SSH Security:
   - Check SSH port (change from 22)
   - Verify key-only authentication
   - get_ssh_key_status

2. Firewall:
   - get_firewall_status
   - get_firewall_rules
   - Verify minimal open ports

3. SSL/TLS:
   - list_websites - Check SSL status
   - Verify certificates valid

4. ModSecurity:
   - get_modsecurity_rules
   - Enable for all websites

5. Services:
   - manage_services - status
   - Disable unused services

6. Users:
   - Check admin accounts
   - Verify strong passwords

Report all findings with recommendations.`
        }
      }]
    })
  );

  server.registerPrompt(
    'block-ip',
    {
      title: 'Block IP Address',
      description: 'Block malicious IP addresses',
      argsSchema: {
        ip: z.string().describe('IP address to block'),
        reason: z.string().optional().describe('Reason for blocking'),
      }
    },
    async ({ ip, reason }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Block IP: ${ip}
${reason ? `Reason: ${reason}` : ''}

1. add_firewall_rule:
   - protocol: tcp
   - port: all
   - source: ${ip}
   - action: DROP

2. Verify with get_firewall_rules

Alternative methods:
- fail2ban for automated blocking
- CSF for IP management`
        }
      }]
    })
  );

  server.registerPrompt(
    'modsecurity-configure',
    {
      title: 'Configure ModSecurity',
      description: 'Set up WAF rules for website protection',
      argsSchema: {
        domain: z.string().describe('Domain to protect'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Configure ModSecurity for ${domain}:

1. get_modsecurity_rules - Check current rules
2. get_modsecurity_status - domain: ${domain}

Enable WAF:
3. enable_modsecurity - domain: ${domain}
4. Add OWASP rules

Testing:
5. Monitor for false positives
6. Check access_logs for blocked requests

Note: May need to whitelist legitimate requests.`
        }
      }]
    })
  );

  server.registerPrompt(
    'ssh-hardening',
    {
      title: 'Harden SSH Access',
      description: 'Secure SSH configuration',
      argsSchema: {}
    },
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `SSH hardening checklist:

1. get_ssh_key_status - Check current config

Recommendations:
- Disable password authentication
- Use SSH keys only
- Change default port from 22
- Limit users allowed to SSH
- Set connection timeout
- Disable root login

2. Generate SSH key if needed
3. Update firewall for new port
4. Test connection before logout

Warning: Keep backup access method active.`
        }
      }]
    })
  );
}
