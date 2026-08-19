import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { createUserByAdmin } from "../../../api/authApi";
import { getUserTypes } from "../../../api/userTypeMasterApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function CreateUser() {
    const navigate = useNavigate();
    const [userTypes, setUserTypes] = useState([]);

    const [newUserForm, setNewUserForm] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        userTypeId: "",
        mobNo: "",
        dateOfJoin: new Date().toISOString().split('T')[0],
        deviceVerificationRequired: false,
        role: "user"
    });
    const [showPassword, setShowPassword] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);

    const loadUserTypes = async () => {
        try {
            const res = await getUserTypes();
            setUserTypes(res.data.data || []);
        } catch (error) {
            console.error("Error loading user types:", error);
        }
    };

    useEffect(() => {
        loadUserTypes();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!newUserForm.name || !newUserForm.username || !newUserForm.email || !newUserForm.password) {
            toast.error("Please fill in all mandatory fields (Name, Username, Email, Password).");
            return;
        }

        setCreatingUser(true);
        try {
            await createUserByAdmin(newUserForm);
            toast.success("User account and customer profile created successfully!");
            setNewUserForm({
                name: "",
                username: "",
                email: "",
                password: "",
                userTypeId: "",
                mobNo: "",
                dateOfJoin: new Date().toISOString().split('T')[0],
                deviceVerificationRequired: false,
                role: "user"
            });
            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create user account.");
        } finally {
            setCreatingUser(false);
        }
    };

    return (
        <div className="flex-1 bg-slate-50 font-sans text-slate-900 min-h-screen flex flex-col">
            <Navbar title="CRM Admin" />

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-6">
                
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Create New User Account</h1>
                        <p className="text-slate-500 text-xs mt-1">Register a new client or staff user account into the system and customer database.</p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/dashboard")}
                        className="text-xs font-bold text-slate-500 hover:text-[#0056cf] flex items-center gap-1 transition-all cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
                    >
                        <span>←</span> Back to User List
                    </button>
                </div>

                {/* Form Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/90 space-y-6">
                    <form onSubmit={handleCreateUser} className="space-y-6">
                        
                        {/* Section 1: User Account Credentials */}
                        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                            <h4 className="text-xs font-extrabold text-[#0056cf] uppercase tracking-wider">Account Credentials & Contact</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUserForm.name}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0056cf]"
                                        placeholder="Jane Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUserForm.username}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value.toLowerCase() })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0056cf]"
                                        placeholder="janedoe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUserForm.email}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0056cf]"
                                        placeholder="jane@company.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={newUserForm.password}
                                            onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0056cf]"
                                            placeholder="Set user password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-bold"
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newUserForm.mobNo}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, mobNo: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0056cf]"
                                        placeholder="+91 98244 66017"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Join</label>
                                    <input
                                        type="date"
                                        value={newUserForm.dateOfJoin}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, dateOfJoin: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0056cf]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Role & System Privileges */}
                        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Role & Access Privileges</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">User Group (Role)</label>
                                    <select
                                        value={newUserForm.role}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0056cf] cursor-pointer"
                                    >
                                        <option value="user">Client / User</option>
                                        <option value="admin">Admin Staff</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">User Type Role Template</label>
                                    <select
                                        value={newUserForm.userTypeId}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, userTypeId: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0056cf] cursor-pointer"
                                    >
                                        <option value="">Default Standard Permissions</option>
                                        {userTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.type_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newUserForm.deviceVerificationRequired}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, deviceVerificationRequired: e.target.checked })}
                                        className="h-4 w-4 text-[#0056cf] border-slate-300 rounded focus:ring-[#0056cf]"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Require Device Verification</p>
                                        <p className="text-[10px] text-slate-500">Require admin approval before login from a new web browser/device.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => navigate("/admin/dashboard")}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={creatingUser}
                                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0056cf] hover:bg-blue-700 text-white cursor-pointer shadow-md transition-all flex items-center gap-2"
                            >
                                {creatingUser ? "Creating Account..." : "Create User & Customer Account"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
