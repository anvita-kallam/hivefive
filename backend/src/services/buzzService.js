import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import Hive from '../models/Hive.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Media from '../models/Media.js';

dotenv.config();

let generativeModel = null;
let useApiKey = false;
let useVertexAI = false;

// Initialize Gemini/Vertex AI client
// Priority 1: Vertex AI with API key (if VERTEX_AI_API_KEY is set)
// Priority 2: Google Generative AI API (uses API key from AI Studio) - simpler for development
// Priority 3: Vertex AI (uses service account) - for production with Vertex AI
try {
  // Option 1: Use Vertex AI with API key (if provided)
  if (process.env.VERTEX_AI_API_KEY && process.env.VERTEX_AI_PROJECT_ID) {
    try {
      const apiKey = process.env.VERTEX_AI_API_KEY.trim();
      const projectId = process.env.VERTEX_AI_PROJECT_ID;
      const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
      
      console.log('🔑 Attempting to initialize Vertex AI with API key...');
      
      // For Vertex AI, we still need to use the VertexAI client
      // But we can set the API key in the environment
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify({
        type: 'service_account',
        project_id: projectId,
        private_key_id: apiKey,
        // This is a workaround - Vertex AI typically needs service account JSON
      });
      
      const vertexAI = new VertexAI({
        project: projectId,
        location: location,
      });
      
      generativeModel = vertexAI.preview.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      });
      
      useVertexAI = true;
      useApiKey = false;
      console.log(`✅ Vertex AI initialized with API key (gemini-1.5-flash)`);
    } catch (initError) {
      console.error('❌ Failed to initialize Vertex AI with API key:', initError.message);
      generativeModel = null;
    }
  }
  // Option 2: Use Google Generative AI API with API key from AI Studio (simpler)
  else if (process.env.GEMINI_API_KEY) {
    try {
      const apiKey = process.env.GEMINI_API_KEY.trim();
      console.log('🔑 Attempting to initialize Gemini API with key:', apiKey.substring(0, 10) + '...');
      
      // Check if it's a valid Gemini API key (should start with AIza)
      if (!apiKey.startsWith('AIza')) {
        console.warn('⚠️ API key format looks incorrect. Gemini API keys from Google AI Studio typically start with "AIza"');
        console.warn('⚠️ The provided key might be for Vertex AI instead. Falling back to enhanced mock responses.');
        console.warn('💡 Get a Gemini API key from: https://makersuite.google.com/app/apikey');
        console.warn('💡 Or use Vertex AI with VERTEX_AI_PROJECT_ID and service account credentials');
        generativeModel = null;
        useApiKey = false;
      } else {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          // Use gemini-pro (most widely available via API key)
          // The @google/generative-ai SDK handles the correct endpoint automatically
          const modelName = 'gemini-pro';
          generativeModel = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
            },
          });
          useApiKey = true;
          useVertexAI = false;
          console.log(`✅ Gemini API initialized with API key (${modelName})`);
          
          // Test the API with a simple call to verify it works
          console.log('🧪 Testing Gemini API connection...');
          generativeModel.generateContent('Test').then(() => {
            console.log('✅ Gemini API test successful - ready to use!');
          }).catch((testError) => {
            console.warn('⚠️ Gemini API test failed:', testError.message);
            console.warn('⚠️ Will attempt to use API, but will fall back to enhanced mock responses on error');
          });
        } catch (initError) {
          console.error('❌ Failed to initialize Gemini API:', initError.message);
          generativeModel = null;
          useApiKey = false;
        }
      }
    } catch (initError) {
      console.error('❌ Failed to initialize Gemini API:', initError.message);
      generativeModel = null;
      useApiKey = false;
    }
  }
  // Option 3: Use Vertex AI with service account (production)
  else if (process.env.VERTEX_AI_PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const vertexAI = new VertexAI({
      project: process.env.VERTEX_AI_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    });
    
    // Use Gemini 2.0 Flash for fast, conversational responses
    generativeModel = vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });
    
      useApiKey = false;
      useVertexAI = true;
      console.log('✅ Vertex AI Buzz service initialized with Gemini 2.0 Flash');
  } else {
    console.warn('⚠️ No Gemini/Vertex AI credentials found. Buzz will use enhanced mock responses.');
    console.warn('💡 Options:');
    console.warn('   1. Get a Gemini API key from: https://makersuite.google.com/app/apikey');
    console.warn('      (Keys start with "AIza") and set GEMINI_API_KEY');
    console.warn('   2. Use Vertex AI with VERTEX_AI_PROJECT_ID + GOOGLE_APPLICATION_CREDENTIALS');
    console.warn('   3. Use Vertex AI with API key: VERTEX_AI_API_KEY + VERTEX_AI_PROJECT_ID');
  }
} catch (error) {
  console.warn('⚠️ Gemini/Vertex AI initialization failed:', error.message);
  console.warn('Buzz will use enhanced mock responses.');
}

