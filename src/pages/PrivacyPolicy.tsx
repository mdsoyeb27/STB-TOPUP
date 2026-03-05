import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, Database, Server, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-indigo-900 p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Shield className="w-64 h-64 rotate-12" />
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-4 relative z-10"
          >
            Privacy Policy
          </motion.h1>
          <p className="text-indigo-200 text-lg relative z-10">Your privacy is our top priority. Learn how we protect your data.</p>
        </div>
        
        <div className="p-8 md:p-12 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-500" />
              Information We Collect
            </h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
              <li>Name, email address, and phone number.</li>
              <li>Transaction details and purchase history.</li>
              <li>Device information and IP address for security purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-indigo-500" />
              How We Use Your Information
            </h2>
            <p className="mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
              <li>Process your transactions and deliver services.</li>
              <li>Send you transaction confirmations and updates.</li>
              <li>Respond to your comments and questions.</li>
              <li>Monitor and analyze trends, usage, and activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-indigo-500" />
              Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-500" />
              Third-Party Services
            </h2>
            <p>
              We may use third-party services (such as payment gateways and analytics providers) that collect, monitor, and analyze this type of information in order to increase our service's functionality. These third-party service providers have their own privacy policies addressing how they use such information.
            </p>
          </section>
          
          <div className="pt-8 border-t border-slate-100 text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
