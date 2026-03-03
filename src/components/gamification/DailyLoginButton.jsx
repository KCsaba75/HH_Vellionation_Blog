import React, { useState } from 'react';
import { Gift, Check, Flame, X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { claimDailyLogin } from '@/lib/gamificationService';
import { toast } from '@/components/ui/use-toast';
import { getDailyIntentionOptions, getSavedIntention, saveIntention } from '@/lib/dailyContent';
import { POINT_VALUES } from '@/lib/gamificationConfig';

const DailyLoginButton = ({ userId, onClaimed, currentStreak = 0 }) => {
  const [claimed, setClaimed] = useState(() => getSavedIntention() !== null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const intentions = getDailyIntentionOptions();

  const expectedStreak = currentStreak + 1;
  const expectedPoints = Math.floor(
    POINT_VALUES.DAILY_LOGIN * (1 + (expectedStreak - 1) * POINT_VALUES.STREAK_BONUS_MULTIPLIER)
  );

  const handleClaim = () => {
    if (claimed || loading) return;
    setShowPopup(true);
  };

  const handleIntentionSelect = async (intention) => {
    setShowPopup(false);
    setLoading(true);

    saveIntention(intention.id);

    const res = await claimDailyLogin(userId);
    setLoading(false);

    if (res.success) {
      setClaimed(true);
      setResult(res);
      toast({
        title: `🎯 Intention set: ${intention.icon} ${intention.label}`,
        description: `+${res.pointsAwarded} points earned! ${res.streak > 1 ? `🔥 ${res.streak}-day streak!` : 'Keep it up!'}`,
      });
      if (onClaimed) onClaimed(res);
    } else if (res.alreadyClaimed) {
      setClaimed(true);
      toast({
        title: 'Already claimed today',
        description: 'Come back tomorrow for your next reward!',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error claiming bonus',
        description: res.error,
      });
    }
  };

  if (claimed) {
    const savedId = getSavedIntention();
    const savedIntention = intentions.find((i) => i.id === savedId);
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 dark:text-green-400">
            {result ? `+${result.pointsAwarded} pts | ${result.streak} day streak! 🔥` : 'Claimed today!'}
          </span>
        </div>
        {savedIntention && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-lg">
            <Target className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs text-primary font-medium">
              Today's intention: {savedIntention.icon} {savedIntention.label}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
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
            {currentStreak >= 2
              ? `🔥 ${currentStreak}-day streak → +${expectedPoints} pts`
              : `Claim Daily Bonus (+${expectedPoints} pts)`}
            <Flame className="h-4 w-4" />
          </span>
        )}
      </Button>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-lg font-bold">What's your wellness intention today?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose one goal — claim your <strong className="text-orange-500">+{expectedPoints} pts</strong>
                {currentStreak >= 1 && (
                  <span className="text-orange-500"> 🔥 {expectedStreak}-day streak!</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {intentions.map((intention) => (
                <button
                  key={intention.id}
                  onClick={() => handleIntentionSelect(intention)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{intention.icon}</span>
                  <span className="text-xs font-medium leading-tight">{intention.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLoginButton;
