import { GlobeIcon, MenuIcon, XIcon, ZapIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import {  Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import logo from "../assets/copilot4yt-removebg.png";

export default function Navbar() {
    const { isLoggedIn, isLoading, user, logout, credits, plan, planExpiresAt } = useAuth();
    const { locale, changeLocale, t } = useTranslation();

    const daysLeft = planExpiresAt && plan !== 'free'
        ? Math.max(0, Math.ceil((planExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <motion.nav className="fixed top-0 z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
            >
                <Link to="/">
                    <img src={logo} alt="logo" className="h-24 w-auto" />
                </Link>

                <div className="hidden md:flex items-center gap-8 transition duration-500">
                    <Link to="/" className="hover:text-red-500 transition">{t('nav.home')}</Link>
                    <Link to="/generate" className="hover:text-red-500 transition">{t('nav.generate')}</Link>
                    {
                        isLoggedIn ?<Link to="/my-generation" className="hover:text-red-500 transition">{t('nav.myGenerations')}</Link>
                        : <Link to="/about" className="hover:text-red-500 transition">{t('nav.about')}</Link>                     
                    }                  
                    <Link to="/contact" className="hover:text-red-500 transition">{t('nav.contact')}</Link>
                </div>
                
                <div className="flex items-center gap-2">
                    {isLoading ? (
                        // Auth check in progress — render nothing to avoid flash of "Get Started"
                        <div className="hidden md:block w-28 h-9" />
                    ) : isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            {credits !== null && (
                                <span className="hidden md:flex items-center gap-1 text-sm text-yellow-400 font-medium">
                                    <ZapIcon className="size-3.5 fill-yellow-400" />
                                    {credits} {t('common.credits')}
                                </span>
                            )}
                            <div className="relative group">
                                <button className="rounded-full size-8 bg-white/20 border-2 border-white/10">
                                    {user?.name.charAt(0).toUpperCase()}
                                </button>
                                <div className="absolute hidden group-hover:block top-6 right-0 pt-4">
                                    <div className="bg-white/10 backdrop-blur border border-white/10 rounded-lg overflow-hidden min-w-[160px]">
                                        {plan && (
                                            <div className="px-4 py-2.5 border-b border-white/10">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                                                    plan === 'enterprise' ? 'bg-purple-500/30 text-purple-300' :
                                                    plan === 'pro'        ? 'bg-amber-500/30 text-amber-300' :
                                                    plan === 'basic'      ? 'bg-blue-500/30 text-blue-300' :
                                                    'bg-white/20 text-white/60'
                                                }`}>{plan}</span>
                                                {daysLeft !== null && (
                                                    <p className={`text-xs font-medium mt-1 ${daysLeft <= 5 ? 'text-red-400' : 'text-white/50'}`}>
                                                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                                    </p>
                                                )}
                                                {planExpiresAt && plan !== 'free' && (
                                                    <p className="text-xs text-white/40 mt-0.5">
                                                        Until {planExpiresAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition">
                                            {t('nav.logout')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="hidden md:block px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all rounded-full">
                            {t('nav.getStarted')}
                        </button>
                    )}
                    {/* Language toggle — desktop: visible; mobile: visible beside hamburger */}
                    <button
                        onClick={() => changeLocale(locale === 'en' ? 'es' : 'en')}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border border-white/20 hover:border-white/50 hover:bg-white/10 active:scale-95 transition-all"
                        aria-label="Toggle language"
                    >
                        <GlobeIcon size={13} />
                        {locale}
                    </button>
                    <button onClick={() => setIsOpen(true)} className="md:hidden">
                        <MenuIcon size={26} className="active:scale-90 transition" />
                    </button>
                </div>
            </motion.nav>

            <div className={`fixed inset-0 z-100 bg-black/40 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-400 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <Link to="/" onClick={() => setIsOpen(false)} >{t('nav.home')}</Link>
                <Link to="/generate" onClick={() => setIsOpen(false)} >{t('nav.generate')}</Link>
                { isLoggedIn ? <Link to="/my-generation" onClick={() => setIsOpen(false)} >{t('nav.myGenerations')}</Link>
                 : <Link to="/about" onClick={() => setIsOpen(false)} >{t('nav.about')}</Link> 
                }            
                <Link to="/contact" onClick={() => setIsOpen(false)} >{t('nav.contact')}</Link>
                {!isLoading && (isLoggedIn ? 
                  <button onClick={() => { logout(); setIsOpen(false); }} className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center hover:bg-red-700 transition text-white rounded-md flex">
                    {t('nav.logout')}
                  </button>
                  :
                  <Link to="/login" onClick={() => setIsOpen(false)} >{t('nav.login')}</Link>
                )}
                {isLoggedIn && (
                    <div className="flex flex-col items-center gap-1.5 text-center">
                        {credits !== null && (
                            <span className="flex items-center gap-1.5 text-sm text-yellow-400 font-medium">
                                <ZapIcon className="size-3.5 fill-yellow-400" />
                                {credits} credits
                            </span>
                        )}
                        {plan && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                                plan === 'enterprise' ? 'bg-purple-500/30 text-purple-300' :
                                plan === 'pro'        ? 'bg-amber-500/30 text-amber-300' :
                                plan === 'basic'      ? 'bg-blue-500/30 text-blue-300' :
                                'bg-white/20 text-white/60'
                            }`}>{plan}</span>
                        )}
                        {daysLeft !== null && (
                            <span className={`text-xs font-medium ${daysLeft <= 5 ? 'text-red-400' : 'text-white/50'}`}>
                                {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                            </span>
                        )}
                        {planExpiresAt && plan !== 'free' && (
                            <span className="text-xs text-white/40">
                                Until {planExpiresAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                )}
                {/* Language toggle — mobile menu bottom */}
                <button
                    onClick={() => changeLocale(locale === 'en' ? 'es' : 'en')}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wide border border-white/20 hover:border-white/50 hover:bg-white/10 active:scale-95 transition-all"
                    aria-label="Toggle language"
                >
                    <GlobeIcon size={15} />
                    {locale === 'en' ? 'English' : 'Español'}
                </button>
                <button onClick={() => setIsOpen(false)} className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-red-600 hover:bg-red-700 transition text-white rounded-md flex">
                    <XIcon />
                </button>
            </div>
        </>
    );
}