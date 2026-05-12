export type AnalyticsDashboardDto = {
  totalProducts: number;
  expiringProducts: number;
  expiredProducts: number;
  productsByCategory: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  inventoryStatusDistribution: {
    ok: number;
    expiring: number;
    expired: number;
  };
};
