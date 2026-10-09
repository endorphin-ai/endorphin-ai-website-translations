#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './built';

// Define the file structure (must match split-translations.cjs)
const FILE_STRUCTURE = {
	'common/navigation.json': ['nav'],
	'common/footer.json': ['footer'],
	'common/errors.json': ['notFound'],
	'pages/home.json': ['hero', 'features', 'codeExample', 'whyChoose', 'quickStart'],
	'pages/documentation.json': ['documentation'],
	'pages/cost-transparency.json': ['costTransparency'],
	'docs/quick-start.json': ['quickStartPage'],
	'docs/project-setup.json': ['projectSetupPage'],
	'docs/test-structure.json': ['testStructurePage'],
	'docs/test-writing-tips.json': ['testWritingTipsPage'],
	'docs/prompt-guide.json': ['promptGuidePage'],
	'docs/vscode-debugging.json': ['vsCodeDebuggingPage'],
	'docs/environment-setup.json': ['environmentSetupPage'],
	'docs/global-setup.json': ['globalSetupPage'],
	'docs/html-reporter.json': ['htmlReporterPage'],
	'docs/test-recorder.json': ['testRecorderPage'],
	'docs/cicd-setup.json': ['cicdSetupPage'],
	'docs/claude-code-integration.json': ['claudeCodeIntegrationPage'],
	'docs/vision-verification.json': ['visionVerificationPage'],
	'docs/jira-integration.json': ['jiraIntegrationPage'],
	'docs/multi-user-testing.json': ['multiUserTestingPage'],
};

function buildTranslations() {
	console.log('🔨 Building translation files from modular structure...\n');

	// Create output directory
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	// Get all language directories
	const languageDirs = fs
		.readdirSync('.')
		.filter((item) => fs.statSync(item).isDirectory() && !item.startsWith('.') && item !== 'built');

	console.log(`Found ${languageDirs.length} languages: ${languageDirs.join(', ')}\n`);

	// Process each language
	languageDirs.forEach((language) => {
		console.log(`🌍 Building ${language}...`);

		const mergedTranslations = {};
		let totalSections = 0;

		// Merge all files for this language
		Object.entries(FILE_STRUCTURE).forEach(([filePath, keys]) => {
			const fullPath = path.join(language, filePath);

			if (fs.existsSync(fullPath)) {
				try {
					const fileContent = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

					// Merge the content
					keys.forEach((key) => {
						if (fileContent[key]) {
							mergedTranslations[key] = fileContent[key];
							totalSections++;
						}
					});

					console.log(`  ✅ Merged ${filePath} (${Object.keys(fileContent).length} sections)`);
				} catch (error) {
					console.log(`  ❌ Error reading ${fullPath}: ${error.message}`);
				}
			} else {
				console.log(`  ⚠️  Missing file: ${fullPath}`);
			}
		});

		// Write the merged file
		const outputPath = path.join(OUTPUT_DIR, `${language}.json`);
		fs.writeFileSync(outputPath, JSON.stringify(mergedTranslations, null, 2) + '\n');

		console.log(`  📦 Created ${outputPath} with ${totalSections} sections\n`);
	});

	console.log('✨ Build complete!');
	console.log(`📁 Built files are in the '${OUTPUT_DIR}' directory`);
	console.log("\n🚀 Copy these files to your main project's src/locales/ directory");
}

function validateStructure() {
	console.log('🔍 Validating structure before build...\n');

	const languageDirs = fs
		.readdirSync('.')
		.filter((item) => fs.statSync(item).isDirectory() && !item.startsWith('.') && item !== 'built');

	let allValid = true;

	languageDirs.forEach((language) => {
		console.log(`Checking ${language}...`);

		Object.keys(FILE_STRUCTURE).forEach((filePath) => {
			const fullPath = path.join(language, filePath);
			if (!fs.existsSync(fullPath)) {
				console.log(`  ❌ Missing: ${fullPath}`);
				allValid = false;
			} else {
				try {
					JSON.parse(fs.readFileSync(fullPath, 'utf8'));
				} catch (error) {
					console.log(`  ❌ Invalid JSON: ${fullPath} - ${error.message}`);
					allValid = false;
				}
			}
		});
	});

	if (allValid) {
		console.log('\n✅ All files present and valid JSON\n');
		return true;
	} else {
		console.log('\n❌ Structure validation failed\n');
		return false;
	}
}

// CLI handling
const command = process.argv[2];

if (command === 'validate') {
	validateStructure();
} else if (command === 'build') {
	if (validateStructure()) {
		buildTranslations();
	}
} else {
	console.log(`
Usage: node build-translations.cjs [command]

Commands:
  validate    Validate file structure and JSON syntax
  build       Build merged translation files (runs validate first)
  
Examples:
  node build-translations.cjs validate
  node build-translations.cjs build
`);
}
