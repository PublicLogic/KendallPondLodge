"use client";

import {useState} from "react";
import {mercantilePaymentLinks} from "@/lib/mercantile-payment-links.mjs";
import {ProductArt} from "./ProductArt";
import styles from "./mercantile.module.css";

type Merchandise=(typeof mercantilePaymentLinks)[number];
type Group="All"|"Firewood"|"Handmade"|"Snacks";

const groups:readonly {key:Group;label:string;short:string}[]=[
  {key:"All",label:"Everything",short:"ALL"},
  {key:"Firewood",label:"Firewood",short:"FIRE"},
  {key:"Handmade",label:"Handmade",short:"MADE"},
  {key:"Snacks",label:"Snacks",short:"SNACK"},
];
const slots:Record<string,string>={
  "KPL-WOOD-001":"A1",
  "KPL-CRAFT-001":"B1",
  "KPL-HAT-001":"B2",
  "KPL-MITT-001":"B3",
  "KPL-SET-001":"B4",
  "KPL-SLIP-001":"B5",
  "KPL-CANDY-001":"C1",
  "KPL-COOKIE-001":"C2",
  "KPL-CHIP-001":"C3",
  "KPL-CANDY-002":"C4",
  "KPL-SNACK-002":"C5",
};
const currency=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);

function PayAction({item,checkoutEnabled,compact=false}:{
  item:Merchandise;checkoutEnabled:boolean;compact?:boolean;
}){
  const text="Pay for "+item.name+" securely with Stripe (quantity selected at Stripe checkout)";
  if(!checkoutEnabled){
    return <span className={compact?styles.mobileDisabled:styles.payDisabled} aria-disabled="true">
      Preview mode <span aria-hidden="true">↗</span>
    </span>;
  }
  return <a className={compact?styles.mobilePay:styles.payAction}
    href={item.stripeUrl} target="_blank" rel="noopener noreferrer"
    aria-label={text}>
    Pay on Stripe <span aria-hidden="true">↗</span>
  </a>;
}

