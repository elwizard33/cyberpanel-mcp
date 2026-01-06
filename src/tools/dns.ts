/**
 * CyberPanel MCP Server - DNS Management Tools
 * 
 * Tools for managing DNS records in CyberPanel (PowerDNS).
 * 
 * Controllers from cloudAPI/views.py:
 * - getCurrentRecordsForDomain: List DNS records by type
 * - addDNSRecord: Create DNS record
 * - deleteDNSRecord: Delete DNS record by ID
 * 
 * Supported record types: A, AAAA, CNAME, MX, TXT, SPF, NS, SOA, SRV, CAA
 * 
 * Note: DNS functionality requires PowerDNS to be active on the CyberPanel server.
 * 
 * @module cyberpanel-mcp/tools/dns
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

// DNS record type mapping for CyberPanel API
const RECORD_TYPE_MAP: Record<string, string> = {
  'A': 'aRecord',
  'AAAA': 'aaaaRecord',
  'CNAME': 'cNameRecord',
  'MX': 'mxRecord',
  'TXT': 'txtRecord',
  'SPF': 'spfRecord',
  'NS': 'nsRecord',
  'SOA': 'soaRecord',
  'SRV': 'srvRecord',
  'CAA': 'caaRecord',
};

// Zod schema for record types
const RecordTypeSchema = z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SPF', 'NS', 'SOA', 'SRV', 'CAA']);

/**
 * Register DNS management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerDnsTools(server: McpServer, client: CyberPanelClient): void {
  
  // List DNS records for a zone
  server.tool(
    'list_dns_records',
    'List DNS records for a domain zone by record type',
    {
      selectedZone: z.string().describe('Domain name / DNS zone (e.g., example.com)'),
      recordType: RecordTypeSchema.describe('Type of DNS record to list'),
    },
    async ({ selectedZone, recordType }) => {
      const currentSelection = RECORD_TYPE_MAP[recordType];
      const result = await client.call('getCurrentRecordsForDomain', { 
        selectedZone, 
        currentSelection 
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error listing DNS records: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      // Format records for display
      const records = result.data || [];
      let recordsText = '';
      if (Array.isArray(records) && records.length > 0) {
        recordsText = records.map((r: any, i: number) => 
          `${i + 1}. ${r.name || 'N/A'} → ${r.value || r.content || 'N/A'} (TTL: ${r.ttl || 'N/A'}${r.priority ? `, Priority: ${r.priority}` : ''})`
        ).join('\n');
      } else if (typeof records === 'string') {
        recordsText = records || 'No records found';
      } else {
        recordsText = 'No records found';
      }
      
      return {
        content: [{ type: 'text' as const, text: `DNS ${recordType} records for ${selectedZone}:\n\n${recordsText}` }],
      };
    }
  );

  // Create a new DNS record
  server.tool(
    'create_dns_record',
    'Create a new DNS record for a domain zone',
    {
      selectedZone: z.string().describe('Domain name / DNS zone (e.g., example.com)'),
      recordType: RecordTypeSchema.describe('Type of DNS record'),
      recordName: z.string().describe('Record name (use @ for apex/root domain, or subdomain like www)'),
      recordContent: z.string().describe('Record value (IP for A/AAAA, hostname for CNAME/MX/NS, text for TXT/SPF)'),
      ttl: z.number().int().min(1).max(86400).default(3600).describe('Time to live in seconds (1-86400)'),
      priority: z.number().int().min(0).max(65535).default(10).describe('Priority (for MX and SRV records)'),
    },
    async (params) => {
      const requestData: Record<string, unknown> = {
        selectedZone: params.selectedZone,
        recordType: params.recordType,
        recordName: params.recordName,
        ttl: params.ttl,
      };

      // CyberPanel uses different field names for different record types
      const contentFieldMap: Record<string, string> = {
        'A': 'recordContentA',
        'AAAA': 'recordContentAAAA',
        'CNAME': 'recordContentCNAME',
        'MX': 'recordContentMX',
        'TXT': 'recordContentTXT',
        'SPF': 'recordContentSPF',
        'NS': 'recordContentNS',
        'SOA': 'recordContentSOA',
        'SRV': 'recordContentSRV',
        'CAA': 'recordContentCAA',
      };
      
      requestData[contentFieldMap[params.recordType]] = params.recordContent;
      
      if (params.recordType === 'MX' || params.recordType === 'SRV') {
        requestData.priority = params.priority;
      }

      const result = await client.call('addDNSRecord', requestData);
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error creating DNS record: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `DNS ${params.recordType} record created successfully for ${params.selectedZone}.\n\nName: ${params.recordName}\nContent: ${params.recordContent}\nTTL: ${params.ttl}` }],
      };
    }
  );

  // Delete a DNS record
  server.tool(
    'delete_dns_record',
    'Delete a DNS record by its ID',
    {
      id: z.number().int().describe('Record ID (obtained from list_dns_records)'),
    },
    async ({ id }) => {
      const result = await client.call('deleteDNSRecord', { id });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error deleting DNS record: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `DNS record ${id} deleted successfully.` }],
      };
    }
  );

  console.error('Registered DNS management tools: list_dns_records, create_dns_record, delete_dns_record');
}
