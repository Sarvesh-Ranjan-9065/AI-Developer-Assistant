const fs = require('fs').promises;
const path = require('path');

async function writeFiles(projectId, files) {
  const projectPath = path.join(__dirname, '..', 'generated', projectId);
  
  // Create project directory
  await fs.mkdir(projectPath, { recursive: true });
  
  // Write each file
  for (const file of files) {
    const filePath = path.join(projectPath, file.path);
    const fileDir = path.dirname(filePath);
    
    // Ensure directory exists
    await fs.mkdir(fileDir, { recursive: true });
    
    // Write file content
    await fs.writeFile(filePath, file.content, 'utf8');
  }
  
  return projectPath;
}

async function deleteProject(projectId) {
  const projectPath = path.join(__dirname, '..', 'generated', projectId);
  
  try {
    await fs.rm(projectPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to delete project ${projectId}:`, error.message);
  }
}

module.exports = { writeFiles, deleteProject };

// Made with Bob
