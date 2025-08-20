import { Heart, Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Heart className="h-6 w-6 text-secondary wiggle" />
              <span className="text-xl font-bold gradient-text">Cheating App</span>
            </div>
            <p className="text-muted-foreground">
              The ultimate relationship comedy app. Because love is better with laughter!
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Quick Links</h3>
            <div className="space-y-2">
              <div><a href="#daily-tip" className="text-muted-foreground hover:text-primary transition-colors">Daily Tips</a></div>
              <div><a href="#quotes" className="text-muted-foreground hover:text-primary transition-colors">Comic Quotes</a></div>
              <div><a href="#mood" className="text-muted-foreground hover:text-primary transition-colors">Mood Refresher</a></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Connect With Us</h3>
            <div className="flex gap-3 justify-center md:justify-start">
              <Button size="sm" variant="outline" className="rounded-full">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="rounded-full">
                <Github className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="rounded-full">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">
              © 2024 Cheating App. Made with ❤️ and lots of coffee.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This app is for entertainment purposes only. 
              Please don't actually follow our relationship advice. We're comedians, not therapists! 😂
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};