
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  phone: 'phone',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  passwordHash: 'passwordHash',
  profileImage: 'profileImage',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
  governmentId: 'governmentId',
  governmentIdType: 'governmentIdType',
  role: 'role',
  trustLevel: 'trustLevel',
  trustScore: 'trustScore',
  verificationStatus: 'verificationStatus',
  phoneVerified: 'phoneVerified',
  emailVerified: 'emailVerified',
  idVerified: 'idVerified',
  addressVerified: 'addressVerified',
  physicalVerified: 'physicalVerified',
  verificationDate: 'verificationDate',
  status: 'status',
  isSuspended: 'isSuspended',
  suspensionReason: 'suspensionReason',
  suspensionEndsAt: 'suspensionEndsAt',
  totalTransactions: 'totalTransactions',
  totalSpent: 'totalSpent',
  totalEarned: 'totalEarned',
  averageRating: 'averageRating',
  responseRate: 'responseRate',
  cancellationRate: 'cancellationRate',
  guarantorCount: 'guarantorCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLogin: 'lastLogin',
  lastActive: 'lastActive',
  agreedToTerms: 'agreedToTerms',
  agreedToTermsAt: 'agreedToTermsAt',
  marketingOptIn: 'marketingOptIn'
};

exports.Prisma.UserProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  bio: 'bio',
  languages: 'languages',
  occupation: 'occupation',
  education: 'education',
  skills: 'skills',
  region: 'region',
  zone: 'zone',
  woreda: 'woreda',
  kebele: 'kebele',
  city: 'city',
  subcity: 'subcity',
  houseNumber: 'houseNumber',
  landmark: 'landmark',
  latitude: 'latitude',
  longitude: 'longitude',
  formattedAddress: 'formattedAddress',
  secondaryPhone: 'secondaryPhone',
  emergencyContact: 'emergencyContact',
  facebook: 'facebook',
  telegram: 'telegram',
  linkedin: 'linkedin',
  twitter: 'twitter',
  instagram: 'instagram',
  preferences: 'preferences',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  status: 'status',
  rejectionReason: 'rejectionReason',
  documentFront: 'documentFront',
  documentBack: 'documentBack',
  selfieWithDocument: 'selfieWithDocument',
  documentNumber: 'documentNumber',
  documentExpiry: 'documentExpiry',
  issuingAuthority: 'issuingAuthority',
  issuedDate: 'issuedDate',
  utilityBill: 'utilityBill',
  leaseAgreement: 'leaseAgreement',
  otherProof: 'otherProof',
  verifiedBy: 'verifiedBy',
  verificationLocation: 'verificationLocation',
  verificationNotes: 'verificationNotes',
  submittedAt: 'submittedAt',
  verifiedAt: 'verifiedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GuarantorScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  guarantorId: 'guarantorId',
  relationship: 'relationship',
  relationshipDuration: 'relationshipDuration',
  relationshipDescription: 'relationshipDescription',
  status: 'status',
  confirmationCode: 'confirmationCode',
  confirmationMethod: 'confirmationMethod',
  maxGuaranteeAmount: 'maxGuaranteeAmount',
  currentGuaranteeAmount: 'currentGuaranteeAmount',
  requestedAt: 'requestedAt',
  confirmedAt: 'confirmedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  notes: 'notes',
  isActive: 'isActive'
};

