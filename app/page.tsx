import Link from "next/link";
import {
  MapPin,
  Mail,
  ArrowUpRight,
  Code2,
  Bot,
  Layers,
  ExternalLink,
  RssIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Header from "./components/Header";
import Footer from "./components/Footer";

const skills = [
  { icon: Code2, label: "Software" },
  { icon: Bot, label: "Robotics" },
  { icon: Layers, label: "Systems" },
];

const projects = [
  {
    name: "Inkle",
    description: "Tiny e-commerce platform for small creators",
    tags: ["Web", "SaaS"],
    year: "2024",
    link: "https://inkle.me",
  },
  {
    name: "Townhall",
    description: "Hyperlocal social network for neighborhoods and communities",
    tags: ["Mobile", "App"],
    year: "2022",
    link: "https://townhall.ae",
  },
  {
    name: "Kyoshi",
    description: "AI-powered talent aquisition platform for companies and job seekers",
    tags: ["Web", "SaaS"],
    year: "2025",
    link: "https://kyoshi.me",
  },
  {
    name: "Eggbot",
    description: "An open-source, low-cost, desktop egg robot powered by ESP32",
    tags: ["Hardware", "Robotics"],
    year: "2024",
    link: "",
  }
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <section className="space-y-8">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Burhan Amjad</h1>
            <p className="text-muted text-sm mt-1">Computer Scientist & Designer</p>
          </div>

          <p className="text-muted leading-relaxed max-w-xl">
            Building functional hardware and software. Focused on performance,
            accessibility, and clean code. Currently working on <a href="https://inkle.me" className="hover:opacity-70 underline decoration-dotted text-pink-500">
              inkle.me
            </a>
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

        <section className="mt-12 pt-8 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <MapPin size={12} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-wider">Location</span>
              </div>
              <p className="text-sm">Hyrule </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <Mail size={12} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-wider">Contact</span>
              </div>
              <a href="mailto:burhan@example.com" className="text-sm hover:opacity-70">
                burhan@inkle.me
              </a>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <ExternalLink size={12} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-wider">Social</span>
              </div>
              <div className="flex gap-3 items-center mt-1">
            <a
              href="https://github.com/azrael07"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:opacity-70"
              aria-label="GitHub"
            >
              <FaGithub size={14} />
            </a>
            <Link
              href="/blog"
              className="text-sm hover:opacity-70"
              aria-label="Blog RSS"
            >
              <RssIcon size={14} />
            </Link>
          </div>
       
            </div>
          </div>
        </section>

        <section className="mt-12 pt-8 border-t">
          <h2 className="text-xs uppercase tracking-widest text-muted mb-6">
            Work
          </h2>
          <div className="space-y-0">
            {projects.map((project) => (
              <a
                key={project.name}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block py-4 border-b last:border-b-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium group-hover:opacity-70">
                        {project.name}
                      </h3>
                      <ArrowUpRight
                        size={12}
                        strokeWidth={1.5}
                        className="opacity-0 group-hover:opacity-70 transition-opacity"
                      />
                    </div>
                    <p className="text-muted text-xs">{project.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted uppercase tracking-wider">
                        {project.tags.join(" / ")}
                      </span>
                      <span className="text-[10px] text-muted">
                        — {project.year}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
   
    </>
  );
}
