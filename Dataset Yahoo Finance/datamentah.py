import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# =========================
# DATA
# =========================
data = {
    "Date": [
        "2015-01-02",
        "2015-01-05",
        "2015-01-06",
        "2015-01-07",
        "2015-01-08",
        "2015-01-09",
        "2015-01-12",
        "2015-01-13",
        "2015-01-14",
        "2015-01-15"
    ],
    "Close": [
        2118.145264,
        2109.054443,
        2095.418457,
        2140.872070,
        2177.235107,
        2186.325928,
        2136.326660,
        2149.962891,
        2136.326660,
        2127.236084
    ]
}

# =========================
# DATAFRAME
# =========================
df = pd.DataFrame(data)
df["Date"] = pd.to_datetime(df["Date"])

# =========================
# VISUALISASI
# =========================
fig, ax = plt.subplots(figsize=(12, 6))

ax.plot(
    df["Date"],
    df["Close"],
    linewidth=2.5,
    marker="o",
    markersize=6,
    markeredgewidth=1,
    label="Close Price"
)

# =========================
# MENAMPILKAN ANGKA HARGA
# =========================
for date, price in zip(df["Date"], df["Close"]):
    ax.annotate(
        f"{price:,.2f}",
        xy=(date, price),
        xytext=(0, 10),
        textcoords="offset points",
        ha="center",
        va="bottom",
        fontsize=9
    )

# =========================
# JUDUL DAN LABEL
# =========================
ax.set_title(
    "Data Sampel Mentah Saham BBRI",
    fontsize=16,
    fontweight="bold",
    pad=15
)

ax.set_xlabel(
    "Tanggal",
    fontsize=11
)

ax.set_ylabel(
    "Harga Penutupan",
    fontsize=11
)

# =========================
# FORMAT TANGGAL
# =========================
ax.xaxis.set_major_formatter(
    mdates.DateFormatter("%d %b")
)

# =========================
# GRID
# =========================
ax.grid(
    True,
    linestyle="--",
    linewidth=0.7,
    alpha=0.35
)

# =========================
# SPINES
# =========================
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)

# =========================
# TICK
# =========================
ax.tick_params(
    axis="both",
    labelsize=10
)

plt.xticks(rotation=0)

# =========================
# LEGEND
# =========================
ax.legend(
    frameon=False,
    loc="best"
)

# =========================
# LAYOUT
# =========================
plt.tight_layout()

# =========================
# TAMPILKAN
# =========================
plt.show()