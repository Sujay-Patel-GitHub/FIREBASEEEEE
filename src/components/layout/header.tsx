
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

interface HeaderProps {
  onAnalyzeClick?: () => void;
  isAnalyzing?: boolean;
}

export function Header({ onAnalyzeClick, isAnalyzing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
            <SidebarTrigger />
        </div>
        <div className="flex-1 text-center">
            <h1 className="text-lg font-bold uppercase tracking-wider text-foreground">
              DASHBOARD
            </h1>
        </div>
        <div className="flex items-center gap-4">
          {onAnalyzeClick && (
            <Button onClick={onAnalyzeClick} disabled={isAnalyzing} size="sm">
              <UploadCloud className="mr-2 h-4 w-4" />
              Analyze Plant
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
