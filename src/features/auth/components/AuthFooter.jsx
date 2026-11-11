import React from "react";
import { Link } from "react-router-dom";

export function AuthFooter({ promptText, linkText, to }) {
  return (
    <section className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-4 text-center text-xs text-[#6E675F] dark:text-[#9A9488]" aria-label="Account navigation">
      {promptText}{" "}
      <Link
        to={to}
        className="font-semibold text-[#141413] dark:text-[#D4AF37] underline underline-offset-4 hover:text-[#C59B27]"
      >
        {linkText}
      </Link>
    </section>
  );
}

export default AuthFooter;
