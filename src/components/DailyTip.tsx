import { Button } from "@/components/ui/button";
import { RotateCcw, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import dailyTipImage from "@/assets/daily-tip.jpg";

const tips = [
  {
    title: "The Netflix Defense",
    tip: "Skipping his texts to watch Netflix is self-care. You're investing in your emotional wellbeing through quality television programming.",
    category: "Self-Care"
  },
  {
    title: "The Communication Formula",
    tip: "Love is 50% communication, 50% guessing why they're mad, and 100% bad at math.",
    category: "Math"
  },
  {
    title: "The Holy Trinity",
    tip: "Every healthy relationship needs three things: trust, laughter, and snacks. Preferably delivered.",
    category: "Essentials"
  },
  {
    title: "Reading the Signs",
    tip: "If they reply with 'K', they're either busy or plotting your demise. There's no middle ground.",
    category: "Communication"
  },
  {
    title: "The Apology Algorithm",
    tip: "Say sorry first, figure out what you did wrong later. It's called relationship efficiency.",
    category: "Strategy"
  },
  {
    title: "Social Media Science",
    tip: "Liking their ex's photos is not research, it's archaeology. And it's weird.",
    category: "Social Skills"
  }
];

const premiumTips = [
  {
    title: "The Ghosting GPS",
    tip: "If someone ghosts you, they're not lost - they're just exploring the wilderness of commitment phobia.",
    category: "Dating Reality"
  },
  {
    title: "The Overthinking Olympics",
    tip: "Gold medal goes to whoever can analyze a 'hey' text for 3 hours straight. You're all champions here.",
    category: "Premium Anxiety"
  },
  {
    title: "The Emoji Decoder",
    tip: "😊 = I'm happy, 🙂 = I'm dead inside but polite, 😏 = I know something you don't (probably your password).",
    category: "Digital Secrets"
  },
  {
    title: "The Relationship GPS",
    tip: "Love is like GPS - it recalculates constantly, sometimes takes you the long way, and occasionally stops working entirely.",
    category: "Navigation"
  },
  {
    title: "The Commitment Compass",
    tip: "Some people have a commitment phobia, others have commitment FOMO. Both are equally exhausting to date.",
    category: "Premium Psychology"
  },
  {
    title: "The Modern Romance Manual",
    tip: "Sliding into DMs is the modern equivalent of sending a carrier pigeon, except the pigeon has read receipts.",
    category: "Digital Age"
  },
  {
    title: "The Self-Love Hack",
    tip: "Treat yourself like you would treat your best friend - with pizza, patience, and terrible movie choices.",
    category: "Premium Self-Care"
  },
  {
    title: "The Dating App Philosophy",
    tip: "Swiping right is modern window shopping, except the windows swipe back and sometimes send unsolicited photos.",
    category: "App Wisdom"
  }
];

export const DailyTip = () => {
  const { user } = useAuth();
  const [currentTip, setCurrentTip] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const availableTips = user ? [...tips, ...premiumTips] : tips;

  const getNewTip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTip((prev) => (prev + 1) % availableTips.length);
      setIsAnimating(false);
    }, 300);
  };

  const tip = availableTips[currentTip];

  return (
    <section id="daily-tip" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
            Daily Comic Tip {user && <span className="text-accent">Premium</span>}
          </h2>
          <p className="text-lg text-muted-foreground">
            {user 
              ? "Exclusive questionable relationship wisdom for members!" 
              : "Your daily dose of questionable relationship wisdom"
            }
          </p>
          {!user && (
            <p className="text-sm text-accent mt-2">
              Sign up to unlock premium tips and exclusive content! ✨
            </p>
          )}
        </div>

        <div className="comic-card max-w-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <img 
                src={dailyTipImage} 
                alt="Cartoon character having a eureka moment about relationships" 
                className="w-full rounded-2xl shadow-bubble"
              />
              <div className="absolute -top-4 -right-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-bubble ${
                  user && currentTip >= tips.length 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {user && currentTip >= tips.length ? '⭐ ' : ''}{tip.category}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-6 w-6 text-accent bounce-gentle" />
                  <h3 className="text-xl font-bold text-foreground">{tip.title}</h3>
                </div>
                
                <div className="speech-bubble bg-primary/5 border-primary/20">
                  <p className="text-comic text-foreground leading-relaxed">
                    {tip.tip}
                  </p>
                </div>
              </div>

              <Button 
                onClick={getNewTip}
                className="btn-mood w-full"
                disabled={isAnimating}
              >
                <RotateCcw className={`mr-2 h-4 w-4 ${isAnimating ? 'animate-spin' : ''}`} />
                Get New Tip ({currentTip + 1}/{availableTips.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};