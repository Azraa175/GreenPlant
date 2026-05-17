import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-glass border border-gray-100 dark:border-gray-700">
      <p className="font-display font-semibold text-sm text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs text-gray-600 dark:text-gray-300">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold">{entry.value} ton</span>
        </p>
      ))}
    </div>
  );
};

export function PredictionChart({ data }) {
  if (!data?.length) return null;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
            stroke="rgba(148,163,184,0.5)"
          />
          <YAxis 
            tick={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
            stroke="rgba(148,163,184,0.5)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', fontFamily: 'Plus Jakarta Sans' }}
          />
          <Bar 
            dataKey="prediksi" 
            name="Prediksi" 
            fill="#16a34a" 
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar 
            dataKey="aktual" 
            name="Aktual" 
            fill="#f59e0b" 
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HistoryChart({ data }) {
  if (!data?.length) return null;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans' }}
            stroke="rgba(148,163,184,0.5)"
          />
          <YAxis 
            tick={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
            stroke="rgba(148,163,184,0.5)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Plus Jakarta Sans' }} />
          <Line 
            type="monotone" 
            dataKey="prediksi" 
            name="Prediksi"
            stroke="#16a34a" 
            strokeWidth={2.5}
            dot={{ fill: '#16a34a', r: 4 }}
            activeDot={{ r: 6, fill: '#16a34a' }}
          />
          <Line 
            type="monotone" 
            dataKey="aktual" 
            name="Aktual"
            stroke="#f59e0b" 
            strokeWidth={2.5}
            dot={{ fill: '#f59e0b', r: 4 }}
            activeDot={{ r: 6, fill: '#f59e0b' }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FactorsChart({ factors }) {
  if (!factors) return null;

  const data = [
    { name: 'Suhu', value: factors.temperature, fill: '#22c55e' },
    { name: 'Kelembaban', value: factors.humidity, fill: '#3b82f6' },
    { name: 'Curah Hujan', value: factors.rainfall, fill: '#6366f1' },
    { name: 'Tanah', value: factors.soil, fill: '#a855f7' },
    { name: 'Pupuk', value: factors.fertilizer, fill: '#f59e0b' },
    { name: 'Air', value: factors.water, fill: '#06b6d4' },
  ];

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="rgba(148,163,184,0.5)" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} stroke="rgba(148,163,184,0.5)" width={70} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-xl shadow-glass border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-display font-semibold">{payload[0]?.payload?.name}: {payload[0]?.value}%</p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={20}>
            {data.map((entry, index) => (
              <rect key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
