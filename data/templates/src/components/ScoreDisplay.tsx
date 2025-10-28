interface ScoreDisplayProps {
  score: number;
  label?: string;
  className?: string;
}

export default function ScoreDisplay({
  score,
  label = 'Score',
  className = ''
}: ScoreDisplayProps) {
  return (
    <div className={`score-display text-center ${className}`}>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      <div className="text-2xl font-bold text-blue-600">
        {score.toLocaleString()}
      </div>
    </div>
  );
}
