"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const LEAD_WEBHOOK_URL = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const CENTER_NAME = process.env.NEXT_PUBLIC_CENTER_NAME || "Body Laser";

const zones = [
  "Aisselles",
  "Maillot",
  "Jambes completes",
  "Demi-jambes",
  "Bras",
  "Visage",
  "Dos / torse",
  "Plusieurs zones",
];

const faq = [
  {
    question: "Quelle difference avec un laser non medical ?",
    answer:
      "Beaucoup de centres utilisent un laser diode esthetique. Body Laser travaille avec un laser medical Alexandrite + Nd:YAG, adapte a davantage de phototypes et de types de poils, apres une consultation personnalisee.",
  },
  {
    question: "Le laser Alexandrite + Nd:YAG convient-il a toutes les peaux ?",
    answer:
      "Oui, c'est tout l'interet du double laser. L'Alexandrite est tres efficace sur poils fonces et peaux claires. Le Nd:YAG permet d'adapter le protocole aux peaux matees, bronzees ou plus foncees.",
  },
  {
    question: "La consultation est-elle vraiment offerte ?",
    answer:
      "Oui. La consultation sert a verifier les indications, les contre-indications et a construire un protocole coherent avant de commencer.",
  },
  {
    question: "Puis-je traiter plusieurs zones ?",
    answer:
      "Oui, vous pouvez cocher plusieurs zones. L'equipe vous proposera ensuite la consultation et l'offre les plus adaptees.",
  },
  {
    question: "Les tarifs dependent-ils des zones ?",
    answer:
      "Oui. Le tarif est calcule selon le nombre de zones a traiter. Il reste accessible, et un paiement en plusieurs fois est possible.",
  },
];

const beforeAfter = [
  {
    area: "Irritations",
    result: "Peau plus nette apres protocole",
    src: "/before-after-irritations.jpg",
  },
  {
    area: "Aisselles",
    result: "Moins de poils visibles au quotidien",
    src: "/before-after-aisselles.jpg",
  },
  {
    area: "Dos",
    result: "Reduction visible sur grande zone",
    src: "/before-after-dos.jpg",
  },
  {
    area: "Aisselles",
    result: "Zone plus propre et plus homogene",
    src: "/before-after-epaules.jpg",
  },
  {
    area: "Jambe",
    result: "Routine rasage fortement reduite",
    src: "/before-after-jambe.jpg",
  },
];

const reviews = [
  {
    name: "Camille R.",
    initial: "C",
    color: "#1a73e8",
    time: "Il y a 2 semaines",
    text: "Consultation tres claire. On m'a explique la difference avec un laser classique et pourquoi Alexandrite + Nd:YAG etait plus adapte a ma peau.",
  },
  {
    name: "Lea M.",
    initial: "L",
    color: "#e37400",
    time: "Il y a 1 mois",
    text: "J'arretais pas de me raser les aisselles. Des la premiere seance, la peau est plus nette. Accueil pro, vrai suivi medical.",
  },
  {
    name: "Sofia B.",
    initial: "S",
    color: "#188038",
    time: "Il y a 3 semaines",
    text: "Peau mate, on m'avait dit que le laser n'etait pas pour moi. Ici le Nd:YAG a ete propose pendant la consultation. Tres rassurée.",
  },
  {
    name: "Ines D.",
    initial: "I",
    color: "#c5221f",
    time: "Il y a 5 jours",
    text: "J'ai pris la consultation offerte vue dans la pub. Rapide, sans pression, et enfin une explication concrete sur le laser definitif.",
  },
  {
    name: "Thomas P.",
    initial: "T",
    color: "#9334e6",
    time: "Il y a 1 mois",
    text: "Dos et torse traites. On sent la difference avec un centre esthetique classique. Protocole pose des le debut.",
  },
  {
    name: "Nadia K.",
    initial: "N",
    color: "#1967d2",
    time: "Il y a 4 jours",
    text: "Equipe a l'ecoute, consultation offerte vraiment utile. Je voulais arreter le rasage, j'ai un plan clair maintenant.",
  },
];

const comparisonRows = [
  ["Peaux foncees / bronzees", "Contre-indique", "Securise selon indication"],
  ["Poils fins / clairs", "Efficacite limitee", "Efficacite optimale"],
  ["Nombre de seances", "8 a 12 seances", "5 a 8 seances"],
  ["Puissance & precision", "Standard", "Maximale"],
  ["Grade", "Esthetique", "Medical"],
  ["Utilise par", "Centres esthetiques", "Dermatologues & cliniques"],
];

function FloatingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("bl-video-closed") === "1") return;
    const timer = window.setTimeout(() => setVisible(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    videoRef.current?.play().catch(() => setPaused(true));
  }, [visible]);

  if (!visible) return null;

  function togglePause() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  }

  function closeWidget() {
    videoRef.current?.pause();
    sessionStorage.setItem("bl-video-closed", "1");
    setVisible(false);
  }

  return (
    <aside className="video-widget" aria-label="Video Body Laser">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        src="/body-laser-widget.mp4"
      />
      <div className="video-widget-controls">
        <button
          aria-label={paused ? "Lire la video" : "Mettre la video en pause"}
          onClick={togglePause}
          type="button"
        >
          {paused ? "Lecture" : "Pause"}
        </button>
        <button aria-label="Fermer la video" onClick={closeWidget} type="button">
          Fermer
        </button>
      </div>
    </aside>
  );
}

function track(eventName: string, params?: Record<string, unknown>) {
  window.fbq?.("track", eventName, params);
}

function getTrackingParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") ?? "",
    utm_medium: params.get("utm_medium") ?? "",
    utm_campaign: params.get("utm_campaign") ?? "",
    utm_content: params.get("utm_content") ?? "",
    utm_term: params.get("utm_term") ?? "",
    fbclid: params.get("fbclid") ?? "",
    meta_campaign_id: params.get("campaign_id") ?? "",
    meta_adset_id: params.get("adset_id") ?? "",
    meta_ad_id: params.get("ad_id") ?? "",
  };
}

