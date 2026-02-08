import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Clock,
  Volume2,
  Maximize2,
} from "lucide-react-native";
import { getCourseById, getLessonById, getModuleForLesson, userProgress, quizQuestions } from "@/lib/data/academy";
import { cn } from "@/lib/utils";

const { width } = Dimensions.get("window");

export default function LessonScreen() {
  const insets = useSafeAreaInsets();
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const course = getCourseById(courseId || "");
  const lesson = getLessonById(courseId || "", lessonId || "");
  const module = getModuleForLesson(courseId || "", lessonId || "");
  const questions = quizQuestions[lessonId || ""] || [];

  useEffect(() => {
    if (lesson) {
      setIsCompleted(userProgress.completedLessons.includes(lesson.id));
    }
  }, [lesson]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && lesson?.type === "video") {
      interval = setInterval(() => {
        setProgress((prev) => {
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

  if (!course || !lesson || !module) {
    return (
      <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-neutral-400 text-lg mb-6">Lesson not found</Text>
          <TouchableOpacity
            className="bg-neutral-800 px-5 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentLessonIndex = module.lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = module.lessons[currentLessonIndex + 1];
  const prevLesson = module.lessons[currentLessonIndex - 1];

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 gap-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-neutral-900 items-center justify-center">
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-neutral-500 text-xs" numberOfLines={1}>
            {module.title}
          </Text>
          <Text className="text-white text-base" numberOfLines={1}>
            {lesson.title}
          </Text>
        </View>
        {isCompleted && (
          <View className="w-10 h-10 rounded-full bg-emerald-500/15 items-center justify-center">
            <CheckCircle color="#10b981" size={20} />
          </View>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        {lesson.type === "video" && (
          <View className="w-full aspect-video relative bg-neutral-900">
            <Image source={{ uri: lesson.thumbnailUrl }} className="w-full h-full" contentFit="cover" />
            <View className="absolute inset-0 bg-black/40" />

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

            <View className="absolute bottom-0 left-0 right-0 p-4">
              <View className="mb-2">
                <View className="h-1 bg-white/30 rounded-full">
                  <View className="h-full bg-sky-500 rounded-full" style={{ width: `${progress}%` }} />
                </View>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-4">
                  <TouchableOpacity>
                    <SkipBack color="#fff" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause color="#fff" size={20} /> : <Play color="#fff" size={20} />}
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <SkipForward color="#fff" size={20} />
                  </TouchableOpacity>
                </View>
                <View className="flex-row gap-4">
                  <TouchableOpacity>
                    <Volume2 color="#fff" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Maximize2 color="#fff" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Article Content */}
        {(lesson.type === "article" || lesson.type === "interactive") && (
          <View>
            <Image source={{ uri: lesson.thumbnailUrl }} className="w-full h-52" contentFit="cover" />
            <View className="p-5">
              <Text className="text-neutral-300 text-base leading-6 mb-8">
                {lesson.content ||
                  `This lesson covers "${lesson.title}" in detail.

Understanding these concepts is crucial for your property journey. Take your time to absorb the information and don't hesitate to revisit this material.

Key takeaways:
• Learn the fundamentals that will guide your decisions
• Understand common pitfalls and how to avoid them
• Get practical tips you can apply immediately
• Build confidence in your property knowledge

Remember, knowledge is power in the property market. The more you understand, the better positioned you'll be to make informed decisions.`}
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 bg-sky-500 py-3.5 rounded-xl"
                onPress={() => setIsCompleted(true)}
              >
                <CheckCircle color="#fff" size={20} />
                <Text className="text-white text-base">Mark as Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quiz Content */}
        {lesson.type === "quiz" && (
          <View className="p-5">
            {questions.length === 0 ? (
              <View>
                <Text className="text-white text-2xl text-center mb-2">Quiz Coming Soon</Text>
                <Text className="text-neutral-500 text-base text-center mb-8">
                  This quiz is being prepared
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-center gap-2 bg-sky-500 py-3.5 rounded-xl"
                  onPress={() => setIsCompleted(true)}
                >
                  <CheckCircle color="#fff" size={20} />
                  <Text className="text-white text-base">Skip & Continue</Text>
                </TouchableOpacity>
              </View>
            ) : isCompleted && showQuiz ? (
              <View className="items-center p-8 bg-neutral-950 rounded-2xl border border-neutral-800">
                <Text className="text-white text-2xl mb-4">Quiz Complete!</Text>
                <Text className="text-sky-400 text-5xl mb-2">
                  {correctAnswers} / {questions.length}
                </Text>
                <Text className="text-neutral-400">
                  {correctAnswers === questions.length
                    ? "Perfect score!"
                    : correctAnswers >= questions.length * 0.7
                    ? "Great job!"
                    : "Keep learning and try again!"}
                </Text>
              </View>
            ) : (
              <>
                <View className="mb-6">
                  <Text className="text-neutral-500 text-sm mb-2">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Text>
                  <View className="h-1 bg-neutral-800 rounded-full">
                    <View
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </View>
                </View>

                <Text className="text-white text-lg mb-6 leading-7">
                  {questions[currentQuestionIndex].question}
                </Text>

                <View className="gap-3">
                  {questions[currentQuestionIndex].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === questions[currentQuestionIndex].correctAnswer;
                    const showResult = showExplanation;

                    return (
                      <TouchableOpacity
                        key={index}
                        className={cn(
                          "flex-row items-center gap-4 p-4 bg-neutral-950 rounded-xl border",
                          isSelected && "border-sky-500",
                          showResult && isCorrect && "border-emerald-500 bg-emerald-500/10",
                          showResult && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                          !isSelected && !showResult && "border-neutral-800"
                        )}
                        onPress={() => !showExplanation && handleQuizAnswer(index)}
                        disabled={showExplanation}
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
                          <Text className="text-white text-sm">{String.fromCharCode(65 + index)}</Text>
                        </View>
                        <Text
                          className={cn(
                            "flex-1 text-neutral-300",
                            showResult && isCorrect && "text-emerald-500"
                          )}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {showExplanation && (
                  <View className="mt-6 p-5 bg-neutral-950 rounded-xl border border-neutral-800">
                    <Text className="text-white text-base mb-2">
                      {selectedAnswer === questions[currentQuestionIndex].correctAnswer
                        ? "✓ Correct!"
                        : "✗ Incorrect"}
                    </Text>
                    <Text className="text-neutral-400 text-sm leading-5 mb-5">
                      {questions[currentQuestionIndex].explanation}
                    </Text>
                    <TouchableOpacity
                      className="flex-row items-center justify-center gap-2 bg-sky-500 py-3 rounded-xl"
                      onPress={handleNextQuestion}
                    >
                      <Text className="text-white text-base">
                        {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                      </Text>
                      <ChevronRight color="#fff" size={20} />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Lesson Info */}
        {lesson.type !== "quiz" && (
          <View className="p-5">
            <View className="flex-row gap-6 mb-4">
              <View className="flex-row items-center gap-1.5">
                <Clock color="#737373" size={16} />
                <Text className="text-neutral-500 text-sm">{lesson.duration} min</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <BookOpen color="#737373" size={16} />
                <Text className="text-neutral-500 text-sm">
                  {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                </Text>
              </View>
            </View>

            <Text className="text-white text-xl mb-2">{lesson.title}</Text>
            <Text className="text-neutral-400 text-base leading-5">{lesson.description}</Text>
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-black border-t border-neutral-800 p-5"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row justify-between gap-4">
          {prevLesson ? (
            <TouchableOpacity
              className="flex-row items-center gap-2 py-3.5 px-5 bg-neutral-900 rounded-xl border border-neutral-800"
              onPress={() =>
                router.replace(`/(tabs)/(haus)/lesson/${courseId}/${prevLesson.id}` as any)
              }
            >
              <ChevronLeft color="#d4d4d4" size={20} />
              <Text className="text-neutral-300">Previous</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-1" />
          )}

          {nextLesson ? (
            <TouchableOpacity
              className="flex-row items-center gap-2 py-3.5 px-5 bg-sky-500 rounded-xl border border-sky-400"
              onPress={() =>
                router.replace(`/(tabs)/(haus)/lesson/${courseId}/${nextLesson.id}` as any)
              }
            >
              <Text className="text-white">Next Lesson</Text>
              <ChevronRight color="#fff" size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-row items-center gap-2 py-3.5 px-5 bg-sky-500 rounded-xl border border-sky-400"
              onPress={() => router.push(`/(tabs)/(haus)/course/${courseId}` as any)}
            >
              <Text className="text-white">Back to Course</Text>
              <ChevronRight color="#fff" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
