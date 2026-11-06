import { AskKendall } from '@/app/_components/AskKendall';
export const metadata = { title: 'Find something · Guidebook' };
export default function GuestHelp() {
  return <section className="gb-section"><h2>What do you need?</h2><AskKendall embedded /><div className="gb-help"><div><h3>Need a hand?</h3><p>Message your host through your reservation for help with the house.</p></div><div><h3>Immediate emergency</h3><p>Call 911 for fire, medical or water emergencies.</p></div></div></section>;
}
