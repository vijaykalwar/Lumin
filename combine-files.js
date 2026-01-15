// ════════════════════════════════════════════════════════════
// LUMIN - Combine All Files for Claude AI
// ════════════════════════════════════════════════════════════
// Usage: node combine-files.js
// Output: COMBINED_CODEBASE.md (ready to share with Claude AI)

const fs = require('fs');
const path = require('path');

// ════════════════════════════════════════════════════════════
// FILES TO INCLUDE
// ════════════════════════════════════════════════════════════

const filesToInclude = [
  // Backend Core
  'backend/server.js',
  'backend/package.json',
  'backend/config/db.js',
  
  // Backend Models
  'backend/models/User.js',
  'backend/models/Entry.js',
  'backend/models/Goal.js',
  'backend/models/Streak.js',
  'backend/models/Challenge.js',
  
  // Backend Routes
  'backend/routes/auth.js',
  'backend/routes/entries.js',
  'backend/routes/goals.js',
  'backend/routes/stats.js',
  'backend/routes/challenges.js',
  
  // Backend Controllers
  'backend/controllers/authController.js',
  'backend/controllers/entryController.js',
  'backend/controllers/goalController.js',
  'backend/controllers/statsController.js',
  'backend/controllers/challengeController.js',
  
  // Backend Utils & Services
  'backend/utils/gamification.js',
  'backend/services/challengeService.js',
  'backend/middleware/authMiddleware.js',
  
  // Frontend Core
  'frontend/package.json',
  'frontend/vite.config.js',
  'frontend/tailwind.config.js',
  'frontend/src/main.jsx',
  'frontend/src/App.jsx',
  'frontend/src/index.css',
  
  // Frontend Contexts
  'frontend/src/contexts/AuthContext.jsx',
  'frontend/src/contexts/ThemeContext.jsx',
  
  // Frontend Pages
  'frontend/src/pages/Home.jsx',
  'frontend/src/pages/Login.jsx',
  'frontend/src/pages/Register.jsx',
  'frontend/src/pages/Dashboard.jsx',
  'frontend/src/pages/AddEntry.jsx',
  'frontend/src/pages/Entries.jsx',
  'frontend/src/pages/Goals.jsx',
  'frontend/src/pages/CreateGoal.jsx',
  'frontend/src/pages/GoalDetail.jsx',
  'frontend/src/pages/Analytics.jsx',
  'frontend/src/pages/Challenges.jsx',
  
  // Frontend Components
  'frontend/src/components/Navbar.jsx',
  'frontend/src/components/DailyChallenges.jsx',
  'frontend/src/components/Logo.jsx',
  'frontend/src/components/ThemeToggle.jsx',
  
  // Frontend Utils & Config
  'frontend/src/utils/api.js',
  'frontend/src/config/theme.js',
];

// ════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════

function readFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
    } else {
      return `// ⚠️ FILE NOT FOUND: ${filePath}\n`;
    }
  } catch (error) {
    return `// ⚠️ ERROR READING FILE: ${filePath}\n// ${error.message}\n`;
  }
}

function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

function getLanguageFromExtension(ext) {
  const langMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.json': 'json',
    '.css': 'css',
    '.md': 'markdown',
  };
  return langMap[ext] || 'text';
}

// ════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ════════════════════════════════════════════════════════════

