const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { v4 } = require('uuid');
const inquirer = require('inquirer');
const axios = require('axios');

async function getLatestVersion(packageName, projectName) {
  console.log(`🔍 Fetching latest version for: ${packageName}\n📂 Project Name: ${projectName}`);

  try {
    const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
    return response.data['dist-tags'].latest;
  } catch (error) {
    console.error(`❌ Error fetching version for ${packageName}:`, error);
    return 'N/A';
  }
}

async function getDirectories() {
  const prompt = inquirer.createPromptModule();
  const id = v4();
  const answers = await prompt([
    {
      type: 'input',
      name: 'rootDir',
      message: 'Enter the root directory:',
      default: 'C:/Projects/CSM/Frontend/CORE',
    },
    {
      type: 'input',
      name: 'outputDir',
      message: 'Enter the output directory:',
      default: 'C:/Projects/CSM/Frontend/CORE',
    },
    {
      type: 'input',
      name: 'outputFileName',
      message: 'Enter the output file name:',
      default: `react_dev_package_list-${id.toString().substring(0, 10)}.xlsx`,
    },
  ]);

  return answers;
}

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

    const packages = Object.keys(dependencies).map(async (key) => {
      const latestVersion = await getLatestVersion(key, content.name);
      return {
        "File Path": filePath,
        "Name": content.name || 'N/A',
        "Description": content.description || 'N/A',
        "Package": key,
        "Installed Version": dependencies[key],
        "Latest Version": latestVersion
      };
    });

    return Promise.all(packages);
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
