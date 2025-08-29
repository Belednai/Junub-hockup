import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Sparkles, Gamepad2, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import heroImage from "@/assets/b1.jpg";

export const Hero = () => {
  const { user, loading, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('signup-email') as string;
    const password = formData.get('signup-password') as string;
    const fullName = formData.get('full-name') as string;

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We sent you a confirmation link!",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('signin-email') as string;
    const password = formData.get('signin-password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-muted/50 to-primary-glow/20 relative">
      <div className="container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <Heart className="h-6 w-6 lg:h-8 lg:w-8 text-secondary wiggle" />
                <span className="text-xl lg:text-2xl font-bold gradient-text">Junub-hockup App</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                The Ultimate
                <span className="block gradient-text">Relationship</span>
                <span className="block text-accent">Junub-hockup App</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                {user ? (
                  <>
                    Find your perfect match with our advanced compatibility system! Connect with like-minded people, build meaningful relationships, and discover genuine love that lasts. 💕
                  </>
                ) : (
                  <>
                    Connect with your perfect partner through meaningful conversations, shared interests, and genuine compatibility. 
                    Start your journey to finding true love today! 💖
                  </>
                )}
              </p>
            </div>

            {user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/games">
                  <Button className="btn-hero text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 rounded-full w-full sm:w-auto">
                    <Gamepad2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                    Play Love Games
                  </Button>
                </Link>
              </div>
            )}

            <div className="text-center lg:text-left text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Heart className="h-4 w-4 text-secondary" />
                Your journey to finding true love starts here!
              </span>
            </div>
          </div>

          <div className="relative order-first lg:order-last">
            {user ? (
              // Show image when user is authenticated
              <>
                <div className="float">
                  <img 
                    src={heroImage} 
                    alt="Cute cartoon couple representing Junub-hockup App users" 
                    className="w-full max-w-sm lg:max-w-lg mx-auto rounded-3xl shadow-comic"
                  />
                </div>
                
                {/* Floating elements - hidden on small screens */}
                <div className="hidden md:block absolute -top-8 -right-8 bounce-gentle">
                  <div className="speech-bubble bg-accent text-accent-foreground p-3 rounded-2xl shadow-bubble">
                    <span className="text-comic text-sm">"True love awaits!"</span>
                  </div>
                </div>
                
                <div className="hidden md:block absolute -bottom-4 -left-4 float">
                  <div className="speech-bubble bg-secondary text-secondary-foreground p-3 rounded-2xl shadow-bubble">
                    <span className="text-comic text-sm">"Find your soulmate"</span>
                  </div>
                </div>
              </>
            ) : (
              // Show login/signup form when user is not authenticated
              <div className="w-full max-w-md mx-auto">
                <Card className="comic-card">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl text-center">Join the Fun!</CardTitle>
                    <CardDescription className="text-center">
                      Get started with your love journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="signup" className="space-y-4 mt-4">
                        <form onSubmit={handleSignUp} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input
                              id="full-name"
                              name="full-name"
                              placeholder="Enter your name"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <Input
                              id="signup-email"
                              name="signup-email"
                              type="email"
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <Input
                              id="signup-password"
                              name="signup-password"
                              type="password"
                              placeholder="Create a password"
                              required
                            />
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full btn-hero" 
                            disabled={isLoading}
                          >
                            {isLoading ? "Creating Account..." : "Create Account"}
                          </Button>
                        </form>
                      </TabsContent>
                      
                      <TabsContent value="signin" className="space-y-4 mt-4">
                        <form onSubmit={handleSignIn} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signin-email">Email</Label>
                            <Input
                              id="signin-email"
                              name="signin-email"
                              type="email"
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="signin-password">Password</Label>
                            <Input
                              id="signin-password"
                              name="signin-password"
                              type="password"
                              placeholder="Enter your password"
                              required
                            />
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full btn-hero" 
                            disabled={isLoading}
                          >
                            {isLoading ? "Signing In..." : "Sign In"}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  By signing up, you agree to our terms of service and privacy policy 💕
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