function combineFiles() {
  console.log('🚀 Combining files for Claude AI...\n');
  
  let output = '';
  
  // Header
  output += '# 📦 LUMIN - Complete Codebase for Claude AI\n\n';
  output += '**Generated:** ' + new Date().toISOString() + '\n\n';
  output += '---\n\n';
  output += '## 📋 Project Overview\n\n';
  output += 'This file contains the complete codebase for LUMIN journaling app.\n\n';
  output += '**Tech Stack:**\n';
  output += '- Frontend: React 19 + Vite + Tailwind CSS\n';
  output += '- Backend: Node.js + Express.js\n';
  output += '- Database: MongoDB Atlas (Mongoose)\n';
  output += '- Auth: JWT (JSON Web Tokens)\n\n';
  output += '**Status:**\n';
  output += '- ✅ DONE: Auth, Entries, Goals, Streaks, XP, Badges, Dashboard\n';
  output += '- ❌ TODO: AI Integration, Pomodoro, Vision Board, UX improvements\n\n';
  output += '---\n\n';
  
  // Group files by category
  const categories = {
    'Backend Core': [],
    'Backend Models': [],
    'Backend Routes': [],
    'Backend Controllers': [],
    'Backend Utils & Services': [],
    'Frontend Core': [],
    'Frontend Contexts': [],
    'Frontend Pages': [],
    'Frontend Components': [],
    'Frontend Utils & Config': [],
  };
  
  // Categorize files
  filesToInclude.forEach(file => {
    if (file.includes('backend/server.js') || file.includes('backend/package.json') || file.includes('backend/config')) {
      categories['Backend Core'].push(file);
    } else if (file.includes('backend/models')) {
      categories['Backend Models'].push(file);
    } else if (file.includes('backend/routes')) {
      categories['Backend Routes'].push(file);
    } else if (file.includes('backend/controllers')) {
      categories['Backend Controllers'].push(file);
    } else if (file.includes('backend/utils') || file.includes('backend/services') || file.includes('backend/middleware')) {
      categories['Backend Utils & Services'].push(file);
    } else if (file.includes('frontend/package.json') || file.includes('frontend/vite.config') || file.includes('frontend/tailwind.config') || file.includes('frontend/src/main.jsx') || file.includes('frontend/src/App.jsx') || file.includes('frontend/src/index.css')) {
      categories['Frontend Core'].push(file);
    } else if (file.includes('frontend/src/contexts')) {
      categories['Frontend Contexts'].push(file);
    } else if (file.includes('frontend/src/pages')) {
      categories['Frontend Pages'].push(file);
    } else if (file.includes('frontend/src/components')) {
      categories['Frontend Components'].push(file);
    } else if (file.includes('frontend/src/utils') || file.includes('frontend/src/config')) {
      categories['Frontend Utils & Config'].push(file);
    }
  });
  
  // Process each category
  Object.entries(categories).forEach(([category, files]) => {
    if (files.length === 0) return;
    
    output += `## 📁 ${category}\n\n`;
    
    files.forEach(file => {
      const content = readFile(file);
      const ext = getFileExtension(file);
      const lang = getLanguageFromExtension(ext);
      
      output += `### \`${file}\`\n\n`;
      output += `\`\`\`${lang}\n`;
      output += content;
      output += `\n\`\`\`\n\n`;
      output += '---\n\n';
    });
  });
  
  // Footer
  output += '## 📝 Notes for Claude AI\n\n';
  output += '1. **Follow existing patterns:** Use same code style, naming conventions, and structure\n';
  output += '2. **API calls:** All go through `frontend/src/utils/api.js`\n';
  output += '3. **Styling:** Use Tailwind CSS classes, theme from `config/theme.js`\n';
  output += '4. **State:** Use React Context for global state, useState for local\n';
  output += '5. **Error handling:** Always check `result.success`, show user-friendly messages\n\n';
  output += '**Next Steps:**\n';
  output += '1. Review codebase structure\n';
  output += '2. Implement Phase 1: UX improvements (toasts, search, filters)\n';
  output += '3. Implement Phase 2: Missing charts (mood pie, streak calendar)\n';
  output += '4. Implement Phase 3: AI Integration (Gemini API)\n';
  output += '5. Implement Phase 4: Pomodoro Timer\n';
  output += '6. Implement Phase 5: Vision Board\n\n';
  output += '---\n\n';
  output += '*End of codebase*\n';
  
  // Write to file
  const outputPath = path.join(__dirname, 'COMBINED_CODEBASE.md');
  fs.writeFileSync(outputPath, output, 'utf8');
  
  console.log('✅ Successfully combined files!');
  console.log(`📄 Output: ${outputPath}`);
  console.log(`📊 Total files: ${filesToInclude.length}`);
  console.log(`📏 File size: ${(output.length / 1024).toFixed(2)} KB\n`);
  console.log('🚀 Now share COMBINED_CODEBASE.md with Claude AI!\n');
}

// ════════════════════════════════════════════════════════════
// RUN SCRIPT
// ════════════════════════════════════════════════════════════

combineFiles();

