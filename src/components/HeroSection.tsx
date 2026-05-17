export default function HeroSection() {
  return (
    <div className="relative -mt-[72px]">
      {/* Hero banner */}
      <section
        className="relative z-10 flex items-end h-80 lg:h-[526px] pt-6 px-5 lg:pt-0 lg:px-0 bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: "url(/images/landing/visa-application.png)" }}
      >
        <div className="container-content mx-auto w-full max-w-[1140px] px-5 lg:px-0 pb-12 lg:pb-16">
          <div className="relative">
            <h1 className="text-white text-4xl lg:text-[56px] font-bold leading-tight">
              簽證資訊
            </h1>
            {/* Red underline */}
            <div className="w-12 h-1 bg-[#E00004] mt-2" />
          </div>
        </div>
      </section>
      {/* Red stripe below hero */}
      <div className="h-3 bg-[#E00004]" />
    </div>
  );
}
