import React from "react";

export function AuthHeader({ title, subtitle, id }) {
  return (
    <section className="text-center sm:text-left" aria-label="Page introduction">
      <h2 id={id} className="font-display text-2xl sm:text-3xl font-bold text-[#141413] dark:text-[#F5F0E6]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1.5 text-xs text-[#6E675F] dark:text-[#9A9488]">
          {subtitle}
        </p>
      )}
    </section>
  );
}

export default AuthHeader;
