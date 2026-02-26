export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface DateRangeParams {
  from?: string;
  to?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  code?: string;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface ControlAccount {
  id: number;
  name: string;
  partnerType: string;
  accountType: string;
  status: string;
  imageUrl: string | null;
  creationDate: string;
  address1: string | null;
  address2: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  mainPhone: string | null;
  billingPhone: string | null;
  contactEmail: string | null;
  billingEmail: string | null;
  businessNumber: string | null;
  taxId: string | null;
  fiscalNumber: string | null;
  vatNumber: string | null;
  website: string | null;
  ssoEnabled: boolean;
  storageQuotaType: string;
  governanceAccountId: number;
  governanceAccountName: string;
  channelAccountsCount: number;
  subAccountsCount: number;
  controlAccountEmail: string;
  primaryApiKey?: string;
  secondaryApiKey?: string;
  subAccountStorage: number;
  controlAccountStorage: number;
  totalStorage: number;
  defaultPurchasedStorageTB: number;
}

export interface ChannelAccount {
  id: number;
  name: string;
  controlAccountId: number;
  controlAccountName: string;
  governanceAccountId: number;
  governanceAccountName: string;
  purchasedStorage: number;
  subAccountDefaultPurchasedStorage: number | null;
  subAccountDefaultStorageQuotaType: string;
  storageQuotaType: string;
  subAccountStorage: number;
  billableActiveStorage: number;
  billableDeletedStorage: number;
  subAccountsCount: number;
  status: string;
  creationDate: string;
  contactEmail: string;
  address1: string | null;
  address2: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  ssoEnabled: boolean;
  deleted: boolean;
  imageUrl: string | null;
}

export interface SubAccount {
  id: number;
  name: string;
  partnerType: string;
  accountType: string;
  status: string;
  creationDate: string;
  imageUrl: string | null;
  address1: string | null;
  address2: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  mainPhone: string | null;
  billingPhone: string | null;
  contactEmail: string | null;
  billingEmail: string | null;
  businessNumber: string | null;
  taxId: string | null;
  fiscalNumber: string | null;
  vatNumber: string | null;
  website: string | null;
  ssoEnabled: boolean;
  storageQuotaType: string;
  accessKey?: string;
  secretKey?: string;
  channelAccountId: number | null;
  channelAccountName: string | null;
  channelAccountEmail: string | null;
  controlAccountId: number;
  controlAccountName: string;
  controlAccountEmail: string;
  governanceAccountId: number;
  governanceAccountName: string;
  wasabiAccountNumber: number;
  wasabiAccountName: string;
  sendPasswordResetToSubAccount: boolean;
  ftpEnabled: boolean;
  activeStorage: number;
  deletedStorage: number;
  purchasedStorageTB: number;
  mfaEnabled: boolean;
  trialQuotaTB: number | null;
  trialExpiration: string | null;
}

export interface Member {
  id: number;
  subAccountId: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  memberRole: string;
  status: string;
  mfa: boolean;
  imageUrl: string | null;
  creationDate: string;
  address1: string | null;
  address2: string | null;
  country: string | null;
  city: string | null;
  stateName: string | null;
  zip: string | null;
  phone: string | null;
  isSsoUser: boolean;
}

export interface Invoice {
  id: number;
  subInvoiceId: number;
  subAccountId: number;
  subAccountName: string;
  subAccountEmail: string;
  channelAccountId: number | null;
  channelAccountName: string | null;
  channelAccountEmail: string | null;
  controlAccountId: number;
  controlAccountName: string;
  controlAccountEmail: string;
  governanceAccountId: number;
  governanceAccountName: string;
  controlInvoiceId: number;
  periodStart: string;
  periodEnd: string;
  totalStorage: number;
  activeStorage: number;
  activeStorageUnitCost: number;
  activeStorageTotalCost: number;
  deletedStorage: number;
  deletedStorageUnitCost: number;
  deletedStorageTotalCost: number;
  apiCalls: number;
  apiCallsUnitCost: number;
  apiCallsTotalCost: number;
  ingress: number;
  ingressUnitCost: number;
  ingressTotalCost: number;
  egress: number;
  egressUnitCost: number;
  egressTotalCost: number;
  minimumActiveStorage: number;
  minimumActiveStorageUnitCost: number;
  minimumActiveStorageTotalCost: number;
  wasabiAccountNumber: number;
}

export interface Usage {
  id: number;
  startTime: string;
  endTime: string;
  activeStorage: number;
  deletedStorage: number;
  storageWrote: number;
  storageRead: number;
  activeObjects: number;
  deletedObjects: number;
  egress: number;
  ingress: number;
  apiCalls: number;
  controlAccountId: number;
  controlAccountName: string;
  controlAccountEmail: string;
  governanceAccountId: number;
  governanceAccountName: string;
  wasabiAccountNumber: number;
}

export interface SubAccountUsage {
  id: number;
  startTime: string;
  endTime: string;
  activeStorage: number;
  deletedStorage: number;
  storageWrote: number;
  storageRead: number;
  activeObjects: number;
  deletedObjects: number;
  egress: number;
  ingress: number;
  apiCalls: number;
  subAccountId: number;
  subAccountName: string;
  subAccountEmail: string;
  channelAccountId: number | null;
  channelAccountName: string | null;
  channelAccountEmail: string | null;
  controlAccountId: number;
  controlAccountName: string;
  controlAccountEmail: string;
  governanceAccountId: number;
  governanceAccountName: string;
  wasabiAccountNumber: number;
}

export interface BucketUtilization {
  id: number;
  name: string;
  region: string;
  bucketNumber: number;
  startTime: string;
  endTime: string;
  bucketDeleteTime: string | null;
  activeStorage: number;
  deletedStorage: number;
  storageWrote: number;
  storageRead: number;
  activeObjects: number;
  deletedObjects: number;
  egress: number;
  ingress: number;
  apiCalls: number;
}

export interface StandaloneAccount {
  id: number;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  country: string;
  phoneNumber: string;
  partnerName: string;
  wasabiAccountNumber: number;
  status: string;
  storageAmount: string;
  createDate: string;
}

export interface StorageAmount {
  name: string;
}

export interface Country {
  name: string;
}

// Write operation request bodies

export interface CreateSubAccountRequest {
  controlAccountId: number;
  name: string;
  wasabiAccountEmail: string;
  password: string;
  storageQuotaType: string;
  channelAccountId?: number;
  purchasedStorageTB?: number;
  sendPasswordResetToSubAccount?: boolean;
  ftpEnabled?: boolean;
}

export interface UpdateSubAccountRequest {
  name?: string;
  storageQuotaType?: string;
  purchasedStorageTB?: number;
  sendPasswordResetToSubAccount?: boolean;
  ftpEnabled?: boolean;
  status?: string;
}

export interface CreateMemberRequest {
  subAccountId: number;
  firstName: string;
  lastName: string;
  username: string;
  memberRole: string;
  email: string;
  password: string;
  address1?: string;
  address2?: string;
  country?: string;
  city?: string;
  stateName?: string;
  zip?: string;
  phone?: string;
}

export interface UpdateMemberRequest {
  firstName?: string;
  lastName?: string;
  memberRole?: string;
  email?: string;
  address1?: string;
  address2?: string;
  country?: string;
  city?: string;
  stateName?: string;
  zip?: string;
  phone?: string;
  status?: string;
}

export interface CreateChannelAccountRequest {
  controlAccountId: number;
  name: string;
  contactEmail: string;
  purchasedStorage: number;
  storageQuotaType: string;
  subAccountDefaultPurchasedStorage?: number;
  subAccountDefaultStorageQuotaType?: string;
  address1?: string;
  address2?: string;
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface UpdateChannelAccountRequest {
  name?: string;
  contactEmail?: string;
  purchasedStorage?: number;
  storageQuotaType?: string;
  subAccountDefaultPurchasedStorage?: number;
  subAccountDefaultStorageQuotaType?: string;
  address1?: string;
  address2?: string;
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
  status?: string;
}

export interface CreateChannelAccountUserRequest {
  channelAccountId: number;
  firstName: string;
  lastName: string;
  email: string;
  userRole: string;
}

export interface CreateStandaloneAccountRequest {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  country: string;
  phoneNumber: string;
  storageAmount: string;
}
