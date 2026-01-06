import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CyberPanelClient } from "../client/cyberpanel.js";

export function registerApplicationTools(server: McpServer, client: CyberPanelClient): void {
  // Note: WordPress installation is handled by registerWordPressTools in wordpress.ts
  // which provides more comprehensive options via DeployWordPress API

  // Install Joomla
  server.tool(
    "install_joomla",
    "Install Joomla CMS on a website. Returns a status file path for tracking installation progress.",
    {
      domain: z.string().describe("Domain name to install Joomla on"),
      home: z.enum(["0", "1"]).describe("Install location: '1' for home directory, '0' for subdirectory"),
      path: z.string().optional().describe("Subdirectory path (required if home='0')"),
      siteName: z.string().describe("Joomla site name"),
      prefix: z.string().describe("Database table prefix"),
      passwordByPass: z.string().describe("Joomla admin password")
    },
    async (params) => {
      const response = await client.call("submitApplicationInstall", {
        ...params,
        selectedApplication: "Joomla"
      });
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Install Prestashop
  server.tool(
    "install_prestashop",
    "Install Prestashop e-commerce platform on a website. Returns a status file path for tracking installation progress.",
    {
      domain: z.string().describe("Domain name to install Prestashop on"),
      home: z.enum(["0", "1"]).describe("Install location: '1' for home directory, '0' for subdirectory"),
      path: z.string().optional().describe("Subdirectory path (required if home='0')"),
      shopName: z.string().describe("Prestashop store name"),
      firstName: z.string().describe("Admin first name"),
      lastName: z.string().describe("Admin last name"),
      email: z.string().email().describe("Admin email"),
      passwordByPass: z.string().describe("Admin password"),
      databasePrefix: z.string().describe("Database table prefix (e.g., 'ps_')")
    },
    async (params) => {
      const response = await client.call("submitApplicationInstall", {
        ...params,
        selectedApplication: "Prestashop"
      });
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Get application installation status
  server.tool(
    "get_application_install_status",
    "Get the installation status of a WordPress application. Uses the statusFile returned from install_wordpress.",
    {
      statusFile: z.string().describe("Path to the status file from installation response")
    },
    async (params) => {
      const response = await client.call("installWordpressStatus", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );
}
