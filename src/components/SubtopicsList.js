import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';

const SubtopicsList = ({ subtopics, onSelectSubtopic, topic }) => {
  // Generate a random background color for each subtopic card
  const getRandomColor = () => {
    const colors = [
      'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="subtopics-container">
      <h2 className="mb-4">{topic.name} Subtopics</h2>
      <p className="lead mb-4">
        Selected topic has {topic.tweetCount} tweets categorized into {subtopics.length} subtopics. 
        Click on a subtopic to see related tweets.
      </p>
      
      <Row xs={1} md={2} lg={3} className="g-4">
        {subtopics.map((subtopic, idx) => (
          <Col key={idx}>
            <Card 
              className="h-100 subtopic-card" 
              onClick={() => onSelectSubtopic(subtopic)}>
              <Card.Header className={`bg-${getRandomColor()} text-white`}>
                {subtopic.name}
              </Card.Header>
              <Card.Body>
                <Card.Title>
                  <Badge bg="secondary" pill>{subtopic.tweetCount} tweets</Badge>
                </Card.Title>
                <Card.Text>
                  Keywords: {subtopic.keywords.slice(0, 5).join(', ')}
                  {subtopic.keywords.length > 5 && '...'}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="text-muted">
                Click to view tweets
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SubtopicsList;
