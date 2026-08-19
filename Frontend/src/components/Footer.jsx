import React, { useState, useEffect } from 'react';
import jwLogo from '../assets/jwLogo.jpeg';
import { getDeviceId } from '../utils/device';

export default function Footer() {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [deviceId, setDeviceId] = useState('Loading...');
    const [user, setUser] = useState(null);
    const [loginTime] = useState(() => {
        let time = sessionStorage.getItem("loginTime");
        if (!time) {
            time = new Date().toLocaleTimeString();
            sessionStorage.setItem("loginTime", time);
        }
        return time;
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {}
        }

        getDeviceId().then(id => setDeviceId(id)).catch(() => setDeviceId('Unknown'));

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const userRoleLower = (user?.role || "").toLowerCase();
    const isAdmin = userRoleLower === "admin" || userRoleLower === "super admin" || userRoleLower.includes("admin");

    if (!isAdmin) {
        return (
            <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
                    <div>© 2012 - 2026 JustEmail Cloud Systems. All rights reserved.</div>
                    <div className="flex space-x-4">
                        <span 
                            onClick={() => { window.location.href = "/store"; }}
                            className="hover:text-[#0056cf] cursor-pointer transition-colors"
                        >
                            WHMCS Email Store
                        </span>
                        <span className="hover:text-slate-600 cursor-pointer">Terms of service</span>
                        <span className="hover:text-slate-600 cursor-pointer">Privacy policy</span>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-white border-t border-slate-200 mt-auto flex flex-col">
            {user && (
                <div className="bg-slate-50 border-b border-slate-200 py-1 text-[10px] text-slate-500 uppercase tracking-wider">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4">
                        <span>User: <strong className="text-slate-700">{user.name}</strong></span>
                        <span>Login: <strong className="text-slate-700">{loginTime}</strong></span>
                        <span>Time: <strong className="text-slate-700">{currentTime}</strong></span>
                        <span>Device ID: <strong className="text-slate-700 font-mono">{deviceId}</strong></span>
                    </div>
                </div>
            )}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-2 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Powered by</span>
                        <img src={jwLogo} alt="Jeenweb" className="h-14 w-auto rounded-sm cursor-pointer" onClick={() => window.open("https://www.jeenweb.com", "_blank")} />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
                        <span>
                            Helpline: <a href="tel:9824466017" className="text-slate-500">9824466017</a>
                        </span>
                        <span>
                            Email: <a href="mailto:info@jeenweb.com" className="text-slate-500">info@jeenweb.com</a>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
