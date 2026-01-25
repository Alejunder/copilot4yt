
import { motion } from "motion/react";
import { Music2, LinkedinIcon, Disc3, Rocket, Code2, Sparkles, Heart, Zap } from "lucide-react";
import copilot4ytLogo from '../assets/copilot4yt.svg';

function About() {
  const skills = [
    { icon: <Code2 className="size-5" />, text: "Full-Stack Development" },
    { icon: <Sparkles className="size-5" />, text: "AI Integration" },
    { icon: <Zap className="size-5" />, text: "Performance Optimization" },
    { icon: <Heart className="size-5" />, text: "User Experience" },
  ];

  const projects = [
    {
      name: "MoodBeats Hub",
      description: "Music platform with curated playlists for every mood",
      link: "https://mood-beats-hub.vercel.app",
      icon: <Music2 className="size-6" />
    },
    {
      name: "LinkedIn Profile",
      description: "Professional network and career highlights",
      link: "https://www.linkedin.com/in/alejandro-camayo-424850369/",
      icon: <LinkedinIcon className="size-6" />
    },
    {
      name: "Portfolio",
      description: "Personal portfolio showcasing projects and skills",
      link: "https://alecam.dev",
      icon: <Rocket className="size-6" />
    }
  ];

  return (
    <div className="min-h-screen px-4 md:px-16 lg:px-24 xl:px-32 py-20">
      <div className="relative max-w-6xl mx-auto">
        <div className="absolute top-30 -z-10 left-1/4 size-72 bg-red-600 blur-[300px]"></div>
        
        {/* Hero Section */}
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-12 mt-20"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          <div className="flex-1">
            <motion.div 
              className="inline-flex items-center gap-2 rounded-full p-1 pr-4 mb-6 text-red-100 bg-red-200/15"
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
              <span className="bg-red-800 text-white text-xs px-3.5 py-1 rounded-full">
                About Me
              </span>
              <span className="text-sm">Developer & Creator</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Hi, I'm <span className="text-red-500">Alejandro Camayo</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              Full-stack developer focused on enhancing projects. 
              I built <span className="text-red-400 font-semibold">Copilot4YT</span> to help YouTubers 
              generate stunning thumbnails with AI, because every creator deserves professional-looking content.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Making every customer feel valued—no matter the size of your audience. 
              I believe in building products that are accessible, powerful, and delightful to use.
            </p>
          </div>
          
          <motion.div 
            className="flex-shrink-0"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring", stiffness: 240, damping: 70, mass: 1 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/30 blur-3xl rounded-full"></div>
              <img 
                src={copilot4ytLogo} 
                alt="Copilot4YT Logo" 
                className="relative size-48 md:size-64 rounded-3xl"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Skills Section */}
        <motion.div 
          className="mt-24"
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-8">What I Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-red-800 transition-colors"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
              >
                <div className="text-red-500">{skill.icon}</div>
                <span className="text-slate-300 text-sm">{skill.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Projects Section */}
        <motion.div 
          className="mt-24"
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-8">Other Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.a
                key={index}
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="group p-6 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-red-800 hover:bg-slate-900/50 transition-all duration-300"
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, type: "spring", stiffness: 280, damping: 70, mass: 1 }}
              >
                <div className="text-red-500 mb-4 group-hover:scale-110 transition-transform">
                  {project.icon}
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-red-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-slate-400 text-sm">
                  {project.description}
                </p>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Connect Section */}
        <motion.div 
          className="mt-24 text-center"
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Let's Connect</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Interested in collaborating or just want to say hi? Feel free to reach out through any of these platforms.
          </p>
          <div className="flex justify-center items-center gap-6">
            <motion.a 
              href="https://mood-beats-hub.vercel.app" 
              target="_blank" 
              rel="noreferrer"
              className="p-4 rounded-full border border-slate-800 bg-slate-950 hover:border-red-600 hover:bg-red-950/20 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Music2 className="size-6 text-slate-300 hover:text-red-500" />
            </motion.a>
            <motion.a 
              href="https://www.linkedin.com/in/alejandro-camayo-424850369/" 
              target="_blank" 
              rel="noreferrer"
              className="p-4 rounded-full border border-slate-800 bg-slate-950 hover:border-red-600 hover:bg-red-950/20 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <LinkedinIcon className="size-6 text-slate-300 hover:text-red-500" />
            </motion.a>
            <motion.a 
              href="https://alecam.dev" 
              target="_blank" 
              rel="noreferrer"
              className="p-4 rounded-full border border-slate-800 bg-slate-950 hover:border-red-600 hover:bg-red-950/20 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Rocket className="size-6 text-slate-300 hover:text-red-500" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default About
