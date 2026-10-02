// Trusted product catalog. Prices are whole naira and are the only prices the
// server uses when calculating order totals.

export type Product = {
  id: string;
  name: string;
  kind: "single" | "bundle";
  description: string;
  price: number;
  image: string;
  includes?: string[];
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=800&fit=crop&q=80`;

export const products: Product[] = [
  {
    id: "signature-perfume",
    name: "Signature Perfume",
    kind: "single",
    description: "A warm amber eau de parfum with soft vanilla and oud notes.",
    price: 25000,
    image: unsplash("1588405748880-12d1d2a59f75"),
  },
  {
    id: "body-mist",
    name: "Body Mist",
    kind: "single",
    description: "A light, fresh floral mist for everyday wear.",
    price: 12000,
    image: unsplash("1629198688000-71f23e745b6e"),
  },
  {
    id: "perfume-oil",
    name: "Perfume Oil",
    kind: "single",
    description: "Concentrated, alcohol-free fragrance oil that lasts all day.",
    price: 8500,
    image: unsplash("1617897903246-719242758050"),
  },
  {
    id: "atomizer",
    name: "Travel Atomizer",
    kind: "single",
    description: "Refillable pocket spray bottle for your favourite scent on the go.",
    price: 3000,
    image: unsplash("1602928321679-560bb453f190"),
  },
  {
    id: "diffuser",
    name: "Home Diffuser",
    kind: "single",
    description: "Fill your room with a calm, lasting fragrance.",
    price: 8000,
    image: unsplash("1602874801007-bd458bb1b8b6"),
  },
  {
    id: "starter-duo",
    name: "Starter Duo",
    kind: "bundle",
    description: "The easiest way to start your fragrance routine.",
    price: 10500,
    image: unsplash("1608571423902-eed4a5ad8108"),
    includes: ["Perfume Oil", "Travel Atomizer"],
  },
  {
    id: "fresh-day-set",
    name: "Fresh Day Set",
    kind: "bundle",
    description: "Layer a light mist over a long-lasting oil.",
    price: 18500,
    image: unsplash("1592945403244-b3fbafd7f539"),
    includes: ["Body Mist", "Perfume Oil"],
  },
  {
    id: "signature-on-the-go",
    name: "Signature On-the-Go",
    kind: "bundle",
    description: "Your signature scent plus a travel atomizer to carry it.",
    price: 26500,
    image: unsplash("1557170334-a9632e77c6e4"),
    includes: ["Signature Perfume", "Travel Atomizer"],
  },
  {
    id: "home-and-body",
    name: "Home & Body Set",
    kind: "bundle",
    description: "Matching fragrance for you and your space.",
    price: 18500,
    image: unsplash("1595535373192-fc8935bacd89"),
    includes: ["Body Mist", "Home Diffuser"],
  },
  {
    id: "complete-collection",
    name: "The Complete Collection",
    kind: "bundle",
    description: "All five Mia's Scent essentials at our best price.",
    price: 50000,
    image: unsplash("1563170351-be82bc888aa4"),
    includes: [
      "Signature Perfume",
      "Body Mist",
      "Perfume Oil",
      "Travel Atomizer",
      "Home Diffuser",
    ],
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

// Highest quantity of a single product allowed in one order.
export const MAX_QUANTITY = 20;
