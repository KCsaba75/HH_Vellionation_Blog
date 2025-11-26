import React from 'react';
import { Award, Lock } from 'lucide-react';

const BadgeGrid = ({ badges = [], loading = false }) => {
  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

  const categoryLabels = {
    content: 'Content Creation',
    community: 'Community',
    engagement: 'Engagement',
    profile: 'Profile',
    achievement: 'Achievement'
  };

  const groupedBadges = badges.reduce((acc, badge) => {
    const category = badge.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Badges & Achievements</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Badges & Achievements</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {earnedBadges.length} / {badges.length} earned
        </span>
      </div>

      {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
        <div key={category} className="mb-6 last:mb-0">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {categoryLabels[category] || category}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categoryBadges.map((badge) => (
              <div
                key={badge.id}
                className={`relative group p-4 rounded-xl border-2 transition-all ${
                  badge.earned 
                    ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
                    : 'bg-muted/30 border-muted/20 opacity-50'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <span className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                    {badge.icon}
                  </span>
                  <span className="text-sm font-medium line-clamp-1">{badge.name}</span>
                  {!badge.earned && (
                    <Lock className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center bg-card/95 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity p-3">
                  <div className="text-center">
                    <span className="text-2xl block mb-1">{badge.icon}</span>
                    <p className="text-sm font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                    {badge.earned && badge.awardedAt && (
                      <p className="text-xs text-primary mt-2">
                        Earned {new Date(badge.awardedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {badges.length === 0 && (
        <div className="text-center py-8">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">Start your wellness journey to earn badges!</p>
        </div>
      )}
    </div>
  );
};

export default BadgeGrid;
