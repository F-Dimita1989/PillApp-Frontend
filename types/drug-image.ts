export type DrugImageRequest = {
  aic: string;
  name: string;
  dosage: string | null;
  pharmaceuticalForm: string | null;
  packageQuantity: string | null;
  marketingAuthorizationHolder: string | null;
};

export type DrugImageResponse = {
  success: boolean;
  imageUrl: string | null;
  sourcePageUrl: string | null;
  confidenceScore: number;
  matchedFields: string[];
  rejectedReasons: string[];
  message: string;
};

export type FetchDrugPackageImageOptions = {
  signal?: AbortSignal;
  token?: string;
};