exports.Prisma.TrustLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  oldLevel: 'oldLevel',
  newLevel: 'newLevel',
  oldScore: 'oldScore',
  newScore: 'newScore',
  scoreDelta: 'scoreDelta',
  reason: 'reason',
  reasonDetails: 'reasonDetails',
  triggeredBy: 'triggeredBy',
  triggeredById: 'triggeredById',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  icon: 'icon',
  minDepositMultiplier: 'minDepositMultiplier',
  maxDepositMultiplier: 'maxDepositMultiplier',
  requiresVerification: 'requiresVerification',
  insuranceRequired: 'insuranceRequired',
  specialRequirements: 'specialRequirements',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ListingScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  categoryId: 'categoryId',
  title: 'title',
  slug: 'slug',
  description: 'description',
  shortDescription: 'shortDescription',
  pricePerDay: 'pricePerDay',
  pricePerWeek: 'pricePerWeek',
  pricePerMonth: 'pricePerMonth',
  currency: 'currency',
  minimumRentalDays: 'minimumRentalDays',
  maximumRentalDays: 'maximumRentalDays',
  discountWeekly: 'discountWeekly',
  discountMonthly: 'discountMonthly',
  locationRegion: 'locationRegion',
  locationCity: 'locationCity',
  locationSubcity: 'locationSubcity',
  locationWoreda: 'locationWoreda',
  locationKebele: 'locationKebele',
  latitude: 'latitude',
  longitude: 'longitude',
  locationFormatted: 'locationFormatted',
  isExactLocation: 'isExactLocation',
  condition: 'condition',
  yearOfManufacture: 'yearOfManufacture',
  brand: 'brand',
  model: 'model',
  specifications: 'specifications',
  availabilityType: 'availabilityType',
  advanceNoticeHours: 'advanceNoticeHours',
  sameDayBooking: 'sameDayBooking',
  instantBooking: 'instantBooking',
  minTrustLevel: 'minTrustLevel',
  requiresGuarantors: 'requiresGuarantors',
  requiresPhysicalVerification: 'requiresPhysicalVerification',
  requiresIdVerification: 'requiresIdVerification',
  requiresDeposit: 'requiresDeposit',
  insuranceIncluded: 'insuranceIncluded',
  insuranceDetails: 'insuranceDetails',
  insuranceProvider: 'insuranceProvider',
  insurancePremium: 'insurancePremium',
  deliveryAvailable: 'deliveryAvailable',
  deliveryFee: 'deliveryFee',
  deliveryRadius: 'deliveryRadius',
  pickupRequired: 'pickupRequired',
  pickupLocation: 'pickupLocation',
  rules: 'rules',
  cancellationPolicy: 'cancellationPolicy',
  damagePolicy: 'damagePolicy',
  status: 'status',
  isFeatured: 'isFeatured',
  isVerified: 'isVerified',
  verificationDate: 'verificationDate',
  rejectionReason: 'rejectionReason',
  views: 'views',
  saves: 'saves',
  bookingsCount: 'bookingsCount',
  averageRating: 'averageRating',
  responseRate: 'responseRate',
  responseTime: 'responseTime',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt',
  lastBookedAt: 'lastBookedAt'
};

exports.Prisma.ListingImageScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  url: 'url',
  thumbnailUrl: 'thumbnailUrl',
  isPrimary: 'isPrimary',
  caption: 'caption',
  order: 'order',
  verified: 'verified',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.ListingVideoScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  url: 'url',
  thumbnailUrl: 'thumbnailUrl',
  duration: 'duration',
  caption: 'caption',
  order: 'order',
  createdAt: 'createdAt'
};

exports.Prisma.ListingDocumentScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  type: 'type',
  title: 'title',
  url: 'url',
  verified: 'verified',
  verifiedAt: 'verifiedAt',
  createdAt: 'createdAt'
};

exports.Prisma.AvailabilitySlotScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  date: 'date',
  available: 'available',
  price: 'price',
  notes: 'notes',
  blockedBy: 'blockedBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookingScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  renterId: 'renterId',
  ownerId: 'ownerId',
  bookingCode: 'bookingCode',
  startDate: 'startDate',
  endDate: 'endDate',
  totalDays: 'totalDays',
  dailyRate: 'dailyRate',
  totalAmount: 'totalAmount',
  depositAmount: 'depositAmount',
  platformFee: 'platformFee',
  insuranceFee: 'insuranceFee',
  deliveryFee: 'deliveryFee',
  paymentStatus: 'paymentStatus',
  paymentMethod: 'paymentMethod',
  paymentProvider: 'paymentProvider',
  paymentReference: 'paymentReference',
  status: 'status',
  cancellationReason: 'cancellationReason',
  renterTrustLevel: 'renterTrustLevel',
  guarantorsRequired: 'guarantorsRequired',
  guarantorsConfirmed: 'guarantorsConfirmed',
  physicalVerificationRequired: 'physicalVerificationRequired',
  physicalVerificationCompleted: 'physicalVerificationCompleted',
  pickupLocation: 'pickupLocation',
  deliveryLocation: 'deliveryLocation',
  handoverNotes: 'handoverNotes',
  returnNotes: 'returnNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  confirmedAt: 'confirmedAt',
  cancelledAt: 'cancelledAt',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.BookingGuarantorScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  guarantorId: 'guarantorId',
  status: 'status',
  confirmationCode: 'confirmationCode',
  confirmedAt: 'confirmedAt',
  notifiedAt: 'notifiedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  userId: 'userId',
  amount: 'amount',
  currency: 'currency',
  fee: 'fee',
  netAmount: 'netAmount',
  method: 'method',
  provider: 'provider',
  transactionId: 'transactionId',
  reference: 'reference',
  isEscrow: 'isEscrow',
  escrowReleaseDate: 'escrowReleaseDate',
  status: 'status',
  failureReason: 'failureReason',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  completedAt: 'completedAt'
};

