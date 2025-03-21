# Package Dependencies Exporter

## Overview

Package Dependencies Exporter is a Node.js tool that scans directories to find `package.json` files, extracts dependencies (`dependencies` and `devDependencies`), and generates an Excel report. This helps developers track package versions and manage updates efficiently across multiple projects.

## Features

- **Recursive Scanning**: Automatically detects `package.json` files in subdirectories (excluding `node_modules`).
- **Dependency Extraction**: Collects all dependencies and their versions from each project.
- **Latest Version Check**: Fetches the latest version of each package from the npm registry.
- **Excel Export**: Generates a structured Excel file containing all dependency details.
- **Standalone Executable**: Can be packaged into an `.exe` file for easier usage without requiring Node.js installation.

## Installation & Usage

### 1. Clone the Repository

```bash
  git clone https://github.com/yourusername/package-exporter.git
  cd package-exporter
```

### 2. Install Dependencies

```bash
  npm install
```

### 3. Run the Script

```bash
  node index.js
```

Follow the prompts to specify the root directory and output location.

## Generating Executable Package

To create a standalone executable, use:

```bash
  pkg .
```

This will generate an executable file, allowing the script to run without requiring Node.js.

## Output

The script generates an Excel file in the specified output directory, containing columns such as:

- **File Path**: Location of the `package.json` file.
- **Project Name**: Name of the project.
- **Description**: Short description from `package.json`.
- **Package**: Name of the dependency.
- **Installed Version**: Currently installed version.
- **Latest Version**: Latest available version from npm.
- **Version Difference**: Status (🟢 Up to date / 🔴 Update available).
- **NPM Link**: Direct link to the package on npm.

## Example Output

```bash
✅ Excel file created: C:/xx/xx/xx/xx/react_dev_package_list-XXXXXXXXXX.xlsx
```

## License

This project is open-source and available under the [MIT License](LICENSE).
