export interface ICP {
  icp_id: string;
  icp_name: string;
  icp_desc: string | null;
  created_at: string;
}

export interface ICPsTableProps {
  icps: ICP[];
  isLoading: boolean;
  isError: boolean;
  fetchICPs: () => void;
  openDeleteDialog: (id: string) => void;
}
