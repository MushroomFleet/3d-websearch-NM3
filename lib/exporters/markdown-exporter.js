/**
 * Markdown Exporter
 * Converts search results to markdown format
 */

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function exportToMarkdown(query, results, timestamp) {
  const lines = [];
  
  // Header
  lines.push(`# Search Results: ${query}`);
  lines.push('');
  lines.push(`**Generated:** ${new Date(timestamp).toLocaleString()}`);
  lines.push(`**Total Results:** ${results.length}`);
  lines.push(`**Query:** "${query}"`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Results
  results.forEach((result, index) => {
    lines.push(`## ${index + 1}. ${result.name}`);
    lines.push('');
    lines.push(`**URL:** ${result.url}`);
    lines.push('');
    lines.push(result.description);
    lines.push('');
    lines.push('---');
    lines.push('');
  });
  
  // Footer
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Exported from Perplexity 3D Search Visualization*');
  
  return lines.join('\n');
}

function generateFilename(query) {
  const slug = slugify(query);
  return `${slug}.md`;
}

module.exports = {
  exportToMarkdown,
  generateFilename,
  slugify
};
