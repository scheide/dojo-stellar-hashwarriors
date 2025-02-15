import pkg from "@stellar/stellar-sdk";
import {
  getFaucet,
  getLedgerBySequence,
  getTransactionByHash,
} from "./utils.js";
import { createAliceWallet, createBobWallet } from "./wallet.js";
import { transferFrom } from "./transfer.js";

const { Server, Horizon } = pkg;

console.log("✅ # Start Payment from Alice to Bob with amount 100XML");

console.log("✅ # Configure the server for the Standalone network (local)");
const server = new Horizon.Server("http://localhost:8000");

// Create wallets
const alice = createAliceWallet();
const bob = createBobWallet();

// Deposit into wallets
await getFaucet(alice.publicKey(), server);
await getFaucet(bob.publicKey(), server);

// Make transfer
transferFrom(alice, bob.publicKey(), 1000, server)
  .then((txHash) => {
    // Fetch transaction
    getTransactionByHash(server, txHash)
      .then((transaction) => {
        // Fetch ledger of the transaction
        const ledgerSequence = transaction.ledger;
        getLedgerBySequence(server, ledgerSequence)
          .then((ledger) => {
            console.log("✅ # Done!");
          })
          .catch((error) => {
            console.error(`Error fetching ledger: ${error}`);
          });
      })
      .catch((error) => {
        console.error(`Error fetching transaction: ${error}`);
      });
  })
  .catch((error) => {
    console.error(`Error making transfer: ${error}`);
  });
