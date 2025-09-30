import React from "react";
import styles from "../../styles/Steps.module.css";

type Props = {
  accepted: boolean;
  onChange: (next: boolean) => void;
};

const Disclaimer: React.FC<Props> = ({ accepted, onChange }) => {
  return (
    <section>
      <div className={styles.stepH2}>
        <h2>Disclaimer</h2>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "16px",
          lineHeight: 1.6,
          color: "#374151",
        }}
      >
        <p>
          User Guidelines:
        </p>
        <p style={{ marginTop: 8 }}>
            This assessment form is intended only as a preliminary tool to help users evaluate the severity of personal data breach incidents. It cannot be used as the sole principle for application. Users should also assess other factors as specified by law.
        </p>
        <p style={{ marginTop: 8 }}>
            This assessment form is based on the Recommendations for a methodology of the assessment of severity of personal data breaches, Working Document, v1.0, December 2013 of the European Union Agency for Network and Information Security (ENISA). Users can learn more at the <a href="https://www.enisa.europa.eu/publications/dbn-severity">Enisa Recommendation</a>.
        </p>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 12,
            userSelect: "none",
          }}
        >
        </label>
      </div>
        <input
            type="checkbox"
            style={{ marginTop: 10 }}
            checked={accepted}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span style={{ marginLeft: 8, marginTop: 5 }}>
            I have read and accept the disclaimer
          </span>
    </section>
  );
};

export default Disclaimer;
