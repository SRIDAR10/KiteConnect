const { KiteConnect } = require("kiteconnect");
const express = require("express");
require("dotenv").config();

const apiKey = process.env.KITE_API_KEY;
const apiSecret = process.env.KITE_API_SECRET;

// Initialize KiteConnect instance
const kc = new KiteConnect({ api_key: apiKey });

const app = express();
const PORT = 3000;

async function startLoginProcess() {
  return new Promise((resolve, reject) => {
    // Handle the redirect from Kite login
    app.get("/callback", async (req, res) => {
      try {
        const requestToken = req.query.request_token;
        console.log("Received request token:", requestToken);

        // Generate session and get the access token
        const session = await kc.generateSession(requestToken, apiSecret);
        kc.setAccessToken(session.access_token); // Ensure token is correctly set
        console.log("Login successful! Access token:", session.access_token);

        res.send("Login successful! You can close this window.");

        server.close(() => {
          resolve(session);
        });
      } catch (error) {
        console.error("Error in login callback:", error);
        res.status(500).send("Login failed!");
        reject(error);
      }
    });

    // Start the server to listen for the callback
    const server = app.listen(PORT, () => {
      // Generate login URL
      const loginURL = kc.getLoginURL();
      console.log("\nPlease open this URL in your browser to login:");
      console.log("\x1b[36m%s\x1b[0m", loginURL);
      console.log("\nWaiting for login...");
    });
  });
}

async function getHistoricalData(
  instrumentToken,
  interval,
  from,
  to,
  continuous,
  oi
) {
  try {
    // Convert date strings to Date objects
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Fetch historical data
    const historicalData = await kc.getHistoricalData(
      instrumentToken,
      interval,
      fromDate,
      toDate,
      continuous,
      oi
    );

    console.log("Historical Data:", historicalData);
    return historicalData;
  } catch (err) {
    console.error("Error getting historical data:", err);
    throw err;
  }
}

async function main() {
  try {
    console.log("Starting login process...");
    const session = await startLoginProcess();

    // Ensure the session contains a valid access token
    console.log("Access token after login:", kc.access_token); // Verify the token

    // Fetch historical data using a sample instrument token (replace with your own)
    console.log("Fetching historical data...");
    await getHistoricalData(
      5633,
      "day", // Interval
      "2024-05-11", // From date
      "2024-06-12", // To date
      false, // Continuous
      true // Open interest (oi)
    );
  } catch (err) {
    console.error("Error in main:", err);
  } finally {
    // Exit the process after execution
    process.exit(0);
  }
}

// Execute the main function
main();
