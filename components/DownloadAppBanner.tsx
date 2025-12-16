"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Download } from "lucide-react";

export default function DownloadAppBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Only Android devices
        const isAndroid = /Android/i.test(navigator.userAgent);

        // Check if user already dismissed
        const dismissed = localStorage.getItem("nopass_app_banner_dismissed");

        if (isAndroid && !dismissed) {
            setVisible(true);
        }
    }, []);

    if (!visible) return null;

    const closeBanner = () => {
        localStorage.setItem("nopass_app_banner_dismissed", "true");
        setVisible(false);
    };

    return (
        <div className="fixed top-16 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md">
            <div className="px-4 py-3 flex items-center justify-between gap-3">

                <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                        📱 NoPass Mobile App
                    </span>
                    <span className="text-xs opacity-90">
                        Download the secure Android app
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/downloads/NoPassMobile-v1.0.1.apk"
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-medium">
                        <Download size={14} />
                        Download
                    </Link>

                    <button
                        onClick={closeBanner}
                        className="p-1 rounded hover:bg-white/20"
                        aria-label="Close download banner">
                        <X size={16} />
                    </button>
                </div>

            </div>
        </div>
    );
}
