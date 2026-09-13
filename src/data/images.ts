const w = (id: string, width = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&h=${Math.round(width * 1.25)}&fit=crop&auto=format&q=80`;

export const IMG = {
  tarot: w("1600429753199-5376c2738737"),
  tarot2: w("1607773709367-06b7a91f7e4a"),
  nebulaBlue: w("1679615845580-8691c78fd7d3"),
  nebulaRed: w("1772672869101-7abc3637fb7e", 900),
  nebulaColor: w("1773833499488-bc7fe1c146f8", 900),
  meditation: w("1767197025839-ea0a064ea7bd"),
  meditation2: w("1775169726139-82f78b87b8a4"),
  sunset: w("1765806492219-5594d8a9984a"),
};
