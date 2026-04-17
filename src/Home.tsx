import Posts from './Posts';
import Search from './Search';
import YourPosts from './YourPosts';
import { Privacy, Terms } from './Policies';
import AdminPanel from './admin';
import About from './About'
import Profile from './Profile';
import Contribute from './Contribute';
import { useSession, signOut } from "./lib/auth-client";
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './Home.css';
import {
  AppItem,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavItem,
  NavDivider,
  MenuItemLink,
  MenuTrigger,
  MenuPopover,
  MenuList,
  Menu,
  MenuItem,
  NavSectionHeader,
  NavCategory,
  NavCategoryItem,
  NavSubItem,
  NavSubItemGroup,
  MenuDivider,
  Tooltip,
  Hamburger,
  NavDrawerFooter,
  Tag
} from "@fluentui/react-components";

import {
  Home20Color,
  Person32Color,
  SearchSparkle20Color,
  ClipboardTextEdit20Color,
  PersonColor,
  SettingsColor,
  Info20Filled,
  ArrowExitRegular,
  QuestionCircle20Color, Shield20Color,
  Code20Color,
  DocumentFolder20Color
} from "@fluentui/react-icons";
import Post from './Post';
import { AnnouncementPopover } from './Announcements';
import { HelpHome } from './Help';
import { useState } from 'react';
import NotificationPanel from './components/NotificationPanel';
import { useIsMobile } from './hooks/useIsMobile';
import Settings from './Settings';

const ANNOUCEMENTS = '0';
const POSTSMENU = '1';
const SEARCHMENU = '2';
const SAVEDPOSTSMENU = '3';
const YOURPOSTSMENU = '4';
const ABOUTMENU = '5';
const POLICIESMENU = '6';
const PRIVACYPOLICY = '7';
const TERMSOFSERVICE = '8';
const HELPHOME = '10';
const ADMINPANEL = '11';
const CONTRIBUTE = '12';


