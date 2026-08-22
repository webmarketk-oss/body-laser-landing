"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID_BODY_LASER ||
  process.env.NEXT_PUBLIC_META_PIXEL_ID;
const LEAD_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL_BODY_LASER ||
  process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL;

const zones = [
  "Aisselles",
  "Maillot",
  "Jambes",
  "Demi-jambes",
  "Bras",
  "Visage",
  "Dos / torse",
  "Plusieurs zones",
];

const expectations = [
  "Arreter le rasage",
  "Reduire les irritations",
  "Poils incarnes",
  "Resultat durable",
  "Peau plus nette",
  "Traiter plusieurs zones",
];

const faq = [
  {
    q: "Pourquoi Alexandrite + Nd:YAG ?",
    a: "Ces deux longueurs d'onde permettent d'adapter le protocole selon la peau, la zone et le type de poil pendant la consultation.",
  },
  {
    q: "La consultation est-elle obligatoire ?",
    a: "Oui, elle permet de verifier les indications, les contre-indications et de construire un protocole coherent avant de commencer.",
  },
  {
    q: "Peut-on traiter plusieurs zones ?",
    a: "Oui, vous pouvez selectionner plusieurs zones dans le formulaire pour recevoir une proposition adaptee.",
  },
];

const showcase = [
  {
    title: "Une premiere chez Body Laser",
    image: "/body-laser-nouveau.png",
  },
  {
    title: "Technologie, elegance & confiance",
    image: "/body-laser-services.png",
  },
];

type Step = "intro" | "questions" | "contact" | "thanks";

function track(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, data || {});
  }
}

function getTrackingParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    fbclid: params.get("fbclid") || "",
  };
}

