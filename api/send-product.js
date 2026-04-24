export default function handler(req, res) {
  const product = "Kode Voucher: HFZ-05" + Math.random().toString(36).substr(2,8);

  res.status(200).json({ product });
}
