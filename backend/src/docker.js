const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const axios = require('axios');

async function checkPortAvailable(port) {
  try {
    // Try to find process using the port (Windows command)
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    if (stdout) {
      console.log(`Port ${port} is in use, attempting to stop existing container...`);
      // Try to stop any container using this port
      try {
        await execPromise(`docker ps -q --filter "publish=${port}" | ForEach-Object { docker stop $_ }`, { shell: 'powershell.exe' });
      } catch (error) {
        console.log('No Docker container found on port, continuing...');
      }
    }
  } catch (error) {
    // Port is free or command failed (which is fine)
    console.log(`Port ${port} appears to be available`);
  }
}

async function waitForHealthy(url, timeout = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      await axios.get(url, { timeout: 2000 });
      return true;
    } catch (error) {
      // Service not ready yet, wait and retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Service failed to become healthy within timeout');
}

async function buildAndRun(projectId, projectPath) {
  try {
    // Check if port 8080 is available
    await checkPortAvailable(8080);
    
    // Build image
    console.log(`Building Docker image for ${projectId}...`);
    const buildCmd = `docker build -t ${projectId} -f docker/go-service.Dockerfile ${projectPath}`;
    const { stdout: buildOut, stderr: buildErr } = await execPromise(buildCmd, { 
      timeout: 120000,  // 2 minute timeout
      cwd: process.cwd()
    });
    
    if (buildErr && buildErr.toLowerCase().includes('error')) {
      throw new Error(`Build failed: ${buildErr}`);
    }
    
    console.log('Docker build output:', buildOut);
    
    // Run container
    console.log(`Starting container ${projectId}...`);
    const runCmd = `docker run -d --name ${projectId} -p 8080:8080 ${projectId}`;
    await execPromise(runCmd);
    
    // Wait for health check
    console.log('Waiting for service to be healthy...');
    await waitForHealthy('http://localhost:8080/health', 30000);
    
    return { previewUrl: 'http://localhost:8080' };
  } catch (error) {
    // Cleanup on failure
    await cleanup(projectId);
    throw error;
  }
}

async function stop(projectId) {
  try {
    await execPromise(`docker stop ${projectId}`);
    await execPromise(`docker rm ${projectId}`);
    await execPromise(`docker rmi ${projectId}`);
  } catch (error) {
    console.error(`Failed to stop project ${projectId}:`, error.message);
  }
}

async function cleanup(projectId) {
  try {
    // Stop and remove container if exists
    await execPromise(`docker stop ${projectId}`).catch(() => {});
    await execPromise(`docker rm ${projectId}`).catch(() => {});
  } catch (error) {
    console.error(`Cleanup failed for ${projectId}:`, error.message);
  }
}

module.exports = { buildAndRun, stop, cleanup };

// Made with Bob
