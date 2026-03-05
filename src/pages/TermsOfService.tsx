import React from 'react';
import { motion } from 'motion/react';
import { FileText, CheckCircle, AlertCircle, Scale, CreditCard } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-indigo-900 p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <FileText className="w-64 h-64 rotate-12" />
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-4 relative z-10"
          >
            Terms of Service
          </motion.h1>
          <p className="text-indigo-200 text-lg relative z-10">Please read these terms carefully before using our services.</p>
        </div>
        
        <div className="p-8 md:p-12 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-indigo-500" />
              Acceptance of Terms
            </h2>
            <p>
              By accessing or using our website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-500" />
              Purchases & Payments
            </h2>
            <p className="mb-4">
              All purchases made through our platform are final. We accept various payment methods including bKash, Nagad, Rocket, and Upay.
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
              <li>Prices are subject to change without notice.</li>
              <li>You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.</li>
              <li>We reserve the right to refuse or cancel your order at any time for certain reasons including but not limited to: product or service availability, errors in the description or price of the product or service, error in your order or other reasons.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-indigo-500" />
              User Responsibilities
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-indigo-500" />
              Limitation of Liability
            </h2>
            <p>
              In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
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
