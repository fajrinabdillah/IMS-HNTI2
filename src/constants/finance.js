// Extracted from App.jsx during modular refactor.
const PPN_RATE = 0.11;        // PPN 11%
const PPH23_RATE = 0.025;     // PPh 23 2.5%
const OPS_COST_DEFAULT = 0.05; // Default operasional proyek 5%
const INCENTIVE_RATE = 0.015;  // 1.5% dari Net Sales
const NET_MARGIN_BY_MODALITY = {
  'MRI': 0.12,
  'CT Scan': 0.14,
  'C-Arm': 0.16,
  'Mammography': 0.15,
  'ESWL': 0.14,
  'X-Ray': 0.18,
  'Flat Panel Detector': 0.19,
  'Digital Fluoroscopy': 0.13,
};
const NET_MARGIN_DEFAULT = 0.15;
const PAYMENT_TERMS = {
  'cash': { label: 'pt_cash', installments: 0, dpRequired: false },
  'dp_1': { label: 'pt_dp_1', installments: 1, dpRequired: true },
  'dp_3': { label: 'pt_dp_3', installments: 3, dpRequired: true },
  'dp_6': { label: 'pt_dp_6', installments: 6, dpRequired: true },
  'dp_12': { label: 'pt_dp_12', installments: 12, dpRequired: true },
  'dp_18': { label: 'pt_dp_18', installments: 18, dpRequired: true },
  'dp_24': { label: 'pt_dp_24', installments: 24, dpRequired: true },
  'dp_36': { label: 'pt_dp_36', installments: 36, dpRequired: true },
  'post_bast': { label: 'pt_post_bast', installments: 0, dpRequired: false },
  'kso_monthly': { label: 'pt_kso_monthly', installments: 60, dpRequired: false },
};

export { PPN_RATE, PPH23_RATE, OPS_COST_DEFAULT, INCENTIVE_RATE, NET_MARGIN_BY_MODALITY, NET_MARGIN_DEFAULT, PAYMENT_TERMS };
