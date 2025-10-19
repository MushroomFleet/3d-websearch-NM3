require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { performSearch } = require('./lib/search-api');
const Visualizer = require('./lib/visualizer');
const { exportToMarkdown, generateFilename: generateMdFilename } = require('./lib/exporters/markdown-exporter');
const { exportToNM3, generateFilename: generateNm3Filename } = require('./lib/exporters/nm3-exporter');
const settingsManager = require('./lib/settings-manager');

// Ensure .env file exists on startup
settingsManager.ensureEnvExists();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store current search results
let currentResults = [];
let currentQuery = '';

// API endpoint for search
app.post('/api/search', async (req, res) => {
  try {
    const { query, maxResults = 10 } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Query is required and must be a non-empty string' 
      });
    }

    const resultCount = parseInt(maxResults);
    if (isNaN(resultCount) || resultCount < 5 || resultCount > 20) {
      return res.status(400).json({ 
        error: 'maxResults must be between 5 and 20' 
      });
    }

    console.log(`Searching for: "${query}" with ${resultCount} results`);
    
    // Perform search
    const results = await performSearch(query.trim(), resultCount);
    
    // Store results
    currentResults = results;
    currentQuery = query.trim();
    
    // Generate visualization data
    const visualizer = new Visualizer(results);
    const nodeData = visualizer.generateNodeData();
    
    console.log(`✓ Found ${results.length} results`);
    
    res.json({
      success: true,
      query: currentQuery,
      totalResults: results.length,
      nodes: nodeData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ 
      error: error.message || 'Search failed'
    });
  }
});

