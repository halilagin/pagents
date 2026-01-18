/**
 * Post component for displaying individual posts
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Post as PostType } from '../../types/index.js';

interface PostProps {
  post: PostType;
  selected?: boolean;
}

export const Post: React.FC<PostProps> = ({ post, selected = false }) => {
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={0}
      borderStyle={selected ? 'bold' : 'single'}
      borderColor={selected ? 'yellow' : 'gray'}
      marginBottom={1}
    >
      {/* Author and platform */}
      <Box justifyContent="space-between">
        <Text bold color={selected ? 'yellow' : 'white'}>
          {post.author.displayName}
        </Text>
        <Text color="cyan">
          [{post.platform.toUpperCase()}]
        </Text>
      </Box>

      {/* Username and timestamp */}
      <Box justifyContent="space-between">
        <Text color="gray">
          @{post.author.username}
        </Text>
        <Text color="gray">
          {post.timestamp.toLocaleTimeString()}
        </Text>
      </Box>

      {/* Content */}
      <Box marginTop={1}>
        <Text>
          {truncateText(post.content, 150)}
        </Text>
      </Box>

      {/* Engagement metrics */}
      {(post.likesCount !== undefined || post.commentsCount !== undefined || post.sharesCount !== undefined) && (
        <Box marginTop={1}>
          <Text color="gray">
            {post.likesCount !== undefined && `❤️  ${post.likesCount}  `}
            {post.commentsCount !== undefined && `💬 ${post.commentsCount}  `}
            {post.sharesCount !== undefined && `🔄 ${post.sharesCount}`}
          </Text>
        </Box>
      )}

      {/* Media indicator */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <Box marginTop={1}>
          <Text color="blue">
            📷 {post.mediaUrls.length} media attachment(s)
          </Text>
        </Box>
      )}
    </Box>
  );
};
