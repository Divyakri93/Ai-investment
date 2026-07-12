import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export const ScoreRadarChart = ({ scores }) => {
  const data = [
    {
      metric: 'Financial Health',
      score: scores?.financialHealth?.score || 0,
      fullMark: 10
    },
    {
      metric: 'Growth Potential',
      score: scores?.growthPotential?.score || 0,
      fullMark: 10
    },
    {
      metric: 'Market Position',
      score: scores?.marketPosition?.score || 0,
      fullMark: 10
    },
    {
      metric: 'Risk Level (Inverse)',
      score: scores?.riskLevel?.score
        ? Math.max(0, 10 - scores.riskLevel.score)
        : 5,
      fullMark: 10
    }
  ];

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
      <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider mb-2 self-start">
        Institutional 4-Dimension Radar Scorecard
      </h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#1E293B" />
            <PolarAngleAxis
              dataKey="metric"
              stroke="#94A3B8"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              stroke="#334155"
              tick={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
                color: '#fff'
              }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#00F0FF"
              fill="#00F0FF"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
