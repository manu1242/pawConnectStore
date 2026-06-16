const KEY_MAP = {
  category: "c",
  shortDescription: "s",
  images: "im",
  video: "v",
  originalPrice: "op",
  offerPrice: "of",
  discountPercentage: "dp",
  taxIncluded: "t",
  homeVisitCharges: "hv",
  emergencyCharges: "ec",
  weekendCharges: "we",
  festivalCharges: "fe",
  suitableBreeds: "b",
  suitableAgeGroups: "a",
  minWeight: "wn",
  maxWeight: "wx",
  notIncludes: "ni",
  specialOffers: "so",
  availability: "av",
  requirementsBeforeService: "rq",
  afterServiceCareInstructions: "ac",
  cancellationPolicy: "cp",
  serviceStatus: "ss",
  ratingsAnalytics: "ra",
  seoSearch: "seo"
};

const REVERSE_KEY_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

const DEFAULTS = {
  category: "",
  shortDescription: "",
  images: [],
  video: "",
  originalPrice: 0,
  offerPrice: 0,
  discountPercentage: 0,
  taxIncluded: true,
  homeVisitCharges: 0,
  emergencyCharges: 0,
  weekendCharges: 0,
  festivalCharges: 0,
  suitableBreeds: "",
  suitableAgeGroups: [],
  minWeight: 0,
  maxWeight: 0,
  notIncludes: [],
  specialOffers: {
    limitedTimeOffer: false,
    buyOneGetOne: false,
    packageDiscounts: false,
    membershipDiscounts: false,
    couponCodes: []
  },
  availability: {
    availableDays: [],
    availableTimeSlots: [],
    maxBookingsPerDay: 10,
    homeServiceAvailable: false,
    storeVisitAvailable: true,
    emergencyBookingAvailable: false
  },
  requirementsBeforeService: [],
  afterServiceCareInstructions: [],
  cancellationPolicy: {
    freeCancellationBeforeHours: 24,
    cancellationCharges: 0
  },
  serviceStatus: "Active",
  ratingsAnalytics: {
    totalBookings: 0,
    averageRating: 5,
    reviewsCount: 0,
    revenueGenerated: 0
  },
  seoSearch: {
    keywords: [],
    tags: [],
    featuredService: false,
    popularServiceBadge: false
  }
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
  
  if (description.startsWith("[SERVICE_METADATA:")) {
    const endIdx = description.indexOf("]");
    if (endIdx !== -1) {
      try {
        const jsonStr = description.slice(18, endIdx);
        const parsedMeta = JSON.parse(jsonStr);
        
        // Unpack: support both short-key (compressed) and long-key (legacy) metadata formats
        metadata = {};
        for (const [k, v] of Object.entries(parsedMeta)) {
          const longKey = REVERSE_KEY_MAP[k];
          if (longKey) {
            metadata[longKey] = v;
          } else {
            metadata[k] = v;
          }
        }
        description = description.slice(endIdx + 1);
      } catch (e) {
        console.error("Failed to parse service metadata", e);
      }
    }
  }

  // Merge: native fields take priority if present and non-empty (to support native backend)
  // otherwise fallback to metadata fields.
  const merged = {
    ...DEFAULTS,
    ...metadata,
    _id: srv._id || metadata._id || Math.random().toString(36).substring(2, 9),
    name: srv.name || metadata.name || "",
    price: srv.price !== undefined ? srv.price : (metadata.price || 0),
    duration: srv.duration || metadata.duration || "60 min",
    image: srv.image || metadata.image || "",
    photo: srv.photo || srv.image || metadata.photo || "",
    petTypes: srv.petTypes && srv.petTypes.length ? srv.petTypes : (metadata.petTypes || ["All Pets"]),
    suitableFor: srv.suitableFor || metadata.suitableFor || "All Pets",
    active: srv.active !== undefined ? srv.active : (metadata.active !== undefined ? metadata.active : true),
    includes: srv.includes && srv.includes.length ? srv.includes : (metadata.includes || []),
    category: srv.category || metadata.category || "",
    shortDescription: srv.shortDescription || metadata.shortDescription || "",
    images: srv.images && srv.images.length ? srv.images : (metadata.images || []),
    video: srv.video || metadata.video || "",
    originalPrice: srv.originalPrice !== undefined ? srv.originalPrice : (metadata.originalPrice !== undefined ? metadata.originalPrice : (srv.price || 0)),
    offerPrice: srv.offerPrice !== undefined ? srv.offerPrice : (metadata.offerPrice !== undefined ? metadata.offerPrice : (srv.price || 0)),
    discountPercentage: srv.discountPercentage !== undefined ? srv.discountPercentage : (metadata.discountPercentage || 0),
    taxIncluded: srv.taxIncluded !== undefined ? srv.taxIncluded : (metadata.taxIncluded !== undefined ? metadata.taxIncluded : true),
    homeVisitCharges: srv.homeVisitCharges !== undefined ? srv.homeVisitCharges : (metadata.homeVisitCharges || 0),
    emergencyCharges: srv.emergencyCharges !== undefined ? srv.emergencyCharges : (metadata.emergencyCharges || 0),
    weekendCharges: srv.weekendCharges !== undefined ? srv.weekendCharges : (metadata.weekendCharges || 0),
    festivalCharges: srv.festivalCharges !== undefined ? srv.festivalCharges : (metadata.festivalCharges || 0),
    suitableBreeds: srv.suitableBreeds || metadata.suitableBreeds || "",
    suitableAgeGroups: srv.suitableAgeGroups && srv.suitableAgeGroups.length ? srv.suitableAgeGroups : (metadata.suitableAgeGroups || []),
    minWeight: srv.minWeight !== undefined ? srv.minWeight : (metadata.minWeight || 0),
    maxWeight: srv.maxWeight !== undefined ? srv.maxWeight : (metadata.maxWeight || 0),
    notIncludes: srv.notIncludes && srv.notIncludes.length ? srv.notIncludes : (metadata.notIncludes || []),
    specialOffers: srv.specialOffers || metadata.specialOffers || {
      limitedTimeOffer: false,
      buyOneGetOne: false,
      packageDiscounts: false,
      membershipDiscounts: false,
      couponCodes: []
    },
    availability: srv.availability || metadata.availability || {
      availableDays: [],
      availableTimeSlots: [],
      maxBookingsPerDay: 10,
      homeServiceAvailable: false,
      storeVisitAvailable: true,
      emergencyBookingAvailable: false
    },
    requirementsBeforeService: srv.requirementsBeforeService && srv.requirementsBeforeService.length ? srv.requirementsBeforeService : (metadata.requirementsBeforeService || []),
    afterServiceCareInstructions: srv.afterServiceCareInstructions && srv.afterServiceCareInstructions.length ? srv.afterServiceCareInstructions : (metadata.afterServiceCareInstructions || []),
    cancellationPolicy: srv.cancellationPolicy || metadata.cancellationPolicy || {
      freeCancellationBeforeHours: 24,
      cancellationCharges: 0
    },
    serviceStatus: srv.serviceStatus || metadata.serviceStatus || "Active",
    ratingsAnalytics: srv.ratingsAnalytics || metadata.ratingsAnalytics || {
      totalBookings: 0,
      averageRating: 5,
      reviewsCount: 0,
      revenueGenerated: 0
    },
    seoSearch: srv.seoSearch || metadata.seoSearch || {
      keywords: [],
      tags: [],
      featuredService: false,
      popularServiceBadge: false
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
    petTypes,
    suitableFor,
    active,
    includes,
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
  
  return {
    _id,
    name,
    price: Number(price),
    duration,
    image: image || photo || "",
    photo: photo || image || "",
    petTypes,
    suitableFor,
    active,
    includes,
    description: serializedDesc,
    
    // Also include extra fields directly for native DB support
    category: srv.category || "",
    shortDescription: srv.shortDescription || "",
    images: srv.images || [],
    video: srv.video || "",
    originalPrice: Number(srv.originalPrice !== undefined ? srv.originalPrice : price),
    offerPrice: Number(srv.offerPrice !== undefined ? srv.offerPrice : price),
    discountPercentage: Number(srv.discountPercentage || 0),
    taxIncluded: srv.taxIncluded !== undefined ? srv.taxIncluded : true,
    homeVisitCharges: Number(srv.homeVisitCharges || 0),
    emergencyCharges: Number(srv.emergencyCharges || 0),
    weekendCharges: Number(srv.weekendCharges || 0),
    festivalCharges: Number(srv.festivalCharges || 0),
    suitableBreeds: srv.suitableBreeds || "",
    suitableAgeGroups: srv.suitableAgeGroups || [],
    minWeight: Number(srv.minWeight || 0),
    maxWeight: Number(srv.maxWeight || 0),
    notIncludes: srv.notIncludes || [],
    specialOffers: srv.specialOffers || {
      limitedTimeOffer: false,
      buyOneGetOne: false,
      packageDiscounts: false,
      membershipDiscounts: false,
      couponCodes: []
    },
    availability: srv.availability || {
      availableDays: [],
      availableTimeSlots: [],
      maxBookingsPerDay: 10,
      homeServiceAvailable: false,
      storeVisitAvailable: true,
      emergencyBookingAvailable: false
    },
    requirementsBeforeService: srv.requirementsBeforeService || [],
    afterServiceCareInstructions: srv.afterServiceCareInstructions || [],
    cancellationPolicy: srv.cancellationPolicy || {
      freeCancellationBeforeHours: 24,
      cancellationCharges: 0
    },
    serviceStatus: srv.serviceStatus || "Active",
    ratingsAnalytics: srv.ratingsAnalytics || {
      totalBookings: 0,
      averageRating: 5,
      reviewsCount: 0,
      revenueGenerated: 0
    },
    seoSearch: srv.seoSearch || {
      keywords: [],
      tags: [],
      featuredService: false,
      popularServiceBadge: false
    }
  };
}
