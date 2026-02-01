
import React, { useState, useEffect } from "react";
import { MicIcon } from "../IconComponents";

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface AIVoiceProps {
    submitted: boolean;
    statusText: string;
    onClick: () => void;
}

export default function AIVoice({ submitted, statusText, onClick }: AIVoiceProps) {
    const [time, setTime] = useState(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Explicitly initialize with let to avoid any const ambiguity in transpilation
        let intervalId: ReturnType<typeof setInterval> | undefined = undefined;

        if (submitted) {
            intervalId = setInterval(() => {
                setTime((t) => t + 1);
            }, 1000);
        } else {
            setTime(0);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [submitted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div className="w-full py-4">
            <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
                <button
                    className={cn(
                        "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
                        submitted
                            ? "bg-none"
                            : "bg-none hover:bg-white/5"
                    )}
                    type="button"
                    onClick={onClick}
                    aria-label={submitted ? "Stop listening" : "Start listening"}
                >
                    {submitted ? (
                        <div
                            className="w-6 h-6 rounded-sm animate-spin bg-white cursor-pointer pointer-events-auto"
                            style={{ animationDuration: "3s" }}
                        />
                    ) : (
                        <MicIcon className="w-6 h-6 text-white/90" />
                    )}
                </button>

                <span
                    className={cn(
                        "font-mono text-sm transition-opacity duration-300",
                        submitted
                            ? "text-white/70"
                            : "text-white/30"
                    )}
                >
                    {formatTime(time)}
                </span>

                <div className="h-4 w-64 flex items-center justify-center gap-0.5">
                    {[...Array(48)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-0.5 rounded-full transition-all duration-300",
                                submitted
                                    ? "bg-white/50 animate-pulse"
                                    : "bg-white/10 h-1"
                            )}
                            style={
                                submitted && isClient
                                    ? {
                                          height: `${20 + Math.random() * 80}%`,
                                          animationDelay: `${i * 0.05}s`,
                                      }
                                    : undefined
                            }
                        />
                    ))}
                </div>

                <p className="h-4 text-xs text-white/70">
                    {statusText}
                </p>
            </div>
        </div>
    );
}
