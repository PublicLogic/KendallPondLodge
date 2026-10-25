"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icons";
export function PublicMobileNav({bookEnabled}:{bookEnabled:boolean}) {
 const path=usePathname();
 const items=[
 {href:"/",label:"Home",icon:"home"},
 {href:"/lodge",label:"Lodge",icon:"house"},
 {href:bookEnabled?"/book":"/rates",label:bookEnabled?"Book":"Rates",icon:"arrival",primary:true},
 {href:"/explore",label:"Explore",icon:"outside"},
 {href:"/guidebook",label:"Guide",icon:"help"},
 ];
 return <nav className="public-mobile-nav" aria-label="Property navigation">
 {items.map(item=><Link key={item.href} href={item.href} className={item.primary?"public-mobile-nav-primary":undefined} aria-current={(item.href==="/"?path==="/":path===item.href||path.startsWith(item.href+"/"))?"page":undefined}><Icon name={item.icon} size={19}/><span>{item.label}</span></Link>)}
 </nav>;
}
