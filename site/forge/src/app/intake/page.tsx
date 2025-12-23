import IntakeForm from "@/components/Intake/IntakeForm";

const materialUrl = process.env.NEXT_PUBLIC_INTAKE_MATERIAL_URL || "";
const pressureUrl = process.env.NEXT_PUBLIC_INTAKE_PRESSURE_URL || "";
const fuelUrl = process.env.NEXT_PUBLIC_INTAKE_FUEL_URL || "";
const contactEmail = process.env.NEXT_PUBLIC_INTAKE_EMAIL || "";
const contactPlatform = process.env.NEXT_PUBLIC_INTAKE_PLATFORM_URL || "";
const contactPlatformLabel = process.env.NEXT_PUBLIC_INTAKE_PLATFORM_LABEL || "X";

function normalizeUrl(value: string) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

export default function IntakePage() {
  return (
    <main className="forge-shell">
      <span className="forge-eyebrow">INTAKE</span>
      <h1 className="forge-title">A calibrated intake valve.</h1>
      <p className="forge-lead intake-lead">
        The Forge does not debate opinions. It examines systems under heat. If you are
        here to praise, argue, or perform alignment - stop. If you are here to submit
        material, apply pressure, or provide fuel - proceed.
      </p>

      <section className="forge-card intake-card">
        <div className="intake-label">A. MATERIAL</div>
        <h2 className="intake-title">Submit something to be tested.</h2>
        <p className="intake-copy">
          Submit a work, system, idea, or recurring pattern you believe warrants Forge
          heat.
        </p>
        <div className="intake-copy">
          Rules:
          <ul>
            <li>No summaries.</li>
            <li>No praise.</li>
            <li>One sentence only, answering: What system does this expose?</li>
          </ul>
        </div>
        <IntakeForm className="intake-form" action={materialUrl}>
          <label htmlFor="intake-name">Name or link</label>
          <input id="intake-name" name="name" type="text" required />

          <label htmlFor="intake-domain">Domain</label>
          <select id="intake-domain" name="domain" required>
            <option value="">Select</option>
            <option value="movies">Film</option>
            <option value="books">Book</option>
            <option value="persons">Person</option>
            <option value="ideas">Idea</option>
            <option value="others">System / Other</option>
          </select>

          <label htmlFor="intake-mechanism">One-sentence mechanism claim</label>
          <textarea id="intake-mechanism" name="mechanism" rows={4} required />

          <button type="submit">Submit material</button>
          {!materialUrl && (
            <p className="intake-note">
              Set `NEXT_PUBLIC_INTAKE_MATERIAL_URL` to enable submissions.
            </p>
          )}
        </IntakeForm>
        <p className="intake-copy intake-copySmall">
          Submissions are intake, not guarantees. Most material is rejected silently.
        </p>
      </section>

      <section className="forge-card intake-card">
        <div className="intake-label">B. PRESSURE</div>
        <h2 className="intake-title">Corrections, fractures, missed load.</h2>
        <p className="intake-copy">
          Use this channel only if you believe the Forge misread a mechanism, misplaced
          a constraint, or underpriced a cost.
        </p>
        <div className="intake-copy">
          Rules:
          <ul>
            <li>Quote the exact Forge text.</li>
            <li>Name the mechanism, not the sentiment.</li>
            <li>No moral language.</li>
          </ul>
        </div>
        <IntakeForm className="intake-form" action={pressureUrl}>
          <label htmlFor="pressure-source">Forge entry URL</label>
          <input id="pressure-source" name="source" type="url" required />

          <label htmlFor="pressure-quote">Exact quote</label>
          <textarea id="pressure-quote" name="quote" rows={3} required />

          <label htmlFor="pressure-mechanism">
            Mechanism you believe was misread (1-3 sentences)
          </label>
          <textarea id="pressure-mechanism" name="mechanism" rows={4} required />

          <button type="submit">Apply pressure</button>
          {!pressureUrl && (
            <p className="intake-note">
              Set `NEXT_PUBLIC_INTAKE_PRESSURE_URL` to enable submissions.
            </p>
          )}
        </IntakeForm>
        <p className="intake-copy intake-copySmall">
          Pressure is not debate. It is structural counter-force.
        </p>
      </section>

      <section className="forge-card intake-card">
        <div className="intake-label">C. FUEL</div>
        <h2 className="intake-title">Continuation without leverage.</h2>
        <p className="intake-copy">
          The Forge consumes time, attention, and heat. If you want it to continue,
          fuel is accepted - without obligation, reward, or influence.
        </p>
        {fuelUrl ? (
          <a
            className="intake-button"
            href={normalizeUrl(fuelUrl)}
            target="_blank"
            rel="noreferrer"
          >
            Provide Fuel
          </a>
        ) : (
          <p className="intake-note">
            Set `NEXT_PUBLIC_INTAKE_FUEL_URL` for the fuel link.
          </p>
        )}
        <p className="intake-copy intake-copySmall">
          Fuel does not purchase verdicts. It purchases continuation.
        </p>
      </section>

      <section className="forge-card intake-card">
        <div className="intake-label">CONTACT</div>
        <h2 className="intake-title">Builders only.</h2>
        <p className="intake-copy">
          Direct contact is reserved for builders, not spectators. If you need a
          response, be precise.
        </p>
        <div className="intake-contact">
          <div>
            <div className="intake-copySmall">Email</div>
            {contactEmail ? (
              <a className="forge-link" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            ) : (
              <span className="intake-note">Set `NEXT_PUBLIC_INTAKE_EMAIL`.</span>
            )}
          </div>
          <div>
            <div className="intake-copySmall">One external platform</div>
            {contactPlatform ? (
              <a
                className="forge-link"
                href={normalizeUrl(contactPlatform)}
                target="_blank"
                rel="noreferrer"
              >
                {contactPlatformLabel}
              </a>
            ) : (
              <span className="intake-note">Set `NEXT_PUBLIC_INTAKE_PLATFORM_URL`.</span>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
