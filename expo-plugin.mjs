import { readFileSync, writeFileSync } from 'node:fs';

export default {
  prepare: async (_, { nextRelease }) => {
    const manifest = readManifest();
    
    // Update Expo version
    updateVersion(manifest, nextRelease.version);

    writeManifest(manifest);
  },
};

function readManifest() {
  return JSON.parse(readFileSync('app.json'));
}

function writeManifest(manifest) {
  writeFileSync('app.json', JSON.stringify(manifest));
}

function updateVersion(manifest, version) {
  manifest.expo.version = version;
}