import { RemoveCircle } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { useMemo } from "react";
import {
  MacroGroupCoordinates,
  MacroType,
  MealType,
  getMacroGroupItems,
  getMealMacroGroupBaseline,
  useDietPlanStore,
} from "../data/diet-plans-database";
import { getFoodItemCalories, useFoodItems } from "../data/food-items-database";
import { ProportionsTable } from "./proportions-table";

export interface EditMealMacroProps {
  weekId: string;
  dayId: string;
  mealType: MealType;
  macroType: MacroType;
  onClose: VoidFunction;
}

export const EditMealMacro: React.FC<EditMealMacroProps> = ({
  weekId,
  dayId,
  mealType,
  macroType,
}) => {
  return (
    <Stack spacing={4}>
      <Typography level="title-lg">Edit macro group</Typography>
      <Typography level="title-md" sx={{ textTransform: "capitalize" }}>
        {dayId} - {mealType} - {macroType}
      </Typography>
      <Stack spacing={4} mt={2} direction={{ md: "row" }}>
        <Box flex={1}>
          <Stack spacing={4}>
            <BaselineEditor
              weekId={weekId}
              dayId={dayId}
              mealType={mealType}
              macroType={macroType}
            />
            <MacroGroupEditor
              weekId={weekId}
              dayId={dayId}
              mealType={mealType}
              macroType={macroType}
            />
          </Stack>
        </Box>
        <Box flex={2} sx={{ overflowY: "scroll", maxHeight: "650px" }}>
          <ProportionsTable
            weekId={weekId}
            dayId={dayId}
            mealType={mealType}
            macroType={macroType}
          />
        </Box>
      </Stack>
    </Stack>
  );
};

const BaselineEditor: React.FC<MacroGroupCoordinates> = ({
  weekId,
  dayId,
  mealType,
  macroType,
}) => {
  const baseline = useDietPlanStore((state) =>
    getMealMacroGroupBaseline(state, {
      weekId,
      dayId,
      mealType,
      macroType,
    })
  );
  const { setMacroBaseline } = useDietPlanStore();

  const { foodItemsMacroMap } = useFoodItems();

  const foodItemOptions = useMemo(
    () =>
      foodItemsMacroMap[macroType].map((item) => ({
        id: item.id,
        label: item.brand ? `${item.name} (${item.brand})` : item.name,
      })),
    [foodItemsMacroMap, macroType]
  );

  const selectedFoodItem = useMemo(
    () => foodItemOptions.find((item) => item.id === baseline?.foodItem.id),
    [baseline, foodItemOptions]
  );

  return (
    <Stack spacing={4} mt={2} direction={{ md: "row" }}>
      <FormControl>
        <FormLabel>Baseline Food Item</FormLabel>
        <Autocomplete
          placeholder="Select baseline food item"
          size="sm"
          options={foodItemOptions}
          value={selectedFoodItem}
          onChange={(_, newValue) => {
            if (newValue) {
              setMacroBaseline(
                weekId,
                dayId,
                mealType,
                macroType,
                newValue?.id
              );
            }
          }}
          disableClearable
        />
      </FormControl>
      <FormControl>
        <FormLabel>Quantity</FormLabel>
        <Input
          type="number"
          size="sm"
          disabled={!baseline?.foodItem}
          value={baseline?.qta ?? 0}
          slotProps={{
            input: {
              min: 0,
              max: baseline?.foodItem.qta === 1 ? 20 : 1000,
              step: baseline?.foodItem.qta === 1 ? 1 : 10,
            },
          }}
          onChange={(e) => {
            if (baseline?.foodItem) {
              setMacroBaseline(
                weekId,
                dayId,
                mealType,
                macroType,
                baseline?.foodItem.id,
                Number(e.target.value)
              );
            }
          }}
        />
      </FormControl>
    </Stack>
  );
};

const MacroGroupEditor: React.FC<MacroGroupCoordinates> = ({
  weekId,
  dayId,
  mealType,
  macroType,
}) => {
  const macroGroupItems = useDietPlanStore((state) =>
    getMacroGroupItems(state, { weekId, dayId, mealType, macroType })
  );

  return (
    <Box>
      {macroGroupItems.length === 0 && (
        <Typography level="body-md" color="neutral">
          To start, add a food item from the table
        </Typography>
      )}
      {macroGroupItems.length > 0 && (
        <Stack spacing={2}>
          {macroGroupItems.map((item) => (
            <MacroGroupFoodItem
              key={item.itemId}
              item={item}
              weekId={weekId}
              dayId={dayId}
              mealType={mealType}
              macroType={macroType}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

const MacroGroupFoodItem: React.FC<
  {
    item: { itemId: string; name: string; qta: number };
  } & MacroGroupCoordinates
> = ({ item, weekId, dayId, mealType, macroType }) => {
  const { removeFoodItem, updateFoodItem } = useDietPlanStore();

  const { foodItemsMap } = useFoodItems();

  const foodItem = foodItemsMap[item.itemId];

  return (
    <Stack spacing={1} direction="row" alignItems="center">
      <IconButton
        size="sm"
        onClick={() =>
          removeFoodItem(weekId, dayId, mealType, macroType, item.itemId)
        }
      >
        <RemoveCircle />
      </IconButton>
      <Typography level="body-md">{item.name}</Typography>
      <Input
        type="number"
        size="sm"
        value={item.qta}
        slotProps={{
          input: {
            min: 0,
            max: foodItem.qta === 1 ? 20 : 1000,
            step: foodItem.qta === 1 ? 1 : 10,
          },
        }}
        onChange={(e) => {
          updateFoodItem(
            weekId,
            dayId,
            mealType,
            macroType,
            item.itemId,
            Number(e.target.value)
          );
        }}
      />
      <Typography level="body-md">
        {getFoodItemCalories(item.itemId, item.qta)} kcal
      </Typography>
    </Stack>
  );
};

export const EditMealModal: React.FC<
  { show: boolean; onClose: VoidFunction } & MacroGroupCoordinates
> = (props) => {
  const { show, onClose, ...coordinates } = props;

  return (
    <Modal open={show} onClose={onClose}>
      <ModalDialog layout="center" size="lg">
        <ModalClose />
        <Box>
          <EditMealMacro onClose={onClose} {...coordinates} />
        </Box>
      </ModalDialog>
    </Modal>
  );
};
