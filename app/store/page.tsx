import type { Metadata } from "next";
import MercantileDemo from "./MercantileDemo";
export const metadata:Metadata={title:"Kendall Pond Mercantile · Preview",description:"An interactive preview of the Lodge's little guest shop.",robots:{index:false,follow:false}};
export default function StorePage(){return <MercantileDemo/>;}
