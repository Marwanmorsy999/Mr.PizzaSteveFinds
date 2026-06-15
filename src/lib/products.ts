export type Product = {
  id: string;
  name: string;
  size?: string;
  price?: number;
  priceLabel?: string;
  status: "available" | "sold";
  emoji: string;
  tag: string;
};

export const products: Product[] = [
  {
    id: "nike-tribal",
    name: "Nike Heavy Weight Tribal Swoosh Tee",
    size: "M",
    price: 850,
    status: "available",
    emoji: "✔️",
    tag: "TEE",
  },
  {
    id: "lacoste",
    name: "Lacoste Tee",
    size: "S",
    price: 700,
    status: "available",
    emoji: "🐊",
    tag: "TEE",
  },
  {
    id: "cargo-jorts",
    name: "Cargo Jeans Jorts",
    size: "30 / 31",
    priceLabel: "Price TBD",
    status: "available",
    emoji: "🩳",
    tag: "JORTS",
  },
  {
    id: "embroidered-jorts",
    name: "Embroidered Jorts",
    size: "30 / 31",
    priceLabel: "Price TBD",
    status: "available",
    emoji: "🧵",
    tag: "JORTS",
  },
  {
    id: "vintage-eyewear",
    name: "Vintage Eyewear Collection",
    priceLabel: "Price TBD",
    status: "available",
    emoji: "🕶️",
    tag: "ACCESSORIES",
  },
  {
    id: "harley",
    name: "Harley Davidson Drop",
    priceLabel: "Price TBD",
    status: "available",
    emoji: "🏍️",
    tag: "DROP",
  },
  {
    id: "ed-hardy",
    name: "Don Ed Hardy Zip Up by Christian Audigier — All Over Embroidery",
    priceLabel: "SOLD",
    status: "sold",
    emoji: "🔥",
    tag: "GRAIL",
  },
];
