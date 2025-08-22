import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Trophy, Star, Quote, Gamepad2, RefreshCw } from "lucide-react";
import { ComicQuotes } from "@/components/ComicQuotes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GameScore {
  id: string;
  user_id: string;
  game_name: string;
  score: number;
  max_score: number;
  created_at: string;
}

const loveGames = [
  {
    id: "compatibility-quiz",
    name: "Love Compatibility Quiz",
    description: "Test how well you know your partner with fun questions!",
    maxScore: 100,
    questions: [
      { question: "What's your partner's favorite color?", options: ["Red", "Blue", "Green", "Purple"], correct: 1 },
      { question: "What's their dream vacation destination?", options: ["Beach", "Mountains", "City", "Countryside"], correct: 0 },
      { question: "What's their favorite type of movie?", options: ["Comedy", "Romance", "Action", "Horror"], correct: 1 },
      { question: "What's their biggest fear?", options: ["Heights", "Spiders", "Public Speaking", "Dark"], correct: 2 },
      { question: "What's their favorite food?", options: ["Pizza", "Pasta", "Sushi", "Burgers"], correct: 0 },
    ]
  },
  {
    id: "relationship-trivia",
    name: "Relationship Trivia",
    description: "Answer questions about love and relationships!",
    maxScore: 80,
    questions: [
      { question: "What hormone is known as the 'love hormone'?", options: ["Dopamine", "Oxytocin", "Serotonin", "Adrenaline"], correct: 1 },
      { question: "What's the traditional gift for a 1st anniversary?", options: ["Paper", "Cotton", "Wood", "Iron"], correct: 0 },
      { question: "Which dating app was launched first?", options: ["Tinder", "Bumble", "Match.com", "Hinge"], correct: 2 },
      { question: "What percentage of marriages are arranged worldwide?", options: ["25%", "40%", "55%", "70%"], correct: 2 },
    ]
  },
  {
    id: "love-memory-game",
    name: "Love Memory Challenge",
    description: "Test your memory with romantic pairs!",
    maxScore: 60,
    questions: [
      { question: "Remember this sequence: ❤️💕💖", options: ["❤️💕💖", "💕❤️💖", "💖💕❤️", "❤️💖💕"], correct: 0 },
      { question: "Which romantic movie won Best Picture in 1997?", options: ["Titanic", "The English Patient", "Jerry Maguire", "As Good as It Gets"], correct: 0 },
      { question: "Complete the phrase: 'Love is...'", options: ["blind", "patient", "kind", "all of the above"], correct: 3 },
    ]
  }
];

