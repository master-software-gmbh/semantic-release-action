import { existsSync } from "fs";

/**
 * @type {import('semantic-release').PluginSpec[]}
 */
const plugins = [
  "@semantic-release/commit-analyzer",
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

plugins.push("@semantic-release/git", "@semantic-release/github");

console.log(plugins);

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  plugins,
};
