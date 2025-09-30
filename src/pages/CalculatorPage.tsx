import { useState, useMemo, useEffect, useCallback } from "react";
import styles from "../styles/CalculatorPage.module.css";
import controls from "../styles/Controls.module.css";

import Disclaimer from "../components/steps/Disclaimer";
import DPC from "../components/steps/DPC";
import EI, { type EIState } from "../components/steps/EI";
import CB, { type CBState } from "../components/steps/CB";
import Result from "../components/steps/Result";
import Stepper from "../components/Stepper";
import { CB_PROPERTIES } from "../types/types";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

type ScoreMap = Record<string, number | null>;

export type CalculatorState = {
  dpcValue: number;
  dpcScores: ScoreMap;
  ei: number;
  cb: number;
};

const initial: CalculatorState = {
  dpcValue: 0,
  dpcScores: {},
  ei: 0,
  cb: 0,
};

type Step = 0 | 1 | 2 | 3 | 4;

/** EI = max among enabled rows */
function computeEIValue(state?: EIState): number {
  if (!state) return 0;
  let maxVal = 0;
  for (const key of Object.keys(state.enabled)) {
    if (!state.enabled[key]) continue;
    const v = state.scores[key];
    if (typeof v === "number" && v > maxVal) maxVal = v;
  }
  return maxVal;
}

/** CB = sum of enabled row scores */
function computeCBValue(state?: CBState): number {
  if (!state) return 0;
  let sum = 0;
  for (const key of Object.keys(state.enabled)) {
    if (!state.enabled[key]) continue;
    const v = state.scores[key];
    if (typeof v === "number") sum += v;
  }
  return sum;
}

/** All enabled rows must have a score, and at least one row must be enabled */
function allEnabledHaveScores(state?: {
  enabled: Record<string, boolean>;
  scores: Record<string, number | null>;
}): boolean {
  if (!state) return false;
  const keys = Object.keys(state.enabled);
  const enabledKeys = keys.filter((k) => state.enabled[k]);
  if (enabledKeys.length === 0) return false;
  return enabledKeys.every((k) => typeof state.scores[k] === "number");
}

