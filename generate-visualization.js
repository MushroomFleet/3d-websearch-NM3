const ResultsParser = require('./lib/parser');
const Visualizer = require('./lib/visualizer');
const path = require('path');

function main() {
  const resultsFile = path.join(__dirname, 'results.md');
  
  console.log('Parsing results...');
  const parser = new ResultsParser(resultsFile);
  const results = parser.parse();

  if (results.length === 0) {
    console.error('Error: No results found in results.md');
    console.error('Please run: node search-and-format.js "<query>"');
    process.exit(1);
  }

  console.log(`✓ Parsed ${results.length} results`);
  console.log('\nGenerating 3D visualization...');

  const visualizer = new Visualizer(results);
  visualizer.save('index.html');

  console.log('\n✓ Open index.html in your browser to view the visualization');
  console.log('\nControls:');
  console.log('  • Drag mouse: Rotate view');
  console.log('  • Scroll: Zoom in/out');
  console.log('  • Click node: Visit website');
  console.log('  • SPACEBAR: Toggle auto-rotation');
  console.log('  • R: Reset view');
}

main();
