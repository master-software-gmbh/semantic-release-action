import { existsSync } from "fs";

/**
 * @type {import('semantic-release').PluginSpec[]}
 */
const plugins = [
  [
    "@semantic-release/commit-analyzer",
    {
      preset: "conventionalcommits",
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
      prepareCmd:
        "yq '.version = \"${nextRelease.version}\"' galaxy.yml > tmp.yaml && mv tmp.yaml galaxy.yml",
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
