import React from 'react';
import { Lightbulb } from 'lucide-react';
import { getDailyTip } from '@/lib/dailyContent';

const DailyTipBanner = () => {
  const { tip, dayIndex } = getDailyTip();

  return (
    <div className="border-l-4 border-primary bg-primary/5 px-4 py-3 rounded-r-lg mb-6 min-h-[88px]">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Today's Wellness Tip #{dayIndex}
          </span>
          <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{tip}</p>
        </div>
      </div>
    </div>
  );
};

export default DailyTipBanner;
