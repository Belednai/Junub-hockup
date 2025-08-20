import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-couple.jpg";

export const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-muted/50 to-primary-glow/20">
      <div className="container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <Heart className="h-8 w-8 text-secondary wiggle" />
                <span className="text-2xl font-bold gradient-text">Love Hacks</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                The Ultimate
                <span className="block gradient-text">Relationship</span>
                <span className="block text-accent">Comedy App</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl">
                Discover hilariously bad relationship advice, comic quotes, and satirical love tips. 
                Because sometimes the best relationships start with a good laugh! 😂
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="btn-hero text-lg px-8 py-6 rounded-full">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Daily Laughs
              </Button>
              <Button variant="outline" className="text-lg px-8 py-6 rounded-full border-2 hover:bg-accent/10">
                View Comic Tips
              </Button>
            </div>

            <div className="text-center lg:text-left text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Heart className="h-4 w-4 text-secondary" />
                For entertainment purposes only - not actual relationship advice!
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="float">
              <img 
                src={heroImage} 
                alt="Cute cartoon couple representing Love Hacks app users" 
                className="w-full max-w-lg mx-auto rounded-3xl shadow-comic"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-8 -right-8 bounce-gentle">
              <div className="speech-bubble bg-accent text-accent-foreground p-3 rounded-2xl shadow-bubble">
                <span className="text-comic text-sm">"Skip their texts!"</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 float">
              <div className="speech-bubble bg-secondary text-secondary-foreground p-3 rounded-2xl shadow-bubble">
                <span className="text-comic text-sm">"Netflix = Self-care"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};