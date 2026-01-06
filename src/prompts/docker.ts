/**
 * Docker & Container Management Prompts
 * @module cyberpanel-mcp/prompts/docker
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerDockerPrompts(server: McpServer): void {

  server.registerPrompt(
    'docker-deploy',
    {
      title: 'Deploy Docker Container',
      description: 'Deploy application using Docker',
      argsSchema: {
        image: z.string().describe('Docker image name'),
        name: z.string().describe('Container name'),
      }
    },
    async ({ image, name }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Deploy Docker container:

1. Check Docker available:
   get_container_images

2. Pull image:
   pull_container_image - image: ${image}

3. Create container:
   create_container:
   - name: ${name}
   - image: ${image}
   - ports: [map as needed]
   - volumes: [persist data]

4. Start container:
   start_container - name: ${name}

5. Verify running:
   list_containers

6. Check logs:
   get_container_logs - name: ${name}`
        }
      }]
    })
  );

  server.registerPrompt(
    'docker-website',
    {
      title: 'Docker + Website',
      description: 'Deploy containerized app with domain',
      argsSchema: {
        domain: z.string().describe('Domain for the app'),
        port: z.string().describe('Container port'),
      }
    },
    async ({ domain, port }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Deploy containerized app at ${domain}:

1. Create website:
   create_website - domain: ${domain}

2. Deploy container:
   - Expose port ${port}
   - Map to localhost:${port}

3. Configure reverse proxy:
   LiteSpeed proxy to localhost:${port}

4. Issue SSL:
   issue_ssl - domain: ${domain}

5. Test access:
   https://${domain}

Container runs behind LiteSpeed proxy.`
        }
      }]
    })
  );

  server.registerPrompt(
    'docker-manage',
    {
      title: 'Manage Containers',
      description: 'Container lifecycle operations',
      argsSchema: {
        operation: z.enum(['list', 'start', 'stop', 'restart', 'logs', 'cleanup']).describe('Operation'),
      }
    },
    async ({ operation }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Docker operation: ${operation}

${operation === 'list' ? `list_containers - Show all containers
get_container_images - Show all images` : ''}

${operation === 'start' ? `start_container - name: [container]
Verify with list_containers` : ''}

${operation === 'stop' ? `stop_container - name: [container]
Graceful shutdown, wait 30s` : ''}

${operation === 'restart' ? `restart_container - name: [container]
Check logs after restart` : ''}

${operation === 'logs' ? `get_container_logs - name: [container]
Check for errors or issues` : ''}

${operation === 'cleanup' ? `Remove unused:
- Stopped containers
- Dangling images
- Unused volumes

Reclaim disk space.` : ''}`
        }
      }]
    })
  );

  server.registerPrompt(
    'docker-troubleshoot',
    {
      title: 'Troubleshoot Container',
      description: 'Diagnose container issues',
      argsSchema: {
        container: z.string().describe('Container name'),
      }
    },
    async ({ container }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Troubleshoot ${container}:

1. Check status:
   list_containers - Find ${container}

2. Check logs:
   get_container_logs - name: ${container}

3. Common issues:
   - Not starting: Check image exists, port conflicts
   - Crashing: Check logs for errors
   - Can't connect: Verify port mapping
   - Slow: Check resource limits

4. Container inspection:
   - Environment variables set?
   - Volumes mounted correctly?
   - Network configured?

5. Solutions:
   - restart_container
   - Recreate with fixed config
   - Check upstream image issues`
        }
      }]
    })
  );
}
