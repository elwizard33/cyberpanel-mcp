/**
 * DNS Management Prompts
 * @module cyberpanel-mcp/prompts/dns
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerDNSPrompts(server: McpServer): void {

  server.registerPrompt(
    'dns-setup',
    {
      title: 'DNS Zone Setup',
      description: 'Configure DNS records for a domain',
      argsSchema: {
        domain: z.string().describe('Domain name'),
        serverIP: z.string().describe('Server IP address'),
      }
    },
    async ({ domain, serverIP }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Set up DNS for ${domain}:

1. create_dns_zone - domain: ${domain}

2. Required records:
   - A record: ${domain} → ${serverIP}
   - A record: www.${domain} → ${serverIP}
   - MX record: ${domain} → mail.${domain}
   - A record: mail.${domain} → ${serverIP}

3. add_dns_record for each

4. Verify with get_dns_records

Update nameservers at registrar:
- ns1.${domain}
- ns2.${domain}`
        }
      }]
    })
  );

  server.registerPrompt(
    'email-dns-records',
    {
      title: 'Email DNS Records',
      description: 'Configure SPF, DKIM, DMARC for email',
      argsSchema: {
        domain: z.string().describe('Email domain'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Email DNS for ${domain}:

1. SPF Record:
   add_dns_record - TXT
   ${domain} → "v=spf1 a mx ip4:SERVER_IP ~all"

2. DKIM:
   get_dkim_key - domain: ${domain}
   add_dns_record - TXT
   dkim._domainkey.${domain} → [DKIM key]

3. DMARC:
   add_dns_record - TXT
   _dmarc.${domain} → "v=DMARC1; p=quarantine; rua=mailto:admin@${domain}"

4. Verify with DNS lookup tools

These records improve email deliverability.`
        }
      }]
    })
  );

  server.registerPrompt(
    'dns-migrate',
    {
      title: 'Migrate DNS',
      description: 'Migrate DNS records from another provider',
      argsSchema: {
        domain: z.string().describe('Domain to migrate'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Migrate DNS for ${domain}:

1. Export records from current provider
2. create_dns_zone - domain: ${domain}
3. Add each record with add_dns_record

Record types to migrate:
- A records (website)
- CNAME records (aliases)
- MX records (email)
- TXT records (SPF, DKIM, verification)
- NS records (if self-hosted)

4. Lower TTL before migration
5. Update nameservers at registrar
6. Monitor propagation (24-48 hours)
7. Verify all services working`
        }
      }]
    })
  );

  server.registerPrompt(
    'subdomain-create',
    {
      title: 'Create Subdomain',
      description: 'Add subdomain with DNS records',
      argsSchema: {
        subdomain: z.string().describe('Subdomain name'),
        domain: z.string().describe('Parent domain'),
        type: z.enum(['website', 'api', 'mail', 'custom']).describe('Subdomain purpose'),
      }
    },
    async ({ subdomain, domain, type }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Create ${subdomain}.${domain} for ${type}:

1. add_dns_record - A record
   ${subdomain}.${domain} → SERVER_IP

2. Based on type:
   ${type === 'website' ? '- create_child_domain or create_website' : ''}
   ${type === 'api' ? '- Point to API server, add CORS headers' : ''}
   ${type === 'mail' ? '- Configure as MX, add mail records' : ''}
   ${type === 'custom' ? '- Configure as needed' : ''}

3. Issue SSL certificate
   issue_ssl - domain: ${subdomain}.${domain}

4. Verify DNS propagation`
        }
      }]
    })
  );
}
