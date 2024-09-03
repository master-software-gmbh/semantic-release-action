import { existsSync, readdirSync } from "node:fs";
import { extname } from "node:path";

function fileExists(withExtension) {
  const files = readdirSync(process.cwd());
  return files.find((file) => extname(file) === withExtension);
}

const additionalAssets = [];

/**
 * @type {import('semantic-release').PluginSpec[]}
 */
const plugins = [
  [
    "@semantic-release/commit-analyzer",
    {
      preset: "conventionalcommits",
      releaseRules: [
        { type: "build", release: "patch" },
        { type: "chore", release: "patch" },
        { type: "ci", release: "patch" },
        { type: "docs", release: "patch" },
        { type: "refactor", release: "patch" },
        { type: "style", release: "patch" },
        { type: "test", release: "patch" },
      ],
    },
  ],
  "@semantic-release/release-notes-generator",
  "@semantic-release/changelog",
];

if (existsSync("package.json")) {
  console.log("Detected package.json file.");

  plugins.push([
    "@semantic-release/npm",
    {
      npmPublish: false,
    },
  ]);
}

if (existsSync("manifest.json")) {
  console.log("Detected manifest.json file.");

  plugins.push([
    "@semantic-release/exec",
    {
      prepareCmd:
        "jq '.version = \"${nextRelease.version}\"' manifest.json > tmp.json && mv tmp.json manifest.json",
    },
  ]);
}

if (existsSync("galaxy.yml")) {
  console.log("Detected galaxy.yml file.");

  plugins.push([
    "@semantic-release/exec",
    {
      // Arguments are required because yq from pip behaves differently from the original binary
      prepareCmd:
        "yq -Y --in-place '.version = \"${nextRelease.version}\"' galaxy.yml",
    },
  ]);
}

if (existsSync("app.json")) {
  console.log("Detected app.json file.");

  plugins.push([
    "@semantic-release/exec",
    {
      prepareCmd:
        "jq '.expo.version = \"${nextRelease.version}\"' app.json > tmp.json && mv tmp.json app.json",
    },
  ]);
}

const xcodeProject = fileExists(".xcodeproj");

if (xcodeProject) {
  console.log("Detected Xcode project.");
  const projectFile = `${xcodeProject}/project.pbxproj`;

  plugins.push([
    "@semantic-release/exec",
    {
      // for macOS sed -i '' "..."
      prepareCmd: `sed -i "s/MARKETING_VERSION = [0-9.]*;/MARKETING_VERSION = \${nextRelease.version};/g" "${projectFile}"`,
    },
  ]);

  additionalAssets.push(projectFile);
}

plugins.push(
  [
    "@semantic-release/git",
    {
      assets: [
        "CHANGELOG.md",
        "galaxy.yml",
        "manifest.json",
        "package.json",
        "package-lock.json",
        "npm-shrinkwrap.json",
        "app.json",
        ...additionalAssets,
      ],
    },
  ],
  [
    "@semantic-release/exec",
    {
      publishCmd:
        "git tag -f v${nextRelease.version.split('.')[0]} && git push origin v${nextRelease.version.split('.')[0]} -f",
    },
  ],
  [
    "@semantic-release/github",
    {
      successComment: false,
      failComment: false,
    },
  ],
  "./release-status-plugin.mjs"
);

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  plugins,
};
