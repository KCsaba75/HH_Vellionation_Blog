export const RANKS = [
  { 
    id: 1, 
    name: 'New Member', 
    minPoints: 0, 
    icon: '🌱',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-800'
  },
  { 
    id: 2, 
    name: 'Contributor', 
    minPoints: 100, 
    icon: '🌿',
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900'
  },
  { 
    id: 3, 
    name: 'Health Hero', 
    minPoints: 500, 
    icon: '💪',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900'
  },
  { 
    id: 4, 
    name: 'Vellio Ambassador', 
    minPoints: 1000, 
    icon: '👑',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900'
  }
];

export const POINT_VALUES = {
  BLOG_POST_CREATED: 50,
  BLOG_POST_PUBLISHED: 50,
  COMMENT_ADDED: 10,
  COMMUNITY_POST: 25,
  DAILY_LOGIN: 5,
  PROFILE_COMPLETE: 50,
  STREAK_BONUS_MULTIPLIER: 0.5
};

export const BADGES = [
  {
    id: 'first_post',
    name: 'First Steps',
    description: 'Published your first blog post',
    icon: '📝',
    category: 'content',
    criteria: { type: 'post_count', value: 1 }
  },
  {
    id: 'prolific_writer',
    name: 'Prolific Writer',
    description: 'Published 10 blog posts',
    icon: '✍️',
    category: 'content',
    criteria: { type: 'post_count', value: 10 }
  },
  {
    id: 'first_comment',
    name: 'Conversation Starter',
    description: 'Left your first comment',
    icon: '💬',
    category: 'community',
    criteria: { type: 'comment_count', value: 1 }
  },
  {
    id: 'active_commenter',
    name: 'Active Voice',
    description: 'Left 25 comments',
    icon: '🗣️',
    category: 'community',
    criteria: { type: 'comment_count', value: 25 }
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Logged in 7 days in a row',
    icon: '🔥',
    category: 'engagement',
    criteria: { type: 'streak', value: 7 }
  },
  {
    id: 'month_streak',
    name: 'Monthly Master',
    description: 'Logged in 30 days in a row',
    icon: '🏆',
    category: 'engagement',
    criteria: { type: 'streak', value: 30 }
  },
  {
    id: 'profile_complete',
    name: 'Identity Established',
    description: 'Completed your profile with bio and avatar',
    icon: '🎭',
    category: 'profile',
    criteria: { type: 'profile_complete', value: true }
  },
  {
    id: 'community_member',
    name: 'Community Member',
    description: 'Posted in the community',
    icon: '🤝',
    category: 'community',
    criteria: { type: 'community_post_count', value: 1 }
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Earned 100 points',
    icon: '⭐',
    category: 'achievement',
    criteria: { type: 'points', value: 100 }
  },
  {
    id: 'wellness_champion',
    name: 'Wellness Champion',
    description: 'Earned 500 points',
    icon: '🏅',
    category: 'achievement',
    criteria: { type: 'points', value: 500 }
  },
  {
    id: 'vellio_legend',
    name: 'Vellio Legend',
    description: 'Earned 1000 points',
    icon: '👑',
    category: 'achievement',
    criteria: { type: 'points', value: 1000 }
  }
];

export const getRankByPoints = (points) => {
  const sortedRanks = [...RANKS].sort((a, b) => b.minPoints - a.minPoints);
  return sortedRanks.find(rank => points >= rank.minPoints) || RANKS[0];
};

export const getNextRank = (currentRank) => {
  const currentIndex = RANKS.findIndex(r => r.name === currentRank.name);
  return RANKS[currentIndex + 1] || null;
};

export const calculateProgress = (points, currentRank, nextRank) => {
  if (!nextRank) return 100;
  const currentMin = currentRank.minPoints;
  const nextMin = nextRank.minPoints;
  return Math.min(100, ((points - currentMin) / (nextMin - currentMin)) * 100);
};

export const checkBadgeEligibility = (badge, userStats) => {
  const { criteria } = badge;
  
  switch (criteria.type) {
    case 'post_count':
      return (userStats.postCount || 0) >= criteria.value;
    case 'comment_count':
      return (userStats.commentCount || 0) >= criteria.value;
    case 'streak':
      return (userStats.maxStreak || 0) >= criteria.value;
    case 'profile_complete':
      return userStats.profileComplete === true;
    case 'community_post_count':
      return (userStats.communityPostCount || 0) >= criteria.value;
    case 'points':
      return (userStats.points || 0) >= criteria.value;
    default:
      return false;
  }
};
