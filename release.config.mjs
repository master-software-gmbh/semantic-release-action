import { existsSync } from "fs";

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
