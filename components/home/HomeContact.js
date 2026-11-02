import { MessageSquare } from "lucide-react";
import Image from "next/image"; // 1. Next.js ka Image component import kiya

export default function HomeContact() {
  return (
    <>
      {/* Advertisement Banner (Flickering Fixed) */}
      <div className="w-full relative overflow-hidden rounded-2xl aspect-[16/6] bg-slate-100"> 
        {/* 'aspect-ratio' aur 'relative' dene se browser ko pehle se pata hota hai ki kitni jagah leni hai, jisse flick nahi hota */}
        <Image
          src="/images/cricketline.jpg"
          alt="Advertisement"
          fill
          priority={true} // Page load hote hi sabse pehle image fetch hogi
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-contain"
        />
      </div>
      
      <section className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row items-center sm:justify-between gap-4 backdrop-blur-md mt-4">

        <div className="flex items-center gap-4 w-full sm:w-auto">

          <div className="bg-emerald-50 w-11 h-11 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0 shadow-sm">
            <MessageSquare size={18} />
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Direct Enterprise Support
            </h3>

            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Connect instantly via WhatsApp for customized platform integrations.
            </p>
          </div>

        </div>

        <a
          href="https://wa.me/+919937606890?text=Hi%20OKCRICK%2C%20I%20want%20to%20start%20live%20scoring"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide transition-all shadow-sm"
        >
          Chat on WhatsApp
        </a>

      </section>
    </>
  );
}
