import * as XLSX from 'xlsx';
import TopicModelingService from './TopicModelingService';

const { processTweets, TOPIC_DEFINITIONS } = TopicModelingService;

async function loadAndProcessData() {
  try {
    console.log('SimpleDataLoader: Starting data load...');
    
    // Fetch the Excel file
    const response = await fetch('/Twitter - Next.xlsx');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Convert to array buffer
    const arrayBuffer = await response.arrayBuffer();
    console.log('SimpleDataLoader: File loaded, size:', arrayBuffer.byteLength);
    
    // Parse Excel file
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    console.log('SimpleDataLoader: Parsed', rawData.length, 'records');
    
    // Map to tweet format
    const tweets = rawData.map((row, idx) => ({
      id: idx,
      text: row.Tweet || row.text || '',
      date: row.Date || row.date || '',
      likes: row.Likes || row.likes || 0,
      retweets: row.Retweets || row.retweets || 0,
      user: row.User || row.user || 'User',
      url: row.URL || row.url || '#'
    }));
    
    // Process tweets
    return processTweets(tweets, TOPIC_DEFINITIONS);
  } catch (error) {
    console.error('SimpleDataLoader: Error loading data:', error);
    throw error;
  }
}

export default { loadAndProcessData };
