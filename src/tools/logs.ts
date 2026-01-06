import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CyberPanelClient } from "../client/cyberpanel.js";

export function registerLogTools(server: McpServer, client: CyberPanelClient): void {
  // Get access logs from website
  server.tool(
    "get_access_logs",
    "Get access logs from a website. Returns parsed log entries with IP address, time, resource, and size.",
    {
      virtualHost: z.string().describe("Domain name of the website"),
      page: z.number().optional().default(1).describe("Page number for pagination")
    },
    async (params) => {
      const response = await client.call("getDataFromLogFile", {
        ...params,
        logType: 1  // 1 = access logs
      });
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Get error logs from website
  server.tool(
    "get_error_logs",
    "Get error logs from a website. Returns raw error log content.",
    {
      virtualHost: z.string().describe("Domain name of the website"),
      page: z.number().optional().default(1).describe("Page number for pagination")
    },
    async (params) => {
      const response = await client.call("fetchErrorLogs", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Get server logs from file
  server.tool(
    "get_server_logs",
    "Get server logs by type (access, error, email, ftp, modSec, cyberpanel). Returns the last 50 lines of the log file.",
    {
      type: z.enum(["access", "error", "email", "ftp", "modSec", "cyberpanel"]).describe("Type of log to retrieve: access (webserver), error (webserver), email, ftp, modSec, cyberpanel")
    },
    async (params) => {
      const response = await client.call("getLogsFromFile", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Read report from file
  server.tool(
    "read_report",
    "Read content from a report file. Used for reading email configuration reports and other system reports.",
    {
      reportFile: z.string().describe("Full path to the report file to read")
    },
    async (params) => {
      const response = await client.call("ReadReport", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Read FTP status report
  server.tool(
    "read_ftp_report",
    "Check FTP server status. Returns whether pure-ftpd is running.",
    {},
    async () => {
      const response = await client.call("ReadReportFTP", {});
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Read DNS status report
  server.tool(
    "read_dns_report",
    "Check DNS server status. Returns whether PowerDNS is running.",
    {},
    async () => {
      const response = await client.call("ReadReportDNS", {});
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Reset email configurations
  server.tool(
    "reset_email_config",
    "Reset email server configurations. Restarts mail services with default settings.",
    {},
    async () => {
      const response = await client.call("ResetEmailConfigurations", {});
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Reset FTP configurations
  server.tool(
    "reset_ftp_config",
    "Reset FTP server configurations. Restarts FTP services with default settings.",
    {},
    async () => {
      const response = await client.call("ResetFTPConfigurations", {});
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Reset DNS configurations
  server.tool(
    "reset_dns_config",
    "Reset DNS server configurations. Restarts PowerDNS with default settings.",
    {},
    async () => {
      const response = await client.call("ResetDNSConfigurations", {});
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Debug email for site
  server.tool(
    "debug_email_for_site",
    "Debug email configuration for a specific website. Returns diagnostic information.",
    {
      websiteName: z.string().describe("Domain name of the website to debug")
    },
    async (params) => {
      const response = await client.call("debugEmailForSite", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Fetch all sites (useful for debugging)
  server.tool(
    "fetch_all_sites",
    "Fetch all websites accessible by the current user. Useful for debugging and administration.",
    {},
    async () => {
      const response = await client.call("fetchAllSites", {});
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );
}
