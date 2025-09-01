
'use client';

import type { AnalysisResult } from '@/types';
import { Label, PolarGrid, RadialBar, RadialBarChart } from 'recharts';
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

interface AnalysisChartProps {
  result: AnalysisResult;
}

export function AnalysisChart({ result }: AnalysisChartProps) {
  const healthRate = 100 - result.severity.score;

  const getHealthColor = (rate: number) => {
    if (rate >= 75) return 'hsl(120 80% 40%)'; // Green
    if (rate >= 40) return 'hsl(45 80% 50%)'; // Yellow
    return 'hsl(0 80% 50%)'; // Red
  };

  const healthColor = getHealthColor(healthRate);

  const chartConfig = {
    health: {
      label: 'Health',
      color: healthColor,
    },
  } satisfies ChartConfig;

  const chartData = [{ name: 'health', value: healthRate, fill: 'var(--color-health)' }];

  return (
    <Card className="animate-in fade-in-50 duration-500 flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Plant Health Rate</CardTitle>
        <CardDescription>
          A score from 0 to 100 indicating the plant's overall health.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="100%"
            barSize={24}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="fill-muted"
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <Label
                content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                    <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-4xl font-bold"
                        >
                        {healthRate.toFixed(0)}%
                        </tspan>
                        <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                        >
                        Health
                        </tspan>
                    </text>
                    )
                }
                }}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
