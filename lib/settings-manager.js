const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '../.env');
const DEFAULT_MODEL = 'sonar-pro';

// Allowed Perplexity models
const ALLOWED_MODELS = ['sonar-pro', 'sonar', 'sonar-small'];

// Ensure .env file exists with defaults
function ensureEnvExists() {
  if (!fs.existsSync(ENV_PATH)) {
    const defaultContent = `PERPLEXITY_API_KEY=add_key_here
PERPLEXITY_MODEL=sonar-pro
PORT=3000
`;
    fs.writeFileSync(ENV_PATH, defaultContent, 'utf-8');
    console.log('✓ Created .env file with default values');
    return true;
  }
  return false;
}

// Parse .env file into key-value object
function parseEnv() {
  ensureEnvExists();
  
  const content = fs.readFileSync(ENV_PATH, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

// Write env object back to .env file
function writeEnv(env) {
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  fs.writeFileSync(ENV_PATH, lines.join('\n') + '\n', 'utf-8');
}

// Validate API key format
function validateApiKey(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'API key is required' };
  }
  
  if (key === 'add_key_here') {
    return { valid: false, error: 'Please enter a valid API key' };
  }
  
  if (!key.startsWith('sk-pplx-')) {
    return { valid: false, error: 'API key must start with sk-pplx-' };
  }
  
  if (key.length < 20) {
    return { valid: false, error: 'API key appears too short' };
  }
  
  return { valid: true };
}

// Validate model selection
function validateModel(model) {
  if (!ALLOWED_MODELS.includes(model)) {
    return { valid: false, error: `Model must be one of: ${ALLOWED_MODELS.join(', ')}` };
  }
  return { valid: true };
}

// Mask API key for display
function maskApiKey(key) {
  if (!key || key === 'add_key_here') {
    return 'Not configured';
  }
  if (key.length < 12) {
    return '***';
  }
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

// Get current settings
function getCurrentSettings() {
  const env = parseEnv();
  const apiKey = env.PERPLEXITY_API_KEY || 'add_key_here';
  const model = env.PERPLEXITY_MODEL || DEFAULT_MODEL;
  
  return {
    apiKey: apiKey,
    apiKeyMasked: maskApiKey(apiKey),
    model: model,
    isConfigured: apiKey !== 'add_key_here' && apiKey.startsWith('sk-pplx-'),
    availableModels: ALLOWED_MODELS
  };
}

// Update API key
function updateApiKey(newKey) {
  const validation = validateApiKey(newKey);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const env = parseEnv();
  env.PERPLEXITY_API_KEY = newKey;
  writeEnv(env);
  
  // Update process.env for immediate use
  process.env.PERPLEXITY_API_KEY = newKey;
  
  return { success: true };
}

// Update model
function updateModel(newModel) {
  const validation = validateModel(newModel);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const env = parseEnv();
  env.PERPLEXITY_MODEL = newModel;
  writeEnv(env);
  
  // Update process.env for immediate use
  process.env.PERPLEXITY_MODEL = newModel;
  
  return { success: true };
}

// Update both settings at once
function updateSettings(newKey, newModel) {
  const env = parseEnv();
  
  if (newKey) {
    const validation = validateApiKey(newKey);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    env.PERPLEXITY_API_KEY = newKey;
    process.env.PERPLEXITY_API_KEY = newKey;
  }
  
  if (newModel) {
    const validation = validateModel(newModel);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    env.PERPLEXITY_MODEL = newModel;
    process.env.PERPLEXITY_MODEL = newModel;
  }
  
  writeEnv(env);
  return { success: true };
}

module.exports = {
  ensureEnvExists,
  getCurrentSettings,
  updateApiKey,
  updateModel,
  updateSettings,
  validateApiKey,
  validateModel,
  maskApiKey,
  ALLOWED_MODELS,
  DEFAULT_MODEL
};
