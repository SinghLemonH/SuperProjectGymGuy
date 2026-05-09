import { Request, Response } from "express";
import {getTotalCaloriesBurned,getTotalWorkoutSessions,getPlanAchievement,} from "../service/may_report.service";

// error handler กลาง
const handleError = (error: any, res: Response) => {
  if (error.status) {
    return res.status(error.status).json({
      error_code: error.error_code,
      message: error.message,
    });
  }
  return res.status(500).json({
    error_code: "SERVER_ERROR",
    message: "Internal server error",
  });
};

// GET /reports/total-calories-burned
// ดึงยอดcalรวมของแต่ละ user from ทุก session ที่เคย log ไว้

export const getTotalCaloriesBurnedReport = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getTotalCaloriesBurned();
    return res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
};

// GET /reports/total-workout-sessions
// นับจำนวน all session ของแต่ละ user พร้อม first/last session
export const getTotalWorkoutSessionsReport = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getTotalWorkoutSessions();
    return res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
};

// GET /reports/plan-achievement
// compare calจริง vs เป้า แล้วคำนวณเป็น % per user per plan
export const getPlanAchievementReport = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getPlanAchievement();
    return res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
};