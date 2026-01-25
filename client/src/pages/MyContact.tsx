
import { motion } from "motion/react";
import { Rocket, LinkedinIcon, Github, MessageCircle, Mail, Send, MapPin } from "lucide-react";

function MyContact() {
  const contactMethods = [
    {
      title: "Portfolio",
      description: "Check out my work and projects",
      link: "https://alecam.dev",
      icon: <Rocket className="size-8" />,
      action: "Visit Site"
    },
    {
      title: "LinkedIn",
      description: "Connect professionally",
      link: "https://www.linkedin.com/in/alejandro-camayo-424850369/",
      icon: <LinkedinIcon className="size-8" />,
      action: "Connect"
    },
    {
      title: "GitHub",
      description: "Explore my code repositories",
      link: "https://github.com/alejunder",
      icon: <Github className="size-8" />,
      action: "View Profile"
    },
    {
      title: "WhatsApp",
      description: "Quick message or call",
      link: "https://wa.me/640660170",
      icon: <MessageCircle className="size-8" />,
      action: "Send Message"
    }
  ];

  return (
    <div className="min-h-screen px-4 md:px-16 lg:px-24 xl:px-32 py-20">
      <div className="relative max-w-6xl mx-auto">
        <div className="absolute top-30 -z-10 right-1/4 size-72 bg-red-600 blur-[300px]"></div>
        
        {/* Header */}
        <motion.div 
          className="text-center mt-20"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 rounded-full p-1 pr-4 mb-6 text-red-100 bg-red-200/15"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
          >
            <span className="bg-red-800 text-white text-xs px-3.5 py-1 rounded-full">
              Contact
            </span>
            <span className="text-sm">Let's Work Together</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get In <span className="text-red-500">Touch</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Have a project in mind? Want to collaborate? Or just want to say hi? 
            I'd love to hear from you. Choose your preferred way to connect.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {contactMethods.map((method, index) => (
            <motion.a
              key={index}
              href={method.link}
              target="_blank"
              rel="noreferrer"
              className="group relative p-8 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-red-600 hover:bg-slate-900/50 transition-all duration-300 overflow-hidden"
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 280, damping: 70, mass: 1 }}
            >
              <div className="absolute -right-10 -top-10 size-32 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all"></div>
              
              <div className="relative">
                <div className="text-red-500 mb-4 group-hover:scale-110 transition-transform">
                  {method.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {method.title}
                </h3>
                <p className="text-slate-400 mb-6">
                  {method.description}
                </p>
                <div className="flex items-center gap-2 text-red-500 font-medium">
                  <span>{method.action}</span>
                  <Send className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Direct Contact Info */}
        <motion.div 
          className="mt-16 p-8 rounded-2xl border border-slate-800 bg-slate-950/30"
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="size-5 text-red-500" />
                My certifications
              </h3>
              <a href="https://www.alecam.dev/certificaciones" className="text-slate-300 hover:text-red-400 transition-colors">
                See here
              </a>
              <p className="text-slate-500 text-sm mt-2">
                For business inquiries and collaborations
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="size-5 text-red-500" />
                Location
              </h3>
              <p className="text-slate-300">
                Remote / Mallorca
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Open to remote opportunities and collaborations
              </p>
            </div>
          </div>
        </motion.div>

        {/* Response Time */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-slate-400 text-sm">
            💡 <span className="text-slate-300">Average response time:</span> Within 24 hours
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default MyContact
