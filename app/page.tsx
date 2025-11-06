'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MatrixControl } from '@/components/MatrixControl';
import { useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';

export default function Home() {
  const config = useQuery(api.matrixConfig.get);
  const initialize = useMutation(api.matrixConfig.initialize);
  const updateDeviceIp = useMutation(api.matrixConfig.updateDeviceIp);
  const updateInputLabel = useMutation(api.matrixConfig.updateInputLabel);
  const updateOutputLabel = useMutation(api.matrixConfig.updateOutputLabel);
  const updateSelectionTimeout = useMutation(api.matrixConfig.updateSelectionTimeout);
  const updateConnectionView = useMutation(api.matrixConfig.updateConnectionView);
  const updateThemeMode = useMutation(api.matrixConfig.updateThemeMode);
  const updateThemeName = useMutation(api.matrixConfig.updateThemeName);
  const updateProxyTunnelUrl = useMutation(api.matrixConfig.updateProxyTunnelUrl);
  const updateInputColor = useMutation(api.matrixConfig.updateInputColor);
  const updateOutputColor = useMutation(api.matrixConfig.updateOutputColor);

  const { setMode, setThemeName } = useTheme(config?.themeMode, config?.themeName);

  // Initialize config on first load
  useEffect(() => {
    if (config === undefined) {
      // Still loading
      return;
    }
    if (config === null) {
      // No config exists, initialize it
      initialize();
    }
  }, [config, initialize]);

  if (!config) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-settings-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  const handleUpdateConfig = async (updates: {
    deviceIp?: string;
    proxyTunnelUrl?: string;
    inputLabels?: string[];
    outputLabels?: string[];
    inputColors?: string[];
    outputColors?: string[];
    selectionTimeoutSeconds?: number;
    connectionView?: string;
    themeMode?: string;
    themeName?: string;
  }) => {
    try {
      // Update device IP if changed
      if (updates.deviceIp && updates.deviceIp !== config.deviceIp) {
        await updateDeviceIp({ ip: updates.deviceIp });
      }

      // Update proxy tunnel URL if changed
      if (updates.proxyTunnelUrl !== undefined && updates.proxyTunnelUrl !== config.proxyTunnelUrl) {
        await updateProxyTunnelUrl({ url: updates.proxyTunnelUrl });
      }

      // Update input labels if changed
      if (updates.inputLabels) {
        for (let i = 0; i < updates.inputLabels.length; i++) {
          const oldLabel = config[`input${i + 1}Label` as keyof typeof config];
          if (updates.inputLabels[i] !== oldLabel) {
            await updateInputLabel({ inputNum: i + 1, label: updates.inputLabels[i] });
          }
        }
      }

      // Update output labels if changed
      if (updates.outputLabels) {
        for (let i = 0; i < updates.outputLabels.length; i++) {
          const oldLabel = config[`output${i + 1}Label` as keyof typeof config];
          if (updates.outputLabels[i] !== oldLabel) {
            await updateOutputLabel({ outputNum: i + 1, label: updates.outputLabels[i] });
          }
        }
      }

      // Update selection timeout if changed
      if (updates.selectionTimeoutSeconds !== undefined && updates.selectionTimeoutSeconds !== config.selectionTimeoutSeconds) {
        await updateSelectionTimeout({ seconds: updates.selectionTimeoutSeconds });
      }

      // Update connection view if changed
      if (updates.connectionView && updates.connectionView !== config.connectionView) {
        await updateConnectionView({ view: updates.connectionView });
      }

      // Update theme mode if changed
      if (updates.themeMode && updates.themeMode !== config.themeMode) {
        await updateThemeMode({ mode: updates.themeMode });
        setMode(updates.themeMode as 'light' | 'dark' | 'system');
      }

      // Update theme name if changed
      if (updates.themeName && updates.themeName !== config.themeName) {
        await updateThemeName({ name: updates.themeName });
        setThemeName(updates.themeName as 'vercel' | 'tangerine' | 'claymorphism' | 'midnight-bloom' | 'fastpitch');
      }

      // Update input colors if changed
      if (updates.inputColors) {
        for (let i = 0; i < updates.inputColors.length; i++) {
          const oldColor = config[`input${i + 1}Color` as keyof typeof config];
          if (updates.inputColors[i] !== oldColor) {
            await updateInputColor({ inputNum: i + 1, color: updates.inputColors[i] });
          }
        }
      }

      // Update output colors if changed
      if (updates.outputColors) {
        for (let i = 0; i < updates.outputColors.length; i++) {
          const oldColor = config[`output${i + 1}Color` as keyof typeof config];
          if (updates.outputColors[i] !== oldColor) {
            await updateOutputColor({ outputNum: i + 1, color: updates.outputColors[i] });
          }
        }
      }
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  const inputLabels = [
    config.input1Label,
    config.input2Label,
    config.input3Label,
    config.input4Label,
    config.input5Label,
    config.input6Label,
    config.input7Label,
    config.input8Label,
  ];

  const outputLabels = [
    config.output1Label,
    config.output2Label,
    config.output3Label,
    config.output4Label,
    config.output5Label,
    config.output6Label,
    config.output7Label,
    config.output8Label,
  ];

  // Default muted color palette
  const defaultColors = [
    'hsl(210, 40%, 55%)', // Muted blue
    'hsl(150, 35%, 50%)', // Muted green
    'hsl(30, 45%, 55%)',  // Muted orange
    'hsl(270, 35%, 55%)', // Muted purple
    'hsl(340, 40%, 55%)', // Muted rose
    'hsl(180, 35%, 50%)', // Muted teal
    'hsl(45, 50%, 55%)',  // Muted yellow
    'hsl(0, 35%, 55%)',   // Muted red
  ];

  const inputColors = [
    config.input1Color || defaultColors[0],
    config.input2Color || defaultColors[1],
    config.input3Color || defaultColors[2],
    config.input4Color || defaultColors[3],
    config.input5Color || defaultColors[4],
    config.input6Color || defaultColors[5],
    config.input7Color || defaultColors[6],
    config.input8Color || defaultColors[7],
  ];

  const outputColors = [
    config.output1Color || defaultColors[0],
    config.output2Color || defaultColors[1],
    config.output3Color || defaultColors[2],
    config.output4Color || defaultColors[3],
    config.output5Color || defaultColors[4],
    config.output6Color || defaultColors[5],
    config.output7Color || defaultColors[6],
    config.output8Color || defaultColors[7],
  ];

  return (
    <MatrixControl
      config={{
        deviceIp: config.deviceIp,
        proxyTunnelUrl: config.proxyTunnelUrl,
        inputLabels,
        outputLabels,
        inputColors,
        outputColors,
        connectionView: config.connectionView,
        themeMode: config.themeMode,
        themeName: config.themeName,
      }}
      onUpdateConfig={handleUpdateConfig}
    />
  );
}
