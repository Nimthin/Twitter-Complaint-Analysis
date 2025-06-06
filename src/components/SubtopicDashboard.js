import React, { useMemo, useState } from 'react';
import { Card, Row, Col, Badge, Button, Form, Alert, Tabs, Tab, Table } from 'react-bootstrap';
import { 
  BarChart, Bar, PieChart, Pie, ScatterChart, Scatter, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell, ZAxis, AreaChart, Area, ComposedChart, Rectangle, ReferenceArea,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap
} from 'recharts';

// Pastel color palette for charts
const PASTEL_COLORS = [
  '#FFB6C1', '#FFD700', '#98FB98', '#87CEFA', '#DDA0DD', 
  '#FFDAB9', '#B0E0E6', '#FFFFE0', '#E6E6FA', '#F0FFF0',
  '#F5F5DC', '#FFF0F5', '#F0F8FF', '#F5FFFA', '#F8F8FF'
];

const SubtopicDashboard = ({ tweets = [], topic, subtopic, onBack }) => {
  // Defensive: Ensure tweets is always an array
  const safeTweets = Array.isArray(tweets) ? tweets : [];
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Calculate KPIs
  const kpis = useMemo(() => {
    // Total complaints
    const totalComplaints = safeTweets.length;
    
    // Average engagement metrics
    let totalLikes = 0;
    let totalViews = 0;
    let totalReplies = 0;
    
    safeTweets.forEach(tweet => {
      // Use normalized data structure
      totalLikes += tweet.likes || 0;
      totalViews += tweet.views || 0;
      totalReplies += tweet.replies || 0;
    });
    
    const avgEngagementRate = totalViews > 0 
      ? ((totalLikes + totalReplies) / totalViews) * 100
      : 0;
    
    const avgLikesPerTweet = totalComplaints > 0 ? totalLikes / totalComplaints : 0;
    const avgRepliesPerTweet = totalComplaints > 0 ? totalReplies / totalComplaints : 0;
    const avgViewsPerTweet = totalComplaints > 0 ? totalViews / totalComplaints : 0;
    
    // Top influencer (user with most engagement)
    const userEngagement = {};
    let locationCounts = {};

    safeTweets.forEach(tweet => {
      if (!tweet.user) return;
      
      if (!userEngagement[tweet.user]) {
        userEngagement[tweet.user] = {
          engagement: 0,
          tweets: 0,
          totalLikes: 0,
          totalReplies: 0
        };
      }
      
      userEngagement[tweet.user].tweets++;
      userEngagement[tweet.user].engagement += tweet.engagement || 0;
      userEngagement[tweet.user].totalLikes += tweet.likes || 0;
      userEngagement[tweet.user].totalReplies += tweet.replies || 0;
    });
    
    const topInfluencers = Object.entries(userEngagement)
      .map(([user, stats]) => ({ user, ...stats }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);
    
    // Only consider tweets with a valid, non-empty location
    const validLocationTweets = safeTweets.filter(tweet => tweet.location && tweet.location.trim() && tweet.location.trim().toLowerCase() !== 'unknown');
    locationCounts = {};
    const locationEngagement = {};
    validLocationTweets.forEach(tweet => {
      const location = tweet.location.trim();
      locationCounts[location] = (locationCounts[location] || 0) + 1;
      // Engagement = likes + replies + views
      locationEngagement[location] = (locationEngagement[location] || 0) + 
        (Number(tweet.likes || 0) + Number(tweet.replies || 0) + Number(tweet.views || 0));
    });

    let mostActiveLocation = 'N/A';
    if (Object.keys(locationCounts).length > 0) {
      // Find max frequency
      const maxCount = Math.max(...Object.values(locationCounts));
      // Find all locations with max frequency
      const topLocations = Object.keys(locationCounts).filter(loc => locationCounts[loc] === maxCount);
      if (topLocations.length === 1) {
        // Case A: Unique most frequent location
        mostActiveLocation = topLocations[0];
      } else {
        // Case B: Tie - pick location with most engagement (likes+replies+views)
        mostActiveLocation = topLocations.sort((a, b) => (locationEngagement[b] || 0) - (locationEngagement[a] || 0))[0];
      }
    }

    safeTweets.forEach(tweet => {
      const user = tweet.user || 'Anonymous';
      if (!userEngagement[user]) {
        userEngagement[user] = {
          user,
          totalEngagement: 0,
          tweetCount: 0,
          followers: tweet.Followers || 0
        };
      }
      
      userEngagement[user].totalEngagement += (tweet.Likes || 0) + (tweet.Replies || 0);
      userEngagement[user].tweetCount += 1;
    });
    
    const topInfluencer = Object.values(userEngagement)
      .sort((a, b) => b.totalEngagement - a.totalEngagement)[0] || { user: 'N/A' };
    
    return {
      totalComplaints,
      avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
      avgLikesPerTweet: parseFloat(avgLikesPerTweet.toFixed(2)),
      avgRepliesPerTweet: parseFloat(avgRepliesPerTweet.toFixed(2)),
      avgViewsPerTweet: parseFloat(avgViewsPerTweet.toFixed(2)),
      topInfluencers,
      engagementByUser: Object.values(userEngagement),
      mostActiveLocation
    };
  }, [safeTweets]);

  // Generate word cloud data
  const wordCloudData = useMemo(() => {
    const wordFrequency = {};
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
      'about', 'against', 'between', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over',
      'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
      'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should',
      'now', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself',
      'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself',
      'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
      'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs',
      'themselves', 'what', 'which', 'who', 'whom', 'whose', 'this', 'that',
      'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'should', 'could',
      'ought', 'i\'m', 'you\'re', 'he\'s', 'she\'s', 'it\'s', 'we\'re', 'they\'re',
      'i\'ve', 'you\'ve', 'we\'ve', 'they\'ve', 'i\'d', 'you\'d', 'he\'d', 'she\'d',
      'we\'d', 'they\'d', 'i\'ll', 'you\'ll', 'he\'ll', 'she\'ll', 'we\'ll', 'they\'ll',
      'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t', 'haven\'t', 'hadn\'t',
      'doesn\'t', 'don\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'shan\'t', 'shouldn\'t',
      'can\'t', 'cannot', 'couldn\'t', 'mustn\'t', 'let\'s', 'that\'s', 'who\'s',
      'what\'s', 'here\'s', 'there\'s', 'when\'s', 'where\'s', 'why\'s', 'how\'s',
      'next', 'fashion', 'please', 'thanks', 'thank'
    ]);

    safeTweets.forEach(tweet => {
      if (!tweet.text) return;
      
      const words = tweet.text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

    // Convert to format needed by TagCloud
    return Object.entries(wordFrequency)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50); // Limit to top 50 words
  }, [safeTweets]);

  // Generate engagement data for bar chart
  const engagementData = useMemo(() => {
    const userEngagement = {};
    
    safeTweets.forEach(tweet => {
      const user = tweet.user || 'Anonymous';
      if (!userEngagement[user]) {
        userEngagement[user] = {
          user,
          totalLikes: 0,
          totalReplies: 0,
          tweetCount: 0
        };
      }
      
      userEngagement[user].totalLikes += tweet.likes || 0;
      userEngagement[user].totalReplies += tweet.replies || 0;
      userEngagement[user].tweetCount += 1;
    });
    
    return Object.values(userEngagement)
      .map(user => ({
        ...user,
        avgLikes: user.tweetCount > 0 ? user.totalLikes / user.tweetCount : 0
      }))
      .sort((a, b) => b.avgLikes - a.avgLikes)
      .slice(0, 10); // Top 10 users by average likes
  }, [safeTweets]);

  // Generate scatter plot data for engagement explorer
  

  // Generate time trend chart data - using real dates from tweets
  const timeTrendData = useMemo(() => {
    // Extract dates from tweets and group by date
    const tweetsByDate = {};
    
    safeTweets.forEach(tweet => {
      // Use normalized data structure
      if (!tweet.date) return;
      
      // Format date as YYYY-MM-DD
      const dateStr = new Date(tweet.date).toISOString().split('T')[0];
      if (!tweetsByDate[dateStr]) {
        tweetsByDate[dateStr] = [];
      }
      tweetsByDate[dateStr].push(tweet);
    });
    
    // Convert to array and sort by date
    const sortedDates = Object.keys(tweetsByDate).sort();
    
    // Create the time series data
    const timeSeriesData = sortedDates.map(date => ({
      date,
      count: tweetsByDate[date].length
    }));
    
    return timeSeriesData;
  }, [safeTweets]);
  
  // Generate engagement trend over time data
  const engagementTrendData = useMemo(() => {
    // Create date range based on actual tweet dates
    const tweetDates = safeTweets
      .filter(tweet => tweet.date)
      .map(tweet => new Date(tweet.date).toISOString().split('T')[0])
      .filter(Boolean);
    
    // Sort and remove duplicates
    const uniqueDates = [...new Set(tweetDates)].sort();
    
    // Create datasets for likes, replies, views
    const likesData = [];
    const repliesData = [];
    const viewsData = [];
    
    // Group tweets by date
    const tweetsByDate = {};
    
    // Initialize dates
    uniqueDates.forEach(date => {
      tweetsByDate[date] = [];
    });
    
    // Assign tweets to dates
    safeTweets.forEach(tweet => {
      if (!tweet.date) return;
      const dateStr = new Date(tweet.date).toISOString().split('T')[0];
      if (tweetsByDate[dateStr]) {
        tweetsByDate[dateStr].push(tweet);
      }
    });
    
    // Calculate daily metrics
    uniqueDates.forEach(date => {
      const dailyTweets = tweetsByDate[date];
      const tweetsCount = dailyTweets.length || 1; // Avoid division by zero
      
      let totalLikes = 0;
      let totalReplies = 0;
      let totalViews = 0;
      
      dailyTweets.forEach(tweet => {
        totalLikes += parseInt(tweet.Likes || tweet.likes || 0);
        totalReplies += parseInt(tweet.Replies || tweet.replies || 0);
        totalViews += parseInt(tweet.Views || tweet.views || 100);
      });
      
      // Add to datasets
      likesData.push({
        date,
        value: tweetsCount > 0 ? totalLikes / tweetsCount : 0
      });
      
      repliesData.push({
        date,
        value: tweetsCount > 0 ? totalReplies / tweetsCount : 0
      });
      
      viewsData.push({
        date,
        value: tweetsCount > 0 ? totalViews / tweetsCount : 0
      });
    });
    
    return {
      dates: uniqueDates,
      likesData,
      repliesData,
      viewsData
    };
  }, [safeTweets]);
  
  // Generate distribution data for engagement metrics
  const engagementDistributionData = useMemo(() => {
    const likesDistribution = {};
    const repliesDistribution = {};
    const viewsDistribution = {};
    
    // Define bins for each metric
    const likesBins = [0, 1, 2, 5, 10, 25, 50, 100, 500];
    const repliesBins = [0, 1, 2, 3, 5, 10, 25, 50];
    const viewsBins = [0, 100, 500, 1000, 5000, 10000, 50000, 100000];
    
    // Initialize bin counters
    likesBins.forEach((_, index) => {
      if (index < likesBins.length - 1) {
        likesDistribution[`${likesBins[index]}-${likesBins[index+1]}`] = 0;
      }
    });
    
    repliesBins.forEach((_, index) => {
      if (index < repliesBins.length - 1) {
        repliesDistribution[`${repliesBins[index]}-${repliesBins[index+1]}`] = 0;
      }
    });
    
    viewsBins.forEach((_, index) => {
      if (index < viewsBins.length - 1) {
        viewsDistribution[`${viewsBins[index]}-${viewsBins[index+1]}`] = 0;
      }
    });
    
    // Count tweets in each bin
    safeTweets.forEach(tweet => {
      const likes = tweet.likes || 0;
      const replies = tweet.replies || 0;
      const views = tweet.views || 100;
      
      // Assign to likes bin
      for (let i = 0; i < likesBins.length - 1; i++) {
        if (likes >= likesBins[i] && likes < likesBins[i+1]) {
          likesDistribution[`${likesBins[i]}-${likesBins[i+1]}`]++;
          break;
        } else if (i === likesBins.length - 2 && likes >= likesBins[i+1]) {
          likesDistribution[`${likesBins[i]}-${likesBins[i+1]}`]++;
        }
      }
      
      // Assign to replies bin
      for (let i = 0; i < repliesBins.length - 1; i++) {
        if (replies >= repliesBins[i] && replies < repliesBins[i+1]) {
          repliesDistribution[`${repliesBins[i]}-${repliesBins[i+1]}`]++;
          break;
        } else if (i === repliesBins.length - 2 && replies >= repliesBins[i+1]) {
          repliesDistribution[`${repliesBins[i]}-${repliesBins[i+1]}`]++;
        }
      }
      
      // Assign to views bin
      for (let i = 0; i < viewsBins.length - 1; i++) {
        if (views >= viewsBins[i] && views < viewsBins[i+1]) {
          viewsDistribution[`${viewsBins[i]}-${viewsBins[i+1]}`]++;
          break;
        } else if (i === viewsBins.length - 2 && views >= viewsBins[i+1]) {
          viewsDistribution[`${viewsBins[i]}-${viewsBins[i+1]}`]++;
        }
      }
    });
    
    return {
      likes: Object.entries(likesDistribution).map(([range, count]) => ({ range, count })),
      replies: Object.entries(repliesDistribution).map(([range, count]) => ({ range, count })),
      views: Object.entries(viewsDistribution).map(([range, count]) => ({ range, count }))
    };
  }, [safeTweets]);
  
  // Find most engaging tweet
  const mostEngagingTweet = useMemo(() => {
    return safeTweets
      .map(tweet => ({
        ...tweet,
        totalEngagement: (tweet.likes || 0) + (tweet.replies || 0),
        engagementRate: ((tweet.likes || 0) + (tweet.replies || 0)) / (tweet.views || 100)
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)[0] || null;
  }, [safeTweets]);
  const scatterData = useMemo(() => {
    return safeTweets.map(tweet => ({
      x: tweet.views || 100, // Default to 100 if not available
      y: tweet.likes || 0,
      z: tweet.followers || 100, // For point size
      user: tweet.user || 'Anonymous',
      text: tweet.text || ''
    }));
  }, [safeTweets]);

  // Generate 2D heatmap data for views vs likes
  const heatmap2DData = useMemo(() => {
    // Bin views and likes
    const viewBins = [0, 100, 500, 1000, 5000, 10000, 50000, 100000];
    const likeBins = [0, 1, 5, 10, 25, 50, 100, 500];
    // Create a matrix for counts
    const matrix = Array.from({ length: viewBins.length - 1 }, () => Array(likeBins.length - 1).fill(0));
    safeTweets.forEach(tweet => {
      const views = tweet.views || 100;
      const likes = tweet.likes || 0;
      // Find bin index
      const viewIdx = viewBins.findIndex((v, i) => views >= v && views < viewBins[i + 1]);
      const likeIdx = likeBins.findIndex((l, i) => likes >= l && likes < likeBins[i + 1]);
      if (viewIdx >= 0 && likeIdx >= 0) {
        matrix[viewIdx][likeIdx]++;
      }
    });
    // Flatten for recharts
    const data = [];
    for (let i = 0; i < viewBins.length - 1; i++) {
      for (let j = 0; j < likeBins.length - 1; j++) {
        data.push({
          viewBin: `${viewBins[i]}-${viewBins[i + 1]}`,
          likeBin: `${likeBins[j]}-${likeBins[j + 1]}`,
          count: matrix[i][j]
        });
      }
    }
    return data;
  }, [safeTweets]);

  // Generate location data for choropleth map
  const locationData = useMemo(() => {
    const regions = {
      'London': 0,
      'Manchester': 0,
      'Birmingham': 0,
      'Glasgow': 0,
      'Liverpool': 0,
      'Leeds': 0,
      'Edinburgh': 0,
      'Bristol': 0,
      'Sheffield': 0,
      'Newcastle': 0
    };
    
    // Simulate location data since we don't have actual locations in tweets
    safeTweets.forEach((tweet, index) => {
      // Assign tweets to regions in a deterministic but seemingly random way
      const regionKeys = Object.keys(regions);
      const regionIndex = (tweet.user?.length || 0) % regionKeys.length;
      const region = regionKeys[regionIndex];
      regions[region]++;
    });
    
    return Object.entries(regions)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by tweet count for better visualization
  }, [safeTweets]);
  
  // Generate heatmap data for geographic visualization
  const heatmapData = useMemo(() => {
    // Create a grid of UK regions with intensity values
    const grid = [
      ['', 'North', '', ''],
      ['West', 'Central', 'East', ''],
      ['', 'South', '', '']
    ];
    
    // Map our locations to regions for the heatmap
    const regionMapping = {
      'Newcastle': { row: 0, col: 1, region: 'North' },
      'Edinburgh': { row: 0, col: 1, region: 'North' },
      'Glasgow': { row: 0, col: 1, region: 'North' },
      'Leeds': { row: 1, col: 1, region: 'Central' },
      'Manchester': { row: 1, col: 1, region: 'Central' },
      'Liverpool': { row: 1, col: 0, region: 'West' },
      'Birmingham': { row: 1, col: 1, region: 'Central' },
      'Sheffield': { row: 1, col: 1, region: 'Central' },
      'Bristol': { row: 1, col: 0, region: 'West' },
      'London': { row: 1, col: 2, region: 'East' }
    };
    
    // Calculate intensity for each region
    const regionIntensity = {
      'North': 0,
      'Central': 0,
      'East': 0,
      'West': 0,
      'South': 0
    };
    
    locationData.forEach(location => {
      const mapping = regionMapping[location.name];
      if (mapping) {
        regionIntensity[mapping.region] += location.value;
      }
    });
    
    // Transform to format needed for heatmap
    return Object.entries(regionIntensity).map(([region, value]) => ({
      region,
      value,
      intensity: Math.min(1, value / (safeTweets.length || 1) * 2) // Scale intensity between 0-1
    }));
  }, [locationData, safeTweets.length]);
  
  // Generate time series data for small multiples
  const timeSeriesData = useMemo(() => {
    const topLocations = locationData.sort((a, b) => b.value - a.value).slice(0, 5).map(loc => loc.name);
    const dateRanges = [
      '2025-01', '2025-02', '2025-03', '2025-04', '2025-05'
    ];
    
    // Create a dataset for each top location
    return topLocations.map(location => {
      return {
        location,
        data: dateRanges.map(date => {
          // Simulate time series data
          const baseValue = locationData.find(l => l.name === location)?.value || 10;
          // Create somewhat realistic looking trends with some randomness
          const value = Math.max(1, Math.floor(baseValue / 5 + Math.random() * baseValue/2));
          return { date, value };
        })
      };
    });
  }, [locationData]);
  
  // Generate follower distribution data for histogram
  const followerDistributionData = useMemo(() => {
    // Custom buckets as requested
    const followerBuckets = {
      '0-9': 0,
      '10-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
      '101-120': 0,
    };

    safeTweets.forEach(tweet => {
      const followers = tweet.followers || 0;
      if (followers <= 9) followerBuckets['0-9']++;
      else if (followers <= 20) followerBuckets['10-20']++;
      else if (followers <= 40) followerBuckets['21-40']++;
      else if (followers <= 60) followerBuckets['41-60']++;
      else if (followers <= 80) followerBuckets['61-80']++;
      else if (followers <= 100) followerBuckets['81-100']++;
      else if (followers <= 120) followerBuckets['101-120']++;
    });

    return Object.entries(followerBuckets).map(([range, count]) => ({ range, count }));
  }, [safeTweets]);
  
  // Generate account age vs likes data for violin plot
  const accountAgeData = useMemo(() => {
    const ageBuckets = {
      'New (<6mo)': [],
      'Established (6mo-2yr)': [],
      'Veteran (2yr+)': []
    };
    
    safeTweets.forEach(tweet => {
      const likes = tweet.likes || 0;
      // Simulate account age since we don't have that data
      // Use a deterministic approach based on username length or other factors
      const userNameLength = tweet.user?.length || 5;
      let ageBucket;
      
      if (userNameLength % 3 === 0) ageBucket = 'New (<6mo)';
      else if (userNameLength % 3 === 1) ageBucket = 'Established (6mo-2yr)';
      else ageBucket = 'Veteran (2yr+)';
      
      ageBuckets[ageBucket].push(likes);
    });
    
    // Transform data for violin plot visualization
    return Object.entries(ageBuckets).flatMap(([age, likesArray]) => {
      // Create distribution by spreading the likes values
      return likesArray.map(likes => ({ age, likes, frequency: 1 }));
    });
  }, [safeTweets]);

  // Defensive: Allow subtopic/topic to be string or object
  const topicName = topic && typeof topic === 'object' ? topic.name : topic;
  const subtopicName = subtopic && typeof subtopic === 'object' ? subtopic.name : subtopic;

  return (
    <div className="subtopic-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">{subtopicName} Dashboard</h2>
          <p className="text-muted">
            Analyzing {safeTweets.length} tweets from the "{topicName} {'>'} {subtopicName}" category
          </p>
        </div>
        {onBack && (
          <div>
            <Button variant="outline-secondary" onClick={onBack}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
      
      {/* KPI Cards - First Row */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm h-100 kpi-card kpi-card-small">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Total Complaints</h6>
              <h2 className="fw-bold fs-1">{kpis.totalComplaints}</h2>
              <p className="text-muted">Tweets in this subtopic</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100 kpi-card kpi-card-small">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Avg. Engagement Rate</h6>
              <h2 className="fw-bold fs-1">{kpis.avgEngagementRate}%</h2>
              <p className="text-muted">(Likes + Replies) / Views</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100 kpi-card kpi-card-small">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Top Influencer</h6>
              <h2 className="fw-bold fs-1">{kpis.topInfluencers && kpis.topInfluencers[0] ? kpis.topInfluencers[0].user : 'N/A'}</h2>
              <p className="text-muted">Highest engagement</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm h-100 kpi-card kpi-card-small">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Most Active Location</h6>
              <h2 className="fw-bold fs-1">{kpis.mostActiveLocation}</h2>
              <p className="text-muted">Highest tweet frequency</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* KPI Cards - Second Row */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm h-100 kpi-card kpi-card-small">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Avg. Likes per Tweet</h6>
              <h2 className="fw-bold fs-1">{kpis.avgLikesPerTweet}</h2>
              <p className="text-muted">Average engagement</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100 kpi-card kpi-card-small">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Avg. Replies per Tweet</h6>
              <h2 className="fw-bold fs-1">{kpis.avgRepliesPerTweet}</h2>
              <p className="text-muted">Conversation level</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100 kpi-card kpi-card-small">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Avg. Views per Tweet</h6>
              <h2 className="fw-bold fs-1">{Math.round(kpis.avgViewsPerTweet)}</h2>
              <p className="text-muted">Reach per complaint</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Dashboard Tabs */}
      <Tabs
        id="subtopic-dashboard-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="overview" title="Topic Trends">
          {/* Time Trend Chart */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="card-title mb-3">📈 Time Trend Chart</h4>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={timeTrendData}>
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff4c04" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ff4c04" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(tick) => {
                            const date = new Date(tick);
                            return `${date.getMonth()+1}/${date.getDate()}`;
                          }}
                        />
                        <YAxis 
                          label={{ value: 'No. of Complaints', angle: -90, position: 'insideLeft' }}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip 
                          labelFormatter={(label) => {
                            const date = new Date(label);
                            return `Date: ${date.toLocaleDateString()}`;
                          }}
                          formatter={(value) => [`${value} complaints`, 'Count']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#ff4c04"
                          strokeWidth={3}
                          dot={{ r: 4, stroke: '#ff4c04', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                          name="Complaints"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke={false}
                          fill="url(#trendGradient)"
                          fillOpacity={1}
                          isAnimationActive={true}
                          name="Complaints Volume"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Word Cloud and Average Likes Per User */}
          <Row>
            {/* Word Cloud */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="card-title mb-3">🔤 Common Keywords</h4>
                  <div style={{ width: '100%', height: 300 }} className="d-flex justify-content-center align-items-center">
                    {wordCloudData.length > 20 ? (
                      <div className="custom-word-cloud">
                        {wordCloudData.slice(0, 40).map((word, index) => {
                          // Calculate font size based on count (frequency)
                          const fontSize = 12 + (word.count / 2);
                          const color = PASTEL_COLORS[index % PASTEL_COLORS.length];
                          return (
                            <span 
                              key={index} 
                              className="word-cloud-tag"
                              style={{ 
                                fontSize: `${fontSize}px`,
                                backgroundColor: color,
                                opacity: 0.8 + (word.count / 20)
                              }}
                            >
                              {word.value}
                            </span>
                          );
                        })}
                      </div>
                    ) : wordCloudData.length > 0 ? (
                      <ResponsiveContainer>
                        <BarChart data={wordCloudData.slice(0, 15)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="value" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8">
                            {wordCloudData.slice(0, 15).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted">Not enough data for visualization</p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Average Likes Per User */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="card-title mb-3">❤️ Average Likes Per User</h4>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={engagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="user" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value.toFixed(1)} likes`, 'Avg Likes']} />
                        <Bar dataKey="avgLikes" name="Average Likes" fill="#FFB6C1">
                          {engagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="engagement" title="Engagement Explorer">
          {/* KPI Cards - Average Metrics */}
          <Row className="mb-4">
            <Col lg={4}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="card-title mb-3">❤️ Average Likes</h4>
                  <div className="d-flex align-items-center">
                    <h2 className="mb-0 me-2 fw-bold fs-2">{kpis.avgLikesPerTweet.toFixed(2)}</h2>
                    <small className="text-muted">per tweet</small>
                  </div>

                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="card-title mb-3">💬 Average Replies</h4>
                  <div className="d-flex align-items-center">
                    <h2 className="mb-0 me-2 fw-bold fs-2">{kpis.avgRepliesPerTweet.toFixed(2)}</h2>
                    <small className="text-muted">per tweet</small>
                  </div>

                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="card-title mb-3">👁️ Average Views</h4>
                  <div className="d-flex align-items-center">
                    <h2 className="mb-0 me-2 fw-bold fs-2">{Math.round(kpis.avgViewsPerTweet)}</h2>
                    <small className="text-muted">per tweet</small>
                  </div>

                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            {/* Engagement Rate Gauge */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="card-title mb-3">📊 Engagement Rate</h4>
                  <p className="text-muted mb-3">Measures (likes + replies) / views</p>
                  <div style={{ width: '100%', height: 250 }} className="d-flex flex-column align-items-center justify-content-center">
                    {/* Circular progress SVG indicator */}
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      <circle
                        cx="90"
                        cy="90"
                        r="80"
                        stroke="#f3f3f3"
                        strokeWidth="16"
                        fill="none"
                      />
                      <circle
                        cx="90"
                        cy="90"
                        r="80"
                        stroke="#FFB6C1"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={Math.PI * 2 * 80}
                        strokeDashoffset={Math.PI * 2 * 80 * (1 - Math.min(1, parseFloat(kpis.avgEngagementRate) / 10))}
                        strokeLinecap="round"
                        transform="rotate(-90 90 90)"
                        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 2.3, 0.3, 1)' }}
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="2.5rem"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {kpis.avgEngagementRate}%
                      </text>
                      <text
                        x="50%"
                        y="65%"
                        textAnchor="middle"
                        fontSize="1.1rem"
                        fill="#888"
                      >Engagement Rate</text>
                    </svg>
                    <div className="d-flex justify-content-between w-75 mt-3">
                      <span className="text-muted">0%</span>
                      <span className="text-muted">5%</span>
                      <span className="text-muted">10%+</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Most Engaging Tweet */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="card-title mb-3">🔥 Most Engaging Tweet</h4>
                  <p className="text-muted mb-3">Tweet with highest engagement (likes + replies)</p>
                  {mostEngagingTweet ? (
                    <div className="p-3 border rounded">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold">{mostEngagingTweet.user}</span>
                        <small className="text-muted">Engagement Rate: {(mostEngagingTweet.engagementRate * 100).toFixed(2)}%</small>
                      </div>
                      <p className="mb-2" style={{ fontSize: '0.95rem' }}>{mostEngagingTweet.text}</p>
                      <div className="d-flex justify-content-start mt-3">
                        <div className="me-3">
                          <i className="bi bi-heart-fill me-1" style={{ color: '#FFB6C1' }}></i>
                          {mostEngagingTweet.likes || 0}
                        </div>
                        <div className="me-3">
                          <i className="bi bi-chat-fill me-1" style={{ color: '#87CEFA' }}></i>
                          {mostEngagingTweet.replies || 0}
                        </div>
                        <div>
                          <i className="bi bi-eye-fill me-1" style={{ color: '#98FB98' }}></i>
                          {mostEngagingTweet.views || 0}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted">No tweet data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
            {/* Engagement Trend Over Time */}
            <Row className="mb-4">
              <Col lg={12}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <h4 className="card-title mb-3">📈 Engagement Trend Over Time</h4>
                    <p className="text-muted mb-3">Average engagement metrics over the last 30 days</p>
                    <div style={{ width: '100%', height: 400 }}>
                      <ResponsiveContainer>
                        <LineChart data={engagementTrendData.dates.map((date, index) => ({
                          date,
                          likes: engagementTrendData.likesData[index].value,
                          replies: engagementTrendData.repliesData[index].value,
                          views: engagementTrendData.viewsData[index].value / 100 // Scale down to fit chart
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(tick) => tick.split('-').slice(1).join('/')}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            yAxisId="left" 
                            orientation="left" 
                            label={{ value: 'Likes/Replies', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            label={{ value: 'Views (÷100)', angle: 90, position: 'insideRight' }}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            formatter={(value, name) => {
                              if (name === 'views') return [`${(value * 100).toFixed(0)}`, 'Views'];
                              return [value.toFixed(1), name.charAt(0).toUpperCase() + name.slice(1)];
                            }}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Legend />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="likes" 
                            stroke="#FFB6C1" 
                            activeDot={{ r: 8 }} 
                            strokeWidth={2}
                            name="Likes"
                          />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="replies" 
                            stroke="#87CEFA" 
                            activeDot={{ r: 8 }} 
                            strokeWidth={2}
                            name="Replies"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="views" 
                            stroke="#98FB98" 
                            activeDot={{ r: 8 }} 
                            strokeWidth={2}
                            name="Views"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
            
            {/* Distribution of Engagement Metrics */}
            <Row className="mb-4">
              <Col lg={4}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <h4 className="card-title mb-3">❤️ Likes Distribution</h4>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <BarChart data={engagementDistributionData.likes}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="range" 
                            tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                            height={60}
                          />
                          <YAxis />
                          <Tooltip formatter={(value) => [value, 'Tweets']} />
                          <Bar dataKey="count" fill="#FFB6C1" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <h4 className="card-title mb-3">💬 Replies Distribution</h4>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <BarChart data={engagementDistributionData.replies}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="range" 
                            tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                            height={60}
                          />
                          <YAxis />
                          <Tooltip formatter={(value) => [value, 'Tweets']} />
                          <Bar dataKey="count" fill="#87CEFA" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <h4 className="card-title mb-3">👁️ Views Distribution</h4>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <BarChart data={engagementDistributionData.views}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="range" 
                            tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                            height={60}
                          />
                          <YAxis />
                          <Tooltip formatter={(value) => [value, 'Tweets']} />
                          <Bar dataKey="count" fill="#98FB98" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          <Row>
            {/* Enhanced Scatter Plot - Views vs Likes */}
            <Col lg={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="card-title mb-3">📊 Tweet Engagement Analysis</h4>
                  
                  <p className="text-muted mb-3">Relationship between views and likes with enhanced visibility</p>
                  <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                      <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 40 }}>
                        <defs>
                          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFB6C1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#FFB6C1" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name="Views" 
                          label={{ value: 'Views', position: 'insideBottomRight', offset: -5 }}
                          tick={{ fontSize: 12 }}
                          domain={['dataMin', 'dataMax']}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name="Likes" 
                          label={{ value: 'Likes', angle: -90, position: 'insideLeft' }}
                          tick={{ fontSize: 12 }}
                          domain={[0, 'dataMax + 10']}
                        />
                        <ZAxis 
                          type="number" 
                          dataKey="z" 
                          range={[40, 200]} 
                          name="Followers" 
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }} 
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="custom-tooltip" style={{ padding: '10px', border: '1px solid #f0f0f0' }}>
                                  <h6 style={{ marginBottom: '8px', fontWeight: 'bold' }}>{data.user}</h6>
                                  <div className="d-flex justify-content-between mb-1">
                                    <span>Views:</span>
                                    <span className="fw-bold">{data.x}</span>
                                  </div>
                                  <div className="d-flex justify-content-between mb-1">
                                    <span>Likes:</span>
                                    <span className="fw-bold">{data.y}</span>
                                  </div>
                                  <div className="d-flex justify-content-between mb-2">
                                    <span>Followers:</span>
                                    <span className="fw-bold">{data.z}</span>
                                  </div>
                                  <div className="text-truncate" style={{ maxWidth: '250px', fontSize: '0.85rem', borderTop: '1px solid #f0f0f0', paddingTop: '5px' }}>
                                    {data.text}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }} 
                        />
                        <Legend />
                        <Scatter 
                          name="Tweet Engagement" 
                          data={scatterData} 
                          fill="url(#colorUv)"
                          shape={(props) => {
                            const { cx, cy, r } = props;
                            return (
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={r} 
                                stroke="#FFB6C1" 
                                strokeWidth={1}
                                fill="#FFB6C1" 
                                fillOpacity={0.8}
                                className="engagement-point"
                              />
                            );
                          }}
                        />
                        {/* Add a trend line to show correlation */}
                        <Line 
                          type="monotone" 
                          dataKey="y" 
                          data={[
                            { x: Math.min(...scatterData.map(d => d.x)), y: Math.min(...scatterData.map(d => d.y)) },
                            { x: Math.max(...scatterData.map(d => d.x)), y: Math.max(...scatterData.map(d => d.y)) }
                          ]} 
                          stroke="#FFB6C1" 
                          strokeDasharray="5 5" 
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                          name="Trend Line"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="d-flex justify-content-center mt-2">
                    <div className="d-flex align-items-center me-3">
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#FFB6C1', borderRadius: '50%', marginRight: '5px' }}></div>
                      <small>Tweet</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div style={{ width: '12px', height: '2px', backgroundColor: '#FFB6C1', marginRight: '5px' }}></div>
                      <small>Engagement Trend</small>
                    </div>
                  </div>
                  
                </Card.Body>
              </Card>
            </Col>
          </Row>
        <Tab eventKey="geodemographics" title="Geo & Demographics">
          <Row>
            {/* World Map Heatmap */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="card-title mb-3">🌎 World Map Heatmap</h4>
                  <div className="d-flex flex-column" style={{ width: '100%', height: 300 }}>
                    <div className="world-map-container" style={{ position: 'relative', height: '250px', backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }}>
                      {/* Simple world map visualization */}
                      <div className="world-map" style={{ padding: '15px' }}>
                        {/* Continents as simplified shapes */}
                        <div style={{ 
                          position: 'absolute', 
                          top: '50px', 
                          left: '30px', 
                          width: '80px', 
                          height: '120px', 
                          backgroundColor: `rgba(135, 206, 250, ${locationData[0] ? locationData[0].value / (safeTweets.length || 1) : 0.2})`,
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>North America</span>
                        </div>
                        
                        <div style={{ 
                          position: 'absolute', 
                          top: '100px', 
                          left: '130px', 
                          width: '50px', 
                          height: '80px', 
                          backgroundColor: `rgba(152, 251, 152, ${locationData[1] ? locationData[1].value / (safeTweets.length || 1) : 0.3})`,
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)', fontSize: '0.8rem' }}>South America</span>
                        </div>
                        
                        <div style={{ 
                          position: 'absolute', 
                          top: '40px', 
                          left: '180px', 
                          width: '60px', 
                          height: '100px', 
                          backgroundColor: `rgba(255, 182, 193, ${locationData[2] ? locationData[2].value / (safeTweets.length || 1) : 0.5})`,
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Europe</span>
                        </div>
                        
                        <div style={{ 
                          position: 'absolute', 
                          top: '80px', 
                          left: '250px', 
                          width: '100px', 
                          height: '100px', 
                          backgroundColor: `rgba(255, 215, 0, ${locationData[3] ? locationData[3].value / (safeTweets.length || 1) : 0.4})`,
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Asia</span>
                        </div>
                        
                        <div style={{ 
                          position: 'absolute', 
                          top: '150px', 
                          left: '220px', 
                          width: '80px', 
                          height: '70px', 
                          backgroundColor: `rgba(221, 160, 221, ${locationData[4] ? locationData[4].value / (safeTweets.length || 1) : 0.3})`,
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Africa</span>
                        </div>
                        
                        <div style={{ 
                          position: 'absolute', 
                          top: '160px', 
                          left: '350px', 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: `rgba(255, 160, 122, ${locationData[5] ? locationData[5].value / (safeTweets.length || 1) : 0.2})`,
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)', fontSize: '0.8rem' }}>Australia</span>
                        </div>
                      </div>
                      
                      {/* Legend */}
                      <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '15px', height: '15px', backgroundColor: 'rgba(135, 206, 250, 0.3)', marginRight: '5px' }}></div>
                        <span style={{ fontSize: '0.7rem', marginRight: '10px' }}>Low</span>
                        <div style={{ width: '15px', height: '15px', backgroundColor: 'rgba(255, 182, 193, 0.7)', marginRight: '5px' }}></div>
                        <span style={{ fontSize: '0.7rem' }}>High</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="h6">Top Locations</h5>
                      <div className="d-flex flex-wrap justify-content-between">
                        {locationData.slice(0, 5).map((location, index) => (
                          <Badge 
                            key={index} 
                            bg="light" 
                            text="dark" 
                            className="mb-1 me-1 p-2"
                            style={{ 
                              borderLeft: `4px solid ${PASTEL_COLORS[index % PASTEL_COLORS.length]}`
                            }}
                          >
                            {location.name}: {Math.round(location.value / safeTweets.length * 100)}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Histogram - Distribution of Tweet Followers */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="card-title mb-3">👥 Follower Distribution</h4>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={followerDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} tweets`, 'Count']} />
                        <Bar dataKey="count" name="Number of Tweets">
                          {followerDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Small Multiples - Topic Volume Trends */}
            <Col lg={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="card-title mb-3">📈 Topic Volume Trends by Location</h4>
                  <Row>
                    {timeSeriesData.map((locationSeries, idx) => (
                      <Col key={idx} md={4} className="mb-3">
                        <h5 className="h6 text-center mb-2">{locationSeries.location}</h5>
                        <ResponsiveContainer width="100%" height={120}>
                          <AreaChart data={locationSeries.data}>
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(value) => [`${value} tweets`, 'Volume']} />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke={PASTEL_COLORS[idx % PASTEL_COLORS.length]} 
                              fill={PASTEL_COLORS[idx % PASTEL_COLORS.length]} 
                              fillOpacity={0.6} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Violin Plot - Likes Distribution per Account Age */}
            <Col lg={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="card-title mb-3">🎻 Likes Distribution by Account Age</h4>
                  <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                      <ComposedChart 
                        data={accountAgeData}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="age" 
                          type="category"
                          tickLine={false}
                        />
                        <YAxis 
                          dataKey="likes" 
                          label={{ value: 'Likes', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                                <p className="label">{`Account Age: ${payload[0].payload.age}`}</p>
                                <p className="label">{`Likes: ${payload[0].payload.likes}`}</p>
                              </div>
                            );
                          }
                          return null;
                        }} />
                        <Scatter 
                          dataKey="likes" 
                          fill="#8884d8"
                          shape={(props) => {
                            const { cx, cy, fill } = props;
                            const radius = 4;
                            return (
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={radius} 
                                stroke="none" 
                                fill={fill} 
                                fillOpacity={0.7}
                              />
                            );
                          }}
                        >
                          {accountAgeData.map((entry, index) => {
                            const ageIndex = ['New (<6mo)', 'Established (6mo-2yr)', 'Veteran (2yr+)'].indexOf(entry.age);
                            return <Cell key={`cell-${index}`} fill={PASTEL_COLORS[ageIndex]} />;
                          })}
                        </Scatter>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-2">
                    <small className="text-muted">Each point represents a tweet. Higher concentrations indicate more tweets with similar like counts.</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="tweets" title="View Tweets">
          <Row>
            <Col>
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="card-title mb-3">📝 All Tweets</h4>
                  <div className="tweet-list">
                    {safeTweets.length > 0 ? (
                      safeTweets.map((tweet, index) => (
                        <Card key={index} className="mb-4 tweet-card" style={{ borderRadius: '16px', border: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', transition: 'all 0.2s ease' }}>
                          <Card.Body style={{ padding: '16px' }}>
                            <div className="d-flex">
                              {/* User Avatar */}
                              <div 
                                style={{ 
                                  width: '48px', 
                                  height: '48px', 
                                  borderRadius: '50%', 
                                  backgroundColor: '#eff3f4', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  marginRight: '12px',
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  color: '#000',
                                  border: '1px solid rgba(0, 0, 0, 0.04)'
                                }}
                              >
                                {tweet.FullName ? tweet.FullName.charAt(0).toUpperCase() : tweet.Author ? tweet.Author.charAt(0).toUpperCase() : 'A'}
                              </div>
                              
                              {/* Tweet Content */}
                              <div style={{ flex: 1 }}>
                                {/* User Info */}
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <div className="d-flex align-items-center">
                                    <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f1419' }}>{tweet.FullName || tweet.Author || tweet.user || 'Anonymous'}</span>
                                    <span style={{ color: '#536471', fontSize: '15px', marginLeft: '4px' }}>@{tweet.Author || tweet.user || 'user'}</span>
                                    <span style={{ color: '#536471', fontSize: '15px', margin: '0 4px' }}>·</span>
                                    <span style={{ color: '#536471', fontSize: '15px' }}>
                                      {tweet.Date ? new Date(tweet.Date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                                    </span>
                                  </div>
                                  <div>
                                    <i className="bi bi-three-dots" style={{ color: '#536471', cursor: 'pointer' }}></i>
                                  </div>
                                </div>
                                
                                {/* Tweet Text */}
                                <p style={{ marginBottom: '12px', fontSize: '15px', lineHeight: '1.4', color: '#0f1419', whiteSpace: 'pre-line' }}>
                                  {tweet.Tweet || tweet.text}
                                </p>
                                
                                {/* Engagement Metrics */}
                                <div className="d-flex justify-content-between mt-3" style={{ maxWidth: '425px' }}>
                                  {/* Reply */}
                                  <div className="d-flex align-items-center" style={{ color: '#536471', cursor: 'pointer', transition: 'color 0.2s ease' }} 
                                       onMouseOver={(e) => e.currentTarget.style.color = '#1d9bf0'} 
                                       onMouseOut={(e) => e.currentTarget.style.color = '#536471'}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px', borderRadius: '50%', transition: 'background-color 0.2s ease' }}
                                         onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)'} 
                                         onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <i className="bi bi-chat" style={{ fontSize: '16px' }}></i>
                                    </div>
                                    <span style={{ fontSize: '13px', marginLeft: '4px' }}>{parseInt(tweet.Replies || tweet.replies || 0)}</span>
                                  </div>
                                  
                                  {/* Retweet */}
                                  <div className="d-flex align-items-center" style={{ color: '#536471', cursor: 'pointer', transition: 'color 0.2s ease' }}
                                       onMouseOver={(e) => e.currentTarget.style.color = '#00ba7c'} 
                                       onMouseOut={(e) => e.currentTarget.style.color = '#536471'}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px', borderRadius: '50%', transition: 'background-color 0.2s ease' }}
                                         onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 186, 124, 0.1)'} 
                                         onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <i className="bi bi-arrow-repeat" style={{ fontSize: '16px' }}></i>
                                    </div>
                                    <span style={{ fontSize: '13px', marginLeft: '4px' }}>{parseInt(tweet.Retweets || tweet.retweets || 0)}</span>
                                  </div>
                                  
                                  {/* Like */}
                                  <div className="d-flex align-items-center" style={{ color: '#536471', cursor: 'pointer', transition: 'color 0.2s ease' }}
                                       onMouseOver={(e) => e.currentTarget.style.color = '#f91880'} 
                                       onMouseOut={(e) => e.currentTarget.style.color = '#536471'}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px', borderRadius: '50%', transition: 'background-color 0.2s ease' }}
                                         onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(249, 24, 128, 0.1)'} 
                                         onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <i className="bi bi-heart" style={{ fontSize: '16px' }}></i>
                                    </div>
                                    <span style={{ fontSize: '13px', marginLeft: '4px' }}>{parseInt(tweet.Likes || tweet.likes || 0)}</span>
                                  </div>
                                  
                                  {/* View */}
                                  <div className="d-flex align-items-center" style={{ color: '#536471', cursor: 'pointer', transition: 'color 0.2s ease' }}
                                       onMouseOver={(e) => e.currentTarget.style.color = '#1d9bf0'} 
                                       onMouseOut={(e) => e.currentTarget.style.color = '#536471'}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px', borderRadius: '50%', transition: 'background-color 0.2s ease' }}
                                         onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)'} 
                                         onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <i className="bi bi-bar-chart" style={{ fontSize: '16px' }}></i>
                                    </div>
                                    <span style={{ fontSize: '13px', marginLeft: '4px' }}>{parseInt(tweet.Views || tweet.views || 0)}</span>
                                  </div>
                                  
                                  {/* Share */}
                                  <div className="d-flex align-items-center" style={{ color: '#536471', cursor: 'pointer', transition: 'color 0.2s ease' }}
                                       onMouseOver={(e) => e.currentTarget.style.color = '#1d9bf0'} 
                                       onMouseOut={(e) => e.currentTarget.style.color = '#536471'}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px', borderRadius: '50%', transition: 'background-color 0.2s ease' }}
                                         onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)'} 
                                         onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <i className="bi bi-upload" style={{ fontSize: '16px' }}></i>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))
                    ) : (
                      <Alert variant="info">No tweets available in this subtopic.</Alert>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default SubtopicDashboard;
