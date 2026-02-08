import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import {
  Play,
  Pause,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Clock,
  FileText,
  HelpCircle,
  MousePointer,
} from "lucide-react-native";
import { Lesson, QuizQuestion } from "@/lib/data/academy";
import { cn } from "@/lib/utils";

interface LessonContentProps {
  lesson: Lesson;
  questions: QuizQuestion[];
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function LessonContent({
  lesson,
  questions,
  onComplete,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: LessonContentProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    selectedAnswer: null as number | null,
    showExplanation: false,
    correctAnswers: 0,
    isFinished: false,
  });

  // Video simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && lesson.type === "video") {
      interval = setInterval(() => {
        setVideoProgress((prev) => {
          const newProgress = prev + 100 / (lesson.duration * 60);
          if (newProgress >= 100) {
            setIsPlaying(false);
            setIsCompleted(true);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, lesson]);

  const handleQuizAnswer = (answerIndex: number) => {
    if (quizState.showExplanation) return;

    const isCorrect = answerIndex === questions[quizState.currentQuestion].correctAnswer;
    setQuizState((prev) => ({
      ...prev,
      selectedAnswer: answerIndex,
      showExplanation: true,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
    }));
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestion < questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: null,
        showExplanation: false,
      }));
    } else {
      setQuizState((prev) => ({ ...prev, isFinished: true }));
      setIsCompleted(true);
      onComplete();
    }
  };

  const getLessonTypeIcon = () => {
    switch (lesson.type) {
      case "video":
        return <Play color="#38bdf8" size={20} />;
      case "article":
        return <FileText color="#a3a3a3" size={20} />;
      case "quiz":
        return <HelpCircle color="#fbbf24" size={20} />;
      case "interactive":
        return <MousePointer color="#a78bfa" size={20} />;
      default:
        return <BookOpen color="#a3a3a3" size={20} />;
    }
  };

  const getLessonTypeLabel = () => {
    return lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1);
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Media Content */}
      {lesson.type === "video" && (
        <View className="w-full aspect-video relative bg-neutral-900">
          <Image
            source={{ uri: lesson.thumbnailUrl }}
            className="w-full h-full"
            contentFit="cover"
          />
          <View className="absolute inset-0 bg-black/40" />

          {/* Play Button */}
          <TouchableOpacity
            className="absolute top-1/2 left-1/2 -ml-8 -mt-8 w-16 h-16 rounded-full bg-black/60 items-center justify-center"
            onPress={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause color="#fff" size={32} fill="#fff" />
            ) : (
              <Play color="#fff" size={32} fill="#fff" />
            )}
          </TouchableOpacity>

          {/* Progress Bar */}
          <View className="absolute bottom-0 left-0 right-0 p-4">
            <View className="h-1 bg-white/30 rounded-full">
              <View
                className="h-full bg-sky-500 rounded-full"
                style={{ width: `${videoProgress}%` }}
              />
            </View>
          </View>
        </View>
      )}

      {(lesson.type === "article" || lesson.type === "interactive") && (
        <Image
          source={{ uri: lesson.thumbnailUrl }}
          className="w-full h-52"
          contentFit="cover"
        />
      )}

      {/* Content */}
      <View className="p-5">
        {/* Meta */}
        <View className="flex-row items-center gap-4 mb-4">
          <View className="flex-row items-center gap-1.5">
            {getLessonTypeIcon()}
            <Text className="text-neutral-400 text-sm">{getLessonTypeLabel()}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Clock color="#737373" size={16} />
            <Text className="text-neutral-400 text-sm">{lesson.duration} min</Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-white text-2xl font-semibold mb-3">{lesson.title}</Text>
        <Text className="text-neutral-400 text-base leading-6 mb-6">
          {lesson.description}
        </Text>

        {/* Article/Interactive Content */}
        {(lesson.type === "article" || lesson.type === "interactive") && (
          <View className="mb-6">
            <Text className="text-neutral-300 text-base leading-6">
              {lesson.content || getDefaultContent(lesson.title)}
            </Text>

            {!isCompleted && (
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 bg-sky-500 py-4 rounded-xl mt-6"
                onPress={() => {
                  setIsCompleted(true);
                  onComplete();
                }}
              >
                <CheckCircle color="#fff" size={20} />
                <Text className="text-white text-base font-semibold">Mark as Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quiz Content */}
        {lesson.type === "quiz" && (
          <QuizContent
            questions={questions}
            quizState={quizState}
            onAnswer={handleQuizAnswer}
            onNext={handleNextQuestion}
          />
        )}

        {/* Video Complete Button */}
        {lesson.type === "video" && videoProgress >= 100 && !isCompleted && (
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-sky-500 py-4 rounded-xl mt-4"
            onPress={() => {
              setIsCompleted(true);
              onComplete();
            }}
          >
            <CheckCircle color="#fff" size={20} />
            <Text className="text-white text-base font-semibold">Complete Lesson</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation */}
      <View className="flex-row justify-between p-5 gap-4">
        {hasPrevious ? (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 bg-neutral-900 rounded-xl border border-neutral-800"
            onPress={onPrevious}
          >
            <ChevronRight color="#d4d4d4" size={20} style={{ transform: [{ rotate: "180deg" }] }} />
            <Text className="text-neutral-300">Previous</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-1" />
        )}

        {hasNext && (
          <TouchableOpacity
            className={cn(
              "flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl",
              isCompleted
                ? "bg-sky-500 border border-sky-400"
                : "bg-neutral-800 border border-neutral-700"
            )}
            onPress={onNext}
            disabled={!isCompleted}
          >
            <Text className={isCompleted ? "text-white" : "text-neutral-500"}>Next Lesson</Text>
            <ChevronRight color={isCompleted ? "#fff" : "#737373"} size={20} />
          </TouchableOpacity>
        )}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}

interface QuizContentProps {
  questions: QuizQuestion[];
  quizState: {
    currentQuestion: number;
    selectedAnswer: number | null;
    showExplanation: boolean;
    correctAnswers: number;
    isFinished: boolean;
  };
  onAnswer: (index: number) => void;
  onNext: () => void;
}

function QuizContent({ questions, quizState, onAnswer, onNext }: QuizContentProps) {
  if (questions.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-white text-xl mb-2">Quiz Coming Soon</Text>
        <Text className="text-neutral-500">This quiz is being prepared</Text>
      </View>
    );
  }

  if (quizState.isFinished) {
    return (
      <View className="items-center p-8 bg-neutral-950 rounded-2xl border border-neutral-800">
        <Text className="text-white text-2xl mb-4">Quiz Complete!</Text>
        <Text className="text-sky-400 text-5xl font-bold mb-2">
          {quizState.correctAnswers} / {questions.length}
        </Text>
        <Text className="text-neutral-400 text-center">
          {quizState.correctAnswers === questions.length
            ? "Perfect score!"
            : quizState.correctAnswers >= questions.length * 0.7
            ? "Great job!"
            : "Keep learning and try again!"}
        </Text>
      </View>
    );
  }

  const currentQuestion = questions[quizState.currentQuestion];

  return (
    <View className="gap-4">
      {/* Progress */}
      <View>
        <Text className="text-neutral-500 text-sm mb-2">
          Question {quizState.currentQuestion + 1} of {questions.length}
        </Text>
        <View className="h-1 bg-neutral-800 rounded-full">
          <View
            className="h-full bg-sky-500 rounded-full"
            style={{
              width: `${((quizState.currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </View>
      </View>

      {/* Question */}
      <Text className="text-white text-lg leading-7">{currentQuestion.question}</Text>

      {/* Options */}
      <View className="gap-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = quizState.selectedAnswer === index;
          const isCorrect = index === currentQuestion.correctAnswer;
          const showResult = quizState.showExplanation;

          return (
            <TouchableOpacity
              key={index}
              className={cn(
                "flex-row items-center gap-3 p-4 bg-neutral-950 rounded-xl border",
                isSelected && "border-sky-500",
                showResult && isCorrect && "border-emerald-500 bg-emerald-500/10",
                showResult && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                !isSelected && !showResult && "border-neutral-800"
              )}
              onPress={() => onAnswer(index)}
              disabled={showResult}
            >
              <View
                className={cn(
                  "w-8 h-8 rounded-full items-center justify-center",
                  isSelected && "bg-sky-500",
                  showResult && isCorrect && "bg-emerald-500",
                  showResult && isSelected && !isCorrect && "bg-red-500",
                  !isSelected && !showResult && "bg-neutral-800"
                )}
              >
                <Text className="text-white text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text
                className={cn(
                  "flex-1 text-neutral-300",
                  showResult && isCorrect && "text-emerald-400"
                )}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explanation */}
      {quizState.showExplanation && (
        <View className="p-5 bg-neutral-950 rounded-xl border border-neutral-800">
          <Text
            className={cn(
              "text-base font-semibold mb-2",
              quizState.selectedAnswer === currentQuestion.correctAnswer
                ? "text-emerald-400"
                : "text-red-400"
            )}
          >
            {quizState.selectedAnswer === currentQuestion.correctAnswer ? "✓ Correct!" : "✗ Incorrect"}
          </Text>
          <Text className="text-neutral-400 text-sm leading-5 mb-4">
            {currentQuestion.explanation}
          </Text>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-sky-500 py-3 rounded-xl"
            onPress={onNext}
          >
            <Text className="text-white text-base font-semibold">
              {quizState.currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Text>
            <ChevronRight color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function getDefaultContent(title: string): string {
  return `This lesson covers "${title}" in detail.

Understanding these concepts is crucial for your property journey. Take your time to absorb the information and don't hesitate to revisit this material.

Key takeaways:
• Learn the fundamentals that will guide your decisions
• Understand common pitfalls and how to avoid them
• Get practical tips you can apply immediately
• Build confidence in your property knowledge

Remember, knowledge is power in the property market. The more you understand, the better positioned you'll be to make informed decisions.`;
}
