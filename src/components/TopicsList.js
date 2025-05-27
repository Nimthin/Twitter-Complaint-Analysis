import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';

const TopicsList = ({ topics, onSelectTopic }) => {
  // Generate a random background color for each topic card
  const getRandomColor = () => {
    const colors = [
      'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="topics-container">
      <h2 className="mb-4">Topics from Twitter Complaints</h2>
      <p className="lead mb-4">
        Click on a topic to explore subtopics and related tweets from "Next" fashion brand customers.
      </p>
      
      <Row xs={1} md={2} lg={3} className="g-4">
        {topics.map((topic, idx) => (
          <Col key={idx}>
            <Card 
              className="h-100 topic-card" 
              onClick={() => onSelectTopic(topic)}>
              <Card.Header className={`bg-${getRandomColor()} text-white`}>
                {topic.name}
              </Card.Header>
              <Card.Body>
                <Card.Title>
                  <Badge bg="secondary" pill>{topic.tweetCount} tweets</Badge>
                </Card.Title>
                <Card.Text>
                  {topic.subtopics.map((subtopic, index) => (
                    <Badge 
                      key={index}
                      bg="light" 
                      text="dark"
                      className="me-1 mb-1">
                      {subtopic.name} ({subtopic.tweetCount})
                    </Badge>
                  ))}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="text-muted">
                Click to explore subtopics
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TopicsList;
