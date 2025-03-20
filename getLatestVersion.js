async function getLatestVersion(packageName, projectName) {
  console.log(`🔍 Fetching latest version package for: ${packageName} Project Name: ${projectName}`);

  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!response.ok) {
      throw new Error(`Error fetching version for ${packageName}`);
    }
    const data = await response.json();
    return data['dist-tags'].latest;
  } catch (error) {
    console.error(`❌ Error fetching version for ${packageName}:`, error);
    return 'N/A';
  }
}

module.exports = getLatestVersion;
