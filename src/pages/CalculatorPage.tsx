import { useState, useMemo, useEffect, useCallback } from "react";
import styles from "../styles/CalculatorPage.module.css";
import controls from "../styles/Controls.module.css";

import DPC from "../components/steps/DPC";
import EI, { type EIState } from "../components/steps/EI";
import CB, { type CBState } from "../components/steps/CB";
import Result from "../components/steps/Result";
import Stepper from "../components/Stepper";
import type { EICategoryKey } from "../types/types";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useRef } from "react";

import { EI_PROPERTIES, CB_PROPERTIES } from "../types/types";
import { DPC_PROPERTIES } from "../data/dpc_properties";

type ScoreMap = Record<string, number | null>;

export type CalculatorState = {
  dpcValue: number; // used in SE = dpc × ei + cb
  dpcScores: ScoreMap;
  ei: number; // EI = max enabled EI row score
  cb: number; // CB = sum of enabled CB row scores
};

const initial: CalculatorState = {
  dpcValue: 0,
  dpcScores: {}, // 🚫 no prefill, user adds rows
  ei: 0,
  cb: 0,
};

type Step = 0 | 1 | 2 | 3;

/** EI = max score among enabled rows */
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

/** CB = sum of all enabled row scores */
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

/** At least one enabled row with a chosen (number) score? */
function hasAnyEnabledWithScore(state?: {
  enabled: Record<string, boolean>;
  scores: Record<string, number | null>;
}): boolean {
  if (!state) return false;
  for (const key of Object.keys(state.enabled)) {
    if (!state.enabled[key]) continue;
    if (typeof state.scores[key] === "number") return true;
  }
  return false;
}

