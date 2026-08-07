//shared sidebar & top bar
//shared sidebar & top bar
//this will contain the layout of the admin dashboard, including the sidebar and main content area

import '../globals.css';
import Sidebar from './components/sidebar';
import Navbar from './components/navbar';

export default function AdminLayout({ 
    children,
}: { 
    children: React.ReactNode 
}) {
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


