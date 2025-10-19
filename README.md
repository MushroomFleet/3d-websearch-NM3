# Perplexity 3D Search Visualization

> Transform web search results into an interactive 3D visualization with real-time search, configurable models, and multiple export formats.

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0-green)
![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

[Features](#-features) • [Download](#-download) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [For Developers](#-for-developers)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Download](#-download-portable-windows-app)
- [Quick Start](#-quick-start)
  - [End Users (Portable .exe)](#for-end-users-recommended)
  - [Developers (Source)](#for-developers)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Export Formats](#-export-formats)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [For Developers](#-for-developers)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Perplexity 3D Search** is an application that leverages the Perplexity API to perform intelligent web searches and transforms results into an immersive, interactive 3D visualization. Available as a portable Windows desktop app or web-based application.

### Why This Project?

- 🎨 **Visual Search**: See search results in 3D space with intuitive spatial organization
- 💻 **Portable App**: Download and run - no installation needed (Windows)
- ⚙️ **Easy Setup**: Configure API keys through a clean UI, no file editing
- 🚀 **Multiple Models**: Choose from sonar-pro, sonar, or sonar-small
- 💾 **Export Ready**: Save as Markdown or export as NM3 3D format
- 🌐 **Cross-Platform**: Portable .exe for Windows, web version for any OS

---

## ✨ Features

### 🔍 Search & Visualization
- ✅ **Real-time Perplexity API integration** with Sonar Pro, Sonar, and Sonar Small models
- ✅ **Interactive 3D visualization** using Three.js with 5-20 search results
- ✅ **Golden spiral distribution** for optimal spatial organization
- ✅ **Clickable nodes** that open websites in new tabs
- ✅ **Hover tooltips** with full descriptions
- ✅ **Result count control** via slider

### 💻 Desktop Experience (v2.0)
- ✅ **Portable Windows .exe** - No installation required
- ✅ **Persistent settings** - API key and preferences saved automatically
- ✅ **Native window** - Full desktop application experience
- ✅ **Self-contained** - Includes Node.js, Chromium, all dependencies

### ⚙️ Configuration
- ✅ **Settings modal** for easy configuration (no manual file editing!)
- ✅ **API key management** with secure masking (shows only `pplx-...xxxx`)
- ✅ **Model selection** dropdown with 3 Perplexity models
- ✅ **Auto-save** - Settings persist automatically between sessions

### 💾 Export Capabilities
- ✅ **Markdown export** (.md) - Clean, readable format for documentation
- ✅ **NM3 export** (.nm3) - Full 3D spatial format preserving camera position
- ✅ **Query-based filenames** - Automatically named after your search
- ✅ **One-click downloads** - Export with a single button click

### 🎮 Interactive Controls
- ✅ **Mouse drag** to rotate 3D scene
- ✅ **Scroll wheel** to zoom in/out
- ✅ **Click nodes** to visit websites
- ✅ **Auto-rotation** toggle (SPACEBAR)
- ✅ **View reset** (R key)
- ✅ **60 FPS performance** with real-time monitoring

---

## 📥 Download (Portable Windows App)

### Latest Release: v2.0.0

**For Windows Users** - Get the standalone portable application:

**📦 [Download Perplexity-3D-Search-2.0.0-portable.exe](https://github.com/yourusername/perplexity-3d-search/releases/latest)**

#### System Requirements
- Windows 10 or Windows 11 (64-bit)
- 4GB RAM minimum (8GB recommended)
- 200MB disk space
- Internet connection

#### What's Included
- Complete application (~150-180 MB)
- Node.js runtime
- Chromium browser engine
- All dependencies bundled
- No installation needed!

#### Quick Instructions
1. Download the .exe file
2. Save to any location (Desktop, USB drive, anywhere!)
3. Double-click to run
4. Configure your API key on first launch
5. Start searching!

**📄 [Read Full Release Notes](3D-Web-Search.md)** for detailed instructions, troubleshooting, and features.

---

## 🚀 Quick Start

### For End Users (Recommended)

**Use the portable Windows application** for the easiest experience:

#### Step 1: Download & Launch
```
1. Download the portable .exe from Releases (link above)
2. Double-click the file to launch
3. (Windows may show SmartScreen - click "More info" → "Run anyway")
```

#### Step 2: Get API Key
```
1. Visit https://www.perplexity.ai/api/
2. Sign up or log in
3. Generate a new API key
4. Copy the key (format: pplx-...)
```

#### Step 3: Configure
```
1. Click ⚙️ Settings in the app
2. Paste your API key
3. Select model (sonar-pro recommended)
4. Click Save Settings
```

#### Step 4: Search!
```
1. Enter your query
2. Click "Update Graph" or press Enter
3. Explore results in 3D!
```

**That's it!** Your settings are saved automatically.

---

### For Developers

**Run from source** for development or if you're not on Windows:

```bash
# 1. Clone repository
git clone https://github.com/yourusername/perplexity-3d-search.git
cd perplexity-3d-search

# 2. Install dependencies
npm install

# 3. Start server
npm start

# 4. Open browser
# Navigate to http://localhost:3000
# Click ⚙️ Settings → Enter API key → Start searching!
```

**Prerequisites:**
- Node.js 18.0+ ([Download](https://nodejs.org/))
- npm 9.0+ (comes with Node.js)
- Perplexity API Key ([Get one](https://www.perplexity.ai/api/))

---

## 🎯 Usage

### Search & Explore

#### 1. **Search**
- Enter your query in the search box
- Adjust result count with the slider (5-20)
- Click "Update Graph" or press Enter
- Watch results appear in 3D space

#### 2. **Navigate**
- **Drag** to rotate the visualization
- **Scroll** to zoom in/out
- **Hover** over nodes to see details
- **Click** nodes to visit websites
- Press **SPACEBAR** to toggle auto-rotation
- Press **R** to reset camera view

#### 3. **Export**
- **💾 Save MD**: Download as markdown file
- **📦 Export NM3**: Download as NM3 3D format

#### 4. **Configure**
- Click **⚙️ Settings** to open configuration
- Update API key or change models anytime
- Settings save automatically

---

## ⚙️ Configuration

### Settings Modal

Access via ⚙️ button in search panel:

#### 🔑 API Key
- **Format**: Perplexity keys start with `pplx-` (not `sk-pplx-`)
- **Display**: Masked as `pplx-...xxxx` (first 8 + last 4 characters)
- **Get Key**: [perplexity.ai/api](https://www.perplexity.ai/api/)
- **Security**: Stored securely in AppData (Windows) or .env (web)

#### 🤖 Model Selection

Choose from three Perplexity models:

| Model | Speed | Accuracy | Use Case | Default |
|-------|-------|----------|----------|---------|
| **sonar-pro** | Slower | Highest | Production, best results | ⭐ Yes |
| **sonar** | Medium | Balanced | General use, good balance | No |
| **sonar-small** | Fastest | Lower | Quick searches, testing | No |

**Current model** is displayed in the info panel (top-right).

### Settings Storage

**Portable .exe (Windows)**:
```
C:\Users\YourName\AppData\Roaming\perplexity-3d-search\settings.json
```

**Web version**:
```
.env file in project root (auto-created)
```

---

## 💾 Export Formats

### Markdown (.md)

Clean, readable documentation format:

```markdown
# Search Results: Your Query

**Generated:** 10/19/2025
**Total Results:** 9

## 1. Website Name
**URL:** https://example.com
Description of the website...
```

**Use cases:**
- Documentation
- Sharing with team
- Archiving research
- Blog posts

### NM3 (.nm3)

Full 3D spatial format (Nested Markdown 3D specification):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<nm3 version="1.0">
  <meta title="Search: Your Query".../>
  <camera position-x="0" position-y="0" position-z="250".../>
  <nodes>
    <node id="node-0" type="sphere"...>
```

**Use cases:**
- 3D scene preservation
- Sharing exact view state
- Spatial data analysis
- Academic research

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **SPACEBAR** | Toggle auto-rotation |
| **R** | Reset camera to default view |
| **ENTER** | Perform search (when in search box) |
| **ESC** | Close settings modal |

---

## 👨‍💻 For Developers

### Project Setup

#### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher
- Git

#### Clone & Install

```bash
git clone https://github.com/yourusername/perplexity-3d-search.git
cd perplexity-3d-search
npm install
```

### Development Commands

```bash
# Start web server (development)
npm start
# Open http://localhost:3000

# Run Electron app (development)
npm run electron:dev

# Build portable Windows .exe
npm run electron:build

# Build unpacked (for testing)
npm run electron:build:dir
```

### CLI Tools

For automation and scripting:

```bash
# Search and save to results.md
node search-and-format.js "your query" 10

# Generate static visualization
node generate-visualization.js

# Open generated file
start index.html  # Windows
open index.html   # macOS
```

### Project Structure

```
perplexity-3d-search/
├── main.js                 # Electron main process
├── preload.js              # Electron security bridge
├── server.js               # Web server (Express)
├── server-electron.js      # Electron-specific server
├── search-and-format.js    # CLI search tool
├── generate-visualization.js # Static HTML generator
├── package.json            # Dependencies & scripts
├── lib/
│   ├── search-api.js       # Perplexity API integration
│   ├── settings-manager.js # Settings persistence
│   ├── visualizer.js       # 3D node generation
│   ├── parser.js           # Response parsing
│   └── exporters/
│       ├── markdown-exporter.js
│       └── nm3-exporter.js
└── docs/                   # Documentation
```

### API Endpoints

The server exposes these REST endpoints:

#### POST `/api/search`
```json
Request: {
  "query": "your search query",
  "maxResults": 10
}

Response: {
  "success": true,
  "query": "your search query",
  "totalResults": 10,
  "nodes": [...],
  "timestamp": "2025-10-19T10:00:00.000Z"
}
```

#### GET `/api/settings`
```json
Response: {
  "apiKeyMasked": "pplx-...xxxx",
  "model": "sonar-pro",
  "isConfigured": true,
  "availableModels": ["sonar-pro", "sonar", "sonar-small"]
}
```

#### POST `/api/settings`
```json
Request: {
  "apiKey": "pplx-...",  // optional
  "model": "sonar-pro"    // optional
}

Response: {
  "success": true,
  "apiKeyMasked": "pplx-...xxxx",
  "model": "sonar-pro",
  "isConfigured": true
}
```

#### POST `/api/export/markdown`
```json
Request: {
  "query": "search query",
  "results": [...],
  "timestamp": "2025-10-19T10:00:00.000Z"
}

Response: Markdown file download
```

#### POST `/api/export/nm3`
```json
Request: {
  "query": "search query",
  "results": [...],
  "nodes": [...],
  "camera": {...},
  "timestamp": "2025-10-19T10:00:00.000Z"
}

Response: NM3 XML file download
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PERPLEXITY_API_KEY` | Your Perplexity API key | `add_key_here` |
| `PERPLEXITY_MODEL` | Model to use | `sonar-pro` |
| `PORT` | Server port | `3000` |

### Building Electron App

See [Electron-Build-Win.md](Electron-Build-Win.md) for complete build guide.

```bash
# Build portable .exe
npm run electron:build

# Output: dist/Perplexity 3D Search-2.0.0-portable.exe
```

---

## 🔧 Troubleshooting

### Common Issues

#### "Invalid API key" Error
**Solution**: 
- Ensure key starts with `pplx-` (not `sk-pplx-`)
- Copy directly from Perplexity dashboard
- No spaces before/after the key
- Open Settings and re-save

#### Port Already in Use
**Solution**:
- Close other instances
- Change PORT in .env file
- Or kill process: `netstat -ano | findstr :3000`

#### Search Returns No Results
**Solution**:
- Verify API key configured
- Check internet connection
- Try different query
- Switch to sonar-pro model

#### Settings Don't Persist (Portable App)
**Solution**:
- Check AppData folder permissions
- Ensure antivirus not blocking electron-store
- Try running as Administrator

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/yourusername/perplexity-3d-search/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/perplexity-3d-search/discussions)
- **Release Notes**: [3D-Web-Search.md](3D-Web-Search.md)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

---

## 📚 Citation

### Academic Citation

If you use this in research or projects:

```bibtex
@software{perplexity_3d_search,
  title = {Perplexity 3D Search: Interactive Web Search Visualization},
  author = {[Your Name]},
  year = {2025},
  url = {https://github.com/yourusername/perplexity-3d-search},
  version = {2.0.0}
}
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💖 Support

If you find this project useful:

[![Ko-Fi](https://cdn.ko-fi.com/cdn/kofi3.png?v=3)](https://ko-fi.com/driftjohnson)

---

## 🙏 Acknowledgments

**Built with:**
- [Electron](https://www.electronjs.org/) - Desktop framework
- [Three.js](https://threejs.org/) - 3D visualization
- [Perplexity API](https://www.perplexity.ai/api/) - Search engine
- [Express](https://expressjs.com/) - Web server
- [electron-store](https://github.com/sindresorhus/electron-store) - Settings persistence

**Special thanks** to the open source community for these amazing tools!

---

<div align="center">

**[⬆ Back to Top](#perplexity-3d-search-visualization)**

Made with ❤️ for visual thinkers and curious minds

**Version 2.0.0** • **October 2025**

</div>
