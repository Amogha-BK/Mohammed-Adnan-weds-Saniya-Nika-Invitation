import { invitationConfig as original } from "../invitationConfig";
import type { WeddingRecord } from "./schema";

/** Customer details shared by the invitation and local editor. */
export const customerRecord: WeddingRecord = {
  version: 1,
  templateId: "botanical",
  language: "en",
  weddingDate: original.countdownTarget.slice(0, 10),
  city: "Sujangarh",
  scratchLocation: "5 Dec: Barat · Sujangarh | 6 Dec: Walima · Ladnun",
  couple: { ...original.couple },
  countdownTarget: original.countdownTarget,
  memorialLine: original.memorialLine,
  invitationLine: original.invitationLine,
  blessingLine: original.blessingLine,
  homeAddress: original.homeAddress,
  hosts: original.hosts,
  rsvp: original.rsvp,
  wishesFrom: original.wishesFrom,
  venue: { ...original.venue },
  contacts: [...original.contacts],
  optional: { ...original.optional },
  media: {
    portraitUrl: "/assets/muslim-couple-v1.webp",
    portraitAlt: "A Muslim bride in an emerald bridal gharara and head-draped dupatta beside her groom in an ivory sherwani and safa",
    venueArtworkUrl: original.artwork,
  },
  wording: {
    heroMessage: "Dawat-e-Nikah — With the blessings of Allah, a beautiful new chapter begins. Insha’Allah.",
    heroFootnote: "Aapki shirkat aur duaon ke muntazir.",
    celebrationsIntro: "Haldi aur Mehndi Ladnun mein; 5 December ko Barat aur Nikah Sujangarh mein; 6 December ko Dawat-e-Walima Ladnun mein. Join us with your heartfelt duas.",
    closingNote: "Tashreef laaiye aur apni duaon se nawaziye.",
  },
  celebrations: original.celebrations.map((event) => ({ ...event, phereTime: "" })),
};
