import Image from "next/image";
import { HkteLogoSvg } from "@/components/icons";

const footerLinks = {
  "就業資訊": ["工作機會", "薪酬指數", "人才清單"],
  "活動情報及最新消息": ["活動及簽證講座登記", "全球人才高峯會", "最新消息"],
  "人才支援": ["關於我們", "聯絡我們", "指定合作夥伴", "支援服務"],
  "其他": ["常見問題", "移居香港指南"],
};

const socialLinks = [
  { name: "linkedin", href: "#" },
  { name: "facebook", href: "#" },
  { name: "instagram", href: "#" },
  { name: "youtube", href: "#" },
  { name: "wechat", href: "#" },
  { name: "xiaohongshu", href: "#" },
];

export default function Footer() {
  return (
    <footer className="block relative z-30 bg-[#232323] pt-16">
      <div className="mx-auto w-full max-w-[1440px] px-5 min-[1400px]:px-12">
        {/* Main footer content */}
        <div className="flex max-lg:flex-col justify-between lg:pb-12 border-grey-border lg:border-b"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.2)" }}
        >
          {/* Left column - logo and address */}
          <div className="flex flex-col gap-6 mb-8 lg:mb-0">
            <a href="#" className="inline-block w-[140px]">
              <HkteLogoSvg color="white" className="w-full h-auto" />
            </a>
            <div className="text-white text-xs space-y-2">
              <p>灣仔告士打道5號稅務大樓12樓</p>
              <p>（需提前預約安排）</p>
              <p className="mt-4">
                ENQUIRY@HKENGAGE.GOV.HK
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="w-5 hover:opacity-70 transition-all ease-in-out duration-200"
                >
                  <Image
                    src={`/images/social-media/${link.name}.svg`}
                    alt={link.name}
                    width={20}
                    height={20}
                  />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="text-white text-xs">
              <p className="mb-2">訂閱電子報</p>
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="電郵地址"
                  className="bg-transparent border border-[rgba(255,255,255,0.3)] rounded-l-full px-4 py-2 text-white text-xs placeholder:text-[rgba(255,255,255,0.5)] w-48"
                />
                <button className="bg-white text-[#363636] rounded-r-full px-4 py-2 text-xs hover:opacity-80 transition-opacity">
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-x-12 gap-y-8 lg:gap-x-16">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="flex flex-col gap-3 min-w-[140px]">
                <h4 className="text-white text-xs font-bold uppercase mb-1">
                  {title}
                </h4>
                {links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-white text-xs hover:opacity-70 transition-opacity"
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 flex max-lg:flex-col justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-x-3 text-white text-xs">
            <span>© 2026 年版權所有</span>
          </div>

          <div className="flex gap-x-3 items-center">
            <Image
              src="/images/footer/web-accessibility-conformance-tc.png"
              alt="無障礙網頁"
              width={88}
              height={31}
            />
            <a href="#">
              <Image
                src="/images/footer/wcag2.1AA-v.png"
                alt="WCAG 2.1 AA"
                width={88}
                height={31}
              />
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-white text-[10px] pb-6">
          <p>
            我們承諾盡力確保本網站符合萬維網聯盟（W3C）《無障礙網頁內容指引》（WCAG）2.1 AA級別標準，但由於網站採用第三方虛擬智能助理查詢服務方案，有關方案並無法納入WCAG 2.1 AA級別的無障礙要求。
          </p>
        </div>
      </div>
    </footer>
  );
}
