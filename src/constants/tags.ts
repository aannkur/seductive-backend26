export const TAGS = [
  // Personality & Service Style
  {
    label: "Kinky",
    description: "Open to adventurous and unconventional experiences",
  },
  {
    label: "Romantic",
    description: "Provides intimate and romantic experiences",
  },
  {
    label: "Discreet",
    description: "Maintains complete privacy and confidentiality",
  },
  { label: "Luxury", description: "Premium high-end service experience" },
  {
    label: "Professional",
    description: "Maintains professional standards and boundaries",
  },
  {
    label: "Friendly",
    description: "Warm, approachable, and easy-going personality",
  },
  { label: "Energetic", description: "High energy and enthusiastic companion" },
  { label: "Calm", description: "Relaxed and peaceful demeanor" },
  { label: "Sophisticated", description: "Elegant, refined, and cultured" },
  { label: "Playful", description: "Fun-loving and lighthearted personality" },
  { label: "Intimate", description: "Focuses on deep personal connection" },
  {
    label: "Adventurous",
    description: "Open to trying new experiences and activities",
  },

  // Service Types
  {
    label: "GFE",
    description:
      "Girlfriend Experience - provides a genuine relationship-like experience",
  },
  {
    label: "PSE",
    description: "Pornstar Experience - intense and explicit service style",
  },
  { label: "Outcall", description: "Available to visit your location" },
  { label: "Incall", description: "Available at their own location" },
  {
    label: "Travel Companion",
    description: "Available for travel and extended trips",
  },
  {
    label: "Dinner Date",
    description: "Available for social dining and events",
  },
  { label: "Overnight", description: "Available for overnight stays" },
  {
    label: "Extended Dates",
    description: "Available for multi-day arrangements",
  },
  { label: "Duo", description: "Available with another companion" },
  {
    label: "Party Companion",
    description: "Available for parties and social events",
  },

  // Specialties & Interests
  {
    label: "BDSM",
    description:
      "Bondage, Discipline, Dominance, Submission, Sadism, Masochism",
  },
  { label: "Massage", description: "Professional massage services" },
  {
    label: "Roleplay",
    description: "Enjoys fantasy and role-playing scenarios",
  },
  { label: "Fetish", description: "Open to various fetish interests" },
  { label: "Domination", description: "Takes dominant role in interactions" },
  { label: "Submission", description: "Takes submissive role in interactions" },
  { label: "Bondage", description: "Specializes in bondage activities" },
  { label: "Anal", description: "Open to anal activities" },
  { label: "Oral", description: "Specializes in oral services" },
  { label: "Kissing", description: "Enjoys intimate kissing" },
  {
    label: "Tantric",
    description: "Practices tantric and spiritual connection",
  },
  {
    label: "Sensual",
    description: "Focuses on sensual and tactile experiences",
  },

  // Appearance
  { label: "Blonde", description: "Blonde hair color" },
  { label: "Brunette", description: "Brown or dark hair color" },
  { label: "Redhead", description: "Red or auburn hair color" },
  { label: "Curvy", description: "Curvaceous body type" },
  { label: "Slim", description: "Slim and slender body type" },
  { label: "Athletic", description: "Athletic and toned physique" },
  { label: "Tall", description: "Above average height" },
  { label: "Petite", description: "Small and delicate frame" },
  { label: "Busty", description: "Large bust size" },
  { label: "Natural", description: "Natural appearance without enhancements" },
  { label: "Enhanced", description: "Cosmetic enhancements present" },

  // Availability & Status
  {
    label: "Available Now",
    description: "Currently available for immediate booking",
  },
  {
    label: "Same Day Booking",
    description: "Accepts same-day appointment requests",
  },
  { label: "Verified", description: "Identity and credentials verified" },
  { label: "New", description: "Recently joined the platform" },
  { label: "Popular", description: "Highly rated and frequently booked" },
  { label: "Featured", description: "Featured profile on the platform" },
  { label: "VIP", description: "VIP status member" },
  { label: "Elite", description: "Elite tier service provider" },
  { label: "Premium", description: "Premium service level" },

  // Additional
  { label: "Bilingual", description: "Fluent in multiple languages" },
  {
    label: "Well Educated",
    description: "Highly educated and intellectually engaging",
  },
  { label: "Tattooed", description: "Has visible tattoos" },
  { label: "Pierced", description: "Has body piercings" },
  { label: "Non-Smoker", description: "Non-smoking companion" },
  { label: "Pet Friendly", description: "Comfortable with pets" },
] as const;

export type TagData = {
  label: string;
  description: string;
};
