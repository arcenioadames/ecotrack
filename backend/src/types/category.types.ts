export type CategoryDto = {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
};
