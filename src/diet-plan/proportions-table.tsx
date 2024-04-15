import { Button, Table } from "@mui/joy";
import { useMemo } from "react";
import {
  MacroGroupCoordinates,
  getMacroGroupBaselineCalories,
  getMacroGroupCalories,
  useDietPlanStore,
} from "../data/diet-plans-database";
import { FoodItem, useFoodItems } from "../data/food-items-database";
import { Add } from "@mui/icons-material";

export const ProportionsTable: React.FC<MacroGroupCoordinates> = ({
  weekId,
  dayId,
  mealType,
  macroType,
}) => {
  const { foodItemsMacroMap } = useFoodItems();

  const baselineCalories = useDietPlanStore((state) =>
    getMacroGroupBaselineCalories(state, { weekId, dayId, mealType, macroType })
  );

  const macroGroupCalories = useDietPlanStore((state) =>
    getMacroGroupCalories(state, { weekId, dayId, mealType, macroType })
  );

  return (
    <Table aria-label="basic table">
      <thead>
        <tr>
          <th style={{ width: "40%" }}>FOOD</th>
          <th>QTA</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {foodItemsMacroMap[macroType].map((item) => (
          <ProportionsTableRow
            key={item.id}
            foodItem={item}
            macroGroupCalories={macroGroupCalories}
            baselineCalories={baselineCalories}
            weekId={weekId}
            dayId={dayId}
            mealType={mealType}
            macroType={macroType}
          />
        ))}
      </tbody>
    </Table>
  );
};

const ProportionsTableRow: React.FC<
  {
    foodItem: FoodItem;
    macroGroupCalories: number;
    baselineCalories: number;
  } & MacroGroupCoordinates
> = ({
  foodItem,
  macroGroupCalories,
  baselineCalories,
  weekId,
  dayId,
  mealType,
  macroType,
}) => {
  const { addFoodItem } = useDietPlanStore();

  const foodItemValues = useMemo(() => {
    const minusMealPlanCalories = baselineCalories - macroGroupCalories;
    const qta = Math.floor(
      (minusMealPlanCalories / foodItem.calories) * foodItem.qta
    );
    return {
      qta,
      calories: Math.floor((qta / foodItem.qta) * foodItem.calories),
    };
  }, [foodItem, baselineCalories, macroGroupCalories]);

  return (
    <tr>
      <td>
        {foodItem.brand
          ? `${foodItem.name} (${foodItem.brand})`
          : foodItem.name}
      </td>
      <td>{foodItemValues.qta}</td>
      <td>
        <Button
          size="sm"
          onClick={() =>
            addFoodItem(
              weekId,
              dayId,
              mealType,
              macroType,
              foodItem.id,
              foodItemValues.qta
            )
          }
        >
          <Add />
          Add
        </Button>
      </td>
    </tr>
  );
};
