import VisaCard from "./VisaCard";

const visaSchemes = [
  {
    number: 1,
    title: "高端人才通行證計劃",
    intro: "有意來港工作及定居，而未在港獲聘的人才，可根據高端人才通行證計劃提出申請。申請人可選擇以下申請類別：",
    qualifications: [
      {
        label: "申請資格",
        items: [
          "申請人在緊接申請前一年，全年收入達港幣250萬元或以上，或等值的外幣(A類申請);",
          "申請人獲合資格大學頒授學士學位，並在緊接申請前五年內累積至少三年工作經驗(B類申請)；或",
          "申請人在緊接申請前五年內，獲合資格大學頒授學士學位，但工作經驗少於三年(C類申請)，這類申請受年度配額限制，且以先到先得的方式分配。此外，C類申請並不適用於在香港特區修讀全日制經本地評審課程而獲得學士學位的非本地學生。",
        ],
      },
    ],
    stayDuration: "根據高端人才通行證計劃獲准來港人士，一般首次入境可獲准在港逗留36個月（A類申請）或24個月（B類及C類申請），而不受其他逗留條件限制。申請延長逗留期限時，申請人須已在香港特區受聘並能從中獲得穩定收入，或已在香港特區開辦或參與業務；獲批准的申請人，一般可獲准延長逗留不多於三年，而不受其他逗留條件限制。符合頂尖人才類別資格人士延長逗留期限進一步放寬至6年。",
    eligibleUniLink: { label: "合資格大學", href: "#" },
    applyLink: { label: "立即申請", href: "https://www.gov.hk/tc/nonresidents/visarequire/visasentrypermits/applyttps.htm" },
  },
  {
    number: 2,
    title: "一般就業政策（適用於非內地居民）",
    qualifications: [
      {
        label: "受聘人士",
        items: [
          "已確實獲得聘用（包括自僱及以獨資或合夥形式經營業務），而有關職位確實空缺",
          "薪酬福利條件與當時本港的市場薪酬大致相同",
          "具備良好教育背景，通常指有關崗位的學士學位；但在特殊情況下，具備良好的技術資格、證明的專業能力及／或經驗及成就亦可接受",
        ],
      },
      {
        label: "企業家",
        items: [
          "擬在港開辦或參與業務的海外、台灣及澳門企業家，可根據一般就業政策提出申請",
          "投資者必須擁有良好教育背景，通常指有關崗位的學士學位；但在特殊情況下，具備良好的技術資格、證明的專業能力及／或經驗及成就亦可接受",
          "必須證明其投資計劃能為香港帶來重大經濟利益，包括但不限於：創造就業機會、引進新技術、開拓新市場等",
        ],
      },
    ],
    stayDuration: "透過一般就業政策獲准來港人士可以僱傭身份留港，一般首次入境可獲准在港以僱傭身份逗留36個月或根據其僱傭合約的有效期限而定（以較短者為準）。申請延長逗留期限時，有關申請只會在申請人仍然符合一般就業政策所訂的申請資格的情況下才會獲得考慮；成功申請者仍會以僱傭身份留港，而其延長逗留期限通常會以3+2年的模式或根據其僱傭合約的有效期限（以較短者為準）批出。符合頂尖人才類別資格人士一般會獲准延期逗留五年而不受其他逗留條件限制。",
    talentListLink: { label: "人才清單", href: "https://www.hkengage.gov.hk/zh-HK/talent-list" },
    techSpecialistLink: { label: "一般就業政策（技術專才類別）", href: "https://www.immd.gov.hk/hkt/services/visas/TPStream.html" },
    techSpecialistListLink: { label: "技術專才清單", href: "https://www.immd.gov.hk/pdf/TP_list.pdf" },
    talentListNote: "2018年制訂首份香港人才清單，旨在更有效及聚焦地吸引高質素人才，以配合香港經濟高增值及多元化的發展。經2025年檢討，清單現時涵蓋9個行業領域下的60項專業。符合相關專業資格的外來人才在申請一般就業政策時可獲得入境便利。",
    applyLink: { label: "立即申請", href: "https://www.gov.hk/tc/nonresidents/visarequire/visasentrypermits/applyemployment.htm" },
  },
  {
    number: 3,
    title: "輸入內地人才計劃 (適用於內地居民)",
    intro: "有意來港工作的內地專業人士，可根據輸入內地人才計劃提出申請。輸入內地人才計劃不限行業，主要申請資格包括：",
    qualifications: [
      {
        label: "申請資格",
        items: [
          "已確實獲得聘用，而從事的工作與其學歷或工作經驗有關，並且不能輕易覓得本地人擔任",
          "薪酬福利與市場水平相若",
          "具有良好教育背景、技術資格或經證明的專業經驗",
        ],
      },
    ],
    stayDuration: "透過輸入內地人才計劃獲准來港人士可以僱傭身份留港，一般首次入境可獲准在港以僱傭身份逗留36個月或根據其僱傭合約的有效期限而定（以較短者為準）。申請延長逗留期限時，有關申請只會在申請人仍然符合輸入內地人才計劃所訂的申請資格的情況下才會獲得考慮；成功申請者仍會以僱傭身份留港，而其延長逗留期限通常會以3+2年的模式或根據其僱傭合約的有效期限（以較短者為準）批出。符合頂尖人才類別資格人士一般會獲准延期逗留五年而不受其他逗留條件限制。",
    talentListLink: { label: "人才清單", href: "https://www.hkengage.gov.hk/zh-HK/talent-list" },
    techSpecialistLink: { label: "輸入內地人才計劃（技術專才類別）", href: "https://www.immd.gov.hk/hkt/services/visas/TPStream.html" },
    techSpecialistListLink: { label: "技術專才清單", href: "https://www.immd.gov.hk/pdf/TP_list.pdf" },
    talentListNote: "2018年制訂首份香港人才清單，旨在更有效及聚焦地吸引高質素人才，以配合香港經濟高增值及多元化的發展。經2025年檢討，清單現時涵蓋9個行業領域下的60項專業。符合相關專業資格的外來人才在申請輸入內地人才計劃時可獲得入境便利。",
    applyLink: { label: "立即申請", href: "https://www.gov.hk/tc/nonresidents/visarequire/visasentrypermits/applyemployment.htm" },
  },
  {
    number: 4,
    title: "非本地畢業生留港／回港就業安排",
    intro: "非本地畢業生可根據非本地畢業生留港/回港就業安排申請留港兩年尋找工作，主要申請資格包括：",
    qualifications: [
      {
        label: "申請資格",
        items: [
          "在香港修讀全日制經本地評審課程而獲得學士學位或更高資歷；或修讀內地與香港的大學按照《中華人民共和國中外合作辦學條例》，於粵港澳大灣區內地城市設立的高等教育合作辦學機構所提供的全日制課程而獲得學士學位或更高資歷",
          "首次入境時無須先獲得聘用(適用於應屆畢業生)",
          "如在畢業日期起計的六個月或之後申請，申請人須在提出申請時先獲得聘用，而受僱從事的工作通常是由學位持有人擔任，以及薪酬福利條件達到市場水平 (適用於非應屆畢業生)",
        ],
      },
    ],
    stayDuration: "根據非本地畢業生留港╱回港就業安排獲准來港就業的人士，一般首次入境可獲准在港逗留24個月而不受其他逗留條件限制。申請延長逗留期限時，非本地畢業生須已獲得聘用，或已在香港特區開辦或參與任何業務；申請如獲批准，申請人通常會獲准以3+3年的模式獲准在港逗留，而不受其他逗留條件限制。符合頂尖人才類別資格人士一般會獲准延期逗留6年而不受其他逗留條件限制。",
    applyLink: { label: "立即申請", href: "https://www.gov.hk/tc/residents/immigration/nonpermanent/applyiang/npr.htm" },
  },
  {
    number: 5,
    title: "優秀人才入境計劃",
    intro: "有意來港工作及定居，而未在港獲聘用的高技術人才或優才，可根據優秀人才入境計劃提出申請。優秀人才入境計劃不限行業，並設有以下兩套評核機制：",
    qualifications: [
      {
        label: "申請資格",
        items: [
          "綜合計分制 - 適用於高技術人才或優才12項涵蓋六大範疇的評核準則，包括：年齡、學歷、語文能力、工作經驗、全年收入及業務所有權",
          "成就計分制 - 適用於擁有傑出成就的優秀人才（例如奧運獎牌、諾貝爾獎、國家/國際獎項得主）",
        ],
      },
    ],
    stayDuration: "按本計劃「綜合計分制」獲准來港人士，一般首次入境可獲准在港逗留36個月而不受其他逗留條件限制。申請進一步延期逗留時，申請人須提供證明文件以證明已於香港定居及對香港有所貢獻，例如擔任學位程度、專家水平或高級的支薪職位，並且獲得穩定收入，或於香港建立或參與具合理規模的業務。獲批准延期逗留的申請人通常會以3+2年的模式獲准在港逗留，而不受其他逗留條件限制。符合頂尖人才類別資格人士一般會獲准延長逗留5年，而不受其他逗留條件限制。以「成就計分制」獲本計劃核准來港人士，一般首次入境可獲准在港逗留八年而不受其他逗留條件限制。",
    talentListLink: { label: "人才清單", href: "https://www.hkengage.gov.hk/zh-HK/talent-list" },
    eligibleUniLink: { label: "合資格大學綜合名單", href: "#" },
    talentListNote: "2018年制訂首份香港人才清單，旨在更有效及聚焦地吸引高質素人才，以配合香港經濟高增值及多元化的發展。經2025年檢討，清單現時涵蓋9個行業領域下的60項專業。符合相關專業資格的外來人才在申請優秀人才入境計劃時可獲得入境便利。",
    applyLink: { label: "立即申請", href: "https://www.gov.hk/tc/nonresidents/visarequire/visasentrypermits/applyqmas.htm" },
  },
  {
    number: 6,
    title: "科技人才入境計劃",
    intro: "科技人才入境計劃旨在透過快速處理安排，供合資格公司申請輸入非本地科技人才到香港從事研發工作。合資格公司須先申請配額，獲創新科技署發出配額的公司可相應地於為期24個月的配額有效期內為合資格人士申請工作簽證／進入許可。根據科技人才入境計劃來港就業的簽證／進入許可申請，主要申請資格包括：",
    qualifications: [
      {
        label: "申請資格",
        items: [
          "在遞交申請時，聘用公司獲創新科技署批出有效配額",
          "申請人主要從事先進通訊技術、人工智能、生物科技、網絡安全、數據分析、數碼娛樂、金融科技、綠色科技、集成電路設計、物聯網、材料科學、微電子、量子技術或機械人技術範疇的研發工作",
          "申請人持有具特別認受性的大學所頒授的科學、科技、工程或數學（STEM）學科學位",
          "薪酬應不低於香港類似職位現時的市場薪酬水平",
          "申請人符合創新科技署發出的獲發配額通知書上就相關職位列明的特定條件",
        ],
      },
    ],
    stayDuration: "透過科技人才入境計劃獲准來港人士，逗留期限模式為3+3+2年。符合頂尖人才類別資格人士逗留期限模式進一步放寬至3+5年，獲准延期逗留的五年不受其他逗留條件限制。",
    applyLink: { label: "立即申請", href: "https://www.gov.hk/tc/nonresidents/visarequire/visasentrypermits/applytechtas.htm" },
  },
  {
    number: 7,
    title: "輸入中國籍香港永久性居民第二代計劃",
    intro: "已移居海外的中國籍香港永久性居民的第二代，可根據此計劃申請來港。計劃不限行業，申請人在首次入境時無須先獲得聘用。計劃主要申請資格包括：",
    qualifications: [
      {
        label: "申請資格",
        items: [
          "年齡介乎18至40歲；在海外出生",
          "父或母至少一方在申請人提出申請時持有有效的香港永久性居民身份證，及在其出生時是已定居海外的中國籍人士",
          "具有良好教育背景（通常指持有學士學位）、技術資格或經證明的專業經驗",
          "具備良好中文或英文的書寫及口語能力（普通話或粵語）",
        ],
      },
    ],
    stayDuration: "根據輸入中國籍香港永久性居民第二代計劃獲准來港人士，一般首次入境可獲准在港逗留24個月而不受其他逗留條件限制。申請延長逗留期限時，申請人須已獲得聘用，或已在香港開辦或參與任何業務。申請如獲批准，申請人通常會獲准以3+3年的模式獲准延長逗留，而不受其他逗留條件限制。符合頂尖人才類別資格人士一般會獲准延期逗留6年而不受其他逗留條件限制。",
    applyLink: { label: "立即申請", href: "https://www.gov.hk/tc/residents/immigration/nonpermanent/secondgenerationhkpr/index.htm" },
  },
];

interface VisaCardsSectionProps {
  matchedSchemes?: number[] | null;
}

export default function VisaCardsSection({ matchedSchemes }: VisaCardsSectionProps) {
  const hasResults = matchedSchemes && matchedSchemes.length > 0;
  const schemesToShow = hasResults
    ? visaSchemes.filter(s => matchedSchemes.includes(s.number))
    : visaSchemes;

  return (
    <section id="visa-cards-section" className="bg-[#08415C] pb-10 lg:pb-20">
      <div className="container-content mx-auto w-full max-w-[1140px] px-5 lg:px-0">
        {/* Results banner */}
        {hasResults && (
          <div className="mb-8 p-4 rounded-lg bg-[#1a5f7a] border border-[#2a7f9a]">
            <h3 className="text-lg font-bold text-white mb-1">
              配對結果
            </h3>
            <p className="text-white/80 text-sm">
              根據您的問卷回答，系統為您篩選出 <span className="text-white font-semibold">{matchedSchemes.length}</span> 個入境計劃。以下為適合您的計劃詳情：
            </p>
          </div>
        )}
        {schemesToShow.map((scheme) => (
          <VisaCard key={scheme.number} {...scheme} />
        ))}
      </div>
    </section>
  );
}