export default function Home() {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [step, setStep] = useState<"intro" | "form" | "thanks">("intro");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageOptIn, setMessageOptIn] = useState("oui");
  const trackingParams = useMemo(getTrackingParams, []);

  useEffect(() => {
    if (!META_PIXEL_ID || typeof window === "undefined" || window.fbq) return;

    const fbq = function (...args: unknown[]) {
      (
        fbq as unknown as {
          callMethod?: (...items: unknown[]) => void;
          queue: unknown[];
        }
      ).callMethod
        ? (
            fbq as unknown as { callMethod: (...items: unknown[]) => void }
          ).callMethod(...args)
        : (fbq as unknown as { queue: unknown[] }).queue.push(args);
    } as Window["fbq"] & { queue: unknown[]; loaded: boolean; version: string };

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    window.fbq("init", META_PIXEL_ID);
    track("PageView");
    track("ViewContent", {
      center: CENTER_NAME,
      content_name: "Tunnel epilation laser medicale",
    });
  }, []);

  function toggleZone(zone: string) {
    setSelectedZones((current) =>
      current.includes(zone)
        ? current.filter((item) => item !== zone)
        : [...current, zone],
    );
  }

  function openForm() {
    if (selectedZones.length === 0) return;
    track("CustomizeProduct", { center: CENTER_NAME, zones: selectedZones });
    setStep("form");
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      full_name: String(data.get("full_name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      message_opt_in: messageOptIn,
      zones: selectedZones,
      center: CENTER_NAME,
      center_display_name: CENTER_NAME,
      offer: "Consultation laser offerte",
      technology: "Laser medical Alexandrite + Nd:YAG",
      page: `Epilation laser medicale ${CENTER_NAME}`,
      source: "body-laser-landing",
      submitted_at: new Date().toISOString(),
      page_url: typeof window !== "undefined" ? window.location.href : "",
      ...trackingParams,
    };

    setIsSubmitting(true);
    try {
      if (LEAD_WEBHOOK_URL) {
        await fetch(LEAD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      track("Lead", {
        content_name: "Consultation laser offerte",
        center: CENTER_NAME,
        zones: selectedZones.join(", "),
      });
      setStep("thanks");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-shell">
      <header className="site-header" aria-label="Body Laser">
        <img
          alt="Body Laser"
          className="brand-logo"
          src="/body-laser-logo.png"
        />
      </header>

      <section className="hero-section" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Consultation offerte cette semaine</p>
          <h1 id="page-title">2 etapes pour demander votre consultation</h1>
          <p className="hero-subtitle">
            Laser medical Alexandrite + Nd:YAG - {CENTER_NAME}
          </p>
          <div className="trust-row" aria-label="Elements de confiance">
            <span>Consultation offerte</span>
            <span>Laser medical</span>
            <span>Toutes peaux</span>
            <span>Reponse rapide</span>
          </div>
        </div>

        <div
          className="before-after-carousel"
          aria-label="Avant apres epilation laser medicale"
        >
          <div className="before-after-track">
            {[...beforeAfter, ...beforeAfter].map((item, index) => (
              <article
                className="before-after-card"
                key={`${item.area}-${index}`}
              >
                <div className="photo-pair">
                  <img
                    alt={`Avant apres epilation laser - ${item.area}`}
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "auto"}
                    height={465}
                    loading={index === 0 ? "eager" : "lazy"}
                    src={item.src}
                    width={720}
                  />
                  <span className="before-badge">Avant</span>
                  <span className="after-badge">Apres</span>
                </div>
                <strong>{item.area}</strong>
                <p>{item.result}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {step === "intro" && (
        <section className="quiz-panel" aria-labelledby="zone-question">
          <div>
            <p className="offer-ready">Votre consultation est presque prete</p>
            <p className="step-label">
              2 etapes pour demander votre CONSULTATION OFFERTE avec laser
              medical
            </p>
            <h2 id="zone-question">Quelle(s) zone(s) souhaitez-vous traiter ?</h2>
            <p className="helper-text">
              Vous pouvez cocher plusieurs zones si vous souhaitez une offre
              groupee.
            </p>
          </div>

          <div className="zone-grid">
            {zones.map((zone) => {
              const isSelected = selectedZones.includes(zone);
              return (
                <button
                  aria-pressed={isSelected}
                  className={`zone-option ${isSelected ? "selected" : ""}`}
                  key={zone}
                  onClick={() => toggleZone(zone)}
                  type="button"
                >
                  <span className="checkmark" aria-hidden="true">
                    {isSelected ? "✓" : ""}
                  </span>
                  {zone}
                </button>
              );
            })}
          </div>

          <button
            className="primary-action"
            disabled={selectedZones.length === 0}
            onClick={openForm}
            type="button"
          >
            Recuperer ma consultation offerte
          </button>
        </section>
      )}

      {step === "form" && (
        <section className="form-panel" aria-labelledby="form-title">
          <button
            className="back-button"
            onClick={() => setStep("intro")}
            type="button"
          >
            Retour
          </button>
          <p className="offer-ready">Votre consultation est presque prete</p>
          <p className="step-label">Derniere etape</p>
          <h2 id="form-title">
            Remplissez vos coordonnees pour valider votre consultation offerte.
          </h2>

          <form className="lead-form" onSubmit={submitLead}>
            <label>
              Prenom et nom
              <input name="full_name" placeholder="Votre nom complet" required />
            </label>
            <label>
              Telephone
              <input
                inputMode="tel"
                name="phone"
                placeholder="06 00 00 00 00"
                required
                type="tel"
              />
            </label>
            <label>
              Email
              <input
                inputMode="email"
                name="email"
                placeholder="vous@email.com"
                type="email"
              />
            </label>

            <fieldset className="message-consent">
              <legend>
                Pouvons-nous vous contacter par message pour valider votre
                consultation ?
              </legend>
              <label>
                <input
                  checked={messageOptIn === "oui"}
                  name="message_opt_in"
                  onChange={() => setMessageOptIn("oui")}
                  type="radio"
                  value="oui"
                />
                Oui
              </label>
              <label>
                <input
                  checked={messageOptIn === "non"}
                  name="message_opt_in"
                  onChange={() => setMessageOptIn("non")}
                  type="radio"
                  value="non"
                />
                Non
              </label>
            </fieldset>

            <button
              className="primary-action"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? "Envoi en cours..."
                : "Je valide ma consultation offerte"}
            </button>
          </form>
        </section>
      )}

      {step === "thanks" && (
        <section className="thanks-panel" aria-labelledby="thanks-title">
          <p className="step-label">Demande recue</p>
          <h2 id="thanks-title">
            Merci, votre consultation {CENTER_NAME} est en cours de validation.
          </h2>
          <p>
            Une personne de l'equipe vous contactera rapidement pour confirmer
            votre consultation et verifier le protocole adapte a votre peau.
          </p>
        </section>
      )}

      <footer className="offer-footer" aria-label="Tarifs et paiement">
        <span>Paiement en plusieurs fois possible</span>
        <span>Tarif selon le nombre de zones</span>
        <span>Tarif accessible</span>
      </footer>

      <section className="comparison-section" aria-labelledby="comparison-title">
        <h2 id="comparison-title">
          Laser esthetique ou laser medical : la vraie difference
        </h2>
        <p className="comparison-lead">
          Body Laser n'utilise pas un laser diode de centre esthetique. Ici, le
          protocole repose sur un laser medical Alexandrite + Nd:YAG, adapte a
          tous types de peau.
        </p>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Critere</th>
              <th>Laser diode standard</th>
              <th>Alexandrite + Nd:YAG</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map(([label, diode, medical]) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="lose">{diode}</td>
                <td className="win">{medical}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="proof-section" aria-labelledby="proof-title">
        <h2 id="proof-title">Ce que nos patients disent de nous</h2>
        <div className="google-reviews">
          {reviews.map((review) => (
            <figure className="google-card" key={review.name}>
              <div className="google-card-top">
                <span
                  className="google-avatar"
                  style={{ background: review.color }}
                >
                  {review.initial}
                </span>
                <div>
                  <span className="google-name">{review.name}</span>
                  <span className="google-meta">{review.time}</span>
                </div>
              </div>
              <div className="google-stars" aria-label="5 etoiles">
                ★★★★★
              </div>
              <p>{review.text}</p>
              <figcaption className="google-badge">Avis Google</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="faq-section" aria-labelledby="faq-title">
        <h2 id="faq-title">Questions frequentes</h2>
        <div className="faq-list">
          {faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <FloatingVideo />
    </main>
  );
}
