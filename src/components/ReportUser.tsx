import React from "react";
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Field,
  Textarea,
  Radio,
  RadioGroup,
  Divider,
  Text,
} from "@fluentui/react-components";
import { ShieldErrorRegular } from "@fluentui/react-icons";

interface ReportUserProps {
  open: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
  postId?: number;
  postTitle?: string;
}

type ReportCategory = 
  | "inappropriate_content"
  | "spam_misleading"
  | "safety_concerns"
  | "terms_violation"
  | "noshow_cancellation"
  | "other";

const REPORT_CATEGORIES = [
  {
    value: "inappropriate_content",
    label: "Inappropriate Content",
    description: "Offensive language, harassment, hate speech, or inappropriate behavior"
  },
  {
    value: "spam_misleading",
    label: "Spam or Misleading",
    description: "Fake events, spam, misleading information, or duplicate postings"
  },
  {
    value: "safety_concerns",
    label: "Safety Concerns",
    description: "Unsafe conditions, suspicious activity, potential scams"
  },
  {
    value: "terms_violation",
    label: "Violation of Terms",
    description: "Not a community service event, commercial content, policy violations"
  },
  {
    value: "noshow_cancellation",
    label: "No-Show or Cancellation Issues",
    description: "Organizer didn't show up, cancelled without notice, unresponsive"
  },
  {
    value: "other",
    label: "Other",
    description: "Issues not covered by the categories above"
  }
];

export const ReportUser: React.FC<ReportUserProps> = ({
  open,
  onClose,
  reportedUserId,
  reportedUserName,
  postId,
  postTitle
}) => {
  const [category, setCategory] = React.useState<ReportCategory>("inappropriate_content");
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert("Please provide a description of the issue");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reportedUserId,
          postId,
          category,
          description: description.trim(),
        }),
      });

      if (response.ok) {
        setShowConfirmation(true);
        setDescription("");
        setCategory("inappropriate_content");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Report submission error:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDescription("");
      setCategory("inappropriate_content");
      setShowConfirmation(false);
      onClose();
    }
  };

  if (showConfirmation) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Report Submitted</DialogTitle>
            <DialogContent>
              <Text>
                Thank you for your report. Our moderation team will review this matter and take appropriate action. 
                You may be contacted if additional information is needed.
              </Text>
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={handleClose}>
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldErrorRegular fontSize={24} />
                Report User
              </div>
            </DialogTitle>
            
            <DialogContent style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Divider />
              
              <div>
                <Text weight="semibold">Reporting: {reportedUserName}</Text>
                {postTitle && (
                  <div style={{ marginTop: "4px" }}>
                    <Text size={300} style={{ color: "#666" }}>
                      Event: {postTitle}
                    </Text>
                  </div>
                )}
              </div>

              <Field label="Category" required>
                <RadioGroup
                  value={category}
                  onChange={(_, data) => setCategory(data.value as ReportCategory)}
                >
                  {REPORT_CATEGORIES.map((cat) => (
                    <div key={cat.value} style={{ marginBottom: "12px" }}>
                      <Radio value={cat.value} label={cat.label} />
                      <Text size={200} style={{ marginLeft: "28px", color: "#666", display: "block" }}>
                        {cat.description}
                      </Text>
                    </div>
                  ))}
                </RadioGroup>
              </Field>

              <Field label="Description" required>
                <Textarea
                  placeholder="Please provide details about why you're reporting this user. Be as specific as possible."
                  value={description}
                  onChange={(_, data) => setDescription(data.value)}
                  rows={6}
                  resize="vertical"
                  required
                />
              </Field>

              <div>
                <Text size={300}>
                  <strong>Note:</strong> False or malicious reports may result in action against your account. 
                  Reports are reviewed by our moderation team.
                </Text>
              </div>
            </DialogContent>

            <DialogActions>
              <Button 
                appearance="primary" 
                type="submit" 
                disabled={isSubmitting || !description.trim()}
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
              <Button 
                appearance="secondary" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};