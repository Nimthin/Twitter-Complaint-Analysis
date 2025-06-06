import React, { useState, useMemo } from 'react';
import { Card, ListGroup, Row, Col, Container, Form, InputGroup, Button, Badge, Tabs, Tab, Nav } from 'react-bootstrap';
import GeographyDashboard from './GeographyDashboard';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import moment from 'moment';
import AnalyticsService from '../services/AnalyticsService';
import { Link } from 'react-router-dom';

// Custom colors for consistent theming
const NEW_COLORS = [
  '#ff4c04', // Primary color
  '#ff7b42', // Lighter orange
  '#ffaa7f', // Lightest orange
  '#0088FE', // Original blue
  '#00C49F', // Original teal/green
  '#FFBB28', // Original yellow
  // Add more from original COLORS if more than 6 distinct colors are frequently needed
  '#A28DFF', '#FF6B8B', '#4BC0C0', '#C084FC', '#F87171', '#34D399'
];

// Fallback for components that might still reference the old name
const COLORS = NEW_COLORS;

// Advanced Dashboard component with all requested features
const Dashboard = ({ topics = [] }) => {
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTab, setSelectedTab] = useState('overview');

  // Process all tweets from topics and subtopics
  const allTweets = useMemo(() => {
    const tweets = [];
    console.log("Topics Structure:", topics);
    topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        if (subtopic.tweets && Array.isArray(subtopic.tweets)) {
          subtopic.tweets.forEach(tweet => {
            tweets.push({
              ...tweet,
              topic: topic.name,
              subtopic: subtopic.name,
              engagement: tweet.engagement || (tweet.likes || 0) + (tweet.replies || 0),
              dateObj: tweet.date || new Date()
            });
          });
        }
      });
    });
    console.log("Processed Tweets:", tweets);
    return tweets;
  }, [topics]);

  // Filter tweets based on search term and date range
  const filteredTweets = useMemo(() => {
    let filtered = allTweets;
    
    if (searchTerm) {
      filtered = filtered.filter(tweet => 
        tweet.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      filtered = filtered.filter(tweet => {
        const tweetDate = new Date(tweet.date);
        return tweetDate >= start && tweetDate <= end;
      });
    }
    
    return filtered;
  }, [allTweets, searchTerm, dateRange]);
  
  
  // Prepare data for charts
  const topicDistribution = useMemo(() => {
    return topics.map(topic => ({
      name: topic.name,
      value: topic.tweetCount,
    }));
  }, [topics]);

  // Get sentiment analysis data
  const sentimentData = useMemo(() => {
    const sentiments = { positive: 0, neutral: 0, negative: 0 };
    const topicSentiment = {};
    
    filteredTweets.forEach(tweet => {
      if (!tweet || !tweet.sentimentLabel) return;
      const sentiment = tweet.sentimentLabel;
      if (sentiments[sentiment] !== undefined) sentiments[sentiment]++;
      // Track sentiment by topic
      if (!topicSentiment[tweet.topic]) {
        topicSentiment[tweet.topic] = { positive: 0, neutral: 0, negative: 0 };
      }
      if (topicSentiment[tweet.topic][sentiment] !== undefined) topicSentiment[tweet.topic][sentiment]++;
    });
    
    return { overall: sentiments, byTopic: topicSentiment };
  }, [filteredTweets]);
  
  // Get trends over time
  const trendsOverTime = useMemo(() => {
    const tweetsByDate = {};
    const dateFormat = 'YYYY-MM-DD';
    
    filteredTweets.forEach(tweet => {
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
    return Object.values(tweetsByDate).sort((a, b) => 
      moment(a.date, dateFormat).diff(moment(b.date, dateFormat)));
  }, [filteredTweets]);
  
  // Get complaints with most likes
  const mostLikedComplaints = useMemo(() => {
    return [...filteredTweets]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);
  }, [filteredTweets]);
  
  // Get complaints with most replies
  const mostRepliedComplaints = useMemo(() => {
    return [...filteredTweets]
      .sort((a, b) => (b.replies || 0) - (a.replies || 0))
      .slice(0, 5);
  }, [filteredTweets]);
  
  // Get complaints with most views
  const mostViewedComplaints = useMemo(() => {
    return [...filteredTweets]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [filteredTweets]);
  
  // Get complaints with most followers
  const mostFollowedComplaints = useMemo(() => {
    return [...filteredTweets]
      .sort((a, b) => (b.followers || 0) - (a.followers || 0))
      .slice(0, 5);
  }, [filteredTweets]);
  
  // Calculate unique users
  const uniqueUsers = useMemo(() => {
    const users = new Set(filteredTweets.map(tweet => tweet.user));
    return users.size;
  }, [filteredTweets]);
  
  // Get complaints per day
  const complaintsPerDay = useMemo(() => {
    if (trendsOverTime.length === 0) return 0;
    const totalDays = trendsOverTime.length;
    const totalComplaints = filteredTweets.length;
    return (totalComplaints / totalDays).toFixed(2);
  }, [filteredTweets, trendsOverTime]);
  
  // Get all subtopics for grid view
  const allSubtopics = useMemo(() => {
    const subtopics = [];
    topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        subtopics.push({
          ...subtopic,
          topicName: topic.name,
          tweetCount: subtopic.tweets.length
        });
      });
    });
    return subtopics;
  }, [topics]);

  return (
    <Container fluid className="analytics-dashboard py-4">
      
      {/* Key Metrics Overview */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4 className="card-title mb-3">📊 Key Metrics Overview</h4>
          <Row>
            <Col md={2} className="mb-3">
              <Card className="text-center h-100 bg-light">
                <Card.Body>
                  <h3>{filteredTweets.length}</h3>
                  <p className="mb-0">Total Complaints</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2} className="mb-3">
              <Card className="text-center h-100 bg-light">
                <Card.Body>
                  <h3>{uniqueUsers}</h3>
                  <p className="mb-0">Unique Users</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2} className="mb-3">
              <Card className="text-center h-100 bg-light">
                <Card.Body>
                  <h3>{filteredTweets.reduce((sum, tweet) => sum + (tweet.views || 0), 0)}</h3>
                  <p className="mb-0">Total Views</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2} className="mb-3">
              <Card className="text-center h-100 bg-light">
                <Card.Body>
                  <h3>{filteredTweets.reduce((sum, tweet) => sum + (tweet.likes || 0), 0)}</h3>
                  <p className="mb-0">Total Likes</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2} className="mb-3">
              <Card className="text-center h-100 bg-light">
                <Card.Body>
                  <h3>{filteredTweets.reduce((sum, tweet) => sum + (tweet.replies || 0), 0)}</h3>
                  <p className="mb-0">Total Replies</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2} className="mb-3">
              <Card className="text-center h-100 bg-light">
                <Card.Body>
                  <h3>{complaintsPerDay}</h3>
                  <p className="mb-0">Complaints/Day</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Dashboard Navigation */}
      <Tabs
        id="dashboard-tabs"
        activeKey={selectedTab}
        onSelect={(k) => setSelectedTab(k)}
        className="mb-4"
      >
        <Tab eventKey="overview" title="Overview">
          <Row>
            {/* Topic Distribution */}
            <Col lg={8} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <h4 className="card-title mb-3">📊 Topic Distribution</h4>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={topicDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip formatter={(value) => [`${value} tweets`, 'Count']} />
                        <Legend />
                        <Bar dataKey="value" name="Tweet Count" fill={NEW_COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Sentiment Analysis */}
            <Col lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <h4 className="card-title mb-3">🎯 Sentiment Analysis</h4>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Positive', value: sentimentData.overall.positive },
                            { name: 'Neutral', value: sentimentData.overall.neutral },
                            { name: 'Negative', value: sentimentData.overall.negative }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {/* Sentiment Colors:
                              Positive: A distinct, positive color (e.g., green/teal)
                              Neutral: A neutral color (e.g., yellow/grey)
                              Negative: The primary color (orange/red)
                          */}
                          <Cell fill={NEW_COLORS[4]} /> {/* Positive - #00C49F */}
                          <Cell fill={NEW_COLORS[5]} /> {/* Neutral - #FFBB28 */}
                          <Cell fill={NEW_COLORS[0]} /> {/* Negative - #ff4c04 */}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            {/* Trends Over Time */}
            <Col lg={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="card-title mb-3">📉 Trends Over Time</h4>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={trendsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke={NEW_COLORS[0]} name="Total Complaints" />
                        {/* Could add lines for top topics */}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Geography Map - Engagement by Location */}
          <Row>
            <Col lg={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="card-title mb-3">🌍 Engagement by Location</h4>
                  <div style={{ width: '100%', minHeight: 400 }}>
                    <GeographyDashboard tweets={allTweets} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Popular Complaints Dashboard */}
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="card-title mb-3">🔥 Popular Complaints Dashboard</h4>
                  <Tabs defaultActiveKey="likes" id="popular-complaints-tabs" className="mb-3">
                    <Tab eventKey="likes" title="Most Likes">
                      <ListGroup variant="flush">
                        {mostLikedComplaints.map((tweet, index) => (
                          <ListGroup.Item key={index} className="p-3 border-bottom" style={{ borderLeft: 'none', borderRight: 'none', borderTop: index === 0 ? 'none' : '1px solid rgba(0, 0, 0, 0.08)' }}>
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
                                {tweet.user ? tweet.user.charAt(0).toUpperCase() : 'A'}
                              </div>
                              
                              {/* Tweet Content */}
                              <div style={{ flex: 1 }}>
                                {/* User Info */}
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <div className="d-flex align-items-center">
                                    <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f1419' }}>{tweet.user || 'Anonymous'}</span>
                                    <span style={{ color: '#536471', fontSize: '15px', marginLeft: '4px' }}>@{tweet.user || 'user'}</span>
                                    <span style={{ color: '#536471', fontSize: '15px', margin: '0 4px' }}>·</span>
                                    <span style={{ color: '#536471', fontSize: '15px' }}>
                                      {tweet.date ? new Date(tweet.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                                    </span>
                                  </div>
                                  <Badge bg="danger" pill style={{ fontSize: '11px', padding: '0.35em 0.65em' }}>
                                    <i className="bi bi-heart-fill me-1" style={{ fontSize: '10px' }}></i>
                                    {tweet.likes || 0}
                                  </Badge>
                                </div>
                                
                                {/* Tweet Text */}
                                <p style={{ marginBottom: '10px', fontSize: '15px', lineHeight: '1.4', color: '#0f1419' }}>
                                  {tweet.text}
                                </p>
                                
                                {/* Topic Tag */}
                                <div>
                                  <Badge bg="light" text="dark" style={{ borderRadius: '16px', backgroundColor: 'rgba(0, 0, 0, 0.03)', fontWeight: 'normal', fontSize: '13px' }}>
                                    <i className="bi bi-hash me-1" style={{ fontSize: '12px' }}></i>
                                    {tweet.topic}
                                  </Badge>
                                </div>
                                
                                {/* Engagement Metrics */}
                                <div className="d-flex mt-2" style={{ maxWidth: '300px', color: '#536471' }}>
                                  <div className="me-3 d-flex align-items-center">
                                    <i className="bi bi-chat me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.replies || 0}</span>
                                  </div>
                                  <div className="me-3 d-flex align-items-center">
                                    <i className="bi bi-arrow-repeat me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.retweets || 0}</span>
                                  </div>
                                  <div className="me-3 d-flex align-items-center" style={{ color: '#f91880' }}>
                                    <i className="bi bi-heart-fill me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.likes || 0}</span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-bar-chart me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.views || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Tab>
                    <Tab eventKey="replies" title="Most Replies">
                      <ListGroup variant="flush">
                        {mostRepliedComplaints.map((tweet, index) => (
                          <ListGroup.Item key={index} className="p-3 border-bottom" style={{ borderLeft: 'none', borderRight: 'none', borderTop: index === 0 ? 'none' : '1px solid rgba(0, 0, 0, 0.08)' }}>
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
                                {tweet.user ? tweet.user.charAt(0).toUpperCase() : 'A'}
                              </div>
                              {/* Tweet Content */}
                              <div style={{ flex: 1 }}>
                                {/* User Info */}
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <div className="d-flex align-items-center">
                                    <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f1419' }}>{tweet.user || 'Anonymous'}</span>
                                    <span style={{ color: '#536471', fontSize: '15px', marginLeft: '4px' }}>@{tweet.user || 'user'}</span>
                                    <span style={{ color: '#536471', fontSize: '15px', margin: '0 4px' }}>·</span>
                                    <span style={{ color: '#536471', fontSize: '15px' }}>
                                      {tweet.date ? new Date(tweet.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                                    </span>
                                  </div>
                                  <Badge bg="info" pill style={{ fontSize: '11px', padding: '0.35em 0.65em' }}>
                                    <i className="bi bi-chat-dots-fill me-1" style={{ fontSize: '10px' }}></i>
                                    {tweet.replies || 0}
                                  </Badge>
                                </div>
                                {/* Tweet Text */}
                                <p style={{ marginBottom: '10px', fontSize: '15px', lineHeight: '1.4', color: '#0f1419' }}>
                                  {tweet.text}
                                </p>
                                {/* Topic Tag */}
                                <div>
                                  <Badge bg="light" text="dark" style={{ borderRadius: '16px', backgroundColor: 'rgba(0, 0, 0, 0.03)', fontWeight: 'normal', fontSize: '13px' }}>
                                    <i className="bi bi-hash me-1" style={{ fontSize: '12px' }}></i>
                                    {tweet.topic}
                                  </Badge>
                                </div>
                                {/* Engagement Metrics */}
                                <div className="d-flex mt-2" style={{ maxWidth: '300px', color: '#536471' }}>
                                  <div className="me-3 d-flex align-items-center" style={{ color: '#1d9bf0' }}>
                                    <i className="bi bi-chat-dots-fill me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.replies || 0}</span>
                                  </div>
                                  <div className="me-3 d-flex align-items-center">
                                    <i className="bi bi-arrow-repeat me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.retweets || 0}</span>
                                  </div>
                                  <div className="me-3 d-flex align-items-center" style={{ color: '#f91880' }}>
                                    <i className="bi bi-heart-fill me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.likes || 0}</span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-bar-chart me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.views || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Tab>
                    <Tab eventKey="views" title="Most Views">
                      <ListGroup variant="flush">
                        {mostViewedComplaints.map((tweet, index) => (
                          <ListGroup.Item key={index} className="p-3 border-bottom" style={{ borderLeft: 'none', borderRight: 'none', borderTop: index === 0 ? 'none' : '1px solid rgba(0, 0, 0, 0.08)' }}>
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
                                {tweet.user ? tweet.user.charAt(0).toUpperCase() : 'A'}
                              </div>
                              {/* Tweet Content */}
                              <div style={{ flex: 1 }}>
                                {/* User Info */}
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <div className="d-flex align-items-center">
                                    <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f1419' }}>{tweet.user || 'Anonymous'}</span>
                                    <span style={{ color: '#536471', fontSize: '15px', marginLeft: '4px' }}>@{tweet.user || 'user'}</span>
                                    <span style={{ color: '#536471', fontSize: '15px', margin: '0 4px' }}>·</span>
                                    <span style={{ color: '#536471', fontSize: '15px' }}>
                                      {tweet.date ? new Date(tweet.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                                    </span>
                                  </div>
                                  <Badge bg="success" pill style={{ fontSize: '11px', padding: '0.35em 0.65em' }}>
                                    <i className="bi bi-bar-chart-fill me-1" style={{ fontSize: '10px' }}></i>
                                    {tweet.views || 0}
                                  </Badge>
                                </div>
                                {/* Tweet Text */}
                                <p style={{ marginBottom: '10px', fontSize: '15px', lineHeight: '1.4', color: '#0f1419' }}>
                                  {tweet.text}
                                </p>
                                {/* Topic Tag */}
                                <div>
                                  <Badge bg="light" text="dark" style={{ borderRadius: '16px', backgroundColor: 'rgba(0, 0, 0, 0.03)', fontWeight: 'normal', fontSize: '13px' }}>
                                    <i className="bi bi-hash me-1" style={{ fontSize: '12px' }}></i>
                                    {tweet.topic}
                                  </Badge>
                                </div>
                                {/* Engagement Metrics */}
                                <div className="d-flex mt-2" style={{ maxWidth: '300px', color: '#536471' }}>
                                  <div className="me-3 d-flex align-items-center">
                                    <i className="bi bi-chat-dots-fill me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.replies || 0}</span>
                                  </div>
                                  <div className="me-3 d-flex align-items-center">
                                    <i className="bi bi-arrow-repeat me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.retweets || 0}</span>
                                  </div>
                                  <div className="me-3 d-flex align-items-center" style={{ color: '#f91880' }}>
                                    <i className="bi bi-heart-fill me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.likes || 0}</span>
                                  </div>
                                  <div className="d-flex align-items-center" style={{ color: '#1d9bf0' }}>
                                    <i className="bi bi-bar-chart-fill me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.views || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Tab>
                    <Tab eventKey="followers" title="Most Followers">
                      <ListGroup variant="flush">
                        {mostFollowedComplaints.map((tweet, index) => (
                          <ListGroup.Item key={index} className="p-3 border-bottom" style={{ borderLeft: 'none', borderRight: 'none', borderTop: index === 0 ? 'none' : '1px solid rgba(0, 0, 0, 0.08)' }}>
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
                                {tweet.user ? tweet.user.charAt(0).toUpperCase() : 'A'}
                              </div>
                              {/* Tweet Content */}
                              <div style={{ flex: 1 }}>
                                {/* User Info */}
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <div className="d-flex align-items-center">
                                    <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f1419' }}>{tweet.user || 'Anonymous'}</span>
                                    <span style={{ color: '#536471', fontSize: '15px', marginLeft: '4px' }}>@{tweet.user || 'user'}</span>
                                    <span style={{ color: '#536471', fontSize: '15px', margin: '0 4px' }}>·</span>
                                    <span style={{ color: '#536471', fontSize: '15px' }}>
                                      {tweet.date ? new Date(tweet.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                                    </span>
                                  </div>
                                  <Badge bg="primary" pill style={{ fontSize: '11px', padding: '0.35em 0.65em' }}>
                                    <i className="bi bi-person-fill me-1" style={{ fontSize: '10px' }}></i>
                                    {tweet.followers || 0}
                                  </Badge>
                                </div>
                                {/* Tweet Text */}
                                <p style={{ marginBottom: '10px', fontSize: '15px', lineHeight: '1.4', color: '#0f1419' }}>
                                  {tweet.text}
                                </p>
                                {/* Topic Tag */}
                                <div>
                                  <Badge bg="light" text="dark" style={{ borderRadius: '16px', backgroundColor: 'rgba(0, 0, 0, 0.03)', fontWeight: 'normal', fontSize: '13px' }}>
                                    <i className="bi bi-hash me-1" style={{ fontSize: '12px' }}></i>
                                    {tweet.topic}
                                  </Badge>
                                </div>
                                {/* Engagement Metrics */}
                                <div className="d-flex mt-2" style={{ maxWidth: '300px', color: '#536471' }}>
                                  <div className="me-3 d-flex align-items-center">
                                    <i className="bi bi-chat-dots-fill me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.replies || 0}</span>
                                  </div>
                                  <div className="me-3 d-flex align-items-center">
                                    <i className="bi bi-arrow-repeat me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.retweets || 0}</span>
                                  </div>
                                  <div className="me-3 d-flex align-items-center" style={{ color: '#f91880' }}>
                                    <i className="bi bi-heart-fill me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.likes || 0}</span>
                                  </div>
                                  <div className="d-flex align-items-center" style={{ color: '#1d9bf0' }}>
                                    <i className="bi bi-person-fill me-1" style={{ fontSize: '14px' }}></i>
                                    <span style={{ fontSize: '13px' }}>{tweet.followers || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
          </Row>
         
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Dashboard;
