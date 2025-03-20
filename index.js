const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const getDirectories = require('./getDirectories');
const getLatestVersion = require('./getLatestVersion');
async function main() {
  const { rootDir, outputDir, outputFileName } = await getDirectories();
  const outputFile = path.join(outputDir, outputFileName);

  function findPackageJsonFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    console.log(`Scanning directory: ${dir}`);

    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && file !== 'node_modules') {
        results = results.concat(findPackageJsonFiles(filePath));
      } else if (file === 'package.json') {
        results.push(filePath);
      }
    });
    return results;
  }

  async function extractReactDependencies(filePath) {
    console.log(`Scanning JSON content: ${filePath}`);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const dependencies = { ...content.dependencies, ...content.devDependencies };

    const results = await Promise.all(
      Object.keys(dependencies).map(async key => {
        const installedVersion = dependencies[key];
        const cleanedVersion = installedVersion.replace(/^[\^~]/, "");

        const latestVersion = await getLatestVersion(key, content.name);
        const versionDifference = cleanedVersion === latestVersion ? "🟢 Up to date" : "🔴 Update available";

        return {
          "File Path": filePath,
          "Project Name": content.name,
          "Description": content.description || "",
          "Package": key,
          "Installed Version": installedVersion,
          "Latest Version": latestVersion,
          "Version Difference": versionDifference,
          "NPM Link": `https://www.npmjs.com/package/${key}`,
        };
      })
    );

    return results;
  }

  // Find files and prepare data
  const packageFiles = findPackageJsonFiles(rootDir);
  let data = [];
  for (const file of packageFiles) {
    data = data.concat(await extractReactDependencies(file));
  }

  // Excel write
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "React Dependencies");
  xlsx.writeFile(workbook, outputFile);

  console.log(`✅ Excel file created: ${outputFile}`);
}

main();
