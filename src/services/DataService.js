import * as XLSX from 'xlsx';

class DataService {
  constructor() {
    this.data = null;
  }

  // Extract and clean location data for mapping
  getLocationStats(tweets) {
    const counts = {};
    tweets.forEach(tweet => {
      if (tweet.location && tweet.location.trim() && tweet.location.trim().toLowerCase() !== 'unknown') {
        let loc = tweet.location.trim();
        // Optionally, normalize here (e.g., lowercase, remove extra info)
        loc = loc.replace(/\s*,\s*/g, ', '); // Clean up commas
        counts[loc] = (counts[loc] || 0) + 1;
      }
    });
    // Convert to array for chart/map
    const arr = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return arr;
  }

  async loadData(file) {
    try {
      console.log('Reading file...');
      const arrayBuffer = await file.arrayBuffer();
      
      console.log('Creating workbook...');
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      console.log('Getting first sheet...');
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      console.log('Converting sheet to JSON...');
      this.data = XLSX.utils.sheet_to_json(worksheet);
      console.log('Successfully loaded', this.data.length, 'records');
      if (this.data.length > 0) {
        console.log('Raw XLSX Data:', this.data[0]);
        console.log('Available fields:', Object.keys(this.data[0]));
      }
      return this.data;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  generateTopics() {
    if (!this.data) {
      throw new Error('Data must be loaded before generating topics');
    }

    // Map and normalize the data first (sentiment analysis part)
    const Sentiment = require('sentiment');
    const sentiment = new Sentiment();
    const normalizedTweets = this.data.map(rawTweet => {
      const text = rawTweet.Tweet || '';
      const sentimentResult = sentiment.analyze(text);
      let sentimentLabel = 'neutral';
      if (sentimentResult.score > 1) sentimentLabel = 'positive';
      else if (sentimentResult.score < -1) sentimentLabel = 'negative';
      return {
        text,
        user: rawTweet.Author || rawTweet.User || rawTweet.Username || '',
        date: rawTweet.Date ? new Date(rawTweet.Date) : new Date(),
        likes: parseInt(rawTweet.Likes || '0', 10),
        replies: parseInt(rawTweet.Replies || '0', 10),
        views: parseInt(rawTweet.Views || '0', 10),
        followers: parseInt(rawTweet.Followers || rawTweet['User Followers'] || rawTweet['Author Followers'] || rawTweet.followers_count || '0', 10),
        engagement: parseInt(rawTweet.Engagement || '0', 10),
        sentimentScore: sentimentResult.score,
        sentimentLabel,
        location: rawTweet.Location || rawTweet.City || rawTweet.Country || '',
        originalData: rawTweet // Keep original data to access 'Topic Name' and 'Subtopic Name'
      };
    });

    // New topic/subtopic generation logic
    const topicsMap = new Map();

    normalizedTweets.forEach(tweet => {
      const topicName = tweet.originalData['Topic Name'] || 'Uncategorized'; // Default if missing
      const subtopicName = tweet.originalData['Subtopic Name'] || 'General'; // Default if missing

      if (!topicsMap.has(topicName)) {
        topicsMap.set(topicName, {
          tweetCount: 0,
          subtopicsMap: new Map()
        });
      }
      const currentTopic = topicsMap.get(topicName);

      if (!currentTopic.subtopicsMap.has(subtopicName)) {
        currentTopic.subtopicsMap.set(subtopicName, {
          tweetCount: 0,
          tweets: []
        });
      }
      const currentSubtopic = currentTopic.subtopicsMap.get(subtopicName);

      currentSubtopic.tweets.push(tweet);
      currentSubtopic.tweetCount++;
      currentTopic.tweetCount++;
    });

    // Convert topicsMap to the required array structure
    const topicsArray = [];
    for (const [topicName, topicData] of topicsMap.entries()) {
      const subtopicsArray = [];
      for (const [subtopicName, subtopicData] of topicData.subtopicsMap.entries()) {
        subtopicsArray.push({
          name: subtopicName,
          tweetCount: subtopicData.tweetCount,
          tweets: subtopicData.tweets
        });
      }
      // Sort subtopics by tweet count in descending order
      subtopicsArray.sort((a, b) => b.tweetCount - a.tweetCount);

      topicsArray.push({
        name: topicName,
        tweetCount: topicData.tweetCount,
        subtopics: subtopicsArray
      });
    }

    // Sort topics by tweet count in descending order
    topicsArray.sort((a, b) => b.tweetCount - a.tweetCount);

    return topicsArray;
  }
}

export default DataService;
