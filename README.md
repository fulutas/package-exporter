# Package Dependencies Exporter

A Node.js script for scanning and extracting all dependencies from `package.json` files across multiple directories. The extracted data, including both dependencies and devDependencies, is saved in an Excel file, helping developers track and manage package versions across their project folders.

## Features

- Recursively scans all subdirectories to find `package.json` files.
- Extracts all dependencies and devDependencies from `package.json`.
- Outputs the collected data into an easily readable Excel file format.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/package-dependency-exporter.git
   ```
2. Run
   ```bash
   node index.js
   ```
