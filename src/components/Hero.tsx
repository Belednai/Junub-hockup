import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-couple.jpg";

export const Hero = () => {
  const { user, loading } = useAuth();
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-muted/50 to-primary-glow/20 relative">
      <div className="container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <Heart className="h-6 w-6 lg:h-8 lg:w-8 text-secondary wiggle" />
                <span className="text-xl lg:text-2xl font-bold gradient-text">Cheating App</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                The Ultimate
                <span className="block gradient-text">Relationship</span>
                <span className="block text-accent">Cheating App</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                {user ? (
                  <>
                    Test your love compatibility with anyone! Play fun love games, get personalized relationship insights, and discover hilariously bad advice that might just work! 💕
                  </>
                ) : (
                  <>
                    Discover hilariously bad relationship advice, comic quotes, and satirical love tips. 
                    Because sometimes the best relationships start with a good laugh! 😂
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!loading && (
                user ? (
                  <Link to="/games">
                    <Button className="btn-hero text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 rounded-full w-full sm:w-auto">
                      <Gamepad2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                      Play Love Games
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth">
                    <Button className="btn-hero text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 rounded-full w-full sm:w-auto">
                      <Sparkles className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                      Sign Up for Daily Laughs
                    </Button>
                  </Link>
                )
              )}
            </div>

            <div className="text-center lg:text-left text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Heart className="h-4 w-4 text-secondary" />
                For entertainment purposes only - not actual relationship advice!
              </span>
            </div>
          </div>

          <div className="relative order-first lg:order-last">
            <div className="float">
              <img 
                src={heroImage} 
                alt="Cute cartoon couple representing Cheating App users" 
                className="w-full max-w-sm lg:max-w-lg mx-auto rounded-3xl shadow-comic"
              />
            </div>
            
            {/* Floating elements - hidden on small screens */}
            <div className="hidden md:block absolute -top-8 -right-8 bounce-gentle">
              <div className="speech-bubble bg-accent text-accent-foreground p-3 rounded-2xl shadow-bubble">
                <span className="text-comic text-sm">"Skip their texts!"</span>
              </div>
            </div>
            
            <div className="hidden md:block absolute -bottom-4 -left-4 float">
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