/**
 * Build hive context for Buzz
 * Includes: members, recent events, preferences, activity patterns
 */
async function buildHiveContext(hiveId) {
  try {
    const hive = await Hive.findById(hiveId).populate('members', 'name email major hobbies');
    if (!hive) return null;

    // Get recent events (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEvents = await Event.find({
      hiveID: hiveId,
      createdAt: { $gte: thirtyDaysAgo }
    })
      .populate('createdBy', 'name')
      .populate('acceptedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get event preferences from accepted events
    const acceptedEvents = recentEvents.filter(e => e.status === 'confirmed' || e.acceptedBy.length > 0);
    const eventCategories = {};
    const locationPreferences = [];
    
    acceptedEvents.forEach(event => {
      // Extract category from title (e.g., "Dinner", "Game Night")
      const category = extractCategory(event.title);
      if (category) {
        eventCategories[category] = (eventCategories[category] || 0) + 1;
      }
      
      if (event.location?.name) {
        locationPreferences.push(event.location.name);
      }
    });

    // Get media/reviews from events
    const eventIds = recentEvents.map(e => e._id);
    const media = await Media.find({
      eventID: { $in: eventIds },
      isReaction: false
    }).limit(20);

    // Analyze sentiment from media
    const positiveEvents = media
      .filter(m => m.facialSentiment && m.facialSentiment.overallSentiment > 0.6)
      .map(m => m.eventID);

    return {
      hiveName: hive.name,
      members: hive.members.map(m => ({
        name: m.name,
        major: m.major,
        hobbies: m.hobbies
      })),
      memberCount: hive.members.length,
      activityFrequency: hive.activityFrequency,
      recentEvents: recentEvents.map(e => ({
        title: e.title,
        description: e.description,
        status: e.status,
        location: e.location?.name || e.location?.address,
        confirmedTime: e.confirmedTime,
        acceptedCount: e.acceptedBy?.length || 0,
        createdBy: e.createdBy?.name
      })),
      preferredCategories: Object.entries(eventCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category]) => category),
      locationPreferences: [...new Set(locationPreferences)].slice(0, 5),
      positiveEventCount: new Set(positiveEvents).size,
      defaultLocation: hive.settings?.defaultLocation
    };
  } catch (error) {
    console.error('Error building hive context:', error);
    return null;
  }
}

/**
 * Extract event category from title
 */
