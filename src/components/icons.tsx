import { Search, ChevronDown } from "lucide-react";

// HKTE Logo SVG
export function HkteLogoSvg({ className = "", color = "white" }: { className?: string; color?: string }) {
  return (
    <svg className={`hkte-logo ${className}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 390.07">
      <g>
        <rect fill="#f85723" x="80.47" y="306.09" width="179.69" height="23.88" />
        <rect fill="#8ec63e" x="260.16" y="306.09" width="179.69" height="23.88" />
        <rect fill="#672f8e" x="439.84" y="306.09" width="179.69" height="23.88" />
      </g>
      <path fill={color} d="M537.56,154.6v-31.64h46.48c15.86,0,21.83-19.75,22.07-20.59l1.03-3.49h-69.59v-31.67h61.72c9.14,0,20.12-12.9,20.12-21v-3.06h-120.12v135.53h100.1c9.15,0,20.14-12.91,20.14-21.02v-3.06h-81.96Z" />
      <g>
        <path fill={color} d="M296.95,43.15c-4.99,0-10.71.81-15.41,6.22l-35.86,44.06-.22.27c-.72.72-4.3,4-9.65,4-.04,0-.07,0-.11,0h-1.85v-54.55h-38.28v135.53h10.07c15.56,0,28.22-13.35,28.22-29.77v-27.31h8.34c6.6.24,16.71-2.17,27.44-14.99.4-.42.83-.94,1.32-1.57.7-.86,1.39-1.75,2.06-2.69l.26-.36c.07-.08.13-.16.2-.24l48.83-58.61h-25.35Z" />
        <path fill={color} d="M289.51,128.95c-7.63-9.99-16.49-9.78-18-9.67h-29.75l38.81,50.46c.65.91,6.75,8.94,18.32,8.94h28.73l-38.11-49.73Z" />
      </g>
      <path fill={color} d="M352.68,24.06h116.76c9.14,0,20.12-12.9,20.12-21V0h-136.89v24.06Z" />
      <path fill={color} d="M118.75,97.65v-54.5h-38.28v135.53h10.05c15.57,0,28.23-13.36,28.23-29.79v-27.19h39.19c9.14,0,20.12-12.9,20.12-21v-3.06h-59.31Z" />
    </svg>
  );
}

// Chevron down icon
export function ChevronDownSvg({ className = "" }: { className?: string }) {
  return <ChevronDown className={className} />;
}

// Search icon
export function SearchSvg({ className = "" }: { className?: string }) {
  return <Search className={className} />;
}

// Chevron right icon for links
export function ChevronRightSvg({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path d="M12 3L6 9L12 15" stroke="#E00004" strokeWidth="1.33333" />
    </svg>
  );
}
