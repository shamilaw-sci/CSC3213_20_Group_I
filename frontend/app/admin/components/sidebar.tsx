"use client";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import {LayoutDashboard , User, UsersRound , Shirt,Store,BarChart3,Settings, Menu} from "lucide-react";
import { useState } from 'react';

export default function Sidebar(){
    const [collapsed ,setCollapsed] = useState(false);
    const pathname = usePathname();

    const getlinkClass = (path: string) => {
        // Check for exact match for the dashboard, startsWith for others
        const isActive = path === '/admin' 
            ? pathname === path 
            : pathname.startsWith(path);

        return `p-2 ${
            isActive 
            ? "text-purple-900 font-bold border-l-4 border-purple-900 bg-purple-100" 
            : "hover:text-pink-900"
        }`;
    };

    return(
        <aside className={`h-screen sticky top-0 bg-[#faf1ff] p-3 transition-all duration-300 ${
            collapsed ? "w-[70px]" : "w-[230px]" }`} >

                <div className="flex items-center justify-between mb-8">
                    
                    <button onClick={() => setCollapsed(!collapsed)} 
                    className="p-2 hover:bg-gray-300 rounded-md">
                    <Menu size={20} />
                    </button>
                </div>

                <nav className="flex flex-col gap-4">
                        <Link href='/admin' className={getlinkClass("/admin")}> 
                        <div className="flex items-center gap-3 py-3">
                            <LayoutDashboard size={19} className="shrink-0" />
                            {!collapsed && <span>Dashboard  </span>}
                        </div>
                        </Link>

                        <Link href='/admin/users' className={getlinkClass("/admin/users")}>
                        <div className="flex items-center gap-3 py-3">
                            <User size={19} className="shrink-0" />
                            {!collapsed && <span>User Management</span>}
                        </div>
                        </Link>
                        <Link href='/admin/twins' className={getlinkClass("/admin/twins")}>
                        <div className="flex items-center gap-3 py-3">
                            <UsersRound size={19} className="shrink-0" />
                            {!collapsed && <span>Digital Twin Monitor</span>}
                        </div>
                        </Link>
                        <Link href='/admin/catalog' className={getlinkClass("/admin/catalog")}>
                        <div className="flex items-center gap-3 py-3">
                            <Shirt size={19} className="shrink-0" />
                            {!collapsed && <span>Garment Catalog</span>}
                        </div>
                        </Link>
                        <Link href='/admin/merchants' className={getlinkClass("/admin/merchants")}>
                        <div className="flex items-center gap-3 py-3">
                            <Store size={19} className="shrink-0" />
                            {!collapsed && <span>Merchant</span>}
                        </div>
                        </Link>
                        <Link href='/admin/analytics' className={getlinkClass("/admin/analytics")}>
                        <div className="flex items-center gap-3 py-3">
                            <BarChart3 size={19} className="shrink-0" />
                            {!collapsed && <span>Analytics</span>}
                        </div>
                        </Link>
                        <Link href='/admin/security' className={getlinkClass("/admin/security")}>
                        <div className="flex items-center gap-3 py-3">
                            <Settings size={19} className="shrink-0" />
                            {!collapsed && <span>Security</span>}
                        </div>
                        </Link>
                </nav>
        </aside>
    );

}
