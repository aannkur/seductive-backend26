export const COUNTRIES = [
  { name: "United Kingdom", shortcode: "uk" },
  { name: "United States", shortcode: "us" },
  { name: "Canada", shortcode: "ca" },
  { name: "Ireland", shortcode: "ie" },
  { name: "Australia", shortcode: "au" },
] as const;

export type CountryData = {
  name: string;
  shortcode: string;
};
