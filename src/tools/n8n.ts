import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CyberPanelClient } from "../client/cyberpanel.js";

export function registerN8NTools(server: McpServer, client: CyberPanelClient): void {
  // Install N8N workflow automation
  server.tool(
    "install_n8n",
    "Install N8N workflow automation platform on a domain. Creates a new website with Docker-based N8N instance.",
    {
      domainName: z.string().describe("Domain name for the N8N installation (required)"),
      adminEmail: z.string().email().optional().describe("Admin email for the installation"),
      n8nUsername: z.string().optional().describe("N8N admin username (default: admin)"),
      n8nPassword: z.string().optional().describe("N8N admin password"),
      n8nEmail: z.string().email().optional().describe("N8N admin email"),
      port: z.number().optional().describe("Port for N8N (auto-assigned if not specified)"),
      websiteOwner: z.string().optional().describe("Website owner username (default: admin)"),
      package: z.string().optional().describe("Hosting package name (default: Default)")
    },
    async (params) => {
      const response = await client.call("installN8N", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Get N8N installation status
  server.tool(
    "get_n8n_install_status",
    "Get the installation status of an N8N deployment. Use the statusFile path returned from install_n8n or provide a domain identifier.",
    {
      statusFile: z.string().optional().describe("Path to the status file from install_n8n response"),
      domainIdentifier: z.string().optional().describe("Domain identifier (domain with dots replaced by underscores)")
    },
    async (params) => {
      const response = await client.call("getN8NInstallStatus", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // List N8N installations
  server.tool(
    "list_n8n_installations",
    "List all N8N installations across the server. Returns domain, status, creation date, and path for each installation.",
    {},
    async () => {
      const response = await client.call("listN8NInstallations", {});
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Remove N8N installation
  server.tool(
    "remove_n8n_installation",
    "Remove an N8N installation. This stops and removes the N8N containers and deletes the associated website.",
    {
      domainName: z.string().describe("Domain name of the N8N installation to remove")
    },
    async (params) => {
      const response = await client.call("removeN8NInstallation", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );
}
