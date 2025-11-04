import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  matrixConfig: defineTable({
    // Device configuration
    deviceIp: v.string(),

    // Input labels (1-8)
    input1Label: v.string(),
    input2Label: v.string(),
    input3Label: v.string(),
    input4Label: v.string(),
    input5Label: v.string(),
    input6Label: v.string(),
    input7Label: v.string(),
    input8Label: v.string(),

    // Output labels (1-8)
    output1Label: v.string(),
    output2Label: v.string(),
    output3Label: v.string(),
    output4Label: v.string(),
    output5Label: v.string(),
    output6Label: v.string(),
    output7Label: v.string(),
    output8Label: v.string(),

    // Selection timeout in seconds (default 5)
    selectionTimeoutSeconds: v.optional(v.number()),

    // Connection view mode: "both" (default), "input", "output"
    connectionView: v.optional(v.string()),

    // DEPRECATED: Old theme field (kept for backward compatibility)
    theme: v.optional(v.string()),

    // Theme mode: "light", "dark", "system" (default "system")
    themeMode: v.optional(v.string()),

    // Theme name: "vercel", "tangerine", "claymorphism", "midnight-bloom", "fastpitch" (default "vercel")
    themeName: v.optional(v.string()),

    // Proxy tunnel URL (for remote access via Cloudflare Tunnel)
    // When set, this URL is used instead of the local deviceIp
    // Format: "https://your-tunnel.example.com"
    proxyTunnelUrl: v.optional(v.string()),

    // Metadata
    updatedAt: v.number(),
  }),
});
