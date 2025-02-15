import pkg from "@stellar/stellar-sdk";
import { checkBalances } from "./utils.js";

const { Asset, Network, TransactionBuilder, Memo, Operation } = pkg;

export async function transferFrom(sender, receiver, amount, server) {
  console.log("✅ # Initial Sender's balances");
  await checkBalances(server, sender.publicKey());

  console.log("✅ # Initial Receiver's balances");
  await checkBalances(server, receiver);

  console.log("✅ # Set the base fee");
  let fee;
  try {
    fee = await server.fetchBaseFee();
  } catch (e) {
    console.log(`Failed to fetch base fee: ${e}`);
    fee = 100;
  }

  const senderAccount = await server.loadAccount(sender.publicKey());

  console.log("✅ # Build transaction");
  const transaction = new TransactionBuilder(senderAccount, {
    fee,
    networkPassphrase: Network.TESTNET,
  })
    .addMemo(Memo.text("Happy birthday!"))
    .addOperation(
      Operation.payment({
        destination: receiver,
        asset: Asset.native(),
        amount: amount.toString(),
      })
    )
    .setTimeout(60)
    .build();

  console.log("✅ # Sign the transaction with Sender's secret key");
  transaction.sign(sender);

  console.log("✅ # Submits the transaction to the Horizon server");
  const response = await server.submitTransaction(transaction);
  const txHash = response.hash;
  console.log(`✅ # Transaction Hash: ${txHash}`);

  console.log("✅ # Final Sender's balances");
  await checkBalances(server, sender.publicKey());

  console.log("✅ # Final Receiver's balances");
  await checkBalances(server, receiver);

  console.log("✅ # Done!");

  return txHash;
}

// Example usage
// const server = new Server("https://horizon-testnet.stellar.org");
// const sender = Keypair.fromSecret(
//   "SAKKTW5AEJO7Y5DOGUKINE6NF55CR37OWK3WIX4JWQ7LHOOUIH2VQYR4"
// );
// const receiver = "GCGRVQLR2BKLNP3XP3N2R47Z52X2OIBC7QVZUI4LAZYXRRVIN5TP5GVJ";
// const amount = "10";

// transferFrom(sender, receiver, amount, server)
//   .then((txHash) => {
//     console.log(`Transaction successful with hash: ${txHash}`);
//   })
//   .catch((error) => {
//     console.error(`Transaction failed: ${error}`);
//   });
