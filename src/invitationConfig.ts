import type { WeddingEvent } from "./invitation/schema";

export type Celebration = WeddingEvent;
const venue = {
  name: "Royal Vardhman Guest House",
  address: "Lane opposite New Rasgollah House, Station Road, Ladnun",
};
const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}`)}`;
const regards = "Haji Mohammed Nathu · Haji Mohammad Rafiq · Mohammed Arif · Mohammed Aslam · Mohammed Arman · Mohammad Ana";
const event = (details: Pick<WeddingEvent, "id" | "shortName" | "title" | "start" | "supportingLine" | "image">): WeddingEvent => ({
  ...details, venue: venue.name, address: venue.address, mapUrl, scene: "lanterns", phereTime: "",
});
export const invitationConfig = {
  couple: {
    first: "Mo. Adnan", second: "Saniya",
    brideParents: "Dukhtar-e Haji Mo. Imran & Amna",
    groomParents: "Farzand-e Mohammed Arif & Sabhnam",
    groomGrandparents: "",
  },
  countdownTarget: "2026-12-05T13:00:00+05:30",
  memorialLine: "Bismillahir Rahmanir Rahim — In the name of Allah, the Most Merciful, the Most Compassionate.",
  invitationLine: "With gratitude to Allah, our families cordially invite you to the Nikah of Mo. Adnan and Saniya. Please honour this joyous occasion with your presence and duas.",
  blessingLine: "May Allah bless their union with love, mercy and barakah. Ameen.",
  homeAddress: "",
  hosts: regards, rsvp: "Mohammed Arif & Family", wishesFrom: regards,
  artwork: "/assets/muslim-nikah-v1.webp",
  venue: { ...venue, mapUrl },
  contacts: ["8890085006", "9829759585", "9829895959", "9950955176"],
  optional: { travel: "", stay: "", contact: "", musicUrl: "/assets/kudmayi-mobile-v1.mp3", whatsappHostNumber: "" },
  celebrations: [
    event({ id: "haldi", shortName: "Rasm-e-Haldi", title: "Rasm-e-Haldi — Rang-e-Khushi",
      start: "2026-12-04T17:00:00+05:30",
      supportingLine: "Haldi ke rang, apnon ka saath aur khushiyon ki saugaat. Join our family for a warm evening of haldi, flowers and heartfelt duas.",
      image: "/assets/muslim-haldi-v1.webp" }),
    event({ id: "mehndi", shortName: "Mehndi ki Shaam", title: "Mehndi ki Shaam — Rang-e-Mohabbat",
      start: "2026-12-04T17:00:00+05:30",
      supportingLine: "Mehndi ki khushboo, rishton ki mithaas. An evening of henna, laughter and cherished moments with our loved ones.",
      image: "/assets/muslim-mehndi-v1.webp" }),
    event({ id: "wedding", shortName: "Dawat-e-Nikah", title: "Dawat-e-Nikah — Qubool Hai",
      start: "2026-12-05T13:00:00+05:30",
      supportingLine: "Insha’Allah, two hearts begin a life together in Nikah. Please grace the occasion with your presence and duas for a blessed union.",
      image: "/assets/muslim-nikah-v1.webp" }),
    event({ id: "reception", shortName: "Dawat-e-Walima", title: "Dawat-e-Walima — Jashn-e-Mohabbat",
      start: "2026-12-06T19:00:00+05:30",
      supportingLine: "With shukr to Allah and joy in our hearts, we invite you to share the Walima feast and bless the newlyweds with your duas.",
      image: "/assets/muslim-walima-v1.webp" }),
  ],
};
