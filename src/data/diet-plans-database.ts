import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

import { FoodItem, FoodItemsDB } from "./food-items-database";

export interface DietPlanType {
  id: string;
  name: string;
  createdAt: string;
  weeks: { [key: string]: DietPlanWeek };
}

export type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const days: Day[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface DietPlanWeek {
  id: string;
  days: { [key: string]: DietPlanDay };
}

interface DietPlanDay {
  id: string;
  day: Day;
  meals: { [key: string]: DietPlanMeal };
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export type MacroType = "carbs" | "proteins" | "fats";

export const macroTypes: MacroType[] = ["carbs", "proteins", "fats"];

export interface MacroGroup {
  baseline?: {
    foodItem: FoodItem;
    qta: number;
  };
  items: Array<{ itemId: string; name: string; qta: number }>;
}

interface DietPlanMeal {
  id: string;
  name: MealType;
  macro: {
    carbs: MacroGroup;
    proteins: MacroGroup;
    fats: MacroGroup;
  };
}

export interface MacroGroupCoordinates {
  weekId: string;
  dayId: string;
  mealType: MealType;
  macroType: MacroType;
}

export type MealCoordiantes = Omit<MacroGroupCoordinates, "macroType">;

const DIET_PLANS_LOCAL_STORAGE_KEY = "DIET_PLANS_LOCAL_STORAGE_KEY";

const generateEmptyDietPlan = (
  dietPlanId: string,
  weekId: string,
  name: string
): DietPlanType => {
  return {
    id: dietPlanId,
    name: name,
    createdAt: new Date().toISOString(),
    weeks: {
      [weekId]: {
        id: weekId,
        days: days.reduce((acc, day) => {
          acc[day] = {
            id: day,
            day,
            meals: mealTypes.reduce((acc, mealType) => {
              acc[mealType] = {
                id: mealType,
                name: mealType,
                macro: {
                  carbs: {
                    items: [],
                  },
                  proteins: {
                    items: [],
                  },
                  fats: {
                    items: [],
                  },
                },
              };
              return acc;
            }, {} as { [key: string]: DietPlanMeal }),
          };
          return acc;
        }, {} as { [key: string]: DietPlanDay }),
      },
    },
  };
};

export class DietPlansDB {
  private static instance: DietPlansDB | null = null;

  public dietPlans: { [key: string]: DietPlanType };
  public dietPlansList: Array<{ id: string; name: string; createdAt: string }>;

  private constructor() {
    const dietPlansString = localStorage.getItem(
      DIET_PLANS_LOCAL_STORAGE_KEY
    ) as string;
    this.dietPlans = dietPlansString ? JSON.parse(dietPlansString) : {};
    this.dietPlansList = Object.keys(this.dietPlans).map((dietPlanId) => {
      return {
        id: dietPlanId,
        name: this.dietPlans[dietPlanId].name,
        createdAt: this.dietPlans[dietPlanId].createdAt,
      };
    });
  }

  private updateDietPlansList() {
    this.dietPlansList = Object.keys(this.dietPlans).map((dietPlanId) => {
      return {
        id: dietPlanId,
        name: this.dietPlans[dietPlanId].name,
        createdAt: this.dietPlans[dietPlanId].createdAt,
      };
    });
  }

  public static getInstance(): DietPlansDB {
    if (!DietPlansDB.instance) {
      DietPlansDB.instance = new DietPlansDB();
    }
    return DietPlansDB.instance;
  }

  private saveDietPlans() {
    localStorage.setItem(
      DIET_PLANS_LOCAL_STORAGE_KEY,
      JSON.stringify(this.dietPlans)
    );
    this.updateDietPlansList();
  }

  public getDietPlan(dietPlanId: string): DietPlanType {
    return this.dietPlans[dietPlanId];
  }

  public createDietPlan(name: string): DietPlanType {
    const dietPlanId = uuidv4();
    const weekId = uuidv4();
    const dietPlan = generateEmptyDietPlan(dietPlanId, weekId, name);
    this.dietPlans[dietPlanId] = dietPlan;
    this.saveDietPlans();
    return dietPlan;
  }

  public updateDietPlan(dietPlanId: string, name: string): DietPlanType {
    const dietPlan = this.dietPlans[dietPlanId];
    dietPlan.name = name;
    this.saveDietPlans();
    return dietPlan;
  }

  public saveDietPlan(dietPlanId: string, dietPlan: DietPlanType): void {
    this.dietPlans[dietPlanId] = dietPlan;
    this.saveDietPlans();
  }
}

interface DietPlansState {
  dietPlans: Array<{ id: string; name: string; createdAt: string }>;
  createDietPlan: (name: string) => string;
}

export const useDietPlansStore = create<DietPlansState>((set) => ({
  dietPlans: DietPlansDB.getInstance().dietPlansList,
  createDietPlan: (name: string) => {
    const dietPlan = DietPlansDB.getInstance().createDietPlan(name);
    set({ dietPlans: DietPlansDB.getInstance().dietPlansList });
    return dietPlan.id;
  },
}));

interface DietPlanState {
  dietPlan: DietPlanType;
  copiedMeal?: Omit<DietPlanMeal, "id" | "mealType" | "name">;
  loadDietPlan: (dietPlanId: string) => void;
  saveDietPlan: VoidFunction;
  copyMeal: (payload: MealCoordiantes) => void;
  pasteMeal: (payload: MealCoordiantes) => void;
  addFoodItem: (
    weekId: string,
    dayId: string,
    mealId: string,
    macro: MacroType,
    itemId: string,
    qta?: number
  ) => void;
  updateFoodItem: (
    weekId: string,
    dayId: string,
    mealId: string,
    macro: MacroType,
    itemId: string,
    qta: number
  ) => void;
  removeFoodItem: (
    weekId: string,
    dayId: string,
    mealId: string,
    macro: MacroType,
    itemId: string
  ) => void;
  setMacroBaseline: (
    weekId: string,
    dayId: string,
    mealId: string,
    macro: MacroType,
    itemId: string,
    qta?: number
  ) => void;
}

export const useDietPlanStore = create<DietPlanState>((set) => ({
  dietPlan: generateEmptyDietPlan(uuidv4(), uuidv4(), "Empty meal plan"),
  loadDietPlan: (dietPlanId: string) => {
    const dietPlan = DietPlansDB.getInstance().getDietPlan(dietPlanId);
    set({ dietPlan });
  },
  saveDietPlan: () => {
    set((state) => {
      const dietPlan = state.dietPlan;
      if (!dietPlan) return state;
      DietPlansDB.getInstance().saveDietPlan(dietPlan.id, dietPlan);
      return state;
    });
  },
  copyMeal: (payload: MealCoordiantes) => {
    set((state) => {
      const meal =
        state.dietPlan.weeks[payload.weekId].days[payload.dayId].meals[
          payload.mealType
        ];
      return {
        ...state,
        copiedMeal: {
          macro: JSON.parse(JSON.stringify(meal.macro)),
        },
      };
    });
  },
  pasteMeal: (payload: MealCoordiantes) => {
    set((state) => {
      const dietPlan = state.dietPlan;
      if (!dietPlan || !state.copiedMeal) return state;
      const day = dietPlan.weeks[payload.weekId].days[payload.dayId];
      const meal = day.meals[payload.mealType];
      meal.macro = state.copiedMeal?.macro;
      return {
        ...state,
        copiedMeal: {
          macro: JSON.parse(JSON.stringify(meal.macro)),
        },
      };
    });
  },
  addFoodItem: (
    weekId: string,
    dayId: string,
    mealId: string,
    macro: MacroType,
    itemId: string,
    qta?: number
  ) => {
    set((state) => {
      const dietPlan = state.dietPlan;
      if (!dietPlan) return state;
      const day = dietPlan.weeks[weekId].days[dayId];
      const meal = day.meals[mealId];
      const foodItem = FoodItemsDB.getInstance().foodItemsMap[itemId];
      meal.macro[macro].items.push({
        itemId,
        name: foodItem.name,
        qta: qta ?? 0,
      });
      return { ...state, dietPlan };
    });
  },
  updateFoodItem: (
    weekId: string,
    dayId: string,
    mealId: string,
    macro: MacroType,
    itemId: string,
    qta: number
  ) => {
    set((state) => {
      const dietPlan = state.dietPlan;
      if (!dietPlan) return state;
      const day = dietPlan.weeks[weekId].days[dayId];
      const meal = day.meals[mealId];
      meal.macro[macro].items = meal.macro[macro].items.map((item) => {
        if (item.itemId === itemId) {
          return {
            ...item,
            qta: qta ?? 0,
          };
        }
        return item;
      });
      return { ...state, dietPlan };
    });
  },
  removeFoodItem: (
    weekId: string,
    dayId: string,
    mealId: string,
    macro: MacroType,
    itemId: string
  ) => {
    set((state) => {
      const dietPlan = state.dietPlan;
      if (!dietPlan) return state;
      const day = dietPlan.weeks[weekId].days[dayId];
      const meal = day.meals[mealId];
      meal.macro[macro].items = meal.macro[macro].items.filter(
        (item) => item.itemId !== itemId
      );
      return { ...state, dietPlan };
    });
  },
  setMacroBaseline: (
    weekId: string,
    dayId: string,
    mealId: string,
    macro: MacroType,
    itemId: string,
    qta?: number
  ) => {
    set((state) => {
      const dietPlan = state.dietPlan;
      if (!dietPlan) return state;
      const day = dietPlan.weeks[weekId].days[dayId];
      const meal = day.meals[mealId];
      meal.macro[macro].baseline = {
        foodItem: FoodItemsDB.getInstance().foodItemsMap[itemId],
        qta: qta ?? 0,
      };

      return { ...state, dietPlan };
    });
  },
}));

export const getDietPlanWeekIds = (state: DietPlanState) =>
  Object.keys(state.dietPlan.weeks);

export const getDietPlanWeekDaysIds = (
  state: DietPlanState,
  payload: { weekId: string }
) => Object.keys(state.dietPlan.weeks[payload.weekId].days);

export const getDietPlanWeek = (
  state: DietPlanState,
  payload: { weekId: string }
) => state.dietPlan.weeks[payload.weekId];

export const getMealTypeDaysIds = (
  state: DietPlanState,
  payload: { weekId: string; mealType: string }
) => {
  const week = state.dietPlan.weeks[payload.weekId];
  return Object.keys(week.days).reduce((acc, dayId) => {
    const day = week.days[dayId];
    if (day.meals[payload.mealType]) {
      acc.push(day.id);
    }
    return acc;
  }, [] as string[]);
};

export const getDietPlanMeal = (
  state: DietPlanState,
  payload: { weekId: string; dayId: string; mealType: string }
) =>
  state.dietPlan.weeks[payload.weekId].days[payload.dayId].meals[
    payload.mealType
  ];

export const getMealMacroGroup = (
  state: DietPlanState,
  payload: MacroGroupCoordinates
) =>
  state.dietPlan.weeks[payload.weekId].days[payload.dayId].meals[
    payload.mealType
  ].macro[payload.macroType];

export const getMacroGroupItems = (
  state: DietPlanState,
  payload: MacroGroupCoordinates
) =>
  state.dietPlan.weeks[payload.weekId].days[payload.dayId].meals[
    payload.mealType
  ].macro[payload.macroType].items;

export const getMealMacroGroupBaseline = (
  state: DietPlanState,
  payload: MacroGroupCoordinates
) =>
  state.dietPlan.weeks[payload.weekId].days[payload.dayId].meals[
    payload.mealType
  ].macro[payload.macroType].baseline;

export const getMacroGroupCalories = (
  state: DietPlanState,
  payload: MacroGroupCoordinates
) => {
  const { weekId, dayId, mealType, macroType } = payload;

  // if (dayId == "saturday" && mealType == "breakfast") {
  //   console.log(
  //     "[getMacroGroupCalories] macroType",
  //     macroType,
  //     "mealType",
  //     mealType
  //   );
  // }

  const macroGroupItems =
    state.dietPlan.weeks[weekId].days[dayId].meals[mealType].macro[macroType]
      .items;

  if (dayId == "saturday" && mealType == "breakfast") {
    console.log("[getMacroGroupCalories] macroGroupItems", macroGroupItems);
  }

  const calories = calculateCalories(
    macroGroupItems,
    macroType,
    dayId == "saturday" && mealType == "breakfast"
  );

  return calories;
};

export const getMacroGroupBaselineCalories = (
  state: DietPlanState,
  payload: MacroGroupCoordinates
) => {
  const { weekId, dayId, mealType, macroType } = payload;
  const baseline =
    state.dietPlan.weeks[weekId].days[dayId].meals[mealType].macro[macroType]
      .baseline;
  if (!baseline || baseline.qta === 0) {
    return 0;
  }
  return (baseline.foodItem.calories / baseline.foodItem.qta) * baseline.qta;
};

export const getMealCalories = (
  state: DietPlanState,
  payload: Omit<MacroGroupCoordinates, "macroType">
) => {
  const { weekId, dayId, mealType } = payload;

  const carbsItems =
    state.dietPlan.weeks[weekId].days[dayId].meals[mealType].macro["carbs"]
      .items;
  const proteinsItems =
    state.dietPlan.weeks[weekId].days[dayId].meals[mealType].macro["proteins"]
      .items;
  const fatsItems =
    state.dietPlan.weeks[weekId].days[dayId].meals[mealType].macro["fats"]
      .items;

  const carbsCalories = calculateCalories(carbsItems, "carbs");
  const proteinsCalories = calculateCalories(proteinsItems, "proteins");
  const fatsCalories = calculateCalories(fatsItems, "fats");

  return carbsCalories + proteinsCalories + fatsCalories;
};

export const getDayCalories = (
  state: DietPlanState,
  payload: { weekId: string; dayId: string }
) => {
  const { weekId, dayId } = payload;

  return mealTypes.reduce((acc, mealType) => {
    acc += getMealCalories(state, { weekId, dayId, mealType });
    return acc;
  }, 0);
};

const calculateCalories = (
  macroItems: Array<{ itemId: string; name: string; qta: number }>,
  macroType: MacroType,
  debug: boolean = false
) => {
  const foodItems = FoodItemsDB.getInstance().foodItemsMacroMap[macroType];

  const totalCalories = macroItems.reduce((acc, item) => {
    const foodItem = foodItems.find((foodItem) => foodItem.id === item.itemId);
    if (!foodItem) return acc;
    if (debug) {
      console.log("[totalCalories] acc", acc);
      console.log("[totalCalories] item", item);
      console.log("[totalCalories] foodItem", foodItem);
    }
    return acc + (foodItem.calories / foodItem.qta) * item.qta;
  }, 0);

  if (debug) {
    console.log("[calculateCalories] totalCalories", totalCalories);
  }

  return totalCalories;
};

export const getMealMacroGroupMacros = (
  state: DietPlanState,
  payload: MacroGroupCoordinates
) => {
  const { macroType } = payload;
  const totalMacro: { [key: string]: number } = {
    carbs: 0,
    proteins: 0,
    fats: 0,
  };

  const mealMacroGroup = getMealMacroGroup(state, payload);

  if (!mealMacroGroup || mealMacroGroup.items.length === 0) totalMacro;

  const foodItems = FoodItemsDB.getInstance().foodItemsMacroMap[macroType];
  for (const foodItem of mealMacroGroup.items) {
    const foodItemData = foodItems.find((item) => item.id === foodItem.itemId);
    if (!foodItemData || !foodItemData.macro) continue;
    for (const innerMacroType of macroTypes) {
      totalMacro[innerMacroType] +=
        (foodItemData.macro[innerMacroType] / foodItemData.qta) * foodItem.qta;
    }
  }

  return totalMacro;
};

export const getDayMealMacro = (
  state: DietPlanState,
  payload: Omit<MacroGroupCoordinates, "macroType">
) => {
  const totalMacro: { [key: string]: number } = {
    carbs: 0,
    proteins: 0,
    fats: 0,
  };

  const meal = getDietPlanMeal(state, payload);
  if (!meal || !meal.macro) totalMacro;

  for (const macroType of macroTypes) {
    const macroGroupMacro = getMealMacroGroupMacros(state, {
      ...payload,
      macroType,
    });
    for (const innerMacroType of macroTypes) {
      totalMacro[innerMacroType] += macroGroupMacro[innerMacroType];
    }
  }

  return totalMacro;
};

export const getDayTotalMacro = (
  state: DietPlanState,
  payload: { weekId: string; dayId: string }
) => {
  const { weekId, dayId } = payload;

  const totalMacro: { [key: string]: number } = {
    carbs: 0,
    proteins: 0,
    fats: 0,
  };

  for (const mealType of mealTypes) {
    const totalMealMacro = getDayMealMacro(state, { weekId, dayId, mealType });
    for (const macroType of macroTypes) {
      totalMacro[macroType] += totalMealMacro[macroType];
    }
  }

  return totalMacro;
};
