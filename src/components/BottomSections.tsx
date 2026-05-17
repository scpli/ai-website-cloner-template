import Image from "next/image";

export default function BottomSections() {
  return (
    <section className="bg-[#08415C] pb-16 lg:pb-24">
      <div className="container-content mx-auto w-full max-w-[1140px] px-5 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Extension */}
          <div className="bg-[#672F8E] rounded-lg overflow-hidden">
            <div className="p-6 lg:p-8">
              <h3 className="text-white text-xl font-bold mb-3">
                申請延長逗留期限
              </h3>
              <p className="text-white text-sm mb-6">
                如你有意延長在港逗留期限，請瀏覽以下部分，通過適合途徑辦理延期事宜。
              </p>
              <a href="#" className="inline-block bg-white text-[#363636] text-sm font-medium px-4 py-2 rounded hover:opacity-80 transition-opacity">
                了解更多
              </a>
            </div>
            <div className="relative h-[200px]">
              <Image
                src="/images/landing/visa-application.png"
                alt="申請延長逗留期限"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Handbook */}
          <div className="bg-[#08415C] rounded-lg overflow-hidden border border-[#ffffff33]">
            <div className="p-6 lg:p-8">
              <h3 className="text-white text-xl font-bold mb-3">
                香港人才入境計劃簡要手冊
              </h3>
              <p className="text-white text-sm mb-6">
                這份手冊助你迅速了解各項入境計劃特點，期待你成為亞洲盛事之都的一份子！
              </p>
              <a href="#" className="inline-block bg-white text-[#363636] text-sm font-medium px-4 py-2 rounded hover:opacity-80 transition-opacity">
                下載手冊
              </a>
            </div>
            <div className="relative h-[200px]">
              <Image
                src="/images/landing/visa-application.png"
                alt="香港人才入境計劃簡要手冊"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-[#672F8E] rounded-lg overflow-hidden">
            <div className="p-6 lg:p-8">
              <h3 className="text-white text-xl font-bold mb-3">
                簽證申請問題
              </h3>
              <p className="text-white text-sm mb-6">
                瀏覽我們的「常見問題」，了解簽證申請及延長逗留期限的資訊。
              </p>
              <a href="#" className="inline-block bg-white text-[#363636] text-sm font-medium px-4 py-2 rounded hover:opacity-80 transition-opacity">
                查看常見問題
              </a>
            </div>
            <div className="relative h-[200px]">
              <Image
                src="/images/landing/visa-application.png"
                alt="簽證申請問題"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bottom arrow decoration */}
        <div className="arrow-crop pb-[58.6%] bg-no-repeat bg-contain mt-8"
          style={{ backgroundImage: "url(/images/visa/bottom-banner-0.png)" }}
        />
      </div>
    </section>
  );
}
