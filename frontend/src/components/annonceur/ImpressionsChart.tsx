import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../../styles/components/ImpressionsChart.css';

// 🆕 Updated interface to match the new campaign data
interface ChartProps {
  data: { name: string; campaigns: number }[];
}

const CampaignsChart = ({ data }: ChartProps) => {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 7, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          {/* 🆕 Updated label and dataKey for XAxis */}
          <XAxis dataKey="name" stroke="#666" />
          {/* 🆕 Updated label for YAxis */}
          <YAxis stroke="#666" label={{ value: 'Number of Campaigns', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          {/* 🆕 Updated dataKey and label for the Line */}
          <Line
            type="monotone"
            dataKey="campaigns"
            name="Campagnes créées"
            stroke="#008080"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CampaignsChart;