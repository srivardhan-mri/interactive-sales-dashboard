
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';
import { CHART_COLORS } from '../constants';
import NoData from './NoData';

interface PieChartComponentProps {
  data: ChartDataPoint[];
  valueFormatter?: (value: number) => string; // For cases where value is not currency
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, valueFormatter }) => {
  if (!data || data.length === 0) {
    return <NoData message="No data for this chart." />;
  }
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = <T extends { cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, percent: number, index: number },>({ cx, cy, midAngle, innerRadius, outerRadius, percent }: T) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent * 100 < 5) return null; 

    return (
      <text x={x} y={y} fill="#f1f5f9" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight={500}> {/* slate-100 */}
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const defaultFormatter = (value: number) => value.toLocaleString('en-IN');
  const displayFormatter = valueFormatter || defaultFormatter;

  const tooltipStyle = {
    contentStyle: { backgroundColor: 'rgba(30, 41, 59, 0.95)', border: '1px solid #26344b', borderRadius: '0.375rem' }, // slate-800, slate-750 border
    labelStyle: { color: '#e2e8f0', fontWeight: '600' }, // slate-200
    itemStyle: { color: '#cbd5e1' } // slate-300
  };

  const legendStyle = { color: '#cbd5e1', paddingTop: '15px' }; // slate-300


  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius="80%"
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          stroke="#1e293b" // Add a subtle border to slices for better separation
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle.contentStyle}
          labelStyle={tooltipStyle.labelStyle}
          itemStyle={tooltipStyle.itemStyle}
          formatter={(value: number, name: string) => [displayFormatter(value), name]}
          cursor={{ fill: 'rgba(71, 85, 105, 0.3)' }} // slate-600 with opacity
        />
        <Legend wrapperStyle={legendStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
