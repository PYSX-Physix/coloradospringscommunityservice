import React from "react";
import {
  Title1, Title2, Divider, Card, CardHeader,
  Field, Input, Button, Text, Spinner,
  MessageBar, MessageBarBody, MessageBarTitle,
  Tooltip
} from "@fluentui/react-components";
import { Eye20Regular, EyeOff20Regular } from '@fluentui/react-icons';
import { useSession } from "./lib/auth-client";
import { useNavigate } from "react-router-dom";

type SaveState = "idle" | "saving" | "success" | "error";

export default function Settings() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  // Profile fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // UI state
  const [profileSave, setProfileSave] = React.useState<SaveState>("idle");
  const [passwordSave, setPasswordSave] = React.useState<SaveState>("idle");
  const [profileError, setProfileError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

  // Password view states
  const [showPassword, setShowPassword] = React.useState<Boolean>(false);

  React.useEffect(() => {
    if (!isPending && !session) {
      navigate("/auth");
    }
  }, [session, isPending, navigate]);

  // Pre-fill fields from session
  React.useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSave("saving");

    try {
      const res = await fetch("/api/auth/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });

      if (res.ok) {
        setProfileSave("success");
        setTimeout(() => setProfileSave("idle"), 3000);
      } else {
        const data = await res.json();
        setProfileError(data.error || "Failed to update profile");
        setProfileSave("error");
      }
    } catch {
      setProfileError("Network error. Please try again.");
      setProfileSave("error");
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setPasswordSave("saving");

    try {
      const res = await fetch("/api/auth/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordSave("success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSave("idle"), 3000);
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Failed to update password");
        setPasswordSave("error");
      }
    } catch {
      setPasswordError("Network error. Please try again.");
      setPasswordSave("error");
    }
  };

  if (isPending) {
    return <Spinner label="Loading settings..." />;
  }

  if (!session) {
    return null;
  }

  return (
    <div style={{ maxWidth: "600px" }}>
      <Title1>Settings</Title1>
      <Divider style={{ marginTop: "16px", marginBottom: "32px" }} />

      {/* Profile section */}
      <Card style={{ marginBottom: "24px" }}>
        <CardHeader header={<Title2>Profile</Title2>} />
        <form onSubmit={handleProfileSave}>
          <div style={{ padding: "0 16px 16px" }}>
            <Text style={{ display: "block", marginBottom: "16px", color: "#888" }}>
              Your display name is shown to other users on event pages. Your email is private and never shown publicly.
            </Text>

            <Field label="Display Name" style={{ marginBottom: "16px" }}>
              <Input
                value={name}
                onChange={(_, data) => setName(data.value)}
                placeholder="How you appear to other users"
              />
            </Field>

            <Field label="Email" required style={{ marginBottom: "24px" }}>
              <Input
                type="email"
                value={email}
                onChange={(_, data) => setEmail(data.value)}
                required
              />
            </Field>

            {profileSave === "success" && (
              <MessageBar intent="success" style={{ marginBottom: "16px" }}>
                <MessageBarBody>
                  <MessageBarTitle>Saved</MessageBarTitle>
                  Your profile has been updated.
                </MessageBarBody>
              </MessageBar>
            )}

            {profileSave === "error" && (
              <MessageBar intent="error" style={{ marginBottom: "16px" }}>
                <MessageBarBody>
                  <MessageBarTitle>Error</MessageBarTitle>
                  {profileError}
                </MessageBarBody>
              </MessageBar>
            )}

            <Button
              appearance="primary"
              type="submit"
              disabled={profileSave === "saving"}
            >
              {profileSave === "saving" ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Password section */}
      <Card>
        <CardHeader header={<Title2>Change Password</Title2>} />
        <form onSubmit={handlePasswordSave}>
          <div style={{ padding: "0 16px 16px" }}>
            <Text style={{ display: "block", marginBottom: "16px", color: "#888" }}>
              Leave these blank if you don't want to change your password.
            </Text>

            <Field label="Current Password" required style={{ marginBottom: "16px" }}>
              <Input
                type="password"
                value={currentPassword}
                onChange={(_, data) => setCurrentPassword(data.value)}
                required
              />
            </Field>

            <Field label="New Password" required style={{ marginBottom: "16px" }}>
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(_, data) => setNewPassword(data.value)}
                required
                minLength={6}
                contentAfter={(
                  <Button appearance="secondary" icon={ showPassword ? <Eye20Regular/> : <EyeOff20Regular/> } onClick={() => {
                    setShowPassword(!showPassword);
                  }}>
                    <Tooltip content={showPassword ? "Show Password" : "Hide Password"} relationship="label"/>
                  </Button>
                )}
              />
            </Field>

            <Field label="Confirm New Password" required style={{ marginBottom: "24px" }}>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(_, data) => setConfirmPassword(data.value)}
                required
                minLength={6}
              />
            </Field>

            {passwordSave === "success" && (
              <MessageBar intent="success" style={{ marginBottom: "16px" }}>
                <MessageBarBody>
                  <MessageBarTitle>Password updated</MessageBarTitle>
                  Your password has been changed successfully.
                </MessageBarBody>
              </MessageBar>
            )}

            {passwordSave === "error" && (
              <MessageBar intent="error" style={{ marginBottom: "16px" }}>
                <MessageBarBody>
                  <MessageBarTitle>Error</MessageBarTitle>
                  {passwordError}
                </MessageBarBody>
              </MessageBar>
            )}

            <Button
              appearance="primary"
              type="submit"
              disabled={passwordSave === "saving"}
            >
              {passwordSave === "saving" ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}