exports.Prisma.WalletScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  availableBalance: 'availableBalance',
  pendingBalance: 'pendingBalance',
  escrowBalance: 'escrowBalance',
  withdrawalThreshold: 'withdrawalThreshold',
  autoWithdrawal: 'autoWithdrawal',
  preferredMethod: 'preferredMethod',
  preferredProvider: 'preferredProvider',
  totalDeposits: 'totalDeposits',
  totalWithdrawals: 'totalWithdrawals',
  totalEarnings: 'totalEarnings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastWithdrawalAt: 'lastWithdrawalAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  walletId: 'walletId',
  userId: 'userId',
  type: 'type',
  amount: 'amount',
  currency: 'currency',
  referenceId: 'referenceId',
  referenceType: 'referenceType',
  status: 'status',
  failureReason: 'failureReason',
  description: 'description',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  completedAt: 'completedAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  reviewerId: 'reviewerId',
  revieweeId: 'revieweeId',
  listingId: 'listingId',
  role: 'role',
  rating: 'rating',
  communication: 'communication',
  reliability: 'reliability',
  itemCondition: 'itemCondition',
  valueForMoney: 'valueForMoney',
  title: 'title',
  comment: 'comment',
  isPublic: 'isPublic',
  ownerResponse: 'ownerResponse',
  ownerRespondedAt: 'ownerRespondedAt',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DisputeScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  openedBy: 'openedBy',
  against: 'against',
  type: 'type',
  title: 'title',
  description: 'description',
  status: 'status',
  outcome: 'outcome',
  resolutionAmount: 'resolutionAmount',
  evidence: 'evidence',
  resolutionNotes: 'resolutionNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  resolvedAt: 'resolvedAt',
  escalatedAt: 'escalatedAt',
  closedAt: 'closedAt'
};

exports.Prisma.DisputeMessageScalarFieldEnum = {
  id: 'id',
  disputeId: 'disputeId',
  userId: 'userId',
  content: 'content',
  isInternal: 'isInternal',
  attachments: 'attachments',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  bookingId: 'bookingId',
  content: 'content',
  messageType: 'messageType',
  attachments: 'attachments',
  isRead: 'isRead',
  readAt: 'readAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  data: 'data',
  channels: 'channels',
  emailSent: 'emailSent',
  smsSent: 'smsSent',
  pushSent: 'pushSent',
  inAppSent: 'inAppSent',
  isRead: 'isRead',
  readAt: 'readAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  scheduledFor: 'scheduledFor'
};

exports.Prisma.AgentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  agentCode: 'agentCode',
  type: 'type',
  businessName: 'businessName',
  businessLicense: 'businessLicense',
  taxId: 'taxId',
  operatingRegion: 'operatingRegion',
  operatingCity: 'operatingCity',
  address: 'address',
  latitude: 'latitude',
  longitude: 'longitude',
  services: 'services',
  serviceRadius: 'serviceRadius',
  totalTransactions: 'totalTransactions',
  totalCommission: 'totalCommission',
  averageRating: 'averageRating',
  completionRate: 'completionRate',
  status: 'status',
  approvalDate: 'approvalDate',
  suspensionReason: 'suspensionReason',
  commissionRate: 'commissionRate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgentTransactionScalarFieldEnum = {
  id: 'id',
  agentId: 'agentId',
  type: 'type',
  amount: 'amount',
  commission: 'commission',
  referenceId: 'referenceId',
  referenceType: 'referenceType',
  status: 'status',
  completedAt: 'completedAt',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgentVerificationScalarFieldEnum = {
  id: 'id',
  agentId: 'agentId',
  userId: 'userId',
  type: 'type',
  status: 'status',
  notes: 'notes',
  verificationLocation: 'verificationLocation',
  latitude: 'latitude',
  longitude: 'longitude',
  scheduledFor: 'scheduledFor',
  completedAt: 'completedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemLogScalarFieldEnum = {
  id: 'id',
  level: 'level',
  module: 'module',
  message: 'message',
  data: 'data',
  userId: 'userId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.ConfigurationScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  description: 'description',
  isPublic: 'isPublic',
  isEditable: 'isEditable',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  RENTER: 'RENTER',
  OWNER: 'OWNER',
  AGENT: 'AGENT',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT',
  MODERATOR: 'MODERATOR'
};

