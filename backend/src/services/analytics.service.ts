import type { AnalyticsDashboardDto } from "../types/analytics.types";
import ProductRepository from "../repositories/product.repository";

export class AnalyticsService {
  public static async getDashboard(): Promise<AnalyticsDashboardDto> {
    const referenceDate = new Date();

    const [totalProducts, expiredProducts, expiringProducts, productsByCategory] = await Promise.all([
      ProductRepository.countAll(),
      ProductRepository.countExpired(referenceDate),
      ProductRepository.countExpiring(referenceDate, 3),
      ProductRepository.countByCategory(),
    ]);

    const okProducts = Math.max(totalProducts - expiredProducts - expiringProducts, 0);

    return {
      totalProducts,
      expiringProducts,
      expiredProducts,
      productsByCategory,
      inventoryStatusDistribution: {
        ok: okProducts,
        expiring: expiringProducts,
        expired: expiredProducts,
      },
    };
  }
}

export default AnalyticsService;
