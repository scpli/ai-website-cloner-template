export default function IntroSection() {
  return (
    <section className="relative bg-[#08415C] pt-12 md:pt-20 pb-0 text-white bg-no-repeat bg-right-top"
      style={{ backgroundImage: "url(/images/landing-arrow.png)" }}
    >
      <div className="mask mask-n absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "url(/images/bg-n-mask.png)" }}
      />
      <div className="container-content relative z-10 mx-auto w-full max-w-[1140px] px-5 lg:px-0">
        <div className="flex flex-col gap-y-2 mb-15">
          <h2 className="text-white text-[40px] font-bold leading-[46px]">
            尋找適合你的人才入境計劃
          </h2>
          <div className="text-justify">
            <p className="mb-4">
              香港特別行政區政府為有意來港工作及定居的專業人才提供七項人才入境計劃。以下概述各計劃的主要資格，以及「高端人才通行證計劃」下認可的「合資格大學」名單。
            </p>
            <p>
              你也可以使用我們的{" "}
              <u className="cursor-pointer hover:opacity-80">
                入境計劃配對工具
              </u>
              ，只需五分鐘即可快速評估符合申請資格的計劃。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
