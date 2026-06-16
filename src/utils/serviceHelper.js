export function parseService(srv) {
  if (!srv) return null;
  
  let description = srv.description || "";
  let metadata = {};
  
  // Unpack any legacy metadata format if it exists
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
            
            const KEY_MAP_REVERSE = {
              c: "category",
              op: "price",
              oe: "offerEnabled",
              ot: "offerType",
              da: "discountAmount",
              ti: "offerTitle",
              sp: "suitablePets",
              hs: "homeServiceAvailable",
              es: "emergencyAvailable",
              in: "includes"
            };

            for (const [k, v] of Object.entries(parsedMeta)) {
              const longKey = KEY_MAP_REVERSE[k];
              if (longKey) {
                metadata[longKey] = v;
              } else {
                metadata[k] = v;
              }
            }
            description = description.slice(j + 1);
            foundEnd = true;
          } catch (e) {
            console.error("Failed to parse legacy metadata", e);
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

  // Map database pricing and metadata
  const price = srv.price !== undefined ? Number(srv.price) : (metadata.price !== undefined ? Number(metadata.price) : (srv.originalPrice !== undefined ? Number(srv.originalPrice) : 0));
  const offerEnabled = srv.offerEnabled !== undefined ? srv.offerEnabled : (metadata.offerEnabled !== undefined ? metadata.offerEnabled : false);
  const discountAmount = srv.discountAmount !== undefined ? Number(srv.discountAmount) : (metadata.discountAmount !== undefined ? Number(metadata.discountAmount) : 0);
  const finalPrice = offerEnabled ? Math.max(0, price - discountAmount) : price;

  const petTypes = srv.petTypes && srv.petTypes.length ? srv.petTypes : (metadata.petTypes || (srv.suitablePets ? [srv.suitablePets] : (srv.suitableFor ? [srv.suitableFor] : ["All Pets"])));
  const includes = srv.includes && srv.includes.length ? srv.includes : (metadata.includes || []);

  const merged = {
    _id: srv._id || metadata._id || Math.random().toString(36).substring(2, 9),
    name: srv.name || metadata.name || "",
    category: srv.category || metadata.category || "Pet Grooming",
    image: srv.image || srv.photo || metadata.image || metadata.photo || "",
    description: description || metadata.description || "",
    
    price,
    offerEnabled,
    offerType: srv.offerType || metadata.offerType || "",
    offerTitle: srv.offerTitle || metadata.offerTitle || "",
    discountAmount,
    finalPrice,
    
    duration: srv.duration || metadata.duration || "60 min",
    petTypes: Array.isArray(petTypes) ? petTypes : [petTypes],
    includes: Array.isArray(includes) ? includes : [],
    
    homeServiceAvailable: srv.homeServiceAvailable !== undefined ? srv.homeServiceAvailable : (metadata.homeServiceAvailable !== undefined ? metadata.homeServiceAvailable : false),
    emergencyAvailable: srv.emergencyAvailable !== undefined ? srv.emergencyAvailable : (srv.emergencyServiceAvailable !== undefined ? srv.emergencyServiceAvailable : (metadata.emergencyAvailable !== undefined ? metadata.emergencyAvailable : false)),
    active: srv.active !== undefined ? srv.active : (metadata.active !== undefined ? metadata.active : true)
  };
  
  return merged;
}

export function serializeService(srv) {
  if (!srv) return null;

  const price = Number(srv.price || 0);
  const offerEnabled = !!srv.offerEnabled;
  const discountAmount = Number(srv.discountAmount || 0);
  const finalPrice = offerEnabled ? Math.max(0, price - discountAmount) : price;

  return {
    _id: srv._id,
    name: srv.name || "",
    category: srv.category || "Pet Grooming",
    image: srv.image || srv.photo || "",
    description: srv.description || "",
    
    price,
    offerEnabled,
    offerType: srv.offerType || "",
    offerTitle: srv.offerTitle || "",
    discountAmount,
    finalPrice,
    
    duration: srv.duration || "60 min",
    petTypes: Array.isArray(srv.petTypes) ? srv.petTypes : ["All Pets"],
    includes: Array.isArray(srv.includes) ? srv.includes : [],
    
    homeServiceAvailable: srv.homeServiceAvailable !== undefined ? srv.homeServiceAvailable : false,
    emergencyAvailable: srv.emergencyAvailable !== undefined ? srv.emergencyAvailable : false,
    active: srv.active !== undefined ? srv.active : true
  };
}
