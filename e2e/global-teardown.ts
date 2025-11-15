/* eslint-disable no-console */
import fs from "fs";
import path from "path";

async function globalTeardown() {
  console.log("🧹 Cleaning up global test environment...");

  try {
    // Clean up auth files
    const authFile = path.join(__dirname, "../playwright/.auth/user.json");
    if (fs.existsSync(authFile)) {
      fs.unlinkSync(authFile);
      console.log("✅ Auth file cleaned up");
    }

    // Clean up any test data or temporary files
    // Add your cleanup logic here

    console.log("✅ Global teardown completed successfully");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
