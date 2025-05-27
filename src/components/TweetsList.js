import React, { useState } from 'react';
import { Card, Row, Col, Badge, Button, Form, Alert, ProgressBar } from 'react-bootstrap';

const TweetsList = ({ tweets, topic, subtopic, onBack }) => {
  // Defensive: Ensure tweets is always an array
  const safeTweets = Array.isArray(tweets) ? tweets : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedTweets, setExpandedTweets] = useState({});

  // Toggle tweet expansion
  const toggleExpand = (id) => {
    setExpandedTweets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get confidence badge variant based on confidence level
  const getConfidenceVariant = (confidence) => {
    if (confidence > 0.7) return 'success';
    if (confidence > 0.4) return 'warning';
    return 'danger';
  };

  // Format confidence as percentage
  const formatConfidence = (confidence) => {
    return Math.round(confidence * 100) + '%';
  };

  // Filter tweets by search term - handle different possible data structures
  const filteredTweets = safeTweets.filter(tweet => {
    const searchLower = searchTerm.toLowerCase();
    const tweetText = tweet.Tweet || '';
    const tweetUser = tweet.Author || '';
    const tweetFullName = tweet.FullName || '';
    const tweetTopics = tweet.primaryTopic || '';
    
    return (
      tweetText.toString().toLowerCase().includes(searchLower) ||
      tweetUser.toString().toLowerCase().includes(searchLower) ||
      tweetTopics.toString().toLowerCase().includes(searchLower)
    );
  });

  // Sort tweets
  const sortedTweets = [...filteredTweets].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.Date || 0) - new Date(b.Date || 0);
    } else if (sortBy === 'likes') {
      comparison = (a.Likes || 0) - (b.Likes || 0);
    } else if (sortBy === 'views') {
      comparison = (a.Views || 0) - (b.Views || 0);
    } else if (sortBy === 'replies') {
      comparison = (a.Replies || 0) - (b.Replies || 0);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Defensive: Allow subtopic/topic to be string or object
  const topicName = topic && typeof topic === 'object' ? topic.name : topic;
  const subtopicName = subtopic && typeof subtopic === 'object' ? subtopic.name : subtopic;

  return (
    <div className="tweets-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">{subtopicName} Tweets</h2>
          <p className="text-muted">
            Displaying {sortedTweets.length} tweets from the "{topicName} {'>'}  {subtopicName}" category
          </p>
        </div>
        {onBack && (
          <Button variant="outline-secondary" onClick={onBack}>
            <i className="bi bi-arrow-left me-1"></i> Back
          </Button>
        )}
      </div>
      
      {/* Filters and search */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={5} className="mb-3 mb-md-0">
              <Form.Control
                type="text"
                placeholder="Search tweets or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow-sm"
              />
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="shadow-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="likes">Sort by Likes</option>
                <option value="views">Sort by Views</option>
                <option value="replies">Sort by Replies</option>
              </Form.Select>
            </Col>
            <Col md={2} className="mb-3 mb-md-0">
              <Form.Select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="shadow-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Badge bg="primary" className="p-2 w-100 d-block text-center">
                {sortedTweets.length} Results
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {sortedTweets.length === 0 ? (
        <Alert variant="info" className="shadow-sm">No tweets found matching your criteria. Try adjusting your search or filters.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {sortedTweets.map((tweet, idx) => (
            <Col key={idx}>
              <Card className="h-100 shadow-sm tweet-card transition-all">
                <Card.Header className="bg-transparent border-bottom-0 pt-3 pb-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-0 fw-bold">{tweet.Author || 'Anonymous'}</h5>
                      <small className="text-muted">
                        {tweet.Date ? new Date(tweet.Date).toLocaleDateString() : 'Unknown date'}
                      </small>
                    </div>
                    {/* Show confidence badge if available */}
                    {typeof tweet.confidence !== 'undefined' && (
                      <Badge 
                        bg={getConfidenceVariant(tweet.confidence)} 
                        title="Topic match confidence"
                        className="rounded-pill"
                      >
                        {formatConfidence(tweet.confidence || 0)}
                      </Badge>
                    )}
                  </div>
                </Card.Header>
                
                <Card.Body>
                  <Card.Text 
                    className={`tweet-text ${expandedTweets[tweet.id] ? '' : 'text-truncate-2'}`}
                    onClick={() => toggleExpand(tweet.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {tweet.text || tweet.tweets || ''}
                  </Card.Text>
                  
                  {/* Topic Badges */}
                  <div className="mb-2">
                    {tweet.topicScores && tweet.topicScores.slice(0, 3).map((topic, idx) => (
                      <Badge 
                        key={idx} 
                        bg={idx === 0 ? 'primary' : 'secondary'} 
                        className="me-1 mb-1"
                        title={`Confidence: ${formatConfidence(topic.score)}`}
                      >
                        {topic.name}
                      </Badge>
                    ))}
                    
                    {/* If no topicScores, show primaryTopic if available */}
                    {!tweet.topicScores && tweet.primaryTopic && (
                      <Badge bg="primary" className="me-1 mb-1">
                        {tweet.primaryTopic}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Engagement Stats */}
                  <div className="d-flex gap-2 text-muted mt-3">
                    <small title="Likes">
                      <i className="bi bi-heart me-1"></i>
                      {tweet.likes || tweet.Likes || 0}
                    </small>
                    <small title="Retweets/Views">
                      <i className="bi bi-repeat me-1"></i>
                      {tweet.retweets || tweet.Views || 0}
                    </small>
                  </div>
                </Card.Body>
                
                <Card.Footer className="bg-transparent border-top-0 pt-0">
                  <div className="d-grid">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => window.open(tweet.url || tweet.TweetURL || '#', '_blank')}
                      className="d-flex align-items-center justify-content-center"
                      disabled={!tweet.url && !tweet.TweetURL}
                    >
                      <i className="bi bi-twitter me-1"></i>
                      View on Twitter
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default TweetsList;