const LoveGames = () => {
  const { user } = useAuth();
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGameScores();
    }
  }, [user]);

  const fetchGameScores = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching game scores:', error);
        return;
      }

      setGameScores(data || []);
    } catch (error) {
      console.error('Error fetching game scores:', error);
    }
  };

  const saveGameScore = async (gameName: string, finalScore: number, maxScore: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('game_scores')
        .insert({
          user_id: user.id,
          game_name: gameName,
          score: finalScore,
          max_score: maxScore
        });

      if (error) {
        console.error('Error saving game score:', error);
        return;
      }

      fetchGameScores();
      toast.success(`Score saved! You got ${finalScore}/${maxScore} points!`);
    } catch (error) {
      console.error('Error saving game score:', error);
    }
  };

  const startGame = (gameId: string) => {
    setCurrentGame(gameId);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameCompleted(false);
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentGame) return;

    const game = loveGames.find(g => g.id === currentGame);
    if (!game) return;

    const question = game.questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;
    
    if (isCorrect) {
      setScore(score + (game.maxScore / game.questions.length));
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < game.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Game completed
        setGameCompleted(true);
        const finalScore = Math.round(score + (isCorrect ? (game.maxScore / game.questions.length) : 0));
        if (user) {
          saveGameScore(game.name, finalScore, game.maxScore);
        }
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentGame(null);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameCompleted(false);
  };

  const getScoreForGame = (gameId: string) => {
    const gameScore = gameScores.find(score => score.game_name === loveGames.find(g => g.id === gameId)?.name);
    return gameScore ? { score: gameScore.score, maxScore: gameScore.max_score } : null;
  };

  const getTotalScore = () => {
    return gameScores.reduce((total, score) => total + score.score, 0);
  };

  const getTotalMaxScore = () => {
    return loveGames.reduce((total, game) => total + game.maxScore, 0);
  };

  if (currentGame && !gameCompleted) {
    const game = loveGames.find(g => g.id === currentGame);
    if (!game) return null;

    const question = game.questions[currentQuestion];

    return (
      <div className="min-h-screen pb-16 lg:pb-0 bg-gradient-to-b from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" onClick={resetGame}>
                ← Back to Games
              </Button>
              <Badge variant="secondary">
                Question {currentQuestion + 1} of {game.questions.length}
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  {game.name}
                </CardTitle>
                <Progress value={(currentQuestion / game.questions.length) * 100} className="w-full" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
                  <div className="grid gap-3">
                    {question.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedAnswer === index ? "default" : "outline"}
                        className={`p-4 h-auto text-left justify-start ${
                          showResult && index === question.correct 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : showResult && selectedAnswer === index && index !== question.correct
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : ""
                        }`}
                        onClick={() => selectAnswer(index)}
                        disabled={showResult}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedAnswer !== null && !showResult && (
                  <div className="text-center">
                    <Button onClick={submitAnswer} className="px-8">
                      Submit Answer
                    </Button>
                  </div>
                )}

                {showResult && (
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${
                      selectedAnswer === question.correct ? "text-green-600" : "text-red-600"
                    }`}>
                      {selectedAnswer === question.correct ? "Correct! ✅" : "Incorrect ❌"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Current Score: {Math.round(score + (selectedAnswer === question.correct ? (game.maxScore / game.questions.length) : 0))}/{game.maxScore}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (gameCompleted && currentGame) {
    const game = loveGames.find(g => g.id === currentGame);
    const finalScore = Math.round(score);

    return (
      <div className="min-h-screen pb-16 lg:pb-0 bg-gradient-to-b from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  Game Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{game?.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {finalScore}/{game?.maxScore}
                  </div>
                  <Progress value={(finalScore / (game?.maxScore || 1)) * 100} className="w-full mb-4" />
                  <div className="text-lg">
                    {finalScore >= (game?.maxScore || 0) * 0.8 ? "Excellent! 🌟" :
                     finalScore >= (game?.maxScore || 0) * 0.6 ? "Good job! 👍" :
                     "Keep practicing! 💪"}
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => startGame(currentGame)} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                  <Button onClick={resetGame}>
                    Back to Games
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      {/* Games Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
            Love Games & Quotes
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Test your love knowledge and enjoy funny relationship quotes!
          </p>
          {user && (
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>Total Score: {getTotalScore()}/{getTotalMaxScore()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span>Games Played: {gameScores.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Games Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">
            Interactive Love Games
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loveGames.map((game) => {
              const userScore = getScoreForGame(game.id);
              return (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5 text-primary" />
                      {game.name}
                    </CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Max Score: {game.maxScore}</span>
                      {userScore && (
                        <Badge variant="secondary">
                          Best: {userScore.score}/{userScore.maxScore}
                        </Badge>
                      )}
                    </div>
                    
                    {user ? (
                      <Button 
                        onClick={() => startGame(game.id)} 
                        className="w-full"
                      >
                        {userScore ? "Play Again" : "Start Game"}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Sign in to Play
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quotes Section */}
        <ComicQuotes />

        {/* High Scores Section */}
        {user && gameScores.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">
              Your Game History
            </h2>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Recent Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gameScores.slice(0, 10).map((score, index) => (
                      <div key={score.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{score.game_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(score.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            {score.score}/{score.max_score}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round((score.score / score.max_score) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default LoveGames;