// Export endpoints
app.post('/api/export/markdown', (req, res) => {
  try {
    const { query, results, timestamp } = req.body;
    
    if (!query || !results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    const markdown = exportToMarkdown(query, results, timestamp);
    const filename = generateMdFilename(query);
    
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(markdown);
    
  } catch (error) {
    console.error('Markdown export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

app.post('/api/export/nm3', (req, res) => {
  try {
    const { query, results, nodes, camera, timestamp } = req.body;
    
    if (!query || !results || !nodes || !camera) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    const nm3 = exportToNM3(query, results, nodes, camera, timestamp);
    const filename = generateNm3Filename(query);
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(nm3);
    
  } catch (error) {
    console.error('NM3 export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  try {
    const settings = settingsManager.getCurrentSettings();
    
    // Don't send actual API key, only masked version and status
    res.json({
      apiKeyMasked: settings.apiKeyMasked,
      model: settings.model,
      isConfigured: settings.isConfigured,
      availableModels: settings.availableModels
    });
  } catch (error) {
    console.error('Settings read error:', error);
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const { apiKey, model } = req.body;
    
    // Update settings
    settingsManager.updateSettings(apiKey, model);
    
    console.log(`✓ Settings updated - Model: ${model || 'unchanged'}, API Key: ${apiKey ? 'updated' : 'unchanged'}`);
    
    // Get updated settings
    const settings = settingsManager.getCurrentSettings();
    
    res.json({
      success: true,
      apiKeyMasked: settings.apiKeyMasked,
      model: settings.model,
      isConfigured: settings.isConfigured
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Serve the main visualization page
app.get('/', (req, res) => {
  // If we have current results, serve them, otherwise serve initial empty state
  const visualizer = currentResults.length > 0 
    ? new Visualizer(currentResults) 
    : new Visualizer([{
        name: 'Start by searching',
        url: '#',
        description: 'Enter a search query in the panel on the left to begin'
      }]);
  
  const nodeData = visualizer.generateNodeData();
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Search Results Visualization</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
            overflow: hidden;
            height: 100vh;
            color: #e0e0e0;
        }

        #canvas {
            display: block;
            width: 100%;
            height: 100%;
        }

        #searchPanel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.85);
            padding: 25px;
            border-radius: 12px;
            width: 320px;
            border-left: 4px solid #4ECDC4;
            z-index: 10;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        #searchPanel h2 {
            color: #4ECDC4;
            margin-bottom: 20px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .input-group {
            margin-bottom: 20px;
        }

        .input-group label {
            display: block;
            color: #b0b0b0;
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 500;
        }

        #searchInput {
            width: 100%;
            padding: 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(78, 205, 196, 0.3);
            border-radius: 6px;
            color: #fff;
            font-size: 14px;
            transition: all 0.3s;
        }

        #searchInput:focus {
            outline: none;
            border-color: #4ECDC4;
            background: rgba(255, 255, 255, 0.15);
        }

        .slider-group {
            margin-bottom: 20px;
        }

        .slider-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .slider-value {
            color: #4ECDC4;
            font-weight: bold;
            font-size: 16px;
        }

        #resultCount {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: rgba(78, 205, 196, 0.2);
            outline: none;
            -webkit-appearance: none;
        }

        #resultCount::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #4ECDC4;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(78, 205, 196, 0.5);
        }

        #resultCount::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #4ECDC4;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 8px rgba(78, 205, 196, 0.5);
        }

        #searchButton {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%);
            border: none;
            border-radius: 8px;
            color: #0f172a;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        #searchButton:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4);
        }

        #searchButton:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .spinner-small {
            border: 2px solid rgba(15, 23, 42, 0.3);
            border-top-color: #0f172a;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            animation: spin 0.8s linear infinite;
        }

        #statusMessage {
            margin-top: 15px;
            padding: 10px;
            border-radius: 6px;
            font-size: 13px;
            text-align: center;
            display: none;
        }

        #statusMessage.success {
            background: rgba(144, 238, 144, 0.1);
            color: #90ee90;
            border: 1px solid rgba(144, 238, 144, 0.3);
        }

        #statusMessage.error {
            background: rgba(255, 107, 107, 0.1);
            color: #FF6B6B;
            border: 1px solid rgba(255, 107, 107, 0.3);
        }

        #info {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            padding: 20px;
            border-radius: 8px;
            max-width: 300px;
            border-left: 3px solid #FF6B6B;
            z-index: 10;
            font-size: 13px;
        }

        #info h3 {
            color: #FF6B6B;
            margin-bottom: 10px;
            font-size: 15px;
        }

        #info p {
            margin: 5px 0;
            color: #b0b0b0;
        }

        #tooltip {
            position: absolute;
            background: rgba(0, 0, 0, 0.95);
            color: #fff;
            padding: 14px 18px;
            border-radius: 8px;
            pointer-events: none;
            display: none;
            border: 1px solid #4ECDC4;
            font-size: 12px;
            max-width: 320px;
            z-index: 100;
            word-wrap: break-word;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
        }

        #controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 12px;
            text-align: center;
            border-top: 1px solid #4ECDC4;
        }

        .control-hint {
            color: #4ECDC4;
            font-weight: bold;
            margin: 5px 0;
        }

        #loadingOverlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 999;
            backdrop-filter: blur(4px);
        }

        #loadingOverlay.active {
            display: flex;
        }

        .loading-content {
            background: rgba(0, 0, 0, 0.9);
            padding: 40px 60px;
            border-radius: 12px;
            text-align: center;
            border: 2px solid #4ECDC4;
        }

        .spinner {
            border: 4px solid rgba(78, 205, 196, 0.3);
            border-top-color: #4ECDC4;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        a {
            color: #4ECDC4;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        #currentQuery {
            color: #4ECDC4;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <canvas id="canvas"></canvas>

    <div id="searchPanel">
        <h2>🔍 Search <button id="settingsBtn" style="margin-left: auto; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(78, 205, 196, 0.3); padding: 6px 10px; border-radius: 6px; color: #4ECDC4; cursor: pointer; font-size: 16px;">⚙️</button></h2>
        
        <div class="input-group">
            <label for="searchInput">Search Query</label>
            <input 
                type="text" 
                id="searchInput" 
                placeholder="e.g., AI trends 2025"
                value="${currentQuery}"
            />
        </div>

        <div class="slider-group">
            <div class="slider-label">
                <label>Results</label>
                <span class="slider-value" id="resultCountValue">${currentResults.length || 10}</span>
            </div>
            <input 
                type="range" 
                id="resultCount" 
                min="5" 
                max="20" 
                value="${currentResults.length || 10}"
                step="1"
            />
        </div>

        <button id="searchButton">
            <span id="buttonText">Update Graph</span>
        </button>

        <div id="statusMessage"></div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(78, 205, 196, 0.2);">
            <label style="display: block; color: #b0b0b0; margin-bottom: 12px; font-size: 13px; font-weight: 500;">Export Options:</label>
            <div style="display: flex; gap: 10px;">
                <button id="exportMarkdown" style="flex: 1; padding: 10px; background: rgba(144, 238, 144, 0.2); border: 1px solid rgba(144, 238, 144, 0.4); border-radius: 6px; color: #90ee90; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    💾 Save MD
                </button>
                <button id="exportNM3" style="flex: 1; padding: 10px; background: rgba(186, 225, 255, 0.2); border: 1px solid rgba(186, 225, 255, 0.4); border-radius: 6px; color: #BAE1FF; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    📦 Export NM3
                </button>
            </div>
        </div>
    </div>

    <div id="info">
        <h3>Current Results</h3>
        <p><strong>Query:</strong> <span id="currentQuery">${currentQuery || 'None'}</span></p>
        <p><strong>Total:</strong> <span id="totalResults">${currentResults.length}</span></p>
        <p><strong>Model:</strong> <span id="currentModel" style="color: #F7DC6F;">Loading...</span></p>
        <p><strong>FPS:</strong> <span id="fps">0</span></p>
        <p style="margin-top: 12px; color: #90ee90; font-size: 12px;">Hover nodes for details<br>Click to visit</p>
    </div>

    <div id="tooltip"></div>

    <div id="controls">
        <div class="control-hint">🖱️ DRAG: Rotate | SCROLL: Zoom | CLICK: Visit</div>
        <div style="color: #b0b0b0; margin-top: 8px;">SPACEBAR: Auto-Rotate | R: Reset</div>
    </div>

    <div id="loadingOverlay">
        <div class="loading-content">
            <div class="spinner"></div>
            <p style="color: #4ECDC4; font-size: 16px;">Searching...</p>
        </div>
    </div>

    <!-- Settings Modal -->
    <div id="settingsModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); z-index: 10000; align-items: center; justify-content: center;">
        <div style="background: rgba(0, 0, 0, 0.95); padding: 35px; border-radius: 16px; width: 90%; max-width: 500px; border: 2px solid #4ECDC4; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="color: #4ECDC4; font-size: 22px; margin: 0;">⚙️ Settings</h2>
                <button id="closeSettings" style="background: rgba(255, 107, 107, 0.2); border: 1px solid rgba(255, 107, 107, 0.4); padding: 8px 14px; border-radius: 6px; color: #FF6B6B; cursor: pointer; font-size: 18px; font-weight: bold;">×</button>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; color: #b0b0b0; margin-bottom: 10px; font-size: 14px; font-weight: 500;">🔑 API Key</label>
                <div style="display: flex; gap: 10px;">
                    <input type="password" id="apiKeyInput" placeholder="sk-pplx-..." style="flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(78, 205, 196, 0.3); border-radius: 6px; color: #fff; font-size: 14px; font-family: monospace;" />
                    <button id="toggleApiKey" style="padding: 12px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(78, 205, 196, 0.3); border-radius: 6px; color: #4ECDC4; cursor: pointer; font-size: 14px;">👁️</button>
                </div>
                <p style="margin-top: 8px; font-size: 12px; color: #b0b0b0;">Currently: <span id="currentApiKey" style="color: #F7DC6F;">Loading...</span></p>
                <p style="margin-top: 4px; font-size: 11px; color: #85C1E2;">Get your API key at: <a href="https://www.perplexity.ai/api/" target="_blank" style="color: #4ECDC4;">perplexity.ai/api</a></p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <label style="display: block; color: #b0b0b0; margin-bottom: 10px; font-size: 14px; font-weight: 500;">🤖 Model Selection</label>
                <select id="modelSelect" style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(78, 205, 196, 0.3); border-radius: 6px; color: #fff; font-size: 14px; cursor: pointer;">
                    <option value="sonar-pro">sonar-pro - Most Accurate (Recommended) ⭐</option>
                    <option value="sonar">sonar - Balanced Speed/Accuracy</option>
                    <option value="sonar-small">sonar-small - Fastest</option>
                </select>
                <p style="margin-top: 8px; font-size: 12px; color: #b0b0b0;">Currently using: <span id="currentModelInSettings" style="color: #F7DC6F;">Loading...</span></p>
            </div>
            
            <div id="settingsStatus" style="margin-bottom: 20px; padding: 12px; border-radius: 6px; font-size: 13px; text-align: center; display: none;"></div>
            
            <div style="display: flex; gap: 12px;">
                <button id="cancelSettings" style="flex: 1; padding: 14px; background: rgba(255, 107, 107, 0.2); border: 1px solid rgba(255, 107, 107, 0.4); border-radius: 8px; color: #FF6B6B; font-size: 15px; font-weight: 600; cursor: pointer;">Cancel</button>
                <button id="saveSettings" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%); border: none; border-radius: 8px; color: #0f172a; font-size: 15px; font-weight: 600; cursor: pointer;">Save Settings</button>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        let nodeDataArray = ${JSON.stringify(nodeData)};
        let scene, camera, renderer, nodes, nodeGroup, lines;
        let raycaster, mouse, hoveredNode;
        let autoRotate = false;
        let zoomLevel = 250;
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        function initScene() {
            const container = document.getElementById('canvas');
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
            renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true, alpha: true });

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setClearColor(0x0f172a, 1);

            camera.position.z = 250;

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0xffffff, 1);
            pointLight.position.set(100, 100, 100);
            scene.add(pointLight);

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            setupInteraction();
            updateGraph(nodeDataArray);
            animate();
        }

        function updateGraph(newNodeData) {
            // Clear existing nodes and lines
            if (nodeGroup) scene.remove(nodeGroup);
            if (lines) scene.remove(lines);
            
            nodes = [];
            nodeGroup = new THREE.Group();

            // Create new nodes
            newNodeData.forEach((nodeData) => {
                const geometry = new THREE.IcosahedronGeometry(8, 4);
                const material = new THREE.MeshPhongMaterial({
                    color: nodeData.color,
                    emissive: 0x000000,
                    shininess: 100
                });
                const mesh = new THREE.Mesh(geometry, material);

                mesh.position.set(nodeData.position.x, nodeData.position.y, nodeData.position.z);
                mesh.userData = nodeData;

                const edgeGeometry = new THREE.EdgesGeometry(geometry);
                const line = new THREE.LineSegments(edgeGeometry, 
                    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));
                mesh.add(line);

                nodeGroup.add(mesh);
                nodes.push(mesh);
            });

            scene.add(nodeGroup);

            // Create connecting lines
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions = [];

            newNodeData.forEach((node, i) => {
                const otherIndices = [
                    (i + 1) % newNodeData.length,
                    (i + 2) % newNodeData.length,
                    Math.floor(Math.random() * newNodeData.length)
                ];

                otherIndices.forEach(j => {
                    linePositions.push(
                        newNodeData[i].position.x, newNodeData[i].position.y, newNodeData[i].position.z,
                        newNodeData[j].position.x, newNodeData[j].position.y, newNodeData[j].position.z
                    );
                });
            });

            lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4ECDC4, transparent: true, opacity: 0.1 });
            lines = new THREE.LineSegments(lineGeometry, lineMaterial);
            scene.add(lines);
        }

        function setupInteraction() {
            window.addEventListener('mousemove', (e) => {
                mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(nodes);

                const tooltip = document.getElementById('tooltip');

                if (intersects.length > 0) {
                    hoveredNode = intersects[0].object;
                    const data = hoveredNode.userData;

                    tooltip.style.display = 'block';
                    tooltip.style.left = (e.clientX + 10) + 'px';
                    tooltip.style.top = (e.clientY + 10) + 'px';
                    tooltip.innerHTML = \`
                        <strong>\${data.name}</strong><br>
                        \${data.description}<br>
                        <a href="\${data.url}" target="_blank">Visit Website →</a>
                    \`;

                    hoveredNode.material.emissive.setHex(0x444444);
                } else {
                    if (hoveredNode) {
                        hoveredNode.material.emissive.setHex(0x000000);
                        hoveredNode = null;
                    }
                    tooltip.style.display = 'none';
                }
            });

            window.addEventListener('click', () => {
                if (hoveredNode && hoveredNode.userData.url !== '#') {
                    window.open(hoveredNode.userData.url, '_blank');
                }
            });

            window.addEventListener('wheel', (e) => {
                e.preventDefault();
                zoomLevel += e.deltaY * 0.1;
                zoomLevel = Math.max(50, Math.min(500, zoomLevel));
                camera.position.z = zoomLevel;
            });

            window.addEventListener('keydown', (e) => {
                // Don't intercept shortcuts if user is typing in an input field
                if (document.activeElement.tagName === 'INPUT' || 
                    document.activeElement.tagName === 'TEXTAREA') {
                    return;
                }
                
                if (e.code === 'Space') {
                    e.preventDefault();
                    autoRotate = !autoRotate;
                }
                if (e.code === 'KeyR') {
                    camera.position.z = 250;
                    zoomLevel = 250;
                    nodeGroup.rotation.set(0, 0, 0);
                }
            });

            const container = document.getElementById('canvas');
            
            container.addEventListener('mousedown', (e) => {
                isDragging = true;
                previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            container.addEventListener('mousemove', (e) => {
                if (isDragging && nodeGroup) {
                    const deltaX = e.clientX - previousMousePosition.x;
                    const deltaY = e.clientY - previousMousePosition.y;

                    nodeGroup.rotation.y += deltaX * 0.005;
                    nodeGroup.rotation.x += deltaY * 0.005;

                    previousMousePosition = { x: e.clientX, y: e.clientY };
                }
            });

            container.addEventListener('mouseup', () => {
                isDragging = false;
            });

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }

        let frameCount = 0;
        let lastTime = Date.now();

        function animate() {
            requestAnimationFrame(animate);

            if (autoRotate && nodeGroup) {
                nodeGroup.rotation.x += 0.0005;
                nodeGroup.rotation.y += 0.001;
            }

            renderer.render(scene, camera);

            frameCount++;
            const currentTime = Date.now();
            if (currentTime - lastTime >= 1000) {
                document.getElementById('fps').textContent = frameCount;
                frameCount = 0;
                lastTime = currentTime;
            }
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const resultCount = document.getElementById('resultCount');
        const resultCountValue = document.getElementById('resultCountValue');
        const searchButton = document.getElementById('searchButton');
        const statusMessage = document.getElementById('statusMessage');
        const loadingOverlay = document.getElementById('loadingOverlay');

        resultCount.addEventListener('input', (e) => {
            resultCountValue.textContent = e.target.value;
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        searchButton.addEventListener('click', performSearch);

        async function performSearch() {
            const query = searchInput.value.trim();
            const maxResults = parseInt(resultCount.value);

            if (!query) {
                showStatus('Please enter a search query', 'error');
                return;
            }

            // Show loading
            searchButton.disabled = true;
            loadingOverlay.classList.add('active');
            document.getElementById('buttonText').innerHTML = '<div class="spinner-small"></div> Searching...';
            statusMessage.style.display = 'none';

            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query, maxResults })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Search failed');
                }

                // Update graph with new data
                nodeDataArray = data.nodes;
                updateGraph(nodeDataArray);

                // Update info
                document.getElementById('currentQuery').textContent = data.query;
                document.getElementById('totalResults').textContent = data.totalResults;

                // Store search data for exports
                currentSearchData = {
                    query: data.query,
                    nodes: data.nodes,
                    timestamp: data.timestamp
                };

                showStatus(\`✓ Found \${data.totalResults} results\`, 'success');

            } catch (error) {
                console.error('Search error:', error);
                showStatus(error.message, 'error');
            } finally {
                searchButton.disabled = false;
                loadingOverlay.classList.remove('active');
                document.getElementById('buttonText').textContent = 'Update Graph';
            }
        }

        function showStatus(message, type) {
            statusMessage.textContent = message;
            statusMessage.className = type;
            statusMessage.style.display = 'block';
            
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }

        // Export functionality
        const exportMarkdownBtn = document.getElementById('exportMarkdown');
        const exportNM3Btn = document.getElementById('exportNM3');
        
        // Initialize with existing data on page load (if any)
        let currentSearchData = nodeDataArray.length > 0 ? {
            query: "${currentQuery || 'None'}",
            nodes: nodeDataArray,
            timestamp: new Date().toISOString()
        } : null;
        
        exportMarkdownBtn.addEventListener('click', async () => {
            if (!currentSearchData || !nodeDataArray.length) {
                showStatus('No results to export. Search first!', 'error');
                return;
            }
            
            try {
                // Extract results from nodes
                const results = nodeDataArray.map(node => ({
                    name: node.name,
                    url: node.url,
                    description: node.description
                }));
                
                const response = await fetch('/api/export/markdown', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: currentSearchData.query,
                        results: results,
                        timestamp: currentSearchData.timestamp
                    })
                });
                
                if (!response.ok) throw new Error('Export failed');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = response.headers.get('content-disposition').split('filename=')[1].replace(/"/g, '');
                a.click();
                window.URL.revokeObjectURL(url);
                
                showStatus('✓ Markdown exported!', 'success');
            } catch (error) {
                console.error('Export error:', error);
                showStatus('Export failed', 'error');
            }
        });
        
        exportNM3Btn.addEventListener('click', async () => {
            if (!currentSearchData || !nodeDataArray.length) {
                showStatus('No results to export. Search first!', 'error');
                return;
            }
            
            try {
                // Extract results from nodes
                const results = nodeDataArray.map(node => ({
                    name: node.name,
                    url: node.url,
                    description: node.description
                }));
                
                // Get camera data
                const cameraData = {
                    position: {
                        x: camera.position.x,
                        y: camera.position.y,
                        z: camera.position.z
                    },
                    lookAt: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    fov: 75
                };
                
                const response = await fetch('/api/export/nm3', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: currentSearchData.query,
                        results: results,
                        nodes: nodeDataArray,
                        camera: cameraData,
                        timestamp: currentSearchData.timestamp
                    })
                });
                
                if (!response.ok) throw new Error('Export failed');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = response.headers.get('content-disposition').split('filename=')[1].replace(/"/g, '');
                a.click();
                window.URL.revokeObjectURL(url);
                
                showStatus('✓ NM3 exported!', 'success');
            } catch (error) {
                console.error('Export error:', error);
                showStatus('Export failed', 'error');
            }
        });

        // Settings functionality
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsBtn = document.getElementById('closeSettings');
        const cancelSettingsBtn = document.getElementById('cancelSettings');
        const saveSettingsBtn = document.getElementById('saveSettings');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const toggleApiKeyBtn = document.getElementById('toggleApiKey');
        const modelSelect = document.getElementById('modelSelect');
        const settingsStatus = document.getElementById('settingsStatus');
        
        // Load current settings on page load
        async function loadSettings() {
            try {
                const response = await fetch('/api/settings');
                const settings = await response.json();
                
                document.getElementById('currentApiKey').textContent = settings.apiKeyMasked;
                document.getElementById('currentModel').textContent = settings.model;
                document.getElementById('currentModelInSettings').textContent = settings.model;
                modelSelect.value = settings.model;
                
                if (!settings.isConfigured) {
                    document.getElementById('currentModel').style.color = '#FF6B6B';
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
        
        // Open settings modal
        settingsBtn.addEventListener('click', async () => {
            await loadSettings();
            settingsModal.style.display = 'flex';
        });
        
        // Close settings modal
        function closeModal() {
            settingsModal.style.display = 'none';
            apiKeyInput.value = '';
            apiKeyInput.type = 'password';
            toggleApiKeyBtn.textContent = '👁️';
            settingsStatus.style.display = 'none';
        }
        
        closeSettingsBtn.addEventListener('click', closeModal);
        cancelSettingsBtn.addEventListener('click', closeModal);
        
        // Toggle API key visibility
        toggleApiKeyBtn.addEventListener('click', () => {
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                toggleApiKeyBtn.textContent = '🔒';
            } else {
                apiKeyInput.type = 'password';
                toggleApiKeyBtn.textContent = '👁️';
            }
        });
        
        // Save settings
        saveSettingsBtn.addEventListener('click', async () => {
            const newApiKey = apiKeyInput.value.trim();
            const newModel = modelSelect.value;
            
            if (!newApiKey && !newModel) {
                showSettingsStatus('No changes to save', 'error');
                return;
            }
            
            try {
                const response = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        apiKey: newApiKey || undefined,
                        model: newModel
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to save settings');
                }
                
                // Update displays
                document.getElementById('currentApiKey').textContent = data.apiKeyMasked;
                document.getElementById('currentModel').textContent = data.model;
                document.getElementById('currentModelInSettings').textContent = data.model;
                
                if (data.isConfigured) {
                    document.getElementById('currentModel').style.color = '#F7DC6F';
                }
                
                showSettingsStatus('✓ Settings saved successfully!', 'success');
                
                setTimeout(closeModal, 1500);
                
            } catch (error) {
                console.error('Settings save error:', error);
                showSettingsStatus(error.message, 'error');
            }
        });
        
        function showSettingsStatus(message, type) {
            settingsStatus.textContent = message;
            settingsStatus.className = type;
            settingsStatus.style.display = 'block';
            
            if (type === 'success') {
                settingsStatus.style.background = 'rgba(144, 238, 144, 0.1)';
                settingsStatus.style.color = '#90ee90';
                settingsStatus.style.border = '1px solid rgba(144, 238, 144, 0.3)';
            } else {
                settingsStatus.style.background = 'rgba(255, 107, 107, 0.1)';
                settingsStatus.style.color = '#FF6B6B';
                settingsStatus.style.border = '1px solid rgba(255, 107, 107, 0.3)';
            }
        }

        // Initialize - load settings and start scene
        loadSettings();
        initScene();
    </script>
</body>
</html>
  `;
  
  res.send(html);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`\n📊 Open your browser to start searching and visualizing!\n`);
});
