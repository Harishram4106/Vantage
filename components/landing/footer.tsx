import { Github, Linkedin, Mail, Twitter, CircleDotDashed } from "lucide-react";

const footerLinks = ["Platform", "Features", "Security", "Privacy", "Terms", "Contact"];

export function Footer() {
  return (
    <footer className="px-5 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[30px] border border-[#17141c]/8 bg-white/64 p-6 shadow-[0_20px_70px_rgba(31,27,45,0.07)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#17141c] text-white">
            <CircleDotDashed size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-[#17141c]">Vantage</p>
            <p className="text-sm text-[#17141c]/52">© 2026 Vantage Intelligence.</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <a key={link} href={link === "Platform" ? "#platform" : `#${link.toLowerCase()}`} className="text-sm font-medium text-[#17141c]/58 transition hover:text-[#17141c]">
              {link}
            </a>
          ))}
        </nav>

        <div className="flex gap-2">
          {[
            { label: "Email", icon: Mail },
            { label: "LinkedIn", icon: Linkedin },
            { label: "X", icon: Twitter },
            { label: "GitHub", icon: Github },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href="#top"
                aria-label={item.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#17141c]/8 bg-white/68 text-[#17141c]/62 transition hover:-translate-y-0.5 hover:text-[#17141c]"
              >
                <Icon size={17} aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
