import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-indigo-900 p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <RefreshCcw className="w-64 h-64 rotate-12" />
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-4 relative z-10"
          >
            Refund Policy
          </motion.h1>
          <p className="text-indigo-200 text-lg relative z-10">We strive for your satisfaction. Here's how our refund process works.</p>
        </div>
        
        <div className="p-8 md:p-12 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-indigo-500" />
              Eligibility for Refunds
            </h2>
            <p className="mb-4">
              Refunds are generally not provided for digital goods once the order has been completed and the product has been delivered. However, exceptions may be made in the following cases:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
              <li>The product was not delivered within the specified time frame (usually 24 hours).</li>
              <li>The product delivered was incorrect or defective.</li>
              <li>A technical error resulted in a double charge.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-500" />
              Refund Process
            </h2>
            <p>
              To request a refund, please contact our support team within 24 hours of the transaction. You will need to provide your Order ID and a detailed explanation of the issue.
            </p>
            <p className="mt-2">
              Once approved, refunds will be processed to your original payment method or as store credit within 3-5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-indigo-500" />
              Non-Refundable Items
            </h2>
            <p>
              Please note that certain items are non-refundable, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
              <li>Gift cards and vouchers once redeemed.</li>
              <li>Account top-ups where the user provided an incorrect Player ID.</li>
              <li>Services that have already been fully rendered.</li>
            </ul>
          </section>
          
          <div className="pt-8 border-t border-slate-100 text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
