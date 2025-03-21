const https = require('https');

async function getLatestVersion(packageName, projectName) {
  console.log(`🔍 Fetching latest version package for: ${packageName} (Project: ${projectName})`);

  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName}/latest`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData.version);
        } catch (error) {
          reject(`❌ JSON parse error: ${error.message}`);
        }
      });
    }).on('error', (error) => {
      reject(`❌ Request error: ${error.message}`);
    });
  }).catch((error) => {
    console.error(error);
    return 'N/A';
  });
}

module.exports = getLatestVersion;
