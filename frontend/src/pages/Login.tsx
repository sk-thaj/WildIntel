import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/api/auth/login", { username, password, role });
            login(res.data.user);
            toast.success("Logged in successfully!");
            navigate("/");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-20 flex justify-center">
            <div className="w-full max-w-md bg-card border rounded-lg p-8 shadow-sm">
                <h1 className="font-display text-3xl font-bold mb-6 text-center">Welcome Back</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <Input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Account Type</label>
                        <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">Regular User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </form>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Don't have an account? <Link to="/register" className="text-primary hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
}
