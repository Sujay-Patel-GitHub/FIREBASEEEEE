import type { AnalysisResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, FlaskConical, Stethoscope, Trees, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const ResultCard = ({ icon, title, description, children }: { icon: React.ReactNode, title: string, description?: string, children: React.ReactNode }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
            <div className="flex items-start gap-4">
                <div className="bg-secondary p-2 rounded-lg">{icon}</div>
                <div>
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                    {description && <CardDescription className="text-xs">{description}</CardDescription>}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

const SeverityIndicator = ({ level, score }: { level: 'Low' | 'Medium' | 'High' | 'N/A', score: number }) => {
    const severityClasses = {
        Low: {
            badge: 'bg-green-100 text-green-800 border-green-200',
            progress: 'bg-green-500',
        },
        Medium: {
            badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            progress: 'bg-yellow-500',
        },
        High: {
            badge: 'bg-red-100 text-red-800 border-red-200',
            progress: 'bg-red-500',
        },
        'N/A': {
            badge: 'bg-gray-100 text-gray-800 border-gray-200',
            progress: 'bg-gray-500',
        }
    };
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <Badge variant="outline" className={cn("font-semibold", severityClasses[level].badge)}>{level}</Badge>
                <span className="text-sm font-medium text-muted-foreground">{score}%</span>
            </div>
            <Progress value={score} className="h-2 [&>div]:bg-primary" />
        </div>
    );
};

export function AnalysisResults({ result }: AnalysisResultsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in-50 duration-500">
      <ResultCard icon={<Trees className="h-6 w-6 text-primary" />} title="Plant Species">
        <p className="font-medium text-foreground">{result.plantSpecies}</p>
      </ResultCard>

      <ResultCard icon={<Stethoscope className="h-6 w-6 text-primary" />} title="Disease Detection" description={result.diseaseDetection.name}>
        <p className="text-sm text-muted-foreground">{result.diseaseDetection.description}</p>
      </ResultCard>
      
      <ResultCard icon={<AlertCircle className="h-6 w-6 text-primary" />} title="Severity Level">
        <SeverityIndicator level={result.severity.level} score={result.severity.score} />
      </ResultCard>

      <ResultCard icon={<FlaskConical className="h-6 w-6 text-primary" />} title="Probable Cause">
        <p className="text-sm text-muted-foreground">{result.cause}</p>
      </ResultCard>

      <ResultCard icon={<Leaf className="h-6 w-6 text-primary" />} title="Remedies">
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
            {result.treatment.map((rec, i) => <li key={i}>{rec}</li>)}
        </ul>
      </ResultCard>
    </div>
  );
}