export function VendingMachine({checkoutEnabled}:{checkoutEnabled:boolean}){
  const [group,setGroup]=useState<Group>("All");
  const [selectedSku,setSelectedSku]=useState("KPL-WOOD-001");

  const chosen=mercantilePaymentLinks.find((item)=>item.sku===selectedSku)??mercantilePaymentLinks[0];
  const displayed=group==="All"?mercantilePaymentLinks:mercantilePaymentLinks.filter((item)=>item.category===group);

  function changeGroup(next:Group){
    setGroup(next);
    if(next!=="All"&&chosen.category!==next){
      const first=mercantilePaymentLinks.find((item)=>item.category===next);
      if(first)setSelectedSku(first.sku);
    }
  }
  function luckyPick(){
    const all=mercantilePaymentLinks;
    const index=all.findIndex((item)=>item.sku===selectedSku);
    const step=1+Math.floor(Math.random()*(all.length-1));
    setSelectedSku(all[(index+step)%all.length].sku);
    setGroup("All");
  }

  return <section className={styles.machineSection} id="machine" aria-labelledby="machine-heading">
    <div className={styles.machineIntro}>
      <div>
        <span className={styles.microLabel}>KPL / 001 — DIGITAL MERCANTILE</span>
        <h2 id="machine-heading">Pick a slot. <em>Find your thing.</em></h2>
      </div>
      <p>Eleven little extras, no trip to town. Tap a compartment, see the price, then pay on your phone. Your item is on the Lodge shelves, not inside this screen.</p>
    </div>

    <div className={styles.machineFrame} data-vending-machine>
      <div className={styles.machineTop}>
        <div className={styles.machineLogo} aria-label="Kendall Pond Little Machine">
          <span className={styles.machineMonogram}>K<span>✳</span>PL</span>
          <span className={styles.machineName}>THE LITTLE<br/>MACHINE <small>NO. 001</small></span>
        </div>
        <div className={styles.machineStatus}>
          <span className={styles.statusLight} aria-hidden="true"/>
          SELF-SERVE · LODGE PICKUP
        </div>
      </div>

      <div className={styles.machineGrid}>
        <div className={styles.machineCabinet}>
          <div className={styles.cabinetUpper}>
            <div className={styles.cabinetLabel}>
              <div><span className={styles.monoTiny}>01 / THE SHELVES</span><h3>Choose your slot.</h3></div>
              <span className={styles.cabinetCount}>{displayed.length} shown</span>
            </div>
            <div className={styles.categoryControls} aria-label="Choose a shelf category">
              {groups.map((choice)=><button key={choice.key}
                type="button" aria-pressed={group===choice.key}
                className={group===choice.key?styles.categoryActive:styles.category}
                onClick={()=>changeGroup(choice.key)}>
                {choice.label}
              </button>)}
            </div>
          </div>

          <div className={styles.glassFrame}>
            <div className={styles.glassLine}>
              <span>CHOOSE A PRODUCT</span><span>11 ITEMS · 3 SHELVES</span>
            </div>
            <div className={styles.slotGrid} aria-label="Vending slots">
              {displayed.map((item)=><button key={item.sku}
                type="button"
                aria-pressed={selectedSku===item.sku}
                aria-label={"Slot "+slots[item.sku]+": "+item.name+", "+currency(item.priceCents)}
                className={selectedSku===item.sku?styles.slotSelected:styles.slot}
                onClick={()=>setSelectedSku(item.sku)}>
                <span className={styles.slotCode}>{slots[item.sku]}</span>
                <span className={styles.slotLight} aria-hidden="true"/>
                <span className={styles.artWrap} data-category={item.category}>
                  <ProductArt sku={item.sku} className={styles.slotIllustration}/>
                </span>
                <span className={styles.slotName}>{item.name}</span>
                <span className={styles.slotAmount}>{currency(item.priceCents)}</span>
                </button>)}
            </div>
            <div className={styles.glassFoot}>
              <span>DISPLAY ILLUSTRATIONS · ACTUAL BRANDS & COLORS MAY VARY</span>
              <span className={styles.glassSerial}>KPL—26</span>
            </div>
          </div>
          <div className={styles.cabinetTray}>
            <span className={styles.trayGroove} aria-hidden="true"/>
            <span>THE REAL GOODIES ARE ON THE SHELVES AT THE LODGE.</span>
            <span className={styles.trayGroove} aria-hidden="true"/>
          </div>
        </div>

        <aside className={styles.controlPanel} aria-label="Selected item and checkout">
          <div className={styles.consoleHeader}>
            <span className={styles.monoTiny}>02 / YOUR SELECTION</span>
            <span className={styles.consoleSerial}>KPL / READY</span>
          </div>
          <div className={styles.screen}>
            <div className={styles.screenTop}><span>SELECTED SLOT</span><strong>{slots[chosen.sku]}</strong></div>
            <div className={styles.screenArt} key={chosen.sku}>
              <ProductArt sku={chosen.sku} className={styles.screenIllustration}/>
              <span className={styles.screenHalo} aria-hidden="true"/>
            </div>
            <div className={styles.screenBottom}>
              <span>YOUR PICK</span>
              <strong className={styles.screenName}>{chosen.name}</strong>
              <p>{chosen.description}</p>
            </div>
          </div>
          <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
            Slot {slots[chosen.sku]} selected: {chosen.name}, {currency(chosen.priceCents)}.
          </p>
          <div className={styles.priceReadout}>
            <div><span>ONE ITEM</span><strong>{currency(chosen.priceCents)}</strong></div>
            <span className={styles.priceFine}>Price before any applicable tax</span>
          </div>
          <PayAction item={chosen} checkoutEnabled={checkoutEnabled}/>
          <p className={styles.checkoutExplanation}>
            {checkoutEnabled
              ?"Stripe handles secure payment. Choose the quantity on Stripe's checkout page."
              :"You can play with the machine. Real purchases are disabled in this preview."}
          </p>
          <div className={styles.consoleActions}>
            <button type="button" onClick={luckyPick} className={styles.surprise}>
              <span aria-hidden="true">✳</span> SURPRISE ME
            </button>
            <span>JUST FOR FUN. NOTHING CHARGED.</span>
          </div>
          <div className={styles.pickupBay}>
            <div className={styles.pickupHeader}><span>03 / PICKUP HATCH</span><span aria-hidden="true">↘</span></div>
            <div className={styles.pickupSlot}>
              <span className={styles.pickupGlow} aria-hidden="true"/>
              <strong>PAY → PICK UP → ENJOY</strong>
              <small>Keep your confirmation and grab your item from the labeled basket.</small>
            </div>
          </div>
        </aside>
      </div>

      <footer className={styles.machineBottom}>
        <span>NO COINS · NO SHIPPING · NO TRIP TO TOWN</span>
        <span>HOSTED BY NATE & ALLIE</span>
      </footer>
    </div>

    <div className={styles.bonusShelf}>
      <div className={styles.waterCode}>D0<span>✳</span></div>
      <div><span className={styles.microLabel}>BONUS SLOT</span><strong>Water's on us.</strong><p>Bottled water is complimentary. No checkout, no catch.</p></div>
      <strong className={styles.waterPrice}>FREE</strong>
    </div>

    <div className={styles.machineHow}>
      <span>HOW TO USE THE LITTLE MACHINE</span>
      <ol>
        <li><strong>01</strong> Tap a product slot.</li>
        <li><strong>02</strong> Pay securely through Stripe.</li>
        <li><strong>03</strong> Collect it at the Lodge.</li>
      </ol>
      <p>Each checkout is for one product type; adjust its quantity in Stripe. Check the physical shelf before paying. There is no automatic dispenser or live stock count yet.</p>
    </div>

    <div className={styles.mobileCheckout} aria-label="Selected product checkout">
      <div><small>SLOT {slots[chosen.sku]} · SELECTED</small>
      <strong>{chosen.name}</strong><b>{currency(chosen.priceCents)}</b></div>
      <PayAction item={chosen} checkoutEnabled={checkoutEnabled} compact/>
    </div>
  </section>;
}
