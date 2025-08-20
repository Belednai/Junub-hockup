import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, GamepadIcon, Home, Shuffle, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const loveQuestions = [
  "What's your ideal date night?",
  "How do you show love to yourself?",
  "What makes you feel most loved?",
  "Describe your perfect romantic evening",
  "What's your love language?",
  "How do you celebrate small victories?",
  "What makes your heart skip a beat?",
  "Describe love in three words",
  "What's your favorite way to relax?",
  "How do you practice self-care?",
];

const loveAdvice = [
  "Remember: You deserve all the love you give to others! 💕",
  "Self-love isn't selfish - it's essential! ✨",
  "Your worth isn't determined by others - you're amazing as you are! 🌟",
  "Take time to appreciate yourself today! 🥰",
  "Love grows when you water it with kindness! 💖",
  "You're writing your own love story - make it beautiful! 📖",
  "Confidence is your most attractive feature! 💫",
  "Every day is a chance to love yourself more! 🌺",
  "Your happiness is just as important as everyone else's! 🌈",
  "You're worthy of the love you seek! 👑",
];

const funFacts = [
  "Did you know? Chocolate releases the same endorphins as falling in love! 🍫",
  "Fun fact: Your heart beats over 100,000 times a day - that's a lot of love! ❤️",
  "Science says: Laughing together creates stronger bonds than serious conversations! 😄",
  "Love fact: Looking into someone's eyes for 4 minutes can make you fall in love! 👀",
  "Amazing: Your brain releases dopamine when you think about someone you love! 🧠",
  "Sweet fact: Couples who laugh together stay together longer! 😂",
  "Love science: Hugs release oxytocin, the 'love hormone'! 🤗",
  "Fact: Writing about your feelings can improve your relationship satisfaction! ✍️",
];

const LoveGames = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAdvice, setCurrentAdvice] = useState('');
  const [currentFact, setCurrentFact] = useState('');
  const [loveScore, setLoveScore] = useState(0);

  if (!loading && !user) {
    navigate('/auth');
    return null;
  }

  const getRandomQuestion = () => {
    const randomQuestion = loveQuestions[Math.floor(Math.random() * loveQuestions.length)];
    setCurrentQuestion(randomQuestion);
    toast({
      title: "New Love Question! 💝",
      description: "Take a moment to reflect on this..."
    });
  };

  const getRandomAdvice = () => {
    const randomAdvice = loveAdvice[Math.floor(Math.random() * loveAdvice.length)];
    setCurrentAdvice(randomAdvice);
    toast({
      title: "Love Advice Unlocked! ✨",
      description: "Here's some wisdom for your heart..."
    });
  };

  const getRandomFact = () => {
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    setCurrentFact(randomFact);
    toast({
      title: "Love Fact Discovered! 🤓",
      description: "Learn something new about love!"
    });
  };

  const increaseLoveScore = () => {
    setLoveScore(prev => prev + 1);
    toast({
      title: "Love Level Up! 💖",
      description: `Your love score is now ${loveScore + 1}!`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GamepadIcon className="h-8 w-8 text-secondary wiggle mx-auto mb-4" />
          <p>Loading love games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-primary-glow/20 p-4">
      <div className="container max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GamepadIcon className="h-8 w-8 text-secondary wiggle" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Love Games</h1>
              <p className="text-muted-foreground">Fun ways to explore love and self-care</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Love Score */}
        <Card className="comic-card text-center">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold gradient-text">Love Score: {loveScore}</span>
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-muted-foreground">Play games to increase your love score!</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Love Questions Game */}
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-accent" />
                Love Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get random questions to reflect on love and relationships!
              </p>
              
              {currentQuestion && (
                <div className="bg-accent/10 p-4 rounded-lg">
                  <p className="font-medium text-center">{currentQuestion}</p>
                </div>
              )}
              
              <Button 
                onClick={() => {
                  getRandomQuestion();
                  increaseLoveScore();
                }} 
                className="w-full btn-hero"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Get Love Question
              </Button>
            </CardContent>
          </Card>

          {/* Love Advice Game */}
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-secondary" />
                Love Advice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Receive random love advice and self-care tips!
              </p>
              
              {currentAdvice && (
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <p className="font-medium text-center">{currentAdvice}</p>
                </div>
              )}
              
              <Button 
                onClick={() => {
                  getRandomAdvice();
                  increaseLoveScore();
                }} 
                className="w-full btn-hero"
              >
                <Heart className="h-4 w-4 mr-2" />
                Get Love Advice
              </Button>
            </CardContent>
          </Card>

          {/* Love Facts Game */}
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Love Facts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Discover fun and interesting facts about love!
              </p>
              
              {currentFact && (
                <div className="bg-yellow-500/10 p-4 rounded-lg">
                  <p className="font-medium text-center">{currentFact}</p>
                </div>
              )}
              
              <Button 
                onClick={() => {
                  getRandomFact();
                  increaseLoveScore();
                }} 
                className="w-full btn-hero"
              >
                <Star className="h-4 w-4 mr-2" />
                Get Love Fact
              </Button>
            </CardContent>
          </Card>

          {/* Self-Love Challenge */}
          <Card className="comic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Self-Love Boost
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Give yourself an instant confidence boost!
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    increaseLoveScore();
                    toast({
                      title: "You're Amazing! ✨",
                      description: "Remember: You are worthy of love and respect!"
                    });
                  }} 
                  className="w-full btn-hero"
                  variant="outline"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  I Am Amazing
                </Button>
                
                <Button 
                  onClick={() => {
                    increaseLoveScore();
                    toast({
                      title: "You're Beautiful! 💖",
                      description: "Inside and out - you shine bright!"
                    });
                  }} 
                  className="w-full btn-hero"
                  variant="outline"
                >
                  <Star className="h-4 w-4 mr-2" />
                  I Am Beautiful
                </Button>
                
                <Button 
                  onClick={() => {
                    increaseLoveScore();
                    toast({
                      title: "You're Strong! 💪",
                      description: "You've overcome challenges and you'll overcome more!"
                    });
                  }} 
                  className="w-full btn-hero"
                  variant="outline"
                >
                  <GamepadIcon className="h-4 w-4 mr-2" />
                  I Am Strong
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="comic-card">
          <CardContent className="py-6 text-center">
            <h3 className="font-bold mb-2 gradient-text">How to Play</h3>
            <p className="text-sm text-muted-foreground">
              Click on any game button to play! Each interaction increases your love score. 
              Share your thoughts in your dashboard, send yourself loving messages, and remember - 
              you deserve all the love in the world! 💕
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoveGames;