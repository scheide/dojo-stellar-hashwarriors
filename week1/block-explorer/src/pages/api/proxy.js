import axios from "axios";

export default async function handler(req, res) {
  try {
    const { type, id } = req.query; // Get query params: type and id
    let apiUrl;

    // Based on the 'type', construct the appropriate Horizon API URL
    switch (type) {
      case "ledgers":
        apiUrl = `${process.env.HORIZON_API_URL}/ledgers/${id}`;
        break;
      case "transactions":
        apiUrl = `${process.env.HORIZON_API_URL}/transactions/${id}`;
        break;
      case "claimable_balances":
        apiUrl = `${process.env.HORIZON_API_URL}/claimable_balances/${id}`;
        break;
      default:
        return res.status(400).json({ error: "Invalid type" });
    }

    // Make the request to the Horizon API
    const response = await axios.get(apiUrl, {
      headers: { Accept: "application/json" },
    });

    // Return the data as a JSON response
    res.status(200).json(response.data);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
}
