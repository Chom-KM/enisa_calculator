// src/components/steps/Result.tsx
import React from "react";
import type { CalculatorState } from "../../pages/CalculatorPage";
import styles from "../../styles/Steps.module.css";

type Props = {
  state: CalculatorState;
  se: number;
};

const Result: React.FC<Props> = ({ state, se }) => {
  let severityLabel = "";
  let severityClass = "";
  let severityRecommendation = "";

  if (se < 2) {
    severityLabel = "ความเสี่ยงระดับต่ำ";
    severityClass = styles.severityLow;
    severityRecommendation = "บุคคลไม่ถูกกระทบ หรือ อาจพบเจอกับความไม่สะดวกบางประการ ซึ่งสามารถจัดการได้โดยไม่ก่อให้เกิดปัญหาอะไร (การใช้ระยะเวลาเพื้อเข้าถึงข้อมูล เกิดความน่ารำคาญบางประการ เป็นต้น)";
  } else if (se < 3) {
    severityLabel = "ความเสี่ยงระดับกลาง";
    severityClass = styles.severityMedium;
    severityRecommendation = "บุคคลประสบกับความไม่สะดวกที่มีนัยสำคัญ ซึ่งสามารถจัดการได้ด้วยความยากเล็กน้อย (มีค่าใช้จ่าย การถูกปฎิเสธในการใช้บริการ การจากความเข้าใจ ความเครียด การป่วยทางกายภาพเล็กน้อย เป็นต้น)";
  } else if (se < 4) {
    severityLabel = "ความเสี่ยงระดับสูง";
    severityClass = styles.severityHigh;
    severityRecommendation = "บุคคลอาจประสบกับผลกระทบที่มีนัยสำคัญ ซึ่งจะจัดการด้วยความยากลำบาก (การยักยอกทรัพย์ การโดยธนาคาร Blacklist เกิดความเสียหายต่อทรัพย์สิน การสูญเสียงาน การโดนหมายศาล การที่สุขภาพทรุดโทรม เป็นต้น)";
  } else {
    severityLabel = "ความเสี่ยงระดับสูงมาก";
    severityClass = styles.severityVeryHigh;
    severityRecommendation = "บุคคลที่อาจประสบกับผลกระทบที่มีนัยสำคัญ หรือไม่สามารถเยียวยาแก้ไขได้ ซึ่งไม่สามารถจัดการได้ (ภัยทางการเงิน เช่น เกิดภาระหนี้มาก หรือ ไม่สามารภไปทำงานได้ การป่วยทางจิตใจหรือทางกายภาพ ความตาย เป็นต้น)";
  }

  return (
    <section>
      <div className={styles.stepH2}>
        <h2>Result</h2>
      </div>

      <table className={styles.table}>
        <tbody>
          <tr>
            <td>DPC</td>
            <td>{state.dpcValue}</td>
          </tr>
          <tr>
            <td>EI</td>
            <td>{state.ei}</td>
          </tr>
          <tr>
            <td>CB</td>
            <td>{state.cb}</td>
          </tr>
          <tr>
            <td>SE (DPC × EI + CB)</td>
            <td><strong>{se.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>

      {/* Severity box */}
      <div className={`${styles.severityBox} ${severityClass}`}>
        {severityLabel}
      </div>

      {/* Recommendation paragraph placeholder */}
      <p className={styles.recommendation}>
        {severityRecommendation}
      </p>
    </section>
  );
};

export default Result;
