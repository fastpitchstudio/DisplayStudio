import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get the matrix configuration (there should only be one)
export const get = query({
  handler: async (ctx) => {
    const config = await ctx.db.query('matrixConfig').first();
    return config;
  },
});

// Initialize the configuration with defaults
export const initialize = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query('matrixConfig').first();
    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert('matrixConfig', {
      deviceIp: '192.168.1.222',
      input1Label: 'Input 1',
      input2Label: 'Input 2',
      input3Label: 'Input 3',
      input4Label: 'Input 4',
      input5Label: 'Input 5',
      input6Label: 'Input 6',
      input7Label: 'Input 7',
      input8Label: 'Input 8',
      output1Label: 'Output 1',
      output2Label: 'Output 2',
      output3Label: 'Output 3',
      output4Label: 'Output 4',
      output5Label: 'Output 5',
      output6Label: 'Output 6',
      output7Label: 'Output 7',
      output8Label: 'Output 8',
      selectionTimeoutSeconds: 5,
      connectionView: 'both',
      updatedAt: Date.now(),
    });
  },
});

// Update device IP
export const updateDeviceIp = mutation({
  args: { ip: v.string() },
  handler: async (ctx, { ip }) => {
    const config = await ctx.db.query('matrixConfig').first();
    if (!config) {
      throw new Error('Configuration not initialized');
    }
    await ctx.db.patch(config._id, { deviceIp: ip, updatedAt: Date.now() });
  },
});

// Update input label
export const updateInputLabel = mutation({
  args: { inputNum: v.number(), label: v.string() },
  handler: async (ctx, { inputNum, label }) => {
    const config = await ctx.db.query('matrixConfig').first();
    if (!config) {
      throw new Error('Configuration not initialized');
    }
    const field = `input${inputNum}Label` as keyof typeof config;
    await ctx.db.patch(config._id, { [field]: label, updatedAt: Date.now() });
  },
});

// Update output label
export const updateOutputLabel = mutation({
  args: { outputNum: v.number(), label: v.string() },
  handler: async (ctx, { outputNum, label }) => {
    const config = await ctx.db.query('matrixConfig').first();
    if (!config) {
      throw new Error('Configuration not initialized');
    }
    const field = `output${outputNum}Label` as keyof typeof config;
    await ctx.db.patch(config._id, { [field]: label, updatedAt: Date.now() });
  },
});

// Update selection timeout
export const updateSelectionTimeout = mutation({
  args: { seconds: v.number() },
  handler: async (ctx, { seconds }) => {
    const config = await ctx.db.query('matrixConfig').first();
    if (!config) {
      throw new Error('Configuration not initialized');
    }
    await ctx.db.patch(config._id, { selectionTimeoutSeconds: seconds, updatedAt: Date.now() });
  },
});

// Update connection view
export const updateConnectionView = mutation({
  args: { view: v.string() },
  handler: async (ctx, { view }) => {
    const config = await ctx.db.query('matrixConfig').first();
    if (!config) {
      throw new Error('Configuration not initialized');
    }
    await ctx.db.patch(config._id, { connectionView: view, updatedAt: Date.now() });
  },
});

// Update theme mode (light/dark/system)
export const updateThemeMode = mutation({
  args: { mode: v.string() },
  handler: async (ctx, { mode }) => {
    const config = await ctx.db.query('matrixConfig').first();
    if (!config) {
      throw new Error('Configuration not initialized');
    }
    await ctx.db.patch(config._id, { themeMode: mode, updatedAt: Date.now() });
  },
});

// Update theme name (vercel/tangerine/claymorphism/midnight-bloom/fastpitch)
export const updateThemeName = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const config = await ctx.db.query('matrixConfig').first();
    if (!config) {
      throw new Error('Configuration not initialized');
    }
    await ctx.db.patch(config._id, { themeName: name, updatedAt: Date.now() });
  },
});

// Update proxy tunnel URL
export const updateProxyTunnelUrl = mutation({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    const config = await ctx.db.query('matrixConfig').first();
    if (!config) {
      throw new Error('Configuration not initialized');
    }
    // Trim whitespace and remove trailing slashes
    const cleanUrl = url.trim().replace(/\/+$/, '');
    await ctx.db.patch(config._id, { proxyTunnelUrl: cleanUrl || undefined, updatedAt: Date.now() });
  },
});