export default function CalculatorPage() {
  const [state, setState] = useState<CalculatorState>(initial);
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // NEW: disclaimer
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);

  // EI/CB UI states (standalone)
  const [eiState, setEiState] = useState<EIState | undefined>(undefined);
  const [cbState, setCbState] = useState<CBState | undefined>(undefined);

  const eiValue = useMemo(() => computeEIValue(eiState), [eiState]);
  const cbValue = useMemo(() => computeCBValue(cbState), [cbState]);

  const isEIReady = useMemo(() => allEnabledHaveScores(eiState), [eiState]);
  const isCBReady = useMemo(() => allEnabledHaveScores(cbState), [cbState]);
  const isDPCReady = useMemo(() => {
    const keys = Object.keys(state.dpcScores);
    if (keys.length === 0) return false;
    return keys.every((k) => typeof state.dpcScores[k] === "number");
  }, [state.dpcScores]);

  // Sync EI/CB numeric to overall state
  useEffect(() => {
    setState((s) => (s.ei === eiValue ? s : { ...s, ei: eiValue }));
  }, [eiValue]);
  useEffect(() => {
    setState((s) => (s.cb === cbValue ? s : { ...s, cb: cbValue }));
  }, [cbValue]);

  const handleEIChange = useCallback((st: EIState) => setEiState(st), []);
  const handleCBChange = useCallback((st: CBState) => setCbState(st), []);

  const computeSE = (s = state) => s.dpcValue * s.ei + s.cb;

  const handleRestart = () => {
    setState(initial);
    setEiState(undefined);
    setCbState(undefined);
    setDisclaimerAccepted(false);
    setStep(0);
    setDirection(-1);
  };

  const prefersReducedMotion = useReducedMotion();

  const slideVariants: Variants = {
    initial: (dir: 1 | -1) => ({ opacity: 0, x: 40 * dir }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: "easeOut" } },
    exit: (dir: 1 | -1) => ({ opacity: 0, x: -40 * dir, transition: { duration: 0.22, ease: "easeIn" } }),
  };
  const fadeVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
  const variants: Variants = prefersReducedMotion ? fadeVariants : slideVariants;

  const goNext = (to: Step) => {
    setDirection(1);
    setStep(to);
  };
  const goBack = (to: Step) => {
    setDirection(-1);
    setStep(to);
  };

  return (
    <>
      <h2 className={styles.title}>ENISA CALCULATOR</h2>

      <div className={styles.page}>
        <Stepper step={step} labels={["Disclaimer", "DPC", "EI", "CB", "Result"]} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            style={{ width: "100%" }}
          >
            {/* STEP 0: Disclaimer */}
            {step === 0 && (
              <>
                <Disclaimer
                  accepted={disclaimerAccepted}
                  onChange={setDisclaimerAccepted}
                />
                <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                  <button
                    className={controls.button}
                    onClick={() => disclaimerAccepted && goNext(1)}
                    disabled={!disclaimerAccepted}
                  >
                    Agree & Continue
                  </button>
                </div>
                {!disclaimerAccepted && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>
                    Please read and accept the disclaimer
                  </p>
                )}
              </>
            )}

            {/* STEP 1: DPC */}
            {step === 1 && (
              <>
                <DPC
                  value={state.dpcValue}
                  scores={state.dpcScores}
                  onChange={({ value, scores }) =>
                    setState((s) => ({ ...s, dpcValue: value, dpcScores: scores }))
                  }
                />
                <div style={{ display: "flex", justifyContent: "right", marginTop: 12 }}>
                  <button
                    className={controls.button}
                    onClick={() => isDPCReady && goNext(2)}
                    disabled={!isDPCReady}
                  >
                    ถัดไป (EI)
                  </button>
                </div>
                {!isDPCReady && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>
                    โปรดเพิ่มแถวและให้คะแนนทุกแถวก่อนดำเนินการต่อ
                  </p>
                )}
              </>
            )}

            {/* STEP 2: EI */}
            {step === 2 && (
              <>
                <EI
                  initialState={eiState}
                  onChange={handleEIChange}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                  <button className={controls.button} onClick={() => goBack(1)}>
                    ย้อนกลับ (DPC)
                  </button>
                  <button
                    className={controls.button}
                    onClick={() => isEIReady && goNext(3)}
                    disabled={!isEIReady}
                  >
                    ถัดไป (CB)
                  </button>
                </div>
                {!isEIReady && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>
                    โปรดเลือกอย่างน้อย 1 แถว (ติ๊ก Enabled และเลือกคะแนน) เพื่อไปขั้นตอนถัดไป
                  </p>
                )}
              </>
            )}

            {/* STEP 3: CB */}
            {step === 3 && (
              <>
                <CB
                  properties={CB_PROPERTIES}
                  initialState={cbState}
                  onChange={handleCBChange}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                  <button className={controls.button} onClick={() => goBack(2)}>
                    ย้อนกลับ (EI)
                  </button>
                  <button
                    className={controls.button}
                    onClick={() => isCBReady && goNext(4)}
                    disabled={!isCBReady}
                  >
                    ถัดไป (Result)
                  </button>
                </div>
                {!isCBReady && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>
                    โปรดเลือกอย่างน้อย 1 แถว (ติ๊ก Enabled และเลือกคะแนน) เพื่อไปขั้นตอนถัดไป
                  </p>
                )}
              </>
            )}

            {/* STEP 4: RESULT */}
            {step === 4 && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                <div style={{ width: "100%", maxWidth: 640 }}>
                  <Result state={state} se={computeSE()} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                    <button className={controls.button} onClick={() => goBack(3)}>
                      ย้อนกลับ (CB)
                    </button>
                    <button className={controls.button} onClick={handleRestart}>
                      เริ่มใหม่
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
