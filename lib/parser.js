const fs = require('fs');

class ResultsParser {
  constructor(filePath = 'results.md') {
    this.filePath = filePath;
  }

  parse() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return this.extractResults(content);
    } catch (error) {
      console.error(`Error reading ${this.filePath}:`, error.message);
      return [];
    }
  }

  extractResults(content) {
    const results = [];
    
    // Split by the pattern of "* name" entries
    const lines = content.split('\n');
    let currentResult = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip header lines
      if (line.startsWith('#') || line.startsWith('---') || 
          line.startsWith('Generated:') || line.startsWith('Total Results:') || !line) {
        continue;
      }

      // Lines starting with "* "
      if (line.startsWith('* ')) {
        const content = line.substring(2).trim();
        
        // Check if it's a URL
        if (content.startsWith('http://') || content.startsWith('https://')) {
          if (currentResult && !currentResult.url) {
            currentResult.url = content;
          }
        } else if (!currentResult || (currentResult.name && currentResult.url && currentResult.description)) {
          // Save previous result if complete
          if (currentResult && currentResult.name && currentResult.url && currentResult.description) {
            results.push(currentResult);
          }
          // Start new result
          currentResult = { name: content, url: '', description: '' };
        } else if (currentResult && currentResult.url && !currentResult.description) {
          // This is the description
          currentResult.description = content;
        }
      }
    }

    // Don't forget the last result
    if (currentResult && currentResult.name && currentResult.url && currentResult.description) {
      results.push(currentResult);
    }

    return results;
  }
}

module.exports = ResultsParser;
