interface ExamTimerProps {
  timeRemaining: number;
  totalTime: number;
}

const ExamTimer = ({ timeRemaining, totalTime }: ExamTimerProps) => {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const pct = timeRemaining / totalTime;
  const bgClass = pct > 0.5 ? "bg-success" : pct > 0.2 ? "bg-warning" : "bg-destructive";
  const isUrgent = pct <= 0.1;

  return (
    <div
      className={`${bgClass} rounded-lg px-3 py-1.5 font-mono text-sm font-bold text-primary-foreground ${
        isUrgent ? "animate-pulse-glow" : ""
      }`}
    >
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </div>
  );
};

export default ExamTimer;