function Home() {
  // Initialize drawer state from in-memory variable (or default based on screen size)
  const getInitialDrawerState = () => {
    const isMobileSize = window.innerWidth <= 500;
    // Use a simple in-memory approach - drawer starts open on desktop, closed on mobile
    return !isMobileSize;
  };

  const [isOpen, setIsOpen] = useState(getInitialDrawerState);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const isAdmin = !!(session?.user as any)?.isAdmin;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Determine which nav item should be active
  /* This is being replaced to see if the new way works properly
     if the new way doesn't work then the old way be renabled.
  if (location.pathname === '/search') selectedValue = SEARCHMENU;
  else if (location.pathname === '/saved/posts') selectedValue = SAVEDPOSTSMENU;
  else if (location.pathname === '/my-posts') selectedValue = YOURPOSTSMENU;
  else if (location.pathname === '/about') selectedValue = ABOUTMENU;
  else if (location.pathname === '/policies') selectedValue = POLICIESMENU;
  else if (location.pathname === '/announcements') selectedValue = ANNOUCEMENTS;
  else if (location.pathname === '/policies/privacy-policy') selectedValue = PRIVACYPOLICY;
  else if (location.pathname === '/policies/terms-of-service') selectedValue = TERMSOFSERVICE;
  else if (location.pathname === '/profile') selectedValue = PROFILE;
  else if (location.pathname === '/help') selectedValue = HELPHOME;
  else if (location.pathname === '/admin') selectedValue = ADMINPANEL;
  else if (location.pathname === '/') selectedValue = POSTSMENU;
  else if (location.pathname === '/contribute') selectedValue = CONTRIBUTE;
  else if (location.pathname === '/settings') selectedValue = SETTINGS;
  else selectedValue = '50';
  */

  const selectedValue = location.pathname === '/search' ? SEARCHMENU:
  location.pathname === '/saved-posts' ? SAVEDPOSTSMENU:
  location.pathname === '/my-posts' ? YOURPOSTSMENU:
  location.pathname === '/about' ? ABOUTMENU:
  location.pathname === '/policies' ? POLICIESMENU:
  location.pathname === '/announcements' ? ANNOUCEMENTS:
  location.pathname === '/policies/privacy-policy' ? PRIVACYPOLICY:
  location.pathname === '/policies/terms-of-service' ? TERMSOFSERVICE:
  location.pathname === '/help' ? HELPHOME:
  location.pathname === '/admin' ? ADMINPANEL: 
  location.pathname === '/contribute' ? CONTRIBUTE : POSTSMENU;

  return (
    <div className='root'>
      <NavDrawer
          className="nav"
          type="inline"
          open={isOpen}
          multiple={true}
          selectedValue={selectedValue}
        >
          <NavDrawerHeader>
            {isMobile && <Tooltip content="Close navigation" relationship='label'>
              <Hamburger onClick={() => setIsOpen(!isOpen)} />
            </Tooltip>}

            <div style={{ display: 'flex', gap: '8px' }}>
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <AppItem icon={<Person32Color />} as="a">
                    {session?.user?.name || session?.user?.email || "Guest"}
                  </AppItem>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    {session ? (
                      <>
                        <MenuItemLink icon={<PersonColor />} href='/profile'>Profile</MenuItemLink>
                        <MenuItemLink icon={<SettingsColor />} href='/settings'>Settings</MenuItemLink>
                        <MenuDivider />
                        <MenuItem icon={<ArrowExitRegular />} onClick={handleSignOut}>Sign Out</MenuItem>
                      </>
                    ) : (
                      <MenuItemLink href='/auth'>Sign In</MenuItemLink>
                    )}
                  </MenuList>
                </MenuPopover>
              </Menu>

              {session && <div style={{ marginLeft: 'auto', marginTop: 'auto', marginBottom: 'auto', display: 'flex', gap: '8px' }}><NotificationPanel /><AnnouncementPopover /></div>}
            </div>
          </NavDrawerHeader>

          <NavDrawerBody>
            <NavDivider />
            <NavSectionHeader>General</NavSectionHeader>
            <NavItem as="a" href="/" value={POSTSMENU} icon={<Home20Color />} onClick={() => isMobile && setIsOpen(false)}>
              Posts
            </NavItem>
            <NavItem as="a" href="/search" value={SEARCHMENU} icon={<SearchSparkle20Color />} onClick={() => isMobile && setIsOpen(false)}>
              Search
            </NavItem>
            <NavItem as='a' href="/saved/my-posts" value={YOURPOSTSMENU} icon={<ClipboardTextEdit20Color />} onClick={() => isMobile && setIsOpen(false)}>
              My Posts
            </NavItem>
            <NavDivider />
            <NavSectionHeader>Info</NavSectionHeader>
            <NavItem as='a' href='/about' value={ABOUTMENU} icon={<Info20Filled />} onClick={() => isMobile && setIsOpen(false)}>
              About Us
            </NavItem>
            <NavCategory value={POLICIESMENU}>
              <NavCategoryItem icon={<DocumentFolder20Color />} onClick={() => isMobile && setIsOpen(false)}>
                Policies
              </NavCategoryItem>
              <NavSubItemGroup>
                <NavSubItem as='a' href='/policies/privacy-policy' value={PRIVACYPOLICY} onClick={() => isMobile && setIsOpen(false)}>
                  Privacy Policy
                </NavSubItem>
                <NavSubItem as='a' href='/policies/terms-of-service' value={TERMSOFSERVICE} onClick={() => isMobile && setIsOpen(false)}>
                  Terms of Service
                </NavSubItem>
              </NavSubItemGroup>
            </NavCategory>
            <NavItem as='a' href='/help' value={HELPHOME} icon={<QuestionCircle20Color />} onClick={() => isMobile && setIsOpen(false)}>Help</NavItem>
            {isAdmin && (
              <>
                <NavDivider />
                <NavSectionHeader>Administration</NavSectionHeader>
                <NavItem as='a' href='/admin' value={ADMINPANEL} icon={<Shield20Color />} onClick={() => isMobile && setIsOpen(false)}>
                  Admin Panel
                </NavItem>
              </>
            )}
          </NavDrawerBody>
          <NavDrawerFooter style={{ marginBottom: '6px' }}>
            <NavItem as='a' href='/contribute' value={CONTRIBUTE} icon={<Code20Color/>}>Contribute</NavItem>
            <Tag shape='circular' appearance='brand'>App in beta</Tag>
          </NavDrawerFooter>
        </NavDrawer>
        <div className="content">
          <div className="hamburger-container" style={{ 
            display: (!isOpen || isMobile) ? 'block' : 'none' 
          }}>
            <Tooltip content={isOpen ? "Close navigation" : "Open navigation"} relationship='label'>
              <Hamburger onClick={() => setIsOpen(!isOpen)} />
            </Tooltip>
          </div>
          <div className="content-scroll">
            <Routes>
              <Route path="/" element={<Posts />} />
              <Route path="/search" element={<Search />} />
              <Route path="/saved/my-posts" element={<YourPosts />} />
              <Route path="/about" element={<About />} />
              <Route path='/post' element={<Post />} />
              <Route path='/policies/privacy-policy' element={<Privacy />} />
              <Route path='/policies/terms-of-service' element={<Terms />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/help' element={<HelpHome />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path='/contribute' element={<Contribute />} />
              <Route path='/settings' element={<Settings />} />
            </Routes>
          </div>
        </div>
        {isMobile && isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1,
            }}
          />
        )}
    </div>
  );
}

export default Home;