/**
 * CyberPanel MCP Server - API Client
 * 
 * Handles authentication and API calls to CyberPanel CloudAPI.
 * 
 * Authentication: API Key via X-API-Key header
 * API Endpoint: POST to /cloudAPI/ with JSON body
 */

import type { Config } from '../config.js';

/**
 * API Response from CyberPanel CloudAPI
 * status: 1 = success, 0 = failure
 */
export interface ApiResponse {
    status: 0 | 1;
    error_message?: string;
    [key: string]: unknown;
}

/**
 * CyberPanel CloudAPI Client
 * 
 * Provides authenticated access to CyberPanel's CloudAPI endpoint.
 * All API calls are made via POST to /cloudAPI/ with the controller
 * name in the request body.
 * 
 * Authentication: Uses X-API-Key header with cp_* key from API Keys plugin
 */
export class CyberPanelClient {
    private readonly baseUrl: string;
    private readonly username: string;
    private readonly apiKey: string;

    /**
     * Create a new CyberPanel client
     * 
     * @param config - Configuration with host, username, and apiKey
     */
    constructor(config: Config) {
        this.baseUrl = config.host;
        this.username = config.username;
        this.apiKey = config.apiKey;
    }

    /**
     * Make an API call to CyberPanel CloudAPI
     * 
     * All requests are POST to /cloudAPI/ with JSON body containing:
     * - controller: The API controller/action name
     * - serverUserName: The authenticated username
     * - ...params: Additional parameters for the specific controller
     * 
     * @param controller - The API controller name (e.g., 'fetchWebsites', 'verifyLogin')
     * @param params - Additional parameters for the controller
     * @returns API response with status and data
     */
    async call(controller: string, params: Record<string, unknown> = {}): Promise<ApiResponse> {
        const url = `${this.baseUrl}/cloudAPI/`;
        
        const body = {
            controller,
            serverUserName: this.username,
            ...params
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                return {
                    status: 0,
                    error_message: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }

            const data = await response.json() as ApiResponse;
            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                status: 0,
                error_message: `Request failed: ${errorMessage}`
            };
        }
    }

    /**
     * Verify that the credentials are valid
     * 
     * Calls the 'verifyLogin' controller to check authentication.
     * 
     * @returns true if credentials are valid, false otherwise
     */
    async verifyConnection(): Promise<boolean> {
        const response = await this.call('verifyLogin');
        return response.status === 1;
    }

    /**
     * Get the base URL for this client
     */
    getBaseUrl(): string {
        return this.baseUrl;
    }

    /**
     * Get the username for this client
     */
    getUsername(): string {
        return this.username;
    }
}
