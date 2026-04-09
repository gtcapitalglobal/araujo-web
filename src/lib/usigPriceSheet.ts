// USIG Sub-Contractor Price Sheet - Araujo Company LLC / Nathan Mendonca Araujo
// Source: Home Installation Manager - Lawrenceville (3/18/2026)

export interface PriceItem {
  code: string;
  description: string;
  price: number;
  unit: string;
  category: string;
}

export const USIG_PRICE_SHEET: PriceItem[] = [
  // VINYL SHEET
  { code: '0051', description: 'BSC Install Vinyl Sheet', price: 6.00, unit: 'sq yd', category: 'Vinyl Sheet' },
  { code: '0931', description: 'Vinyl Sheet Pick up, Delivery Fees', price: 10.00, unit: 'ea', category: 'Vinyl Sheet' },
  // HARDWOOD
  { code: '0038', description: 'BSC Prefin Nail Down', price: 1.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0039', description: 'BSC Prefin Glue Down', price: 1.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0041', description: 'BSC Prefin Glue Joint', price: 1.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '3351', description: 'BSC Prefin Elastilon', price: 1.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '8625', description: 'BSC Wood Click up to 500', price: 1.10, unit: 'sq ft', category: 'Hardwood' },
  { code: '8626', description: 'BSC Wood Click 501-1000', price: 1.10, unit: 'sq ft', category: 'Hardwood' },
  { code: '8627', description: 'BSC Wood Click 1001+', price: 1.10, unit: 'sq ft', category: 'Hardwood' },
  { code: '8622', description: 'BSC WD NL Glue up to 500', price: 1.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '8623', description: 'BSC WD NL Glue 501-1000', price: 1.45, unit: 'sq ft', category: 'Hardwood' },
  { code: '8624', description: 'BSC WD NL Glue 1001+', price: 1.40, unit: 'sq ft', category: 'Hardwood' },
  { code: '0042', description: 'BSC 1 Com Red Oak 2-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0043', description: 'BSC 1 Com Wht Oak 2-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0044', description: 'BSC Sel Red Oak 2-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0045', description: 'BSC Sel Wht Oak 2-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0223', description: 'BSC 2 Com Red Oak 2-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0224', description: 'BSC 2 Com Wht Oak 2-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0231', description: 'BSC 1 Com Red Oak 3-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0232', description: 'BSC 1 Com Wht Oak 3-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0233', description: 'BSC Sel Red Oak 3-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0234', description: 'BSC Sel Wht Oak 3-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0235', description: 'BSC 2 Com Red Oak 3-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '0236', description: 'BSC 2 Com Wht Oak 3-1/4"', price: 2.50, unit: 'sq ft', category: 'Hardwood' },
  { code: '3223', description: 'Wood Filler Hardwood', price: 3.00, unit: 'ea', category: 'Hardwood' },
  // LAMINATE (SNAP-N-CLICK)
  { code: '0046', description: 'BSC Install Laminate/Cork Snap Lock', price: 1.15, unit: 'sq ft', category: 'Laminate' },
  { code: '8619', description: 'BSC Laminate up to 500', price: 1.15, unit: 'sq ft', category: 'Laminate' },
  { code: '8620', description: 'BSC Laminate 501-1000', price: 1.15, unit: 'sq ft', category: 'Laminate' },
  { code: '8621', description: 'BSC Laminate 1001+', price: 1.15, unit: 'sq ft', category: 'Laminate' },
  { code: '4152', description: 'Promo BSC Laminate (over $1.49/sf)', price: 1.15, unit: 'sq ft', category: 'Laminate' },
  { code: '3736', description: 'Temp Program Price', price: 1.15, unit: 'sq ft', category: 'Laminate' },
  { code: '3222', description: 'Finishing Putty Laminate', price: 5.00, unit: 'ea', category: 'Laminate' },
  // VINYL PLANK / VCT
  { code: '0238', description: 'BSC Install Vinyl Plank 1/2 Click', price: 1.15, unit: 'sq ft', category: 'Vinyl Plank' },
  { code: '0053', description: 'BSC Install Vinyl Tile Glue Down', price: 0.50, unit: 'sq ft', category: 'Vinyl Plank' },
  { code: '3118', description: 'BSC Vinyl Install & Grout', price: 0.90, unit: 'sq ft', category: 'Vinyl Plank' },
  { code: '0052', description: 'BSC Install Vinyl Plank Glue Strip', price: 1.00, unit: 'sq ft', category: 'Vinyl Plank' },
  { code: '2709', description: 'Herringbone/Chevron Pattern Charge', price: 0.25, unit: 'sq ft', category: 'Vinyl Plank' },
  // MOLDING & TRIM
  { code: '0148', description: '1/4 Round Install (Customer Provides)', price: 0.30, unit: 'lf', category: 'Trim' },
  { code: '0149', description: '1/4 Round Install (Installer Provides)', price: 1.00, unit: 'lf', category: 'Trim' },
  { code: '0059', description: 'Baseboard Installation', price: 0.75, unit: 'lf', category: 'Trim' },
  { code: '4443', description: 'Removal Existing Baseboard', price: 0.40, unit: 'lf', category: 'Trim' },
  { code: '0167', description: 'Vinyl Cove Base Install', price: 0.50, unit: 'lf', category: 'Trim' },
  { code: '0126', description: 'Ramping Per Doorway', price: 37.50, unit: 'ea', category: 'Trim' },
  { code: '7671', description: 'Capping Hard Surface', price: 1.50, unit: 'lf', category: 'Trim' },
  // REMOVAL & HAUL
  { code: '0172', description: 'Remove & Haul Carpet/Pad', price: 0.05, unit: 'sq ft', category: 'Removal' },
  { code: '0129', description: 'Remove Carpet/Pad (Glue Down)', price: 0.11, unit: 'sq ft', category: 'Removal' },
  { code: '0132', description: 'Remove Floating Floor (Wood/Laminate)', price: 0.25, unit: 'sq ft', category: 'Removal' },
  { code: '0128', description: 'Remove Nail Down Wood', price: 1.00, unit: 'sq ft', category: 'Removal' },
  { code: '0135', description: 'Remove Glued Down Wood', price: 1.50, unit: 'sq ft', category: 'Removal' },
  { code: '0131', description: 'Remove Ceramic Tile', price: 1.00, unit: 'sq ft', category: 'Removal' },
  { code: '0134', description: 'Remove Glued Sheet Vinyl/Wood Floor', price: 0.65, unit: 'sq ft', category: 'Removal' },
  { code: '0133', description: 'Remove Glued Sheet Vinyl/Concrete', price: 0.35, unit: 'sq ft', category: 'Removal' },
  // SUBFLOOR & UNDERLAYMENT
  { code: '0150', description: 'Skim Coat Vinyl/Concrete', price: 0.40, unit: 'sq ft', category: 'Subfloor' },
  { code: '0100', description: 'Embossing Level Existing Vinyl', price: 0.40, unit: 'sq ft', category: 'Subfloor' },
  { code: '0165', description: 'Underlayment Vinyl Floors', price: 1.20, unit: 'sq ft', category: 'Subfloor' },
  { code: '0166', description: 'Underlayment Wood Subfloor 3/8"', price: 1.15, unit: 'sq ft', category: 'Subfloor' },
  { code: '3346', description: 'Underlayment 3/4" Plywood', price: 1.35, unit: 'sq ft', category: 'Subfloor' },
  { code: '0164', description: 'Underlayment Concrete 3/4" Wood', price: 1.75, unit: 'sq ft', category: 'Subfloor' },
  { code: '0066', description: 'Cork Underlayment', price: 1.50, unit: 'sq ft', category: 'Subfloor' },
  { code: '3333', description: 'Redgard Moisture Barrier', price: 0.50, unit: 'sq ft', category: 'Subfloor' },
  { code: '3741', description: 'Moderate Subfloor Prep (1/8"-1/4")', price: 0.45, unit: 'sq ft', category: 'Subfloor' },
  { code: '3742', description: 'Heavy Subfloor Prep (1/4"-3/8")', price: 0.70, unit: 'sq ft', category: 'Subfloor' },
  { code: '3743', description: 'Custom Subfloor Prep (>3/8")', price: 0.50, unit: 'ea', category: 'Subfloor' },
  // FURNITURE & APPLIANCE
  { code: '0108', description: 'Furniture Moving (per room)', price: 15.00, unit: 'ea', category: 'Extras' },
  { code: '3819', description: 'Heavy Furniture Moving (per sq ft)', price: 0.10, unit: 'sq ft', category: 'Extras' },
  { code: '0057', description: 'Appliance Remove & Replace', price: 13.50, unit: 'ea', category: 'Extras' },
  { code: '5121', description: 'Disassembly Complex Bed', price: 30.00, unit: 'ea', category: 'Extras' },
  { code: '5122', description: 'Disassembly Complex Plus Bed', price: 30.00, unit: 'ea', category: 'Extras' },
  { code: '5123', description: 'Disassembly Entertainment Center', price: 30.00, unit: 'ea', category: 'Extras' },
  { code: '5124', description: 'Exercise Equipment Upcharge', price: 10.00, unit: 'ea', category: 'Extras' },
  // STEPS
  { code: '0922', description: 'Install Laminate Box Steps', price: 22.50, unit: 'ea', category: 'Steps' },
  { code: '0923', description: 'Install VCT Box Steps', price: 12.50, unit: 'ea', category: 'Steps' },
  { code: '0924', description: 'Install Vinyl Box Steps', price: 12.50, unit: 'ea', category: 'Steps' },
  { code: '3628', description: 'Cap-a-Tread Box Steps', price: 12.50, unit: 'ea', category: 'Steps' },
  // FEES & MISC
  { code: '0163', description: 'Trimming Interior Doors', price: 12.50, unit: 'ea', category: 'Fees' },
  { code: '0103', description: 'Hard Access Walk Up Fee', price: 25.00, unit: 'ea', category: 'Fees' },
  { code: '0106', description: 'Permit Fees (qty x $1)', price: 1.00, unit: 'ea', category: 'Fees' },
  { code: '0114', description: 'Mobile Home Charge', price: 0.05, unit: 'sq ft', category: 'Fees' },
  { code: '0162', description: 'Travel Over 50 Miles (per mile)', price: 1.00, unit: 'ea', category: 'Fees' },
  { code: '4811', description: 'Lead Safe Work Practices', price: 0.70, unit: 'ea', category: 'Fees' },
  { code: '5076', description: 'Ferry/Toll/Parking/Admin Fees', price: 1.00, unit: 'ea', category: 'Fees' },
];

const priceMap = new Map<string, PriceItem>();
USIG_PRICE_SHEET.forEach((item) => priceMap.set(item.code, item));

export function lookupByCode(code: string): PriceItem | undefined {
  return priceMap.get(code.trim());
}

export function searchItems(query: string): PriceItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return USIG_PRICE_SHEET.filter(
    (item) => item.code.includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
  );
}
