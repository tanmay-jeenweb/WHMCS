import React, { useEffect } from "react";
import AppRoutes from "./routes";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";

function App() {
    const location = useLocation();
    const hideFooterOnPaths = ["/"];
    const shouldHideFooter = hideFooterOnPaths.includes(location.pathname);

    useEffect(() => {
        const updateFavicon = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 30;
            canvas.height = 30;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Clear (No background)
            ctx.clearRect(0, 0, 28, 28);

            const now = new Date();
            let hrsNum = now.getHours() % 12;
            if (hrsNum === 0) hrsNum = 12;
            const hrs = String(hrsNum);
            const mins = String(now.getMinutes()).padStart(2, "0");
            const secs = now.getSeconds();

            // Draw Hours at top-left (Black)
            ctx.font = "17px system-ui, -apple-system, sans-serif";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(hrs, 0, 1);

            // Draw Minutes at bottom-right (Black)
            ctx.font = "16px system-ui, -apple-system, sans-serif";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            ctx.fillText(mins, 28, 27);

            // Update favicon link
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.head.appendChild(link);
            }
            link.type = "image/png";
            link.href = canvas.toDataURL("image/png");
        };

        // Run immediately
        updateFavicon();

        // Update every second
        const timer = setInterval(updateFavicon, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative">
            <div className="flex-1 flex flex-col">
                <AppRoutes />
            </div>
            {!shouldHideFooter && <Footer />}
        </div>
    );
}

export default App;