import { Quote, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const quotes = [
  {
    text: "The best relationships are built on trust, communication, and mutual respect. When you find someone who values these as much as you do, you've found something special.",
    author: "Relationship Coach",
    category: "Foundation"
  },
  {
    text: "True love isn't about finding someone perfect, it's about finding someone perfect for you and growing together through life's journey.",
    author: "Love Expert",
    category: "Perfect Match"
  },
  {
    text: "A healthy relationship is where both people feel safe to be vulnerable, express their feelings, and support each other's dreams.",
    author: "Therapist",
    category: "Healthy Love"
  },
  {
    text: "The right person will love you for who you are while inspiring you to become the best version of yourself.",
    author: "Dating Coach",
    category: "Growth"
  },
  {
    text: "Good communication is the bridge between confusion and clarity in any relationship. Listen with your heart, speak with kindness.",
    author: "Counselor",
    category: "Communication"
  },
  {
    text: "When you find your person, you'll understand why it never worked out with anyone else. Everything happens for a reason.",
    author: "Life Coach",
    category: "Destiny"
  }
];

const premiumQuotes = [
  {
    text: "Soulmates aren't found, they're recognized. When you meet yours, your heart will know before your mind does.",
    author: "Spiritual Guide",
    category: "Soulmates"
  },
  {
    text: "The most beautiful thing about love is that it multiplies when shared. Give love freely and watch it return tenfold.",
    author: "Love Philosopher",
    category: "Abundance"
  },
  {
    text: "A strong relationship requires choosing to love each other even in those moments when you struggle to like each other.",
    author: "Marriage Counselor",
    category: "Commitment"
  },
  {
    text: "Your perfect partner is someone who sees your flaws and chooses to love you anyway, while helping you become better.",
    author: "Relationship Expert",
    category: "Acceptance"
  },
  {
    text: "Love is not just a feeling, it's a choice you make every day. Choose to love, choose to forgive, choose to grow together.",
    author: "Life Coach",
    category: "Daily Choice"
  },
  {
    text: "The right relationship will feel like coming home to yourself. You'll be more you than you've ever been.",
    author: "Self-Discovery Coach",
    category: "Authenticity"
  },
  {
    text: "True intimacy is being completely known and completely loved. It's the courage to be vulnerable with the right person.",
    author: "Intimacy Expert",
    category: "Deep Connection"
  },
  {
    text: "A healthy relationship is two whole people coming together to create something beautiful, not two halves trying to complete each other.",
    author: "Wellness Coach",
    category: "Wholeness"
  },
  {
    text: "Love is patient, love is kind, but most importantly, love is a verb. It's what you do, not just what you feel.",
    author: "Relationship Mentor",
    category: "Action"
  },
  {
    text: "The best love stories are written by two people who never stopped choosing each other, day after day, year after year.",
    author: "Love Story Writer",
    category: "Endurance"
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
            Love Wisdom {user && <span className="text-accent">Premium</span>}
          </h2>
          <p className="text-lg text-muted-foreground">
            {user 
              ? `All ${displayQuotes.length} inspiring quotes about finding and nurturing true love!`
              : "Inspiring wisdom about love, relationships, and finding your perfect match"
            }
          </p>
          {!user && (
            <p className="text-sm text-accent mt-2">
              Sign up to unlock {premiumQuotes.length} more premium love quotes! ✨
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
              Let these words inspire your journey to finding true love!
            </span>
            <Heart className="h-4 w-4 text-secondary" />
          </div>
        </div>
      </div>
    </section>
  );
};
