/**
 * Engage command implementation
 */

import chalk from 'chalk';
import { EngagementAction, EngagementOptions } from '../../types/index.js';
import { parsePlatform, getPlatformInstance, formatError, formatSuccess } from '../utils.js';

interface EngageCommandOptions {
  platform: string;
  comment?: string;
}

/**
 * Handle engage command
 */
export async function handleEngage(
  postId: string,
  action: string,
  options: EngageCommandOptions
): Promise<void> {
  try {
    const platform = parsePlatform(options.platform);
    const platformInstance = await getPlatformInstance(platform);

    // Parse action
    let engagementAction: EngagementAction;
    const actionLower = action.toLowerCase();

    if (actionLower === 'like') {
      engagementAction = EngagementAction.LIKE;
    } else if (actionLower === 'comment' || actionLower === 'reply') {
      engagementAction = EngagementAction.COMMENT;
      if (!options.comment) {
        throw new Error('Comment text is required. Use --comment "your text"');
      }
    } else if (actionLower === 'share' || actionLower === 'retweet') {
      engagementAction = actionLower === 'retweet' ? EngagementAction.RETWEET : EngagementAction.SHARE;
    } else {
      throw new Error(`Unknown action: ${action}. Valid actions: like, comment, share, retweet`);
    }

    console.log(chalk.cyan(`Performing ${action} on ${platform}...`));

    const engagementOptions: EngagementOptions = {
      postId,
      action: engagementAction,
      commentText: options.comment
    };

    await platformInstance.engage(engagementOptions);

    console.log(formatSuccess(`Successfully ${action}d post ${postId} on ${platform}`));
  } catch (error: any) {
    console.error(formatError(error));
    process.exit(1);
  }
}
