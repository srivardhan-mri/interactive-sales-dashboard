import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';
import { CHART_COLORS } from '../constants';
import NoData from './NoData';

interface BarChartComponentProps {
  data: ChartDataPoint[];
  dataKey: string; // value dataKey for the bar
  xAxisKey: string; // category dataKey for the axis
  valueFormatter?: (value: number) => string;
  name?: string; // Name of the series for legend/tooltip
  layout?: 'vertical' | 'horizontal';
  truncateLabelLength?: number;
}

const MINIMUM_CHART_HEIGHT = 150; 
const HORIZONTAL_CHART_PADDING_TOP_BOTTOM = 50; 
const BAR_CATEGORY_HEIGHT = 35; 
const BAR_THICKNESS = 20; 

const BarChartComponent: React.FC<BarChartComponentProps> = ({ 
  data, 
  dataKey, 
  xAxisKey, 
  valueFormatter, 
  name: seriesNameFromProps,
  layout = 'vertical',
  truncateLabelLength 
}) => {
  if (!data || data.length === 0) {
    return <NoData message="No data for this chart." />;
  }

  const seriesName = seriesNameFromProps || "Value";

  const categoryTickFormatter = (value: any) => {
    if (truncateLabelLength && typeof value === 'string' && value.length > truncateLabelLength) {
      return value.substring(0, truncateLabelLength);
    }
    return value;
  };

  const defaultValueFormatter = (val: number) => typeof val === 'number' ? val.toLocaleString('en-IN', { notation: 'compact', compactDisplay: 'short'}) : String(val);
  const displayValueFormatter = valueFormatter || defaultValueFormatter;

  const tooltipLabelFormatter = (label: string | number, payloadItems: any[] | undefined) => {
    if (payloadItems && payloadItems.length > 0) {
      const originalDataPoint = payloadItems[0].payload;
      if (originalDataPoint && originalDataPoint.hasOwnProperty(xAxisKey)) {
        return String(originalDataPoint[xAxisKey]);
      }
    }
    return String(label);
  };

  const tooltipItemFormatter = (value: number, name: string, props: any) => {
    const formattedValue = typeof value === 'number' ? displayValueFormatter(value) : value;
    return [formattedValue, seriesName];
  };
  
  const tooltipStyle = {
    contentStyle: { backgroundColor: 'rgba(30, 41, 59, 0.95)', border: '1px solid #26344b', borderRadius: '0.375rem' }, // slate-800, slate-750 border
    labelStyle: { color: '#e2e8f0', fontWeight: '600' }, // slate-200
    itemStyle: { color: '#cbd5e1' }, // slate-300
    wrapperStyle: layout === 'horizontal' ? { transform: 'translateY(8px)' } : {} // Adjust Y to shift tooltip down for horizontal bars
  };

  const legendStyle = { color: '#cbd5e1', paddingTop: '15px' }; // slate-300
  const axisTickStyle = { fill: '#cbd5e1', fontSize: 12 }; // slate-300
  const axisLineGridStyle = { stroke: '#475569' }; // slate-600

  if (layout === 'horizontal') {
    const yAxisCalculatedWidth = truncateLabelLength 
      ? Math.min(150, Math.max(60, truncateLabelLength * 8 + 25)) 
      : 150;
    
    const calculatedChartHeight = Math.max(
      MINIMUM_CHART_HEIGHT, 
      data.length * BAR_CATEGORY_HEIGHT + HORIZONTAL_CHART_PADDING_TOP_BOTTOM 
    );

    return (
      <div style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <ResponsiveContainer width="100%" height={calculatedChartHeight}>
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ 
              top: 20, 
              right: 30, 
              left: yAxisCalculatedWidth - 20, // Adjust based on Y-axis width minus some padding
              bottom: 20  
            }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} stroke={axisLineGridStyle.stroke} />
            <XAxis 
              type="number" 
              tick={axisTickStyle} 
              axisLine={axisLineGridStyle} 
              tickLine={axisLineGridStyle}
              tickFormatter={displayValueFormatter}
              domain={['auto', 'auto']} 
            />
            <YAxis 
              dataKey={xAxisKey} 
              type="category" 
              tick={axisTickStyle} 
              axisLine={axisLineGridStyle} 
              tickLine={axisLineGridStyle}
              width={yAxisCalculatedWidth}
              interval={0} 
              tickFormatter={categoryTickFormatter}
              scale="band"
            />
            <Tooltip
              contentStyle={tooltipStyle.contentStyle}
              labelStyle={tooltipStyle.labelStyle}
              itemStyle={tooltipStyle.itemStyle}
              wrapperStyle={tooltipStyle.wrapperStyle}
              formatter={tooltipItemFormatter}
              labelFormatter={tooltipLabelFormatter}
              cursor={{ fill: 'rgba(71, 85, 105, 0.3)' }} // slate-600 with opacity
            />
            <Legend wrapperStyle={legendStyle} />
            <Bar 
              dataKey={dataKey} 
              name={seriesName} 
              fill={CHART_COLORS[0]} 
              radius={[0, 4, 4, 0]} 
              barSize={BAR_THICKNESS} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } else {
    // Vertical bar chart (default)
    const bottomMargin = truncateLabelLength && data.length > 5 ? Math.max(30, truncateLabelLength * 4 + 20) : 30; 
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ 
            top: 5, 
            right: 20, 
            left: 10, // Reduced left margin for Y-axis
            bottom: bottomMargin 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} stroke={axisLineGridStyle.stroke} />
          <XAxis 
            dataKey={xAxisKey} 
            tick={axisTickStyle} 
            axisLine={axisLineGridStyle} 
            tickLine={axisLineGridStyle}
            tickFormatter={categoryTickFormatter}
            interval={data.length > 15 ? 'preserveStartEnd' : 0}
            angle={truncateLabelLength && data.length > 10 ? -30 : 0}
            textAnchor={truncateLabelLength && data.length > 10 ? 'end' : 'middle'}
            height={bottomMargin}
          />
          <YAxis 
            tick={axisTickStyle} 
            axisLine={axisLineGridStyle} 
            tickLine={axisLineGridStyle}
            tickFormatter={displayValueFormatter}
          />
          <Tooltip
            contentStyle={tooltipStyle.contentStyle}
            labelStyle={tooltipStyle.labelStyle}
            itemStyle={tooltipStyle.itemStyle}
            formatter={tooltipItemFormatter}
            labelFormatter={tooltipLabelFormatter}
            cursor={{ fill: 'rgba(71, 85, 105, 0.3)' }} // slate-600 with opacity
          />
          <Legend wrapperStyle={legendStyle} />
          <Bar dataKey={dataKey} name={seriesName} fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
};

export default BarChartComponent;