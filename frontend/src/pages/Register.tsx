import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/auth/register", { username, email, password });
            toast.success("Account created successfully! Please login.");
            navigate("/login");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-20 flex justify-center">
            <div className="w-full max-w-md bg-card border rounded-lg p-8 shadow-sm">
                <h1 className="font-display text-3xl font-bold mb-2 text-center">Create Account</h1>
                <p className="text-center text-muted-foreground mb-8 text-sm">Join WildIntel to help protect endangered species</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Username *</label>
                        <Input
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password *</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Choose a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </Button>
                </form>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
}
