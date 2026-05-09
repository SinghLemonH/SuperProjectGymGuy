import { AVAILABLE_MUSCLES, CreateMuscleInput } from "../models/exercises.model";

export async function listMuscles(): Promise<readonly string[]> {
  return AVAILABLE_MUSCLES;
}

export async function createMuscle(_payload: CreateMuscleInput): Promise<never> {
  throw new Error(
    "Cannot create a new muscle entry at runtime because the database schema stores muscle values as a static enum."
  );
}
