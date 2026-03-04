import React, { useEffect, useMemo, useRef, useState } from "react";
import { Monitor, Smartphone, Search, Server, Globe, ShoppingBag } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function Landing() {




  const BRAND = "#E10600";
  const WHATSAPP_NUMBER = "94773263191";
  const PHONE_DISPLAY = "+94 77 326 3191";
  //const EMAIL = "";
  const ADDRESS = "Address-No.173,Yakkala Park, Yakkala";
  const HOURS = "Mon–Sat 9:00 AM – 6:00 PM";

  // ✅ IMPORTANT: Vite-safe base (works in dev + production + sub-folder hosting)
  const BASE = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");
  const publicUrl = (p) => `${BASE}${String(p).replace(/^\/+/, "")}`;

  const slides = useMemo(
    () => [
      publicUrl("slides/hero-1.webp"),
      publicUrl("slides/hero-2.webp"),
      publicUrl("slides/hero-3.webp"),
      publicUrl("slides/hero-4.webp"),
    ],
    [BASE]
  );

  const navLinks = useMemo(
    () => [
      { label: "Home", href: "#top" },
      { label: "Services", href: "#services" },
      { label: "Contact", href: "#contact" },
    ],
    []
  );

  const services = useMemo(
    () => [
      {
        title: "Website Design & Development",
        desc: "Modern, high-converting websites that build trust and turn visitors into inquiries.",
        icon: "web",
      },
      {
        title: "Mobile-First Responsive Design",
        desc: "Perfect experience on mobile, tablet, and desktop—fast, clean, and easy to use.",
        icon: "mobile",
      },
      {
        title: "SEO Setup & Optimization",
        desc: "Technical + on-page SEO foundation to help you rank better and get more leads.",
        icon: "seo",
      },
      {
        title: "Fast & Secure Hosting",
        desc: "Reliable hosting with SSL, backups, speed optimization, and uptime monitoring.",
        icon: "hosting",
      },
      {
        title: "Domain & DNS Management",
        desc: "Domain registration, DNS setup, renewals, and professional email routing handled for you.",
        icon: "domain",
      },
      {
        title: "E-commerce Solutions",
        desc: "Online stores with product setup, order management, and payment-ready checkout flows.",
        icon: "cart",
      },
    ],
    []
  );

  function ServiceIcon({ name, className = "h-6 w-6" }) {
    const common = { className, strokeWidth: 1.8 };

    switch (name) {
      case "web":
        return <Monitor {...common} />;
      case "mobile":
        return <Smartphone {...common} />;
      case "seo":
        return <Search {...common} />;
      case "hosting":
        return <Server {...common} />;
      case "domain":
        return <Globe {...common} />;
      case "cart":
        return <ShoppingBag {...common} />;
      default:
        return null;
    }
  }

  // ---------- Slideshow ----------
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    slides.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [slides]);

  useEffect(() => {
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  // ---------- Sticky navbar blur/shadow ----------
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---------- Scroll reveal ----------
  const revealRootRef = useRef(null);
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ---------- Contact form ----------
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ reCAPTCHA state
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef(null);

  // ✅ Load reCAPTCHA script once
  useEffect(() => {
    if (document.querySelector('script[src^="https://www.google.com/recaptcha/api.js"]')) return;

    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js";
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  // ✅ Global callbacks for reCAPTCHA v2
  useEffect(() => {
    window.__onRecaptchaSuccess = (token) => setCaptchaToken(token);
    window.__onRecaptchaExpired = () => setCaptchaToken("");

    return () => {
      delete window.__onRecaptchaSuccess;
      delete window.__onRecaptchaExpired;
    };
  }, []);

  function validate(next) {
    const e = {};

    // name: only letters + single spaces, no numbers, no only-spaces
    const name = next.name.trim();
    if (!name) e.name = "Full name is required.";
    else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name))
      e.name = "Name must contain only letters (no numbers) and single spaces.";

    // phone: Sri Lanka +94 / 0xxxxxxxxx validation
    const phone = next.phone.trim().replace(/\s+/g, "");
    if (!phone) e.phone = "Phone / WhatsApp is required.";
    else if (!/^(\+94|0)\d{9}$/.test(phone))
      e.phone = "Enter a valid phone number (ex: +94771234567 or 0771234567).";

    // email
    const email = next.email.trim();
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address.";

    if (!next.service.trim()) e.service = "Please select a service.";
    if (!next.message.trim()) e.message = "Please add a short message.";

    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setSubmitted(false);

    const e = validate(form);

    // ✅ captcha validation
    if (!captchaToken) e.captcha = "Please verify that you are not a robot.";

    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);

    // ✅ IMPORTANT: verify captcha in backend for real security
    await new Promise((r) => setTimeout(r, 700));

    setSubmitting(false);
    setSubmitted(true);
    setForm({ name: "", phone: "", email: "", service: "", message: "" });

    setCaptchaToken("");
// ✅ Reset Google reCAPTCHA v2 widget
function resetCaptcha() {
  try {
    // Check if grecaptcha is loaded and the ref exists
    if (window.grecaptcha && captchaRef.current) {
      window.grecaptcha.reset(); // Reset the widget
      setCaptchaToken("");       // Clear token in state
    }
  } catch (error) {
    console.error("Failed to reset reCAPTCHA:", error);
  }
}
    // reset widget UI
    resetCaptcha();
  }
<ReCAPTCHA
  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
  onChange={setCaptchaToken}
/>
  return (
    
    <div ref={revealRootRef} className="min-h-screen bg-white text-neutral-900">
      <style>{`
      /* Navbar hover effect */
.nav-link-hover {
  position: relative;
  display: inline-block;
  transition: color 0.3s ease;
}

.nav-link-hover::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -2px; /* distance from text */
  transform: translateX(-50%) scaleX(0);
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background-color: #E10600; /* professional red */
  transition: transform 0.3s ease;
  transform-origin: center;
}

.nav-link-hover:hover::after {
  transform: translateX(-50%) scaleX(1);
}

.nav-link-hover:hover {
  color: #E10600; /* optional: text turns red on hover */
}
      .btn-shadow-hover {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-shadow-hover::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(225, 6, 0, 0.15); /* subtle professional red overlay */
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
  transform: scale(1.1);
}

.btn-shadow-hover:hover::after {
  opacity: 1;
  transform: scale(1); /* creates “shimmer/pulse overlay” */
}

.btn-shadow-hover:hover {
  transform: translateY(-2px); /* optional lift effect */
  box-shadow: 0 12px 40px rgba(225, 6, 0, 0.25); /* professional red shadow */
}
        .reveal{opacity:0;transform:translateY(10px);transition:opacity .7s ease,transform .7s ease}
        .reveal.is-visible{opacity:1;transform:translateY(0)}
        .reveal-delay-1{transition-delay:.12s}
        .reveal-delay-2{transition-delay:.24s}

        .hero-water{position:absolute;inset:0;overflow:hidden}
        .hero-water:before{
          content:"";position:absolute;inset:-20%;
          background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.18), transparent 42%),
                      radial-gradient(circle at 80% 60%, rgba(255,255,255,.12), transparent 45%);
          opacity:0;transition:opacity .35s ease;pointer-events:none;
        }
        .hero-water:hover:before{opacity:1;animation:waterMove 1.2s ease-in-out infinite alternate}
        @keyframes waterMove{from{transform:translate(-10px,-10px)}to{transform:translate(10px,10px)}}

     .kenburns{
  animation:kenburns 10s ease-in-out infinite alternate;
  will-change:transform;
}

@keyframes kenburns{
  from{transform:scale(1)}
  to{transform:scale(1.01)}
}

        .whatsapp-pulse{
          position:absolute; inset:-10px; border-radius:999px;
          background: rgba(37,211,102,.18);
          animation: pulse 1.8s ease-out infinite;
        }
        @keyframes pulse{
          0%{transform:scale(.78);opacity:.9}
          70%{transform:scale(1.18);opacity:0}
          100%{transform:scale(1.18);opacity:0}
        }
        .hero-title, .hero-sub{
          text-shadow: 0 12px 35px rgba(0,0,0,.70);
        }
        .hero-card{
          background: rgba(10,10,10,0.70);
          border: 1px solid rgba(255,255,255,0.16);
          backdrop-filter: blur(12px);
        }
        #contact .reveal {
          opacity: 1 !important;
          transform: none !important;
        }
      `}</style>

      {/* ✅ Sticky Navbar */}
      <header
        className={[
          "sticky top-0 z-50 border-b",
          scrolled
            ? "border-neutral-200 bg-white/85 backdrop-blur shadow-sm"
            : "border-transparent bg-white/65 backdrop-blur",
        ].join(" ")}
      >
        <div className="relative mx-auto flex max-w-7xl items-center px-4 py-3">
          {/* Left: Logo */}
          <a href="#top" className="flex items-center gap-3 shrink-0">
            <img
              src={publicUrl("logo.png")}
              alt="Comtech Web Solutions"
              className="h-9 w-auto"
              loading="eager"
              decoding="async"
            />
          </a>

          {/* ✅ Center: Navigation */}
         <nav className="absolute left-[70%] -translate-x-1/2 hidden md:flex items-center gap-8">
  {navLinks.map((l) => (
    <a
      key={l.href}
      href={l.href}
      className="nav-link-hover text-sm font-semibold text-neutral-700 transition"
    >
      {l.label}
    </a>
  ))}
</nav>

          {/* Right: Buttons */}
          <div className="ml-auto flex items-center gap-2">
            <a
              href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}
              className="hidden sm:inline-flex rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              
            >
              Call
            </a>

            <a
              href="#contact"
              className="inline-flex rounded-full px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:opacity-95"
              style={{ backgroundColor: BRAND }}
            >
              Get Quote
            </a>
          </div>
        </div>
      </header>

      {/* ✅ HERO SLIDESHOW */}
      <section
        id="top"
        className="relative min-h-[82vh] md:min-h-[92vh] flex items-stretch pt-[72px]"
      >
        <div className="absolute inset-0 z-0 overflow-hidden hero-water">
          {slides.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={[
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
                i === slideIndex ? "opacity-100 kenburns" : "opacity-0",
              ].join(" ")}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              onError={() => console.error("Slide not found:", src)}
            />
          ))}

          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(225,6,0,0.22),transparent_42%),radial-gradient(circle_at_78%_35%,rgba(255,255,255,0.10),transparent_45%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 md:py-24 w-full">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div data-reveal className="reveal">
                <h1 className="hero-title mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Professional Websites That{" "}
                  <span style={{ color: BRAND }}>Grow Your Business</span>
                </h1>

                <p className="hero-sub mt-4 max-w-2xl text-base leading-7 text-white/90">
                  Website designing, e-commerce, SEO, hosting and maintenance—built for
                  speed, trust and conversions.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
               <a
  href="#contact"
  className="btn-shadow-hover inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-sm transition"
  style={{ backgroundColor: BRAND }}
>
  Get Free Consultation
</a>
                  <a
                    href="#services"
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold transition border border-white/25 bg-white/10 text-white hover:bg-white/15 active:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                  >
                    View Services
                  </a>
                </div>

                <div className="mt-10 flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => setSlideIndex(i)}
                      className={[
                        "h-2 rounded-full transition-all",
                        i === slideIndex ? "w-10 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div data-reveal className="reveal reveal-delay-1">
                <div className="hero-card rounded-3xl p-6 text-white shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold">Request a Quote</h2>
                      <p className="mt-1 text-sm text-white/85">
                        Quick response within 1 business day.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <a
                      href="#contact"
                      className="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99]"
                      style={{ backgroundColor: BRAND }}
                    >
                      Open Contact Form
                    </a>

                    <a
                      className="text-sm font-extrabold underline text-white"
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Message on WhatsApp →
                    </a>

                    <div className="text-xs text-white/85">
                      Call:{" "}
                      <a
                        className="underline font-bold"
                        href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}
                      >
                        {PHONE_DISPLAY}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ SERVICES */}
      <section id="services" className="relative overflow-hidden bg-white py-16 md:py-24">
        <style>{`
          .bar-pulse { animation: barPulse 1.8s ease-in-out infinite; transform-origin: center; }
          @keyframes barPulse { 0% { transform: scaleX(.55); opacity: .75; } 50% { transform: scaleX(1); opacity: 1; } 100% { transform: scaleX(.65); opacity: .85; } }
          .service-card { transition: transform .35s ease, box-shadow .35s ease, border-color .35s ease; }
          .service-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(225,6,0,0.18); border-color:#E10600; }
          .icon-float { transition: transform .35s ease; }
          .service-card:hover .icon-float { transform: translateY(-2px) scale(1.03); }
          .card-glow { position: absolute; inset: -1px; border-radius: 24px; background: radial-gradient(circle at 20% 10%, rgba(225,6,0,0.10), transparent 55%); opacity: 0; transition: opacity .35s ease; pointer-events: none; }
          .service-card:hover .card-glow { opacity: 1; }
          .service-card:hover .icon-box{ background:#E10600; }
          .service-card:hover .service-icon{ color:white; }
        `}</style>

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-36 -left-36 h-[520px] w-[520px] rounded-full bg-red-600/10 blur-[140px]" />
          <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-red-600/10 blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(225,6,0,0.07),transparent_40%),radial-gradient(circle_at_78%_65%,rgba(225,6,0,0.06),transparent_45%)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4">
          <div data-reveal className="reveal text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              What we do
            </h2>
            <div className="mt-3 flex justify-center">
              <div className="bar-pulse h-[3px] w-28 rounded-full" style={{ backgroundColor: BRAND }} />
            </div>
            <p className="mt-4 mx-auto max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
              We design, build, and support business websites that look professional,
              load fast, and help you get more customer inquiries.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <div
                key={s.title}
                data-reveal
                className={`reveal ${
                  i % 3 === 1 ? "reveal-delay-1" : i % 3 === 2 ? "reveal-delay-2" : ""
                }`}
              >
                <div className="service-card relative h-full rounded-3xl border border-neutral-200 bg-white p-7">
                  <div className="card-glow" />
                  <div className="relative flex items-start justify-between">
                    <div className="icon-box icon-float grid h-12 w-12 place-items-center rounded-2xl bg-red-100">
                      <ServiceIcon name={s.icon} className="service-icon h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-xs font-bold text-neutral-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="relative mt-5 text-base font-extrabold text-neutral-900">{s.title}</h3>
                  <p className="relative mt-2 text-sm leading-6 text-neutral-600">{s.desc}</p>

                  <div className="relative mt-6 flex items-center justify-between">
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-2 text-sm font-extrabold text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
                    >
                      View details <span aria-hidden="true">→</span>
                    </a>
                    <span className="text-xs font-semibold text-neutral-400">Quick support</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-extrabold text-neutral-900">
                  Need help choosing the right service?
                </div>
                <div className="mt-1 text-sm text-neutral-600">
                  Share your requirement. We’ll recommend the best option and respond quickly.
                </div>
              </div>

              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
                style={{ backgroundColor: BRAND }}
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ CONTACT */}
      <section id="contact" className="relative overflow-hidden bg-neutral-50 py-16 md:py-24">
        <style>{`
          .contact-glow { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
          .contact-glow:before{ content:""; position:absolute; left:-140px; top:-160px; width:520px; height:520px; border-radius:999px; background: rgba(225,6,0,.14); filter: blur(120px); }
          .contact-glow:after{ content:""; position:absolute; right:-160px; bottom:-180px; width:560px; height:560px; border-radius:999px; background: rgba(225,6,0,.10); filter: blur(130px); }
          .contact-card{ transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
          .contact-card:hover{ transform: translateY(-2px); border-color: rgba(225,6,0,.22); box-shadow: 0 18px 60px rgba(0,0,0,.08), 0 12px 40px rgba(225,6,0,.10); }
          .contact-input{ transition: box-shadow .2s ease, border-color .2s ease, background .2s ease; }
          .contact-input:hover{ border-color: rgba(225,6,0,.22); box-shadow: 0 0 0 3px rgba(225,6,0,.06); }
          .contact-input:focus{ outline: none; border-color: rgba(225,6,0,.45); box-shadow: 0 0 0 5px rgba(225,6,0,.14); }
          .contact-btn{ transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease; }
          .contact-btn:hover{ transform: translateY(-1px); box-shadow: 0 16px 45px rgba(225,6,0,.18); }
          .contact-underline{ height: 3px; width: 92px; border-radius: 999px; background: ${BRAND}; transform-origin: left center; animation: contactPulse 1.8s ease-in-out infinite; }
          @keyframes contactPulse{ 0%{transform:scaleX(.55); opacity:.75} 50%{transform:scaleX(1); opacity:1} 100%{transform:scaleX(.65); opacity:.85} }
        `}</style>

        <div className="contact-glow" />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <div className="contact-card rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
                  Contact us
                </h2>

                <div className="mt-3">
                  <div className="contact-underline" />
                </div>

                <p className="mt-4 text-neutral-600">
                  Share your requirement and we’ll respond with the best option and an estimate.
                </p>

                <div className="mt-8 space-y-4">
                  <InfoRow
                    label="Phone"
                    value={PHONE_DISPLAY}
                    href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}
                  />
                  <InfoRow label="Hours" value={HOURS} />
                </div>

                <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <div className="text-sm font-extrabold text-neutral-900">
                    Quick response
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">
                    We usually reply within 1 business day. WhatsApp is the fastest for urgent requests.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="contact-card rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-neutral-900">
                      Send a message
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Fill the form below and we’ll contact you shortly.
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="contact-underline" style={{ width: 70 }} />
                </div>

                {submitted && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                    ✅ Message received! We’ll contact you within 1 business day.
                  </div>
                )}

                <form className="mt-6 grid gap-4" onSubmit={onSubmit} noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-extrabold text-neutral-700">Full Name</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
                        className={[
                          "contact-input mt-1 w-full rounded-2xl border bg-white px-3 py-2 text-sm",
                          errors.name ? "border-red-300" : "border-neutral-200",
                        ].join(" ")}
                        required
                      />
                      {errors.name && (
                        <div className="mt-1 text-xs font-semibold text-red-600">{errors.name}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-neutral-700">Phone / WhatsApp</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+94 …"
                        className={[
                          "contact-input mt-1 w-full rounded-2xl border bg-white px-3 py-2 text-sm",
                          errors.phone ? "border-red-300" : "border-neutral-200",
                        ].join(" ")}
                        required
                      />
                      {errors.phone && (
                        <div className="mt-1 text-xs font-semibold text-red-600">{errors.phone}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-extrabold text-neutral-700">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="you@email.com"
                        className={[
                          "contact-input mt-1 w-full rounded-2xl border bg-white px-3 py-2 text-sm",
                          errors.email ? "border-red-300" : "border-neutral-200",
                        ].join(" ")}
                        required
                      />
                      {errors.email && (
                        <div className="mt-1 text-xs font-semibold text-red-600">{errors.email}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-neutral-700">Service</label>
                      <select
                        value={form.service}
                        onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))}
                        className={[
                          "contact-input mt-1 w-full rounded-2xl border bg-white px-3 py-2 text-sm",
                          errors.service ? "border-red-300" : "border-neutral-200",
                        ].join(" ")}
                        required
                      >
                        <option value="" disabled>
                          Select a service
                        </option>
                        {[
                          "Website Designing & Development",
                          "Mobile Friendly Websites",
                          "Search Engine Optimization (SEO)",
                          "Web Hosting Solutions",
                          "Domain Name Registration",
                          "E-commerce",
                          "Other",
                        ].map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      {errors.service && (
                        <div className="mt-1 text-xs font-semibold text-red-600">{errors.service}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-neutral-700">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us what you need (pages, features, timeline)…"
                      className={[
                        "contact-input mt-1 min-h-[130px] w-full resize-y rounded-2xl border bg-white px-3 py-2 text-sm",
                        errors.message ? "border-red-300" : "border-neutral-200",
                      ].join(" ")}
                      required
                    />
                    {errors.message && (
                      <div className="mt-1 text-xs font-semibold text-red-600">{errors.message}</div>
                    )}
                  </div>

                  {/* ✅ reCAPTCHA (no style changes) */}
                  <div>
                    <div
  ref={captchaRef}
  className="g-recaptcha"
  data-sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} // use Vite env
  data-callback="__onRecaptchaSuccess"
  data-expired-callback="__onRecaptchaExpired"
/>
                    {errors.captcha && (
                      <div className="mt-2 text-xs font-semibold text-red-600">{errors.captcha}</div>
                    )}
                  </div>

                <button
  type="submit"
  disabled={submitting || !captchaToken}
  className="btn-shadow-hover contact-btn mt-1 inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:opacity-70 disabled:hover:transform-none"
  style={{ backgroundColor: BRAND }}
>
  {submitting ? "Sending…" : !captchaToken ? "Verify reCAPTCHA to Send" : "Send Message"}
</button>

                  <p className="text-xs text-neutral-500">
                    By submitting, you agree to be contacted about your inquiry.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ FOOTER */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-neutral-600">
              © {new Date().getFullYear()} Comtech Web Solutions. All rights reserved.
            </div>
            <div className="text-sm text-neutral-500">{ADDRESS}</div>
          </div>
        </div>
      </footer>

      {/* ✅ Floating WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50"
        aria-label="Chat on WhatsApp"
      >
        <div className="group relative">
          <div className="whatsapp-pulse" aria-hidden="true" />
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-white">
              <WhatsAppIcon className="h-5 w-5" />
            </span>
            <span className="hidden sm:block text-sm font-extrabold text-neutral-900">
              WhatsApp
            </span>
          </div>
          <div className="pointer-events-none absolute -top-12 right-0 hidden w-max rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-900 shadow-md opacity-0 transition group-hover:block group-hover:opacity-100">
            Chat on WhatsApp
          </div>
        </div>
      </a>
    </div>
  );
}

/* ---------- mini components ---------- */
function InfoRow({ label, value, href, external }) {
  const content = (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="text-xs font-extrabold text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-neutral-900">{value}</div>
    </div>
  );

  if (!href) return content;
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="block"
    >
      {content}
    </a>
  );
}

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.11 17.2c-.27-.14-1.6-.79-1.84-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.02-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.97 2.64 1.11 2.82c.14.18 1.9 2.9 4.61 4.07.64.28 1.14.45 1.53.58.64.2 1.23.17 1.69.1.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"
      />
      <path
        fill="currentColor"
        d="M26.67 5.33A14.56 14.56 0 0 0 16.02 1C7.99 1 1.45 7.54 1.45 15.57c0 2.56.67 5.05 1.96 7.25L1 31l8.4-2.21a14.5 14.5 0 0 0 6.62 1.6h.01c8.03 0 14.57-6.54 14.57-14.57 0-3.89-1.52-7.54-4.43-10.49zM16.02 28.1h-.01a12.1 12.1 0 0 1-6.18-1.69l-.44-.26-4.98 1.31 1.33-4.86-.28-.5a12.12 12.12 0 0 1-1.86-6.53C3.6 8.86 9.32 3.14 16.02 3.14c3.23 0 6.27 1.26 8.55 3.55a12.03 12.03 0 0 1 3.53 8.53c0 6.7-5.72 12.88-12.08 12.88z"
      />
    </svg>
  );
}
