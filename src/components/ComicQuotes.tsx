import { Quote, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const quotes = [
  {
    text: "Love is giving someone the power to destroy you and trusting them not to use it... immediately.",
    author: "Anonymous Romantic",
    category: "Trust Issues"
  },
  {
    text: "I love you more than pizza. And that's saying something because I REALLY love pizza.",
    author: "Food Lover",
    category: "Priorities"
  },
  {
    text: "Relationship status: Committed to my bed and my Netflix account.",
    author: "Modern Bachelor",
    category: "Single Life"
  },
  {
    text: "Love is being stupid together. That's why some couples are really, really stupid.",
    author: "Relationship Expert",
    category: "Wisdom"
  },
  {
    text: "I'm not arguing, I'm just explaining why I'm right. Again.",
    author: "Every Couple Ever",
    category: "Communication"
  },
  {
    text: "Marriage is when a man loses his bachelor's degree and gets a master's degree.",
    author: "Married Guy",
    category: "Marriage"
  }
];

const premiumQuotes = [
  {
    text: "Love is sharing your popcorn. True love is sharing your WiFi password.",
    author: "Digital Native",
    category: "Modern Love"
  },
  {
    text: "I love you even when you're hangry. That's real commitment.",
    author: "Patient Partner",
    category: "Unconditional Love"
  },
  {
    text: "Couple goals: Being weird together and calling it normal.",
    author: "Weird Couple",
    category: "Goals"
  },
  {
    text: "Love is when you text each other at the same time and feel like soulmates.",
    author: "Text Twins",
    category: "Synchronicity"
  },
  {
    text: "My love language is food delivery apps. Nothing says 'I love you' like ordering my favorite.",
    author: "Hungry Heart",
    category: "Premium Love"
  },
  {
    text: "Relationship status: In a committed relationship with self-care Sunday and questionable life choices.",
    author: "Self-Love Expert",
    category: "Premium Single"
  },
  {
    text: "Dating is like social media - everyone's showing their highlight reel and hiding their spam folder.",
    author: "Digital Dater",
    category: "Premium Reality"
  },
  {
    text: "True love is when they still think you're cute after seeing your 3am anxiety Google searches.",
    author: "Night Owl",
    category: "Premium Acceptance"
  },
  {
    text: "I'm not high maintenance, I'm premium subscription with exclusive features.",
    author: "Value-Added Individual",
    category: "Premium Self-Worth"
  },
  {
    text: "Love yourself first. Not because you should, but because the alternative is exhausting for everyone.",
    author: "Reformed People-Pleaser",
    category: "Premium Wisdom"
  }
];

export const ComicQuotes = () => {
  const { user } = useAuth();
  const displayQuotes = user ? [...quotes, ...premiumQuotes] : quotes;

  return (
    <section id="quotes" className="py-20 px-4 bg-gradient-to-b from-muted/30 to-secondary/10">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
            Comic Quotes {user && <span className="text-accent">Premium</span>}
          </h2>
          <p className="text-lg text-muted-foreground">
            {user 
              ? `All ${displayQuotes.length} of our funniest relationship wisdom quotes!`
              : "The funniest (and most questionable) relationship wisdom"
            }
          </p>
          {!user && (
            <p className="text-sm text-accent mt-2">
              Sign up to unlock {premiumQuotes.length} more premium quotes! ✨
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayQuotes.map((quote, index) => {
            const isPremium = user && index >= quotes.length;
            return (
              <div 
                key={index} 
                className="comic-card group hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <Quote className="h-8 w-8 text-primary opacity-60 group-hover:text-secondary transition-colors" />
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      isPremium 
                        ? 'bg-accent/30 text-accent-foreground' 
                        : 'bg-accent/20 text-accent-foreground'
                    }`}>
                      {isPremium ? '⭐ ' : ''}{quote.category}
                    </span>
                  </div>

                  <blockquote className="text-comic text-foreground leading-relaxed">
                    "{quote.text}"
                  </blockquote>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Heart className="h-4 w-4 text-secondary" />
                    <cite className="text-sm text-muted-foreground font-medium not-italic">
                      — {quote.author}
                    </cite>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4 text-secondary" />
            <span className="text-sm">
              Remember: These are jokes, not actual relationship advice!
            </span>
            <Heart className="h-4 w-4 text-secondary" />
          </div>
        </div>
      </div>
    </section>
  );
};