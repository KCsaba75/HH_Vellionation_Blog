import React from 'react';
import { TrendingUp, Flame, Calendar } from 'lucide-react';
import { RANKS, getRankByPoints, getNextRank, calculateProgress } from '@/lib/gamificationConfig';

const RankProgressCard = ({ points = 0, currentStreak = 0, maxStreak = 0 }) => {
  const currentRank = getRankByPoints(points);
  const nextRank = getNextRank(currentRank);
  const progress = calculateProgress(points, currentRank, nextRank);

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Rank Progress</h2>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`text-4xl p-3 rounded-xl ${currentRank.bgColor}`}>
            {currentRank.icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Rank</p>
            <p className={`text-xl font-bold ${currentRank.color}`}>{currentRank.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{points}</p>
          <p className="text-sm text-muted-foreground">Total Points</p>
        </div>
      </div>

      {nextRank ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <span className="text-lg">{currentRank.icon}</span>
              {currentRank.name}
            </span>
            <span className="flex items-center gap-1">
              {nextRank.name}
              <span className="text-lg">{nextRank.icon}</span>
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {nextRank.minPoints - points} points until {nextRank.name}
          </p>
        </div>
      ) : (
        <div className="text-center py-4 bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-lg">
          <p className="text-lg font-semibold">🎉 Maximum Rank Achieved!</p>
          <p className="text-sm text-muted-foreground">You're a true Vellio Legend!</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-lg font-bold">{currentStreak} days</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Best Streak</p>
            <p className="text-lg font-bold">{maxStreak} days</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-3">All Ranks</p>
        <div className="flex justify-between">
          {RANKS.map((rank) => (
            <div 
              key={rank.id}
              className={`flex flex-col items-center ${points >= rank.minPoints ? 'opacity-100' : 'opacity-40'}`}
            >
              <span className="text-2xl mb-1">{rank.icon}</span>
              <span className="text-xs text-center">{rank.name.split(' ')[0]}</span>
              <span className="text-xs text-muted-foreground">{rank.minPoints}+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankProgressCard;
