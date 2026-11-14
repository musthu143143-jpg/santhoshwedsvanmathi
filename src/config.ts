/**
 * Everything personal lives here — edit these values to make the
 * website your own. The scratch seals read from `dateParts`.
 */
import { galleryPhotos } from "@/assets/gallery";
import { parentsPhoto, templeInterior } from "@/assets/scene";
import bridePhoto from "@/assets/bride.jpg";
import groomPhoto from "@/assets/groom.jpg";
import storyOne from "@/assets/story-1.jpg";
import storyTwo from "@/assets/story-2.jpg";
import storyThree from "@/assets/story-3.jpg";
import rsvpPhoto from "@/assets/rsvp-photo.jpg";

/** Pexels image URL helper (optionally cropped to w × h). */
const px = (id: number, w: number, h?: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}${
    h ? `&h=${h}&fit=crop` : ""
  }`;

export const wedding = {
  partnerOne: "Santhosh",
  partnerTwo: "Vanmathi",
  /** Names in Tamil script, shown under the English names at the entrance. */
  partnerOneTamil: "சந்தோஷ்",
  partnerTwoTamil: "வான்மதி",
  hashtag: "#SanthoshWedsVanmathi",
  contactEmail: "hello@santhoshvanmathi.com",

  /** Ceremony start, with the venue's UTC offset (IST = +05:30). */
  ceremonyStartISO: "2026-11-29T06:00:00+05:30",
  /** When the celebration winds down (used for calendar entries). */
  celebrationEndISO: "2026-11-29T07:30:00+05:30",

  longDate: "Sunday, November 29, 2026",
  rsvpBy: "the 15th of November",

  venue: "Kulandhai Vellappar Temple",
  address: "Kulandhai Vellappar Temple, Oddanchatram",
  city: "Oddanchatram, Tamil Nadu",
  country: "India",
  mapQuery: "Kulandhai Vellappar Temple, Oddanchatram, Tamil Nadu, India",
  venueNote:
    "With immense happiness and joy, we invite you to celebrate with us — wedding ceremony at Kulandhai Vellappar Temple, followed by a grand reception at Amman Mahal, Oddanchatram.",

  /** The three hidden values under the scratch-off hearts. */
  dateParts: [
    { id: "day", label: "Day", value: "29", italic: false },
    { id: "month", label: "Month", value: "November", italic: true },
    { id: "year", label: "Year", value: "2026", italic: false },
  ],

  /** The parents' welcome that appears while the temple doors open. */
  welcome: {
    image: parentsPhoto,
    alt: "The parents of the bride and groom welcoming guests with folded hands",
    heading: "Our parents welcome you",
    note: "With folded hands and full hearts, our families welcome you to the celebration.",
    cta: "Enter with their blessings",
  },

  events: [
    {
      time: "6:00 AM – 7:30 AM",
      title: "Muhurtham",
      place: "Kulandhai Vellappar Temple, Oddanchatram",
      note: "Wedding ceremony on Sunday, November 29, 2026. Please be seated by 5:30 AM.",
      icon: "ceremony",
    },
    {
      time: "Morning",
      title: "Blessings & Feast",
      place: "Temple Premises",
      note: "Seek the couple's blessings and join us for a traditional South Indian breakfast.",
      icon: "drinks",
    },
    {
      time: "6:00 PM – 9:00 PM",
      title: "Wedding Reception",
      place: "Amman Mahal, Oddanchatram",
      note: "Reception on Monday, November 30, 2026. Celebrate, dine and bless us as we begin our journey together.",
      icon: "party",
    },
  ],

  story: [
    {
      year: "2018",
      title: "A filter coffee introduction",
      text: "A mutual friend's housewarming in Chennai, one very strong filter coffee and a long conversation about Carnatic music. Neither of us made it to the dessert table.",
      image: storyOne,
      alt: "An Indian wedding couple in traditional dress",
    },
    {
      year: "2022",
      title: "A life in colour",
      text: "Weekend train journeys, overflowing family lunches and a tiny home filled with plants. Wherever we were, it was the small rituals that became our favourites.",
      image: storyTwo,
      alt: "An Indian couple embracing at their wedding",
    },
    {
      year: "2026",
      title: "One beautiful yes",
      text: "With the blessings of both families, Santhosh and Vanmathi said yes to forever. Now we wait to celebrate with you in Oddanchatram!",
      image: storyThree,
      alt: "Hands joined in a traditional Indian wedding ceremony",
    },
  ],

  /** The bride & groom, shown in "Meet the bride & groom". */
  bride: {
    tag: "The Bride",
    name: "R. Vanmathi",
    tamil: "வான்மதி",
    relation: "Daughter of",
    parents: "R. Family, Oddanchatram",
    blessedBy: "Both families, relatives & friends",
    hometown: "Oddanchatram",
    about:
      "With a heart full of joy, Vanmathi warmly invites you to celebrate the most special moments of her life with Santhosh. Your presence and blessings will make it even more memorable.",
    quote: "Waiting to celebrate with you!",
    likes: ["Family", "Traditions", "Celebrations", "Blessings"],
    image: bridePhoto,
    alt: "Vanmathi in a maroon blouse and green Kanjeevaram saree, jasmine in her hair",
  },
  groom: {
    tag: "The Groom",
    name: "R. Santhosh",
    tamil: "சந்தோஷ்",
    relation: "Son of",
    parents: "R. Family, Oddanchatram",
    blessedBy: "Both families, relatives & friends",
    hometown: "Oddanchatram",
    about:
      "With immense happiness, Santhosh invites you to join, celebrate and bless him and Vanmathi as they begin their beautiful journey together.",
    quote: "Your presence will mean a lot to us.",
    likes: ["Family", "Traditions", "Celebrations", "Blessings"],
    image: groomPhoto,
    alt: "Santhosh in a maroon silk shirt and beige trousers",
  },

  travel: [
    {
      icon: "train",
      title: "By train",
      text: "Nearest stations: Oddanchatram & Dindigul Junction, well connected from Madurai, Coimbatore & Chennai.",
    },
    {
      icon: "car",
      title: "By car",
      text: "Parking available near Kulandhai Vellappar Temple and Amman Mahal. Please follow the wedding signs.",
    },
    {
      icon: "bus",
      title: "Guest shuttle",
      text: "Shuttles will run between the temple, Amman Mahal and main town points. Timings will be shared soon.",
    },
  ],

  hotels: [
    {
      name: "Amman Mahal Guest Rooms",
      distance: "On-site",
      note: "Limited rooms near the reception venue. Contact the family to reserve.",
    },
    {
      name: "Hotels in Oddanchatram",
      distance: "5–10 min",
      note: "Comfortable lodges around the town. Mention Santhosh & Vanmathi's wedding when booking.",
    },
    {
      name: "Hotels in Dindigul",
      distance: "30 min",
      note: "More options in Dindigul city for those travelling from afar.",
    },
  ],

  dressCode: {
    title: "South Indian festive",
    note: "Silks, jewel tones and traditional attire are very welcome. Please dress respectfully for the temple ceremony and bring footwear that is easy to remove.",
    palette: [
      { name: "Kumkum", color: "#9e1e2c" },
      { name: "Marigold", color: "#d78916" },
      { name: "Peacock", color: "#0d6670" },
      { name: "Mango", color: "#d6a331" },
      { name: "Jasmine", color: "#fff7e8" },
    ],
  },

  faqs: [
    {
      q: "Can I bring a plus-one?",
      a: "Your formal invitation will be addressed to everyone we have saved a seat for. If it says and guest, we would love to meet them!",
    },
    {
      q: "Are children welcome?",
      a: "We adore your little ones, but we have chosen to make this an adults-only celebration, apart from our flower girl and page boy.",
    },
    {
      q: "What should I wear inside the temple?",
      a: "The ceremony is in a functioning temple, so please dress modestly. Shoes are removed before entering the inner hall and light shawls are a lovely idea.",
    },
    {
      q: "Is there parking at the venue?",
      a: "Yes, parking is available near Kulandhai Vellappar Temple and Amman Mahal. Please arrive early and follow the volunteers' guidance.",
    },
    {
      q: "Do you have a gift registry?",
      a: "Your presence is truly the greatest gift. If you would like to celebrate with something more, details of our honeymoon fund will come with the formal invitation.",
    },
    {
      q: "When will the formal invitation arrive?",
      a: "The wedding is on November 29–30, 2026. Formal invitations with full timings are being shared now.",
    },
  ],

  /**
   * Gallery photos now live in src/assets/gallery/ — replace the files there
   * (keep the names) to change the gallery. See index.ts in that folder.
   */
  gallery: galleryPhotos,

  images: {
    countdown: templeInterior,
        rsvp: rsvpPhoto,
  },
} as const;

export type DatePart = (typeof wedding.dateParts)[number];

 
