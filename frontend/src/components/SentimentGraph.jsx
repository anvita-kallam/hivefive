import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SentimentGraph({ media = [] }) {
  // Filter media with sentiment data
  const mediaWithSentiment = media.filter(m => m.facialSentiment);

  // Calculate emotion distribution
  const emotionDistribution = useMemo(() => {
    const counts = {};
    const sentimentSums = {};
    
    mediaWithSentiment.forEach(item => {
      const sentiment = item.facialSentiment;
      const dominant = sentiment?.dominant || 'neutral';
      const sentimentScore = sentiment?.sentiment || sentiment?.overallSentiment || 0;
      
      if (!counts[dominant]) {
        counts[dominant] = 0;
        sentimentSums[dominant] = 0;
      }
      counts[dominant]++;
      sentimentSums[dominant] += sentimentScore;
    });

    return Object.entries(counts).map(([emotion, count]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count,
      averageSentiment: sentimentSums[emotion] / count
    })).sort((a, b) => b.count - a.count);
  }, [mediaWithSentiment]);

  // Calculate sentiment score distribution (positive, neutral, negative)
  const sentimentDistribution = useMemo(() => {
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    mediaWithSentiment.forEach(item => {
      const sentiment = item.facialSentiment;
      const sentimentScore = sentiment?.sentiment || sentiment?.overallSentiment || 0;
      
      if (sentimentScore > 0.1) {
        positive++;
      } else if (sentimentScore < -0.1) {
        negative++;
      } else {
        neutral++;
      }
    });

    return [
      { name: 'Positive', value: positive, color: '#10B981' },
      { name: 'Neutral', value: neutral, color: '#6B7280' },
      { name: 'Negative', value: negative, color: '#EF4444' }
    ];
  }, [mediaWithSentiment]);

  // Calculate sentiment over time (grouped by date)
  const sentimentOverTime = useMemo(() => {
    const groupedByDate = {};
    
    mediaWithSentiment.forEach(item => {
      // Try to get timestamp from various fields
      let date;
      if (item.timestamp) {
        date = new Date(item.timestamp);
      } else if (item.createdAt) {
        date = new Date(item.createdAt);
      } else {
        date = new Date();
      }
      
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const sentiment = item.facialSentiment;
      const sentimentScore = sentiment?.sentiment || sentiment?.overallSentiment || 0;
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { count: 0, total: 0, dateObj: date };
      }
      groupedByDate[dateKey].count++;
      groupedByDate[dateKey].total += sentimentScore;
    });

    return Object.entries(groupedByDate)
      .map(([date, data]) => ({
        date,
        average: data.total / data.count,
        count: data.count,
        dateObj: data.dateObj
      }))
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 10); // Limit to last 10 dates for readability
  }, [mediaWithSentiment]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (mediaWithSentiment.length === 0) return null;

    const totalSentiment = mediaWithSentiment.reduce((sum, item) => {
      const sentiment = item.facialSentiment;
      const sentimentScore = sentiment?.sentiment || sentiment?.overallSentiment || 0;
      return sum + sentimentScore;
    }, 0);

    const averageSentiment = totalSentiment / mediaWithSentiment.length;
    const maxSentiment = Math.max(...mediaWithSentiment.map(item => {
      const sentiment = item.facialSentiment;
      return sentiment?.sentiment || sentiment?.overallSentiment || 0;
    }));
    const minSentiment = Math.min(...mediaWithSentiment.map(item => {
      const sentiment = item.facialSentiment;
      return sentiment?.sentiment || sentiment?.overallSentiment || 0;
    }));

    return {
      average: averageSentiment,
      max: maxSentiment,
      min: minSentiment,
      total: mediaWithSentiment.length
    };
  }, [mediaWithSentiment]);

  if (mediaWithSentiment.length === 0) {
    return (
      <div className="honey-card p-6">
        <h3 className="text-[#2D1B00] font-medium text-lg mb-4">Sentiment Analysis</h3>
        <p className="text-[#6B4E00] text-center py-8">No sentiment data available yet. Reactions with sentiment analysis will appear here.</p>
      </div>
    );
  }

  const COLORS = {
    happy: '#FBBF24',
    surprised: '#F59E0B',
    neutral: '#6B7280',
    sad: '#3B82F6',
    angry: '#EF4444',
    fearful: '#8B5CF6',
    disgusted: '#10B981'
  };

  const getColorForEmotion = (emotion) => {
    const lowerEmotion = emotion.toLowerCase();
    return COLORS[lowerEmotion] || '#6B7280';
  };

  return (
    <div className="honey-card p-6">
      <h3 className="text-[#2D1B00] font-medium text-lg mb-4">Sentiment Analysis</h3>
      
      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-[rgba(245,230,211,0.4)] rounded-lg">
            <p className="text-xs text-[#6B4E00] mb-1">Average Sentiment</p>
            <p className={`text-lg font-bold ${overallStats.average > 0 ? 'text-green-600' : overallStats.average < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {overallStats.average > 0 ? '+' : ''}{overallStats.average.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-[rgba(245,230,211,0.4)] rounded-lg">
            <p className="text-xs text-[#6B4E00] mb-1">Total Reactions</p>
            <p className="text-lg font-bold text-[#2D1B00]">{overallStats.total}</p>
          </div>
          <div className="text-center p-3 bg-[rgba(245,230,211,0.4)] rounded-lg">
            <p className="text-xs text-[#6B4E00] mb-1">Peak Sentiment</p>
            <p className="text-lg font-bold text-green-600">
              {overallStats.max > 0 ? '+' : ''}{overallStats.max.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-[rgba(245,230,211,0.4)] rounded-lg">
            <p className="text-xs text-[#6B4E00] mb-1">Lowest Sentiment</p>
            <p className="text-lg font-bold text-red-600">
              {overallStats.min.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Distribution Bar Chart */}
        {emotionDistribution.length > 0 && (
          <div>
            <h4 className="text-[#2D1B00] font-medium mb-3 text-sm">Emotion Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={emotionDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 27, 0, 0.1)" />
                <XAxis 
                  dataKey="emotion" 
                  tick={{ fill: '#6B4E00', fontSize: 12 }}
                  stroke="rgba(45, 27, 0, 0.3)"
                />
                <YAxis 
                  tick={{ fill: '#6B4E00', fontSize: 12 }}
                  stroke="rgba(45, 27, 0, 0.3)"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(245, 230, 211, 0.95)', 
                    border: '1px solid rgba(45, 27, 0, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#C17D3A"
                  radius={[8, 8, 0, 0]}
                >
                  {emotionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForEmotion(entry.emotion)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sentiment Distribution Pie Chart */}
        {sentimentDistribution.some(item => item.value > 0) && (
          <div>
            <h4 className="text-[#2D1B00] font-medium mb-3 text-sm">Sentiment Breakdown</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentDistribution.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(245, 230, 211, 0.95)', 
                    border: '1px solid rgba(45, 27, 0, 0.2)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Sentiment Over Time */}
      {sentimentOverTime.length > 1 && (
        <div className="mt-6">
          <h4 className="text-[#2D1B00] font-medium mb-3 text-sm">Sentiment Over Time</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sentimentOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 27, 0, 0.1)" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6B4E00', fontSize: 12 }}
                stroke="rgba(45, 27, 0, 0.3)"
              />
              <YAxis 
                tick={{ fill: '#6B4E00', fontSize: 12 }}
                stroke="rgba(45, 27, 0, 0.3)"
                domain={[-1, 1]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(245, 230, 211, 0.95)', 
                  border: '1px solid rgba(45, 27, 0, 0.2)',
                  borderRadius: '8px'
                }}
                formatter={(value) => [value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2), 'Average Sentiment']}
              />
              <Bar 
                dataKey="average" 
                fill="#FFC30B"
                radius={[8, 8, 0, 0]}
              >
                {sentimentOverTime.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.average > 0 ? '#10B981' : entry.average < 0 ? '#EF4444' : '#6B7280'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default SentimentGraph;

