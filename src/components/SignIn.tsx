import React from "react";
import { Button, Input, Field, Title1, Text, Divider } from "@fluentui/react-components";
import { signIn, signUp } from "../lib/auth-client";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await signUp.email({
          email,
          password,
          name,
        });
        alert("Account created! Please sign in.");
        setIsSignUp(false);
      } else {
        await signIn.email({
          email,
          password,
        });
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      padding: "20px"
    }}>
      <div style={{ 
        maxWidth: "400px", 
        width: "100%",
        padding: "32px",
        border: "1px solid #ccc",
        borderRadius: "8px"
      }}>
        <Title1 style={{ marginBottom: "16px" }}>
          {isSignUp ? "Create Account" : "Sign In"}
        </Title1>
        <Text style={{ marginBottom: "24px", display: "block" }}>
          {isSignUp 
            ? "Sign up to create community service events" 
            : "Welcome back to CO Springs Community Service Hub"}
        </Text>
        
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <Field label="Name" required style={{ marginBottom: "16px" }}>
              <Input
                value={name}
                onChange={(_, data) => setName(data.value)}
                required
              />
            </Field>
          )}
          
          <Field label="Email" required style={{ marginBottom: "16px" }}>
            <Input
              type="email"
              value={email}
              onChange={(_, data) => setEmail(data.value)}
              required
            />
          </Field>
          
          <Field label="Password" required style={{ marginBottom: "24px" }}>
            <Input
              type="password"
              value={password}
              onChange={(_, data) => setPassword(data.value)}
              required
            />
          </Field>

          {error && (
            <Text style={{ color: "red", marginBottom: "16px", display: "block" }}>
              {error}
            </Text>
          )}

          <Button 
            appearance="primary" 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", marginBottom: "16px" }}
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <Divider />

        <Button
          appearance="subtle"
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ width: "100%", marginTop: "16px" }}
        >
          {isSignUp 
            ? "Already have an account? Sign In" 
            : "Don't have an account? Sign Up"}
        </Button>
      </div>
    </div>
  );
}