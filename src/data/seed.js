// Extracted from App.jsx during modular refactor.
import { detectPaymentScheme, detectSalesOwnerFromCustomer, importPipelineLabel, normalizeImportPipelineStatus, normalizeProduct, projectHasDpReceived, resolveProductId, TECHNICIAN_NAMES } from '../utils/domain.js';
import { todayStart } from '../utils/format.js';
import { PRODUCT_MASTER_SEED } from '../constants/sales.js';
import { SEED_BUSINESS_TRIPS, SEED_BT_REALIZATIONS } from '../constants/seedData.js';
function generateHntiSph2026Seed() {
  const productPrice = {
    prod_mri_15t_hfm: 22500000000, prod_mri_15t_art: 24500000000, prod_mri_30t: 32000000000,
    prod_ct64_cardiac: 9800000000, prod_ct128_premium: 15800000000, prod_ct32: 6200000000,
    prod_ct64_noncardiac: 10500000000, prod_ct128_basic: 13500000000,
    prod_carm_5kw: 2850000000, prod_carm_15kw: 4700000000,
    prod_xray_stat500: 2750000000, prod_xray_ceiling500: 3100000000, prod_xray_mobile100: 1850000000,
    prod_xray_portable: 1250000000, prod_mammo_3d: 7200000000, prod_mammo_2d: 5200000000,
    prod_fpd_17: 850000000, prod_fpd_14: 780000000, prod_eswl_advance: 5200000000,
    prod_eswl_basic: 3900000000, prod_angell_ceiling: 3350000000, prod_angell_mobile: 2100000000,
    prod_angell_fluoro: 6800000000,
  };
  const customers = [
    'RS Hermina Galaxy', 'RS Awal Bros Tangerang', 'RS Premier Bintaro', 'RS Mayapada Kuningan', 'RS Pondok Indah Puri Indah',
    'RS Mitra Keluarga Surabaya', 'RS Siloam Karawaci', 'RS Eka Hospital BSD', 'RS Telogorejo Semarang', 'RS Panti Rapih Yogyakarta',
    'RSUD Banyumas', 'RS Bhakti Wira Tamtama', 'RS Premier Jatinegara', 'RSUD Pasar Minggu', 'RS Hermina Solo',
    'RS Mayapada Bandung', 'RS Siloam Manado', 'RS Eka Hospital Pekanbaru', 'RS Mitra Keluarga Bintaro', 'RS Pondok Indah Bintaro Jaya',
    'RSUD Dr. Soetomo Surabaya', 'RSUD Dr. Sardjito Yogyakarta', 'RSUD Dr. Iskak Tulungagung', 'RSUD Dr. Saiful Anwar Malang', 'RSUD Ibnu Sina Gresik',
    'RSUD Wonosobo', 'RSUD Sleman', 'RSUD Bantul', 'RSUD Wonosari', 'RSUD Karanganyar',
    'RS Pertamina Jaya', 'RS Pelni Jakarta', 'RS Krakatau Medika Cilegon', 'RS Semen Padang', 'RS Pertamina Cilacap',
    'RS Royal Surabaya', 'RS Borromeus Bandung', 'RS PKU Muhammadiyah Solo', 'RS Mardi Rahayu Kudus', 'RS Husada Utama Surabaya',
    'RS Permata Hati Yogyakarta', 'RS Pertamedika Sentul', 'RS Sari Asih Tangerang', 'RS Lavalette Malang', 'RS Permata Bunda Medan',
    'RS Charlie Madiun', 'RS Bunda Jakarta', 'RS Haji Surabaya', 'RS Brawijaya Saharjo', 'RS Adi Husada Malang',
    'Klinik Radiologi Prima Semarang', 'Klinik Imaging Solo', 'Klinik Radiologi Cikarang', 'Klinik Imaging Bandung', 'Klinik Diagnostika Surabaya',
    'Klinik Pratama Yogya', 'PT Mitra Radiologi Nusantara', 'PT Sentra Medika Surabaya', 'PT Radindo Medika Bandung', 'RSUD Tarakan Jakarta',
  ];
  const salesOwners = ['dwi', 'hatim', 'lukman', 'bagus', 'tri', 'icha'];
  const regionFor = (customer) => {
    if (/Semarang|Kudus|Wonosobo|Banyumas|Tegal/i.test(customer)) return 'Jateng';
    if (/Yogyakarta|Yogya|Bantul|Sleman|Wonosari|Solo|Karanganyar/i.test(customer)) return 'DIY/Jateng Selatan';
    if (/Surabaya|Malang|Gresik|Tulungagung|Madiun/i.test(customer)) return 'Jatim';
    if (/Bandung|Cikarang|Bekasi/i.test(customer)) return 'Jabar';
    if (/Pekanbaru|Padang|Manado/i.test(customer)) return 'Luar Jawa';
    return 'Jabodetabek';
  };
  const productFor = (i) => PRODUCT_MASTER_SEED[i % PRODUCT_MASTER_SEED.length];
  const iso = (month, day, hour = 9) => `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00.000Z`;
  const dateOnly = (month, day) => `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const addDays = (dateStr, days) => {
    const d = new Date(dateStr + 'T00:00:00.000Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().split('T')[0];
  };
  const historyFrom = (items) => {
    let prev = null;
    return items.filter(([to, at]) => to && at).map(([to, at, by = 'system']) => {
      const row = { from: prev, to, by, at };
      prev = to;
      return row;
    });
  };
  const probabilityByStage = { sph_sent: 20, presentation_scheduled: 35, presentation_done: 50, ecatalog: 40, negotiation: 70, tender: 55, po_issued: 100, lost: 0 };
  const specs = [
    ...Array.from({ length: 10 }, () => ({ stage: 'sph_sent', status: 'active' })),
    ...Array.from({ length: 15 }, () => ({ stage: 'presentation_scheduled', status: 'active' })),
    ...Array.from({ length: 5 }, () => ({ stage: 'presentation_done', status: 'active' })),
    ...Array.from({ length: 5 }, () => ({ stage: 'negotiation', status: 'active' })),
    ...Array.from({ length: 3 }, () => ({ stage: 'tender', status: 'active', projectType: 'tender' })),
    ...Array.from({ length: 2 }, () => ({ stage: 'ecatalog', status: 'active', projectType: 'government' })),
    ...Array.from({ length: 5 }, () => ({ stage: 'lost', status: 'lost' })),
    ...Array.from({ length: 15 }, (_, i) => ({ stage: 'po_issued', status: 'won', poIndex: i })),
  ];
  const shippingByPoIndex = {
    0: null, 1: null,
    2: 'plan_order', 3: 'factory_production', 4: 'ready_to_ship', 5: 'on_shipment',
    6: 'arrived_clearance', 7: 'sent_client',
    8: 'client_received', 9: 'client_received', 10: 'client_received', 11: 'client_received',
    12: 'client_received', 13: 'client_received', 14: 'client_received',
  };
  return specs.map((spec, idx) => {
    const no = idx + 1;
    const product = productFor(idx);
    const qty = idx % 17 === 0 ? 2 : 1;
    const unitPrice = productPrice[product.id] || 2500000000;
    const customer = customers[idx];
    const customerType = customer.startsWith('PT ') ? 'subdistributor' : customer.startsWith('Klinik') ? 'clinic' : 'hospital';
    const projectType = spec.projectType || (idx % 14 === 0 ? 'kso' : customer.includes('RSUD') ? 'government' : 'private');
    const scheme = detectPaymentScheme(projectType, customerType);
    const issuedMonth = idx < 20 ? 1 : idx < 40 ? 2 : idx < 50 ? 3 : 4;
    const issuedDay = (idx % 24) + 1;
    const issuedDate = dateOnly(issuedMonth, issuedDay);
    const baseAt = iso(issuedMonth, issuedDay);
    const presentationAt = iso(Math.min(5, issuedMonth + 1), ((issuedDay + 4) % 26) + 1, 10);
    const presentationDoneAt = iso(Math.min(5, issuedMonth + 1), ((issuedDay + 8) % 26) + 1, 15);
    const branchAt = iso(Math.min(5, issuedMonth + 2), ((issuedDay + 10) % 26) + 1, 11);
    const isPo = spec.stage === 'po_issued';
    const dpReceived = isPo && spec.poIndex >= 2;
    const shippingStatus = isPo && dpReceived ? shippingByPoIndex[spec.poIndex] : null;
    const receivedClient = shippingStatus === 'client_received';
    const installProgress = receivedClient && [8, 9].includes(spec.poIndex);
    const installed = receivedClient && spec.poIndex >= 10;
    const regulatoryStage = installed ? (spec.poIndex <= 12 ? 'eval' : 'issued') : null;
    const dpAmount = Math.round(qty * unitPrice * (scheme === 'kso' ? 0.1 : scheme === 'dp_installment' ? 0.3 : 1));
    const poAt = isPo ? iso(3, (idx % 18) + 3, 13) : null;
    const dpAt = dpReceived ? iso(3, (idx % 18) + 8, 14) : null;
    const goodsSentAt = ['sent_client', 'client_received'].includes(shippingStatus) ? iso(5, (idx % 18) + 1, 10) : null;
    const clientReceivedAt = receivedClient ? iso(5, (idx % 18) + 4, 16) : null;
    const bastDate = installed ? dateOnly(5, (idx % 14) + 12) : '';
    const stageDates = {
      sphRequestedAt: baseAt,
      sphDraftStartedAt: iso(issuedMonth, issuedDay, 11),
      sphDocReadyAt: iso(issuedMonth, issuedDay, 15),
      salesDownloadedAt: iso(issuedMonth, Math.min(28, issuedDay + 1), 9),
      offerSentAt: iso(issuedMonth, Math.min(28, issuedDay + 1), 11),
      ...(spec.stage !== 'sph_sent' ? { presentationScheduledAt: presentationAt } : {}),
      ...(['presentation_done', 'negotiation', 'tender', 'ecatalog', 'lost', 'po_issued'].includes(spec.stage) ? { presentationDoneAt } : {}),
      ...(spec.stage === 'negotiation' || isPo ? { negotiationStartedAt: branchAt } : {}),
      ...(spec.stage === 'tender' ? { tenderStartedAt: branchAt, tenderSubStage: 'aanwijzing' } : {}),
      ...(spec.stage === 'ecatalog' ? { ecatalogWaitingAt: branchAt } : {}),
      ...(spec.stage === 'lost' ? { lostAt: branchAt } : {}),
      ...(isPo ? {
        clientPoInfoAt: poAt, poIssuedAt: poAt, poInputAt: poAt,
        financePoNotifiedAt: poAt, financeDocsReadyAt: poAt,
        manufacturePoCreatedAt: poAt, principalPoStatus: 'sent', principalPoSentAt: poAt,
      } : {}),
      ...(dpReceived ? {
        dpDecisionAt: dpAt, dpConfirmedAt: dpAt, factoryDpPaidAt: dpAt, supplierDpPaidAt: dpAt,
      } : {}),
      ...(shippingStatus === 'factory_production' ? { factoryProductionStartedAt: iso(4, 9, 9), factoryProductionDays: 45, factoryProductionDueAt: iso(5, 24, 9) } : {}),
      ...(shippingStatus === 'ready_to_ship' ? { factoryProductionStartedAt: iso(3, 18, 9), factoryProductionDoneAt: iso(5, 2, 9), factoryProductionDays: 45, factoryProductionDueAt: iso(5, 2, 9) } : {}),
      ...(shippingStatus === 'on_shipment' ? { importClearanceAt: iso(5, 3, 9) } : {}),
      ...(shippingStatus === 'arrived_clearance' ? { importClearanceAt: iso(5, 5, 9) } : {}),
      ...(goodsSentAt ? { goodsSentClientAt: goodsSentAt, customsSppbAt: goodsSentAt, technicianNotifiedAt: goodsSentAt } : {}),
      ...(clientReceivedAt ? { clientReceivedAt } : {}),
      ...(installProgress ? { installScheduleUpdatedAt: iso(5, 12, 9) } : {}),
      ...(installed ? { installScheduleUpdatedAt: iso(5, 10, 9), bastDate, regulatoryNotifiedAt: iso(5, (idx % 14) + 13, 10) } : {}),
      ...(regulatoryStage === 'eval' ? { regulatoryProcessingAt: iso(5, (idx % 12) + 15, 10) } : {}),
      ...(regulatoryStage === 'issued' ? { regulatoryProcessingAt: iso(5, (idx % 10) + 12, 10), utilizationPermitDoneAt: iso(5, (idx % 10) + 20, 10) } : {}),
    };
    const branchStep = spec.stage === 'negotiation' || isPo ? 'negotiation'
      : spec.stage === 'tender' ? 'tender'
      : spec.stage === 'ecatalog' ? 'ecatalog'
      : spec.stage === 'lost' ? 'lost'
      : null;
    const history = historyFrom([
      ['requested', stageDates.sphRequestedAt],
      ['admin_drafting', stageDates.sphDraftStartedAt],
      ['ready_for_sales', stageDates.sphDocReadyAt],
      ['sales_downloaded', stageDates.salesDownloadedAt],
      ['offer_sent', stageDates.offerSentAt],
      [stageDates.presentationScheduledAt ? 'presentation_scheduled' : null, stageDates.presentationScheduledAt],
      [stageDates.presentationDoneAt ? 'presentation_done' : null, stageDates.presentationDoneAt],
      [branchStep, branchAt],
      [isPo ? 'client_po_info' : null, poAt],
      [isPo ? 'po_input_ims' : null, poAt],
      [isPo ? 'invoice_ready' : null, poAt],
      [dpReceived ? 'dp_confirmed' : null, dpAt],
      [dpReceived ? 'factory_dp_paid' : null, dpAt],
      [shippingStatus === 'factory_production' ? 'factory_production' : null, stageDates.factoryProductionStartedAt],
      [shippingStatus === 'ready_to_ship' ? 'factory_production_done' : null, stageDates.factoryProductionDoneAt],
      [['on_shipment', 'arrived_clearance'].includes(shippingStatus) ? 'import_clearance' : null, stageDates.importClearanceAt],
      [shippingStatus === 'sent_client' || receivedClient ? 'goods_sent_client' : null, goodsSentAt],
      [receivedClient ? 'goods_received_client' : null, clientReceivedAt],
      [installProgress ? 'install_schedule_updated' : null, stageDates.installScheduleUpdatedAt],
      [installed ? 'installed_bast' : null, bastDate ? `${bastDate}T10:00:00.000Z` : null],
      [regulatoryStage === 'eval' ? 'regulatory_processing' : null, stageDates.regulatoryProcessingAt],
      [regulatoryStage === 'issued' ? 'utilization_permit_done' : null, stageDates.utilizationPermitDoneAt],
    ]);
    const sphWorkflowStatus = regulatoryStage === 'issued' ? 'utilization_permit_done'
      : regulatoryStage === 'eval' ? 'regulatory_processing'
      : installed ? 'installed_bast'
      : installProgress ? 'install_schedule_updated'
      : receivedClient ? 'goods_received_client'
      : shippingStatus === 'sent_client' ? 'goods_sent_client'
      : ['on_shipment', 'arrived_clearance'].includes(shippingStatus) ? 'import_clearance'
      : shippingStatus === 'ready_to_ship' ? 'factory_production_done'
      : shippingStatus === 'factory_production' ? 'factory_production'
      : shippingStatus === 'plan_order' ? 'factory_dp_paid'
      : dpReceived ? 'dp_confirmed'
      : isPo ? 'invoice_ready'
      : spec.stage;
    return {
      id: `sph2026_seed_${String(no).padStart(2, '0')}`,
      sphNo: `SPH/2026/${String(no).padStart(3, '0')}`,
      customer, customerType, projectType,
      productId: product.id, productName: product.name, productBrand: product.brand,
      brand: product.brand, partner: product.principal, principal: product.principal, origin: product.origin,
      modality: product.modality, subModality: product.type,
      qty, unitPrice, totalValue: qty * unitPrice,
      issuedDate,
      salesOwner: detectSalesOwnerFromCustomer(customer) || salesOwners[idx % salesOwners.length],
      region: regionFor(customer),
      status: spec.status, stage: spec.stage,
      probability: probabilityByStage[spec.stage] ?? 20,
      notes: spec.stage === 'lost' ? 'Kalah karena keputusan pembelian ditunda / kompetitor.' : 'Seed 2026 tersinkron dari SPH sebagai sumber utama.',
      nextAction: spec.stage === 'po_issued' ? (dpReceived ? 'Lanjut monitoring operasional/instalasi' : 'Finance follow-up DP') : '-',
      lastUpdate: '2026-06-10',
      poStatus: isPo ? 'issued' : null,
      dpPaid: dpReceived,
      finalPaid: installed,
      shippingStatus,
      customsStatus: ['sent_client', 'client_received'].includes(shippingStatus) ? 'released' : shippingStatus === 'arrived_clearance' ? 'ongoing' : null,
      customsDocStatus: ['sent_client', 'client_received'].includes(shippingStatus) ? 'sppb' : null,
      localDeliveryStatus: shippingStatus === 'sent_client' ? 'on_delivery' : receivedClient ? 'delivered_to_rs' : '',
      installationStatus: installed ? 'installed' : installProgress ? 'progress' : null,
      regulatoryStage,
      paymentScheme: scheme,
      dpPercent: scheme === 'dp_installment' ? 30 : scheme === 'kso' ? 10 : 0,
      installmentMonths: scheme === 'dp_installment' ? 12 : scheme === 'kso' ? 60 : 0,
      paymentHistory: dpReceived ? [{ id: `pay_dp_${no}`, date: dpAt.split('T')[0], amount: dpAmount, type: 'dp', note: 'DP diterima dan otomatis tersinkron ke Finance', recordedBy: 'finance' }] : [],
      paymentNote: dpReceived ? 'DP diterima' : '',
      ...stageDates,
      stageHistory: history,
    };
  });
}
const _RAW_ALL_SPH = generateHntiSph2026Seed();
const ALL_SPH = _RAW_ALL_SPH.map(s0 => {
  const s1 = normalizeProduct(s0);
  // Catatan #2: assign stable productId so editing product master never breaks SPH count
  const pid = resolveProductId(s1, PRODUCT_MASTER_SEED);
  const s = pid ? { ...s1, productId: pid } : s1;
  // Skip if customer type indicates sub-dealer or partner (mereka punya logic sendiri)
  if (s.customerType === 'subdistributor' || s.customerType === 'partner') return s;
  // Skip if owner adalah 'office' (intentionally vacant)
  if (s.salesOwner === 'office') {
    // Only override if territory mapping ada kota yang spesifik (e.g. Semarang → Hatim)
    const detected = detectSalesOwnerFromCustomer(s.customer);
    if (detected && detected !== 'office') return { ...s, salesOwner: detected };
    return s;
  }
  const detected = detectSalesOwnerFromCustomer(s.customer);
  if (detected && detected !== s.salesOwner) {
    return { ...s, salesOwner: detected };
  }
  return s;
});
function buildSeedNotificationsFromSph(projects = ALL_SPH) {
  const now = '2026-06-10T09:00:00.000Z';
  const mkNotif = (id, role, type, message, link) => ({
    id, toRole: role, toUsername: null, fromUsername: 'system', fromRole: 'system',
    type, message, link, createdAt: now, readAt: null,
  });
  const rows = [];
  projects.filter(s => s.poStatus === 'issued' && !s.dpPaid).forEach((s, i) => {
    rows.push(mkNotif(`seed_notif_finance_${i}`, 'finance', 'dp_followup', `PO ${s.sphNo} ${s.customer} terbit. Finance perlu follow-up/konfirmasi DP.`, { view: 'finance', id: s.id }));
  });
  projects.filter(s => projectHasDpReceived(s) && s.poStatus === 'issued' && !s.installationStatus).slice(0, 6).forEach((s, i) => {
    rows.push(mkNotif(`seed_notif_ops_${i}`, 'manager_ops', 'operations_sync', `${s.customer} sudah DP diterima. Status operasional: ${importPipelineLabel(s.shippingStatus || 'plan_order', 'id')}.`, { view: 'operations', id: s.id }));
  });
  projects.filter(s => s.shippingStatus === 'client_received' && !s.installationStatus).forEach((s, i) => {
    rows.push(mkNotif(`seed_notif_tech_${i}`, 'technician', 'install_pending', `Barang ${s.customer} sudah diterima klien. Teknisi perlu jadwal instalasi.`, { view: 'installation', id: s.id }));
  });
  projects.filter(s => s.installationStatus === 'installed' && s.regulatoryStage !== 'issued').forEach((s, i) => {
    rows.push(mkNotif(`seed_notif_reg_${i}`, 'regulatory', 'regulatory_pending', `BAST ${s.customer} selesai. Regulatory perlu proses izin BAPETEN.`, { view: 'regulatory', id: s.id }));
  });
  return rows;
}
function generateInstalledUnits() {
  const wonProjects = ALL_SPH.filter(s => s.status === 'won' && s.installationStatus === 'installed');
  // Helper: add N calendar months to a YYYY-MM-DD date (clean, no 30-day drift)
  const addMonths = (dateStr, n) => {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDate();
    d.setMonth(d.getMonth() + n);
    // guard month overflow (e.g. Aug 31 + 6mo)
    if (d.getDate() < day) d.setDate(0);
    return d.toISOString().split('T')[0];
  };
  return wonProjects.map((s, i) => {
    const installDate = s.issuedDate < '2026-01-01' ? `2025-${String(Math.floor(i / 5) % 12 + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` : `2026-${String(Math.floor(i / 5) % 5 + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`;
    const installYear = parseInt(installDate.substring(0, 4));
    const installMonth = parseInt(installDate.substring(5, 7));
    const warrantyEnd = `${installYear + 2}-${String(installMonth).padStart(2, '0')}-${installDate.substring(8)}`;
    // PM SCHEDULE (#7): first PM exactly 6 calendar months after install, then every 6 months.
    const today = todayStart();
    const installD = new Date(installDate + 'T00:00:00');
    // Count completed 6-month cycles since install (first PM is at +6 months)
    let pmsDone = 0;
    while (new Date(addMonths(installDate, (pmsDone + 1) * 6) + 'T00:00:00') <= today) pmsDone++;
    const lastPmDate = pmsDone > 0 ? addMonths(installDate, pmsDone * 6) : null;
    const nextPmDate = addMonths(installDate, (pmsDone + 1) * 6);
    return {
      id: `unit_${s.id}`, sphRef: s.sphNo, customer: s.customer,
      modality: s.modality, subModality: s.subModality, partner: s.partner,
      installDate, warrantyEnd,
      lastPmDate,
      nextPmDate,
      pmCompleted: false,
      technician: TECHNICIAN_NAMES[i % TECHNICIAN_NAMES.length],
      qty: s.qty,
      regulatoryStage: s.regulatoryStage || null,
      utilizationPermitDoneAt: s.utilizationPermitDoneAt || null,
    };
  });
}
function generateSeedManifestsFromSph() {
  const ports = {
    China: ['Shanghai, China', 'Shanghai Port'],
    Korea: ['Busan, Korea', 'Busan Port'],
    Taiwan: ['Taipei, Taiwan', 'Keelung Port'],
  };
  return ALL_SPH.filter(projectHasDpReceived).map((s, i) => {
    const originKey = /Korea/i.test(s.origin || s.principal || '') ? 'Korea' : /Taiwan/i.test(s.origin || s.principal || '') ? 'Taiwan' : 'China';
    const [principalOrigin, portOfLoading] = ports[originKey] || ports.China;
    const status = normalizeImportPipelineStatus(s.shippingStatus || 'plan_order');
    return {
      id: `mfst_${s.id}`,
      manifestNo: `MFST-2026-${String(i + 1).padStart(3, '0')}`,
      linkedProjectId: s.id,
      customerName: s.customer,
      modality: s.modality,
      typeBrand: [s.subModality, s.productBrand || s.brand].filter(Boolean).join(' / '),
      sphNo: s.sphNo,
      principal: s.principal || s.partner || s.productBrand || '-',
      principalOrigin,
      shippingMode: i % 4 === 0 ? 'air' : 'sea',
      etd: i < 2 ? '' : `2026-05-${String(Math.min(28, 2 + i)).padStart(2, '0')}`,
      eta: i < 2 ? '' : `2026-05-${String(Math.min(28, 8 + i)).padStart(2, '0')}`,
      portOfLoading,
      portOfDischarge: 'Tanjung Priok, Jakarta',
      itemsCount: Number(s.qty) || 1,
      freightCost: Math.round((Number(s.totalValue) || 0) * 0.012),
      status,
      notes: `Manifest otomatis dari ${s.sphNo} - ${s.customer}`,
    };
  });
}
function generateSeedCustomsDocsFromSph(manifests) {
  return manifests
    .filter(m => ['on_shipment', 'arrived_clearance', 'sent_client', 'client_received'].includes(normalizeImportPipelineStatus(m.status)))
    .map((m, i) => {
      const project = ALL_SPH.find(s => s.id === m.linkedProjectId || s.sphNo === m.sphNo);
      const normalized = normalizeImportPipelineStatus(m.status);
      const status = ['sent_client', 'client_received'].includes(normalized) ? 'sppb'
        : normalized === 'arrived_clearance' ? 'pib_payment'
        : 'submitted';
      return {
        id: `cdoc_${m.id}`,
        docNo: status === 'sppb' ? `SPPB-2026-${String(i + 1).padStart(3, '0')}` : status === 'pib_payment' ? `PIB-2026-${String(i + 1).padStart(3, '0')}` : `BC-2026-${String(i + 1).padStart(3, '0')}`,
        manifestId: m.id,
        manifestNo: m.manifestNo,
        manifestRef: m.manifestNo,
        linkedProjectId: project?.id || m.linkedProjectId,
        customerName: m.customerName,
        modality: m.modality,
        typeBrand: m.typeBrand,
        sphNo: m.sphNo,
        principal: m.principal,
        shippingMode: m.shippingMode,
        eta: m.eta,
        docDate: m.eta || m.etd || '2026-05-10',
        status,
        pibAmount: status === 'pib_payment' ? Math.round((Number(project?.totalValue) || 0) * 0.018) : 0,
        fileUrl: '',
        notes: status === 'sppb' ? 'SPPB terbit, otomatis masuk Pengiriman Lokal/Gudang.'
          : status === 'pib_payment' ? 'Pembayaran PIB perlu diproses Finance.'
          : 'Dokumen customs diterima dan sedang diproses.',
      };
    });
}
const SEED_MANIFESTS = generateSeedManifestsFromSph();
const SEED_CUSTOMS_DOCS = generateSeedCustomsDocsFromSph(SEED_MANIFESTS);
function generateInstallDocs() {
  const addDays = (dateStr, n) => { const d = new Date((dateStr || '2025-01-01') + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };
  const yearOf = (dateStr) => (dateStr || '').substring(0, 4);
  const showInstall = [];
  const showBast = [];
  const showTrain = [];
  const keyOf = (cust, yr) => cust + '|' + yr;
  const haveInstall = new Set(showInstall.map(r => keyOf(r.customer, r.poYear)));
  const haveBast = new Set(showBast.map(r => keyOf(r.customer, r.poYear)));
  const haveTrain = new Set(showTrain.map(r => keyOf(r.customer, r.poYear)));
  const installed = ALL_SPH.filter(s => ['progress', 'installed'].includes(s.installationStatus));
  const genInstall = [], genBast = [], genTrain = [];
  installed.forEach((s, i) => {
    const tech = TECHNICIAN_NAMES[i % TECHNICIAN_NAMES.length] || 'Teknisi HNTI';
    const yr = yearOf(s.issuedDate) || '2025';
    const start = (s.installScheduleUpdatedAt || s.clientReceivedAt || s.issuedDate || '').split('T')[0] || addDays(s.issuedDate, 18 + (i % 14));
    const dur = 3 + (i % 8);
    const completed = s.installationStatus === 'installed';
    const end = completed ? (s.bastDate || addDays(start, dur)) : null;
    const seq = String(100 + i).padStart(3, '0');
    // Skip only if a hand-written showcase record already covers this exact customer+year (avoid duplicate).
    if (!haveInstall.has(keyOf(s.customer, yr))) {
      genInstall.push({ id: `inst_gen_${s.id}`, recordNo: `BA-INST-${yr}-${seq}`, customer: s.customer, modality: s.modality, subModality: s.subModality, installStart: start, installEnd: end, duration: completed ? dur : null, leadTechnician: tech, teamSize: 2 + (i % 3), roomReady: true, electricalReady: true, calibrationDone: completed, status: completed ? 'completed' : 'progress', notes: completed ? 'Instalasi & uji fungsi selesai, unit operasional.' : 'Instalasi sedang berlangsung sesuai jadwal teknisi.', poYear: yr });
    }
    if (completed && !haveBast.has(keyOf(s.customer, yr))) {
      genBast.push({ id: `bast_gen_${s.id}`, bastNo: `BAST-HNTI-${yr}-${seq}`, customer: s.customer, modality: s.modality, subModality: s.subModality, signedDate: addDays(end, 3), hntiRep: 'Fajrin (CEO HNTI)', customerRep: 'Direktur / Ka. Instalasi Radiologi', witness: 'Saksi Pihak RS', status: 'signed', docUrl: '', notes: 'BAST ditandatangani setelah instalasi & uji fungsi selesai.', poYear: yr });
    }
    if (completed && !haveTrain.has(keyOf(s.customer, yr))) {
      genTrain.push({ id: `train_gen_${s.id}`, certNo: `CERT-HNTI-${yr}-${seq}`, customer: s.customer, modality: s.modality, subModality: s.subModality, sessionDate: addDays(end, 1), participants: 3 + (i % 4), instructor: `${tech} + Aplikator`, duration: 8 + (i % 3) * 4, topics: 'Operasional dasar, protokol scan, dose management, perawatan harian.', status: 'completed', certUrl: '', notes: 'Training operator selesai, sertifikat diterbitkan.', poYear: yr });
    }
  });
  return { install: [...showInstall, ...genInstall], bast: [...showBast, ...genBast], training: [...showTrain, ...genTrain] };
}
const INSTALL_DOCS = generateInstallDocs();
function generateHistoricalBusinessTrips() {
  const trips = [];
  const realizations = [];
  let counter = 0;

  // Travel pattern per employee: { username, position, allowance, freq (trips/month), destinations[], purposes[] }
  const patterns = [
    // Sales Manager - Dwi Jabodetabek + Jabar
    { un: 'dwi', name: 'Dwi Wahyudianto', pos: 'Manager', allow: 175000, freq: 2.5,
      dests: [
        { city: 'Bandung', area: 'Bandung + Cimahi', flight: 0, hotel: [1800000, 2200000] },
        { city: 'Bogor', area: 'Bogor + Sukabumi', flight: 0, hotel: [1200000, 1600000] },
        { city: 'Cirebon', area: 'Cirebon + Indramayu', flight: 0, hotel: [1400000, 1800000] },
        { city: 'Karawang', area: 'Karawang + Purwakarta', flight: 0, hotel: [1100000, 1500000] },
      ],
      purposes: ['Closing PO RS Hasan Sadikin', 'Follow up RS Borromeus', 'Visit baru RS Hermina Bekasi', 'Negotiation RS Mitra Keluarga Bogor', 'Demo CT 64 RS Eka Hospital'] },
    // Sales Manager - Tri Jatim 1
    { un: 'tri', name: 'Tri Sutjahjono', pos: 'Manager', allow: 175000, freq: 2.5,
      dests: [
        { city: 'Surabaya', area: 'Surabaya + Gresik', flight: [2200000, 2600000], hotel: [2400000, 2900000] },
        { city: 'Malang', area: 'Malang + Batu', flight: [2400000, 2800000], hotel: [1800000, 2200000] },
        { city: 'Madiun', area: 'Madiun + Magetan', flight: 0, hotel: [1400000, 1800000] },
        { city: 'Kediri', area: 'Kediri + Tulungagung', flight: 0, hotel: [1500000, 1900000] },
      ],
      purposes: ['Closing PO RS Premier Surabaya', 'Visit RSUD Dr. Soetomo', 'Follow up RS Lavalette Malang', 'Negotiation RSUD Iskak Tulungagung'] },
    // Sales Manager - Bagus Jatim 2 + Bali
    { un: 'bagus', name: 'Bagus Iswahyudi', pos: 'Manager', allow: 175000, freq: 2.4,
      dests: [
        { city: 'Denpasar', area: 'Bali', flight: [3000000, 4500000], hotel: [3000000, 4000000] },
        { city: 'Banyuwangi', area: 'Banyuwangi + Jember', flight: 0, hotel: [1500000, 2000000] },
        { city: 'Gresik', area: 'Gresik + Lamongan', flight: [2200000, 2600000], hotel: [1600000, 2100000] },
        { city: 'Mataram', area: 'Lombok', flight: [3500000, 4500000], hotel: [2500000, 3500000] },
      ],
      purposes: ['Closing RSUD Wahidin Mojokerto', 'Visit RSUD Ibnu Sina Gresik', 'Demo C-Arm RS BaliMed', 'Negotiation RSUD Mataram'] },
    // Sales Staff - Lukman Jateng + DIY
    { un: 'lukman', name: 'Lukman', pos: 'Staff', allow: 130000, freq: 2.8,
      dests: [
        { city: 'Solo', area: 'Solo + Karanganyar + Klaten', flight: 0, hotel: [1500000, 2000000] },
        { city: 'Yogyakarta', area: 'DIY + Sleman + Bantul', flight: 0, hotel: [1600000, 2100000] },
        { city: 'Magelang', area: 'Magelang + Temanggung', flight: 0, hotel: [1100000, 1400000] },
        { city: 'Cilacap', area: 'Cilacap + Banyumas', flight: 0, hotel: [1300000, 1700000] },
      ],
      purposes: ['Visit RSUD Sardjito', 'Follow up RS PKU Muhammadiyah Solo', 'Demo X-Ray RSUD Banyumas', 'Closing RSUD Magelang'] },
    // Sales Staff - Hatim Jateng A
    { un: 'hatim', name: 'Hatim', pos: 'Staff', allow: 130000, freq: 2.3,
      dests: [
        { city: 'Semarang', area: 'Semarang + Demak', flight: 0, hotel: [1700000, 2200000] },
        { city: 'Kudus', area: 'Kudus + Pati + Jepara', flight: 0, hotel: [1300000, 1700000] },
        { city: 'Pekalongan', area: 'Pekalongan + Batang', flight: 0, hotel: [1100000, 1500000] },
        { city: 'Tegal', area: 'Tegal + Brebes', flight: 0, hotel: [1100000, 1400000] },
      ],
      purposes: ['Visit RSUD Tugurejo Semarang', 'Follow up RS Mardi Rahayu Kudus', 'Demo C-Arm RSUD Pekalongan'] },
    // Teknisi - Budi (banyak trip untuk install + PM)
    { un: 'teknisi', name: 'Robby Dwi Setiawan', pos: 'Supervisor', allow: 150000, freq: 4.2,
      dests: [
        { city: 'Surabaya', area: 'Jatim instalasi', flight: [2200000, 2600000], hotel: [2000000, 2500000] },
        { city: 'Solo', area: 'Jateng PM', flight: 0, hotel: [1400000, 1800000] },
        { city: 'Bandung', area: 'Jabar instalasi', flight: 0, hotel: [1800000, 2200000] },
        { city: 'Yogyakarta', area: 'DIY PM', flight: 0, hotel: [1500000, 2000000] },
        { city: 'Semarang', area: 'Jateng instalasi', flight: 0, hotel: [1700000, 2100000] },
      ],
      purposes: ['Instalasi X-Ray DR', 'PM CT Scan rutin', 'Repair C-Arm', 'Commissioning MRI', 'Training operator'] },
    // CEO - Fajrin (occasional, high-value closing)
    { un: 'ceo', name: 'Fajrin', pos: 'Direksi', allow: 500000, freq: 1.2,
      dests: [
        { city: 'Surabaya', area: 'Jatim group closing', flight: [2400000, 2800000], hotel: [3000000, 4000000] },
        { city: 'Denpasar', area: 'Bali strategic visit', flight: [3500000, 4500000], hotel: [3500000, 4500000] },
        { city: 'Medan', area: 'Sumut expansion', flight: [3000000, 4000000], hotel: [2500000, 3500000] },
        { city: 'Makassar', area: 'Sulawesi expansion', flight: [3500000, 4500000], hotel: [2800000, 3800000] },
      ],
      purposes: ['Closing strategis RS Premier Group', 'Investor meeting Orion Medical', 'Ekspansi distributor Sumatera', 'Closing kontrak Bali Hospital Group'] },
    // Manager Ops - Novan (1x/bln untuk koordinasi region)
    { un: 'manager_ops', name: 'Novan Restu', pos: 'Manager Operasional', allow: 175000, freq: 0.8,
      dests: [
        { city: 'Surabaya', area: 'Jatim ops review', flight: [2200000, 2600000], hotel: [2000000, 2500000] },
        { city: 'Bandung', area: 'Jabar ops review', flight: 0, hotel: [1800000, 2200000] },
      ],
      purposes: ['Audit operasional cabang', 'Review proses instalasi'] },
  ];

  const months = [
    // 2025: 12 months
    { year: 2025, month: 1, days: 31 }, { year: 2025, month: 2, days: 28 }, { year: 2025, month: 3, days: 31 },
    { year: 2025, month: 4, days: 30 }, { year: 2025, month: 5, days: 31 }, { year: 2025, month: 6, days: 30 },
    { year: 2025, month: 7, days: 31 }, { year: 2025, month: 8, days: 31 }, { year: 2025, month: 9, days: 30 },
    { year: 2025, month: 10, days: 31 }, { year: 2025, month: 11, days: 30 }, { year: 2025, month: 12, days: 31 },
    // 2026: Jan-Apr (May trips already exist as current data)
    { year: 2026, month: 1, days: 31 }, { year: 2026, month: 2, days: 28 },
    { year: 2026, month: 3, days: 31 }, { year: 2026, month: 4, days: 30 },
  ];

  // Deterministic pseudo-random based on seed (for stable data across reloads)
  let rngState = 42;
  const rng = () => { rngState = (rngState * 1103515245 + 12345) & 0x7fffffff; return rngState / 0x7fffffff; };
  const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
  const randChoice = (arr) => arr[Math.floor(rng() * arr.length)];

  months.forEach(({ year, month, days }) => {
    patterns.forEach(p => {
      // Number of trips this month for this person
      const tripCount = Math.max(0, Math.round(p.freq + (rng() - 0.5) * 1.2));
      for (let t = 0; t < tripCount; t++) {
        const dest = randChoice(p.dests);
        const startDay = randInt(2, Math.max(2, days - 6));
        const duration = p.pos === 'Direksi' ? randInt(2, 4) : p.pos === 'Supervisor' ? randInt(3, 6) : randInt(3, 5);
        const endDay = Math.min(days, startDay + duration - 1);
        const actualDuration = endDay - startDay + 1;
        const mm = String(month).padStart(2, '0');
        const dStart = `${year}-${mm}-${String(startDay).padStart(2, '0')}`;
        const dEnd = `${year}-${mm}-${String(endDay).padStart(2, '0')}`;

        // Cost estimation
        const taxiHome = p.un === 'ceo' ? randInt(180000, 250000) : randInt(80000, 150000);
        const flight = Array.isArray(dest.flight) ? randInt(dest.flight[0], dest.flight[1]) : 0;
        const taxiArrival = flight > 0 ? randInt(100000, 200000) : 0;
        const taxiRs = randInt(180000, 400000);
        const localTransport = randInt(300000, 800000) + (actualDuration - 3) * 80000;
        const meals = randInt(400000, 900000) + (p.pos === 'Direksi' ? 400000 : 0);
        const other = rng() > 0.65 ? randInt(50000, 200000) : 0;
        const allowanceTotal = actualDuration * p.allow;
        const totalAdvance = taxiHome + taxiArrival + taxiRs + localTransport + meals + other + allowanceTotal;
        const hotelTotal = Array.isArray(dest.hotel) ? randInt(dest.hotel[0], dest.hotel[1]) : 0;

        counter++;
        const tripId = `bt_hist_${year}_${mm}_${counter}`;
        const requestNo = `BT-${year}-${String(counter).padStart(4, '0')}`;
        const paidDay = Math.max(1, startDay - 2);
        const paidDate = `${year}-${mm}-${String(paidDay).padStart(2, '0')}`;

        const trip = {
          id: tripId, requestNo,
          travelerUsername: p.un, travelerName: p.name, position: p.pos, allowancePerDay: p.allow,
          destination: dest.area, destinationCity: dest.city,
          purpose: randChoice(p.purposes),
          dateStart: dStart, dateEnd: dEnd, duration: actualDuration,
          costs: {
            taxiHome, taxiArrival, taxiRs,
            localTransport, meals, other,
            otherNotes: other > 0 ? 'Tol & parkir' : '',
            allowanceTotal,
          },
          officeBooked: {
            ticketPP: flight,
            hotelTotal,
            ticketNote: flight > 0 ? `Tiket pesawat PP ${dest.city}` : '-',
            hotelNote: hotelTotal > 0 ? `Hotel ${dest.city} ${actualDuration - 1} malam` : 'PP harian',
          },
          totalAdvance,
          bankAccount: { bankName: 'BCA', accountNo: '521' + String(counter * 13).padStart(7, '0').slice(0, 7), holderName: p.name },
          status: 'completed', tripStatus: 'completed', paymentStatus: 'paid',
          paidDate, paidAmount: totalAdvance, paidProof: `https://drive.google.com/file/d/historical_${tripId}`,
          approvalHistory: [
            { level: 'submit', by: p.un, byName: p.name, date: paidDate, action: 'submitted', note: '' },
            { level: 'finance', by: 'finance', byName: 'Riris Elia', date: paidDate, action: 'approved', note: 'OK' },
            { level: 'manager_ops', by: 'manager_ops', byName: 'Novan Restu', date: paidDate, action: 'approved', note: 'OK' },
            { level: 'gm', by: 'gm', byName: 'Endah Purwitasari', date: paidDate, action: 'approved', note: 'Approved' },
            { level: 'finance', by: 'finance', byName: 'Riris Elia', date: paidDate, action: 'paid', note: `Transfer Rp ${totalAdvance.toLocaleString('id-ID')}` },
          ],
          submittedAt: paidDate, updatedAt: dEnd,
          realizationId: `btr_hist_${year}_${mm}_${counter}`,
        };
        trips.push(trip);

        // Generate matching realization (varies: ~50% match exact, ~30% under, ~20% over)
        const varianceRoll = rng();
        let actualMultiplier = 1.0;
        if (varianceRoll < 0.3) actualMultiplier = 0.85 + rng() * 0.1; // Save (under planned)
        else if (varianceRoll < 0.5) actualMultiplier = 1.0; // Exact
        else if (varianceRoll < 0.75) actualMultiplier = 1.0 + rng() * 0.1; // Slightly over
        else actualMultiplier = 1.05 + rng() * 0.15; // Notably over

        // Sometimes actual days are less than planned
        const actualDaysFactor = rng() < 0.15 ? Math.max(1, actualDuration - 1) : actualDuration;
        const actualAllowance = actualDaysFactor * p.allow;
        const actualNonAllowance = (taxiHome + taxiArrival + taxiRs + localTransport + meals + other) * actualMultiplier;
        const actualCosts = {
          taxiHome: Math.round(taxiHome * actualMultiplier),
          taxiArrival: Math.round(taxiArrival * actualMultiplier),
          taxiRs: Math.round(taxiRs * actualMultiplier),
          localTransport: Math.round(localTransport * actualMultiplier),
          meals: Math.round(meals * actualMultiplier),
          other: Math.round(other * actualMultiplier),
          otherNotes: other > 0 ? 'Tol & parkir' : '',
        };
        const totalActual = actualCosts.taxiHome + actualCosts.taxiArrival + actualCosts.taxiRs +
          actualCosts.localTransport + actualCosts.meals + actualCosts.other + actualAllowance;
        const difference = totalAdvance - totalActual;

        const settlementDay = Math.min(days, endDay + 2);
        const settlementDate = `${year}-${mm}-${String(settlementDay).padStart(2, '0')}`;

        realizations.push({
          id: `btr_hist_${year}_${mm}_${counter}`,
          realizationNo: `BTR-${year}-${String(counter).padStart(4, '0')}`,
          businessTripId: tripId, businessTripNo: requestNo,
          travelerUsername: p.un, travelerName: p.name, position: p.pos, allowancePerDay: p.allow,
          destination: dest.area, destinationCity: dest.city,
          dateStart: dStart, dateEnd: dEnd,
          plannedDays: actualDuration, actualDays: actualDaysFactor,
          totalAdvanceReceived: totalAdvance,
          actualCosts, actualAllowance,
          totalActual, difference,
          proofs: {
            taxiHome: `https://drive.google.com/file/d/h_${tripId}_a`,
            taxiArrival: actualCosts.taxiArrival > 0 ? `https://drive.google.com/file/d/h_${tripId}_b` : '',
            taxiRs: `https://drive.google.com/file/d/h_${tripId}_c`,
            localTransport: `https://drive.google.com/file/d/h_${tripId}_d`,
            meals: `https://drive.google.com/file/d/h_${tripId}_e`,
            other: actualCosts.other > 0 ? `https://drive.google.com/file/d/h_${tripId}_f` : '',
          },
          notes: 'Historical realization data (auto-generated).',
          status: 'approved',
          approvalHistory: [
            { level: 'submit', by: p.un, byName: p.name, date: dEnd, action: 'submitted', note: '' },
            { level: 'finance', by: 'finance', byName: 'Riris Elia', date: settlementDate, action: 'approved', note: 'Verified' },
            { level: 'manager_ops', by: 'manager_ops', byName: 'Novan Restu', date: settlementDate, action: 'approved', note: 'OK' },
            { level: 'gm', by: 'gm', byName: 'Endah Purwitasari', date: settlementDate, action: 'approved', note: 'Approved' },
          ],
          submittedAt: dEnd, updatedAt: settlementDate,
          settlementStatus: difference !== 0 ? 'settled' : 'pending',
          settlementDate: difference !== 0 ? settlementDate : null,
          settlementAmount: Math.abs(difference),
          settlementNote: difference > 0 ? `Karyawan kembalikan kelebihan Rp ${Math.abs(difference).toLocaleString('id-ID')}` :
            difference < 0 ? `Kantor reimburse kekurangan Rp ${Math.abs(difference).toLocaleString('id-ID')}` : '',
        });
      }
    });
  });

  return { trips, realizations };
}
const _historical = generateHistoricalBusinessTrips();
const HISTORICAL_BT = _historical.trips;
const HISTORICAL_BTR = _historical.realizations;
const ALL_BUSINESS_TRIPS = [...SEED_BUSINESS_TRIPS, ...HISTORICAL_BT];
const ALL_BT_REALIZATIONS = [...SEED_BT_REALIZATIONS, ...HISTORICAL_BTR];
function generateRegulatoryRecords(units) {
  return units.map((u, i) => {
    const stages = ['docs', 'submit', 'eval', 'pnbp', 'issued'];
    let stage = u.regulatoryStage || (i < 3 ? 'eval' : 'issued');

    const stageIdx = stages.indexOf(stage);
    return {
      id: `reg_${u.id}`, unitId: u.id, customer: u.customer,
      modality: u.modality, subModality: u.subModality,
      installDate: u.installDate, stage, stageIdx,
      docsComplete: stageIdx >= 1, submitDate: stageIdx >= 1 ? u.installDate : null,
      evalDate: stageIdx >= 2 ? u.installDate : null,
      pnbpAmount: stageIdx >= 3 ? 12500000 : null,
      issuedDate: stageIdx >= 4 ? (u.utilizationPermitDoneAt || u.installDate) : null,
      pic: 'Ananda Rifki Bayu Saputra', note: stage === 'eval' ? 'Menunggu hasil evaluasi BAPETEN' : stage === 'pnbp' ? 'PNBP sudah terbit, menunggu pembayaran' : stage === 'docs' ? 'Sedang mengumpulkan SOP & dokumen teknis' : '',
    };
  });
}

export { generateHntiSph2026Seed, _RAW_ALL_SPH, ALL_SPH, buildSeedNotificationsFromSph, generateInstalledUnits, generateSeedManifestsFromSph, generateSeedCustomsDocsFromSph, SEED_MANIFESTS, SEED_CUSTOMS_DOCS, generateInstallDocs, INSTALL_DOCS, generateHistoricalBusinessTrips, _historical, HISTORICAL_BT, HISTORICAL_BTR, ALL_BUSINESS_TRIPS, ALL_BT_REALIZATIONS, generateRegulatoryRecords };
