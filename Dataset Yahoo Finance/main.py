import yfinance as yf

data = yf.download(
    "BBRI.JK",
    start="2015-01-01",
    end="2026-06-18",
    auto_adjust=False
)

print(data.head())

data.to_csv("BBRI_2015_2026.csv")