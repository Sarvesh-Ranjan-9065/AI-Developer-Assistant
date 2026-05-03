const { exec } = require('child_process');
const util = require('util');
const path = require('path');
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

async function waitForHealthy(url, timeout = 60000) {
  const startTime = Date.now();
  let lastError = null;
  let attempts = 0;
  
  console.log(`Waiting for service at ${url} to become healthy...`);
  
  while (Date.now() - startTime < timeout) {
    attempts++;
    try {
      const response = await axios.get(url, {
        timeout: 3000,
        validateStatus: (status) => status === 200
      });
      
      if (response.data && response.data.status === 'healthy') {
        console.log(`Service is healthy after ${attempts} attempts`);
        return true;
      }
    } catch (error) {
      lastError = error.message;
      // Log every 5 attempts
      if (attempts % 5 === 0) {
        console.log(`Still waiting... (attempt ${attempts}, error: ${error.code || error.message})`);
      }
      // Service not ready yet, wait and retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error(`Service failed to become healthy within ${timeout/1000}s. Last error: ${lastError}`);
}

async function buildAndRun(projectId, projectPath) {
  try {
    // Check if port 8080 is available
    await checkPortAvailable(8080);
    
    // Build image
    console.log(`Building Docker image for ${projectId}...`);
    console.log(`Project path: ${projectPath}`);
    
    // Get absolute path to Dockerfile (go up from backend/src to root, then to docker/)
    const dockerfilePath = path.resolve(__dirname, '..', '..', 'docker', 'go-service.Dockerfile');
    console.log(`Dockerfile path: ${dockerfilePath}`);
    
    const buildCmd = `docker build -t ${projectId} -f "${dockerfilePath}" "${projectPath}"`;
    console.log(`Build command: ${buildCmd}`);
    
    let buildOut, buildErr;
    try {
      const result = await execPromise(buildCmd, {
        timeout: 120000,  // 2 minute timeout
        cwd: projectPath
      });
      buildOut = result.stdout;
      buildErr = result.stderr;
    } catch (buildError) {
      console.error('Docker build failed with error:', buildError.message);
      if (buildError.stdout) console.error('Build stdout:', buildError.stdout);
      if (buildError.stderr) console.error('Build stderr:', buildError.stderr);
      throw new Error(`Docker build failed: ${buildError.message}`);
    }
    
    // Check for build errors in stderr
    if (buildErr && (buildErr.toLowerCase().includes('error:') || buildErr.toLowerCase().includes('failed'))) {
      console.error('Build stderr contains errors:', buildErr);
      throw new Error(`Build failed with errors: ${buildErr}`);
    }
    
    console.log('Docker build completed successfully');
    if (buildOut) console.log('Build output:', buildOut.substring(0, 500));
    
    // Run container
    console.log(`Starting container ${projectId}...`);
    const runCmd = `docker run -d --name ${projectId} -p 8080:8080 ${projectId}`;
    
    try {
      await execPromise(runCmd);
      console.log(`Container ${projectId} started successfully`);
    } catch (runError) {
      console.error('Failed to start container:', runError.message);
      throw new Error(`Failed to start container: ${runError.message}`);
    }
    
    // Wait for health check with extended timeout
    console.log('Waiting for service to be healthy...');
    await waitForHealthy('http://localhost:8080/health', 60000);
    
    console.log(`Service is ready at http://localhost:8080`);
    return { previewUrl: 'http://localhost:8080' };
  } catch (error) {
    console.error('Build and run failed:', error.message);
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
