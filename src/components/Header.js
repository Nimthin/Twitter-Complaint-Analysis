import React, { memo } from 'react';
import { Navbar, Container, Button, Badge } from 'react-bootstrap';

const Header = memo(({ view, onBack, topic, subtopic, viewMode = 'analytics', onToggleView, onShowMatrix }) => {
  const currentView = view || 'dashboard';
  const showBackButton = currentView !== 'dashboard' && viewMode !== 'analytics';

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand>
          <i className="bi bi-twitter me-2"></i>
          Next Fashion Complaints Analysis
        </Navbar.Brand>
        
        <div className="d-flex align-items-center">
          {showBackButton && (
            <Button variant="outline-light" size="sm" onClick={onBack} className="me-2">
              <i className="bi bi-arrow-left"></i> Back
            </Button>
          )}

          {viewMode === 'analytics' && onShowMatrix && (
            <Button
              variant="outline-light"
              size="sm"
              onClick={onShowMatrix}
              className="me-2"
            >
              <i className="bi bi-table me-1"></i>
              Topic-Complaint Matrix
            </Button>
          )}
          
          {onToggleView && (
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={onToggleView} 
              className="ms-2"
            >
              <i className={`bi bi-${viewMode === 'analytics' ? 'list' : 'graph-up'} me-1`}></i>
              {viewMode === 'analytics' ? 'Topic Browser' : 'Analytics Dashboard'}
            </Button>
          )}
          
          {(currentView !== 'dashboard' && viewMode !== 'analytics') && (
            <Badge bg="info" className="ms-2">
              {currentView === 'tweets' ? 'Viewing Tweets' : 'Viewing Subtopics'}
            </Badge>
          )}
        </div>
      </Container>
    </Navbar>
  );
});

export default Header;
