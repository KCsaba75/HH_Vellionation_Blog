import React, { useState, useEffect } from 'react';
import { Gift, Check, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { claimDailyLogin } from '@/lib/gamificationService';
import { toast } from '@/components/ui/use-toast';

const DailyLoginButton = ({ userId, onClaimed }) => {
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleClaim = async () => {
    if (claimed || loading) return;
    
    setLoading(true);
    const res = await claimDailyLogin(userId);
    setLoading(false);

    if (res.success) {
      setClaimed(true);
      setResult(res);
      toast({
        title: `🔥 Daily Bonus Claimed!`,
        description: `+${res.pointsAwarded} points! Streak: ${res.streak} days`,
      });
      if (onClaimed) onClaimed(res);
    } else if (res.alreadyClaimed) {
      setClaimed(true);
      toast({
        title: "Already claimed today",
        description: "Come back tomorrow for your next reward!",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error claiming bonus",
        description: res.error,
      });
    }
  };

  if (claimed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
        <Check className="h-5 w-5 text-green-600" />
        <span className="text-sm text-green-700 dark:text-green-400">
          {result ? `+${result.pointsAwarded} pts | ${result.streak} day streak! 🔥` : 'Claimed today!'}
        </span>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleClaim} 
      disabled={loading}
      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Claiming...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Claim Daily Bonus
          <Flame className="h-4 w-4" />
        </span>
      )}
    </Button>
  );
};

export default DailyLoginButton;
