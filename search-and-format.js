require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.error('Error: PERPLEXITY_API_KEY not found in .env file');
  process.exit(1);
}

// Perplexity Sonar Pro API configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Truncate string to specified character limit
function truncateString(str, maxLength = 300) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return url;
  }
}

// Parse search results from API response
function parseSearchResults(responseText) {
  const results = [];
  
  // Pattern: [number] Website Name (URL) - Description (handles multi-line)
  // Match everything between [N] and the next [N+1] or end of string
  const pattern = /\[(\d+)\]\s+([^\(]+?)\s*\(([^)]+)\)\s*-\s*(.+?)(?=\n\n\[|\n\[|\s\[|$)/gs;
  
  let match;
  
  while ((match = pattern.exec(responseText)) !== null) {
    const [_, number, name, url, description] = match;
    
    if (name && url) {
      // Clean up description: remove extra whitespace and newlines
      const cleanDescription = description
        .replace(/\n/g, ' ')  // Replace newlines with spaces
        .replace(/\s+/g, ' ')  // Collapse multiple spaces
        .trim();
      
      results.push({
        name: name.trim(),
        url: url.trim(),
        description: truncateString(cleanDescription, 300)
      });
    }
  }
  
  return results;
}

// Format results as markdown
function formatMarkdown(results) {
  let markdown = '# Search Results\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n`;
  markdown += `Total Results: ${results.length}\n\n`;
  markdown += '---\n\n';
  
  results.forEach((result, index) => {
    markdown += `* ${result.name}\n`;
    markdown += `* ${result.url}\n`;
    markdown += `* ${result.description}\n\n`;
  });
  
  return markdown;
}

// Main search function
async function performSearch(query, maxResults = 10) {
  try {
    console.log(`Searching for: "${query}"`);
    console.log('Connecting to Perplexity API...\n');
    
    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: `Find ${maxResults} different websites about: ${query}

IMPORTANT: List exactly ${maxResults} separate websites. Do not write an essay or summary.

Format each result EXACTLY like this:
[1] Website Name (https://example.com) - Brief description
[2] Website Name (https://example.com) - Brief description
[3] Website Name (https://example.com) - Brief description

Continue until you have listed ${maxResults} different websites.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const apiResponse = response.data.choices[0].message.content;
    console.log('API Response received\n');
    
    // Check if citations are available in the response
    const citations = response.data.citations || [];
    
    let results = [];
    
    // Parse the formatted text response (most reliable for this API)
    results = parseSearchResults(apiResponse);
    
    // If text parsing fails and we have citations, try to use those
    if (results.length === 0 && citations.length > 0) {
      console.log('Attempting to extract from citations...\n');
      results = citations.slice(0, maxResults).map((citation, index) => ({
        name: citation.title || citation.source || extractDomain(citation.url),
        url: citation.url,
        description: truncateString(citation.text || citation.excerpt || 'No description available', 300)
      })).filter(r => r.url); // Filter out any with undefined URLs
      console.log(`✓ Extracted ${results.length} results from citations\n`);
    }
    
    if (results.length === 0) {
      console.warn('Warning: No structured results found in response.');
      console.warn('Raw response:', apiResponse);
      return [];
    }
    
    console.log(`✓ Successfully parsed ${results.length} results\n`);
    
    return results;
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Error: Invalid API key. Please check PERPLEXITY_API_KEY in .env');
    } else if (error.response?.status === 429) {
      console.error('Error: Rate limited. Please wait before trying again.');
    } else if (error.message === 'Network Error') {
      console.error('Error: Network connection failed.');
    } else {
      console.error('API Error:', error.response?.data?.error?.message || error.message);
    }
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node search-and-format.js "<search query>" [max_results]');
    console.log('Example: node search-and-format.js "AI trends 2025" 10');
    process.exit(1);
  }
  
  const query = args[0];
  const maxResults = args[1] ? parseInt(args[1]) : 10;
  
  // Perform search
  const results = await performSearch(query, maxResults);
  
  // Format as markdown
  const markdown = formatMarkdown(results);
  
  // Write to file
  const outputFile = 'results.md';
  fs.writeFileSync(outputFile, markdown);
  
  console.log(`✓ Results saved to ${outputFile}`);
  console.log(`\n${markdown}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
