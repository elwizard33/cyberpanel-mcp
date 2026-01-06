import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CyberPanelClient } from "../client/cyberpanel.js";

export function registerACLTools(server: McpServer, client: CyberPanelClient): void {
  // Fetch ACLs (filtered by permission)
  server.tool(
    "fetch_acls",
    "Fetch available ACL names. Results are filtered based on current user permissions.",
    {},
    async () => {
      const response = await client.call("fetchACLs", {});
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Find all ACLs (admin only)
  server.tool(
    "find_all_acls",
    "Find all ACLs in the system (admin only). Returns complete list of all ACL names.",
    {},
    async () => {
      const response = await client.call("findAllACLs", {});
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Create ACL
  server.tool(
    "create_acl",
    "Create a new ACL (Access Control List) with specified permissions. Admin only.",
    {
      aclName: z.string().describe("Name for the new ACL"),
      makeAdmin: z.boolean().optional().describe("Whether this ACL grants admin privileges"),
      createNewUser: z.boolean().optional().describe("Permission to create new users"),
      deleteUser: z.boolean().optional().describe("Permission to delete users"),
      resellerCenter: z.boolean().optional().describe("Permission to access reseller center"),
      changeUserACL: z.boolean().optional().describe("Permission to change user ACL"),
      createWebsite: z.boolean().optional().describe("Permission to create websites"),
      modifyWebsite: z.boolean().optional().describe("Permission to modify websites"),
      suspendWebsite: z.boolean().optional().describe("Permission to suspend websites"),
      deleteWebsite: z.boolean().optional().describe("Permission to delete websites"),
      createPackage: z.boolean().optional().describe("Permission to create packages"),
      deletePackage: z.boolean().optional().describe("Permission to delete packages"),
      modifyPackage: z.boolean().optional().describe("Permission to modify packages"),
      createDatabase: z.boolean().optional().describe("Permission to create databases"),
      deleteDatabase: z.boolean().optional().describe("Permission to delete databases"),
      listDatabases: z.boolean().optional().describe("Permission to list databases"),
      createNameServer: z.boolean().optional().describe("Permission to create nameservers"),
      createDNSZone: z.boolean().optional().describe("Permission to create DNS zones"),
      deleteZone: z.boolean().optional().describe("Permission to delete DNS zones"),
      addDeleteRecords: z.boolean().optional().describe("Permission to add/delete DNS records"),
      createEmail: z.boolean().optional().describe("Permission to create email accounts"),
      deleteEmail: z.boolean().optional().describe("Permission to delete email accounts"),
      emailForwarding: z.boolean().optional().describe("Permission to manage email forwarding"),
      changeEmailPassword: z.boolean().optional().describe("Permission to change email passwords"),
      dkimManager: z.boolean().optional().describe("Permission to manage DKIM"),
      createFTPAccount: z.boolean().optional().describe("Permission to create FTP accounts"),
      deleteFTPAccount: z.boolean().optional().describe("Permission to delete FTP accounts"),
      listFTPAccounts: z.boolean().optional().describe("Permission to list FTP accounts"),
      createBackup: z.boolean().optional().describe("Permission to create backups"),
      restoreBackup: z.boolean().optional().describe("Permission to restore backups"),
      addDeleteSSL: z.boolean().optional().describe("Permission to add/delete SSL certificates"),
      manageSSL: z.boolean().optional().describe("Permission to manage SSL"),
      hostnameSSL: z.boolean().optional().describe("Permission to manage hostname SSL"),
      mailServerSSL: z.boolean().optional().describe("Permission to manage mail server SSL")
    },
    async (params) => {
      const response = await client.call("createACLFunc", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Delete ACL
  server.tool(
    "delete_acl",
    "Delete an ACL. The ACL must not be in use by any users. Admin only.",
    {
      aclToBeDeleted: z.string().describe("Name of the ACL to delete")
    },
    async (params) => {
      const response = await client.call("deleteACLFunc", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Fetch ACL details
  server.tool(
    "fetch_acl_details",
    "Get detailed configuration of an ACL including all permission settings. Admin only.",
    {
      aclToModify: z.string().describe("Name of the ACL to get details for")
    },
    async (params) => {
      const response = await client.call("fetchACLDetails", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Modify ACL
  server.tool(
    "modify_acl",
    "Modify an existing ACL's permissions. Admin only. Pass the ACL name and all permission flags to update.",
    {
      aclToModify: z.string().describe("Name of the ACL to modify"),
      adminStatus: z.number().describe("Admin status: 1 for admin, 0 for non-admin"),
      createNewUser: z.boolean().optional().describe("Permission to create new users"),
      deleteUser: z.boolean().optional().describe("Permission to delete users"),
      resellerCenter: z.boolean().optional().describe("Permission to access reseller center"),
      changeUserACL: z.boolean().optional().describe("Permission to change user ACL"),
      createWebsite: z.boolean().optional().describe("Permission to create websites"),
      modifyWebsite: z.boolean().optional().describe("Permission to modify websites"),
      suspendWebsite: z.boolean().optional().describe("Permission to suspend websites"),
      deleteWebsite: z.boolean().optional().describe("Permission to delete websites"),
      createPackage: z.boolean().optional().describe("Permission to create packages"),
      deletePackage: z.boolean().optional().describe("Permission to delete packages"),
      modifyPackage: z.boolean().optional().describe("Permission to modify packages"),
      createDatabase: z.boolean().optional().describe("Permission to create databases"),
      deleteDatabase: z.boolean().optional().describe("Permission to delete databases"),
      listDatabases: z.boolean().optional().describe("Permission to list databases"),
      createNameServer: z.boolean().optional().describe("Permission to create nameservers"),
      createDNSZone: z.boolean().optional().describe("Permission to create DNS zones"),
      deleteZone: z.boolean().optional().describe("Permission to delete DNS zones"),
      addDeleteRecords: z.boolean().optional().describe("Permission to add/delete DNS records"),
      createEmail: z.boolean().optional().describe("Permission to create email accounts"),
      deleteEmail: z.boolean().optional().describe("Permission to delete email accounts"),
      emailForwarding: z.boolean().optional().describe("Permission to manage email forwarding"),
      changeEmailPassword: z.boolean().optional().describe("Permission to change email passwords"),
      dkimManager: z.boolean().optional().describe("Permission to manage DKIM"),
      createFTPAccount: z.boolean().optional().describe("Permission to create FTP accounts"),
      deleteFTPAccount: z.boolean().optional().describe("Permission to delete FTP accounts"),
      listFTPAccounts: z.boolean().optional().describe("Permission to list FTP accounts"),
      createBackup: z.boolean().optional().describe("Permission to create backups"),
      restoreBackup: z.boolean().optional().describe("Permission to restore backups"),
      addDeleteSSL: z.boolean().optional().describe("Permission to add/delete SSL certificates"),
      manageSSL: z.boolean().optional().describe("Permission to manage SSL"),
      hostnameSSL: z.boolean().optional().describe("Permission to manage hostname SSL"),
      mailServerSSL: z.boolean().optional().describe("Permission to manage mail server SSL")
    },
    async (params) => {
      const response = await client.call("submitACLModifications", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );

  // Change user ACL
  server.tool(
    "change_user_acl",
    "Change the ACL assigned to a user. Admin or users with changeUserACL permission only.",
    {
      selectedUser: z.string().describe("Username to change ACL for"),
      selectedACL: z.string().describe("Name of the ACL to assign to the user")
    },
    async (params) => {
      const response = await client.call("changeACLFunc", params);
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
      };
    }
  );
}
