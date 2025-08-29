import { Hero } from "@/components/Hero";
import { DatingQuotes } from "@/components/DatingQuotes";
import { DailyTip } from "@/components/DailyTip";
import { ComicQuotes } from "@/components/ComicQuotes";
import { MoodRefresher } from "@/components/MoodRefresher";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      <Hero />
      <DatingQuotes />
      <div className="container mx-auto px-4 space-y-12 py-12">
        <DailyTip />
        <ComicQuotes />
        <MoodRefresher />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