exports.TrustLevel = exports.$Enums.TrustLevel = {
  NEW: 'NEW',
  BASIC: 'BASIC',
  VERIFIED: 'VERIFIED',
  TRUSTED: 'TRUSTED'
};

exports.VerificationStatus = exports.$Enums.VerificationStatus = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  COMPLETE: 'COMPLETE'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
  DELETED: 'DELETED'
};

exports.VerificationType = exports.$Enums.VerificationType = {
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
  ID_CARD: 'ID_CARD',
  PASSPORT: 'PASSPORT',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  ADDRESS: 'ADDRESS',
  PHYSICAL: 'PHYSICAL'
};

exports.ItemCondition = exports.$Enums.ItemCondition = {
  NEW: 'NEW',
  LIKE_NEW: 'LIKE_NEW',
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
  NEEDS_REPAIR: 'NEEDS_REPAIR'
};

exports.AvailabilityType = exports.$Enums.AvailabilityType = {
  INSTANT: 'INSTANT',
  ADVANCE_BOOKING: 'ADVANCE_BOOKING',
  CALENDAR: 'CALENDAR',
  REQUEST: 'REQUEST'
};

exports.ListingStatus = exports.$Enums.ListingStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
  BANNED: 'BANNED',
  DELETED: 'DELETED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  MOBILE_MONEY: 'MOBILE_MONEY',
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CARD: 'CARD'
};

exports.BookingStatus = exports.$Enums.BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED'
};

exports.DisputeStatus = exports.$Enums.DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  ESCALATED: 'ESCALATED'
};

exports.DisputeOutcome = exports.$Enums.DisputeOutcome = {
  IN_FAVOR_OF_RENTER: 'IN_FAVOR_OF_RENTER',
  IN_FAVOR_OF_OWNER: 'IN_FAVOR_OF_OWNER',
  PARTIAL_REFUND: 'PARTIAL_REFUND',
  FULL_REFUND: 'FULL_REFUND',
  NO_ACTION: 'NO_ACTION'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  BOOKING_REQUEST: 'BOOKING_REQUEST',
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  TRUST_LEVEL_UP: 'TRUST_LEVEL_UP',
  VERIFICATION_APPROVED: 'VERIFICATION_APPROVED',
  NEW_REVIEW: 'NEW_REVIEW',
  DISPUTE_OPENED: 'DISPUTE_OPENED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT'
};

exports.NotificationChannel = exports.$Enums.NotificationChannel = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
  IN_APP: 'IN_APP'
};

exports.Prisma.ModelName = {
  User: 'User',
  UserProfile: 'UserProfile',
  Verification: 'Verification',
  Guarantor: 'Guarantor',
  TrustLog: 'TrustLog',
  Category: 'Category',
  Listing: 'Listing',
  ListingImage: 'ListingImage',
  ListingVideo: 'ListingVideo',
  ListingDocument: 'ListingDocument',
  AvailabilitySlot: 'AvailabilitySlot',
  Booking: 'Booking',
  BookingGuarantor: 'BookingGuarantor',
  Payment: 'Payment',
  Wallet: 'Wallet',
  Transaction: 'Transaction',
  Review: 'Review',
  Dispute: 'Dispute',
  DisputeMessage: 'DisputeMessage',
  Message: 'Message',
  Notification: 'Notification',
  Agent: 'Agent',
  AgentTransaction: 'AgentTransaction',
  AgentVerification: 'AgentVerification',
  SystemLog: 'SystemLog',
  Configuration: 'Configuration'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
