/**
 * ConstructFlow — Shared State Store
 * Real-time sync between Client & Contractor dashboards
 * Uses: localStorage (persistence) + BroadcastChannel (live sync)
 *
 * BroadcastChannel is a native browser API — no server needed.
 * Open both dashboards in different tabs and all changes sync instantly.
 */

const Store = (() => {
  const CHANNEL = 'constructflow_v2';
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null;
  const listeners = {};

  // ── SEED DATA (first load) ──────────────────────────────────────────────
  const SEED = {
    cf_project: {
      id: 'CF-2026-00142',
      name: 'Sunrise Villa',
      client: 'Amir Khan',
      clientEmail: 'amir.khan@email.com',
      contractor: 'BuildPro Ltd.',
      contractorName: 'Rahul Patel',
      budget: 510000,
      stage: 'Roofing',
      stageIndex: 3,
      progress: 72,
      startDate: 'Jan 5, 2026',
      endDate: 'Sep 5, 2026',
      location: 'Plot 42, Green Meadows, Mumbai',
      description: '3BHK luxury villa with rooftop terrace and home office',
      stages: [
        { name:'Foundation', pct:100, status:'done', start:'Jan 5', end:'Feb 10' },
        { name:'Structure', pct:100, status:'done', start:'Feb 12', end:'Mar 20' },
        { name:'Wall Work', pct:100, status:'done', start:'Mar 22', end:'Apr 15' },
        { name:'Roofing', pct:68, status:'active', start:'May 10', end:'Jun 2' },
        { name:'Electrical', pct:0, status:'pending', start:'Jun 5', end:'Jun 25' },
        { name:'Plumbing', pct:0, status:'pending', start:'Jun 10', end:'Jul 5' },
        { name:'Painting', pct:0, status:'pending', start:'Jul 8', end:'Jul 22' },
        { name:'Interior', pct:0, status:'pending', start:'Jul 25', end:'Aug 15' },
        { name:'Finishing', pct:0, status:'pending', start:'Aug 18', end:'Sep 5' },
      ]
    },

    cf_costs: {
      budget: 510000,
      material: 142000,
      labour: 85000,
      transport: 12000,
      equipment: 28000,
      extra: 17000,
      advance: 88000,
      total: 284000,
      remaining: 226000,
      pending: 28000,
    },

    cf_activities: [
      { id:'a1', time:'09:00 AM', date:'May 25, 2026', actor:'Rahul Patel', role:'contractor', type:'photo', icon:'📷', color:'#6366f1', title:'Roofing photos uploaded', desc:'3 new photos of north roof section added', tag:'Roofing', hasPhotos:true, photoIds:['p1','p2','p3'] },
      { id:'a2', time:'11:30 AM', date:'May 25, 2026', actor:'Rahul Patel', role:'contractor', type:'progress', icon:'✅', color:'#10b981', title:'North roof section completed', desc:'68% of roofing work done. Waterproofing membrane installed.', tag:'Roofing', hasPhotos:false },
      { id:'a3', time:'02:00 PM', date:'May 25, 2026', actor:'Rahul Patel', role:'contractor', type:'cost', icon:'💰', color:'#f59e0b', title:'Cost updated — Roofing tiles', desc:'Material cost updated: $4,200 for 320 premium roofing tiles. Invoice uploaded.', tag:'Cost Update', hasPhotos:true, photoIds:['p4'] },
      { id:'a4', time:'05:00 PM', date:'May 24, 2026', actor:'Amir Khan', role:'client', type:'approval', icon:'✅', color:'#10b981', title:'Wall Work Stage Approved', desc:'Client approved Wall Work stage with note: "Excellent quality finish!"', tag:'Approval' },
      { id:'a5', time:'03:30 PM', date:'May 24, 2026', actor:'Rahul Patel', role:'contractor', type:'material', icon:'📦', color:'#06b6d4', title:'Material delivery recorded', desc:'320 roofing tiles delivered from TilePro Co. Delivery photos attached.', tag:'Materials', hasPhotos:true, photoIds:['p5'] },
      { id:'a6', time:'10:00 AM', date:'May 23, 2026', actor:'Rahul Patel', role:'contractor', type:'labour', icon:'👷', color:'#8b5cf6', title:'Labour attendance updated', desc:'24 workers present today. Team assignments updated.', tag:'Labour' },
    ],

    cf_messages: [
      { id:'m1', from:'contractor', fromName:'Rahul Patel', avatar:'RP', text:'Good morning Mr. Khan! Roofing progress at 68%. North section completed today. Photos uploaded for your review.', time:'8:15 AM', date:'May 25, 2026', read:true, type:'text' },
      { id:'m2', from:'client', fromName:'Amir Khan', avatar:'AK', text:'Great work! Please ensure waterproofing quality is double-checked before moving to electrical.', time:'8:42 AM', date:'May 25, 2026', read:true, type:'text' },
      { id:'m3', from:'contractor', fromName:'Rahul Patel', avatar:'RP', text:'Absolutely! Waterproofing membrane has been installed and inspected. Invoice for roofing materials uploaded — $4,200 for 320 premium tiles.', time:'11:35 AM', date:'May 25, 2026', read:true, type:'text' },
      { id:'m4', from:'client', fromName:'Amir Khan', avatar:'AK', text:'I can see the invoice. Looks good. What\'s the timeline for completing the full roof?', time:'2:10 PM', date:'May 25, 2026', read:true, type:'text' },
      { id:'m5', from:'contractor', fromName:'Rahul Patel', avatar:'RP', text:'Full roof completion expected by June 2nd. 8 working days remaining. Weather is clear — no delays expected. 🏗️', time:'2:25 PM', date:'May 25, 2026', read:false, type:'text' },
    ],

    cf_photos: [
      { id:'p1', title:'North Roof — Section A', stage:'Roofing', category:'During', date:'May 25, 2026', time:'9:00 AM', uploader:'Rahul Patel', uploaderRole:'contractor', desc:'Tiles being laid on north roof section. 45% complete.', tags:['Roofing','Progress'], approved:false, clientComment:'', dataUrl: null, placeholder:true, placeholderColor:'#6366f1' },
      { id:'p2', title:'Waterproofing Membrane', stage:'Roofing', category:'After', date:'May 25, 2026', time:'11:20 AM', uploader:'Rahul Patel', uploaderRole:'contractor', desc:'Waterproofing membrane fully installed on completed sections.', tags:['Roofing','Quality'], approved:true, clientComment:'Looks good!', dataUrl: null, placeholder:true, placeholderColor:'#8b5cf6' },
      { id:'p3', title:'Ridge Beam Close-up', stage:'Roofing', category:'During', date:'May 25, 2026', time:'10:30 AM', uploader:'Rahul Patel', uploaderRole:'contractor', desc:'Ridge beam installation — structural close-up.', tags:['Roofing','Structure'], approved:false, clientComment:'', dataUrl: null, placeholder:true, placeholderColor:'#06b6d4' },
      { id:'p4', title:'Roofing Tiles Invoice', stage:'Roofing', category:'Invoice', date:'May 25, 2026', time:'2:00 PM', uploader:'Rahul Patel', uploaderRole:'contractor', desc:'Invoice from TilePro Co. for 320 premium tiles at $13.125/pc = $4,200.', tags:['Invoice','Materials'], approved:false, clientComment:'', dataUrl: null, placeholder:true, placeholderColor:'#f59e0b' },
      { id:'p5', title:'Tile Delivery — Truck Unload', stage:'Roofing', category:'Before', date:'May 24, 2026', time:'3:30 PM', uploader:'Rahul Patel', uploaderRole:'contractor', desc:'320 roofing tiles delivered by TilePro Co. All units inspected — no damage.', tags:['Delivery','Materials'], approved:true, clientComment:'Great documentation!', dataUrl: null, placeholder:true, placeholderColor:'#10b981' },
      { id:'p6', title:'Foundation Complete', stage:'Foundation', category:'After', date:'Feb 10, 2026', time:'4:00 PM', uploader:'Rahul Patel', uploaderRole:'contractor', desc:'Foundation stage fully completed. Concrete cured.', tags:['Foundation','Complete'], approved:true, clientComment:'Excellent work on foundation!', dataUrl: null, placeholder:true, placeholderColor:'#ec4899' },
    ],

    cf_materials: [
      { id:'mat1', name:'Portland Cement OPC 53', category:'Cement', qty:248, unit:'bags', price:12.5, supplier:'UltraTech Cement', status:'delivered', date:'May 20', hasPhoto:true },
      { id:'mat2', name:'TMT Steel Bars 12mm', category:'Steel', qty:850, unit:'kg', price:0.85, supplier:'TATA Steel', status:'delivered', date:'May 15', hasPhoto:true },
      { id:'mat3', name:'Roofing Tiles Premium', category:'Tiles', qty:320, unit:'pcs', price:4.20, supplier:'TilePro Co.', status:'delivered', date:'May 24', hasPhoto:true },
      { id:'mat4', name:'OPC Cement Grade 43', category:'Cement', qty:12, unit:'bags', price:11.0, supplier:'ACC Ltd.', status:'low', date:'May 18', hasPhoto:false },
      { id:'mat5', name:'Primer White 20L', category:'Paint', qty:20, unit:'liters', price:8.5, supplier:'Asian Paints', status:'transit', date:'May 26', hasPhoto:false },
      { id:'mat6', name:'MS Pipes 2inch', category:'Plumbing', qty:50, unit:'m', price:12, supplier:'APL Apollo', status:'ordered', date:'Jun 1', hasPhoto:false },
    ],

    cf_workers: [
      { id:'w1', name:'Ahmad Raza', role:'Mason', wage:180, project:'Sunrise Villa', status:'present', phone:'+91 98001 11111', initials:'AR', joined:'Jan 10' },
      { id:'w2', name:'Bilal Khan', role:'Carpenter', wage:200, project:'Sunrise Villa', status:'present', phone:'+91 98002 22222', initials:'BK', joined:'Feb 1' },
      { id:'w3', name:'Sajid Ali', role:'Electrician', wage:220, project:'Sunrise Villa', status:'absent', phone:'+91 98003 33333', initials:'SA', joined:'Feb 15' },
      { id:'w4', name:'Naveed Iqbal', role:'Plumber', wage:210, project:'Sunrise Villa', status:'present', phone:'+91 98004 44444', initials:'NI', joined:'Mar 5' },
      { id:'w5', name:'Imran Siddiqui', role:'Painter', wage:160, project:'Sunrise Villa', status:'leave', phone:'+91 98005 55555', initials:'IS', joined:'Mar 20' },
      { id:'w6', name:'Tariq Mahmood', role:'Welder', wage:190, project:'Sunrise Villa', status:'present', phone:'+91 98006 66666', initials:'TM', joined:'Jan 20' },
    ],

    cf_approvals: [
      { id:'ap1', stage:'Roofing', type:'Photo Approval', desc:'Please review North Roof Section photos and approve to proceed.', status:'pending', date:'May 25, 2026', photoIds:['p1','p3'], clientNote:'' },
      { id:'ap2', stage:'Wall Work', type:'Stage Completion', desc:'Wall Work stage 100% complete. Approved by structural engineer.', status:'approved', date:'Apr 15, 2026', clientNote:'Excellent quality finish!', photoIds:[] },
      { id:'ap3', stage:'Foundation', type:'Stage Completion', desc:'Foundation fully completed and certified.', status:'approved', date:'Feb 10, 2026', clientNote:'Great job on foundation!', photoIds:[] },
    ],

    cf_payments: [
      { id:'pay1', date:'May 1, 2026', desc:'Roofing Stage Advance', amount:42000, method:'Bank Transfer', status:'paid', receipt:null },
      { id:'pay2', date:'Apr 1, 2026', desc:'Wall Work Completion', amount:38000, method:'Cheque', status:'paid', receipt:null },
      { id:'pay3', date:'Mar 5, 2026', desc:'Structural Stage', amount:54000, method:'Bank Transfer', status:'paid', receipt:null },
      { id:'pay4', date:'Feb 1, 2026', desc:'Foundation Stage', amount:62000, method:'Bank Transfer', status:'paid', receipt:null },
      { id:'pay5', date:'Jan 10, 2026', desc:'Initial Advance', amount:88000, method:'Bank Transfer', status:'paid', receipt:null },
      { id:'pay6', date:'Jun 1, 2026', desc:'Roofing Completion', amount:28000, method:'Pending', status:'pending', receipt:null },
    ],

    cf_typing: {},
    cf_notifications_client: [],
    cf_notifications_contractor: [],
  };

  // ── INIT ──────────────────────────────────────────────────────────────
  function init() {
    // Seed data if not already in localStorage
    Object.entries(SEED).forEach(([key, value]) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });

    // Listen for broadcast messages from other tabs
    if (channel) {
      channel.onmessage = (event) => {
        const { type, key, data } = event.data;
        // Update localStorage
        if (key && data !== undefined) {
          localStorage.setItem(key, JSON.stringify(data));
        }
        // Fire local listeners
        if (listeners[type]) {
          listeners[type].forEach(fn => fn(data));
        }
        // Fire wildcard listeners
        if (listeners['*']) {
          listeners['*'].forEach(fn => fn({ type, key, data }));
        }
      };
    }
  }

  // ── GET / SET ─────────────────────────────────────────────────────────
  function get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || SEED[key];
    } catch {
      return SEED[key];
    }
  }

  function set(key, value, broadcastType) {
    localStorage.setItem(key, JSON.stringify(value));
    if (channel && broadcastType) {
      channel.postMessage({ type: broadcastType, key, data: value });
    }
  }

  // ── SUBSCRIBE ─────────────────────────────────────────────────────────
  function on(eventType, callback) {
    if (!listeners[eventType]) listeners[eventType] = [];
    listeners[eventType].push(callback);
    return () => {
      listeners[eventType] = listeners[eventType].filter(fn => fn !== callback);
    };
  }

  // ── BROADCAST ─────────────────────────────────────────────────────────
  function broadcast(type, key, data) {
    if (channel) channel.postMessage({ type, key, data });
  }

  // ── ACTIVITIES ────────────────────────────────────────────────────────
  function addActivity(activity) {
    const acts = get('cf_activities');
    const newAct = {
      id: 'a' + Date.now(),
      time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
      ...activity
    };
    acts.unshift(newAct);
    set('cf_activities', acts, 'ACTIVITY_ADDED');
    addNotification(activity.role === 'contractor' ? 'client' : 'contractor', {
      title: newAct.title,
      desc: newAct.desc,
      time: newAct.time,
      icon: newAct.icon,
      color: newAct.color,
    });
    return newAct;
  }

  // ── MESSAGES ──────────────────────────────────────────────────────────
  function addMessage(msg) {
    const msgs = get('cf_messages');
    const newMsg = {
      id: 'm' + Date.now(),
      time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
      read: false,
      ...msg
    };
    msgs.push(newMsg);
    set('cf_messages', msgs, 'MESSAGE_SENT');
    return newMsg;
  }

  function markMessagesRead(role) {
    const msgs = get('cf_messages');
    let changed = false;
    msgs.forEach(m => {
      if (m.from !== role && !m.read) { m.read = true; changed = true; }
    });
    if (changed) set('cf_messages', msgs, 'MESSAGES_READ');
  }

  // ── PHOTOS ────────────────────────────────────────────────────────────
  function addPhoto(photo) {
    const photos = get('cf_photos');
    const newPhoto = {
      id: 'p' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
      approved: false,
      clientComment: '',
      placeholder: !photo.dataUrl,
      ...photo
    };
    photos.unshift(newPhoto);
    set('cf_photos', photos, 'PHOTO_UPLOADED');
    return newPhoto;
  }

  function approvePhoto(photoId, comment) {
    const photos = get('cf_photos');
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      photo.approved = true;
      photo.clientComment = comment;
      set('cf_photos', photos, 'PHOTO_APPROVED');
    }
  }

  // ── COSTS ─────────────────────────────────────────────────────────────
  function updateCosts(updates) {
    const costs = get('cf_costs');
    Object.assign(costs, updates);
    costs.total = costs.material + costs.labour + costs.transport + costs.equipment + costs.extra;
    costs.remaining = costs.budget - costs.total;
    set('cf_costs', costs, 'COST_UPDATED');
    return costs;
  }

  // ── APPROVALS ─────────────────────────────────────────────────────────
  function requestApproval(approval) {
    const approvals = get('cf_approvals');
    const newAp = { id: 'ap' + Date.now(), status:'pending', date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}), clientNote:'', ...approval };
    approvals.unshift(newAp);
    set('cf_approvals', approvals, 'APPROVAL_REQUESTED');
    addActivity({ actor:'Rahul Patel', role:'contractor', type:'approval_request', icon:'📋', color:'#f59e0b', title:`Approval requested: ${approval.stage}`, desc: approval.desc, tag:'Approval Request' });
    return newAp;
  }

  function respondApproval(approvalId, status, note) {
    const approvals = get('cf_approvals');
    const ap = approvals.find(a => a.id === approvalId);
    if (ap) {
      ap.status = status;
      ap.clientNote = note;
      set('cf_approvals', approvals, status === 'approved' ? 'STAGE_APPROVED' : 'STAGE_REJECTED');
      addActivity({ actor:'Amir Khan', role:'client', type:'approval', icon: status==='approved'?'✅':'❌', color: status==='approved'?'#10b981':'#ef4444', title:`Stage ${status}: ${ap.stage}`, desc: note || `Client ${status} the ${ap.stage} stage.`, tag:'Approval' });
    }
  }

  // ── TYPING ────────────────────────────────────────────────────────────
  function setTyping(role, isTyping) {
    const typing = get('cf_typing') || {};
    typing[role] = isTyping;
    set('cf_typing', typing);
    broadcast('TYPING', 'cf_typing', typing);
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────
  function addNotification(recipient, notif) {
    const key = `cf_notifications_${recipient}`;
    const notifs = get(key) || [];
    notifs.unshift({ id: 'n' + Date.now(), ...notif, read: false });
    set(key, notifs.slice(0, 50), 'NOTIFICATION');
  }

  function getNotifications(role) { return get(`cf_notifications_${role}`) || []; }
  function markNotifRead(role, id) {
    const key = `cf_notifications_${role}`;
    const notifs = get(key) || [];
    const n = notifs.find(n => n.id === id);
    if (n) { n.read = true; set(key, notifs, 'NOTIF_READ'); }
  }

  // ── MATERIALS ─────────────────────────────────────────────────────────
  function addMaterial(material) {
    const mats = get('cf_materials');
    const newMat = { id: 'mat' + Date.now(), date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}), ...material };
    mats.unshift(newMat);
    set('cf_materials', mats, 'MATERIAL_ADDED');
    addActivity({ actor:'Rahul Patel', role:'contractor', type:'material', icon:'📦', color:'#06b6d4', title:`Material added: ${material.name}`, desc:`${material.qty} ${material.unit} from ${material.supplier}`, tag:'Materials' });
    return newMat;
  }

  // ── WORKERS ───────────────────────────────────────────────────────────
  function updateWorkerStatus(workerId, status) {
    const workers = get('cf_workers');
    const w = workers.find(w => w.id === workerId);
    if (w) { w.status = status; set('cf_workers', workers, 'WORKER_UPDATED'); }
  }

  // ── RESET (dev) ───────────────────────────────────────────────────────
  function reset() {
    Object.keys(SEED).forEach(k => localStorage.removeItem(k));
    init();
  }

  init();

  return { get, set, on, broadcast, addActivity, addMessage, markMessagesRead, addPhoto, approvePhoto, updateCosts, requestApproval, respondApproval, setTyping, addNotification, getNotifications, markNotifRead, addMaterial, updateWorkerStatus, reset };
})();

window.Store = Store;
