#!/usr/bin/env node
/**
 * Synchronize documentation version with package.json
 * This script updates all HTML files in .documentation/ to match the version in package.json
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, '.documentation');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');

// Read version from package.json
function getPackageVersion() {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    return pkg.version;
}

// Find all HTML files in documentation directory
function getHtmlFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getHtmlFiles(fullPath));
        } else if (entry.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }

    return files;
}

// Update version badge in HTML file
function updateVersionInFile(filePath, version) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Match version-badge span with any version pattern
    const versionRegex = /(<span class="version-badge">v)[\d.]+(<\/span>)/g;

    if (versionRegex.test(content)) {
        const updated = content.replace(versionRegex, `$1${version}$2`);

        if (updated !== content) {
            fs.writeFileSync(filePath, updated, 'utf8');
            return true;
        }
    }

    return false;
}

// Main execution
function main() {
    console.log('Synchronizing documentation version with package.json...\n');

    const version = getPackageVersion();
    console.log(`Package version: v${version}\n`);

    const htmlFiles = getHtmlFiles(DOC_DIR);
    let updatedCount = 0;

    for (const file of htmlFiles) {
        const relativePath = path.relative(ROOT_DIR, file);
        const updated = updateVersionInFile(file, version);

        if (updated) {
            console.log(`  Updated: ${relativePath}`);
            updatedCount++;
        }
    }

    console.log(`\n${updatedCount} file(s) updated to v${version}`);
}

main();
