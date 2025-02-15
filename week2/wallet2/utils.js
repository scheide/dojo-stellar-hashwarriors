import { NotFoundError } from "@stellar/stellar-sdk";
import axios from "axios";

export async function softCreateAccount(publicKey) {
  const url = "http://localhost:8000/friendbot";
  const params = { addr: publicKey };
  const timeout = 30000; // 30 seconds

  try {
    const response = await axios.get(url, { params, timeout });
    if (response.status !== 200) {
      throw new Error(`Error in get faucet: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Error in get faucet: ${error.message}`);
  }
}

export async function validateWallet(publicKey, server) {
  try {
    await server.loadAccount(publicKey);
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log("The destination account does not exist!");
      console.log("Creating Account!");
      await softCreateAccount(publicKey);
    } else {
      throw error;
    }
  }
}

export async function validateWalletBalance(publicKey, server) {
  try {
    const account = await server.accounts().accountId(publicKey).call();
    for (const balance of account.balances) {
      if (balance.asset_type === "native") {
        return parseFloat(balance.balance) > 0;
      }
    }
  } catch (error) {
    throw new Error(`Error in getting account data: ${error.message}`);
  }
}

export async function checkBalances(server, publicKey) {
  const account = await server.accounts().accountId(publicKey).call();
  const balances = account.balances;
  console.log(`✅ # Balances for account ${publicKey}:`);
  for (const balance of balances) {
    const assetType = balance.asset_type;
    const balanceAmount = balance.balance;
    console.log(`Asset Type: ${assetType}, Balance: ${balanceAmount}`);
  }
}

export async function getFaucet(publicKey, server) {
  console.log(`✅ # Try deposit 10.000XML to ${publicKey}`);

  await validateWallet(publicKey, server);
  if (await validateWalletBalance(publicKey, server)) {
    console.log(`Wallet: ${publicKey} already has balance!`);
    return;
  }

  console.log(`Wallet: ${publicKey} needs a deposit!`);

  await softCreateAccount(publicKey);
}

export async function getTransactionByHash(server, transactionHash) {
  const transaction = await server
    .transactions()
    .transaction(transactionHash)
    .call();
  console.log("✅ # Transaction details:");
  console.log(`  - ID: ${transaction.id}`);
  console.log(`  - Hash: ${transaction.hash}`);
  console.log(`  - Ledger: ${transaction.ledger}`);
  console.log(`  - Created At: ${transaction.created_at}`);
  console.log(`  - Source Account: ${transaction.source_account}`);
  console.log(`  - Memo: ${transaction.memo}`);
  console.log(`  - Fee Charged: ${transaction.fee_charged}`);
  console.log(`  - Operation Count: ${transaction.operation_count}`);
  console.log(`  - Successful: ${transaction.successful}`);

  return transaction;
}

export async function getLedgerBySequence(server, sequence) {
  const ledger = await server.ledgers().ledger(sequence).call();
  console.log("✅ # Ledger details:");
  console.log(`  - Sequence: ${ledger.sequence}`);
  console.log(`  - Hash: ${ledger.hash}`);
  console.log(`  - Previous Hash: ${ledger.prev_hash}`);
  console.log(`  - Transaction Count: ${ledger.successful_transaction_count}`);
  console.log(`  - Operation Count: ${ledger.operation_count}`);
  console.log(`  - Closed At: ${ledger.closed_at}`);
  console.log(`  - Total Coins: ${ledger.total_coins}`);
  console.log(`  - Fee Pool: ${ledger.fee_pool}`);
  console.log(`  - Base Fee in Stroops: ${ledger.base_fee_in_stroops}`);
  console.log(`  - Base Reserve in Stroops: ${ledger.base_reserve_in_stroops}`);
  console.log(`  - Max Transaction Set Size: ${ledger.max_tx_set_size}`);
  console.log(`  - Protocol Version: ${ledger.protocol_version}`);

  return ledger;
}
