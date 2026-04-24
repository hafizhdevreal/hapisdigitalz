export default async function handler(req, res) {
  const { id } = req.query;

  const response = await fetch(`https://ramashop.my.id/api/public/deposit/status/${id}`, {
    headers: {
      "X-API-Key": process.env.API_KEY
    }
  });

  const data = await response.json();

  res.status(200).json({
    status: data?.data?.status || "pending"
  });
}
