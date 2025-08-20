import { Hero } from "@/components/Hero";
import { DailyTip } from "@/components/DailyTip";
import { ComicQuotes } from "@/components/ComicQuotes";
import { MoodRefresher } from "@/components/MoodRefresher";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <DailyTip />
      <ComicQuotes />
      <MoodRefresher />
      <Footer />
    </div>
  );
};

export default Index;
