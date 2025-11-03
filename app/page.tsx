'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MatrixControl } from '@/components/MatrixControl';
import { useEffect } from 'react';

export default function Home() {
  const config = useQuery(api.matrixConfig.get);
  const initialize = useMutation(api.matrixConfig.initialize);
  const updateDeviceIp = useMutation(api.matrixConfig.updateDeviceIp);
  const updateInputLabel = useMutation(api.matrixConfig.updateInputLabel);
  const updateOutputLabel = useMutation(api.matrixConfig.updateOutputLabel);

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
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleUpdateConfig = async (updates: {
    deviceIp?: string;
    inputLabels?: string[];
    outputLabels?: string[];
  }) => {
    try {
      // Update device IP if changed
      if (updates.deviceIp && updates.deviceIp !== config.deviceIp) {
        await updateDeviceIp({ ip: updates.deviceIp });
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

  return (
    <MatrixControl
      config={{
        deviceIp: config.deviceIp,
        inputLabels,
        outputLabels,
      }}
      onUpdateConfig={handleUpdateConfig}
    />
  );
}
