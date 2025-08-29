import { Button } from "@/components/ui/button";
import { Shuffle, Smile, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import moodImage from "@/assets/b3.jpg";

const moodBoosters = [
  "Your perfect person is out there looking for someone exactly like you! Keep your heart open! 💕",
  "Every day you're single is another day you're becoming the person your future partner will fall in love with.",
  "Love finds you when you're ready for it. Use this time to become the best version of yourself! ✨",
  "The right person will love your quirks, support your dreams, and make you feel like home.",
  "You deserve a love that feels like sunshine on a cloudy day. Don't settle for less! ☀️",
  "Being single means you're between chapters, not at the end of your love story.",
  "Your heart knows what it wants. Trust the process and stay open to love! 💖",
  "The best relationships start with self-love. You're already on the right path!",
  "Someone out there is hoping to meet someone exactly like you today! 🌟",
  "Love is not about finding someone to complete you, but someone to share your completeness with."
];

const encouragements = [
  "Your love story is still being written! 📖",
  "You're worthy of deep, genuine love! 💕",
  "Keep your heart open - magic happens! ✨",
  "You're exactly where you need to be! 🌟",
  "Love is coming your way! 💖"
];

export const MoodRefresher = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMood = () => {
    setIsRefreshing(true);
    
    // Show a random mood booster
    const randomBooster = moodBoosters[Math.floor(Math.random() * moodBoosters.length)];
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    setTimeout(() => {
      toast.success(randomBooster, {
        description: randomEncouragement,
        duration: 5000,
      });
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <section id="mood" className="py-20 px-4 bg-gradient-to-br from-accent/10 via-secondary/10 to-primary/10">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
            Love Inspiration
          </h2>
          <p className="text-lg text-muted-foreground">
            Need some love encouragement? We've got you covered!
          </p>
        </div>

        <div className="comic-card text-center max-w-2xl mx-auto">
          <div className="space-y-8">
            <div className="relative">
              <img 
                src={moodImage} 
                alt="Colorful comic-style hearts and speech bubbles for mood boosting" 
                className="w-64 h-64 mx-auto rounded-full shadow-bubble object-cover"
              />
              <div className="absolute inset-0 rounded-full border-4 border-accent/20 animate-pulse"></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                Need some love inspiration? Let's lift your spirits!
              </h3>
              <p className="text-muted-foreground">
                Click the button below for an instant dose of love encouragement and positivity.
              </p>
            </div>

            <Button 
              onClick={refreshMood}
              disabled={isRefreshing}
              className="btn-mood text-base sm:text-lg lg:text-xl px-6 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-8 rounded-full shadow-glow w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              {isRefreshing ? (
                <>
                  <Zap className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
                  <span className="hidden xs:inline">Refreshing Your Mood...</span>
                  <span className="xs:hidden">Refreshing...</span>
                </>
              ) : (
                <>
                  <Shuffle className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden xs:inline">Inspire My Heart!</span>
                  <span className="xs:hidden">Inspire Me!</span>
                </>
              )}
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Smile className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                <span>Love Inspiration</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
                <span>Heart Boost</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center gap-1">
                <Shuffle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>Daily Positivity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
