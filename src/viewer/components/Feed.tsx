/**
 * Feed component for displaying platform feeds
 */

import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { Post as PostComponent } from './Post.js';
import { Post as PostType, Platform } from '../../types/index.js';

interface FeedProps {
  platform: Platform;
  posts: PostType[];
  loading: boolean;
  error?: string;
  selectedIndex?: number;
}

export const Feed: React.FC<FeedProps> = ({
  platform,
  posts,
  loading,
  error,
  selectedIndex = -1
}) => {
  return (
    <Box flexDirection="column" width="33%" borderStyle="single" borderColor="cyan">
      {/* Header */}
      <Box paddingX={1} paddingY={0} borderBottom borderColor="cyan">
        <Text bold color="cyan">
          {platform.toUpperCase()}
        </Text>
      </Box>

      {/* Content */}
      <Box flexDirection="column" paddingX={1} paddingTop={1}>
        {loading && (
          <Box>
            <Text color="cyan">
              <Spinner type="dots" />
            </Text>
            <Text> Loading {platform} feed...</Text>
          </Box>
        )}

        {error && !loading && (
          <Box flexDirection="column">
            <Text color="red">Error loading feed:</Text>
            <Text color="gray">{error}</Text>
          </Box>
        )}

        {!loading && !error && posts.length === 0 && (
          <Text color="gray">No posts found</Text>
        )}

        {!loading && !error && posts.length > 0 && (
          <Box flexDirection="column">
            {posts.slice(0, 5).map((post, index) => (
              <PostComponent
                key={post.id}
                post={post}
                selected={index === selectedIndex}
              />
            ))}
            {posts.length > 5 && (
              <Text color="gray">
                ... and {posts.length - 5} more posts
              </Text>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
