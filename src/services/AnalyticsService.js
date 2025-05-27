import Sentiment from 'sentiment';
import moment from 'moment';

class AnalyticsService {
  constructor() {
    this.sentiment = new Sentiment();
  }

  // Topic distribution data for charts
  getTopicDistribution(topics) {
    return topics.map(topic => ({
      name: topic.name,
      value: topic.tweetCount,
    }));
  }

  // Get trends over time - group tweets by date
  getTrendsOverTime(topics) {
    const allTweets = [];
    
    // Flatten all tweets from all topics/subtopics
    topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        subtopic.tweets.forEach(tweet => {
          allTweets.push({
            ...tweet,
            topic: topic.name,
            subtopic: subtopic.name,
            dateObj: tweet.date ? moment(tweet.date).toDate() : new Date(),
          });
        });
      });
    });

    const dateFormat = 'YYYY-MM-DD';
    // Group tweets by date
    const tweetsByDate = {};
    allTweets.forEach(tweet => {
      const dateKey = moment(tweet.dateObj).format(dateFormat);
      if (!tweetsByDate[dateKey]) {
        tweetsByDate[dateKey] = { date: dateKey, count: 0, byTopic: {} };
      }
      tweetsByDate[dateKey].count++;
      
      // Count by topic
      if (!tweetsByDate[dateKey].byTopic[tweet.topic]) {
        tweetsByDate[dateKey].byTopic[tweet.topic] = 0;
      }
      tweetsByDate[dateKey].byTopic[tweet.topic]++;
    });

    // Convert to array and sort by date
    const result = Object.values(tweetsByDate).sort((a, b) => 
      moment(a.date, dateFormat).diff(moment(b.date, dateFormat)));
    
    return result;
  }

  // Get subtopic heatmap data
  getSubtopicHeatmap(topics) {
    const heatmapData = [];
    
    topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        heatmapData.push({
          topic: topic.name,
          subtopic: subtopic.name,
          value: subtopic.tweetCount,
        });
      });
    });
    
    return heatmapData;
  }

  // Get sentiment analysis summary
  getSentimentAnalysis(topics) {
    const sentiments = { positive: 0, neutral: 0, negative: 0 };
    const topicSentiments = {};
    let totalTweets = 0;
    
    topics.forEach(topic => {
      topicSentiments[topic.name] = { positive: 0, neutral: 0, negative: 0 };
      
      topic.subtopics.forEach(subtopic => {
        subtopic.tweets.forEach(tweet => {
          const analysis = this.sentiment.analyze(tweet.Tweet);
          const score = analysis.score;
          let sentiment;
          
          if (score > 0) {
            sentiment = 'positive';
          } else if (score < 0) {
            sentiment = 'negative';
          } else {
            sentiment = 'neutral';
          }
          
          sentiments[sentiment]++;
          topicSentiments[topic.name][sentiment]++;
          totalTweets++;
        });
      });
    });
    
    return { overall: sentiments, byTopic: topicSentiments, total: totalTweets };
  }

  // Get top keywords per topic
  getTopKeywords(topics) {
    const topicKeywords = {};
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
      'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
      'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'i', 'me', 'my',
      'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
      'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they',
      'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
      'those', 'am', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'should',
      'could', 'ought', 'i\'m', 'you\'re', 'he\'s', 'she\'s', 'it\'s', 'we\'re', 'they\'re', 'i\'ve',
      'you\'ve', 'we\'ve', 'they\'ve', 'i\'d', 'you\'d', 'he\'d', 'she\'d', 'we\'d', 'they\'d', 'i\'ll',
      'you\'ll', 'he\'ll', 'she\'ll', 'we\'ll', 'they\'ll', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t',
      'hasn\'t', 'haven\'t', 'hadn\'t', 'doesn\'t', 'don\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'shan\'t',
      'shouldn\'t', 'can\'t', 'cannot', 'couldn\'t', 'mustn\'t', 'let\'s', 'that\'s', 'who\'s', 'what\'s',
      'here\'s', 'there\'s', 'when\'s', 'where\'s', 'why\'s', 'how\'s', 'next'
    ]);
    
    topics.forEach(topic => {
      const keywordCount = {};
      let totalWords = 0;
      
      topic.subtopics.forEach(subtopic => {
        subtopic.tweets.forEach(tweet => {
          // Extract words from tweet text
          const words = tweet.Tweet.toLowerCase()
            .replace(/[^\w\s#@]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
          
          // Count hashtags separately
          const hashtags = tweet.Tweet.match(/#[\w]+/g) || [];
          
          // Count words
          words.forEach(word => {
            if (!keywordCount[word]) keywordCount[word] = 0;
            keywordCount[word]++;
            totalWords++;
          });
          
          // Count hashtags (with higher weight)
          hashtags.forEach(tag => {
            const cleanTag = tag.toLowerCase();
            if (!keywordCount[cleanTag]) keywordCount[cleanTag] = 0;
            keywordCount[cleanTag] += 2; // Give hashtags more weight
            totalWords += 2;
          });
        });
      });
      
      // Convert to array format for word cloud
      const keywords = Object.keys(keywordCount)
        .map(word => ({
          text: word,
          value: keywordCount[word],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50); // Get top 50 keywords
      
      topicKeywords[topic.name] = keywords;
    });
    
    return topicKeywords;
  }

  // Get critical complaints (most engagement)
  getCriticalComplaints(topics) {
    const allTweets = [];
    
    topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        subtopic.tweets.forEach(tweet => {
          allTweets.push({
            ...tweet,
            topic: topic.name,
            subtopic: subtopic.name,
            engagement: (tweet.Likes || 0) + (tweet.Replies || 0),
          });
        });
      });
    });
    
    // Sort by engagement and get top complaints
    return allTweets
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10); // Get top 10 most engaging tweets
  }

  // Get influential users
  getInfluentialUsers(topics) {
    const userMap = {};
    
    topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        subtopic.tweets.forEach(tweet => {
          const user = tweet.Author;
          if (!userMap[user]) {
            userMap[user] = {
              username: user,
              tweetCount: 0,
              totalLikes: 0,
              totalRetweets: 0,
              engagement: 0,
              topics: new Set(),
            };
          }
          
          userMap[user].tweetCount++;
          userMap[user].totalLikes += (tweet.Likes || 0);
          userMap[user].totalViews += (tweet.Views || 0);
          userMap[user].engagement += (tweet.Likes || 0) + (tweet.Replies || 0);
          userMap[user].topics.add(topic.name);
        });
      });
    });
    
    // Convert to array, process topics set, and sort by engagement
    const influentialUsers = Object.values(userMap)
      .map(user => ({
        ...user,
        topics: Array.from(user.topics),
        avgEngagement: user.engagement / user.tweetCount,
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10); // Get top 10 most influential users
    
    return influentialUsers;
  }

  // Get recommendations based on issues
  getRecommendations(topics, sentimentAnalysis) {
    // Find most common topics with negative sentiment
    const topicIssues = Object.entries(sentimentAnalysis.byTopic)
      .map(([topic, sentiments]) => ({
        topic,
        negativeCount: sentiments.negative,
        totalCount: sentiments.positive + sentiments.neutral + sentiments.negative,
        percentage: sentiments.negative / (sentiments.positive + sentiments.neutral + sentiments.negative),
      }))
      .filter(issue => issue.totalCount > 0) // Only consider topics with tweets
      .sort((a, b) => b.percentage - a.percentage);
    
    const top3Issues = topicIssues.slice(0, 3);
    
    // Generate recommendations
    const recommendations = top3Issues.map(issue => {
      const topicObj = topics.find(t => t.name === issue.topic);
      let recommendation = '';
      
      switch (issue.topic.toLowerCase()) {
        case 'delivery':
        case 'shipping':
        case 'delivery issues':
        case 'late delivery':
          recommendation = `Improve delivery times and tracking. ${issue.negativeCount} negative tweets about delivery suggest logistics issues.`;
          break;
        case 'quality':
        case 'product quality':
        case 'poor quality':
          recommendation = `Address product quality concerns. ${issue.negativeCount} negative tweets about quality suggest manufacturing improvements needed.`;
          break;
        case 'customer service':
        case 'support':
        case 'service':
          recommendation = `Enhance customer service response times. ${issue.negativeCount} negative tweets about service indicate need for improved support processes.`;
          break;
        case 'returns':
        case 'refunds':
        case 'return policy':
          recommendation = `Simplify return/refund process. ${issue.negativeCount} negative tweets about returns suggest policy or process friction.`;
          break;
        case 'price':
        case 'costs':
        case 'expensive':
          recommendation = `Reevaluate pricing strategy or better communicate value proposition. ${issue.negativeCount} negative tweets about price indicate customer value perception issues.`;
          break;
        default:
          // Find the most common subtopic
          const mostCommonSubtopic = topicObj ? 
            topicObj.subtopics.sort((a, b) => b.tweetCount - a.tweetCount)[0]?.name : 'general issues';
            
          recommendation = `Address ${issue.topic} issues, particularly around ${mostCommonSubtopic}. ${issue.negativeCount} negative tweets indicate customer dissatisfaction.`;
      }
      
      return {
        topic: issue.topic,
        negativeCount: issue.negativeCount,
        percentage: issue.percentage,
        recommendation
      };
    });
    
    return recommendations;
  }
}

export default new AnalyticsService();
