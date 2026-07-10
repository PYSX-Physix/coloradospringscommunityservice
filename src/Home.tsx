import Posts from './Posts';
import Search from './Search';
import YourPosts from './YourPosts';
import { Privacy, Terms } from './Policies';
import AdminPanel from './admin';
import About from './About';
import Profile from './Profile';
import Contribute from './Contribute';
import { useSession, signOut } from './lib/auth-client';
import { Route, Routes, useLocation, useNavigate, Link } from 'react-router-dom';
import Post from './Post';
import { HelpHome } from './Help';
import { useState, useRef, useEffect } from 'react';
import NotificationPanel from './components/NotificationPanel';
import { useIsMobile } from './hooks/useIsMobile';
import Settings from './Settings';
import AnnouncementsPage from './AnnouncementsPage';
import AnnouncementDetail from './AnnouncementDetail';
import { AnnouncementPopover } from './Announcements';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';

function NavItem({ href, icon: Icon, label, active, onClick }: {
  href: string; icon: React.ElementType; label: string; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={active ? 'nav-item-active' : 'nav-item'}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function Home() {
  const getInitialDrawerState = () => window.innerWidth > 768;
  const [isOpen, setIsOpen] = useState(getInitialDrawerState);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const isAdmin = !!(session?.user as any)?.isAdmin;

  const closeOnMobile = () => { if (isMobile) setIsOpen(false); };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const path = location.pathname;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-800">
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? 'fixed z-30' : 'relative'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'w-72' : 'w-64'}
          h-full flex flex-col bg-neutral-900 border-r border-neutral-500 transition-transform duration-300 shrink-0
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-400">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest"></span>
            {isMobile && (
              <button onClick={() => setIsOpen(false)} className="btn-ghost p-1">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-600 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {(session?.user?.name || session?.user?.email || 'G')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">
                  {session?.user?.name || session?.user?.email || 'Guest'}
                </p>
                <p className="text-xs text-gray-500">{session ? 'Signed in' : 'Not signed in'}</p>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#212121] border border-[#4b4b4b] rounded-xl shadow-xl z-50 overflow-hidden">
                {session ? (
                  <>
                    <Link to="/profile" onClick={() => { setUserMenuOpen(false); closeOnMobile(); }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors">
                      <UserCircleIcon className="w-4 h-4" /> Profile
                    </Link>
                    <Link to="/settings" onClick={() => { setUserMenuOpen(false); closeOnMobile(); }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors">
                      <Cog6ToothIcon className="w-4 h-4" /> Settings
                    </Link>
                    <div className="border-t border-gray-700" />
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors">
                      <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors">
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Notification & Announcement icons */}
          {session && (
            <div className="flex items-center gap-2 mt-2 px-2">
              <NotificationPanel />
              <AnnouncementPopover />
            </div>
          )}
        </div>

        {/* Nav body */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">General</p>
          <NavItem href="/" icon={HomeIcon} label="Posts" active={path === '/'} onClick={closeOnMobile} />
          <NavItem href="/search" icon={MagnifyingGlassIcon} label="Search" active={path === '/search'} onClick={closeOnMobile} />
          <NavItem href="/saved/my-posts" icon={ClipboardDocumentListIcon} label="My Posts" active={path === '/saved/my-posts'} onClick={closeOnMobile} />

          <div className="divider" />
          <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Info</p>
          <NavItem href="/announcements" icon={MegaphoneIcon} label="Announcements" active={path.startsWith('/announcements')} onClick={closeOnMobile} />
          <NavItem href="/about" icon={InformationCircleIcon} label="About Us" active={path === '/about'} onClick={closeOnMobile} />

          {/* Policies accordion */}
          <button
            onClick={() => setPoliciesOpen(!policiesOpen)}
            className={`w-full nav-item justify-between ${path.startsWith('/policies') ? 'text-blue-300' : ''}`}
          >
            <span className="flex items-center gap-3">
              <DocumentTextIcon className="w-5 h-5 shrink-0" />
              <span>Policies</span>
            </span>
            <ChevronRightIcon className={`w-4 h-4 transition-transform ${policiesOpen ? 'rotate-90' : ''}`} />
          </button>
          {policiesOpen && (
            <div className="ml-8 space-y-1">
              <Link to="/policies/privacy-policy" onClick={closeOnMobile}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${path === '/policies/privacy-policy' ? 'text-blue-300 bg-blue-900/30' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
                Privacy Policy
              </Link>
              <Link to="/policies/terms-of-service" onClick={closeOnMobile}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${path === '/policies/terms-of-service' ? 'text-blue-300 bg-blue-900/30' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
                Terms of Service
              </Link>
            </div>
          )}

          <NavItem href="/help" icon={QuestionMarkCircleIcon} label="Help" active={path === '/help'} onClick={closeOnMobile} />

          {isAdmin && (
            <>
              <div className="divider" />
              <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</p>
              <NavItem href="/admin" icon={ShieldCheckIcon} label="Admin Panel" active={path === '/admin'} onClick={closeOnMobile} />
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#5b5b5b]">
          <NavItem href="/contribute" icon={CodeBracketIcon} label="Contribute" active={path === '/contribute'} onClick={closeOnMobile} />
          <div className="mt-2 px-3">
            <span className="badge bg-blue-900/60 text-blue-300 border border-blue-700/50">Beta</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar hamburger */}
        <div className={`px-4 py-3 border-b border-gray-800 flex items-center gap-3 ${isOpen && !isMobile ? 'hidden' : 'flex'}`}>
          <button onClick={() => setIsOpen(!isOpen)} className="btn-ghost p-1">
            <Bars3Icon className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-400">CO Springs Community Service</span>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Posts />} />
            <Route path="/search" element={<Search />} />
            <Route path="/saved/my-posts" element={<YourPosts />} />
            <Route path="/about" element={<About />} />
            <Route path="/post" element={<Post />} />
            <Route path="/policies/privacy-policy" element={<Privacy />} />
            <Route path="/policies/terms-of-service" element={<Terms />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<HelpHome />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/announcements/:id" element={<AnnouncementDetail />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Home;