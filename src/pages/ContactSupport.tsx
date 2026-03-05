import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, HelpCircle } from 'lucide-react';

interface ContactSupportProps {
  siteSettings: any;
}

export default function ContactSupport({ siteSettings }: ContactSupportProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to a backend
    alert('Thank you for contacting us! We will get back to you shortly.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Contact Info */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-indigo-900 text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <HelpCircle className="w-64 h-64 rotate-12" />
            </div>
            <h1 className="text-4xl font-black mb-6 relative z-10">Get in Touch</h1>
            <p className="text-indigo-200 text-lg mb-8 relative z-10">
              Have questions about your order or need assistance? Our support team is here to help 24/7.
            </p>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Phone Support</h3>
                  <p className="text-xl font-bold">{siteSettings.whatsapp}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Email Us</h3>
                  <p className="text-xl font-bold">support@{siteSettings.siteName.toLowerCase().replace(/\s/g, '')}.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Live Chat</h3>
                  <p className="text-xl font-bold">Available 24/7</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-4">FAQ</h3>
            <div className="space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-slate-700 group-open:text-indigo-600 transition-colors">
                  <span>How long does a top-up take?</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-slate-500 mt-3 group-open:animate-fadeIn text-sm leading-relaxed">
                  Most top-ups are processed instantly. However, in some cases, it might take up to 30 minutes depending on server load.
                </p>
              </details>
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-slate-700 group-open:text-indigo-600 transition-colors">
                  <span>What payment methods do you accept?</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-slate-500 mt-3 group-open:animate-fadeIn text-sm leading-relaxed">
                  We accept bKash, Nagad, Rocket, and Upay for seamless transactions.
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100"
        >
          <h2 className="text-3xl font-black text-slate-800 mb-2">Send a Message</h2>
          <p className="text-slate-500 mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Subject</label>
              <input 
                type="text" 
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Order Issue / General Inquiry"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Message</label>
              <textarea 
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="How can we help you today?"
              ></textarea>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
