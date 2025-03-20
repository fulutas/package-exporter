const axios = require('axios');
async function getLatestVersion(packageName, projectName) {
  console.log(`🔍 Fetching latest version package for: ${packageName} Project Name: ${projectName}`);

  try {
    const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
    return response.data['dist-tags'].latest;
  } catch (error) {
    console.error(`❌ Error fetching version for ${packageName}:`, error);
    return 'N/A';
  }
}

module.exports = getLatestVersion;