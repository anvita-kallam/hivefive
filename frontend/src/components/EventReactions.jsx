import { Smile, Frown, Meh } from 'lucide-react';
import { motion } from 'framer-motion';

function EventReactions({ event, showTitle = true, size = 'small' }) {
  // Use event data directly instead of making a separate API call
  const reactions = event?.swipeLogs || [];

  if (!reactions || reactions.length === 0) {
    return null;
  }

  // Filter reactions that have media (photos/videos)
  const reactionsWithMedia = reactions.filter(log => {
    if (!log.reactionMediaId) return false;
    // Handle both populated (object) and non-populated (ID) cases
    if (typeof log.reactionMediaId === 'object' && log.reactionMediaId.fileURL) {
      return true;
    }
    return false;
  });

  if (reactionsWithMedia.length === 0) {
    return null;
  }

  const getEmotionIcon = (emotion) => {
    if (!emotion) return <Meh className="w-4 h-4" />;
    
    const dominant = emotion.dominant || emotion.overallSentiment;
    if (dominant === 'happy' || (typeof emotion.sentiment === 'number' && emotion.sentiment > 0.3)) {
      return <Smile className="w-4 h-4 text-yellow-500" />;
    } else if (dominant === 'sad' || dominant === 'angry' || (typeof emotion.sentiment === 'number' && emotion.sentiment < -0.3)) {
      return <Frown className="w-4 h-4 text-red-500" />;
    } else {
      return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEmotionLabel = (emotion) => {
    if (!emotion) return 'Neutral';
    const dominant = emotion.dominant || 'neutral';
    return dominant.charAt(0).toUpperCase() + dominant.slice(1);
  };

  const getSentimentColor = (emotion) => {
    if (!emotion) return 'text-gray-600';
    const sentiment = emotion.sentiment;
    if (typeof sentiment === 'number') {
      if (sentiment > 0.3) return 'text-green-600';
      if (sentiment < -0.3) return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const isLarge = size === 'large';
  const gridCols = isLarge ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3';
  const videoHeight = isLarge ? 'h-48' : 'h-24';
  const cardPadding = isLarge ? 'p-4' : 'p-3';

  return (
    <div className={showTitle ? "mt-4" : ""}>
      {showTitle && (
        <h4 className="text-sm font-medium text-[#2D1B00] mb-3">Reactions</h4>
      )}
      <div className={`grid ${gridCols} gap-3`}>
        {reactionsWithMedia.map((log) => {
          // Handle both populated and non-populated userID
          const user = typeof log.userID === 'object' ? log.userID : { _id: log.userID };
          // Handle both populated and non-populated reactionMediaId
          const media = typeof log.reactionMediaId === 'object' && log.reactionMediaId !== null 
            ? log.reactionMediaId 
            : null;
          const emotion = media?.facialSentiment || log.emotionData;
          const isAccepted = log.swipeDirection === 'right';
          const userId = typeof log.userID === 'object' ? log.userID?._id : log.userID;
          const mediaId = typeof log.reactionMediaId === 'object' ? log.reactionMediaId?._id : log.reactionMediaId;

          return (
            <motion.div
              key={`reaction-${userId}-${mediaId || log.timestamp}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`honey-card ${cardPadding} relative overflow-hidden`}
            >
              {/* User info */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`${isLarge ? 'w-10 h-10' : 'w-8 h-8'} overflow-hidden flex-shrink-0 rounded-full border border-[#C17D3A]/30`}>
                  <img
                    src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-[#2D1B00] truncate ${isLarge ? 'text-sm' : 'text-xs'}`}>
                    {user?.name || 'User'}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className={`${isLarge ? 'text-sm' : 'text-xs'} ${isAccepted ? 'text-green-600' : 'text-red-600'}`}>
                      {isAccepted ? '✓ Accepted' : '✗ Declined'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reaction video/photo */}
              {media?.fileURL && (
                <div className={`relative w-full ${videoHeight} mb-2 rounded-lg overflow-hidden bg-gray-100`}>
                  {media.fileType === 'video' ? (
                    <video
                      src={media.fileURL}
                      className="w-full h-full object-cover"
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={media.fileURL}
                      alt="Reaction"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              {/* Emotion indicator */}
              {emotion && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {getEmotionIcon(emotion)}
                    <span className={`font-medium ${getSentimentColor(emotion)} ${isLarge ? 'text-sm' : 'text-xs'}`}>
                      {getEmotionLabel(emotion)}
                    </span>
                  </div>
                  {typeof emotion.sentiment === 'number' && (
                    <span className={`${getSentimentColor(emotion)} ${isLarge ? 'text-sm' : 'text-xs'}`}>
                      {emotion.sentiment > 0 ? '+' : ''}{emotion.sentiment.toFixed(1)}
                    </span>
                  )}
                </div>
              )}

              {/* Additional emotion details for large size */}
              {isLarge && emotion && emotion.expressions && (
                <div className="mt-2 pt-2 border-t border-[#2D1B00]/10">
                  <p className="text-xs text-[#6B4E00] mb-1">Confidence: {Math.round((emotion.confidence || 0) * 100)}%</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(emotion.expressions)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([emotionName, value]) => (
                        <span key={emotionName} className="text-xs text-[#6B4E00]">
                          {emotionName}: {Math.round(value * 100)}%
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default EventReactions;
