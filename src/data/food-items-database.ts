import { useMemo } from "react";

import { foodItemsData } from "./food-items-data";
import { MacroType } from "./diet-plans-database";

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  unit: "grams" | "pieces";
  qta: number;
  calories: number;
  type: MacroType;
  macro?: {
    carbs: number;
    proteins: number;
    fats: number;
    fibers?: number;
  };
}

export class FoodItemsDB {
  private static instance: FoodItemsDB | null = null;

  public foodItems: FoodItem[] = foodItemsData;

  public foodItemsMap: { [id: string]: FoodItem };

  public foodItemsMacroMap: {
    [id: string]: FoodItem[];
  };

  public carbsItems: FoodItem[];
  public carbsItemsMap: {
    [id: string]: FoodItem;
  };
  public proteinItems: FoodItem[];
  public proteinItemsMap: {
    [id: string]: FoodItem;
  };
  public fatItems: FoodItem[];
  public fatItemsMap: {
    [id: string]: FoodItem;
  };

  private constructor() {
    this.foodItemsMap = this.foodItems.reduce((acc, foodItem) => {
      acc[foodItem.id] = foodItem;
      return acc;
    }, {} as { [id: string]: FoodItem });

    this.carbsItems = this.foodItems.filter(
      (foodItem) => foodItem.type === "carbs"
    );
    this.carbsItemsMap = this.carbsItems.reduce((acc, foodItem) => {
      acc[foodItem.id] = foodItem;
      return acc;
    }, {} as { [id: string]: FoodItem });

    this.proteinItems = this.foodItems.filter(
      (foodItem) => foodItem.type === "proteins"
    );
    this.proteinItemsMap = this.proteinItems.reduce((acc, foodItem) => {
      acc[foodItem.id] = foodItem;
      return acc;
    }, {} as { [id: string]: FoodItem });

    this.fatItems = this.foodItems.filter(
      (foodItem) => foodItem.type === "fats"
    );
    this.fatItemsMap = this.fatItems.reduce((acc, foodItem) => {
      acc[foodItem.id] = foodItem;
      return acc;
    }, {} as { [id: string]: FoodItem });

    this.foodItemsMacroMap = {
      carbs: this.carbsItems,
      proteins: this.proteinItems,
      fats: this.fatItems,
    };
  }

  public static getInstance(): FoodItemsDB {
    if (!FoodItemsDB.instance) {
      FoodItemsDB.instance = new FoodItemsDB();
    }
    return FoodItemsDB.instance;
  }
}

export const useFoodItems = () => {
  const foodItemsDB = useMemo(() => FoodItemsDB.getInstance(), []);

  return {
    foodItems: foodItemsDB.foodItems,
    foodItemsMap: foodItemsDB.foodItemsMap,
    foodItemsMacroMap: foodItemsDB.foodItemsMacroMap,
    carbsItems: foodItemsDB.carbsItems,
    carbsItemsMap: foodItemsDB.carbsItemsMap,
    proteinItems: foodItemsDB.proteinItems,
    proteinItemsMap: foodItemsDB.proteinItemsMap,
    fatItems: foodItemsDB.fatItems,
    fatItemsMap: foodItemsDB.fatItemsMap,
  };
};

export const getFoodItemCalories = (foodItemId: string, qta: number) => {
  const foodItem = FoodItemsDB.getInstance().foodItemsMap[foodItemId];
  if (!foodItem) return 0;
  return Math.floor((foodItem.calories / foodItem.qta) * qta);
};
