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
  
  // Map records to a simpler format
  for (let i = 0; i < totalItems; i++) {
    const row = data[i];
    
    result.push({
      id: i,
      text: row.Tweet || row.text || row.tweets || '',
      date: row.Date || row.date || '',
      likes: parseInt(row.Likes || row.likes || 0),
      retweets: parseInt(row.Retweets || row.retweets || 0),
      user: row.User || row.user || row.Author || 'User',
      url: row.URL || row.url || '#'
    });
    
    // Report progress periodically
    if (i % chunkSize === 0) {
      self.postMessage({
        status: 'progress',
        progress: Math.round((i / totalItems) * 100)
      });
    }
  }
  
  return result;
}
