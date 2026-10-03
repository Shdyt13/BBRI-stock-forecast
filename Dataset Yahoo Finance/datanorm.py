import pandas as pd
import matplotlib.pyplot as plt

# =========================
# DATA HASIL NORMALISASI
# =========================
data = {
    "Date": [
        "02", "05", "06", "07", "08",
        "09", "12", "13", "14", "15"
    ],
    "Close": [
        0.250000,
        0.150000,
        0.000000,
        0.500000,
        0.900000,
        1.000000,
        0.450000,
        0.600000,
        0.450000,
        0.350000
    ]
}

df = pd.DataFrame(data)

# =========================
# MEMBUAT GRAFIK
# =========================
fig, ax = plt.subplots(figsize=(12, 6))

ax.plot(
    df["Date"],
    df["Close"],
    linewidth=2.5,
    marker="o",
    markersize=6,
    label="Close"
)

# =========================
# MENAMPILKAN NILAI
# =========================
for i, value in enumerate(df["Close"]):
    ax.annotate(
        f"{value:.3f}",
        (i, value),
        textcoords="offset points",
        xytext=(0, 8),
        ha="center",
        fontsize=9
    )

# =========================
# JUDUL DAN LABEL
# =========================
ax.set_title(
    "Pergerakan Harga Close Setelah Normalisasi",
    fontsize=16,
    fontweight="bold",
    pad=15
)

ax.set_xlabel("Tanggal", fontsize=11)
ax.set_ylabel("Nilai Normalisasi", fontsize=11)

# Rentang nilai
ax.set_ylim(-0.05, 1.10)

# Grid
ax.grid(
    True,
    linestyle="--",
    linewidth=0.7,
    alpha=0.35
)

# Hilangkan garis atas dan kanan
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)

# Legend
ax.legend(frameon=False)

plt.tight_layout()
plt.show()