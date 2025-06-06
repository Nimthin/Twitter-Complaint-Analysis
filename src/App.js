import React, { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { 
  Container, Row, Col, Card, Badge, Button, Navbar, 
  Form, Spinner, Alert, ButtonGroup, ProgressBar 
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import DataService from './services/DataService';
import SubtopicDashboard from './components/SubtopicDashboard';
import GeographyDashboard from './components/GeographyDashboard';
import TopicComplaintMatrix from './components/TopicComplaintMatrix';
import Header from './components/Header';

// Lazy load Dashboard component for better initial loading performance
const Dashboard = lazy(() => import('./components/Dashboard'));

// Memoized Topic Card component
const TopicCard = memo(({ topic, onSelect }) => (
  <div className="topic-card" onClick={() => onSelect(topic)}>
    <div className="card-content">
      <h5 className="topic-title">{topic.name}</h5>
      <p className="topic-count">{topic.tweetCount} tweets</p>
    </div>
    <div className="card-arrow">
      <i className="bi bi-arrow-right-circle"></i>
    </div>
  </div>
));

// Memoized Subtopic Card component
const SubtopicCard = memo(({ subtopic, onSelect }) => (
  <div className="subtopic-card" onClick={() => onSelect(subtopic)}>
    <div className="card-content">
      <h5 className="subtopic-title">{subtopic.name}</h5>
      <p className="subtopic-count">{subtopic.tweetCount} tweets</p>
    </div>
    <div className="card-arrow">
      <i className="bi bi-arrow-right-circle"></i>
    </div>
  </div>
));

// Memoized Tweet Card component
const TweetCard = memo(({ tweet }) => (
  <div className="tweet-card">
    <div className="tweet-header">
      <span className="tweet-user">{tweet.user || 'Anonymous'}</span>
      <span className="tweet-date">{new Date(tweet.date).toLocaleDateString()}</span>
    </div>
    <div className="tweet-body">
      <p className="tweet-text">{tweet.text}</p>
    </div>
    <div className="tweet-footer">
      <div className="tweet-meta">
        <span><i className="bi bi-heart-fill"></i> {tweet.likes || 0}</span>
        <span><i className="bi bi-arrow-repeat"></i> {tweet.retweets || 0}</span>
        {/* Assuming views might be available, adding placeholder */}
        {/* <span><i className="bi bi-eye-fill"></i> {tweet.views || 0}</span> */}
      </div>
      {tweet.url && tweet.url !== '#' && (
        <a href={tweet.url} target="_blank" rel="noopener noreferrer" className="tweet-link">
          <i className="bi bi-box-arrow-up-right"></i> View on Twitter
        </a>
      )}
    </div>
  </div>
));

// Main App component
function App() {
  const [topics, setTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentSubtopic, setCurrentSubtopic] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('analytics'); // 'analytics' or 'browse'
  const [showGeographyView, setShowGeographyView] = useState(false);
  const [allTweets, setAllTweets] = useState([]);

  // Load data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError('');
        const dataService = new DataService();
        const response = await fetch('/Twitter - Next.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        await dataService.loadData(new Blob([arrayBuffer]));
        const processedTopics = dataService.generateTopics();
        
        // Extract all tweets for geography analysis
        const tweets = [];
        processedTopics.forEach(topic => {
          topic.subtopics.forEach(subtopic => {
            tweets.push(...subtopic.tweets);
          });
        });
        
        setAllTweets(tweets);
        setTopics(processedTopics);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Memoized navigation handlers
  const handleTopicSelect = useCallback(topic => {
    setShowGeographyView(false);
    setCurrentTopic(topic);
    setCurrentSubtopic(null);
  }, []);
  
  const handleSubtopicSelect = useCallback(subtopic => {
    setShowGeographyView(false);
    setCurrentSubtopic(subtopic);
  }, []);
  
  const handleBack = useCallback(() => {
    if (showGeographyView) setShowGeographyView(false);
    else if (currentSubtopic) setCurrentSubtopic(null);
    else if (currentTopic) setCurrentTopic(null);
  }, [currentTopic, currentSubtopic, showGeographyView]);
  
  const handleShowGeography = useCallback(() => {
    setShowGeographyView(true);
  }, []);

  // State for showing topic matrix
  const [showTopicMatrix, setShowTopicMatrix] = useState(false);
  
  // Handler for showing topic matrix
  const handleShowTopicMatrix = useCallback(() => {
    setShowTopicMatrix(true);
  }, []);

  // Current view determination
  const currentView = useMemo(() => {
    if (showTopicMatrix) return 'topic-matrix';
    if (showGeographyView) return 'geography';
    if (currentSubtopic) return 'tweets';
    if (currentTopic) return 'subtopics';
    return 'dashboard';
  }, [currentTopic, currentSubtopic, showGeographyView, showTopicMatrix]);

  // Custom Loading Component with progress animation
  const LoadingDisplay = () => (
    <div className="app-container">
      <div className="loading-container text-center">
        <h3 className="mb-3">Loading Data</h3>
        <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <ProgressBar animated now={100} className="mt-3" style={{ height: '6px' }} />
        <p className="mt-3 text-muted">Processing Twitter data for Next fashion complaints analysis...</p>
      </div>
    </div>
  );
  
  // Error Display Component
  const ErrorDisplay = ({ message, onRetry }) => (
    <div className="app-container">
      <div className="error-container text-center p-4">
        <Alert variant="danger" className="mb-3">
          <Alert.Heading><i className="bi bi-exclamation-triangle me-2"></i>Data Loading Error</Alert.Heading>
          <p className="mt-2">{message}</p>
        </Alert>
        <Button variant="primary" onClick={onRetry} size="lg">
          <i className="bi bi-arrow-clockwise me-2"></i>Try Again
        </Button>
      </div>
    </div>
  );

  // Main navigation UI
  return (
    <div className="app">
      <Header 
        view={currentView} 
        onBack={handleBack} 
        viewMode={viewMode}
        onToggleView={() => setViewMode(viewMode === 'analytics' ? 'browse' : 'analytics')}
        onShowMatrix={handleShowTopicMatrix}
      />
      
      {loading && (
        <LoadingDisplay />
      )}

      {error && (
        <ErrorDisplay message={error} onRetry={() => setError('')} />
      )}
      
      {viewMode === 'analytics' && topics.length && !showTopicMatrix && (
        <Suspense fallback={
          <div className="p-4 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading analytics dashboard...</p>
          </div>
        }>
          <Dashboard topics={topics} />
        </Suspense>
      )}
      
      {showTopicMatrix && topics.length && (
        <Container fluid className="py-4">
          <TopicComplaintMatrix 
            topics={topics} 
            onBack={() => {
              setShowTopicMatrix(false);
            }} 
          />
        </Container>
      )}

      {viewMode === 'browse' && topics.length && !showTopicMatrix && (
        <>
          {currentView === 'dashboard' && (
            <div className="dashboard">
              <h2 className="mb-4">Complaint Categories</h2>
              <div className="d-flex justify-content-end mb-3">

              </div>
              <div className="topics-list">
                {topics.map(topic => (
                  <TopicCard key={topic.name} topic={topic} onSelect={handleTopicSelect} />
                ))}
              </div>
            </div>
          )}
          
          {currentView === 'subtopics' && currentTopic && (
            <div className="subtopics-list">
              <h3 className="mb-4">Subtopics in {currentTopic.name}</h3>
              <div className="subtopics-list">
                {currentTopic.subtopics.map(subtopic => (
                  <SubtopicCard key={subtopic.name} subtopic={subtopic} onSelect={handleSubtopicSelect} />
                ))}
              </div>
            </div>
          )}
          
          {currentView === 'tweets' && currentSubtopic && (
            <SubtopicDashboard 
              tweets={currentSubtopic.tweets} 
              topic={currentTopic} 
              subtopic={currentSubtopic} 
              onBack={handleBack} 
            />
          )}
          
          {currentView === 'geography' && (
            <GeographyDashboard 
              tweets={allTweets}
              topic={currentTopic?.name}
              onBack={handleBack}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
