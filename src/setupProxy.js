const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

module.exports = function(app) {
  // Test endpoint to check file access
  app.get('/api/test-file', (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'Twitter - Next.xlsx');
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File access error:', err);
        return res.status(404).json({ 
          success: false, 
          error: 'File not found',
          path: filePath,
          files: fs.readdirSync(path.join(__dirname, '..', 'public'))
        });
      }
      
      const stats = fs.statSync(filePath);
      res.json({
        success: true,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      });
    });
  });
};
