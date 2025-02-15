var StellarSdk = require("@stellar/stellar-sdk");

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const source = StellarSdk.Keypair.fromSecret(
  "SA3W53XXG64ITFFIYQSBIJDG26LMXYRIMEVMNQMFAQJOYCZACCYBA34L"
);
const destination = StellarSdk.Keypair.random();

server
  .accounts()
  .accountId(source.publicKey())
  .call()
  .then(({ sequence }) => {
    const account = new StellarSdk.Account(source.publicKey(), sequence);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.createAccount({
          destination: destination.publicKey(),
          startingBalance: "25",
        })
      )
      .setTimeout(30)
      .build();
    transaction.sign(StellarSdk.Keypair.fromSecret(source.secret()));
    return server.submitTransaction(transaction);
  })
  .then((results) => {
    console.log("Transaction", results._links.transaction.href);
    console.log("New Keypair", destination.publicKey(), destination.secret());
  });
