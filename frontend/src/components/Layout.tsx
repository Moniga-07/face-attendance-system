import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, FileText, Camera, LogOut, UserCircle } from 'lucide-react';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role || 'admin'; // fallback to admin if not set

    let navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
        { name: 'Students', href: '/students', icon: Users, roles: ['admin'] },
        { name: 'Register Student', href: '/students/register', icon: UserPlus, roles: ['admin'] },
        { name: 'Live Attendance', href: '/live', icon: Camera, roles: ['admin', 'faculty'] },
        { name: 'Reports', href: '/reports', icon: FileText, roles: ['admin', 'faculty'] },
        { name: 'Management', href: '/management', icon: Users, roles: ['admin'] },
    ];

    navigation = navigation.filter(item => item.roles.includes(role));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-blue-50 text-slate-900 font-sans">
            {/* Sidebar */}
            <div className="w-64 glass border-r border-slate-200/50 flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                        FaceAuth Admin
                    </h1>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.href) && (item.href !== '/students' || location.pathname === '/students');
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                        : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-200/50 space-y-2">
                    <Link
                        to="/profile"
                        className={`flex items-center space-x-3 px-4 py-3 w-full rounded-xl transition-colors ${
                            location.pathname === '/profile' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                    >
                        <UserCircle size={20} />
                        <span>User Profile</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 glass border-b border-slate-200/50 flex items-center justify-between px-8">
                    <h2 className="text-lg font-medium text-slate-800">
                        {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white hover:opacity-80 transition-opacity">
                            A
                        </Link>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-8 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
