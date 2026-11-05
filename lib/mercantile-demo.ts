/** Mock-only catalog. Replace with property-scoped StayOS catalog API before launch.
 * Figures from Pine Ledge Farm financial model; NOT live stock or offers.
 */
export type StoreItem = {
  id: string; name: string; detail: string; category: string;
  priceCents: number; costCents: number; onHand: number;
  inventoryMode: "stock" | "made_to_order"; source: "wholesale" | "consignment" | "made_to_order";
  symbol: string; enabled: boolean;
};
export const storeItems: StoreItem[] = [
  { id:"wood",name:"Firewood bundle",detail:"A little more time by the fire.",category:"For tonight",priceCents:1000,costCents:400,onHand:8,inventoryMode:"stock",source:"wholesale",symbol:"🪵",enabled:true },
  { id:"homegoods",name:"Local knitwear & homegoods",detail:"Something warm to take home. Styles vary.",category:"Take home",priceCents:4500,costCents:1400,onHand:3,inventoryMode:"stock",source:"consignment",symbol:"🧶",enabled:true },
  { id:"honey",name:"Local honey or maple",detail:"From our neighbors. Pending supplier and retail review.",category:"Local favorites",priceCents:1800,costCents:1100,onHand:0,inventoryMode:"stock",source:"consignment",symbol:"🍯",enabled:false },
  { id:"coffee",name:"Coffee, cocoa & essentials",detail:"The little things you might have forgotten. Pending retail review.",category:"For tonight",priceCents:800,costCents:400,onHand:0,inventoryMode:"stock",source:"consignment",symbol:"☕",enabled:false },
];
export const dollars=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(cents/100);
