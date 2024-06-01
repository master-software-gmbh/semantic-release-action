import { setOutput } from "@actions/core";

export default {
  publish: async (_, { nextRelease }) => {
    if (nextRelease) {
      setOutput("release-published", "true");
    } else {
      setOutput("release-published", "false");
    }
  },
};
