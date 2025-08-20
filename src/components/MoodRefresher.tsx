import { Button } from "@/components/ui/button";
import { Shuffle, Smile, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import moodImage from "@/assets/mood-refresher.jpg";

const moodBoosters = [
  "Remember: You're single by choice. Bad choice, but still choice! 😂",
  "Your love life is like WiFi - sometimes it works, sometimes it doesn't, but everyone keeps asking for the password.",
  "Being single means you can eat the entire pizza without judgment. That's basically winning at life! 🍕",
  "Love is in the air... but so is the WiFi signal, and that's more reliable.",
  "You don't need a relationship status. You need a pizza delivery status.",
  "Relationship tip: If you love someone, set them free. If they come back, change your locks.",
  "Single and ready to... take a nap without anyone bothering me.",
  "Love is like a good TV series - everyone talks about it, but most of it is just drama.",
  "Why find your other half when you can be whole by yourself? Math doesn't lie! 🧮",
  "Roses are red, violets are blue, I'm bad at poetry, coffee will do. ☕"
];

const encouragements = [
  "You're doing great! Keep laughing! 🌟",
  "Laughter is the best medicine (and it's free)! 💊",
  "Your sense of humor is your superpower! 🦸‍♀️",
  "Keep smiling, you beautiful human! 😊",
  "You just made your day 10% better! 📈"
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
    <section className="py-20 px-4 bg-gradient-to-br from-accent/10 via-secondary/10 to-primary/10">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
            Mood Refresher
          </h2>
          <p className="text-lg text-muted-foreground">
            Need an instant laugh? We've got you covered!
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
                Feeling down? Let's fix that!
              </h3>
              <p className="text-muted-foreground">
                Click the button below for an instant dose of comedy and encouragement.
              </p>
            </div>

            <Button 
              onClick={refreshMood}
              disabled={isRefreshing}
              className="btn-mood text-xl px-12 py-8 rounded-full shadow-glow"
            >
              {isRefreshing ? (
                <>
                  <Zap className="mr-3 h-6 w-6 animate-pulse" />
                  Refreshing Your Mood...
                </>
              ) : (
                <>
                  <Shuffle className="mr-3 h-6 w-6" />
                  Refresh My Mood!
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Smile className="h-4 w-4 text-accent" />
                <span>Instant Laughs</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-secondary" />
                <span>Mood Boost</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center gap-1">
                <Shuffle className="h-4 w-4 text-primary" />
                <span>Random Fun</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};