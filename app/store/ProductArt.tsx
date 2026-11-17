// Decorative category illustrations for the digital Mercantile machine.
// Not product photographs: actual colors, brands and styles vary on the Lodge shelves.
type Props={sku:string; className?:string};

function Cap({small=false}:{small?:boolean}){
  return <g transform={small?"translate(3 18) scale(.7)":"translate(0 0)"}>
    <path d="M32 104c-1-44 17-69 48-69s49 25 48 69z" fill="#b68698" stroke="#663b54" strokeWidth="4"/>
    <path d="M42 91c10-6 16-6 26 0s16 6 27 0 17-6 27 0" fill="none" stroke="#f3d8d3" strokeWidth="6" opacity=".9"/>
    <path d="M47 69c11-6 18-6 30 1s19 4 32-3" fill="none" stroke="#e8c1be" strokeWidth="5"/>
    <rect x="28" y="101" width="104" height="21" rx="8" fill="#efd5ca" stroke="#663b54" strokeWidth="4"/>
    <circle cx="80" cy="28" r="13" fill="#ecd2cd" stroke="#663b54" strokeWidth="3"/>
  </g>;
}
function Mitten({x=0,y=0,scale=1}:{x?:number;y?:number;scale?:number}){
  return <g transform={"translate("+x+" "+y+") scale("+scale+")"}>
    <path d="M24 90V45c0-17 11-29 24-29 14 0 22 11 22 26v11l7-6c12-10 27 4 19 16L66 98z" fill="#a3c9b5" stroke="#3c6855" strokeWidth="4" strokeLinejoin="round"/>
    <rect x="18" y="89" width="56" height="18" rx="4" fill="#e5dfc7" stroke="#3c6855" strokeWidth="3"/>
    <path d="M28 54h34M27 65h32" stroke="#e2f0df" strokeWidth="4" strokeLinecap="round" opacity=".75"/>
  </g>;
}
function Bag({accent="#b7d089",label="SNACK"}:{accent?:string;label?:string}){
  return <g>
    <path d="M40 26h80l7 114-7 10H39l-8-10z" fill={accent} stroke="#253e36" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M40 34h80M39 143h82" stroke="#fff9e7" strokeWidth="7" strokeLinecap="round"/>
    <path d="M43 57c21-16 43-14 75 0M43 108c23 11 51 13 75-3" fill="none" stroke="#fffbe8" strokeWidth="6" opacity=".75"/>
    <ellipse cx="79" cy="89" rx="27" ry="22" fill="#f9e5b2" stroke="#3d5945" strokeWidth="3"/>
    <text x="80" y="94" textAnchor="middle" fill="#315141" fontWeight="800" fontSize="13" fontFamily="system-ui,sans-serif">{label}</text>
  </g>;
}
export function ProductArt({sku,className}:Props){
 const kind=sku.includes("WOOD")?"wood":sku.includes("CRAFT")?"friend":sku.includes("SET")?"set":sku.includes("HAT")?"hat":sku.includes("MITT")?"mittens":sku.includes("SLIP")?"slippers":sku.includes("COOKIE")?"cookie":sku.includes("CHIP")?"chips":sku.includes("CANDY-002")?"bar":sku.includes("CANDY")?"candy":"snack";
 return <svg className={className} viewBox="0 0 160 170" aria-hidden="true" focusable="false" fill="none" xmlns="http://www.w3.org/2000/svg">
   <ellipse cx="80" cy="151" rx="56" ry="9" fill="#091f1b" opacity=".13"/>
   {kind==="wood"&&<g transform="translate(0 6)">
     <path d="M38 114L86 76l53 30-46 39z" fill="#8d5b37" stroke="#60452f" strokeWidth="4"/>
     <path d="M24 118l47-44 33 28-44 44z" fill="#b67c4f" stroke="#674831" strokeWidth="4"/>
     <ellipse cx="60" cy="126" rx="17" ry="16" transform="rotate(-45 60 126)" fill="#ead0a2" stroke="#855c3f" strokeWidth="4"/>
     <ellipse cx="60" cy="126" rx="8" ry="7" transform="rotate(-45 60 126)" stroke="#b89569" strokeWidth="3"/>
     <path d="M45 81l43-40 33 27-42 39z" fill="#97623d" stroke="#60422d" strokeWidth="4"/>
     <ellipse cx="78" cy="90" rx="16" ry="17" transform="rotate(-42 78 90)" fill="#f0d5a7" stroke="#81583a" strokeWidth="4"/>
     <ellipse cx="78" cy="90" rx="7" ry="9" transform="rotate(-42 78 90)" stroke="#bc996a" strokeWidth="3"/>
   </g>}
   {kind==="friend"&&<g>
     <ellipse cx="80" cy="113" rx="43" ry="37" fill="#a6b899" stroke="#526953" strokeWidth="4"/>
     <circle cx="46" cy="51" r="20" fill="#a6b899" stroke="#526953" strokeWidth="4"/>
     <circle cx="114" cy="51" r="20" fill="#a6b899" stroke="#526953" strokeWidth="4"/>
     <circle cx="80" cy="72" r="48" fill="#b4c6a9" stroke="#526953" strokeWidth="4"/>
     <ellipse cx="80" cy="93" rx="23" ry="19" fill="#f6e7cb"/>
     <ellipse cx="64" cy="72" rx="5" ry="6" fill="#283d35"/><ellipse cx="96" cy="72" rx="5" ry="6" fill="#283d35"/>
     <path d="M74 90q6 5 12 0" stroke="#526953" strokeWidth="3" strokeLinecap="round"/>
     <path d="M46 106q34 20 68 0" stroke="#b98484" strokeWidth="13" strokeLinecap="round"/>
     <path d="M49 135q-4 13 10 14h10M111 135q4 13-10 14H91" fill="#a6b899" stroke="#526953" strokeWidth="4"/>
   </g>}
   {kind==="hat"&&<Cap/>}
   {kind==="mittens"&&<><Mitten x={-12} y={18} scale={.9}/><Mitten x={85} y={4} scale={.8}/></>}
   {kind==="set"&&<><g transform="translate(6 4)"><Cap small/></g><Mitten x={86} y={64} scale={.56}/></>}
   {kind==="slippers"&&<g>
     <path d="M34 111c5-21 24-53 38-48 20 7 19 38 8 61-8 18-34 24-44 14-5-5-6-16-2-27z" fill="#b6a4b7" stroke="#5e4b65" strokeWidth="4"/>
     <path d="M85 103c3-23 25-48 40-44 18 6 13 40 1 61-10 17-31 20-39 10-6-7-6-16-2-27z" fill="#dec2b0" stroke="#8f6a58" strokeWidth="4"/>
     <path d="M44 111c12 4 26 3 37-5M96 102c10 5 20 5 32-2" stroke="#f5e8d8" strokeWidth="8" strokeLinecap="round"/>
   </g>}
   {kind==="candy"&&<g>
     <path d="M23 82l24-25 13 17-12 17-25 9z" fill="#f0beaa" stroke="#8b595e" strokeWidth="3"/>
     <rect x="44" y="56" width="72" height="57" rx="16" fill="#ebc1ae" stroke="#8b595e" strokeWidth="4" transform="rotate(-11 80 85)"/>
     <path d="M115 67l23-12-4 28 7 20-27-11z" fill="#f0beaa" stroke="#8b595e" strokeWidth="3"/>
     <circle cx="80" cy="85" r="18" fill="#fdf0d3"/><path d="M68 85l8 7 18-18" stroke="#a6606d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
   </g>}
   {kind==="cookie"&&<g>
     <circle cx="66" cy="85" r="42" fill="#ca9c6a" stroke="#88643d" strokeWidth="4"/>
     <circle cx="104" cy="108" r="35" fill="#dfb580" stroke="#88643d" strokeWidth="4"/>
     {[[47,75],[75,69],[59,102],[87,89],[102,115],[114,95],[91,127]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="6" fill="#755138"/>)}
   </g>}
   {kind==="chips"&&<Bag label="CRUNCH" accent="#e2b764"/>}
   {kind==="bar"&&<g transform="rotate(-12 80 85)">
     <rect x="28" y="62" width="105" height="51" rx="9" fill="#b98a9d" stroke="#66445b" strokeWidth="4"/>
     <path d="M37 62v51M124 62v51" stroke="#f2cbb9" strokeWidth="9"/>
     <rect x="58" y="73" width="47" height="30" rx="8" fill="#fff1d7"/>
     <text x="81" y="92" textAnchor="middle" fontWeight="800" fontFamily="system-ui,sans-serif" fontSize="14" fill="#69485b">SWEET</text>
   </g>}
   {kind==="snack"&&<Bag label="TREATS" accent="#9fc2c1"/>}
 </svg>
}
