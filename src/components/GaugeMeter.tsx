import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export function GaugeMeter({ score }: { score: number }) {
  const data = [
    { name: 'Score', value: score },
    { name: 'Empty', value: 100 - score },
  ];
  
  let color = '#ef4444'; // Red
  let text = 'Kurang Sehat';
  
  if (score >= 80) {
    color = '#10b981'; // Green
    text = 'Sangat Sehat';
  } else if (score >= 50) {
    color = '#f59e0b'; // Yellow
    text = 'Cukup Sehat';
  }

  return (
    <div className="relative h-48 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="cell-0" fill={color} />
            <Cell key="cell-1" fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 flex flex-col items-center">
        <span className="text-3xl font-black text-slate-800 dark:text-white">{score.toFixed(0)}</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{text}</span>
      </div>
    </div>
  );
}