export default function CalculatorPage() {
  const [state, setState] = useState<CalculatorState>(initial);
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const prevDpcEiKeysRef = useRef<Set<EICategoryKey>>(new Set());

  // EI/CB UI states
  const [eiState, setEiState] = useState<EIState | undefined>(undefined);
  const [cbState, setCbState] = useState<CBState | undefined>(undefined);

  const eiValue = useMemo(() => computeEIValue(eiState), [eiState]);
  const cbValue = useMemo(() => computeCBValue(cbState), [cbState]);

  const isEIReady = useMemo(() => hasAnyEnabledWithScore(eiState), [eiState]);
  const isCBReady = useMemo(() => hasAnyEnabledWithScore(cbState), [cbState]);

  // DPC readiness: must have ≥1 selected row AND all selected rows scored
  const isDPCReady = useMemo(() => {
    const keys = Object.keys(state.dpcScores);
    if (keys.length === 0) return false;
    return keys.every((k) => typeof state.dpcScores[k] === "number");
  }, [state.dpcScores]);

  // Sync EI numeric value to calculator state
  useEffect(() => {
    setState((s) => (s.ei === eiValue ? s : { ...s, ei: eiValue }));
  }, [eiValue]);

  // Sync CB numeric value to calculator state
  useEffect(() => {
    setState((s) => (s.cb === cbValue ? s : { ...s, cb: cbValue }));
  }, [cbValue]);

  useEffect(() => {
    // Current DPC keys and their mapped EI keys (typed)
    const dpcKeys = Object.keys(state.dpcScores);
    const currentEiKeys = new Set<EICategoryKey>(
      DPC_PROPERTIES
        .filter((p) => dpcKeys.includes(p.key) && p.eiKey)
        .map((p) => p.eiKey!)
    );

    const prevEiKeys = prevDpcEiKeysRef.current;

    // Compute added / removed sets
    const added: EICategoryKey[] = [];
    const removed: EICategoryKey[] = [];

    for (const k of currentEiKeys) {
      if (!prevEiKeys.has(k)) added.push(k);
    }
    for (const k of prevEiKeys) {
      if (!currentEiKeys.has(k)) removed.push(k);
    }

    // Update EI state: enable only newly-added; disable only removed; leave unchanged as-is
    if (added.length || removed.length) {
      setEiState((prev) => {
        const prevEnabled = (prev?.enabled ?? {}) as Record<EICategoryKey, boolean>;
        const prevScores  = (prev?.scores  ?? {}) as Record<EICategoryKey, number | null>;

        const nextEnabled: Record<EICategoryKey, boolean> = { ...prevEnabled };
        const nextScores:  Record<EICategoryKey, number | null> = { ...prevScores };
        let changed = false;

        // Newly added DPC→EI links → enable (select) those EI rows (once)
        for (const eiKey of added) {
          if (!nextEnabled[eiKey]) {
            nextEnabled[eiKey] = true;
            changed = true;
          }
          if (!(eiKey in nextScores)) {
            nextScores[eiKey] = null; // no forced score
            changed = true;
          }
        }

        // Removed DPC→EI links → disable and clear score
        for (const eiKey of removed) {
          if (nextEnabled[eiKey]) {
            nextEnabled[eiKey] = false;
            changed = true;
          }
          if (nextScores[eiKey] !== null) {
            nextScores[eiKey] = null;
            changed = true;
          }
        }

        if (!changed && prev) return prev;
        return { enabled: nextEnabled, scores: nextScores };
      });
    }

    // Update the ref for next diff
    prevDpcEiKeysRef.current = currentEiKeys;
  }, [state.dpcScores]);


  const handleEIChange = useCallback((st: EIState) => setEiState(st), []);
  const handleCBChange = useCallback((st: CBState) => setCbState(st), []);

  const computeSE = (s = state) => s.dpcValue * s.ei + s.cb;

  const handleRestart = () => {
    setState(initial);
    setEiState(undefined);
    setCbState(undefined);
    setStep(0);
    setDirection(-1);
  };

  const prefersReducedMotion = useReducedMotion();

  const slideVariants: Variants = {
    initial: (dir: 1 | -1) => ({ opacity: 0, x: 40 * dir }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.28, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: -40 * direction,
      transition: { duration: 0.22, ease: "easeIn" },
    },
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
        <Stepper step={step} labels={["DPC", "EI", "CB", "Result"]} />

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
            {/* STEP 0: DPC --------------------------------------------------- */}
            {step === 0 && (
              <>
                <DPC
                  value={state.dpcValue}
                  scores={state.dpcScores}
                  onChange={({ value, scores }) =>
                    setState((s) => ({ ...s, dpcValue: value, dpcScores: scores }))
                  }
                  // catalog={DPC_PROPERTIES} // optional; DPC defaults to this catalog
                />
                <div style={{ display: "flex", justifyContent: "right", marginTop: 12 }}>
                  <button
                    className={controls.button}
                    onClick={() => isDPCReady && goNext(1)}
                    disabled={!isDPCReady}
                  >
                    ถัดไป (EI)
                  </button>
                </div>
                {!isDPCReady && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>
                    โปรดเพิ่มข้อมูลและใส่คะแนนทุกบรรทัดก่อนดำเนินการต่อ
                  </p>
                )}
              </>
            )}

            {/* STEP 1: EI ---------------------------------------------------- */}
            {step === 1 && (
              <>
                <EI
                  properties={EI_PROPERTIES} // show all EI rows; DPC→EI sync controls enabled/disabled
                  initialState={eiState}
                  onChange={handleEIChange}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                  <button className={controls.button} onClick={() => goBack(0)}>
                    ย้อนกลับ (DPC)
                  </button>
                  <button
                    className={controls.button}
                    onClick={() => isEIReady && goNext(2)}
                    disabled={!isEIReady}
                  >
                    ถัดไป (CB)
                  </button>
                </div>
                {!isEIReady && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>
                    โปรดเลือกและให้คะแนนอย่างน้อย 1 แถว เพื่อไปขั้นตอนถัดไป
                  </p>
                )}
              </>
            )}

            {/* STEP 2: CB ---------------------------------------------------- */}
            {step === 2 && (
              <>
                <CB
                  properties={CB_PROPERTIES}
                  initialState={cbState}
                  onChange={handleCBChange}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                  <button className={controls.button} onClick={() => goBack(1)}>
                    ย้อนกลับ (EI)
                  </button>
                  <button
                    className={controls.button}
                    onClick={() => isCBReady && goNext(3)}
                    disabled={!isCBReady}
                  >
                    ถัดไป (Result)
                  </button>
                </div>
                {!isCBReady && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>
                    โปรดเลือกและให้คะแนนอย่างน้อย 1 แถว เพื่อไปขั้นตอนถัดไป
                  </p>
                )}
              </>
            )}

            {/* STEP 3: RESULT ------------------------------------------------ */}
            {step === 3 && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                <div style={{ width: "100%", maxWidth: 640 }}>
                  <Result state={state} se={computeSE()} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                    <button className={controls.button} onClick={() => goBack(2)}>
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
