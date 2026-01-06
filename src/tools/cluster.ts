/**
 * CyberPanel MCP Server - Cluster and High Availability Tools
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

export function registerClusterTools(server: McpServer, client: CyberPanelClient): void {
  
  server.tool('setup_cluster', 'Setup cluster on this CyberPanel node', {
    type: z.string().describe('Cluster type'),
    config: z.string().describe('Cluster configuration')
  }, async ({ type, config }) => {
    const result = await client.call('SetupCluster', { type, config });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('boot_master', 'Boot the master node', {}, async () => {
    const result = await client.call('BootMaster', {});
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('boot_child', 'Boot a child node', {
    data: z.string().describe('Child node data')
  }, async ({ data }) => {
    const result = await client.call('BootChild', { data });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('sync_to_master', 'Sync to master node', {}, async () => {
    const result = await client.call('SyncToMaster', {});
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('detach_cluster', 'Detach from cluster', {
    type: z.string().describe('Detach type')
  }, async ({ type }) => {
    const result = await client.call('DetachCluster', { type });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('debug_cluster', 'Debug cluster', {
    type: z.string().describe('Debug type')
  }, async ({ type }) => {
    const result = await client.call('DebugCluster', { type });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('check_master_node', 'Check master node health', {}, async () => {
    const result = await client.call('CheckMasterNode', {});
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('switch_cluster_dns', 'Switch DNS via CloudFlare', {
    cfemail: z.string().email().describe('CloudFlare email'),
    apikey: z.string().describe('CloudFlare API key')
  }, async ({ cfemail, apikey }) => {
    const result = await client.call('SwitchDNS', { cfemail, apikey });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('fetch_master_bootstrap_status', 'Get master bootstrap status', {}, async () => {
    const result = await client.call('FetchMasterBootStrapStatus', {});
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('fetch_child_bootstrap_status', 'Get child bootstrap status', {}, async () => {
    const result = await client.call('FetchChildBootStrapStatus', {});
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('create_pending_vhosts', 'Create pending virtual hosts', {}, async () => {
    const result = await client.call('CreatePendingVirtualHosts', {});
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('setup_uptime_monitor', 'Setup uptime monitoring', {
    config: z.string().describe('Monitor config')
  }, async ({ config }) => {
    const result = await client.call('UptimeMonitor', { config });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('fetch_swarm_tokens', 'Get Docker Swarm tokens', {}, async () => {
    const result = await client.call('fetchManagerTokens', {});
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('add_swarm_worker', 'Add swarm worker', {
    token: z.string().describe('Swarm token'),
    ipAddress: z.string().describe('Manager IP')
  }, async ({ token, ipAddress }) => {
    const result = await client.call('addWorker', { token, ipAddress });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('leave_swarm', 'Leave Docker Swarm', {
    commands: z.array(z.string()).describe('Commands')
  }, async ({ commands }) => {
    const result = await client.call('leaveSwarm', { commands });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('setup_data_node', 'Setup data node', {
    composeData: z.array(z.string()).describe('Compose data')
  }, async ({ composeData }) => {
    const result = await client.call('setUpDataNode', { composeData });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('edit_cluster_resources', 'Edit cluster resources', {
    containers: z.number().int().positive().describe('Replicas'),
    containerRam: z.string().describe('RAM'),
    containerCPU: z.string().describe('CPU')
  }, async ({ containers, containerRam, containerCPU }) => {
    const result = await client.call('submitEditCluster', { containers, containerRam, containerCPU });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('setup_cluster_node', 'Setup cluster node', {
    commands: z.array(z.string()).describe('Commands'),
    tempStatusPath: z.string().describe('Status path')
  }, async ({ commands, tempStatusPath }) => {
    const result = await client.call('setupNode', { commands, tempStatusPath });
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });
}
