//shared sidebar & top bar
//this will contain the layout of the admin dashboard, including the sidebar and main content area

import '../globals.css';
import Sidebar from './components/sidebar';
import Navbar from './components/navbar';
import { requireAdminPageUser } from '@/server/auth/page-access';

export default async function AdminLayout({
    children,
}: { 
    children: React.ReactNode 
}) {
    await requireAdminPageUser();

    return(
        <div className="flex min-h-screen">
                {/* Sidebar */}
                <Sidebar />

                {/* Main area */}
                <div className="flex-1 flex flex-col">

                    {/* Navbar */}
                    <Navbar />

                    {/* page content */}
                    <main className="flex-1 bg-gradient-to-br from-purple-200 via-slate-100 to-pink-100 p-8">
                        {children}
                    </main>

                </div>

 
        </div>
                
    )
}


