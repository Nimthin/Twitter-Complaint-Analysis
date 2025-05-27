// Web Worker for processing XLSX data without blocking the UI thread

// Import libraries directly in the worker
importScripts('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');

// Message handler for processing the Excel file
self.onmessage = async function(e) {
  try {
    console.log('Worker: Processing started');
    const { data, action } = e.data;
    
    if (action === 'process_excel') {
      const arrayBuffer = data;
      
      // Parse the Excel file
      console.log('Worker: Parsing Excel file...');
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      console.log('Worker: Parsed', rawData.length, 'records');
      
      // Process the data in smaller chunks to prevent long-running scripts
      const processedData = processInChunks(rawData);
      
      // Log the extracted topics and subtopics for debugging
      console.log('Worker: Extracted topics:', processedData.topicsList);
      console.log('Worker: Extracted subtopics map:', processedData.subtopicsMap);
      
      // Send the processed data back to the main thread
      self.postMessage({
        status: 'success',
        data: processedData
      });
    }
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({
      status: 'error',
      error: error.message
    });
  }
};

// Process data in smaller chunks to prevent UI freezing
function processInChunks(data, chunkSize = 100) {
  const result = [];
  const totalItems = data.length;
  const topics = new Set();
  const subtopicsByTopic = {};
  
  // First pass: Extract all unique topics and subtopics
  for (let i = 0; i < totalItems; i++) {
    const row = data[i];
    const topic = row.Topic || row.topic || '';
    const subtopic = row.Subtopic || row.subtopic || '';
    
    if (topic) {
      topics.add(topic);
      
      if (!subtopicsByTopic[topic]) {
        subtopicsByTopic[topic] = new Set();
      }
      
      if (subtopic) {
        subtopicsByTopic[topic].add(subtopic);
      }
    }
  }
  
  // Map records to a simpler format
  for (let i = 0; i < totalItems; i++) {
    const row = data[i];
    const tweetTopic = row.Topic || row.topic || '';
    const tweetSubtopic = row.Subtopic || row.subtopic || '';
    
    result.push({
      id: i,
      text: row.Tweet || row.text || row.tweets || '',
      date: row.Date || row.date || '',
      likes: parseInt(row.Likes || row.likes || 0),
      retweets: parseInt(row.Retweets || row.retweets || 0),
      user: row.User || row.user || row.Author || 'User',
      url: row.URL || row.url || '#',
      primaryTopic: tweetTopic,
      subtopic: tweetSubtopic
    });
    
    // Report progress periodically
    if (i % chunkSize === 0) {
      self.postMessage({
        status: 'progress',
        progress: Math.round((i / totalItems) * 100)
      });
    }
  }
  
  // Convert sets to arrays
  const topicsList = Array.from(topics);
  const subtopicsMap = {};
  
  Object.keys(subtopicsByTopic).forEach(topic => {
    subtopicsMap[topic] = Array.from(subtopicsByTopic[topic]);
  });
  
  return {
    tweets: result,
    topicsList: topicsList,
    subtopicsMap: subtopicsMap
  };
}
