document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card").forEach(btn => {
    btn.addEventListener("click", () => {
      const amount = btn.getAttribute("data-amount");
      beli(amount);
    });
  });
});

async function beli(amount) {
  const payment = document.getElementById("payment");

  payment.innerHTML = `
    <div class="loader"></div>
    <p>Membuat pembayaran...</p>
  `;

  try {
    const res = await fetch("/api/create-deposit", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ amount: Number(amount) })
    });

    const data = await res.json();

    if (!data.depositId) {
      payment.innerHTML = "❌ Gagal membuat pembayaran";
      return;
    }

    payment.innerHTML = `
      <h3>Scan QRIS</h3>
      <img src="${data.qrImage}" width="220"/>
      <p>Menunggu pembayaran...</p>
    `;

    cekStatus(data.depositId);

  } catch (err) {
    payment.innerHTML = "❌ Error koneksi";
  }
}

function cekStatus(id) {
  const interval = setInterval(async () => {
    const res = await fetch("/api/check-status?id=" + id);
    const data = await res.json();

    if (data.status === "success") {
      clearInterval(interval);

      const send = await fetch("/api/send-product", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ id })
      });

      const result = await send.json();

      document.getElementById("payment").innerHTML = `
        <h2>✅ Pembayaran Berhasil</h2>
        <p>${result.product}</p>
      `;
    }
  }, 5000);
}
