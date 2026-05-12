import type { Request, Response } from "express";

import AnalyticsService from "../services/analytics.service";

export class AnalyticsController {
  public static async getDashboard(_req: Request, res: Response): Promise<Response> {
    const dashboard = await AnalyticsService.getDashboard();
    return res.status(200).json(dashboard);
  }
}

export default AnalyticsController;
