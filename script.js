document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card").forEach(btn => {
    btn.addEventListener("click", () => {
      const amount = btn.getAttribute("data-amount");
      beli(Number(amount));
    });
  });
});

let countdownInterval;

async function beli(amount) {
  const payment = document.getElementById("payment");

  // loading UI
  payment.innerHTML = `
    <div class="loader"></div>
    <p>Membuat pembayaran...</p>
    <div id="timer" style="margin-top:10px;"></div>
  `;

  try {
    const res = await fetch("/api/create-deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });

    const data = await res.json();

    if (!data.depositId) {
      payment.innerHTML = "❌ Gagal membuat pembayaran";
      return;
    }

    // tampil QR + info bayar
    payment.innerHTML = `
      <h3>Scan QRIS</h3>
      <img src="${data.qrImage}" width="220"/>

      <p>💳 Silakan lakukan pembayaran</p>

      <p id="timer">⏱️ 15:00 (expired)</p>

      <small style="opacity:0.7">
        Transaksi otomatis batal jika tidak dibayar
      </small>
    `;

    // jalankan timer
    startTimer();

    // cek status pembayaran
    cekStatus(data.depositId);

  } catch (err) {
    payment.innerHTML = "❌ Error koneksi server";
  }
}

function startTimer() {
  let time = 900; // 15 menit

  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    time--;

    const m = Math.floor(time / 60);
    const s = time % 60;

    const el = document.getElementById("timer");
    if (el) {
      el.innerHTML = `⏱️ ${m}:${s < 10 ? "0" : ""}${s} (expired)`;
    }

    if (time <= 0) {
      clearInterval(countdownInterval);

      document.getElementById("payment").innerHTML = `
        <h2>❌ Payment Expired</h2>
        <p>Waktu pembayaran habis (15 menit)</p>
      `;
    }
  }, 1000);
}

function cekStatus(id) {
  const interval = setInterval(async () => {
    const res = await fetch("/api/check-status?id=" + id);
    const data = await res.json();

    if (data.status === "success") {
      clearInterval(interval);
      clearInterval(countdownInterval);

      const send = await fetch("/api/send-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
