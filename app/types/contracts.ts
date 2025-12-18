export interface ContractsFormField {
  id: string;
  title: string;
  [key: string]: any;
}

export interface ContractsForm {
  contractsFormId: number;
  name: string;
  form: ContractsFormField[];
  fileId: string | null;
}

export interface ContractsFormListItem {
  contractsFormId: number;
  name: string;
  fileId?: string | null;
}


