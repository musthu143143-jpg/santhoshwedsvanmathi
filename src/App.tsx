import { DateRevealProvider } from "@/context/DateReveal";
import { Navbar } from "@/components/Navbar";
import { TempleEntrance } from "@/components/TempleEntrance";
import { SaveTheDate } from "@/components/SaveTheDate";
import { CountdownSection } from "@/components/Countdown";
import { Story } from "@/components/Story";
import { BrideGroom } from "@/components/BrideGroom";
import { Details } from "@/components/Details";
import { Gallery } from "@/components/Gallery";
import { Rsvp } from "@/components/Rsvp";
import { MachanInvite } from "@/components/MachanInvite";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";

export default function App() {
  return (
    <DateRevealProvider>
      <Navbar />
      <main className="overflow-x-clip">
        <TempleEntrance />
        <SaveTheDate />
        <CountdownSection />
        <Story />
        <BrideGroom />
        <Details />
        <Gallery />
        <MachanInvite />
        <Rsvp />
        <Faq />
      </main>
      <Footer />
    </DateRevealProvider>
  );
}
