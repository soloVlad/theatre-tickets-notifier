import { closePool } from "./db";
import { subscriptionsDB } from "./db/subscriptions";
import { botHandler } from "./bot";
import { minToMs } from "./util";
import { checkStatePuppetTheatre } from "./checks/state-puppet-theatre";
import { CHECK_INTERVAL_MINUTES } from "./config";

async function runPeriodicCheck() {
  await checkStatePuppetTheatre();
}

async function main() {
  await subscriptionsDB.ensureSchema();

  botHandler.launchBot(() => {
    console.log("Telegram bot started.");
    console.log(`Checking for ticket availability every ${CHECK_INTERVAL_MINUTES} minute(s).`);

    const intervalMs = minToMs(CHECK_INTERVAL_MINUTES);
    setInterval(runPeriodicCheck, intervalMs);

    for (const signal of ["SIGINT", "SIGTERM"]) {
      process.once(signal, async () => {
        await closePool();
        botHandler.stopBot(signal);
        process.exit(0);
      });
    }
  });
}

main().catch((err) => {
  console.error("Failed to start bot:", err);
  process.exit(1);
});
