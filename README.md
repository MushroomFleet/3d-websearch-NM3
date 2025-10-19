# Perplexity 3D Search Visualization

> Transform web search results into an interactive 3D visualization with real-time search, configurable models, and multiple export formats.

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0-green)
![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

[Features](#-features) • [Quick Start](#-quick-start) • [Screenshots](#-screenshots) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
  - [Web Interface](#web-interface-recommended)
  - [CLI Tools](#cli-tools-advanced)
- [Configuration](#-configuration)
- [Export Formats](#-export-formats)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Project Structure](#-project-structure)
- [API](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Perplexity 3D Search** is a web application that leverages the Perplexity API to perform intelligent web searches and transforms results into an immersive, interactive 3D visualization. Search, explore, and export your results in multiple formats.

### Why This Project?

- 🎨 **Visual Search**: See search results in 3D space with intuitive spatial organization
- ⚙️ **No Config Files**: Configure API keys and models through a clean UI
- 🚀 **Multiple Models**: Choose from sonar-pro, sonar, or sonar-small
- 💾 **Export Ready**: Save as Markdown or export as NM3 3D format
- 🌐 **Web-Based**: No command line needed - everything in your browser

---

## ✨ Features

### 🔍 Search & Visualization
- ✅ **Real-time Perplexity API integration** with Sonar Pro, Sonar, and Sonar Small models
- ✅ **Interactive 3D visualization** using Three.js with 8-10 search results
- ✅ **Golden spiral distribution** for optimal spatial organization
- ✅ **Clickable nodes** that open websites in new tabs
- ✅ **Hover tooltips** with full descriptions
- ✅ **Result count control** via slider (5-20 results)

### ⚙️ Configuration
- ✅ **Settings modal** for easy configuration (no manual file editing!)
- ✅ **API key management** with secure masking (shows only `sk-pplx-...xxxx`)
- ✅ **Model selection** dropdown with 3 Perplexity models
- ✅ **Auto .env creation** - creates config file automatically on first run
- ✅ **Live updates** - settings apply immediately without restart

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

## 📸 Screenshots

### Main Interface
![Main Interface](docs/screenshots/main-interface.png)
> Interactive 3D visualization with search panel, model display, and export options

### Settings Modal
![Settings Modal](docs/screenshots/settings-modal.png)
> Easy configuration of API key and model selection

### 3D Visualization
![3D Visualization](docs/screenshots/3d-viz.png)
> Search results displayed as interactive nodes in 3D space

---

## 🚀 Quick Start

Get up and running in 3 simple steps:

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open browser
# Navigate to http://localhost:3000
# Click ⚙️ Settings → Enter API key → Start searching!
```

That's it! No manual configuration files needed.

---

## 📦 Installation

### Prerequisites

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0 or higher (comes with Node.js)
- **Perplexity API Key** ([Get one free](https://www.perplexity.ai/api/))

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/perplexity-3d-search.git
   cd perplexity-3d-search
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open browser**:
   - Navigate to `http://localhost:3000`
   - The app automatically creates `.env` if it doesn't exist

5. **Configure via Settings Modal**:
   - Click the ⚙️ (Settings) button in the search panel
   - Enter your Perplexity API key
   - Select your preferred model (sonar-pro recommended)
   - Click "Save Settings"
   - Start searching!

---

## 🎯 Usage

### Web Interface (Recommended)

The primary way to use this application:

#### 1. **Search**
- Enter your query in the search box
- Adjust result count with the slider (5-20)
- Click "Update Graph" or press Enter
- Watch results appear in 3D space

#### 2. **Explore**
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
- Settings save immediately

### CLI Tools (Advanced)

For script integration or automation:

```bash
# Search and save to results.md
node search-and-format.js "your query" 10

# Generate static visualization
node generate-visualization.js

# Open generated file
start index.html  # Windows
open index.html   # macOS
```

---

## ⚙️ Configuration

### Settings Modal

Access via ⚙️ button in search panel. Configure:

#### 🔑 API Key
- **Input**: Secure password field with show/hide toggle
- **Display**: Masked as `sk-pplx-...xxxx` (first 8 + last 4 characters)
- **Validation**: Checks format (must start with `sk-pplx-`)
- **Get Key**: [perplexity.ai/api](https://www.perplexity.ai/api/)

#### 🤖 Model Selection

Choose from three Perplexity models:

| Model | Speed | Accuracy | Use Case | Default |
|-------|-------|----------|----------|---------|
| **sonar-pro** | Slower | Highest | Production, best results | ⭐ Yes |
| **sonar** | Medium | Balanced | General use, good balance | No |
| **sonar-small** | Fastest | Lower | Quick searches, testing | No |

**Current model** is displayed in the info panel (top-right).

### .env File (Auto-Managed)

The application automatically creates `.env` on first run with:

```env
PERPLEXITY_API_KEY=add_key_here
PERPLEXITY_MODEL=sonar-pro
PORT=3000
```

**You don't need to edit this file manually** - use the Settings modal instead!

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PERPLEXITY_API_KEY` | Your Perplexity API key | `add_key_here` |
| `PERPLEXITY_MODEL` | Model to use for searches | `sonar-pro` |
| `PORT` | Server port | `3000` |

---

## 💾 Export Formats

### Markdown (.md)

Clean, readable documentation format:

```markdown
# Search Results: Your Query

**Generated:** 10/19/2025, 5:00 AM
**Total Results:** 9

## 1. Website Name
**URL:** https://example.com
Description of the website...

---
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
    <node id="node-0-..." type="sphere" x="..." y="..." z="...">
      <title>Website Name</title>
      <content><![CDATA[...]]>
```

## 📚 Citation

### Academic Citation

If you use this codebase in your research or project, please cite:

```bibtex
@software{project_name,
  title = {Project Name: description},
  author = {[Drift Johnson]},
  year = {2025},
  url = {https://github.com/MushroomFleet/project-name},
  version = {1.0.0}
}
```

### Donate:

[![Ko-Fi](https://cdn.ko-fi.com/cdn/kofi3.png?v=3)](https://ko-fi.com/driftjohnson)