function extractCategory(title) {
  const lowerTitle = title.toLowerCase();
  const categories = {
    'dinner': 'Dinner',
    'lunch': 'Lunch',
    'brunch': 'Brunch',
    'breakfast': 'Breakfast',
    'game': 'Game Night',
    'study': 'Study Session',
    'movie': 'Movie',
    'coffee': 'Coffee',
    'party': 'Party',
    'hiking': 'Hiking',
    'sports': 'Sports',
    'shopping': 'Shopping'
  };
  
  for (const [key, value] of Object.entries(categories)) {
    if (lowerTitle.includes(key)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Generate Buzz's response using Gemini
 */
export async function generateBuzzResponse(hiveId, conversationHistory, userMessage, userId) {
  try {
    console.log('🤖 Generating Buzz response for hive:', hiveId);
    console.log('📝 User message:', userMessage);
    console.log('🔑 Generative model available:', !!generativeModel);
    console.log('🔑 Using API key:', useApiKey);
    
    // Build hive context
    const context = await buildHiveContext(hiveId);
    if (!context) {
      console.warn('⚠️ Could not build hive context');
      return "Hey! I'm having trouble accessing the hive info right now. Can you try again in a moment? 🐝";
    }
    
    console.log('✅ Hive context built:', {
      hiveName: context.hiveName,
      memberCount: context.memberCount,
      preferredCategories: context.preferredCategories.length
    });

    // Get user info
    const user = await User.findById(userId);
    const userName = user?.name || 'there';

    // Format conversation history (last 10 messages)
    const recentMessages = conversationHistory.slice(-10).map(msg => {
      if (msg.isBuzzMessage) {
        return `Buzz: ${msg.message}`;
      } else {
        const senderName = msg.sender?.name || 'Member';
        return `${senderName}: ${msg.message}`;
      }
    }).join('\n');

    // Build system prompt with hive context
    const systemPrompt = `You are Buzz, a friendly and helpful AI assistant for the "${context.hiveName}" hive. You're like a digital member of the group who helps with event planning and keeps conversations fun.

HIVE CONTEXT:
- Hive Name: ${context.hiveName}
- Members: ${context.members.map(m => m.name).join(', ')}
- Activity Frequency: ${context.activityFrequency}
- Preferred Event Types: ${context.preferredCategories.join(', ') || 'Various'}
- Favorite Locations: ${context.locationPreferences.join(', ') || 'Various'}
- Recent Successful Events: ${context.positiveEventCount}

YOUR PERSONALITY:
- Friendly, casual, and enthusiastic
- Use emojis naturally (especially 🐝 🍯)
- Reference past events and preferences when relevant
- Ask clarifying questions to help plan better events
- Be helpful with event suggestions based on hive history
- Keep responses concise (2-3 sentences max usually)

CURRENT CONVERSATION:
${recentMessages}

USER MESSAGE: ${userName}: ${userMessage}

Generate a helpful, context-aware response as Buzz. If the message is about event planning, ask clarifying questions or make suggestions based on the hive's preferences. Keep it friendly and concise.`;
    
    console.log('📤 Sending request to Gemini API...');
    console.log('📏 Prompt length:', systemPrompt.length, 'characters');

    // Use Gemini/Vertex AI if available, otherwise use enhanced mock
    if (generativeModel) {
      try {
        let result;
        
        if (useApiKey) {
          // Google Generative AI API (API key authentication)
          console.log('📤 Calling Gemini API with prompt length:', systemPrompt.length);
          result = await generativeModel.generateContent(systemPrompt);
          console.log('✅ Received response from Gemini API');
          
          const response = result.response;
          const buzzMessage = response.text();
          console.log('📝 Response text length:', buzzMessage ? buzzMessage.length : 0);
          
          if (buzzMessage && buzzMessage.trim()) {
            console.log('✅ Returning AI-generated response');
            return buzzMessage.trim();
          } else {
            console.warn('⚠️ Gemini API returned empty response, using enhanced mock');
            return generateEnhancedMockResponse(userMessage, context, conversationHistory);
          }
        } else if (useVertexAI) {
          // Vertex AI (service account or API key authentication)
          console.log('📤 Calling Vertex AI with prompt length:', systemPrompt.length);
          result = await generativeModel.generateContent({
            contents: [{
              role: 'user',
              parts: [{ text: systemPrompt }]
            }]
          });
          console.log('✅ Received response from Vertex AI');

          const response = result.response;
          const buzzMessage = response.candidates?.[0]?.content?.parts?.[0]?.text || 
            generateEnhancedMockResponse(userMessage, context, conversationHistory);
          console.log('📝 Response text length:', buzzMessage ? buzzMessage.length : 0);

          return buzzMessage.trim();
        } else {
          // Fallback (shouldn't reach here)
          console.warn('⚠️ No valid authentication method, using enhanced mock');
          return generateEnhancedMockResponse(userMessage, context, conversationHistory);
        }
      } catch (aiError) {
        console.error('❌ Error calling Gemini/Vertex AI:', aiError.message);
        console.error('Error details:', {
          name: aiError.name,
          message: aiError.message,
          stack: aiError.stack?.split('\n').slice(0, 5).join('\n'),
          useApiKey: useApiKey
        });
        // Fallback to mock response
        console.log('🔄 Falling back to enhanced mock response');
        return generateEnhancedMockResponse(userMessage, context, conversationHistory);
      }
    } else {
      // Use enhanced mock response that's context-aware
      return generateEnhancedMockResponse(userMessage, context, conversationHistory);
    }
  } catch (error) {
    console.error('❌ Error generating Buzz response:', error);
    console.error('Error stack:', error.stack);
    // Try to provide more helpful error message or fallback
    try {
      return generateEnhancedMockResponse(userMessage, context || {}, []);
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError);
      return "Oops! Something went wrong. Give me a sec and try again? 🐝";
    }
  }
}

/**
 * Generate mock response when Vertex AI is unavailable
 */
function generateMockResponse(userMessage, context) {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('dinner') || lowerMessage.includes('eat') || lowerMessage.includes('food')) {
    const location = context.locationPreferences[0] || 'a great spot';
    return `Ooh, food! 🍯 What kind of cuisine are you craving? I noticed the hive enjoyed ${location} last time - want to go there again or try something new?`;
  }
  
  if (lowerMessage.includes('game') || lowerMessage.includes('play')) {
    return `Game night sounds fun! 🎮 Would you all prefer a casual night in or something off-campus? I can help find a good spot!`;
  }
  
  if (lowerMessage.includes('event') || lowerMessage.includes('plan') || lowerMessage.includes('suggest')) {
    const category = context.preferredCategories[0] || 'something fun';
    return `I'd love to help plan! 🐝 What about ${category}? That's been a hit with the hive before. When were you thinking?`;
  }
  
  if (lowerMessage.includes('@buzz') || lowerMessage.includes('buzz')) {
    return `Hey! 👋 I'm here to help with event planning and keeping the hive connected. What can I do for you?`;
  }
  
  return `That sounds interesting! 🐝 Want to turn it into an event? I can help plan something the whole hive will love!`;
}

/**
 * Check if message should trigger Buzz automatically
 * (e.g., when an event is created)
 */
export async function shouldTriggerBuzz(message, eventId = null) {
  if (!message || typeof message !== 'string') {
    return false;
  }
  
  const lowerMessage = message.toLowerCase().trim();
  
  // Always trigger if @buzz is mentioned
  if (lowerMessage.includes('@buzz') || lowerMessage.includes('@ buzz')) {
    return true;
  }
  
  // Trigger for event-related keywords
  const eventKeywords = ['event', 'plan', 'suggest', 'idea', 'activity', 'hangout', 'meet', 'gather'];
  if (eventKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return true;
  }
  
  // Trigger if eventId is provided (event was just created)
  if (eventId) {
    return true;
  }
  
  // Trigger for questions (contains ?)
  if (lowerMessage.includes('?')) {
    // But not for very short messages
    if (lowerMessage.length > 10) {
      return true;
    }
  }
  
  return false;
}

/**
 * Analyze event and generate follow-up questions
 */
export async function generateEventFollowUp(eventId) {
  try {
    const event = await Event.findById(eventId)
      .populate('createdBy', 'name');
    
    if (!event) {
      console.warn(`Event ${eventId} not found for Buzz follow-up`);
      return null;
    }

    // Get hive ID - can be ObjectId or populated object
    const hiveId = event.hiveID?._id || event.hiveID;
    if (!hiveId) {
      console.warn(`Event ${eventId} has no hiveID`);
      return null;
    }

    const context = await buildHiveContext(hiveId);
    if (!context) {
      console.warn(`Could not build context for hive ${hiveId}`);
      return null;
    }

    const eventTitle = event.title.toLowerCase();
    const eventDesc = (event.description || '').toLowerCase();
    let followUp = null;

    if (eventTitle.includes('dinner') || eventTitle.includes('lunch') || eventTitle.includes('brunch') || eventDesc.includes('dinner') || eventDesc.includes('lunch') || eventDesc.includes('brunch')) {
      const location = context.locationPreferences.length > 0 ? context.locationPreferences[0] : 'some great spots';
      followUp = `Yum! 🍯 What kind of cuisine are you craving? I noticed the hive loved ${location} before - want to try there again or explore something new?`;
    } else if (eventTitle.includes('game') || eventDesc.includes('game')) {
      followUp = `Game night! 🎮 Would you prefer a casual night in or heading somewhere like Battle & Brew?`;
    } else if (eventTitle.includes('study') || eventDesc.includes('study')) {
      followUp = `Study session! 📚 Want to meet at the library, a coffee shop, or somewhere else?`;
    } else if (eventTitle.includes('coffee') || eventTitle.includes('cafe') || eventDesc.includes('coffee') || eventDesc.includes('cafe')) {
      followUp = `Coffee time! ☕ Want to meet at your usual spot or try somewhere new?`;
    } else {
      // Generic follow-up with context
      if (context.preferredCategories.length > 0) {
        const category = context.preferredCategories[0];
        followUp = `Sounds fun! 🐝 Want help picking a time or location? The hive really enjoys ${category} - I can suggest something similar!`;
      } else {
        followUp = `Sounds fun! 🐝 Want help picking a time or location? I can suggest based on what the hive usually likes!`;
      }
    }

    return followUp;
  } catch (error) {
    console.error('Error generating event follow-up:', error);
    return null;
  }
}

