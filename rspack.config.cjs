const Repack = require("repack");

module.exports = function (env) {
  const { mode, platform } = env;

  return {
    mode,
    output: {
      path: path.resolve(__dirname, "build/generated", platform),
    },
    plugins: [new Repack.RepackPlugin()],
  };
};