export default function Home() {
  const [step, setStep] = useState<Step>("intro");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedExpectations, setSelectedExpectations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    messageOptIn: "oui",
  });

  useEffect(() => {
    if (!META_PIXEL_ID || typeof window === "undefined" || window.fbq) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    const fbq = function (...args: unknown[]) {
      // @ts-expect-error Meta pixel queue bootstrap.
      fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args);
    } as unknown as (...args: unknown[]) => void;

    // @ts-expect-error Meta pixel bootstrap fields.
    fbq.queue = [];
    // @ts-expect-error Meta pixel bootstrap fields.
    fbq.loaded = true;
    // @ts-expect-error Meta pixel bootstrap fields.
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }, []);

  const canContinue = useMemo(
    () => selectedZones.length > 0 && selectedExpectations.length > 0,
    [selectedZones, selectedExpectations],
  );

  const toggle = (
    value: string,
    selected: string[],
    setter: (next: string[]) => void,
  ) => {
    setter(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  const goToQuestions = () => {
    track("ViewContent", { content_name: "Body Laser questionnaire" });
    setStep("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToContact = () => {
    if (!canContinue) return;
    track("Lead", { content_name: "Body Laser consultation start" });
    setStep("contact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      source: "body-laser-landing",
      center: "Body Laser",
      full_name: form.fullName,
      phone: form.phone,
      email: form.email,
      message_opt_in: form.messageOptIn,
      zones: selectedZones.join(", "),
      expectations: selectedExpectations.join(", "),
      offer: "Consultation laser offerte",
      technology: "Laser medical Alexandrite + Nd:YAG",
      submitted_at: new Date().toISOString(),
      page_url: typeof window !== "undefined" ? window.location.href : "",
      ...getTrackingParams(),
    };

    try {
      if (LEAD_WEBHOOK_URL) {
        await fetch(LEAD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      track("CompleteRegistration", { content_name: "Body Laser consultation" });
      setStep("thanks");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStep("thanks");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="site-shell">
      <header className="brand-header">
        <img src="/body-laser-logo.png" alt="Body Laser" className="brand-logo" />
        <span>Laser medical Alexandrite + Nd:YAG</span>
      </header>

      {step === "intro" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">Consultation laser offerte cette semaine</p>
              <h1>Epilation laser medicale, adaptee a votre peau.</h1>
              <p className="hero-text">
                Verifiez en 2 etapes si vous pouvez beneficier d'une consultation
                personnalisee Body Laser avec technologie Alexandrite + Nd:YAG.
              </p>
              <button className="primary-cta" onClick={goToQuestions}>
                Verifier mon eligibilite
              </button>
            </div>

            <div className="hero-card">
              <strong>2 etapes</strong>
              <span>Reponse rapide apres votre demande</span>
              <div className="offer-box">
                Consultation laser offerte avant de commencer
              </div>
            </div>
          </section>

          <section className="visual-strip" aria-label="Body Laser">
            {showcase.map((item) => (
              <article className="visual-card" key={item.title}>
                <img src={item.image} alt={item.title} />
                <div>
                  <strong>{item.title}</strong>
                  <span>Body Laser & medecine esthetique</span>
                </div>
              </article>
            ))}
          </section>

          <section className="trust-panel">
            <h2>Pourquoi choisir Alexandrite + Nd:YAG ?</h2>
            <div className="comparison">
              <div className="comparison-row comparison-head">
                <span>Critere</span>
                <span>Laser diode standard</span>
                <span>Body Laser</span>
              </div>
              <div className="comparison-row">
                <span>Phototypes</span>
                <span>Reglage plus limite selon appareil</span>
                <span>Protocole ajuste en consultation</span>
              </div>
              <div className="comparison-row">
                <span>Peaux bronzees ou foncees</span>
                <span>Avis prealable indispensable</span>
                <span>Nd:YAG prevu pour mieux s'adapter selon indication</span>
              </div>
              <div className="comparison-row">
                <span>Precision</span>
                <span>Standard</span>
                <span>Double longueur d'onde Alexandrite + Nd:YAG</span>
              </div>
              <div className="comparison-row">
                <span>Encadrement</span>
                <span>Parcours esthetique classique</span>
                <span>Consultation personnalisee avant protocole</span>
              </div>
            </div>
          </section>
        </>
      )}

      {step === "questions" && (
        <section className="quiz-card">
          <p className="step-label">Etape 1 sur 2</p>
          <h2>Quelle(s) zone(s) souhaitez-vous traiter ?</h2>
          <p className="subline">Vous pouvez cocher plusieurs zones.</p>
          <div className="choice-grid">
            {zones.map((zone) => (
              <button
                type="button"
                className={selectedZones.includes(zone) ? "choice active" : "choice"}
                key={zone}
                onClick={() => toggle(zone, selectedZones, setSelectedZones)}
              >
                {zone}
              </button>
            ))}
          </div>

          <h3>Votre objectif principal</h3>
          <div className="choice-grid">
            {expectations.map((expectation) => (
              <button
                type="button"
                className={
                  selectedExpectations.includes(expectation)
                    ? "choice active"
                    : "choice"
                }
                key={expectation}
                onClick={() =>
                  toggle(
                    expectation,
                    selectedExpectations,
                    setSelectedExpectations,
                  )
                }
              >
                {expectation}
              </button>
            ))}
          </div>

          <button
            className="primary-cta wide"
            disabled={!canContinue}
            onClick={goToContact}
          >
            Continuer pour acceder a ma consultation
          </button>
        </section>
      )}

      {step === "contact" && (
        <section className="quiz-card contact-card">
          <p className="step-label">Etape 2 sur 2</p>
          <h2>Votre consultation est presque prete</h2>
          <p className="subline">
            Remplissez vos coordonnees pour etre recontacte par Body Laser.
          </p>

          <form onSubmit={submitLead} className="lead-form">
            <input
              required
              type="text"
              placeholder="Prenom et nom"
              value={form.fullName}
              onChange={(event) =>
                setForm({ ...form, fullName: event.target.value })
              }
            />
            <input
              required
              type="tel"
              placeholder="Telephone"
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
            />
            <input
              type="email"
              placeholder="Adresse e-mail"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />

            <fieldset className="consent-box">
              <legend>Pouvons-nous vous contacter par message pour valider votre consultation ?</legend>
              <label>
                <input
                  type="radio"
                  name="messageOptIn"
                  value="oui"
                  checked={form.messageOptIn === "oui"}
                  onChange={(event) =>
                    setForm({ ...form, messageOptIn: event.target.value })
                  }
                />
                Oui
              </label>
              <label>
                <input
                  type="radio"
                  name="messageOptIn"
                  value="non"
                  checked={form.messageOptIn === "non"}
                  onChange={(event) =>
                    setForm({ ...form, messageOptIn: event.target.value })
                  }
                />
                Non
              </label>
            </fieldset>

            <button className="primary-cta wide" disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours..." : "Valider ma demande"}
            </button>
          </form>
        </section>
      )}

      {step === "thanks" && (
        <section className="thanks-card">
          <p className="step-label">Demande envoyee</p>
          <h2>Merci, votre consultation Body Laser est en cours de validation.</h2>
          <p>
            Une personne de l'equipe vous contactera pour confirmer votre
            consultation et verifier le protocole adapte a votre peau.
          </p>
        </section>
      )}

      <section className="faq-section">
        <h2>Questions frequentes</h2>
        {faq.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
