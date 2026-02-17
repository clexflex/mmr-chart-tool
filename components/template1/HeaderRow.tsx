import Image from "next/image";
import type { ReactNode } from "react";

type HeaderRowProps = {
  headerDominance: string;
  headerCagrLead: string;
  headerCagrBody: string;
};

export function HeaderRow({
  headerDominance,
  headerCagrLead,
  headerCagrBody,
}: HeaderRowProps) {
  return (
    <div className="t1-header-row">
      <div className="t1-logo-wrap">
        <Image
          src="/MaximizeLogo.png"
          alt="Maximize Market Research"
          width={124}
          height={54}
          priority
        />
      </div>

      <div className="t1-header-block">
        <IconCircle kind="lightning" />
        <p className="t1-header-copy">{boldPrefix(headerDominance, " Market accounted")}</p>
      </div>

      <div className="t1-header-block t1-header-block-right">
        <IconCircle kind="flame" />
        <div>
          <div className="t1-cagr-lead">{headerCagrLead}</div>
          <p className="t1-header-copy">{headerCagrBody}</p>
        </div>
      </div>
    </div>
  );
}

function boldPrefix(text: string, delimiter: string): ReactNode {
  const index = text.indexOf(delimiter);
  if (index < 0) return text;

  return (
    <>
      <strong>{text.slice(0, index)}</strong>
      {text.slice(index)}
    </>
  );
}

type IconCircleProps = {
  kind: "lightning" | "flame";
};

function IconCircle({ kind }: IconCircleProps) {
  return (
    <div className="t1-icon-circle" aria-hidden>
      {kind === "lightning" ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M13.6 1.4L5.8 13.2H11L10 22.6L18.2 10.8H13L13.6 1.4Z"
            fill="#FFFFFF"
          />
        </svg>
      ) : (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
          <path
            d="M14.3 2.3C14.1 5.4 16.5 7.1 16.5 9.8C16.5 12.2 14.6 14.1 12.2 14.1C9.9 14.1 8 12.2 8 9.8C8 7.8 9.3 6.2 10.5 4.8C9 5.5 6.3 8.1 6.3 12.4C6.3 16 9.3 18.9 12.9 18.9C16.6 18.9 19.5 16 19.5 12.4C19.5 8.3 16.5 4.8 14.3 2.3ZM11.8 16.9C10.4 16.9 9.3 15.8 9.3 14.4C9.3 13.2 10.1 12.1 10.9 11.3C11.2 12.9 12.5 13.8 13.4 14.7C13.9 15.2 14.2 15.8 14.2 16.4C14.2 16.7 14.2 16.8 14.1 16.9H11.8Z"
            fill="#FFFFFF"
          />
        </svg>
      )}
    </div>
  );
}
