import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Text as SvgText, G, Line } from 'react-native-svg';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  width: number;
  height?: number;
  barColor?: string;
  labelColor?: string;
  valueColor?: string;
}

export function BarChart({ data, width, height = 160, barColor = '#CC0000', labelColor = '#8E8E93', valueColor = '#F2F2F7' }: BarChartProps) {
  const paddingLeft = 8;
  const paddingRight = 8;
  const paddingTop = 24;
  const paddingBottom = 32;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barCount = data.length;
  const gap = 8;
  const barWidth = (chartWidth - gap * (barCount - 1)) / barCount;

  return (
    <View>
      <Svg width={width} height={height}>
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          const x = paddingLeft + i * (barWidth + gap);
          const y = paddingTop + chartHeight - barHeight;
          return (
            <G key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={d.color ?? barColor}
                opacity={barHeight === 0 ? 0.2 : 1}
              />
              {barHeight > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill={valueColor}
                  fontWeight="600"
                >
                  ${d.value.toFixed(0)}
                </SvgText>
              )}
              <SvgText
                x={x + barWidth / 2}
                y={paddingTop + chartHeight + 16}
                textAnchor="middle"
                fontSize={10}
                fill={labelColor}
              >
                {d.label}
              </SvgText>
            </G>
          );
        })}
        <Line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={width - paddingRight}
          y2={paddingTop + chartHeight}
          stroke={labelColor}
          strokeWidth={0.5}
          opacity={0.3}
        />
      </Svg>
    </View>
  );
}
