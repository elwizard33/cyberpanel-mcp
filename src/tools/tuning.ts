import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CyberPanelClient } from "../client/cyberpanel.js";

export function registerTuningTools(server: McpServer, client: CyberPanelClient): void {
  // Get switch status (webserver type for domain)
  server.tool(
    "get_switch_status",
    "Get the current webserver status for a domain (OLS, LSWS, or Apache) and PHP-FPM pool settings.",
    {
      domainName: z.string().optional().describe("Domain name to check. Omit and set global=true for global server status."),
      global: z.boolean().optional().describe("Set to true to get global server status instead of domain-specific")
    },
    async (params) => {
      const response = await client.call("getSwitchStatus", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Switch server for domain
  server.tool(
    "switch_server",
    "Switch webserver type for a domain (between OLS/LSWS and Apache). Returns status file path for tracking progress.",
    {
      domainName: z.string().describe("Domain name to switch server for"),
      phpSelection: z.string().describe("PHP version to use (e.g., 'PHP 8.1')"),
      server: z.number().describe("Server type: 1 for Apache, 0 for LiteSpeed")
    },
    async (params) => {
      const response = await client.call("switchServer", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Tune PHP-FPM settings
  server.tool(
    "tune_settings",
    "Apply PHP-FPM pool tuning settings for a domain (Apache mode). Adjusts process manager settings for performance.",
    {
      domainName: z.string().describe("Domain name to tune"),
      pmMaxChildren: z.string().describe("Maximum number of child processes (pm.max_children)"),
      pmStartServers: z.string().describe("Number of child processes created on startup (pm.start_servers)"),
      pmMinSpareServers: z.string().describe("Minimum number of idle processes (pm.min_spare_servers)"),
      pmMaxSpareServers: z.string().describe("Maximum number of idle processes (pm.max_spare_servers)"),
      phpPath: z.string().describe("Path to PHP-FPM pool config file")
    },
    async (params) => {
      const response = await client.call("tuneSettings", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Fetch website resource limits
  server.tool(
    "fetch_website_limits",
    "Get container/cgroup resource limits for a website (CPU, memory, IO, IOPS, network speed).",
    {
      domain: z.string().describe("Domain name to get limits for")
    },
    async (params) => {
      const response = await client.call("fetchWebsiteLimits", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Save website resource limits
  server.tool(
    "save_website_limits",
    "Save container/cgroup resource limits for a website. Controls CPU, memory, IO, IOPS, and network limits.",
    {
      domain: z.string().describe("Domain name to set limits for"),
      cpuPers: z.number().max(100).describe("CPU percentage limit (0-100)"),
      IO: z.number().describe("IO weight (relative priority)"),
      IOPS: z.number().describe("IO operations per second limit"),
      memory: z.number().describe("Memory limit in MB"),
      networkSpeed: z.string().describe("Network speed limit (e.g., '1mbit', '10mbit')"),
      networkHandle: z.string().describe("Network interface handle"),
      enforce: z.boolean().optional().describe("Whether to enforce the limits via cgroups")
    },
    async (params) => {
      const response = await client.call("saveWebsiteLimits", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Get usage data for website
  server.tool(
    "get_usage_data",
    "Get resource usage data for a website (CPU, memory, IO usage statistics).",
    {
      domain: z.string().describe("Domain name to get usage data for")
    },
    async (params) => {
      const response = await client.call("getUsageData", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Fetch RAM and MySQL config
  server.tool(
    "fetch_ram",
    "Get server RAM information and MySQL configuration. Returns total RAM in GB and MySQL config file contents.",
    {},
    async () => {
      const response = await client.call("fetchRam", {});
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );
}
