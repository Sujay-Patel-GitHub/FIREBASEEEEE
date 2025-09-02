
'use client';

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';

interface FilterAnalysisChartProps {
  edgeScore: number;
  thermogramScore: number;
}

export function FilterAnalysisChart({ edgeScore, thermogramScore }: FilterAnalysisChartProps) {
  const [ref, isInView] = useInView({ triggerOnce: true });

  const chartData = [
    { name: 'thermogram', value: thermogramScore, fill: 'var(--color-thermogram)' },
    { name: 'edge', value: edgeScore, fill: 'var(--color-edge)' },
  ];

  const chartConfig = {
    edge: {
      label: 'Edge Detection',
      color: 'hsl(var(--chart-2))',
    },
    thermogram: {
      label: 'Thermogram',
      color: 'hsl(var(--chart-4))',
    },
  } satisfies ChartConfig;

  const averageScore = (edgeScore + thermogramScore) / 2;

  return (
     <Card
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(
        'opacity-0 translate-y-10 transition-all duration-[3000ms] ease-out',
        isInView && 'opacity-100 translate-y-0'
      )}
    >
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
                startAngle={90}
                endAngle={-270}
                innerRadius="65%"
                outerRadius="100%"
                barSize={12}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  dataKey="value"
                  tick={false}
                />
                <RadialBar
                  dataKey="value"
                  background={{ fill: 'hsl(var(--muted))' }}
                  cornerRadius={6}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-foreground">
              {averageScore.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Average Score</p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2">
            {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.fill}}></div>
                    <div className="text-sm">
                        <span className="font-semibold">{chartConfig[item.name as keyof typeof chartConfig].label}</span>:{' '}
                        <span className="font-mono">{item.value.toFixed(1)}%</span>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
