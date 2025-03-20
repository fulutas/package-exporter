const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { v4 } = require('uuid');
const readline = require('readline');

async function getDirectories() {
  const id = v4();
  process.stdin.resume();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function askQuestion(query, defaultValue) {
    return new Promise(resolve => {
      rl.question(`${query} (default: ${defaultValue}): `, answer => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  const rootDir = await askQuestion("Enter the root directory", "C:/Projects/CSM/Frontend/CORE");
  const outputDir = await askQuestion("Enter the output directory", "C:/Projects/CSM/Frontend/CORE");
  const outputFileName = await askQuestion("Enter the output file name", `react_dev_package_list-${id.substring(0, 10)}.xlsx`);

  rl.close();
  return { rootDir, outputDir, outputFileName };
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

  function extractReactDependencies(filePath) {
    console.log(`Scanning JSON content: ${filePath}`);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const dependencies = { ...content.dependencies, ...content.devDependencies };

    return Object.keys(dependencies).map(key => ({
      "File Path": filePath,
      "Name": content.name,
      "Description": content.description,
      "Package": key,
      "Version": dependencies[key]
    }));
  }

  // Find package.json files and extract dependencies
  const packageFiles = findPackageJsonFiles(rootDir);
  const data = packageFiles.flatMap(extractReactDependencies);

  // Write to Excel
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "React Dependencies");
  xlsx.writeFile(workbook, outputFile);

  console.log(`✅ Excel file created: ${outputFile}`);
}

main();
