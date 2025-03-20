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

module.exports = getDirectories;