#!/usr/bin/env node
/**
 * Fix bilingual table columns in documentation HTML files
 *
 * This script transforms separate th/td elements with data-lang attributes
 * into single cells containing span elements for each language.
 *
 * Before: <th data-lang="fr">French</th><th data-lang="en">English</th>
 * After:  <th><span data-lang="fr">French</span><span data-lang="en">English</span></th>
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, '.documentation');

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

// Fix table cells with data-lang attributes
function fixTableCells(content) {
    let modified = false;
    let result = content;

    // Pattern to match consecutive th or td elements with data-lang
    // Match: <th data-lang="fr">content</th>\s*<th data-lang="en">content</th>
    const thPattern = /(<th\s+data-lang="fr">)([\s\S]*?)(<\/th>)\s*(<th\s+data-lang="en">)([\s\S]*?)(<\/th>)/g;
    const tdPattern = /(<td\s+data-lang="fr">)([\s\S]*?)(<\/td>)\s*(<td\s+data-lang="en">)([\s\S]*?)(<\/td>)/g;

    // Fix th elements
    const newResultTh = result.replace(thPattern, (match, open1, contentFr, close1, open2, contentEn, close2) => {
        modified = true;
        const frContent = contentFr.trim();
        const enContent = contentEn.trim();
        return `<th>\n                                        <span data-lang="fr">${frContent}</span>\n                                        <span data-lang="en">${enContent}</span>\n                                    </th>`;
    });

    if (newResultTh !== result) {
        result = newResultTh;
    }

    // Fix td elements
    const newResultTd = result.replace(tdPattern, (match, open1, contentFr, close1, open2, contentEn, close2) => {
        modified = true;
        const frContent = contentFr.trim();
        const enContent = contentEn.trim();
        return `<td>\n                                        <span data-lang="fr">${frContent}</span>\n                                        <span data-lang="en">${enContent}</span>\n                                    </td>`;
    });

    if (newResultTd !== result) {
        result = newResultTd;
    }

    return { content: result, modified };
}

// Process a single file
function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, modified } = fixTableCells(content);

    if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        return true;
    }

    return false;
}

// Main execution
function main() {
    console.log('Fixing bilingual table columns in documentation...\n');

    const htmlFiles = getHtmlFiles(DOC_DIR);
    let fixedCount = 0;

    for (const file of htmlFiles) {
        const relativePath = path.relative(ROOT_DIR, file);
        const wasFixed = processFile(file);

        if (wasFixed) {
            console.log(`  Fixed: ${relativePath}`);
            fixedCount++;
        }
    }

    if (fixedCount === 0) {
        console.log('No files needed fixing.');
    } else {
        console.log(`\n${fixedCount} file(s) fixed.`);
    }
}

main();
