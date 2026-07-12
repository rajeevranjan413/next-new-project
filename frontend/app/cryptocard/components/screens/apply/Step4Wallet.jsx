"use client";

import { Check, ShieldCheck } from "lucide-react";
import { useCryptoCard } from "../../../CryptoCardContext";
import { CHAINS } from "../../../config/chains";
import { CryptoIcon } from "../../icons/CryptoIcon";
import s from "../../../cryptocard.module.css";
import { useWallet } from "../../../hooks/useWallet";
import { useEffect } from "react";

function shortenAddress(addr) {
  if (!addr) return "";
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}
export default function Step4Wallet({ t }) {
  const { nextStep, prevStep, showToast } = useCryptoCard();
  const {
    address,
    isConnected,
    txResult,
    networks,
    selectedCaip,
    loading,
    disconnect,
    callWriteMethod,
  } = useWallet();

  useEffect(() => {
    if (!isConnected) {
      prevStep();
    }
  }, [isConnected]);

  const getCardSubmit = (step) => {
    console.log("txResult", txResult);
    if (txResult?.type) {
      nextStep(step);
    } else {
      showToast(
        txResult?.reason ||
          "Please select a network and confirm in your wallet."
      );
    }
  };

  return (
    <div className={`${s["step-panel"]} ${s.active}`}>
      <div className={s["step-title"]}>{t.step3Title}</div>
      <div className={s["step-sub"]}>{t.step3Sub}</div>

      <div className={`${s["step-note"]} ${s["step-note-green"]}`}>
        <ShieldCheck
          size={13}
          strokeWidth={2}
          style={{ flexShrink: 0, marginTop: 1, color: "var(--green)" }}
        />
        <span>
          <strong>Wallet connected.</strong> Choose the blockchain network your
          card will settle on — this is where you'll top up and spend USDT.
        </span>
      </div>

      <div className={s["w-section-lbl-a"]}>
        {" "}
        Connected · <b>{shortenAddress(address)}</b>{" "}
        <button
          className={s["icon-btn"]}
          onClick={disconnect}
          aria-label="Close"
          // style={{ visibility:'hidden' }}
        >
          Disconnect
        </button>{" "}
      </div>
      <div className={s["w-section-lbl"]}>{t.selectWallet}</div>
      {/* <div className={s.chgrid}>
        {CHAINS.map(c => {
          const sel = selectedChain === net.id;
          return (
            <div
              key={net.id}
              className={`${s.chb} ${sel ? s.sel : ''}`}
              onClick={() => setSelectedChain(net.id)}
            >
              <div className={s['chb-ic']}><CryptoIcon symbol={net.symbol} size={36} /></div>
              <div className={s['chb-body']}>
                <div className={s['chb-nm']}>{net.name}</div>
                <div className={s['chb-desc']}>{net.desc}</div>
              </div>
              <span className={s['chb-tag']}>{net.network}</span>
              <div className={s['chb-radio']}>
                {sel && <Check size={11} strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div> */}
      {/* <button
        className="icon-btn"
        onClick={disconnect}
        aria-label="Close"
        // style={{ visibility:'hidden' }}
      >
        logouttt
      </button> */}
      <div className={s.chgrid}>
        {networks.map((net) => {
          const busy = loading && selectedCaip === net.caip;
          return (
            <>
              <div
                key={net.id}
                // className={`${s.chb} ${net.granted ? s.sel : 'disabled'}`}
                className={`${s.chb}  ${
                  net.granted ? "" : `${s["networkdisabled"]}`
                }`}
                // onClick={() => setSelectedChain(net.id)}
                onClick={() => net.granted && callWriteMethod(net.caip)}
              >
                <div className={s["chb-ic"]}>
                  <CryptoIcon symbol={net.symbol} size={36} />
                </div>
                <div className={s["chb-body"]}>
                  <div className={s["chb-nm"]}>{net.name}</div>
                  <div className={s["chb-desc"]}>
                    {/* {net.desc} */}
                    {!net.granted
                      ? " Not shared by wallet"
                      : busy
                      ? "Confirm in wallet…"
                      : ""}
                  </div>
                </div>
                <span className={s["chb-tag"]}>{net.network}</span>
                <div className={s["chb-radio"]}>
                  {busy && <Check size={11} strokeWidth={3} />}
                </div>
              </div>
            </>
          );
        })}
      </div>

      {/* <div className={s["terms-row"]}>
        <input
          type="checkbox"
          id="termsChk"
          checked={termsChecked}
          onChange={(e) => setTermsChecked(e.target.checked)}
        />
        <label htmlFor="termsChk">
          I agree to the{" "}
          <a onClick={() => openSheet("terms")}>Terms & Conditions</a> and
          Reward Claim Policy.
        </label>
      </div> */}

      <div className={s["step-nav"]}>
        <button className={s["btn-back"]} onClick={prevStep}>
          {t.btnBack}
        </button>
        <button
          className={`${s["btn-next"]} ${
            txResult?.type ? "" : `${s["networkdisabled"]}`
          }`}
          onClick={() => getCardSubmit(4)}
        >
          {t.btn3Next}
        </button>
      </div>
    </div>
  );
}
