import Link from "next/link";
import {
  MapPin,
  Mail,
  Code2,
  Bot,
  Layers,
  Rocket,
  Palette,
  Link2,
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TownSquareWidget from "./components/Townsquarewidget";
import { GrArticle } from "react-icons/gr";

const skills = [
  { icon: Code2, label: "Software" },
  { icon: Bot, label: "Robotics" },
  { icon: Rocket, label: "Rockets" },
  { icon: Layers, label: "Systems" },
  { icon: Palette, label: "Art" },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <section className="space-y-8">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Burhan</h1>
            <p className="text-muted text-sm mt-1">Computer Scientist</p>
          </div>

          <p className="text-muted leading-relaxed max-w-xl">
            Building hardware and software with an emphasis on functional engineering. Interested in software, robotics, rocketry and art.
            {/* Currently working on <a href="https://inkle.me" className="hover:opacity-70 !text-pink-400 font-medium">
              inkle.me,
            </a>
         &nbsp;send me a Hi at <a href="mailto:burhan@inkle.me" className="hover:opacity-70 !text-blue-400 font-medium">
              burhan@inkle.me,
            </a>
             &nbsp;I would to hear from you! */}
          </p>

          <div className="flex flex-wrap gap-2">
            {skills.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-sm"
              >
                <Icon size={12} strokeWidth={1.5} className="text-muted" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 py-8 border-y">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1 border-r">
              <div className="flex items-center gap-1.5 text-muted">
                <MapPin size={12} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-wider">Location</span>
              </div>
              <p className="text-sm">Hyrule </p>
            </div>
            <div className="space-y-1 border-r">
              <div className="flex items-center gap-1.5 text-muted">
                <Mail size={12} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-wider">Contact</span>
              </div>
              <a href="mailto:burhan@inkle.me" className="text-sm hover:opacity-70">
                burhan@inkle.me
              </a>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <Link2 size={12} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-wider">Links</span>
              </div>
              <div className="flex gap-3 items-center mt-1">
            <Link
              href="/blog"
              className="flex items-center gap-1.5 text-sm hover:opacity-70"
              aria-label="Blog"
            >
              <GrArticle size={14} />
              Blog
            </Link>
          </div>
       
            </div>
          </div>
        </section>

        <section className="mt-12 pt-8">
        <div>
        <TownSquareWidget />
        </div>
        </section>
    
      </main>
      <Footer />
   
    </>
  );
}
