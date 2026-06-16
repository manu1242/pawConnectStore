const KEY_MAP = {
  category: "c",
  originalPrice: "op",
  offerEnabled: "oe",
  offerType: "ot",
  discountAmount: "da",
  offerTitle: "ti",
  offerEndDate: "ed",
  suitablePets: "sp",
  homeServiceAvailable: "hs",
  emergencyServiceAvailable: "es",
  includes: "in"
};

const REVERSE_KEY_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

const DEFAULTS = {
  category: "",
  originalPrice: 0,
  offerEnabled: false,
  offerType: "",
  discountAmount: 0,
  offerTitle: "",
  offerEndDate: "",
  duration: "60 min",
  suitablePets: "All Pets",
  includes: [],
  homeServiceAvailable: false,
  emergencyServiceAvailable: false,
  active: true
};

function isDefault(key, val) {
  const defaultVal = DEFAULTS[key];
  if (defaultVal === undefined) return false;
  return JSON.stringify(val) === JSON.stringify(defaultVal);
}

export function parseService(srv) {
  if (!srv) return null;
  
  let description = srv.description || "";
  let metadata = {};
  
  while (description.startsWith("[SERVICE_METADATA:")) {
    let bracketCount = 0;
    let j = 0;
    let foundEnd = false;
    
    while (j < description.length) {
      if (description[j] === "[") {
        bracketCount++;
      } else if (description[j] === "]") {
        bracketCount--;
        if (bracketCount === 0) {
          try {
            const jsonStr = description.slice(18, j);
            const parsedMeta = JSON.parse(jsonStr);
            
            // Unpack: support both short-key (compressed) and long-key (legacy) metadata formats
            for (const [k, v] of Object.entries(parsedMeta)) {
              const longKey = REVERSE_KEY_MAP[k];
              if (longKey) {
                metadata[longKey] = v;
              } else {
                metadata[k] = v;
              }
            }
            description = description.slice(j + 1);
            foundEnd = true;
          } catch (e) {
            console.error("Failed to parse service metadata", e);
          }
          break;
        }
      }
      j++;
    }
    
    if (!foundEnd) {
      break;
    }
  }

  // Calculate default price
  const op = srv.originalPrice !== undefined ? srv.originalPrice : (metadata.originalPrice !== undefined ? metadata.originalPrice : (srv.price || 0));
  const oe = srv.offerEnabled !== undefined ? srv.offerEnabled : (metadata.offerEnabled !== undefined ? metadata.offerEnabled : false);
  const da = srv.discountAmount !== undefined ? srv.discountAmount : (metadata.discountAmount !== undefined ? metadata.discountAmount : 0);
  const calculatedPrice = oe ? Math.max(0, Number(op) - Number(da)) : Number(op);

  const merged = {
    ...DEFAULTS,
    ...metadata,
    _id: srv._id || metadata._id || Math.random().toString(36).substring(2, 9),
    name: srv.name || metadata.name || "",
    price: srv.price !== undefined ? srv.price : calculatedPrice,
    duration: srv.duration || metadata.duration || "60 min",
    image: srv.image || metadata.image || "",
    photo: srv.photo || srv.image || metadata.photo || "",
    active: srv.active !== undefined ? srv.active : (metadata.active !== undefined ? metadata.active : true),
    includes: srv.includes && srv.includes.length ? srv.includes : (metadata.includes || []),
    category: srv.category || metadata.category || "",
    originalPrice: Number(op),
    offerEnabled: oe,
    offerType: srv.offerType || metadata.offerType || "",
    discountAmount: Number(da),
    offerTitle: srv.offerTitle || metadata.offerTitle || "",
    offerEndDate: srv.offerEndDate || metadata.offerEndDate || "",
    suitablePets: srv.suitablePets || srv.suitableFor || metadata.suitablePets || metadata.suitableFor || "All Pets",
    homeServiceAvailable: srv.homeServiceAvailable !== undefined ? srv.homeServiceAvailable : (metadata.homeServiceAvailable !== undefined ? metadata.homeServiceAvailable : false),
    emergencyServiceAvailable: srv.emergencyServiceAvailable !== undefined ? srv.emergencyServiceAvailable : (metadata.emergencyServiceAvailable !== undefined ? metadata.emergencyServiceAvailable : false),
    availability: {
      availableDays: srv.availability?.availableDays || [],
      availableTimeSlots: srv.availability?.availableTimeSlots || [],
      maxBookingsPerDay: srv.availability?.maxBookingsPerDay || 10,
      homeServiceAvailable: srv.homeServiceAvailable !== undefined ? srv.homeServiceAvailable : (srv.availability?.homeServiceAvailable || false),
      storeVisitAvailable: srv.availability?.storeVisitAvailable !== undefined ? srv.availability.storeVisitAvailable : true,
      emergencyBookingAvailable: srv.emergencyServiceAvailable !== undefined ? srv.emergencyServiceAvailable : (srv.availability?.emergencyBookingAvailable || false)
    },
    specialOffers: {
      limitedTimeOffer: oe,
      buyOneGetOne: srv.specialOffers?.buyOneGetOne || false,
      packageDiscounts: srv.specialOffers?.packageDiscounts || false,
      membershipDiscounts: srv.specialOffers?.membershipDiscounts || false,
      couponCodes: srv.specialOffers?.couponCodes || []
    },
    description
  };
  
  return merged;
}

export function serializeService(srv) {
  if (!srv) return null;
  
  const {
    _id,
    name,
    price,
    duration,
    image,
    photo,
    active,
    description,
    ...extra
  } = srv;
  
  // Compress extra fields to short keys, skipping default values to minimize character footprint
  const compressedMeta = {};
  for (const [key, val] of Object.entries(extra)) {
    const shortKey = KEY_MAP[key];
    if (shortKey && !isDefault(key, val)) {
      compressedMeta[shortKey] = val;
    }
  }
  
  const jsonStr = JSON.stringify(compressedMeta);
  const serializedDesc = `[SERVICE_METADATA:${jsonStr}]${description || ""}`;
  
  const op = Number(srv.originalPrice !== undefined ? srv.originalPrice : price || 0);
  const oe = srv.offerEnabled !== undefined ? srv.offerEnabled : false;
  const da = Number(srv.discountAmount || 0);
  const calculatedPrice = oe ? Math.max(0, op - da) : op;

  return {
    _id,
    name,
    price: calculatedPrice,
    duration: duration || "60 min",
    image: image || photo || "",
    photo: photo || image || "",
    active: active !== undefined ? active : true,
    includes: srv.includes || [],
    description: serializedDesc,
    
    // Also include extra fields directly for native DB support
    category: srv.category || "",
    originalPrice: op,
    offerEnabled: oe,
    offerType: srv.offerType || "",
    discountAmount: da,
    offerTitle: srv.offerTitle || "",
    offerEndDate: srv.offerEndDate || null,
    suitablePets: srv.suitablePets || "All Pets",
    suitableFor: srv.suitablePets || "All Pets",
    homeServiceAvailable: srv.homeServiceAvailable !== undefined ? srv.homeServiceAvailable : false,
    emergencyServiceAvailable: srv.emergencyServiceAvailable !== undefined ? srv.emergencyServiceAvailable : false
  };
}
