const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { styleText } = require('node:util');
const { v4 } = require('uuid');
const inquirer = require('inquirer');

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
    console.log(styleText('blue', `File scanning in progress...: ${dir}`));

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
    console.log(styleText('yellowBright', `Scanning JSON content...: ${filePath}`));

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const dependencies = { ...content.dependencies, ...content.devDependencies };

    return Object.keys(dependencies)
      // .filter(key => key === "react" || key === "react-dom")
      .map(key => ({
        "File Path": filePath,
        "Name": content.name,
        "Description": content.description,
        "Package": key,
        "Version": dependencies[key]
      }));
  }

  // Find files and prepare data
  const packageFiles = findPackageJsonFiles(rootDir);
  const data = packageFiles.flatMap(extractReactDependencies);

  // Excel write
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "React Dependencies");
  xlsx.writeFile(workbook, outputFile);

  console.log(styleText('green', `✅ Excel file created: ${outputFile}`));
}

main();
