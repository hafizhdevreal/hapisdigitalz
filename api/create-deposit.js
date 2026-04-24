export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount } = req.body;

  const response = await fetch("https://ramashop.my.id/api/public/deposit/create", {
    method: "POST",
    headers: {
      "X-API-Key": process.env.API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount,
      method: "qris"
    })
  });

  const data = await response.json();

  res.status(200).json({
    depositId: data?.data?.depositId,
    qrImage: data?.data?.qrImage
  });
}
