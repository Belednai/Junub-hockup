import { Button } from "@/components/ui/button";
import { RotateCcw, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import dailyTipImage from "@/assets/b2.jpg";

const tips = [
  {
    title: "Active Listening",
    tip: "True connection happens when you listen to understand, not to respond. Give your partner your full attention and watch your relationship flourish.",
    category: "Communication"
  },
  {
    title: "Express Gratitude Daily",
    tip: "Make it a habit to tell your partner one thing you appreciate about them every day. Gratitude strengthens the bond between two hearts.",
    category: "Appreciation"
  },
  {
    title: "Quality Time Matters",
    tip: "Put away distractions and spend focused time together. Even 15 minutes of undivided attention can strengthen your connection significantly.",
    category: "Connection"
  },
  {
    title: "Communicate Your Needs",
    tip: "Your partner isn't a mind reader. Express your needs clearly and kindly - it's the foundation of a healthy relationship.",
    category: "Honesty"
  },
  {
    title: "Show Affection",
    tip: "Small gestures of love - a hug, a kind note, or a gentle touch - can make your partner feel cherished and valued every day.",
    category: "Love Language"
  },
  {
    title: "Support Their Dreams",
    tip: "Be your partner's biggest cheerleader. Supporting each other's goals and dreams creates a powerful foundation for lasting love.",
    category: "Support"
  }
];

const premiumTips = [
  {
    title: "Build Emotional Intimacy",
    tip: "Share your fears, dreams, and vulnerabilities with your partner. Emotional intimacy creates deeper bonds than physical attraction alone.",
    category: "Deep Connection"
  },
  {
    title: "Practice Forgiveness",
    tip: "Learn to forgive quickly and completely. Holding grudges poisons love, while forgiveness allows your relationship to grow stronger.",
    category: "Healing"
  },
  {
    title: "Create Shared Rituals",
    tip: "Establish special traditions together - morning coffee, evening walks, or weekly date nights. These rituals become the heartbeat of your relationship.",
    category: "Bonding"
  },
  {
    title: "Respect Boundaries",
    tip: "Healthy relationships have healthy boundaries. Respect your partner's need for space, friends, and individual interests.",
    category: "Respect"
  },
  {
    title: "Grow Together",
    tip: "Encourage each other's personal growth. The best relationships are where both people become better versions of themselves.",
    category: "Growth"
  },
  {
    title: "Handle Conflict Wisely",
    tip: "Disagreements are normal, but how you handle them matters. Focus on the issue, not attacking the person. Fight fair, love harder.",
    category: "Conflict Resolution"
  },
  {
    title: "Keep Romance Alive",
    tip: "Don't let routine kill romance. Surprise each other, plan special dates, and never stop courting the person you love.",
    category: "Romance"
  },
  {
    title: "Trust Your Instincts",
    tip: "If something feels right in your heart, trust it. Your intuition often knows what your mind is still figuring out about love.",
    category: "Intuition"
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
            Daily Love Tip {user && <span className="text-accent">Premium</span>}
          </h2>
          <p className="text-lg text-muted-foreground">
            {user 
              ? "Exclusive relationship wisdom to help you build lasting love!" 
              : "Your daily dose of genuine relationship wisdom"
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
