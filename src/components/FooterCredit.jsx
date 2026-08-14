export function FooterCredit() {
    return (
      <footer
        className="absolute left-1/2 -translate-x-1/2 z-10"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
        }}
      >
        <p className="text-[10px] md:text-[11px] text-[#ffffff]/80 tracking-wide whitespace-nowrap">
          Made with love by{" "}
          <a
            href="https://www.linkedin.com/in/jainesh-prajapati/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ffffff]/80 hover:text-[#fdf6ee] transition-colors duration-300"
          >
            Jainesh
          </a>
        </p>
      </footer>
    );
  }