const Base = ({ size = 20, stroke = "currentColor", w = 1.8, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

export const LockIcon = (p) => (
  <Base {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Base>
);
export const LockBadgeIcon = (p) => (
  <Base {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="16" r="1.2" fill="currentColor" />
  </Base>
);
export const MailIcon = (p) => (
  <Base {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Base>
);
export const EyeIcon = (p) => (
  <Base {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Base>
);
export const EyeOffIcon = (p) => (
  <Base {...p}>
    <path d="M2 12s3.6-7 10-7c2 0 3.8.7 5.3 1.6M22 12s-3.6 7-10 7c-2 0-3.8-.7-5.3-1.6" />
    <circle cx="12" cy="12" r="3" /><path d="M3 3l18 18" />
  </Base>
);
export const CheckIcon = (p) => (<Base w={3} {...p}><path d="M5 12.5l4.5 4.5L19 7" /></Base>);
export const HeadsetIcon = (p) => (
  <Base w={1.6} {...p}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" />
    <path d="M19 19c0 1.5-1.5 2-4 2" />
  </Base>
);
export const PinIcon = (p) => (
  <Base w={1.7} {...p}><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.5" /></Base>
);
export const UsersIcon = (p) => (
  <Base w={1.7} {...p}>
    <circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
    <circle cx="17" cy="7" r="2.4" /><path d="M16.5 13.2c2.6.2 4.5 2.2 4.5 5" />
  </Base>
);
export const ChartIcon = (p) => (
  <Base w={1.7} {...p}><rect x="4" y="13" width="4" height="7" /><rect x="10" y="9" width="4" height="11" /><rect x="16" y="4" width="4" height="16" /></Base>
);
export const ShieldIcon = (p) => (
  <Base w={1.7} {...p}><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z" /><path d="M8.8 12l2.4 2.4 4.2-4.6" /></Base>
);
