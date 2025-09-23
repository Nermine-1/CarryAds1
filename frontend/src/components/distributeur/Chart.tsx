import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  name: string;
  bags: number;
}

interface BagsDistributedChartProps {
  data: ChartDataPoint[];
}

const BagsDistributedChart: React.FC<BagsDistributedChartProps> = ({ data }) => {
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis 
            dataKey="name" 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => value.toLocaleString('fr-FR')}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.1)' }} 
            formatter={(value: number) => [value.toLocaleString('fr-FR'), 'Sacs Distribués']}
            labelStyle={{ color: '#111827' }}
            itemStyle={{ color: '#111827' }}
          />
          <Bar 
            dataKey="bags" 
            fill="#f39c12" 
            barSize={30} 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BagsDistributedChart;