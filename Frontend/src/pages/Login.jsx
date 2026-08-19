import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser, registerUser } from "../api/authApi";
import { getDeviceId } from "../utils/device";
import jwlogo from "../assets/jwLogo.jpeg";


export default function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login"); // "login" or "signup"
    const [form, setForm] = useState({ username: "", password: "" });
    const [signupForm, setSignupForm] = useState({ fullName: "", email: "", mobNo: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const deviceId = await getDeviceId();
            const response = await loginUser({ ...form, deviceId });

            if (!response.data.success) {
                if (response.data.status === "DEVICE_REGISTRATION_REQUIRED") {
                    navigate("/device-registration", { state: { username: form.username, password: form.password } });
                    return;
                }
                if (response.data.status === "PENDING_APPROVAL") {
                    navigate("/pending-approval");
                    return;
                }
                toast.error(response.data.message || "Login failed");
                return;
            }

            const user = response.data.user;
            const token = response.data.token;
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
            window.dispatchEvent(new Event("auth-change"));

            if (user.role === 'admin') {
                navigate("/admin/dashboard");
            } else if (user.role === 'reseller') {
                navigate("/reseller/dashboard");
            } else {
                navigate("/user/home");
            }

        } catch (error) {
            if (error.response?.data?.status === "DEVICE_MISMATCH") {
                toast.error("Unauthorized device. Contact admin.");
            } else {
                toast.error(error.response?.data?.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!signupForm.fullName.trim()) {
                toast.error("Full Name is required");
                setLoading(false);
                return;
            }
            if (!signupForm.email.trim() || !signupForm.email.includes("@")) {
                toast.error("Valid Email Address is required");
                setLoading(false);
                return;
            }
            if (!signupForm.mobNo.trim()) {
                toast.error("Phone Number is required");
                setLoading(false);
                return;
            }
            if (!signupForm.password || signupForm.password.length < 3) {
                toast.error("Password must be at least 3 characters");
                setLoading(false);
                return;
            }

            const response = await registerUser({
                name: signupForm.fullName.trim(),
                email: signupForm.email.trim(),
                username: signupForm.email.trim().toLowerCase(),
                password: signupForm.password,
                mobNo: signupForm.mobNo.trim()
            });

            if (!response.data.success) {
                toast.error(response.data.message || "Sign up failed");
                return;
            }

            // Pre-fill login form with newly registered email & switch tab
            setForm({ username: signupForm.email.trim(), password: "" });
            setSignupForm({ fullName: "", email: "", mobNo: "", password: "" });

            toast.success("New customer account created successfully! Please sign in to access your portal.");
            setMode("login");

        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col md:flex-row bg-gradient-to-br from-[#06152d] via-slate-950 to-[#0b1b36] font-sans antialiased text-slate-200 overflow-hidden relative">
            
            {/* Ambient Glows */}
            <div className="absolute top-[45%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[40%] h-[60%] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none z-0" />
            <div className="absolute top-[25%] left-[75%] -translate-x-1/2 -translate-y-1/2 w-[40%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-[25%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-[35%] h-[45%] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Left Column: WHMCS Dashboard Mockup */}
            <div className="hidden md:flex md:w-1/2 h-full relative overflow-hidden select-none bg-transparent flex-col justify-center items-center p-8 z-10">
                <div className="w-full flex justify-center items-center max-h-[60%] z-10 relative -top-12">
                    <img
                        src="/whmcs_server_icon.png"
                        alt="WHMCS Server Infrastructure"
                        className="w-[75%] h-auto object-contain transition-transform duration-[6000ms] hover:scale-103 ease-out drop-shadow-[0_15px_40px_rgba(0,86,207,0.25)] rounded-2xl"
                    />
                </div>
                
                <div className="absolute bottom-6 left-12 z-20 max-w-md">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                        Billing & Provisioning,<br />
                        <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-teal-400 bg-clip-text text-transparent">
                            Fully Automated.
                        </span>
                    </h1>
                    <p className="mt-3 text-slate-400 text-xs leading-relaxed max-w-sm">
                        Manage web hosting services, domain registrations, automated billing, operations, and support desk relationships in one powerful portal.
                    </p>
                </div>
            </div>

            {/* Right Column: Login / Sign Up Form */}
            <div className="w-full md:w-1/2 h-full flex flex-col justify-between p-5 sm:p-8 relative bg-transparent overflow-y-auto z-10">

                <div className="h-2 sm:h-4"></div>

                <div className="w-full max-w-md mx-auto z-10 flex flex-col justify-center flex-grow py-3">
                    {/* Logo & Heading */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="flex items-center gap-2 mb-1.5 select-none">
                            <span className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-500 via-sky-500 to-teal-400 bg-clip-text text-transparent">
                                WHMCS
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-center">
                            {mode === "login" ? "Welcome Back" : "Create Customer Account"}
                        </h2>
                        <p className="text-slate-400 text-xs mt-1 text-center">
                            {mode === "login" 
                                ? "Sign in to your administration or customer dashboard" 
                                : "Register for a new JustEmail customer account"}
                        </p>
                    </div>

                    {/* Mode Toggle Switcher */}
                    <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 mb-4 max-w-md w-full">
                        <button
                            type="button"
                            onClick={() => setMode("login")}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                                mode === "login"
                                    ? "bg-[#0056cf] text-white shadow-md"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("signup")}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                                mode === "signup"
                                    ? "bg-[#0056cf] text-white shadow-md"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Premium Dark Glassmorphic Form Card */}
                    <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-blue-500/20 transition-all duration-300">
                        {mode === "login" ? (
                            /* SIGN IN FORM */
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="username" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Username / Email
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                        </span>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            placeholder="Enter your username or email"
                                            value={form.username}
                                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-white text-xs sm:text-sm outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:bg-slate-900/60"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                            </svg>
                                        </span>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Enter your password"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="w-full pl-11 pr-12 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-white text-xs sm:text-sm outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:bg-slate-900/60"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 bg-blue-600 hover:bg-blue-500 shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.5)] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75 cursor-pointer flex justify-center items-center gap-2"
                                >
                                    {loading ? "Signing in..." : "Sign In"}
                                </button>
                            </form>
                        ) : (
                            /* CUSTOMER SIGN UP FORM */
                            <form onSubmit={handleSignUp} className="space-y-3.5">
                                {/* Full Name */}
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        value={signupForm.fullName}
                                        onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                                    />
                                </div>

                                {/* Email Address */}
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="john@example.com"
                                        value={signupForm.email}
                                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-white text-xs font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                                    />
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="9876543210"
                                        value={signupForm.mobNo}
                                        onChange={(e) => setSignupForm({ ...signupForm, mobNo: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-white text-xs font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Password *
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Create account password"
                                        value={signupForm.password}
                                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-white text-xs font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 mt-2 rounded-xl text-white text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 bg-[#0056cf] hover:bg-blue-600 shadow-[0_4px_15px_rgba(0,86,207,0.4)] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75 cursor-pointer flex justify-center items-center gap-2"
                                >
                                    {loading ? "Creating Customer Account..." : "Create Customer Account"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="z-10 mt-auto flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-slate-900/60 pt-3 text-[10px] text-slate-500 w-full max-w-md mx-auto">
                    <div className="flex items-center gap-1.5">
                        <span>Powered by</span>
                        <img src={jwlogo} alt="Jeenweb" className="h-9 w-auto rounded-sm" />
                    </div>
                    <div className="text-center sm:text-right">
                        <div>Helpline: <a href="tel:9824466017" className="font-semibold text-slate-400">9824466017</a></div>
                        <div>Email: <a href="mailto:info@jeenweb.com" className="font-semibold text-slate-400">info@jeenweb.com</a></div>
                    </div>
                </div>
            </div>
        </div>
    );
}