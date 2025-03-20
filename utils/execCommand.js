const { exec } = require("child_process");

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { shell: "/bin/bash", maxBuffer: 1024 * 500 },
      (error, stdout, stderr) => {
        console.log("🔧 Executing:", command); // Debugging

        if (error) {
          console.error("❌ Command failed:", error.message);
          console.error("🔍 stderr:", stderr);
          reject(error.message || stderr);
        } else {
          console.log("✅ Command executed successfully");
          resolve(stdout);
        }
      }
    );
  });
};

module.exports = { execCommand };
