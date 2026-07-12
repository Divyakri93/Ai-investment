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

export const ScoreRadarChart = ({
  scores,
  scoresB = null,
  labelA = 'Score',
  labelB = 'Company B'
}) => {
  const isComparing = Boolean(scoresB);

  const data = [
    {
      metric: 'Financial Health',
      score: scores?.financialHealth?.score || 0,
      scoreB: scoresB?.financialHealth?.score || 0,
      fullMark: 10
    },
    {
      metric: 'Growth Potential',
      score: scores?.growthPotential?.score || 0,
      scoreB: scoresB?.growthPotential?.score || 0,
      fullMark: 10
    },
    {
      metric: 'Market Position',
      score: scores?.marketPosition?.score || 0,
      scoreB: scoresB?.marketPosition?.score || 0,
      fullMark: 10
    },
    {
      metric: 'Risk Level (Inverse)',
      score: scores?.riskLevel?.score
        ? Math.max(0, 10 - scores.riskLevel.score)
        : 5,
      scoreB: scoresB?.riskLevel?.score
        ? Math.max(0, 10 - scoresB.riskLevel.score)
        : 5,
      fullMark: 10
    }
  ];

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
          Institutional 4-Dimension Radar Scorecard
        </h3>
        {isComparing && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
              <span className="text-cyan-300 font-bold">{labelA}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
              <span className="text-violet-300 font-bold">{labelB}</span>
            </div>
          </div>
        )}
      </div>

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
              name={labelA}
              dataKey="score"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.35}
            />
            {isComparing && (
              <Radar
                name={labelB}
                dataKey="scoreB"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.35}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
