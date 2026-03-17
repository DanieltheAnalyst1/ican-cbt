import { AlertTriangle, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SubmitConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  totalCount: number;
}

const SubmitConfirmation = ({
  open,
  onClose,
  onConfirm,
  answeredCount,
  totalCount,
}: SubmitConfirmationProps) => {
  const unanswered = totalCount - answeredCount;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <div className="gradient-primary rounded-t-lg -mx-6 -mt-6 px-6 py-4 mb-4">
          <AlertDialogTitle className="text-primary-foreground text-lg">Submit Exam?</AlertDialogTitle>
        </div>
        <AlertDialogHeader>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{answeredCount} answered</p>
                  <p className="text-xs text-muted-foreground">of {totalCount} sub-questions</p>
                </div>
              </div>
              {unanswered > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-warning/10 p-4">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <p className="text-sm text-foreground">
                    <strong>{unanswered}</strong> sub-question{unanswered > 1 ? "s" : ""} unanswered
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Once submitted, you cannot modify your answers.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="gradient-green text-primary-foreground gradient-btn-hover"
          >
            Confirm Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SubmitConfirmation;
