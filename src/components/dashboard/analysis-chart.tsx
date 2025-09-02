
'use client';

import type { AnalysisResult } from '@/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';


interface AnalysisChartProps {
  result: AnalysisResult;
}

export function AnalysisChart({ result }: AnalysisChartProps) {
  const [ref, isInView] = useInView({ triggerOnce: true });

  const chartData = [
    {
      name: 'Scores',
      severity: result.severity.score,
      accuracy: result.confidenceScore,
    },
  ];

  const chartConfig = {
    severity: {
      label: 'Severity Score',
      color: 'hsl(var(--destructive))',
    },
    accuracy: {
        label: 'Detection Accuracy',
        color: 'hsl(var(--chart-2))',
    }
  } satisfies ChartConfig;

  return (
    <Card 
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
            "opacity-0 translate-y-10 transition-all duration-[3000ms] ease-out",
            isInView && "opacity-100 translate-y-0"
        )}
    >
      <CardHeader>
        <CardTitle>Analysis Metrics</CardTitle>
        <CardDescription>
          A visual breakdown of the analysis scores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-48">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    tickLine={false}
                    axisLine={false}
                    tick={false}
                 />
                <YAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{
                        background: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                    formatter={(value, name) => [`${(value as number).toFixed(1)}%`, chartConfig[name as keyof typeof chartConfig].label]}
                />
                <Legend />
                <Bar dataKey="severity" fill="var(--color-severity)" radius={4} barSize={32} />
                <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={4} barSize={32} />
            </BarChart>
           </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
