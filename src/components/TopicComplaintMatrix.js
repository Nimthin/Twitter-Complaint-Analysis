import React, { useState, useMemo, useEffect } from 'react';
import { 
  Card, Row, Col, Table, Spinner, Button, Badge, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import DataService from '../services/DataService';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';

const TopicComplaintMatrix = ({ topics = [], onBack }) => {
  // State for filters
  const [sortBy, setSortBy] = useState('topic');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(false);

  // Set loading state when sort changes
  useEffect(() => {
    setLoading(true);
  }, [sortBy, sortDirection]);

  // Get predefined topics and subtopics from DataService
  const getPredefinedTopicsAndSubtopics = () => {
    // These are the predefined topic names from DataService.js
    return [
      'Order Placement & Checkout',
      'Delivery & Shipping',
      'Stock & Availability',
      'Returns & Refunds',
      'Product Quality & Faults',
      'Sizing & Fit',
      'Pricing & Promotions',
      'Customer Service Experience',
      'Digital Platform Issues',
      'Furniture Assembly & Parts',
      'Account & Security',
      'Marketing & Communications',
      'Product Information & Queries',
      'Miscellaneous & Other'
    ];
  };

  // Process matrix data
  const matrixData = useMemo(() => {
    console.log('========== MATRIX DATA CALCULATION ==========');
    console.log('All Topics:', topics);
    
    // Get predefined topics list
    const predefinedTopics = getPredefinedTopicsAndSubtopics();
    console.log('Predefined Topics:', predefinedTopics);
    
    // Create a map of existing topics for quick lookup
    const existingTopicsMap = {};
    topics.forEach(topic => {
      existingTopicsMap[topic.name] = topic;
    });
    
    // For each topic-subtopic, always anchor periods to the latest date in that subset
    const allTweetsWithDates = [];
    let totalTweetsProcessed = 0;
    let tweetsWithValidDates = 0;
    
    topics.forEach(topic => {
      if (!topic.subtopics) return;
      topic.subtopics.forEach(subtopic => {
        totalTweetsProcessed += subtopic.tweets?.length || 0;
        const validTweets = (subtopic.tweets || []).filter(tweet => tweet.date);
        tweetsWithValidDates += validTweets.length;
        if (validTweets.length === 0) {
          allTweetsWithDates.push({
            topic: topic.name,
            subtopic: subtopic.name,
            tweets: [],
            maxDate: null
          });
          return;
        }
        // Find the latest date in this subset
        let maxDate = null;
        validTweets.forEach(tweet => {
          let tweetDate;
          if (typeof tweet.date === 'number') {
            const excelEpoch = new Date(1900, 0, 1);
            tweetDate = new Date(excelEpoch);
            tweetDate.setDate(excelEpoch.getDate() + tweet.date - 2);
          } else {
            tweetDate = new Date(tweet.date);
          }
          if (!maxDate || tweetDate > maxDate) maxDate = tweetDate;
        });
        allTweetsWithDates.push({
          topic: topic.name,
          subtopic: subtopic.name,
          tweets: validTweets,
          maxDate
        });
      });
    });
    
    console.log('Tweet Processing Stats:');
    console.log('- Total tweets processed:', totalTweetsProcessed);
    console.log('- Tweets with valid dates:', tweetsWithValidDates);

    // Create a comprehensive list that includes all predefined topics
    const comprehensiveData = [];
    
    predefinedTopics.forEach(topicName => {
      // Check if this predefined topic exists in our data
      const topic = existingTopicsMap[topicName];
      
      if (topic && topic.subtopics && topic.subtopics.length > 0) {
        topic.subtopics.forEach(subtopic => {
          // Find the corresponding entry in allTweetsWithDates
          const match = allTweetsWithDates.find(
            t => t.topic === topicName && t.subtopic === subtopic.name
          );
          comprehensiveData.push({
            topic: topicName,
            subtopic: subtopic.name,
            tweets: match ? match.tweets : [],
            maxDate: match ? match.maxDate : null
          });
        });
      } else {
        comprehensiveData.push({
          topic: topicName,
          subtopic: 'General',
          tweets: [],
          maxDate: null
        });
      }
    });
    
    console.log('Comprehensive data created with all predefined topics:', comprehensiveData.length, 'entries');
    
    // Process the data for each subtopic
    const processedData = comprehensiveData.map(item => {
      console.log(`Processing matrix data for ${item.topic} > ${item.subtopic}`);
      const { tweets, maxDate } = item;
      if (!maxDate || tweets.length === 0) {
        // No data for this cell
        return {
          topic: item.topic,
          subtopic: item.subtopic,
          wowChange: '—',
          momChange: '—',
          qoqChange: '—',
          avgLikesPerComplaint: '—',
          avgRepliesPerComplaint: '—',
          uniqueUserCount: 0,
          topHashtags: '—',
          complaintCount: 0
        };
      }
      
      // Use the latest date in this subset as the anchor point for all calculations
      const latestDate = maxDate;
      // Helper to parse tweet date consistently
      const parseTweetDate = (tweetDate) => {
        if (!tweetDate) return null;
        
        try {
          // Handle Excel date format or ISO string
          if (typeof tweetDate === 'number') {
            // Excel date (days since 1/1/1900)
            const excelEpoch = new Date(1900, 0, 1);
            const date = new Date(excelEpoch);
            date.setDate(excelEpoch.getDate() + tweetDate - 2); // Excel has a leap year bug
            return date;
          } else {
            return new Date(tweetDate);
          }
        } catch (e) {
          console.error('Error parsing date:', tweetDate, e);
          return null;
        }
      };
      
      // Helper to filter tweets by date range
      const filterByDateRange = (start, end) => {
        return (item.tweets || []).filter(tweet => {
          const tweetDate = parseTweetDate(tweet.date);
          if (!tweetDate) return false;
          return tweetDate >= start && tweetDate <= end;
        });
      };
      
      // Calculate comparison periods based on the latest date
      const currentPeriodEnd = new Date(latestDate);
      const currentPeriodStart = new Date(latestDate);
      currentPeriodStart.setDate(currentPeriodStart.getDate() - 30); // Default to 30 days for current period
      
      // Week ago period
      const weekAgoPeriodEnd = new Date(currentPeriodStart);
      weekAgoPeriodEnd.setDate(weekAgoPeriodEnd.getDate() - 1); // Day before current period
      const weekAgoPeriodStart = new Date(weekAgoPeriodEnd);
      weekAgoPeriodStart.setDate(weekAgoPeriodStart.getDate() - 7);
      
      // Month ago period
      const monthAgoPeriodEnd = new Date(weekAgoPeriodStart);
      monthAgoPeriodEnd.setDate(monthAgoPeriodEnd.getDate() - 1);
      const monthAgoPeriodStart = new Date(monthAgoPeriodEnd);
      monthAgoPeriodStart.setMonth(monthAgoPeriodStart.getMonth() - 1);
      
      // Quarter ago period
      const quarterAgoPeriodEnd = new Date(monthAgoPeriodStart);
      quarterAgoPeriodEnd.setDate(quarterAgoPeriodEnd.getDate() - 1);
      const quarterAgoPeriodStart = new Date(quarterAgoPeriodEnd);
      quarterAgoPeriodStart.setMonth(quarterAgoPeriodStart.getMonth() - 3);
      
      console.log(`Comparison periods for ${item.topic} > ${item.subtopic}:`);
      console.log(`  - Latest date: ${latestDate.toISOString()}`);
      console.log(`  - Current period: ${currentPeriodStart.toISOString()} to ${currentPeriodEnd.toISOString()}`);
      console.log(`  - Week ago: ${weekAgoPeriodStart.toISOString()} to ${weekAgoPeriodEnd.toISOString()}`);
      console.log(`  - Month ago: ${monthAgoPeriodStart.toISOString()} to ${monthAgoPeriodEnd.toISOString()}`);
      console.log(`  - Quarter ago: ${quarterAgoPeriodStart.toISOString()} to ${quarterAgoPeriodEnd.toISOString()}`);
      
      // Filter tweets by period
      const currentPeriodTweets = filterByDateRange(currentPeriodStart, currentPeriodEnd);
      const weekAgoTweets = filterByDateRange(weekAgoPeriodStart, weekAgoPeriodEnd);
      const monthAgoTweets = filterByDateRange(monthAgoPeriodStart, monthAgoPeriodEnd);
      const quarterAgoTweets = filterByDateRange(quarterAgoPeriodStart, quarterAgoPeriodEnd);
      
      console.log(`  Comparison counts for ${item.topic} > ${item.subtopic}:`);
      console.log(`    - Current period: ${currentPeriodTweets.length} tweets`);
      console.log(`    - Week ago: ${weekAgoTweets.length} tweets`);
      console.log(`    - Month ago: ${monthAgoTweets.length} tweets`);
      console.log(`    - Quarter ago: ${quarterAgoTweets.length} tweets`);

      // Calculate percentage changes or integer difference
      const calculatePercentChange = (current, previous) => {
        if (previous === 0) {
          // Show integer difference with sign, no percent
          const diff = current - previous;
          return {
            value: (diff > 0 ? '+' : '') + diff,
            isPercent: false
          };
        }
        // Show percentage with sign
        const percent = ((current - previous) / previous) * 100;
        const rounded = percent.toFixed(1);
        return {
          value: (percent > 0 ? '+' : '') + rounded,
          isPercent: true
        };
      };

      const wowChange = calculatePercentChange(currentPeriodTweets.length, weekAgoTweets.length);
      const momChange = calculatePercentChange(currentPeriodTweets.length, monthAgoTweets.length);
      const qoqChange = calculatePercentChange(currentPeriodTweets.length, quarterAgoTweets.length);

      // Calculate engagement metrics - ensure we use the normalized structure (lowercase property names)
      const totalLikes = currentPeriodTweets.reduce((sum, tweet) => sum + (tweet.likes || tweet.Likes || 0), 0);
      const totalReplies = currentPeriodTweets.reduce((sum, tweet) => sum + (tweet.replies || tweet.Replies || 0), 0);
      const totalViews = currentPeriodTweets.reduce((sum, tweet) => sum + (tweet.views || tweet.Views || 100), 0);
      const avgLikesPerComplaint = currentPeriodTweets.length > 0 ? totalLikes / currentPeriodTweets.length : 0;
      const avgRepliesPerComplaint = currentPeriodTweets.length > 0 ? totalReplies / currentPeriodTweets.length : 0;
      
      console.log(`  Engagement metrics for ${item.topic} > ${item.subtopic}:`);
      console.log(`    - Total Likes: ${totalLikes}`);
      console.log(`    - Total Replies: ${totalReplies}`);
      console.log(`    - Total Views: ${totalViews}`);
      console.log(`    - Avg Likes: ${avgLikesPerComplaint.toFixed(2)}`);
      console.log(`    - Avg Replies: ${avgRepliesPerComplaint.toFixed(2)}`);

      // Count unique users - handle both normalized and legacy data structure
      const uniqueUsers = new Set(tweets.map(tweet => tweet.user || tweet.User || 'Anonymous'));
      
      console.log(`  Unique users for ${item.topic} > ${item.subtopic}: ${uniqueUsers.size}`);

      // Extract hashtags - handle both normalized and legacy data structure
      const hashtagRegex = /#\w+/g;
      const hashtagCounts = {};
      currentPeriodTweets.forEach(tweet => {
        // Use normalized structure but fall back to legacy if needed
        const tweetText = tweet.text || tweet.Text || '';
        if (!tweetText) return;
        
        const matches = tweetText.match(hashtagRegex) || [];
        matches.forEach(hashtag => {
          hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
        });
      });
      
      console.log(`  Hashtags found for ${item.topic} > ${item.subtopic}: ${Object.keys(hashtagCounts).length}`);

      // Get top hashtags
      const topHashtags = Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag, count]) => `${tag} (${count})`)
        .join(', ') || '—';

      return {
        topic: item.topic,
        subtopic: item.subtopic,
        wowChange,
        momChange,
        qoqChange,
        avgLikesPerComplaint: avgLikesPerComplaint.toFixed(1),
        avgRepliesPerComplaint: avgRepliesPerComplaint.toFixed(1),
        uniqueUserCount: uniqueUsers.size,
        topHashtags,
        complaintCount: tweets.length
      };
    });

    // Create the result array
    const result = [];
    
    // Add processed data to result
    processedData.forEach(item => {
      result.push(item);
    });
    
    // Sort the data
    result.sort((a, b) => {
      if (sortBy === 'topic') {
        const topicCompare = a.topic.localeCompare(b.topic);
        if (topicCompare !== 0) return sortDirection === 'asc' ? topicCompare : -topicCompare;
        return a.subtopic.localeCompare(b.subtopic);
      }
      
      if (sortBy === 'subtopic') {
        return sortDirection === 'asc' ? a.subtopic.localeCompare(b.subtopic) : b.subtopic.localeCompare(a.subtopic);
      }
      
      // For numeric columns
      const aValue = parseFloat(a[sortBy]) || 0;
      const bValue = parseFloat(b[sortBy]) || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return result;
  }, [topics, sortBy, sortDirection]);

  // Update loading state when matrix data is calculated
  useEffect(() => {
    if (matrixData.length > 0) {
      setLoading(false);
    }
  }, [matrixData]);

  // Format percentage or integer difference values with colors
  const formatPercentChange = (changeObj) => {
    if (!changeObj || changeObj.value === '—') return '—';
    const { value, isPercent } = changeObj;
    const numValue = parseFloat(value);
    const color = numValue > 0 ? 'success' : numValue < 0 ? 'danger' : 'secondary';
    const symbol = numValue > 0 ? '↑' : numValue < 0 ? '↓' : '';
    return (
      <span className={`text-${color}`}>
        {numValue !== 0 ? symbol : ''} {Math.abs(numValue)}{isPercent ? '%' : ''}
      </span>
    );
  };


  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Group data by topic
  const groupedByTopic = {};
  matrixData.forEach(item => {
    if (!groupedByTopic[item.topic]) {
      groupedByTopic[item.topic] = [];
    }
    groupedByTopic[item.topic].push(item);
  });

  return (
    <div className="topic-complaint-matrix">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Topic-Complaint Matrix</h2>
          <p className="text-muted">
            Analyzing complaints across {Object.keys(groupedByTopic).length} topics and {matrixData.length} subtopics
          </p>
        </div>
        {onBack && (
          <div>
            <Button variant="outline-secondary" onClick={onBack}>
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </Button>
          </div>
        )}
      </div>
      
      {/* Legend Row */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Matrix Legend:</strong>
                </div>
                <div className="d-flex flex-wrap">
                  <Badge bg="light" text="dark" className="me-2 mb-1">WoW: Week-over-Week</Badge>
                  <Badge bg="light" text="dark" className="me-2 mb-1">MoM: Month-over-Month</Badge>
                  <Badge bg="light" text="dark" className="me-2 mb-1">QoQ: Quarter-over-Quarter</Badge>
                  <Badge bg="light" text="dark" className="me-2 mb-1">Based on latest data for each topic</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Matrix Table */}
      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="card-title mb-3">📊 Complaint Metrics by Topic & Subtopic</h4>
          
          {loading && (
            <div className="text-center p-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Processing data...</p>
            </div>
          )}
          
          {!loading && (
            <div className="table-responsive" style={{ maxHeight: '600px' }}>
              <Table striped hover className="matrix-table">
                <thead className="sticky-top bg-white">
                  <tr>
                    <th onClick={() => handleSort('topic')} style={{ cursor: 'pointer' }}>
                      Topic {sortBy === 'topic' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('subtopic')} style={{ cursor: 'pointer' }}>
                      Subtopic {sortBy === 'subtopic' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('wowChange')} style={{ cursor: 'pointer' }}>
                      WoW % {sortBy === 'wowChange' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('momChange')} style={{ cursor: 'pointer' }}>
                      MoM % {sortBy === 'momChange' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('qoqChange')} style={{ cursor: 'pointer' }}>
                      QoQ % {sortBy === 'qoqChange' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('avgLikesPerComplaint')} style={{ cursor: 'pointer' }}>
                      Avg Likes {sortBy === 'avgLikesPerComplaint' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('avgRepliesPerComplaint')} style={{ cursor: 'pointer' }}>
                      Avg Replies {sortBy === 'avgRepliesPerComplaint' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('uniqueUserCount')} style={{ cursor: 'pointer' }}>
                      # Users {sortBy === 'uniqueUserCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('complaintCount')} style={{ cursor: 'pointer' }}>
                      # Complaints AOD {sortBy === 'complaintCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedByTopic).map(([topicName, subtopics], topicIndex) => {
                    return subtopics.map((item, idx) => (
                      <tr key={`${item.topic}-${item.subtopic}`}>
                        {idx === 0 && (
                          <td rowSpan={subtopics.length} className="align-middle bg-light">
                            <strong>{item.topic}</strong>
                          </td>
                        )}
                        <td>{item.subtopic}</td>
                        <td>{formatPercentChange(item.wowChange)}</td>
                        <td>{formatPercentChange(item.momChange)}</td>
                        <td>{formatPercentChange(item.qoqChange)}</td>
                        <td>{item.avgLikesPerComplaint}</td>
                        <td>{item.avgRepliesPerComplaint}</td>
                        <td>{item.uniqueUserCount}</td>
                        <td>
                          <Badge bg="primary" pill>{item.complaintCount}</Badge>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TopicComplaintMatrix;
