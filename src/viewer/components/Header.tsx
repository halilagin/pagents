/**
 * Header component for feed viewer
 */

import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  title: string;
  lastUpdated: Date;
  activePlatforms: string[];
}

export const Header: React.FC<HeaderProps> = ({ title, lastUpdated, activePlatforms }) => {
  return (
    <Box flexDirection="column" paddingBottom={1} borderStyle="single" borderColor="cyan">
      <Box justifyContent="space-between" paddingX={1}>
        <Text bold color="cyan">
          {title}
        </Text>
        <Text color="gray">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      </Box>
      <Box paddingX={1}>
        <Text color="gray">
          Active: {activePlatforms.join(', ')} | Press 'q' to quit, 'r' to refresh
        </Text>
      </Box>
    </Box>
  );
};
