const fs = require("fs");
const path = require("path");
const { exec, execSync } = require("child_process");
const xlsx = require("xlsx");
const os = require("os");
const inquirer = require("inquirer");
const readline = require("readline");

const prompt = inquirer.createPromptModule();
const failedProjects = []; // To store projects that get errors

function findPackageJsonFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory() && file !== "node_modules") {
      results = results.concat(findPackageJsonFiles(fullPath));
    } else if (file === "package.json") {
      results.push(fullPath);
    }
  }

  return results;
}

function updateDependencies(packageJsonPath) {
  const packageDir = path.dirname(packageJsonPath);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};

  let isUpdated = false;
  const updatedDeps = {};
  const updatedDevDeps = {};

  const checkDependencyVersion = (dep, isDev) => {
    try {
      const latestVersion = execSync(`npm show ${dep} version`).toString().trim();
      if (isDev ? devDependencies[dep] !== `^${latestVersion}` : dependencies[dep] !== `^${latestVersion}`) {
        if (isDev) {
          updatedDevDeps[dep] = `^${latestVersion}`;
        } else {
          updatedDeps[dep] = `^${latestVersion}`;
        }
        isUpdated = true;
      }
    } catch (error) {
      if (error.message.includes('404')) {
        console.error(`❌ Error: ${dep} package not found.`);
        failedProjects.push({
          path: packageDir,
          error: `Package not found: ${dep}`
        });
      } else {
        console.error(`❌ Could not get version information for ${dep}: ${error.message}`);
        failedProjects.push({
          path: packageDir,
          error: `Version Error : ${dep} - ${error.message}`
        });
      }
    }
  };

  for (const dep in dependencies) {
    checkDependencyVersion(dep, false);
  }

  for (const devDep in devDependencies) {
    checkDependencyVersion(devDep, true);
  }

  // Write the package.json file if there is an update
  if (isUpdated) {
    packageJson.dependencies = { ...dependencies, ...updatedDeps };
    packageJson.devDependencies = { ...devDependencies, ...updatedDevDeps };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Updated: ${packageJsonPath}`);

    console.log(`🚀  Running npm install in ${packageDir}...`);

    exec(`npm install --legacy-peer-deps`, { cwd: packageDir }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ ${packageDir} npm install failed.`);
        console.error(stderr);

        // Save error data
        failedProjects.push({
          path: packageDir,
          error: stderr
        });
      } else {
        console.log(`✅ ${packageDir} npm install success.`);
      }
    });
  }
}

function saveToExcel(data) {
  const desktopPath = path.join(os.homedir(), "Desktop"); // User Desktop Path
  const filePath = path.join(desktopPath, "npm_install_errors.xlsx");

  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Errors");

  xlsx.writeFile(workbook, filePath);

  console.log(`📁 Error report created in desktop directory.: ${filePath}`);
}

function updateAllProjects(targetDir) {
  console.log(`📂 Scanning started: ${targetDir}`);
  const packageJsonFiles = findPackageJsonFiles(targetDir);

  if (packageJsonFiles.length === 0) {
    console.log("⚠️ No package.json files found.");
    return;
  }

  // Update dependencies in each project
  for (const packageJsonPath of packageJsonFiles) {
    updateDependencies(packageJsonPath);
  }

  // If there are projects with errors, save to Excel file
  if (failedProjects.length > 0) {
    saveToExcel(failedProjects);
  }

  console.log("✅ All dependencies successfully updated.");
}

prompt([
  {
    type: 'input',
    name: 'targetDir',
    message: 'Please enter the target directory (Leave empty for current directory):',
    default: process.cwd(),
  }
]).then(answers => {
  const targetDir = answers.targetDir;
  updateAllProjects(targetDir);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Press ENTER to exit...', () => {
    rl.close();
  });
});
