import React from "react";
import { CurrYear, SmartEduUrl, DevPrismUrl } from "../../../environment";

interface CopyrightFooterProps {
  className?: string;
}

const CopyrightFooter: React.FC<CopyrightFooterProps> = ({ className = "mb-0" }) => {
  return (
    <p className={className}>
      © {CurrYear}{" "}
      <a
        href={SmartEduUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover-a"
      >
        Smart Edu
      </a>
      . Powered by{" "}
      <a
        href={DevPrismUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover-a"
      >
        Dev Prism Pvt ltd.
      </a>
    </p>
  );
};

export default CopyrightFooter;
