import React from 'react';

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Betöltés...</p>
      </div>
    </div>
  );
};

export default PageLoader;
