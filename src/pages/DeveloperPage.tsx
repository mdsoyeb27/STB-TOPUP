import React from 'react';
import { motion } from 'motion/react';
import { 
  Code, 
  Server, 
  Database, 
  Layout, 
  Cpu, 
  Globe, 
  Shield, 
  Zap, 
  Terminal, 
  GitBranch,
  Coffee,
  ExternalLink,
  Github,
  Linkedin,
  Mail
} from 'lucide-react';

interface DeveloperPageProps {
  siteSettings: any;
}

export default function DeveloperPage({ siteSettings }: DeveloperPageProps) {
  const skills = [
    { name: 'React.js', icon: <Code className="w-5 h-5" />, level: 95, color: 'bg-cyan-400' },
    { name: 'Node.js', icon: <Server className="w-5 h-5" />, level: 90, color: 'bg-green-500' },
    { name: 'Firebase', icon: <Database className="w-5 h-5" />, level: 85, color: 'bg-yellow-500' },
    { name: 'Tailwind CSS', icon: <Layout className="w-5 h-5" />, level: 98, color: 'bg-sky-400' },
    { name: 'TypeScript', icon: <Cpu className="w-5 h-5" />, level: 88, color: 'bg-blue-600' },
    { name: 'Next.js', icon: <Globe className="w-5 h-5" />, level: 92, color: 'bg-black' },
  ];

  const features = [
    { title: 'High Performance', desc: 'Optimized for speed and efficiency.', icon: <Zap className="w-6 h-6 text-yellow-400" /> },
    { title: 'Secure System', desc: 'Advanced encryption and data protection.', icon: <Shield className="w-6 h-6 text-emerald-400" /> },
    { title: 'Modern UI/UX', desc: 'Clean, intuitive, and responsive design.', icon: <Layout className="w-6 h-6 text-purple-400" /> },
    { title: 'Real-time Updates', desc: 'Live data synchronization.', icon: <Database className="w-6 h-6 text-blue-400" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 pb-12 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-cyan-600/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-sm font-medium">
              <Terminal className="w-4 h-4" />
              <span>Full Stack Developer</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Digital</span> Experiences
            </h1>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl">
              {siteSettings.developerDescription || "Crafting robust, scalable, and beautiful web applications with modern technologies. Passionate about clean code and user-centric design."}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              {siteSettings.developerLink && (
                <a 
                  href={siteSettings.developerLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-all flex items-center gap-2 group"
                >
                  View Portfolio
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
              <button className="px-8 py-4 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Me
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl relative z-10 bg-slate-800">
              <img 
                src={siteSettings.developerImage || "https://ui-avatars.com/api/?name=Dev&background=random&size=512"} 
                alt="Developer" 
                className="w-full h-full object-cover"
              />
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center gap-3 shadow-lg"
              >
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-300 font-medium">Experience</div>
                  <div className="text-lg font-bold text-white">5+ Years</div>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative Elements behind image */}
            <div className="absolute -top-6 -right-6 w-full h-full border-2 border-indigo-500/30 rounded-[3rem] z-0"></div>
            <div className="absolute -bottom-6 -left-6 w-full h-full border-2 border-purple-500/30 rounded-[3rem] z-0"></div>
          </motion.div>
        </div>

        {/* Skills Section */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-indigo-400" />
              Tech Stack
            </h2>
            <div className="h-px bg-slate-800 flex-1 ml-8"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <motion.div 
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${skill.color} bg-opacity-20 text-white`}>
                      {skill.icon}
                    </div>
                    <span className="font-bold text-lg">{skill.name}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-sm">{skill.level}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full ${skill.color}`}
                  ></motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-center hover:bg-slate-800 transition-colors"
            >
              <div className="w-14 h-14 mx-auto bg-slate-950 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-slate-800">
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer Credit */}
        <div className="text-center border-t border-slate-800 pt-12">
          <p className="text-slate-500 flex items-center justify-center gap-2">
            Made with <Coffee className="w-4 h-4 text-amber-500" /> by <span className="text-white font-bold">{siteSettings.developerName || "Developer"}</span>
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}
