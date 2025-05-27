const XLSX = require('xlsx');
const fs = require('fs');

// Load the Excel file
const workbook = XLSX.readFile('Twitter - Next.xlsx');

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(sheet);

// Print the first few rows to understand structure
console.log('First 3 rows:', JSON.stringify(data.slice(0, 3), null, 2));

// Check if we have replies data
const hasReplies = data.some(row => row.Replies !== undefined || row.replies !== undefined);
console.log('Has Replies data:', hasReplies);

// Count unique users
const uniqueUsers = new Set(data.map(row => row.User || row.user)).size;
console.log('Unique Users:', uniqueUsers);

// Check for date format
const dateExample = data[0].Date || data[0].date;
console.log('Date format example:', dateExample);
