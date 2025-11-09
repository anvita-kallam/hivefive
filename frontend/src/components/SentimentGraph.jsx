import { useMemo } from 'react';
import { BarChart2, Users, ChevronRight } from 'lucide-react';

function SentimentGraph({ media = [] }) {
  // Filter media with sentiment data
  const mediaWithSentiment = media.filter(m => m.facialSentiment);

  // Define all possible emotions with emojis and colors
  const emotionConfig = {
    happy: { emoji: '😊', color: '#FBBF24', bgColor: 'rgba(251, 191, 36, 0.2)' },
    surprised: { emoji: '😲', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.2)' },
    neutral: { emoji: '😐', color: '#9CA3AF', bgColor: 'rgba(156, 163, 175, 0.2)' },
    sad: { emoji: '😢', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.2)' },
    angry: { emoji: '😠', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.2)' },
    fearful: { emoji: '😨', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.2)' },
    disgusted: { emoji: '🤢', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.2)' }
  };

  // Calculate emotion distribution with user counts
  const emotionData = useMemo(() => {
    const emotionMap = {};
    const userEmotions = {}; // Track unique users per emotion
    
    // Initialize all emotions
    Object.keys(emotionConfig).forEach(emotion => {
      emotionMap[emotion] = {
        count: 0,
        totalConfidence: 0,
        users: new Set()
      };
    });
    
    mediaWithSentiment.forEach(item => {
      const sentiment = item.facialSentiment;
      const dominant = (sentiment?.dominant || 'neutral').toLowerCase();
      const confidence = sentiment?.confidence || 0;
      const userId = item.uploaderID?._id || item.uploaderID;
      
      if (emotionConfig[dominant]) {
        emotionMap[dominant].count++;
        emotionMap[dominant].totalConfidence += confidence;
        if (userId) {
          emotionMap[dominant].users.add(userId.toString());
        }
      } else {
        // Fallback to neutral
        emotionMap['neutral'].count++;
        emotionMap['neutral'].totalConfidence += confidence;
        if (userId) {
          emotionMap['neutral'].users.add(userId.toString());
        }
      }
    });

    // Get all emotions with data (for reaction tags - only show emotions with counts > 0)
    const emotionsWithData = Object.entries(emotionConfig).map(([emotion, config]) => {
      const data = emotionMap[emotion];
      const uniqueUsers = data.users.size;
      const averageConfidence = data.count > 0 ? data.totalConfidence / data.count : 0;
      
      return {
        emotion,
        label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        emoji: config.emoji,
        color: config.color,
        bgColor: config.bgColor,
        count: data.count,
        uniqueUsers,
        averageConfidence,
        percentage: mediaWithSentiment.length > 0 
          ? (data.count / mediaWithSentiment.length) * 100 
          : 0
      };
    }).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

    // Get all emotions for bar chart (show all, even with 0%)
    const allEmotions = Object.entries(emotionConfig).map(([emotion, config]) => {
      const data = emotionMap[emotion];
      
      return {
        emotion,
        label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        emoji: config.emoji,
        color: config.color,
        bgColor: config.bgColor,
        count: data.count,
        uniqueUsers: data.users.size,
        averageConfidence: data.count > 0 ? data.totalConfidence / data.count : 0,
        percentage: mediaWithSentiment.length > 0 
          ? (data.count / mediaWithSentiment.length) * 100 
          : 0
      };
    }).sort((a, b) => b.percentage - a.percentage);

    return { emotionsWithData, allEmotions };
  }, [mediaWithSentiment]);

  // Extract emotions with data and all emotions
  const emotionsWithData = emotionData.emotionsWithData || [];
  const allEmotions = emotionData.allEmotions || [];

  // Calculate dominant emotion
  const dominantEmotion = useMemo(() => {
    if (emotionsWithData.length === 0) return null;
    return emotionsWithData[0]; // Already sorted by count
  }, [emotionsWithData]);

  // Calculate average confidence across all reactions
  const averageConfidence = useMemo(() => {
    if (mediaWithSentiment.length === 0) return 0;
    const totalConfidence = mediaWithSentiment.reduce((sum, item) => {
      return sum + (item.facialSentiment?.confidence || 0);
    }, 0);
    return (totalConfidence / mediaWithSentiment.length) * 100;
  }, [mediaWithSentiment]);

  if (mediaWithSentiment.length === 0) {
    return (
      <div className="bg-[rgba(255,249,230,0.6)] rounded-lg p-6 shadow-sm border border-[#2D1B00]/10">
        <h3 className="text-[#2D1B00] font-semibold text-lg mb-4">Emotional Reactions</h3>
        <p className="text-[#6B4E00] text-center py-8">No sentiment data available yet. Reactions with sentiment analysis will appear here.</p>
      </div>
    );
  }

  // Scroll to reactions section
  const handleViewReactions = () => {
    const reactionsSection = document.getElementById('reaction-photos-section');
    if (reactionsSection) {
      reactionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Emotional Reactions */}
      <div className="bg-[rgba(255,249,230,0.6)] rounded-lg p-6 shadow-sm border border-[#2D1B00]/10">
        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">😊</span>
          <h3 className="text-[#2D1B00] font-semibold text-lg">Emotional Reactions</h3>
        </div>

        {/* Dominant Emotion and Average Confidence Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Dominant Emotion Box */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Dominant Emotion</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{dominantEmotion?.emoji}</span>
              <div>
                <p className="text-2xl font-bold text-[#2D1B00]">{dominantEmotion?.label}</p>
                <p className="text-sm text-gray-600">
                  {dominantEmotion?.uniqueUsers || 0} {dominantEmotion?.uniqueUsers === 1 ? 'person' : 'persons'}
                </p>
              </div>
            </div>
          </div>

          {/* Average Confidence Box */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Average Confidence</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-[#2D1B00]">
                {averageConfidence.toFixed(1)}%
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{mediaWithSentiment.length} reactions</span>
              </div>
            </div>
          </div>
        </div>

        {/* All Reactions Section */}
        <div className="mb-4">
          <p className="text-sm text-[#2D1B00] mb-3 font-medium">All Reactions:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {emotionsWithData.map((emotion) => (
              <div
                key={emotion.emotion}
                className="flex items-center gap-2 bg-[rgba(255,249,230,0.8)] rounded-lg px-3 py-2 border border-gray-200"
              >
                <span className="text-xl">{emotion.emoji}</span>
                <span className="text-sm text-[#2D1B00] font-medium">{emotion.label}</span>
                <span className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-[#2D1B00]">
                  {emotion.count}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleViewReactions}
            className="flex items-center gap-1 text-sm text-[#2D1B00] hover:text-[#6B4E00] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            View Individual Reactions
          </button>
        </div>
      </div>

      {/* Bottom Section: Hive Emotional Response */}
      <div className="bg-[rgba(255,249,230,0.6)] rounded-lg p-6 shadow-sm border border-[#2D1B00]/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#2D1B00]" />
            <h3 className="text-[#2D1B00] font-semibold text-lg">Hive Emotional Response</h3>
          </div>
          <p className="text-sm text-gray-600">{mediaWithSentiment.length} reactions</p>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="space-y-4">
          {allEmotions.map((emotion) => (
            <div key={emotion.emotion} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{emotion.emoji}</span>
                  <span className="text-sm font-medium text-[#2D1B00]">{emotion.label}</span>
                </div>
                <span className="text-sm font-bold text-[#2D1B00]">{emotion.percentage.toFixed(1)}%</span>
              </div>
              <div className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(emotion.percentage, 0.1)}%`, // Minimum 0.1% to show very small values
                    backgroundColor: emotion.color,
                    minWidth: emotion.percentage > 0 ? '2px' : '0'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-600 text-center mt-6">
          Average emotions from all hive members who reacted
        </p>
      </div>
    </div>
  );
}

export default SentimentGraph;
