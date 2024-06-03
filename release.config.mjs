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
  plugins.push([
    "@semantic-release/npm",
    {
      npmPublish: false,
    },
  ]);
} else if (existsSync("manifest.json")) {
  plugins.push([
    "@semantic-release/exec",
    {
      prepareCmd:
        "jq '.version = \"${nextRelease.version}\"' manifest.json > tmp.json && mv tmp.json manifest.json",
    },
  ]);
}

plugins.push(
  [
    "@semantic-release/git",
    {
      assets: [
        "CHANGELOG.md",
        "galaxy.yaml",
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
