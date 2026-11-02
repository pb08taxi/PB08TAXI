import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Phone, 
  Copy, 
  Check, 
  Globe, 
  LineChart, 
  FileSpreadsheet, 
  Stethoscope, 
  Layers, 
  Sparkles, 
  Code2, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const DEVELOPER_PHONE = '+91 62841 98290';
const DEVELOPER_CLEAN_PHONE = '916284198290';

const SERVICES = [
  {
    id: 'trading',
    title: 'Trading Software, MT5 EA / Indicators',
    category: 'Fintech & Algorithmic Trading',
    icon: LineChart,
    badge: 'Algo Trading',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    desc: 'Automated MT4/MT5 Expert Advisors, Custom Indicators, Strategy Automation, Risk Managers & Webhook Alerts.',
    defaultMsg: 'Hi Deepak, I want to build Trading Software / MT5 EA / Custom Indicators. Please share details and pricing.'
  },
  {
    id: 'website',
    title: 'Website & Web Application',
    category: 'Full-Stack Web Development',
    icon: Globe,
    badge: 'Fast & SEO Ready',
    badgeColor: 'bg-taxi-yellow/20 text-taxi-yellow border-taxi-yellow/40',
    desc: 'Business Websites, Travel/Taxi Booking Portals, High-converting Landing Pages, E-commerce & Web Apps.',
    defaultMsg: 'Hi Deepak, I want to build a modern, high-speed Website / Web Application for my business. Please share details.'
  },
  {
    id: 'billing',
    title: 'Billing & Invoicing Software',
    category: 'Business & POS Systems',
    icon: FileSpreadsheet,
    badge: 'GST & Inventory',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    desc: 'Retail POS, Wholesale Invoicing, Barcode Billing, Multi-branch Inventory Tracking, GST Tax Reports & Thermal Printing.',
    defaultMsg: 'Hi Deepak, I need a custom Billing & Invoicing Software with inventory management. Please share details.'
  },
  {
    id: 'clinic',
    title: 'Clinic & Hospital Management Software',
    category: 'Healthcare Solutions',
    icon: Stethoscope,
    badge: 'Clinic / OPD',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
    desc: 'Doctor OPD appointments, patient history & electronic prescriptions, medical lab records, billing & WhatsApp reminders.',
    defaultMsg: 'Hi Deepak, I want to build a Clinic / Hospital Management System for patient records and doctor appointments.'
  },
  {
    id: 'custom_software',
    title: 'Custom Business Software & CRM',
    category: 'Enterprise Automation',
    icon: Layers,
    badge: 'Automation',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    desc: 'Tailor-made workflow software, automated dispatch systems, lead management CRMs, internal admin dashboards & SaaS.',
    defaultMsg: 'Hi Deepak, I need a Custom Software / CRM to automate my business operations. Please share details.'
  },
  {
    id: 'other',
    title: 'Other Software / Project Inquiry',
    category: 'Custom Project',
    icon: Sparkles,
    badge: '24/7 Available',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    desc: 'API integrations, mobile apps, bug fixes, database design, cloud deployment & technical consultations.',
    defaultMsg: 'Hi Deepak, I have a specific software project requirement and would like to discuss with you.'
  }
];

