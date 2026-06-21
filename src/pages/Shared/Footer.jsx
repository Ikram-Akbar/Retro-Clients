import { Send, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#111113] text-[#a5a5ab] text-sm font-medium">
      {/* Top section: Main multi-column footer */}
      <div className="max-w-7xl mx-auto px-4 py-16 lg:px-8 grid gap-12 sm:grid-cols-2 md:grid-cols-4">
        
        {/* About Company */}
        <div className="space-y-4">
          <h4 className="text-white font-extrabold uppercase tracking-widest text-base pb-2 border-b border-white/5">About Company</h4>
          <ul className="space-y-3">
            <li><a href="/about" className="hover:text-amber-500 transition">About Us</a></li>
            <li><a href="/about" className="hover:text-amber-500 transition">Contact Us</a></li>
            <li><a href="/about" className="hover:text-amber-500 transition">Terms & Conditions</a></li>
            <li><a href="/about" className="hover:text-amber-500 transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Vehicle Type */}
        <div className="space-y-4">
          <h4 className="text-white font-extrabold uppercase tracking-widest text-base pb-2 border-b border-white/5">Vehicle Type</h4>
          <ul className="space-y-3">
            <li><a href="/browse-rental" className="hover:text-amber-500 transition">About Us</a></li>
            <li><a href="/browse-rental" className="hover:text-amber-500 transition">Contact Us</a></li>
            <li><a href="/browse-rental" className="hover:text-amber-500 transition">Terms & Conditions</a></li>
            <li><a href="/browse-rental" className="hover:text-amber-500 transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-white font-extrabold uppercase tracking-widest text-base pb-2 border-b border-white/5">Quick Links</h4>
          <ul className="space-y-3">
            <li><a href="/about" className="hover:text-amber-500 transition">Contact Us</a></li>
            <li><a href="/browse-rental" className="hover:text-amber-500 transition">Gallery</a></li>
            <li><a href="/about" className="hover:text-amber-500 transition">About Us</a></li>
            <li><a href="/about" className="hover:text-amber-500 transition">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Contact Info & Subscribe */}
        <div className="space-y-5">
          <h4 className="text-white font-extrabold uppercase tracking-widest text-base pb-2 border-b border-white/5">Contact Info</h4>
          
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-white/5 text-amber-500">
                <Phone size={16} />
              </span>
              <span className="text-slate-300 font-bold">+919600158844</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-white/5 text-amber-500">
                <Mail size={16} />
              </span>
              <span className="text-slate-300 font-bold">demo@example.com</span>
            </div>
          </div>

          {/* Email Subscription Box */}
          <form className="relative mt-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter Your Email Here"
              className="w-full bg-[#1b1b1e] border border-white/5 text-white text-xs px-4 py-3 rounded-xl placeholder-slate-500 outline-none transition focus:border-amber-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-600 transition cursor-pointer"
              aria-label="Subscribe"
            >
              <Send size={12} className="stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom section: social + copyright */}
      <div className="border-t border-white/5 py-8 bg-[#0a0a0b]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright */}
          <div className="text-xs text-slate-500 font-semibold">
            &copy; {new Date().getFullYear()} Rentro. All Rights Reserved.
          </div>

          {/* Connect with us (Social Links) */}
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">Connect with us</span>
            <div className="flex items-center gap-2">
              <a href="#" className="p-2.5 rounded-full bg-white/5 text-slate-400 hover:bg-blue-600 hover:text-white transition flex items-center justify-center">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V1h-3a4 4 0 00-4 4v3z"/></svg>
              </a>
              <a href="#" className="p-2.5 rounded-full bg-white/5 text-slate-400 hover:bg-pink-600 hover:text-white transition flex items-center justify-center">
                <svg className="h-3.5 w-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"/></svg>
              </a>
              <a href="#" className="p-2.5 rounded-full bg-white/5 text-slate-400 hover:bg-sky-500 hover:text-white transition flex items-center justify-center">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="p-2.5 rounded-full bg-white/5 text-slate-400 hover:bg-blue-700 hover:text-white transition flex items-center justify-center">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;