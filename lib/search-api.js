require('dotenv').config();
const axios = require('axios');

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Get model from environment or use default
function getModel() {
  return process.env.PERPLEXITY_MODEL || 'sonar-pro';
}

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
  
  const pattern = /\[(\d+)\]\s+([^\(]+?)\s*\(([^)]+)\)\s*-\s*(.+?)(?=\n\n\[|\n\[|\s\[|$)/gs;
  
  let match;
  
  while ((match = pattern.exec(responseText)) !== null) {
    const [_, number, name, url, description] = match;
    
    if (name && url) {
      const cleanDescription = description
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
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

// Main search function (exported for API use)
async function performSearch(query, maxResults = 10) {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  try {
    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: getModel(),
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
    const citations = response.data.citations || [];
    
    let results = parseSearchResults(apiResponse);
    
    // Fallback to citations if text parsing fails
    if (results.length === 0 && citations.length > 0) {
      results = citations.slice(0, maxResults).map((citation, index) => ({
        name: citation.title || citation.source || extractDomain(citation.url),
        url: citation.url,
        description: truncateString(citation.text || citation.excerpt || 'No description available', 300)
      })).filter(r => r.url);
    }
    
    if (results.length === 0) {
      throw new Error('No structured results found in API response');
    }
    
    return results;
    
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid API key');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limited. Please wait before trying again');
    } else if (error.message === 'Network Error') {
      throw new Error('Network connection failed');
    } else {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }
}

module.exports = {
  performSearch
};