export default function DeveloperModal({ isOpen, onClose }) {
  const [selectedServiceId, setSelectedServiceId] = useState('trading');
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  // Close on ESC key & lock background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedService = SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(DEVELOPER_PHONE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const constructWhatsAppUrl = (service, note) => {
    let message = `Hi Deepak, I saw your work on PB08 TAXI.\n\n*Requirement:* ${service.title}\n*Details:* ${service.defaultMsg}`;
    if (note && note.trim()) {
      message += `\n*Additional Notes:* ${note.trim()}`;
    }
    message += `\n\nPlease let me know your timeline and quotation.`;
    return `https://wa.me/${DEVELOPER_CLEAN_PHONE}?text=${encodeURIComponent(message)}`;
  };

  const handleSendWhatsApp = () => {
    const url = constructWhatsAppUrl(selectedService, customNote);
    window.open(url, '_blank');
  };

  const handleServiceClickAndOpen = (service) => {
    setSelectedServiceId(service.id);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="developer-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-scale-up"
        style={{
          maxHeight: 'calc(100vh - 2rem)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Header Banner with Gradient Accent */}
        <div className="relative bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-5 sm:px-7 py-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-taxi-yellow to-amber-600 flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-taxi-yellow/20">
                D
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 flex items-center justify-center" title="Available for projects">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 id="developer-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Deepak
                </h3>
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Code2 className="w-3 h-3" />
                  <span>Lead Developer</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                Full-Stack, Algorithmic &amp; Custom Software Engineer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            aria-label="Close developer modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          
          {/* Direct Contact Action Bar */}
          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                  Official WhatsApp &amp; Calls
                </p>
                <a 
                  href={`tel:${DEVELOPER_CLEAN_PHONE}`}
                  className="text-base sm:text-lg font-black text-white hover:text-taxi-yellow transition-colors tracking-wide"
                >
                  {DEVELOPER_PHONE}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleCopyNumber}
                className="flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Copy phone number"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <a
                href={`tel:${DEVELOPER_CLEAN_PHONE}`}
                className="flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-taxi-yellow hover:text-yellow-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>

          {/* Section: Aap Kya Banwana Chahte Hain? */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                  <span>Aap kya banwana chahte hain?</span>
                  <span className="text-xs text-taxi-yellow font-normal">(Select Requirement)</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Neeche diye gaye option par click karein, WhatsApp message automatically generate ho jayega:
                </p>
              </div>
            </div>

            {/* Service Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SERVICES.map((service) => {
                const isSelected = selectedServiceId === service.id;
                const IconComponent = service.icon;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceClickAndOpen(service)}
                    className={`text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative ${
                      isSelected
                        ? 'bg-zinc-900 border-taxi-yellow shadow-lg shadow-taxi-yellow/10 ring-1 ring-taxi-yellow'
                        : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/90 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-taxi-yellow text-black' : 'bg-zinc-800 text-zinc-300 group-hover:text-taxi-yellow'
                        }`}>
                          <IconComponent className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${service.badgeColor}`}>
                            {service.badge}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-taxi-yellow fill-taxi-yellow text-black shrink-0" />
                          )}
                        </div>
                      </div>

                      <h5 className={`text-xs sm:text-sm font-bold leading-snug ${
                        isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'
                      }`}>
                        {service.title}
                      </h5>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {service.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-medium">Click to select</span>
                      <span className={`font-semibold flex items-center space-x-1 ${
                        isSelected ? 'text-taxi-yellow' : 'text-zinc-400 group-hover:text-zinc-300'
                      }`}>
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Message Box & Custom Note */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Auto-Generated WhatsApp Message Preview:</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                Direct to Deepak
              </span>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/90 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
              {`Hi Deepak, I saw your work on PB08 TAXI.\nRequirement: ${selectedService.title}\nDetails: ${selectedService.defaultMsg}${customNote ? `\nAdditional Notes: ${customNote}` : ''}`}
            </div>

            <div>
              <label htmlFor="dev-custom-note" className="text-[11px] font-medium text-zinc-400 block mb-1">
                Kuch khas requirement ya budget add karna chahte hain? (Optional):
              </label>
              <input
                id="dev-custom-note"
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Budget, timeline, ya specific features..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-taxi-yellow focus:ring-1 focus:ring-taxi-yellow"
              />
            </div>
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 bg-zinc-950/95 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-zinc-400 text-center sm:text-left">
            <span>Instant reply on WhatsApp • </span>
            <span className="text-zinc-200 font-semibold">+91 62841 98290</span>
          </div>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold px-6 py-3 rounded-full text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
            <span>Send "{selectedService.badge}" Message on WhatsApp</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
