
'use client';

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

interface FilterAnalysisChartProps {
  edgeScore: number;
  thermogramScore: number;
}

export function FilterAnalysisChart({ edgeScore, thermogramScore }: FilterAnalysisChartProps) {
  const chartData = [
    {
      name: 'Scores',
      edge: edgeScore,
      thermogram: thermogramScore,
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

  return (
    <Card className="animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle>Filter Metrics</CardTitle>
        <CardDescription>
          A visual breakdown of the client-side filter scores.
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
                <YAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value.toFixed(0)}`} />
                <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{
                        background: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                    formatter={(value, name) => [`${(value as number).toFixed(1)}`, chartConfig[name as keyof typeof chartConfig].label]}
                />
                <Legend />
                <Bar dataKey="edge" fill="var(--color-edge)" radius={4} barSize={32} />
                <Bar dataKey="thermogram" fill="var(--color-thermogram)" radius={4} barSize={32} />
            </BarChart>
           </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
