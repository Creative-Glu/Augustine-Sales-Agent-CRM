export const mapToSelectOptions = (data: any[] = [], labelKey: string, valueKey: string) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    label: item[labelKey],
    value: item[valueKey],
  }));
};
