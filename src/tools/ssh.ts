/**
 * CyberPanel MCP Server - SSH Management Tools
 * 
 * Tools for managing SSH configuration, keys, and access.
 * 
 * Controllers from cloudAPI/views.py:
 * - getSSHConfigs: Get SSH configuration settings or list SSH keys
 * - saveSSHConfigs: Save SSH configuration (port, root login)
 * - addSSHKey: Add SSH public key for authentication
 * - deleteSSHKey: Delete SSH key
 * - GetServerPublicSSHkey: Get server's public SSH key
 * - SubmitPublicKey: Submit public key to server
 * - ChangeLinuxUserPassword: Change Linux user password for a website
 * 
 * @module cyberpanel-mcp/tools/ssh
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register SSH management tools with the MCP server
 * 
 * @param server - The McpServer instance
 * @param client - The CyberPanelClient for API calls
 */
export function registerSshTools(server: McpServer, client: CyberPanelClient): void {
    
    // Get SSH Configs Tool
    server.tool(
        'get_ssh_configs',
        'Get SSH configuration settings (port, root login) or list authorized SSH keys. Type 1 returns SSH config, type 2 returns SSH keys.',
        {
            type: z.enum(['1', '2']).describe('1 = Get SSH config (port, root login), 2 = List SSH keys')
        },
        async (params) => {
            const result = await client.call('getSSHConfigs', {
                type: params.type
            });
            
            if (result.status === 1) {
                if (params.type === '1') {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: `SSH Configuration:\n` +
                                  `  Port: ${result.sshPort}\n` +
                                  `  Permit Root Login: ${result.permitRootLogin === 1 ? 'Yes' : 'No'}`
                        }]
                    };
                } else {
                    return {
                        content: [{
                            type: 'text' as const,
                            text: `SSH Keys:\n${result.data || '[]'}`
                        }]
                    };
                }
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error getting SSH configs: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Save SSH Configs Tool
    server.tool(
        'save_ssh_configs',
        'Save SSH configuration settings. Change SSH port and enable/disable root login. WARNING: Changing SSH port may lock you out if firewall not updated.',
        {
            type: z.literal('1').describe('Configuration type (always 1 for SSH config)'),
            sshPort: z.string().describe('SSH port number (e.g., 22, 2222)'),
            rootLogin: z.boolean().describe('Allow root login via SSH')
        },
        async (params) => {
            const result = await client.call('saveSSHConfigs', {
                type: params.type,
                sshPort: params.sshPort,
                rootLogin: params.rootLogin
            });
            
            if (result.status === 1 && result.saveStatus === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `SSH configuration saved successfully!\n` +
                              `  Port: ${params.sshPort}\n` +
                              `  Root Login: ${params.rootLogin ? 'Enabled' : 'Disabled'}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error saving SSH configs: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Add SSH Key Tool
    server.tool(
        'add_ssh_key',
        'Add an SSH public key to authorized_keys for root access. The key should be a valid SSH public key (ssh-rsa, ssh-ed25519, etc.).',
        {
            key: z.string().describe('SSH public key to add (e.g., ssh-rsa AAAAB3... user@host)')
        },
        async (params) => {
            const result = await client.call('addSSHKey', {
                key: params.key
            });
            
            if (result.status === 1 && result.add_status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `SSH key added successfully!`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error adding SSH key: ${result.error_mssage || result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Delete SSH Key Tool
    server.tool(
        'delete_ssh_key',
        'Delete an SSH public key from authorized_keys. Use get_ssh_configs with type 2 to list keys first.',
        {
            key: z.string().describe('SSH key identifier to delete (the key string from list)')
        },
        async (params) => {
            const result = await client.call('deleteSSHKey', {
                key: params.key
            });
            
            if (result.status === 1 && result.delete_status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `SSH key deleted successfully!`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error deleting SSH key: ${result.error_mssage || result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Get Server Public Key Tool
    server.tool(
        'get_server_public_key',
        'Get the server\'s public SSH key (cyberpanel.pub). This key can be used to add to remote servers for SSH access.',
        {},
        async () => {
            const result = await client.call('GetServerPublicSSHkey', {});
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Server Public SSH Key:\n${result.key}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error getting server public key: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Submit Public Key Tool
    server.tool(
        'submit_public_key',
        'Submit a public key to the server and set up backup path for a domain. Used for remote backup configuration.',
        {
            key: z.string().describe('SSH public key to submit'),
            domain: z.string().optional().describe('Domain to set up backup path for')
        },
        async (params) => {
            const result = await client.call('SubmitPublicKey', {
                key: params.key,
                domain: params.domain
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Public key submitted successfully!\n` +
                              `SSH Port: ${result.port}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error submitting public key: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Change Linux User Password Tool
    server.tool(
        'change_linux_user_password',
        'Change the password for a website\'s Linux user (SFTP/SSH access). The Linux user is the external app user for the website.',
        {
            domain: z.string().describe('Domain name of the website'),
            password: z.string().describe('New password for the Linux user')
        },
        async (params) => {
            const result = await client.call('ChangeLinuxUserPassword', {
                domain: params.domain,
                password: params.password
            });
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `Linux user password changed successfully!\n` +
                              `Domain: ${params.domain}\n` +
                              `Linux User: ${result.LinuxUser}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error changing password: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Fetch SSH Key (for cluster/HA)
    server.tool(
        'fetch_ssh_key',
        'Fetch the CyberPanel SSH public key for cluster/HA configuration',
        {},
        async () => {
            const result = await client.call('fetchSSHKey', {});
            
            if (result.status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `CyberPanel SSH Public Key:\n${result.pubKey}`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error fetching SSH key: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    // Put SSH Key (for cluster/HA)
    server.tool(
        'put_ssh_key',
        'Add SSH public key to authorized_keys (for cluster/HA)',
        {
            key: z.string().describe('SSH public key to add')
        },
        async (params) => {
            const result = await client.call('putSSHkeyFunc', params);
            
            if (result.status === 1 || result.add_status === 1) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `SSH key added successfully!`
                    }]
                };
            }
            
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error adding SSH key: ${result.error_message || 'Unknown error'}`
                }],
                isError: true
            };
        }
    );

    console.error('Registered SSH management tools: get_ssh_configs, save_ssh_configs, add_ssh_key, delete_ssh_key, get_server_public_key, submit_public_key, change_linux_user_password, fetch_ssh_key, put_ssh_key');
}
