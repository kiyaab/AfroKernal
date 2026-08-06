import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Clock, HelpCircle, CheckCircle2 } from "lucide-react";

export interface TimestampQuiz {
  timestamp: number; // in seconds
  title: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
}

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onProgressUpdate?: (percent: number) => void;
  timestampQuizzes?: TimestampQuiz[];
  onCompleteQuiz?: (quiz: TimestampQuiz, isCorrect: boolean) => void;
}

export function VideoPlayer({
  videoUrl,
  title,
  onProgressUpdate,
  timestampQuizzes = [],
  onCompleteQuiz,
}: VideoPlayerProps) {
  const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [triggeredQuizzes, setTriggeredQuizzes] = useState<Set<number>>(new Set());
  const [activeQuiz, setActiveQuiz] = useState<TimestampQuiz | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState(false);

  // Convert youtube URL if needed
  const embedUrl = isYoutube ? getYoutubeEmbedUrl(videoUrl) : videoUrl;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(curr);
    if (dur > 0) {
      setDuration(dur);
      const pct = Math.round((curr / dur) * 100);
      onProgressUpdate?.(pct);
    }

    // Check for timestamp quiz prompts
    timestampQuizzes.forEach((q) => {
      if (
        Math.abs(curr - q.timestamp) < 0.8 &&
        !triggeredQuizzes.has(q.timestamp)
      ) {
        // Trigger quiz prompt!
        videoRef.current?.pause();
        setIsPlaying(false);
        setTriggeredQuizzes((prev) => new Set(prev).add(q.timestamp));
        setActiveQuiz(q);
        setSelectedChoice(null);
        setQuizSubmitted(false);
      }
    });
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleQuizAnswer = () => {
    if (selectedChoice === null || !activeQuiz) return;
    const isCorrect = selectedChoice === activeQuiz.correctIndex;
    setQuizIsCorrect(isCorrect);
    setQuizSubmitted(true);
    onCompleteQuiz?.(activeQuiz, isCorrect);
  };

  const closeQuizPrompt = () => {
    setActiveQuiz(null);
    setSelectedChoice(null);
    setQuizSubmitted(false);
    // Resume video
    videoRef.current?.play();
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border bg-black shadow-2xl group">
      {isYoutube ? (
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={() => {
              setIsPlaying(false);
              onProgressUpdate?.(100);
            }}
            onClick={togglePlay}
          />

          {/* Timestamp Quiz Markers Overlay on Progress */}
          <div className="absolute inset-x-0 bottom-12 px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <div className="relative w-full flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              {/* Quiz Dots */}
              {timestampQuizzes.map((q) => {
                const leftPct = duration > 0 ? (q.timestamp / duration) * 100 : 0;
                return (
                  <div
                    key={q.timestamp}
                    onClick={() => {
                      if (videoRef.current) videoRef.current.currentTime = q.timestamp;
                    }}
                    title={`Quiz prompt at ${formatTime(q.timestamp)}: ${q.title}`}
                    className="absolute w-3 h-3 rounded-full bg-primary ring-2 ring-black cursor-pointer transform -translate-x-1/2 hover:scale-125 transition"
                    style={{ left: `${leftPct}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Video Control Bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20 text-white text-xs">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary/40 text-primary transition">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="hover:text-primary transition">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/30 rounded appearance-none cursor-pointer accent-primary"
                />
              </div>
              <span className="font-mono text-[11px] text-white/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Playback Speed selector */}
              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md text-[11px]">
                <Clock className="w-3 h-3 text-primary" />
                {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-1 rounded ${playbackSpeed === spd ? "bg-primary text-black font-bold" : "hover:text-primary"}`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <button onClick={handleFullscreen} className="hover:text-primary transition">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timestamp Quiz Interactive Modal Overlay */}
      {activeQuiz && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md p-6 flex flex-col justify-center items-center text-white animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-lg bg-card/90 border border-primary/40 rounded-2xl p-6 shadow-2xl text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <HelpCircle className="w-4 h-4" /> Timestamp Quiz Prompt · {formatTime(activeQuiz.timestamp)}
              </div>
              <span className="text-xs text-muted-foreground">{activeQuiz.title}</span>
            </div>

            <h3 className="text-base font-semibold mb-4 leading-snug">{activeQuiz.question}</h3>

            <div className="space-y-2 mb-6">
              {activeQuiz.choices.map((choice, i) => {
                const isSelected = selectedChoice === i;
                const isCorrect = i === activeQuiz.correctIndex;

                let btnStyle = "border-border hover:bg-accent";
                if (quizSubmitted) {
                  if (isCorrect) btnStyle = "border-green-500 bg-green-500/15 text-green-400";
                  else if (isSelected) btnStyle = "border-destructive bg-destructive/15 text-destructive";
                } else if (isSelected) {
                  btnStyle = "border-primary bg-primary/10 text-primary font-medium";
                }

                return (
                  <button
                    key={i}
                    disabled={quizSubmitted}
                    onClick={() => setSelectedChoice(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{choice}</span>
                    {isSelected && !quizSubmitted && <span className="w-2 h-2 rounded-full bg-primary" />}
                    {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  </button>
                );
              })}
            </div>

            {quizSubmitted && activeQuiz.explanation && (
              <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary/90">
                💡 {activeQuiz.explanation}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              {!quizSubmitted ? (
                <button
                  disabled={selectedChoice === null}
                  onClick={handleQuizAnswer}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 disabled:opacity-50 transition"
                >
                  Submit & Check Answer
                </button>
              ) : (
                <button
                  onClick={closeQuizPrompt}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition flex items-center gap-1.5"
                >
                  Continue Lesson <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getYoutubeEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed${u.pathname}?enablejsapi=1`;
    const id = u.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}?enablejsapi=1`;
    if (u.pathname.startsWith("/embed/")) return `${url}?enablejsapi=1`;
    return url;
  } catch {
    return url;
  }
}
