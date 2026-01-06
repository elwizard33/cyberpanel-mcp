/**
 * CyberPanel MCP Server - Configuration Loader
 * 
 * Loads CyberPanel credentials from environment variables.
 * Environment variables are set by VS Code mcp.json input variables at runtime.
 * 
 * IMPORTANT: All error messages use console.error() because stdout is
 * reserved for the MCP protocol communication.
 */

/**
 * Configuration interface for CyberPanel connection
 */
export interface Config {
    /** CyberPanel server URL (e.g., https://server.example.com:8090) */
    host: string;
    /** CyberPanel admin username (default: 'admin') */
    username: string;
    /** CyberPanel API key (required, from Security > API Keys) */
    apiKey: string;
}

/**
 * Load configuration from environment variables
 * 
 * Required environment variables:
 * - CYBERPANEL_HOST: The CyberPanel server URL (e.g., https://server.example.com:8090)
 * - CYBERPANEL_API_KEY: API key from CyberPanel Security > API Keys
 * 
 * Optional environment variables:
 * - CYBERPANEL_USERNAME: The admin username (default: 'admin')
 * 
 * @returns Config object with host, username, and apiKey
 * @throws Exits process with code 1 if required variables are missing
 */
export function loadConfig(): Config {
    const host = process.env.CYBERPANEL_HOST;
    const username = process.env.CYBERPANEL_USERNAME || 'admin';
    const apiKey = process.env.CYBERPANEL_API_KEY;

    // Validate required environment variables
    if (!host) {
        console.error('ERROR: CYBERPANEL_HOST environment variable is not set.');
        console.error('Please set CYBERPANEL_HOST to your CyberPanel server URL.');
        console.error('Example: https://your-server.com:8090');
        process.exit(1);
    }

    // Require API key
    if (!apiKey) {
        console.error('ERROR: CYBERPANEL_API_KEY environment variable is not set.');
        console.error('');
        console.error('To get an API key:');
        console.error('  1. Install the API Keys plugin on your CyberPanel server');
        console.error('  2. Go to CyberPanel > Security > API Keys');
        console.error('  3. Create a new API key');
        console.error('  4. Set CYBERPANEL_API_KEY to the generated key (starts with cp_)');
        console.error('');
        console.error('Install plugin: curl -sL https://raw.githubusercontent.com/elwizard33/cyberpanel-mcp/main/install-plugin.sh | bash');
        process.exit(1);
    }

    // Validate API key format
    if (!apiKey.startsWith('cp_')) {
        console.error('ERROR: Invalid API key format.');
        console.error('API keys should start with "cp_"');
        console.error(`Got: ${apiKey.substring(0, 10)}...`);
        process.exit(1);
    }

    // Validate host format (basic check)
    if (!host.startsWith('http://') && !host.startsWith('https://')) {
        console.error('ERROR: CYBERPANEL_HOST must start with http:// or https://');
        console.error(`Got: ${host}`);
        process.exit(1);
    }

    // Remove trailing slash if present
    const normalizedHost = host.replace(/\/$/, '');

    console.error('Using API key authentication');

    return {
        host: normalizedHost,
        username,
        apiKey
    };
}
