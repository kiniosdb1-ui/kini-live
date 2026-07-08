import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, LoaderCircle, LockKeyhole, Send, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { services } from "../data";
import TurnstileWidget from "./TurnstileWidget";

const API_URL = import.meta.env.VITE_API_URL || "";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  service: "",
  message: "",
  companyWebsite: "",
  consent: false,
};

function ConsultationModal({ isOpen, onClose, initialService }) {
  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState("details");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCaptchaToken = useCallback((token) => setCaptchaToken(token), []);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...emptyForm, service: initialService || "" });
      setStep("details");
      setCaptchaToken("");
      setError("");
      document.body.classList.add("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isOpen, initialService]);

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submitConsultation = async (event) => {
    event.preventDefault();
    setError("");
    if (!captchaToken) {
      setError("Please complete the human verification.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/consultations/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to submit consultation.");
      setStep("success");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="consultation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultation-title"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28 }}
          >
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close consultation form">
              <X size={20} />
            </button>

            {step === "details" && (
              <>
                <div className="modal-heading">
                  <span><LockKeyhole size={16} /> Secure consultation request</span>
                  <h2 id="consultation-title">Tell us what you need help with.</h2>
                  <p>Complete the human verification and your request will be securely sent to the KINi team.</p>
                </div>
                <form className="consultation-form" onSubmit={submitConsultation}>
                  <label>
                    Full name
                    <input name="name" value={form.name} onChange={updateField} maxLength="80" required autoComplete="name" />
                  </label>
                  <label>
                    Email address
                    <input name="email" type="email" value={form.email} onChange={updateField} maxLength="160" required autoComplete="email" />
                  </label>
                  <label>
                    Phone number
                    <input name="phone" type="tel" value={form.phone} onChange={updateField} maxLength="18" required autoComplete="tel" />
                  </label>
                  <label>
                    Service
                    <select name="service" value={form.service} onChange={updateField} required>
                      <option value="">Select a service</option>
                      {services.map((service) => <option key={service.name}>{service.name}</option>)}
                      <option>General Enquiry</option>
                    </select>
                  </label>
                  <label className="form-wide">
                    How can we help?
                    <textarea name="message" value={form.message} onChange={updateField} minLength="20" maxLength="1500" required rows="4" />
                  </label>
                  <label className="honeypot" aria-hidden="true">
                    Company website
                    <input name="companyWebsite" value={form.companyWebsite} onChange={updateField} tabIndex="-1" autoComplete="off" />
                  </label>
                  <label className="consent-row form-wide">
                    <input name="consent" type="checkbox" checked={form.consent} onChange={updateField} required />
                    <span>I consent to being contacted regarding this consultation request.</span>
                  </label>
                  <div className="form-wide">
                    <TurnstileWidget onToken={handleCaptchaToken} />
                  </div>
                  {error && <p className="form-error form-wide">{error}</p>}
                  <button className="primary-button form-wide" type="submit" disabled={loading}>
                    {loading ? <><LoaderCircle className="spin" size={18} /> Sending request</> : <>Submit consultation request <Send size={18} /></>}
                  </button>
                </form>
              </>
            )}

            {step === "success" && (
              <div className="success-panel">
                <CheckCircle2 size={48} />
                <p className="section-kicker">Request received</p>
                <h2 id="consultation-title">Thank you, {form.name.split(" ")[0]}.</h2>
                <p>Your verified consultation request has been received. Kini Outsourcing Services will contact you shortly.</p>
                <button className="primary-button" type="button" onClick={onClose}>Close</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConsultationModal;
