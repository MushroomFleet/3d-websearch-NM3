const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

class Visualizer {
  constructor(results) {
    this.results = results;
    this.nodePositions = this.calculateNodePositions(results.length);
  }

  calculateNodePositions(count) {
    // Distribute nodes in a sphere using spherical fibonacci
    const positions = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // -1 to 1
      const radius = Math.sqrt(1 - y * y);

      const theta = phi * i;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      positions.push({ x: x * 100, y: y * 100, z: z * 100 });
    }

    return positions;
  }

  generateNodeData() {
    return this.results.map((result, index) => ({
      id: index,
      name: result.name,
      url: result.url,
      description: result.description,
      position: this.nodePositions[index],
      color: this.getColorForIndex(index)
    }));
  }

  getColorForIndex(index) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8D8EA'
    ];
    return colors[index % colors.length];
  }

  generateHTML() {
    const nodeData = this.generateNodeData();
    const template = fs.readFileSync(path.join(__dirname, '../templates/visualization.ejs'), 'utf-8');
    
    const html = ejs.render(template, {
      nodes: nodeData,
      timestamp: new Date().toISOString(),
      totalResults: this.results.length
    });

    return html;
  }

  save(outputPath = 'index.html') {
    const html = this.generateHTML();
    fs.writeFileSync(outputPath, html);
    console.log(`✓ Visualization saved to ${outputPath}`);
  }
}

module.exports = Visualizer;
