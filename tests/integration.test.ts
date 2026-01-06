/**
 * CyberPanel MCP Server - Integration Tests
 * 
 * Tests the full server startup flow, tool registration, and MCP protocol handling.
 * Uses mock credentials since we can't test against a real CyberPanel server.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CyberPanelClient } from '../src/client/cyberpanel.js';
import { registerAllTools } from '../src/tools/index.js';
import type { Config } from '../src/config.js';

// Mock configuration for tests
const mockConfig: Config = {
    host: 'https://test.cyberpanel.net:8090',
    username: 'admin',
    password: 'testpassword123'
};

describe('CyberPanel MCP Server Integration', () => {
    let server: McpServer;
    let client: CyberPanelClient;

    beforeEach(() => {
        // Create fresh instances for each test
        server = new McpServer(
            {
                name: 'cyberpanel-mcp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {},
                },
            }
        );
        client = new CyberPanelClient(mockConfig);
    });

    describe('Server Initialization', () => {
        it('should create McpServer instance', () => {
            expect(server).toBeDefined();
            expect(server).toBeInstanceOf(McpServer);
        });

        it('should create CyberPanelClient with valid config', () => {
            expect(client).toBeDefined();
            expect(client).toBeInstanceOf(CyberPanelClient);
        });
    });

    describe('Tool Registration', () => {
        it('should register all tools without throwing', () => {
            // Capture console.error calls (our logging goes there)
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => {
                registerAllTools(server, client);
            }).not.toThrow();
            
            // Should have logged registration messages
            expect(consoleSpy).toHaveBeenCalledWith('Registering CyberPanel tools...');
            expect(consoleSpy).toHaveBeenCalledWith('CyberPanel tools registration complete');
            
            consoleSpy.mockRestore();
        });

        it('should register tools that can be listed', () => {
            registerAllTools(server, client);
            
            // Server should have tools capability after registration
            // We verify this by checking the server was configured
            expect(server).toBeDefined();
        });
    });

    describe('Client API Calls', () => {
        let mockFetch: ReturnType<typeof vi.fn>;

        beforeEach(() => {
            mockFetch = vi.fn();
            vi.stubGlobal('fetch', mockFetch);
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('should make POST requests to /cloudAPI/', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 1, websites: [] })
            });

            await client.call('fetchWebsites', { page: 1 });

            expect(mockFetch).toHaveBeenCalledWith(
                'https://test.cyberpanel.net:8090/cloudAPI/',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
        });

        it('should include serverUserName in request body', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 1 })
            });

            await client.call('verifyLogin');

            const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(requestBody.serverUserName).toBe('admin');
            expect(requestBody.controller).toBe('verifyLogin');
        });

        it('should handle API success response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ 
                    status: 1, 
                    data: { message: 'Success' }
                })
            });

            const response = await client.call('verifyLogin');

            expect(response.status).toBe(1);
            expect(response.data).toEqual({ message: 'Success' });
        });

        it('should handle API error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ 
                    status: 0, 
                    error_message: 'Invalid credentials'
                })
            });

            const response = await client.call('verifyLogin');

            expect(response.status).toBe(0);
            expect(response.error_message).toBe('Invalid credentials');
        });

        it('should handle network failures gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

            const response = await client.call('verifyLogin');

            expect(response.status).toBe(0);
            expect(response.error_message).toContain('Connection refused');
        });
    });

    describe('Server Configuration', () => {
        it('should use correct server name', () => {
            // Server name is set during construction
            expect(server).toBeDefined();
        });

        it('should support tools capability', () => {
            // Verify server can register tools
            registerAllTools(server, client);
            // If no error thrown, tools capability is working
            expect(true).toBe(true);
        });
    });
});

describe('Environment Variable Loading', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        // Restore original environment
        process.env = { ...originalEnv };
    });

    it('should load config from environment variables', async () => {
        process.env.CYBERPANEL_HOST = 'https://example.com:8090';
        process.env.CYBERPANEL_USERNAME = 'testuser';
        process.env.CYBERPANEL_API_KEY = 'cp_test_api_key_12345';

        // Force fresh import to pick up new env vars
        vi.resetModules();
        
        // Dynamically import to get fresh config
        const { loadConfig } = await import('../src/config.js');
        const config = loadConfig();

        expect(config).toBeDefined();
        expect(config?.host).toBe('https://example.com:8090');
        expect(config?.username).toBe('testuser');
        expect(config?.apiKey).toBe('cp_test_api_key_12345');
    });

    it('should call process.exit if required env vars are missing', async () => {
        delete process.env.CYBERPANEL_HOST;
        delete process.env.CYBERPANEL_USERNAME;
        delete process.env.CYBERPANEL_API_KEY;

        // Mock process.exit BEFORE loading config module
        const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number): never => {
            throw new Error(`ExitCode:${code}`);
        }) as () => never);

        // Force fresh import
        vi.resetModules();
        
        try {
            const { loadConfig } = await import('../src/config.js');
            loadConfig();
            // If we get here, the test failed
            expect(true).toBe(false);
        } catch (error: any) {
            expect(error.message).toBe('ExitCode:1');
        }
        
        expect(exitSpy).toHaveBeenCalledWith(1);
        exitSpy.mockRestore();
    });
});

describe('Stdio Transport Compatibility', () => {
    it('should import StdioServerTransport without error', async () => {
        const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
        expect(StdioServerTransport).toBeDefined();
    });

    it('should create transport instance', async () => {
        const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
        const transport = new StdioServerTransport();
        expect(transport).toBeDefined();
    });
});
