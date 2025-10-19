/**
 * NM3 Exporter
 * Converts search results to NM3 (Nested Markdown 3D) format
 */

const { slugify } = require('./markdown-exporter');

// Map visualization colors to NM3 pastel palette
const COLOR_MAP = {
  '#FF6B6B': 'pastel-pink',
  '#4ECDC4': 'pastel-blue',
  '#45B7D1': 'pastel-sky',
  '#FFA07A': 'pastel-orange',
  '#98D8C8': 'pastel-mint',
  '#F7DC6F': 'pastel-yellow',
  '#BB8FCE': 'pastel-purple',
  '#85C1E2': 'pastel-sky',
  '#F8B88B': 'pastel-peach',
  '#A8D8EA': 'pastel-sky'
};

function mapColor(hexColor) {
  return COLOR_MAP[hexColor.toUpperCase()] || 'pastel-blue';
}

function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateNodeId(name, index) {
  const base = slugify(name);
  return `node-${index}-${base.substring(0, 20)}`;
}

function exportToNM3(query, results, nodes, camera, timestamp) {
  const lines = [];
  
  // XML declaration
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<nm3 version="1.0">');
  
  // Metadata
  lines.push('  <meta');
  lines.push(`    title="Search: ${escapeXml(query)}"`);
  lines.push(`    created="${new Date(timestamp).toISOString()}"`);
  lines.push('    author="Perplexity 3D Search"');
  lines.push('    tags="search,perplexity,3d-visualization"');
  lines.push(`    description="3D visualization of search results for: ${escapeXml(query)}" />`);
  lines.push('');
  
  // Camera
  lines.push('  <camera');
  lines.push(`    position-x="${camera.position.x.toFixed(2)}"`);
  lines.push(`    position-y="${camera.position.y.toFixed(2)}"`);
  lines.push(`    position-z="${camera.position.z.toFixed(2)}"`);
  lines.push(`    look-at-x="${camera.lookAt.x.toFixed(2)}"`);
  lines.push(`    look-at-y="${camera.lookAt.y.toFixed(2)}"`);
  lines.push(`    look-at-z="${camera.lookAt.z.toFixed(2)}"`);
  lines.push(`    fov="${camera.fov || 75}" />`);
  lines.push('');
  
  // Nodes
  lines.push('  <nodes>');
  
  results.forEach((result, index) => {
    const nodeData = nodes[index];
    const nodeId = generateNodeId(result.name, index);
    const color = mapColor(nodeData.color);
    
    lines.push(`    <node`);
    lines.push(`      id="${nodeId}"`);
    lines.push(`      type="sphere"`);
    lines.push(`      x="${nodeData.position.x.toFixed(2)}"`);
    lines.push(`      y="${nodeData.position.y.toFixed(2)}"`);
    lines.push(`      z="${nodeData.position.z.toFixed(2)}"`);
    lines.push(`      scale="1.0"`);
    lines.push(`      color="${color}"`);
    lines.push(`      created="${new Date(timestamp).toISOString()}">`);
    lines.push('');
    lines.push(`      <title>${escapeXml(result.name)}</title>`);
    lines.push('');
    lines.push('      <content><![CDATA[');
    lines.push(`# ${result.name}`);
    lines.push('');
    lines.push(`**URL:** ${result.url}`);
    lines.push('');
    lines.push(`**Source:** Perplexity Search`);
    lines.push('');
    lines.push('## Description');
    lines.push('');
    lines.push(result.description);
    lines.push('');
    lines.push(`*Search Query: "${query}"*`);
    lines.push('      ]]></content>');
    lines.push('');
    lines.push(`      <tags>search-result,perplexity,result-${index + 1}</tags>`);
    lines.push('    </node>');
    lines.push('');
  });
  
  lines.push('  </nodes>');
  lines.push('');
  
  // Links - Sequential leads-to connections
  lines.push('  <links>');
  
  for (let i = 0; i < results.length - 1; i++) {
    const fromId = generateNodeId(results[i].name, i);
    const toId = generateNodeId(results[i + 1].name, i + 1);
    
    lines.push(`    <link`);
    lines.push(`      from="${fromId}"`);
    lines.push(`      to="${toId}"`);
    lines.push(`      type="leads-to"`);
    lines.push(`      color="pastel-gray"`);
    lines.push(`      thickness="1"`);
    lines.push(`      opacity="0.6" />`);
  }
  
  lines.push('  </links>');
  lines.push('</nm3>');
  
  return lines.join('\n');
}

function generateFilename(query) {
  const slug = slugify(query);
  return `${slug}.nm3`;
}

module.exports = {
  exportToNM3,
  generateFilename
};
