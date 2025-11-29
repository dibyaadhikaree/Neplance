"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "../UI";

interface LoginFormProps {
    onSubmit: (email: string, password: string) => Promise<void>;
    loading?: boolean;
}

export const LoginForm = ({ onSubmit, loading = false }: LoginFormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await onSubmit(email, password);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
            />
            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
            />
            <Button type="submit" disabled={loading || !email || !password}>
                {loading ? "Signing in..." : "Sign in"}
            </Button>
        </form>
    );
};
