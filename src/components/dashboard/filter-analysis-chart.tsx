
'use client';

import { RadialBar, RadialBarChart, Legend, ResponsiveContainer, Tooltip } from 'recharts';
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

interface FilterAnalysisChartProps {
  edgeScore: number;
  thermogramScore: number;
}

export function FilterAnalysisChart({ edgeScore, thermogramScore }: FilterAnalysisChartProps) {
  const chartData = [
    {
      name: 'Edge',
      score: edgeScore,
      fill: 'var(--color-edge)',
    },
    {
      name: 'Thermogram',
      score: thermogramScore,
      fill: 'var(--color-thermogram)',
    },
  ];

  const chartConfig = {
    edge: {
      label: 'Edge Score',
      color: 'hsl(var(--chart-3))',
    },
    thermogram: {
      label: 'Thermogram Score',
      color: 'hsl(var(--chart-4))',
    }
  } satisfies ChartConfig;
  
  const averageScore = (edgeScore + thermogramScore) / 2;

  return (
    <Card className="animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle>Filter Metrics</CardTitle>
        <CardDescription>
          A visual breakdown of the client-side filter scores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
            <ChartContainer config={chartConfig} className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  data={chartData} 
                  innerRadius="30%" 
                  outerRadius="90%" 
                  barSize={15}
                  startAngle={90}
                  endAngle={-270}
                >
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{
                        background: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                    formatter={(value, name) => {
                      const key = name.toLowerCase() as keyof typeof chartConfig;
                      return [`${(value as number).toFixed(1)}`, chartConfig[key]?.label || name]
                    }}
                  />
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="score"
                  />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                </RadialBarChart>
              </ResponsiveContainer>
            </ChartContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-foreground">
                    {averageScore.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Average Score</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
