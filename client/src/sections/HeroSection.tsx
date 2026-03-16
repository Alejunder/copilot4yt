'use client'
import { CheckIcon, ChevronRightIcon, BriefcaseBusiness } from "lucide-react";
import TiltedImage from "../components/TiltImage";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImage from "../assets/copilotheader.jpg";
import { useTranslation } from "../hooks/useTranslation";

export default function HeroSection() {

    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const { t } = useTranslation();
    const specialFeatures = [t('hero.feature1'), t('hero.feature2'), t('hero.feature3')];

    return (
        <div className="relative flex flex-col items-center justify-center px-4 md:px-16 lg:px-24 xl:px-32">
            <div className="absolute top-30 -z-10 left-1/4 size-72 bg-red-600 blur-[300px]"></div>
           <motion.a 
                href={isLoggedIn ? "/generate" : "/login"} 
                className="group flex items-center gap-2 rounded-full p-1 pr-3 mt-44 text-red-100 bg-red-200/15"
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                <span className="bg-red-800 text-white text-md px-3.5 py-1 rounded-full">
                    {isLoggedIn ? t('hero.badgeLoggedIn') : t('hero.badgeGuest')}
                </span>
                <p className="flex items-center gap-1">
                    <span>{t('hero.badgeText')}</span>
                    <ChevronRightIcon size={16} className="group-hover:translate-x-0.5 transition duration-300" />
                </p>
            </motion.a>
            <motion.div className="mt-8 relative max-w-5xl mx-auto"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
            >
                <img 
                    src={heroImage} 
                    alt="Copilot4YT - AI Thumbnail Generator" 
                    className="w-full h-auto rounded-3xl shadow-2xl"
                    style={{
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)'
                    }}
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none"></div>
            </motion.div>
            <motion.p className="text-base text-center text-slate-200 max-w-lg mt-6"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                {t('hero.description')}</motion.p>
            <motion.div className="flex items-center gap-4 mt-8"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                <button onClick={() => navigate('/generate')} className="bg-red-600 hover:bg-red-700 text-white rounded-full px-7 h-11">
                    {t('hero.generateButton')}
                </button>
                <button onClick={() => window.location.href = 'https://alecam.dev'} className="flex items-center gap-2 border border-red-900 hover:bg-red-950/50 transition rounded-full px-6 h-11">
                    <BriefcaseBusiness strokeWidth={1} />
                    <span>{t('hero.seeHowButton')}</span>
                </button>
            </motion.div>

            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-14 mt-12">
                {specialFeatures.map((feature, index) => (
                    <motion.p className="flex items-center gap-2" key={index}
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.3 }}
                    >
                        <CheckIcon className="size-5 text-red-600" />
                        <span className="text-slate-400">{feature}</span>
                    </motion.p>
                ))}
            </div>
            <TiltedImage />
        </div>
    );
}