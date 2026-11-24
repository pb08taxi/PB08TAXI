import os

p = "frontend/src/context/SiteSettingsContext.jsx"
with open(p, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("'/Logo/Logo_PB08TAXI.webp'", "'/Logo/pb08taxi-logo-1791754759.png'")
text = text.replace('"/Logo/Logo_PB08TAXI.webp"', "'/Logo/pb08taxi-logo-1791754759.png'")

with open(p, "w", encoding="utf-8") as f:
    f.write(text)

print("Updated SiteSettingsContext.jsx with pb08taxi-logo-1791754759.png!")
