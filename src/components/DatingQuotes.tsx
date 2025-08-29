import { Quote, Heart, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const datingQuotes = [
  {
    text: "Love is not about finding the right person, but creating a right relationship. It's not about how much love you have in the beginning but how much love you build till the end.",
    author: "Julianne Moore",
    category: "Building Love"
  },
  {
    text: "The best love is the kind that awakens the soul and makes us reach for more, that plants a fire in our hearts and brings peace to our minds.",
    author: "Nicholas Sparks",
    category: "Soul Connection"
  },
  {
    text: "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",
    author: "Lao Tzu",
    category: "Strength & Courage"
  },
  {
    text: "Love is friendship that has caught fire. It is quiet understanding, mutual confidence, sharing and forgiving.",
    author: "Ann Landers",
    category: "True Partnership"
  },
  {
    text: "The greatest happiness of life is the conviction that we are loved; loved for ourselves, or rather, loved in spite of ourselves.",
    author: "Victor Hugo",
    category: "Unconditional Love"
  },
  {
    text: "Love doesn't make the world go 'round. Love is what makes the ride worthwhile.",
    author: "Franklin P. Jones",
    category: "Life's Journey"
  }
];

const premiumDatingQuotes = [
  {
    text: "A successful marriage requires falling in love many times, always with the same person.",
    author: "Mignon McLaughlin",
    category: "Marriage Wisdom"
  },
  {
    text: "Love is not just looking at each other, it's looking in the same direction.",
    author: "Antoine de Saint-Exupéry",
    category: "Shared Vision"
  },
  {
    text: "The best thing to hold onto in life is each other.",
    author: "Audrey Hepburn",
    category: "Holding On"
  },
  {
    text: "Love is composed of a single soul inhabiting two bodies.",
    author: "Aristotle",
    category: "Soulmates"
  },
  {
    text: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
    author: "Maya Angelou",
    category: "Unique Love"
  },
  {
    text: "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.",
    author: "Maya Angelou",
    category: "Overcoming Obstacles"
  }
];

// Import local assets
import b1 from "@/assets/b1.jpg";
import b2 from "@/assets/b2.jpg";
import b3 from "@/assets/b3.jpg";
import b4 from "@/assets/b4.jpg";
import b5 from "@/assets/b5.jpg";
import b6 from "@/assets/b6.jpg";

// Beautiful images with love quotes
const coupleImages = [
  {
    url: b1,
    alt: "Beautiful couple in love",
    quote: "Love is not about finding someone to live with, it's about finding someone you can't live without."
  },
  {
    url: b2,
    alt: "Happy couple embracing",
    quote: "In your arms, I have found my home, my peace, and my forever."
  },
  {
    url: b3,
    alt: "Romantic couple together",
    quote: "Every love story is beautiful, but ours is my favorite."
  },
  {
    url: b4,
    alt: "Couple sharing a moment",
    quote: "You are my today and all of my tomorrows, my heart beats for you alone."
  },
  {
    url: b5,
    alt: "Joyful couple laughing",
    quote: "Love is when you look into someone's eyes and see everything you need."
  },
  {
    url: b6,
    alt: "Couple in a tender moment",
    quote: "Together is a wonderful place to be, especially when it's with you."
  }
];

export const DatingQuotes = () => {
  const { user } = useAuth();
  const displayQuotes = user ? [...datingQuotes, ...premiumDatingQuotes] : datingQuotes;

  return (
    <section id="dating-quotes" className="py-20 px-4 bg-gradient-to-b from-background via-muted/30 to-secondary/10">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Amazing Dating Quotes {user && <span className="text-accent">✨</span>}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {user 
              ? `Discover all ${displayQuotes.length} inspiring quotes about love, relationships, and finding your perfect match!`
              : "Beautiful wisdom about love, relationships, and finding your soulmate"
            }
          </p>
          {!user && (
            <p className="text-lg text-accent mt-4 font-semibold">
              Sign up to unlock {premiumDatingQuotes.length} more premium dating quotes! 💕
            </p>
          )}
        </div>

        {/* Beautiful Images Gallery */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 gradient-text">
            Beautiful Love Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coupleImages.map((image, index) => (
              <div 
                key={index}
                className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 right-2">
                      <Heart className="h-6 w-6 text-white mx-auto" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground italic text-center leading-relaxed">
                    "{image.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quotes Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayQuotes.map((quote, index) => {
            const isPremium = user && index >= datingQuotes.length;
            return (
              <div 
                key={index} 
                className="comic-card group hover:scale-105 transition-all duration-300 relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <Quote className="h-10 w-10 text-primary opacity-60 group-hover:text-secondary transition-colors" />
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${
                      isPremium 
                        ? 'bg-accent text-accent-foreground' 
                        : 'bg-secondary/20 text-secondary-foreground'
                    }`}>
                      {isPremium && <Star className="h-3 w-3" />}
                      {quote.category}
                    </span>
                  </div>

                  <blockquote className="text-lg text-foreground leading-relaxed font-medium">
                    "{quote.text}"
                  </blockquote>

                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <Heart className="h-5 w-5 text-secondary wiggle" />
                    <cite className="text-base text-muted-foreground font-semibold not-italic">
                      — {quote.author}
                    </cite>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Heart className="h-16 w-16 text-secondary" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 text-muted-foreground bg-muted/30 px-6 py-3 rounded-full">
            <Heart className="h-5 w-5 text-secondary wiggle" />
            <span className="text-lg font-medium">
              Find your perfect match with Junub-hockup! 💕
            </span>
            <Heart className="h-5 w-5 text-secondary wiggle" />
          </div>
        </div>
      </div>
    </section>
  );
};
