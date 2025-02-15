import { Keypair } from "@stellar/stellar-sdk";

export function createAliceWallet() {
  console.log("✅ # Alice's wallet created (SENDER)");
  const aliceSecretKey =
    "SAKKTW5AEJO7Y5DOGUKINE6NF55CR37OWK3WIX4JWQ7LHOOUIH2VQYR4";
  const alice = Keypair.fromSecret(aliceSecretKey);
  console.assert(
    alice.publicKey() ===
      "GBTIDN5UQ3P4HT3CSIEYU55F6INXOMYOTU6U5KM67QMXPPUCTABT35U5"
  );

  return alice;
}

export function createBobWallet() {
  console.log("✅ # Bob's wallet created (RECEIVER)");
  const bobSecretKey =
    "SCHBR3CYVBCN4DKDML5VKMAP3Q7B7XN6ARI34UHCOEBHLMNXEUTGIXI5";
  const bob = Keypair.fromSecret(bobSecretKey);
  console.assert(
    bob.publicKey() ===
      "GCGRVQLR2BKLNP3XP3N2R47Z52X2OIBC7QVZUI4LAZYXRRVIN5TP5GVJ"
  );

  return bob;
}

// Example usage
// const alice = createAliceWallet();
// const bob = createBobWallet();
