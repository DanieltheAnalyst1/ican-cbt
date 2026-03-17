import { useState } from "react";
import { X, Copy } from "lucide-react";
import { toast } from "sonner";

interface CalculatorProps {
  onClose: () => void;
}

const Calculator = ({ onClose }: CalculatorProps) => {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [reset, setReset] = useState(false);

  const handleNumber = (num: string) => {
    if (reset) {
      setDisplay(num);
      setReset(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOp = (nextOp: string) => {
    const current = parseFloat(display);
    if (prev !== null && op) {
      const result = calculate(prev, current, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setReset(true);
  };

  const calculate = (a: number, b: number, operation: string): number => {
    switch (operation) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prev !== null && op) {
      const result = calculate(prev, parseFloat(display), op);
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setReset(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setReset(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(display);
    toast.success("Copied to clipboard");
  };

  const buttons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-80 rounded-2xl bg-card shadow-2xl border border-border overflow-hidden animate-fade-in">
        <div className="gradient-primary flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-primary-foreground">Calculator</h3>
          <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-muted/50 px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {prev !== null ? `${prev} ${op}` : ""}
            </span>
            <button onClick={copyResult} className="text-muted-foreground hover:text-foreground">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-right text-3xl font-bold font-mono text-foreground truncate">
            {display}
          </p>
        </div>

        <div className="p-3 space-y-2">
          <button
            onClick={handleClear}
            className="w-full rounded-lg bg-destructive/10 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/20 transition-colors"
          >
            Clear
          </button>
          {buttons.map((row, ri) => (
            <div key={ri} className="grid grid-cols-4 gap-2">
              {row.map((btn) => (
                <button
                  key={btn}
                  onClick={() => {
                    if (btn === "=") handleEquals();
                    else if (["+", "-", "×", "÷"].includes(btn)) handleOp(btn);
                    else handleNumber(btn);
                  }}
                  className={`rounded-lg py-3 text-sm font-semibold transition-all ${
                    btn === "="
                      ? "gradient-primary text-primary-foreground gradient-btn-hover"
                      : ["+", "-", "×", "÷"].includes(btn)
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-muted text-foreground hover:bg-muted/70"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
