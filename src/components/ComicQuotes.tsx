import { Quote, Heart } from "lucide-react";

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
  },
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
  }
];

export const ComicQuotes = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-secondary/10">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
            Comic Quotes
          </h2>
          <p className="text-lg text-muted-foreground">
            The funniest (and most questionable) relationship wisdom
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote, index) => (
            <div 
              key={index} 
              className="comic-card group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Quote className="h-8 w-8 text-primary opacity-60 group-hover:text-secondary transition-colors" />
                  <span className="bg-accent/20 text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    {quote.category}
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
          ))}
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