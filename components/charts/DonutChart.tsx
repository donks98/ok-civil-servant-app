import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSub?: string;
  centerColor?: string;
  centerSubColor?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function DonutChart({
  segments, size = 160, strokeWidth = 28,
  centerLabel, centerSub,
  centerColor = '#F2F2F7', centerSubColor = '#8E8E93',
}: DonutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke="#3A3A3C" strokeWidth={strokeWidth} fill="none" />
      </Svg>
    );
  }

  let currentAngle = 0;
  const paths = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const angle = (s.value / total) * 360;
      const path = arcPath(cx, cy, r, currentAngle, currentAngle + angle - 0.5);
      currentAngle += angle;
      return { ...s, path };
    });

  return (
    <View>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke="#3A3A3C" strokeWidth={strokeWidth} fill="none" opacity={0.2} />
        {paths.map((p, i) => (
          <Path key={i} d={p.path} stroke={p.color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        ))}
        {centerLabel && (
          <SvgText x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight="800" fill={centerColor}>
            {centerLabel}
          </SvgText>
        )}
        {centerSub && (
          <SvgText x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill={centerSubColor}>
            {centerSub}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}
