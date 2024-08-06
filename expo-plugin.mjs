import { readFile, writeFile } from 'node:fs';

export default {
  prepare: async (_, { nextRelease }) => {
    const manifest = readManifest();
    
    // Update Expo version
    updateVersion(nextRelease.version);

    writeManifest(manifest);
  },
};

function readManifest() {
  return JSON.parse(readFile('app.json'));
}

function writeManifest(manifest) {
  writeFile('app.json', JSON.stringify(manifest));
}

function updateVersion(manifest, version) {
  manifest.expo.version = version;
}