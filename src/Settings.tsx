import React from "react";
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

  if (!session) {
    return null;
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 animate-pulse">Loading settings...</p>
      </div>
    );
  }

  const inputClass = "bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors w-full";
  return (
    <div className="max-w-xl flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>
      <hr className="border-gray-600"/>

      <div className="bg-[#2d2d2d] border border-gray-700 rounded-lg p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <p className="text-sm text-gray-400">Your display name is shown to other users on event pages. Your email and other personal information is private and never shown publicly.</p>

        <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Display Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="How you appear to others"/>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Email <span className="text-red-400">*</span></label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required/>
          </div>

          {profileSave === "success" && (
            <div className="text-sm text-green-400 bg-green-900/20 border border-green-800 rounded px-3 py-2">
              ✓ Your profile has been updated.
            </div>
          )}
          {profileSave === "error" && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
              {profileError}
            </div>
          )}
          <button
            type="submit"
            disabled={profileSave === "saving"}
            className="self-start bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            {profileSave === "saving" ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">
              Current Password <span className="text-red-400">*</span>
            </label>
            <input
              className={inputClass}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">
              New Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                className={inputClass + " pr-10"}
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">
              Confirm New Password <span className="text-red-400">*</span>
            </label>
            <input
              className={inputClass}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {passwordSave === "success" && (
            <div className="text-sm text-green-400 bg-green-900/20 border border-green-800 rounded px-3 py-2">
              ✓ Your password has been changed successfully.
            </div>
          )}
          {passwordSave === "error" && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
              {passwordError}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordSave === "saving"}
            className="self-start bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            {passwordSave === "saving" ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}